# Arreglos locales y verificación — 16/11/2026

**Sin commit, push, despliegue ni migración en producción.** Main publicada continúa en `ebfc605`. Estos cambios quedan en el computador por instrucción del propietario hasta la revisión profesional. Los resultados nuevos no sustituyen ni vuelven a fechar los reportes históricos.

## Conservación tras el apagado

Se encontraron los once archivos modificados y el registro multicliente no versionado de la sesión anterior. Todavía no existía implementación de CSV o aprovisionamiento web en esos cambios. Se preservó un parche anterior y copias privadas en `%LOCALAPPDATA%/STCS-private/antes-arreglos-20261116`. Los respaldos privados de firmware siguen presentes; no se escribió memoria del ESP.

El puerto enumerado es COM7. No hubo mensajes durante la lectura serial de seis segundos; no se atribuye una versión nueva por esa inspección. El propietario confirmó categorías y «Wi-Fi conectado» después del apagado. La prueba con dos ESP del mismo día mantiene su origen de [confirmación del ejecutor](MULTICLIENTE_20261116.md).

## Implementación

| Jira | Cambio y resultado local | Pendiente de cierre |
| --- | --- | --- |
| TCS-83 | Filtros de contexto, tipo, dispositivo y fechas UTC sobre el historial completo; CSV del conjunto filtrado, no de la página visible | Revisar, aplicar migración aditiva y publicar después de la autorización final |
| TCS-83/59 | Solo especialista/apoderado asignado; consultas parametrizadas, instantánea SQL, aprobación revalidada y bloqueada durante exportación; alias estables y auditoría de generación | Confirmar funcionamiento en nube tras publicar; no afirmar que ya está disponible allí |
| TCS-85/84 | Mayor contraste de textos/botones, foco visible de teclado, formulario de login inactivo hasta hidratarse; 401 de solicitudes protegidas retira datos de la misma pestaña y notifica a otras | Prueba manual en iPhone 17/Safari confirmada por el propietario; publicación pendiente. WebKit automatizado se registra por separado |
| TCS-59 | Negativos TLS/RLS, DAST pasivo autenticado y prueba anónima de lectura en Supabase | Conservar riesgo residual; no presentar como pentest exhaustivo |
| TCS-88 | Sonda de carga con fixture propio y limpieza; respaldo/restauración en base nueva y recuperación de archivos sintéticos | Publicación/CI del commit final; recuperación real de Supabase/Storage y flota no ensayadas |
| TCS-53 | Se documentó el estado físico vigente y se verificó el código del dispositivo | En la revisión del 16/11 el ciclo web completo seguía pendiente. Ajuste posterior del propietario, 17/11: TCS-53 completada para ESP previamente configurados; alta por posesión, rotación y reasignación web se difieren a FUT03, sin implementarse ni ensayarse. Los parámetros API/código/clave del firmware actual son compilados |

CSV: hasta **10.000 eventos y 3 MiB**; al exceder devuelve conflicto y pide acotar filtros, sin truncar silenciosamente. Las fechas de filtro son UTC, con día final inclusive y orden estable. No se exportan nombres, apellidos, diagnóstico, autor ni payload bruto. Acción/contexto son texto de comunicación y podrían contener información personal: el archivo es seudonimizado, no anónimo, y solo se entrega a responsables autorizados.

Cada celda se entrecomilla y neutraliza prefijos de fórmula, incluyendo espacios y variantes de ancho completo. No se garantiza seguridad después de transformar o volver a guardar el CSV con otro programa. La auditoría registra el actor, perfil, filtros, cantidad y fecha de generación; no acredita que el destinatario abrió el archivo. Se conserva mientras existan actor/perfil; sus borrados aplican la cascada definida en la migración.

## Pruebas y evidencia

Los archivos de esta ejecución se reúnen en [reportes/arreglos-locales-20261116](reportes/arreglos-locales-20261116/manifest.json). Identifican el commit base y el árbol con cambios sin commit; el manifiesto incluye huellas de los archivos de implementación. No se atribuyen al CI de main.

