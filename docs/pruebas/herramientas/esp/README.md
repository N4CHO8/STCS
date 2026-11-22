# Repetir PC-01 y PC-02

Herramientas del ensayo, adaptadas para recibir las rutas del equipo como parámetros. Los resultados del 18/11 se conservan [por separado](../../reportes/esp-20261118/README.md); ejecutar estos scripts crea una nueva ejecución, no reproduce sus tiempos exactos.

## Preparación

Requiere el entorno [aislado](../../../PRUEBAS.md), Arduino CLI y dependencias del [firmware](../../../../firmware/STCS_UI_Arduino/README.md), Python con cryptography y pyserial, Piper y su modelo. Iniciar únicamente PostgreSQL localhost:55432 y preparar stcs_release_tests. No cargar archivos de variables de producción. Antes de tocar el ESP, respaldar sus 16 MiB y verificar el hash; conservar también la imagen instalada.

Desde la raíz del repositorio, definir una carpeta privada nueva y la IP LAN del computador:

```powershell
$env:STCS_ESP_LAB_DIR=Join-Path $env:LOCALAPPDATA 'STCS-private/ensayo-esp-nuevo'
$env:STCS_ESP_PORT='COM7' # comprobar el puerto del equipo
$env:STCS_LAB_HOST='192.168.1.87' # sustituir por la IP LAN propia
python docs/pruebas/herramientas/esp/preparar.py $env:STCS_LAB_HOST
```

La preparación copia el sketch fuera de Git, añade una CA de ensayo a las raíces y marcadores de versión/UI. No cambia `begin_request`. Genera certificados y claves privadas solo en la carpeta de ensayo. Compilar esa copia con las opciones del README del firmware; no usar el sketch original como destino. Cargar únicamente la app de ensayo en app0, con respaldo y recuperación preparados.

## Servidores y captura

En terminales separadas, con las variables anteriores y el entorno de prueba:

```powershell
# Desde frontend, iniciar API real y Piper sobre la base local
node --import ./scripts/test-typescript.mjs "$env:STCS_ESP_LAB_DIR/lab.mjs"

# Desde la raíz, proxy TLS y captura; no abrir otro monitor del mismo puerto
node docs/pruebas/herramientas/esp/proxy.cjs
python docs/pruebas/herramientas/esp/capturar_serial.py
```

Comprobar `/api/health`: debe indicar `127.0.0.1:55432/stcs_release_tests`. El proxy empieza con certificado no confiable. Registrar al menos dos rechazos y cero peticiones HTTP. Cambiar solo el certificado escribiendo `trusted` en `tls-mode.txt` dentro de la carpeta privada; exigir como control positivo peticiones reales y tablero aplicado. Los dos servidores usan la misma IP/puerto 3444; no alterar producción ni instalar la CA en el sistema del usuario.

## Medición

Desde frontend, ejecutar cada muestra después de la anterior. Mantener la frase vacía para permitir aplicar el tablero:

```powershell
node --import ./scripts/test-typescript.mjs ../docs/pruebas/herramientas/esp/medir.cjs cold 1
# Repetir cold 2 y cold 3; comprobar y escuchar cada frase, después Borrar
node --import ./scripts/test-typescript.mjs ../docs/pruebas/herramientas/esp/medir.cjs warm 1
# Repetir warm 2 y warm 3
```

El script edita mediante la API real y espera el marcador serie con imagen y voz preparada. No incluye la subida previa de imagen ni el tiempo humano hasta pulsar Hablar. La primera reproducción descarga voz bajo demanda; conservar también los eventos `audio_requested` y `stream ready` y la confirmación de lo oído.

## Cierre

Restaurar y verificar el respaldo antes de volver al uso habitual, y confirmar tablero, Wi-Fi y voz. Detener API, trabajador, proxy y captura; retirar solo el contenedor descartable creado para el ensayo. No publicar `.bin`, claves, cabeceras privadas, certificados privados ni volcados. Publicar únicamente reportes revisados sin secretos. Una repetición futura debe guardar sus propias versiones, fechas, condiciones y resultados.
