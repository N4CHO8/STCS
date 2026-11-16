# Contribuir a STCS

La implementación vigente es Next.js/API en Vercel, Supabase PostgreSQL/Storage, voz Python alojada y Arduino en `firmware/STCS_UI_Arduino`. PlatformIO es histórico.

1. Crear rama `codex/TCS-<id>-<cambio>` desde main y conservar trabajo ajeno.
2. Enlazar ticket y requerimiento en rama, cuerpo de commit y PR; respetar el título solicitado por el propietario. Explicar motivo, comportamiento y validación.
3. Ejecutar pruebas apropiadas según [PRUEBAS](docs/PRUEBAS.md), tipos, formato y build. El CI bloquea integración; no sustituye hardware ni aceptación profesional.
4. Revisar cambios mediante PR y agrupar al integrar. No reescribir main para ocultar fallos o perder referencias de evidencia.
5. Actualizar el artefacto técnico principal afectado, contrato y CHANGELOG. Evitar copiar el mismo informe de cierre en cada ticket/documento.

Las escrituras de prueba solo usan laboratorio localhost con STCS_TEST_ISOLATED=1 y base confirmada. No probar con seeds o migraciones sobre producción. Preservar permisos en servidor y rutas antiguas.

No versionar secretos, respaldos, binarios operativos, presentaciones o guiones personales. Las claves se configuran privadamente; cada ESP usa su credencial. El inventario y los límites vigentes están en [CONEXIONES](docs/CONEXIONES.md) y [DEFENSA](docs/DEFENSA.md).
