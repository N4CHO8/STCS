# STCS

STCS es un proyecto de comunicacion aumentativa y alternativa para ninos con TEA. La version final se organiza en tres piezas principales:

- Plataforma web para cuidadores, docentes, especialistas y administradores.
- Base de datos PostgreSQL en Supabase.
- Dispositivo fisico ESP32-S3 con pantalla redonda tactil programado con PlatformIO.

El nino interactua con el dispositivo ESP32. La web se usa para configurar pictogramas, revisar eventos, consultar historial y analizar progreso.

## Stack final

- Web: `Next.js 14`, `React`, `TypeScript`, `Tailwind CSS`.
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

La app crea tablas y datos demo al iniciar sesion si la base esta vacia.

Para cargar datos de prueba completos en Supabase:

```powershell
cd frontend
npm run seed:stcs
```

Este comando crea usuarios demo, el perfil de Mateo, el dispositivo `STCS-ESP32-001`, pictogramas CAA iniciales y eventos simulados del dispositivo.

## Usuarios demo

```text
cuidadora@stcs.local / Demo1234!  -> Cuidadora
docente@stcs.local / Demo1234!    -> Docente
terapeuta@stcs.local / Demo1234!  -> Especialista
admin@stcs.local / Demo1234!      -> Administrador
```

## Ejecutar el firmware

1. Instalar Visual Studio Code.
2. Instalar la extension PlatformIO IDE.
3. Abrir el proyecto `firmware/stcs-esp32`.
4. Ejecutar `Build`.
5. Cuando la placa este disponible, conectar por USB-C y ejecutar `Upload`.
6. Abrir `Serial Monitor` a `115200`.

El firmware actual valida ambiente, memoria, catalogo inicial de pictogramas y escaneo Wi-Fi. La integracion real de pantalla/touch se hara con los ejemplos oficiales de Waveshare.

## Documentacion util

- [Alcance funcional web + ESP32](./docs/ALCANCE_FUNCIONAL_WEB_ESP32.md)
- [Arquitectura final](./docs/ARQUITECTURA_FINAL.md)
- [Integracion ESP32-Web](./docs/INTEGRACION_ESP32_WEB.md)
- [Esquema Supabase](./supabase/schema.sql)
- [Firmware ESP32](./firmware/stcs-esp32/README.md)

## Estado actual

- Web redisenada para adultos responsables del nino.
- Login con perfiles demo.
- Dashboard protegido con datos desde Supabase.
- Endpoints preparados para recibir eventos reales del ESP32.
- Historial y graficos preparados para mostrarse cuando existan eventos reales del dispositivo.
- Proyecto PlatformIO creado y compilando correctamente.

## Pendientes principales

- Integrar drivers oficiales de pantalla/touch Waveshare.
- Mostrar pictogramas reales en la pantalla redonda.
- Enviar eventos reales desde ESP32 a la API.
- Agregar gestion completa de pictogramas desde la web.
- Automatizar pruebas de los flujos principales.
