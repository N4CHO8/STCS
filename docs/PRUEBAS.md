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

## Pruebas de cuentas demo en la nube

`npm run test:demo` ejecuta la suite completa aislada. Incluye las cuentas demo en PostgreSQL: login sin activación, sesiones, edición de fichas, informes, pictogramas, persistencia entre sesiones, aprovisionamiento repetido sin reiniciar datos, rutas antiguas y rechazo de cruces demo/real. Comprueba también que el indicador no se confíe al correo ni al JWT, y que las restricciones de base impidan convertir demos en administradores. Último resultado: 159 comprobaciones de integración más dos de base no disponible (161 en total).

## Aprovisionamiento explícito

Pruebas de Luis y dispositivos privados: `verify-private-profile.mjs` amplía la
suite a 208 peticiones/comprobaciones de integración y dos de caída de base
(210 en total). Comprueba credenciales privadas sin activación, niño bloqueado,
administrador numerado, proyección técnica del dispositivo para docentes sin
datos clínicos, alimentación USB sin batería ficticia, rechazos entre los tres
entornos, restricciones de base e idempotencia del evento. También simula dos
perfiles/dos dispositivos para el especialista, con apoderado/docente limitados
a sus asignaciones. Es simulación de hardware API en la base descartable, no
una afirmación de haber conectado un segundo ESP físico.

El contrato del firmware instalado exige `ack.accepted: true` y la confirmación
del identificador externo después de persistir un evento. Se comprueba que
un reintento devuelve el mismo registro y se confirma sin duplicarlo, mientras
que un evento inválido devuelve 400 sin confirmación positiva. La inspección
del ESP detectó una cola retenida por la ausencia de ese campo en la API.

Actualización 12 de noviembre: sesiones del navegador en cookie HttpOnly, control
de origen, sustitución/revocación de sesión y ausencia de token en JSON. La suite
incluye nueve peticiones adicionales de cookies/CSRF: 168 comprobaciones de
integración más dos de base caída, 170 en total. Los helpers de prueba inspeccionan
Set-Cookie para probar también el contrato Bearer de herramientas existentes;
el frontend no recibe ese token. Workflow reproducible: `.github/workflows/verify.yml`.

Las fixtures históricas Alex/Luna solo se aprovisionan durante la suite aislada. El helper exige STCS_TEST_ISOLATED=1 y PostgreSQL en localhost; se comprueba que rechace una conexión remota antes de consultar. El comando demo:provision está retirado y rechaza --apply. No crea ni restaura demos en Supabase.

La suite comprueba que /demo muestre exclusivamente los tres accesos actuales de Luis, sin credenciales antiguas, y usa sus contraseñas actuales en las fixtures locales para probar el login. Las credenciales publicadas son deliberadamente públicas y solo sirven para demostración; las futuras cuentas reales requieren activación y contraseñas elegidas por sus titulares.
