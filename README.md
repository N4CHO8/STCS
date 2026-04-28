# STCS

Base funcional para una aplicacion web orientada a ninos con TEA, enfocada en comunicacion con pictogramas, registro de emociones y seguimiento del progreso.

## Stack

- Frontend: Next.js 14 + React 18 + TypeScript
- Backend: Node.js + Express + TypeScript
- Base de datos: PostgreSQL 16
- Entorno local: Docker + Docker Compose

## Estructura

```text
STCS/
|- backend/                  # API REST y conexion a PostgreSQL
|- frontend/                 # Aplicacion web en Next.js
|- docker/postgres/init/     # Script inicial de la base de datos
|- docs/                     # Documentacion para el equipo
|- .env.example              # Variables de entorno de referencia
|- docker-compose.yml        # Orquestacion local
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
- `database`: PostgreSQL con tablas iniciales `users`, `emotions` y `records`.

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

- Usar `frontend/src/app` para nuevas vistas y rutas.
- Usar `frontend/src/components` para componentes reutilizables.
- Usar `backend/src/modules` para separar rutas y controladores por dominio.
- Usar `docs/PROJECT_GUIDE.md` antes de abrir nuevas ramas o empezar una historia de usuario.

## Documentacion del equipo

- Guia general del proyecto: [docs/PROJECT_GUIDE.md](./docs/PROJECT_GUIDE.md)
- Endpoints base del backend: [docs/API_BASE.md](./docs/API_BASE.md)

## Estado actual

Esta base deja listo:

- entorno local completo con Docker
- estructura inicial de frontend y backend
- conexion a PostgreSQL
- endpoints base
- UI accesible y simple para continuar las historias de usuario

No incluye aun logica completa de autenticacion, persistencia avanzada ni implementacion real de pictogramas.
