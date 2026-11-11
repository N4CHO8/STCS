#include "STCS_UI.h"

#include "Audio_PCM5101.h"
#include "STCS_AudioStorage.h"
#include "STCS_Network.h"
#include "STCS_Pictograms.h"

#include <Arduino.h>
#include <lvgl.h>
#include <stdint.h>
#include <stdio.h>
#include <string.h>

namespace {

struct Pictogram {
  const char *id;
  const char *name;
  const char *message;
  uint32_t color;
  const char *audio_path;
  const lv_img_dsc_t *image;
  const lv_img_dsc_t *phrase_image;
};

struct Category {
  const char *name;
  uint32_t color;
  const lv_img_dsc_t *image;
  Pictogram pictograms[STCS_ITEMS_PER_CATEGORY];
  uint8_t count;
};

Category categories[] = {
    {"Necesidades",
     0xE8C547,
     &stcs_img_cat_needs,
     {{"caa00000-0000-4000-8000-000000000001", "Agua", "Quiero agua", 0x4AA3DF, "/agua.wav", &stcs_img_water, &stcs_mini_water},
      {"caa00000-0000-4000-8000-000000000002", "Comida", "Quiero comida", 0xF2B134, "/comida.wav", &stcs_img_food, &stcs_mini_food},
      {"caa00000-0000-4000-8000-000000000003", "Bano", "Necesito ir al bano", 0x78C091, "/bano.wav", &stcs_img_bathroom_need, &stcs_mini_bathroom_need},
      {"caa00000-0000-4000-8000-000000000004", "Ayuda", "Necesito ayuda", 0xE56B6F, "/ayuda.wav", &stcs_img_help, &stcs_mini_help}},
     4},
    {"Emociones",
     0xE88D67,
     &stcs_img_cat_emotions,
     {{"caa00000-0000-4000-8000-000000000005", "Feliz", "Estoy feliz", 0xF2C14E, "/feliz.wav", &stcs_img_happy, &stcs_mini_happy},
      {"caa00000-0000-4000-8000-000000000006", "Triste", "Estoy triste", 0x6D8CC7, "/triste.wav", &stcs_img_sad, &stcs_mini_sad},
      {"caa00000-0000-4000-8000-000000000007", "Enojado", "Estoy enojado", 0xD95D5D, "/enojado.wav", &stcs_img_angry, &stcs_mini_angry},
      {"caa00000-0000-4000-8000-000000000008", "Cansado", "Estoy cansado", 0x9B8AC4, "/cansado.wav", &stcs_img_tired, &stcs_mini_tired}},
     4},
    {"Acciones",
     0x5EA8A7,
     &stcs_img_cat_actions,
     {{"caa00000-0000-4000-8000-000000000009", "Jugar", "Quiero jugar", 0x58B368, "/jugar.wav", &stcs_img_play, &stcs_mini_play},
      {"caa00000-0000-4000-8000-000000000010", "Comer", "Quiero comer", 0xF2A65A, "/comer.wav", &stcs_img_eat, &stcs_mini_eat},
      {"caa00000-0000-4000-8000-000000000011", "Dormir", "Quiero dormir", 0x7B82C9, "/dormir.wav", &stcs_img_sleep, &stcs_mini_sleep},
      {"caa00000-0000-4000-8000-000000000012", "Ir", "Quiero ir", 0x4AA3A2, "/ir.wav", &stcs_img_go, &stcs_mini_go}},
     4},
    {"Lugares",
     0x6D8CC7,
     &stcs_img_cat_places,
     {{"caa00000-0000-4000-8000-000000000013", "Casa", "Quiero ir a casa", 0xD9895B, "/casa.wav", &stcs_img_home, &stcs_mini_home},
      {"caa00000-0000-4000-8000-000000000014", "Escuela", "Quiero ir a la escuela", 0x5B8FD9, "/escuela.wav", &stcs_img_school, &stcs_mini_school},
      {"caa00000-0000-4000-8000-000000000015", "Bano", "Quiero ir al bano", 0x55B8A3, "/bano.wav", &stcs_img_bathroom_place, &stcs_mini_bathroom_place},
      {"caa00000-0000-4000-8000-000000000016", "Parque", "Quiero ir al parque", 0x68A357, "/parque.wav", &stcs_img_park, &stcs_mini_park}},
     4},
};

constexpr uint8_t CATEGORY_COUNT = sizeof(categories) / sizeof(categories[0]);
constexpr uint8_t MAX_PHRASE_ITEMS = 6;
constexpr lv_coord_t PHRASE_PANEL_X = 54;
constexpr lv_coord_t PHRASE_PANEL_WIDTH = 304;
constexpr lv_coord_t PHRASE_PANEL_HEIGHT = 66;

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
char phrase[160] = "";
uint8_t phrase_item_count = 0;
Pictogram *phrase_items[MAX_PHRASE_ITEMS] = {};
StcsBoardConfig active_board_config = {};

bool playback_active = false;
bool clip_pending = false;
bool clip_started = false;
uint8_t playback_index = 0;
uint32_t clip_requested_at = 0;
uint32_t next_clip_at = 0;

lv_color_t color(uint32_t value) {
  return lv_color_hex(value);
}

struct PictogramAsset {
  const char *image_path;
  const char *audio_path;
  const lv_img_dsc_t *image;
  const lv_img_dsc_t *phrase_image;
};

const PictogramAsset pictogram_assets[] = {
    {"/pictograms/water.png", "/agua.wav", &stcs_img_water, &stcs_mini_water},
    {"/pictograms/food.png", "/comida.wav", &stcs_img_food, &stcs_mini_food},
    {"/pictograms/bathroom-need.png", "/bano.wav", &stcs_img_bathroom_need, &stcs_mini_bathroom_need},
    {"/pictograms/help.png", "/ayuda.wav", &stcs_img_help, &stcs_mini_help},
    {"/pictograms/happy.png", "/feliz.wav", &stcs_img_happy, &stcs_mini_happy},
    {"/pictograms/sad.png", "/triste.wav", &stcs_img_sad, &stcs_mini_sad},
    {"/pictograms/angry.png", "/enojado.wav", &stcs_img_angry, &stcs_mini_angry},
    {"/pictograms/tired.png", "/cansado.wav", &stcs_img_tired, &stcs_mini_tired},
    {"/pictograms/play.png", "/jugar.wav", &stcs_img_play, &stcs_mini_play},
    {"/pictograms/eat.png", "/comer.wav", &stcs_img_eat, &stcs_mini_eat},
    {"/pictograms/sleep.png", "/dormir.wav", &stcs_img_sleep, &stcs_mini_sleep},
    {"/pictograms/go.png", "/ir.wav", &stcs_img_go, &stcs_mini_go},
    {"/pictograms/home.png", "/casa.wav", &stcs_img_home, &stcs_mini_home},
    {"/pictograms/school.png", "/escuela.wav", &stcs_img_school, &stcs_mini_school},
    {"/pictograms/bathroom-place.png", "/bano.wav", &stcs_img_bathroom_place, &stcs_mini_bathroom_place},
    {"/pictograms/park.png", "/parque.wav", &stcs_img_park, &stcs_mini_park},
    {"/pictograms/pain.png", "/dolor.wav", &stcs_img_pain, &stcs_mini_pain},
    {"/pictograms/fear.png", "/miedo.wav", &stcs_img_fear, &stcs_mini_fear},
    {"/pictograms/talk.png", "/hablar.wav", &stcs_img_talk, &stcs_mini_talk},
    {"/pictograms/hospital.png", "/hospital.wav", &stcs_img_hospital, &stcs_mini_hospital},
};

const PictogramAsset *find_asset(const char *image_path) {
  for (const PictogramAsset &asset : pictogram_assets) {
    if (strcmp(asset.image_path, image_path) == 0) {
      return &asset;
    }
  }
  return nullptr;
}

Category *find_category(const char *name) {
  for (uint8_t index = 0; index < CATEGORY_COUNT; index++) {
    if (strcmp(categories[index].name, name) == 0) {
      return &categories[index];
    }
  }
  return nullptr;
}

uint32_t pictogram_color(const char *tone) {
  if (strcmp(tone, "amber") == 0) return 0xF2B134;
  if (strcmp(tone, "blue") == 0) return 0x6D8CC7;
  if (strcmp(tone, "cyan") == 0) return 0x55B8A3;
  if (strcmp(tone, "emerald") == 0) return 0x58B368;
  if (strcmp(tone, "indigo") == 0) return 0x7B82C9;
  if (strcmp(tone, "orange") == 0) return 0xF2A65A;
  if (strcmp(tone, "rose") == 0) return 0xE56B6F;
  if (strcmp(tone, "sky") == 0) return 0x4AA3DF;
  if (strcmp(tone, "violet") == 0) return 0x9B8AC4;
  if (strcmp(tone, "yellow") == 0) return 0xF2C14E;
  return 0x68A357;
}

void configure_screen() {
  lv_obj_t *screen = lv_scr_act();
  lv_obj_clean(screen);
  lv_obj_clear_flag(screen, LV_OBJ_FLAG_SCROLLABLE);
  lv_obj_set_style_bg_color(screen, color(COLOR_BACKGROUND), LV_PART_MAIN);
  lv_obj_set_style_bg_opa(screen, LV_OPA_COVER, LV_PART_MAIN);
  lv_obj_set_style_text_color(screen, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_text_font(screen, &lv_font_montserrat_14, LV_PART_MAIN);
}

lv_obj_t *create_label(lv_obj_t *parent, const char *text, const lv_font_t *font) {
  lv_obj_t *label = lv_label_create(parent);
  lv_label_set_text(label, text);
  lv_obj_set_style_text_font(label, font, LV_PART_MAIN);
  lv_obj_set_style_text_color(label, color(COLOR_INK), LV_PART_MAIN);
  return label;
}

lv_obj_t *create_button(lv_obj_t *parent,
                        const char *text,
                        lv_coord_t x,
                        lv_coord_t y,
                        lv_coord_t width,
                        lv_coord_t height,
                        uint32_t background,
                        lv_event_cb_t callback,
                        void *user_data) {
  lv_obj_t *button = lv_btn_create(parent);
  lv_obj_set_pos(button, x, y);
  lv_obj_set_size(button, width, height);
  lv_obj_clear_flag(button, LV_OBJ_FLAG_SCROLLABLE);
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
  lv_obj_set_style_text_font(label, &lv_font_montserrat_14, LV_PART_MAIN);
  lv_obj_center(label);

  lv_obj_add_event_cb(button, callback, LV_EVENT_CLICKED, user_data);
  return button;
}

lv_obj_t *create_symbol_button(lv_obj_t *parent,
                               const char *text,
                               const lv_img_dsc_t *image_source,
                               lv_coord_t x,
                               lv_coord_t y,
                               lv_coord_t width,
                               lv_coord_t height,
                               uint32_t accent,
                               lv_event_cb_t callback,
                               void *user_data) {
  lv_obj_t *button = lv_btn_create(parent);
  lv_obj_set_pos(button, x, y);
  lv_obj_set_size(button, width, height);
  lv_obj_clear_flag(button, LV_OBJ_FLAG_SCROLLABLE);
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
  lv_obj_align(image, LV_ALIGN_TOP_MID, 0, 2);

  lv_obj_t *label = lv_label_create(button);
  lv_label_set_text(label, text);
  lv_label_set_long_mode(label, LV_LABEL_LONG_DOT);
  lv_obj_set_width(label, width - 8);
  lv_obj_set_style_text_align(label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_set_style_text_color(label, color(COLOR_INK), LV_PART_MAIN);
  lv_obj_set_style_text_font(label, &lv_font_montserrat_14, LV_PART_MAIN);
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
    lv_obj_t *caption = create_label(phrase_panel, "Mi mensaje", &lv_font_montserrat_12);
    lv_obj_set_style_text_color(caption, color(COLOR_MUTED), LV_PART_MAIN);
    lv_obj_align(caption, LV_ALIGN_TOP_MID, 0, 6);

    phrase_label = create_label(phrase_panel, "Toca una imagen para comenzar", &lv_font_montserrat_14);
    lv_obj_set_width(phrase_label, PHRASE_PANEL_WIDTH - 24);
    lv_obj_set_style_text_align(phrase_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    lv_obj_align(phrase_label, LV_ALIGN_BOTTOM_MID, 0, -9);
  } else {
    const lv_coord_t image_size = 30;
    const lv_coord_t gap = 6;
    const lv_coord_t total_width = phrase_item_count * image_size + (phrase_item_count - 1) * gap;
    const lv_coord_t start_x = (PHRASE_PANEL_WIDTH - total_width) / 2;

    for (uint8_t index = 0; index < phrase_item_count; index++) {
      lv_obj_t *image = lv_img_create(phrase_panel);
      lv_img_set_src(image, phrase_items[index]->phrase_image);
      lv_obj_set_pos(image, start_x + index * (image_size + gap), 1);
    }

    phrase_label = create_label(phrase_panel, "", &lv_font_montserrat_12);
    lv_label_set_text(phrase_label, phrase);
    lv_label_set_long_mode(phrase_label, LV_LABEL_LONG_DOT);
    lv_obj_set_width(phrase_label, PHRASE_PANEL_WIDTH - 24);
    lv_obj_set_style_text_align(phrase_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
    lv_obj_align(phrase_label, LV_ALIGN_BOTTOM_MID, 0, -1);
  }
}

void create_phrase_panel(lv_coord_t y) {
  phrase_panel = lv_obj_create(lv_scr_act());
  lv_obj_set_pos(phrase_panel, PHRASE_PANEL_X, y);
  lv_obj_set_size(phrase_panel, PHRASE_PANEL_WIDTH, PHRASE_PANEL_HEIGHT);
  lv_obj_clear_flag(phrase_panel, LV_OBJ_FLAG_SCROLLABLE);
  lv_obj_set_style_radius(phrase_panel, 12, LV_PART_MAIN);
  lv_obj_set_style_bg_color(phrase_panel, color(COLOR_SURFACE), LV_PART_MAIN);
  lv_obj_set_style_border_width(phrase_panel, 2, LV_PART_MAIN);
  lv_obj_set_style_border_color(phrase_panel, color(COLOR_BORDER), LV_PART_MAIN);
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
  const size_t required = strlen(phrase) + strlen(separator) + strlen(pictogram->name) + 1;
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
  if (playback_active || audio.isRunning()) {
    audio.stopSong();
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
  next_clip_at = 0;

  if (playback_index >= phrase_item_count) {
    playback_active = false;
    set_status("Frase reproducida");
    printf("DEVICE_EVENT|type=audio_completed|items=%u\r\n", phrase_item_count);
    return;
  }

  Pictogram *pictogram = phrase_items[playback_index];
  if (!STCS_AudioFileExists(pictogram->audio_path)) {
    char message[64];
    snprintf(message, sizeof(message), "Falta audio: %s", pictogram->name);
    set_status(message);
    printf("DEVICE_EVENT|type=audio_missing|pictogram=%s|path=%s\r\n",
           pictogram->name,
           pictogram->audio_path);
    playback_index++;
    schedule_next_clip(200);
    return;
  }

  audio.stopSong();
  if (!audio.connecttoFS(STCS_AudioFS(), pictogram->audio_path)) {
    char message[64];
    snprintf(message, sizeof(message), "No se pudo abrir: %s", pictogram->name);
    set_status(message);
    printf("DEVICE_EVENT|type=audio_error|pictogram=%s|path=%s\r\n",
           pictogram->name,
           pictogram->audio_path);
    playback_index++;
    schedule_next_clip(200);
    return;
  }

  char message[64];
  snprintf(message, sizeof(message), "Reproduciendo: %s", pictogram->name);
  set_status(message);
  clip_pending = true;
  clip_started = false;
  clip_requested_at = millis();
  printf("DEVICE_EVENT|type=audio_started|pictogram=%s|path=%s|position=%u\r\n",
         pictogram->name,
         pictogram->audio_path,
         playback_index + 1);
}

void show_home();
void show_category(Category *category);

void show_home_async(void *) {
  show_home();
}

void show_category_async(void *user_data) {
  show_category(static_cast<Category *>(user_data));
}

void category_event(lv_event_t *event) {
  Category *category = static_cast<Category *>(lv_event_get_user_data(event));
  active_category = category;
  printf("DEVICE_EVENT|type=category_opened|category=%s\r\n", category->name);
  STCS_Network_QueueEvent("category_opened", nullptr, nullptr, category->name, nullptr);
  lv_async_call(show_category_async, category);
}

void pictogram_event(lv_event_t *event) {
  Pictogram *pictogram = static_cast<Pictogram *>(lv_event_get_user_data(event));
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

  printf("DEVICE_EVENT|type=pictogram_selected|category=%s|pictogram=%s|phrase_count=%u\r\n",
         active_category->name,
         pictogram->name,
         phrase_item_count);
  if(!STCS_Network_QueueEvent("pictogram_selected",
                          pictogram->id,
                          pictogram->name,
                          active_category->name,
                          pictogram->message))set_status("Sin guardar: revisa conexion");
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
  STCS_Network_QueueEvent("phrase_cleared", nullptr, nullptr, active_category->name, nullptr);
  lv_async_call(show_category_async, active_category);
}

void play_event(lv_event_t *) {
  if (phrase_item_count == 0) {
    set_status("Selecciona pictogramas");
    printf("DEVICE_EVENT|type=audio_empty_phrase\r\n");
    return;
  }

  stop_playback();
  playback_active = true;
  playback_index = 0;
  printf("DEVICE_EVENT|type=audio_requested|items=%u\r\n", phrase_item_count);
  STCS_Network_QueueEvent("audio_requested", nullptr, nullptr,
                          active_category == nullptr ? "Sistema" : active_category->name,
                          phrase);
  play_current_clip();
}

void create_play_controls(const char *initial_status) {
  status_label = create_label(lv_scr_act(), initial_status, &lv_font_montserrat_12);
  lv_obj_set_width(status_label, 260);
  lv_obj_set_style_text_align(status_label, LV_TEXT_ALIGN_CENTER, LV_PART_MAIN);
  lv_obj_set_style_text_color(status_label, color(COLOR_MUTED), LV_PART_MAIN);
  lv_obj_set_pos(status_label, 76, 337);

  create_button(lv_scr_act(),
                LV_SYMBOL_PLAY "  Hablar",
                140,
                354,
                132,
                42,
                COLOR_SPEAK,
                play_event,
                nullptr);
}

void show_home() {
  configure_screen();
  active_category = nullptr;
  phrase_label = nullptr;
  phrase_panel = nullptr;
  status_label = nullptr;

  lv_obj_t *title = create_label(lv_scr_act(), "Que quieres decir?", &lv_font_montserrat_16);
  lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 18);

  lv_obj_t *subtitle = create_label(lv_scr_act(), "Elige una categoria", &lv_font_montserrat_12);
  lv_obj_set_style_text_color(subtitle, color(COLOR_MUTED), LV_PART_MAIN);
  lv_obj_align(subtitle, LV_ALIGN_TOP_MID, 0, 46);

  const lv_coord_t positions[CATEGORY_COUNT][2] = {
      {56, 76}, {211, 76}, {56, 170}, {211, 170},
  };

  for (uint8_t index = 0; index < CATEGORY_COUNT; index++) {
    create_symbol_button(lv_scr_act(),
                         categories[index].name,
                         categories[index].image,
                         positions[index][0],
                         positions[index][1],
                         145,
                         86,
                         categories[index].color,
                         category_event,
                         &categories[index]);
  }

  create_phrase_panel(266);
  create_button(lv_scr_act(),
                LV_SYMBOL_PLAY "  Hablar",
                140,
                342,
                132,
                42,
                COLOR_SPEAK,
                play_event,
                nullptr);
}

void show_category(Category *category) {
  configure_screen();
  active_category = category;
  phrase_label = nullptr;
  phrase_panel = nullptr;
  status_label = nullptr;

  lv_obj_t *title = create_label(lv_scr_act(), category->name, &lv_font_montserrat_16);
  lv_obj_align(title, LV_ALIGN_TOP_MID, 0, 15);

  create_button(lv_scr_act(), LV_SYMBOL_LEFT "  Volver", 56, 43, 98, 42, 0xE2ECE8, back_event, nullptr);
  create_button(lv_scr_act(), LV_SYMBOL_TRASH "  Borrar", 258, 43, 98, 42, 0xF7D8D4, clear_event, nullptr);

  create_phrase_panel(91);

  const lv_coord_t positions[STCS_ITEMS_PER_PAGE][2] = {
      {60, 0}, {216, 0}, {60, 80}, {216, 80},
  };

  const uint8_t page_count = category->count == 0
                                 ? 1
                                 : (category->count + STCS_ITEMS_PER_PAGE - 1) /
                                       STCS_ITEMS_PER_PAGE;
  lv_obj_t *tileview = lv_tileview_create(lv_scr_act());
  lv_obj_set_pos(tileview, 0, 160);
  lv_obj_set_size(tileview, 412, 178);
  lv_obj_set_scrollbar_mode(tileview, LV_SCROLLBAR_MODE_OFF);
  lv_obj_set_style_bg_opa(tileview, LV_OPA_TRANSP, LV_PART_MAIN);
  lv_obj_set_style_border_width(tileview, 0, LV_PART_MAIN);
  lv_obj_set_style_pad_all(tileview, 0, LV_PART_MAIN);

  for (uint8_t page = 0; page < page_count; page++) {
    lv_dir_t allowed_direction = LV_DIR_NONE;
    if (page > 0) allowed_direction = static_cast<lv_dir_t>(allowed_direction | LV_DIR_LEFT);
    if (page + 1 < page_count) allowed_direction = static_cast<lv_dir_t>(allowed_direction | LV_DIR_RIGHT);

    lv_obj_t *tile = lv_tileview_add_tile(tileview, page, 0, allowed_direction);
    lv_obj_clear_flag(tile, LV_OBJ_FLAG_SCROLLABLE);
    lv_obj_set_style_bg_opa(tile, LV_OPA_TRANSP, LV_PART_MAIN);
    lv_obj_set_style_pad_all(tile, 0, LV_PART_MAIN);

    const uint8_t first_index = page * STCS_ITEMS_PER_PAGE;
    const uint8_t remaining = category->count - first_index;
    const uint8_t item_count = remaining < STCS_ITEMS_PER_PAGE
                                   ? remaining
                                   : STCS_ITEMS_PER_PAGE;

    for (uint8_t slot = 0; slot < item_count; slot++) {
      const uint8_t index = first_index + slot;
      create_symbol_button(tile,
                           category->pictograms[index].name,
                           category->pictograms[index].image,
                           positions[slot][0],
                           positions[slot][1],
                           136,
                           76,
                           category->pictograms[index].color,
                           pictogram_event,
                           &category->pictograms[index]);
    }

    char page_text[20] = "";
    if (page_count > 1) {
      snprintf(page_text,
               sizeof(page_text),
               "%s  %u / %u  %s",
               page > 0 ? "<" : " ",
               page + 1,
               page_count,
               page + 1 < page_count ? ">" : " ");
    }
    lv_obj_t *page_label = create_label(tile, page_text, &lv_font_montserrat_12);
    lv_obj_set_style_text_color(page_label, color(COLOR_MUTED), LV_PART_MAIN);
    lv_obj_align(page_label, LV_ALIGN_BOTTOM_MID, 0, -1);
  }

  create_play_controls(page_count > 1 ? "Desliza para ver mas" : "Toca un pictograma");
}

}  // namespace

void STCS_UI_Init(void) {
  stop_playback();
  phrase[0] = '\0';
  phrase_item_count = 0;
  show_home();
  printf("DEVICE_EVENT|type=ui_ready|screen=home\r\n");
}

void STCS_UI_ApplyBoardConfig(const StcsBoardConfig *config) {
  if (config == nullptr || config->count > STCS_MAX_PICTOGRAMS) {
    return;
  }

  stop_playback();
  phrase[0] = '\0';
  phrase_item_count = 0;
  active_board_config = *config;

  for (uint8_t category_index = 0; category_index < CATEGORY_COUNT; category_index++) {
    categories[category_index].count = 0;
  }

  for (uint8_t index = 0; index < active_board_config.count; index++) {
    StcsPictogramConfig &source = active_board_config.pictograms[index];
    Category *category = find_category(source.category);
    const PictogramAsset *asset = find_asset(source.image_path);
    if (category == nullptr || asset == nullptr ||
        category->count >= STCS_ITEMS_PER_CATEGORY) {
      continue;
    }

    Pictogram &target = category->pictograms[category->count++];
    target.id = source.id;
    target.name = source.label;
    target.message = source.message;
    target.color = pictogram_color(source.color_tone);
    target.audio_path = asset->audio_path;
    target.image = asset->image;
    target.phrase_image = asset->phrase_image;
  }

  show_home();
  printf("DEVICE_EVENT|type=board_synced|pictograms=%u\r\n", config->count);
  STCS_Network_QueueEvent("board_synced", nullptr, nullptr, "Sistema", nullptr);
}

void STCS_Audio_Loop(void) {
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
    if (audio.isRunning()) {
      clip_started = true;
    } else if (millis() - clip_requested_at > 1800) {
      Pictogram *pictogram = phrase_items[playback_index];
      printf("DEVICE_EVENT|type=audio_timeout|pictogram=%s\r\n", pictogram->name);
      playback_index++;
      schedule_next_clip(200);
    }
    return;
  }

  if (!audio.isRunning()) {
    playback_index++;
    schedule_next_clip(200);
  }
}
