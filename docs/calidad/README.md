# A6 Seguridad y eficiencia medidas

## Seguridad CP-RNF01-S01

Auditoría npm de dependencias de producción ejecutada el 16/11/2026: **0 críticas, 0 altas, 0 moderadas, 0 bajas conocidas** en el reporte [npm-audit.json](npm-audit.json). Comando: npm audit --omit=dev --json desde frontend. Significa que el registro no informó vulnerabilidades de esas dependencias al consultar; no es escáner dinámico de la aplicación ni certificación.

La suite CI b972cca contiene 291 comprobaciones de integración con roles, cuentas ajenas, rutas antiguas, sesiones, medios y límites. No contar sus aserciones como igual número de pruebas unitarias ni como porcentaje de líneas.

Pendientes: DAST en entorno aislado autorizado y revisión de todos los hallazgos de aplicación; no ejecutar escaneo agresivo de producción ni afirmar 0 fallos de seguridad por npm audit.

## Eficiencia CP-RNF02-L01 y L02

Reporte [carga-local.json](carga-local.json), generado por scripts/measure-quality.mjs. Portal autenticado con datos ficticios existentes, Next build de producción y PostgreSQL en loopback. El script exige STCS_TEST_ISOLATED=1, valida la base exacta y no crea fixtures ni lee .env de producción como destino.

| Clientes | Duración prevista | Consultas | p95 | Errores | Umbral técnico |
| --- | --- | --- | --- | --- | --- |
| 5 | 15 s | 661 | 69,96 ms | 0 | ≤2000 ms y <1% |
| 10 | 15 s | 1244 | 82,50 ms | 0 | ≤2000 ms y <1% |

El generador, servidor y DB comparten computador. Hay pausa de 50 ms por cliente y calentamiento previo; no son llegadas abiertas ni usuarios humanos. No se midieron primera descarga, TTS, varias placas ni capacidad/cuotas de Vercel. El objetivo técnico se propuso antes del ensayo, todavía no fue ratificado por stakeholder. Si se cambia código/build o condiciones, conservar este reporte como histórico y repetir con nueva identificación.

## Mantenibilidad RNF03

Siete pruebas unitarias, JUnit y cobertura del 100% de líneas en permissions.ts, media-contract.ts y server/validation.ts. Los tres son parte del negocio y contrato, pero no todo el negocio. Portal, persistencia, autorización DB y procesos de voz requieren ampliar cobertura antes de afirmar ≥70% global. CI ejecuta la nueva suite. Ver [resultados](../pruebas/RESULTADOS_HITO3.md).
