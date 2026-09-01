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
        "id": "e0000000-0000-0000-0000-000000000001",
        "label": "Agua",
        "message": "quiero agua",
        "category": "Necesidades",
        "colorTone": "sky",
        "iconName": "Droplets",
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
  "actionLabel": "Selecciono: Agua",
  "pictogramId": "e0000000-0000-0000-0000-000000000001",
  "category": "Necesidades",
  "message": "quiero agua",
  "batteryLevel": 85,
  "firmwareVersion": "v0.1.0",
  "wifiSsid": "MiWifi"
}
```

## Comandos de prueba sin dispositivo

Estos comandos permiten validar la integracion usando la API desplegada o local.

```powershell
curl.exe -H "x-stcs-device-key: <clave>" https://tu-dominio.vercel.app/api/stcs/devices/STCS-ESP32-001/config
```

```powershell
curl.exe -X POST https://tu-dominio.vercel.app/api/stcs/devices/STCS-ESP32-001/events `
  -H "Content-Type: application/json" `
  -H "x-stcs-device-key: <clave>" `
  -d "{\"eventType\":\"pictogram_selected\",\"actionLabel\":\"Selecciono: Agua\",\"pictogramId\":\"e0000000-0000-0000-0000-000000000001\",\"category\":\"Necesidades\",\"message\":\"quiero agua\",\"batteryLevel\":85,\"firmwareVersion\":\"v0.1.0\"}"
```

## Flujo definido

1. La web administra pictogramas y categorias.
2. Supabase almacena la configuracion del tablero.
3. El ESP32 descarga la configuracion por Wi-Fi.
4. El nino selecciona pictogramas en pantalla tactil.
5. El ESP32 envia eventos a la API.
6. La API guarda eventos en Supabase.
7. La web muestra historial, metricas y progreso.
