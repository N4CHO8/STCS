# ADR 03 Imágenes voz y caché del ESP

Estado: implementada, evaluación retrospectiva. H3-RF03/H3-RF04/H3-RF08/H3-RF11; H3-RNF02/H3-RNF04.

Alternativas: catálogo/audio embebidos; descarga sin caché; medios privados persistentes, síntesis Piper en nube y caché acotada. Puntajes 1–5 de juicio técnico.

| Criterio | Peso | Embebido | Descarga sin caché | Nube + caché acotada |
| --- | --- | --- | --- | --- |
| Personalizar frase/imagen sin recompilar | 35% | 1 | 5 | 5 |
| Respuesta en uso/reinicio | 25% | 5 | 1 | 4 |
| Espacio controlado en hardware | 25% | 2 | 5 | 4 |
| Continuidad parcial sin servidor | 15% | 5 | 1 | 3 |
| Total | 100% | 2,85 | 3,40 | 4,20 |

La API normaliza imagen a RGB565 96×96, prepara frase/voz por hash y valida WAV. ESP verifica tamaño/hash y conserva imágenes activas en PSRAM. LittleFS mantiene metadatos, atlas compacto y caché limitada; no se guardan todos los WAV para sostener el máximo activo.

Evidencia: media.ts, media-store.ts, cloud-voice.ts, frontend/api/voice.py y STCS_Network.cpp. PR #5 implementa medios, #6 corrige HTTPS y #7 arranque/caché; el usuario confirmó imagen/voz/editado/reinicio.

Consecuencias: primera descarga y síntesis necesitan red, hay arranque en frío, almacenamiento/cuotas de terceros y revisión de licencias. Los 180 activos no son 180 voces offline ni máximo físico absoluto. Tablero actual 96; atlas de hasta 192 KiB dentro de caché total 512 KiB. Zona táctil inferior defectuosa sigue siendo limitación física.
