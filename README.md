# STCS

Base funcional para STCS, un sistema de comunicacion aumentativa y alternativa para ninos con TEA. El proyecto combina una plataforma web para cuidadores y especialistas con un futuro dispositivo fisico basado en ESP32-S3 con pantalla redonda tactil.

## Base tecnica definida

Este repositorio ya tiene una decision tecnica tomada y debe respetarse al continuar el proyecto:

- Frontend: `Next.js 14 + React 18 + TypeScript`
- Backend: `Node.js + Express + TypeScript`
- Base de datos: `PostgreSQL` en `Supabase`
- Storage de recursos visuales: `Supabase Storage`
- Dispositivo objetivo: `ESP32-S3` con pantalla redonda tactil
- Firmware objetivo: `PlatformIO` o `Arduino IDE`
- Entorno local: `Docker + Docker Compose`
- Despliegue objetivo:
  - frontend en `Vercel`
  - backend en `Render`
  - base de datos en `Supabase`
- Versionamiento: `Git + GitHub`
- Testing objetivo:
  - `Vitest` para unitarias
  - `Supertest` para integracion
  - `Playwright` para E2E

Si una futura rama quiere cambiar esta base, primero debe justificarlo y actualizar la documentacion en `docs/`.

## Estructura

```text
STCS/
|- backend/                  # API REST y logica de negocio
|- docker/                   # inicializacion y soporte de entorno local
|- docs/                     # documentacion tecnica y de trabajo
|- firmware/                 # base documental para el futuro codigo ESP32-S3
|- frontend/                 # aplicacion web en Next.js
|- scripts/                  # arranque, apagado y reseteo local
|- .env.example              # variables de entorno de referencia
|- docker-compose.yml        # orquestacion local
```

## Primer uso

### Opcion rapida recomendada

En PowerShell:

```powershell
.\scripts\dev-up.ps1
```

En macOS o Linux:

```bash
./scripts/dev-up.sh
```

Estos scripts:

- crean `.env` automaticamente desde `.env.example` si todavia no existe
- levantan frontend, backend y base de datos con Docker

### Opcion manual

1. Copia `.env.example` a `.env`.
2. Ejecuta `docker compose up --build`.
3. Abre:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:4000/api](http://localhost:4000/api)
   - Healthcheck: [http://localhost:4000/api/health](http://localhost:4000/api/health)

## Servicios disponibles

- `frontend`: plataforma web para configurar pictogramas, probar comunicacion CAA y revisar seguimiento.
- `backend`: API REST con rutas base para autenticacion, emociones y registros.
- `database`: PostgreSQL local para desarrollo.
- `firmware`: espacio reservado para el comunicador fisico ESP32-S3.

## Comandos utiles

```bash
docker compose up --build
docker compose down
docker compose down -v
```

Para validar la base de datos configurada en `.env`:

```bash
cd backend
npm run db:check
npm run db:apply-schema
```

Tambien puedes usar:

- `.\scripts\dev-up.ps1`
- `.\scripts\dev-down.ps1`
- `.\scripts\dev-reset.ps1`

## Flujo recomendado

- Leer `docs/PROJECT_GUIDE.md` antes de abrir una nueva rama.
- Respetar `docs/TITLE_ARCHITECTURE.md` como contrato tecnico del proyecto.
- Usar `frontend/src/app` para rutas y `frontend/src/components` para componentes reutilizables.
- Usar `backend/src/modules` para separar dominios del backend.
- Mantener cada rama enfocada en una historia de usuario o mejora tecnica concreta.

## Documentacion del equipo

- Guia general del proyecto: [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md)
- Endpoints base del backend: [docs/API_BASE.md](./docs/API_BASE.md)
- Arquitectura y decisiones objetivo: [docs/TITLE_ARCHITECTURE.md](./docs/TITLE_ARCHITECTURE.md)
- Guia de despliegue: [docs/DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md)
- Mitigacion de riesgo tecnico: [docs/SECURITY_MITIGATION.md](./docs/SECURITY_MITIGATION.md)
- Reglas para contribuir al repo: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Estado actual

Esta base deja listo:

- entorno local completo con Docker
- estructura inicial de frontend y backend
- conexion a PostgreSQL
- endpoints base protegidos por JWT y permisos
- UI accesible orientada a configurar un tablero CAA y preparar la futura integracion con ESP32-S3
- definicion inicial del rol del dispositivo fisico dentro del sistema
- demo tecnica de proteccion de datos con `.\scripts\demo-security.ps1`

No incluye aun firmware funcional para la placa, sincronizacion real con ESP32 ni persistencia avanzada de pictogramas.
