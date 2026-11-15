#include "STCS_UI.h"

#include "Audio_PCM5101.h"
#include "STCS_AudioStorage.h"
#include "STCS_Network.h"
#include "STCS_Pictograms.h"

#include <Arduino.h>
#include <esp_heap_caps.h>
#include <freertos/semphr.h>
#include <lvgl.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

LV_FONT_DECLARE(stcs_font_es_12);
LV_FONT_DECLARE(stcs_font_es_14);
LV_FONT_DECLARE(stcs_font_es_16);

namespace {
lv_font_t font12, font14,
    font16; // Preserve symbols; fall back to Spanish Latin-1 glyphs.

struct Pictogram {
  const char *id;
  const char *name;
  const char *message;
  uint32_t color;
  const char *audio_path;
  const lv_img_dsc_t *image;
  const lv_img_dsc_t *phrase_image;
  const char *audio_hash;
  uint32_t audio_bytes;
};

struct Category {
  const char *name;
  uint32_t color;
  const lv_img_dsc_t *image;
  Pictogram pictograms[STCS_ITEMS_PER_CATEGORY];
  uint8_t count;
};

Category categories[] = {
    {"Necesidades", 0xE8C547, &stcs_img_cat_needs, {}, 0},
    {"Emociones", 0xE88D67, &stcs_img_cat_emotions, {}, 0},
    {"Acciones", 0x5EA8A7, &stcs_img_cat_actions, {}, 0},
    {"Lugares", 0x6D8CC7, &stcs_img_cat_places, {}, 0},
};

constexpr uint8_t CATEGORY_COUNT = sizeof(categories) / sizeof(categories[0]);
constexpr uint8_t MAX_PHRASE_ITEMS = 6;
constexpr lv_coord_t PHRASE_PANEL_X = 82;
constexpr lv_coord_t PHRASE_PANEL_WIDTH = 248;
constexpr lv_coord_t PHRASE_PANEL_HEIGHT = 64;

constexpr uint32_t COLOR_BACKGROUND = 0xF4F7F6;
constexpr uint32_t COLOR_SURFACE = 0xFFFFFF;
constexpr uint32_t COLOR_INK = 0x17332D;
constexpr uint32_t COLOR_MUTED = 0x526B63;
constexpr uint32_t COLOR_BORDER = 0xB9CBC5;
constexpr uint32_t COLOR_PRESSED = 0xE3F0EB;
constexpr uint32_t COLOR_SPEAK = 0x72C6A7;

lv_obj_t *phrase_label = nullptr;
lv_obj_t *phrase_panel = nullptr;
lv_obj_t *status_label = nullptr;
Category *active_category = nullptr;
uint8_t current_page = 0;
char phrase[160] = "";
uint8_t phrase_item_count = 0;
Pictogram *phrase_items[MAX_PHRASE_ITEMS] = {};
StcsBoardConfig *active_board_config = nullptr;
SemaphoreHandle_t board_images_mutex = nullptr;
lv_img_dsc_t downloaded_images[STCS_MAX_PICTOGRAMS] = {};
bool board_ready = false;
uint32_t waiting_audio_since = 0;

bool playback_active = false;
bool clip_pending = false;
bool clip_started = false;
uint8_t playback_index = 0;
uint32_t clip_requested_at = 0;
uint32_t next_clip_at = 0;

lv_color_t color(uint32_t value) { return lv_color_hex(value); }

Category *find_category(const char *name) {
  for (uint8_t index = 0; index < CATEGORY_COUNT; index++) {
    if (strcmp(categories[index].name, name) == 0) {
      return &categories[index];
    }
  }
  return nullptr;
}

uint32_t pictogram_color(const char *tone) {
  if (strcmp(tone, "amber") == 0)
    return 0xF2B134;
  if (strcmp(tone, "blue") == 0)
    return 0x6D8CC7;
  if (strcmp(tone, "cyan") == 0)
    return 0x55B8A3;
  if (strcmp(tone, "emerald") == 0)
    return 0x58B368;
  if (strcmp(tone, "indigo") == 0)
    return 0x7B82C9;
  if (strcmp(tone, "orange") == 0)
    return 0xF2A65A;
  if (strcmp(tone, "rose") == 0)
    return 0xE56B6F;
  if (strcmp(tone, "sky") == 0)
    return 0x4AA3DF;
  if (strcmp(tone, "violet") == 0)
    return 0x9B8AC4;
  if (strcmp(tone, "yellow") == 0)
    return 0xF2C14E;
  return 0x68A357;
}

void swipe_event(lv_event_t *event);

void configure_screen() {
  lv_obj_t *screen = lv_scr_act();
  lv_obj_clean(screen);
  lv_obj_remove_event_cb(screen, swipe_event);
  lv_obj_clear_flag(screen, LV_OBJ_FLAG_SCROLLABLE);
  lv_obj_set_style_bg_color(screen, color(COLOR_BACKGROUND), LV_PART_MAIN);
  lv_obj_set_style_bg_opa(screen, LV_OPA_COVER, LV_PART_MAIN);
  lv_obj_set_style_text_color(screen, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_text_font(screen, &font14, LV_PART_MAIN);
}

lv_obj_t *create_label(lv_obj_t *parent, const char *text,
                       const lv_font_t *font) {
  lv_obj_t *label = lv_label_create(parent);
  lv_label_set_text(label, text);
  lv_obj_set_style_text_font(label, font, LV_PART_MAIN);
  lv_obj_set_style_text_color(label, color(COLOR_INK), LV_PART_MAIN);
  return label;
}

lv_obj_t *create_button(lv_obj_t *parent, const char *text, lv_coord_t x,
                        lv_coord_t y, lv_coord_t width, lv_coord_t height,
                        uint32_t background, lv_event_cb_t callback,
                        void *user_data) {
  lv_obj_t *button = lv_btn_create(parent);
  lv_obj_set_pos(button, x, y);
  lv_obj_set_size(button, width, height);
  lv_obj_clear_flag(button, LV_OBJ_FLAG_SCROLLABLE);
  lv_obj_set_style_pad_all(button, 0, LV_PART_MAIN);
  lv_obj_set_style_radius(button, 12, LV_PART_MAIN);
  lv_obj_set_style_bg_color(button, color(background), LV_PART_MAIN);
  lv_obj_set_style_bg_opa(button, LV_OPA_COVER, LV_PART_MAIN);
  lv_obj_set_style_border_width(button, 2, LV_PART_MAIN);
  lv_obj_set_style_border_color(button, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_shadow_width(button, 0, LV_PART_MAIN);
  lv_obj_set_style_bg_color(button, color(COLOR_PRESSED), LV_STATE_PRESSED);

  lv_obj_t *label = lv_label_create(button);
  lv_label_set_text(label, text);
  lv_label_set_long_mode(label, LV_LABEL_LONG_WRAP);
  lv_obj_set_width(label, width - 12);
  lv_obj_set_style_text_align(label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_set_style_text_color(label, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_text_font(label, &font14, LV_PART_MAIN);
  lv_obj_center(label);

  lv_obj_add_event_cb(button, callback, LV_EVENT_CLICKED, user_data);
  return button;
}

lv_obj_t *create_symbol_button(lv_obj_t *parent, const char *text,
                               const lv_img_dsc_t *image_source, lv_coord_t x,
                               lv_coord_t y, lv_coord_t width,
                               lv_coord_t height, uint32_t accent,
                               lv_event_cb_t callback, void *user_data) {
  lv_obj_t *button = lv_btn_create(parent);
  lv_obj_set_pos(button, x, y);
  lv_obj_set_size(button, width, height);
  lv_obj_clear_flag(button, LV_OBJ_FLAG_SCROLLABLE);
  lv_obj_set_style_pad_all(button, 0, LV_PART_MAIN);
  lv_obj_set_style_radius(button, 12, LV_PART_MAIN);
  lv_obj_set_style_bg_color(button, color(COLOR_SURFACE), LV_PART_MAIN);
  lv_obj_set_style_bg_opa(button, LV_OPA_COVER, LV_PART_MAIN);
  lv_obj_set_style_border_width(button, 2, LV_PART_MAIN);
  lv_obj_set_style_border_color(button, color(accent), LV_PART_MAIN);
  lv_obj_set_style_shadow_width(button, 0, LV_PART_MAIN);
  lv_obj_set_style_bg_color(button, color(COLOR_PRESSED), LV_STATE_PRESSED);
  lv_obj_set_style_outline_width(button, 3, LV_STATE_PRESSED);
  lv_obj_set_style_outline_color(button, color(accent), LV_STATE_PRESSED);
  lv_obj_set_style_outline_pad(button, 1, LV_STATE_PRESSED);

  lv_obj_t *image = lv_img_create(button);
  lv_img_set_src(image, image_source);
  // Zoom around the upper-left pivot: LVGL keeps the original object
  // dimensions. Explicit pixel coordinates avoid clipping/overlap when a 96px
  // asset is scaled.
  uint16_t zoom = min((width - 12) * 256 / image_source->header.w,
                      (height - 30) * 256 / image_source->header.h);
  lv_img_set_pivot(image, 0, 0);
  lv_img_set_zoom(image, zoom);
  lv_obj_set_pos(image, (width - image_source->header.w * zoom / 256) / 2, 4);

  lv_obj_t *label = lv_label_create(button);
  lv_label_set_text(label, text);
  lv_label_set_long_mode(label, LV_LABEL_LONG_DOT);
  lv_obj_set_width(label, width - 8);
  lv_obj_set_style_text_align(label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_set_style_text_color(label, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_text_font(label, &font14, LV_PART_MAIN);
  lv_obj_align(label, LV_ALIGN_BOTTOM_MID, 0, -3);

  lv_obj_add_event_cb(button, callback, LV_EVENT_CLICKED, user_data);
  return button;
}

void update_phrase_label() {
  if (phrase_panel == nullptr) {
    return;
  }

  lv_obj_clean(phrase_panel);
  phrase_label = nullptr;

  if (phrase_item_count == 0) {
    lv_obj_t *caption = create_label(phrase_panel, "Mi mensaje", &font12);
    lv_obj_set_style_text_color(caption, color(COLOR_MUTED), LV_PART_MAIN);
    lv_obj_align(caption, LV_ALIGN_TOP_MID, 0, 6);

    phrase_label =
        create_label(phrase_panel, "Toca una imagen para comenzar", &font14);
    lv_obj_set_width(phrase_label, PHRASE_PANEL_WIDTH - 24);
    lv_obj_set_style_text_align(phrase_label, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN);
    lv_obj_align(phrase_label, LV_ALIGN_BOTTOM_MID, 0, -9);
  } else {
    const lv_coord_t image_size = 30;
    const lv_coord_t gap = 6;
    const lv_coord_t total_width =
        phrase_item_count * image_size + (phrase_item_count - 1) * gap;
    const lv_coord_t start_x = (PHRASE_PANEL_WIDTH - total_width) / 2;

    for (uint8_t index = 0; index < phrase_item_count; index++) {
      lv_obj_t *image = lv_img_create(phrase_panel);
      lv_img_set_src(image, phrase_items[index]->phrase_image);
      lv_img_set_pivot(image, 0, 0);
      if (phrase_items[index]->phrase_image->header.w > 30)
        lv_img_set_zoom(image,
                        256 * 30 / phrase_items[index]->phrase_image->header.w);
      lv_obj_set_pos(image, start_x + index * (image_size + gap), 1);
    }

    phrase_label = create_label(phrase_panel, "", &font12);
    lv_label_set_text(phrase_label, phrase);
    lv_label_set_long_mode(phrase_label, LV_LABEL_LONG_DOT);
    lv_obj_set_width(phrase_label, PHRASE_PANEL_WIDTH - 24);
    lv_obj_set_style_text_align(phrase_label, LV_TEXT_ALIGN_CENTER,
                                LV_PART_MAIN);
    lv_obj_align(phrase_label, LV_ALIGN_BOTTOM_MID, 0, -1);
  }
}

void create_phrase_panel(lv_coord_t y) {
  phrase_panel = lv_obj_create(lv_scr_act());
  lv_obj_set_pos(phrase_panel, PHRASE_PANEL_X, y);
  lv_obj_set_size(phrase_panel, PHRASE_PANEL_WIDTH, PHRASE_PANEL_HEIGHT);
  lv_obj_clear_flag(phrase_panel,
                    LV_OBJ_FLAG_SCROLLABLE | LV_OBJ_FLAG_CLICKABLE);
  lv_obj_set_style_radius(phrase_panel, 12, LV_PART_MAIN);
  lv_obj_set_style_bg_color(phrase_panel, color(COLOR_SURFACE), LV_PART_MAIN);
  lv_obj_set_style_border_width(phrase_panel, 2, LV_PART_MAIN);
  lv_obj_set_style_border_color(phrase_panel, color(COLOR_BORDER),
                                LV_PART_MAIN);
  lv_obj_set_style_pad_all(phrase_panel, 0, LV_PART_MAIN);
  update_phrase_label();
}

void set_status(const char *message) {
  if (status_label != nullptr) {
    lv_label_set_text(status_label, message);
  }
}

bool append_to_phrase(Pictogram *pictogram) {
  if (phrase_item_count >= MAX_PHRASE_ITEMS) {
    return false;
  }

  const char *separator = phrase_item_count == 0 ? "" : " + ";
  const size_t required =
      strlen(phrase) + strlen(separator) + strlen(pictogram->name) + 1;
  if (required > sizeof(phrase)) {
    return false;
  }

  strcat(phrase, separator);
  strcat(phrase, pictogram->name);
  phrase_items[phrase_item_count] = pictogram;
  phrase_item_count++;
  return true;
}

void stop_playback() {
  waiting_audio_since = 0;
  if (playback_active || STCS_AudioRunning()) {
    STCS_AudioStop();
  }

  playback_active = false;
  clip_pending = false;
  clip_started = false;
  playback_index = 0;
  next_clip_at = 0;
}

void schedule_next_clip(uint32_t delay_ms) {
  clip_pending = false;
  clip_started = false;
  next_clip_at = millis() + delay_ms;
}

void play_current_clip() {
  if (!board_ready) {
    playback_active = false;
    set_status("Conecta para sincronizar el tablero.");
    return;
  }
  next_clip_at = 0;

  if (playback_index >= phrase_item_count) {
    playback_active = false;
    set_status("Frase reproducida");
    printf("DEVICE_EVENT|type=audio_completed|items=%u\r\n", phrase_item_count);
    return;
  }

  Pictogram *pictogram = phrase_items[playback_index];
  if (!pictogram->audio_hash || !pictogram->audio_hash[0]) {
    playback_active = false;
    set_status("Voz sin preparar. Revisa el tablero.");
    return;
  }
  if (!STCS_AudioFileExists(pictogram->audio_path)) {
    if (!waiting_audio_since) {
      if (!STCS_Network_RequestAudio(pictogram->id, pictogram->audio_hash,
                                     pictogram->audio_bytes)) {
        playback_active = false;
        set_status("Sin conexion: voz no disponible.");
        return;
      }
      waiting_audio_since = millis();
      set_status("Descargando voz...");
    }
    if (millis() - waiting_audio_since > 12000) {
      playback_active = false;
      waiting_audio_since = 0;
      set_status("No se pudo descargar. Reintenta.");
      return;
    }
    next_clip_at = millis() + 100;
    return;
  }
  waiting_audio_since = 0;

  STCS_AudioStop();
  if (!STCS_AudioPlay(pictogram->audio_path)) {
    char message[64];
    snprintf(message, sizeof(message), "No se pudo abrir: %s", pictogram->name);
    set_status(message);
    printf("DEVICE_EVENT|type=audio_error|pictogram=%s|path=%s\r\n",
           pictogram->name, pictogram->audio_path);
    playback_active = false;
    return;
  }

  char message[64];
  snprintf(message, sizeof(message), "Reproduciendo: %s", pictogram->name);
  set_status(message);
  clip_pending = true;
  clip_started = false;
  clip_requested_at = millis();
  printf("DEVICE_EVENT|type=audio_started|pictogram=%s|path=%s|position=%u\r\n",
         pictogram->name, pictogram->audio_path, playback_index + 1);
}

void show_home();
void show_category(Category *category);

void show_home_async(void *) { show_home(); }

void show_category_async(void *user_data) {
  show_category(static_cast<Category *>(user_data));
}

void category_event(lv_event_t *event) {
  Category *category = static_cast<Category *>(lv_event_get_user_data(event));
  active_category = category;
  current_page = 0;
  printf("DEVICE_EVENT|type=category_opened|category=%s\r\n", category->name);
  STCS_Network_QueueEvent("category_opened", nullptr, nullptr, category->name,
                          nullptr);
  lv_async_call(show_category_async, category);
}

void pictogram_event(lv_event_t *event) {
  if (!board_ready) {
    set_status("Conecta para sincronizar el tablero.");
    return;
  }
  Pictogram *pictogram =
      static_cast<Pictogram *>(lv_event_get_user_data(event));
  lv_obj_t *button = lv_event_get_target(event);

  if (!append_to_phrase(pictogram)) {
    set_status("Maximo 6 pictogramas");
    return;
  }

  lv_obj_set_style_bg_color(button, color(COLOR_PRESSED), LV_PART_MAIN);
  lv_obj_set_style_border_color(button, color(0x2B7A5F), LV_PART_MAIN);
  update_phrase_label();

  char message[64];
  snprintf(message, sizeof(message), "Seleccionado: %s", pictogram->name);
  set_status(message);

  printf("DEVICE_EVENT|type=pictogram_selected|category=%s|pictogram=%s|phrase_"
         "count=%u\r\n",
         active_category->name, pictogram->name, phrase_item_count);
  if (!STCS_Network_QueueEvent("pictogram_selected", pictogram->id,
                               pictogram->name, active_category->name,
                               pictogram->message))
    set_status("Sin guardar: revisa conexion");
}

void back_event(lv_event_t *) {
  printf("DEVICE_EVENT|type=navigation|destination=home\r\n");
  STCS_Network_QueueEvent("navigation", nullptr, nullptr, "Inicio", nullptr);
  lv_async_call(show_home_async, nullptr);
}

void clear_event(lv_event_t *) {
  stop_playback();
  phrase[0] = '\0';
  phrase_item_count = 0;
  printf("DEVICE_EVENT|type=phrase_cleared\r\n");
  STCS_Network_QueueEvent("phrase_cleared", nullptr, nullptr,
                          active_category ? active_category->name : "Inicio",
                          nullptr);
  if (active_category)
    lv_async_call(show_category_async, active_category);
  else
    lv_async_call(show_home_async, nullptr);
}

void play_event(lv_event_t *) {
  if (!board_ready) {
    set_status("Conecta para sincronizar el tablero.");
    return;
  }
  if (phrase_item_count == 0) {
    set_status("Selecciona pictogramas");
    printf("DEVICE_EVENT|type=audio_empty_phrase\r\n");
    return;
  }

  stop_playback();
  playback_active = true;
  playback_index = 0;
  printf("DEVICE_EVENT|type=audio_requested|items=%u\r\n", phrase_item_count);
  STCS_Network_QueueEvent(
      "audio_requested", nullptr, nullptr,
      active_category == nullptr ? "Sistema" : active_category->name, phrase);
  play_current_clip();
}

// One page of LVGL objects regardless of board size. Selected items point into
// the stable active board; changing pages never clears the phrase.
void page_event(lv_event_t *event) {
  if (!active_category)
    return;
  int delta = static_cast<int>(
      reinterpret_cast<intptr_t>(lv_event_get_user_data(event)));
  int pages = max(1, (active_category->count + STCS_ITEMS_PER_PAGE - 1) /
                         STCS_ITEMS_PER_PAGE);
  int next = static_cast<int>(current_page) + delta;
  if (next < 0 || next >= pages)
    return;
  current_page = next;
  lv_async_call(show_category_async, active_category);
}
void swipe_event(lv_event_t *event) {
  lv_dir_t direction = lv_indev_get_gesture_dir(lv_indev_get_act());
  if (direction != LV_DIR_LEFT && direction != LV_DIR_RIGHT)
    return;
  int pages = max(1, (active_category->count + STCS_ITEMS_PER_PAGE - 1) /
                         STCS_ITEMS_PER_PAGE);
  int next =
      static_cast<int>(current_page) + (direction == LV_DIR_LEFT ? 1 : -1);
  if (next >= 0 && next < pages) {
    current_page = next;
    lv_async_call(show_category_async, active_category);
  }
}
void create_status(const char *text) {
  status_label = create_label(lv_scr_act(), text, &font12);
  lv_obj_set_width(status_label, 220);
  lv_obj_set_pos(status_label, 96, 380);
  lv_obj_set_style_text_align(status_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
}
void show_home() {
  configure_screen();
  active_category = nullptr;
  phrase_label = nullptr;
  phrase_panel = nullptr;
  status_label = nullptr;
  create_button(lv_scr_act(), LV_SYMBOL_PLAY " Hablar", 142, 48, 128, 46,
                COLOR_SPEAK, play_event, nullptr);
  lv_obj_t *subtitle =
      create_label(lv_scr_act(), "Elige una categoría", &font12);
  lv_obj_align(subtitle, LV_ALIGN_TOP_MID, 0, 100);
  const lv_coord_t positions[4][2] = {
      {70, 120}, {216, 120}, {70, 214}, {216, 214}};
  for (uint8_t i = 0; i < CATEGORY_COUNT; i++)
    create_symbol_button(lv_scr_act(), categories[i].name, categories[i].image,
                         positions[i][0], positions[i][1], 126, 90,
                         categories[i].color, category_event, &categories[i]);
  create_phrase_panel(310);
  create_status(board_ready ? "" : "Sincronizando tablero...");
}
void show_category(Category *category) {
  configure_screen();
  active_category = category;
  phrase_label = nullptr;
  phrase_panel = nullptr;
  status_label = nullptr;
  create_button(lv_scr_act(), "Volver", 64, 48, 80, 46, 0xE2ECE8, back_event,
                nullptr);
  create_button(lv_scr_act(), LV_SYMBOL_PLAY " Hablar", 150, 48, 112, 46,
                COLOR_SPEAK, play_event, nullptr);
  create_button(lv_scr_act(), "Borrar", 268, 48, 80, 46, 0xF7D8D4, clear_event,
                nullptr);
  uint8_t pages =
      max(1, (category->count + STCS_ITEMS_PER_PAGE - 1) / STCS_ITEMS_PER_PAGE);
  if (current_page >= pages)
    current_page = pages - 1;
  char title[64];
  snprintf(title, sizeof(title), "%s · %u/%u", category->name, current_page + 1,
           pages);
  lv_obj_t *heading = create_label(lv_scr_act(), title, &font12);
  lv_obj_align(heading, LV_ALIGN_TOP_MID, 0, 100);
  const lv_coord_t positions[4][2] = {
      {70, 120}, {216, 120}, {70, 214}, {216, 214}};
  uint16_t first = current_page * STCS_ITEMS_PER_PAGE;
  for (uint8_t slot = 0;
       slot < STCS_ITEMS_PER_PAGE && first + slot < category->count; slot++) {
    Pictogram &p = category->pictograms[first + slot];
    lv_obj_t *button = create_symbol_button(
        lv_scr_act(), p.name, p.image, positions[slot][0], positions[slot][1],
        126, 90, p.color, pictogram_event, &p);
    lv_obj_add_flag(button, LV_OBJ_FLAG_GESTURE_BUBBLE);
  }
  if (current_page > 0)
    create_button(lv_scr_act(), LV_SYMBOL_LEFT, 12, 176, 44, 60, 0xE2ECE8,
                  page_event, reinterpret_cast<void *>(-1));
  if (current_page + 1 < pages)
    create_button(lv_scr_act(), LV_SYMBOL_RIGHT, 356, 176, 44, 60, 0xE2ECE8,
                  page_event, reinterpret_cast<void *>(1));
  lv_obj_add_event_cb(lv_scr_act(), swipe_event, LV_EVENT_GESTURE, nullptr);
  create_phrase_panel(310);
  create_status("Toca un pictograma");
  printf("STCS_PAGE|page=%u|pages=%u|items=%u|heap=%u|psram=%u\r\n",
         current_page + 1, pages, category->count, (unsigned)ESP.getFreeHeap(),
         (unsigned)ESP.getFreePsram());
}

} // namespace

void STCS_UI_Init(void) {
  board_images_mutex = xSemaphoreCreateMutex();
  active_board_config = static_cast<StcsBoardConfig *>(heap_caps_calloc(
      1, sizeof(StcsBoardConfig), MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
  font12 = lv_font_montserrat_12;
  font12.fallback = &stcs_font_es_12;
  font14 = lv_font_montserrat_14;
  font14.fallback = &stcs_font_es_14;
  font16 = lv_font_montserrat_16;
  font16.fallback = &stcs_font_es_16;
  stop_playback();
  phrase[0] = '\0';
  phrase_item_count = 0;
  show_home();
  printf("DEVICE_EVENT|type=ui_ready|screen=home\r\n");
}

void STCS_UI_ApplyBoardConfig(const StcsBoardConfig *config) {
  if (!active_board_config || config == nullptr ||
      config->count > STCS_MAX_PICTOGRAMS) {
    return;
  }

  stop_playback();
  lv_obj_clean(lv_scr_act());
  status_label = nullptr;
  // LVGL objects must release their descriptors before old PSRAM pixels are
  // freed.
  xSemaphoreTake(board_images_mutex, portMAX_DELAY);
  for (size_t i = 0; i < active_board_config->count; i++)
    free(active_board_config->pictograms[i].image_data);
  phrase[0] = '\0';
  phrase_item_count = 0;
  *active_board_config = *config;
  xSemaphoreGive(board_images_mutex);

  for (uint8_t category_index = 0; category_index < CATEGORY_COUNT;
       category_index++) {
    categories[category_index].count = 0;
  }

  for (uint8_t index = 0; index < active_board_config->count; index++) {
    StcsPictogramConfig &source = active_board_config->pictograms[index];
    Category *category = find_category(source.category);
    if (category == nullptr || !source.image_data ||
        category->count >= STCS_ITEMS_PER_CATEGORY) {
      continue;
    }

    Pictogram &target = category->pictograms[category->count++];
    target.id = source.id;
    target.name = source.label;
    target.message = source.message;
    target.color = pictogram_color(source.color_tone);
    target.audio_path = source.audio_path;
    target.audio_hash = source.audio_ready ? source.audio_hash : "";
    target.audio_bytes = source.audio_bytes;
    if (source.image_data) {
      auto &image = downloaded_images[index];
      image = {};
      image.header.cf = LV_IMG_CF_TRUE_COLOR;
      image.header.w = 96;
      image.header.h = 96;
      image.data_size = 96 * 96 * 2;
      image.data = source.image_data;
      target.image = &image;
      target.phrase_image = &image;
    }
  }

  board_ready = true;
  show_home();
  printf("DEVICE_EVENT|type=board_synced|pictograms=%u\r\n", config->count);
  STCS_Network_QueueEvent("board_synced", nullptr, nullptr, "Sistema", nullptr);
}

void STCS_Audio_Loop(void) {
  if (playback_active && clip_pending && STCS_AudioFailed()) {
    playback_active = false;
    clip_pending = false;
    set_status("Error al reproducir. Reintenta.");
    return;
  }
  if (!playback_active) {
    return;
  }

  if (next_clip_at != 0) {
    if (static_cast<int32_t>(millis() - next_clip_at) >= 0) {
      play_current_clip();
    }
    return;
  }

  if (!clip_pending) {
    return;
  }

  if (!clip_started) {
    if (STCS_AudioRunning()) {
      clip_started = true;
    } else if (millis() - clip_requested_at > 1800) {
      Pictogram *pictogram = phrase_items[playback_index];
      printf("DEVICE_EVENT|type=audio_timeout|pictogram=%s\r\n",
             pictogram->name);
      playback_active = false;
      clip_pending = false;
      set_status("No se pudo reproducir. Reintenta.");
    }
    return;
  }

  if (!STCS_AudioRunning()) {
    playback_index++;
    schedule_next_clip(200);
  }
}

bool STCS_UI_CanApplyBoard() {
  return !playback_active && phrase_item_count == 0;
}

// Copy unchanged pixels into the incoming generation. Never share ownership:
// the UI can release its old board safely after this short, mutex-protected
// copy.
bool STCS_UI_CopyImage(const char *hash, uint8_t *target) {
  if (!board_images_mutex || !active_board_config || !target ||
      xSemaphoreTake(board_images_mutex, pdMS_TO_TICKS(100)) != pdTRUE)
    return false;
  bool copied = false;
  for (size_t i = 0; i < active_board_config->count; i++) {
    const auto &p = active_board_config->pictograms[i];
    if (p.image_data && strcmp(hash, p.image_hash) == 0) {
      memcpy(target, p.image_data, 96 * 96 * 2);
      copied = true;
      break;
    }
  }
  xSemaphoreGive(board_images_mutex);
  return copied;
}
