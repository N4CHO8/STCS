# Hito 2: implementacion y demostracion

## Coherencia con el Hito 1

La solucion conserva la arquitectura definida en el Hito 1:

- La plataforma web Next.js es usada por cuidadores, docentes y especialistas.
- Supabase PostgreSQL es la fuente principal de configuracion e historial.
- El ESP32 usa endpoints autenticados con `x-stcs-device-key`.
- La interfaz infantil permanece en el dispositivo fisico.
- Los pictogramas usan las mismas imagenes CAA ARASAAC en web y firmware.

## Trazabilidad de historias de usuario

| Historia | Implementacion | Evidencia |
| --- | --- | --- |
| Persistencia de pictogramas | Tabla `pictograms`, asociacion a `student_profiles`, restriccion de duplicados y API de alta/edicion | Crear o editar en Comunicador, recargar la pagina y verificar que permanece |
| Recepcion de eventos | `POST /api/stcs/devices/{deviceCode}/events` con clave, validacion, fecha, contexto, dispositivo y pictograma | Ejecutar `npm run verify:hito2` o enviar un evento desde el ESP32 |
| Historial | `GET /api/stcs/events`, orden descendente, fecha, accion, contexto y actor | Abrir Historial y usar los filtros |
| Configuracion web | Formulario adulto para nombre, categoria, frase, imagen, color y posicion | Agregar o editar un pictograma y comprobar la vista previa |

## Reglas de datos

- Un perfil no puede tener dos pictogramas activos con el mismo nombre y categoria.
- Cada evento puede incluir `externalEventId`; si el ESP32 reintenta el envio, la API devuelve el evento existente y no lo duplica.
- Un `pictogramId` enviado por el dispositivo debe pertenecer al mismo perfil del dispositivo.
- La fecha `occurredAt` debe usar formato ISO 8601. Si no se envia, el servidor registra la hora de recepcion.
- Las tablas publicas tienen Row Level Security habilitado. La aplicacion accede desde el servidor y no expone credenciales en el navegador.

## Demostracion recomendada

1. Iniciar la plataforma con `npm run dev` dentro de `frontend`.
2. Abrir `http://localhost:3000` e ingresar con `cuidadora@stcs.local` y `Demo1234!`.
3. Entrar a Comunicador y editar un pictograma.
4. Cambiar la frase o el color, guardar y recargar la pagina para demostrar persistencia.
5. Agregar un pictograma y mostrar que aparece en la vista previa y en la configuracion del dispositivo.
6. Ejecutar `npm run verify:hito2` en otra terminal para registrar un evento de prueba autenticado.
7. Abrir Historial, pulsar Actualizar y mostrar fecha, contexto, actor y accion.
8. Explicar que `externalEventId` evita duplicar el mismo evento cuando la red Wi-Fi obliga al ESP32 a reintentar.

## Verificacion automatizada

Con la plataforma ejecutandose:

```powershell
cd frontend
npm run verify:hito2
```

El script comprueba persistencia, configuracion descargable por el ESP32, recepcion de eventos, historial e idempotencia.

## Pendiente para integracion fisica

La plataforma y los endpoints ya estan operativos. Para que el hardware envie eventos sin el script de prueba falta configurar en el firmware:

- SSID y clave de la red Wi-Fi.
- URL publica de la plataforma desplegada.
- La misma `STCS_DEVICE_API_KEY` configurada en Vercel.
- Generacion de un `externalEventId` diferente para cada interaccion local.

Este pendiente corresponde a la conexion fisica por Wi-Fi; no afecta la demostracion del flujo de plataforma y base de datos del Hito 2.
