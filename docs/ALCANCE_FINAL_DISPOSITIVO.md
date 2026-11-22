# Alcance del comunicador físico

Firmware instalado: v0.8.8-adaptive-board. Las decisiones de cierre del propietario del 16–17/11 conservan estas condiciones:

| Historia | Alcance entregado | Diferencia frente al criterio anterior |
| --- | --- | --- |
| TCS-74 | STCS-Config desde pantalla, clave local y portal móvil; activo hasta reinicio | Sin cierre automático a cinco minutos |
| TCS-76 | Cola LittleFS de 64 pendientes; ACK coincidente, reintento/idempotencia y rechazo al llenarse | 64, no 256 eventos |
| TCS-53 | Acceso y separación de ESP previamente configurados | Alta/rotación/reasignación web diferidas a FUT03 |

Los 64 son registros pendientes, no pictogramas. Al llenarse, una acción nueva puede no quedar registrada. La caché no garantiza todos los WAV offline; el autor observó ausencia de voz sin Wi-Fi y aceptó conservarla (L-01). El AP no tiene timeout; la zona táctil inferior sigue defectuosa.

Pantalla, voz conectada, reinicio, cola/cortes/ACK y configuración móvil están conformes según Ignacio. Dos ESP separados y varios computadores se probaron el 16/11. No hay conteos físicos, duración continua o instante exacto de corte instrumentados; la matriz móvil completa y una flota mayor siguen sin probarse. [Registro físico](pruebas/FISICAS_20261115.md), [multicliente](pruebas/MULTICLIENTE_20261116.md).

El ESP se demostrará en vivo en la defensa, sin anexos audiovisuales adicionales requeridos. La revisión profesional TCS-77 se realizó el 20/11 con alcance cualitativo; sus recomendaciones y comprobaciones posteriores están en el [registro final](pruebas/reportes/comprobacion-final-20261121/README.md). [Firmware](../firmware/STCS_UI_Arduino/README.md), [alcance A2](requerimientos.md), [estado de entrega](DEFENSA.md).
