# Resultados y defectos

Resultados de software ejecutados en laboratorio aislado y CI. Último CI de referencia: [main 22fa385](https://github.com/N4CHO8/STCS/actions/runs/43925021420), [PR #15](https://github.com/N4CHO8/STCS/pull/15), diez E2E aprobados. [Manifiesto de herramientas y revisiones](reportes/cierre-20261116.json).

| Nivel/caso | Esperado | Observado y evidencia | Alcance |
| --- | --- | --- | --- |
| Unitarias CP-RF03-U01–04, CP-RNF01-U01, CP-RF05-U01–02 | Válidos aceptados e inválidos rechazados | 7/7, [JUnit](reportes/unitarias-cierre.xml) | Validadores reales |
| Integración | Roles, sesiones, asignación, informes, medios y concurrencia coherentes | 291 comprobaciones, CI y manifiesto | API/PostgreSQL descartable |
| Resiliencia DB | Error JSON 503 y recuperación del trabajador | 2 checks y reconexión aprobados | Fallos acotados del servidor |
| Navegador | Recorridos completos y negativos, sin errores críticos JS/CSP | 10/10 Chromium en CI; [JUnit histórico](reportes/e2e.xml) | Sesión, roles, CRUD/imagen, duplicados, 401, error/reintento, móvil y logout |
| Cobertura | ≥70% de líneas del alcance de servidor | 88,89% de líneas, 74,4% ramas, 97,39% funciones; [reporte](reportes/cobertura-negocio/coverage-summary.json) | Incluye API/proxy/módulos declarados y archivos no ejecutados; excluye UI, C++ y Python |
| Regresión CP-RF03-U02 | Detectar retirar el límite UTF-8 | Fallo detectado en copia temporal; [registro](reportes/regresion.json) | No se modifica la fuente real |
| Carga CP-RNF02-L01/L02 | p95 ≤2 s, errores <1% | 63,48/69,42 ms con 5/10 clientes, cero errores; [datos](../calidad/carga-local.json) | Local, 15 s/etapa; no capacidad cloud |
| Seguridad CP-RNF01-S01 | Analizar y tratar hallazgos | ZAP: 0 altos, 1 medio residual; npm sin vulnerabilidades conocidas; [análisis](../calidad/README.md) | Baseline pasivo sin autenticación |
| Físicas PF-01–07 | Navegación, imagen/voz conectada, sincronización, cola y recuperación | Conformes informados por Ignacio para el 15/11; [registro](FISICAS_20261115.md) | Un ESP; anexos, conteos y duración exacta pendientes |
| Aceptación profesional | Tareas/indicadores y aprobación externa real | No realizada; correo enviado | [Protocolo](../validacion/PAUTA.md), TCS-77 |

## Defectos y tratamiento

| ID | Hallazgo | Tratamiento y resultado |
| --- | --- | --- |
| D01 | Tarjetas ausentes al reiniciar | PR #7: metadatos separados y atlas; reinicio con cargador confirmado |
| D02 | Descarga HTTPS/chunked incompleta | PR #6: lectura y hash/tamaño corregidos; recorrido cloud confirmado |
| D03 | Menú Wi-Fi ausente tras reorganizar UI | PR #9: configuración móvil restaurada y confirmada |
| D04 | Tactilidad inferior defectuosa | Controles superiores/laterales; mitigación confirmada, defecto físico vigente |
| D05 | ACK incompatible en firmware recuperado | PR #2/#3: ACK explícito e idempotencia; PF-05 informado conforme, trazas pendientes |
| D06 | Sin prueba negativa UTF-8 | Caso real y regresión controlada incorporados |
| D07 | Cabeceras de seguridad ausentes | CSP con nonce y anti-frame; ZAP repetido, excepción de estilos inline documentada |
| D08 | E2E de sesión competía con redirección | PR #15: transporte sincronizado y 401 real; PR y main aprobados. [Registro](CORRECCION_E2E_SESION_20261116.md) |
| L-01 | Sin Wi-Fi no hubo voz | Limitación aceptada, no corregida; no se garantiza voz offline |

Los incidentes de selector de test, limpieza de fixtures y mapas de cobertura se resolvieron en la infraestructura; no se cuentan como defectos clínicos. Los [resultados iniciales](../historico/pruebas/RESULTADOS_INICIALES_20261116.md) y registros de publicación conservan su fecha y versión.

No se calcula un porcentaje global mezclando aserciones, recorridos, etapas y personas. La meta ≥95% del plan integral requiere reconciliar casos y aceptación pendiente. Varios ESP, Safari/teléfonos reales, seguridad autenticada ampliada y mediciones externas siguen fuera de lo acreditado.
