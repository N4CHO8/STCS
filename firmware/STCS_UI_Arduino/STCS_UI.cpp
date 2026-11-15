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
uint8_t missing_images = 0;
bool images_changed = false; // Protected by board_images_mutex.
bool board_reported_complete = false;
bool wifi_screen = false, wifi_password_visible = false;
lv_obj_t *wifi_status_label = nullptr;
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

  if (image_source) {
    lv_obj_t *image = lv_img_create(button);
    lv_img_set_src(image, image_source);
    // LVGL keeps the original object dimensions when zooming. Pivot at the
    // upper-left and position explicitly to avoid clipping and label overlap.
    uint16_t zoom = min((width - 12) * 256 / image_source->header.w,
                        (height - 30) * 256 / image_source->header.h);
    lv_img_set_pivot(image, 0, 0);
    lv_img_set_zoom(image, zoom);
    lv_obj_set_pos(image, (width - image_source->header.w * zoom / 256) / 2, 4);
  } else {
    // A missing cached image must not remove the communication item or borrow
    // an unrelated image. Keep its label and mark that image as still loading.
    lv_obj_t *loading = create_label(button, LV_SYMBOL_DOWNLOAD, &font16);
    lv_obj_align(loading, LV_ALIGN_TOP_MID, 0, 20);
    lv_obj_set_style_text_color(loading, color(COLOR_MUTED), LV_PART_MAIN);
  }

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
      if (!phrase_items[index]->phrase_image) {
        lv_obj_t *loading = create_label(phrase_panel, LV_SYMBOL_DOWNLOAD, &font12);
        lv_obj_set_pos(loading, start_x + index * (image_size + gap), 5);
        continue;
      }
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
void show_wifi();

