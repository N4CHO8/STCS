# Pictogramas ausentes después de reiniciar — v0.8.3

## Fallo confirmado y alcance

El propietario informó que, alimentando el ESP de nuevo, cambiaban los
pictogramas visibles y no aparecían todos en cada categoría. Imágenes y voces
disponibles funcionaban correctamente. No era una pérdida de registros en nube.

El tablero compacto guarda todos los registros, pero la caché combinada de
512 KiB conserva solo parte de sus archivos. En v0.8.2 la interfaz omitía
`!source.image_data` al construir categorías: una imagen fuera de caché quitaba
también el pictograma, reducía el contador y cambiaba las páginas. Al variar la
caché por uso, el subconjunto cambiaba en cada arranque.

Además, un fallo individual durante la recuperación online descartaba toda la
generación descargada. Con una caché menor que el tablero, eso podía obligar
a descargar otra vez imágenes que ya se habían recibido.

## Corrección

- La pertenencia a categorías, orden, etiquetas y paginación dependen de los
  metadatos completos. Los 96 actuales conservan 24 por categoría y seis páginas
  aunque sus imágenes aún se estén recuperando.
- Una imagen ausente tiene un símbolo de descarga y su nombre; no se muestra
  otro dibujo ni se elimina la tarjeta. Se controlan esos casos tanto en los
  botones como en las miniaturas de la frase, sin desreferenciar punteros nulos.
- Se limpian los descriptores del registro anterior antes de reemplazarlo,
  evitando reutilizar imágenes de memoria liberada.
- Si falla una imagen, se conserva la generación parcial. El siguiente intento
  copia píxeles ya cargados desde RAM y reintenta faltantes, en lugar de perder
  todo el progreso. El estado técnico distingue `partial` y `ready`.
- Los píxeles verificados se incorporan progresivamente al tablero activo.
  La tarea de red copia memoria bajo mutex; solo el bucle principal actualiza
  LVGL. No se comparten propietarios ni se liberan imágenes aún en uso.
  Cada dibujo aparece al llegar, manteniendo categoría, página y frase.
  No se repinta durante una pulsación o reproducción, ni por una imagen de
  otra categoría que no esté en la frase visible.
- Se distingue entre píxeles nuevos y metadatos nuevos. Si id, nombre, frase,
  categoría, posición y hashes coinciden, se consumen las imágenes pendientes
  sin borrar la frase; esto permite reintentar faltantes incluso con selecciones
  activas. Duplicados entrantes se liberan y solo se adoptan buffers ausentes.
  Un cambio real de frase/tablero sigue esperando Borrar para aplicarse.
- Solo el tablero completamente aplicado emite `board_synced`, una vez.

No se modificaron audios, imágenes originales, cuentas, asignaciones, base de
datos ni límites. Siguen 45 por categoría y 180 en total. No se amplió flash ni
se promete guardar 96 imágenes offline: se conserva el catálogo completo y
se recuperan sus archivos faltantes por Wi-Fi.

## Respaldo y verificación

Antes de escribir se leyó el flash completo de 16.777.216 bytes, fuera de Git:
`%LOCALAPPDATA%/STCS-private/esp-before-board-restart-fix.bin`.
SHA-256: `457c64fb4bf45bf72ad46bbf6a136118a09020904a9a726d9d71c41a56bcc6b2`.
Se conserva también el binario operativo v0.8.2 para recuperar app0 si fuera
necesario; no se modifican NVS, tabla de particiones ni datos persistentes.

v0.8.3-complete-board final compilado: 1.980.721 bytes de programa y 146.552 globales.
La escritura de app0 pasó la verificación de esptool. Binario operativo privado
SHA-256: `5a1f498cace56fe81e3db667592e8706f41c7de5a25dd3bc5392193e1f91962a`.
El monitor permite `STCS_BOARD`, con cantidades por categoría y número de
imágenes disponibles; no registra credenciales ni nombres infantiles.

En la primera prueba, el propietario confirmó tarjetas visibles con símbolo de
descarga. La captura serie mostró páginas 1/6, 2/6 y 3/6 con 24 elementos antes
de completar imágenes. También se observó una generación parcial de 95/96:
se conserva como evidencia de recuperación, no se declara completa.
El propietario confirmó el refresco progresivo sin volver al inicio y la
conservación de la frase mientras llegaban imágenes. La captura completa llegó
a 96/96, sin reducir los 24 registros de cada categoría. La mejora posterior
de persistencia y reinicio se documenta en [ARRANQUE_RAPIDO_ESP_20261115.md](ARRANQUE_RAPIDO_ESP_20261115.md).
No se afirma que todas las imágenes estén descargadas solo por ver seis páginas.
No se indujo deliberadamente una caída de red.
