# Informe técnico del Hito 3 de STCS

Ignacio Benegas · Proyecto de Título · INSW422
Profesor Matías Vargas Marín · Corte documental 16 de noviembre de 2026

STCS integra una plataforma web y un comunicador táctil ESP32-S3 para preparar pictogramas personalizados, reproducir frases y consultar actividad con permisos diferenciados. El incremento técnico está publicado y dispone de pruebas automatizadas reproducibles. Las pruebas físicas del 15/11 se registran como resultados informados por su ejecutor, con anexos pendientes. La revisión profesional no se ha realizado; este informe no acredita eficacia clínica ni autorización de un piloto con menores.

## Síntesis del cierre

| Dimensión | Resultado disponible | Límite de la afirmación |
| --- | --- | --- |
| Integración | Web HTTPS, API Next.js, PostgreSQL y Storage privados de Supabase, Piper en Vercel y ESP por Wi-Fi | No necesita PC encendido; necesita conectividad para los servicios cloud |
| Capacidad | Tablero actual 96 activos; 24 por categoría, seis páginas. Máximo operativo ensayado 180, 45 por categoría | No es máximo físico absoluto; no equivale a 180 voces offline |
| Pruebas automáticas | 7 unitarias, 291 comprobaciones API, 2 de caída DB y recuperación del trabajador; 10 E2E Chromium | Entorno local/CI aislado, no ensayo de menores ni flota |
| Calidad | 88,89% de líneas en alcance de servidor; carga local aprobada; ZAP sin altos y un aviso medio tratado documentalmente | No cobertura global de UI, firmware y Python; no pentest completo |
| Hardware | PF-01 a PF-07 conformes según Ignacio; un equipo, durante el 15/11 | Faltan anexos y mediciones precisas; PF-08 con varios ESP no ejecutada |
| Limitación observada | Sin Wi-Fi no hubo voz en la prueba; se acepta mantener el comportamiento | No se garantiza comunicación vocal offline |
| Validación externa | Correo al profesional enviado, según Ignacio | Sin reunión, resultados o aprobación acreditados |

Código publicado de referencia: commit `3dfff375085ccc455e113d5184c42e9a5c9980ca`, título **Hito 3**; PR #13 y CI 43809946817. Firmware de cierre v0.8.6-wifi-status. Esta adenda documental no representa una nueva ejecución de las pruebas de software ni una nueva carga de firmware.

**Accesos que completará el autor:** GitHub [AGREGAR ACCESO VERIFICADO]; Jira [AGREGAR ACCESO VERIFICADO]; aplicación publicada [AGREGAR ACCESO DE DEMOSTRACIÓN]. No adjuntar contraseñas administrativas, claves, datos reales ni respaldos privados.

Este documento reúne A1–A9 de la guía. Los artefactos individuales y reportes originales permanecen versionados en docs/. Los espacios de evidencia son pendientes explícitos, no pruebas realizadas ni aprobaciones implícitas.

<!-- PAGEBREAK -->

## A1 Problema e hipótesis

El proyecto aborda la necesidad de un apoyo de comunicación personalizable para niños con TEA y sus adultos responsables. Los antecedentes plantean dificultades para expresar necesidades y emociones, así como el riesgo de interfaces recargadas. No se dispone de una línea base cuantitativa con usuarios ni se atribuye una frecuencia clínica inventada al problema.

La hipótesis técnica es que un tablero de imágenes y frases configurado desde la web puede sincronizarse con un dispositivo personal sin recompilar cada modificación, manteniendo permisos por rol y asignación. La hipótesis de usabilidad es que la organización del comunicador facilita tareas de selección y comunicación; su contraste con un profesional y con usuarios previstos sigue pendiente.

### Objetivo general declarado en Sprint 1

Desarrollar un prototipo funcional de comunicación aumentativa basado en un dispositivo ESP32-S3 con pantalla táctil redonda y una plataforma web de configuración y seguimiento, con el propósito de apoyar la comunicación de niños con TEA mediante pictogramas.

### Objetivos específicos de continuidad del Hito 2

| Referencia | Objetivo declarado | Estado de cierre |
| --- | --- | --- |
| H2-OE1 | Implementar una interfaz CAA funcional y táctil en la pantalla redonda del ESP32-S3 | Operación física informada; usabilidad externa pendiente |
| H2-OE2 | Permitir navegación por categorías, selección, construcción, limpieza y reproducción de una frase | Confirmado con conexión; limitación vocal sin Wi-Fi |
| H2-OE3 | Persistir pictogramas por perfil y administrarlos desde la web | Integración y E2E ejecutados; recorrido físico confirmado |
| H2-OE4 | Sincronizar catálogo web y dispositivo mediante Wi-Fi/HTTPS | Imagen y cambio de frase confirmados; tiempos con usuarios pendientes |
| H2-OE5 | Registrar eventos autenticados y mostrarlos en historial ordenado | API ejecutada; cola y ACK informados conformes, anexos pendientes |
| H2-OE6 | Documentar arquitectura, datos, reglas, pruebas, calidad y riesgos | Artefactos técnicos A1–A9 y reportes disponibles |
| H2-OE7 | Mantener diseñado el flujo predictivo sin presentarlo como implementado | Diseño conservado; motor predictivo no implementado |

