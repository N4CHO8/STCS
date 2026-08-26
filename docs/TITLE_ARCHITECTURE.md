# Arquitectura objetivo de STCS

## Objetivo de esta arquitectura

Esta guia define la base tecnica que debe seguir STCS para crecer como proyecto universitario y evolucionar hacia una plataforma publica accesible por internet. Su finalidad es evitar decisiones improvisadas y mantener coherencia entre arquitectura, desarrollo y despliegue.

## Decision principal

La arquitectura objetivo del proyecto es:

- Frontend en `Next.js + TypeScript`
- Backend en `Node.js + Express + TypeScript`
- Base de datos en `PostgreSQL` usando `Supabase`
- Storage de pictogramas e imagenes en `Supabase Storage`
- Dispositivo de comunicacion en `ESP32-S3` con pantalla redonda tactil
- Firmware en `PlatformIO` o `Arduino IDE`
- Entorno local con `Docker + Docker Compose`
- Frontend publicado en `Vercel`
- Backend publicado en `Render`
- Versionamiento en `Git + GitHub`
- Testing con:
  - `Vitest`
  - `Supertest`
  - `Playwright`
- Gestion del proyecto con `GitHub Projects`

## Justificacion general

Esta combinacion se eligio porque equilibra:

- bajo costo para un proyecto estudiantil
- facilidad de despliegue
- curva de aprendizaje razonable
- compatibilidad con el stack ya existente
- proyeccion real hacia una plataforma web usable
- posibilidad de validar un comunicador fisico diferenciado de aplicaciones moviles existentes

## Que usar para cada cosa

### 1. Frontend

Usar:

- `Next.js`
- `React`
- `TypeScript`

Despliegue:

- `Vercel`

Responsabilidad:

- interfaz visual
- navegacion
- formularios
- consumo de la API
- vistas de pictogramas, emociones, historial y progreso

### 2. Backend

Usar:

- `Node.js`
- `Express`
- `TypeScript`

Despliegue:

- `Render`

Responsabilidad:

- autenticacion
- validacion de datos
- reglas de negocio
- conexion a PostgreSQL
- endpoints REST
- control de permisos y roles

### 3. Base de datos

Usar:

- `PostgreSQL`
- `Supabase`

Responsabilidad:

- persistencia principal del sistema
- relaciones entre usuarios, perfiles, emociones, registros y progreso

Region recomendada:

- `East US (North Virginia)` para mantener cercania con el backend en `Render Virginia`

### 4. Storage de archivos y pictogramas

Usar:

- `Supabase Storage`

Responsabilidad:

- guardar pictogramas
- guardar imagenes de apoyo
- evitar almacenar archivos pesados directamente dentro de PostgreSQL

### 5. Dispositivo ESP32-S3

Usar:

- placa `ESP32-S3`
- pantalla redonda tactil
- firmware con `PlatformIO` o `Arduino IDE`

Responsabilidad:

- mostrar un tablero reducido de pictogramas
- permitir seleccion tactil de mensajes frecuentes
- funcionar como comunicador fisico rapido
- guardar eventos basicos cuando no exista conexion
- sincronizar configuraciones y registros con la plataforma web mediante Wi-Fi

### 6. Autenticacion

Usar:

- `bcrypt`
- `JWT`
- `refresh tokens`

Roles sugeridos:

- `admin`
- `therapist`
- `guardian`

### 7. Validaciones

Usar:

- validaciones de entrada en backend
- validaciones basicas en frontend para mejorar UX

Regla recomendada:

- el frontend ayuda al usuario
- el backend valida de verdad

### 8. Pruebas

Usar:

- `Vitest` para pruebas unitarias
- `Supertest` para integracion de endpoints
- `Playwright` para pruebas end-to-end

Estrategia:

- unitarias para logica sensible
- integracion para API y base de datos
- E2E para flujos clave como login, registro emocional e historial

### 9. Versionamiento

