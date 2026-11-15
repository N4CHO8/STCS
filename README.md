# STCS

La publicación de medios privados, voz alojada y nueva interfaz del ESP está
en cierre técnico. Consultar [estado, capacidad y evidencia del 15/11](docs/CIERRE_STCS_20261115.md)
antes de usar los procedimientos históricos de laboratorio.

STCS es un proyecto de comunicacion aumentativa y alternativa para ninos con TEA. La version final se organiza en tres piezas principales:

- Plataforma web para cuidadores, docentes, especialistas y administradores.
- Base de datos PostgreSQL en Supabase.
- Dispositivo fisico ESP32-S3 con pantalla redonda tactil programado con Arduino (interfaz activa) y un prototipo inicial en PlatformIO.

El nino interactua con el dispositivo ESP32. La web se usa para configurar pictogramas, revisar eventos, consultar historial y analizar progreso.

## Stack final

- Web: `Next.js 16.4.6`, `React`, `TypeScript`, `Tailwind CSS`.
- API: `Next.js API Routes` dentro de `frontend/src/app/api`.
- Base de datos: `Supabase PostgreSQL`.
- Firmware activo: `Arduino CLI + Arduino framework`; PlatformIO es un esqueleto histórico.
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

## Firmware activo

La implementación reproducible está en `firmware/STCS_UI_Arduino` para Waveshare
ESP32-S3-Touch-LCD-1.46. Compilar con `scripts/verify-firmware.ps1`; la copia de
comprobación usa credenciales ficticias y no debe cargarse como versión operativa.
PlatformIO conserva un prototipo antiguo, no la interfaz instalada actual.

## Evaluación y Hito 3

Entrar por `/login`. La rama local retira `/demo` y todos sus enlaces; no crea
cuentas al iniciar sesión. Estas tres cuentas son **públicas, sintéticas y sin
información real**, destinadas exclusivamente a evaluación:

| Perfil | Correo ficticio | Contraseña demo pública |
| --- | --- | --- |
| Especialista | especialista.prueba01@stcs.test | Especialista123! |
| Docente | docente.prueba01@stcs.test | Docente1234! |
| Apoderado | apoderado.prueba01@stcs.test | Apoderado123! |

El administrador real usa su correo y contraseña propios; no se publican aquí.
Las cuentas reales nuevas requieren activación por correo. Las cuentas de
prueba conservan las mismas restricciones de asignación y rol.

El nuevo editor permite subir imágenes y preparar voz española para la frase
escrita. La implementación y evidencia de este encargo están **solo en local**;
la web publicada conserva su versión previa hasta un despliegue autorizado.
Consulta [arquitectura, configuración, pruebas y guion del Hito 3](docs/HITO3_MEDIOS_Y_VOZ.md).
El laboratorio aislado usa los mismos accesos sintéticos en localhost:3100.
No ejecutar sus fixtures contra Supabase.

## Documentacion util

- [Alcance funcional web + ESP32](./docs/ALCANCE_FUNCIONAL_WEB_ESP32.md)
- [Arquitectura final](./docs/ARQUITECTURA_FINAL.md)
- [Integracion ESP32-Web](./docs/INTEGRACION_ESP32_WEB.md)
- [Implementacion y demo del Hito 2](./docs/HITO2_IMPLEMENTACION.md)
- [Esquema Supabase](./supabase/schema.sql)
- [Firmware ESP32](./firmware/stcs-esp32/README.md)

## Estado técnico

Los cuatro roles adultos, sus asignaciones y las rutas de dispositivo se
validan en servidor. La pantalla, tacto y audio físicos ya se probaron; no son
pendientes de integración de drivers. El trabajo de imágenes y voz del Hito 3
se verifica localmente y tiene publicación pendiente. Los documentos antiguos
de hitos conservan decisiones históricas; prevalecen CONEXIONES, FLUJO_ROLES y
HITO3_MEDIOS_Y_VOZ para interpretar el estado vigente.
