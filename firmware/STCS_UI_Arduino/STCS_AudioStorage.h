#pragma once

#include <FS.h>

bool STCS_AudioStorage_Init();
bool STCS_AudioFileExists(const char *path);
fs::FS &STCS_AudioFS();
constexpr size_t STCS_CACHE_BUDGET = 512 * 1024;
constexpr size_t STCS_CACHE_MAX_FILES = 48;
bool STCS_CacheRoom(size_t incoming, const char *keep);
void STCS_CacheTouch(const char *path);
void STCS_CachePin(const char *path);
void STCS_CacheReport();
