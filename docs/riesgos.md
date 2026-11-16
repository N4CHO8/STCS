# A9 Riesgos y deuda técnica

Escala 1–3 para probabilidad e impacto. Nivel = producto: 1–2 bajo, 3–4 medio, 6–9 alto. Evaluación del proyecto, no probabilidades clínicas medidas.

| ID / requisito | P | I | Nivel | Estado y mitigación | Contingencia |
| --- | --- | --- | --- | --- | --- |
| R01 H3-RF04, tacto inferior | 3 | 2 | 6 | Materializado; controles arriba/laterales, defecto físico persiste | Revisar hardware antes de uso real |
| R02 H3-RF08, tarjetas al reiniciar | 2 | 3 | 6 | Materializado y corregido; metadatos/atlas, reinicio confirmado | Recuperación progresiva y respaldo |
| R03 H3-RF03, voz obsoleta o incompleta | 2 | 3 | 6 | Hash/versión y validación de tamaño, error explícito | Reintentar, sin reproducir otra frase |
| R04 H3-RF02/H3-RNF01, fuga de datos | 2 | 3 | 6 | API/roles y medios privados comprobados; revisión ampliada pendiente | Revocar acceso y revisar sin copiar clínica a logs |
| R05 OE1/OE2, sin aceptación externa | 3 | 3 | 9 | Correo enviado, reunión pendiente | Acordar evaluación o alternativa con profesor |
| R06 A4/A8, evidencia sin acceso/tag | 2 | 3 | 6 | Índice y reportes disponibles; anexos/tag pendientes | Probar acceso del profesor antes de congelar |
| R07 H3-RF05/08, cola llena/corte | 2 | 3 | 6 | Límite 64 y rechazo de nuevos encolados; PF-03–05 informados | Anexar trazas; no prometer registro ilimitado |
| R08 H3-RF06, AP persistente | 2 | 2 | 4 | Activación deliberada, sin timeout aceptado | Cerrar por reinicio y controlar entorno |
| R09 OE4, cuotas/conectividad | 2 | 2 | 4 | Storage persistente y caché acotada | Red alternativa; no garantizar gratuidad permanente |
| R10 FUT02, solo un ESP | 3 | 2 | 6 | Simulación API multi-perfil, sin flota física | Probar dos placas antes de extender uso |
| R11 A1, objetivos originales ausentes | 1 | 3 | 3 | Materializado y resuelto documentalmente con fuentes H1/H2 | Mantener equivalencias y medir aceptación |
| R12 A8, pérdida al migrar/restaurar | 1 | 3 | 3 | Migraciones aditivas y respaldo/restauración local registrada | Revisar destino y escrituras posteriores |
| R13/L-01 H3-RF03/08, voz sin Wi-Fi | 3 | 3 | 9 | Materializado, limitación aceptada sin cambio de firmware | Conexión y apoyo comunicativo alternativo del adulto |

## Backlog priorizado

| Prioridad | Deuda / Jira | Criterio de cierre |
| --- | --- | --- |
| P0 entrega | Revisión profesional / TCS-77 | Tareas y métricas acordadas, resultados y aprobación por alcance |
| P0 entrega | Evidencia y congelación / TCS-60 | Anexos, trazabilidad, accesos y tag hito3 revisado |
| P1 técnica | Seguridad / TCS-59 | DAST autenticado y negativos TLS/RLS ampliados, auditoría transversal y revisión de secretos |
| P1 técnica | Dispositivos / TCS-53 | Alta por posesión, ciclo web de claves/reasignación y varias placas verificados; revisar fallback heredado limitado a un código |
| P1 técnica | Portal / TCS-84/85 | Auditoría de operaciones, variantes de sesión/pestañas, teclado/foco/contraste y matriz Safari/teléfonos |
| P2 técnica | Historial / TCS-83 | Exportación completa, alias, defensa CSV y auditoría de alcance |
| P2 operación | Reproducción y recuperación / TCS-88 | Preparar desde cero el fixture de carga histórica; ensayo integral y staging cloud si se requiere, sin confundir demo con aislamiento |

## Antes de un entorno real

La defensa actual usa adultos y datos ficticios. Reclutar menores requiere revisión profesional/institucional, consentimiento/asentimiento aplicable, seguridad de carcasa/temperatura/volumen/alimentación y política de retención, retirada, exportación y borrado con restauración coherente. Es trabajo futuro, no una lista de actividades ya aceptadas ni condición que se declare cumplida por cerrar documentación.

Las ampliaciones predictivas FUT01 permanecen en análisis/diseño. Los ensayos físicos conservan su origen de confirmación y sus límites en [A5](pruebas/FISICAS_20261115.md).