| Comprobación | Esperado | Resultado |
| --- | --- | --- |
| Unitarias y TLS | Validar entradas, CSV y clasificación de riesgos; ignorar 401 obsoletos/abortados; rechazar certificado no confiable con el adaptador PostgreSQL real | 11 aprobadas, incluyendo 1 TLS |
| API/PostgreSQL aislado | Roles, asignaciones, medios, sesiones, filtros completos y CSV; rechazar rangos inválidos, acceso ajeno y exceso de filas/bytes; vacío válido; fechas UTC | 319 comprobaciones aprobadas; incluye roles públicos sobre tablas pobladas con permisos de lectura concedidos solo dentro de la transacción de prueba y luego revertidos |
| Caída DB / trabajador | JSON 503 y reconexión sin caída definitiva | 2 comprobaciones y reconexión aprobadas |
| Cobertura del servidor | ≥70 % de líneas en módulos, API, proxy y contratos incluidos | 89,58 % líneas; 75,87 % ramas; 97,52 % funciones. Excluye UI, firmware y Python |
| Chromium | Recorridos y negativos de interfaz/API, CSV y 401 real | 16 aprobados |
| WebKit automatizado | Mismos recorridos en otro motor | 16 aprobados; no Safari/iPhone físico |
| Accesibilidad automatizada | Reglas WCAG A/AA seleccionadas y teclado en las secciones disponibles para cuatro roles | Sin infracciones detectadas en los escenarios examinados; no certifica accesibilidad total ni pertinencia clínica |
| Carga local | p95 ≤2 s, errores <1 %; 5 y 10 clientes, 15 s por etapa | 775/1490 peticiones, cero errores; p95 52,64/55,32 ms. Un perfil sin pictogramas: no es volumen de producción ni capacidad de flota |
| Recuperación aislada | Base nueva, relaciones y hashes de PNG/RGB/WAV iguales | Conforme; destino y fixtures propios eliminados. WAV silencioso sintético: prueba integridad, no voz Piper |
| ZAP autenticado | Respuestas permitidas/prohibidas de cuatro roles y anónimo; inspección pasiva de HTTP/activos | 13 verificaciones, 0 avisos altos; 1 medio `style-src unsafe-inline` y 1 informativo. No se ejecutaron ataques activos |
| Safari físico, laboratorio aislado | Menú, cambio de dos perfiles y descarga CSV | Conforme según Ignacio, iPhone 17/Safari; sin versión de sistema ni adjuntos |
| Dependencias | Sin vulnerabilidades conocidas en el análisis disponible | npm audit: 0 detectadas; no demuestra ausencia de vulnerabilidades desconocidas |
| Supabase publicado, solo lectura | Validar clave anónima y comprobar que no puede obtener filas | 14 tablas protegidas: cero filas o denegación por permisos. Solo GET de identificadores; no se seleccionaron identidades ni se modificaron datos |

Build, revisión de tipos y formato se verificaron localmente. Main ahora exige PR además de verify y mantiene la regla para administradores; no exige otro revisor (0 aprobaciones obligatorias), lo que no equivale a aceptación del stakeholder. Sprint 3 quedó activo con inicio aproximado 26/10 y término previsto 23/11; las 44 HU tienen etiquetas MoSCoW/requerimiento. La versión publicada y las cuentas reales no se modificaron. El laboratorio temporal se detuvo y su base quedó sin usuarios, eventos ni registros de auditoría. La configuración privada local se comparó con su copia y quedó restaurada con el mismo contenido.

## Defectos encontrados durante esta revisión

