# A6 Seguridad y eficiencia

Comparación con los escenarios [H3-RNF01/H3-RNF02 de A2](../requerimientos.md#seguridad-y-eficiencia-escenarios-principales). Las mediciones de carga, cobertura y ZAP del candidato son del 21/11. La auditoría de dependencias y la lectura anónima de Supabase conservan su corte del 16/11. TLS del adaptador se repitió el 21/11.

El 18/11 se añadió evidencia física del ESP: [PC-01/02](../pruebas/reportes/esp-20261118/README.md). Tres conexiones TLS no confiables fueron rechazadas sin petición HTTP y el control confiable sincronizó. Seis cambios LAN se aplicaron en 7,836–16,889 s; no garantizan el KPI histórico ≤15 s ni el tiempo de los servicios cloud. Es distinto del TLS de PostgreSQL y de la carga HTTP local del 16/11.

## Medida pedida frente a resultado

**Repetición sobre commit integrado, 22/11:** `a3d096f` aprobó nuevamente la cobertura (90,05 % líneas), TLS y los 13 escenarios ZAP; se conservó un medio CSP y un informativo, sin altos. En este PC (Ryzen 5 3600), carga dio p95 26,20/40,87 ms y cero errores para 5/10 clientes. [Reporte, entorno y comandos](../pruebas/reportes/revision-limpia-20261122/README.md). La tabla siguiente conserva las mediciones históricas del 21/11 para distinguir los ensayos.

| Escenario | Medida pedida en A2 | Resultado observado | Evaluación y evidencia |
| --- | --- | --- | --- |
| H3-RNF02 Eficiencia, 5 clientes | p95 ≤2000 ms y errores <1%; portal local autenticado, 15 s, pausa 50 ms | 830 peticiones; p95 **56,47 ms**; 0 errores, **0%**; duración real 15,069 s | Cumple la etapa; [reporte generado](../pruebas/reportes/adaptacion-20261121/carga-local.json) |
| H3-RNF02 Eficiencia, 10 clientes | Mismo umbral y condiciones, 10 clientes | 1542 peticiones; p95 **58,07 ms**; 0 errores, **0%**; duración real 15,049 s | Cumple la etapa; mismo reporte. No demuestra capacidad de producción o flota |
| H3-RNF01 Seguridad, accesos seleccionados | 100% de solicitudes con respuesta esperada; 0 entregas de datos restringidos en los escenarios revisados | ZAP autenticado: **13/13** estados esperados; 8 respuestas permitidas y **5/5 denegadas**, cuatro 403 y un 401. Las proyecciones de datos se contrastan además en API/E2E | Conforme en casos seleccionados; [13 comprobaciones](../pruebas/reportes/adaptacion-20261121/seguridad-autenticada.json), [API](../pruebas/reportes/arasaac-20261121/integracion.txt), [E2E](../pruebas/reportes/arasaac-20261121/chromium.xml). Los estados HTTP por sí solos no prueban privacidad del contenido |
| H3-RNF01 Seguridad, escáner | 0 avisos altos/críticos sin tratar; medios residuales explicados | ZAP pasivo autenticado: **0 altos/críticos**, **1 medio**, **0 bajos**, **1 informativo** | Cumple el criterio acotado con riesgo medio residual, no «sin riesgos». [Reporte ZAP](../pruebas/reportes/adaptacion-20261121/seguridad-autenticada.json); justificación más abajo |
| H3-RNF01 Seguridad, dependencias | 0 vulnerabilidades altas/críticas sin tratar en auditoría de dependencias | npm audit: **0 vulnerabilidades conocidas** en las dependencias examinadas | [Reporte de herramienta](../pruebas/reportes/arreglos-locales-20261116/npm-audit.json). No prueba ausencia de vulnerabilidades desconocidas |
| H3-RNF01 Seguridad, TLS/RLS | Rechazar certificado no confiable y no permitir lectura anónima de filas protegidas | TLS aprobado; API pública de Supabase sin filas accesibles en las **14 tablas** verificadas | [TLS repetido el 21/11](../pruebas/reportes/adaptacion-20261121/unitarias-tls.xml), [metadatos](../pruebas/reportes/a5-revision-20261117/metadatos.json), [lectura anónima](../pruebas/reportes/arreglos-locales-20261116/supabase-readonly.json). GET de identificadores, sin identidades seleccionadas ni escrituras cloud |

[Versiones/hashes](../pruebas/reportes/arreglos-locales-20261116/manifest.json) y [recuento contrastado](comparacion-a2-20261117.json). El estado de publicación está en [DEFENSA](../DEFENSA.md).

## Cómo se midió la eficiencia

La [sonda Node](../../frontend/scripts/measure-quality.mjs) consulta el portal autenticado, con 5/10 clientes, 15 s por etapa y pausa de 50 ms. Usa Next build y PostgreSQL en el mismo computador, con un perfil sin pictogramas. Crea/retira sus fixtures y confirma localhost:55432/stcs_release_tests antes de escribir.

El reporte identifica Node v24.22.1, Intel i5-12450HX, 12 CPU lógicas y unos 16 GB de RAM. Ordena las duraciones y toma p95 por rango más cercano; error = respuesta fallida/incorrecta dividida por total. Comprueba JSON y perfil esperado, no solo HTTP 200.

Las etapas cumplen A2. La muestra no representa producción, carga prolongada, síntesis en frío, subidas ni una flota ESP; tampoco mide tiempo de sincronización web → ESP.

## Qué cubre la seguridad

ZAP 2.17.0, imagen fijada por digest, recibe peticiones reales por proxy con cuatro roles ficticios y anónimo. Comprueba 13 respuestas y analiza pasivamente diez activos. No ejecuta ataques activos ni recorre exhaustivamente toda la SPA. API/E2E complementan los estados HTTP comprobando proyecciones y acceso ajeno.

La lectura anónima Supabase consulta solo IDs de 14 tablas del proyecto fijo, sin escrituras. TLS utiliza un servidor local autofirmado. RLS se prueba además con filas ficticias en base descartable. Son capas distintas, no una única prueba de seguridad absoluta. [Casos y código](../pruebas/CASOS.md).

## Hallazgo medio residual: CSP `style-src unsafe-inline`

| Aspecto | Justificación y tratamiento |
| --- | --- |
| Qué detectó ZAP | La política permite estilos inline. ZAP lo clasifica como medio, no alto; no es evidencia por sí sola de una explotación |
| Dónde está | [proxy.ts](../../frontend/src/proxy.ts), directiva `style-src 'self' 'unsafe-inline'`. La política de scripts usa nonce por respuesta y `strict-dynamic`; no se autorizan scripts inline de la misma forma |
| Por qué se conserva en esta versión | La interfaz utiliza estilos dinámicos inline, por ejemplo el desplazamiento de páginas en [views.tsx](../../frontend/src/components/stcs/views.tsx), además de componentes gráficos. Retirar la directiva exige migrarlos/verificarlos; no se elimina a ciegas ni se afirma que sea imposible restringirlos |
| Qué reduce el riesgo | Validación de campos, colores de catálogo, escape de texto de React, permisos en servidor y CSP de scripts. Son controles complementarios; no garantizan ausencia de inyección |
| Qué riesgo deja | Si apareciera una vía para inyectar marcado/estilos, esta parte de la CSP no bloquearía estilos inline y podría facilitar alteración visual o engaño de interfaz. No equivale a permiso general para ejecutar JavaScript ni a garantía contra XSS |
| Decisión y seguimiento | Riesgo técnico residual documentado para el cierre, sin aprobación profesional atribuida. Evaluar nonce/hash o retirada de dependencias de estilos inline, probar navegación/gráficos y repetir ZAP antes de declarar corregido. Revisar también si cambia la superficie de entrada |

El criterio de A2 exige tratar o justificar medios residuales. Este aviso permanece abierto y documentado; el informativo «Modern Web Application» no exige corrección. [D07](../pruebas/RESULTADOS.md#defectos-y-tratamiento), [R04/DT-01](../riesgos.md).

## Cobertura como dato complementario de calidad

90,05% de líneas, 78,16% de ramas y 97,58% de funciones, frente al mínimo de 70% de líneas. Incluye servidor/API/proxy y contratos declarados; excluye UI, firmware y Python. [Resumen](../pruebas/reportes/adaptacion-20261121/cobertura/coverage-summary.json), [metadatos](../pruebas/reportes/adaptacion-20261121/metadatos.json). c8 mide el build webpack con mapas; build habitual y E2E se verifican aparte.

## Reproducir de forma aislada

Preparar el contenedor de [PRUEBAS](../PRUEBAS.md), con Docker Desktop. Desde frontend:

```powershell
$env:STCS_TEST_ISOLATED='1'
$env:STCS_TEST_DB='stcs_release_tests'
npm ci
npm run test:prepare
npm run build
npm run test:load
npm run test:dast
npm audit --json
npm run test:security
```

Puertos libres: 3300 para carga y 8099 para ZAP. Los runners usan laboratorio propio, sin cuentas preexistentes. Para API/RLS y cobertura: `npm run test:coverage`. La comprobación publicada de solo lectura tiene sus [condiciones específicas](../pruebas/ARREGLOS_LOCALES_20261116.md#reproducir-sin-datos-reales).

Conservar reportes nuevos con fecha/revisión sin sobrescribir los anteriores ni publicar cookies. CI no ejecuta automáticamente carga, DAST y recuperación. npm puede cambiar con su base de avisos.

## Reportes históricos conservados

[Versiones](../pruebas/reportes/cierre-20261116.json), [carga](carga-local.json), [npm](npm-audit-completo.json), [ZAP antes](dast/antes.json), [después JSON](dast/zap.json) y [HTML](dast/zap.html).

El corte anterior tuvo ZAP sin autenticación (0 altos, 1 medio, 0 bajos y 3 informativos), carga p95 63,48/69,42 ms y cobertura 88,89%. Conserva condiciones/revisión propias; no se calcula una mejora causal frente al fixture ampliado.

## Repetición del candidato — 21/11

[Reporte del candidato](../pruebas/reportes/adaptacion-20261121/README.md): p95 56,47/58,07 ms frente a ≤2000 ms, cero errores frente a <1 %, con 5/10 clientes durante 15 s y perfil local sin pictogramas. No mide capacidad cloud o una flota física.

El nuevo ZAP pasivo autenticado comprueba 13 respuestas y mantiene 0 altos, 1 medio CSP y 1 informativo. Los negativos de servidor de la ampliación y RLS/privilegios de la nueva tabla se comprobaron por separado. Cobertura de líneas del servidor: 90,05 %. Recuperación de selección, fecha y observación conforme en base aislada. Se conservan los reportes anteriores con sus fechas; el residual CSP y la recuperación real de nube siguen abiertos.
