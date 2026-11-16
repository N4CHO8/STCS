# A5 Resultados e interpretación

**Actualización posterior:** [cierre automatizado del 16/11](CIERRE_20261116.md), con cobertura ampliada, E2E y DAST. La sección siguiente conserva la ejecución inicial y sus límites de aquel momento.

Fecha de cierre parcial: 16/11/2026. El plan nuevo se escribió antes de unitarias/carga; no se hace pasar por plan previo a las pruebas históricas.

| Nivel | Esperado | Obtenido / evidencia | Interpretación y límite |
| --- | --- | --- | --- |
| Unitaria | 7 casos positivos, negativos y bordes de H3-RF03/H3-RF05/H3-RNF01 aprobados | [JUnit](reportes/unitarias.xml), [salida y cobertura](reportes/unitarias.txt) | 7/7 aprobados, 100% en tres módulos seleccionados; no cobertura total del backend |
| Regresión deliberada | Fallar al retirar protección UTF-8 | [regresion.json](reportes/regresion.json), salida 1 detectada en copia temporal | CP-RF03-U02 detecta el defecto; código real y producción intactos |
| Integración | Roles y asignaciones, sesiones, informes, tablero, medios, errores y límites | CI [43795321079](https://github.com/N4CHO8/STCS/actions/runs/43795321079), commit b972cca; [extracto](reportes/ci-b972cca.txt) | 291 comprobaciones aprobadas; se ejecutan contra PG descartable |
| Resiliencia | Error JSON 503 ante caída DB; trabajador sobrevive y reconecta | Mismo CI, 2 checks y reconexión | Valida manejo técnico acotado; no todos los cortes posibles del ESP |
| E2E físico/manual | Imagen/frase/edición exacta y reinicio estable | [publicación](../CIERRE_STCS_20261115.md), [Wi-Fi](../WEB_Y_WIFI_20261115.md), evidencias del 15/11 | Confirmado por autor en ESP; no automatizado ni aceptación externa |
| Carga | H3-RNF02 p95 ≤2 s, errores <1%, 5/10 clientes locales | [A6](../calidad/README.md) | Dos etapas aprobadas; no medir flota o nube por extrapolación |
| Aceptación | Tareas y resultados aprobados por stakeholder | No realizada: reunión aún no agendada | 0 aprobaciones externas acreditadas en este expediente; no inventar resultado |

[Metadatos de herramientas y SHA](reportes/ejecuciones.json). Los reportes son evidencia histórica de los SHA indicados; la nueva entrega debe tener además CI aprobado para su propio commit. El extracto CI conserva timestamps y comandos de la herramienta; no es una captura de “todo pasó”.

## Cobertura y cumplimiento del plan

Se ejecutaron 7/7 casos unitarios nuevos y 2/2 etapas de carga planificadas. La suite histórica de integración está ejecutada. La aceptación sigue sin ejecutar. No se calcula un 100% mezclando 291 aserciones con historias, etapas de carga y participantes: son unidades distintas. La cifra de ≥95% de todo el plan de rúbrica y ≥70% global de negocio no se acredita todavía.

## Defectos y correcciones observadas

| ID | Defecto / severidad de proyecto | Corrección | Resultado y evidencia |
| --- | --- | --- | --- |
| D01 | Imágenes/tarjetas ausentes en reinicio, alta funcional | PR #7 separa metadatos y cachea atlas | Reinicio con cargador confirmado; ARREGLO_REINICIO y ARRANQUE_RAPIDO |
| D02 | Lectura HTTPS/chunked incompleta, alta funcional | PR #6 | Recorrido nube e integridad de medios comprobado; CIERRE |
| D03 | Configuración Wi-Fi perdida al reorganizar UI, media | PR #9 | Menú y portal móvil confirmados en v0.8.5/6 |
| D04 | Pérdida de usabilidad en táctil inferior, alta para control esencial | PR #5 mueve controles; PR #9 mantiene orden | Mitigación confirmada, defecto físico persiste |
| D05 | Contrato ACK de firmware anterior, alta | PR #2/#3 | Corrección histórica; no sustituye prueba de ACK perdido/corte del firmware nuevo |
| D06 | Ausencia de prueba unitaria de límites UTF-8, media de calidad | Esta rama TCS-60 | Caso negativo y mutación controlada acreditados |

No se ha ejecutado aquí una auditoría exhaustiva nueva de toda la aplicación; no se afirma inexistencia de críticos por pasar build.
