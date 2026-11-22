# Pictogramas del catálogo

El catálogo publicado incluye 91 opciones de ARASAAC. Se eligieron por correspondencia con el concepto y se revisaron visualmente. El especialista decide cuáles usar para cada niño; no se ha evaluado su comprensión con menores.

**Autor:** Sergio Palao. **Propiedad:** Gobierno de Aragón. **Procedencia:** [ARASAAC](https://arasaac.org). **Licencia:** CC BY-NC-SA, con atribución, uso no comercial y distribución de las adaptaciones bajo la misma licencia. [Condiciones oficiales](https://arasaac.org/terms-of-use).

Las imágenes conservan su proporción: se reducen a 90 × 90 dentro de un PNG blanco de 96 × 96, sin recorte. El [manifiesto](../frontend/public/pictograms/ARASAAC-CATALOG.json) identifica el símbolo original, sus palabras clave, el enlace y las huellas de los archivos. La web incluye una página de créditos accesible desde el login y el portal. No se implica que ARASAAC avale STCS.

## Qué se conserva

- Los identificadores, rutas, nombres, frases y posiciones permanecen estables. Cambiar la imagen no cambia la voz ni su frase.
- Inseguridad, Frustración y Entusiasmo quedan fuera del selector inicial hasta revisión de Heriber. Sus archivos anteriores, de Lucide (ISC), siguen disponibles para registros ya existentes; no se presentan como ARASAAC.
- Las imágenes propias de los adultos no se sustituyen y conservan sus permisos de uso.
- El límite sigue siendo 45 pictogramas activos por categoría y 180 en total. El tamaño RGB565 por imagen continúa en 18.432 bytes; este reemplazo no demuestra una capacidad nueva ni garantiza voz sin conexión.

Los archivos ARASAAC se publicaron mediante PR #17, sin seeds. El servidor identifica sus huellas para sincronizarlos con el ESP. El 22/11 se confirmó la descarga, la caché y el reinicio con cargador mediante el firmware v0.8.8. Luis conserva 97 registros: 94 visibles, con 89 imágenes distintas; las 91 opciones del catálogo ARASAAC describen el selector inicial, no el número de registros de Luis. Los tres conceptos pendientes quedaron ocultos, sin borrar sus registros. [Comprobación final](pruebas/reportes/comprobacion-final-20261121/README.md).

## Reproducción y comprobación

Desde `frontend/`:

```sh
npm run catalog:verify
npm run catalog:generate
```

La generación descarga imágenes desde la API oficial, comprueba su huella original y reproduce el formato revisado. Si cambia una fuente o el resultado, se detiene para revisión. Puede usar una copia local de los originales mediante `STCS_ARASAAC_SOURCE_DIR`. No se llama a ARASAAC durante el login, el build ni el uso de la app; los archivos se incluyen en el proyecto.

La prueba comprueba las 91 imágenes, las dimensiones, la procedencia, la separación de imágenes propias y la conservación de las tres rutas antiguas. Los resultados de esta revisión se guardan en `docs/pruebas/reportes/arasaac-20261121/`.
