# Repetición desde revisión limpia — 22/11/2026

## Identificación

- Revisión comprobada antes de editar documentación: `a3d096f7ab02c16b34c0f8f5779b67ccae79899d` (`hito3-revision-documental-1`).
- Fecha de inicio: 22/11/2026 15:26, America/Santiago.
- Árbol de trabajo al iniciar: limpio.
- Datos de producción: no utilizados ni modificados.
- Alcance: dependencias, unitarias, tipos, compilación web y regresión controlada CP-RF03-U02.

## Comandos y resultado observado

| Comando, desde `frontend` | Resultado | Alcance |
| --- | --- | --- |
| `npm ci` | Conforme | Instalación reproducible desde el lockfile |
| `npm run test:unit` | 15/15 aprobadas; cobertura seleccionada 100 % | Reglas unitarias declaradas, incluida CP-RF03-U02 |
| `npm run typecheck` | Conforme | Tipos TypeScript |
| `npm run build` | Conforme con Next.js 16.4.6 | Compilación de la aplicación; Next advirtió un lockfile externo al repositorio, sin afectar el resultado |
| `node scripts/prove-validation-regression.mjs` | Conforme: la copia temporal alterada falló como se esperaba | Demuestra que CP-RF03-U02 detecta retirar el guard UTF-8; [resultado JSON](../regresion.json) |

## Ampliación con Docker iniciado

La primera ejecución no pudo usar Docker. Después de que Ignacio lo inició, repetí las suites sobre un worktree independiente y limpio del mismo SHA, sin modificar fuentes. El contenedor `stcs-audit-tests` usa PostgreSQL 17, puerto exclusivo 127.0.0.1:55432, almacenamiento descartable y base `stcs_release_tests` con datos ficticios. Los reportes nuevos se guardan en la rama documental y no ensucian el checkout probado.

Entorno efectivo: Windows, Node v24.11.1 y npm 11.6.2. La configuración de CI fija Node 24.22.1/npm 12.2.2; esta repetición local documenta esa diferencia y no sustituye el registro del entorno CI. Chromium 159.0.8154.6 y WebKit 27.2 son navegadores automatizados, no dispositivos físicos.

| Caso / alcance | Esperado | Observado y evidencia |
| --- | --- | --- |
| API, roles, medios, persistencia y sesiones | Todas las aserciones conformes | 387 comprobaciones aprobadas en una suite; [salida](cobertura-integracion.txt) |
| Resiliencia | JSON 503 ante dos caídas y reconexión del trabajador | 3/3 conformes; misma salida |
| Cobertura del servidor | ≥70 % de líneas | 90,05 % líneas, 78,16 % ramas, 97,58 % funciones; [resumen](cobertura/coverage-summary.json), [SHA y árbol limpio](cobertura/metadatos.json) |
| Chromium / WebKit | 20 recorridos por motor, sin omitidos | 20/20 + 20/20; [Chromium](chromium.xml), [WebKit](webkit.xml) |
| Voz Python | 8 pruebas del contrato/configuración/integridad | 8/8 aprobadas; [salida](voz-python.txt). No sintetiza voz real en producción |
| Dependencias de producción | Sin vulnerabilidades altas/críticas conocidas | 0 vulnerabilidades conocidas; [npm audit](npm-audit.json) |
| Carga, 5/10 clientes, 15 s por etapa | p95 ≤2000 ms y errores <1 % | p95 26,20/40,87 ms; 960/1690 peticiones y 0 errores; [reporte](carga-local.json) |
| Recuperación sintética | Restaurar SQL, relaciones, permisos y PNG/RGB/WAV íntegros | Conforme; destino y fixtures retirados; [reporte](recuperacion.json), [salida](recuperacion.txt) |
| CP-RNF01-TLS01 | Rechazar certificado PostgreSQL no confiable | 1/1 aprobada; [salida](seguridad-tls.txt) |
| Seguridad pasiva autenticada | 13 estados esperados y 0 hallazgos altos/críticos | 13/13 conformes, incluidos 5 accesos negados; 0 altos, 1 medio CSP y 1 informativo; [reporte](seguridad-autenticada.json) |

Los comandos, inicio, fin, código de salida y SHA de las suites ampliadas están en [ejecuciones.jsonl](ejecuciones.jsonl). Python se ejecutó con `python -m unittest discover -s tests -p voice_function_test.py -v`; dependencias con `npm audit --omit=dev --json`.

La ampliación finalizó el 22/11 a las 15:54:41 (Chile), con todos los comandos del registro en salida 0. La carga se midió en AMD Ryzen 5 3600, 12 CPU lógicas y aproximadamente 16 GB de RAM; las diferencias frente al 21/11 corresponden a otro entorno y no demuestran una optimización de código.

**Precisión del metadato de recuperación:** el script de esa revisión escribe literalmente `workingTreeDirty: true` (línea 248), aunque `git status --porcelain` del checkout de prueba estaba vacío antes y después. Conservo el JSON original y explico la discrepancia; cobertura y carga sí calculan ese dato y registraron `false`. El SHA, comandos y resultados no se alteraron. Esto es una limitación del generador del reporte, no un fallo de restauración.

## Versión publicada y trazabilidad directa

Vercel confirmó el 22/11 que la demo sirve `a3d096f` en estado READY. El tag funcional `hito3` apunta a `f8b743f`; la comparación de `frontend` y `supabase` entre ambos no tiene diferencias. El firmware instalado se mantiene identificado por el registro previo como v0.8.8-adaptive-board; no se volvió a inspeccionar hardware en esta ejecución. [Identificación](despliegue.json).

- H3-RF03 / TCS-48/60: CP-RF03-E01/E02 y CP-ADAPT-E01 en ambos XML. La corrección de D15 y su comprobación real de voz permanecen en [PR #17 y reporte final](../comprobacion-final-20261121/README.md).
- H3-RNF01 / TCS-59: CP-RF02-E02 (docente sin clínica), E03 (apoderado sin edición) y E04 (admin sin identidades), además de la suite API. Los XML permiten localizar cada caso por ID.
- H3-RNF02 / TCS-60/88: la sonda local usa 5/10 clientes, 15 s por etapa, p95 ≤2000 ms y errores <1 %. Las mediciones nuevas se conservan por separado de las del 21/11.

## Límites que permanecen

PA-01–05 siguen pendientes de ejecución completa; la aprobación cualitativa de Heriber permanece en el [registro principal](../../../validacion/REGISTRO.md). Esta repetición no mide uso con niños, autonomía, carga cloud ni recuperación real de Supabase/ESP. Los reportes históricos sobre `ebfc605` con cambios conservan sus fechas, hashes y resultados originales.
