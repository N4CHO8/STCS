# Verificación aislada de STCS

No ejecutar pruebas de escritura sobre Supabase, sobre datos reales ni sobre el servidor local habitual: este último usa la misma base que producción.

## Suite reproducible

Requisitos: Node 24, npm y Docker Desktop iniciado. Desde la raíz, crea únicamente el contenedor descartable:

```powershell
docker run -d --rm --name stcs-audit-tests -p 127.0.0.1:55432:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=stcs-isolated-tests postgres:17
cd frontend
npm ci
npm run test:prepare
npm run typecheck
npm run build
npm run test:isolated
```

`test:prepare` aplica el esquema y las migraciones exclusivamente al contenedor fijo de localhost. No lee DATABASE_URL del proyecto, no ejecuta seeds y no elimina tablas.

`test:isolated` inicia la compilación de Next en 127.0.0.1:3100 con PostgreSQL local y un transporte de correo ficticio en 3101. No envía correos ni crea usuarios en Supabase Auth. Tras la suite comprueba respuestas JSON 503 usando otro servidor, en 3102, con una base deliberadamente inaccesible.

La suite crea filas identificadas con UUID y elimina sus propias filas al terminar. El servidor debe confirmar mediante `/api/health` que usa el mismo PostgreSQL aislado antes de cualquier fixture o login. `verify:roles` también exige STCS_TEST_ISOLATED=1 y rechaza direcciones HTTP y PostgreSQL remotas. No configurar esta variable en Vercel.

Para retirar el contenedor después:

```powershell
docker stop stcs-audit-tests
```

La contraseña indicada arriba pertenece únicamente al contenedor descartable; no es una credencial del proyecto.

## Qué comprueba

- Privacidad por rol y rechazo del portal adulto a registros child.
- Asignaciones ajenas, pendientes, aprobadas y autoaprobación bloqueada.
- Bloqueo del cambio de correo y de contraseña desde administración.
- Activación, recuperación y contraseña con espacios; códigos inválidos y entradas malformadas.
- Sesiones revocadas, cuentas desactivadas, JWT expirados o con formato incorrecto.
- Informes idempotentes y edición de ficha; restricciones de las rutas antiguas.
- Pictogramas: crear, editar, retirar, duplicados y solicitudes concurrentes.
- Credenciales limitadas al dispositivo, eventos repetidos y pictogramas retirados.
- Emociones del ESP, fecha local de Santiago e historial mayor de 100 eventos.
- Ausencia de inicialización o reescritura de usuarios durante login.
- Errores de base de datos como 503, sin cerrar sesión como si fueran credenciales inválidas.

## Límites

Las pruebas con transporte de correo ficticio validan la lógica del portal, no la entrega real. Esta exige completar una activación desde la nube y recibir el código en el buzón real. No introducir contraseñas u OTP en el chat.

La compilación no valida pantalla, audio, WiFi, almacenamiento NVS, pérdida de energía ni entrega de eventos en un ESP físico. La prueba de esos comportamientos requiere el dispositivo y debe registrarse por separado. Gmail SMTP tiene límites y advertencias de entregabilidad; guardar su configuración no prueba que un destinatario haya recibido el mensaje.

No hay un script de ESLint configurado. Registrar revisión de tipos y formato como tales, sin llamarlas lint.

## Revisión visual local

Para mantener los fixtures durante una revisión en navegador, crear antes `.codex-work` en la raíz y ejecutar el runner con STCS_TEST_UI=1. Los correos ficticios se escriben en `.codex-work/ui-fixtures.json`, ignorado por Git. El runner conserva la base durante hasta cinco minutos; crear `.codex-work/ui-release` termina la pausa y ejecuta la limpieza. Retirar el archivo de liberación previo antes de repetir esa revisión. Este modo sigue exigiendo PostgreSQL y servidor aislados.

## Pruebas de demo

`npm run test:demo` ejecuta cinco casos contra el transporte real de simulación: proyecciones por rol, publicación y edición compartidas, pictogramas con límites, asignaciones/aprobaciones e independencia de red y sesión real. No requiere una base de datos. La revisión en Chrome cubrió los cuatro perfiles, edición de pictograma por docente, informe del especialista compartido como orientación y edición de ficha por apoderado, sin errores de consola. La suite de 107 comprobaciones del servidor sigue pasando con este cambio.
