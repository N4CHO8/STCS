# STCS UI — firmware v0.7.0-media

Implementación reproducible para Waveshare ESP32-S3-Touch-LCD-1.46:
pantalla/táctil SPD2010, DAC PCM5101 I2S, 16 MiB flash y 8 MiB OPI PSRAM.
La versión v0.6.7-touch recuperada del dispositivo no tenía su fuente completa
identificada; su respaldo privado se conserva fuera de Git para restauración.

## Compilar

Desde la raíz: `scripts/verify-firmware.ps1`. Usa Arduino CLI, ESP32 core 3.0.2,
LVGL 8.3.10, ArduinoJson 7.4.2 y ESP32-audioI2S 3.0.13. La copia generada se
ubica en AppData, fuera de OneDrive. La compilación por defecto utiliza una
clave ficticia: acredita compilación, no conexión funcional.

`-SecretsFile <cabecera-privada>` prepara una imagen operativa. Utilizar
STCS_NetworkSecrets.example.h como contrato, guardar la cabecera fuera de Git.
Solo clave individual del dispositivo, URL y contraseña privada del portal
Wi-Fi; nunca credenciales PostgreSQL, trabajador o Storage.

`partitions.csv` conserva la distribución inspeccionada: app0 0x10000,
app1 0x610000, SPIFFS 0xc10000 y stcsdata 0xf00000 (960 KiB). El ensayo escribe
solo app0; no formatea flash ni cambia NVS o particiones. Respaldar antes.
La conexión móvil sigue disponible en STCS-Config/192.168.4.1 (usuario stcs,
contraseña privada de configuración); no requiere un computador como servidor
cuando la API se despliegue. HTTP sin TLS solo se permite con bandera explícita
para LAN aislada; HTTPS valida certificados por defecto.

## Código y operación

- STCS_Network.cpp: configuración asignada, HTTP con soporte chunked,
  SHA-256 y tamaño verificados, Wi-Fi móvil, cola durable/ACK y heartbeat.
- STCS_MediaCache.cpp: LittleFS sin autoformato; caché LRU de 512 KiB/48
  archivos, reserva de 128 KiB y audio activo protegido durante reproducción.
- STCS_UI.cpp: cuatro categorías, hasta ocho elementos por categoría; imágenes
  RGB565 de 96×96 en PSRAM. El tablero se aplica al limpiar la frase y terminar
  reproducción, para no invalidar punteros de selecciones activas.
- Audio_PCM5101.cpp: tarea dedicada con pila 16 KiB y cola de comandos;
  PCM WAV mono 16 kHz, 16 bits. No se reproduce audio predeterminado por imagen.
- stcs_font_es_12/14/16.c: glifos Latin-1 de Noto Sans para tildes/ñ, como
  fallback de Montserrat. Licencia OFL en NOTO-FONT-LICENSE.txt. Generados con
  lv_font_conv 1.5.3, Noto Sans 5.3.0, U+00A0–00FF, bpp4 sin compresión.
- I2C_Driver/Touch_SPD2010: exclusión recursiva para compartir Wire.

El script excluye STCS_AudioAssets.c: ya no instala el catálogo completo de
WAV. Los archivos legacy permanecen como referencia; únicamente los iconos de
las cuatro categorías se usan como recursos de navegación embebidos.

El ESP conserva metadatos y una caché limitada de archivos asignados. Descarga
voz bajo demanda. Sin servidor reproduce los archivos conservados, no aquellos
nunca descargados o expulsados. El límite de 32 imágenes puede superar la
caché persistente: no se promete que todas sobrevivan a un arranque offline.
La recuperación de imágenes faltantes se reintenta al volver a conectar.

Consultar [arquitectura, configuración y evidencia Hito 3](../../docs/HITO3_MEDIOS_Y_VOZ.md).
Las pruebas físicas del nuevo firmware son de laboratorio; su publicación y
uso contra la nube requieren configuración/migración separadas autorizadas.
