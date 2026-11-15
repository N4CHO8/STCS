#include "STCS_AudioStorage.h"
#include <Arduino.h>
#include <LittleFS.h>
#include <string.h>

namespace {
struct Entry {
  char path[96];
  uint32_t touched;
};
Entry entries[STCS_CACHE_MAX_FILES] = {};
char pinned[96] = "";
bool ready = false;
String full_name(File &file) {
  String path = file.name();
  return path.startsWith("/") ? path : String("/v7cache/") + path;
}
uint32_t touched(const char *path) {
  for (auto &entry : entries)
    if (strcmp(entry.path, path) == 0)
      return entry.touched;
  return 0;
}
} // namespace
bool STCS_AudioStorage_Init() {
  // Never auto-format: the installed partition also contains the preserved
  // older queue.
  ready = LittleFS.begin(false, "/stcs", 10, "stcsdata");
  if (!ready) {
    printf("STCS_CACHE|state=mount_error\r\n");
    return false;
  }
  LittleFS.mkdir("/v7cache");
  File dir = LittleFS.open("/v7cache");
  for (File f = dir.openNextFile(); f; f = dir.openNextFile()) {
    String path = full_name(f);
    if (path.endsWith(".tmp")) {
      f.close();
      LittleFS.remove(path);
    }
  }
  STCS_CacheReport();
  return true;
}
fs::FS &STCS_AudioFS() { return LittleFS; }
bool STCS_AudioFileExists(const char *path) {
  return ready && path && path[0] && LittleFS.exists(path);
}
void STCS_CacheTouch(const char *path) {
  Entry *slot = &entries[0];
  for (auto &entry : entries) {
    if (strcmp(entry.path, path) == 0) {
      entry.touched = millis();
      return;
    }
    if (!entry.path[0] || entry.touched < slot->touched)
      slot = &entry;
  }
  strlcpy(slot->path, path, sizeof(slot->path));
  slot->touched = millis();
}
void STCS_CachePin(const char *path) {
  strlcpy(pinned, path ? path : "", sizeof(pinned));
}
void STCS_CacheReport() {
  if (!ready)
    return;
  size_t bytes = 0, count = 0;
  File dir = LittleFS.open("/v7cache");
  for (File f = dir.openNextFile(); f; f = dir.openNextFile()) {
    if (!f.isDirectory()) {
      bytes += f.size();
      count++;
    }
  }
  printf("STCS_CACHE|bytes=%u|files=%u|budget=%u|free=%u\r\n", (unsigned)bytes,
         (unsigned)count, (unsigned)STCS_CACHE_BUDGET,
         (unsigned)(LittleFS.totalBytes() - LittleFS.usedBytes()));
}
bool STCS_CacheRoom(size_t incoming, const char *keep) {
  if (!ready || incoming > STCS_CACHE_BUDGET)
    return false;
  for (size_t pass = 0; pass <= STCS_CACHE_MAX_FILES; pass++) {
    size_t bytes = 0, count = 0;
    String oldest = "";
    uint32_t oldest_time = UINT32_MAX;
    File dir = LittleFS.open("/v7cache");
    for (File f = dir.openNextFile(); f; f = dir.openNextFile()) {
      if (f.isDirectory())
        continue;
      String path = full_name(f);
      bytes += f.size();
      count++;
      if (path == keep || path == pinned)
        continue;
      uint32_t use = touched(path.c_str());
      if (oldest == "" || use < oldest_time) {
        oldest = path;
        oldest_time = use;
      }
    }
    dir.close();
    const bool quota = bytes + incoming <= STCS_CACHE_BUDGET &&
                       count + 1 <= STCS_CACHE_MAX_FILES;
    // Reserve room for the metadata and the bounded durable event queue as
    // well.
    if (quota &&
        LittleFS.totalBytes() - LittleFS.usedBytes() >= incoming + 256 * 1024)
      return true;
    if (oldest == "" || !LittleFS.remove(oldest))
      return false;
  }
  return false;
}
