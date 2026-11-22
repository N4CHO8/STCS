# Historias del Sprint 3

Diez historias con sus criterios y 31 subtareas reales. Heriber figura como stakeholder de pertinencia cuando corresponde; las tareas técnicas se verifican con pruebas. El estado vigente y los comentarios de cierre se consultan en cada ticket. [Evidencia final](../pruebas/reportes/comprobacion-final-20261121/README.md).

## TCS-53 Perfiles y dispositivos autorizados

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53).

### Descripción

Como adulto responsable asignado, quiero acceder únicamente a mis perfiles y ESP previamente configurados para mantener separadas sus configuraciones y registros.

**Requerimiento:** H3-RF02, H3-RF09 · **Objetivo:** OE3 · **Prioridad:** Must

### Criterios

* **CA01** Dado un adulto asignado y un ESP previamente configurado para un perfil, cuando consulta o cambia de perfil, entonces recibe únicamente el tablero y dispositivo autorizados y descarta respuestas del perfil anterior.
* **CA02** Dada una credencial ajena o inválida, cuando consulta un ESP, entonces el servidor rechaza sin exponer datos.
* **CA03** Dados dos ESP asociados a perfiles diferentes, cuando se utilizan y se consultan desde la web, entonces mantienen separada la información de cada perfil.



## TCS-59 Seguridad y aislamiento de datos

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-59).

### Descripción

Como adulto responsable, quiero contar con controles de acceso y comunicación segura para proteger los datos del perfil frente a accesos no autorizados.

**Requerimiento:** H3-RNF01, H3-RF02 · **Objetivo:** OE3 · **Prioridad:** Must

### Criterios

* **CA01** Dado un rol o perfil prohibido, cuando consulta API o medios, entonces recibe rechazo o proyección permitida sin identidad/clínica restringida, también en rutas antiguas.
* **CA02** Dada comunicación HTTPS, cuando conecta, entonces valida certificado y no expone secretos; RLS y privilegios de servidor se revisan junto al control de API.
* **CA03** Dado un escaneo o prueba negativa, cuando detecta un hallazgo, entonces se corrige o registra riesgo residual y evidencia reproducible.



## TCS-60 Aceptación integrada y evidencia de defensa

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-60).

### Descripción

Como responsable del proyecto, quiero verificar el recorrido integrado con evidencia trazable para demostrar el cumplimiento técnico y sus límites.

**Requerimiento:** H3-RF03, H3-RF04, H3-RF05 · **Objetivo:** OE1/OE2/OE3/OE4 · **Prioridad:** Must

### Criterios

* **CA01** Dado el prototipo publicado y datos ficticios, cuando configura imagen/frase, sincroniza, selecciona, reproduce y consulta el historial, entonces registra esperado, observado, versión y evidencia.
* **CA02** Dado un requisito seleccionado, cuando se audita, entonces enlaza objetivo, modelo, HU/sprint, caso, reporte, PR/commit y tag de entrega.
* **CA03** Dada aceptación externa no realizada o prueba no ejecutada, cuando se cierra, entonces conserva su estado pendiente.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión por Zoom del 20/11/2026; aprobación de pertinencia y uso confirmada por Ignacio. Alcance: recorrido integrado mostrado con adultos y datos ficticios.

## TCS-74 Configuración Wi-Fi móvil del ESP

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-74).

### Descripción

Como adulto junto al ESP, quiero configurar su Wi-Fi desde un celular y ver el estado de conexión para usar el comunicador sin USB de datos.

**Requerimiento:** H3-RF06 · **Objetivo:** OE1/OE4 · **Prioridad:** Must

### Criterios

* **CA01** Dado el menú Wi-Fi, cuando activa STCS-Config y abre 192.168.4.1 desde celular, entonces accede con la clave local y configura la red sin USB de datos.
* **CA02** Dada asociación al router, cuando cambia, entonces muestra conectado/desconectado; no garantiza Internet/API.
* **CA03** Dado el alcance aceptado, cuando activa el AP, entonces permanece hasta reiniciar. Sin timeout automático.



## TCS-76 Cola de 64 eventos y caché del ESP

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-76).

### Descripción

Como usuario del comunicador, quiero conservar el tablero y los eventos pendientes ante cortes de red para retomar el uso dentro de los límites de caché y cola de 64.

**Requerimiento:** H3-RF08, H3-RNF04 · **Objetivo:** OE4 · **Prioridad:** Should

### Criterios

* **CA01** Dado un evento guardado, cuando falla envío o ACK, entonces persiste y reintenta el mismo identificador; retira solo tras ACK coincidente y evita duplicados.
* **CA02** Dada cola llena de 64, cuando intenta encolar otro, entonces rechaza el nuevo registro; no garantiza actividad offline ilimitada.
* **CA03** Dado un reinicio, cuando recupera, entonces conserva tablero y recursos disponibles con caché limitada. Voz sin Wi-Fi no garantizada.