Origen: informes y presentaciones Hito 1/Hito 2 aportados por el autor; textos y equivalencias en docs/ANTECEDENTES_HITOS_1_2.md. Los diez objetivos preparatorios de Hito 1 permanecen allí sin sustituirlos por metas clínicas nuevas. Recuperar los originales no prueba aprobación externa de resultados.

<!-- PAGEBREAK -->

## A1 Indicadores y validación de objetivos

OE1–OE4 son agrupaciones de medición del cierre, distintas de los números originales H1-OE/H2-OE. Se explicita el estado de cada indicador para evitar convertir implementación en resultado clínico. Las metas siguientes son propuestas técnicas; su pertinencia y los resultados de usuarios deben ratificarse con un stakeholder.

| Grupo y origen | Indicador y meta propuesta | Método y línea base | Resultado disponible |
| --- | --- | --- | --- |
| OE1 Operación comprensible; H2-OE1/2, H1-OE5 | Al menos 3 de 4 tareas sin ayuda en revisión adulta | Localizar agua/ayuda, construir frase, navegar conservándola y borrar; registrar tiempo, errores y ayudas. Línea base no medida | Operación técnica confirmada; sin medición representativa ni aceptación externa |
| OE2 Personalización; H2-OE3/4, H1-OE6 | Dos recorridos correctos de imagen/frase; acordar tiempo objetivo antes de medir | Crear y editar desde web, verificar frase exacta en ESP. Línea base histórica comparable no disponible | Cambio de imagen/frase/voz confirmado; tiempo de usuario pendiente |
| OE3 Privacidad; H2-OE4/5 y controles nuevos | Todos los negativos de privacidad seleccionados deben rechazarse sin filtración | API y navegador por rol, asignación ajena y URL directa. Sin línea base cuantitativa previa | Suite técnica aprobada; no representa certificación ni revisión clínica |
| OE4 Reproducibilidad; H2-OE5/6, H1-OE3/4 | CI aprobado; p95 local ≤2 s y errores <1% con 10 clientes | Build y PostgreSQL aislados, 15 s por etapa; no comparación homogénea previa | CI aprobado; p95 local 69,42 ms con 10 clientes y cero errores |

La revisión por Zoom prevista utilizará adultos y datos ficticios. El profesional deberá conocer las limitaciones, acordar tareas/metas antes de la sesión y emitir observaciones sobre el alcance que realmente revise. Una revisión experta no demuestra comprensión de pictogramas por niños ni eficacia terapéutica.

**Evidencia A1 por incorporar:** fecha y rol del evaluador, consentimiento para citar su participación, tareas acordadas, datos brutos, cálculo de indicadores, comparación con metas y decisión auténtica. Si la meta no se alcanza, registrar el resultado y la causa; no reemplazarlo por una aprobación genérica.

El correo ya fue enviado por el autor. No se ha comunicado una reunión confirmada ni respuesta del profesional. Consultar al profesor si la revisión experta adulta satisface el tipo de validación requerido para este hito; la guía solicita medición con usuarios y validación del stakeholder.

<!-- PAGEBREAK -->

## A2 Requerimientos y alcance del incremento

El catálogo H3 conserva equivalencias con RF-01–RF-08 y RD-01 históricos; no se renumeran retroactivamente. La prioridad Must/Should es la propuesta del cierre técnico, pendiente de ratificación externa del alcance académico.

| ID | Tipo y prioridad | Requerimiento y objetivo |
| --- | --- | --- |
| H3-RF01 | Funcional Must | Portal con cuatro roles adultos; child no inicia sesión. OE3 |
| H3-RF02 | Funcional Must | Acceso solo a asignados; admin sin identidad/clínica y teacher sin diagnóstico/progreso. OE3 |
| H3-RF03 | Funcional Must | Crear/editar imagen, nombre, categoría y frase independiente con voz vigente. OE2 |
| H3-RF04 | Funcional Must | Cuatro categorías, paginación, selección, Hablar, Borrar y conservación de frase. OE1 |
| H3-RF05 | Funcional Must | Eventos autenticados por dispositivo, ACK y consulta autorizada. OE4 |
| H3-RF06 | Funcional Must | Configurar Wi-Fi por celular y mostrar asociación al router. OE1/OE4 |
| H3-RF07 | Funcional Should | Informes separados de orientaciones permitidas al docente. OE3 |
| H3-RF08 | Funcional Should | Tablero persistente, caché limitada y cola de 64 pendientes. OE4 |
| H3-RF09 | Funcional Should | Administración y aprobaciones sin acceso clínico del admin. OE3 |
| H3-RF10 | Funcional Should | Historial, filtros y exportación autorizada; criterios amplios pendientes. OE4 |
| H3-RF11 | Funcional Should | Hasta 180 activos y 45 por categoría; rechazar exceso. OE2 |

