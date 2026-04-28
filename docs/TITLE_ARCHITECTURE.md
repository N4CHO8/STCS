# Arquitectura recomendada para STCS

## Objetivo de esta arquitectura

Esta guia define una estructura solida para que STCS pueda comenzar como proyecto universitario, crecer de forma ordenada y evolucionar hacia un sistema real desplegado en internet.

La idea es que no tengas que volver a decidir la base tecnica cada vez que avances una historia de usuario. Aqui queda definido que tecnologia usar para cada parte y como organizar el desarrollo.

## Decision principal

La recomendacion para STCS es:

- frontend en `Next.js + TypeScript`
- backend en `Express + TypeScript`
- base de datos en `PostgreSQL`
- acceso a datos con `Prisma`
- contenedores con `Docker`
- autenticacion con `JWT + refresh tokens`
- almacenamiento de imagenes o pictogramas en `Supabase Storage` o `S3 compatible`
- despliegue:
  - frontend en `Vercel`
  - backend en `Railway`, `Render` o `Fly.io`
  - PostgreSQL administrado en `Supabase`, `Neon` o `Railway Postgres`

## Que usar para cada cosa

### 1. Frontend

Usar:

- `Next.js`
- `React`
- `TypeScript`

Responsabilidad:

- interfaz visual
- navegacion
- formularios
- consumo de la API
- vistas de pictogramas, emociones, historial y progreso

Recomendacion de organizacion:

- `src/app`: rutas y paginas
- `src/components`: componentes reutilizables
- `src/features`: logica por dominio de negocio
- `src/services`: consumo de API
- `src/types`: tipos compartidos del frontend

### 2. Backend

Usar:

- `Node.js`
- `Express`
- `TypeScript`
- `Prisma`

Responsabilidad:

- autenticacion
- validacion de datos
- reglas de negocio
- conexion a PostgreSQL
- endpoints REST
- control de permisos y roles

Recomendacion de organizacion:

- `src/modules`: modulos del dominio
- `src/middlewares`: autenticacion, errores, permisos
- `src/services`: reglas de negocio reutilizables
- `src/repositories`: acceso a datos
- `src/lib`: utilidades internas
- `prisma/`: esquema y migraciones

### 3. Base de datos

Usar:

- `PostgreSQL`
- `Prisma ORM`

Responsabilidad:

- persistencia principal del sistema
- relaciones entre usuarios, registros, emociones, sesiones y progreso

Recomendacion:

- datos estructurados y consistentes en tablas relacionales
- uso de `jsonb` solo para metadata flexible cuando realmente haga falta
- migraciones versionadas con Prisma

### 4. Autenticacion

Usar:

- `bcrypt` para hash de contrasenas
- `JWT` para access token
- `refresh token` para renovacion segura de sesion

Roles sugeridos:

- `admin`
- `therapist`
- `guardian`

Mas adelante puedes agregar:

- `student` si el sistema necesita perfiles propios para ninos

### 5. Archivos y pictogramas

Usar:

- `Supabase Storage`
- o `Amazon S3 / Cloudflare R2`

Guardar en almacenamiento externo:

- pictogramas personalizados
- imagenes de perfil
- archivos de apoyo

No guardar imagenes pesadas directamente en PostgreSQL.

### 6. Validaciones

Usar:

- `Zod` en backend
- validaciones simples en frontend para UX

Regla recomendada:

- el frontend ayuda al usuario
- el backend valida de verdad

### 7. Pruebas

Usar:

- `Vitest` o `Jest` para backend
- `Supertest` para endpoints
- `React Testing Library` para componentes
- `Playwright` para pruebas end-to-end

Estrategia:

- unitarias para logica sensible
- integracion para API y base de datos
- e2e para flujos clave como login, registro emocional e historial

### 8. Observabilidad y errores

Usar:

- logs claros en backend
- `Sentry` cuando el sistema crezca

Registrar al menos:

- errores de API
- errores de autenticacion
- fallos de base de datos
- acciones importantes del sistema

### 9. Seguridad

Usar:

- `helmet`
- `cors`
- `rate limiting`
- sanitizacion de inputs
- manejo correcto de variables de entorno

Nunca subir:

- `.env`
- secretos
- credenciales reales

## Arquitectura por capas

La recomendacion es usar una arquitectura simple por capas:

1. `routes`
   - reciben la peticion HTTP
2. `controllers`
   - interpretan request y response
3. `services`
   - contienen reglas de negocio
4. `repositories`
   - hablan con Prisma y PostgreSQL
5. `database`
   - PostgreSQL como fuente principal

