# A4 Matriz de trazabilidad

La matriz se puede recorrer desde el objetivo hasta la evidencia y desde el PR de vuelta al requisito. Los objetivos y equivalencias están en [A1](objetivos.md); el catálogo completo, en [A2](requerimientos.md). Los casos detallados están en [A5](pruebas/CASOS.md).

H3-RF03 incorpora además la [revisión del catálogo ARASAAC](pruebas/reportes/arasaac-20261121/README.md): procedencia por archivo, compatibilidad de IDs y frases, imágenes propias y selector en Chromium/WebKit. Se complementa con la [comprobación final](pruebas/reportes/comprobacion-final-20261121/README.md) en Vercel y ESP, identificada por versión.

Cada caso de A5 enlaza además el criterio TCS-XX.CA01… numerado en Jira. Las [tareas por HU](gestion/HISTORIAS_SPRINT3.md) permiten distinguir lo entregado del alcance de aprobación y medición. La asociación no amplía el alcance de una prueba ni acredita un criterio completo por sí sola.

S1 = sprint 202; S2 = 320; S3 = 321. En la columna Sprint, los números son las HU TCS correspondientes. Las asignaciones se comprobaron por conector el 17/11; las referencias consolidadas mantienen su excepción. Los modelos UC/CL/SEQ/ACT se abren en [A7](arquitectura/modelos.md).

