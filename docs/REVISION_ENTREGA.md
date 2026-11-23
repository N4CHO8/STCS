# Revisión de entrega frente a la rúbrica

Corte documental del 22/11/2026. Fuentes: guía «Hito 3 — Qué debes entregar, cómo se ve correcto y rúbrica», del 10/11; PDF «Hito 2 - Ignacio Javier Benegas Guzmán» y retroalimentación individual de presentación aportada por el autor. Son evaluaciones distintas: el correo indica 71,25/100; el PDF distingue 90 oral, 63,5 escrito y 79,4 ponderado preliminar. No se combinan como una sola nota.

## Recorrido de lectura

1. [Informe acumulativo](INFORME_HITO3.md): problema, evolución de los tres hitos, diseño, decisiones, resultados y anexos.
2. [DEFENSA](DEFENSA.md): demo, tres cadenas y regresión controlada.
3. [Resultados limpios del 22/11](pruebas/reportes/revision-limpia-20261122/README.md): SHA, comandos, entorno y resultados.
4. [Registro profesional](validacion/REGISTRO.md): aprobación guiada, condición, cambios y métricas pendientes.

Los documentos A1–A9 desarrollan la información del informe. Los reportes fechados conservan las ejecuciones originales; docs/historico guarda versiones superadas. No deben usarse como resumen del estado actual. Las notas de conexión, recuperación y operación sirven para reproducir el proyecto y no requieren lectura durante la exposición. La presentación y el guion se entregan fuera de Git.

## Cotejo de los criterios

| Criterio y peso | Respuesta de la entrega | Evidencia principal | Brecha que permanece |
| --- | --- | --- | --- |
| 1. Problema, objetivos y valor, 15 | Actores, hipótesis, metas, referencias y resultados diferenciados | [A1](objetivos.md), informe §2–5, registro profesional | Sin línea base de uso ni indicadores medidos autónomamente con usuarios y validados por el stakeholder |
| 2. Trazabilidad, 15 | Nueve Must con modelo, HU, criterio, caso y evidencia; tres cadenas de defensa | [A4](trazabilidad.md), Anexo B | Aprobación cualitativa limitada a lo demostrado; criterios técnicos adicionales no aprobados por Heriber |
| 3a. Plan y cumplimiento, 7 | Inventario por nivel, entrada/salida, no ejecutados y deuda | [Plan](pruebas/PLAN.md) | PA-01–05 completos pendientes; parte del plan histórico se consolidó después de ensayos |
| 3b. Ejecución, 8 | Reportes por SHA, negativos, cobertura y mutación que falla | [Repetición limpia](pruebas/reportes/revision-limpia-20261122/README.md) | Hardware conserva registros manuales e instrumentados separados; sin medición completa de aceptación |
| 4. Calidad, 15 | Seguridad, eficiencia, mantenibilidad y recuperación acotadas | [A6](calidad/README.md) | CSP medio residual; carga local breve y recuperación sintética, sin extrapolación cloud |
| 5. Modelos y decisiones, 10 | Camino UML, datos y tres ADR ponderados | [A7](arquitectura/README.md), informe §10 | Puntajes de encaje de diseño, no benchmarks de alternativas implementadas |
| 6. Repositorio y tablero, 10 | Main protegida, CI, tags, changelog, HU y 31 subtareas consultadas | [A8](REPOSITORIO.md), Anexo A | Convención de tickets incompleta en historial; corte funcional anterior a esta revisión documental |
| 7. Defensa, 15 | Demo, rutas de evidencia, decisión arquitectónica y CP-RF03-U02 preparadas | [DEFENSA](DEFENSA.md) | El desempeño oral se evalúa en vivo; falta video de respaldo recomendado en Hito 2 |
| 8. Riesgos y deuda, 5 | Responsable, contingencia, materializados y prioridades | [A9](riesgos.md) | Voz offline, tacto, aceptación medida y recuperación cloud mantienen su plan |

Esta tabla no asigna una nota. La redacción y la evidencia técnica no reemplazan la medición con usuarios exigida para el nivel Excelente.

## Correcciones editoriales

Se unificaron las cifras de los resúmenes con la repetición limpia del 22/11, conservando las cifras del 21/11 en su contexto histórico. El informe desarrolla el recorrido de una frase desde la web hasta el audio del ESP, explica las siglas y presenta en primera persona las comprobaciones del autor. El Anexo A incorpora las subtareas reales del Sprint 3 con su estado consultado en Jira.

Se separan cuatro hechos antes fáciles de confundir: aprobación del flujo guiado, comprobación técnica, métricas no medidas y mejoras posteriores no revisadas por Heriber. También se distinguen 91 opciones del catálogo, 94 pictogramas visibles en un ensayo, 96 del tablero de referencia y 180 activos como máximo operativo probado.

No se eliminan los ensayos fallidos ni los documentos históricos: sustentan la evolución y la corrección de D15. El informe conserva contexto suficiente para leerse solo; los detalles de ejecución se consultan mediante enlaces.

## Corte de versión y regla de la rúbrica

El tag hito3 conserva f8b743f. La revisión limpia se ejecutó sobre a3d096f, que contiene el mismo frontend y esquema de datos. Esta revisión documental incorpora reportes posteriores al tag funcional y se debe identificar por su commit propio, sin atribuirlos retroactivamente a hito3.

La guía indica que la evidencia añadida después del tag no cuenta para ese corte. Por ello, conservar el tag histórico y publicar una revisión documental no acredita por sí solo que la comisión acepte el nuevo corte. Esa diferencia queda declarada; no se mueve ni se borra hito3 para ocultarla.
