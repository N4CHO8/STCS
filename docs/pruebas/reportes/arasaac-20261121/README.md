# Catálogo ARASAAC — 21/11/2026

Revisión del candidato local, sin publicar ni cambiar el ESP instalado. [Revisión y huellas del código](metadatos.json). Requisito: H3-RF03; HU relacionadas: TCS-30, TCS-48 y TCS-85. Esta comprobación técnica no añade una aprobación del profesional.

## Qué cambió

Se sustituyeron 91 imágenes del catálogo por 87 originales distintos de ARASAAC. Algunos conceptos afines comparten símbolo. Se conservaron identificadores, nombres, frases, posiciones y rutas. Las imágenes propias no se modificaron. Inseguridad, Frustración y Entusiasmo salieron del selector por decisión del propietario; sus archivos anteriores siguen disponibles para registros existentes.

Los archivos de 96 × 96 conservan proporción y margen blanco. No se amplió el límite de 45 por categoría / 180 en total. [Procedencia y reproducción](../../../PICTOGRAMAS.md).

## Resultados

| Comprobación | Resultado | Evidencia |
| --- | --- | --- |
| Catálogo | 3 pruebas aprobadas; verifican las 91 imágenes, sus huellas, dimensiones, IDs y frases, y la compatibilidad de las 3 exclusiones | [JUnit del catálogo](catalogo.xml) |
| Regresión unitaria | 15 pruebas aprobadas, sin omitidos; incluye las 3 del catálogo | [JUnit completo](unitarias.xml); no sumar ambos reportes como pruebas distintas |
| Chromium | 20 recorridos aprobados, sin omitidos | [JUnit](chromium.xml) |
| WebKit | 20 recorridos aprobados, sin omitidos | [JUnit](webkit.xml); motor automatizado, no un iPhone físico |
| Integración | 387 comprobaciones aprobadas, 2 respuestas de caída de base y reconexión del trabajador | [Salida de la herramienta](integracion.txt); solo localhost, sin trabajos de voz reales |
| Créditos | Sin infracciones detectadas por axe; página sin desborde a 390 px | [Resultado](creditos-accesibilidad.json), [captura](creditos.png) |
| Reproducción de imágenes | Generación repetida desde los originales descargados; coinciden las huellas de fuente y resultado | `node scripts/generate-arasaac-pictograms.mjs`, con `STCS_ARASAAC_SOURCE_DIR` privado |
| Compilación y tipos | Next build y TypeScript aprobados | Ejecutados con configuración de laboratorio, sin escrituras de producción |

CP-RF03-ARASAAC recorre login → créditos públicos → portal → editor y comprueba todas las opciones de las cuatro categorías. Verifica que las 91 imágenes terminan de cargar a 96 × 96 y que los tres conceptos pendientes no aparecen en el selector. Los demás recorridos cubren creación, edición, duplicados, subida propia, sesión, roles y seguimiento en PostgreSQL desechable.

## Hallazgos y límites

La primera ejecución detectó contraste insuficiente en el nuevo enlace de créditos (4,45:1). Se oscureció el texto; las cuatro revisiones de accesibilidad por rol pasaron al repetir. También se corrigió el localizador de la prueba del selector de categoría, que no encontraba el control por su etiqueta. No se ocultaron pruebas ni se añadieron reintentos.

Los reportes anteriores conservan sus fechas y alcance. No se probó este reemplazo en Vercel ni en el ESP físico. La voz nueva en producción y la carga del firmware adaptable mantienen su comprobación pendiente. No se usaron niños ni datos reales y no se ejecutaron seeds o migraciones en Supabase. La adecuación individual de los símbolos corresponde al especialista.