Incluido: prototipo técnico con un ESP y revisión adulta con datos ficticios. No se presentan como implementados el motor predictivo, una flota física validada, diagnóstico automático ni voz offline garantizada. No se acredita eficacia terapéutica, uso con menores o autonomía por batería; el dispositivo no tiene batería instalada.

### Cambios de alcance explícitos

El propietario aceptó cola de 64 registros en lugar de los 256 antiguos de Jira, y portal STCS-Config activo hasta reiniciar, sin timeout automático. TCS-74/TCS-76 describen la implementación final; no se oculta el cambio ni se atribuye aprobación a un profesional. El límite de 64 se refiere a eventos pendientes y no al número de pictogramas. Al llenarse se rechazan nuevos encolados; no se garantiza registrar nuevas acciones durante una desconexión prolongada.

Estado actual: 96 pictogramas, 24 por categoría, seis páginas. El máximo operativo probado es 180/45, con 12 páginas por categoría y una tarjeta en la última; no es el máximo físico absoluto. Las pruebas masivas se hicieron en laboratorio y no representan actividad clínica.

<!-- PAGEBREAK -->

## A2 y A3 Calidad permisos e historias

### Escenarios de calidad medibles

| ID | Estímulo y entorno | Respuesta y medida | Resultado |
| --- | --- | --- | --- |
| H3-RNF01 Seguridad | Adulto intenta perfil o medio ajeno, incluidas rutas antiguas | Rechazo sin datos prohibidos; cero dependencias altas/críticas sin tratar | Negativos seleccionados aprobados; ZAP acotado con un aviso medio residual |
| H3-RNF02 Eficiencia | 5 y 10 clientes consultan portal local durante 15 s/etapa | p95 ≤2000 ms; errores <1% | 63,48/69,42 ms; 0 errores. No extrapolar a nube |
| H3-RNF03 Mantenibilidad | Cambio de contrato/validador | CI aprobado y ≥70% de líneas del servidor definido | 88,89% en alcance definido; no cobertura global del producto |
| H3-RNF04 Recuperación | Pérdida de servidor o alimentación | Recuperar lo guardado y retirar eventos solo con ACK correcto | PF-02–05 informados conformes; anexos pendientes; sin voz garantizada offline |

### Matriz de privacidad

| Rol | Identidad y datos clínicos | Actividad y acciones |
| --- | --- | --- |
| therapist | Nombre completo y datos de niños asignados | Varios perfiles, historial, informes, orientaciones y edición de pictogramas |
| teacher | Solo nombres y orientaciones; sin diagnóstico, progreso o ficha sensible | Tablero de asignados para apoyar comunicación |
| guardian | Identidad y ficha sensible de su único niño; puede editarla | Consulta actividad e informes; consulta tablero |
| admin | Solo usuarios infantiles numerados; sin identidad, clínica o actividad | Cuentas adultas y configuración; no elige contraseñas de terceros |
| child | Registro interno, sin portal adulto | Usa el comunicador físico |

Las restricciones se aplican en servidor, también en rutas antiguas y respuestas JSON. Las nuevas asignaciones requieren aprobación de responsable autorizado; no basta ocultar botones. Las cuentas reales activan y recuperan por correo; las cuentas ficticias de prueba son una excepción identificada. El login no crea esquemas ni datos demo.

### Ejemplos de aceptación Dado Cuando Entonces

**TCS-59:** dado un docente autenticado, cuando solicita por URL directa una ficha clínica, entonces el servidor rechaza o limita la respuesta sin entregar diagnóstico ni progreso. **TCS-76:** dado un evento ya guardado, cuando se reenvía el mismo identificador tras perder ACK, entonces no crea un duplicado. **TCS-60:** dada una revisión profesional no realizada, cuando se decide preparación para piloto, entonces se declara pendiente y no se autoriza uso con menores.

Las diez historias del Sprint 3 y sus escenarios completos están en docs/historias.md y Jira. No hay aprobación externa acreditada por HU al corte de este informe.

<!-- PAGEBREAK -->

## A7 Arquitectura y recorrido de datos

El navegador y el ESP son clientes independientes de una API HTTPS en Vercel. La web no se conecta directamente al Arduino y el USB no es necesario para transferir datos durante el uso normal. El backend valida sesión o credencial individual del dispositivo, aplica rol/asignación y consulta Supabase PostgreSQL. Las credenciales privilegiadas permanecen en servidor.

**Recorrido web:** adulto → navegador → API Next.js en Vercel → validación/autorización → PostgreSQL y Storage privado → respuesta permitida según rol. **Recorrido ESP:** ESP por Wi-Fi/HTTPS → API de dispositivo → tablero y medios autorizados → verificación de tamaño/hash → caché y reproducción. Los eventos recorren ESP → API → PostgreSQL → historial del adulto autorizado.

