#pragma once

#include <Arduino.h>

constexpr uint8_t STCS_CATEGORY_COUNT = 4;
constexpr uint8_t STCS_ITEMS_PER_PAGE = 4;
// Keep aligned with frontend/src/lib/pictogramCatalog.ts. Twelve pages does
// not mean 48 items: the tested operational limit is 45 per category.
constexpr uint8_t STCS_ITEMS_PER_CATEGORY = 45;
constexpr uint8_t STCS_MAX_PAGES_PER_CATEGORY =
    (STCS_ITEMS_PER_CATEGORY + STCS_ITEMS_PER_PAGE - 1) / STCS_ITEMS_PER_PAGE;
constexpr uint8_t STCS_MAX_PICTOGRAMS = STCS_CATEGORY_COUNT * STCS_ITEMS_PER_CATEGORY;

struct StcsPictogramConfig {
  char id[37];
  char label[32];
  char message[96];
  char category[20];
  char color_tone[16];
  char image_path[96];
  char image_hash[65];
  char audio_hash[65];
  char audio_path[80];
  uint32_t audio_bytes;
  uint8_t *image_data;
  bool audio_ready;
  uint8_t position;
};

struct StcsBoardConfig {
  StcsPictogramConfig pictograms[STCS_MAX_PICTOGRAMS];
  uint8_t count;
};
