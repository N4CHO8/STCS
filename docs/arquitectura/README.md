Camino de modelamiento: **UML**.

# A7 Modelamiento y decisiones arquitectónicas

La arquitectura permite personalizar pictogramas desde web, sincronizarlos con ESP y limitar la información por responsable.

La [vista de componentes](../gestion/arquitectura.svg) resume clientes, API, persistencia y voz para el informe. Los modelos siguientes detallan el diseño: UC explica los actores y límites de TCS-53/84; CL1 representa los datos de TCS-49/51/52; SEQ1 sigue TCS-48 y SEQ2 comprueba TCS-59; ACT1 muestra selección y eventos de TCS-43–47/51/76. Así cada figura tiene una pregunta y una HU asociada, además de su requisito.

## Modelos

| Elemento UML exigido | Entrega | Relación con requisitos |
| --- | --- | --- |
| Casos de uso | UC1–UC8, [SVG](figuras/casos-uso.svg) y permisos descritos en [modelos](modelos.md) | Login, ficha, pictogramas, comunicación, actividad, Wi-Fi, administración y orientaciones |
| Clases | CL1: entidades, atributos y asociaciones en [modelos](modelos.md#cl1-entidades-y-datos) | H3-RF02/03/05/07/09; modelo lógico con nombres físicos, sin afirmar un ORM |
| Dos escenarios de secuencia | SEQ1 personalización/voz y SEQ2 privacidad ante URL directa, en [modelos](modelos.md) | H3-RF03/04 y H3-RF01/02, H3-RNF01; incluyen respuestas permitidas y fallos |
| Actividad de al menos un proceso | ACT1 operación del comunicador y envío de eventos, [SVG](figuras/actividad.svg) | H3-RF04/05/08 y H3-RNF04; UI y tarea de red independientes |

Los identificadores UC/CL/SEQ/ACT se conservan en [A4](../trazabilidad.md). Las clases representan entidades y relaciones, no un ORM.

## Stack y justificación

| Tecnología / responsabilidad | Razón de la elección en STCS | Decisión y evidencia |
| --- | --- | --- |
| TypeScript, React y Next.js | UI adulta y rutas API en una aplicación, contratos y validaciones compartidos; reduce piezas de operación sin mover permisos al navegador | [ADR-01](adr/ADR-01.md), [dependencias](../../frontend/package.json), [API](../../frontend/src/app/api), [backend](../../frontend/src/lib/server) |
| Vercel: web/API y función Python | Alojar navegador/API y síntesis demandada en servicios existentes; funcionamiento publicado sin proceso en el PC | ADR-01/03, [configuración](../../frontend/vercel.json), [conexiones](../CONEXIONES.md). No promete cuotas ni disponibilidad ilimitadas |
| PostgreSQL gestionado en Supabase; cliente SQL pg | Relaciones por perfil, transacciones, claves únicas y consultas de historial; persistencia compartida y esquema versionado | [ADR-02](adr/ADR-02.md), [esquema base](../../supabase/schema.sql), [migraciones](../../supabase/migrations), [adaptador SQL](../../frontend/src/lib/server/db.ts) |
| Autorización y sesiones de la aplicación | Permisos/proyecciones por rol y asignación vigente, cookies de sesión y revocación en app_sessions; un token antiguo no sustituye autorización actual | ADR-02, [auth](../../frontend/src/lib/server/auth.ts), [sesiones](../../frontend/src/lib/server/sessions.ts), [roles](../FLUJO_ROLES.md) |
| Supabase para verificación por correo | Activación/recuperación real por código; las cuentas de prueba marcadas siguen su excepción explícita. No confundir este servicio con la sesión adulta propia de STCS | [emailAuth](../../frontend/src/lib/server/emailAuth.ts), [flujo](../FLUJO_ROLES.md) |
| Storage privado y Sharp | Persistir PNG/RGB/WAV fuera del disco efímero de una función; normalizar imagen para el ESP y servirla tras autorización | [ADR-03](adr/ADR-03.md), [media](../../frontend/src/lib/server/media.ts), [almacenamiento](../../frontend/src/lib/server/media-store.ts) |
| Python y Piper | Preparar voz de la frase configurada y reutilizarla por hash/frase/versión de voz, sin instalar el modelo en ESP | ADR-03, [función](../../frontend/api/voice.py), [orquestación](../../frontend/src/lib/server/cloud-voice.ts), [dependencia fijada](../../frontend/requirements.txt) |
| C++/Arduino, LVGL y ESP32-S3 | Control táctil, pantalla y audio en la placa existente; metadatos y caché limitados con tareas de red separadas | ADR-03, [firmware](../../firmware/STCS_UI_Arduino/README.md), [contrato](../CONTRATO_MEDIOS_ESP.md) |

El navegador y el ESP son clientes HTTPS de la API. No hay conexión directa navegador → Arduino ni dependencia de USB de datos. La API valida perfil/sesión/dispositivo antes de consultar SQL o servir objetos privados.

## Decisiones

- [ADR-01](adr/ADR-01.md): API/despliegue integrado, backend separado o acceso directo cliente.
- [ADR-02](adr/ADR-02.md): datos relacionales, documentales o archivos locales.
- [ADR-03](adr/ADR-03.md): recursos embebidos, descarga sin caché o nube/caché acotada.

Cada matriz suma peso × puntaje, con pesos al 100%. Escala: 1 bajo encaje/retrabajo alto, 3 encaje parcial, 5 alto encaje con el prototipo. Los puntajes son valoración arquitectónica retrospectiva; código/pruebas respaldan la opción implementada y las alternativas no construidas conservan sus supuestos. [Cálculos verificados](revision-a7-20261117.json).

## Coherencia y límites de versión

Los modelos describen web/API, Supabase, Storage y Piper en nube, y el firmware v0.8.8. La auditoría CSV publicada se detalla en CL2; FUT01/FUT03 no aparecen como funciones ejecutadas. Voz pendiente/error y límites de caché se reflejan en las secuencias/actividad.

[Código y modelos](modelos.md), [pruebas](../pruebas/RESULTADOS.md), [riesgos](../riesgos.md) y [estado de entrega](../DEFENSA.md).
