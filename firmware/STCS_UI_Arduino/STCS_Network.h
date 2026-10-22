#pragma once

#include "STCS_BoardConfig.h"

void STCS_Network_Init(void);
void STCS_Network_Loop(void);
bool STCS_Network_TakeBoardConfig(StcsBoardConfig *config);
void STCS_Network_QueueEvent(const char *event_type,
                             const char *pictogram_id,
                             const char *pictogram_label,
                             const char *category,
                             const char *message);
