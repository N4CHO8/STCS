# A9 Riesgos deuda y mejoras

Actualización 16/11/2026. Escala probabilidad e impacto 1–3; nivel = producto: 1–2 bajo, 3–4 medio, 6–9 alto. Son estimaciones de cierre, no probabilidades estadísticas.

| ID / afecta | P | I | Nivel | Estado | Mitigación | Contingencia |
| --- | --- | --- | --- | --- | --- | --- |
| R01 RF04/OE1 táctil inferior falla | 3 | 2 | 6 alto | Materializado | Controles arriba y laterales, confirmado por autor | No usar controles esenciales abajo; evaluar hardware alternativo |
| R02 RF08/OE4 tarjetas ausentes tras reinicio | 2 | 3 | 6 alto | Materializado, corrección comprobada en tablero 96 | Metadatos separados de caché, atlas y refresco progresivo PR #7 | Conservar última versión y respaldos; no afirmar todos los audios offline |
| R03 RF03 voz/frase desincronizada o espera de red | 2 | 3 | 6 alto | Mitigado por hash/versión y rechazo de obsoletos | Validar tamaño/hash, estados de preparación y reintento | Indicar indisponible; no reproducir otra frase |
| R04 RNF01 fuga por rol/asignación | 2 | 3 | 6 alto | Controles e integración aprobados; revisión ampliada pendiente | Proyección y autorización en servidor, Storage privado | Revocar acceso y revisar incidente sin copiar clínica a logs |
| R05 OE1 validación profesional no realizada | 3 | 3 | 9 alto | Abierto, Zoom no agendado | Coordinar esta semana; acordar sustitutos con profesor | Declarar brecha y solicitar alternativa al docente |
| R06 A4/A8 evidencia inaccesible o sin tag | 2 | 3 | 6 alto | Abierto | Índice, reportes, enlaces, prueba con cuenta docente | Copia navegable autorizada; congelar después del cierre |
| R07 RF08 cola llena/corte de energía | 2 | 3 | 6 alto | Abierto: 64 implementados, 256 en Jira | Límite explícito; ensayo de ACK, cortes y llenado pendiente | No prometer ausencia de pérdida a cualquier tasa; resolver o acordar requisito |
| R08 RF06 AP compartido y sin timeout | 2 | 2 | 4 medio | Brecha confirmada respecto de TCS-74 | Activación deliberada y clave mostrada en pantalla | Cerrar por reinicio; rediseñar AP temporal antes de uso real |
| R09 OE4 proveedor/cuotas/Internet | 2 | 2 | 4 medio | Riesgo vigente | Medios persistentes, caché, reintento y demo ensayada | Hotspot probado y vídeo fechado, sin simular conexión |
| R10 RF02/FUT02 solo un ESP | 3 | 2 | 6 alto | Limitación vigente | Suite API con usuarios ajenos | Segundo ESP y perfiles aislados antes de afirmar flota real |
| R11 A1 ausencia de objetivos originales | 3 | 3 | 9 alto | Abierto | Recuperar informe aprobado y reconciliar IDs | Marcar propuesta; no inventar línea base o aprobación |
| R12 A8 migración/pérdida de datos | 1 | 3 | 3 medio | Respaldo/restauración local comprobados en publicación | Migraciones aditivas, respaldos privados y revisión de escrituras | Restaurar solo con revisión del destino y cambios posteriores |

## Deuda priorizada

| Prioridad | Deuda / Jira | Criterio para cerrar |
| --- | --- | --- |
| P0 académica | A1/A3: objetivos y validación externa / TCS-77 | Texto oficial, método, mediciones y aprobaciones auténticas por HU/indicador |
| P0 académica | A4/A8: trazabilidad y evidencia final / TCS-60 | Acceso de profesor, reconciliación de matriz y tag hito3 final |
| P1 técnica | Cobertura de negocio fuera de tres módulos, E2E automatizado y DAST / TCS-85,59,88 | Reportes con alcance y negativos; corregir hallazgos o declarar plan |
| P1 técnica | Cola 256, ACK perdido, cortes y llenado / TCS-76 | Implementación/ensayo completo o modificación de alcance aprobada, no unilateral |
| P1 técnica | AP individual/timeout, cambio de red fallido, Android/iPhone / TCS-74 | Pruebas físicas y cierre temporal verificables |
| P1 técnica | Varios dispositivos, reasignación y rotación / TCS-53 | Dos ESP/perfiles y controles de cambio probados |
| P2 | Historial/exportación y escenarios de error/móvil / TCS-83,85 | Matriz completa ejecutada, no solo build |
| P2 | Ramas/PR antiguos sin ticket y sprint desactualizado / TCS-88 | Correspondencia histórica declarada, convención futura y fechas reales |
| P2 diseño | Formalizar notación UML de uso/actividad si profesor lo exige | Revisión de modelos y coherencia con código, sin inventar clases ORM |

No se presenta riesgo mitigado como inexistente ni una tarea de evidencia como prueba técnica que aún no se hizo.
