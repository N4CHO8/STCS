# A1 Objetivos declarados y medición de cierre

Los informes originales ya fueron recuperados. [La comparación de antecedentes](ANTECEDENTES_HITOS_1_2.md) conserva los textos y ubica cada contenido en informe o diapositiva. Son objetivos **declarados en entregas previas**, no prueba de aprobación formal ni de resultados medidos por un stakeholder.

## Objetivo general del proyecto

> Desarrollar un prototipo funcional de comunicación aumentativa basado en un dispositivo ESP32-S3 con pantalla táctil redonda y una plataforma web de configuración y seguimiento, con el propósito de apoyar la comunicación de niños con TEA mediante pictogramas.

## Objetivo de etapa del Hito 2

> Consolidar técnicamente el MVP de STCS mediante la implementación e integración del dispositivo ESP32-S3, la plataforma web y Supabase/PostgreSQL, demostrando coherencia entre requerimientos, diseño, arquitectura, código y pruebas.

Las diez metas preparatorias de H1 y siete específicas de H2 se conservan individualmente en el documento enlazado. Se mantienen sus diferencias de alcance, sin convertir objetivos de implementación en resultados clínicos.

## Correspondencia con los indicadores de cierre

OE1–OE4 son agrupaciones internas introducidas el 16/11 para organizar mediciones, **no los números originales de las listas anteriores**.

| Grupo de cierre | Objetivos de origen | Qué acredita y qué no |
| --- | --- | --- |
| OE1 Operación comprensible | H2-OE1/H2-OE2; H1-OE5 | Operación técnica física sí; comprensión/sobrecarga en usuarios todavía sin validar |
| OE2 Personalización | H2-OE3/H2-OE4; H1-OE6 | Persistencia e imagen/frase comprobadas; tiempos con usuarios y validación externa pendientes |
| OE3 Privacidad | H2-OE4/H2-OE5 y controles transversales nuevos | Autorización del sistema, no diagnóstico ni eficacia |
| OE4 Reproducibilidad y seguimiento | H2-OE5/H2-OE6; H1-OE3/H1-OE4 | CI, carga local e historial; no capacidad clínica ni flota física |
| Diseño predictivo, fuera de motor actual | H2-OE7; H1-OE7–H1-OE10 | Análisis/diseño declarados, no implementación ni eficacia medida |

## Problema e hipótesis para medir

Los antecedentes describen dificultades de algunos niños con TEA para comunicar necesidades/emociones y el riesgo de interfaces recargadas. STCS propone un comunicador personalizable con configuración y seguimiento web. No se inventa prevalencia, línea base cuantitativa o causalidad clínica.

Hipótesis técnica de cierre: imagen/frase/voz personalizables pueden sincronizarse sin recompilar cada tablero, con acceso autorizado. Hipótesis de usabilidad pendiente: el diseño resulta comprensible y manejable para los usuarios previstos; requiere método y evaluación externos.

Las métricas/metas siguientes siguen siendo propuestas nuevas; los archivos recuperados no contienen resultados representativos que permitan rellenarlas retroactivamente.

| ID provisional | Objetivo operativo | Indicador y método propuesto | Línea base | Meta propuesta | Resultado disponible |
| --- | --- | --- | --- | --- | --- |
| OE1 | Operar el comunicador de forma comprensible | 4 tareas en ESP: localizar agua/ayuda, construir frase, navegar sin perderla, borrar; medir éxito sin ayuda, errores y tiempo | No medida; pedir al profesional comparación apropiada | ≥3/4 tareas sin ayuda en revisión adulta; pertinencia de la meta por aprobar | Operación técnica confirmada por autor; sin resultado representativo ni validación externa |
| OE2 | Personalizar imagen y frase desde web | Crear/editar un pictograma; comprobar imagen y frase exactas en ESP; tiempo desde guardado hasta disponible | No medida antes del proyecto | 2/2 recorridos correctos; tiempo debe acordarse antes de medir | Imagen/voz y edición confirmadas físicamente 15/11; no ensayo de tiempos con usuarios |
| OE3 | Restringir información según rol y asignación | Accesos permitidos/prohibidos en API, incluidos URL directa y cuentas ajenas | Producto inicial sin medición comparable | 100% de casos de privacidad seleccionados aprobados | Suite técnica aprobada; validación del stakeholder pendiente |
| OE4 | Mantener operación reproducible y trazable | Salud cloud, CI, cambios con evidencia, carga local y reinicio físico | Versión previa descrita en historial Git; no línea base cuantitativa homogénea | CI aprobado y p95 local ≤2 s con 10 clientes; cero errores críticos no tratados | CI y carga local aprobados; no capacidad de producción ni eficacia clínica |

No convertir resultados de laboratorio en indicadores clínicos. El protocolo debe registrar fecha, versión, participantes/sustitutos y justificación, datos brutos, cálculo, comparación contra meta, limitaciones y aprobación del stakeholder. No rellenar retrospectivamente una línea base o afirmar que una meta fue acordada antes de existir.