void show_home_async(void *) { show_home(); }
void show_wifi_async(void *) { show_wifi(); }
void wifi_event(lv_event_t *) {
  wifi_password_visible = false;
  lv_async_call(show_wifi_async, nullptr);
}
void wifi_activate_event(lv_event_t *) { STCS_Network_RequestWifiSetup(); }
void wifi_password_event(lv_event_t *) {
  wifi_password_visible = !wifi_password_visible;
  lv_async_call(show_wifi_async, nullptr);
}

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
  if (!active_category)
    return;
  lv_dir_t direction = lv_indev_get_gesture_dir(lv_indev_get_act());
  if (direction != LV_DIR_LEFT && direction != LV_DIR_RIGHT)
    return;
  int pages = max(1, (active_category->count + STCS_ITEMS_PER_PAGE - 1) /
                         STCS_ITEMS_PER_PAGE);
  int next =
      static_cast<int>(current_page) + (direction == LV_DIR_LEFT ? 1 : -1);
  if (next >= 0 && next < pages) {
    lv_indev_wait_release(lv_indev_get_act());
    current_page = next;
    lv_async_call(show_category_async, active_category);
  }
}
void create_status(const char *text) {
  status_label = create_label(lv_scr_act(), text, &font12);
  lv_obj_set_width(status_label, 160);
  lv_label_set_long_mode(status_label, LV_LABEL_LONG_DOT);
  lv_obj_set_pos(status_label, 126, 380);
  lv_obj_set_style_text_align(status_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
}
void show_home() {
  configure_screen();
  wifi_screen = wifi_password_visible = false;
  wifi_status_label = nullptr;
  active_category = nullptr;
  phrase_label = nullptr;
  phrase_panel = nullptr;
  status_label = nullptr;
  create_button(lv_scr_act(), LV_SYMBOL_PLAY " Hablar", 100, 48, 146, 46,
                COLOR_SPEAK, play_event, nullptr);
  create_button(lv_scr_act(), LV_SYMBOL_WIFI " Wi-Fi", 254, 54, 82, 40,
                0xE2ECE8, wifi_event, nullptr);
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
  char progress[40];
  snprintf(progress, sizeof(progress), "Imágenes %u/%u",
           board_ready ? active_board_config->count - missing_images : 0,
           board_ready ? active_board_config->count : 0);
  create_status(!board_ready ? "Sincronizando tablero..." :
                missing_images ? progress : "");
}
void wifi_text(const char *text, lv_coord_t y, lv_coord_t width,
               const lv_font_t *font) {
  lv_obj_t *label = create_label(lv_scr_act(), text, font);
  lv_obj_set_width(label, width);
  lv_obj_set_style_text_align(label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_align(label, LV_ALIGN_TOP_MID, 0, y);
}
void show_wifi() {
  configure_screen();
  wifi_screen = true;
  active_category = nullptr;
  phrase_label = phrase_panel = status_label = nullptr;
  create_button(lv_scr_act(), "Volver", 64, 48, 82, 46, 0xE2ECE8, back_event, nullptr);
  create_button(lv_scr_act(), "Activar", 152, 48, 94, 46, COLOR_SPEAK, wifi_activate_event, nullptr);
  create_button(lv_scr_act(), wifi_password_visible ? "Ocultar" : "Ver clave",
                252, 48, 96, 46, 0xE2ECE8, wifi_password_event, nullptr);
  wifi_text("Configurar Wi-Fi", 108, 250, &font16);
  wifi_status_label = create_label(lv_scr_act(),
      STCS_Network_WifiSetupActive() ? "STCS-Config activa" : "Red de configuración inactiva", &font14);
  lv_obj_set_width(wifi_status_label, 280);
  lv_obj_set_style_text_align(wifi_status_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_align(wifi_status_label, LV_ALIGN_TOP_MID, 0, 142);
  wifi_text("1. Conecta tu celular a", 178, 270, &font14);
  wifi_text("STCS-Config", 204, 250, &font16);
  wifi_text("2. Abre 192.168.4.1", 238, 270, &font14);
  wifi_text("Usuario: stcs", 265, 250, &font14);
  char password[96] = "Clave oculta";
  if (wifi_password_visible)
    snprintf(password, sizeof(password), "Clave: %s", STCS_Network_WifiSetupPassword());
  wifi_text(password, 291, 270, &font12);
  wifi_text("Activa la red, elige tu Wi-Fi desde el celular y guarda.", 337, 240, &font12);
}
void show_category(Category *category) {
  configure_screen();
  wifi_screen = wifi_password_visible = false;
  wifi_status_label = nullptr;
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
  create_status(missing_images ? "Cargando imágenes..." : "Toca un pictograma");
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

  if (STCS_UI_HasBoardMetadata(config)) {
    // Media-only update: records/phrase pointers stay stable, including during
    // playback. Adopt only missing buffers; free duplicate incoming ownership.
    xSemaphoreTake(board_images_mutex, portMAX_DELAY);
    bool complete = true;
    for (size_t i = 0; i < config->count; i++) {
      auto &active = active_board_config->pictograms[i];
      if (!active.image_data && config->pictograms[i].image_data) {
        active.image_data = config->pictograms[i].image_data;
        images_changed = true;
      } else
        free(config->pictograms[i].image_data);
      complete = complete && active.image_data;
    }
    bool report = complete && !board_reported_complete;
    if (report)
      board_reported_complete = true;
    xSemaphoreGive(board_images_mutex);
    if (report)
      STCS_Network_QueueEvent("board_synced", nullptr, nullptr, "Sistema", nullptr);
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
  images_changed = false;

  for (uint8_t category_index = 0; category_index < CATEGORY_COUNT;
       category_index++) {
    categories[category_index].count = 0;
  }
  missing_images = 0;
  board_reported_complete = false;

  for (uint8_t index = 0; index < active_board_config->count; index++) {
    StcsPictogramConfig &source = active_board_config->pictograms[index];
    Category *category = find_category(source.category);
    if (category == nullptr ||
        category->count >= STCS_ITEMS_PER_CATEGORY) {
      continue;
    }

    Pictogram &target = category->pictograms[category->count++];
    target = {}; // Clear descriptors that belonged to the freed generation.
    if (!source.image_data)
      missing_images++;
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

  board_reported_complete = missing_images == 0;
  xSemaphoreGive(board_images_mutex);
  board_ready = true;
  // A completed download is not a navigation request. Category objects and
  // current_page remain stable; show_category clamps only if the board shrank.
  if (wifi_screen)
    show_wifi();
  else if (active_category)
    show_category(active_category);
  else
    show_home();
  printf("STCS_BOARD|pictograms=%u|images=%u|needs=%u|emotions=%u|actions=%u|places=%u\r\n",
         config->count, config->count - missing_images, categories[0].count,
         categories[1].count, categories[2].count, categories[3].count);
  printf("DEVICE_EVENT|type=board_applied|pictograms=%u\r\n", config->count);
  if (!missing_images)
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

bool STCS_UI_HasBoardMetadata(const StcsBoardConfig *config) {
  if (!board_ready || !config || !active_board_config ||
      xSemaphoreTake(board_images_mutex, pdMS_TO_TICKS(100)) != pdTRUE)
    return false;
  bool same = active_board_config->count == config->count;
  for (size_t i = 0; same && i < config->count; i++) {
    const auto &a = active_board_config->pictograms[i];
    const auto &b = config->pictograms[i];
    same = strcmp(a.id, b.id) == 0 && strcmp(a.label, b.label) == 0 &&
           strcmp(a.message, b.message) == 0 && strcmp(a.category, b.category) == 0 &&
           strcmp(a.color_tone, b.color_tone) == 0 &&
           strcmp(a.image_hash, b.image_hash) == 0 &&
           strcmp(a.audio_hash, b.audio_hash) == 0 &&
           a.audio_ready == b.audio_ready && a.audio_bytes == b.audio_bytes &&
           a.position == b.position;
  }
  xSemaphoreGive(board_images_mutex);
  return same;
}

// The active and incoming generations own separate allocations. Filling a
// previously empty image does not move records or invalidate selected phrases.
// No LVGL calls are allowed from this network-task entry point.
void STCS_UI_OfferImage(const char *hash, const uint8_t *pixels) {
  if (!pixels || !board_images_mutex || !active_board_config ||
      xSemaphoreTake(board_images_mutex, pdMS_TO_TICKS(100)) != pdTRUE)
    return;
  for (size_t i = 0; i < active_board_config->count; i++) {
    auto &p = active_board_config->pictograms[i];
    if (!p.image_data && strcmp(p.image_hash, hash) == 0) {
      auto *copy = static_cast<uint8_t *>(heap_caps_malloc(
          96 * 96 * 2, MALLOC_CAP_SPIRAM | MALLOC_CAP_8BIT));
      if (copy) {
        memcpy(copy, pixels, 96 * 96 * 2);
        p.image_data = copy;
        images_changed = true;
      }
      break;
    }
  }
  xSemaphoreGive(board_images_mutex);
}

// Runs only from loop(), after LVGL callbacks return. Preserve the category,
// page and phrase, and defer redraw while touching the screen or speaking.
void STCS_UI_RefreshImages() {
  // Configuration is a separate screen: media refresh must never send an adult
  // back to the communicator or reveal the setup password in logs/web data.
  if (wifi_screen && wifi_status_label) {
    static uint32_t last_wifi_status = 0;
    if (millis() - last_wifi_status > 1000) {
      last_wifi_status = millis();
      lv_label_set_text(wifi_status_label, STCS_Network_WifiSetupActive() ?
          "STCS-Config activa" : "Red de configuración inactiva");
    }
  }
  lv_indev_t *input = lv_indev_get_next(nullptr);
  // LVGL 8.3.10 exposes state in proc; the get_state accessor is a v9 API.
  if (playback_active || (input && input->proc.state == LV_INDEV_STATE_PRESSED) ||
      !board_images_mutex || !active_board_config ||
      xSemaphoreTake(board_images_mutex, pdMS_TO_TICKS(1)) != pdTRUE)
    return;
  if (!images_changed) {
    xSemaphoreGive(board_images_mutex);
    return;
  }
  const uint8_t previous_missing = missing_images;
  bool redraw = active_category == nullptr;
  missing_images = 0;
  for (size_t i = 0; i < active_board_config->count; i++) {
    auto &source = active_board_config->pictograms[i];
    if (!source.image_data) {
      missing_images++;
      continue;
    }
    Category *category = find_category(source.category);
    if (!category)
      continue;
    for (size_t j = 0; j < category->count; j++) {
      auto &target = category->pictograms[j];
      if (!target.image && strcmp(target.id, source.id) == 0) {
        auto &image = downloaded_images[i];
        image = {};
        image.header.cf = LV_IMG_CF_TRUE_COLOR;
        image.header.w = image.header.h = 96;
        image.data_size = 96 * 96 * 2;
        image.data = source.image_data;
        target.image = target.phrase_image = &image;
        redraw = redraw || category == active_category;
        for (size_t selected = 0; selected < phrase_item_count; selected++)
          redraw = redraw || phrase_items[selected] == &target;
        break;
      }
    }
  }
  images_changed = false;
  const unsigned total = active_board_config->count;
  xSemaphoreGive(board_images_mutex);
  if (!wifi_screen && (redraw || (previous_missing && !missing_images))) {
    if (active_category)
      show_category(active_category);
    else
      show_home();
  }
  printf("STCS_BOARD|state=images_updated|pictograms=%u|images=%u\r\n",
         total, total - missing_images);
}