### Stack y responsabilidades

| Componente | Tecnología | Responsabilidad |
| --- | --- | --- |
| Interfaz y API | Next.js, React, TypeScript en Vercel | Formularios, sesión, validaciones, proyección de datos y rutas de adultos/dispositivos |
| Persistencia | Supabase PostgreSQL | Usuarios, perfiles, asignaciones, pictogramas, dispositivos, informes y eventos |
| Archivos | Supabase Storage privado | Imágenes normalizadas y audios persistentes; acceso a través de rutas autorizadas |
| Voz | Piper en función Python Vercel | Síntesis española por frase y versión de voz; reutilización por hash |
| Dispositivo | ESP32-S3, firmware Arduino, pantalla táctil y audio | Tablero, selección, caché acotada, sincronización y cola persistente |

### Modelo de datos resumido

users contiene cuentas adultas y registros child internos. student_profiles enlaza al niño; user_access relaciona al adulto con el niño y su aprobación. devices y pictograms pertenecen al perfil. device_events conserva origen e identificador externo para deduplicación. phrase_audio identifica un recurso por frase/voz/versionado. Informes clínicos y orientaciones se separan en la proyección de servidor.

Relaciones esenciales: adulto 1 a N asignaciones; niño 1 a N asignaciones; perfil 1 a N pictogramas y dispositivos; dispositivo 1 a N eventos; varios pictogramas pueden reutilizar un audio por contenido. Este es un resumen lógico, no un DDL ni una afirmación de que exista un ORM. Las migraciones y consultas determinan los nombres físicos.

A7 adopta el camino UML: entidades/clases, secuencias y representaciones simplificadas de uso/actividad en docs/arquitectura/modelos.md. Confirmar con el profesor si requiere notación UML formal adicional. Las vistas simplificadas no se presentan como un segundo camino completo C4+BPMN.

<!-- PAGEBREAK -->

## A7 Medios voz y decisiones técnicas

Para personalizar, el adulto sube una imagen validada y define etiqueta, categoría y frase. La API comprueba rol, asignación y capacidad, normaliza la imagen, guarda metadatos y prepara audio por hash de frase/voz. Piper genera un WAV que se valida y persiste. El ESP obtiene el tablero con su credencial, descarga recursos y comprueba tamaño/hash, incluidas respuestas chunked. Cambiar la frase invalida la referencia anterior; no debe reproducirse silenciosamente otra frase.

El dispositivo reserva espacio para metadatos y eventos. La caché de medios está acotada a 512 KiB, con atlas de hasta 192 KiB dentro de ese presupuesto; las imágenes activas se gestionan en PSRAM. El conjunto de audios puede superar ampliamente esa capacidad: 180 frases diferentes ensayadas ocuparon aproximadamente 16,5 MB en servidor. No se guardan permanentemente todas las voces para sostener el máximo navegable.

### Tres ADR con alternativas ponderadas

| Decisión | Criterios y pesos | Alternativas y puntaje ponderado | Elección y consecuencia |
| --- | --- | --- | --- |
| ADR-01 API/despliegue | Autorización 40%, operación 30%, mantenimiento 20%, procesos largos 10% | Next integrado 4,7; backend separado 3,7; acceso directo cliente 2,7 | Next.js: menos despliegues; límites de funciones y arranque en frío requieren atención |
| ADR-02 Datos/permisos | Integridad 40%, consultas 25%, persistencia compartida 20%, operación 15% | PostgreSQL+API 4,85; documental+API 3,25; archivos locales 1,70 | PostgreSQL existente con autorización explícita; exige migraciones, respaldo y control de privilegios |
| ADR-03 Medios/voz | Personalización 35%, respuesta 25%, espacio 25%, continuidad parcial 15% | Embebido 2,85; descarga sin caché 3,40; nube+caché 4,20 | Medios privados y Piper cloud; voz sin red no garantizada |

Escala 1–5, mayor es mejor. Son evaluaciones retrospectivas de juicio técnico, no benchmarks ni actas de una decisión externa tomada en una fecha inventada. Las matrices completas y justificación están en docs/arquitectura/adr/ADR-01.md a ADR-03.md.

### Distribución física y limitaciones

Hablar está arriba; dentro de categorías el orden es Volver, Hablar, Borrar. Las flechas están a los lados, las etiquetas separadas de las imágenes y la frase abajo como lectura. La zona táctil inferior defectuosa sigue siendo una limitación física mitigada por distribución; no fue reparada. Wi-Fi conectado indica asociación al router, no disponibilidad de Internet o API. El portal de configuración se activa deliberadamente y permanece hasta reiniciar.

<!-- PAGEBREAK -->

## A5 Plan y resultados de software

