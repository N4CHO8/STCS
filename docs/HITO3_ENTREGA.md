# Índice técnico y evidencias del Hito 3

Corte documental del 16/11/2026. Índice de los nueve artefactos de entrega: especificación, trazabilidad, pruebas, calidad, arquitectura, repositorio y riesgos. Los resultados pendientes permanecen identificados. El material personal de exposición se conserva fuera del repositorio.

## Accesos para el profesor

- [GitHub público](https://github.com/N4CHO8/STCS): no necesita invitación para leer.
- [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS): Ignacio debe verificar el acceso de lectura desde la cuenta del profesor; nuestro acceso por conector no lo demuestra.
- [Aplicación publicada](https://0stcs0.vercel.app): accesos sintéticos en README. No compartir cuenta administrativa, secretos, respaldos ni datos reales.
- [CI del estado previo b972cca](https://github.com/N4CHO8/STCS/actions/runs/43795321079): 291 comprobaciones de integración, 2 de caída DB y reconexión del trabajador.
- Firmware confirmado físicamente: v0.8.6-wifi-status. Tablero actual 96 activos, 24 por categoría, seis páginas. Máximo operativo ensayado 180/45, no límite físico absoluto.

## Los nueve artefactos

| Artefacto | Ubicación | Estado al preparar esta entrega |
| --- | --- | --- |
| A1 Problema, hipótesis, objetivos e indicadores | [objetivos.md](objetivos.md) | Objetivos originales recuperados; medición y validación externa pendientes |
| A2 Requerimientos, alcance y calidad | [requerimientos.md](requerimientos.md) | RF-01–RF-08 y RD-01 originales recuperados; equivalencia con catálogo H3 y evolución explícita |
| A3 HU Dado/Cuando/Entonces y aprobación | [historias.md](historias.md), Jira | Escenarios de cierre; aprobación externa no acreditada |
| A4 Trazabilidad completa | [trazabilidad.md](trazabilidad.md) | Matriz con aprobado técnico/parcial/pendiente y brechas históricas |
| A5 Plan, casos, resultados, defectos y cobertura | [pruebas/PLAN_HITO3.md](pruebas/PLAN_HITO3.md), [resultados](pruebas/RESULTADOS_HITO3.md) | Evidencia ejecutada diferenciada de aceptación pendiente |
| A6 Seguridad y eficiencia | [calidad/README.md](calidad/README.md) | Dependencias, carga local y ZAP Baseline ejecutados; límites explícitos |
| A7 Modelo y decisiones | [arquitectura/README.md](arquitectura/README.md) | Camino UML, modelos y tres ADR retrospectivos; revisión humana pendiente |
| A8 Repo, despliegue y tablero | [repositorio](REPOSITORIO_HITO3.md), README, CHANGELOG | Main protegida, CI y PR; tag final todavía no existe |
| A9 Riesgos y deuda | [riesgos.md](riesgos.md) | Incluye riesgos materializados, límites y plan priorizado |

## Bloqueantes para afirmar cumplimiento completo

1. Los objetivos/requerimientos de Hito 1/2 ya se recuperaron de los cuatro archivos originales. [Comparación y equivalencias](ANTECEDENTES_HITOS_1_2.md). Falta ratificar indicadores y resultados con stakeholder; disponer del texto no acredita esa aprobación.
2. Ejecutar aceptación externa del prototipo. Acordar con profesor si el profesional puede ser sustituto representativo para indicadores de usabilidad. No atribuir eficacia ni comprensión a niños que no participaron.
3. Registrar nombre/rol/fecha y aprobación real de cada HU e indicador en Jira. Estado Finalizada o confirmación del estudiante no basta. Historias consolidadas no cuentan como funcionalidad adicional.
4. Las nuevas mediciones de servidor, E2E Chromium y ZAP están en [el cierre de pruebas](pruebas/CIERRE_20261116.md). Persisten límites de escenarios, dispositivos físicos y DAST autenticado; no se declara cobertura total de toda la app.
5. El propietario aceptó como alcance final del ESP la cola de 64 eventos y STCS-Config sin timeout; TCS-74/TCS-76 quedan finalizadas funcionalmente. Persisten como cobertura de pruebas la matriz móvil, pérdida de ACK, cola llena y múltiples placas, sin exigir cambios de firmware en este cierre.
6. Verificar enlaces con la cuenta del profesor y congelar el tag hito3 **después** de incorporar toda la evidencia. No crear ahora un tag definitivo ni moverlo luego.
