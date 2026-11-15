#pragma once
#include "STCS_BoardConfig.h"

// Scoped, bounded, lossless image snapshot. Open/read/close are boot-only;
// save runs on the network task after a complete verified generation.
bool STCS_AtlasOpen(const char *binding);
bool STCS_AtlasRead(const char *hash, uint8_t *pixels);
void STCS_AtlasClose();
bool STCS_AtlasSave(const char *binding, const StcsBoardConfig &board);
