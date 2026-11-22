# Adaptación del comunicador y seguimiento — 21/11/2026

Este reporte conserva el estado del ensayo local del 21/11. Los pendientes de publicación y hardware aquí descritos se resolvieron después; consultar la [comprobación final del 21–22/11](../comprobacion-final-20261121/README.md). Sus datos originales no se reescriben como una ejecución posterior.


Candidato local sobre `ebfc605`, con cambios sin publicar. [Versiones, recuentos y hashes](metadatos.json). Producción y el ESP instalado se conservaron.

## Cambios comprobados

- El especialista asignado elige categorías y pictogramas visibles por niño. Ocultar no elimina el catálogo. Docente, apoderado y admin no cambian esa selección; una edición no puede dejarla sin pictogramas.
- La fecha de inicio la registra el especialista y la consulta el apoderado. Se rechazan fechas inválidas o futuras; docente/admin no la reciben.
- El docente envía observaciones de comunicación al especialista y consulta solo las propias. Se comprobaron otro autor, otro perfil, roles prohibidos y reintentos sin duplicados.
- El firmware candidato oculta categorías vacías y abre los pictogramas de la única categoría al aplicar ese tablero. Volver conserva acceso al inicio/Wi-Fi. Esta parte está compilada, todavía no probada físicamente.

## Resultados de la ejecución final

| Comprobación | Resultado | Evidencia y alcance |
| --- | --- | --- |
| Node y TLS | 12 unitarias + 1 integración TLS: 13 aprobadas | [JUnit](unitarias-tls.xml); validaciones, selección, sesión y rechazo TLS del adaptador PostgreSQL |
| API y resiliencia | 387 comprobaciones aprobadas; dos fallos de base tratados con JSON 503 y trabajador que reconecta | [Salida de la herramienta](integracion-cobertura.txt). Una suite, no 387 casos independientes |
| Navegador | 19 recorridos Chromium y 19 WebKit aprobados, sin omitidos | [Chromium](chromium.xml), [WebKit](webkit.xml). UI → API → PostgreSQL; incluye roles, selección persistida/restaurada, fecha, observación entre cuentas, imágenes, CSV, errores y sesiones |
| Cobertura | 90,05 % líneas; 78,16 % ramas; 97,58 % funciones | [Resumen](cobertura/coverage-summary.json), [medición](cobertura/metadatos.json). Alcance de servidor declarado; no UI, firmware o Python |
| Voz Python | 8 pruebas aprobadas | [Resultado](voz-python.txt); autorización, configuración fija, integridad y respuestas. No reproduce voz en hardware ni acredita Vercel actualizado |
| Carga | p95 56,47/58,07 ms, 0 errores; 830/1542 peticiones | [Datos](carga-local.json). Etapas de 5/10 clientes durante 15 s, perfil mínimo sin pictogramas; no capacidad cloud |
| Seguridad | 13 comprobaciones autenticadas; 0 altos, 1 medio y 1 informativo | [ZAP pasivo](seguridad-autenticada.json). Permanece CSP `style-src unsafe-inline`; no es un pentest activo ni una revisión exhaustiva de todos los estados |
| Tabla de observaciones | RLS activo y sin lectura directa de anon/authenticated | [Consulta local](permisos-tabla.json). No aplicada aún en Supabase |
| Recuperación | SQL y tres medios sintéticos restaurados en base nueva; selección, fecha y observación coinciden | [Reporte](recuperacion.json). Destino y fixtures eliminados; WAV silencioso y archivos locales, sin restauración de producción |
| Tipos y formato | TypeScript y Prettier conformes | Comandos sobre los archivos modificados; el proyecto no define un script lint |
| Build web | Aprobado | [Salida](compilacion-web.txt) |
| Firmware | v0.8.7-adaptive-board compila con claves ficticias | [Salida](compilacion-firmware.txt): 1.986.613 bytes de programa y 146.616 bytes estáticos. No es una medición de RAM durante uso |

## Fallos encontrados y tratamiento

WebKit detectó consultas activas durante recarga y salida. Se añadieron cancelación de peticiones y actualización de la selección confirmada sin recargar todo el portal (D16). También se eliminó el `refresh` inmediatamente posterior al login, que podía reiniciar la primera sección elegida (D17). El recorrido entre docente y especialista se repitió verificando la identidad de la sesión, además de los controles visibles.

La suite ampliada compartía el contador de login entre escenarios y algunas acciones no esperaban la navegación final. Se aislaron únicamente los contadores de las cuentas ficticias en la base localhost confirmada y se sincronizaron las acciones con estados de interfaz. No se desactivó el límite de intentos de la aplicación ni se omitieron los errores de consola. Los intentos fallidos y sus trazas se conservan en privado; los XML enlazados corresponden a la ejecución final.

## Repetición y pendientes

Usar el [procedimiento de aislamiento](../../../PRUEBAS.md), nunca la conexión habitual de desarrollo que comparte producción. La preparación local incluye la migración aditiva `20261121120000_board_selection.sql`. Ejecutar unitarias/TLS, `test:coverage`, build/tipos, `test:isolated`, `test:e2e` en ambos motores, escaneo y recuperación. Compilar firmware con `scripts/verify-firmware.ps1`, sin cargarlo para esta revisión.

**CP-ADAPT-P01, planificado y no ejecutado:** instalar el candidato cuando se autorice y comprobar en un entorno controlado una categoría con pocos pictogramas, varias categorías, frase/voz, Volver/Wi-Fi, reinicio y restauración de la selección completa. El propietario pidió conservar hoy el ESP: no se presenta la compilación o una respuesta de API como prueba física.

También faltan migraciones/despliegue autorizados, comprobación de la voz nueva en Vercel (D15) y acceso/CI/tag finales. Las aprobaciones de pertinencia del [registro profesional](../../../validacion/REGISTRO.md) no convierten en medidos los indicadores externos ni acreditan eficacia con niños. El límite operativo anterior de 180/45 no se amplió ni se volvió a medir en hardware.
