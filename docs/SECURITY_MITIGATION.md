# Mitigacion de riesgo tecnico: acceso a informacion sensible

Este documento resume la mitigacion implementada para demostrar que STCS protege el acceso a informacion sensible, no solo mediante inicio de sesion, sino tambien mediante controles programados de autorizacion.

## Riesgo mitigado

El riesgo tecnico identificado es que un usuario autenticado intente acceder a informacion que no le corresponde, por ejemplo registros emocionales o conductuales de otro nino.

La mitigacion se implementa en el backend y en las API Routes de Next.js, para que la proteccion no dependa solo de ocultar botones en el frontend.

## Controles implementados

- Autenticacion con JWT firmado, expiracion y validacion explicita del algoritmo `HS256`.
- Roles de usuario: `guardian`, `therapist`, `admin` y `child`.
- Tabla `user_access` para definir que adulto esta asignado a que nino.
- Validacion de permisos antes de leer o crear registros.
- Filtrado de consultas SQL por usuario autenticado, rol y asignacion.
- Respuesta `401` cuando no existe token valido.
- Respuesta `403` cuando el usuario tiene token valido, pero no tiene permiso sobre el dato solicitado.

## Modelo de acceso

- `admin`: puede auditar registros de todos los usuarios.
- `child`: solo puede acceder a su propia informacion.
- `guardian`: solo puede acceder a los ninos asignados en `user_access`.
- `therapist`: solo puede acceder a los ninos asignados en `user_access`.

## Datos demo

Usuarios para demostrar el flujo:

```text
demo@stcs.local / Demo1234!       -> guardian
terapeuta@stcs.local / Demo1234!  -> therapist
admin@stcs.local / Demo1234!      -> admin
```

Ninos de prueba:

```text
44444444-4444-4444-4444-444444444444 -> Mateo Rojas, asignado al apoderado demo
55555555-5555-5555-5555-555555555555 -> Lucas Vargas, no asignado al apoderado demo
```

## Demostracion automatizada

PowerShell:

```powershell
.\scripts\demo-security.ps1
```

macOS/Linux:

```bash
./scripts/demo-security.sh
```

Por defecto los scripts usan:

```text
https://0stcs0.vercel.app/api
```

Para probar localmente:

```powershell
$env:STCS_API_URL="http://localhost:4000/api"
.\scripts\demo-security.ps1
```

La evidencia esperada es:

- Login correcto con JWT.
- Consulta al nino asignado: `200 OK`.
- Consulta al nino no asignado: `403 Forbidden`.

## Frase sugerida para el informe

La mitigacion no se limita al inicio de sesion. STCS incorpora controles programados de autorizacion en el servidor, validacion de roles, verificacion de asignacion entre usuarios y filtrado seguro en las consultas a la base de datos. De esta forma, aunque un usuario autenticado intente acceder manualmente a informacion fuera de su perfil, la API bloquea la solicitud con `403 Forbidden`.