Esto permite que el proyecto crezca sin mezclar logica de interfaz, negocio y base de datos en el mismo lugar.

## Estructura recomendada del proyecto

```text
STCS/
|- frontend/
|  |- src/
|  |  |- app/
|  |  |- components/
|  |  |- features/
|  |  |  |- auth/
|  |  |  |- communication/
|  |  |  |- emotions/
|  |  |  |- history/
|  |  |  |- progress/
|  |  |- services/
|  |  |- hooks/
|  |  |- lib/
|  |  |- types/
|
|- backend/
|  |- prisma/
|  |  |- schema.prisma
|  |  |- migrations/
|  |- src/
|  |  |- config/
|  |  |- middlewares/
|  |  |- modules/
|  |  |  |- auth/
|  |  |  |- users/
|  |  |  |- emotions/
|  |  |  |- records/
|  |  |  |- communication/
|  |  |  |- progress/
|  |  |- repositories/
|  |  |- services/
|  |  |- routes/
|  |  |- lib/
|  |  |- types/
|
|- docs/
|- scripts/
|- docker/
|- docker-compose.yml
```

## Modulos que deberia tener el sistema

### 1. Auth

Responsabilidad:

- login
- logout
- refresh token
- roles y permisos

### 2. Users

Responsabilidad:

- gestionar cuentas
- perfiles de cuidadores o terapeutas
- relacion con estudiantes o pacientes

### 3. Communication

Responsabilidad:

- catalogo de pictogramas
- categorias
- construccion de frases
- historial de uso de comunicacion

### 4. Emotions

Responsabilidad:

- registrar emociones
- intensidad
- observaciones
- relacion temporal por fecha y usuario

### 5. Records

Responsabilidad:

- registrar conducta
- observaciones libres
- eventos relevantes del dia

### 6. Progress

Responsabilidad:

- consolidar emociones, comunicacion y registros
- generar indicadores
- mostrar avances por periodos

## Modelo de datos sugerido

Entidades principales recomendadas:

- `User`
- `StudentProfile`
- `EmotionRecord`
- `BehaviorRecord`
- `Pictogram`
- `CommunicationSession`
- `ProgressMetric`
- `Role`

Relacion sugerida:

- un `User` puede tener uno o mas perfiles asociados segun rol
- un `StudentProfile` puede tener muchos registros emocionales
- un `StudentProfile` puede tener muchos registros de conducta
- una `CommunicationSession` puede usar muchos pictogramas
- un `ProgressMetric` se calcula desde eventos y registros

## Roadmap tecnico recomendado

### Etapa 1. Base del sistema

Implementar:

- estructura actual del proyecto
- PostgreSQL
- Prisma
- autenticacion base
- CRUD de usuarios

### Etapa 2. Funcionalidad principal

Implementar:

- pictogramas
- registro emocional
- registro de conducta
- historial simple

### Etapa 3. Seguimiento y analitica

Implementar:

- dashboard de progreso
- filtros por fecha
- metricas por usuario
- vistas para cuidadores o terapeutas

### Etapa 4. Produccion

Implementar:

- CI/CD
- despliegue real
- monitoreo
- backups
- politicas de seguridad

## Estrategia de despliegue recomendada

### Desarrollo local

Usar:

- `Docker Compose`
- PostgreSQL local
- frontend y backend en contenedores

### Staging

Usar:

- frontend desplegado en preview
- backend en entorno separado
- base de datos de pruebas

Objetivo:

- validar antes de pasar a produccion

### Produccion

Usar:

- frontend en `Vercel`
- backend en `Railway`, `Render` o `Fly.io`
- PostgreSQL administrado
- almacenamiento externo para imagenes

## CI/CD recomendado

Con `GitHub Actions`:

- instalar dependencias
- correr typecheck
- correr tests
- construir frontend y backend

Regla recomendada:

- no desplegar a produccion si fallan pruebas o build

## Variables de entorno recomendadas a futuro

### Frontend

- `NEXT_PUBLIC_API_URL`

### Backend

- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGIN`
- `STORAGE_URL`
- `STORAGE_KEY`
- `STORAGE_SECRET`

## Recomendacion final

Si este proyecto realmente quiere llegar a ser un sitio usable fuera del entorno local, la mejor base tecnica es:

- `Next.js + TypeScript`
- `Express + TypeScript`
- `PostgreSQL + Prisma`
- `Docker`
- `JWT + refresh tokens`
- despliegue separado de frontend, backend y base de datos

Esa combinacion es suficientemente academica para un proyecto de titulo y suficientemente realista para evolucionar a produccion.
