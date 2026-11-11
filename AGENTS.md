# Contexto de STCS

El repositorio se recuperó desde GitHub el 2026-11-11. Consultar
`docs/CONEXIONES.md` antes de configurar servicios o crear recursos nuevos.

- GitHub: `N4CHO8/STCS`, rama principal `main`.
- Jira: proyecto `TCS`, cloudId `84c0a843-624c-408d-9e8f-6b2a725bfb1c`.
- Supabase: proyecto `mvdjzjwidygmhvhfcpgg` (confirmado por el propietario).
  `MecaniaOS` pertenece a otro proyecto.
- Vercel: proyecto `frontend`, ID `prj_sOmeASW2xHvevRaJdCsNujc432yc`,
  equipo `team_h97tpQiyMQi0hL7vOwhH7v4q`, aplicación en `frontend/`.
- Producción: https://0stcs0.vercel.app

Usar los conectores existentes para trabajar con estos servicios. Los enlaces
locales no conceden permisos: comprobar acceso antes de afirmar que funcionan.
No guardar secretos en archivos versionados. No ejecutar seeds ni migraciones
para comprobar conectividad: pueden modificar datos existentes.

## Roles y privacidad

Consultar `docs/FLUJO_ROLES.md`. Hay cuatro roles adultos: therapist, teacher,
guardian y admin. Los niños conservan registros internos child, sin acceso al
portal adulto. Administradores nunca reciben identidades ni datos clínicos;
docentes solo reciben nombres y orientaciones, sin diagnósticos ni progreso.
Las restricciones se aplican en servidor, incluidas las rutas antiguas.
No reintroducir inicialización de esquema o datos demo durante el login.
`npm run verify:roles` usa filas ficticias aisladas y las elimina al terminar;
exige servidor y PostgreSQL en localhost, STCS_TEST_ISOLATED=1 y confirmación de que el servidor usa esa misma base. Nunca apuntarlo a Supabase ni a un servidor local que use producción.
