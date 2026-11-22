# Historias del Sprint 2

Fichas contrastadas con Jira el 22/11/2026. Se conservan IDs y estado histórico; los criterios y el desglose documental no se atribuyen a una planificación previa no acreditada. Las historias de pruebas se entienden como verificación del comportamiento de la HU. TCS-72/73 son trabajo de diseño, no un motor predictivo ejecutado. Aprobación y alcance en [A3](../historias.md).

## TCS-72 Diseño del flujo de sugerencias en el tablero del ESP32

Como usuario del comunicador, quiero contar con un diseño claro para posibles sugerencias futuras para evitar que interfieran con la selección de mensajes.

**Requerimiento:** FUT01 · **Objetivo:** H2-OE7 · **Prioridad:** Could

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-72).

### Criterios

* **CA01** Dado el prototipo, cuando se estudia predicción, entonces se documentan ubicación, cantidad simultánea y tamaño de controles.
* **CA02** Dado un diseño sin motor desplegado, cuando se presenta, entonces no se atribuye predicción funcional ni mejora clínica medida.

### Tareas

* TCS-72.T1 · Hecha: Diseñar dónde aparecerían las sugerencias.
* TCS-72.T2 · Hecha: Documentar elección explícita y separación de la frase.

## TCS-26 Prueba inicial de pantalla redonda

Como usuario del comunicador, quiero ver los elementos de la pantalla completos y legibles para identificar las opciones disponibles.

**Requerimiento:** H3-RF04 · **Objetivo:** OE1 (origen H2-OE1) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-26).

### Criterios

* **CA01** Dado el ESP encendido, cuando inicia la interfaz, entonces muestra texto, colores y elementos dentro de la resolución útil.
* **CA02** Dado el borde circular, cuando se distribuyen elementos, entonces no se recortan controles esenciales.

### Tareas

* TCS-26.T1 · Hecha: Ajustar elementos a la pantalla circular.
* TCS-26.T2 · Hecha: Comprobar texto y controles visibles.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Aprobación de pertinencia condicionada a simplificar categorías y pictogramas según cada niño. La condición se implementó y su operación física se confirmó el 22/11/2026; esa comprobación corresponde al ejecutor, no a una nueva evaluación de Heriber.

## TCS-27 Prueba inicial de interacción táctil

Como usuario del comunicador, quiero seleccionar opciones mediante el tacto para comunicar mi elección sin activar otra opción.

**Requerimiento:** H3-RF04 · **Objetivo:** OE1 (origen H2-OE1) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-27).

### Criterios

* **CA01** Dado un control visible, cuando se toca su zona, entonces se reconoce y muestra respuesta visual.
* **CA02** Dado un toque fuera del control, cuando se procesa, entonces no se selecciona otro pictograma. La zona inferior defectuosa se evita con controles superiores.

### Tareas

* TCS-27.T1 · Hecha: Definir áreas táctiles y respuesta visual.
* TCS-27.T2 · Hecha: Comprobar selección y evitar la zona inferior defectuosa.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Según la confirmación de Ignacio, no solicitó cambios adicionales en tacto, frase visible o Volver/Borrar; se mantiene la adaptación individual del tablero. No certifica autonomía infantil ni precisión táctil cuantificada.

## TCS-73 Diseño de integración del sistema predictivo con la plataforma web

Como desarrollador, quiero diseñar la integración de futuras sugerencias con la web para definir su flujo de datos sin presentarlo como una función desplegada.

**Requerimiento:** FUT01 · **Objetivo:** H2-OE7 · **Prioridad:** Could

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-73).

### Criterios

* **CA01** Dado el prototipo, cuando se estudia predicción, entonces se documentan origen de eventos, posible cálculo y contrato de recepción de sugerencias.
* **CA02** Dado un diseño sin motor desplegado, cuando se presenta, entonces no se atribuye predicción funcional ni mejora clínica medida.

### Tareas

* TCS-73.T1 · Hecha: Diseñar contrato futuro de integración predictiva.
* TCS-73.T2 · Hecha: Documentar que el motor no está implementado.

## TCS-43 Implementación de interfaz base del dispositivo ESP32

Como usuario del comunicador, quiero acceder a categorías y controles visibles para iniciar la construcción de un mensaje.

