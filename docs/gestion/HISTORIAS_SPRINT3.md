# Historias del Sprint 3

Corte de Jira del 21/11/2026 para el informe; las diez HU están En curso mientras se prepara el cierre técnico. Se conservan criterios, tareas y estado de las diez historias principales. Los estados de tareas son un desglose documental actual; no un historial de planificación previo. Responsable de ejecución: Ignacio Benegas. Aprobaciones y alcance en [A3](../historias.md).

## TCS-53 Perfiles y dispositivos autorizados

Como adulto responsable asignado, quiero acceder únicamente a mis perfiles y ESP previamente configurados para mantener separadas sus configuraciones y registros.

**Requerimiento:** H3-RF02, H3-RF09 · **Objetivo:** OE3 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-53).

### Criterios

* **CA01** Dado un adulto asignado y un ESP previamente configurado para un perfil, cuando consulta o cambia de perfil, entonces recibe únicamente el tablero y dispositivo autorizados y descarta respuestas del perfil anterior.
* **CA02** Dada una credencial ajena o inválida, cuando consulta un ESP, entonces el servidor rechaza sin exponer datos.
* **CA03** Dados dos ESP asociados a perfiles diferentes, cuando se utilizan y se consultan desde la web, entonces mantienen separada la información de cada perfil.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-53.T1 | Comprobar asignaciones y proyecciones por rol | Hecha |
| TCS-53.T2 | Registrar la separación de dos ESP y varios computadores | Hecha |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-59 Seguridad y aislamiento de datos

Como adulto responsable, quiero contar con controles de acceso y comunicación segura para proteger los datos del perfil frente a accesos no autorizados.

**Requerimiento:** H3-RNF01, H3-RF02 · **Objetivo:** OE3 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-59).

### Criterios

* **CA01** Dado un rol o perfil prohibido, cuando consulta API o medios, entonces recibe rechazo o proyección permitida sin identidad/clínica restringida, también en rutas antiguas.
* **CA02** Dada comunicación HTTPS, cuando conecta, entonces valida certificado y no expone secretos; RLS y privilegios de servidor se revisan junto al control de API.
* **CA03** Dado un escaneo o prueba negativa, cuando detecta un hallazgo, entonces se corrige o registra riesgo residual y evidencia reproducible.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-59.T1 | Comprobar roles, rutas antiguas y respuestas restringidas | Hecha |
| TCS-59.T2 | Revisar dependencias, ZAP y acceso anónimo | Hecha |
| TCS-59.T3 | Registrar rechazo de certificado inválido en el ESP físico | Hecha; PC-02, 18/11 |
| TCS-59.T4 | Verificar seguridad de la versión publicada final | Sin ejecución registrada en este corte |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-60 Aceptación integrada y evidencia de defensa

Como responsable del proyecto, quiero verificar el recorrido integrado con evidencia trazable para demostrar el cumplimiento técnico y sus pendientes reales.

**Requerimiento:** H3-RF03, H3-RF04, H3-RF05 · **Objetivo:** OE1/OE2/OE3/OE4 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-60).

### Criterios

* **CA01** Dado el prototipo publicado y datos ficticios, cuando configura imagen/frase, sincroniza, selecciona, reproduce y consulta el historial, entonces registra esperado, observado, versión y evidencia.
* **CA02** Dado un requisito seleccionado, cuando se audita, entonces enlaza objetivo, modelo, HU/sprint, caso, reporte, PR/commit y tag de entrega.
* **CA03** Dada aceptación externa no realizada o prueba no ejecutada, cuando se cierra, entonces conserva su estado pendiente.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-60.T1 | Relacionar requisitos, HU, casos y reportes | Hecha |
| TCS-60.T2 | Medir sincronización web–ESP en frío y caché | Hecha; PC-01 LAN, 18/11; ≤15 s no garantizado |
| TCS-60.T3 | Incorporar decisiones reales del profesional | Sin ejecución registrada en este corte |
| TCS-60.T4 | Cerrar informe, Review y versión de entrega | Sin ejecución registrada en este corte |

Aprobación de pertinencia de Heriber, con el alcance registrado por HU. La adaptación por niño requiere verificar el firmware nuevo.

## TCS-74 Configuración Wi-Fi móvil del ESP

Como adulto junto al ESP, quiero configurar su Wi-Fi desde un celular y ver el estado de conexión para usar el comunicador sin USB de datos.

**Requerimiento:** H3-RF06 · **Objetivo:** OE1/OE4 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-74).

### Criterios

* **CA01** Dado el menú Wi-Fi, cuando activa STCS-Config y abre 192.168.4.1 desde celular, entonces accede con la clave local y configura la red sin USB de datos.
* **CA02** Dada asociación al router, cuando cambia, entonces muestra conectado/desconectado; no garantiza Internet/API.
* **CA03** Dado el alcance aceptado, cuando activa el AP, entonces permanece hasta reiniciar. Sin timeout automático.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-74.T1 | Restaurar menú Wi-Fi y formulario móvil | Hecha |
| TCS-74.T2 | Comprobar cambio de red y texto conectado/desconectado | Hecha |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-76 Cola de 64 eventos y caché del ESP

