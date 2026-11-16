# A7 Modelamiento de STCS

Camino elegido para esta entrega: **UML**. No se mezclan entregables C4+BPMN para aparentar dos caminos completos. Se incluyen casos de uso, entidades, dos secuencias y actividad. Casos de uso y actividad usan flowchart de Mermaid para su lectura en GitHub; son una representación simplificada, no una exportación de herramienta UML formal. Confirmar con el profesor si requiere la notación formal adicional.

## Cómo se conecta realmente

El navegador usa HTTPS para llamar a las API Next.js en Vercel. El firmware Arduino del ESP también consulta esas API por HTTPS/Wi-Fi con su credencial individual. **El navegador no abre una conexión directa con el Arduino ni requiere USB.** El servidor valida permisos y consulta PostgreSQL en Supabase. PNG/RGB565/WAV están en Storage privado. Una función Python de Vercel ejecuta Piper; el ESP recibe WAV, no el modelo ni credenciales de base de datos. El modelo se prepara/usa en nube, no en el PC del autor.

- [Modelos y referencias al código](modelos.md).
- [ADR-01 API y despliegue](adr/ADR-01.md).
- [ADR-02 datos y permisos](adr/ADR-02.md).
- [ADR-03 voz e imágenes](adr/ADR-03.md).
- Contrato implementado: [CONTRATO_MEDIOS_ESP.md](../CONTRATO_MEDIOS_ESP.md).
- Esquema: [schema.sql](../../supabase/schema.sql) y migraciones versionadas.

Las matrices ADR son una **evaluación retrospectiva razonada**, con escala 1–5 y pesos explícitos, no datos de benchmark ni decisiones aprobadas por un stakeholder en una fecha inventada. Requieren defensa por Ignacio.
