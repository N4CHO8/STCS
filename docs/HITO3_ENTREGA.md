# Entrega y defensa del Hito 3 de STCS

Preparación del 16 de noviembre de 2026 para la presentación del **27 de noviembre: 10 minutos de explicación y 5 de demo**. Autor: Ignacio Benegas. La guía del profesor Matías Vargas Marín (10/11/2026, 19 páginas) pide nueve artefactos versionados y una auditoría en vivo. Esta carpeta organiza la evidencia; **la entrega aún no acredita cumplimiento completo de la rúbrica**.

## Accesos para el profesor

- [GitHub público](https://github.com/N4CHO8/STCS): no necesita invitación para leer.
- [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS): Ignacio debe verificar el acceso de lectura desde la cuenta del profesor; nuestro acceso por conector no lo demuestra.
- [Aplicación publicada](https://0stcs0.vercel.app): accesos sintéticos en README. No compartir cuenta administrativa, secretos, respaldos ni datos reales.
- [CI del estado previo b972cca](https://github.com/N4CHO8/STCS/actions/runs/43795321079): 291 comprobaciones de integración, 2 de caída DB y reconexión del trabajador.
- Firmware confirmado físicamente: v0.8.6-wifi-status. Tablero actual 96 activos, 24 por categoría, seis páginas. Máximo operativo ensayado 180/45, no límite físico absoluto.

## Los nueve artefactos

| Artefacto | Ubicación | Estado al preparar esta entrega |
| --- | --- | --- |
| A1 Problema, hipótesis, objetivos e indicadores | [objetivos.md](objetivos.md) | Propuesta de correspondencia; faltan objetivos oficiales y medición/validación externa |
| A2 Requerimientos, alcance y calidad | [requerimientos.md](requerimientos.md) | Catálogo reconstruido del producto; ratificar contra alcance aprobado |
| A3 HU Dado/Cuando/Entonces y aprobación | [historias.md](historias.md), Jira | Escenarios de cierre; aprobación externa no acreditada |
| A4 Trazabilidad completa | [trazabilidad.md](trazabilidad.md) | Matriz con aprobado técnico/parcial/pendiente y brechas históricas |
| A5 Plan, casos, resultados, defectos y cobertura | [pruebas/PLAN_HITO3.md](pruebas/PLAN_HITO3.md), [resultados](pruebas/RESULTADOS_HITO3.md) | Evidencia ejecutada diferenciada de aceptación pendiente |
| A6 Seguridad y eficiencia | [calidad/README.md](calidad/README.md) | Auditoría de dependencias y carga local; DAST y carga en nube pendientes |
| A7 Modelo y decisiones | [arquitectura/README.md](arquitectura/README.md) | Camino UML, modelos y tres ADR retrospectivos; revisión humana pendiente |
| A8 Repo, despliegue y tablero | [repositorio](REPOSITORIO_HITO3.md), README, CHANGELOG | Main protegida, CI y PR; tag final todavía no existe |
| A9 Riesgos y deuda | [riesgos.md](riesgos.md) | Incluye riesgos materializados, límites y plan priorizado |

La revisión del Word de Hito 2 confirma 71,25/100. Su criterio de implementación figura **Suficiente, 7,5/15**; el correo resumido decía Insuficiente. Conservar ambos originales y pedir aclaración al profesor si importa para el acta; no alterar la evaluación recibida.

## Bloqueantes para afirmar cumplimiento completo

1. Recuperar objetivos/requerimientos aprobados en Hito 1/2. La retroalimentación no contiene su texto. Los ID OE/RF de esta carpeta son una organización de cierre, no una aprobación retroactiva.
2. Agendar revisión Zoom esta semana. Acordar con profesor si el profesional puede ser sustituto representativo para indicadores de usabilidad. No atribuir eficacia ni comprensión a niños que no participaron.
3. Registrar nombre/rol/fecha y aprobación real de cada HU e indicador en Jira. Estado Finalizada o confirmación del estudiante no basta. Historias consolidadas no cuentan como funcionalidad adicional.
4. Completar cobertura del backend de negocio, E2E automatizados y escáner dinámico, o declarar brechas. El 100% medido corresponde solo a tres módulos, no a toda la app.
5. Resolver o acordar diferencias técnicas: cola 64 vs 256 de Jira; AP compartido sin cierre automático vs temporal/individual solicitado; pruebas de Android/iPhone, pérdida de ACK, segundo ESP y aislamiento entre varios niños.
6. Verificar enlaces con la cuenta del profesor y congelar el tag hito3 **después** de incorporar toda la evidencia. No crear ahora un tag definitivo ni moverlo luego.

## Ruta hasta la clase

| Momento | Acción | Responsable |
| --- | --- | --- |
| 16–18/11 | Confirmar profesional, objetivos oficiales y acceso del profesor | Ignacio |
| Esta semana | Zoom con tareas, tiempos, errores, ayudas y valoración visual | Ignacio + profesional |
| Después del Zoom | Incorporar acta real, resultados, aprobaciones y correcciones | Ignacio + responsable técnico |
| Antes del 26/11 | Resolver brechas priorizadas o acordar exclusiones; auditar tres cadenas; congelar hito3 | Ignacio |
| 26/11 | Ensayar 10 + 5 minutos con red de respaldo y vídeo corto del ESP | Ignacio |
| 27/11 | Defensa sobre ambiente publicado, con repositorio y Jira abiertos | Ignacio |

[Guion de exposición y demo](GUION_DEFENSA_HITO3.md). [Pauta de sesión y evidencia externa](validacion/PAUTA_HITO3.md).
