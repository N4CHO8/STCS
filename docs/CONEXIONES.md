# Conexiones recuperadas — 2026-11-11

| Servicio | Recurso | Verificación |
| --- | --- | --- |
| GitHub | https://github.com/N4CHO8/STCS | main sigue a origin/main; GitHub CLI autenticado como N4CHO8 |
| Jira | https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS | Lectura de proyecto e incidencias verificada |
| Supabase | https://supabase.com/dashboard/project/mvdjzjwidygmhvhfcpgg | ACTIVE_HEALTHY; SQL y conexión PostgreSQL local verificados |
| Vercel | https://vercel.com/nachobenegas-projects/frontend | Conector autorizado; DATABASE_URL actualizada y redespliegue terminado |
| Web | https://0stcs0.vercel.app | /api/health responde HTTP 200, status ok y database connected |

## Recursos

- Vercel: equipo team_h97tpQiyMQi0hL7vOwhH7v4q, proyecto prj_sOmeASW2xHvevRaJdCsNujc432yc; aplicación en frontend/.
- Enlace local: frontend/.vercel/project.json, ignorado por Git.
- Jira: cloudId 84c0a843-624c-408d-9e8f-6b2a725bfb1c, clave TCS.
- Supabase STCS: mvdjzjwidygmhvhfcpgg, organización Ignacio Benegas.
- Producción inicial recuperada (histórica): commit 4d63c4cafda2136e0de21663811fcc6e204587ee, despliegue dpl_65oQu9gvGurXsw4UGko2nq8hHWnL.
- stcs-hito3-ensayo es un proyecto Vercel independiente. MecaniaOS es ajeno a STCS.

## Configuración

El propietario restableció la contraseña PostgreSQL. Se actualizó DATABASE_URL en Vercel (producción) y se redesplegó la misma versión, resolviendo el error PostgreSQL 28P01.

La raíz contiene .env.local, ignorado por Git, con DATABASE_URL, DATABASE_SSL y secretos aleatorios exclusivos de desarrollo para JWT_ACCESS_SECRET y STCS_DEVICE_API_KEY. Los secretos de sesión y dispositivo de producción se conservaron. Los dispositivos que apunten al servidor local deberán usar la clave local.

El entorno local conecta a la base existente de STCS: sus cambios de datos afectan esa misma base. Las variables de producción son secretos y Vercel no devuelve sus valores al consultarlas.

## Iniciar desarrollo

Desde la raíz:

```powershell
.\scripts\start-dev.ps1
```

Abrir http://localhost:3000. Detener con Ctrl+C en la terminal correspondiente.
El script usa npm instalado o el preparado en %LOCALAPPDATA%/STCS-tools/npm. Node.js debe estar disponible en PATH.

También se puede entrar a frontend/ y ejecutar npm run dev si npm está en PATH.

## Recuperación inicial (antes de las correcciones)

- Dependencias instaladas desde package-lock.json: 164 paquetes.
- Compilación de producción y tipos completados.
- SELECT 1 usando la nueva contraseña desde este equipo.
- Servidor de desarrollo iniciado; /api/health local devuelve conexión correcta.
- /api/health de producción devuelve conexión correcta tras el redespliegue.
- Archivos de configuración ignorados por Git; temporales de contraseña eliminados.

Durante la recuperación inicial no se ejecutaron seeds ni migraciones. Vercel CLI local sigue sin sesión; las operaciones remotas se realizaron con el conector autorizado.

## Correcciones y correo — 2026-11-11

- Migración audit_hardening_sessions_and_approvals aplicada: sesiones revocables, limitación de intentos, estado de aprobación, verificación de correo y claves por dispositivo. Es aditiva y no reemplaza fichas, informes ni eventos. Las asignaciones históricas se conservaron.
- SMTP personalizado guardado y habilitado. Gmail, puerto 465, nombre de remitente STCS. La contraseña la configura el propietario directamente; no se almacena en Git ni en Vercel.
- Plantillas de primera confirmación y Magic link or OTP actualizadas para mostrar el código. Auth email habilitado y autoconfirmación desactivada.
- Variables SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY y STCS_LEGACY_DEVICE_CODE configuradas en el proyecto frontend de Vercel. Los secretos existentes se conservaron.
- PostgreSQL usa verificación TLS con la CA pública de Supabase. Suite de escritura solo sobre Docker local; el entorno de desarrollo habitual sigue compartiendo Supabase.
- Build, tipos y 107 comprobaciones aisladas aprobados. Firmware completo compilado. Detalles y límites: PRUEBAS.md y ARREGLOS_AUDITORIA.md.
- Activación real del propietario completada: confirmó recepción y entrada al panel. Se verificó en Supabase credential_verified_at, rol admin, cuenta activa y sesión vigente.

## Publicación verificada

- Código publicado en main: [82fd571](https://github.com/N4CHO8/STCS/commit/82fd571c0ac2ccbcc73844955e8713f4fb2cee96).
- Vercel: dpl_3PYEUmiPddPZP41bJ759WktJ9QE5, producción READY, asociado a ese SHA y al dominio 0stcs0.vercel.app.
- Dominio: /login y /activate devuelven 200. /api/health devuelve 200 con database connected. Las rutas de portal, eventos, registros, emociones y configuración de dispositivo rechazan solicitudes anónimas con 401.
- La cuenta administrativa histórica se preparó para el correo real indicado por el propietario. La credencial demo está bloqueada; la contraseña se establece mediante verificación por correo. No se modificaron fichas, informes ni eventos clínicos.
- Por decisión del propietario, solo el administrador usa correo real en esta etapa. Los otros roles se prueban con las cuentas demo de /demo, mediante el login habitual y sin activación. La futura incorporación de personas reales conserva la verificación y aprobación clínica; las pruebas físicas del ESP siguen pendientes.

## Cuentas demo en Supabase

Por solicitud del propietario, se sustituyó la demo local por cuentas con login y persistencia reales. Solo el administrador conserva su correo y credencial personal. Las tres cuentas demo se aprovisionan separadas de las cuentas históricas, sin alterar sus fichas ni sus contraseñas. La marca is_demo limita la excepción de activación y el acceso a registros ficticios. /demo muestra los accesos; todos ingresan por /login.

La migración cloud_demo_accounts añade la marca y restricciones de separación, sin habilitar acceso directo anon/authenticated. Las cuentas futuras reales siguen requiriendo correo verificado. El administrador dispone de un enlace de activación para copiar y enviar al titular. No se enviaron invitaciones a terceros durante estas pruebas.
