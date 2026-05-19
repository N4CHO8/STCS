# Contribuir a STCS

## Objetivo

Este archivo define como continuar el proyecto sin romper la arquitectura ya acordada. Antes de implementar una historia nueva, revisa este documento junto a `README.md` y `docs/TITLE_ARCHITECTURE.md`.

## Decisiones tecnicas que se deben respetar

- Frontend obligatorio: `Next.js + TypeScript`
- Backend obligatorio: `Node.js + Express + TypeScript`
- Base de datos obligatoria: `PostgreSQL` en `Supabase`
- Storage de pictogramas e imagenes: `Supabase Storage`
- Entorno local obligatorio: `Docker + Docker Compose`
- Frontend productivo: `Vercel`
- Backend productivo: `Render`
- Versionamiento: `Git + GitHub`
- Testing objetivo:
  - `Vitest` para unitarias
  - `Supertest` para integracion
  - `Playwright` para E2E
- Gestion del proyecto: `GitHub Projects`

No cambies estas decisiones sin documentar la razon tecnica y actualizar `docs/`.

## Arquitectura que debe seguirse

### Frontend

- `src/app` para rutas y paginas.
- `src/components` para componentes reutilizables.
- `src/features` para logica por dominio a medida que el proyecto crezca.
- `src/services` para llamadas a la API.
- `src/types` para tipos compartidos del frontend.

### Backend

- `src/routes` para composicion general de rutas.
- `src/modules/<dominio>` para separar cada modulo del sistema.
- Dentro de cada modulo, separar al menos:
  - `routes`
  - `controllers`
  - `services`
- Mantener la logica HTTP separada de la logica de negocio.

### Dominios objetivo del sistema

- `auth`
- `users`
- `communication`
- `emotions`
- `records`
- `progress`

## Regla para nuevas ramas

Usar esta estrategia:

- `main`: version estable
- `develop`: integracion
- `feature/<nombre-corto>`: funcionalidad nueva
- `fix/<nombre-corto>`: correccion tecnica

Cada rama debe abordar una sola historia de usuario o una mejora tecnica concreta.

## Regla para pruebas

Cuando una funcionalidad agregue logica real, debe venir acompanada por pruebas acordes:

- logica aislada: `Vitest`
- endpoints o contratos HTTP: `Supertest`
- flujos completos de usuario: `Playwright`

Si una rama no agrega tests porque aun es solo estructura, debe dejarlo explicado en el PR.

## Regla para documentacion

Actualiza documentacion cuando una rama cambie:

- arquitectura
- contratos API
- estructura de datos
- variables de entorno
- despliegue

Archivos a revisar segun el cambio:

- `README.md`
- `docs/API_BASE.md`
- `docs/PROJECT_GUIDE.md`
- `docs/TITLE_ARCHITECTURE.md`

## Regla para despliegue

- Desarrollo local: `Docker Compose`
- Frontend publicado: `Vercel`
- Backend publicado: `Render`
- Base de datos: `Supabase`
- Recursos visuales: `Supabase Storage`

No construir nuevas funcionalidades pensando solo en local. Cada modulo debe poder evolucionar despues a esta arquitectura objetivo.
