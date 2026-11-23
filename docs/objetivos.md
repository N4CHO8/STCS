# A1 Problema, hipótesis y objetivos medibles

## Problema

STCS nace de la dificultad para expresar necesidades, emociones y mensajes que presentan los niños con TEA que requieren apoyo comunicativo. Cuando sus medios de expresión no se ajustan a lo que necesitan comunicar, el mensaje puede no ser comprendido y el adulto debe intervenir para interpretarlo.

La propuesta es un comunicador con pictogramas y voz, personalizable por sus responsables. No todos los niños necesitan el mismo vocabulario ni los mismos apoyos. Los [antecedentes H1/H2](ANTECEDENTES_HITOS_1_2.md) conservan el origen del proyecto. No se realizó un estudio inicial con niños ni se dispone de una línea base clínica.

| Actor | Necesidad | Consecuencia que se busca evitar |
| --- | --- | --- |
| Niño que necesita apoyo | Expresar mensajes con opciones reconocibles | Que su necesidad o emoción no llegue a comunicarse |
| Especialista | Adaptar símbolos, frases y orientaciones | Un apoyo poco adecuado al contexto del niño |
| Apoderado | Acompañar la comunicación y mantener la información del perfil | Descoordinación entre responsables |
| Docente | Facilitar la comunicación con orientaciones permitidas | Apoyos inconsistentes o interpretación clínica fuera de su función |
| Administrador | Mantener cuentas y configuración | Exposición de identidades o datos clínicos |

La sincronización, los permisos y el almacenamiento sostienen esta solución; no son el problema de origen. La pantalla y el tacto condicionan su diseño. El [alcance](requerimientos.md) y los [riesgos](riesgos.md) explican sus límites.

## Hipótesis de solución

Un comunicador con pictogramas y mensajes personalizables puede ofrecer una vía adicional de expresión, acompañada por los adultos responsables. La revisión del 20/11 aportó observaciones sobre la pertinencia del prototipo; una demostración adulta no acredita mejora clínica ni comprensión infantil.

La hipótesis técnica es comprobable: en dos cambios de imagen/frase, el ESP debe mostrar y reproducir el mensaje vigente sin recompilar. Los intentos de acceso prohibido seleccionados deben rechazarse sin entregar datos restringidos.

## Objetivos de origen

**Objetivo general:** desarrollar un prototipo funcional de comunicación aumentativa basado en un dispositivo ESP32-S3 con pantalla táctil redonda y una plataforma web de configuración y seguimiento, con el propósito de apoyar la comunicación de niños con TEA mediante pictogramas.

| ID de origen | Objetivo específico original |
| --- | --- |
| H2-OE1 | Implementar una interfaz CAA funcional y táctil en la pantalla redonda del ESP32-S3. |
| H2-OE2 | Permitir navegación por categorías, selección de pictogramas, construcción, limpieza y reproducción de una frase. |
| H2-OE3 | Persistir la configuración de pictogramas por perfil y administrarla desde la plataforma web. |
| H2-OE4 | Sincronizar el catálogo web y el dispositivo mediante Wi-Fi/HTTPS. |
| H2-OE5 | Registrar eventos autenticados del dispositivo y mostrarlos en un historial ordenado. |
| H2-OE6 | Documentar arquitectura, modelo de datos, reglas, pruebas, atributos de calidad y riesgos. |
| H2-OE7 | Mantener diseñado el flujo predictivo sin presentarlo todavía como funcionalidad implementada. |

## Medición por objetivo: referencia, meta, método y resultado

Las metas son propuestas para la revisión y deben acordarse antes de ejecutarla. «No medida» indica ausencia de una línea base, no un valor cero. Las referencias técnicas permiten comprobar funcionamiento; no demuestran una mejora frente a otro sistema.

