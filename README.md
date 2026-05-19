# STCS

Base funcional para una aplicacion web orientada a ninos con TEA, enfocada en comunicacion con pictogramas, registro de emociones y seguimiento del progreso.

## Base tecnica definida

Este repositorio ya tiene una decision tecnica tomada y debe respetarse al continuar el proyecto:

- Frontend: `Next.js 14 + React 18 + TypeScript`
- Backend: `Node.js + Express + TypeScript`
- Base de datos: `PostgreSQL` en `Supabase`
- Storage de recursos visuales: `Supabase Storage`
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

- `frontend`: interfaz base con paginas iniciales para las futuras historias de usuario.
- `backend`: API REST con rutas base para autenticacion, emociones y registros.
- `database`: PostgreSQL local para desarrollo.

## Comandos utiles

```bash
docker compose up --build
docker compose down
docker compose down -v
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
- Reglas para contribuir al repo: [CONTRIBUTING.md](./CONTRIBUTING.md)

## Estado actual

Esta base deja listo:

- entorno local completo con Docker
- estructura inicial de frontend y backend
- conexion a PostgreSQL
- endpoints base
- UI accesible y simple para continuar las historias de usuario

No incluye aun logica completa de autenticacion, persistencia avanzada ni implementacion real de pictogramas.
