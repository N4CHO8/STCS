# Firmware ESP32-S3

## Objetivo del dispositivo

El dispositivo Waveshare ESP32-S3-Touch-LCD-1.46 funcionara como un comunicador CAA portatil. Su objetivo es permitir que el nino seleccione pictogramas frecuentes desde una pantalla redonda tactil, sin depender de un celular o computador.

El proyecto PlatformIO activo esta en:

```text
firmware/stcs-esp32
```

## Responsabilidades esperadas

- Mostrar categorias simples de pictogramas.
- Presentar botones grandes y faciles de tocar.
- Construir mensajes cortos a partir de selecciones.
- Guardar eventos basicos cuando no exista conexion.
- Sincronizar configuracion y registros con la plataforma web por Wi-Fi.

## Stack propuesto

- Placa: ESP32-S3.
- Pantalla: redonda tactil.
- Firmware: PlatformIO con Arduino framework.
- Comunicacion: HTTPS/JSON con las API Routes de Next.js desplegadas en Vercel.
- Persistencia local: memoria flash para configuracion y cola de eventos pendientes.

## Primera iteracion sugerida

1. Configurar ambiente de desarrollo.
2. Encender pantalla y validar resolucion.
3. Detectar coordenadas tactiles.
4. Mostrar una grilla inicial de 4 a 6 pictogramas.
5. Registrar seleccion localmente.
6. Preparar envio futuro a las API Routes de la plataforma web cuando exista Wi-Fi.

## Relacion con la app web

La app web sera el panel de configuracion y seguimiento. Desde ella se podran preparar pictogramas, categorias y mensajes; el dispositivo usara una version reducida de esa configuracion para comunicacion rapida.