**Requerimiento:** H3-RF04 · **Objetivo:** OE1 (origen H2-OE1) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-43).

### Criterios

* **CA01** Dado el ESP encendido, cuando carga, entonces presenta menú, categorías y controles visibles en la pantalla redonda.
* **CA02** Dado un borde circular o zona táctil defectuosa, cuando se distribuyen controles, entonces no se colocan acciones esenciales fuera de la zona usable.

### Tareas

* TCS-43.T1 · Hecha: Construir el menú y la interfaz base.
* TCS-43.T2 · Hecha: Comprobar presentación en el ESP.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Aprobación de pertinencia condicionada a simplificar categorías y pictogramas según cada niño. La condición se implementó y su operación física se confirmó el 22/11/2026; esa comprobación corresponde al ejecutor, no a una nueva evaluación de Heriber.

## TCS-47 Implementación de botón volver y limpiar

Como usuario del comunicador, quiero volver al menú y borrar la frase de forma explícita para navegar sin perder selecciones por accidente.

**Requerimiento:** H3-RF04 · **Objetivo:** OE1 (origen H2-OE2) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-47).

### Criterios

* **CA01** Dada una categoría, cuando se pulsa Volver, entonces regresa al menú; al pulsar Borrar elimina explícitamente la frase.
* **CA02** Dada una navegación normal, cuando no se pulsa Borrar, entonces se conserva la frase y el dispositivo sigue estable.

### Tareas

* TCS-47.T1 · Hecha: Implementar Volver y Borrar.
* TCS-47.T2 · Hecha: Comprobar regreso sin pérdida y borrado explícito.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Según la confirmación de Ignacio, no solicitó cambios adicionales en tacto, frase visible o Volver/Borrar; se mantiene la adaptación individual del tablero. No certifica autonomía infantil ni precisión táctil cuantificada.

## TCS-44 Implementación de navegación entre categorías

Como usuario del comunicador, quiero navegar por categorías y páginas conservando mi frase para combinar pictogramas de distintas vistas.

**Requerimiento:** H3-RF04, H3-RF11 · **Objetivo:** OE1/OE2 (origen H2-OE2) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-44).

### Criterios

* **CA01** Dado el menú, cuando se elige una categoría, entonces muestra su tablero, permite paginar y volver.
* **CA02** Dada una frase seleccionada, cuando cambia la categoría o página, entonces no se pierde la selección.

### Tareas

* TCS-44.T1 · Hecha: Implementar categorías y paginación.
* TCS-44.T2 · Hecha: Comprobar navegación conservando la frase.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Aprobación de pertinencia condicionada a simplificar categorías y pictogramas según cada niño. La condición se implementó y su operación física se confirmó el 22/11/2026; esa comprobación corresponde al ejecutor, no a una nueva evaluación de Heriber.

## TCS-45 Implementación de selección táctil de pictogramas

Como usuario del comunicador, quiero seleccionar un pictograma mediante el tacto para incorporar mi elección al mensaje.

**Requerimiento:** H3-RF04, H3-RF05 · **Objetivo:** OE1/OE4 (origen H2-OE2) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-45).

### Criterios

* **CA01** Dado un pictograma, cuando se toca, entonces se identifica, muestra feedback y registra la interacción del dispositivo.
* **CA02** Dado un toque fuera de la zona activa, cuando se procesa, entonces no selecciona otro elemento.

### Tareas

* TCS-45.T1 · Hecha: Implementar selección y respuesta visual.
* TCS-45.T2 · Hecha: Comprobar que se añade la opción elegida.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Aprobación de pertinencia del vocabulario e interacción mostrados; sin evaluación de eficacia clínica con niños. Las comprobaciones técnicas posteriores se registran por separado.

## TCS-46 Visualización del mensaje seleccionado

Como usuario del comunicador, quiero leer la frase seleccionada en orden para comprobar el mensaje antes de reproducirlo.

**Requerimiento:** H3-RF04 · **Objetivo:** OE1 (origen H2-OE2) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-46).

### Criterios

* **CA01** Dados pictogramas seleccionados, cuando se construye la frase, entonces conserva orden, imagen y texto legible en la zona inferior de lectura.
* **CA02** Dada navegación sin Borrar, cuando cambia de vista, entonces la frase no se limpia ni tapa los controles.

