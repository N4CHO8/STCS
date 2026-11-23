# Revisión profesional — 20/11/2026

Se revisó el prototipo por Zoom. Ignacio operó la web y mostró a Heriber Galleguillos sus flujos con datos ficticios. Después de cada recorrido le solicitó su opinión y Heriber dio su conformidad con lo demostrado, además de proponer mejoras. Heriber observó la demostración guiada: no operó el sistema por su cuenta y no volvió a probar la versión modificada. Fue una revisión cualitativa, sin participación de niños ni mediciones de uso.

Esta descripción incorpora la aclaración del autor del proyecto recibida el 22/11/2026 sobre cómo se condujo la reunión y el alcance de la conformidad. Se usa como registro principal para no repetir esa procedencia en cada tabla. La grabación privada conserva la sesión; los documentos públicos enlazan este registro. La aclaración no añade tiempos, errores, ayudas, citas ni resultados que no se hayan medido.

## Sesión y evidencia

| Dato | Registro |
| --- | --- |
| Fecha | 20/11/2026, visible en la grabación |
| Duración | Archivo de 30 minutos; conversación aproximadamente entre 04:57 y 29:49 |
| Profesional y stakeholder | Heriber Galleguillos, psicólogo infantojuvenil, especialista en necesidades educativas especiales y trastorno del espectro autista |
| Autorización de cita | Ignacio confirmó el 21/11 que autorizó citar su nombre y comentarios en la entrega al profesor. No se extiende este permiso a publicar la grabación completa |
| Modalidad | Zoom; Ignacio comparte la web y envía un video del ESP que el profesional comenta |
| Entorno mostrado | https://0stcs0.vercel.app, perfil ficticio Luis; SHA desplegado y versión del ESP no identificados durante la sesión |
| Operador y alcance | Ignacio operó la web y mostró todos sus flujos. Heriber observó, comentó y aprobó cualitativamente lo demostrado; no operó la web o el ESP ni completó tareas autónomas |
| Versión posterior | Las mejoras derivadas se publicaron mediante PR #17 y se comprobaron por separado. Heriber no volvió a probar esa versión |
| Evidencia | Grabación original conservada en privado. Su acceso en la entrega requiere acordarse; no se publican video, capturas ni transcripción |

Los minutos siguientes localizan los comentarios. Son resúmenes, no citas literales. Se revisaron la transcripción local del audio completo y fotogramas de referencia; las pantallas no se inspeccionaron cuadro por cuadro.

## Qué se revisó

| Caso | Observación | Resultado y límite |
| --- | --- | --- |
| PA-01: categorías y acceso | 11:23–18:00: comenta el video del comunicador, tamaño y cantidad de pasos | Flujo aprobado cualitativamente con la condición de simplificar el tablero por niño. Autonomía, tiempo, errores y ayudas no medidos |
| PA-02: frase y navegación | Ignacio muestra y explica selección, formación de mensajes y navegación | Flujo aprobado cualitativamente en la demostración guiada. Heriber no ejecutó dos secuencias autónomas y no se midieron tiempo, errores o ayudas |
| PA-03: editar y comprobar voz | Ignacio muestra la personalización web y a las 07:43–08:01 informa el fallo de voz nueva | La pertinencia de personalizar fue aprobada; el recorrido técnico completo edición → nueva voz → ESP no se comprobó en la reunión. D15 se corrigió después y Heriber no probó la versión corregida |
| PA-04: vocabulario y presentación | 12:05–13:08 y 24:22–25:32: valora pocas distracciones y Hablar verde; cuestiona símbolo genérico de comida | Flujo y presentación aprobados cualitativamente, con la condición de adaptación individual. No se midió carga visual con niños ni se contrastó una meta numérica |
| PA-05: información por rol | Ignacio muestra especialista, ficha y orientaciones docentes entre 24:09–28:08 | Flujos web mostrados aprobados cualitativamente. Heriber pidió fecha de inicio y sugirió comentarios docentes. No evaluó todos los negativos de rol, restricciones de API, tiempo, errores, ayudas o autonomía |

No se acordaron ni midieron tiempos, errores, ayudas o una referencia inicial por tarea. La aprobación corresponde a los flujos observados en la demostración guiada; no se registraron ejecuciones autónomas.

## Comentarios y acciones propuestas

