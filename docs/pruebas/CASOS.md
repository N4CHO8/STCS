# Catálogo de casos — A5

Catálogo revisado el 17/11; los reportes mantienen su fecha real. Cada fila conserva requisito/HU, tipo, precondición, pasos, esperado, obtenido y evidencia. Los escenarios sin ID CP usan un nombre descriptivo. E2E: una fila representa dos ejecuciones, una por motor; API: una suite, no 319 casos.

Los CA01, CA02… son los criterios numerados en Jira el 18/11. La columna los enlaza por su texto; una prueba puede cubrir solo parte de un criterio. No se renombra ninguna prueba ni se atribuye una ejecución nueva.

## Condiciones y evidencia comunes

| Clave | Significado |
| --- | --- |
| L1 | Servidor/base descartables con identidad verificada y cuentas ficticias creadas/retiradas por el runner; no producción |
| F1 | ESP real previamente configurado; datos ficticios; versiones/red disponibles identificadas |
| U17 | [JUnit 17/11](reportes/a5-revision-20261117/unitarias-tls.xml), [versión/hashes](reportes/a5-revision-20261117/metadatos.json) |
| E16 | [Chromium](reportes/arreglos-locales-20261116/chromium.xml), [WebKit](reportes/arreglos-locales-20261116/webkit.xml), [versión](reportes/arreglos-locales-20261116/manifest.json) |
| I16 | [Reporte API/resiliencia](reportes/arreglos-locales-20261116/integracion-cobertura.txt), [versión](reportes/arreglos-locales-20261116/manifest.json) |

