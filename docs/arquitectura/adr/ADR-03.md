# ADR 03 Imágenes voz y caché del ESP

Estado: implementada; justificación retrospectiva registrada el 16/11 y revisada el 17/11. Escala de encaje 1–5, no benchmark; [método](../README.md).

## Contexto

H3-RF03 necesita imagen/frase propias sin recompilar; H3-RF04 operación táctil y H3-RF08/11 memoria acotada. La comparación considera personalización y continuidad parcial.

## Alternativas y matriz ponderada

| Criterio | Peso | Embebido | Descarga sin caché | Nube + caché acotada |
| --- | --- | --- | --- | --- |
| Personalizar frase/imagen sin recompilar | 35% | 1 | 5 | 5 |
| Respuesta en uso/reinicio | 25% | 5 | 1 | 4 |
| Espacio controlado en hardware | 25% | 2 | 5 | 4 |
| Continuidad parcial sin servidor | 15% | 5 | 1 | 3 |
| Total | 100% | 2,85 | 3,40 | 4,20 |

## Fundamento de los puntajes

| Criterio y peso | Dato o prueba de concepto existente | Supuesto/límite de la comparación |
| --- | --- | --- |
| Personalización, 35%: 1 / 5 / 5 | [media.ts](../../../frontend/src/lib/server/media.ts), [función Piper](../../../frontend/api/voice.py), PF-01 y edición de frase confirmada por el autor | Un catálogo fijo embebido exige regenerar recursos para cambios arbitrarios (1); ambas alternativas descargables admiten actualizar (5) |
| Respuesta/reinicio, 25%: 5 / 1 / 4 | El arranque con atlas recuperó el tablero de 96 imágenes, con [registro y límites](../../historico/ARRANQUE_RAPIDO_ESP_20261115.md); operación conectada confirmada | Embebido no descarga al arrancar (5); sin caché depende de descargar de nuevo (1); la opción elegida conserva coste de primera descarga/frío (4). No se cronometraron tres implementaciones equivalentes |
| Espacio acotado, 25%: 2 / 5 / 4 | [STCS_AudioStorage.h](../../../firmware/STCS_UI_Arduino/STCS_AudioStorage.h) fija caché 512 KiB y atlas 384 KiB; [red](../../../firmware/STCS_UI_Arduino/STCS_Network.cpp) valida tamaños/hash | Medios embebidos crecen con recursos fijos (2); sin caché no conserva archivos (5); caché acotada usa espacio y expulsión (4). Los puntajes no son porcentajes de RAM libre |
| Continuidad parcial, 15%: 5 / 1 / 3 | Reinicio/imágenes conservadas conformes; [L-01](../../pruebas/FISICAS_20261115.md#l-01-voz-no-disponible-sin-wi-fi) registra que sin Wi-Fi no hubo voz | Embebido puede reproducir su repertorio fijo (5); descarga sin copia depende de red (1); caché solo cubre recursos presentes y no garantiza voz (3) |

## Decisión y consecuencias

Conservar Storage privado, Piper demandado y caché acotada. El ESP descarga RGB565/WAV, verifica tamaño/hash y no recibe el modelo de voz. Frase/versión identifican el audio y el lease controla la preparación. Caché: 512 KiB y atlas 384 KiB; PSRAM para recursos activos. Costes: red, latencia en frío, cuotas y licencias. Los 180 activos ensayados no son 180 voces offline; [L-01](../../pruebas/FISICAS_20261115.md#l-01-voz-no-disponible-sin-wi-fi) permanece.
