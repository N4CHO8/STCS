#include "STCS_AudioStorage.h"

#include "STCS_AudioAssets.h"

#include <Arduino.h>
#include <SPIFFS.h>
#include <string.h>

namespace {

bool storage_ready = false;
constexpr const char *VERSION_PATH = "/.audio_version";

bool asset_is_current(const STCS_EmbeddedAudio &asset) {
  File file = SPIFFS.open(asset.path, FILE_READ);
  if (!file) {
    return false;
  }

  const bool current = file.size() == asset.size;
  file.close();
  return current;
}

bool install_asset(const STCS_EmbeddedAudio &asset) {
  SPIFFS.remove(asset.path);
  File file = SPIFFS.open(asset.path, FILE_WRITE);
  if (!file) {
    printf("DEVICE_EVENT|type=audio_install_error|path=%s|reason=open\r\n", asset.path);
    return false;
  }

  constexpr size_t CHUNK_SIZE = 4096;
  size_t offset = 0;
  while (offset < asset.size) {
    const size_t remaining = asset.size - offset;
    const size_t chunk_size = remaining < CHUNK_SIZE ? remaining : CHUNK_SIZE;
    const size_t written = file.write(asset.data + offset, chunk_size);
    if (written != chunk_size) {
      file.close();
      SPIFFS.remove(asset.path);
      printf("DEVICE_EVENT|type=audio_install_error|path=%s|reason=write\r\n", asset.path);
      return false;
    }
    offset += written;
  }

  file.close();
  printf("DEVICE_EVENT|type=audio_installed|path=%s|bytes=%u\r\n",
         asset.path,
         static_cast<unsigned>(asset.size));
  return true;
}

bool installed_version_matches() {
  File file = SPIFFS.open(VERSION_PATH, FILE_READ);
  if (!file) {
    return false;
  }

  const String installed_version = file.readString();
  file.close();
  return installed_version == stcs_embedded_audio_version;
}

bool save_installed_version() {
  SPIFFS.remove(VERSION_PATH);
  File file = SPIFFS.open(VERSION_PATH, FILE_WRITE);
  if (!file) {
    return false;
  }

  const size_t expected = strlen(stcs_embedded_audio_version);
  const size_t written = file.print(stcs_embedded_audio_version);
  file.close();
  return written == expected;
}

}  // namespace

bool STCS_AudioStorage_Init() {
  if (!SPIFFS.begin(true)) {
    printf("DEVICE_EVENT|type=audio_storage_error|reason=mount\r\n");
    return false;
  }

  const bool reinstall_all = !installed_version_matches();
  for (size_t index = 0; index < stcs_embedded_audio_count; index++) {
    const STCS_EmbeddedAudio &asset = stcs_embedded_audio[index];
    if ((reinstall_all || !asset_is_current(asset)) && !install_asset(asset)) {
      return false;
    }
  }

  if (reinstall_all && !save_installed_version()) {
    printf("DEVICE_EVENT|type=audio_storage_error|reason=version\r\n");
    return false;
  }

  storage_ready = true;
  printf("DEVICE_EVENT|type=audio_storage_ready|source=flash|files=%u\r\n",
         static_cast<unsigned>(stcs_embedded_audio_count));
  return true;
}

bool STCS_AudioFileExists(const char *path) {
  return storage_ready && SPIFFS.exists(path);
}

fs::FS &STCS_AudioFS() {
  return SPIFFS;
}
