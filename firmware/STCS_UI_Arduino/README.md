# STCS UI — firmware v0.8.8-adaptive-board

El especialista asignado elige las categorías y pictogramas visibles desde la web. El ESP oculta las categorías vacías y abre directamente el tablero si solo queda una. La selección no borra el catálogo ni cambia el límite de capacidad. La versión conserva configuración Wi-Fi, cola y caché existentes. [Comprobación de publicación](../../docs/pruebas/reportes/comprobacion-final-20261121/README.md).

Inicio: Hablar y Wi-Fi en la parte superior. Wi-Fi abre la configuración del
adulto, con Volver — Activar — Ver clave arriba. Conectar el celular a
STCS-Config y abrir 192.168.4.1; usuario stcs y clave local mostrada solo al
solicitarla. Los controles de las categorías y la caché rápida se conservan.
Inicio, categorías y configuración indican Wi-Fi conectado/desconectado;
es asociación al router, no una garantía de acceso a Internet o a la API.
Detalles: [WEB_Y_WIFI_20261115.md](../../docs/historico/WEB_Y_WIFI_20261115.md).

El arranque conserva todas las tarjetas y páginas del tablero guardado aunque
no estén todas sus imágenes en caché. Las imágenes verificadas aparecen
progresivamente sin cambiar de página ni borrar la frase. Detalles y prueba
de reinicio: [ARREGLO_REINICIO_ESP_20261115.md](../../docs/historico/ARREGLO_REINICIO_ESP_20261115.md).
La copia compacta admite hasta 384 KiB dentro de la caché total de 512 KiB.
Se conservan 256 KiB de espacio libre reservado para metadatos y eventos.
El ensayo histórico de 96 imágenes simples recuperó la copia anterior en 408 ms;
esa duración no se atribuye al catálogo ARASAAC.
Condiciones, medida y límites: [ARRANQUE_RAPIDO_ESP_20261115.md](../../docs/historico/ARRANQUE_RAPIDO_ESP_20261115.md).

Controles esenciales superiores, flechas laterales y frase inferior de lectura.
Volver — Hablar — Borrar en categorías. Capacidad coordinada: **180 activos,
45 por categoría, 12 páginas de cuatro (última con uno)**. Comprobación física
por etapas 64/128/160/180; con 180 se probaron muestras de frases distintas.
No es el límite físico absoluto ni 180 voces offline.
La zona táctil inferior defectuosa sigue siendo una limitación del hardware.

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
con la API HTTPS publicada. HTTP sin TLS solo se permite con bandera explícita
para LAN aislada; HTTPS valida certificados por defecto.

## Código y operación

- STCS_Network.cpp: configuración asignada, HTTP con soporte chunked,
  SHA-256 y tamaño verificados, Wi-Fi móvil, cola durable/ACK y heartbeat.
- STCS_MediaCache.cpp: LittleFS sin autoformato; caché LRU de 512 KiB/48
  archivos, reserva de 256 KiB y audio activo protegido durante reproducción.
- STCS_UI.cpp: cuatro categorías, hasta 45 elementos por categoría; imágenes
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
nunca descargados o expulsados. El límite de 180 imágenes puede superar la
caché persistente: no se promete que todas sobrevivan a un arranque offline.
La recuperación de imágenes faltantes se reintenta al volver a conectar.

Consultar [contrato vigente](../../docs/CONTRATO_MEDIOS_ESP.md) y [resultados](../../docs/pruebas/RESULTADOS.md).
El tablero persistente y la cola se vinculan a URL, código y clave individual;
una configuración de laboratorio nunca se importa como actividad de producción.
La primera carga tras cambiar ese ámbito requiere red. Rotar clave al reasignar.
La preparación de nube, mediciones, recuperación y estado real de instalación
están en [el cierre técnico](../../docs/historico/CIERRE_STCS_20261115.md).

## Tablero adaptable — v0.8.8-adaptive-board

Versión candidata local; no instalada en el ESP del propietario. La API entrega solo los pictogramas que seleccionó el especialista para ese niño. El inicio oculta categorías sin elementos y, al aplicar un tablero con una sola categoría, abre directamente sus pictogramas. Volver mantiene accesible el inicio y el menú Wi-Fi. Hablar, Volver, Borrar, frase y flechas conservan su distribución.

Los cambios de selección siguen esperando frase vacía y audio terminado antes de sustituir los datos. El catálogo completo permanece en la web. Los límites operativos no cambian: 180 en total, 45 por categoría y cuatro por página. Falta la comprobación física de esta versión; el firmware y tablero actuales se conservan.
