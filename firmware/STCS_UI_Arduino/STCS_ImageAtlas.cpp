#include "STCS_ImageAtlas.h"
#include "STCS_AudioStorage.h"
#include <LittleFS.h>
#include <esp_heap_caps.h>
#include <mbedtls/sha256.h>
#include <miniz.h>

namespace {
constexpr size_t PIXELS = 96 * 96 * 2, COMPRESSED_MAX = PIXELS + 128;
constexpr size_t HEADER_BYTES = 8 + 2 + 64 + 64;
constexpr char MAGIC[8] = {'S','T','C','S','A','T','1',0};
struct Entry { char hash[65]; uint32_t offset, bytes; };
File reader;
Entry *entries = nullptr;
uint8_t *compressed = nullptr;
tinfl_decompressor *decoder = nullptr;
uint16_t entry_count = 0;
bool damaged = false;
const char *reader_path = STCS_ATLAS_PATH;
void *psram(size_t bytes) {
  return heap_caps_calloc(1, bytes, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT);
}
bool hash_valid(const char *hash) {
  if (hash[64] != 0) return false;
  for (size_t i = 0; i < 64; i++)
    if (!((hash[i] >= '0' && hash[i] <= '9') || (hash[i] >= 'a' && hash[i] <= 'f')))
      return false;
  return true;
}
void digest(const void *bytes, size_t length, char out[65]) {
  uint8_t sum[32];
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx); mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, static_cast<const uint8_t *>(bytes), length);
  mbedtls_sha256_finish(&ctx, sum); mbedtls_sha256_free(&ctx);
  for (size_t i = 0; i < 32; i++) snprintf(out + i * 2, 3, "%02x", sum[i]);
}
void image_set(const char *binding, const StcsBoardConfig &board, char out[65]) {
  mbedtls_sha256_context ctx;
  mbedtls_sha256_init(&ctx); mbedtls_sha256_starts(&ctx, 0);
  mbedtls_sha256_update(&ctx, reinterpret_cast<const uint8_t *>(binding), 64);
  for (size_t i = 0; i < board.count; i++)
    mbedtls_sha256_update(&ctx, reinterpret_cast<const uint8_t *>(board.pictograms[i].image_hash), 64);
  uint8_t sum[32];
  mbedtls_sha256_finish(&ctx, sum); mbedtls_sha256_free(&ctx);
  for (size_t i = 0; i < 32; i++) snprintf(out + i * 2, 3, "%02x", sum[i]);
}
}

void STCS_AtlasClose() {
  reader.close();
  free(entries); entries = nullptr;
  free(compressed); compressed = nullptr;
  free(decoder); decoder = nullptr;
  entry_count = 0;
  if (damaged) LittleFS.remove(reader_path);
  damaged = false;
  reader_path = STCS_ATLAS_PATH;
}

static bool open_reader(const char *path, const char *binding) {
  STCS_AtlasClose();
  reader_path = path;
  reader = LittleFS.open(path, FILE_READ);
  if (!reader) return false;
  char magic[8], scope[64], set[64];
  uint16_t count = 0;
  bool header = reader.size() >= HEADER_BYTES && reader.size() <= STCS_ATLAS_BUDGET &&
      reader.read(reinterpret_cast<uint8_t *>(magic), 8) == 8 && memcmp(magic, MAGIC, 8) == 0 &&
      reader.read(reinterpret_cast<uint8_t *>(&count), 2) == 2 && count && count <= STCS_MAX_PICTOGRAMS &&
      reader.read(reinterpret_cast<uint8_t *>(scope), 64) == 64 &&
      reader.read(reinterpret_cast<uint8_t *>(set), 64) == 64;
  if (!header) { damaged = true; STCS_AtlasClose(); return false; }
  if (memcmp(scope, binding, 64) != 0) { STCS_AtlasClose(); return false; }
  entries = static_cast<Entry *>(psram(sizeof(Entry) * STCS_MAX_PICTOGRAMS));
  compressed = static_cast<uint8_t *>(psram(COMPRESSED_MAX));
  decoder = static_cast<tinfl_decompressor *>(psram(sizeof(tinfl_decompressor)));
  if (!entries || !compressed || !decoder) { STCS_AtlasClose(); return false; }
  for (size_t i = 0; i < count; i++) {
    auto &entry = entries[i];
    if (reader.read(reinterpret_cast<uint8_t *>(entry.hash), 65) != 65 || !hash_valid(entry.hash) ||
        reader.read(reinterpret_cast<uint8_t *>(&entry.bytes), 4) != 4 ||
        !entry.bytes || entry.bytes > COMPRESSED_MAX ||
        entry.bytes > reader.size() - reader.position()) {
      damaged = true; STCS_AtlasClose(); return false;
    }
    entry.offset = reader.position();
    if (!reader.seek(entry.offset + entry.bytes)) { damaged = true; STCS_AtlasClose(); return false; }
  }
  if (reader.position() != reader.size()) { damaged = true; STCS_AtlasClose(); return false; }
  entry_count = count;
  STCS_CacheTouch(STCS_ATLAS_PATH);
  printf("STCS_ATLAS|state=open|images=%u|bytes=%u\r\n", count, (unsigned)reader.size());
  return true;
}

