# Cierre técnico del 15 de noviembre de 2026

Estado: publicación en preparación. La rama de trabajo es
`codex/hito3-medios-voz`; no confundir una URL de ensayo de Vercel con la
promoción de `main` al dominio público. Las comprobaciones finales y la carga
HTTPS del ESP siguen pendientes mientras se completa el ensayo de capacidad.

## Interfaz del ESP

Hablar está arriba en la pantalla principal. En categorías, la fila superior
es Volver — Hablar — Borrar. Las flechas están a los lados; también se conserva
el deslizamiento. Cada página crea solo cuatro botones LVGL. Las imágenes se
escalan completas conservando proporción, con una zona separada para etiquetas.
La frase permanece abajo como lectura y se conserva al cambiar páginas y
categorías; Borrar es explícito. Los nombres largos se ajustan al espacio.

El cambio evita controles esenciales en la zona táctil inferior defectuosa.
**No repara el hardware.** El propietario confirmó visualmente la distribución,
el tacto, las imágenes y la navegación en el equipo físico.

## Capacidad y condiciones de ensayo

Placa física: Waveshare ESP32-S3-Touch-LCD-1.46, flash 16 MiB, PSRAM 8 MiB,
SPD2010 y PCM5101. Ensayo en LAN con PostgreSQL descartable, imágenes sintéticas
numeradas distintas y alimentación USB. No se cargan registros masivos ni se
fabrican eventos en la base de producción.

| Etapa | Páginas por categoría | Resultado físico asistido |
| --- | --- | --- |
| 64, 16 por categoría | 4 | Confirmados navegación, imágenes, frase y audio |
| 128, 32 por categoría | 8 | Confirmados recorrido y voz |
| 160, 40 por categoría | 10 | Confirmados recorrido y voz |
| 180, 45 por categoría | 12, última con uno | Confirmados recorrido completo y muestras de voces propias de primera/última página de cada categoría |

La primera pasada reutilizó deliberadamente una frase en los pictogramas de
carga. Por observación del propietario, se amplió el ensayo: se verificaron
180 imágenes distintas y 180 claves de frase, todas con WAV listo en servidor.
Los audios suman 16.505.980 bytes, de 34.224 a 110.386 bytes cada uno. El
propietario confirmó las voces correspondientes a sus números en primera y
última página de las cuatro categorías. No se afirma haber escuchado los 180
audios en hardware ni conservarlos todos sin conexión. Se observaron descargas
de WAV diferentes, caché de 501.860 bytes/7 archivos y posteriormente
479.108 bytes/5 archivos: hubo expulsiones y recuperación bajo demanda.

La etapa de 184 fue rechazada explícitamente por `capacity_guard`, con un
presupuesto de 8.486.912 bytes frente a 8.388.608 disponibles. El propietario
confirmó que el tablero anterior de 180 siguió navegable y con voz. Después se
retiraron únicamente las cuatro filas de carga añadidas en el laboratorio.
El límite final coordinado en web/API/firmware es **180, 45 por categoría**.
Doce páginas no habilitan 48 elementos por categoría.

Por solicitud posterior, el tablero de nube inicial se prepara con **96 activos,
24 por categoría, seis páginas**. Se preservan los 22 existentes y se añaden 74
del catálogo. Sus imágenes públicas usan símbolos Lucide bajo ISC, con licencia
incluida; no son fotos privadas ni un vocabulario clínicamente validado.
El catálogo se genera con `node scripts/generate-additional-pictograms.mjs`.
`node scripts/prepare-luis-six-pages.mjs` muestra el plan sin aplicarlo;
`--apply` requiere ejecución explícita y usa el API del especialista asignado.
Comprueba el entorno sintético y Luis, conserva registros y no crea eventos.
La web muestra límite y ocupación, previene categorías llenas y el servidor
serializa altas concurrentes para hacer cumplir el mismo máximo.

Los registros de 160 muestran unos 5.041.400 bytes de PSRAM libre y un bloque
mayor de 2.359.284 bytes tras sincronizar. Con 180 se observaron unos 4.017.072
bytes libres y un bloque mayor de 1.933.300 bytes. Son muestras, no mínimos
continuos. Una actualización de 180 reutilizó 180 imágenes desde RAM en unos
613–625 ms, sin redescargarlas. El firmware final añade mínimo de PSRAM durante
la construcción; sus mediciones se incorporarán después de cargarlo.

No se ha demostrado el límite físico absoluto. La admisión reserva dos
generaciones de imágenes para cambiar tablero sin invalidar selecciones,
384 KiB de estructuras, 256 KiB de recepción JSON y 1 MiB para audio y margen.
Con imágenes RGB565 de 96×96 (18.432 bytes), 180 requieren 8.339.456 bytes de
este presupuesto y 184 superarían los 8 MiB. Este cálculo es una protección,
no una prueba física de estabilidad.

## Persistencia y funcionamiento sin conexión

- Caché combinada de imágenes y WAV: 512 KiB, hasta 48 archivos, expulsión LRU.
- Reserva de sistema: 256 KiB para metadatos compactos, cola y temporales.
- JSON recibido: 256 KiB; copia compacta persistente: 128 KiB.
- Cola: 64 eventos, con ACK e identificador idempotente.
- PCM mono 16 kHz/16 bits, hasta 10 s y 320.044 bytes por WAV.

