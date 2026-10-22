# Integracion ESP32 - Plataforma Web STCS

Este documento define el contrato minimo para conectar el dispositivo ESP32-S3 con la plataforma web STCS.

## Variables necesarias

La API del dispositivo usa una clave privada para evitar que cualquier cliente externo envie eventos.

```text
STCS_DEVICE_API_KEY=<clave-privada-del-dispositivo>
```

En Vercel esta variable debe agregarse como Environment Variable. En el firmware se debe configurar el mismo valor mediante `STCS_DEVICE_API_KEY`.

## Descargar configuracion del tablero

El ESP32 solicita los pictogramas activos asociados a su codigo de dispositivo.

```http
GET /api/stcs/devices/STCS-ESP32-001/config
x-stcs-device-key: <clave-privada-del-dispositivo>
```

Respuesta esperada:

```json
{
  "message": "Configuracion del dispositivo obtenida correctamente.",
  "data": {
    "device": {
      "code": "STCS-ESP32-001",
      "name": "Comunicador Mateo",
      "status": "connected"
    },
    "profile": {
      "displayName": "Mateo Rojas"
    },
    "pictograms": [
      {
        "id": "caa00000-0000-4000-8000-000000000001",
        "label": "Agua",
        "message": "Quiero agua",
        "category": "Necesidades",
        "colorTone": "sky",
        "iconName": "Droplets",
        "imagePath": "/pictograms/water.png",
        "position": 1
      }
    ]
  }
}
```

## Enviar evento desde el dispositivo

Cuando el nino seleccione un pictograma, el ESP32 enviara un evento a la API.

```http
POST /api/stcs/devices/STCS-ESP32-001/events
Content-Type: application/json
x-stcs-device-key: <clave-privada-del-dispositivo>
```

Body:

```json
{
  "eventType": "pictogram_selected",
  "externalEventId": "esp32-001-000045",
  "pictogramId": "caa00000-0000-4000-8000-000000000001",
  "context": "Sala de clases",
  "occurredAt": "2026-10-18T14:30:00-03:00",
  "category": "Necesidades",
  "message": "quiero agua",
  "batteryLevel": 85,
  "firmwareVersion": "v0.3.0-wifi",
  "wifiSsid": "MiWifi"
}
```

El firmware tambien puede enviar `pictogramLabel` junto con `category` cuando no
disponga del UUID. La API resuelve el pictograma activo del perfil y guarda su
UUID real:

```json
{
  "eventType": "pictogram_selected",
  "externalEventId": "esp32-001-000046",
  "pictogramLabel": "Agua",
  "category": "Necesidades",
  "context": "Sala de clases"
}
```

`externalEventId` identifica una interaccion local. Si el dispositivo reintenta el
mismo envio por una interrupcion Wi-Fi, la API responde con el evento existente y
no crea un duplicado.

## Comandos de prueba sin dispositivo

Estos comandos permiten validar la integracion usando la API desplegada o local.

```powershell
curl.exe -H "x-stcs-device-key: <clave>" https://tu-dominio.vercel.app/api/stcs/devices/STCS-ESP32-001/config
```

```powershell
curl.exe -X POST https://tu-dominio.vercel.app/api/stcs/devices/STCS-ESP32-001/events `
  -H "Content-Type: application/json" `
  -H "x-stcs-device-key: <clave>" `
  -d "{\"eventType\":\"pictogram_selected\",\"actionLabel\":\"Selecciono: Agua\",\"pictogramId\":\"caa00000-0000-4000-8000-000000000001\",\"category\":\"Necesidades\",\"message\":\"Quiero agua\",\"batteryLevel\":85,\"firmwareVersion\":\"v0.3.0-wifi\"}"
```

## Flujo definido

1. La web administra pictogramas y categorias.
2. Supabase almacena la configuracion del tablero.
3. El ESP32 descarga la configuracion por Wi-Fi.
4. El nino selecciona pictogramas en pantalla tactil.
5. El ESP32 envia eventos a la API.
6. La API guarda eventos en Supabase.
7. La web muestra historial, metricas y progreso.

## Configuracion inicial de WiFi

El USB se utiliza solamente para guardar la red en la memoria NVS del ESP32:

1. Abrir `Dispositivos` en Chrome o Edge.
2. Escribir el nombre y la clave de una red WiFi de 2.4 GHz.
3. Pulsar `Guardar WiFi en el ESP32` y seleccionar el puerto de la placa.
4. Esperar hasta 30 segundos para la primera sincronizacion.

La clave se envia directamente desde el navegador al puerto USB y no se guarda
en la plataforma. Despues de este paso, el ESP32 consulta la configuracion cada
15 segundos y envia los eventos directamente por HTTPS. Cambiar de seccion,
cerrar el navegador o usar la web desde otro computador no corta la conexion.

El catalogo de la web se limita a las mismas imagenes ARASAAC compiladas en el
firmware. Cada categoria admite hasta ocho pictogramas en dos paginas de cuatro.
En el ESP32 se cambia de pagina deslizando hacia la izquierda o la derecha. El
texto, la frase y el color se pueden editar; la imagen se elige del catalogo compatible.