Las pruebas de escritura se ejecutan en PostgreSQL descartable en localhost. verify:roles exige STCS_TEST_ISOLATED=1, servidor y base locales y comprobación de que coinciden. Nunca se ejecuta contra Supabase ni un servidor local conectado a producción. El plan no se fecha retroactivamente como previo a los ensayos físicos históricos.

| Nivel | Escenario esperado | Resultado observado | Reporte reproducible |
| --- | --- | --- | --- |
| Unitaria | Contratos, UTF-8, roles y eventos aceptan válidos y rechazan inválidos | 7/7 aprobados | pruebas/reportes/unitarias-cierre.xml |
| Integración | Sesiones, permisos, medios, informes, asignaciones, límites y concurrencia | 291 comprobaciones aprobadas | CI 43809946817 y manifiesto de ejecuciones |
| Resiliencia DB | JSON 503 y trabajador recuperable | 2 comprobaciones y reconexión aprobadas | Runner aislado y log CI |
| E2E | Navegador → API → persistencia → respuesta visible, con negativos | 10/10 Chromium; sin errores críticos JS/CSP en los recorridos | pruebas/reportes/e2e.xml |
| Cobertura | ≥70% líneas del alcance servidor definido, contando no ejecutados | 3602/4052 líneas: 88,89%; ramas 74,4%; funciones 97,39% | cobertura-negocio/coverage-summary.json y detalle |
| Regresión controlada | La prueba detecta retirar la validación UTF-8 | Fallo detectado en copia temporal; fuente real intacta | pruebas/reportes/regresion.json |

Los diez E2E incluyen login/URL directa, especialista con dos perfiles, CRUD/duplicados, imagen inválida/válida, docente sin clínica, apoderado limitado, admin numerado, credencial ausente y redirección, error API recuperable y vista móvil/logout. La expiración real de JWT se comprueba en API; quitar una cookie en navegador no simula el transcurso de dos horas. Chromium 390×844 no equivale a Safari ni a teléfonos físicos.

La cobertura abarca src/lib/server, rutas src/app/api, proxy.ts y permissions.ts/media-contract.ts. No incluye UI, C++ del firmware ni Python. No se declara 88,89% de todo STCS. Tampoco se calcula un porcentaje global del plan mezclando aserciones API, casos E2E, etapas de carga y personas; el ≥95% integral de la rúbrica requiere un denominador reconciliado y aceptación pendiente.

Comandos: npm ci, npm run test:unit, npm run test:coverage, npm run build, npm run typecheck, npm run test:isolated y npm run test:e2e, conforme a package.json y docs/PRUEBAS.md. Los runners requieren la base aislada preparada; no copiar el entorno de producción. Los SHA y herramientas exactos se conservan en docs/pruebas/reportes/cierre-20261116.json.

<!-- PAGEBREAK -->

## A5 Registro físico y defectos

Ignacio informa que realizó las pruebas durante el 15/11/2026 con un solo ESP y que funcionaron como esperaba. La duración fue descrita como durante el día, sin horas exactas ni constancia de ejecución continua. El registro del 16/11 es retrospectivo: no se inventan conteos, trazas, cronometrajes o observación directa del agente.

| Caso | Esperado | Resultado comunicado y límite |
| --- | --- | --- |
| PF-01 Navegación y voz | Seis páginas/categoría, imágenes y frase conservada | Conforme con conexión; anexar vídeo |
| PF-02 Desconexión/reconexión | Conservar tablero y enviar pendientes al reconectar | Conforme según ejecutor; sin voz al estar sin Wi-Fi |
| PF-03 Cola de 64 | Límite sin bloqueo y posterior envío de lo conservado | Confirmación explícita; sin conteo 64/65 ni serial adjuntos |
| PF-04 Corte de energía | Recuperar eventos ya guardados | Conforme informado; no prueba corte en instrucción exacta de escritura |
| PF-05 ACK interrumpido | Reintento sin duplicar el identificador | Confirmación explícita; faltan log y método del corte exacto |
| PF-06 Wi-Fi | Configurar y recuperar conexión | Conforme informado; matriz de teléfonos no acreditada |
| PF-07 Uso prolongado | Navegar/reproducir sin bloqueos observados | Conforme durante el día; sin duración/telemetría cuantificadas |
| PF-08 Varios ESP | Separación física de tableros y registros | NO EJECUTADA: un solo ESP disponible |

L-01 es una limitación observada: sin Wi-Fi no hubo voz en el ensayo. Se acepta mantener el prototipo tal como está, sin síntesis local ni ampliación de audios persistentes. No se garantiza salida vocal sin red; conservar imágenes o eventos no demuestra disponibilidad de voz. Se informará al profesional.

### Defectos corregidos y límites conservados

Se corrigieron tarjetas ausentes tras reinicio mediante separación de metadatos y caché/atlas; lectura HTTPS/chunked incompleta; pérdida del menú Wi-Fi tras reorganizar pantalla; y ausencia de cabeceras mediante CSP con nonce y anti-frame. El defecto físico de tacto inferior se mitigó moviendo controles, sin declararlo reparado. Los incidentes de selector E2E, limpieza de fixtures y mapas de cobertura se corrigieron en la infraestructura de pruebas, sin atribuirlos al producto o usar cifras inválidas.

