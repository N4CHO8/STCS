# Hito 3: imágenes y frases propias

**Actualización 15/11:** la preparación de nube y capacidad ampliada se documenta
en [CIERRE_STCS_20261115.md](CIERRE_STCS_20261115.md). El límite coordinado
ahora es 180 activos, 45 por categoría; la última página de doce tiene uno.
El propietario confirmó imágenes, navegación y muestras de voces distintas
de primera/última página en las cuatro categorías. No implica escuchar 180 WAV
en hardware ni conservarlos todos offline. El detalle de 32 y el estado local
siguientes son evidencia histórica del 13/11, no la configuración vigente.

Estado: implementación en la rama local `codex/hito3-medios-voz`. No publicada,
sin migraciones ni archivos nuevos en Supabase o Vercel. Las pruebas usan
PostgreSQL descartable y almacenamiento local independiente de producción.

## Decisión y alternativas

| Alternativa | Compatibilidad y memoria | Costo, latencia e internet | Decisión |
| --- | --- | --- | --- |
| Catálogo completo embebido | Funciona, pero obliga a recompilar y acumula archivos | Sin red al usarlo; mantenimiento alto | Retirado del nuevo firmware, salvo cuatro iconos de navegación |
| Descargar cada uso sin caché | Poco espacio; depende de la conexión | Espera en cada selección, no funciona sin servidor | Descartada |
| Metadatos SQL, archivos privados y caché acotada | RGB565 y WAV compatibles con el dispositivo real | Primera descarga necesita red; los archivos conservados funcionan sin servidor | Implementada |
| TTS del navegador | No genera una solución autónoma para este ESP | Simple, dependiente del navegador | Descartada como voz del dispositivo |
| TTS externo de pago | Requiere credenciales y convertir formatos | Costos/cuotas por proveedor | No necesario para el ensayo |
| Piper en un proceso CPU separado | Produce WAV compatible; no ocupa memoria de modelos en el ESP | Sin cuota de proveedor; necesita un equipo encendido para preparar frases nuevas | Implementada |

Se usa Piper 1.8.0 y la voz predeterminada española `es_ES-davefx-medium`.
El motor es GPL-3.0 y la ficha del modelo declara datos CC0. Revisar ambas
licencias antes de redistribuir motor/modelo. Los pesos se descargan fuera de
Git con SHA-256 fijado; el firmware recibe solo el resultado de audio.

