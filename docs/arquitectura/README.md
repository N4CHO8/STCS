# A7 Modelamiento de STCS

Camino de modelamiento: **UML**. [Casos de uso y actividad en SVG editable](modelos.md), entidades/clases lógicas y dos secuencias Mermaid. Las clases representan relaciones de datos, no un ORM. Los modelos corresponden al prototipo publicado.

## Cómo se conecta realmente

El navegador usa HTTPS para llamar a las API Next.js en Vercel. El firmware Arduino del ESP también consulta esas API por HTTPS/Wi-Fi con su credencial individual. **El navegador no abre una conexión directa con el Arduino ni requiere USB.** El servidor valida permisos y consulta PostgreSQL en Supabase. PNG/RGB565/WAV están en Storage privado. Una función Python de Vercel ejecuta Piper; el ESP recibe WAV, no el modelo ni credenciales de base de datos. El modelo se prepara/usa en nube, no en el PC del autor.

- [Modelos y referencias al código](modelos.md).
- [ADR-01 API y despliegue](adr/ADR-01.md).
- [ADR-02 datos y permisos](adr/ADR-02.md).
- [ADR-03 voz e imágenes](adr/ADR-03.md).
- Contrato implementado: [CONTRATO_MEDIOS_ESP.md](../CONTRATO_MEDIOS_ESP.md).
- Esquema: [schema.sql](../../supabase/schema.sql) y migraciones versionadas.

Las matrices ADR son una **evaluación retrospectiva razonada**, con escala 1–5 y pesos explícitos, no datos de benchmark ni decisiones aprobadas por un stakeholder en una fecha inventada. Los puntajes deben explicarse con sus criterios y consecuencias.