**Anexos físicos por incorporar:** vídeos, versión visible, condiciones y alimentación; historial/identificadores antes y después; conteos de cola y reintentos; modelo del teléfono; inicio/fin del ensayo. Ocultar claves, redes domésticas y cualquier dato identificable. Registro completo: docs/pruebas/FISICAS_20261115.md.

<!-- PAGEBREAK -->

## A6 Seguridad y eficiencia

### Seguridad ejecutada

Se auditó el árbol completo de dependencias con cero vulnerabilidades conocidas reportadas en la ejecución conservada. La integración verifica sesión, rol/asignación vigente, respuestas antiguas, acceso ajeno y medios privados. Estos resultados no prueban ausencia de todo defecto ni sustituyen una evaluación de seguridad independiente.

ZAP 2.17.0 Baseline ejecutó araña y análisis pasivo sin autenticación sobre el servidor aislado, no sobre producción. Tras corregir cabeceras, el reporte final contiene cero grupos altos, un medio, cero bajos y tres informativos. El medio corresponde a style-src unsafe-inline, conservado por compatibilidad de estilos React/gráficos. Los scripts usan nonce por solicitud y strict-dynamic. No se observó un exploit asociado; el aviso residual no se presenta como inexistente ni como certificación de seguridad.

### Eficiencia local

| Clientes concurrentes | Duración prevista | Peticiones | Errores | p95 | Comparación |
| --- | --- | --- | --- | --- | --- |
| 5 | 15 s | 731 | 0 | 63,48 ms | Cumple ≤2000 ms y <1% |
| 10 | 15 s | 1331 | 0 | 69,42 ms | Cumple ≤2000 ms y <1% |

Generador, servidor y PostgreSQL estuvieron en el mismo computador, con pausa de 50 ms entre solicitudes por cliente. El umbral es de ingeniería propuesto en el plan, no una meta clínica acordada. No demuestra 10 ESP físicos, concurrencia de producción, capacidad sostenida de Vercel ni cumplimiento en redes móviles. La duración es breve y debe declararse.

Los archivos originales están en docs/calidad/carga-local.json, npm-audit-completo.json y dast/zap.json/zap.html; el análisis está en docs/calidad/README.md. No se reemplazan por capturas de un build exitoso.

### Recuperación y operación

Storage privado y voz alojada permiten operación con el computador del autor apagado. El ESP necesita alimentación USB de 5 V y Wi-Fi para sincronizar; la voz offline no está garantizada. Hay respaldos privados y procedimiento de recuperación; no se publican dumps de flash ni imágenes con credenciales. Las migraciones no se usan para comprobar conectividad y no se ejecutan seeds sobre producción. El AP local permanece hasta reiniciar, con riesgo residual de acceso cercano.

Quedan fuera del escaneo realizado el DAST autenticado/activo ampliado y escenarios de todos los navegadores/dispositivos. Estas brechas se mantienen en el backlog con prioridad; no se ocultan por terminar el prototipo físico.

<!-- PAGEBREAK -->

## A4 Trazabilidad del incremento

La cadena conecta objetivos, requerimientos, modelos, historias, casos, resultados y revisión de código. La matriz completa permanece en docs/trazabilidad.md y conserva también lo no cumplido. Los casos CP-RF03 históricos de pruebas corresponden a H3-RF03 actual; RF-03 del Hito 2 describía frase/controles. No se altera un reporte para cambiar su significado.

| Objetivo | Requerimiento y modelo | Jira | Caso y evidencia | Revisión y estado |
| --- | --- | --- | --- | --- |
| OE3 | H3-RF01/02, UC1/2 y SEQ2 | TCS-53/59/84 | API y E2E de roles, URL ajena y sesión | PR #13, CI; técnica comprobada en casos, aprobación externa pendiente |
| OE2 | H3-RF03, UC3 y SEQ1 | TCS-48/49/60 | Unitarias, E2E CRUD/medios y PF-01 | PR #5/#6/#13; físico informado |
| OE1 | H3-RF04, UC4 y ACT1 | TCS-43–47/85 | PF-01, controles y navegación | PR #5/#7/#9; sobrecarga visual sin validación externa |
| OE4 | H3-RF05/08, UC5/CL1/ACT1 | TCS-51/52/76/83 | PF-02–05 y API idempotencia | PR #2/#3/#7; físico informado sin trazas completas |
| OE1/OE4 | H3-RF06, UC6 | TCS-74 | PF-06, menú y portal móvil | PR #9; finalizada en alcance sin timeout |
| OE2 | H3-RF11, SEQ1 | TCS-60 | Etapas hasta 180 y rechazo 184 en laboratorio | PR #5; no máximo físico ni todas las voces offline |
| OE4 | H3-RNF02/03, SEQ1/2 | TCS-60/88 | Carga local, cobertura, CI y regresión | PR #13; límites de entorno documentados |
| OE1/OE2 | Validación de indicadores | TCS-77 | Sesión profesional no realizada | Pendiente; correo enviado |
| OE3/OE4 | FUT02, CL1/SEQ2 | TCS-53 | PF-08 con varios ESP no realizada | Futuro; no se marca aprobada |

