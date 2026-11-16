# Antecedentes de Hito 1 y Hito 2 y preparación de la defensa

Fuentes entregadas por Ignacio el 16/11/2026: dos presentaciones y dos informes. Se leyeron textos, notas y tablas; se inspeccionó también la imagen de arquitectura de la diapositiva 3 del Hito 2. No se dispone de grabación de clase: **no puede concluirse qué dijo u omitió oralmente**. El profesor indicó al estudiante que evalúa principalmente la exposición. Documentado, visible en diapositiva y demostrado en clase son estados distintos.

Los originales permanecen sin cambios fuera del repositorio. Este documento recoge especificación propia de STCS y correspondencias; no publica las presentaciones completas ni sus accesos antiguos. Las notas de PowerPoint no prueban qué alcanzó a explicar el expositor.

## Objetivo general del proyecto en Sprint 1, sección 4

> Desarrollar un prototipo funcional de comunicación aumentativa basado en un dispositivo ESP32-S3 con pantalla táctil redonda y una plataforma web de configuración y seguimiento, con el propósito de apoyar la comunicación de niños con TEA mediante pictogramas.

## Objetivos del Sprint 1, sección 5

Los IDs H1-OE se asignan aquí para referenciar la lista; los textos son originales, no nuevas metas aprobadas.

| Referencia | Texto declarado |
| --- | --- |
| H1-OE1 | Configurar el ambiente de desarrollo necesario para programar el ESP32-S3 con PlatformIO. |
| H1-OE2 | Definir el alcance funcional inicial del dispositivo físico. |
| H1-OE3 | Diseñar la arquitectura de integración entre el ESP32-S3, la plataforma web y Supabase. |
| H1-OE4 | Definir el modelo mínimo de datos del dispositivo, incluyendo pictogramas, categorías, eventos y sincronización. |
| H1-OE5 | Diseñar un tablero inicial de pictogramas basado en principios de CAA. |
| H1-OE6 | Preparar la plataforma web para configurar pictogramas y visualizar eventos futuros. |
| H1-OE7 | Analizar la factibilidad de incorporar un sistema de predicción de pictogramas para facilitar la construcción de frases. |
| H1-OE8 | Definir los datos mínimos necesarios para generar sugerencias de pictogramas. |
| H1-OE9 | Establecer reglas iniciales simples de predicción antes de implementar una solución más avanzada. |
| H1-OE10 | Evaluar los riesgos asociados al uso de sugerencias automáticas en el dispositivo. |

## Objetivo de etapa del Hito 2, sección 3

> Consolidar técnicamente el MVP de STCS mediante la implementación e integración del dispositivo ESP32-S3, la plataforma web y Supabase/PostgreSQL, demostrando coherencia entre requerimientos, diseño, arquitectura, código y pruebas.

| Referencia de cierre | Texto declarado en sección 3.1 |
| --- | --- |
| H2-OE1 | Implementar una interfaz CAA funcional y táctil en la pantalla redonda del ESP32-S3. |
| H2-OE2 | Permitir navegación por categorías, selección de pictogramas, construcción, limpieza y reproducción de una frase. |
| H2-OE3 | Persistir la configuración de pictogramas por perfil y administrarla desde la plataforma web. |
| H2-OE4 | Sincronizar el catálogo web y el dispositivo mediante Wi‑Fi/HTTPS. |
| H2-OE5 | Registrar eventos autenticados del dispositivo y mostrarlos en un historial ordenado. |
| H2-OE6 | Documentar arquitectura, modelo de datos, reglas, pruebas, atributos de calidad y riesgos. |
| H2-OE7 | Mantener diseñado el flujo predictivo sin presentarlo todavía como funcionalidad implementada. |

H1 contiene objetivos preparatorios; H2 describe un incremento técnico. No convertir ninguno en una meta clínica ni sustituirlos por los cuatro indicadores agrupados nuevos. Recuperar el texto resuelve la falta documental; no acredita aprobación externa de resultados.

## Requerimientos originales del Hito 2, sección 6

| ID histórico | Texto declarado | Prioridad original | Jira | Correspondencia actual |
| --- | --- | --- | --- | --- |
| RF-01 | El dispositivo debe mostrar un menú inicial y categorías reconocibles. | Alta | TCS-43/44 | H3-RF04 |
| RF-02 | El usuario debe seleccionar pictogramas por toque y recibir feedback inmediato. | Alta | TCS-27/45 | H3-RF04 |
| RF-03 | La frase debe conservar el orden y permitir Borrar, Volver y Hablar. | Alta | TCS-46/47 | H3-RF04 |
| RF-04 | La web debe agregar, editar y desactivar pictogramas asociados al perfil. | Alta | TCS-48/49 | H3-RF03 |
| RF-05 | El ESP32 debe descargar la misma configuración activa de la web. | Alta | TCS-48/49 | H3-RF03/H3-RF08 |
| RF-06 | La API debe recibir y persistir eventos autenticados del dispositivo. | Alta | TCS-51 | H3-RF05 |
| RF-07 | La plataforma debe mostrar el historial más reciente con actor y contexto. | Media | TCS-52 | H3-RF05/H3-RF10 |
| RF-08 | Cada categoría debe admitir más de cuatro opciones mediante paginación. | Media | TCS-44/48 | H3-RF04/H3-RF11 |
| RD-01 | El flujo de sugerencias debe quedar diseñado sin confundirlo con una función implementada. | Media | TCS-72/73 | FUT01: diseño, no motor implementado |

