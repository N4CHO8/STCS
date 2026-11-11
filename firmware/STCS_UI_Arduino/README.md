# STCS UI para ESP32-S3-Touch-LCD-1.46

Prototipo local de la interfaz tactil del comunicador STCS sobre el ejemplo
oficial de Waveshare y LVGL 8.3.10.

## Funcionalidades

- Menu inicial con cuatro categorias.
- Hasta ocho pictogramas ARASAAC por categoria, con imagen y etiqueta.
- Construccion de una frase de hasta seis selecciones.
- Franja de frase con pictogramas pequenos y texto de apoyo.
- Respuesta visual al seleccionar un pictograma.
- Navegacion de regreso sin perder la frase.
- Limpieza de la frase sin reiniciar el dispositivo.
- Reproduccion por voz desde la memoria flash mediante el altavoz integrado.
- Registro de navegacion y selecciones por el puerto serie.
- Sincronizacion del tablero y envio de eventos directamente por WiFi/HTTPS.
- Credenciales WiFi persistentes en NVS, configuradas una sola vez por USB.

## Configuracion de Arduino IDE

- Placa: `ESP32S3 Dev Module`
- Core ESP32: `3.0.2`
- USB CDC On Boot: `Enabled`
- Flash Mode: `QIO 80MHz`
- Flash Size: `16MB (128Mb)`
- Partition Scheme: `ESP SR 16M (3MB APP/7MB SPIFFS/2.9MB MODEL)`
- PSRAM: `OPI PSRAM`
- USB Mode: `Hardware CDC and JTAG`
- Monitor serie: `115200`

## Estructura de la interfaz

`STCS_UI_Arduino.ino` inicializa los controladores oficiales de pantalla y
touch. `STCS_UI.cpp` contiene las pantallas, categorias, pictogramas y eventos
de interaccion. `STCS_Pictograms.c` contiene las imagenes RGB565 integradas en
el firmware. `STCS_AudioStorage.cpp` instala y expone los WAV desde SPIFFS.
`STCS_UI.h` expone el punto de entrada `STCS_UI_Init()`.
`STCS_Network.cpp` administra WiFi, descarga hasta 32 pictogramas configurados y
envia los eventos a la API sin depender de que la pagina permanezca abierta.

La pantalla inicial presenta Necesidades, Emociones, Acciones y Lugares. Cada
categoria abre paginas horizontales de cuatro opciones. Se cambia de pagina
deslizando hacia la izquierda o la derecha. La frase permanece al volver
al inicio y se elimina solamente al pulsar Limpiar.

La decision de diseno CAA, la fuente y licencia de las imagenes se documentan
en `PICTOGRAMS.md`. Los casos reproducibles y su trazabilidad con el codigo se
encuentran en `VALIDACION_HITO2.md`. El recorrido sugerido para presentar el
incremento esta en `GUIA_DEMO_HITO2.md`.

## Archivos de audio

La reproduccion no requiere microSD. Los siguientes WAV se compilan dentro del
firmware y se instalan automaticamente en SPIFFS durante el primer encendido:

```text
/agua.wav
/comida.wav
/bano.wav
/ayuda.wav
/feliz.wav
/triste.wav
/enojado.wav
/cansado.wav
/jugar.wav
/comer.wav
/dormir.wav
/ir.wav
/casa.wav
/escuela.wav
/parque.wav
```

Cada archivo debe pronunciar solamente la palabra indicada. El boton
`Reproducir` recorre las selecciones en orden. Si falta un archivo, se registra
el error en el monitor serie y la cola continua con la siguiente palabra.

Los originales se conservan en `microSD/audio` como archivos fuente. El script
`tools/generate_audio_assets.py` regenera `STCS_AudioAssets.c` y su marca de
version. Durante la generacion, la copia embebida se convierte de 22,05 kHz a
16 kHz, PCM mono de 16 bits. Este formato mantiene buena inteligibilidad para
voz y reduce aproximadamente 327 KB del programa sin alterar los originales.
Para una version final, los WAV se pueden reemplazar por grabaciones de una voz
familiar conservando los nombres y ejecutando nuevamente el script.

La primera inicializacion puede tardar algunos segundos mientras se copian los
audios. Los siguientes arranques reutilizan la copia instalada en la flash.