bool STCS_AtlasOpen(const char *binding) {
  return open_reader(STCS_ATLAS_PATH, binding);
}

bool STCS_AtlasRead(const char *hash, uint8_t *pixels) {
  if (!reader || damaged || !pixels) return false;
  for (size_t i = 0; i < entry_count; i++) {
    auto &entry = entries[i];
    if (strcmp(entry.hash, hash) != 0) continue;
    if (!reader.seek(entry.offset) || reader.read(compressed, entry.bytes) != entry.bytes) {
      damaged = true; return false;
    }
    tinfl_init(decoder);
    size_t in = entry.bytes, out = PIXELS;
    auto result = tinfl_decompress(decoder, compressed, &in, pixels, pixels, &out,
        TINFL_FLAG_PARSE_ZLIB_HEADER | TINFL_FLAG_USING_NON_WRAPPING_OUTPUT_BUF);
    if (result != TINFL_STATUS_DONE || in != entry.bytes || out != PIXELS) {
      damaged = true; return false;
    }
    char actual[65]; digest(pixels, PIXELS, actual);
    if (strcmp(actual, hash) != 0) { damaged = true; return false; }
    return true;
  }
  return false;
}

bool STCS_AtlasSave(const char *binding, const StcsBoardConfig &board) {
  if (!board.count) return false;
  for (size_t i = 0; i < board.count; i++)
    if (!board.pictograms[i].image_data) return false;
  char signature[65]; image_set(binding, board, signature);
  File prior = LittleFS.open(STCS_ATLAS_PATH, FILE_READ);
  if (prior && prior.size() >= HEADER_BYTES && prior.size() <= STCS_ATLAS_BUDGET) {
    char magic[8], scope[64], existing[64]; uint16_t count = 0;
    bool same = prior.read(reinterpret_cast<uint8_t *>(magic), 8) == 8 && memcmp(magic, MAGIC, 8) == 0 &&
        prior.read(reinterpret_cast<uint8_t *>(&count), 2) == 2 && count && count <= STCS_MAX_PICTOGRAMS &&
        prior.read(reinterpret_cast<uint8_t *>(scope), 64) == 64 &&
        prior.read(reinterpret_cast<uint8_t *>(existing), 64) == 64 &&
        memcmp(scope, binding, 64) == 0 && memcmp(existing, signature, 64) == 0;
    prior.close();
    if (same) return true;
  } else prior.close();
  // Caller owns the verified incoming generation. All compression workspace
  // lives in PSRAM, with an additional reserve; no large ROM structs on stack.
  if (ESP.getFreePsram() < sizeof(tdefl_compressor) + COMPRESSED_MAX + STCS_ATLAS_BUDGET + 512 * 1024) {
    printf("STCS_ATLAS|state=not_saved|reason=memory_reserve\r\n");
    return false;
  }
  auto *encoder = static_cast<tdefl_compressor *>(psram(sizeof(tdefl_compressor)));
  auto *output = static_cast<uint8_t *>(psram(COMPRESSED_MAX));
  auto *packet = static_cast<uint8_t *>(psram(STCS_ATLAS_BUDGET));
  const char *temp = "/v7cache/board.atlas.tmp";
  if (!encoder || !output || !packet) {
    free(encoder); free(output); free(packet);
    printf("STCS_ATLAS|state=not_saved|reason=memory_reserve\r\n");
    return false;
  }
  const uint32_t started = millis();
  uint16_t count = 0;
  size_t packet_bytes = HEADER_BYTES;
  memcpy(packet, MAGIC, 8);
  memcpy(packet + 10, binding, 64);
  memcpy(packet + 74, signature, 64);
  bool ok = true;
  for (size_t i = 0; ok && i < board.count; i++) {
    const auto &image = board.pictograms[i];
    bool duplicate = false;
    for (size_t j = 0; j < i; j++)
      duplicate = duplicate || strcmp(image.image_hash, board.pictograms[j].image_hash) == 0;
    if (duplicate) continue;
    size_t in = PIXELS, out = COMPRESSED_MAX;
    auto init = tdefl_init(encoder, nullptr, nullptr, TDEFL_DEFAULT_MAX_PROBES | TDEFL_WRITE_ZLIB_HEADER);
    auto status = init == TDEFL_STATUS_OKAY ?
        tdefl_compress(encoder, image.image_data, &in, output, &out, TDEFL_FINISH) : TDEFL_STATUS_BAD_PARAM;
    uint32_t bytes = out;
    ok = status == TDEFL_STATUS_DONE && in == PIXELS && bytes && bytes <= COMPRESSED_MAX &&
        packet_bytes + 69 + bytes <= STCS_ATLAS_BUDGET;
    if (ok) {
      memcpy(packet + packet_bytes, image.image_hash, 65);
      memcpy(packet + packet_bytes + 65, &bytes, 4);
      memcpy(packet + packet_bytes + 69, output, bytes);
      packet_bytes += 69 + bytes;
      count++;
    }
    vTaskDelay(pdMS_TO_TICKS(1));
  }
  free(encoder);
  if (!ok) {
    free(packet); free(output);
    printf("STCS_ATLAS|state=not_saved|reason=compressed_budget\r\n");
    return false; // Do not evict useful cache files for an atlas that cannot fit.
  }
  memcpy(packet + 8, &count, 2);
  LittleFS.remove(temp);
  ok = STCS_CacheRoom(packet_bytes, STCS_ATLAS_PATH);
  if (!ok) {
    // Two ARASAAC snapshots may exceed the total cache quota. The complete
    // replacement is already bounded in PSRAM; evict the old cache snapshot
    // only as a last resort. Metadata and the durable event queue are never
    // candidates. A power cut here can require image downloads after reboot.
    printf("STCS_ATLAS|state=replacing_cache|bytes=%u\r\n",
           (unsigned)packet_bytes);
    ok = STCS_CacheRoom(packet_bytes, "");
  }
  File file;
  if (ok) {
    file = LittleFS.open(temp, FILE_WRITE);
    ok = file && file.write(packet, packet_bytes) == packet_bytes;
    file.flush(); file.close();
  }
  free(packet);
  // Validate every decoded image before publishing the new snapshot. If cache
  // eviction was necessary, a failure is recovered by downloading again; the
  // durable board metadata and pending events remain untouched.
  if (ok) {
    ok = open_reader(temp, binding);
    for (size_t i = 0; ok && i < board.count; i++)
      ok = STCS_AtlasRead(board.pictograms[i].image_hash, output);
    STCS_AtlasClose();
  }
  free(output);
  // The completed file is validated before publishing its name. Cache eviction
  // above is deliberately recoverable, unlike board metadata or pending events.
  if (ok) ok = LittleFS.rename(temp, STCS_ATLAS_PATH);
  if (!ok) LittleFS.remove(temp);
  else STCS_CacheTouch(STCS_ATLAS_PATH);
  printf("STCS_ATLAS|state=%s|images=%u|bytes=%u|duration_ms=%u\r\n",
         ok ? "saved" : "not_saved", count, (unsigned)packet_bytes, (unsigned)(millis() - started));
  return ok;
}
