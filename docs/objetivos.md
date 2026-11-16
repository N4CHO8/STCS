# A1 Problema e indicadores de STCS

**Pendiente de contrastar con los objetivos oficiales de Hito 1/2.** La retroalimentación recibida no los reproduce. Este documento propone una correspondencia operativa para ordenar evidencias; no modifica compromisos académicos ni presenta objetivos nuevos como aprobados.

## Problema e hipótesis de trabajo

El proyecto explora un apoyo CAA personalizable para niños con TEA: el niño utiliza un comunicador físico y los adultos responsables preparan vocabulario y orientaciones. La configuración repartida y el acceso inadecuado a datos pueden dificultar continuidad y privacidad. La existencia y magnitud de estas dificultades en una población concreta requieren fuente/levantamiento del autor; no se inventa prevalencia ni línea base.

Hipótesis técnica: un tablero de pictogramas con imagen, frase y voz, administrado por responsables autorizados y sincronizado por Wi-Fi, permite personalizar y operar el prototipo sin recompilar por cada cambio. Hipótesis de usabilidad: el diseño será comprensible y manejable para los usuarios previstos. Esta segunda hipótesis aún requiere evaluación externa.

Objetivo general de trabajo: construir y evaluar técnicamente un prototipo CAA conectado con control de acceso por rol. **Sustituir por el texto oficialmente aprobado antes del cierre.**

| ID provisional | Objetivo operativo | Indicador y método propuesto | Línea base | Meta propuesta | Resultado disponible |
| --- | --- | --- | --- | --- | --- |
| OE1 | Operar el comunicador de forma comprensible | 4 tareas en ESP: localizar agua/ayuda, construir frase, navegar sin perderla, borrar; medir éxito sin ayuda, errores y tiempo | No medida; pedir al profesional comparación apropiada | ≥3/4 tareas sin ayuda en revisión adulta; pertinencia de la meta por aprobar | Operación técnica confirmada por autor; sin resultado representativo ni validación externa |
| OE2 | Personalizar imagen y frase desde web | Crear/editar un pictograma; comprobar imagen y frase exactas en ESP; tiempo desde guardado hasta disponible | No medida antes del proyecto | 2/2 recorridos correctos; tiempo debe acordarse antes de medir | Imagen/voz y edición confirmadas físicamente 15/11; no ensayo de tiempos con usuarios |
| OE3 | Restringir información según rol y asignación | Accesos permitidos/prohibidos en API, incluidos URL directa y cuentas ajenas | Producto inicial sin medición comparable | 100% de casos de privacidad seleccionados aprobados | Suite técnica aprobada; validación del stakeholder pendiente |
| OE4 | Mantener operación reproducible y trazable | Salud cloud, CI, cambios con evidencia, carga local y reinicio físico | Versión previa descrita en historial Git; no línea base cuantitativa homogénea | CI aprobado y p95 local ≤2 s con 10 clientes; cero errores críticos no tratados | CI y carga local aprobados; no capacidad de producción ni eficacia clínica |

No convertir resultados de laboratorio en indicadores clínicos. El protocolo debe registrar fecha, versión, participantes/sustitutos y justificación, datos brutos, cálculo, comparación contra meta, limitaciones y aprobación del stakeholder. No rellenar retrospectivamente una línea base o afirmar que una meta fue acordada antes de existir.
