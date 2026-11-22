# ADR 01 API y despliegue web

Estado: implementada; justificación retrospectiva registrada el 16/11 y revisada el 17/11. Escala de encaje 1–5, no benchmark; [método](../README.md).

## Contexto

H3-RF01/02 requiere sesiones y proyecciones; H3-RF03/05 comparte contratos de web y hardware. Se busca mantener pocas piezas de operación con los servicios existentes.

## Alternativas y matriz ponderada

| Criterio | Peso | Next.js integrado | Backend separado | Acceso directo cliente |
| --- | --- | --- | --- | --- |
| Autorizar y proyectar datos en servidor | 40% | 5 | 5 | 2 |
| Menos despliegues y configuración | 30% | 5 | 2 | 4 |
| Reutilización de tipos y mantenimiento | 20% | 5 | 3 | 3 |
| Flexibilidad de procesos largos | 10% | 2 | 5 | 1 |
| Total ponderado | 100% | 4,7 | 3,7 | 2,7 |

## Fundamento de los puntajes

| Criterio y peso | Dato comprobable / fundamento de la opción elegida | Supuesto sobre alternativas |
| --- | --- | --- |
| Autorización, 40%: 5 / 5 / 2 | [access.ts](../../../frontend/src/lib/server/access.ts) y [portal.ts](../../../frontend/src/lib/server/portal.ts) aplican asignación/proyección; [API y E2E](../../pruebas/RESULTADOS.md) prueban roles | Backend separado podría aplicar los mismos controles (5); acceso directo puntúa 2 por el rediseño de permisos/proyecciones que exigiría en este proyecto, no porque todo acceso directo sea inseguro |
| Operación, 30%: 5 / 2 / 4 | API y UI viven en el mismo proyecto Next; función Python se configura en [vercel.json](../../../frontend/vercel.json); no servidor Node adicional permanente | Separar backend añade al menos otro despliegue/configuración al diseño actual (2); cliente directo reduce esa capa pero no elimina preparación de medios/voz (4) |
| Contratos/mantenimiento, 20%: 5 / 3 / 3 | [validation.ts](../../../frontend/src/lib/server/validation.ts) y contratos TS compartidos con el servidor; tipos/build y unitarias comprobados | Otras opciones son viables, pero requieren trasladar o empaquetar contratos y cambiar integración; puntaje 3 de encaje, no medición de productividad |
| Trabajo largo, 10%: 2 / 5 / 1 | [cloud-voice.ts](../../../frontend/src/lib/server/cloud-voice.ts) usa trabajo demandado, lease y timeout; la función tiene duración configurada | Un backend de proceso largo podría controlar otro ciclo de vida (5); navegador no es un trabajador duradero (1). No se implementó ni cronometró esa alternativa |

## Decisión y consecuencias

Conservar Next.js/API y función Python en Vercel. El proceso de voz es demandado y persistente en SQL/Storage, no un trabajador permanente del PC. La contrapartida son duración de funciones y arranques en frío; la carga local no demuestra rendimiento superior a un backend separado. CSP usa nonce de scripts y conserva el [residual de estilos](../../calidad/README.md).
