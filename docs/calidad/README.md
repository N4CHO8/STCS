# A6 Seguridad eficiencia y cobertura

Corte de pruebas del 16/11/2026. [Proveniencia por SHA y herramienta](../pruebas/reportes/cierre-20261116.json). Los ensayos escriben únicamente en PostgreSQL descartable y archivos temporales; no prueban sobre producción.

## Seguridad dinámica

ZAP 2.17.0 Baseline mediante imagen Docker por digest, araña y análisis pasivo sobre app local ficticia. Reportes de herramienta: [antes](dast/antes.json), [después JSON](dast/zap.json), [después HTML](dast/zap.html). No hay sesión autenticada en el escáner y no es pentest exhaustivo.

El primer recorrido produjo ocho grupos de avisos (dos medios y seis bajos), sin altos. Se añadieron CSP con nonce por respuesta para scripts, protección anti-frame, nosniff, políticas de origen/referrer/permisos y se retiró X-Powered-By. Se conserva verificación CSRF existente. Los HTML son dinámicos porque un nonce no puede reutilizarse en HTML estático; los recursos estáticos siguen siendo cacheables. No se activó facturación ni se cambió la infraestructura.

Resultado posterior: **0 grupos altos, 1 medio y 0 bajos**, además de 3 informativos. El medio restante es **CSP: style-src unsafe-inline**. Es una excepción de compatibilidad para estilos generados por React/gráficos, no para scripts: script-src exige nonce y strict-dynamic en producción. La app no acepta CSS/HTML arbitrario en esos campos; mantiene validación y escape de texto. El riesgo residual de estilos inline se reconoce y se revisará si cambia esa superficie. No se justifica como inexistente ni como garantía contra XSS.

La auditoría completa npm después de incorporar las herramientas informa **cero vulnerabilidades conocidas**: [reporte](npm-audit-completo.json). Este resultado de dependencias no sustituye DAST ni revisión de autorización. La suite API y el navegador comprueban roles y acceso a otros perfiles.

Referencias técnicas: [CSP en Next.js](https://nextjs.org/docs/app/guides/content-security-policy), [ZAP Baseline](https://www.zaproxy.org/docs/docker/baseline-scan/).

## Eficiencia local

[Reporte generado](carga-local.json). Portal autenticado, 15 s por etapa, pausa de 50 ms por cliente, Next build de producción y PostgreSQL en la misma máquina. Umbral técnico previsto: p95 ≤2000 ms y errores <1%; no ratificado como indicador de valor por stakeholder.

| Clientes | Consultas | p95 | Errores | Resultado |
| --- | --- | --- | --- | --- |
| 5 | 731 | 63.48 ms | 0 | Aprobado |
| 10 | 1331 | 69.42 ms | 0 | Aprobado |

No extrapolar a Vercel, subidas, síntesis en frío, flota ESP o usuarios humanos. La sesión de carga se revoca al terminar y el servidor local se detiene.

## Cobertura de servidor

**88.89% de líneas**, 74.4% de ramas y 97.39% de funciones. Incluye todos los TS de src/lib/server, rutas src/app/api, proxy.ts, permissions.ts y media-contract.ts, contando archivos sin ejecución. Excluye UI, C++, firmware y función Python. No es 100% del proyecto ni demuestra todos los escenarios.

[Resumen de herramienta](../pruebas/reportes/cobertura-negocio/coverage-summary.json), [detalle](../pruebas/reportes/cobertura-negocio/coverage-final.json), [metadatos](../pruebas/reportes/cobertura-negocio/metadatos.json). c8 usa V8 sobre build webpack sin minificar. El normalizador convierte URLs virtuales propias a rutas de archivo; no cambia rangos, contadores ni fuentes. Se rechaza una conversión que pierda las funciones de portal.ts. El build normal Turbopack tiene sus propios E2E.

## Comandos reproducibles

Con Docker local documentado, desde frontend:

```powershell
$env:STCS_TEST_ISOLATED='1'
$env:STCS_TEST_DB='stcs_release_tests'
npm run test:prepare
npm run test:coverage
npm run build
node node_modules/playwright/cli.js install chromium
npm run test:e2e
# DAST solo en este servidor ficticio y aislado:
node scripts/run-web-quality.mjs --dast
```

No introducir URLs de producción ni credenciales reales. La sonda fija localhost, comprueba la base exacta y exige que esté vacía antes de crear fixtures; elimina únicamente sus IDs al terminar. CI ejecuta cobertura, API y E2E; ZAP es una comprobación explícita separada por duración y alcance.

La sonda histórica `measure-quality.mjs` usa otro laboratorio fijo: puerto 3300 y base local `postgres`, con la cuenta ficticia `especialista.prueba01@stcs.test` ya preparada. `test:prepare` con STCS_TEST_DB=stcs_release_tests no prepara esa cuenta. Por eso no se presenta la carga como parte automática del comando anterior ni de CI; la preparación de un laboratorio de carga desde cero sigue registrada en TCS-88. El reporte conserva las condiciones del ensayo realmente ejecutado.
