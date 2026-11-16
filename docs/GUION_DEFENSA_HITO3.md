# Defensa del 27 de noviembre de 2026

Tiempo confirmado: 10 minutos de explicación y 5 minutos de demo. No gastar la exposición enumerando pantallas; explicar cómo se construyó, por qué y cómo se comprueba.

## Diez minutos de explicación

| Minuto | Qué mostrar | Qué explicar |
| --- | --- | --- |
| 0–1 | Problema, alcance e indicadores A1 | Qué se intenta resolver y qué no se está afirmando; resultados externos solo si existen |
| 1–3 | SEQ1 y arquitectura | Web y ESP se comunican por API HTTPS en Vercel; SQL y archivos privados en Supabase; Piper en nube; USB solo alimentación |
| 3–4 | CL1 y privacidad | Adultos, child interno, asignaciones, tablero, dispositivo y eventos; filtrado servidor, no solo botones ocultos |
| 4–5,5 | Tres ADR | Alternativas, pesos, decisión y consecuencias: backend, datos y voz/caché |
| 5,5–7,5 | Reportes de pruebas y trazabilidad | Positivo/negativo, esperado/obtenido, commit; unitarias vs integración vs manual; cómo la prueba detecta la regresión UTF-8 |
| 7,5–8,5 | Seguridad y eficiencia A6 | Auditoría sin vulnerabilidades conocidas de dependencias y carga LOCAL; no convertirlo en certificación o flota real |
| 8,5–9,5 | Revisión experta y riesgos | Método/resultado auténtico cuando se obtenga; límites táctiles, offline, 64 eventos y futuras pruebas con varios ESP |
| 9,5–10 | Índice A1–A9, Jira y tag | Qué está entregado, qué falta y cómo abrir cualquier cadena elegida por el profesor |

## Cinco minutos de demo en nube

| Minuto | Acción |
| --- | --- |
| 0–1 | Abrir producción como especialista con cuenta sintética; mostrar Luis y 24 pictogramas por categoría |
| 1–2 | Seleccionar categoría/página en ESP; construir frase y Hablar; mostrar imágenes completas, controles superiores y estado Wi-Fi |
| 2–3,5 | Editar una frase de prueba controlada, guardar, esperar voz lista, sincronizar ESP y escuchar frase nueva; ensayar antes el tiempo real |
| 3,5–4,5 | Mostrar docente sin clínica y admin enumerado, sin exponer credencial administrativa real en proyección |
| 4,5–5 | Abrir una fila de trazabilidad y su reporte, commit/PR y tag final |

Si la comisión elige otra muestra, abrir su fila directamente. No prometer que aceptará solo las tres cadenas preparadas. Llevar visibles una funcional, una de seguridad y una de eficiencia.

## Respuestas que debes dominar

- ¿Cómo conecta frontend con Arduino? Ambos usan la API; no se conectan directamente.
- ¿Dónde está el backend? Rutas Next.js en Vercel; la voz corre en función Python del mismo servicio.
- ¿Qué datos hay? Ver CL1; las imágenes/audio viven en Storage, relaciones y hashes en PostgreSQL.
- ¿Funciona bien, por qué? Enseñar caso, esperado, observado y reporte ligado a SHA; explicar límites de ese ensayo.
- ¿Cómo validaste sobrecarga visual? Cuatro elementos por página y adaptación táctil son decisiones de diseño; requieren evaluación experta/usuarios. No decir que se probó con niños.
- ¿180 significan 180 audios offline? No. Capacidad activa ensayada y caché son límites distintos.
- ¿Podrías mostrar que una prueba detecta una falla? Ejecutar prove-validation-regression.mjs en copia temporal y explicar CP-RF03-U02; main no cambia.
- ¿Quién aprobó? Mostrar registro real; si falta, declararlo.

## Preparación física

Cargador USB 5 V, cable, Wi-Fi 2,4 GHz o hotspot ensayado, otro navegador y cuentas sintéticas preparadas. No abrir .env, claves del AP, Supabase API Keys ni respaldos. Precargar las frases de la demo. Llevar vídeo de respaldo del ESP, identificado con fecha/versión y sin presentarlo como conexión en vivo. Si cae Internet, explicar el fallo y el límite de caché; no simular nube.
