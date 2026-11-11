# STCS

STCS es un proyecto de comunicacion aumentativa y alternativa para ninos con TEA. La version final se organiza en tres piezas principales:

- Plataforma web para cuidadores, docentes, especialistas y administradores.
- Base de datos PostgreSQL en Supabase.
- Dispositivo fisico ESP32-S3 con pantalla redonda tactil programado con Arduino (interfaz activa) y un prototipo inicial en PlatformIO.

El nino interactua con el dispositivo ESP32. La web se usa para configurar pictogramas, revisar eventos, consultar historial y analizar progreso.

## Stack final

- Web: `Next.js 16.4.6`, `React`, `TypeScript`, `Tailwind CSS`.
- API: `Next.js API Routes` dentro de `frontend/src/app/api`.
- Base de datos: `Supabase PostgreSQL`.
- Firmware: `PlatformIO + Arduino framework`.
- Dispositivo objetivo: `Waveshare ESP32-S3-Touch-LCD-1.46`.
- Despliegue web: `Vercel`.
- Versionamiento: `Git + GitHub`.

## Estructura

```text
STCS/
|- frontend/                 # Plataforma web y API routes para Vercel
|- firmware/
|  |- stcs-esp32/             # Proyecto PlatformIO del dispositivo
|- docs/                     # Documentacion vigente del proyecto
|- supabase/                 # Esquema SQL base para Supabase
|- .env.example              # Variables necesarias para desarrollo
|- .env.production.example   # Variables necesarias para Vercel
```

## Ejecutar la plataforma web

1. Crear `.env` desde `.env.example`.
2. Completar `DATABASE_URL` con la cadena de conexion de Supabase.
3. Entrar al frontend e instalar dependencias:

```powershell
cd frontend
npm install
npm run dev
```

4. Abrir [http://localhost:3000](http://localhost:3000).

El inicio de sesión no crea tablas ni modifica cuentas. Aplica el esquema y las migraciones antes de iniciar una instalación nueva.

Consulta [el flujo de los cuatro perfiles](./docs/FLUJO_ROLES.md) para permisos, privacidad, administración y pruebas.

La activación y recuperación requieren un correo real y SMTP configurado en Supabase. El titular establece su propia contraseña; no se aceptan contraseñas demo sin verificar el correo. El administrador no puede restablecer contraseñas ni modificar correos de adultos existentes.

Las pruebas se ejecutan contra PostgreSQL descartable en localhost, separado de Supabase. Consulta [las instrucciones y límites de verificación](./docs/PRUEBAS.md) y [las correcciones de auditoría](./docs/ARREGLOS_AUDITORIA.md). No ejecutes seeds en la base compartida.

## Ejecutar el firmware

1. Instalar Visual Studio Code.
2. Instalar la extension PlatformIO IDE.
3. Abrir el proyecto `firmware/stcs-esp32`.
4. Ejecutar `Build`.

La interfaz táctil y WiFi activa está en `firmware/STCS_UI_Arduino`; su README documenta versiones y compilación. El proyecto PlatformIO conserva únicamente el prototipo de contratos inicial.
5. Cuando la placa este disponible, conectar por USB-C y ejecutar `Upload`.
6. Abrir `Serial Monitor` a `115200`.

El firmware actual valida ambiente, memoria, catalogo inicial de pictogramas y escaneo Wi-Fi. La integracion real de pantalla/touch se hara con los ejemplos oficiales de Waveshare.

## Documentacion util

- [Alcance funcional web + ESP32](./docs/ALCANCE_FUNCIONAL_WEB_ESP32.md)
- [Arquitectura final](./docs/ARQUITECTURA_FINAL.md)
- [Integracion ESP32-Web](./docs/INTEGRACION_ESP32_WEB.md)
- [Implementacion y demo del Hito 2](./docs/HITO2_IMPLEMENTACION.md)
- [Esquema Supabase](./supabase/schema.sql)
- [Firmware ESP32](./firmware/stcs-esp32/README.md)

## Estado actual

- Web redisenada para adultos responsables del nino.
- Login con perfiles demo.
- Dashboard protegido con datos desde Supabase.
- Configuracion de pictogramas con alta, edicion y persistencia en Supabase.
- Endpoint validado e idempotente para eventos reales del ESP32.
- Historial con fecha, accion, contexto, actor y filtros.
- Proyecto PlatformIO creado y compilando correctamente.

## Pendientes principales

- Integrar drivers oficiales de pantalla/touch Waveshare.
- Mostrar pictogramas reales en la pantalla redonda.
- Enviar eventos reales desde ESP32 a la API.
- Integrar el envio Wi-Fi del firmware con los endpoints ya implementados.
- Automatizar pruebas de los flujos principales.
