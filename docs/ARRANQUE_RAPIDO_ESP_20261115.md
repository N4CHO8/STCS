# Arranque rápido de imágenes — v0.8.4

Estado: v0.8.4 instalado; recuperación técnica medida y confirmación física
completada por el propietario, incluido reinicio con cargador. Complementa la
[corrección de categorías y refresco progresivo](ARREGLO_REINICIO_ESP_20261115.md).

## Medición y decisión

Se midieron los RGB565 reales de los 96 pictogramas del tablero publicado:
1.769.472 bytes. Una prueba de compresión por bloques en el computador dio una
estimación de 169.574 bytes con DEFLATE, frente a 495.652 con RLE simple.
Son estimaciones de selección de estrategia, no medidas del firmware.

Se implementó un archivo compacto de imágenes con compresión sin pérdida, sin
cambiar resolución, píxeles, frases ni audios. Usa miniz incluido en el SDK;
no instala un servicio o dependencia remota adicional. Referencia primaria:
[interfaz miniz de ESP-IDF](https://github.com/espressif/esp-idf/blob/master/components/esp_rom/include/miniz.h).

## Límites y formato

- Archivo `/v7cache/board.atlas`, máximo 192 KiB, dentro de los 512 KiB de
  caché combinada; se mantienen 48 archivos y reserva de sistema de 256 KiB.
- Cabecera versionada, ámbito de configuración URL/código/clave y firma del
  conjunto de imágenes. Registros únicos por SHA-256; no contiene nombres,
  frases, datos clínicos ni claves en claro.
- Cada entrada tiene hash, longitud acotada y un bloque zlib. La salida es
  exactamente 18.432 bytes por imagen, comprobada contra su SHA-256 original.
- Estados y buffers de miniz se asignan en PSRAM, no en la pila de arranque.
  La lectura construye un índice acotado y libera los buffers al terminar.
- La escritura conserva margen de PSRAM. Genera temporal, valida todas las
  imágenes descomprimidas y solo entonces reemplaza la copia anterior con
  rename de LittleFS. No se formatea ni se cambian particiones/NVS.
- La caché prefiere expulsar archivos individuales antes que el atlas; este
  sigue siendo expulsable como último recurso para no bloquear otras voces.

## Comportamiento

La primera preparación necesita Wi-Fi y un tablero con imágenes completas.
Al volver a encender, las imágenes presentes en el atlas se recuperan en RAM
sin descargarlas por HTTP. Las etiquetas y páginas permanecen completas.
Si una imagen cambia, no se utiliza la versión antigua como sustitución:
debe coincidir su hash. Si falta o falla validación, se recupera por Wi-Fi y
se muestra la descarga, conservando el resto del tablero.

La firma evita reescribir el atlas por una edición de voz que no cambie las
imágenes. Archivos mayores que el límite, memoria insuficiente o falta de
espacio no impiden usar el tablero: conservan la recuperación progresiva.
No se promete que 96 fotos diferentes, 180 imágenes o todos los WAV quepan
offline. El tamaño real depende de las imágenes y de los archivos conservados.

## Evidencia real

La primera preparación recibió las 96 imágenes y tardó 330.042 ms en completar
el tablero por Wi-Fi. El ESP produjo un atlas de **174.077 bytes**, con 95
imágenes únicas para 96 pictogramas (un recurso se reutiliza). La compresión y
verificación de todos los bloques antes de guardar tardó 4.883 ms en la revisión
inicial. El mensaje inicial de guardado imprimió bytes=0 por tomar tamaño antes
de flush; el archivo abierto por el lector confirmó los 174.077 bytes reales.
La revisión final construye y mide el paquete en PSRAM antes de modificar caché:
si no cabe, no expulsa archivos útiles para un intento fallido.

Al reiniciar con el binario final, el lector abrió ese archivo y recuperó las
**96 imágenes en 408 ms**, antes de iniciar el bucle de red. La interfaz registró
24 en Necesidades, 24 en Emociones, 24 en Acciones y 24 en Lugares. No fue una
descarga HTTP simulada: se descomprimió el archivo generado en el propio ESP y
se verificó cada SHA-256. Es tiempo de recuperación de imágenes; no mide LCD,
drivers, Wi-Fi u otros componentes del encendido completo.

Después se observaron 6.290.664 bytes de PSRAM libre, bloque mayor 6.160.372 y
85.728 bytes de heap libre. Caché combinada: 468.989 bytes, 17 archivos y 299.008
bytes libres en partición, manteniendo la reserva de 256 KiB.
Compilación final: 1.984.209 bytes de programa y 146.600 globales.
SHA-256 del binario operativo privado:
`93d3e9bff55b3a214b93b1bb390af03205ec6c23e374e5f08ca6717509592535`.
Esptool verificó escritura de app0; no se modificaron NVS ni particiones.

Respaldo previo completo: `%LOCALAPPDATA%/STCS-private/esp-before-fast-cache.bin`,
16.777.216 bytes, SHA-256
`675f11ff97402bf86e29ed24d3c78588b416d5962d52a107ce7e876dcce1cf59`.
El 15/11/2026 el propietario confirmó que al reiniciar aparecieron directamente
las seis páginas de cada categoría con sus dibujos y que Hablar funcionó.
Después desconectó el USB del computador y repitió el encendido alimentado
solo por un cargador USB de 5 V: confirmó nuevamente todas las páginas con
imágenes. Es evidencia física asistida por el usuario, adicional a la captura
serie y a la validación de hashes. La prueba que había fallado con v0.8.2 queda
confirmada con v0.8.4. No se probó corte eléctrico durante escritura.
