# Objetivos y requerimientos de Hito 1 y Hito 2

Especificación recuperada de las dos presentaciones y dos informes aportados por el propietario el 16/11/2026. Los textos de objetivos y RF se conservan como antecedentes de A1/A2/A4; su existencia no acredita aprobación externa de resultados. Los originales no se redistribuyen. Procedencia y hashes en evidencias/hito3-20261116/antecedentes.json.

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

## Evolución técnica de los requisitos

El corte de Hito 2 usaba 20 pictogramas, un máximo 8 por categoría/32 total y recursos embebidos. La entrega actual usa 96 activos, admite 45 por categoría/180 total y conserva cuatro visibles por página. Imágenes y voz propias se preparan en nube y el dispositivo utiliza caché limitada y atlas. La predicción permanece como diseño, no como motor implementado.

La actualización ≤15 s declarada en el Hito 2 no acredita tiempos de primera descarga o síntesis en frío actuales. Requiere medición específica. Los criterios técnicos no acreditan eficacia clínica ni aprobación externa.
