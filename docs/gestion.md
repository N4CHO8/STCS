# Gestión y evolución del proyecto

## Objetivos de las etapas

| Etapa | Objetivo y resultado | Registro |
| --- | --- | --- |
| Hito 1 | Definir problema, arquitectura, datos, entorno y riesgos; analizar sugerencias sin implementar un motor | [Antecedentes](ANTECEDENTES_HITOS_1_2.md) |
| Hito 2 | Integrar ESP, web y persistencia; selección, frase, audio, configuración y eventos | 13 historias, 57 puntos; 6 de diseño predictivo y 51 del resto |
| Hito 3 | Verificar privacidad, Wi-Fi, continuidad, uso por responsables y pertinencia del prototipo con evidencia reproducible | [HU y tareas](gestion/HISTORIAS_SPRINT3.md), [resultados](pruebas/RESULTADOS.md) |

## Ficha del Sprint 3

| Dato | Registro |
| --- | --- |
| Responsable de ejecución | Ignacio Javier Benegas Guzmán |
| Profesores guía | Matías Vargas y César Cheuque |
| Sprint | 3, ID 321 |
| Inicio informado | Aproximadamente 26/10/2026, después del atraso del Sprint 2 |
| Término programado | 23/11/2026; no se atribuye un cierre administrativo anticipado |
| Presentación | 27/11/2026; 10 minutos de explicación y 5 de demostración |
| Revisión externa | Heriber Galleguillos, Zoom del 20/11/2026, adultos y datos ficticios |
| Evidencia | [A4](trazabilidad.md), [A5](pruebas/RESULTADOS.md) y [registro profesional](validacion/REGISTRO.md) |

Las fichas de [Sprint 2](gestion/HISTORIAS_SPRINT2.md) y [Sprint 3](gestion/HISTORIAS_SPRINT3.md) relacionan historia, criterio, tarea y resultado. Los estados administrativos se consultan en Jira y sus comentarios enlazan el registro de cierre; no sustituyen el resultado de una prueba. El desglose documental posterior no se presenta como planificación original.

## Definition of Done

Una historia cumple técnicamente cuando sus criterios tienen evidencia identificable, las entradas inválidas y accesos prohibidos están comprobados, las pruebas aplicables son conformes y no conserva un defecto crítico sin tratar. La aceptación de uso corresponde al stakeholder, con nombre, rol, fecha y alcance. La identificación de código y despliegue pertenece al control de versiones; compilar no demuestra operación física.

## Impedimentos y tratamiento

| Registro | Impedimento | Decisión y resultado | Responsable |
| --- | --- | --- | --- |
| 15/11 | Imágenes ausentes tras reiniciar | Separar metadatos y descargas, refresco progresivo y atlas; reinicio conforme | Ignacio Benegas |
| 15/11 | Tacto inferior poco fiable | Reubicar controles; defecto físico conservado como limitación | Ignacio Benegas |
| 15/11 | Ausencia de voz sin Wi-Fi | Mantener dependencia de red y alternativa comunicativa del adulto; L-01 | Ignacio Benegas |
| 16/11 | Filtros limitados a una página y consultas de sesiones antiguas | Filtros globales y cancelación de peticiones; regresión API/E2E conforme | Ignacio Benegas |
| 18/11 | Frases nuevas rechazadas por voz en nube | Reproducir D15, fijar configuración Piper y verificar ocho pruebas Python y WAV real en laboratorio | Ignacio Benegas |
| 20/11 | Complejidad del recorrido en pantalla pequeña | Selección de categorías/pictogramas por especialista y acceso directo con una categoría | Ignacio Benegas; pertinencia revisada por Heriber |

Las fechas corresponden a los registros disponibles. No se reconstruyen reuniones semanales ni fechas de resolución que no estén documentadas.

## Review y retrospectiva

La review del 20/11 contrastó el prototipo con un profesional. Se registraron aprobaciones de pertinencia y la condición de simplificar según cada niño. Las decisiones derivadas fueron adaptar el tablero, añadir fecha de inicio y habilitar observaciones del docente al especialista. Los cambios se verificaron con permisos y persistencia en laboratorio. [Registro](validacion/REGISTRO.md).

La retrospectiva documental identifica tres mejoras concretas: fijar el inventario de pruebas antes de ejecutar; enlazar cada resultado con su criterio y revisión; y mantener una sola ficha de versión para evitar cifras contradictorias. Se aplicaron en los reportes del 21/11 y en esta organización. No se presenta este análisis como un acta de una reunión anterior.

## Gestión del cambio

| Cambio | Motivo | Efecto en alcance o pruebas |
| --- | --- | --- |
| 32 → 180 activos, 45 por categoría | Ensayos escalonados en el hardware | Límite explícito; rechazo del exceso y caché acotada |
| Cola de 64 en LittleFS | Conservar eventos y acotar almacenamiento | Reinicio, ACK interrumpido, reintento e idempotencia |
| Controles arriba y flechas laterales | Tacto inferior defectuoso | Distribución comprobada; no reparación del panel |
| Cuatro roles y asignaciones autorizadas | Privacidad por responsabilidad | Negativos API, rutas antiguas y proyecciones por rol |
| Adaptación individual, fecha y observaciones | Revisión de Heriber del 20/11 | H3-RF12/13; pruebas de selección, permisos e idempotencia |
| Catálogo ARASAAC con créditos | Recomendación sobre símbolos y procedencia | 91 opciones; tres conceptos fuera del selector hasta revisión |

La predicción continúa como diseño. La asociación de ESP se limita a equipos previamente configurados; la rotación y reasignación integral desde web no forman parte de este MVP.
