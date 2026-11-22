# Comprobación final — 21 y 22/11/2026

Publicación de TCS-53/59/60/74/76/77/83/84/85/88. Publicación inicial el 21/11 y cierre de pruebas el 22/11, hora de Chile. Las marcas UTC se conservan en los registros.

- Publicación inicial de la aplicación: [6defc3b](https://github.com/N4CHO8/STCS/commit/6defc3b6e8bf847b7f17a650f15ba75d9e4154d2), [PR #17](https://github.com/N4CHO8/STCS/pull/17).
- CI: [Verify STCS 44972359096](https://github.com/N4CHO8/STCS/actions/runs/44972359096), aprobado sobre el head 7724d12 antes de integrar. Incluye dependencias, unitarias, TLS, Python, cobertura, build, tipos, API aislada y E2E Chromium.
- Vercel: `dpl_GBuujeawRYTPnrJTAPJvbXM4WK1U`, READY para ese main, [aplicación](https://0stcs0.vercel.app).
- Firmware final: v0.8.8-adaptive-board; 1.987.245 bytes de programa y 146.616 de RAM estática. Se escribió solamente app0, con hash verificado. El propietario confirmó arranque, categorías y Wi-Fi conectado; la aplicación de la selección y el audio se verificaron por separado.

El cierre posterior se integró por [PR #18](https://github.com/N4CHO8/STCS/pull/18), commit `f8b743f`, con [CI 45025353582](https://github.com/N4CHO8/STCS/actions/runs/45025353582) aprobado y Vercel `dpl_EW1rotBR4JWEwEk1jdSQyeEYGaqH` en READY. El tag `hito3` fija ese corte, incluido el firmware final. Los JSON conservan el SHA de la aplicación con la que se ejecutaron las solicitudes; no se reescriben como una ejecución posterior.

## Comprobaciones en producción

Las solicitudes se dirigieron a Vercel mediante Playwright y sus cookies HttpOnly, con las cuentas ficticias existentes. No se ejecutó verify:roles ni carga masiva sobre Supabase. Las pruebas negativas no concedieron acceso a otros perfiles. La fecha se restauró y la observación sintética se retiró usando su UUID, autor y contenido exactos.

| Caso | Esperado | Observado |
| --- | --- | --- |
| CF-01 | Login y consulta para especialista, docente y apoderado | HTTP 200 con el rol correcto; docente sin ficha sensible, diagnóstico ni progreso |
| CF-02 | Solo especialista modifica selección del tablero | Especialista guarda; docente y apoderado reciben 403 |
| CF-03 | Perfil no asignado rechazado; exportación autorizada disponible | HTTP 403 y CSV HTTP 200, respectivamente |
| CF-04 | Frase nueva preparada por Piper en nube | WAV RIFF válido de 72.118 bytes, listo en 4,97 s; sin proceso en el PC |
| CF-05 | Fecha válida guardada; fecha imposible y roles no autorizados rechazados | Especialista 200, fecha imposible 400, docente/apoderado 403; apoderado puede leer, docente no recibe el campo |
| CF-06 | Observación docente consultable por especialista, con envío repetido idempotente | Una observación tras dos envíos; especialista/apoderado no pueden crearla, apoderado no la recibe |
| CF-07 | Portal y créditos visibles sin errores de aplicación | Chrome con tres roles, sin pageerror ni respuestas 5xx; créditos ARASAAC visibles |

[Resultados HTTP](cloud-check-results.json) · [Seguimiento y navegador](cloud-follow-results.json). Las capturas de prueba y sesiones se conservan privadamente; no se publican cookies ni credenciales individuales.

## Confirmaciones físicas y de interfaz

El propietario confirmó el 22/11: editor «Adaptar el ESP a este niño» visible, guardado persistente tras recarga y catálogo conservado. En el ESP comprobó entrada directa a una única categoría con «Prueba final», imagen completa, voz «Quiero agua para la comprobacion final», Volver y acceso Wi-Fi. Después confirmó la misma imagen con la frase editada «Necesito beber agua en la prueba final».

La primera inspección visual mostró cuatro categorías. Tras reiniciar, la captura de arranque registró un pictograma en Necesidades y cero en las otras categorías; el propietario confirmó el resultado. No se atribuye una causa no demostrada ni se presenta la instrumentación de diagnóstico como una reparación funcional.

Con su administrador real, el propietario confirmó usuarios enumerados sin nombres, ficha clínica, diagnósticos, progreso ni controles de adaptación. [Confirmaciones y límites](confirmaciones-y-limites.json). Las comprobaciones API de los demás roles y las pruebas aisladas complementan esa revisión; no se accedió a su contraseña.

Se retiró únicamente el UUID del pictograma creado en este ensayo. El catálogo volvió a sus 97 registros iniciales. Según la instrucción previa del propietario se ocultaron, sin borrar, Inseguridad, Frustración y Entusiasmo hasta revisión profesional: la selección final tiene 94 visibles; el tablero de referencia de 96 se conserva como condición de las pruebas históricas, no como recuento fijo de la base actual.

## Base de datos y recuperación

Respaldo privado del esquema público en formato pg_dump: 155.442 bytes, 102 entradas verificadas con pg_restore --list; SHA-256 `2411678df14ae02c7677278ae7d32cfafc3122be0bf5df7b117ed3082e828932`. No incluye una prueba de restauración cloud ni el contenido de Auth/Storage.

Se aplicaron las migraciones aditivas `operation_audit` (20261122013901) y `board_selection_and_communication_observations` (20261122013902). Las dos tablas tienen RLS y SELECT denegado a anon/authenticated. No se ejecutaron seeds. El asesor de Supabase registró 16 avisos informativos de RLS sin políticas, esperados en tablas exclusivas del servidor, y una advertencia de [protección de contraseñas filtradas desactivada](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). No se activó facturación ni se cambió esa opción.

El respaldo completo actual del ESP tiene 16.777.216 bytes, firmware anterior identificado y tabla de particiones coincidente: [huella](respaldo-verificado.json). Los binarios y la memoria, que contienen configuración privada, quedan fuera de Git. Para recuperación, conservar las tablas aditivas y revertir la aplicación mediante PR o promoción del despliegue anterior; en el ESP restaurar app0 del respaldo sin borrar NVS, caché ni cola. Una restauración completa solo corresponde si es necesaria y se acepta recuperar también la configuración anterior.

## Caché de imágenes ARASAAC

La restauración del catálogo detectó que el atlas anterior de 192 KiB no podía guardar sus imágenes completas, aunque el tablero de 97 ya funcionaba en RAM. La versión final amplía solo el sublímite del atlas a 384 KiB: la caché total sigue en 512 KiB, con reserva de 256 KiB para metadatos/eventos. Los audios y el propio atlas continúan siendo expulsables. El límite de navegación no cambia.

Se observó primero el rechazo por presupuesto de compresión y después la falta de espacio para dos generaciones grandes. La corrección mantiene el paquete nuevo completo en PSRAM y permite expulsar la copia antigua como último recurso antes de guardar y validar la nueva. Si se corta la alimentación en esa ventana puede hacer falta descargar imágenes; los metadatos y la cola no se eliminan.

Resultado medido: 94 pictogramas visibles, 89 imágenes únicas, atlas de 305.992 bytes guardado y verificado; reemplazo en 4.603 ms. Antes del reemplazo, el arranque recuperó los 94 desde el atlas anterior, que contenía sus imágenes, en 496 ms. Estas cifras no son una garantía para cualquier catálogo de 180 o tamaño de WAV. [Telemetría sin identificadores de red](esp-telemetria-v088.txt).

## Alcance

Las pruebas nuevas complementan las [suites de laboratorio](../arasaac-20261121/README.md) y los [ensayos anteriores](../../FISICAS_20261115.md). No sustituyen una evaluación con niños, un ensayo de carga cloud ni una garantía de voz sin conexión. La revisión profesional sigue siendo cualitativa y los indicadores no medidos de A1 permanecen declarados.

## Reinicio final con alimentación independiente

El 22/11 Ignacio confirmó que, con el ESP conectado únicamente a un cargador USB de 5 V, los dibujos aparecieron sin esperar descargas, pudo recorrer las cuatro categorías y «Vaso nube» reprodujo «Necesito beber agua, por favor». No se cronometró este reinicio. La sincronización y la voz preparadas funcionan con Vercel/Supabase; el PC no ejecuta ningún servicio necesario para ese recorrido. La voz sin red conserva L-01.
