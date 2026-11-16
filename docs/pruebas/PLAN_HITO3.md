# Plan de cierre del Hito 3

Fecha de planificación: 16/11/2026. Se conserva PRUEBAS.md como procedimiento
previo de integración. Este plan nuevo no se presenta como anterior a los
ensayos físicos del 13–15/11. Los nuevos ensayos unitarios y de carga se
planifican aquí antes de ejecutarse.

## Entornos y entrada

Código identificable, Node de .node-version, dependencias del lockfile,
PostgreSQL descartable en 127.0.0.1:55432 y servidor aislado. Nunca usar
.env.local compartido para escribir pruebas. No usar Supabase para carga.
Datos ficticios; no se crea ni migra producción. El firmware no se cambia en
esta revisión. La aceptación externa requiere un profesional distinto del autor.

## Casos y herramientas

| Nivel | Casos previstos | Herramienta | Evidencia y criterio |
| --- | --- | --- | --- |
| Unitaria | 7 casos CP-RF03-U01–04, CP-RNF01-U01, CP-RF05-U01–02 | node:test sobre validadores reales | JUnit y cobertura; todos aprobados |
| Integración | Suite existente de permisos, medios, sesiones, dispositivos y límites | verify:roles mediante runner aislado | CI del SHA; 291 comprobaciones no equivalen a 291 historias ni a cobertura de líneas |
| Resiliencia | Caída DB y reconexión trabajador | runner aislado | 2 comprobaciones y recuperación, sin datos en nube |
| E2E manual | Web publicada → imagen/frase → ESP → edición; roles; reinicio; Wi-Fi | Navegador, ESP y observación humana | Evidencia fechada existente; no es E2E automatizado |
| Eficiencia | CP-RNF02-L01/L02: consultas portal, 5 y 10 clientes, 15 s cada etapa | sonda Node HTTP en localhost | p95 ≤ 2000 ms, errores < 1%; umbral técnico propuesto, no capacidad de producción |
| Seguridad | CP-RNF01-S01: dependencias de producción; permisos cubiertos por integración | npm audit + suite API | 0 altas/críticas sin tratar; auditoría de dependencias no equivale a DAST |
| Aceptación | Tareas del protocolo Zoom con tiempos, errores y ayudas | Profesional y planilla | Pendiente de agendar; no atribuir resultados al estudiante como aprobación externa |

Salida de entrega: enlaces accesibles, SHA y fecha por ejecución, escenario
esperado/obtenido, cero críticos confirmados sin plan, Must con casos positivos
y negativos, brechas visibles. Meta de rúbrica: ≥95% del plan y cobertura de
líneas ≥70% de lógica de negocio. Debe medirse el alcance total antes de afirmar
cumplimiento; cubrir solo validadores no prueba ese porcentaje en todo el backend.

Una prueba que no se ejecutó cuenta como pendiente, nunca como aprobada.
La demostración de prueba que detecta una regresión se hará en copia aislada:
retirar temporalmente el límite UTF-8, ejecutar CP-RF03-U02, observar fallo y
restaurar. No modificar main, producción ni firmware para esa demostración.
