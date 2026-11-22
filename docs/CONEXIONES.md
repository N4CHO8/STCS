# Servicios y operación de STCS

Inventario vigente al 16/11/2026. Usar estos recursos existentes; MecaniaOS no pertenece a STCS.

| Servicio | Recurso | Verificación disponible |
| --- | --- | --- |
| GitHub | N4CHO8/STCS, main | Lectura/escritura y CI de main ebfc605 aprobados |
| Jira | TCS, cloudId 84c0a843-624c-408d-9e8f-6b2a725bfb1c | Proyecto e historias accesibles por conector |
| Supabase | mvdjzjwidygmhvhfcpgg | Conector: ACTIVE_HEALTHY; API publicada informa database connected |
| Vercel | frontend, prj_sOmeASW2xHvevRaJdCsNujc432yc | READY para main ebfc605 |
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

## Candidato del 21/11, sin publicar

La adaptación del ESP y el seguimiento profesional requieren la migración aditiva `20261121120000_board_selection.sql`, preparada y probada solo en localhost. La migración de auditoría anterior también conserva su publicación pendiente. No se ejecutaron sobre Supabase. La generación de frases nuevas en producción conserva D15: la función Python corregida y su configuración empaquetada siguen en local.

La publicación autorizada deberá coordinar migraciones revisadas con respaldo privado, aplicación/voz y firmware v0.8.7-adaptive-board antes de usar la selección simplificada en nube. Luego se comprueban SHA/CI, nueva voz, sincronización y permisos. Hasta entonces, el ESP y sus datos publicados se conservan. [Pruebas del candidato](pruebas/reportes/adaptacion-20261121/README.md).