| Minuto | Comentario | HU relacionadas | Acción |
| --- | --- | --- | --- |
| 08:37–09:08; 24:09–24:31; 25:32–25:43 | Encuentra clara la plataforma y útil la vista del especialista | TCS-85 | Conservar estructura; la opinión no aprueba todos sus criterios |
| 12:05–13:08 | Reducir distractores; valora pocas opciones y Hablar verde | TCS-26/31/43 | Conservar estas decisiones y revisar las modificaciones |
| 13:08–18:00 | Pantalla pequeña y varios pasos pueden dificultar el acceso; propone mensajes sencillos, como ayuda | TCS-26/28/30/44/45 | Definir configuración inicial sencilla por niño, elegida por el especialista. El límite técnico de 180 no es una recomendación clínica de cantidad |
| 19:13–21:22 | Uso cotidiano y formación de familiares | TCS-60/77/85 | Incluir adaptación y acompañamiento; no afirmar autonomía infantil demostrada |
| 24:22–25:32 | Varios alimentos pueden no representar lo que quiere el niño; propone revisar comida/comer | TCS-30/48 | Adaptar símbolo, nombre y frase al contexto; no sustituir globalmente imágenes sin evaluación |
| 25:43–26:34 | Registrar cuándo empieza a usar el dispositivo | TCS-85 | Fecha de inicio implementada y comprobada por API en nube; separada de la creación técnica |
| 27:11–28:08 | Orientaciones sin datos clínicos para docentes; propone observaciones del docente al especialista | TCS-85/77 | Observaciones implementadas: docente escribe las propias y especialista asignado las consulta; sin diagnóstico ni progreso para docentes |

