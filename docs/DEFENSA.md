# STCS Entrega técnica

STCS es un prototipo de comunicación con pictogramas y voz para niños con TEA que necesitan apoyo comunicativo. Este índice reúne la documentación del semestre, la revisión profesional y la evidencia de sus pruebas.

TEA significa trastorno del espectro autista; el proyecto utiliza comunicación aumentativa y alternativa (CAA). La entrega demuestra una integración técnica y una revisión profesional cualitativa. Sus objetivos de autonomía y uso con niños conservan las limitaciones del registro de validación.

**[Informe del proyecto](INFORME_HITO3.md)** · [Aplicación](https://0stcs0.vercel.app) · [GitHub](https://github.com/N4CHO8/STCS) · [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS).

| Artefacto | Documento | Qué permite comprobar |
| --- | --- | --- |
| A1 | [Objetivos](objetivos.md) | Problema, hipótesis, métricas, origen de la referencia y resultados |
| A2 | [Requerimientos](requerimientos.md) | Prioridades, alcance y escenarios de calidad |
| A3 | [Historias](historias.md) | Criterios, tareas y responsables de aprobación |
| A4 | [Trazabilidad](trazabilidad.md) | Objetivo → requisito/modelo → HU/sprint → caso → reporte → versión |
| A5 | [Plan](pruebas/PLAN.md), [casos](pruebas/CASOS.md), [resultados](pruebas/RESULTADOS.md) | Planificados y ejecutados, esperado/observado y defectos |
| A6 | [Calidad](calidad/README.md) | Seguridad, eficiencia y riesgo residual |
| A7 | [Arquitectura](arquitectura/README.md) | UML y tres decisiones con alternativas ponderadas |
| A8 | [Repositorio](REPOSITORIO.md) | Organización, PR, CI y reproducción |
| A9 | [Riesgos](riesgos.md) | Probabilidad, impacto, responsable, contingencia y mejoras |

El [seguimiento](gestion.md) y las fichas de [Sprint 2](gestion/HISTORIAS_SPRINT2.md) y [Sprint 3](gestion/HISTORIAS_SPRINT3.md) complementan el informe. Los [costos](factibilidad.md) y las [fuentes](antecedentes-y-referencias.md) desarrollan la factibilidad y el fundamento del proyecto.

## Arquitectura, datos y pruebas

La tabla relaciona cada aspecto técnico con su implementación, evidencia y alcance.

| Aspecto / pregunta | Implementación y documentos | Evidencia | Alcance |
| --- | --- | --- | --- |
| Arquitectura: ¿cómo se conectan web y ESP y qué contiene el backend? | Seguir SEQ1: guardar → autorizar/validar → persistir/preparar voz → consultar configuración → descargar/reproducir. Abrir [modelos](arquitectura/modelos.md) y [ruta POST real](../frontend/src/app/api/stcs/pictograms/route.ts) | [Pruebas API del commit integrado](pruebas/reportes/revision-limpia-20261122/cobertura-integracion.txt) y [voz real en nube/ESP](pruebas/reportes/comprobacion-final-20261121/README.md) | El ESP consulta la API por HTTPS; la web no envía audio directamente por USB |
| Diseño de datos: ¿qué guardamos y cómo se relaciona? | Mostrar CL1 y la relación perfil → pictograma/dispositivo/evento. Abrir [esquema SQL](../supabase/schema.sql) y [persistencia de eventos](../frontend/src/lib/server/stcsData.ts) | La clave única parcial `(device_id, external_event_id)` y `ON CONFLICT` evitan duplicar un reintento; [suite API](pruebas/reportes/revision-limpia-20261122/cobertura-integracion.txt) comprueba los escenarios | El esquema base se completa con [migraciones](../supabase/migrations); diez clientes HTTP no equivalen a diez ESP |
| Implementación y calidad: ¿qué testing tenemos? | Mostrar una regla real: límite en bytes UTF-8, entrada válida, entrada inválida y aserción. [Validación](../frontend/src/lib/server/validation.ts), [CP-RF03-U02](../frontend/tests/validation.test.mjs) | [Regresión controlada](pruebas/reportes/regresion.json): retirar la regla en una copia hace fallar el caso. [Cobertura](pruebas/reportes/revision-limpia-20261122/cobertura/coverage-summary.json) | 90,05 % de líneas cubre servidor/API y contratos declarados; excluye interfaz, firmware y Python |
| Validación: ¿cómo comprobamos funcionamiento y sobrecarga visual? | Abrir esperado/obtenido en [informe §11.3](INFORME_HITO3.md#113-esperado-frente-a-obtenido) y observación → cambio → prueba en [registro profesional](validacion/REGISTRO.md) | [CP-ADAPT-E01/E02 y accesibilidad](pruebas/reportes/revision-limpia-20261122/chromium.xml), [ensayo físico del 22/11](pruebas/reportes/comprobacion-final-20261121/README.md) | Accesibilidad técnica y aprobación guiada no miden ausencia de sobrecarga en niños; tiempos, errores, ayudas y autonomía no medidos |
| Evidencia y trazabilidad: funciona, ¿por qué? | Recorrer una de las tres cadenas siguientes, desde requisito y criterio hasta código y ejecución | [A4](trazabilidad.md), [comandos/fechas/SHA](pruebas/reportes/revision-limpia-20261122/ejecuciones.jsonl), [SHA desplegado](pruebas/reportes/revision-limpia-20261122/despliegue.json) | 387 son comprobaciones de una suite; la misma prueba repetida en otra fecha no es un caso nuevo |

Para justificar decisiones, abrir [ADR-01](arquitectura/adr/ADR-01.md) (API integrada y menor operación, a cambio de límites de funciones), [ADR-02](arquitectura/adr/ADR-02.md) (relaciones e integridad SQL) y [ADR-03](arquitectura/adr/ADR-03.md) (personalización sin recompilar, a cambio de dependencia de red y caché limitada). Las alternativas se compararon como decisiones de diseño; no son benchmarks ejecutados.

## Evidencia y alcance

La [repetición limpia del 22/11](pruebas/reportes/revision-limpia-20261122/README.md) contiene la comprobación del commit integrado `a3d096f`, también identificado como el SHA de la demo publicada. Para defender versiones, abrir primero ese reporte y luego el registro histórico pertinente.

El corte del 21/11/2026 registra 15 pruebas unitarias, 20 recorridos Chromium, 20 WebKit y una suite de 387 comprobaciones API, todos conformes. La medición de servidor del mismo día dio 90,05 % de cobertura de líneas. [Resultados](pruebas/RESULTADOS.md).

Las suites automáticas del 21/11 usan un laboratorio aislado. La [comprobación final en Vercel](pruebas/reportes/comprobacion-final-20261121/README.md) registra además login, permisos, CSV, seguimiento y voz nueva del código publicado mediante PR #17. D15, detectado el 18/11, quedó resuelto en ese despliegue. Los registros anteriores conservan su versión y resultado originales.

## Recorrido de demostración y tres cadenas auditadas

1. **Demo principal:** abrir la [aplicación publicada](https://0stcs0.vercel.app), seleccionar un niño ficticio, editar un pictograma/frase y mostrar actividad y dispositivo. El [registro final](pruebas/reportes/comprobacion-final-20261121/README.md) fija qué versión y qué pasos ya fueron comprobados.
2. **Personalización y voz:** OE2 → H3-RF03 → UC3/SEQ1/ACT1 → TCS-48/49/60 → CP-RF03-U01–04, E01/E02 y CP-ADAPT-P01 → [comprobación final](pruebas/reportes/comprobacion-final-20261121/README.md) → [PR #17](https://github.com/N4CHO8/STCS/pull/17) → [`hito3`](https://github.com/N4CHO8/STCS/tree/hito3). Esta cadena demuestra la corrección de D15 y la frase nueva/editada en Vercel y ESP.
3. **Permisos por rol:** OE3 → H3-RNF01/H3-RF02 → SEQ2 → TCS-59 → CP-RF02-E02/E04 y CP-RNF01-S01/I01 → [casos](pruebas/CASOS.md), [reporte autenticado](pruebas/reportes/adaptacion-20261121/seguridad-autenticada.json) y [calidad](calidad/README.md) → [PR #13](https://github.com/N4CHO8/STCS/pull/13). El resultado fue 13/13 estados esperados, 5/5 accesos negados y ninguna respuesta restringida entregada.
4. **Eficiencia:** OE4 → H3-RNF02 → SEQ1 → TCS-60/88 → CP-RNF02-L01/L02 → [escenario y umbral](calidad/README.md) → [reporte del 22/11](pruebas/reportes/revision-limpia-20261122/carga-local.json). En localhost, 5/10 clientes durante 15 s por etapa dieron p95 26,20/40,87 ms y 0 errores frente al umbral p95 ≤2000 ms y errores <1 %. No representa capacidad cloud. El [ensayo anterior](pruebas/reportes/adaptacion-20261121/carga-local.json) conserva sus resultados en otro computador.

La correspondencia completa está en [A4](trazabilidad.md); estas tres cadenas son el atajo para la exposición.

## Regresión controlada CP-RF03-U02

Desde `frontend`, `npm run test:unit` ejecuta CP-RF03-U02 sobre la fuente real y debe aprobar. Luego, `node scripts/prove-validation-regression.mjs` crea una copia temporal, retira solo en esa copia la protección UTF-8 y vuelve a ejecutar el caso. El guion aprueba únicamente si la copia alterada falla y finalmente elimina el temporal; no modifica el código del producto. El resultado queda en [regresion.json](pruebas/reportes/regresion.json).

El firmware instalado es v0.8.8-adaptive-board. Su carga y arranque se verificaron tras conservar el respaldo completo del ESP. La adaptación por niño se registra por separado en la comprobación final. El tablero de referencia ensayado tiene 96 elementos. El máximo operativo probado es 180, con 45 por categoría; no es un máximo físico absoluto.

## Revisión del profesional

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA, observó una demostración guiada por Zoom el 20/11. Aprobó los flujos mostrados con el alcance [registrado por HU](validacion/REGISTRO.md). Yo operé la web; Heriber no ejecutó los casos por sí mismo ni volvió a probar la versión posterior. La condición de simplificar el tablero por niño se atendió en la implementación y se comprobó técnicamente por separado.

**Respuesta breve sobre sobrecarga visual.** Heriber observó que el tablero debía adaptarse y simplificarse para cada niño. Aprobó cualitativamente el flujo guiado y la pertinencia de una interfaz con pocas distracciones, incluido el botón verde para hablar. Después incorporé selección por niño y un tablero reducido que abre la categoría disponible; comprobé manualmente ese cambio en el ESP el 22/11. Heriber no volvió a evaluar esa versión. Los tiempos de ejecución autónoma, errores, ayudas y autonomía quedaron sin medir, y no participaron niños.

Heriber es el stakeholder de pertinencia. Las tareas técnicas se verifican con pruebas; los profesores figuran como guías y evaluadores.

## Límites del prototipo

- La voz sin Wi-Fi no está garantizada; la caché conserva solo recursos disponibles.
- El tacto inferior defectuoso se mitigó con controles superiores y laterales; el hardware no se reparó.
- La cola conserva hasta 64 eventos y rechaza nuevos registros al llenarse.
- El AP de configuración permanece activo hasta reiniciar; el equipo requiere alimentación USB de 5 V.
- La predicción y la gestión web completa del ciclo de vida del hardware son evolución futura.

Las pruebas físicas, incluida la separación de dos ESP y el acceso desde varios computadores, están [registradas con su ejecutor](pruebas/FISICAS_20261115.md). No se confunden confirmaciones manuales con telemetría instrumentada.
