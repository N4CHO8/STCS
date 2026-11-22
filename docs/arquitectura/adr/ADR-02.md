# ADR 02 Datos relacionales y autorización

Estado: implementada; justificación retrospectiva registrada el 16/11 y revisada el 17/11. Escala de encaje 1–5, no benchmark; [método](../README.md).

## Contexto

Los perfiles relacionan responsables, dispositivos, catálogo e historial. H3-RF02/09 exige permisos y H3-RF05 deduplicar reintentos. Se reutiliza PostgreSQL gestionado del proyecto.

## Alternativas y matriz ponderada

| Criterio | Peso | PostgreSQL + API | Documental + API | Archivos locales |
| --- | --- | --- | --- | --- |
| Integridad de relaciones y transacciones | 40% | 5 | 3 | 1 |
| Consultas de historial y asignaciones | 25% | 5 | 3 | 2 |
| Persistencia compartida entre adultos | 20% | 5 | 5 | 1 |
| Simplicidad operativa del MPV existente | 15% | 4 | 2 | 4 |
| Total | 100% | 4,85 | 3,25 | 1,70 |

## Fundamento de los puntajes

| Criterio y peso | Dato comprobable / fundamento de PostgreSQL + API | Supuesto sobre alternativas |
| --- | --- | --- |
| Integridad, 40%: 5 / 3 / 1 | FK en [schema.sql](../../../supabase/schema.sql), índice único por dispositivo/ID externo, transacciones y [pruebas de reintento/concurrencia](../../pruebas/RESULTADOS.md) | Modelo documental requeriría rediseñar relaciones/consultas del repositorio (3); archivos por equipo no incluyen por sí solos el control transaccional central que se necesita (1) |
| Historial/asignaciones, 25%: 5 / 3 / 2 | SQL parametrizado y consultas por perfil en [stcsData.ts](../../../frontend/src/lib/server/stcsData.ts)/[access.ts](../../../frontend/src/lib/server/access.ts) | Documental podría resolverlo con otro modelo (3); archivos requieren construir búsqueda/índices y coordinación adicionales (2). Sin benchmark entre motores |
| Compartir entre adultos, 20%: 5 / 5 / 1 | API y base central sirven a adultos asignados; dos ESP separados y varios computadores confirmados por el autor | Base documental central también permitiría compartir (5); archivos aislados no aportan esa sincronización de serie al proyecto (1) |
| Operación existente, 15%: 4 / 2 / 4 | Supabase y migraciones ya están integrados; [restauración local](../../pruebas/reportes/arreglos-locales-20261116/recuperacion.json) comprobada. Backups/migraciones siguen siendo trabajo operativo | Cambiar a documental implica migración/código nuevo (2); archivos son simples de iniciar (4) pero no resuelven los criterios anteriores |

## Decisión y consecuencias

Conservar PostgreSQL/Supabase y API autorizadora. La sesión adulta usa JWT/cookie y app_sessions propios; Supabase verifica el correo ([emailAuth](../../../frontend/src/lib/server/emailAuth.ts)). La conexión SQL privilegiada exige filtros en API; RLS no sustituye esa autorización. Credenciales privilegiadas solo en servidor y una individual en cada ESP. Coste: migraciones, respaldos y [recuperación](../../pruebas/reportes/arreglos-locales-20261116/recuperacion.json), hoy probada solo con datos sintéticos. La auditoría CSV ampliada sigue pendiente de despliegue.
