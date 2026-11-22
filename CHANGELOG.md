# Cambios de STCS

## Revisión documental del 22/11/2026

- TCS-60/88: informe, fichas de HU y registro profesional alineados con las comprobaciones de nube y ESP; se mantienen los límites de la revisión cualitativa.
- TCS-60: cifras de carga contrastadas con su JSON original; aprobaciones de pertinencia atribuidas únicamente a Heriber.
- Documentación revisada en `hito3-revision-documental-1`; el tag original `hito3` conserva su corte funcional. Sin cambios de aplicación, firmware ni datos.

## Hito3 — comprobación final del 22/11/2026

- TCS-83/84/85: historial/CSV y auditoría, sesiones, accesibilidad, selección de tablero por especialista, fecha de inicio y observaciones docentes.
- TCS-60/D15: configuración Piper empaquetada y modelo fijado para preparar frases nuevas.
- TCS-85: catálogo ARASAAC y créditos visibles, conservando imágenes propias y referencias históricas.
- TCS-59/88: migraciones aditivas revisadas, RLS/privilegios de servidor, pruebas aisladas y firmware adaptable v0.8.8.
- TCS-76/D19: atlas ARASAAC hasta 384 KiB dentro de la caché total de 512 KiB; reemplazo de copias grandes con reserva para metadatos/eventos. Tablero de 94 con 89 imágenes únicas, 305.992 bytes, verificado en ESP.
- TCS-60/88: arranque con cargador de 5 V y voz exacta confirmado por el propietario; [PR #17](https://github.com/N4CHO8/STCS/pull/17) publica los flujos y [PR #18](https://github.com/N4CHO8/STCS/pull/18) reúne el cierre y su evidencia.
- TCS-77: revisión cualitativa de Heriber y alcance real de aprobación; indicadores externos no medidos declarados en A1.
- La evidencia final de nube y hardware se registra en `docs/pruebas/reportes/comprobacion-final-20261121/`.


## Preparación — corrección de voz en nube del 18 de noviembre de 2026

- TCS-60/D15: fallo real 422 al generar frases nuevas en Vercel. Configuración local y descarga externa tenían hashes distintos; se conserva y empaqueta la configuración revisada y se fija la revisión del modelo.
- Ocho pruebas de regresión y petición HTTP local con Piper aprobadas. Errores del servidor se distinguen de entradas inválidas. El ensayo de ese día fue local; la publicación y comprobación posterior en Vercel y ESP constan en el cierre del 22/11. No se modificaron datos, firmware ni audios existentes durante aquella preparación.

## Preparación — comprobaciones físicas del 18 de noviembre de 2026

- TCS-60: seis cambios LAN instrumentados, tres nuevos y tres reutilizados, todos aplicados; 7,836–16,889 s. Una muestra supera 15 s; se conserva el incumplimiento del KPI histórico. Imágenes/frases nuevas y última reutilización confirmadas por el autor.
- TCS-59: rechazo TLS físico con clave ficticia y control positivo confiable; tres rechazos y cero peticiones HTTP no confiables. Copia temporal del firmware; respaldo completo restaurado, verificado y confirmado. Sin despliegue ni cambios del firmware habitual.

## Preparación — revisión del 18 de noviembre de 2026

- TCS-60/88: ficha del sprint, tareas en las HU existentes, criterios numerados y enlace de los 52 casos a sus criterios. Seguimiento de riesgos e impedimentos, balance técnico y Review externa pendiente.
- Informe: fundamento CAA con referencias y alternativas concretas; costo informado $30.942 CLP y servicios sin pagos hasta esta fecha. Separación del diseño predictivo y actualización de límites del ESP.
- Cierre preparado: sincronización medida y TLS físico aún por comprobar, atribución visible y video/confirmación pendientes. Sin commits, despliegues, migraciones ni cambios de firmware.

## Preparación — revisión de entrega del 17 de noviembre de 2026

- TCS-60/TCS-88: A1–A9 revisados contra la guía, con objetivos originales, alcance justificado, trazabilidad y evidencia separada por revisión; no aceptación profesional atribuida.
- TCS-53: cierre para ESP previamente configurados por decisión del propietario; vinculación/rotación/reasignación web diferidas a FUT03, no implementadas. Sustituye ese pendiente del corte del 16/11 sin reescribirlo.
- TCS-59/TCS-85/TCS-88: catálogo y recuentos de A5, repetición unitaria/TLS del 17/11 con JUnit (11 aprobados) y contraste de seguridad/carga con A2. Reportes anteriores conservados.
- TCS-88: A8 documenta main protegida y CI de ebfc605/PR #16, plantillas, despliegue reproducible y excepciones históricas. Tag hito3, columna de aprobación del stakeholder y publicación final pendientes. No se modificó el workflow Jira ni se publicó código.

## Preparación — verificación local del 16 de noviembre de 2026

- TCS-83: filtros de historial completos y exportación CSV autorizada, seudonimizada y auditada; límites 10.000 eventos/3 MiB y controles de fórmulas.
- TCS-84/85: contraste y foco, hidratación segura del login, invalidación de sesión tras 401 sin afectar logins nuevos y cancelación de consultas al salir de la página.
- TCS-59: pruebas TLS/RLS, ZAP autenticado acotado y lectura anónima de Supabase; riesgo residual explícito.
- TCS-88: carga con fixtures propios, recuperación aislada SQL/medios, cobertura ampliada y laboratorio de revisión. Main exige PR/verify y Sprint 3 está activo; etiquetas de HU alineadas con sus campos.
- TCS-53: prueba de dos ESP informada por el autor; alta/reasignación web y protocolo de claves aún pendientes. Sin carga de firmware ni despliegue de aplicación.
- Código y evidencia local pendientes del commit final por instrucción del propietario. [Resultados y límites](docs/pruebas/ARREGLOS_LOCALES_20261116.md).

## Organización de la entrega para defensa — 16 de noviembre de 2026

- TCS-60/TCS-88: entrada única DEFENSA y artefactos A1–A9; registros de etapas anteriores separados en docs/historico sin alterar reportes originales.
- Descripciones de los 50 IDs de Jira depuradas; criterios Dado/Cuando/Entonces, evidencia y pendientes concretos. Estados e historial conservados.
- Objetivo de Sprint 2 recuperado y registrado; nombre/objetivo de Sprint 3 coherentes con revisión adulta del prototipo, sin cambiar fechas de ejecución.
- Corregidas instrucciones de PlatformIO, demo, permisos docentes, conexión USB y límites antiguos; contrato actual incluye ACK y capacidad 180/45 y cola 64.
- Modelos de uso/actividad visuales, trazabilidad con pertenencia real a sprints y guía de pruebas con aislamiento explícito. Sin cambios de aplicación, firmware operativo ni datos de producción.

## Registro físico e informe del Hito 3 — 16 de noviembre de 2026

- TCS-60/TCS-74/TCS-76: pruebas del 15/11 informadas por el propietario con un ESP, sin inventar conteos, duración o anexos; varios ESP no ejecutado.
- TCS-60/TCS-77: informe técnico A1–A9 y trazabilidad actualizada; correo al profesional enviado, sin aprobación externa todavía.
- L-01: ausencia de voz sin Wi-Fi observada y aceptada sin modificar firmware; caché limitada no garantiza voz offline.
- Corrección documental de criterio histórico de 256: límite aceptado de 64 en TCS-76. Sin cambios de código, firmware o datos de producción.

## Preparación del Hito 3 — 16 de noviembre de 2026

- TCS-60/TCS-88: índice A1–A9, trazabilidad, escenarios, modelos, tres ADR
  retrospectivos, plan de pruebas, resultados y riesgos explícitos.
- TCS-60: siete pruebas unitarias reales y regresión en copia temporal;
  cobertura delimitada a tres módulos.
- TCS-88: carga HTTP aislada en localhost y nueva suite en CI.
- TCS-77: pauta de medición/aprobación externa pendiente; no hay reunión
  realizada ni tag final hito3 en esta fecha.

## Publicaciones del 15 de noviembre de 2026

- PR #9/#10: acceso y estado Wi-Fi en v0.8.6, limpieza web y comprobaciones.
  Correspondencia de cierre TCS-74/TCS-85.
- PR #7/#8: metadatos completos, refresco progresivo, atlas rápido y prueba
  con cargador. Correspondencia TCS-76/TCS-60.
- PR #5/#6: medios privados, Piper en nube, integridad HTTPS, capacidad 180/45
  y tablero inicial 96/24. Correspondencia TCS-48/TCS-49/TCS-60/TCS-88.

## Antecedentes

- PR #1–4: Luis ficticio y ESP, cuentas sintéticas, ACK y retiro de demos.
  Correspondencia TCS-53/TCS-84.
- hito-2 conserva el corte anterior. Los PR históricos no siempre citan ticket;
  esta correspondencia es retrospectiva y no reescribe la autoría.

Referencias: https://github.com/N4CHO8/STCS/pulls.

## Cierre de pruebas y alcance — 16 de noviembre de 2026

- TCS-74/TCS-76: alcance final aceptado por propietario: cola 64 y AP sin timeout; historias finalizadas funcionalmente, sin modificar firmware.
- TCS-88/TCS-85: diez E2E Chromium sobre PostgreSQL descartable; cobertura de servidor, API y proxy 88,89% de líneas.
- TCS-59: cabeceras, CSP de scripts con nonce y DAST Baseline; aviso medio de estilos inline justificado, sin alertas altas en ese recorrido.
- Material personal de exposición retirado del árbol actual; se conserva fuera de Git.
- Aceptación profesional y ensayos físicos no realizados continúan pendientes.

## Candidato local — 21/11/2026

- TCS-85 / H3-RF12: especialista selecciona categorías y pictogramas visibles por niño sin borrar el catálogo; servidor protege permisos y evita dejar vacío el tablero explícito. Firmware v0.8.7 oculta categorías vacías y abre la única categoría al aplicar ese tablero; compilado, no instalado.
- TCS-85 / H3-RF13: fecha de inicio a cargo del especialista y observaciones docentes con lectura por autor/perfil e idempotencia. Migración aditiva probada solo en localhost.
- TCS-77/60/85: aprobación profesional y condición de adaptación registradas según las confirmaciones de Ignacio; las diez HU del Sprint 3 conservan separado su cierre técnico y publicación.
- Se corrigen cancelación de consultas y recarga de selección; pruebas ampliadas con reporte en `docs/pruebas/reportes/adaptacion-20261121/`. Sin commit ni despliegue de este candidato.
