#ifndef LV_CONF_H
#define LV_CONF_H
// Reproducible LVGL 8.3 configuration: all fonts used by STCS and the vendor
// drivers.
#include <stdint.h>
#define LV_COLOR_DEPTH 16
#define LV_COLOR_16_SWAP 0
#define LV_MEM_CUSTOM 1
#define LV_MEM_CUSTOM_INCLUDE <stdlib.h>
#define LV_MEM_CUSTOM_ALLOC malloc
#define LV_MEM_CUSTOM_FREE free
#define LV_MEM_CUSTOM_REALLOC realloc
#define LV_FONT_MONTSERRAT_12 1
#define LV_FONT_MONTSERRAT_14 1
#define LV_FONT_MONTSERRAT_16 1
#define LV_FONT_MONTSERRAT_18 1
// The retained Waveshare music driver references demo assets, even though STCS
// has its own UI.
#define LV_USE_DEMO_MUSIC 1
#define LV_DEMO_MUSIC_SQUARE 0
#define LV_DEMO_MUSIC_LANDSCAPE 0
#define LV_DEMO_MUSIC_ROUND 0
#define LV_DEMO_MUSIC_LARGE 0
#define LV_DEMO_MUSIC_AUTO_PLAY 0
#endif
