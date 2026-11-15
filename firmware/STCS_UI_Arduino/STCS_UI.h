#pragma once
bool STCS_UI_CanApplyBoard();

#include "STCS_BoardConfig.h"

void STCS_UI_Init(void);
void STCS_Audio_Loop(void);
void STCS_UI_ApplyBoardConfig(const StcsBoardConfig *config);
bool STCS_UI_CopyImage(const char *hash, uint8_t *target);
// Offer copies pixels under the board mutex; only Refresh touches LVGL.
void STCS_UI_OfferImage(const char *hash, const uint8_t *pixels);
void STCS_UI_RefreshImages();
bool STCS_UI_HasBoardMetadata(const StcsBoardConfig *config);
