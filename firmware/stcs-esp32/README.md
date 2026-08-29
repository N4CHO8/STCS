# Firmware STCS ESP32

Proyecto base de PlatformIO para preparar el comunicador fisico STCS en una placa Waveshare ESP32-S3-Touch-LCD-1.46.

## Hardware objetivo

- Placa: Waveshare ESP32-S3-Touch-LCD-1.46.
- MCU: ESP32-S3.
- Pantalla: LCD tactil redonda de 1.46 pulgadas.
- Resolucion objetivo: 412 x 412 px.
- Conectividad: Wi-Fi 2.4 GHz y Bluetooth BLE.
- Memoria objetivo: 16 MB Flash y 8 MB PSRAM.

## Ambiente de desarrollo

1. Instalar Visual Studio Code.
2. Instalar extension PlatformIO IDE.
3. Abrir el repositorio STCS en VS Code.
4. Abrir este proyecto desde PlatformIO: `firmware/stcs-esp32`.
5. Ejecutar `Build` para compilar.
6. Conectar la placa por USB-C.
7. Ejecutar `Upload`.
8. Abrir `Serial Monitor` a 115200 baudios.

## Validacion esperada

El firmware inicial valida que el ambiente funcione antes de integrar pantalla y touch:

- Compila con framework Arduino.
- Imprime informacion del dispositivo por monitor serial.
- Detecta Flash y PSRAM.
- Carga un catalogo inicial de pictogramas en JSON.
- Escanea redes Wi-Fi cercanas.

## Siguiente paso

Cuando llegue la pantalla, se debe descargar el ejemplo oficial de Waveshare e integrar los drivers de pantalla/touch. Despues se reemplazara la salida serial por una interfaz visual con 4 pictogramas grandes en pantalla redonda.