## TCS-77 Revisión profesional del prototipo

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-77).

### Descripción

Como especialista evaluador, quiero revisar el prototipo y registrar observaciones y decisiones para valorar su pertinencia dentro del alcance adulto con datos ficticios.

**Requerimiento:** H3-RF03, H3-RF04 · **Objetivo:** OE1/OE2 · **Prioridad:** Must

### Criterios

* **CA01** Dado un profesional y un prototipo con datos ficticios, cuando realiza la revisión cualitativa por Zoom, entonces se registran las funciones mostradas, observaciones y decisiones de pertinencia, identificando los indicadores que no se midieron.
* **CA02** Dadas HU e indicadores observados, cuando emite su decisión, entonces constan nombre/rol, fecha, versión, resultado y alcance real de aprobación en los tickets.
* **CA03** Dadas observaciones o metas no alcanzadas, cuando se informa, entonces se conservan y no se atribuye eficacia clínica o comprensión de niños no evaluados.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión por Zoom del 20/11/2026; aprobación de pertinencia y uso confirmada por Ignacio. Alcance: revisión cualitativa del prototipo y sus observaciones; sin participación de niños ni indicadores cuantificados.

## TCS-83 Historial y exportación autorizada

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-83).

### Descripción

Como especialista o apoderado asignado, quiero consultar y exportar de forma autorizada la actividad filtrada para revisar registros del perfil sin exponer datos innecesarios.

**Requerimiento:** H3-RF05, H3-RF10 · **Objetivo:** OE4 · **Prioridad:** Must

### Criterios

* **CA01** Dado especialista/apoderado asignado, cuando consulta fechas, dispositivo y tipo de evento, entonces pagina con orden estable, origen y zona horaria coherentes.
* **CA02** Dado docente, administrador o perfil ajeno, cuando consulta/exporta, entonces no recibe actividad restringida.
* **CA03** Dado un conjunto filtrado, cuando se implemente exportación completa, entonces usa alias, evita fórmulas CSV y registra su alcance sin datos innecesarios.



## TCS-84 Sesiones y cuentas por rol

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-84).

### Descripción

Como adulto responsable, quiero activar mi cuenta e iniciar y cerrar una sesión con permisos por rol para acceder de forma privada a las funciones autorizadas.

**Requerimiento:** H3-RF01, H3-RF02, H3-RF09 · **Objetivo:** OE3 · **Prioridad:** Must

### Criterios

* **CA01** Dada cuenta adulta real, cuando verifica correo y establece contraseña, entonces accede con cookie HttpOnly/Secure/SameSite y permiso vigente; child no entra al portal.
* **CA02** Dada sesión vencida/revocada, cuenta inactiva, escritura sin origen válido o asignación ajena, cuando solicita acceso, entonces rechaza y retira información privada.
* **CA03** Dado admin, cuando gestiona adultos, entonces no elige contraseñas/correos existentes ni recibe identidades infantiles; nuevas asignaciones clínicas requieren aprobación autorizada.
* **CA04** Dado login, cuando se ejecuta, entonces no crea esquemas ni resetea demos. Solo los entornos de prueba marcados omiten activación.



## TCS-85 Uso accesible y recuperación de errores web

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-85).

### Descripción

Como adulto responsable, quiero usar formularios y navegación accesibles con errores recuperables para completar las acciones autorizadas sin perder contexto ni privacidad.

**Requerimiento:** H3-RF04, H3-RF12, H3-RF13, H3-RNF03 · **Objetivo:** OE1/OE3 · **Prioridad:** Must

### Criterios

* **CA01** Dado formulario válido, cuando guarda, entonces muestra resultado persistido; entrada inválida o fallo API ofrece error recuperable sin datos inventados.
* **CA02** Dada credencial ausente o revocada, cuando consulta, entonces sale al login y no conserva datos privados.
* **CA03** Dado móvil/teclado, cuando recorre controles, entonces conserva etiquetas, foco y acciones accesibles sin desbordamiento; comprobar también vacíos y zoom.
* **CA04** Dado un especialista asignado, cuando elige categorías y pictogramas visibles por niño, entonces guarda una selección no vacía sin borrar el catálogo; otros roles no pueden cambiarla. El ESP oculta categorías vacías y evita elegir categoría cuando solo hay una.
* **CA05** Dado especialista asignado, cuando registra la fecha de inicio de uso, entonces persiste una fecha válida no futura; el apoderado puede consultarla y docente/admin no la reciben.
* **CA06** Dado docente asignado, cuando envía una observación de comunicación, entonces la recibe el especialista y el docente consulta solo las propias; reintentar el mismo envío no duplica ni concede acceso a diagnóstico/progreso.