Sprint 3 agrupa TCS-53, 59, 60, 74, 76, 77, 83, 84, 85 y 88. Las historias base de interfaz/sincronización pertenecen al incremento anterior; no se inventa una asignación histórica por sprint que no se haya reconciliado individualmente. La captura de Jira estaba en estado future con fechas antiguas; las fechas reales no se corrigen retroactivamente sin respaldo.

Referencia reproducible del software: PR #13, commit 3dfff375085ccc455e113d5184c42e9a5c9980ca, CI 43809946817. Los reportes de cobertura/DAST conservan sus SHA de ejecución específicos en el manifiesto; no se atribuyen todos al mismo commit por simplificar. La nueva publicación documental tendrá su propio PR/commit. La etiqueta final hito3 sigue pendiente hasta incorporar evidencias y cerrar revisión.

<!-- PAGEBREAK -->

## A8 Repositorio entrega y despliegue

GitHub contiene el código, los contratos, las pruebas, modelos, ADR, riesgos y reportes técnicos. Los guiones personales de presentación se mantienen fuera del repositorio. main está protegida y requiere verificación CI antes de integrar por PR. Se conserva lockfile, versión Node y scripts de laboratorio. El título solicitado por el propietario para el commit es Hito 3; rama y PR enlazan TCS-60. No se afirma que todo el historial antiguo ya usara esa convención.

El despliegue de referencia publicado fue verificado READY en el proyecto Vercel existente frontend y asociado al SHA 3dfff375085ccc455e113d5184c42e9a5c9980ca. El dominio de producción es 0stcs0.vercel.app. Supabase STCS es mvdjzjwidygmhvhfcpgg. Esta identificación no concede permisos ni prueba el acceso del profesor: debe comprobarse desde su cuenta. No se crean proyectos alternativos para aparentar aislamiento cloud.

### Reproducibilidad y recuperación

La web se instala con la versión Node declarada y npm ci; los ejemplos de variables se completan privadamente. Ejecutar build, tipos y pruebas mediante los runners documentados. El entorno normal de desarrollo comparte producción: solo los runners aislados son aptos para escrituras de prueba. Firmware se compila con placa, librerías y particiones documentadas; la compilación verificable usa credenciales ficticias y la cabecera operativa queda privada.

Antes de una intervención real se respalda el destino, se revisan migraciones y se prueba recuperación en una copia aislada. Una restauración previa comprobada no autoriza sobrescribir datos posteriores. Los respaldos del ESP no se publican porque pueden incluir credenciales. No hay nueva migración, seed, modificación de datos ni carga de firmware por redactar este informe.

### Estado de Jira al actualizar este informe

TCS-74 y TCS-76 permanecen Finalizadas en su alcance aceptado; reciben las confirmaciones físicas y L-01. TCS-77 permanece Tareas por hacer: correo enviado, reunión y aprobación pendientes. TCS-60 conserva la aceptación integrada previa al piloto pendiente; faltan revisión profesional, seguridad física/datos y mediciones no acreditadas. Los criterios técnicos más amplios de TCS-53/59/83/84/85/88 no se cierran por redactar anexos ni por una prueba con un solo equipo.

**Antes de entregar:** incorporar evidencias, verificar acceso de lectura al profesor, reconciliar pendientes de Jira y congelar tag hito3 en el commit final revisado. No crear una etiqueta móvil ni afirmar que existe antes de publicarla. La presentación será el 27/11: 10 minutos de explicación y 5 de demostración; este informe aporta la evidencia técnica, no reemplaza la defensa ni la revisión externa.

<!-- PAGEBREAK -->

## A9 Riesgos y deuda priorizada

Escala de probabilidad e impacto de 1 a 3; nivel es su producto. Los valores son evaluación del proyecto, no probabilidades clínicas medidas. La aceptación de una limitación no elimina su riesgo.

