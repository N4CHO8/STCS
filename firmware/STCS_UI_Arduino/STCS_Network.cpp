#include "STCS_Network.h"

#include "BAT_Driver.h"
#include "STCS_NetworkSecrets.h"

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

namespace {

constexpr uint32_t CONFIG_POLL_MS = 15000;
constexpr uint32_t WIFI_RETRY_MS = 10000;
constexpr char FIRMWARE_VERSION[] = "v0.4.0-pages";

struct QueuedEvent {
  char event_type[28];
  char pictogram_id[37];
  char pictogram_label[32];
  char category[20];
  char message[96];
  uint32_t sequence;
};

Preferences preferences;
QueueHandle_t event_queue = nullptr;
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

void copy_text(char *destination, size_t size, const char *source) {
  if (size == 0) {
    return;
  }

  strlcpy(destination, source == nullptr ? "" : source, size);
}

uint32_t hash_text(const String &text) {
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

bool begin_https(HTTPClient &http, WiFiClientSecure &client, const String &url) {
  // Prototype setting: HTTPS transport is encrypted. Certificate pinning should
  // be enabled before a production rollout with real patient information.
  client.setInsecure();
  if (!http.begin(client, url)) {
    return false;
  }
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
  JsonArray items = document["data"]["pictograms"].as<JsonArray>();
  for (JsonObject item : items) {
    if (received.count >= STCS_MAX_PICTOGRAMS) {
      break;
    }

    StcsPictogramConfig &target = received.pictograms[received.count++];
    copy_text(target.id, sizeof(target.id), item["id"] | "");
    copy_text(target.label, sizeof(target.label), item["label"] | "");
    copy_text(target.message, sizeof(target.message), item["message"] | "");
    copy_text(target.category, sizeof(target.category), item["category"] | "");
    copy_text(target.color_tone, sizeof(target.color_tone), item["colorTone"] | "sage");
    copy_text(target.image_path, sizeof(target.image_path), item["imagePath"] | "");
    target.position = item["position"] | received.count;
  }

  if (received.count == 0 || config_mutex == nullptr) {
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

bool post_event(const QueuedEvent &event) {
  WiFiClientSecure client;
  HTTPClient http;
  const String url = String(STCS_API_BASE_URL) + "/api/stcs/devices/" +
                     STCS_DEVICE_CODE + "/events";

  if (!begin_https(http, client, url)) {
    return false;
  }

  http.addHeader("Content-Type", "application/json");
  JsonDocument document;
  document["eventType"] = event.event_type;
  document["context"] = "Dispositivo";
  document["externalEventId"] = String(static_cast<uint32_t>(ESP.getEfuseMac())) +
                                "-" + String(boot_id, HEX) + "-" + event.sequence;
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
  const bool success = status >= 200 && status < 300;
  printf("STCS_EVENT|type=%s|http=%d\r\n", event.event_type, status);
  return success;
}

void network_task(void *) {
  uint32_t last_wifi_attempt = 0;
  uint32_t last_config_poll = 0;
  QueuedEvent pending_event = {};
  bool has_pending_event = false;

  while (true) {
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() - last_wifi_attempt >= WIFI_RETRY_MS) {
        last_wifi_attempt = millis();
        connect_wifi();
      }
      vTaskDelay(pdMS_TO_TICKS(250));
      continue;
    }

    if (millis() - last_config_poll >= CONFIG_POLL_MS || last_config_poll == 0) {
      last_config_poll = millis();
      download_board_config();
    }

    if (!has_pending_event && event_queue != nullptr &&
        xQueueReceive(event_queue, &pending_event, 0) == pdTRUE) {
      has_pending_event = true;
    }

    if (has_pending_event && post_event(pending_event)) {
      has_pending_event = false;
    }

    vTaskDelay(pdMS_TO_TICKS(has_pending_event ? 1000 : 100));
  }
}

void save_wifi_command(const char *json) {
  JsonDocument document;
  if (deserializeJson(document, json)) {
    printf("STCS_WIFI|state=invalid_command\r\n");
    return;
  }

  const char *ssid = document["ssid"] | "";
  const char *password = document["password"] | "";
  if (ssid[0] == '\0') {
    printf("STCS_WIFI|state=missing_ssid\r\n");
    return;
  }

  preferences.begin("stcs-wifi", false);
  preferences.putString("ssid", ssid);
  preferences.putString("password", password);
  preferences.end();
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
  event_queue = xQueueCreate(16, sizeof(QueuedEvent));
  config_mutex = xSemaphoreCreateMutex();
  load_wifi_credentials();
  connect_wifi();
  xTaskCreatePinnedToCore(network_task, "STCS WiFi", 20480, nullptr, 1, nullptr, 0);
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

bool STCS_Network_TakeBoardConfig(StcsBoardConfig *config) {
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

void STCS_Network_QueueEvent(const char *event_type,
                             const char *pictogram_id,
                             const char *pictogram_label,
                             const char *category,
                             const char *message) {
  if (event_queue == nullptr || event_type == nullptr) {
    return;
  }

  QueuedEvent event = {};
  copy_text(event.event_type, sizeof(event.event_type), event_type);
  copy_text(event.pictogram_id, sizeof(event.pictogram_id), pictogram_id);
  copy_text(event.pictogram_label, sizeof(event.pictogram_label), pictogram_label);
  copy_text(event.category, sizeof(event.category), category);
  copy_text(event.message, sizeof(event.message), message);
  event.sequence = ++event_sequence;
  xQueueSend(event_queue, &event, 0);
}
