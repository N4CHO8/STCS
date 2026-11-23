# Comprobaciones para el cierre

Plan fijado el 18/11/2026, antes de las dos comprobaciones siguientes. No reemplaza los resultados históricos ni vuelve a marcar como pendientes las pruebas físicas ya confirmadas.

| Caso | HU / criterio | Qué se hará | Resultado esperado | Estado |
| --- | --- | --- | --- | --- |
| PC-01 Sincronización medida | TCS-48.CA01, TCS-60.CA01 | Tres cambios nuevos y tres reutilizados mediante API real, Piper y ESP físico por HTTPS LAN | Coincidencia exacta sin recompilar; tiempos por condición | Ejecutado 18/11: 6/6 aplicados; 7,836–16,889 s. KPI histórico ≤15 s: 5/6, no garantizado |
| PC-02 TLS del ESP | TCS-59.CA02 | Mismo servidor/IP/puerto con certificado no confiable y después firmado por la CA de ensayo | Rechazo sin petición HTTP y recuperación con certificado confiable | Aprobado 18/11: tres rechazos, cero peticiones HTTP no confiables y sincronización con certificado válido |

PC-01 no fija retrospectivamente un máximo de 15 segundos. La medición no respalda ese límite para todas las muestras: una tardó 16,889 s. La llegada al tablero y la descarga/reproducción de voz son etapas distintas. El laboratorio no mide la latencia cloud de Vercel/Supabase.

PC-02 debe evitar datos reales y no redirigir producción ni alterar certificados del equipo del usuario. La prueba del adaptador PostgreSQL ya ejecutada es distinta: no certifica el cliente TLS del firmware.

## Registro de ejecución

| Caso / intento | Fecha y operador | Web / firmware / red | Esperado frente a observado | Tiempo / fallo | Evidencia | Decisión |
| --- | --- | --- | --- | --- | --- | --- |
| PC-01 | 18/11/2026; captura técnica del agente y confirmación de pantalla/voz por Ignacio | Next.js/Piper local, cuatro pictogramas ficticios, v0.8.6-pc18-lab, Wi-Fi LAN | Seis tableros aplicados; tres frases nuevas y última reutilización confirmadas | Medianas 11,410 s nuevos / 10,020 s reutilizados; máximo 16,889 s | [Reporte y datos](reportes/esp-20261118/README.md) | Ejecución completa; límite histórico de 15 s no garantizado |
| PC-02 | 18/11/2026; registros del ESP y servidor TLS | Copia del firmware con clave ficticia y CA de ensayo añadida; misma función TLS | Tres conexiones no confiables rechazadas y control confiable funcional | Sin peticiones HTTP en fase no confiable | [Reporte y datos](reportes/esp-20261118/README.md) | Aprobado en el alcance ensayado; restauración del respaldo comprobada manualmente en el ESP |

Herramientas y procedimiento para otra ejecución: [reproducir](herramientas/esp/README.md). No se cambió el firmware habitual: el respaldo completo se restauró y verificó después del ensayo.

Después de los cambios y la revisión externa se repiten las suites del [plan](PLAN.md), conservando inventario, fecha, revisión y reportes. Publicación, CI y tag se rigen por [A8](../REPOSITORIO.md); no se ejecutan desde este documento.
