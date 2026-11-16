# A4 Matriz de trazabilidad

Firmware v0.8.6; CI histórico identificado por SHA en cada evidencia. Ya se recuperaron los objetivos y RF-01–RF-08/RD-01 del Hito 2. [Equivalencias de origen](ANTECEDENTES_HITOS_1_2.md) → catálogo H3 de esta matriz → casos/evidencia. OE1–OE4 son agrupaciones de medición enlazadas a H1-OE/H2-OE en objetivos.md; no sustituyen los textos originales.

| Objetivo | Req | Modelo A7 | HU Jira | Caso o grupo de casos | Evidencia | Estado real | PR / historial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OE3 | H3-RF01 | UC1, SEQ2 | TCS-84 | CP-RNF01-I01 | verify-roles + CI b972cca | Parcial: técnica aprobada, aprobación externa pendiente | Histórico anterior a PR #1; sin ticket consistente |
| OE3 | H3-RF02 | UC2, CL1, SEQ2 | TCS-53 / TCS-59 | CP-RNF01-U01 / I01 | JUnit y CI; captura docente/admin | Técnica aprobada en casos ejecutados; multicliente físico pendiente | #1, #5; no aprobación de stakeholder |
| OE2 | H3-RF03 | UC3, SEQ1 | TCS-48 / TCS-49 / TCS-60 | CP-RF03-U01–04 / M01 | JUnit, regresión, evidencias imagen/edición/voz | Manual confirmado por autor; aceptación externa pendiente | #5, #6 |
| OE1 | H3-RF04 | UC4, ACT1 | TCS-43–47 / TCS-85 | CP-RF04-M01 | CIERRE y WEB_Y_WIFI, confirmación física | Técnica manual comprobada; sobrecarga visual no validada | #5, #7, #9 |
| OE4 | H3-RF05 | UC5, CL1 | TCS-51 / TCS-52 / TCS-83 | CP-RF05-U01–02 / I01 | JUnit, verify-roles/CI | Validación y API comprobadas; cortes/ACK completos pendientes | #2, #3, #5 |
| OE1/OE4 | H3-RF06 | UC6 | TCS-74 | CP-RF06-M01 | WEB_Y_WIFI, v0.8.6 | Implementación final aceptada sin timeout; matriz física móvil pendiente | #9 |
| OE3 | H3-RF07 | UC2, CL1 | TCS-84 | CP-RNF01-I01 | verify-roles/CI | Casos API aprobados; validación del contenido clínico pendiente | Histórico + #5 |
| OE4 | H3-RF08 | ACT1, CL1 | TCS-76 | CP-RNF04-M01 | ARRANQUE_RAPIDO y reinicio | Parcial: atlas 96 y reinicio sí; cola 64 aceptada, cortes pendientes | #7, #8 |
| OE3 | H3-RF09 | UC1, CL1 | TCS-53 / TCS-84 | CP-RNF01-I01 | verify-roles/CI | Parcial: permisos/aprobaciones técnicas sí; ciclo completo dispositivo pendiente | #1 + histórico |
| OE4 | H3-RF10 | UC5 | TCS-83 | CP-RF10-I01 | verify-roles/CI y alcance de Jira | Parcial: filtros/paginación con pruebas; completar criterios actuales de exportación | Histórico + #5 |
| OE2 | H3-RF11 | SEQ1 | TCS-60 | CP-RF03-U04 / M02 | capacidad-180-telemetria.txt, confirmaciones 180/rechazo184 | 180 operativos ensayados; no físico absoluto ni todos offline | #5 |
| OE3 | H3-RNF01 | SEQ2 | TCS-59 | CP-RNF01-S01 / I01 | npm-audit.json + CI | Dependencias/API y ZAP Baseline ejecutados; alcance en calidad/README.md | #5 y esta entrega |
| OE4 | H3-RNF02 | SEQ1 | TCS-60 / TCS-88 | CP-RNF02-L01/L02 | carga-local.json | Local aprobada; no capacidad de producción | Esta entrega TCS-88 |
| OE4 | H3-RNF03 | SEQ1/SEQ2 | TCS-88 | CP-RF03-U02 / CI | JUnit, regresion.json y workflow | Cobertura de servidor y E2E Chromium ejecutados; límites en pruebas/CIERRE_20261116.md | Esta entrega TCS-60/88 |
| OE4 | H3-RNF04 | ACT1 | TCS-76 | CP-RNF04-M01 | ARRANQUE_RAPIDO | Parcial; rechazo de exceso y reinicio no sustituyen prueba de cola llena | #7 |
| Visión futura | FUT01 | Fuera del MPV implementado | TCS-68–73 | No ejecutado | Solo análisis en Jira | No hecho: predicción implementada no acreditada | Sin PR de implementación |
| OE3/OE4 | FUT02 | CL1/SEQ2 | TCS-53 | No ejecutado en dos ESP | Un dispositivo disponible | No hecho en hardware; no extrapolar suite API a flota | Pendiente |

## Localizar las ejecuciones y sprints

- U: [test real](../frontend/tests/validation.test.mjs), [JUnit](pruebas/reportes/unitarias.xml), [metadatos](pruebas/reportes/ejecuciones.json).
- I01: grupo de integración del script [verify-roles.mjs](../frontend/scripts/verify-roles.mjs) y módulos que invoca. CI [43795321079](https://github.com/N4CHO8/STCS/actions/runs/43795321079) ejecutó el grupo; el reporte no individualiza 291 HU/casos independientes.
- L: [sonda real](../frontend/scripts/measure-quality.mjs), [reporte](calidad/carga-local.json).
- M: casos manuales históricos con esperado/obtenido descritos en [resultados](pruebas/RESULTADOS_HITO3.md), [cierre](CIERRE_STCS_20261115.md), [Wi-Fi](WEB_Y_WIFI_20261115.md) y [reinicio](ARRANQUE_RAPIDO_ESP_20261115.md).
- PR: https://github.com/N4CHO8/STCS/pulls?q=is%3Apr+is%3Amerged; los números de la tabla son referencias verificadas.
- [Captura de Jira](evidencias/hito3-20261116/jira.json): Sprint 3 = TCS-53,59,60,74,76,77,83,84,85,88. Las asignaciones históricas por HU de otros sprints no se reconstruyeron una a una: pendiente.
- Tag final hito3: **pendiente**. No crear enlace falso a un tag inexistente.

## Auditoría de las tres pasadas

Completitud: originales recuperados y enlazados; la tabla conserva futuras/parciales. Aceptación y pruebas pendientes no se convierten en aprobadas por recuperar archivos.
Pertinencia: las pruebas U citan RF/RNF; las I históricas se agrupan y aún requieren indexación fina para cada Must.
Veracidad: evidencia de laboratorio se distingue de hardware y nube; no hay aprobaciones externas acreditadas.
Riesgos laterales: [riesgos.md](riesgos.md) cita los requerimientos amenazados.

No se afirma “0 Must sin prueba”, “100% aceptado” ni “0 HU sin aprobación”. Reconciliar HU base, sprints y criterios oficiales antes de congelar; esta matriz permite navegar y declarar la brecha, no ocultarla.
