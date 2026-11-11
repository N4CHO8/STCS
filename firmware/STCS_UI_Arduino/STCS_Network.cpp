#include "STCS_Network.h"

#include <Arduino.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_system.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/semphr.h>
#include <freertos/task.h>
#include <time.h>

#include "BAT_Driver.h"
#include "STCS_NetworkSecrets.h"
#include "STCS_TrustRoots.h"

namespace {

constexpr uint32_t CONFIG_POLL_MS = 15000;
constexpr uint32_t WIFI_RETRY_MS = 10000;
constexpr char FIRMWARE_VERSION[] = "v0.5.0-private";
constexpr uint8_t EVENT_CAPACITY = 24;

struct QueuedEvent {
  char event_type[28];
  char pictogram_id[37];
  char pictogram_label[32];
  char category[20];
  char message[96];
  uint32_t sequence;
  uint32_t boot;
  uint32_t queued_ms;
  int64_t occurred_at;
  uint64_t order;
};

Preferences preferences;
SemaphoreHandle_t event_mutex = nullptr;
QueuedEvent events[EVENT_CAPACITY] = {};
uint64_t next_order = 1;
SemaphoreHandle_t config_mutex = nullptr;
StcsBoardConfig pending_config = {};
bool config_pending = false;
char wifi_ssid[121] = "";
char wifi_password[65] = "";
char serial_line[256] = "";
size_t serial_line_length = 0;
uint32_t event_sequence = 0;
uint32_t boot_id = 0;
uint32_t last_config_hash = 0;

void copy_text(char* destination, size_t size, const char* source) {
  if (size == 0) {
    return;
  }

  strlcpy(destination, source == nullptr ? "" : source, size);
}

uint32_t hash_text(const String& text) {
  uint32_t hash = 5381;
  for (size_t index = 0; index < text.length(); index++) {
    hash = ((hash << 5) + hash) ^ static_cast<uint8_t>(text[index]);
  }
  return hash;
}

int battery_percentage() {
  const float percentage = (BAT_analogVolts - 3.30f) * (100.0f / 0.90f);
  return constrain(static_cast<int>(percentage), 0, 100);
}

void load_wifi_credentials() {
  preferences.begin("stcs-wifi", true);
  const String stored_ssid = preferences.getString("ssid", "");
  const String stored_password = preferences.getString("password", "");
  preferences.end();

  copy_text(wifi_ssid, sizeof(wifi_ssid), stored_ssid.c_str());
  copy_text(wifi_password, sizeof(wifi_password), stored_password.c_str());
}

void connect_wifi() {
  if (wifi_ssid[0] == '\0' || WiFi.status() == WL_CONNECTED) {
    return;
  }

  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(wifi_ssid, wifi_password);
  printf("STCS_WIFI|state=connecting|ssid=%s\r\n", wifi_ssid);
}

// Durable slots are written before reporting acceptance; retries preserve the
// original event ID.
String slot_key(uint8_t slot) { return "e" + String(slot); }
void restore_events() {
  Preferences store;
  store.begin("stcs-events", true);
  for (uint8_t i = 0; i < EVENT_CAPACITY; i++) {
    String key = slot_key(i);
    if (store.getBytesLength(key.c_str()) == sizeof(QueuedEvent)) {
      store.getBytes(key.c_str(), &events[i], sizeof(QueuedEvent));
      if (events[i].order >= next_order) next_order = events[i].order + 1;
    }
  }
  store.end();
}
bool finish_event(uint8_t slot, bool rejected, int status) {
  if (xSemaphoreTake(event_mutex, pdMS_TO_TICKS(100)) != pdTRUE) return false;
  Preferences store;
  if (rejected) {
    // Keep rejected payloads for diagnosis. Never discard them when this
    // bounded store fills.
    store.begin("stcs-rejected", false);
    bool saved = false;
    for (uint8_t i = 0; i < 8; i++) {
      String key = slot_key(i);
      if (!store.isKey(key.c_str())) {
        saved = store.putBytes(key.c_str(), &events[slot],
                               sizeof(QueuedEvent)) == sizeof(QueuedEvent);
        break;
      }
    }
    store.end();
    if (!saved) {
      xSemaphoreGive(event_mutex);
      printf("STCS_QUEUE|state=rejected_store_full|http=%d\r\n", status);
      return false;
    }
    printf("STCS_QUEUE|state=rejected_saved|http=%d\r\n", status);
  }
  store.begin("stcs-events", false);
  bool removed = store.remove(slot_key(slot).c_str());
  store.end();
  if (removed) events[slot] = {};
  xSemaphoreGive(event_mutex);
  return removed;
}
bool begin_https(HTTPClient& http, WiFiClientSecure& client,
                 const String& url) {
  if (time(nullptr) < 1700000000) {
    configTime(0, 0, "pool.ntp.org", "time.google.com");
    return false;
  }
  client.setCACert(STCS_TRUST_ROOTS);
  http.setConnectTimeout(8000);
  http.setTimeout(10000);
  if (!http.begin(client, url)) return false;
  http.addHeader("x-stcs-device-key", STCS_DEVICE_API_KEY);
  return true;
}

bool download_board_config() {
  WiFiClientSecure client;
  HTTPClient http;
  const String url = String(STCS_API_BASE_URL) + "/api/stcs/devices/" +
                     STCS_DEVICE_CODE + "/config";

  if (!begin_https(http, client, url)) {
    return false;
  }

  const int status = http.GET();
  if (status != HTTP_CODE_OK) {
    printf("STCS_SYNC|state=error|http=%d\r\n", status);
    http.end();
    return false;
  }

  const String body = http.getString();
  http.end();

  JsonDocument document;
  const DeserializationError error = deserializeJson(document, body);
  if (error) {
    printf("STCS_SYNC|state=json_error|detail=%s\r\n", error.c_str());
    return false;
  }

  String catalog_json;
  serializeJson(document["data"]["pictograms"], catalog_json);
  const uint32_t catalog_hash = hash_text(catalog_json);
  if (catalog_hash == last_config_hash) {
    return true;
  }

  StcsBoardConfig received = {};
  if (!document["data"]["pictograms"].is<JsonArray>()) return false;
  JsonArray items = document["data"]["pictograms"].as<JsonArray>();
  for (JsonObject item : items) {
    if (received.count >= STCS_MAX_PICTOGRAMS) {
      break;
    }

    StcsPictogramConfig& target = received.pictograms[received.count++];
    copy_text(target.id, sizeof(target.id), item["id"] | "");
    copy_text(target.label, sizeof(target.label), item["label"] | "");
    copy_text(target.message, sizeof(target.message), item["message"] | "");
    copy_text(target.category, sizeof(target.category), item["category"] | "");
    copy_text(target.color_tone, sizeof(target.color_tone),
              item["colorTone"] | "sage");
    copy_text(target.image_path, sizeof(target.image_path),
              item["imagePath"] | "");
    target.position = item["position"] | received.count;
  }

  if (config_mutex == nullptr) {
    return false;
  }

  if (xSemaphoreTake(config_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    pending_config = received;
    config_pending = true;
    xSemaphoreGive(config_mutex);
    last_config_hash = catalog_hash;
    printf("STCS_SYNC|state=ready|pictograms=%u\r\n", received.count);
    return true;
  }

  return false;
}

int post_event(const QueuedEvent& event) {
  WiFiClientSecure client;
  HTTPClient http;
  const String url = String(STCS_API_BASE_URL) + "/api/stcs/devices/" +
                     STCS_DEVICE_CODE + "/events";

  if (!begin_https(http, client, url)) {
    return -1;
  }

  http.addHeader("Content-Type", "application/json");
  JsonDocument document;
  document["eventType"] = event.event_type;
  document["context"] = "Dispositivo";
  document["externalEventId"] =
      String(static_cast<uint32_t>(ESP.getEfuseMac())) + "-" +
      String(event.boot, HEX) + "-" + event.sequence;
  time_t occurred = event.occurred_at;
  if (occurred == 0 && event.boot == boot_id && time(nullptr) > 1700000000)
    occurred = time(nullptr) - (millis() - event.queued_ms) / 1000;
  if (occurred > 1700000000) {
    struct tm utc;
    gmtime_r(&occurred, &utc);
    char timestamp[25];
    strftime(timestamp, sizeof(timestamp), "%Y-%m-%dT%H:%M:%SZ", &utc);
    document["occurredAt"] = timestamp;
  }
  document["batteryLevel"] = battery_percentage();
  document["firmwareVersion"] = FIRMWARE_VERSION;
  document["wifiSsid"] = WiFi.SSID();

  if (event.pictogram_id[0] != '\0') {
    document["pictogramId"] = event.pictogram_id;
  }
  if (event.pictogram_label[0] != '\0') {
    document["pictogramLabel"] = event.pictogram_label;
  }
  if (event.category[0] != '\0') {
    document["category"] = event.category;
  }
  if (event.message[0] != '\0') {
    document["message"] = event.message;
  }

  String payload;
  serializeJson(document, payload);
  const int status = http.POST(payload);
  http.end();
  printf("STCS_EVENT|type=%s|http=%d\r\n", event.event_type, status);
  return status;
}

void network_task(void*) {
  uint32_t last_wifi_attempt = 0;
  uint32_t last_config_poll = 0;
  QueuedEvent pending_event = {};

  while (true) {
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() - last_wifi_attempt >= WIFI_RETRY_MS) {
        last_wifi_attempt = millis();
        connect_wifi();
      }
      vTaskDelay(pdMS_TO_TICKS(250));
      continue;
    }

    if (millis() - last_config_poll >= CONFIG_POLL_MS ||
        last_config_poll == 0) {
      last_config_poll = millis();
      if (download_board_config())
        STCS_Network_QueueEvent("device_status", nullptr, nullptr, "Sistema",
                                nullptr);
    }

    int slot = -1;
    uint64_t first = UINT64_MAX;
    if (xSemaphoreTake(event_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
      for (uint8_t i = 0; i < EVENT_CAPACITY; i++)
        if (events[i].order && events[i].order < first) {
          slot = i;
          first = events[i].order;
        }
      if (slot >= 0) pending_event = events[slot];
      xSemaphoreGive(event_mutex);
    }
    if (slot >= 0) {
      int status = post_event(pending_event);
      if (status >= 200 && status < 300)
        finish_event(slot, false, status);
      else if (status >= 400 && status < 500 && status != 401 &&
               status != 403 && status != 408 && status != 429)
        finish_event(slot, true, status);
    }
    vTaskDelay(pdMS_TO_TICKS(slot >= 0 ? 1000 : 100));
  }
}

void save_wifi_command(const char* json) {
  JsonDocument document;
  if (deserializeJson(document, json)) {
    printf("STCS_WIFI|state=invalid_command\r\n");
    return;
  }

  const char* ssid = document["ssid"] | "";
  const char* password = document["password"] | "";
  if (ssid[0] == '\0' || strlen(ssid) > 32 || strlen(password) > 63 ||
      (strlen(password) > 0 && strlen(password) < 8)) {
    printf("STCS_WIFI|state=invalid_credentials\r\n");
    return;
  }

  preferences.begin("stcs-wifi", false);
  const bool ssid_saved = preferences.putString("ssid", ssid) > 0;
  const bool password_saved =
      preferences.putString("password", password) > 0 || password[0] == '\0';
  preferences.end();
  if (!ssid_saved || !password_saved) {
    printf("STCS_WIFI|state=storage_error\r\n");
    return;
  }
  copy_text(wifi_ssid, sizeof(wifi_ssid), ssid);
  copy_text(wifi_password, sizeof(wifi_password), password);

  WiFi.disconnect(true, false);
  last_config_hash = 0;
  printf("STCS_WIFI|state=saved|ssid=%s\r\n", wifi_ssid);
  connect_wifi();
}

void process_serial_line() {
  constexpr char prefix[] = "STCS_WIFI_CONFIG|";
  if (strncmp(serial_line, prefix, sizeof(prefix) - 1) == 0) {
    save_wifi_command(serial_line + sizeof(prefix) - 1);
  }
}

}  // namespace

