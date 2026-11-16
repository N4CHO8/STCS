# Defensa del 27 de noviembre de 2026

Tiempo confirmado: 10 minutos de explicación y 5 minutos de demo. No gastar la exposición enumerando pantallas; explicar cómo se construyó, por qué y cómo se comprueba.

## Qué debe quedar visible en clase

Según Ignacio, el profesor no basa la evaluación principalmente en leer informes. La [comparación de Hito 1/2](ANTECEDENTES_HITOS_1_2.md) identifica lo documentado y lo visible en diapositivas; no acredita lo dicho oralmente. Para esta defensa cada afirmación importante debe acompañarse de una figura legible o una evidencia que se abra. Los informes y GitHub son respaldo navegable.

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

## Secuencia de láminas y frase que debe quedar dicha

1. **Problema y objetivo original — 1 min.** Citar objetivo general del proyecto; distinguir el objetivo técnico del Hito 2 de la evaluación de cierre. No inventar una eficacia clínica.
2. **Recorrido de una modificación — 2 min.** “El navegador y el ESP son clientes de la API en Vercel. Ni el navegador ni el ESP consultan directamente PostgreSQL; lo hace la API. La API valida, persiste y sirve la configuración”. Mostrar flechas etiquetadas, sin diagonal Supabase–ESP.
3. **Datos y autorización — 1 min.** Mostrar relaciones, no solo nombres de tablas. “El dispositivo y sus pictogramas pertenecen al perfil; user_access define qué adulto puede acceder. El servidor filtra antes de responder”.
4. **Decisiones — 1,5 min.** API integrada frente a backend separado; SQL para relaciones; medios/voz en nube con caché acotada. Explicar coste y límites de cada elección.
5. **Prueba verificable — 2 min.** Seleccionar un requisito histórico, seguir equivalencia H3 y abrir caso con esperado/obtenido/reporte/SHA. Distinguir siete casos unitarios de 291 comprobaciones de integración. Mostrar por qué una prueba falla al retirar el control UTF-8 en copia temporal.
6. **Calidad medida — 1 min.** Mostrar p95 local, condiciones y límites; dependencias auditadas no equivalen a auditoría completa de seguridad.
7. **Validación y pendientes — 1 min.** Presentar resultados profesionales reales si ya existen y su alcance. Cuatro opciones por página es una decisión técnica, no una prueba de ausencia de sobrecarga visual.
8. **Cierre — 0,5 min.** Jira, tag final y brechas declaradas, antes de los cinco minutos de demo.

Usar una cadena por ejemplo y tener disponibles todas las demás para muestreo. No llenar la lámina con una matriz ilegible: abrir la fila pertinente en GitHub. Este guion no es una presentación PowerPoint final ni acredita un ensayo cronometrado.
