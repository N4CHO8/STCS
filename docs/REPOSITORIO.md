# Repositorio despliegue y versiones

Código y artefactos en [N4CHO8/STCS](https://github.com/N4CHO8/STCS), tablero [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS), web [publicada](https://0stcs0.vercel.app).

## Control de cambios

Main protegida con check verify requerido y sin excepción administrativa. Las ramas `codex/TCS-...` y los PR enlazan tickets, requisitos, pruebas y evidencia. El título de commit se conserva según instrucción del propietario; el cuerpo identifica el ticket. Hay omisiones históricas de convención que no se reescriben.

[CI de main 22fa385](https://github.com/N4CHO8/STCS/actions/runs/43925021420): dependencias, unitarias, cobertura/integración, tipos, build y diez E2E aprobados. [PR #15](https://github.com/N4CHO8/STCS/pull/15) corrigió una carrera de sincronización del test; el [fallo anterior](pruebas/CORRECCION_E2E_SESION_20261116.md) permanece documentado. [Workflow vigente](../.github/workflows/verify.yml).

## Reproducir y recuperar

- Web: Node declarado, `npm ci`, variables de ejemplo completadas fuera de Git, build y tipos. Vercel despliega `frontend/` desde main. [Servicios](CONEXIONES.md).
- Pruebas: PostgreSQL/servidor local descartable con guardas; no usar datos reales. [Procedimiento](PRUEBAS.md).
- Firmware: `scripts/verify-firmware.ps1`, toolchain/particiones del [README activo](../firmware/STCS_UI_Arduino/README.md). La compilación de verificación usa clave ficticia y no se carga como operativa.
- Recuperación: preservar cabecera, respaldos y manifiestos privados; revisar destino y cambios posteriores antes de restaurar. Los registros fechados de publicación conservan lo efectivamente ensayado. No hay staging cloud independiente ni recuperación integral de flota acreditados.

## Sprints y entrega

Sprint 1: planificación/base técnica. Sprint 2: prototipo funcional integrado. Sprint 3: verificación y revisión profesional. Asignaciones verificadas mediante el conector; [matriz](trazabilidad.md).

El autor confirmó término previsto del Sprint 3 el 23/11/2026 y presentación el 27/11/2026. Jira ya refleja ese término; aún figura future y su inicio real queda por confirmar, porque Sprint 2 se atrasó. No se ha cerrado el sprint ni acreditado aceptación por cambiar el calendario. Su nombre/objetivo se actualizaron a verificación y revisión profesional. El objetivo de Sprint 2 se recuperó de su entrega y se registró en el tablero al depurar, conservando fechas y cierre originales. La fecha administrativa de sprint no acredita pruebas o aceptación.

El tag exigido por la guía sigue siendo **hito3**, pendiente de incorporar evidencia y revisión final. Crear una sola etiqueta inmutable sobre main revisada después de comprobar accesos del profesor; lo añadido después no pertenece a esa entrega. No crear ni mover el tag automáticamente durante una limpieza documental.