### Aprobación del stakeholder

Heriber Galleguillos, psicólogo infantojuvenil especialista en NEE y TEA. Revisión por Zoom del 20/11/2026; aprobación de pertinencia y uso confirmada por Ignacio. Alcance: claridad y pertinencia de las vistas adultas. La simplificación del ESP responde a la condición de adaptar el tablero a cada niño; no implica que Heriber haya probado la versión posterior.

## TCS-88 CI despliegue y recuperación reproducibles

[Abrir en Jira](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-88).

### Descripción

Como desarrollador, quiero verificar cambios, despliegues y procedimientos de recuperación reproducibles para mantener una versión identificable y comprobada del prototipo.

**Requerimiento:** H3-RNF03 · **Objetivo:** OE4 · **Prioridad:** Should

### Criterios

* **CA01** Dado un candidato, cuando ejecuta CI, entonces comprueba dependencias, unitarias, API/PostgreSQL aislados, cobertura, tipos, build y E2E antes de integrar.
* **CA02** Dado un cambio desplegado, cuando verifica, entonces identifica SHA, URL y salud; secretos permanecen fuera de Git y fixtures fuera de Supabase.
* **CA03** Dada recuperación, cuando prepara firmware/base, entonces usa versiones registradas, respaldo privado y restauración revisada sin sobrescribir datos posteriores.



## Subtareas

| Tarea | Historia | Trabajo |
| --- | --- | --- |
| [TCS-89](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-89) | TCS-77 | Preparar tareas, métricas y registro de decisión. |
| [TCS-90](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-90) | TCS-77 | Realizar reunión con profesional y datos ficticios. |
| [TCS-91](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-91) | TCS-77 | Registrar decisiones por HU y atender observaciones. |
| [TCS-92](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-92) | TCS-53 | Registrar la separación de dos ESP y varios computadores. |
| [TCS-93](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-93) | TCS-53 | Comprobar asignaciones y proyecciones por rol. |
| [TCS-94](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-94) | TCS-74 | Comprobar cambio de red y texto conectado/desconectado. |
| [TCS-95](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-95) | TCS-74 | Restaurar menú Wi-Fi y formulario móvil. |
| [TCS-96](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-96) | TCS-76 | Persistir eventos en LittleFS hasta ACK coincidente. |
| [TCS-97](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-97) | TCS-76 | Registrar reinicio, reconexión y reintentos comprobados por el autor. |
| [TCS-98](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-98) | TCS-76 | Definir cola de 64 y límites de voz/caché. |
| [TCS-99](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-99) | TCS-59 | Registrar rechazo de certificado inválido en el ESP físico. |
| [TCS-100](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-100) | TCS-59 | Revisar dependencias, ZAP y acceso anónimo. |
| [TCS-101](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-101) | TCS-59 | Comprobar roles, rutas antiguas y respuestas restringidas. |
| [TCS-102](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-102) | TCS-59 | Verificar seguridad de la versión publicada final. |
| [TCS-103](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-103) | TCS-83 | Aplicar migración revisada y publicar el candidato final. |
| [TCS-104](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-104) | TCS-83 | Comprobar permisos, límites y descarga en dos motores. |
| [TCS-105](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-105) | TCS-83 | Implementar filtros globales y CSV autorizado. |
| [TCS-106](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-106) | TCS-84 | Implementar sesiones, activación y revocación. |
| [TCS-107](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-107) | TCS-84 | Comprobar roles, CSRF, child y ausencia de seeds en login. |
| [TCS-108](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-108) | TCS-85 | Corregir foco, contraste, sesión y consultas al salir. |
| [TCS-109](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-109) | TCS-85 | Comprobar Chromium, WebKit y recorrido Safari informado. |
| [TCS-110](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-110) | TCS-85 | Revisar claridad de uso con el profesional. |
| [TCS-111](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-111) | TCS-85 | Publicar y comprobar los cambios finales. |
| [TCS-112](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-112) | TCS-85 | Comprobar y presentar atribuciones de los recursos en la interfaz publicada. |
| [TCS-113](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-113) | TCS-88 | Conservar reportes reproducibles y recuperación sintética. |
| [TCS-114](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-114) | TCS-88 |  Preparar ficha de avance, DoD y plan de cierre. |
| [TCS-115](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-115) | TCS-88 | Ejecutar CI, verificar despliegue y crear tag final. |
| [TCS-116](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-116) | TCS-60 | Relacionar requisitos, HU, casos y reportes. |
| [TCS-117](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-117) | TCS-60 | Medir sincronización web–ESP en frío y caché. |
| [TCS-118](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-118) | TCS-60 | Incorporar decisiones reales del profesional. |
| [TCS-119](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-119) | TCS-60 | Cerrar informe, Review y versión de entrega. |