**RF-03 histórico es frase/controles, mientras H3-RF03 es edición de pictograma.** Los prefijos evitan atribuir significado nuevo a un ID anterior. Los casos CP-RF03-Uxx ya ejecutados conservan su nombre y corresponden a H3-RF03; no se altera un reporte para simular otra ejecución.

## Comparación entre material y exposición necesaria

| Pregunta de Hito 2 | Informe | Presentación | Qué mostrar en Hito 3 |
| --- | --- | --- | --- |
| ¿Cómo se conecta web con ESP? | Secciones 7 y 8 describen capas y endpoints GET config / POST events | Diapositiva 3 nombra API y HTTPS, pero su imagen incluye una flecha diagonal persistencia–ESP que puede sugerir acceso directo | Una secuencia: navegador → API y ESP → API; API → DB/Storage. Mostrar petición, validación y respuesta |
| ¿Qué tiene el backend? | Secciones 7–9 describen API Routes y responsabilidades | Diapositiva 3 lo resume en pocas líneas | Abrir ruta real y servicio de autorización/validación; no quedarse en nombres de herramientas |
| ¿Qué datos y relaciones existen? | Sección 8 enumera seis tablas, claves y reglas | Diapositiva 3 enumera datos sin detallar sus relaciones | Mostrar CL1 y explicar UserAccess, StudentProfile, Device, Pictogram, Event y medios |
| ¿Qué testing existe? | Secciones 12–13 contienen P01–P15 y matriz | Diapositivas 8–9 resumen PASS, esperado y tipo de evidencia | Abrir prueba y reporte con obtenido, fecha y SHA; distinguir unitario/integración/manual y enseñar una regresión detectada |
| ¿No hay sobrecarga visual? | Secciones 2 y 11 distinguen criterio técnico y validación profesional pendiente | Diapositiva 11 conserva validación de símbolos pendiente | Separar cuatro opciones por página de comprensión/usabilidad real; presentar medición experta auténtica cuando exista |
| ¿Por qué esas decisiones? | Razones y atributos en secciones 7 y 11 | Diapositiva 10 enumera cualidades | Comparar alternativas/pesos en ADR y reconocer consecuencias |

El diagrama puede haber dificultado la explicación, pero no se atribuye a esa flecha la causa de la evaluación: no se puede demostrar sin más información.

## Precisiones para no repetir afirmaciones ambiguas

- Sprint 1, diapositiva 8 llama “Unitario” a configuración y build. El informe aclara que no había suite automática completa. En Hito 3, build y tipos se presentan como verificaciones de compilación; node:test como pruebas unitarias reales.
- Hito 2, diapositiva 8 muestra PASS sin abrir allí cada reporte/commit ni detallar cada resultado observado. Mostrar un resumen no sustituye abrir evidencia.
- Los 15 casos, 13 historias, 57 puntos y catálogo de 20 son declaraciones del corte anterior. No son resultados actuales de 7 unitarias, 291 comprobaciones de integración y 96 activos.
- El firmware anterior embebía imágenes/WAV y usaba SPIFFS; el actual incorpora imágenes/frases propias, Piper en nube y caché/atlas. Explicar la evolución, no reutilizar la diapositiva como arquitectura vigente.
- Reglas anteriores de 8 por categoría/32 totales evolucionaron al límite operativo ensayado de 45/180 y tablero actual 24/96. La ampliación fue solicitada por el propietario y conserva cuatro visibles por página; no demuestra adecuación clínica de 180.
- La sincronización ≤15 s declarada en Hito 2 no se da por cumplida para primera descarga/síntesis/arranque en frío actuales. Repetir medición bajo condiciones explícitas o declarar la brecha.
- La predicción aparece analizada/diseñada, no implementada. Se conserva RD-01 y vínculo con TCS-72/73.

## Sprint Goal recuperado

El objetivo del Sprint 2 figura en la diapositiva 2 y sección 4 del informe. El objetivo vacío observado en Jira es una brecha de registro, no ausencia de objetivo en los antecedentes. No se modifica retrospectivamente estado/fecha del sprint ni se afirma cuándo lo aprobó el profesor.

## Decisión de preparación

Ya no se requieren estos archivos otra vez. Se integran objetivos/requerimientos declarados y se prepara la presentación para mostrar evidencia en vivo. Permanecen pendientes mediciones/aprobaciones externas, ensayos técnicos no ejecutados, acceso del profesor a Jira y congelación final hito3.
