# A5 Plan de pruebas

El plan comprueba los requisitos de [A2](../requerimientos.md) y los criterios de las HU. Cada [caso](CASOS.md) define precondición, pasos, resultado esperado, obtenido y evidencia. Los reportes conservan fecha y revisión; no se mezclan pruebas físicas, aserciones y compilaciones en un porcentaje único.

## Alcance y herramientas

| Nivel | Qué se comprueba | Herramienta |
| --- | --- | --- |
| Unitario | Validación, permisos, sesiones, filtros, selección visible e integridad del catálogo | Node test runner |
| Integración | API → autorización → PostgreSQL → respuesta; medios y errores de dependencia | Runners aislados, PostgreSQL desechable y servidor TLS local |
| E2E | Formulario → petición → persistencia → respuesta visible, roles y sesión | Playwright Chromium/WebKit y axe |
| Calidad | Cobertura de servidor, carga, dependencias y revisión pasiva HTTP | c8, sonda Node, npm audit y ZAP |
| Física | Navegación, voz, Wi-Fi, reinicio, cola, ACK y separación de equipos | Ensayos manuales identificados por fecha y ejecutor; telemetría instrumentada solo en PC-01/02 |
| Aceptación | Pertinencia, vocabulario y recorrido del prototipo | Revisión por Zoom y protocolo PA-01–05 |

## Entrada

Identificar código, fecha, datos ficticios y dependencias. Las pruebas de escritura exigen servidor y PostgreSQL localhost, `STCS_TEST_ISOLATED=1` y base coincidente. Cada runner crea y elimina sus fixtures. Nunca ejecutar `verify:roles` contra Supabase ni contra un servidor local conectado a producción. [Comandos](../PRUEBAS.md).

## Planificados y ejecutados

La ampliación del candidato se fijó durante la implementación antes de su repetición. El catálogo ARASAAC añade tres unitarias y un recorrido por motor. Parte de las ejecuciones históricas precede a la consolidación documental del plan; esa limitación se conserva y no se cambia la fecha de los reportes.

| Nivel o escenario | Planificados | Ejecutados | No ejecutados | Resultado y evidencia |
| --- | --- | --- | --- | --- |
| Unitarias Node | 15 | 15 | 0 | Aprobadas; [21/11](reportes/arasaac-20261121/unitarias.xml), incluye las tres del catálogo |
| Integración TLS del adaptador | 1 | 1 | 0 | Aprobada; [21/11](reportes/adaptacion-20261121/unitarias-tls.xml) |
| Suite API | 1 | 1 | 0 | 387 comprobaciones, [21/11](reportes/arasaac-20261121/integracion.txt) |
| Resiliencia de servidor | 3 | 3 | 0 | Dos caídas de base y una reconexión del trabajador, mismo reporte |
| E2E Chromium/WebKit | 40 | 40 | 0 | 20 por motor; [Chromium](reportes/arasaac-20261121/chromium.xml), [WebKit](reportes/arasaac-20261121/webkit.xml) |
| Regresión Python voz | 8 | 8 | 0 | Aprobadas localmente; [reporte](reportes/adaptacion-20261121/voz-python.txt) |
| Carga por etapas | 2 | 2 | 0 | 5/10 clientes, 15 s; [reporte](reportes/adaptacion-20261121/carga-local.json) |
| Escenarios de ZAP pasivo autenticado | 13 | 13 | 0 | Respuestas esperadas, un medio residual; [reporte](reportes/adaptacion-20261121/seguridad-autenticada.json) |
| RLS/privilegios de observaciones | 1 | 1 | 0 | Conforme en base local; [consulta](reportes/adaptacion-20261121/permisos-tabla.json) |
| Recuperación sintética | 1 | 1 | 0 | SQL, medios y seguimiento; [reporte](reportes/adaptacion-20261121/recuperacion.json) |
| Escenarios físicos manuales | 9 | 9 | 0 | PF-01–08 y MC-WEB-01 comprobados manualmente el 15–16/11; sin conteos ni tiempos instrumentados. [Registro](FISICAS_20261115.md) |
| Medición de sincronización y TLS físico | 2 | 2 | 0 | PC-01/02, [18/11](CIERRE.md) |
| Compilación de firmware adaptable | 1 | 1 | 0 | Con credenciales ficticias; [reporte](reportes/adaptacion-20261121/compilacion-firmware.txt) |
| Ensayo físico CP-ADAPT-P01 | 1 | 1 | 0 | Una categoría/un pictograma, imagen, voz, Volver/Wi-Fi y edición de frase confirmados por Ignacio el 22/11; [registro final](reportes/comprobacion-final-20261121/README.md) |
| Aceptación PA completa según protocolo | 5 | 0 | 5 | Una sesión cualitativa realizada; no equivale a cinco ejecuciones con tiempos y errores. [Registro](../validacion/REGISTRO.md) |

El cumplimiento se expresa por nivel: 15/15 unitarias y 40/40 E2E no demuestran ≥95 % de todo el protocolo. Los casos no ejecutados conservan motivo y relación con R05 en [A9](../riesgos.md).

## Criterios de salida

La [repetición limpia del 22/11](reportes/revision-limpia-20261122/README.md) vuelve a comprobar API, resiliencia, cobertura, Chromium/WebKit, voz Python, TLS, carga, recuperación y ZAP sobre `a3d096f`. No aumenta la cantidad de casos planificados: es una nueva ejecución de los mismos escenarios. Los cinco PA completos siguen pendientes.

Los flujos funcionales deben cumplir los criterios y rechazar entradas/accesos inválidos. Cobertura: ≥70 % de líneas en servidor. Carga: p95 ≤2000 ms y errores <1 % por etapa. Seguridad: sin hallazgos altos/críticos sin tratar y justificación de medios residuales. Aceptación: decisión externa limitada a lo observado. Un resultado de laboratorio no certifica la versión publicada ni la interacción física.

Se conservan [resultados y defectos](RESULTADOS.md), reportes por revisión y los casos negativos de [A4](../trazabilidad.md). La regresión UTF-8 se ejecutó sobre una copia controlada: retirar la validación hizo fallar la prueba, sin modificar la fuente entregada.
