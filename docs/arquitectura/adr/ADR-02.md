# ADR 02 Datos relacionales y autorización

Estado: implementada, justificación retrospectiva. RF02/RF05/RF09 y RNF01.

Alternativas: PostgreSQL gestionado con API autorizadora; almacén documental con permisos propios; archivos locales por dispositivo. Escala 1–5, mayor mejor; pesos razonados, no medición comparativa de proveedores.

| Criterio | Peso | PostgreSQL + API | Documental + API | Archivos locales |
| --- | --- | --- | --- | --- |
| Integridad de relaciones y transacciones | 40% | 5 | 3 | 1 |
| Consultas de historial y asignaciones | 25% | 5 | 3 | 2 |
| Persistencia compartida entre adultos | 20% | 5 | 5 | 1 |
| Simplicidad operativa del MPV existente | 15% | 4 | 2 | 4 |
| Total | 100% | 4,85 | 3,25 | 1,70 |

Se elige Supabase PostgreSQL existente. users contiene roles adultos y registros child internos; student_profiles enlaza niño, user_access autoriza responsables, devices y pictograms pertenecen al perfil; device_events registra origen e idempotencia. La API conecta con privilegios de servidor y por eso filtra explícitamente rol/asignación en cada ruta. RLS y revocaciones complementan ese control: no lo sustituyen.

Evidencia: schema.sql, migraciones, access.ts, portal.ts, deviceAuth.ts y la suite verify-roles. Archivos en Storage privado, no en columnas binarias ni directorio público. Mantener claves fuera del cliente/ESP. Coste: migraciones, respaldos y mantenimiento de políticas; probar una restauración no implica autorizar sobrescribir producción.