| Objetivo | Métrica | Línea base / origen | Meta | Método | Resultado disponible |
| --- | --- | --- | --- | --- | --- |
| H2-OE1 Interfaz táctil | Tareas sin ayuda / 4; errores, ayudas y segundos | No medida con evaluador externo | ≥3/4 tareas sin ayuda si opera directamente | PA-01/02/04: localizar necesidad, seleccionar, volver conservando frase y borrar | Flujo aprobado por el stakeholder en la demostración guiada del 20/11/2026, con la condición de simplificar el tablero por niño. Heriber no operó el ESP; autonomía, tiempo, errores y ayudas quedaron sin medir. [Registro](validacion/REGISTRO.md) |
| H2-OE2 Navegación y frase | Secuencias correctas / 2; selección frente a voz | Orden y mensajes previstos; sin comparación basal con usuarios | 2/2: construir/reproducir y navegar/borrar | PA-02, mismos pictogramas y Wi-Fi; registrar esperado/observado | Flujo aprobado por el stakeholder en la demostración guiada. No se midieron dos secuencias autónomas, tiempo, errores ni ayudas. La operación física se comprobó por separado en el ESP. [Registro profesional](validacion/REGISTRO.md) · [ensayo físico](pruebas/reportes/comprobacion-final-20261121/README.md) |
| H2-OE3 Persistencia | Creación/edición persistentes / 2; fugas en negativos seleccionados | Valores guardados frente a recarga; sin tiempo basal humano | 2/2 persistentes y 0 fugas en los casos elegidos | PA-03/05 y [CRUD/permisos](../frontend/tests/e2e/portal.spec.mjs): guardar, recargar y comparar por perfil | Heriber aprobó la pertinencia de personalizar el tablero durante la demostración guiada; no ejecutó el guardado ni midió su tiempo. Persistencia y permisos aprobados en API/E2E; edición, recarga y aplicación física comprobadas el 22/11. [Registro](validacion/REGISTRO.md) · [reporte final](pruebas/reportes/comprobacion-final-20261121/README.md) |
| H2-OE4 Sincronización | Cambios coincidentes / 2; recompilaciones; segundos | Sin latencia inicial comparable; [referencia H2](ANTECEDENTES_HITOS_1_2.md#evolución-técnica-de-los-requisitos) | 2/2 coincidentes y 0 recompilaciones; tiempo descriptivo | PA-03 previsto; PC-01 mide seis PUT hasta tablero aplicado, con imagen y voz preparada, separando reproducción | Recorrido cloud confirmado; PC-01 LAN: 6/6 aplicados, 7,836–16,889 s, sin recompilar entre cambios. No mide tiempo cloud ni garantiza ≤15 s. [Datos](pruebas/reportes/esp-20261118/README.md) |
| H2-OE5 Eventos e historial | Filas por ID reintentado, orden y acceso permitido | Evento enviado frente a ACK/filas; sin tasa histórica de pérdida | Una fila por ID, orden correcto y 0 fugas en negativos | [API aislada](../frontend/scripts/verify-roles.mjs), PF-03–05/08; PA-05 revisa privacidad | Heriber aprobó cualitativamente el recorrido mostrado y la utilidad de la información. No evaluó cola, ACK, deduplicación ni controles de acceso. La suite API aprobó esos criterios; el ensayo manual del ESP no instrumentó conteos ni instantes de corte. [Registro](validacion/REGISTRO.md) · [casos](pruebas/CASOS.md) |
| H2-OE6 Calidad y documentación | Cobertura, p95, errores y artefactos A1–A9 | [Umbrales del plan](pruebas/PLAN.md); sin benchmark equivalente previo | ≥70% líneas; p95 ≤2000 ms, errores <1%, 5/10 clientes; 9 artefactos localizables | [Comandos](PRUEBAS.md), reportes por nivel e [índice](DEFENSA.md) | 22/11, a3d096f limpio: 90,05% líneas; p95 26,20/40,87 ms y 0 errores en localhost. [Reporte y condiciones](pruebas/reportes/revision-limpia-20261122/README.md). Indicadores técnicos no validados por el stakeholder |
| H2-OE7 Diseño predictivo | Elementos de diseño descritos / 4 | Compromiso documental H1/H2; sin motor ni precisión basal | 4/4: entrada, generación, elección y límites | Revisar el diseño siguiente y FUT01/TCS-68–73 | Cuatro elementos descritos; implementación predictiva fuera del alcance |

OE1–OE4 de Jira/A4 agrupan estos objetivos: OE1 operación (H2-OE1/2), OE2 personalización (H2-OE3/4), OE3 privacidad transversal (H2-OE3/4/5) y OE4 reproducibilidad (H2-OE5/6). La correspondencia con Hito 1 está en los antecedentes.

El informe acumulativo aportado el 18/11 usa cinco objetivos en su sección 5.2. Se conservan como referencias **INF-OE**, sin sustituir los siete objetivos anteriores ni reutilizar sus IDs:

| Objetivo del informe acumulativo | Correspondencia de esta entrega |
| --- | --- |
| INF-OE1 Interfaz CAA táctil y comprensible | H2-OE1/2; pertinencia revisada el 20/11; autonomía infantil no evaluada |
| INF-OE2 Integrar dispositivo, plataforma y persistencia | H2-OE3/4/5 |
| INF-OE3 Configurar tablero y consultar historial | H2-OE3/5 |
| INF-OE4 Validar técnicamente el MVP | H2-OE6 y casos de funcionamiento de H2-OE1–5 |
| INF-OE5 Preparar versión candidata para validación | H2-OE6 y revisión adulta realizada; no es validación clínica con menores |

La cobertura es del servidor, no de UI/firmware/Python. La carga es local con un perfil sin pictogramas, no capacidad cloud. La suite API contiene 387 comprobaciones globales, no 387 pruebas de eventos. [Resultados y versiones](pruebas/RESULTADOS.md).

## Revisión profesional y alcance de la medición

La revisión se realizó por Zoom el 20/11 con datos ficticios. El [registro](validacion/REGISTRO.md) recoge comentarios sobre presentación, vocabulario, acompañamiento, fecha de inicio y observaciones docentes. No se midieron tiempos, errores, ayudas o autonomía ni se validaron indicadores por objetivo; esos indicadores se registran como no medidos.

No se registró un primer intento autónomo del profesional como referencia inicial. Heriber comentó un video del ESP enviado durante la reunión; no operó el dispositivo.

## Diseño conceptual futuro — H2-OE7 / FUT01

Diseño de cierre del 17/11; no motor ejecutado.

| Elemento | Diseño previsto |
| --- | --- |
| Entrada | IDs de la frase y catálogo del perfil autorizado, sin diagnóstico o identidad enviados a un servicio predictivo |
| Generación | Evaluar frecuencia/transición por perfil; candidatos del catálogo permitido y selección manual si faltan datos |
| Elección | Sugerencias separadas de la frase y añadidas solo tras elección del usuario; sin reproducción automática |
| Límites | Revisar pertinencia, privacidad, errores y carga visual antes de habilitar; definir tareas y métricas de comparación |
