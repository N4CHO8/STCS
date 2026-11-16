# A5 Plan de pruebas

Plan fechado el 16/11/2026 antes de las nuevas unitarias/carga y ampliaciones de software. Los ensayos físicos del 13–15/11 son anteriores: no se presenta este plan como previo a ellos.

## Entrada y entorno

Versión identificada, dependencias fijadas, datos ficticios y PostgreSQL/servidor localhost confirmados por los runners. Las escrituras se aíslan de Supabase. [Comandos](../PRUEBAS.md). La aceptación requiere un evaluador distinto del autor.

| Nivel | Casos y negativos | Criterio de salida |
| --- | --- | --- |
| Unitaria | CP-RF03-U01–04, CP-RNF01-U01, CP-RF05-U01–02: contrato, UTF-8, roles, eventos válidos/inválidos | 7 casos aprobados y JUnit |
| Integración | Sesiones, revocación/expiración, asignaciones, medios, informes, duplicados y concurrencia | Suite API aprobada en la misma base aislada |
| Resiliencia | Base inaccesible y recuperación del trabajador | JSON 503 y reconexión sin cerrar el proceso |
| E2E Chromium | Login/URL, roles, CRUD/duplicados, imagen inválida/válida, 401, error/reintento, móvil/logout | Diez recorridos sin errores críticos JS/CSP; firmware no incluido |
| Cobertura | Todos los TS del servidor, rutas API, proxy y módulos declarados, incluidos no ejecutados | ≥70% de líneas, detalle de ramas/funciones y mapas válidos |
| Carga CP-RNF02-L01/L02 | Portal local, 5/10 clientes, 15 s/etapa | p95 ≤2000 ms y errores <1%; no extrapolar a cloud |
| Seguridad | Dependencias, negativos de acceso y ZAP Baseline pasivo aislado | Tratar altos/críticos y justificar avisos residuales; no pentest completo |
| Físicas PF-01–08 | Pantalla/voz conectada, sincronización, cola, cortes, ACK, Wi-Fi y varias placas | Registro separado de esperado/observado y origen de confirmación |
| Aceptación PA-01–05 | Tareas, ayudas, errores y tiempos acordados con el profesional | Resultado y aprobación externa por alcance observado |

Regresión controlada: retirar temporalmente el guard UTF-8 en una copia y exigir que CP-RF03-U02 falle; restaurar sin cambiar producción. El build de cobertura usa webpack con mapas, y el build normal se comprueba aparte. ZAP usa araña/análisis pasivo sin autenticación sobre el laboratorio.

## Salida y límites

Cada ejecución registra fecha, herramienta, revisión, esperado/observado y evidencia accesible. La guía propone ≥95% del plan integral: no se calcula mezclando aserciones API, etapas y personas. Casos no ejecutados siguen pendientes. [Resultados y defectos](RESULTADOS.md), [protocolo externo](../validacion/PAUTA.md).
