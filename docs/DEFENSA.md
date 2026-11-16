# Defensa de STCS

Índice de entrega técnica, actualizado el 16/11/2026. La estructura responde a los nueve artefactos de la guía del profesor. Los IDs H3-RF/H3-RNF y la etiqueta exigida `hito3` conservan sus nombres para no romper la trazabilidad.

## Entrega y evidencia

| Artefacto | Documento principal | Situación |
| --- | --- | --- |
| A1 Problema, hipótesis, objetivos e indicadores | [Objetivos](objetivos.md) | Objetivos originales y metas propuestas; medición y ratificación externa pendientes |
| A2 Requerimientos y alcance | [Requerimientos](requerimientos.md) | Incluye prioridad, objetivo, modelos y escenarios de seguridad/eficiencia |
| A3 Historias y aceptación | [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS), [correspondencia](historias.md) | Criterios Dado/Cuando/Entonces; aprobación externa pendiente |
| A4 Cadena de trazabilidad | [Matriz](trazabilidad.md) | Objetivo, requisito, modelo, HU/sprint, caso, reporte y revisión; conserva pendientes |
| A5 Plan y resultados de pruebas | [Plan](pruebas/PLAN.md), [resultados](pruebas/RESULTADOS.md) | Software ejecutado; confirmaciones físicas con anexos pendientes |
| A6 Seguridad y eficiencia | [Calidad](calidad/README.md) | Reportes originales, umbrales, alcance y aviso residual |
| A7 Modelos y decisiones | [Arquitectura](arquitectura/README.md) | Modelos y tres ADR con alternativas ponderadas |
| A8 Repositorio y despliegue | [Repositorio](REPOSITORIO.md), README y CHANGELOG | Main protegida y CI; tag final pendiente |
| A9 Riesgos y deuda | [Riesgos](riesgos.md) | Riesgos materializados, mitigación, contingencia y mejoras priorizadas |

## Versión técnica de referencia

[Producción](https://0stcs0.vercel.app), [GitHub](https://github.com/N4CHO8/STCS) y [CI de main 22fa385](https://github.com/N4CHO8/STCS/actions/runs/43925021420). La corrección del E2E de sesión está en [PR #15](https://github.com/N4CHO8/STCS/pull/15). Los reportes de carga, cobertura y ZAP identifican sus propias revisiones de ejecución; no se vuelven a fechar al reorganizar documentos.

ESP confirmado: v0.8.6-wifi-status, un equipo, 96 activos. [Registro físico](pruebas/FISICAS_20261115.md). Límite operativo ensayado 180/45, cola de 64, voz sin Wi-Fi no garantizada.

## Cierre que requiere al autor o al evaluador

1. Adjuntar evidencias reales de los ensayos ya comunicados y medir los indicadores acordados; no inventar duración o conteos.
2. Realizar la revisión profesional, registrar nombre/rol/fecha y aceptación por HU e indicador. El correo está enviado, sin reunión acreditada. [Protocolo](validacion/PAUTA.md).
3. Verificar lectura de GitHub y Jira desde la cuenta del profesor. Nuestro acceso por conector no demuestra el suyo.
4. Tras incorporar evidencia y revisar pendientes, congelar el tag `hito3` del commit final. No moverlo para incluir evidencia posterior.

Esta entrega describe una demostración con adultos y datos ficticios. No acredita eficacia clínica, prueba con varios ESP ni autorización de un piloto con menores. La evolución y registros antiguos están separados en [histórico](historico/README.md).
