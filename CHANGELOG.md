# Cambios de STCS

## Preparación del Hito 3 — 16 de noviembre de 2026

- TCS-60/TCS-88: índice A1–A9, trazabilidad, escenarios, modelos, tres ADR
  retrospectivos, plan de pruebas, resultados y riesgos explícitos.
- TCS-60: siete pruebas unitarias reales y regresión en copia temporal;
  cobertura delimitada a tres módulos.
- TCS-88: carga HTTP aislada en localhost y nueva suite en CI.
- TCS-77: pauta de medición/aprobación externa pendiente; no hay reunión
  realizada ni tag final hito3 en esta fecha.

## Publicaciones del 15 de noviembre de 2026

- PR #9/#10: acceso y estado Wi-Fi en v0.8.6, limpieza web y comprobaciones.
  Correspondencia de cierre TCS-74/TCS-85.
- PR #7/#8: metadatos completos, refresco progresivo, atlas rápido y prueba
  con cargador. Correspondencia TCS-76/TCS-60.
- PR #5/#6: medios privados, Piper en nube, integridad HTTPS, capacidad 180/45
  y tablero inicial 96/24. Correspondencia TCS-48/TCS-49/TCS-60/TCS-88.

## Antecedentes

- PR #1–4: Luis ficticio y ESP, cuentas sintéticas, ACK y retiro de demos.
  Correspondencia TCS-53/TCS-84.
- hito-2 conserva el corte anterior. Los PR históricos no siempre citan ticket;
  esta correspondencia es retrospectiva y no reescribe la autoría.

Referencias: https://github.com/N4CHO8/STCS/pulls.

## Cierre de pruebas y alcance — 16 de noviembre de 2026

- TCS-74/TCS-76: alcance final aceptado por propietario: cola 64 y AP sin timeout; historias finalizadas funcionalmente, sin modificar firmware.
- TCS-88/TCS-85: diez E2E Chromium sobre PostgreSQL descartable; cobertura de servidor, API y proxy 88,89% de líneas.
- TCS-59: cabeceras, CSP de scripts con nonce y DAST Baseline; aviso medio de estilos inline justificado, sin alertas altas en ese recorrido.
- Material personal de exposición retirado del árbol actual; se conserva fuera de Git.
- Aceptación profesional y ensayos físicos no realizados continúan pendientes.
