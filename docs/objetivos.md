# A1 Problema objetivos e indicadores

Los objetivos originales de las entregas previas y su correspondencia se conservan en [Antecedentes H1/H2](ANTECEDENTES_HITOS_1_2.md). OE1–OE4 agrupan mediciones de cierre y no renumeran esos objetivos.

## Problema e hipótesis

El proyecto aborda un apoyo de comunicación personalizable para niños con TEA y sus responsables, considerando el riesgo de interfaces recargadas. No hay una línea base cuantitativa con usuarios. Hipótesis técnica: configurar imagen y frase desde web y sincronizarlas con el comunicador sin recompilar, con acceso autorizado. La hipótesis de utilidad/comprensión requiere evaluación externa.

## Objetivos de origen

**General:** desarrollar un prototipo funcional de comunicación aumentativa basado en ESP32-S3 con pantalla táctil redonda y una plataforma web de configuración y seguimiento para apoyar la comunicación mediante pictogramas.

Los siete objetivos específicos H2-OE1–7 son: interfaz táctil; categorías/selección/frase; persistencia por perfil; sincronización Wi-Fi/HTTPS; eventos e historial; arquitectura/pruebas/calidad/riesgos; diseño predictivo sin atribuir un motor implementado. Sus textos originales están en el antecedente enlazado.

## Medición

Las metas son propuestas técnicas, pendientes de ratificación del stakeholder. Línea base con usuarios no medida. La revisión por Zoom debe acordar tareas/metas antes de medir y distinguir observación por cámara de operación directa.

| Grupo y origen | Indicador / meta propuesta | Método | Resultado disponible |
| --- | --- | --- | --- |
| OE1 Operación; H2-OE1/2, H1-OE5 | ≥3/4 tareas adultas sin ayuda | Localizar necesidad/ayuda, construir frase, navegar y borrar; tiempo, errores y ayudas | Operación técnica confirmada; evaluación externa pendiente |
| OE2 Personalización; H2-OE3/4, H1-OE6 | 2/2 recorridos correctos; tiempo objetivo por acordar | Crear/editar imagen y frase, comprobar voz exacta en ESP | Recorrido físico confirmado; tiempos de usuario pendientes |
| OE3 Privacidad; H2-OE4/5 y controles de acceso | Todos los negativos seleccionados rechazados sin filtrar datos | API, URL directa y navegador por rol/asignación | Suite técnica aprobada; [resultados](pruebas/RESULTADOS.md) |
| OE4 Reproducibilidad; H2-OE5/6, H1-OE3/4 | CI aprobado; p95 local ≤2 s, errores <1%, 10 clientes | Build, PostgreSQL aislado y sonda local de 15 s/etapa | CI y carga local aprobados; [calidad](calidad/README.md) |

La aceptación exige evaluador, rol, fecha, versión, datos brutos y decisión por HU/indicador. [Protocolo](validacion/PAUTA.md). Correo enviado; reunión y resultados externos aún no acreditados. Una revisión adulta no demuestra comprensión infantil ni eficacia clínica.
