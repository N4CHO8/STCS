# Firmware ESP32-S3

## Objetivo del dispositivo

El dispositivo Waveshare ESP32-S3-Touch-LCD-1.46 funcionara como un comunicador CAA portatil. Su objetivo es permitir que el nino seleccione pictogramas frecuentes desde una pantalla redonda tactil, sin depender de un celular o computador.

El firmware con pantalla, touch, audio y red integrado en este repositorio está en:

```text
firmware/STCS_UI_Arduino
```

`firmware/stcs-esp32` es un esqueleto inicial de PlatformIO y no reemplaza la
interfaz completa. Seguir el README del sketch Arduino para compilar.

Al revisar el equipo conectado el 12 de noviembre de 2026 se identificó
`v0.6.7-touch`, distinta del código de red versionado (`v0.5.0-private`).
No se recuperó el fuente de esa versión instalada: no sobrescribirla ni
atribuirle cambios de este repositorio sin verificar el firmware que se carga.
Pantalla, tacto y reproducción de «Agua» fueron confirmados por el propietario;
la sincronización completa permanece pendiente. Consultar `docs/VALIDACION_ZOOM.md`.

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
