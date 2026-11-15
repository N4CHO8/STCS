# Contrato de medios y capacidad — firmware v0.8.4

La fuente de límites es `frontend/src/lib/pictogramCatalog.ts`, coordinada con
`firmware/STCS_UI_Arduino/STCS_BoardConfig.h`. El máximo operativo probado es
180 activos: 45 por cada una de las cuatro categorías y cuatro por página.
Son doce páginas por categoría, con un elemento en la última. El tablero
inicial de Luis tiene 96: 24 por categoría y seis páginas. No interpretar doce
páginas como 48 elementos. Altas y cambios de categoría usan bloqueo de perfil
y validación del servidor; un exceso devuelve conflicto 409 sin guardar.

## Dispositivo

`GET /api/stcs/devices/{code}/config` exige `x-stcs-device-key` individual.
Devuelve `data.profile.id` (sin identidad o clínica) y los pictogramas asignados:
id, label, message, category, position, imageSha256, imageBytes, imageUrl,
audioStatus y, si está listo, audioSha256/audioBytes/audioUrl. Los límites son
31 bytes UTF-8 de nombre y 95 de frase. Las categorías válidas son Necesidades,
Emociones, Acciones y Lugares.

Los archivos de `/api/stcs/devices/{code}/media/{id}/{image|audio}?v={sha256}`
vuelven a comprobar dispositivo, asignación, estado activo y hash vigente.
Una URL no concede acceso por sí misma. No se redirige a URLs públicas de
Storage. Imágenes: RGB565 little endian, 96×96, exactamente 18.432 bytes.
Audio: WAV PCM mono, 16 kHz, 16 bits, hasta 10 segundos/320.044 bytes.
Transferencia chunked permitida: comprobar tamaño recibido y SHA-256, sin
confundir Content-Length ausente (-1) con un tamaño excesivo.

El adaptador TLS de v0.8.2 evita lecturas incompletas del core ESP32 3.0.2;
no deshabilita validación de certificados. La credencial de dispositivo no
puede invocar las rutas del trabajador ni obtener archivos de otros tableros.

## Portal y preparación de voz

Especialista y docente asignados crean/editan pictogramas y suben imágenes por
`POST /api/stcs/images`, multipart `image`; PNG/JPEG/WebP estáticos, hasta 2 MiB
y cuatro megapíxeles. El servidor normaliza imagen y elimina metadatos.
Apoderado puede consultar; administrador y adultos ajenos no reciben medios.
Los archivos privados permanecen en Supabase Storage; símbolos del catálogo
público no contienen datos infantiles.

`/api/stcs/pictograms/{id}/audio?status=1` devuelve estado
missing/pending/processing/ready/error. El audio se identifica por frase
normalizada y versión de voz, independientemente del nombre/imagen. Editar
frase invalida la voz anterior; la consulta con `v` obsoleto falla. Nunca se
reproduce otra frase como sustitución silenciosa. Hay reintento explícito.

Node reclama trabajos con lease SQL; Piper en función Python Vercel produce
el WAV y Node valida/persiste. Las claves de SQL, Storage y trabajador son solo
servidor. Las rutas internas no aceptan permisos de adulto o dispositivo.

## Memoria y recuperación

Caché combinada de 512 KiB y 48 archivos, reserva de 256 KiB para sistema;
recepción JSON de 256 KiB y copia compacta de 128 KiB. Voces bajo demanda y
expulsión LRU; no se promete un número fijo de voces offline. Máximo teórico
de 28 RGB sin audios en esa caché; tras reiniciar faltantes requieren red.
No equivale a 180 imágenes persistentes, aunque el tablero activo esté en RAM.
Un atlas sin pérdida de hasta 192 KiB forma parte de esa misma cuota de 512 KiB.
Cada bloque recuperado valida longitud y SHA-256. Si el conjunto de imágenes
cabe y se conserva, permite recuperarlo sin HTTP tras encender; si no, se usa
la recuperación progresiva. No cambia el formato RGB ni WAV de las API.
La lista y sus páginas siempre conservan todos los registros del tablero
guardado: una imagen ausente muestra descarga, no elimina el pictograma.
Los píxeles se incorporan progresivamente sin mover los registros ni borrar
selecciones; cambios reales de metadatos siguen esperando Borrar.

Metadatos y cola vinculados a URL/código/clave individual. Rotar clave al
reasignar hardware. No adoptar caché antigua sin binding ni enviar eventos de
otra configuración. Cola de 64 eventos; retirada solo tras ACK idempotente.
No se formatea automáticamente la partición. Antes de firmware, conservar
respaldo privado; jamás versionar binarios operativos ni dumps de memoria.

Resultados físicos, límites de la evidencia y recuperación detallada:
[CIERRE_STCS_20261115.md](CIERRE_STCS_20261115.md).
