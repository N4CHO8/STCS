# Resultados y defectos

Las cifras siguientes corresponden al 21/11/2026, salvo las pruebas físicas y de nube, que conservan su fecha. Se informa qué se ejecutó y qué permite concluir. Los ensayos de laboratorio usan datos ficticios y PostgreSQL localhost; no modifican datos reales.

| Tipo | Qué se probó | Resultado | Interpretación y evidencia |
| --- | --- | --- | --- |
| Unitarias | Validación, permisos, sesión, historial, selección y catálogo | 15/15 aprobadas | Reglas y límites seleccionados; no toda combinación de entradas. [JUnit](reportes/arasaac-20261121/unitarias.xml) |
| Integración | API, base, roles, medios, datos y reintentos | 387 comprobaciones conformes en una suite | No son 387 casos independientes. [Salida](reportes/arasaac-20261121/integracion.txt) |
| Resiliencia | Dos fallos de base y reconexión del trabajador | 3/3 conformes | JSON 503 y recuperación; no alta disponibilidad cloud. Mismo reporte |
| TLS del servidor | Rechazo de certificado PostgreSQL no confiable | 1/1 conforme | Prueba del adaptador local, distinta del TLS del ESP. [JUnit](reportes/adaptacion-20261121/unitarias-tls.xml) |
| E2E | 20 recorridos UI–API–base por motor | 40/40 aprobados, sin omitidos | Chromium/WebKit automatizados, sin ESP físico. [Reporte](reportes/arasaac-20261121/README.md) |
| Cobertura | Servidor/API/proxy y contratos declarados | 90,05 % líneas; 78,16 % ramas; 97,58 % funciones | Supera ≥70 % de líneas en ese alcance; excluye UI, firmware y Python. [Resumen](reportes/adaptacion-20261121/cobertura/coverage-summary.json) |
| Voz Python | Configuración fija, autorización, integridad y respuesta | 8/8 aprobadas | La corrección también se verificó en Vercel con una frase nueva; [registro final](reportes/comprobacion-final-20261121/README.md). [Salida](reportes/adaptacion-20261121/voz-python.txt) |
| Carga | 5/10 clientes, 15 s por etapa | p95 56,47/58,07 ms, 0 errores; 830/1542 peticiones | Perfil local mínimo, sin pictogramas; no capacidad cloud. [Datos](reportes/adaptacion-20261121/carga-local.json) |
| Seguridad | ZAP pasivo autenticado | 0 altos, 1 medio y 1 informativo | CSP de estilos conserva riesgo residual; no pentest activo. [Datos](reportes/adaptacion-20261121/seguridad-autenticada.json) |
| Recuperación | SQL, tres medios y seguimiento sintéticos | Conforme | Restauración aislada; no recuperación real cloud/flota. [Reporte](reportes/adaptacion-20261121/recuperacion.json) |
| Físicas | Nueve escenarios y dos comprobaciones instrumentadas | Conformes con límites registrados | [Físicas](FISICAS_20261115.md), [multicliente](MULTICLIENTE_20261116.md), [PC-01/02](CIERRE.md) |
| Nube | Recorridos manuales con Chrome, 18/11 | Conformes según autor, excepto D15 voz nueva | Cambios observados en 10–15 s aproximados, sin distribución instrumentada. [Registro](NUBE_20261118.md) |
| Nube final | Tres roles, permisos, CSV, seguimiento, créditos y nueva voz | Conforme sobre main 6defc3b | [Resultados y alcance](reportes/comprobacion-final-20261121/README.md); fecha original restaurada y observación sintética retirada |
| Adaptación física | Una categoría/un pictograma, web persistente y voz editada | Conforme según Ignacio el 22/11 | [Comprobación final](reportes/comprobacion-final-20261121/README.md); registros y aprobación profesional separados |
| Revisión profesional | Zoom adulto del 20/11 | Pertinencia aprobada en alcance registrado | Sin indicadores cuantificados ni ensayo con menores. [Registro](../validacion/REGISTRO.md) |

