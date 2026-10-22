#pragma once

#include <FS.h>

bool STCS_AudioStorage_Init();
bool STCS_AudioFileExists(const char *path);
fs::FS &STCS_AudioFS();
