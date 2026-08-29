# Contribuir a STCS

Este repositorio debe mantenerse alineado con la arquitectura final definida para el proyecto: web en Vercel, base de datos en Supabase y dispositivo ESP32-S3 con PlatformIO.

## Linea base

La rama `main` representa la linea base estable. Cada avance importante debe quedar en un commit claro y, cuando corresponda, asociado a una tarea de Jira.

## Ramas

- `main`: version estable del proyecto.
- `feature/<nombre>`: nuevas funcionalidades.
- `fix/<nombre>`: correcciones.
- `docs/<nombre>`: cambios de documentacion.
- `firmware/<nombre>`: trabajo especifico del ESP32.

## Convenciones de commit

Usar mensajes breves en espanol:

```text
feat: agregar configuracion inicial del ESP32
fix: corregir carga de eventos del dashboard
docs: actualizar arquitectura final
chore: limpiar archivos obsoletos
```

## Reglas de desarrollo

- No volver a introducir backend Express, Docker o Render sin justificarlo.
- Usar API Routes de Next.js para la API desplegada en Vercel.
- Usar Supabase PostgreSQL como fuente principal de datos.
- Mantener el firmware dentro de `firmware/stcs-esp32`.
- No subir archivos temporales de presentacion como `.pptx`.
- Actualizar `README.md` o `docs/` cuando cambie arquitectura, variables o flujo del dispositivo.

## Validacion antes de commit

```powershell
cd frontend
npm run build
```

```powershell
cd firmware/stcs-esp32
C:\Users\nacho\.platformio\penv\Scripts\platformio.exe run
```
