# Alcance final del comunicador físico

Decisión del propietario del 16/11/2026: se conserva el ESP terminado con
firmware v0.8.6-wifi-status. Se actualiza la especificación en Jira para
describir la implementación entregada, sin atribuir pruebas no ejecutadas.

| Historia | Criterio anterior | Alcance aceptado | Estado |
| --- | --- | --- | --- |
| TCS-74 | AP individual temporal y cierre automático a cinco minutos | STCS-Config activada desde pantalla, clave local y portal móvil; permanece activa hasta reinicio | Finalizada funcionalmente |
| TCS-76 | Cola de 256 eventos | Cola persistente LittleFS de 64; ACK e idempotencia; rechazo explícito en la función al llenarse | Finalizada la implementación |

La aceptación del propietario modifica el alcance; no se presenta como
aprobación externa del Hito 3. Las confirmaciones de pantalla, acceso móvil,
imagen/voz y reinicio se conservan en WEB_Y_WIFI_20261115 y ARRANQUE_RAPIDO.
No se carga firmware nuevo en este encargo.

## Límites y comprobaciones separadas

- Los 64 son registros pendientes, no pictogramas ni exactamente 64 acciones.
  Si la cola se llena, nuevas acciones pueden no quedar registradas. No se
  promete una desconexión ilimitada sin pérdida de registros.
- La caché es limitada: no se garantiza conservar todos los WAV offline.
- STCS-Config no se cierra automáticamente y la instalación actual no acredita
  una política de claves individuales para una flota.
- Cola llena, cortes durante escritura, pérdida de ACK, matriz de móviles y
  varias placas físicas siguen siendo cobertura pendiente en TCS-60/TCS-85.
- TCS-77 y la aceptación clínica no se cierran por esta decisión técnica.
