# A4 Matriz de trazabilidad

Los objetivos de origen H1/H2 se enlazan con OE1–OE4 en [A1](objetivos.md). Los IDs RF históricos se conservan en [antecedentes](ANTECEDENTES_HITOS_1_2.md); H3-RF/H3-RNF identifica el catálogo vigente. S1/S2/S3 son los sprints 202/320/321, verificados por conector.

| Objetivo / requisito | Modelo | HU y sprint | Caso o grupo | Evidencia | Revisión | Estado |
| --- | --- | --- | --- | --- | --- | --- |
| OE3 / H3-RF01 | UC1, SEQ2 | TCS-84 S3 | CP-RNF01-I01, CP-RF01-E01/E02 | [API/E2E](pruebas/RESULTADOS.md) | PR #13/#15 | Sesiones verificadas; aceptación externa pendiente |
| OE3 / H3-RF02 | UC2, CL1, SEQ2 | TCS-53/59 S3 | CP-RNF01-U01/I01, CP-RF02-E01–04 | [Permisos](FLUJO_ROLES.md), [resultados](pruebas/RESULTADOS.md) | PR #1/#5/#13 | Casos técnicos aprobados; flota física pendiente |
| OE2 / H3-RF03 | UC3, SEQ1 | TCS-48/49 S2, TCS-60 S3 | CP-RF03-U01–04, E01/E02, PF-01 | [JUnit](pruebas/reportes/unitarias-cierre.xml), [E2E](pruebas/reportes/e2e.xml), [físico](pruebas/FISICAS_20261115.md) | PR #5/#6/#13 | Imagen/frase/voz conectada confirmadas |
| OE1 / H3-RF04 | UC4, ACT1 | TCS-43–47 S2, TCS-85 S3 | PF-01 | [Prueba física](pruebas/FISICAS_20261115.md) | PR #5/#7/#9 | Operación informada; usabilidad externa pendiente |
| OE4 / H3-RF05 | UC5, CL1 | TCS-51/52 S2, TCS-83 S3 | CP-RF05-U01/U02/I01, PF-03–05 | [API](pruebas/RESULTADOS.md), [físico](pruebas/FISICAS_20261115.md) | PR #2/#3/#5 | Persistencia y deduplicación comprobadas; trazas físicas pendientes |
| OE1/OE4 / H3-RF06 | UC6 | TCS-74 S3 | PF-06 | [Wi-Fi](pruebas/FISICAS_20261115.md) | PR #9 | Finalizada sin timeout; matriz móvil parcial |
| OE3 / H3-RF07 | UC2, CL1 | TCS-84 S3 | CP-RNF01-I01 | [API](pruebas/RESULTADOS.md) | PR #5 | Separación informe/orientaciones técnica; pertinencia clínica pendiente |
| OE4 / H3-RF08 | ACT1, CL1 | TCS-76 S3 | PF-02–05 | [Reinicio/cola](pruebas/FISICAS_20261115.md) | PR #7/#8 | Cola 64 aceptada; L-01 sin voz Wi-Fi |
| OE3 / H3-RF09 | UC2, CL1 | TCS-53/84 S3 | CP-RNF01-I01 | [Roles y API](pruebas/RESULTADOS.md) | PR #1/#5 | Aprobación de asignación técnica; ciclo completo del ESP pendiente |
| OE4 / H3-RF10 | UC5 | TCS-83 S3 | CP-RF10-I01 | [Historial](pruebas/RESULTADOS.md) | Histórico/#5 | Consulta probada; exportación CSV pendiente |
| OE2 / H3-RF11 | SEQ1 | TCS-60 S3 | CP-RF03-U04, ensayo 180/rechazo184 | [Telemetría](evidencias/publicacion-20261115/capacidad-180-telemetria.txt) | PR #5 | 180 operativos, no máximo físico ni 180 voces offline |
| OE3 / H3-RNF01 | SEQ2 | TCS-59 S3 | CP-RNF01-S01/I01 | [ZAP/npm](calidad/README.md) | PR #13 | Escaneo acotado; un medio residual |
| OE4 / H3-RNF02 | SEQ1 | TCS-60/88 S3 | CP-RNF02-L01/L02 | [Carga](calidad/carga-local.json) | PR #13 | Local aprobada, no capacidad cloud |
| OE4 / H3-RNF03 | SEQ1/SEQ2 | TCS-88 S3 | U02, CI y E2E | [Cobertura](calidad/README.md), [CI](https://github.com/N4CHO8/STCS/actions/runs/43925021420) | PR #13/#15 | Alcance de servidor verificado |
| OE4 / H3-RNF04 | ACT1 | TCS-76 S3 | PF-03–05 | [Registro](pruebas/FISICAS_20261115.md) | PR #7 | Conforme informado; conteos/instantes de corte no instrumentados |
| OE1/OE2 / aceptación | UC3/4 | TCS-77 S3 | PA-01–05 | [Protocolo](validacion/PAUTA.md) | Sin aceptación aún | Correo enviado; revisión pendiente |
| FUT01 / predicción | Diseño futuro | TCS-68–71 S1, TCS-72/73 S2 | Análisis/diseño | [Antecedentes](ANTECEDENTES_HITOS_1_2.md) | Sin motor entregado | Fuera de implementación actual |
| FUT02 / varios ESP | CL1/SEQ2 | TCS-53 S3 | PF-08 | [No ejecutado](pruebas/FISICAS_20261115.md) | Sin prueba de flota | Pendiente |

## Abrir la evidencia

- [Modelos](arquitectura/modelos.md), [historias Jira](historias.md), [pertenencia verificada de los 50 IDs](evidencias/defensa-20261116/jira.json).
- U: [tests reales](../frontend/tests/validation.test.mjs). I01 agrupa comprobaciones de [verify-roles](../frontend/scripts/verify-roles.mjs), no 291 HU independientes. E: [navegador](../frontend/tests/e2e/portal.spec.mjs). L: [sonda](../frontend/scripts/measure-quality.mjs).
- [Ejecuciones y SHA](pruebas/reportes/cierre-20261116.json). Carga/cobertura/ZAP mantienen sus revisiones originales; el CI posterior comprueba la nueva revisión, no refecha esos reportes.
- PR: [revisiones integradas](https://github.com/N4CHO8/STCS/pulls?q=is%3Apr+is%3Amerged). Las referencias históricas anteriores a la convención de tickets se reconocen como tales.
- Tag `hito3`: pendiente. Los [riesgos y deuda](riesgos.md) enlazan los requerimientos afectados. Aprobación externa y evidencia aún no adjunta permanecen visibles.
