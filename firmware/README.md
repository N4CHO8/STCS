# Firmware ESP32-S3

Esta carpeta queda reservada para el futuro firmware del comunicador fisico STCS.

## Objetivo del dispositivo

El dispositivo ESP32-S3 con pantalla redonda tactil funcionara como un comunicador CAA portatil. Su objetivo es permitir que el nino seleccione pictogramas frecuentes sin depender de un celular o computador.

## Responsabilidades esperadas

- Mostrar categorias simples de pictogramas.
- Presentar botones grandes y faciles de tocar.
- Construir mensajes cortos a partir de selecciones.
- Guardar eventos basicos cuando no exista conexion.
- Sincronizar configuracion y registros con la plataforma web por Wi-Fi.

## Stack propuesto

- Placa: ESP32-S3.
- Pantalla: redonda tactil.
- Firmware: PlatformIO o Arduino IDE.
- Comunicacion: HTTPS/JSON con la API del backend.
- Persistencia local: memoria flash para configuracion y cola de eventos pendientes.

## Primera iteracion sugerida

1. Configurar ambiente de desarrollo.
2. Encender pantalla y validar resolucion.
3. Detectar coordenadas tactiles.
4. Mostrar una grilla inicial de 4 a 6 pictogramas.
5. Registrar seleccion localmente.
6. Preparar envio futuro al backend cuando exista Wi-Fi.

## Relacion con la app web

La app web sera el panel de configuracion y seguimiento. Desde ella se podran preparar pictogramas, categorias y mensajes; el dispositivo usara una version reducida de esa configuracion para comunicacion rapida.
