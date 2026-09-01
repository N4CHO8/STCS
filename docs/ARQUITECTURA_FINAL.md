# Arquitectura final de STCS

## Definicion

STCS usa una arquitectura web + dispositivo IoT. La plataforma web administra configuracion, perfiles, historial y progreso. El dispositivo ESP32-S3 ejecuta la comunicacion directa mediante pictogramas.

## Componentes

- `Frontend Next.js`: interfaz para adultos responsables.
- `API Routes Next.js`: autenticacion, lectura de datos, registro de eventos y consultas para dashboard.
- `Supabase PostgreSQL`: almacenamiento de usuarios, perfiles, pictogramas, dispositivos y eventos.
- `Supabase Storage`: almacenamiento futuro de recursos visuales.
- `ESP32-S3`: comunicador fisico tactil para el nino.
- `PlatformIO`: ambiente de desarrollo y compilacion del firmware.
- `Vercel`: despliegue de la plataforma web y sus API routes.

## Flujo principal

1. El cuidador o especialista configura pictogramas desde la web.
2. La configuracion queda guardada en Supabase.
3. El dispositivo ESP32 obtiene o recibe una configuracion reducida.
4. El nino selecciona pictogramas desde la pantalla tactil.
5. El ESP32 registra eventos y los envia por Wi-Fi a la API.
6. La API guarda eventos en Supabase.
7. La web muestra historial, metricas y progreso.

## Endpoints del dispositivo

El ESP32 usara una API key privada mediante el header `x-stcs-device-key`.

```text
GET /api/stcs/devices/{deviceCode}/config
POST /api/stcs/devices/{deviceCode}/events
```

El primer endpoint entrega la configuracion activa del tablero. El segundo registra eventos reales del dispositivo, como seleccion de pictogramas, sincronizacion, estado de bateria o errores tecnicos.

## Decisiones

- La web no esta disenada para uso directo del nino.
- La interaccion del nino ocurre en el dispositivo fisico.
- La API principal vive en Next.js para simplificar el despliegue en Vercel.
- Supabase es la base de datos principal del sistema.
- El firmware debe desarrollarse con PlatformIO para mantener configuracion reproducible.
