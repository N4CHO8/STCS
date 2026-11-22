# Sincronización y TLS del ESP

Pruebas PC-01/02 ejecutadas el 18/11/2026. Una unidad física, firmware temporal derivado de v0.8.6 y laboratorio aislado. [Resultados de herramienta](resultados.json), [mediciones](measurements.jsonl), [serie](serial.jsonl) y [servidor TLS](server.jsonl). No se publican firmware, claves, certificados privados ni copias de flash.

## Qué se midió

Desde el inicio del PUT real de edición hasta recibir el marcador de aplicación en la UI del ESP, con imagen disponible y voz preparada según el catálogo. El reloj es el del PC en ambos extremos; la recepción serie puede añadir retardo. No se mide el instante físico de encendido de cada píxel ni el sonido por micrófono. La carga de imagen se realizó antes del PUT.

El laboratorio utilizó la API Next.js y el trabajador Piper reales, PostgreSQL local y un proxy HTTPS por la Wi-Fi. No mide latencia de Vercel/Supabase en Internet ni un tablero de 180 elementos. Había cuatro pictogramas ficticios y se cambió el primero.

| Condición | Intento | Guardado API (ms) | Hasta aplicar tablero (s) |
| --- | --- | --- | --- |
| Recursos nuevos | 1 | 22 | 10.611 |
| Recursos nuevos | 2 | 14 | 11.410 |
| Recursos nuevos | 3 | 13 | 13.841 |
| Recursos reutilizados | 1 | 16 | 16.889 |
| Recursos reutilizados | 2 | 16 | 10.020 |
| Recursos reutilizados | 3 | 17 | 7.836 |

Mediana con recursos nuevos: **11,410 s**; con recursos reutilizados: **10,020 s**. Rango total: **7,836–16,889 s**. Los seis cambios se aplicaron con imagen y frase vigentes. El autor confirmó las tres frases nuevas y la última reutilización en pantalla y altavoz; no se atribuye una audición manual independiente de las otras dos reutilizaciones.

La voz se descarga bajo demanda: preparada en el catálogo no significa ya descargada al pulsar Hablar. Los registros separan pulsación de preparación del decodificador. Son tiempos técnicos adicionales, no una medición acústica; la exactitud de lo oído se apoya en las cuatro confirmaciones del autor.

## Interpretación del criterio anterior de quince segundos

**No se garantiza ≤15 s: cinco de seis muestras cumplieron ese valor y una tardó 16,889 s.** El intervalo de consulta y el procesamiento siguen influyendo aunque los recursos existan. La medición es válida para documentar el comportamiento, pero no se marca el KPI histórico como cumplido. El plan actual pedía coincidencia y tiempos descriptivos; una futura meta exigirá otro ensayo tras revisar polling/preparación y repetir en producción controlada. No se cambió el firmware productivo para ocultar el resultado.

## TLS

El ESP realizó tres conexiones con certificado emitido por una CA no confiable. El servidor registró tres cierres TLS y **cero peticiones HTTP** en esa fase. Al cambiar solo el certificado en la misma IP/puerto por uno firmado por la CA de ensayo configurada, llegaron peticiones autorizadas y se sincronizó el tablero. Esto descarta una simple falta general de conectividad como explicación.

La función `begin_request` de la copia ensayada es idéntica a la original. La copia conserva las raíces originales y añade una CA de laboratorio; utiliza otra URL y una clave ficticia. Se añadieron únicamente marcadores de versión y tiempo. No es un ataque a producción, ni una prueba de todos los certificados, DNS o redes posibles.

## Recuperación

Se leyó el respaldo completo antes de escribir. Su app coincidió con la imagen guardada v0.8.6. El respaldo completo de 16 MiB se restauró con salida 0 y hash verificado por esptool. La inspección serie identificó v0.8.6-wifi-status y HTTP 201; el autor confirmó Wi-Fi, seis páginas y la voz habitual de Vaso nube. [Registro de restauración](restauracion.txt), [inspección serie](restauracion-serie.json). API, trabajador, proxy y contenedor descartable del laboratorio se detuvieron; los eventos ficticios no se enviaron a producción.

[Herramientas para repetir](../../herramientas/esp/README.md), [plan previo](../../CIERRE.md), [catálogo](../../CASOS.md), [límites](../../../riesgos.md).
