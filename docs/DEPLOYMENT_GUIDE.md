# Guia de despliegue de STCS

Esta guia define el camino recomendado para conectar STCS a una base de datos real y desplegar el prototipo del hito de mitigacion de riesgo tecnico.

## Objetivo del despliegue

El prototipo debe demostrar que el riesgo tecnico principal esta mitigado:

- la aplicacion web corre fuera del computador local
- el backend esta publicado y protege rutas con JWT
- la base de datos PostgreSQL persiste usuarios y registros
- el frontend consume una API real mediante variables de entorno

## Arquitectura de despliegue

- Frontend: `Vercel`
- Backend: `Render`
- Base de datos: `Supabase Postgres`
- Repositorio: `GitHub`

Para el hito de mitigacion de riesgo tecnico, el frontend tambien incluye API Routes de Next.js bajo `frontend/src/app/api`. Estas rutas permiten que el prototipo desplegado en Vercel pruebe login, portal protegido y conexion a Supabase sin esperar el despliegue separado del backend Express.

## Orden correcto

1. Crear base de datos en Supabase.
2. Ejecutar el esquema SQL inicial en Supabase.
3. Desplegar backend en Render.
4. Configurar variables del backend.
5. Desplegar frontend en Vercel.
6. Configurar `NEXT_PUBLIC_API_URL` apuntando al backend real.
7. Validar login y portal desde la URL publica.

## 1. Supabase

Crear un proyecto en Supabase y usar PostgreSQL como base principal.

Region recomendada:

- `East US (North Virginia)`

Luego abrir el SQL Editor de Supabase y ejecutar el contenido de:

```text
docker/postgres/init/01-schema.sql
```

Tambien se puede aplicar desde el backend si `DATABASE_URL` apunta a Supabase:

```bash
cd backend
npm run db:apply-schema
```

Para comprobar la conexion:

```bash
cd backend
npm run db:check
```

Ese archivo crea:

- `users`
- `emotions`
- `records`
- usuarios demo para validar el prototipo

Variable que se debe obtener desde Supabase:

```env
DATABASE_URL=postgresql://...
```

Usar la connection string compatible con backend Node.js.

## 2. Render

Crear un servicio web para el backend.

Configuracion recomendada:

```text
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

El archivo `render.yaml` del repositorio deja preparada esta misma configuracion como referencia para Render.

Variables de entorno en Render:

```env
DATABASE_URL=<connection-string-de-supabase>
DATABASE_SSL=true
CORS_ORIGIN=http://localhost:3000,https://<tu-frontend>.vercel.app
JWT_ACCESS_SECRET=<secreto-largo-y-privado>
```

Render entrega automaticamente la variable `PORT`. El backend ya esta preparado para leer `PORT` en produccion.

URL esperada del backend:

```text
https://<tu-backend>.onrender.com/api
```

Validacion:

```text
https://<tu-backend>.onrender.com/api/health
```

Debe responder con:

```json
{
  "status": "ok",
  "database": "connected"
}
```

## 3. Vercel

Importar el repositorio de GitHub en Vercel.

Configuracion del proyecto:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Output Directory: .next
```

El `Root Directory` es obligatorio porque el repositorio es un monorepo. Si queda como `.` Vercel intentara compilar desde la raiz del repositorio y fallara con el error `Couldn't find any pages or app directory`.

Variable de entorno en Vercel:

```env
DATABASE_URL=<connection-string-pooler-de-supabase>
DATABASE_SSL=true
JWT_ACCESS_SECRET=<secreto-largo-y-privado>
```

Para el prototipo actual no es obligatorio definir `NEXT_PUBLIC_API_URL`, porque en produccion la app usa `/api` y consume las API Routes desplegadas en Vercel.

Si mas adelante se despliega el backend Express en Render, agregar:

```env
NEXT_PUBLIC_API_URL=https://<tu-backend>.onrender.com/api
```

Cada push a `main` generara un despliegue de produccion si el proyecto esta conectado a GitHub.

## Validacion del prototipo

Flujo minimo para presentar el hito:

1. Abrir la URL publica de Vercel.
2. Entrar a `Login`.
3. Iniciar sesion con un usuario demo.
4. Abrir `Portal`.
5. Confirmar que se muestra informacion segun rol.
6. Abrir el healthcheck del backend y mostrar `database: connected`.

Usuarios demo esperados:

```text
demo@stcs.local / Demo1234!
terapeuta@stcs.local / Demo1234!
admin@stcs.local / Demo1234!
```

## Riesgo tecnico mitigado

Con este despliegue se puede demostrar:

- conexion real a base de datos remota
- persistencia fuera del entorno local
- frontend desplegado publicamente
- backend desplegado publicamente
- autenticacion protegida por token
- separacion entre frontend, backend y base de datos

## Pendientes despues del hito

- migraciones formales con Prisma o herramienta equivalente
- refresh tokens
- pruebas automatizadas del flujo de login
- dominio propio
- monitoreo de errores