### Tareas

* TCS-46.T1 · Hecha: Mostrar la frase en orden.
* TCS-46.T2 · Hecha: Comprobar que navegar no la borra.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Según la confirmación de Ignacio, no solicitó cambios adicionales en tacto, frase visible o Volver/Borrar; se mantiene la adaptación individual del tablero. No certifica autonomía infantil ni precisión táctil cuantificada.

## TCS-49 Persistencia de pictogramas en base de datos

Como especialista o docente asignado, quiero recuperar el tablero guardado de cada perfil para conservar su personalización entre sesiones.

**Requerimiento:** H3-RF03 · **Objetivo:** OE2 (origen H2-OE3) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-49).

### Criterios

* **CA01** Dado un cambio válido, cuando se guarda y vuelve a iniciar sesión, entonces PostgreSQL devuelve nombre, categoría, frase, color, imagen y orden del mismo perfil.
* **CA02** Dadas altas concurrentes o duplicadas, cuando se guardan, entonces se conserva integridad y límite del tablero.

### Tareas

* TCS-49.T1 · Hecha: Persistir pictogramas con validación.
* TCS-49.T2 · Hecha: Comprobar consulta, edición y desactivación autorizadas.

## TCS-51 Creación de endpoint para recepción de eventos del dispositivo

Como especialista o apoderado asignado, quiero disponer de eventos autenticados y sin duplicados del ESP para consultar actividad atribuida al perfil correcto.

**Requerimiento:** H3-RF05 · **Objetivo:** OE4 (origen H2-OE5) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-51).

### Criterios

* **CA01** Dado un dispositivo autorizado y evento válido, cuando lo envía, entonces se asocia a su perfil, persiste y recibe ACK con el identificador externo.
* **CA02** Dado un reintento, cuando repite identificador, entonces no duplica; datos o credencial inválidos se rechazan sin ACK de éxito.

### Tareas

* TCS-51.T1 · Hecha: Recibir eventos autenticados.
* TCS-51.T2 · Hecha: Comprobar rechazo de entradas y deduplicación.

## TCS-52 Visualización de eventos en historial

Como especialista o apoderado asignado, quiero consultar el historial autorizado para revisar la actividad sin exponerla a roles no permitidos.

**Requerimiento:** H3-RF05, H3-RF10 · **Objetivo:** OE3/OE4 (origen H2-OE5) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-52).

### Criterios

* **CA01** Dado especialista o apoderado asignado, cuando consulta historial, entonces ve acción/pictograma, fecha, origen y contexto en orden reciente.
* **CA02** Dado docente, administrador o adulto ajeno, cuando solicita actividad, entonces no recibe historial ni progreso. Sustituye el acceso docente del criterio histórico.

### Tareas

* TCS-52.T1 · Hecha: Consultar actividad por perfil autorizado.
* TCS-52.T2 · Hecha: Comprobar orden y restricciones de acceso.

## TCS-48 Configuración del tablero desde la plataforma web

Como especialista o docente asignado, quiero editar imágenes, nombres, categorías y frases del tablero para personalizar la comunicación del perfil autorizado.

**Requerimiento:** H3-RF03 · **Objetivo:** OE2 (origen H2-OE3/4) · **Prioridad:** Must

Estado histórico: **Finalizada**. [Ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-48).

### Criterios

* **CA01** Dado especialista o docente asignado, cuando crea o edita imagen, nombre, categoría, frase y orden, entonces persiste el tablero y el ESP lo sincroniza.
* **CA02** Dado un dato inválido, duplicado, exceso de capacidad o adulto sin permiso, cuando guarda, entonces el servidor rechaza el cambio.

### Tareas

* TCS-48.T1 · Hecha: Implementar edición del tablero por perfil.
* TCS-48.T2 · Hecha: Comprobar guardado, sincronización y mensaje vigente.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión cualitativa por Zoom del 20/11/2026; decisión comunicada por Ignacio después de revisar la grabación. Aprobación de pertinencia del vocabulario e interacción mostrados; sin evaluación de eficacia clínica con niños. Las comprobaciones técnicas posteriores se registran por separado.