Usar:

- `Git`
- `GitHub`

Estrategia recomendada:

- `main`
- `develop`
- `feature/*`
- `fix/*`

### 10. Gestion del proyecto

Usar:

- `GitHub Projects`
- `GitHub Issues`

Objetivo:

- mantener backlog
- visualizar avance
- relacionar historias con ramas, commits y Pull Requests

## Arquitectura por capas

La recomendacion es usar una arquitectura simple por capas:

1. `routes`
   - reciben la peticion HTTP
2. `controllers`
   - interpretan request y response
3. `services`
   - contienen reglas de negocio
4. `data access`
   - concentran consultas a PostgreSQL o servicios externos
5. `database`
   - `PostgreSQL` como fuente principal

Esto permite que el proyecto crezca sin mezclar logica de interfaz, negocio y persistencia.

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
|  |  |- lib/
|  |  |- types/
|
|- backend/
|  |- src/
|  |  |- config/
|  |  |- middlewares/
|  |  |- modules/
|  |  |  |- auth/
|  |  |  |- users/
|  |  |  |- communication/
|  |  |  |- device-sync/
|  |  |  |- emotions/
|  |  |  |- records/
|  |  |  |- progress/
|  |  |- routes/
|  |  |- services/
|  |  |- data/
|  |  |- lib/
|  |  |- types/
|
|- firmware/
|  |- README.md
|  |- src/
|  |- include/
|  |- lib/
|  |- test/
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
- relacion entre usuarios adultos y ninos
- perfiles de acompanamiento

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

### 7. DeviceSync

Responsabilidad:

- preparar configuraciones para el ESP32-S3
- enviar catalogo reducido de pictogramas al dispositivo
- recibir eventos de comunicacion generados desde la placa
- manejar estados de sincronizacion pendiente cuando no haya Wi-Fi

## Modelo de datos sugerido

Entidades principales recomendadas:

- `User`
- `StudentProfile`
- `Emotion`
- `RecordItem`
- `Pictogram`
- `CommunicationSession`
- `Device`
- `DeviceEvent`
- `ProgressMetric`

Relacion sugerida:

- un `User` puede acompanar uno o mas `StudentProfile`
- un `StudentProfile` puede tener muchos registros emocionales
- un `StudentProfile` puede tener muchos registros de conducta
- una `CommunicationSession` puede usar muchos `Pictogram`
- un `Device` pertenece a un perfil de nino y puede generar muchos `DeviceEvent`
- un `ProgressMetric` se calcula desde emociones, comunicacion y registros

## Estrategia de despliegue recomendada

### Desarrollo local

Usar:

- `Docker Compose`
- PostgreSQL local
- frontend y backend en contenedores

### Produccion

Usar:

- frontend en `Vercel`
- backend en `Render`
- PostgreSQL en `Supabase`
- almacenamiento visual en `Supabase Storage`
- dispositivo ESP32-S3 conectado por Wi-Fi a la API cuando exista disponibilidad

## Costo objetivo estimado

Configuracion recomendada para inicio:

- `Vercel Hobby`: `USD 0/mes`
- `Supabase Free`: `USD 0/mes`
- `GitHub Free`: `USD 0/mes`
- `Render Starter`: `USD 7/mes`

Costo base estimado:

- `USD 7/mes`

## Regla final del proyecto

Si este proyecto quiere crecer sin perder coherencia tecnica, debe mantenerse sobre esta base:

- `Next.js + TypeScript`
- `Node.js + Express + TypeScript`
- `ESP32-S3` como prototipo fisico de comunicacion CAA
- `Supabase Postgres + Supabase Storage`
- `Docker Compose` en desarrollo
- `Vercel + Render + Supabase` en produccion
- `Vitest + Supertest + Playwright`
- `GitHub` para versionamiento y gestion

Esta es la arquitectura objetivo oficial de STCS y debe considerarse como referencia para las futuras ramas del proyecto.
