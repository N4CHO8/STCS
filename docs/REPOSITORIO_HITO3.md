# A8 Repositorio y congelación

Lectura de GitHub verificada el 16/11/2026: repo público N4CHO8/STCS, main protegida, enforce_admins activo y check verify requerido. CI b972cca aprobado. GitHub se comparte con enlace; Jira requiere comprobar permisos del profesor, no hacerlo público indiscriminadamente.

## Convención vigente

Rama codex/TCS-60-hito3-evidencias; commits y PR citan ticket. La plantilla exige requerimiento, casos, evidencia y brechas. El historial antiguo contiene ramas/commits/PR sin ticket. No se reescribe ni se inventa que siempre se cumplió la convención. La matriz registra la correspondencia reconstruida.

Sprint 3 tiene diez historias consolidadas. La captura del conector lo devuelve como **future**, con fechas 19/10–09/11 ya pasadas y objetivo de preparación supervisada. Sprint 2 está cerrado con objetivo vacío. El objetivo del Sprint 2 se recuperó ahora de diapositiva 2 y sección 4 del informe: su ausencia en Jira es de registro. Persisten inconsistencias de planificación que deben resolverse con fechas reales; no inventar inicio/cierre retroactivos.

## Tag hito3

Todavía no creado. Debe apuntar al commit final con todos los artefactos y evidencias accesibles, después de revisión y aprobación. No usarlo como etiqueta móvil ni incluir después evidencia afirmando que estaba congelada. Procedimiento final:

```powershell
git fetch origin
git switch main
git pull --ff-only origin main
git status --short
# Auditar A1–A9, acceso del profesor, CI y evidencia antes de continuar.
git tag -a hito3 -m "Hito 3 STCS: entrega revisada"
git push origin hito3
```

Crear ese tag solo al cerrar la revisión. Si queda una brecha, declararla antes de congelar.

## Reproducibilidad

Web: Node de .node-version, npm ci en frontend, variables de ejemplos completadas privadamente, npm run build y npm run typecheck. Vercel despliega frontend desde main al proyecto existente. Nunca copiar .env.local a un informe ni ejecutar seeds en Supabase.

Firmware: scripts/verify-firmware.ps1 usa toolchain y versiones documentadas; la compilación de verificación tiene credenciales ficticias. La cabecera operativa y respaldos permanecen privados, se carga solo app0 cuando corresponde y se conserva configuración NVS. Ver firmware/STCS_UI_Arduino/README.md.

El laboratorio se instala según PRUEBAS.md; los runners exigen localhost y validan la base. Crear un entorno nuevo productivo no forma parte de reproducir las pruebas.