- Los filtros antiguos solo actuaban sobre 100 elementos visibles: ahora coinciden consulta y exportación completas.
- Textos claros y algunos botones no alcanzaban el contraste mínimo examinado: se oscurecieron y se evitó interpolar opacidad al habilitarlos.
- WebKit permitió observar la pérdida de un correo introducido antes de que React estuviera preparado: el formulario ahora espera hidratación.
- El nuevo camino de exportación podía dejar datos visibles tras un 401: se añadió invalidación de sesión común, protegida contra respuestas de un login anterior o solicitudes abortadas.
- Consultas de voz pendientes durante una recarga podían producir errores en WebKit: ahora se cancelan al salir y se reinician al volver desde la caché del navegador.
- La sonda de carga dependía de una cuenta creada fuera del procedimiento: ahora crea y retira únicamente sus UUID ficticios.

## Reproducir sin datos reales

Desde el contenedor descartable y la preparación de [PRUEBAS](../PRUEBAS.md), usar `STCS_TEST_ISOLATED=1` y `STCS_TEST_DB=stcs_release_tests`. Nunca apuntar los runners de escritura a Supabase.

```powershell
cd frontend
$env:STCS_TEST_ISOLATED='1'
$env:STCS_TEST_DB='stcs_release_tests'
npm ci
npm run test:prepare
npm run test:unit
npm run test:security
npm run build
npm run typecheck
npm run test:isolated
npm run test:load
npm run test:recovery
$env:STCS_E2E_JUNIT='../.codex-work/repeticion-e2e.xml'
npm run test:e2e
$env:STCS_E2E_BROWSER='webkit'
npm run test:e2e
Remove-Item Env:STCS_E2E_BROWSER
npm run test:dast
```

`test:recovery` requiere el contenedor local llamado `stcs-audit-tests` y una base de laboratorio sin usuarios preexistentes; crea un destino de nombre aleatorio y solo elimina el que acaba de crear. `test:dast` requiere Docker Desktop y puerto local 8099 libre. Las credenciales de la sonda/ZAP son efímeras y no se escriben en sus reportes.

Para repetir la inspección remota **solo de lectura**, ejecutar `STCS_VERIFY_CLOUD_READONLY=1` con `node scripts/verify-cloud-readonly.mjs`. El script comprueba el proyecto exacto, valida primero la clave pública mediante Auth y nunca usa una clave secreta ni hace POST. Un rechazo de la raíz REST no demuestra una clave inválida; las denegaciones PostgreSQL se interpretan por su código, no solo por el estado HTTP.

## Revisión manual del autor

`npm run review:local`, con el modo aislado explícito, abre un laboratorio en puerto 3400 accesible por la red local. Crea cuentas temporales y dos perfiles ficticios; no se conecta al ESP real, no envía correo ni prepara voz cloud. Los accesos se guardan en `.codex-work/review-access.json`. Ctrl+C retira los fixtures del laboratorio.

Comprobar desde celular y, si se dispone, Safari real: acceso, menú sin desbordamiento, cambio de perfil, filtros y descarga CSV. En computador: Tab/Shift+Tab con foco visible y controles utilizables. Registrar navegador/modelo, esperado, observado y evidencia. Ignacio confirmó el 16/11/2026 que pudo navegar, cambiar entre los dos perfiles ficticios y descargar el CSV en iPhone 17 con Safari. Es un resultado informado por el ejecutor, sin instrumentación ni adjuntos; no se proporcionó versión de iOS/Safari ni duración. No acredita pruebas manuales de teclado, zoom o todos los filtros. La evidencia visual la añadirá el propietario.

Antes de publicar: revisar el cambio, respaldar el destino y aplicar **solo** `20261116214529_operation_audit.sql`, que agrega auditoría privada; no ejecutar preparación de laboratorio, seeds ni recreación de tablas en producción. Publicar mediante PR, comprobar CI/despliegue y recorrido cloud. Una reversión de aplicación conserva la tabla de auditoría; no borra sus registros. Tag final y aceptación profesional siguen pendientes.

Referencias de seguridad: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security), [CSV Injection de OWASP](https://owasp.org/www-community/attacks/CSV_Injection), [errores de PostgREST](https://docs.postgrest.org/en/v14/references/errors.html).
