#include "Audio_PCM5101.h"
#include "STCS_AudioStorage.h"
#include <freertos/queue.h>
Audio audio;
uint8_t Volume = Volume_MAX;
namespace {
struct AudioCommand {
  char path[80];
  bool stop;
};
QueueHandle_t commands = nullptr;
volatile bool running = false, failed = false;
void audio_task(void *) {
  AudioCommand command = {};
  while (true) {
    if (xQueueReceive(commands, &command, 0) == pdTRUE) {
      audio.stopSong();
      failed = false;
      if (command.stop) {
        running = false;
        STCS_CachePin(nullptr);
      } else {
        STCS_CachePin(command.path);
        running = audio.connecttoFS(STCS_AudioFS(), command.path);
        failed = !running;
      }
    }
    audio.loop();
    running = audio.isRunning();
    if (!running)
      STCS_CachePin(nullptr);
    vTaskDelay(pdMS_TO_TICKS(2));
  }
}
} // namespace
bool STCS_AudioPlay(const char *path) {
  AudioCommand command = {};
  strlcpy(command.path, path, sizeof(command.path));
  failed = false;
  if (!commands || xQueueSend(commands, &command, 0) != pdTRUE)
    return false;
  running = true;
  return true;
}
void STCS_AudioStop() {
  AudioCommand command = {};
  command.stop = true;
  if (commands)
    xQueueSend(commands, &command, 0);
  running = false;
}
bool STCS_AudioRunning() { return running; }
bool STCS_AudioFailed() { return failed; }

void audio_info(const char *info) { printf("AUDIO_INFO|%s\r\n", info); }

void audio_eof_mp3(const char *info) { printf("AUDIO_EOF|%s\r\n", info); }

void IRAM_ATTR example_increase_audio_tick(void *arg) { audio.loop(); }
void Audio_Init() {
  // Audio
  audio.setPinout(I2S_BCLK, I2S_LRC, I2S_DOUT);
  audio.setVolume(Volume); // 0...21

  // Decoding must not run on the small shared ESP timer stack or concurrently
  // with UI commands.
  commands = xQueueCreate(8, sizeof(AudioCommand));
  xTaskCreatePinnedToCore(audio_task, "STCS Audio", 16384, nullptr, 2, nullptr,
                          1);
}

void Volume_adjustment(uint8_t Volume) {
  if (Volume > Volume_MAX)
    printf("Audio : The volume value is incorrect. Please enter 0 to 21\r\n");
  else
    audio.setVolume(Volume); // 0...21
}

void Play_Music_test() {
  // SD Card
  if (SD_MMC.exists("/A.mp3")) {
    printf("File 'A.mp3' found in root directory.\r\n");
  } else {
    printf("File 'A.mp3' not found in root directory.\r\n");
  }
  bool ret = audio.connecttoFS(SD_MMC, "/A.mp3");
  if (ret)
    printf("Music Read OK\r\n");
  else
    printf("Music Read Failed\r\n");
}

void Play_Music(const char *directory, const char *fileName) {
  // SD Card
  if (!File_Search(directory, fileName)) {
    printf("%s file not found.\r\n", fileName);
  }
  const int maxPathLength = 100;
  char filePath[maxPathLength];
  if (strcmp(directory, "/") == 0) {
    snprintf(filePath, maxPathLength, "%s%s", directory, fileName);
  } else {
    snprintf(filePath, maxPathLength, "%s/%s", directory, fileName);
  }
  // printf("%s AAAAAAAA.\r\n",filePath);
  audio.pauseResume();
  bool ret = audio.connecttoFS(SD_MMC, (char *)filePath);
  if (ret)
    printf("Music Read OK\r\n");
  else
    printf("Music Read Failed\r\n");
  Music_pause();
  Music_resume();
  Music_pause();
  vTaskDelay(pdMS_TO_TICKS(100));
}
void Music_pause() {
  if (audio.isRunning()) {
    audio.pauseResume();
    printf("The music pause\r\n");
  }
}
void Music_resume() {
  if (!audio.isRunning()) {
    audio.pauseResume();
    printf("The music begins\r\n");
  }
}

uint32_t Music_Duration() {
  uint32_t Audio_duration = audio.getAudioFileDuration();
  // Audio_duration = 360;
  if (Audio_duration > 60)
    printf("Audio duration is %d minutes and %d seconds\r\n",
           Audio_duration / 60, Audio_duration % 60);
  else {
    if (Audio_duration != 0)
      printf("Audio duration is %d seconds\r\n", Audio_duration);
    else
      printf("Fail : Failed to obtain the audio duration.\r\n");
  }
  vTaskDelay(pdMS_TO_TICKS(10));
  return Audio_duration;
}
uint32_t Music_Elapsed() {
  uint32_t Audio_elapsed = audio.getAudioCurrentTime();
  return Audio_elapsed;
}
uint16_t Music_Energy() {
  uint16_t Audio_Energy = audio.getVUlevel();
  return Audio_Energy;
}

void Audio_Loop() {
  if (!audio.isRunning())
    Play_Music_test();
}