| Riesgo y requisito | P/I/Nivel | Estado y mitigación | Contingencia o deuda |
| --- | --- | --- | --- |
| L-01 Ausencia de voz sin Wi-Fi, H3-RF03/08 | 3/3/9 alto | Materializado en ensayo informado; conservar diseño aceptado | Conexión disponible y apoyo comunicativo alternativo del adulto; evaluar con profesional |
| Falta de aceptación externa, OE1/2 y A3 | 3/3/9 alto | Correo enviado, sin reunión confirmada | Acordar sesión/metas; consultar alternativa con profesor si no responde |
| Acceso indebido a datos, H3-RF02 | 2/3/6 alto | Autorización servidor y negativos ejecutados | Ampliar revisión autenticada y mantener datos ficticios |
| Cola llena, H3-RF05/08 | 2/3/6 alto | Límite 64; rechazo de nuevos eventos; ensayo informado | Anexar conteos/trazas; no prometer registro ilimitado offline |
| Zona táctil inferior, H3-RF04 | 3/2/6 alto | Controles superiores; defecto físico persiste | Supervisión, evaluar hardware antes de uso real |
| AP sin timeout, H3-RF06 | 2/2/4 medio | Activación deliberada, clave local, cierre por reinicio | Control del entorno; política individual si se amplía flota |
| Medios/cuotas/Internet, OE4 | 2/2/4 medio | Storage persistente y caché limitada | Alternativa de red y registro de incidencias; no prometer gratuidad permanente |
| Flota no validada, FUT02 | 3/2/6 alto | API con usuarios ajenos comprobada; solo un ESP físico | Segundo ESP y ensayo independiente antes de afirmar flota |
| Evidencia o permisos inaccesibles, A4/A8 | 2/3/6 alto | Índice técnico y reportes versionados | Probar con cuenta del profesor; anexar y etiquetar después |

Prioridad de cierre académico: obtener revisión profesional y mediciones auténticas, completar anexos y acceso, reconciliar trazabilidad y crear tag final. Deuda técnica posterior: varios ESP, DAST autenticado ampliado, matriz Safari/teléfonos, telemetría de larga duración y derechos/retención para un entorno real. No transformar pendientes en aprobados para completar un tablero.

### Decisión de preparación

El prototipo permite una demostración técnica con adultos y datos ficticios, explicitando L-01 y la dependencia de conectividad. No se emite autorización de piloto con menores, validación clínica de eficacia o preparación de una flota. La reunión profesional puede aportar observaciones y aceptación del alcance revisado; cualquier uso real requiere las autorizaciones, seguridad física y política de datos correspondientes.

<!-- PAGEBREAK -->

## Anexos y cierre de evidencia

El autor completará estos espacios con materiales reales. Cada anexo debe indicar caso, fecha, versión, esperado, observado y responsable, y debe poder abrirse desde los accesos entregados al profesor.

| Anexo | Contenido a incorporar | Estado |
| --- | --- | --- |
| E01 | Vídeo ESP: cuatro categorías, seis páginas, frase y controles superiores | Pendiente de adjuntar por autor |
| E02 | Web → imagen/frase → ESP → edición de frase y voz actualizada | Confirmado previamente; adjuntar |
| E03 | Historial/identificadores antes y después de desconexión, cola, corte y reintento | Resultado informado; faltan conteos/trazas |
| E04 | Wi-Fi móvil y estado conectado/desconectado, ocultando claves | Resultado informado; adjuntar |
| E05 | Registro de uso del 15/11, horas si se conservan y condiciones | Sin duración exacta comunicada |
| E06 | Roles: docente sin clínica, admin numerado, asignado/no asignado | Reportes automáticos disponibles; añadir capturas útiles |
| E07 | Informes de herramientas, CI y SHA | Versionados en docs/pruebas y docs/calidad |
| E08 | Revisión profesional: rol/fecha, tareas, medidas, observaciones y aceptación por alcance | No realizada; correo enviado |
| E09 | Accesos del profesor a GitHub/Jira y etiqueta hito3 final | Por verificar y completar al congelar |

### Fuentes técnicas y académicas

Guía Hito 3 Qué debes entregar cómo se ve correcto y rúbrica, INSW422, Matías Vargas, 10/11/2026; retroalimentación individual de Hito 2 aportada por Ignacio; informes y presentaciones de Sprint 1 y Hito 2. Los originales no se redistribuyen. Objetivos/equivalencias y hashes de procedencia están en docs/ANTECEDENTES_HITOS_1_2.md y docs/evidencias/hito3-20261116/antecedentes.json.

Artefactos de STCS: objetivos.md, requerimientos.md, historias.md, trazabilidad.md, pruebas/PLAN_HITO3.md, pruebas/CIERRE_20261116.md, pruebas/FISICAS_20261115.md, calidad/README.md, arquitectura/modelos.md y ADR-01/02/03, REPOSITORIO_HITO3.md, riesgos.md, README y CHANGELOG. Los reportes originales identifican herramientas, revisión y límites.

Referencia software: https://github.com/N4CHO8/STCS/pull/13 y https://github.com/N4CHO8/STCS/actions/runs/43809946817 . Los accesos de evaluación los incorporará el autor tras verificarlos. La publicación de esta documentación no sustituye los resultados externos pendientes.

**Resultado de cierre:** incremento técnico publicado y comprobado dentro de los alcances declarados; pruebas físicas informadas por el ejecutor con evidencia por anexar; limitación vocal sin Wi-Fi aceptada; evaluación profesional, varios ESP y congelación final pendientes. No se afirma cumplimiento académico al 100% antes de completar esas condiciones y la defensa.
