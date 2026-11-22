#pragma once

#include <FS.h>

bool STCS_AudioStorage_Init();
bool STCS_AudioFileExists(const char *path);
fs::FS &STCS_AudioFS();
constexpr size_t STCS_CACHE_BUDGET = 512 * 1024;
constexpr size_t STCS_CACHE_MAX_FILES = 48;
// The bundled ARASAAC board compresses less than the original simple icons.
// This is a sublimit of the existing 512 KiB cache, not extra permanent storage.
// CacheRoom still reserves 256 KiB for metadata/events and can evict the atlas.
constexpr size_t STCS_ATLAS_BUDGET = 384 * 1024;
constexpr char STCS_ATLAS_PATH[] = "/v7cache/board.atlas";
bool STCS_CacheRoom(size_t incoming, const char *keep);
void STCS_CacheTouch(const char *path);
void STCS_CachePin(const char *path);
void STCS_CacheReport();