## Eventos seriales

La interfaz genera mensajes con el prefijo `DEVICE_EVENT`:

```text
DEVICE_EVENT|type=ui_ready|screen=home
DEVICE_EVENT|type=category_opened|category=Necesidades
DEVICE_EVENT|type=pictogram_selected|category=Necesidades|pictogram=Agua|phrase_count=1
DEVICE_EVENT|type=navigation|destination=home
DEVICE_EVENT|type=phrase_cleared
DEVICE_EVENT|type=audio_requested|items=2
DEVICE_EVENT|type=audio_started|pictogram=Agua|path=/agua.wav|position=1
DEVICE_EVENT|type=audio_completed|items=2
```

Los mismos eventos funcionales se guardan en Supabase por WiFi. El serial queda
como salida de diagnostico y como canal de configuracion inicial de red.

## Configurar WiFi

1. Cargar el firmware una vez por USB.
2. Abrir la plataforma, entrar a `Dispositivos` y escribir SSID y clave.
3. Pulsar `Guardar WiFi en el ESP32` y escoger el puerto USB.
4. La placa conserva la red despues de reinicios y sincroniza cada 15 segundos.

La red debe ser de 2.4 GHz. El computador y el ESP32 no necesitan permanecer
conectados entre si; ambos solo requieren acceso a Internet.

## Pruebas manuales

1. Reiniciar tres veces y comprobar que aparece el menu inicial.
2. Abrir las cuatro categorias, deslizar y revisar sus dos paginas.
3. Tocar cada pictograma y comprobar el cambio visual y la frase.
4. Tocar fuera de los botones y confirmar que no se agrega una seleccion.
5. Repetir Volver diez veces sin bloqueos ni perdida de la frase.
6. Construir una frase, pulsar Limpiar y confirmar que el ESP32 no se reinicia.
7. Abrir el Monitor serie y comprobar los eventos de cada accion.
8. Crear una frase, pulsar Reproducir y comprobar que las palabras suenan en orden.

## Compilación reproducible y privacidad

`lv_conf.h` está versionado y habilita las fuentes usadas por STCS y los controladores originales. Dependencias comprobadas: core esp32 3.0.2, ArduinoJson 7.4.2, lvgl 8.3.10 y ESP32-audioI2S-master 3.0.13. LVGL necesita su carpeta `demos` copiada a `src/demos` para las referencias del controlador Waveshare.

En este equipo, Arduino CLI y las dependencias están en `%LOCALAPPDATA%/STCS-tools`. Desde la raíz:

```powershell
.\scripts\verify-firmware.ps1
```

El script compila una copia con clave ficticia; no flashea el dispositivo ni utiliza credenciales reales. Admite `-ArduinoCli` y `-ConfigDir` para otras instalaciones. Resultado comprobado: 2.986.393 bytes de programa (94% de 3 MB) y 163.456 bytes de variables globales (49% de RAM). Volver a comprobar el tamaño antes de agregar funciones.

HTTPS valida certificados públicos y espera sincronización NTP. `STCS_TrustRoots.h` contiene raíces públicas, no secretos. Revisarlas si Vercel cambia de cadena. El backend limita la clave heredada a STCS-ESP32-001; dispositivos adicionales requieren su propio hash SHA-256 en `devices.api_key_hash` y la correspondiente clave privada en el firmware.

La cola conserva hasta 24 eventos en NVS, con ID persistente entre reinicios. Los errores permanentes se guardan por separado, hasta ocho rechazados. Si ese almacén o NVS se llena, se avisa por serie sin borrar el pendiente. Una selección que no puede guardarse muestra un aviso en pantalla. Antes de tener hora válida se reconstruye el instante con millis si sigue el mismo arranque; tras reiniciar sin hora no se puede recuperar la fecha original con fiabilidad.

Un tablero vacío elimina las opciones anteriores. La configuración USB espera un ACK de guardado; ese ACK no demuestra conexión WiFi posterior.

Compilación completa aprobada. Pendiente en hardware: pantalla, audio, USB, recuperación NVS tras corte de energía, certificados/NTP y envío directo de eventos. El build web no cubre esas pruebas.