Con solo imágenes caben como máximo 28 archivos RGB de 18.432 bytes dentro de
512 KiB; audios y otros archivos reducen esa cantidad. Las imágenes del tablero
activo se conservan en PSRAM durante la sesión. Después de reiniciar sin red
solo aparecen las imágenes que queden en flash; las ausentes se recuperan al
reconectar. No se promete un número fijo de voces offline: depende de sus WAV.
No se guardan permanentemente todas las voces para ampliar el catálogo.

La nueva copia de metadatos se vincula mediante SHA-256 a URL, código y clave
individual. Las colas tienen un directorio propio de esa configuración. Así,
pasar del laboratorio a la nube no envía eventos del ensayo como si fueran de
Luis ni muestra su tablero anterior. No se adoptan metadatos antiguos sin esta
vinculación; la primera carga necesita red. Reasignar hardware exige rotar la
clave individual. Las colas históricas se conservan, no se importan ni borran.

## Arquitectura de nube comprobada

Next.js autentica sesión vigente, rol y asignación antes de servir medios.
PostgreSQL conserva pertenencia, frases, claves por frase/versión de voz y
concesiones temporales de trabajos. Supabase Storage guarda PNG, RGB565 y WAV
en `stcs-media`, privado, con tope de 2 MiB por objeto. RLS está habilitado y
las tablas de medios no tienen SELECT para anon/authenticated.

Piper 1.8.0 se ejecuta en `frontend/api/voice.py`, una función Python de Vercel,
con modelo español y configuración de SHA-256 fijado. Solo recibe frase y voz;
no recibe credenciales SQL o Storage. El servidor Node reclama un trabajo,
invoca la función con una clave técnica, valida el WAV y lo persiste en Storage.
`after()` prepara trabajos al guardar o consultar estado; existe reintento
visible y una ruta de mantenimiento autenticada para recuperar trabajos.
No se necesita un proceso de voz permanente en el computador del propietario.

Se comprobó síntesis real en Vercel, preparación de las 21 frases existentes de
Luis y creación controlada de «Vaso nube» con imagen propia y voz lista.
La imagen devuelta por la API rechazó acceso anónimo con 401. No se considera
todavía verificado el recorrido final dominio público → ESP hasta completarlo.

No se activó facturación. Aplican cuotas y cambios de condiciones de Vercel,
Supabase y descargas del modelo. No se garantiza gratuidad permanente ni SLA.
El arranque en frío del modelo y la primera descarga del catálogo necesitan red
y pueden tardar; el ensayo de 180 copió 160 imágenes y descargó 20 en 59,6 s.

## Seguridad y recuperación

La migración aditiva `20261113215338_pictogram_media_audio.sql` se aplicó tras
respaldar PostgreSQL y restaurar ese respaldo en una base local descartable.
Se conservaron los 65 pictogramas existentes y las cuentas/asignaciones.
No se ejecutó seed ni inicialización de datos durante el login.

Los respaldos y cabeceras operativas están fuera de Git, en
`%LOCALAPPDATA%/STCS-private`. Hay respaldo completo del ESP previo a publicación
y copia privada de app0 y stcsdata. Nunca publicar binarios operativos ni dumps.
Para recuperar: detener monitor serie, verificar el manifiesto privado y sus
hashes, restaurar app0 a 0x10000 y, solo si corresponde, stcsdata a 0xf00000.
No cambiar tabla de particiones, bootloader ni NVS. Una restauración de base de
producción requiere revisar escrituras posteriores; no sobrescribirla ciegamente.

El despliegue público anterior se conserva como rollback mientras se ensaya la
nueva versión. Las migraciones son aditivas y no deben borrarse para revertir
solo la aplicación. Las credenciales SQL, Storage y trabajador permanecen en
servidor. El ESP recibe únicamente su credencial individual.

## Guion Hito 3 y límites

1. Explicar los cuatro roles y entrar como especialista de prueba.
2. Crear un pictograma con imagen, nombre y frase diferentes; recargar.
3. Esperar voz lista, sincronizar ESP, seleccionar y reproducir.
4. Editar solo la frase, volver a sincronizar y comprobar nueva voz/imagen igual.
5. Mostrar nombres/orientaciones del docente y la ausencia de clínica;
   contrastar con apoderado y administrador numerado.
6. Explicar capacidad operativa, caché acotada y conexión por Wi-Fi sin USB de datos.

Grabar pantalla y dispositivo con audio, usando exclusivamente datos ficticios.
Pendientes de validación externa: revisión del profesional por Zoom, uso con
niños, segunda unidad física, duración prolongada y cortes durante escritura.
Las pruebas técnicas no acreditan eficacia clínica ni seguridad eléctrica.

## Verificación automatizada del candidato

Build Next.js, TypeScript y formato de archivos modificados aprobados; no hay
script ESLint configurado. Auditoría npm de producción: cero vulnerabilidades.
En PostgreSQL descartable `stcs_release_tests`, servidor localhost:3200:
291 comprobaciones de roles/privacidad/medios/concurrencia aprobadas, dos de
caída de base aprobadas y reconexión del trabajador real ante 503 aprobada.
Las rutas internas de mantenimiento rechazan anónimo, docente y administrador.
Firmware v0.8.1 compilado con 1.956.209 bytes de programa y 146.512 bytes de
variables globales. Compilar no acredita carga ni conexión física HTTPS.
