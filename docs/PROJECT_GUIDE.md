# Guia del proyecto STCS

## Objetivo

Este repositorio es la base tecnica del proyecto universitario STCS. Su objetivo no es solo servir como prototipo local, sino establecer una estructura clara para evolucionar hacia una plataforma web publica de comunicacion y seguimiento para ninos con TEA.

La base arquitectonica del proyecto ya esta definida y debe respetarse. Si necesitas revisar las decisiones tecnicas principales, consulta tambien `docs/TITLE_ARCHITECTURE.md`.

## Como esta organizado

### 1. Frontend

Ubicacion: `frontend/`

Responsabilidades:

- mostrar la interfaz de usuario
- organizar paginas y componentes reutilizables
- consumir el backend desde `NEXT_PUBLIC_API_URL`
- preparar vistas para comunicacion, emociones, historial y progreso

Carpetas importantes:

- `src/app`: rutas y paginas principales
- `src/components/layout`: layout general y navegacion
- `src/components/ui`: componentes presentacionales reutilizables
- `src/lib`: configuraciones y datos compartidos

### 2. Backend

Ubicacion: `backend/`

Responsabilidades:

- exponer endpoints REST
- centralizar validaciones y logica de negocio
- administrar conexion a PostgreSQL
- preparar control de acceso, usuarios, seguimiento y progreso

Carpetas importantes:

- `src/config`: variables de entorno y conexion
- `src/models`: tipos base del dominio
- `src/modules`: modulos por dominio
- `src/routes`: composicion principal de rutas

## Base tecnica obligatoria

Las decisiones actuales del proyecto son:

- Frontend: `Next.js + TypeScript`
- Backend: `Node.js + Express + TypeScript`
- Base de datos: `PostgreSQL` en `Supabase`
- Storage visual: `Supabase Storage`
- Entorno local: `Docker + Docker Compose`
- Frontend publicado: `Vercel`
- Backend publicado: `Render`
- Versionamiento: `Git + GitHub`
- Testing objetivo:
  - `Vitest`
  - `Supertest`
  - `Playwright`

Estas decisiones existen para evitar que el proyecto se desordene o cambie de direccion tecnica en cada nueva rama.

## Modulos actuales y objetivo

Actualmente existen bases para:

- `auth`
- `emotions`
- `records`

El proyecto debe crecer hacia estos modulos objetivo:

1. `auth`
2. `users`
3. `communication`
4. `emotions`
5. `records`
6. `progress`

## Convenciones recomendadas

- Mantener una responsabilidad por archivo siempre que sea razonable.
- Crear nuevos modulos del backend dentro de `backend/src/modules/<modulo>`.
- Crear componentes reutilizables antes de repetir estructuras de UI.
- Mantener el lenguaje del dominio consistente entre frontend, backend y base de datos.
- Documentar decisiones importantes en `docs/`.
- No introducir nuevas tecnologias sin justificacion tecnica clara.

## Flujo sugerido para nuevas ramas

1. Crear la rama desde una base actualizada.
2. Revisar `README.md`, esta guia y `docs/TITLE_ARCHITECTURE.md`.
3. Limitar cada rama a una historia de usuario o mejora tecnica concreta.
4. Si una rama modifica API, estructura de datos o despliegue, actualizar tambien la documentacion.

Estrategia de ramas recomendada:

- `main`
- `develop`
- `feature/<nombre>`
- `fix/<nombre>`

## Ejecucion local

Opcion recomendada en Windows PowerShell:

```powershell
.\scripts\dev-up.ps1
```

Opcion manual:

1. Copiar `.env.example` como `.env`.
2. Ejecutar `docker compose up --build`.
3. Verificar:
   - frontend en `http://localhost:3000`
   - backend en `http://localhost:4000/api`
   - healthcheck en `http://localhost:4000/api/health`

## Lo que ya esta resuelto

- estructura inicial del proyecto
- dockerizacion completa para desarrollo local
- tablas base en PostgreSQL
- rutas principales para extender logica
- interfaz inicial enfocada en simplicidad y accesibilidad

## Lo que queda para siguientes ramas

- autenticacion real con JWT y roles
- gestion de usuarios y perfiles
- integracion real de pictogramas
- historial y progreso persistente
- pruebas automatizadas
- despliegue publico en `Vercel + Render + Supabase`
