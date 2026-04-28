# Guia del proyecto STCS

## Objetivo

Este repositorio es la base tecnica del proyecto universitario. Su meta actual es ofrecer una estructura clara, funcional y facil de extender para las historias de usuario futuras.

Si quieres revisar la arquitectura objetivo del sistema pensando en despliegue real, revisa tambien `docs/TITLE_ARCHITECTURE.md`.

## Como esta organizado

### 1. Frontend

Ubicacion: `frontend/`

Responsabilidades:

- mostrar la interfaz de usuario
- organizar paginas y componentes reutilizables
- consumir el backend desde `NEXT_PUBLIC_API_URL`

Carpetas importantes:

- `src/app`: rutas y paginas principales con App Router de Next.js
- `src/components/layout`: layout general, navegacion y estructura comun
- `src/components/ui`: tarjetas, secciones y componentes presentacionales
- `src/lib`: datos compartidos y configuraciones ligeras

### 2. Backend

Ubicacion: `backend/`

Responsabilidades:

- exponer endpoints REST
- centralizar validaciones iniciales y estructura modular
- administrar conexion a PostgreSQL

Carpetas importantes:

- `src/config`: variables de entorno y cliente de base de datos
- `src/models`: tipos base del dominio
- `src/modules`: rutas y controladores por modulo
- `src/routes`: composicion principal de rutas

### 3. Base de datos

Ubicacion: `docker/postgres/init/`

Responsabilidades:

- definir las tablas base necesarias para iniciar el desarrollo
- preparar el entorno local de PostgreSQL automaticamente al levantar Docker

## Modulos actuales

- `auth`: base para login, registro y manejo futuro de sesiones/roles
- `emotions`: base para registrar estados emocionales
- `records`: base para registrar observaciones y comportamiento

## Historias de usuario futuras sugeridas

1. Comunicacion con pictogramas
2. Registro guiado de emociones
3. Historial visual por fechas
4. Seguimiento del progreso por indicadores
5. Gestion de usuarios y perfiles de acompanantes

## Convenciones recomendadas

- Mantener una responsabilidad por archivo siempre que sea razonable.
- Crear nuevos modulos del backend dentro de `backend/src/modules/<modulo>`.
- Crear componentes reutilizables antes de repetir estructuras de UI.
- Mantener el lenguaje del dominio consistente entre frontend, backend y base de datos.
- Documentar decisiones importantes en esta carpeta `docs/`.

## Flujo sugerido para nuevas ramas

1. Crear la rama desde una base actualizada.
2. Revisar esta guia y el `README.md`.
3. Limitar cada rama a una historia de usuario o a una mejora tecnica concreta.
4. Si una rama modifica contrato API o estructura de datos, actualizar tambien esta documentacion.

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
- dockerizacion completa
- tablas base en PostgreSQL
- rutas principales para extender logica
- interfaz inicial enfocada en simplicidad y accesibilidad

## Lo que queda para siguientes ramas

- autenticacion real y seguridad
- CRUD persistente completo
- integracion real de pictogramas
- graficos y analitica de progreso
- pruebas automatizadas