Los [planificados y ejecutados](PLAN.md) registran también el ensayo físico de adaptación del 22/11. Los cinco PA cuantificados del protocolo original siguen sin ejecutarse: la aprobación cualitativa no los reemplaza. El histórico del 16–18/11 mantiene sus cifras originales y no se reetiqueta como ejecución del candidato actual.

## Defectos y tratamiento

Severidad técnica valorada el 17/11: alta si afecta comunicación/sincronización o privacidad; media si degrada operación; baja para infraestructura de pruebas. El registro conserva los fallos corregidos y las limitaciones vigentes.

| ID | Defecto o limitación | Severidad | Corrección / estado | Verificación y evidencia |
| --- | --- | --- | --- | --- |
| D01 | Tarjetas ausentes al reiniciar | Alta | [PR #7](https://github.com/N4CHO8/STCS/pull/7): metadatos separados y atlas | Reinicio con cargador conforme según autor; [PF-02/04](FISICAS_20261115.md) |
| D02 | Descarga HTTPS/chunked incompleta | Alta | [PR #6](https://github.com/N4CHO8/STCS/pull/6): espera de bytes, tamaño y hash | Recorrido cloud físico confirmado; [telemetría v0.8.2](../evidencias/publicacion-20261115/esp-nube-v082.txt) y [verificación cloud](../evidencias/publicacion-20261115/verificacion-nube.json), con fecha/alcance originales |
| D03 | Menú Wi-Fi ausente tras reorganizar UI | Media | [PR #9](https://github.com/N4CHO8/STCS/pull/9): menú móvil restaurado | PF-06 conforme según propietario |
| D04 | Tacto inferior defectuoso | Media | Mitigado con controles superiores/laterales; defecto físico vigente | PF-01 conforme para distribución; no hardware reparado |
| D05 | ACK incompatible con firmware recuperado | Alta | [PR #2](https://github.com/N4CHO8/STCS/pull/2)/[#3](https://github.com/N4CHO8/STCS/pull/3): ACK e idempotencia | API y PF-05 conformes; prueba física sin traza del instante exacto del corte |
| D06 | Ausencia de negativo UTF-8 | Media | U02 incorporado y mutación controlada | [Regresión detectada](reportes/regresion.json); [JUnit 17/11](reportes/a5-revision-20261117/unitarias-tls.xml) con fuente real aprobada |
| D07 | Cabeceras de seguridad insuficientes | Media | CSP con nonce/anti-frame y otras cabeceras; medio de estilos inline permanece como riesgo residual | [ZAP histórico](../calidad/README.md) y [autenticado](reportes/arreglos-locales-20261116/seguridad-autenticada.json); no garantía contra XSS |
| D08 | Test de sesión competía con redirección | Baja, infraestructura | [PR #15](https://github.com/N4CHO8/STCS/pull/15): transporte sincronizado y 401 real | [Fallo y repetición](CORRECCION_E2E_SESION_20261116.md), ambos motores ampliados aprobados |
| D09 | Filtros limitados a la página de 100 eventos | Media | Filtros SQL sobre conjunto completo y CSV auditado; publicado mediante PR #17 | Integración de más de 100 eventos, filtros/fechas/vacío/límites; [reporte](reportes/arreglos-locales-20261116/integracion-cobertura.txt) |
| D10 | Correo introducido antes de hidratación podía perderse | Media | Login espera preparación; publicado mediante PR #17 | Recorridos WebKit y Chromium aprobados tras corrección, [ampliación](ARREGLOS_LOCALES_20261116.md) |
| D11 | 401 de petición antigua podía afectar sesión nueva o dejar datos | Alta, preventiva de privacidad | Invalidación común con revisión de sesión y aborto; publicado mediante PR #17 | CP-RF01-U02 y E03, JUnit nuevo y XML ampliados |
| D12 | Consulta de voz seguía activa al recargar en WebKit | Media | Cancelación pagehide y reinicio al volver; publicado mediante PR #17 | WebKit ampliado sin errores de petición observados |
| D13 | Contraste/foco insuficiente en controles seleccionados | Media | Colores y foco ajustados; publicado mediante PR #17 | Cuatro casos axe/teclado por motor; no certificación total |
| D14 | Carga dependía de fixture preparado por otra ejecución | Baja, infraestructura | Sonda crea y limpia UUID propios | [Carga autosuficiente](reportes/arreglos-locales-20261116/carga-local.json) aprobada |
| L-01 | Voz sin Wi-Fi no disponible en ensayo | Media, limitación aceptada | Sin síntesis local ni garantía offline; no corregida | PF-02/L-01 según propietario; conservar conexión y alternativa comunicativa del adulto |
| D15 | Preparación de frases nuevas fallaba en Vercel | Alta | Configuración Piper empaquetada y modelo fijado; publicada en PR #17 | 8 pruebas Python y nueva frase generada en Vercel en 4,97 s, WAV de 72.118 bytes; [registro final](reportes/comprobacion-final-20261121/README.md) |
| D19 | Atlas ARASAAC excedía 192 KiB y no cabían dos copias grandes durante actualización | Media | Sublímite de 384 KiB dentro de la misma caché de 512 KiB; expulsión controlada con el paquete completo en PSRAM | 94 pictogramas y 89 imágenes guardadas en 305.992 bytes; reemplazo verificado en 4.603 ms; [registro final](reportes/comprobacion-final-20261121/README.md) |

Los incidentes de selector de test, limpieza de fixtures y mapas de cobertura se resolvieron en la infraestructura; no se cuentan como defectos clínicos. Los [resultados iniciales](../historico/pruebas/RESULTADOS_INICIALES_20261116.md) y registros de publicación conservan su fecha y versión.

Los límites de cobertura, entorno y aceptación permanecen en el resumen. El cumplimiento por nivel está en el plan; la revisión profesional consta en su registro.

## Ajustes profesionales y regresión — 21/11

La revisión añadió selección visible por niño, fecha de inicio y observaciones del docente. [Reporte y resultados por nivel](reportes/adaptacion-20261121/README.md). Los reportes del 16–18/11 conservan sus cifras: no se reetiquetan como ejecuciones nuevas.

**D16, baja, publicado en PR #17:** al guardar y recargar de inmediato podían quedar consultas activas del portal o de sesión; WebKit registró errores de acceso durante el abandono de la vista. Se cancelan las consultas al salir y se actualiza la selección confirmada sin una consulta completa redundante. El estado «Consultando voz» distingue la consulta de la preparación. La repetición incluye conservar selección, recarga, cierre de sesión y limpieza de datos privados.

La ampliación también descubrió problemas del fixture: varios escenarios compartían el presupuesto de intentos de login y algunas acciones de prueba no esperaban a que terminara la navegación. Se aislaron los contadores de las cuentas ficticias entre casos, comprobando antes servidor/base localhost, y se esperan estados visibles. No se desactivan límites de producción ni se omiten las comprobaciones de consola.

**D17, media, publicado en PR #17:** la navegación al portal seguida inmediatamente de `router.refresh()` podía reiniciar la sección tras el primer clic en WebKit. Se conserva una única navegación tras login y la lectura autenticada sin caché. El recorrido ampliado verifica cambio de cuenta docente/especialista, identidad de la sesión y persistencia de la observación en el perfil correcto.

**D18, media, publicado en PR #17:** el enlace de créditos tenía contraste 4,45:1. Se oscureció el texto y las revisiones axe de los cuatro roles pasaron en Chromium y WebKit. [Reporte ARASAAC](reportes/arasaac-20261121/README.md).
