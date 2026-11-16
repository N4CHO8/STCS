# Ejecutar las pruebas de STCS

[Plan](pruebas/PLAN.md), [resultados y defectos](pruebas/RESULTADOS.md), [calidad](calidad/README.md) y [pruebas físicas](pruebas/FISICAS_20261115.md).

## Laboratorio aislado

Requiere Node de `.node-version`, npm y Docker Desktop iniciado. Ninguna prueba de escritura debe apuntar a Supabase o al servidor local habitual.

Desde la raíz, crear solo el contenedor descartable de pruebas:

```powershell
docker run -d --rm --name stcs-audit-tests -p 127.0.0.1:55432:5432 --tmpfs /var/lib/postgresql/data -e POSTGRES_PASSWORD=stcs-isolated-tests postgres:17
cd frontend
$env:STCS_TEST_ISOLATED='1'
$env:STCS_TEST_DB='stcs_release_tests'
npm ci
npm run test:prepare
npm run test:unit
npm run test:coverage
npm run build
npm run typecheck
npm run test:isolated
node node_modules/playwright/cli.js install chromium
npm run test:e2e
```

`test:prepare` aplica esquema/migraciones únicamente a la base local autorizada, sin seeds. Los runners fijan localhost y exigen confirmación de que servidor y PostgreSQL son el mismo laboratorio antes de crear fixtures o hacer login. Las filas ficticias se eliminan al terminar; los runners rechazan servidores desconocidos y entornos remotos. No configurar STCS_TEST_ISOLATED en Vercel.

La contraseña del comando es exclusiva del contenedor descartable. Para retirarlo: `docker stop stcs-audit-tests`. Cerrar la terminal de prueba o retirar sus variables antes de usar otro entorno.

## Alcance y herramientas

| Comando | Comprobación |
| --- | --- |
| test:unit | Validadores reales, contrato UTF-8, roles y eventos |
| test:coverage | API + resiliencia sobre build de medición y cobertura del servidor definido |
| test:isolated | Sesiones, permisos, medios, asignaciones, límites, idempotencia y caída DB |
| test:e2e | Diez recorridos Chromium con interfaz/API/base y errores JS/CSP |
| node scripts/measure-quality.mjs | Carga local de portal con 5/10 clientes y 15 s por etapa |
| node scripts/run-web-quality.mjs --dast | ZAP Baseline pasivo sobre el servidor ficticio |

La sonda de carga exige su fixture local preexistente en otra base de laboratorio; no usa una sesión real ni la prepara el bloque anterior. Consultar [configuración y límites de reproducción](calidad/README.md) antes de ejecutarla. `verify:roles` no se invoca contra servidores arbitrarios: exige localhost, STCS_TEST_ISOLATED=1 y coincidencia explícita de la base.

No existe script ESLint: tipos y formato se registran como tales. La suite de correo ficticio no prueba entregabilidad real; Chromium móvil no es Safari/iPhone físico; el build no prueba pantalla/audio. Las pruebas físicas y la aceptación externa se documentan por separado.