Responsable del seguimiento: Ignacio. La adaptación, fecha de inicio y observaciones docentes se publicaron el 21/11 mediante [PR #17](https://github.com/N4CHO8/STCS/pull/17). Las pruebas técnicas y físicas posteriores están en el [registro final](../pruebas/reportes/comprobacion-final-20261121/README.md); no se atribuyen como nuevas observaciones o aprobaciones de Heriber.

## Decisión por objetivos e historias

Heriber aprobó los flujos demostrados, aunque la conversación no formuló las decisiones mediante IDs de Jira ni midió los indicadores de A1. La tabla relaciona retrospectivamente cada flujo con sus HU y limita la aprobación a lo observado. La reunión no certifica eficacia terapéutica, seguridad informática, cierre técnico ni un piloto con menores.

| HU y criterios identificables | Decisión de la demostración guiada | Alcance y evidencia complementaria |
| --- | --- | --- |
| TCS-30, criterios de vocabulario y pictogramas | Flujo aprobado por el stakeholder en la demostración guiada del 20/11/2026 | Aprobación de pertinencia; conservar adaptación individual y revisión de comida/comer |
| TCS-45, selección como interacción comunicativa | Flujo aprobado por el stakeholder en la demostración guiada | No es una prueba táctil autónoma; estabilidad, bordes y tiempos se respaldan con pruebas físicas separadas |
| TCS-48, personalización del tablero | Flujo aprobado por el stakeholder en la demostración guiada | Aprobó la pertinencia de editar el apoyo. D15 impidió acreditar voz nueva durante la reunión; [PR #17 y reporte final](../pruebas/reportes/comprobacion-final-20261121/README.md) demuestran la corrección posterior |
| TCS-85, claridad y pertinencia de vistas adultas | Flujos web aprobados por el stakeholder en la demostración guiada | No es certificación integral de accesibilidad. Solicitó fecha de inicio y observaciones docentes; se implementaron en PR #17 y se probaron sin una segunda revisión profesional |
| TCS-60, recorrido integrado mostrado | Flujo aprobado por el stakeholder en la demostración guiada | Aprobación cualitativa del recorrido observado; no cierra D15, seguridad, CI, recuperación, métricas ni publicación |
| TCS-77, revisión profesional | Revisión y conclusiones aprobadas dentro de su alcance cualitativo | Operación autónoma, tiempos, errores y ayudas no medidos |

La aprobación del recorrido del ESP quedó condicionada a simplificarlo según las necesidades de cada niño. En tacto, frase visible y Volver/Borrar no se solicitaron cambios adicionales durante la demostración. Esto no sustituye las mediciones de uso no realizadas; las pruebas físicas posteriores se registran por separado.

### Aclaración sobre pantalla y complejidad del recorrido

Ignacio precisó que la preocupación del profesional era la combinación de una pantalla pequeña y varios pasos para comunicar: seleccionar, cambiar de página y volver a seleccionar. Se registra como una posible dificultad de acceso que debe evaluarse individualmente, no como una capacidad atribuible a todos los niños con TEA.

La condición afecta TCS-26/31/43 (presentación), TCS-28/44 (recorrido y navegación) y TCS-48 (personalización): el especialista debe poder reducir categorías y pictogramas por niño. Se implementó y publicó sin borrar el catálogo: solo el especialista asignado guarda la selección; el firmware oculta categorías vacías y abre directamente la única categoría cuando corresponde. La aprobación de pertinencia y su comprobación técnica posterior son registros distintos; el firmware instalado es v0.8.8-adaptive-board.

Heriber condicionó la aprobación de ese recorrido a la simplificación. La condición se publicó y se comprobó en el ESP el 22/11 mediante un ensayo manual con firmware v0.8.8-adaptive-board. Es una comprobación técnica posterior, no una nueva evaluación del profesional. También aprobó incorporar fecha de inicio y observaciones docentes. [Cambios y pruebas](../pruebas/reportes/comprobacion-final-20261121/README.md).

| Objetivos/HU | Alcance de la revisión |
| --- | --- |
| H2-OE1/2 | Presentación y acceso comentados; autonomía y secuencias cuantificadas no evaluadas |
| H2-OE3/4 | Personalización explicada; persistencia, sincronización y nueva voz no comprobadas por el profesional |
| H2-OE5 | Información e historial comentados; cola, ACK y controles de acceso no evaluados |
| H2-OE6/7 | Pruebas técnicas y diseño predictivo no evaluados |
| TCS-30/45/48/60/85 | Flujos aprobados por el stakeholder en la demostración guiada; límites en la tabla anterior |
| TCS-26/28/31/43/44 | Aprobación condicionada a simplificar por niño; condición implementada, publicada y comprobada manualmente en el ESP el 22/11 |
| TCS-27/46/47 | Tacto, frase visible y Volver/Borrar adecuados en la demostración, sin cambios adicionales; las métricas técnicas y de autonomía se prueban por separado |
| TCS-77 y referencias TCS-61/87 | TCS-77 aprobada en su alcance cualitativo; las consolidadas remiten a ella sin extender la decisión a criterios no revisados |

Los profesores conservan su función de guías y evaluadores; Heriber es el stakeholder de pertinencia, como se registra en [A3](../historias.md).

## Adecuación individual y límites de interpretación

La adaptación del **dispositivo concreto** debe responder a las necesidades de acceso. No se convierten los comentarios sobre edad, habla o capacidad cognitiva en criterios generales de exclusión de la CAA. ASHA indica que la CAA no requiere prerrequisitos y puede introducirse temprano; no debe presentarse como algo que frena el habla. [Portal profesional](https://www.asha.org/Practice-Portal/Professional-Issues/Augmentative-and-Alternative-Communication/), [intervención temprana](https://www.asha.org/practice/early-intervention-provider-support/augmentative-and-alternative-communication-in-early-intervention/).

En 23:37–23:55 se describe verbalmente el diagnóstico como visible también para docentes; más adelante se aclaran las orientaciones sin datos clínicos. El comportamiento exigido sigue siendo [el de los roles](../FLUJO_ROLES.md): docente sin diagnóstico ni progreso. La explicación oral inicial no cambia esos permisos.

## Referencias recomendadas después de la reunión

Ignacio compartió dos mensajes del profesional del 20/11, a las 21:04 y 21:05: recomendó **LetMeTalk** como aplicación de referencia y **ARASAAC** como fuente de pictogramas utilizada por profesionales. Se registran como recomendaciones comunicadas por el profesional, no como pruebas realizadas con esas herramientas ni aprobación adicional de las HU.

Las decisiones comunicadas por HU y los ajustes implementados constan en este registro. Los indicadores cuantitativos no se midieron. El ensayo de voz nueva en Vercel del 18/11 conserva su incidencia [D15](../pruebas/reportes/voz-nube-20261118/README.md).
