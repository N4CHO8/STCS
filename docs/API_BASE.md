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
  - valida credenciales y devuelve un token de desarrollo

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

## Usuario demo

Despues de ejecutar `docker compose down -v` y volver a levantar el entorno, se crea un usuario de apoyo:

- email: `demo@stcs.local`
- password: `Demo1234!`

Este usuario existe solo para pruebas locales y debe reemplazarse por un flujo de autenticacion real en futuras historias.