Como usuario del comunicador, quiero conservar el tablero y los eventos pendientes ante cortes de red para retomar el uso dentro de los límites de caché y cola de 64.

**Requerimiento:** H3-RF08, H3-RNF04 · **Objetivo:** OE4 · **Prioridad:** Should

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-76).

### Criterios

* **CA01** Dado un evento guardado, cuando falla envío o ACK, entonces persiste y reintenta el mismo identificador; retira solo tras ACK coincidente y evita duplicados.
* **CA02** Dada cola llena de 64, cuando intenta encolar otro, entonces rechaza el nuevo registro; no garantiza actividad offline ilimitada.
* **CA03** Dado un reinicio, cuando recupera, entonces conserva tablero y recursos disponibles con caché limitada. Voz sin Wi-Fi no garantizada.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-76.T1 | Persistir eventos en LittleFS hasta ACK coincidente | Hecha |
| TCS-76.T2 | Registrar reinicio, reconexión y reintentos comprobados por el autor | Hecha |
| TCS-76.T3 | Definir cola de 64 y límites de voz/caché | Hecha |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-77 Revisión profesional del prototipo

Como especialista evaluador, quiero revisar el prototipo y registrar observaciones y decisiones para valorar su pertinencia dentro del alcance adulto con datos ficticios.

**Requerimiento:** H3-RF03, H3-RF04 · **Objetivo:** OE1/OE2 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-77).

### Criterios

* **CA01** Dado profesional y método acordados, cuando revisa por Zoom con adultos y datos ficticios, entonces registra tareas, tiempo, errores, ayudas y observaciones sobre pictogramas/interfaz.
* **CA02** Dadas HU e indicadores observados, cuando emite su decisión, entonces constan nombre/rol, fecha, versión, resultado y alcance real de aprobación en los tickets.
* **CA03** Dadas observaciones o metas no alcanzadas, cuando se informa, entonces se conservan y no se atribuye eficacia clínica o comprensión de niños no evaluados.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-77.T1 | Preparar tareas, métricas y registro de decisión | Hecha |
| TCS-77.T2 | Realizar reunión con profesional y datos ficticios | Hecha: 20/11 |
| TCS-77.T3 | Registrar decisiones por HU y atender observaciones | Hecha en el alcance cualitativo; cambios comprobados en laboratorio |

Aprobación de pertinencia: Heriber Galleguillos, 20/11, según confirmación de Ignacio; indicadores no medidos y comprobación de cambios por separado.

## TCS-83 Historial y exportación autorizada

Como especialista o apoderado asignado, quiero consultar y exportar de forma autorizada la actividad filtrada para revisar registros del perfil sin exponer datos innecesarios.

**Requerimiento:** H3-RF05, H3-RF10 · **Objetivo:** OE4 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-83).

### Criterios

* **CA01** Dado especialista/apoderado asignado, cuando consulta fechas, dispositivo y tipo de evento, entonces pagina con orden estable, origen y zona horaria coherentes.
* **CA02** Dado docente, administrador o perfil ajeno, cuando consulta/exporta, entonces no recibe actividad restringida.
* **CA03** Dado un conjunto filtrado, cuando se implemente exportación completa, entonces usa alias, evita fórmulas CSV y registra su alcance sin datos innecesarios.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-83.T1 | Implementar filtros globales y CSV autorizado | Hecha |
| TCS-83.T2 | Comprobar permisos, límites y descarga en dos motores | Hecha |
| TCS-83.T3 | Aplicar migración revisada y publicar el candidato final | Sin ejecución registrada en este corte |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-84 Sesiones y cuentas por rol

Como adulto responsable, quiero activar mi cuenta e iniciar y cerrar una sesión con permisos por rol para acceder de forma privada a las funciones autorizadas.

**Requerimiento:** H3-RF01, H3-RF02, H3-RF09 · **Objetivo:** OE3 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-84).

### Criterios

* **CA01** Dada cuenta adulta real, cuando verifica correo y establece contraseña, entonces accede con cookie HttpOnly/Secure/SameSite y permiso vigente; child no entra al portal.
* **CA02** Dada sesión vencida/revocada, cuenta inactiva, escritura sin origen válido o asignación ajena, cuando solicita acceso, entonces rechaza y retira información privada.
* **CA03** Dado admin, cuando gestiona adultos, entonces no elige contraseñas/correos existentes ni recibe identidades infantiles; nuevas asignaciones clínicas requieren aprobación autorizada.
* **CA04** Dado login, cuando se ejecuta, entonces no crea esquemas ni resetea demos. Solo los entornos de prueba marcados omiten activación.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-84.T1 | Implementar sesiones, activación y revocación | Hecha |
| TCS-84.T2 | Comprobar roles, CSRF, child y ausencia de seeds en login | Hecha |

Comprobación técnica mediante los casos y reportes de A5.

## TCS-85 Uso accesible y recuperación de errores web

Como adulto responsable, quiero usar formularios y navegación accesibles con errores recuperables para completar las acciones autorizadas sin perder contexto ni privacidad.

**Requerimiento:** H3-RF04, H3-RNF03 · **Objetivo:** OE1/OE3 · **Prioridad:** Must

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-85).