| Objetivo | Requerimiento | Modelo | HU | Sprint | Caso de prueba | Nivel | Evidencia | Resultado | PR / tag |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OE3 | H3-RF01 (Must) | [UC1, SEQ2](arquitectura/modelos.md) | [TCS-84](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-84) | S3: 84 | CP-RNF01-I01, CP-RF01-E01/E02 | Integración / E2E | [API/E2E](pruebas/RESULTADOS.md) | Sesiones verificadas; comprobación técnica por pruebas, alcance en A3 | [PR #13](https://github.com/N4CHO8/STCS/pull/13); [PR #15](https://github.com/N4CHO8/STCS/pull/15) |
| OE3 | H3-RF02 (Must) | [UC2, CL1, SEQ2](arquitectura/modelos.md) | [TCS-53](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53); [TCS-59](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-59) | S3: 53, 59 | CP-RNF01-U01/I01, CP-RF02-E01–04 | Unitaria / integración / E2E / física | [Permisos](FLUJO_ROLES.md), [resultados](pruebas/RESULTADOS.md) | Casos técnicos aprobados; dos ESP conformes según autor el 16/11, demostración presencial prevista | [PR #1](https://github.com/N4CHO8/STCS/pull/1); [PR #5](https://github.com/N4CHO8/STCS/pull/5); [PR #13](https://github.com/N4CHO8/STCS/pull/13) |
| OE2 | H3-RF03 (Must) | [UC3, SEQ1, ACT1](arquitectura/modelos.md) | [TCS-48](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-48); [TCS-49](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-49); [TCS-60](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-60) | S2: 48, 49; S3: 60 | CP-RF03-U01–04, CP-RF03-E01/E02, PF-01 | Unitaria / E2E / física | [JUnit](pruebas/reportes/unitarias-cierre.xml), [E2E](pruebas/reportes/e2e.xml), [físico](pruebas/FISICAS_20261115.md) | Imagen y frase nueva/actualizada confirmadas en nube y ESP; D15 resuelto en PR #17 | [PR #5](https://github.com/N4CHO8/STCS/pull/5); [PR #6](https://github.com/N4CHO8/STCS/pull/6); [PR #13](https://github.com/N4CHO8/STCS/pull/13) |
| OE1 | H3-RF04 (Must) | [UC4, ACT1](arquitectura/modelos.md) | [TCS-43](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-43); [TCS-44](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-44); [TCS-45](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-45); [TCS-46](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-46); [TCS-47](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-47); [TCS-85](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-85) | S2: 43, 44, 45, 46, 47; S3: 85 | PF-01 | Física | [Prueba física](pruebas/FISICAS_20261115.md) | Operación física informada y pertinencia revisada; autonomía externa no medida | [PR #5](https://github.com/N4CHO8/STCS/pull/5); [PR #7](https://github.com/N4CHO8/STCS/pull/7); [PR #9](https://github.com/N4CHO8/STCS/pull/9) |
| OE4 | H3-RF05 (Must) | [UC5, CL1](arquitectura/modelos.md) | [TCS-51](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-51); [TCS-52](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-52); [TCS-83](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-83) | S2: 51, 52; S3: 83 | CP-RF05-U01/U02/I01, PF-03–05 | Unitaria / integración / física | [API](pruebas/RESULTADOS.md), [físico](pruebas/FISICAS_20261115.md) | Persistencia y deduplicación comprobadas; confirmación física del ejecutor y demo presencial prevista, sin conteos instrumentados | [PR #2](https://github.com/N4CHO8/STCS/pull/2); [PR #3](https://github.com/N4CHO8/STCS/pull/3); [PR #5](https://github.com/N4CHO8/STCS/pull/5) |
| OE1/OE4 | H3-RF06 (Must) | [UC6](arquitectura/modelos.md) | [TCS-74](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-74) | S3: 74 | PF-06 | Física | [Wi-Fi](pruebas/FISICAS_20261115.md) | Finalizada sin timeout; matriz móvil parcial | [PR #9](https://github.com/N4CHO8/STCS/pull/9) |
| OE3 | H3-RF07 (Should) | [UC8, CL1](arquitectura/modelos.md) | [TCS-84](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-84) | S3: 84 | CP-RNF01-I01 | Integración | [API](pruebas/RESULTADOS.md) | Separación informe/orientaciones técnica; pertinencia de uso revisada el 20/11, sin eficacia clínica evaluada | [PR #5](https://github.com/N4CHO8/STCS/pull/5) |
| OE4 | H3-RF08 (Should) | [ACT1, CL1](arquitectura/modelos.md) | [TCS-76](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-76) | S3: 76 | PF-02–05 | Física | [Reinicio/cola](pruebas/FISICAS_20261115.md) | Cola 64 aceptada; L-01 sin voz sin Wi-Fi | [PR #7](https://github.com/N4CHO8/STCS/pull/7); [PR #8](https://github.com/N4CHO8/STCS/pull/8) |
| OE3 | H3-RF09 (Should) | [UC7, CL1](arquitectura/modelos.md) | [TCS-53](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53); [TCS-84](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-84) | S3: 53, 84 | CP-RNF01-I01 | Integración / física | [Roles y API](pruebas/RESULTADOS.md) | Asignaciones de adultos y acceso a ESP previamente configurados comprobados; TCS-53 completada en ese alcance. Automatización de equipos diferida a FUT03 | [PR #1](https://github.com/N4CHO8/STCS/pull/1); [PR #5](https://github.com/N4CHO8/STCS/pull/5) |
| OE4 | H3-RF10 (Should) | [UC5](arquitectura/modelos.md) | [TCS-83](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-83) | S3: 83 | CP-RF10-I01, CP-RF10-U01/E01 | Unitaria / integración / E2E | [API/CSV](pruebas/ARREGLOS_LOCALES_20261116.md), [Chromium](pruebas/reportes/arreglos-locales-20261116/chromium.xml), [WebKit](pruebas/reportes/arreglos-locales-20261116/webkit.xml) | CSV/filtros/auditoría publicados; CSV autorizado y permisos comprobados en Vercel | [PR #5](https://github.com/N4CHO8/STCS/pull/5) (consulta); [PR #17](https://github.com/N4CHO8/STCS/pull/17) |
| OE2 | H3-RF11 (Should) | [SEQ1](arquitectura/modelos.md) | [TCS-60](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-60) | S3: 60 | CP-RF03-U04, ensayo 180/rechazo184 | Unitaria / carga física de catálogo | [Telemetría](evidencias/publicacion-20261115/capacidad-180-telemetria.txt) | 180 operativos, no máximo físico ni 180 voces offline | [PR #5](https://github.com/N4CHO8/STCS/pull/5) |
| OE1/OE2 | H3-RF12 (Must) | [UC3/4, CL1, ACT1](arquitectura/modelos.md) | [TCS-85](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-85), CA04 | S3: 85 | CP-ADAPT-U01/U02/I01/E01/E02/P01 | Unitaria / API / E2E | [Reporte](pruebas/reportes/adaptacion-20261121/README.md) | Servidor/UI y ESP físico conformes: categoría única, imagen/voz y edición confirmadas el 22/11 | [PR #17](https://github.com/N4CHO8/STCS/pull/17); [hito3](https://github.com/N4CHO8/STCS/tree/hito3) |
| OE2/OE3 | H3-RF13 (Should) | [UC8, CL1](arquitectura/modelos.md) | [TCS-85](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-85), CA05/06 | S3: 85 | CP-FOLLOW-I01/E01 | API / E2E | [Reporte](pruebas/reportes/adaptacion-20261121/README.md) | Fecha y observaciones conformes en permisos y persistencia | [PR #17](https://github.com/N4CHO8/STCS/pull/17); [hito3](https://github.com/N4CHO8/STCS/tree/hito3) |
| OE3 | H3-RNF01 (Must) | [SEQ2](arquitectura/modelos.md) | [TCS-59](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-59) | S3: 59 | CP-RNF01-S01/I01, CP-RNF01-TLS01; grupo RLS/DAST | Seguridad / integración / E2E | [ZAP/npm](calidad/README.md); [autenticado](pruebas/reportes/arreglos-locales-20261116/seguridad-autenticada.json) | Escaneo acotado; un medio residual | [PR #13](https://github.com/N4CHO8/STCS/pull/13) |
| OE4 | H3-RNF02 (Must) | [SEQ1](arquitectura/modelos.md) | [TCS-60](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-60); [TCS-88](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-88) | S3: 60, 88 | CP-RNF02-L01/L02 | Eficiencia | [Carga ampliada](pruebas/reportes/adaptacion-20261121/carga-local.json) | Aprobado en laboratorio: p95 56,47/58,07 ms, 5/10 clientes, cero errores; no capacidad cloud | [PR #13](https://github.com/N4CHO8/STCS/pull/13) |
| OE4 | H3-RNF03 (Should) | [SEQ1/SEQ2](arquitectura/modelos.md) | [TCS-88](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-88) | S3: 88 | CP-RF03-U02, CP-RNF03-E01/E02, CP-RNF03-A11Y; CI | Unitaria / integración / E2E / cobertura | [Cobertura](calidad/README.md), [CI](https://github.com/N4CHO8/STCS/actions/runs/43925021420); [ampliación](pruebas/reportes/arreglos-locales-20261116/manifest.json) | Local aprobado: 90,05% líneas, 20 recorridos por motor; evidencia local del 21/11 | [PR #13](https://github.com/N4CHO8/STCS/pull/13); [PR #15](https://github.com/N4CHO8/STCS/pull/15) |
| OE4 | H3-RNF04 (Should) | [ACT1, CL1](arquitectura/modelos.md) | [TCS-76](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-76) | S3: 76 | CP-RF05-I01, PF-03–05 | Integración / física | [Registro](pruebas/FISICAS_20261115.md) | Conforme informado; conteos/instantes de corte no instrumentados | [PR #7](https://github.com/N4CHO8/STCS/pull/7) |
| OE1/OE2 | Aceptación del prototipo | [UC3/4](arquitectura/modelos.md) | [TCS-77](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-77) | S3: 77 | PA-01–05 | Aceptación cualitativa | [Protocolo](validacion/PAUTA.md) | [Revisión Zoom 20/11](validacion/REGISTRO.md), con observaciones y sin indicadores medidos | Aprobación cualitativa confirmada por Ignacio; adaptación física comprobada, indicadores no medidos declarados en A1 |
| H2-OE7 | FUT01: diseño, no motor | [Diseño futuro A1](objetivos.md#diseño-conceptual-futuro--h2-oe7--fut01) | [TCS-68](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-68); [TCS-69](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-69); [TCS-70](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-70); [TCS-71](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-71); [TCS-72](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-72); [TCS-73](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-73) | S1: 68, 69, 70, 71; S2: 72, 73 | Análisis/diseño | Revisión de diseño, sin motor | [Diseño conceptual A1](objetivos.md#diseño-conceptual-futuro--h2-oe7--fut01), [antecedentes](ANTECEDENTES_HITOS_1_2.md) | Fuera de implementación actual | Sin motor entregado |
| OE3/OE4 | FUT02: verificación multicliente | [CL1/SEQ2](arquitectura/modelos.md) | [TCS-53](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53) | S3: 53 | PF-08, MC-WEB-01 | Física / web informada | [Registro 16/11](pruebas/MULTICLIENTE_20261116.md) | Conforme informado: dos ESP y varios computadores; demostración presencial prevista | Confirmación del ejecutor, sin cambio de código |
| OE3 | FUT03: mejora futura | [Alcance futuro A2](requerimientos.md#exclusiones-y-evolución) | [TCS-53](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53); [TCS-75](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-75); [TCS-81](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-81) | S3: 53; Consolidadas sin sprint: 75, 81 | Sin prueba de implementación | Sin implementación; fuera de alcance | [Alcance y deuda](riesgos.md) | Fuera del alcance entregado; alta por posesión, rotación y reasignación web no implementadas | Decisión del propietario 17/11/2026, sin cambio de código |

El resultado describe la comprobación técnica y su alcance, no aprobación profesional. La entrega se identifica por el tag hito3 y el [comprobación final](pruebas/reportes/comprobacion-final-20261121/README.md). Los PR citados son antecedentes; las pruebas posteriores mantienen sus propias fechas y revisiones.

La publicación integrada de estos requisitos corresponde al [PR #17](https://github.com/N4CHO8/STCS/pull/17). El [tag hito3](https://github.com/N4CHO8/STCS/tree/hito3) fija código, firmware y documentación de entrega. Los PR anteriores muestran su evolución.

## Controles de integridad de la trazabilidad

Comprobación del 22/11: 17 requisitos, nueve Must, con modelo, casos y evidencia enlazados. [Recuento](evidencias/a4-controles-20261122.json). El [corte del 17/11](evidencias/a4-controles-20261117.json) conserva las cifras anteriores.

| Control | Resultado | Alcance |
| --- | --- | --- |
| Requisitos sin fila de trazabilidad | 0 de 17 | Catálogo A2 cotejado con A4 |
| Must sin modelo, caso o evidencia referenciada | 0 de 9 | No implica comprobar todas sus variantes ni medir los indicadores externos de A1 |
| HU del Sprint 3 sin criterios | 0 entre las diez historias | Los criterios y las 31 subtareas están en Jira y en la ficha del sprint |
| Aprobación de pertinencia | Heriber, según registro del 20/11 y confirmaciones del propietario | Las tareas técnicas se cierran por pruebas; no se les atribuye aprobación clínica |
| HU históricas sin sprint | Siete referencias consolidadas | Remiten a sus historias principales; no se reescribe el historial |
| Riesgos sin requisito, objetivo o artefacto afectado | 0 entre R01–R13 | Correspondencia en la tabla siguiente y tratamiento en A9 |

## Riesgos enlazados con lo que amenazan

La mitigación, contingencia y estado están en [A9](riesgos.md).

| Riesgo | Requisito / objetivo afectado |
| --- | --- |
| R01 Tacto inferior | OE1 / H3-RF04 |
| R02 Tarjetas al reiniciar | OE4 / H3-RF08 |
| R03 Voz obsoleta/incompleta | OE2 / H3-RF03 |
| R04 Fuga de datos | OE3 / H3-RF02, H3-RNF01 |
| R05 Sin aceptación externa | OE1/OE2 / aceptación |
| R06 Evidencia sin acceso/tag | OE4 / A4/A8 |
| R07 Cola llena/corte | OE4 / H3-RF05/08, H3-RNF04 |
| R08 AP persistente | OE1/OE4 / H3-RF06 |
| R09 Cuotas/conectividad | OE2/OE4 / H3-RF03/06/08 |
| R10 Escalado de flota | OE3/OE4 / FUT02 |
| R11 Objetivos originales ausentes | A1/A4 / H2-OE1–7 |
| R12 Pérdida al restaurar | OE4 / A8, H3-RNF04 |
| R13/L-01 Voz sin Wi-Fi | OE2/OE4 / H3-RF03/08 |

## PR, commit y tag de entrega

PR integrados comprobados por GitHub el 17/11:

| PR | Commit de integración |
| --- | --- |
| [PR #1](https://github.com/N4CHO8/STCS/pull/1) | [dfa48e8](https://github.com/N4CHO8/STCS/commit/dfa48e8cb6ac9057fa1b8fa1b6ad803113e5eea4) |
| [PR #2](https://github.com/N4CHO8/STCS/pull/2) | [1ef249a](https://github.com/N4CHO8/STCS/commit/1ef249a2c8d1ffd508c92a29f1660ccd7fc30503) |
| [PR #3](https://github.com/N4CHO8/STCS/pull/3) | [c9548d4](https://github.com/N4CHO8/STCS/commit/c9548d474a7af18af3e2ea5b73ac66649b07844e) |
| [PR #5](https://github.com/N4CHO8/STCS/pull/5) | [c1fdbf8](https://github.com/N4CHO8/STCS/commit/c1fdbf88b041f7b1c34c9706a8ef11d74d9c42d6) |
| [PR #6](https://github.com/N4CHO8/STCS/pull/6) | [b528dee](https://github.com/N4CHO8/STCS/commit/b528dee1b1f88f3b55c687b26f8ceb65153436f9) |
| [PR #7](https://github.com/N4CHO8/STCS/pull/7) | [4e5ba39](https://github.com/N4CHO8/STCS/commit/4e5ba396faccc9fa8e0895588fb8805439ac7605) |
| [PR #8](https://github.com/N4CHO8/STCS/pull/8) | [f544e5c](https://github.com/N4CHO8/STCS/commit/f544e5cedb3ffb462e27e8261fa7cc35b0a3d3bd) |
| [PR #9](https://github.com/N4CHO8/STCS/pull/9) | [cce29a2](https://github.com/N4CHO8/STCS/commit/cce29a226d6e5354585ad8783f8de2ec8e010513) |
| [PR #13](https://github.com/N4CHO8/STCS/pull/13) | [3dfff37](https://github.com/N4CHO8/STCS/commit/3dfff375085ccc455e113d5184c42e9a5c9980ca) |
| [PR #15](https://github.com/N4CHO8/STCS/pull/15) | [22fa385](https://github.com/N4CHO8/STCS/commit/22fa38538621ef6cde10568de185698dc3284b04) |

La versión documental publicada actual corresponde al [PR #16 / ebfc605](https://github.com/N4CHO8/STCS/pull/16). El historial anterior conserva omisiones de tickets; las correspondencias de esta matriz son retrospectivas cuando así corresponde. [A8](REPOSITORIO.md).

## Casos y reportes que se pueden abrir

- [Catálogo A5](pruebas/CASOS.md): precondiciones, pasos, esperado, obtenido y reporte por caso. U = unitaria; E = E2E; PF = física; PA = aceptación; I01/S01/L01 agrupan escenarios donde el runner no tiene ese nombre literal.
- [Ejecuciones históricas](pruebas/reportes/cierre-20261116.json) y [ampliación](pruebas/reportes/arreglos-locales-20261116/manifest.json): fechas, herramientas y revisiones. La ampliación usa base ebfc605 con cambios y hashes de fuentes.
- [Unitarias/TLS 17/11](pruebas/reportes/a5-revision-20261117/unitarias-tls.xml), [metadatos](pruebas/reportes/a5-revision-20261117/metadatos.json).
- [Historias y aceptación](historias.md), [estados/sprints de referencia](evidencias/defensa-20261116/jira.json).

Las referencias de código, CI y tag se contrastan con la revisión identificada en cada reporte. La revisión del 20/11 aporta una aprobación de pertinencia y PA-04 cualitativo, con observaciones parciales en PA-01/02/05; PA-03 no se comprobó. [Registro](validacion/REGISTRO.md). Las aprobaciones individuales confirmadas por el autor están registradas; los indicadores externos no se midieron. [Estado de la entrega](DEFENSA.md).

Revisión del 18/11: [44 HU y 92 tareas documentadas](evidencias/gestion-20261118.json); 52 filas de casos enlazadas con criterios válidos. PC-01/02 ya se ejecutaron: [mediciones LAN y TLS físico](pruebas/reportes/esp-20261118/README.md), vinculados a TCS-48.CA01/TCS-60.CA01 y TCS-59.CA02. El KPI histórico ≤15 s tuvo 5/6 muestras conformes; no se declara cumplimiento garantizado.


La aprobación de uso de Heriber y la condición de simplificar se registran en [la sesión](validacion/REGISTRO.md). La adaptación se publicó y comprobó; los indicadores no medidos permanecen como limitación de A1.