Estas claves forman parte de cada fila. [Procedimiento](../PRUEBAS.md), [comandos ampliados](ARREGLOS_LOCALES_20261116.md#reproducir-sin-datos-reales), [plan](PLAN.md) y [resultados](RESULTADOS.md). Las fuentes ejecutables son las [unitarias](../../frontend/tests/validation.test.mjs), [CSV](../../frontend/tests/history.test.mjs), [sesión](../../frontend/tests/auth-client.test.mjs), [TLS](../../frontend/tests/tls.test.mjs), [portal](../../frontend/tests/e2e/portal.spec.mjs) y [accesibilidad/CSV](../../frontend/tests/e2e/accessibility.spec.mjs).

## Unitarias y TLS

| ID | Requerimiento / HU | Criterio asociado | Nivel o tipo | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-RF03-U01 | H3-RF03; TCS-48/49 | TCS-48.CA01 | Positivo | Pictograma válido | Dar nombre Vaso y frase Necesito beber agua; parsear | Conservar frase independiente de nombre/imagen | Aprobado 17/11 | U17 |
| CP-RF03-U02 | H3-RF03; TCS-48/49 | TCS-48.CA02 | Límite/negativo | Validador UTF-8 real | Enviar límites de 31/95 bytes y excesos ASCII/multibyte | Aceptar límites y rechazar exceso | Aprobado 17/11 | U17 |
| CP-RF03-U03 | H3-RF03; TCS-48/49 | TCS-48.CA02 | Negativo | Contrato de pictograma | Enviar objetos vacíos, tipos incorrectos y campos faltantes | Rechazar entradas inválidas | Aprobado 17/11 | U17 |
| CP-RF03-U04 | H3-RF03/11; TCS-48/60 | TCS-48.CA02 | Mixto | Catálogo y ruta de imagen | Probar imagen interna/ajena, categoría y posiciones 0/180/181 | Aceptar contrato válido y rechazar rutas/valores ajenos al contrato | Aprobado 17/11 | U17 |
| CP-RNF01-U01 | H3-RF01/02; H3-RNF01; TCS-59/84 | TCS-59.CA01; TCS-84.CA01 | Negativo | Matriz de roles | Evaluar therapist/teacher/guardian/admin/child y roles desconocidos | Adultos y capacidades exactas; child/desconocido sin portal | Aprobado 17/11 | U17 |
| CP-RF05-U01 | H3-RF05; TCS-51 | TCS-51.CA01 | Positivo/límite | Contrato de eventos | Parsear ID, fecha y extremos válidos | Conservar datos válidos y valores por defecto | Aprobado 17/11 | U17 |
| CP-RF05-U02 | H3-RF05; TCS-51 | TCS-51.CA02 | Negativo | Contrato de eventos | Enviar tipos, UUID, fecha y rangos inválidos | Rechazar sin aceptar el evento | Aprobado 17/11 | U17 |
| CP-RF10-U01 | H3-RF10; H3-RNF01; TCS-83/59 | TCS-83.CA02; TCS-83.CA03 | Negativo/límite | Generador CSV puro | Enviar fórmulas, espacios, ancho completo, comillas y saltos | Neutralizar prefijos y escapar sin perder estructura CSV | Aprobado 17/11 | U17 |
| CP-RF01-U02 | H3-RF01; H3-RNF01; TCS-84 | TCS-84.CA02 | Concurrencia/negativo | Fetch/almacenamiento simulados, sin login real | Resolver 401 viejo, 401 vigente y solicitud abortada | Solo el 401 vigente invalida la sesión correspondiente | Aprobado 17/11 | U17 |
| Guard de riesgos ZAP, sin ID CP | H3-RNF01; TCS-59 | TCS-59.CA03 | Negativo | Clasificador de avisos | Enviar High/Critical/3 y Medium/Low/0 | Detectar altos numéricos/textuales sin clasificar medios como altos | Aprobado 17/11 | U17 |
| CP-RNF01-TLS01 | H3-RNF01; TCS-59 | TCS-59.CA02 | Integración negativa | Servidor TLS efímero 127.0.0.1 con certificado autofirmado | Conectar con el adaptador PostgreSQL real y validación activada | Rechazar certificado no confiable y retirar servidor/temporales | Aprobado 17/11; no usa Supabase | U17 |

## Navegador histórico del 16 de noviembre

Este bloque conserva los 16 recorridos de esa ejecución. Con las ampliaciones de adaptación y ARASAAC, el candidato del 21/11 ejecuta 20 por motor.

| ID | Requerimiento / HU | Criterio asociado | Nivel o tipo | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CP-RF01-E01 | H3-RF01; TCS-84 | TCS-84.CA01 | E2E Negativo | L1 | Abrir URL privada sin sesión y enviar contraseña errónea | Redirigir a login y mostrar credenciales inválidas | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF02-E01 | H3-RF02; TCS-53/59 | TCS-53.CA01; TCS-59.CA01 | E2E Positivo | L1 | Entrar como especialista y seleccionar ficha de perfil asignado | Dos opciones asignadas y nota privada del fixture visible | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF03-E01 | H3-RF03; TCS-48/49 | TCS-48.CA01; TCS-48.CA02; TCS-49.CA01 | E2E CRUD/negativo | L1 | Crear, recargar, editar, intentar nombre duplicado y eliminar pictograma | Persistencia correcta, duplicado rechazado y eliminación visible | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF03-E02 | H3-RF03; TCS-48/49 | TCS-48.CA01; TCS-48.CA02 | E2E Mixto | L1 | Subir archivo inválido y luego imagen válida; recargar editor | Rechazo claro y persistencia de imagen válida | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF02-E02 | H3-RF02/07; TCS-59/84 | TCS-59.CA01 | E2E Negativo | L1 | Entrar como teacher, revisar controles y respuesta API | Sin ficha clínica, diagnóstico o progreso | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF02-E03 | H3-RF02; TCS-53/59 | TCS-53.CA01; TCS-59.CA01 | E2E Negativo | L1 | Entrar como guardian y revisar perfil/tablero | Solo su perfil; no edición de tablero | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF02-E04 | H3-RF02/09; TCS-59/84 | TCS-59.CA01; TCS-84.CA03 | E2E Negativo | L1 | Entrar como admin y revisar respuesta privada | Perfiles numerados sin identidades infantiles | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF01-E02 | H3-RF01; TCS-84 | TCS-84.CA02 | E2E Negativo | L1 | Retirar cookie de servidor y solicitar portal con transporte sincronizado | 401 real, retiro de datos y regreso a login | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-E01 | H3-RNF03; TCS-85 | TCS-85.CA01 | E2E Fallo/reintento | L1 | Provocar fallo API controlado y reintentar | Mensaje recuperable y carga posterior correcta | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-E02 | H3-RF01; H3-RNF03; TCS-84/85 | TCS-84.CA02; TCS-85.CA03 | E2E Móvil/logout | L1 | Usar viewport móvil, navegar y cerrar sesión | Sin desbordamiento y sin retorno a datos privados | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF10-E01 | H3-RF10; TCS-83 | TCS-83.CA03 | E2E Positivo | L1 | Entrar como especialista, abrir Actividad y descargar CSV | Archivo historial-stcs.csv descargado sin alerta | Aprobado en ambos motores, 16/11 | E16 |
| CP-RF01-E03 | H3-RF01/10; TCS-84/83 | TCS-84.CA02; TCS-83.CA02 | E2E Negativo | L1 | Retirar cookies y exportar desde Actividad | 401 observado; login y selector privado retirado | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-A11Y (therapist) | H3-RNF03; TCS-85 | TCS-85.CA03 | E2E Accesibilidad | L1 | Entrar con rol, recorrer controles con teclado y ejecutar axe en secciones permitidas | Foco/contraste y reglas WCAG seleccionadas sin infracciones detectadas | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-A11Y (teacher) | H3-RNF03; TCS-85 | TCS-85.CA03 | E2E Accesibilidad | L1 | Entrar con rol, recorrer controles con teclado y ejecutar axe en secciones permitidas | Foco/contraste y reglas WCAG seleccionadas sin infracciones detectadas | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-A11Y (guardian) | H3-RNF03; TCS-85 | TCS-85.CA03 | E2E Accesibilidad | L1 | Entrar con rol, recorrer controles con teclado y ejecutar axe en secciones permitidas | Foco/contraste y reglas WCAG seleccionadas sin infracciones detectadas | Aprobado en ambos motores, 16/11 | E16 |
| CP-RNF03-A11Y (admin) | H3-RNF03; TCS-85 | TCS-85.CA03 | E2E Accesibilidad | L1 | Entrar con rol, recorrer controles con teclado y ejecutar axe en secciones permitidas | Foco/contraste y reglas WCAG seleccionadas sin infracciones detectadas | Aprobado en ambos motores, 16/11 | E16 |

## API, resiliencia, regresión, carga y seguridad

| ID | Requerimiento / HU | Criterio asociado | Nivel o tipo | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Suite API / grupos I01 | H3-RF01–03/05/07/09/10/11; H3-RNF01; TCS-53/59/83/84 | TCS-53.CA01; TCS-53.CA02; TCS-59.CA01; TCS-83.CA01; TCS-83.CA02; TCS-83.CA03; TCS-84.CA02; TCS-84.CA03; TCS-84.CA04 | Integración mixta | Servidor y PostgreSQL localhost, misma base verificada, STCS_TEST_ISOLATED=1 | Ejecutar verify-roles mediante runner; crear/eliminar solo UUID propios; probar permisos, sesiones, asignaciones, medios, filtros, duplicados, límites y concurrencia | Todas las aserciones pasan y los fixtures se retiran | 319 comprobaciones aprobadas en una suite, no 319 casos | I16 |
| Caída DB /api/health | H3-RNF03/04; TCS-88 | TCS-88.CA03 | Resiliencia negativa | Servidor local con DB configurada inaccesible; auth ficticia cuando corresponde | Solicitar endpoint mientras la DB no responde | HTTP 503 con JSON, no caída ni filtrado de error interno | Aprobado 16/11 | I16 |
| Caída DB /api/auth/me | H3-RNF03/04; TCS-88 | TCS-88.CA03 | Resiliencia negativa | Servidor local con DB configurada inaccesible; auth ficticia cuando corresponde | Solicitar endpoint mientras la DB no responde | HTTP 503 con JSON, no caída ni filtrado de error interno | Aprobado 16/11 | I16 |
| Reconexión trabajador | H3-RNF04; TCS-88 | TCS-88.CA03 | Resiliencia | Trabajador real sobre API loopback controlada | Responder 503 y después recuperar la API | Proceso sobrevive y reconecta | Aprobado; sin trabajos de voz ni datos creados | I16 |
| Regresión CP-RF03-U02 | H3-RF03; H3-RNF03; TCS-48/88 | TCS-48.CA02; TCS-88.CA01 | Mutación controlada | Copia temporal del validador, no fuente real | Retirar guard UTF-8 en la copia y ejecutar U02 | U02 falla por el cambio; la fuente real queda intacta | Mutación detectada, escenario aprobado | [Registro de herramienta](reportes/regresion.json) |
| CP-RNF02-L01 | H3-RNF02; TCS-88 | TCS-88.CA01 | Eficiencia | Next build/DB local; un perfil sin pictogramas; fixture propio | Consultar portal con 5 clientes, 15 s, pausa 50 ms | p95 ≤2000 ms y errores <1% | Aprobado; 52,64 ms/775 consultas con 5 y 55,32 ms/1490 con 10; cero errores | [Carga y versión](reportes/arreglos-locales-20261116/carga-local.json) |
| CP-RNF02-L02 | H3-RNF02; TCS-88 | TCS-88.CA01 | Eficiencia | Next build/DB local; un perfil sin pictogramas; fixture propio | Consultar portal con 10 clientes, 15 s, pausa 50 ms | p95 ≤2000 ms y errores <1% | Aprobado; 52,64 ms/775 consultas con 5 y 55,32 ms/1490 con 10; cero errores | [Carga y versión](reportes/arreglos-locales-20261116/carga-local.json) |
| npm audit | H3-RNF01; TCS-59 | TCS-59.CA03 | Seguridad | Dependencias/lock vigentes del laboratorio | Ejecutar auditoría de dependencias | Sin altas/críticas sin tratar; registrar todos los avisos | Cero vulnerabilidades conocidas | [Reporte](reportes/arreglos-locales-20261116/npm-audit.json) |
| CP-RNF01-S01 autenticado | H3-RNF01; TCS-59 | TCS-59.CA01; TCS-59.CA03 | Seguridad pasiva | ZAP por digest, API local con cuatro roles y anónimo | Enviar peticiones por proxy, comprobar 13 respuestas y analizar pasivamente activos | Estados/datos permitidos; cero avisos altos/críticos sin tratar | 13 verificaciones; 0 altos, 1 medio residual y 1 informativo; no pentest activo | [Reporte ZAP](reportes/arreglos-locales-20261116/seguridad-autenticada.json) |
| Supabase anónimo solo lectura | H3-RNF01; TCS-59 | TCS-59.CA02 | Seguridad negativa | Proyecto STCS fijo, clave pública, sin escrituras | Validar clave por Auth y hacer GET de IDs sobre 14 tablas | Cero filas o denegación de permisos verificable | 14 comprobaciones conformes, sin seleccionar identidades | [Reporte](reportes/arreglos-locales-20261116/supabase-readonly.json) |
| Restauración SQL/medios | H3-RNF04; TCS-88 | TCS-88.CA03 | Recuperación | Base localhost vacía; destino nuevo aleatorio; PNG/RGB/WAV sintéticos | Crear fixture, dump, restaurar en destino nuevo y comparar relaciones/hashes; limpiar solo lo propio | Datos/archivos equivalentes y limpieza completa | Aprobado; no recuperación real de servicio cloud ni flash ESP | [Reporte](reportes/arreglos-locales-20261116/recuperacion.json) |

## Pruebas físicas completadas según ejecutor

| ID | Requerimiento / HU | Criterio asociado | Nivel o tipo | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PF-01 | H3-RF03/04/11; TCS-60/85 | TCS-60.CA01 | Física informada | F1 | Navegar páginas/categorías, seleccionar, conservar frase y Hablar con Wi-Fi | Opciones completas y frase/audio correctos | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-02 | H3-RF08; H3-RNF04; TCS-76 | TCS-76.CA03 | Física informada | F1 | Desconectar/reconectar red y revisar tablero/registros | Conservar recursos disponibles y reanudar sincronización; voz offline no garantizada | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-03 | H3-RF05/08; TCS-76 | TCS-76.CA02 | Física informada | F1 | Ejercitar cola de 64 y exceso, recuperar conexión | Conservar pendientes hasta ACK; nuevo encolado rechazado si está llena | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-04 | H3-RNF04; TCS-76 | TCS-76.CA01; TCS-76.CA03 | Física informada | F1 | Cortar alimentación con registros pendientes y encender | Recuperar lo guardado; no prueba atomicidad de cualquier instrucción | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-05 | H3-RF05; H3-RNF04; TCS-76 | TCS-76.CA01 | Física informada | F1 | Interrumpir confirmación y reintentar identificador | Una fila tras reintento, sin duplicado | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-06 | H3-RF06; TCS-74 | TCS-74.CA01; TCS-74.CA02 | Física informada | F1 | Activar AP, configurar red desde celular y comprobar estado | Menú/formulario accesibles; asociación al router visible | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-07 | H3-RNF04; TCS-60 | TCS-60.CA01 | Física informada | F1 | Usar navegación y voz durante el día observando bloqueos | Operación conforme; sin duración continua cuantificada | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| PF-08 | H3-RF02; FUT02; TCS-53 | TCS-53.CA03 | Física informada | F1 | Usar dos ESP asociados a perfiles distintos | Información separada por perfil | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |
| MC-WEB-01 | H3-RF02; TCS-53/84 | TCS-53.CA01 | Física informada | F1 | Abrir varios computadores para el mismo ESP autorizado | Acceso al perfil sin mezclar datos | Conforme según Ignacio; no instrumentado; fechas 15/11 y PF-08/MC-WEB-01 el 16/11 | [PF-01–08](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md) |

## Aceptación profesional y alcance observado

| ID | Requerimiento / HU | Criterio asociado | Nivel o tipo | Precondición | Pasos | Resultado esperado | Resultado obtenido | Evidencia |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| PA-01 | H3-RF04; TCS-77 | TCS-77.CA01; TCS-77.CA02 | Aceptación | Profesional y metas acordadas; Zoom adulto, datos ficticios, operador/modalidad registrados | Localizar categorías/necesidad | Completitud/errores/ayudas/tiempo según metas acordadas | Parcial: video comentado; autonomía y tiempos no medidos | [Registro y límites](../validacion/REGISTRO.md) |
| PA-02 | H3-RF04; TCS-77 | TCS-77.CA01; TCS-77.CA02 | Aceptación | Profesional y metas acordadas; Zoom adulto, datos ficticios, operador/modalidad registrados | Construir frase, navegar y borrar | Secuencia/selección coherentes; autonomía solo si operación directa | Parcial: recorrido explicado; dos secuencias del protocolo no comprobadas | [Registro y límites](../validacion/REGISTRO.md) |
| PA-03 | H3-RF03; TCS-77 | TCS-77.CA01; TCS-77.CA02 | Aceptación | Profesional y metas acordadas; Zoom adulto, datos ficticios, operador/modalidad registrados | Crear/editar imagen y frase y observar sincronización/voz | Coincidencia exacta; medir frío/caché | No comprobado: voz nueva fallaba en producción (D15) | [Registro y límites](../validacion/REGISTRO.md) |
| PA-04 | H3-RF04; TCS-77 | TCS-77.CA01; TCS-77.CA02; TCS-77.CA03 | Aceptación | Profesional y metas acordadas; Zoom adulto, datos ficticios, operador/modalidad registrados | Revisar símbolos, vocabulario y carga visual | Registrar claro/ambiguo/rechazado y motivos; sin eficacia clínica atribuida | Revisión cualitativa realizada con observaciones; sin medición con niños | [Registro y límites](../validacion/REGISTRO.md) |
| PA-05 | H3-RF02/07; H3-RNF01; TCS-77 | TCS-77.CA01; TCS-77.CA02; TCS-77.CA03 | Aceptación | Profesional y metas acordadas; Zoom adulto, datos ficticios, operador/modalidad registrados | Revisar límites por rol y orientaciones | Decisión por escenarios realmente observados | Parcial: especialista y orientaciones comentados; no todos los escenarios por rol | [Registro y límites](../validacion/REGISTRO.md) |

## Ampliación del 21/11 — adaptación y seguimiento

| Caso | Requerimiento / HU | Criterio | Tipo | Precondición y pasos | Resultado esperado | Evidencia |
| --- | --- | --- | --- | --- | --- | --- |
| CP-ADAPT-U01/U02 | H3-RF12 / TCS-85 | CA04 | Unitaria/negativa | Selección nula, parcial, vacía, malformada, repetida o excesiva | Conservar catálogo; filtrar IDs/categorías; rechazar entradas inválidas | [Reporte](reportes/adaptacion-20261121/README.md) |
| CP-ADAPT-I01 | H3-RF12 / TCS-85/59 | CA04 / TCS-59.CA01 | Integración/negativa | API local: guardar como especialista; intentar otros roles/perfil; consultar config; retirar último visible y restaurar selección | Solo autorizado guarda; el ESP recibe la selección; no se vacía por CRUD ni se borra el catálogo | Mismo reporte; ampliación de verify:roles |
| CP-ADAPT-E01/E02 | H3-RF12 / TCS-85 | CA04 | E2E | Guardar selección, recargar, restaurar y entrar como docente | Persiste selección; docente sin controles de adaptación | Mismo reporte, Chromium/WebKit |
| CP-FOLLOW-I01 | H3-RF13 / TCS-85/59 | CA05/06 / TCS-59.CA01 | Integración/negativa | Guardar fecha inválida/futura/válida; enviar observación repetida; consultar otro perfil y roles prohibidos | Validación, persistencia, idempotencia y proyecciones autorizadas | Mismo reporte; ampliación de verify:roles |
| CP-FOLLOW-E01 | H3-RF13 / TCS-85 | CA05/06 | E2E | Especialista guarda fecha; docente envía; especialista consulta y cambia de niño | Fecha persistida y comentario en perfil correcto, sin clínica docente | Mismo reporte, Chromium/WebKit |

Las pruebas de navegador usan datos ficticios y una base localhost confirmada. La ejecución física del firmware adaptable no se realiza por petición de conservar el ESP instalado; no se presenta la compilación como prueba física.

## Catálogo ARASAAC del 21 de noviembre

| Caso | Requerimiento y criterio | Preparación y pasos | Esperado | Obtenido y evidencia |
| --- | --- | --- | --- | --- |
| CP-RF03-ARASAAC-U01 | H3-RF03; TCS-48.CA01 | Leer catálogo y las 91 imágenes; comparar ID, frase, tamaño y huella con manifiesto | Correspondencia exacta y PNG de 96 × 96 | Conforme; prueba Node de integridad, [JUnit](reportes/arasaac-20261121/catalogo.xml) |
| CP-RF03-ARASAAC-U02 | H3-RF03; TCS-48.CA01 | Consultar tres opciones excluidas y sus archivos antiguos | Fuera del selector; rutas y archivos históricos intactos | Conforme; mismo JUnit |
| CP-RF03-ARASAAC-U03 | H3-RF03; TCS-48.CA01 | Consultar procedencia de una imagen propia y una ruta desconocida | No atribuirlas a ARASAAC | Conforme; mismo JUnit |
| CP-RF03-ARASAAC | H3-RF03; TCS-48.CA01, TCS-85.CA03 | Entrar a créditos desde login; abrir editor y recorrer las cuatro categorías | 91 opciones cargadas, sin las tres excluidas; créditos accesibles | Conforme en ambos motores, [reporte](reportes/arasaac-20261121/README.md) |

Los IDs U01–03 localizan los tres tests con nombres descriptivos del JUnit; no se renombra la salida original de la herramienta. Las repeticiones de otros recorridos del 21/11 están en ese mismo reporte.
