#pragma once
bool STCS_UI_CanApplyBoard();

#include "STCS_BoardConfig.h"

void STCS_UI_Init(void);
void STCS_Audio_Loop(void);
void STCS_UI_ApplyBoardConfig(const StcsBoardConfig *config);
bool STCS_UI_CopyImage(const char *hash, uint8_t *target);
