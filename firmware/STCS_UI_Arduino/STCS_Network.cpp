#include "STCS_Network.h"
#include "STCS_AudioStorage.h"
#include "STCS_NetworkSecrets.h"
#include "STCS_TrustRoots.h"
#include "STCS_UI.h"
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <LittleFS.h>
#include <Preferences.h>
#include <WebServer.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <esp_heap_caps.h>
#include <mbedtls/sha256.h>
#include <time.h>

#ifndef STCS_WIFI_SETUP_PASSWORD
#error Define a private STCS_WIFI_SETUP_PASSWORD in STCS_NetworkSecrets.h
#endif
#ifndef STCS_ALLOW_INSECURE_HTTP
#define STCS_ALLOW_INSECURE_HTTP 0
#endif

namespace {
constexpr char VERSION[] = "v0.8.1-cloud";
constexpr uint32_t IMAGE_BYTES = 96 * 96 * 2, AUDIO_MAX_BYTES = 320044;
constexpr size_t QUEUE_LIMIT = 64;
// The parsed board can exceed internal Wi-Fi RAM as capacity grows.
class BoardAllocator : public ArduinoJson::Allocator {
public:
  void *allocate(size_t size) override {
    return heap_caps_malloc(size, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
  }
  void deallocate(void *ptr) override { heap_caps_free(ptr); }
  void *reallocate(void *ptr, size_t size) override {
    return heap_caps_realloc(ptr, size, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
  }
};
BoardAllocator board_allocator;
constexpr size_t BOARD_HTTP_LIMIT = 256 * 1024, BOARD_SAVED_LIMIT = 128 * 1024;
void service_audio();
WebServer portal(80);
Preferences preferences;
SemaphoreHandle_t queue_mutex = nullptr, config_mutex = nullptr,
                  audio_mutex = nullptr;
StcsBoardConfig *pending = nullptr;
bool has_pending = false, ap_started = false, board_incomplete = false;
uint32_t board_hash = 0, boot_id = 0, event_sequence = 0;
uint64_t next_order = 1;
char wifi_ssid[33] = "", wifi_password[65] = "";
char configuration_binding[65] = "";
String queue_folder;
// A lab or reassigned device must never replay another configuration's events
// or render its saved board. Rotate the individual key when reassigning hardware.
void bind_configuration() {
  String scope = String(STCS_API_BASE_URL) + "|" + STCS_DEVICE_CODE + "|" +
                 STCS_DEVICE_API_KEY;
  uint8_t digest[32];
  mbedtls_sha256_context hash;
  mbedtls_sha256_init(&hash);
  mbedtls_sha256_starts(&hash, 0);
  mbedtls_sha256_update(&hash,
      reinterpret_cast<const uint8_t *>(scope.c_str()), scope.length());
  mbedtls_sha256_finish(&hash, digest);
  mbedtls_sha256_free(&hash);
  for (size_t i = 0; i < sizeof(digest); i++)
    snprintf(configuration_binding + i * 2, 3, "%02x", digest[i]);
  queue_folder = String("/v8q-") + String(configuration_binding).substring(0, 16);
  LittleFS.mkdir(queue_folder);
}
struct AudioRequest {
  char id[37];
  char hash[65];
  uint32_t bytes;
};
AudioRequest requested_audio = {};
bool audio_requested = false;

bool hex_hash(const char *text) {
  if (strlen(text) != 64)
    return false;
  for (size_t i = 0; i < 64; i++)
    if (!isxdigit(text[i]) || isupper(text[i]))
      return false;
  return true;
}
uint32_t hash_text(const String &text) {
  uint32_t h = 5381;
  for (size_t i = 0; i < text.length(); i++)
    h = ((h << 5) + h) ^ static_cast<uint8_t>(text[i]);
  return h;
}
String media_uri(const char *id, const char *kind, const char *hash) {
  return String("/api/stcs/devices/") + STCS_DEVICE_CODE + "/media/" + id +
         "/" + kind + "?v=" + hash;
}
String cache_path(const char *hash, const char *kind) {
  return String("/v7cache/") + hash +
         (strcmp(kind, "audio") == 0 ? ".wav" : ".rgb");
}
bool begin_request(HTTPClient &http, WiFiClientSecure &secure,
                   WiFiClient &plain, const String &uri) {
  String base = STCS_API_BASE_URL;
  if (base.startsWith("https://")) {
    if (time(nullptr) < 1700000000)
      return false;
    secure.setCACert(STCS_TRUST_ROOTS);
    if (!http.begin(secure, base + uri))
      return false;
  } else {
    if (!STCS_ALLOW_INSECURE_HTTP || !base.startsWith("http://"))
      return false;
    if (!http.begin(plain, base + uri))
      return false;
  }
  http.setReuse(false); // Each bounded request owns its connection.
  http.setConnectTimeout(5000);
  http.setTimeout(10000);
  http.setFollowRedirects(HTTPC_DISABLE_FOLLOW_REDIRECTS);
  http.addHeader("x-stcs-device-key", STCS_DEVICE_API_KEY);
  return true;
}
bool cached(const String &path, size_t bytes) {
  File file = LittleFS.open(path, FILE_READ);
  bool ok = file && file.size() == bytes;
  file.close();
  if (ok)
    STCS_CacheTouch(path.c_str());
  return ok;
}
// HTTPClient decodes chunked bodies before this bounded, hashing sink sees
// bytes. Next.js may stream without Content-Length even when a Response set
// that header.
class MediaSink : public Stream {
public:
  File &file;
  mbedtls_sha256_context &hash;
  size_t expected, total = 0;
  bool ok = true;
  MediaSink(File &target, mbedtls_sha256_context &context, size_t limit)
      : file(target), hash(context), expected(limit) {}
  int available() override { return 0; }
  int read() override { return -1; }
  int peek() override { return -1; }
  void flush() override { file.flush(); }
  size_t write(uint8_t byte) override { return write(&byte, 1); }
  size_t write(const uint8_t *data, size_t length) override {
    if (length > expected - total) {
      ok = false;
      setWriteError();
      return 0;
    }
    size_t written = file.write(data, length);
    if (written != length) {
      ok = false;
      setWriteError();
    }
    if (written)
      mbedtls_sha256_update(&hash, data, written);
    total += written;
    return written;
  }
};
bool fetch_media(const char *id, const char *kind, const char *hash,
                 size_t bytes) {
  if (!hex_hash(hash) || !bytes ||
      (strcmp(kind, "image") == 0 ? bytes != IMAGE_BYTES
                                  : bytes > AUDIO_MAX_BYTES))
    return false;
  String path = cache_path(hash, kind);
  if (cached(path, bytes))
    return true;
  if (WiFi.status() != WL_CONNECTED || !STCS_CacheRoom(bytes, path.c_str()))
    return false;
  // Clients must outlive HTTPClient: its destructor may still stop its client.
  WiFiClientSecure secure;
  WiFiClient plain;
  HTTPClient http;
  if (!begin_request(http, secure, plain, media_uri(id, kind, hash)))
    return false;
  http.addHeader("Accept-Encoding", "identity");
  int status = http.GET(), declared = http.getSize();
  if (status != 200 || (declared >= 0 && declared != static_cast<int>(bytes))) {
    printf("STCS_MEDIA|http=%d|declared=%d|expected=%u\r\n", status, declared,
           (unsigned)bytes);
    http.end();
    return false;
  }
  String temp = path + ".tmp";
  File out = LittleFS.open(temp, FILE_WRITE);
  if (!out) {
    http.end();
    return false;
  }
  mbedtls_sha256_context context;
  mbedtls_sha256_init(&context);
  mbedtls_sha256_starts(&context, 0);
  MediaSink sink(out, context, bytes);
  int result = http.writeToStream(&sink);
  sink.flush();
  out.close();
  http.end();
  uint8_t digest[32];
  mbedtls_sha256_finish(&context, digest);
  mbedtls_sha256_free(&context);
  char computed[65];
  for (size_t i = 0; i < 32; i++)
    snprintf(computed + i * 2, 3, "%02x", digest[i]);
  bool ok = sink.ok && result == static_cast<int>(bytes) &&
            sink.total == bytes && strcmp(computed, hash) == 0;
  if (ok) {
    LittleFS.remove(path);
    ok = LittleFS.rename(temp, path);
  }
  if (!ok)
    LittleFS.remove(temp);
  printf("STCS_MEDIA|http=%d|declared=%d|received=%u|result=%d|valid=%d\r\n",
         status, declared, (unsigned)sink.total, result, ok);
  if (ok) {
    STCS_CacheTouch(path.c_str());
    STCS_CacheReport();
  }
  return ok;
}
void free_images(StcsBoardConfig &board) {
  for (size_t i = 0; i < board.count; i++) {
    free(board.pictograms[i].image_data);
    board.pictograms[i].image_data = nullptr;
  }
}
bool apply_document(JsonDocument &document, bool online) {
  const uint32_t started = millis();
  uint32_t minimum_psram = ESP.getFreePsram();
  uint16_t ram_copies = 0;
  JsonArray items = document["data"]["pictograms"].as<JsonArray>();
  if (items.isNull() || items.size() > STCS_MAX_PICTOGRAMS)
    return false;
  // Admission includes two complete image generations, all board structures,
  // 384 KiB of board structures, the HTTP metadata budget and 1 MiB for
  // the measured decoder allocation plus allocator/transport headroom.
  // Reject oversized updates while the previous board is still usable.
  const size_t required = 2 * items.size() * IMAGE_BYTES + 384 * 1024 +
                          BOARD_HTTP_LIMIT + 1024 * 1024;
  if (required > ESP.getPsramSize()) {
    printf("STCS_SYNC|state=capacity_guard|requested=%u|required=%u|psram_"
           "total=%u\r\n",
           (unsigned)items.size(), (unsigned)required,
           (unsigned)ESP.getPsramSize());
    return false;
  }
  // Hash while serializing instead of allocating a second full JSON string.
  class BoardHash : public Print {
  public:
    uint32_t value = 5381;
    size_t write(uint8_t byte) override {
      value = ((value << 5) + value) ^ byte;
      return 1;
    }
  } digest;
  serializeJson(items, digest);
  uint32_t hash = digest.value;
  if (hash == board_hash && !board_incomplete)
    return true;
  StcsBoardConfig *board = static_cast<StcsBoardConfig *>(heap_caps_calloc(
      1, sizeof(StcsBoardConfig), MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  if (!board)
    return false;
  bool valid = true, incomplete = false;
  for (JsonObject item : items) {
    if (online) {
      service_audio();
      portal.handleClient();
      vTaskDelay(pdMS_TO_TICKS(1));
    }
    StcsPictogramConfig &p = board->pictograms[board->count++];
    strlcpy(p.id, item["id"] | "", sizeof(p.id));
    strlcpy(p.label, item["label"] | "", sizeof(p.label));
    strlcpy(p.message, item["message"] | "", sizeof(p.message));
    strlcpy(p.category, item["category"] | "", sizeof(p.category));
    strlcpy(p.color_tone, item["colorTone"] | "sage", sizeof(p.color_tone));
    strlcpy(p.image_path, item["imagePath"] | "", sizeof(p.image_path));
    strlcpy(p.image_hash, item["imageSha256"] | "", sizeof(p.image_hash));
    strlcpy(p.audio_hash, item["audioSha256"] | "", sizeof(p.audio_hash));
    p.position = item["position"] | board->count;
    if (!hex_hash(p.image_hash)) {
      valid = false;
      break;
    }
    String path = cache_path(p.image_hash, "image");
    p.image_data = static_cast<uint8_t *>(
        heap_caps_malloc(IMAGE_BYTES, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
    if (!p.image_data) {
      valid = false;
      printf("STCS_SYNC|state=allocation_error|loaded=%u\r\n",
             board->count - 1);
      break;
    }
    minimum_psram = min(minimum_psram, ESP.getFreePsram());
    bool image_ok = STCS_UI_CopyImage(p.image_hash, p.image_data);
    if (image_ok)
      ram_copies++;
    else {
      image_ok = online ? fetch_media(p.id, "image", p.image_hash, IMAGE_BYTES)
                        : cached(path, IMAGE_BYTES);
      if (image_ok) {
        File image = LittleFS.open(path, FILE_READ);
        if (p.image_data && image)
          image_ok = image.read(p.image_data, IMAGE_BYTES) == IMAGE_BYTES;
        else
          image_ok = false;
        image.close();
      }
    }
    if (!image_ok) {
      incomplete = true;
      free(p.image_data);
      p.image_data = nullptr;
      if (online) {
        valid = false;
        break;
      }
    }
    p.audio_ready = strcmp(item["audioStatus"] | "", "ready") == 0 &&
                    hex_hash(p.audio_hash);
    p.audio_bytes = item["audioBytes"] | 0;
    if (p.audio_ready) {
      String audio_path = cache_path(p.audio_hash, "audio");
      strlcpy(p.audio_path, audio_path.c_str(), sizeof(p.audio_path));
    }
  }
  if (valid && xSemaphoreTake(config_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    if (!has_pending) {
      *pending = *board;
      has_pending = true;
      board_hash = hash;
      board_incomplete = incomplete;
      board->count = 0;
    }
    xSemaphoreGive(config_mutex);
  } else
    valid = false;
  free_images(*board);
  free(board);
  if (valid)
    printf("STCS_SYNC|state=ready|firmware=%s|pictograms=%u|ram_copied=%u|"
           "duration_ms=%u|min_psram=%u\r\n",
           VERSION, (unsigned)items.size(), ram_copies,
           (unsigned)(millis() - started), (unsigned)minimum_psram);
  return valid;
}
bool download_board() {
  if (has_pending)
    return true;
  // Clients must outlive HTTPClient: its destructor may still stop its client.
  WiFiClientSecure secure;
  WiFiClient plain;
  HTTPClient http;
  if (!begin_request(http, secure, plain,
                     String("/api/stcs/devices/") + STCS_DEVICE_CODE +
                         "/config"))
    return false;
  int status = http.GET();
  // A chunked body reports -1; never compare that sentinel to an unsigned
  // limit.
  const int declared_size = http.getSize();
  if (status != 200 ||
      (declared_size >= 0 &&
       static_cast<size_t>(declared_size) > BOARD_HTTP_LIMIT)) {
    printf("STCS_SYNC|state=error|http=%d|wifi=%d|errno=%d|largest=%u\r\n",
           status, (int)WiFi.status(), errno,
           (unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_INTERNAL |
                                                      MALLOC_CAP_8BIT));
    http.end();
    return false;
  }
  // Do not allocate the entire response in Arduino String (internal RAM).
  // HTTPClient decodes chunked transfer into a bounded temporary file; JSON
  // nodes are then allocated in PSRAM, and the temporary file is removed before
  // media downloads.
  LittleFS.mkdir("/v7");
  File incoming = LittleFS.open("/v7/incoming.json", FILE_WRITE);
  if (!incoming) {
    http.end();
    return false;
  }
  class BoardSink : public Stream {
  public:
    File &file;
    size_t bytes = 0;
    bool valid = true;
    explicit BoardSink(File &target) : file(target) {}
    int available() override { return 0; }
    int read() override { return -1; }
    int peek() override { return -1; }
    void flush() override { file.flush(); }
    size_t write(uint8_t byte) override { return write(&byte, 1); }
    size_t write(const uint8_t *data, size_t length) override {
      if (length > BOARD_HTTP_LIMIT - bytes) {
        valid = false;
        return 0;
      }
      size_t wrote = file.write(data, length);
      bytes += wrote;
      if (wrote != length)
        valid = false;
      return wrote;
    }
  } sink(incoming);
  int result = http.writeToStream(&sink);
  sink.flush();
  incoming.close();
  http.end();
  if (result < 0 || !sink.valid || !sink.bytes) {
    LittleFS.remove("/v7/incoming.json");
    printf("STCS_SYNC|state=body_error\r\n");
    return false;
  }
  JsonDocument doc(&board_allocator);
  File input = LittleFS.open("/v7/incoming.json", FILE_READ);
  auto error = deserializeJson(doc, input);
  input.close();
  LittleFS.remove("/v7/incoming.json");
  if (error) {
    printf("STCS_SYNC|state=json_error|reason=%s|bytes=%u\r\n", error.c_str(),
           (unsigned)sink.bytes);
    return false;
  }
  uint32_t before = board_hash;
  if (!apply_document(doc, true))
    return false;
  if (board_hash != before) {
    // Persist only fields used by the ESP, not web URLs or redundant
    // projections. This leaves room for the bounded queue and an atomic
    // metadata replacement.
    JsonDocument compact(&board_allocator);
    compact["binding"] = configuration_binding;
    JsonArray compact_items = compact["data"]["pictograms"].to<JsonArray>();
    for (JsonObject item : doc["data"]["pictograms"].as<JsonArray>()) {
      JsonObject out = compact_items.add<JsonObject>();
      for (const char *key :
           {"id", "label", "message", "category", "colorTone", "imageSha256",
            "audioSha256", "audioBytes", "audioStatus", "position"})
        if (!item[key].isNull())
          out[key] = item[key];
    }
    if (measureJson(compact) > BOARD_SAVED_LIMIT)
      return false;
    LittleFS.mkdir("/v7");
    File file = LittleFS.open("/v7/board.tmp", FILE_WRITE);
    if (file) {
      size_t expected = measureJson(compact);
      size_t wrote = serializeJson(compact, file);
      file.flush();
      file.close();
      if (wrote == expected) {
        LittleFS.remove("/v7/board.json");
        LittleFS.rename("/v7/board.tmp", "/v7/board.json");
      } else
        LittleFS.remove("/v7/board.tmp");
    }
    STCS_Network_QueueEvent("board_synced", nullptr, nullptr, "Sistema",
                            nullptr);
  }
  return true;
}
String queue_name(File &file) {
  String name = file.name();
  return name.startsWith("/") ? name : queue_folder + "/" + name;
}
void inspect_queue() {
  File dir = LittleFS.open(queue_folder);
  for (File f = dir.openNextFile(); f; f = dir.openNextFile()) {
    String name = queue_name(f);
    if (name.endsWith(".tmp")) {
      f.close();
      LittleFS.remove(name);
      continue;
    }
    const char *number = strrchr(name.c_str(), '/');
    uint64_t order = strtoull(number ? number + 1 : name.c_str(), nullptr, 10);
    if (order >= next_order)
      next_order = order + 1;
  }
}
void send_pending() {
  String first = "", body = "";
  if (xSemaphoreTake(queue_mutex, pdMS_TO_TICKS(100)) != pdTRUE)
    return;
  File dir = LittleFS.open(queue_folder);
  for (File f = dir.openNextFile(); f; f = dir.openNextFile()) {
    String path = queue_name(f);
    if (path.endsWith(".json") && (first == "" || path < first))
      first = path;
  }
  dir.close();
  if (first != "") {
    File file = LittleFS.open(first, FILE_READ);
    if (file && file.size() <= 1024)
      body = file.readString();
    file.close();
  }
  xSemaphoreGive(queue_mutex);
  if (body == "")
    return;
  JsonDocument sent;
  if (deserializeJson(sent, body))
    return;
  // Clients must outlive HTTPClient: its destructor may still stop its client.
  WiFiClientSecure secure;
  WiFiClient plain;
  HTTPClient http;
  if (!begin_request(http, secure, plain,
                     String("/api/stcs/devices/") + STCS_DEVICE_CODE +
                         "/events"))
    return;
  http.addHeader("Content-Type", "application/json");
  int status = http.POST(body);
  String response = http.getString();
  http.end();
  JsonDocument received;
  bool accepted = status >= 200 && status < 300 &&
                  !deserializeJson(received, response) &&
                  received["ack"]["accepted"] == true &&
                  strcmp(received["ack"]["externalEventId"] | "",
                         sent["externalEventId"] | "-") == 0;
  if (accepted && xSemaphoreTake(queue_mutex, pdMS_TO_TICKS(100)) == pdTRUE) {
    LittleFS.remove(first);
    xSemaphoreGive(queue_mutex);
  }
  printf("STCS_EVENT|http=%d|accepted=%d\r\n", status, accepted);
}
void start_ap() {
  if (ap_started)
    return;
  WiFi.mode(WIFI_AP_STA);
  ap_started = WiFi.softAP("STCS-Config", STCS_WIFI_SETUP_PASSWORD);
  printf("STCS_WIFI|state=setup_available\r\n");
}
void service_audio() {
  AudioRequest request = {};
  bool have = false;
  if (xSemaphoreTake(audio_mutex, pdMS_TO_TICKS(10)) == pdTRUE) {
    if (audio_requested) {
      request = requested_audio;
      audio_requested = false;
      have = true;
    }
    xSemaphoreGive(audio_mutex);
  }
  if (have) {
    bool ok = fetch_media(request.id, "audio", request.hash, request.bytes);
    printf("STCS_MEDIA|state=%s\r\n", ok ? "audio_ready" : "audio_unavailable");
  }
}
void network_task(void *) {
  uint32_t poll = 0, heartbeat = 0;
  while (true) {
    portal.handleClient();
    if (WiFi.status() != WL_CONNECTED) {
      if (millis() > 10000)
        start_ap();
      vTaskDelay(pdMS_TO_TICKS(30));
      continue;
    }
    if (poll == 0 || millis() - poll > 15000) {
      poll = millis();
      download_board();
    }
    service_audio();
    send_pending();
    if (millis() - heartbeat > 60000) {
      heartbeat = millis();
      // Network diagnostics contain no SSID, password or device credential.
      printf("STCS_NET|ip=%s|gateway=%s|rssi=%d\r\n",
             WiFi.localIP().toString().c_str(),
             WiFi.gatewayIP().toString().c_str(), WiFi.RSSI());
      STCS_Network_QueueEvent("device_status", nullptr, nullptr, "Sistema",
                              nullptr);
      STCS_CacheReport();
    }
    vTaskDelay(pdMS_TO_TICKS(100));
  }
}
bool portal_auth() {
  if (portal.authenticate("stcs", STCS_WIFI_SETUP_PASSWORD))
    return true;
  portal.requestAuthentication();
  return false;
}
void configure_wifi_portal() {
  portal.on("/", HTTP_GET, [] {
    if (!portal_auth())
      return;
    portal.send(
        200, "text/html; charset=utf-8",
        "<!doctype html><meta name='viewport' "
        "content='width=device-width'><title>Wi-Fi STCS</title><h1>Conectar "
        "STCS</h1><form method='post' action='/wifi'><label>Red <input "
        "name='ssid' required maxlength='32'></label><br><label>Clave <input "
        "name='password' type='password' "
        "maxlength='63'></label><br><button>Guardar red</button></form>");
  });
  portal.on("/wifi", HTTP_POST, [] {
    if (!portal_auth())
      return;
    String ssid = portal.arg("ssid"), password = portal.arg("password");
    if (ssid.length() == 0 || ssid.length() > 32 || password.length() > 63 ||
        (password.length() > 0 && password.length() < 8)) {
      portal.send(400, "text/plain", "Red o clave invalida");
      return;
    }
    preferences.begin("stcs-wifi", false);
    bool saved = preferences.putString("ssid", ssid) > 0;
    preferences.putString("password", password);
    preferences.end();
    if (!saved) {
      portal.send(500, "text/plain", "No se pudo guardar");
      return;
    }
    portal.send(200, "text/plain",
                "Red guardada. El comunicador intentara conectarse.");
    strlcpy(wifi_ssid, ssid.c_str(), sizeof(wifi_ssid));
    strlcpy(wifi_password, password.c_str(), sizeof(wifi_password));
    WiFi.begin(wifi_ssid, wifi_password);
  });
  portal.begin();
}
} // namespace

void STCS_Network_Init() {
  // Board metadata grows with uploaded image/audio hashes: keep it out of
  // internal Wi-Fi RAM.
  pending = static_cast<StcsBoardConfig *>(heap_caps_calloc(
      1, sizeof(StcsBoardConfig), MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  if (!pending) {
    printf("STCS_BOOT|state=psram_error\r\n");
    return;
  }
  boot_id = esp_random();
  queue_mutex = xSemaphoreCreateMutex();
  config_mutex = xSemaphoreCreateMutex();
  audio_mutex = xSemaphoreCreateMutex();
  bind_configuration();
  inspect_queue();
  preferences.begin("stcs-wifi", true);
  String ssid = preferences.getString("ssid", ""),
         password = preferences.getString("password", "");
  preferences.end();
  strlcpy(wifi_ssid, ssid.c_str(), sizeof(wifi_ssid));
  strlcpy(wifi_password, password.c_str(), sizeof(wifi_password));
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  if (wifi_ssid[0])
    WiFi.begin(wifi_ssid, wifi_password);
  else
    start_ap();
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  configure_wifi_portal();
  File saved = LittleFS.open("/v7/board.json", FILE_READ);
  if (saved && saved.size() <= BOARD_SAVED_LIMIT) {
    JsonDocument doc(&board_allocator);
    if (!deserializeJson(doc, saved)) {
      if (strcmp(doc["binding"] | "", configuration_binding) == 0)
        apply_document(doc, false);
      else
        printf("STCS_BOOT|state=cache_scope_mismatch\r\n");
    }
  }
  saved.close();
  xTaskCreatePinnedToCore(network_task, "STCS Network", 24576, nullptr, 1,
                          nullptr, 0);
  printf("STCS_BOOT|firmware=%s|psram_free=%u\r\n", VERSION,
         (unsigned)ESP.getFreePsram());
}
void STCS_Network_Loop() {
  static uint32_t health = 0;
  if (millis() - health > 15000) {
    health = millis();
    printf("STCS_HEALTH|firmware=%s|heap=%u|psram=%u|largest=%u\r\n", VERSION,
           (unsigned)ESP.getFreeHeap(), (unsigned)ESP.getFreePsram(),
           (unsigned)heap_caps_get_largest_free_block(MALLOC_CAP_SPIRAM |
                                                      MALLOC_CAP_8BIT));
  }
}
bool STCS_Network_Online() { return WiFi.status() == WL_CONNECTED; }
bool STCS_Network_TakeBoardConfig(StcsBoardConfig *out) {
  if (!pending || !out ||
      xSemaphoreTake(config_mutex, pdMS_TO_TICKS(10)) != pdTRUE)
    return false;
  bool ready = has_pending;
  if (ready) {
    *out = *pending;
    memset(pending, 0, sizeof(*pending));
    has_pending = false;
  }
  xSemaphoreGive(config_mutex);
  return ready;
}
bool STCS_Network_RequestAudio(const char *id, const char *hash,
                               uint32_t bytes) {
  if (!id || !hash || !hex_hash(hash) || bytes > AUDIO_MAX_BYTES || !bytes)
    return false;
  String path = cache_path(hash, "audio");
  if (cached(path, bytes))
    return true;
  if (!STCS_Network_Online() ||
      xSemaphoreTake(audio_mutex, pdMS_TO_TICKS(10)) != pdTRUE)
    return false;
  strlcpy(requested_audio.id, id, sizeof(requested_audio.id));
  strlcpy(requested_audio.hash, hash, sizeof(requested_audio.hash));
  requested_audio.bytes = bytes;
  audio_requested = true;
  xSemaphoreGive(audio_mutex);
  return true;
}
bool STCS_Network_QueueEvent(const char *type, const char *id,
                             const char *label, const char *category,
                             const char *message) {
  if (!queue_mutex || xSemaphoreTake(queue_mutex, pdMS_TO_TICKS(100)) != pdTRUE)
    return false;
  size_t count = 0;
  File dir = LittleFS.open(queue_folder);
  for (File f = dir.openNextFile(); f; f = dir.openNextFile())
    if (!f.isDirectory())
      count++;
  dir.close();
  if (count >= QUEUE_LIMIT) {
    xSemaphoreGive(queue_mutex);
    printf("STCS_STORE|state=queue_full\r\n");
    return false;
  }
  JsonDocument event;
  event["eventType"] = type;
  event["context"] = "Dispositivo";
  event["firmwareVersion"] = VERSION;
  event["externalEventId"] =
      String(static_cast<uint32_t>(ESP.getEfuseMac()), HEX) + "-" +
      String(boot_id, HEX) + "-" + String(++event_sequence);
  if (id && id[0])
    event["pictogramId"] = id;
  if (label && label[0])
    event["pictogramLabel"] = label;
  if (category && category[0])
    event["category"] = category;
  if (message && message[0])
    event["message"] = message;
  time_t now = time(nullptr);
  if (now > 1700000000) {
    struct tm utc;
    gmtime_r(&now, &utc);
    char stamp[25];
    strftime(stamp, sizeof(stamp), "%Y-%m-%dT%H:%M:%SZ", &utc);
    event["occurredAt"] = stamp;
  }
  char path[80];
  snprintf(path, sizeof(path), "%s/%020llu.json", queue_folder.c_str(),
           static_cast<unsigned long long>(next_order++));
  String temp = String(path) + ".tmp";
  File file = LittleFS.open(temp, FILE_WRITE);
  bool saved = false;
  if (file) {
    size_t length = measureJson(event);
    saved = length <= 1024 && serializeJson(event, file) == length;
    file.flush();
    file.close();
    if (saved)
      saved = LittleFS.rename(temp, path);
  }
  if (!saved)
    LittleFS.remove(temp);
  xSemaphoreGive(queue_mutex);
  return saved;
}
