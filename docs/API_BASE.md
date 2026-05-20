# API base de STCS

## URL base

- Desarrollo local: `http://localhost:4000/api`

## Endpoints disponibles

### Health

- `GET /health`
  - valida que la API este en linea y que PostgreSQL responda

### Auth

- `GET /auth`
  - devuelve una vista general del modulo
- `POST /auth/register`
  - crea un usuario base
- `POST /auth/login`
  - valida credenciales y devuelve un token JWT
- `GET /auth/me`
  - devuelve el usuario autenticado

Header requerido para rutas protegidas:

```text
Authorization: Bearer <token>
```

Body sugerido para registro:

```json
{
  "fullName": "Nombre Apellido",
  "email": "usuario@stcs.dev",
  "password": "Demo1234!"
}
```

### Emotions

- `GET /emotions`
  - lista los registros de emociones recientes
- `POST /emotions`
  - crea un registro emocional base

Body sugerido:

```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "emotion": "tranquilo",
  "intensity": 4,
  "note": "Se adapto bien a la actividad"
}
```

### Records

- `GET /records`
  - lista los registros observacionales recientes
- `POST /records`
  - crea un registro base de comportamiento o seguimiento

Body sugerido:

```json
{
  "userId": "11111111-1111-1111-1111-111111111111",
  "category": "conducta",
  "title": "Participacion en actividad",
  "description": "Se mantuvo atento y solicito apoyo visual"
}
```

### Portal protegido

- `GET /portal/resumen`
  - requiere token valido y devuelve informacion basica de la sesion
- `GET /portal/guardian`
  - requiere token valido y rol `guardian`
- `GET /portal/especialista`
  - requiere token valido y rol `therapist`
- `GET /portal/admin`
  - requiere token valido y rol `admin`

## Usuario demo

Despues de ejecutar `docker compose down -v` y volver a levantar el entorno, se crean usuarios de apoyo para probar autenticacion y roles:

- `guardian`
  - email: `demo@stcs.local`
  - password: `Demo1234!`
- `therapist`
  - email: `terapeuta@stcs.local`
  - password: `Demo1234!`
- `admin`
  - email: `admin@stcs.local`
  - password: `Demo1234!`

Este set de usuarios existe solo para pruebas locales del prototipo de mitigacion del riesgo tecnico y para la demo de login dentro de la app.