Fuentes primarias: [Piper](https://github.com/OHF-Voice/piper1-gpl),
[API Python](https://github.com/OHF-Voice/piper1-gpl/blob/main/docs/API_PYTHON.md),
[modelo y ficha](https://huggingface.co/rhasspy/piper-voices/tree/main/es/es_ES/davefx/medium),
[Supabase Storage](https://supabase.com/docs/guides/storage).

## Recorrido implementado

1. Especialista o docente inicia sesión y selecciona un niño asignado.
2. El editor recibe nombre, categoría, frase e imagen nueva con vista previa.
3. La API comprueba sesión, rol y asignación, tamaño y contenido del archivo.
4. Normaliza la imagen, elimina metadatos y guarda PNG para la web y RGB565
   de 96 × 96 para el ESP. No hay rutas públicas de archivos subidos.
5. Al guardar el pictograma, una transacción asocia imagen y trabajo de voz.
   La clave es SHA-256 de voz versionada + frase normalizada; no depende del
   nombre ni de la imagen. Una frase repetida reutiliza el mismo audio.
6. El trabajador reclama trabajos con bloqueo SQL y concesión temporal,
   prepara WAV y devuelve archivo y concesión. La API valida formato y estado.
7. La interfaz muestra preparación, voz lista o error con reintento. Su
   reproductor usa el WAV preparado, no síntesis del navegador.
8. El ESP consulta su tablero asignado con una clave individual. Descarga
   imágenes, verifica tamaño y SHA-256 y las muestra desde PSRAM. El WAV se
   descarga cuando se pulsa Hablar; solo reproduce el hash de la frase vigente.
9. Editar la frase cambia la clave de voz. No se sustituye silenciosamente por
   audio de catálogo ni por una versión anterior. Los previews obsoletos fallan.
10. Crear, editar o previsualizar no inventa selecciones del niño. Los eventos
    físicos se confirman y retiran de la cola solo con ACK del identificador.

## Datos, permisos y límites

| Dato | Ubicación | Límite/condición |
| --- | --- | --- |
| Nombre, frase, categoría, asignación | `pictograms`, PostgreSQL | 32 activos; máximo 8 por categoría; límites UTF-8 compatibles con firmware |
| Identidad y pertenencia de imagen | `pictogram_images`, PostgreSQL | Máximo 64 subidas por perfil |
| PNG y RGB565 | Adaptador de archivos privado | PNG/JPEG/WebP estático de entrada, 2 MiB y 4 megapíxeles; salida RGB 18.432 bytes |
| Estado y clave de voz | `phrase_audio`, PostgreSQL | pending/processing/ready/error; concesión y hasta 3 intentos |
| Voz preparada | Adaptador privado, `audio/<clave>.wav` | PCM mono, 16 kHz, 16 bits; máximo 10 s y 320.044 bytes |
| Tablero recibido | LittleFS `/v7/board.json` | Solo asignados; no catálogo completo |
| Imágenes visibles | PSRAM | Hasta 32 × 18.432 bytes, más estructuras |
| Caché de archivos | LittleFS `/v7cache` | 512 KiB y 48 archivos; expulsión LRU, reserva de 128 KiB para cola/metadatos |
| Eventos pendientes | LittleFS `/v7queue` | 64 entradas; borrado tras ACK; identificador estable en reintentos |

El dispositivo inspeccionado es **Waveshare ESP32-S3-Touch-LCD-1.46**, con
16 MiB flash, 8 MiB PSRAM, pantalla/táctil SPD2010 y DAC PCM5101 I2S
(DOUT 47, BCLK 48, LRCK 38). USB sirve de alimentación; no se informa batería.
La partición `stcsdata` existente ocupa 960 KiB. El montaje nunca la formatea
automáticamente. El nuevo código utiliza nombres separados de los del firmware
instalado anteriormente.

Apoderados pueden consultar sus archivos; docentes y especialistas editan
solo tableros asignados. Administradores y adultos ajenos no reciben imágenes,
voz ni datos del niño por estas API. La clave del trabajador y los permisos de
Storage quedan en servidor, nunca en el ESP. HTTPS con raíces de confianza es
el valor predeterminado; HTTP se habilita explícitamente solo en el laboratorio.

**Sin servidor:** siguen disponibles los archivos que permanecen en caché.
No se garantiza disponer de todos los WAV sin haberlos reproducido, ni de las
32 imágenes tras reiniciar si juntas superan la cuota. Un archivo ausente se
indica como no disponible; la reconexión recupera imágenes faltantes aunque el
tablero no haya cambiado. La demostración debe precargar las frases necesarias.

## Laboratorio reproducible

No usar `.env.local` de la raíz: conecta a la base compartida. Preparar únicamente
el contenedor descartable de [PRUEBAS.md](PRUEBAS.md). Desde la raíz:

```powershell
python -m venv .codex-work/tts-env
.codex-work/tts-env/Scripts/python.exe -m pip install -r frontend/scripts/voice/requirements.txt
.codex-work/tts-env/Scripts/python.exe frontend/scripts/voice/download.py "$env:LOCALAPPDATA/STCS-tools/piper-voice"
cd frontend
npm ci
npm run test:prepare
npm run build
$env:STCS_TEST_ISOLATED='1'
$env:STCS_LAB_HOST='192.168.1.XX' # IPv4 privada de este equipo
node scripts/run-media-lab.mjs
```

El laboratorio sirve `http://127.0.0.1:3100`, comprueba identidad de la
base y no carga archivos `.env`. Genera secretos y configuración del ESP bajo
`%LOCALAPPDATA%/STCS-private`, fuera de Git, y ejecuta el trabajador de voz.
Usar las cuentas públicas sintéticas del README; el admin aislado se documenta
en el propio script y no es el administrador real. El modo de pruebas permite
filas ficticias explícitas; ningún login crea esquemas ni usuarios.

Para compilar sin credenciales reales:

```powershell
.\scripts\verify-firmware.ps1
```

Para un ensayo físico, `-SecretsFile` acepta la cabecera privada del laboratorio.
Nunca cargar la compilación de comprobación con clave ficticia como firmware
operativo. Conservar primero respaldo del dispositivo. Solo escribir la
partición de aplicación compatible; no borrar NVS, tabla, bootloader o datos.

## Configuración de una publicación futura

La migración aditiva `20261113215338_pictogram_media_audio.sql` crea dos tablas
con RLS, revoca acceso directo a clientes y añade `pictograms.audio_key` nullable.
Conserva rutas anteriores y registros; no convierte audios antiguos en voz nueva
sin preparación. Fue aplicada exclusivamente a la base descartable.

El adaptador local exige `STCS_MEDIA_DIR` persistente. No usar el disco efímero
de Vercel como almacén duradero. Para nube existe adaptador Supabase privado:
`STCS_MEDIA_STORAGE=supabase`, `SUPABASE_URL`, `STCS_MEDIA_BUCKET`,
`SUPABASE_SECRET_KEY` solo en servidor. La lectura conectada de `storage.buckets`
de STCS devolvió cero buckets: **no se creó ninguno ni se verificó carga real
por Storage**. Antes de publicar hay que preparar un bucket privado autorizado,
aplicar la migración revisada, configurar secretos y comprobar el adaptador.

El trabajador usa `STCS_WORKER_URL`, `STCS_MEDIA_WORKER_KEY` (aleatoria, mínimo
32 caracteres), `STCS_TTS_PYTHON` y `STCS_TTS_MODEL`. Ejecutar
`node scripts/media-worker.mjs --watch` en un equipo/servicio disponible cuando
se generen frases. Vercel no mantiene este proceso Python como demonio.
Si el trabajador está apagado, las voces listas siguen disponibles y las nuevas
permanecen pendientes. No se promete disponibilidad gratuita permanente.

Pendientes operativos: política de retención y limpieza de imágenes sin usar
(cuota 64 evita crecimiento por perfil; no hay botón para borrado definitivo),
almacenamiento/worker en nube y despliegue separado autorizado. No declarar
validación clínica por estas pruebas técnicas.

## Resultados de verificación — 13 de noviembre de 2026

| Comprobación | Resultado |
| --- | --- |
| Next.js build y TypeScript final | Pasaron |
| Prettier sobre TS/TSX/MJS cambiados | Pasó |
| Suite aislada de roles, medios y sesiones | 248 comprobaciones de integración pasaron |
| Base de datos inaccesible | 2 comprobaciones JSON 503 pasaron |
| Trabajador real contra API loopback con 503 inicial | Sobrevive y reconecta, sin crear trabajos ni archivos |
| Navegador, cuatro roles y cierre de sesión | Acceso y paneles comprobados; login sin credenciales; consola sin errores en el recorrido |
| Imagen subida, recarga y audio web | Comprobados con captura y WAV real preparado |
| Imagen propia y frase inicial en ESP | Confirmadas físicamente por el propietario |
| Cambio solo de frase y nueva voz en ESP | Confirmado, conservando imagen |
| Copia guardada con servidor inalcanzable desde el ESP | Imagen y frase nueva reproducidas; no equivale a probar Wi-Fi totalmente apagada |
| Carga de 32 imágenes asignadas | Sincronización de 32 confirmada por telemetría; descargas chunked con SHA válido |
| Expulsión de caché física | Observada; máximo 522.810 bytes, todas las muestras <= 524.288; baja de ocupación al expulsar |
| Firmware final, después de la carga | Propietario confirmó otra vez imagen y voz correctas |
| Restauración del ESP | Aplicación y stcsdata previas verificadas al escribir; serial v0.6.7-touch y conexión reciente confirmada por Supabase |
| Servicios existentes, solo lectura | Supabase accesible; tablas nuevas ausentes y buckets=0; Vercel READY sobre main cf0871796d54219e5283314d3cf897a399cf7b05 |

No hay ESLint configurado: no se presenta typecheck como lint. La revisión de
cambios no detectó errores de espacios (`git diff --check`). La suite primero
expuso un dato ausente en el nuevo fixture de prueba de posiciones; se corrigió
el fixture y se repitió la suite completa, con resultado aprobado.

El ensayo detectó errores reales que se corrigieron: cuerpos chunked rechazados
por exigir Content-Length; presión de memoria interna con tablero grande;
orden incorrecto de destrucción de clientes HTTP; y recuperación de imágenes
expulsadas con metadatos sin cambios. Las tres estructuras persistentes del
tablero ahora están en PSRAM. El build final usa 1.968.133 bytes de programa y
139.336 bytes de variables globales (antes 189.240). Con el tablero de 32, se
observó aproximadamente 91 KB de heap libre después de sincronizar. No se
observó panic en las capturas finales; esto no sustituye pruebas de larga duración.

Los 27 pictogramas de carga se retiraron del tablero **local**. Los registros
inactivos y sus archivos permanecen en el laboratorio descartable; la cuota
64 sigue aplicándose, por lo que para repetir muchas cargas se debe recrear
ese laboratorio. El contenedor con `--rm`/tmpfs pierde su base al detenerlo.
La persistencia comprobada es entre peticiones, sesiones y recargas, no un
respaldo del laboratorio para uso real.

Se restauró el ESP para que vuelva a la nube con su firmware anterior: las
funciones nuevas no quedan habilitadas en producción ni en ese firmware
restaurado. Una publicación futura necesita coordinar migración, almacenamiento,
trabajador, web y firmware v0.7.0 configurado con HTTPS y su clave individual.
Quedan sin comprobar: Storage real, reproducción v0.7.0 contra la nube, cortes
de energía durante escritura, funcionamiento prolongado y segundo ESP físico.
La validación profesional por Zoom sigue siendo una revisión del prototipo,
sin niños ni datos reales.

## Evidencia y guion para el informe

Capturas sintéticas en `docs/evidencias/hito3`:

- `01-editor-imagen-frase.jpg`: imagen subida, nombre y frase distintos.
- `02-pictograma-persistido-voz-lista.jpg`: persistencia tras recargar.
- `03-frase-editada-voz-lista.jpg`: misma imagen, frase nueva y voz lista.
- `04-login-sin-credenciales.jpg`: acceso normal sin cuentas expuestas.
- `05-docente-sin-clinica.jpg` y `06-admin-sin-identidad.jpg`: restricciones visibles.
- `vaso-demo.png/svg`: imagen original del ensayo, sin datos personales.
- `voz-frase-editada.wav`: audio real del servidor (59.488 bytes, mono 16 kHz/16 bits).
- `resultados-tecnicos.json`: resumen de telemetría y verificaciones, sin credenciales.

El propietario confirmó físicamente que el ESP mostró Vaso azul y pronunció
«Quiero tomar agua». Después confirmó la misma imagen con «Necesito beber
agua, por favor». Es evidencia física asistida por el usuario, distinta del
reproductor web y de pruebas HTTP automatizadas.

Guion de demostración (5–7 minutos): login normal; abrir Comunicación;
crear con imagen propia y frase corta; recargar; esperar voz lista; en ESP
Limpiar y esperar sincronización; elegir y Hablar; editar solo frase y repetir;
mostrar permisos de docente/apoderado/admin; explicar caché y pendientes.
Grabar pantalla y ESP juntos, con audio, usando datos sintéticos. El código
por sí solo no acredita calidad clínica, comprensión, usabilidad con niños,
seguridad eléctrica ni funcionamiento con un segundo dispositivo físico.

Estructura sugerida de presentación: problema y roles; arquitectura; recorrido
web→ESP con evidencia; privacidad y pruebas; caché/costos; límites y revisión
profesional por Zoom sin niños ni datos reales.