### Criterios

* **CA01** Dado formulario válido, cuando guarda, entonces muestra resultado persistido; entrada inválida o fallo API ofrece error recuperable sin datos inventados.
* **CA02** Dada credencial ausente o revocada, cuando consulta, entonces sale al login y no conserva datos privados.
* **CA03** Dado móvil/teclado, cuando recorre controles, entonces conserva etiquetas, foco y acciones accesibles sin desbordamiento; comprobar también vacíos y zoom.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-85.T1 | Corregir foco, contraste, sesión y consultas al salir | Hecha |
| TCS-85.T2 | Comprobar Chromium, WebKit y recorrido Safari informado | Hecha |
| TCS-85.T3 | Revisar claridad de uso con el profesional | Hecha en alcance cualitativo; aprobación de uso confirmada |
| TCS-85.T4 | Publicar y comprobar los cambios finales | Sin ejecución registrada en este corte |
| TCS-85.T5 | Presentar créditos y procedencia de los recursos | Implementado en local; verificación local |

Aprobación de pertinencia de Heriber, con el alcance registrado por HU. La adaptación por niño requiere verificar el firmware nuevo.

## TCS-88 CI despliegue y recuperación reproducibles

Como desarrollador, quiero verificar cambios, despliegues y procedimientos de recuperación reproducibles para mantener una versión identificable y comprobada del prototipo.

**Requerimiento:** H3-RNF03 · **Objetivo:** OE4 · **Prioridad:** Should

Estado de la HU en Jira: **En curso**. [Abrir ticket](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-88).

### Criterios

* **CA01** Dado un candidato, cuando ejecuta CI, entonces comprueba dependencias, unitarias, API/PostgreSQL aislados, cobertura, tipos, build y E2E antes de integrar.
* **CA02** Dado un cambio desplegado, cuando verifica, entonces identifica SHA, URL y salud; secretos permanecen fuera de Git y fixtures fuera de Supabase.
* **CA03** Dada recuperación, cuando prepara firmware/base, entonces usa versiones registradas, respaldo privado y restauración revisada sin sobrescribir datos posteriores.

### Tareas

| ID | Tarea | Estado |
| --- | --- | --- |
| TCS-88.T1 | Conservar reportes reproducibles y recuperación sintética | Hecha |
| TCS-88.T2 | Preparar ficha de avance, DoD y plan de cierre | Hecha |
| TCS-88.T3 | Ejecutar CI, verificar despliegue y crear tag final | Sin ejecución registrada en este corte |

Comprobación técnica mediante los casos y reportes de A5.

## Referencias consolidadas

TCS-75 y TCS-81 remiten a TCS-53; TCS-61 y TCS-87, a TCS-77; TCS-79, a TCS-84; TCS-82, a TCS-85; TCS-86, a TCS-88. No se cuentan como entregables adicionales.

## Sprint 2 y puntos históricos

El informe anterior registra 13 historias y 57 puntos. TCS-72 y TCS-73 aportan 3 puntos cada una y corresponden a diseño predictivo: 6 puntos de diseño y 51 del resto. La separación explica el cómputo histórico sin declarar un motor implementado ni modificar retrospectivamente los puntos de Jira. Los criterios y tareas de las HU anteriores siguen en sus tickets.

## Ampliación de TCS-85 — recomendaciones profesionales

- **CA04:** solo especialista asignado guarda categorías/pictogramas visibles, con al menos un elemento y sin borrar el catálogo. El ESP oculta categorías vacías y accede directamente a la única categoría si corresponde.
- **CA05:** especialista registra fecha válida no futura; apoderado consulta; docente/admin no reciben esa fecha.
- **CA06:** docente asignado envía observaciones al especialista, consulta solo las propias y no recibe clínica. Reintentos del mismo envío no duplican registros.

| Tarea | Estado |
| --- | --- |
| TCS-85.T6 Adaptar selección por niño | Implementada en local; firmware compilado, sin ensayo físico de esta variante |
| TCS-85.T7 Registrar fecha de inicio | Implementada en local |
| TCS-85.T8 Observaciones docentes al especialista | Implementada en local con permisos e idempotencia |

La aprobación no acredita publicación de estas funciones. Los resultados de prueba están en el [reporte del 21/11](../pruebas/reportes/adaptacion-20261121/README.md).

## Subtareas registradas en Jira

| Subtarea | Historia | Trabajo |
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
| [TCS-114](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-114) | TCS-88 | Preparar ficha de avance, DoD y plan de cierre. |
| [TCS-115](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-115) | TCS-88 | Ejecutar CI, verificar despliegue y crear tag final. |
| [TCS-116](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-116) | TCS-60 | Relacionar requisitos, HU, casos y reportes. |
| [TCS-117](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-117) | TCS-60 | Medir sincronización web–ESP en frío y caché. |
| [TCS-118](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-118) | TCS-60 | Incorporar decisiones reales del profesional. |
| [TCS-119](https://uandresbello-team-bg7iosbc.atlassian.net/browse/TCS-119) | TCS-60 | Cerrar informe, Review y versión de entrega. |
