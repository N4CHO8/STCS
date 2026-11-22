# Servicios y operación de STCS

Inventario comprobado al 21/11/2026. Usar estos recursos existentes; MecaniaOS no pertenece a STCS.

| Servicio | Recurso | Verificación disponible |
| --- | --- | --- |
| GitHub | N4CHO8/STCS, main | PR #17 integrado; CI verify aprobado |
| Jira | TCS, cloudId 84c0a843-624c-408d-9e8f-6b2a725bfb1c | Proyecto e historias accesibles por conector |
| Supabase | mvdjzjwidygmhvhfcpgg | Conector: ACTIVE_HEALTHY; API publicada informa database connected |
| Vercel | frontend, prj_sOmeASW2xHvevRaJdCsNujc432yc | READY para main 6defc3b |
| Producción | https://0stcs0.vercel.app | /api/health devuelve status ok y database connected |

Equipo Vercel: team_h97tpQiyMQi0hL7vOwhH7v4q. Aplicación en `frontend/`. El acceso del profesor a Jira debe comprobarse por separado.

## Configuración vigente

PostgreSQL conserva datos y relaciones; `stcs-media` es Storage privado. Piper funciona en función Python Vercel. SQL, Storage y credenciales internas son de servidor; el ESP recibe solo su clave individual. SMTP para activación real fue configurado por el propietario y la activación del administrador se confirmó; el laboratorio usa correo ficticio.

Las variables se describen sin valores operativos en `.env.example` y `.env.production.example`. No versionar `.env.local`, cabeceras de firmware, dumps ni contraseñas. Los respaldos privados están en `%LOCALAPPDATA%/STCS-private`.

## Entornos y límites

- El desarrollo habitual carga `.env.local` de la raíz y comparte Supabase con producción. No usarlo para escrituras de prueba.
- Las suites usan servidor y PostgreSQL localhost, validan su identidad y limpian sus propios fixtures. [Procedimiento](PRUEBAS.md).
- No ejecutar seeds/migraciones para comprobar conexión. Migrar una instalación exige revisión y respaldo del destino; no recrear recursos existentes.
- El funcionamiento publicado no necesita el PC encendido. El ESP requiere alimentación y conectividad para sincronización/voz no conservada.

Arranque de desarrollo: `scripts/start-dev.ps1`. Firmware activo y recuperación: [README del ESP](../firmware/STCS_UI_Arduino/README.md). La [cronología de recuperación](historico/CONEXIONES_RECUPERACION.md) conserva los estados anteriores y no define el estado actual.

## Publicación del 21/11/2026

Código operativo: main `6defc3b`, [PR #17](https://github.com/N4CHO8/STCS/pull/17), CI `verify` aprobado sobre `7724d12`. Vercel `dpl_GBuujeawRYTPnrJTAPJvbXM4WK1U` quedó READY para ese main. El [registro final](pruebas/reportes/comprobacion-final-20261121/README.md) enlaza las comprobaciones de nube y ESP.

Tras respaldar el esquema público se aplicaron las migraciones aditivas de auditoría (`20261122013901`) y selección/observaciones (`20261122013902`). Sus fuentes están en `supabase/migrations/20261116214529_operation_audit.sql` y `20261121120000_board_selection.sql`. No se ejecutaron seeds, ni se borraron datos o reinicializaron cuentas. Las nuevas tablas tienen RLS y no conceden SELECT a anon/authenticated; el acceso pasa por la API de servidor.

La función Python ya genera frases nuevas en Vercel. El firmware operativo v0.8.8 usa la API HTTPS de producción y su credencial individual, conservada privadamente. Los respaldos SQL y de 16 MiB del ESP están fuera de Git. Recuperación: revertir la aplicación por PR o promoción del despliegue anterior y restaurar solo app0 del respaldo del ESP; no eliminar las tablas aditivas ni sobrescribir Wi-Fi/caché sin necesidad.
