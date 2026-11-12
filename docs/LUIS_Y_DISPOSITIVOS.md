# Luis y acceso remoto al comunicador

Luis es el perfil de demostración actual con un ESP físico. No es una persona
real. Sus tres accesos demo se muestran en /demo con contraseñas simples
distintas. La actividad procede del equipo; no se generan diagnósticos ni
eventos simulados.

## Relación entre niño, dispositivo y adultos

Cada ESP tiene un código único y pertenece a un perfil infantil interno. Las
cuentas adultas acceden a ese perfil mediante asignaciones verificadas en el
servidor. Un especialista puede tener varios perfiles; cada apoderado solo uno;
el docente accede a sus asignados sin ficha clínica ni métricas. El niño no
inicia sesión en el portal adulto. El administrador ve Usuario N, sin identidad
infantil, informes ni eventos.

Los tres adultos usan correos ficticios y contraseñas públicas de demostración
distintas, visibles en /demo. La copia del propietario en
`%LOCALAPPDATA%/STCS-private/accesos-prueba01.json` se actualiza con estas claves.
Los secretos del hardware y los accesos personales del administrador siguen
siendo privados.

Las cuentas no necesitan activación porque conservan en la base la marca
is_private_test de su creación, presentada ahora como demo con ESP. Esa
excepción no depende del correo, de un dato enviado por el
cliente ni de una propiedad del JWT. Las cuentas reales siguen verificando su
correo y las nuevas asignaciones clínicas conservan aprobación independiente.

El servidor y restricciones de base separan tres entornos: datos reales,
demos públicas y pruebas privadas. Ninguna cuenta puede cambiar su entorno
desde la app ni convertirse desde una prueba en administrador. Tener un ID o
URL de otro perfil no concede acceso. Las cuentas antiguas de Alex y Luna se
retiraron de producción; sus fixtures solo se conservan en pruebas locales.

## Consulta desde otro computador

1. Mantener el ESP alimentado por USB; este equipo no tiene batería instalada.
2. Conectar el ESP a Internet mediante Wi-Fi. La configuración desde el celular
   utiliza su portal local `192.168.4.1`; esa IP no es el servidor de STCS.
3. Abrir https://0stcs0.vercel.app desde cualquier computador e ingresar con una
   de las cuentas de demostración asignadas, disponibles en /demo.
4. Abrir Dispositivo. La app consulta la nube y actualiza la disponibilidad cada
   15 segundos mientras la pantalla esté visible. No requiere USB, Web Serial,
   estar en la misma red local ni dejar encendido el computador original.

El trayecto que debe estar operativo es ESP → Wi-Fi → API de STCS → Supabase →
navegador autenticado. La vista distingue equipo asociado sin sincronización,
sin señal reciente y en línea; no inventa una conexión ni batería al 0 %.
Solo muestra estado reciente cuando la nube ha recibido comunicación del ESP.

## Estado y preservación

Se vinculó `STCS-ESP32-001` al perfil privado Luis y se declaró alimentación
USB. Los eventos anteriores conservan el perfil histórico al que pertenecían;
no se trasladaron a Luis. La demo antigua de Alex y Luna se retiró tras
respaldar sus datos sintéticos. Luis conserva su historial y su dispositivo.
El administrador real se conserva.

La conexión física depende además de alinear el servidor y credencial del
firmware instalado v0.6.7-touch, cuyo fuente no está en el repositorio. Cambiar
el vínculo en Supabase no corrige por sí solo un HTTP 503 o una URL incorrecta.
El estado en vivo solo se acepta después de recibir un evento auténtico y
comprobarlo desde otra sesión; no se sustituye esa prueba por un evento
fabricado desde un script.

### Inspección del firmware recuperado — 12 de noviembre de 2026

Se leyó la memoria completa de 16 MiB usando esptool 5.6.0 y se conservó fuera
del repositorio, en `%LOCALAPPDATA%/STCS-private/esp-backup-luis-20261112.bin`.
El respaldo contiene secretos de red y hardware: no se publica ni se adjunta
a incidencias. SHA-256 del archivo:
`c0e8e3811a7399d2f731ecce74c4c5cacbc632eb90351aee9e017afbab26f73a`.

La imagen instalada v0.6.7-touch apunta a
`https://stcs-hito3-ensayo.vercel.app`. Una consulta autenticada de configuración
respondió 503 allí; la misma credencial fue rechazada con 401 en producción.
También usaba el código `STCS-ENSAYO-S3-01`, diferente del vínculo actual.
Por tanto, había que corregir destino, credencial y código del equipo.
La lectura no recupera el código fuente ni convierte el firmware en una
compilación reproducible.

El sistema LittleFS del respaldo contiene 19 eventos pendientes de la prueba
anterior. No deben atribuirse a Luis. Se preparó, solo sobre una copia local,
su conservación en `queue-before-luis` y la separación del tablero anterior,
dejando vacía la cola nueva. La configuración Wi-Fi está en otra partición y
no se modifica en esa preparación.

Con autorización del propietario se cargó una imagen del programa con el
destino actual, código `STCS-ESP32-001` y clave individual nueva. esptool validó
checksum, SHA-256 y las escrituras; se mantuvieron las instrucciones y los
literales compartidos que no pertenecen a estos ajustes. Es una reparación de
una imagen recuperada, no una reconstrucción desde fuente. La nueva clave se
registra únicamente como hash en la base. No se cambió la partición NVS de
Wi-Fi, el cargador ni la tabla de particiones.

El propietario confirmó que pantalla, tacto y reproducción de Agua siguen
funcionando. Se recibió un `board_synced` auténtico en Luis, con firmware
v0.6.7-touch y origen `esp32-device`. Durante la primera comprobación también se
resguardaron nueve eventos previos a la alineación del código, separados de los
19 históricos. Ninguno se reasignó a Luis.

La inspección posterior detectó una incompatibilidad del contrato de respuesta:
el firmware consulta el booleano `ack.accepted` y compara
`ack.externalEventId` con el evento enviado antes de retirarlo de su
cola. La API debe confirmarlo solo después de guardar o recuperar un duplicado
ya persistido, conservando el identificador externo. Sin esa confirmación,
reintentaba el primer evento e impedía enviar las selecciones siguientes. La
suite aislada comprueba esa confirmación tanto en altas como en duplicados y
que una petición inválida no se confirme. La selección real de Agua debe
comprobarse en la nube después de publicar esta corrección.

Para incorporar otro ESP se requiere código y credencial propios, otro perfil
privado y asignaciones explícitas de sus responsables. No se deben compartir
claves de hardware ni trasladar historiales entre niños. La suite local prueba
dos perfiles y dos dispositivos, pero no acredita un segundo equipo físico
que aún no está disponible.

## Mantenimiento explícito

La migración `20261112164531_private_device_profiles.sql` añade separación de
pruebas privadas y fuente de alimentación; no abre acceso público a tablas.
El aprovisionamiento inicial autorizado se ejecuta una sola vez y nunca desde
login, build ni arranque:

```powershell
cd frontend
node scripts/provision-private-profile.mjs
node scripts/provision-private-profile.mjs --apply --project-ref mvdjzjwidygmhvhfcpgg
```

Sin `--apply` muestra el plan. Al repetir, no cambia contraseñas, asignaciones,
fichas ni tableros existentes; ante un conflicto de cuenta o vínculo revierte
la operación. Las credenciales permanecen fuera del repositorio.
