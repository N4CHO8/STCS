#pragma once

#include <stddef.h>
#include <stdint.h>

#ifdef __cplusplus
extern "C" {
#endif

typedef struct {
  const char *path;
  const uint8_t *data;
  size_t size;
} STCS_EmbeddedAudio;

extern const STCS_EmbeddedAudio stcs_embedded_audio[];
extern const size_t stcs_embedded_audio_count;
extern const char stcs_embedded_audio_version[];

#ifdef __cplusplus
}
#endif
