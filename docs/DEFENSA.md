# STCS Entrega técnica

STCS es un prototipo de comunicación con pictogramas y voz para niños con TEA que necesitan apoyo comunicativo. Este índice reúne la documentación del semestre, la revisión profesional y la evidencia de sus pruebas.

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

El [seguimiento](gestion.md) y las fichas de [Sprint 2](gestion/HISTORIAS_SPRINT2.md) y [Sprint 3](gestion/HISTORIAS_SPRINT3.md) complementan el informe. Los [costos](factibilidad.md) y las [fuentes](antecedentes-y-referencias.md) responden a la retroalimentación del informe anterior.

## Evidencia y alcance

El corte del 21/11/2026 registra 15 pruebas unitarias, 20 recorridos Chromium, 20 WebKit y una suite de 387 comprobaciones API, todos conformes. La medición de servidor del mismo día dio 90,05 % de cobertura de líneas. [Resultados](pruebas/RESULTADOS.md).

Los ensayos automáticos del 21/11 corresponden a un candidato local aislado. El registro de [nube del 18/11](pruebas/NUBE_20261118.md) corresponde a la versión publicada y detectó D15 al generar voces nuevas. Su corrección está comprobada en laboratorio. La documentación distingue estos entornos y no atribuye al despliegue pruebas realizadas sobre otro código.

El firmware habitual de referencia es v0.8.6-wifi-status. v0.8.7-adaptive-board incorpora la adaptación por niño y cuenta con compilación y pruebas de servidor; no tiene comprobación física registrada. El tablero de referencia ensayado tiene 96 elementos. El máximo operativo probado es 180, con 45 por categoría; no es un máximo físico absoluto.

## Revisión del profesional

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA, revisó el prototipo por Zoom el 20/11. Aprobó su pertinencia con el alcance [registrado por HU](validacion/REGISTRO.md). La condición de simplificar el tablero por niño se atendió en la implementación. No hubo participación de niños ni medición de eficacia terapéutica, autonomía o tiempos del evaluador.

Heriber es el stakeholder de pertinencia. Las tareas técnicas se verifican con pruebas; los profesores figuran como guías y evaluadores.

## Límites del prototipo

- La voz sin Wi-Fi no está garantizada; la caché conserva solo recursos disponibles.
- El tacto inferior defectuoso se mitigó con controles superiores y laterales; el hardware no se reparó.
- La cola conserva hasta 64 eventos y rechaza nuevos registros al llenarse.
- El AP de configuración permanece activo hasta reiniciar; el equipo requiere alimentación USB de 5 V.
- La predicción y la gestión web completa del ciclo de vida del hardware son evolución futura.

Las pruebas físicas, incluida la separación de dos ESP y el acceso desde varios computadores, están [registradas con su ejecutor](pruebas/FISICAS_20261115.md). No se confunden confirmaciones manuales con telemetría instrumentada.
