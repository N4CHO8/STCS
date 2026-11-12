# Luis y acceso remoto al comunicador

Luis es un perfil privado de prueba con un ESP físico. No es una persona real,
no usa las credenciales públicas de demostración y su actividad empieza vacía:
no se generaron eventos ni diagnósticos simulados.

## Relación entre niño, dispositivo y adultos

Cada ESP tiene un código único y pertenece a un perfil infantil interno. Las
cuentas adultas acceden a ese perfil mediante asignaciones verificadas en el
servidor. Un especialista puede tener varios perfiles; cada apoderado solo uno;
el docente accede a sus asignados sin ficha clínica ni métricas. El niño no
inicia sesión en el portal adulto. El administrador ve Usuario N, sin identidad
infantil, informes ni eventos.

Los tres adultos de esta prueba usan correos ficticios y contraseñas privadas
distintas, guardadas exclusivamente para el propietario fuera de Git:
`%LOCALAPPDATA%/STCS-private/accesos-prueba01.json`. No se incluyen contraseñas
en esta documentación ni en `/demo`.

Las cuentas no necesitan activación porque están marcadas en la base como
prueba privada. Esa excepción no depende del correo, de un dato enviado por el
cliente ni de una propiedad del JWT. Las cuentas reales siguen verificando su
correo y las nuevas asignaciones clínicas conservan aprobación independiente.

El servidor y restricciones de base separan tres entornos: datos reales,
demos públicas y pruebas privadas. Ninguna cuenta puede cambiar su entorno
desde la app ni convertirse desde una prueba en administrador. Tener un ID o
URL de otro perfil no concede acceso. Las cuentas públicas no pueden consultar
a Luis.

## Consulta desde otro computador

1. Mantener el ESP alimentado por USB; este equipo no tiene batería instalada.
2. Conectar el ESP a Internet mediante Wi-Fi. La configuración desde el celular
   utiliza su portal local `192.168.4.1`; esa IP no es el servidor de STCS.
3. Abrir https://0stcs0.vercel.app desde cualquier computador e ingresar con una
   de las cuentas privadas asignadas, usando la credencial conservada por el
   propietario.
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
no se trasladaron a Luis. Los accesos demo públicos y las cuentas existentes no
se reemplazaron. El administrador real se conserva.

La conexión física depende además de alinear el servidor y credencial del
firmware instalado v0.6.7-touch, cuyo fuente no está en el repositorio. Cambiar
el vínculo en Supabase no corrige por sí solo un HTTP 503 o una URL incorrecta.
El estado en vivo solo se acepta después de recibir un evento auténtico y
comprobarlo desde otra sesión; no se sustituye esa prueba por un evento
fabricado desde un script.

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