void STCS_Network_Init(void) {
  boot_id = esp_random();
  event_mutex = xSemaphoreCreateMutex();
  restore_events();
  config_mutex = xSemaphoreCreateMutex();
  load_wifi_credentials();
  connect_wifi();
  xTaskCreatePinnedToCore(network_task, "STCS WiFi", 20480, nullptr, 1, nullptr,
                          0);
}

void STCS_Network_Loop(void) {
  while (Serial.available() > 0) {
    const char character = static_cast<char>(Serial.read());
    if (character == '\n' || character == '\r') {
      if (serial_line_length > 0) {
        serial_line[serial_line_length] = '\0';
        process_serial_line();
        serial_line_length = 0;
      }
    } else if (serial_line_length < sizeof(serial_line) - 1) {
      serial_line[serial_line_length++] = character;
    }
  }
}

bool STCS_Network_TakeBoardConfig(StcsBoardConfig* config) {
  if (config == nullptr || !config_pending || config_mutex == nullptr) {
    return false;
  }

  if (xSemaphoreTake(config_mutex, 0) != pdTRUE) {
    return false;
  }

  const bool available = config_pending;
  if (available) {
    *config = pending_config;
    config_pending = false;
  }
  xSemaphoreGive(config_mutex);
  return available;
}

bool STCS_Network_QueueEvent(const char* event_type, const char* pictogram_id,
                             const char* pictogram_label, const char* category,
                             const char* message) {
  if (event_mutex == nullptr || event_type == nullptr) return false;
  if (xSemaphoreTake(event_mutex, pdMS_TO_TICKS(100)) != pdTRUE) return false;
  int slot = -1;
  for (uint8_t i = 0; i < EVENT_CAPACITY; i++)
    if (!events[i].order) {
      slot = i;
      break;
    }
  if (slot < 0) {
    xSemaphoreGive(event_mutex);
    printf("STCS_QUEUE|state=full\r\n");
    return false;
  }

  QueuedEvent event = {};
  copy_text(event.event_type, sizeof(event.event_type), event_type);
  copy_text(event.pictogram_id, sizeof(event.pictogram_id), pictogram_id);
  copy_text(event.pictogram_label, sizeof(event.pictogram_label),
            pictogram_label);
  copy_text(event.category, sizeof(event.category), category);
  copy_text(event.message, sizeof(event.message), message);
  event.sequence = ++event_sequence;
  event.boot = boot_id;
  event.queued_ms = millis();
  event.order = next_order++;
  event.occurred_at = time(nullptr) > 1700000000 ? time(nullptr) : 0;
  Preferences store;
  store.begin("stcs-events", false);
  bool saved = store.putBytes(slot_key(slot).c_str(), &event, sizeof(event)) ==
               sizeof(event);
  store.end();
  if (saved) events[slot] = event;
  xSemaphoreGive(event_mutex);
  if (!saved) printf("STCS_QUEUE|state=storage_error\r\n");
  return saved;
}
