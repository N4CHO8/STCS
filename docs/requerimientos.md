# A2 Requerimientos y alcance

El MVP ofrece selección de pictogramas y reproducción de mensajes, con personalización web y acceso por responsable. Los requisitos se vinculan a los objetivos de [A1](objetivos.md) y a las historias/pruebas de [A4](trazabilidad.md).

RF identifica funciones y RNF atributos de calidad. Prioridad: **Must**, esencial; **Should**, incluido de segunda prioridad; **Could**, mejora complementaria. Los IDs históricos RF-01–08/RD-01 conservan su [equivalencia](ANTECEDENTES_HITOS_1_2.md).

## Catálogo de requerimientos

| ID | Tipo | Descripción verificable | Prioridad | Objetivo asociado | Lugar en el modelo |
| --- | --- | --- | --- | --- | --- |
| H3-RF01 | Funcional | Portal adulto con sesión y roles therapist, teacher, guardian y admin; child no accede al portal | Must | OE3 | UC1, SEQ2 |
| H3-RF02 | Funcional | Consultar únicamente perfiles asignados; admin sin identidad/clínica y teacher sin diagnóstico/progreso, incluso por API directa | Must | OE3 | UC2, CL1, SEQ2 |
| H3-RF03 | Funcional | Crear/editar imagen, nombre, categoría y frase independientes con validación; preparar y reproducir la voz vigente | Must | OE2 | UC3, SEQ1, ACT1 |
| H3-RF04 | Funcional | Mostrar hasta cuatro categorías según la selección del especialista y páginas; seleccionar, Hablar, Borrar y conservar la frase al navegar | Must | OE1 | UC4, ACT1 |
| H3-RF05 | Funcional | Persistir eventos autenticados del dispositivo por perfil; ACK del identificador y reintento sin duplicados | Must | OE4 | UC5, CL1 |
| H3-RF06 | Funcional | Configurar Wi-Fi desde celular y mostrar conectado/desconectado en el ESP | Must | OE1/OE4 | UC6 |
| H3-RF07 | Funcional | Separar informes del especialista de las orientaciones que recibe el docente | Should | OE3 | UC8, CL1 |
| H3-RF08 | Funcional | Recuperar último tablero y recursos disponibles en caché acotada tras reinicio/pérdida de servidor | Should | OE4 | ACT1, CL1 |
| H3-RF09 | Funcional | Administrar adultos y aprobaciones de asignación sin acceso clínico del admin; hardware previamente configurado para su perfil | Should | OE3 | UC7, CL1 |
| H3-RF10 | Funcional | Consultar historial, filtrar y exportar datos autorizados del perfil | Should | OE4 | UC5 |
| H3-RF11 | Funcional | Admitir hasta 180 pictogramas activos, 45 por categoría; rechazar exceso conservando tablero válido | Should | OE2 | SEQ1 |
| H3-RF12 | Funcional | Solo el especialista asignado elige categorías y pictogramas visibles por niño, sin borrar el catálogo ni permitir una selección vacía; con una categoría el ESP evita el paso de elegir categoría | Must | OE1/OE2 | UC3/4, CL1, ACT1 |
| H3-RF13 | Funcional | Especialista registra fecha de inicio; apoderado la consulta. Docente envía observaciones de comunicación al especialista y consulta solo las propias, sin diagnóstico o progreso | Should | OE2/OE3 | UC8, CL1 |
| H3-RNF01 | Seguridad | Rechazar accesos prohibidos sin datos restringidos y tratar hallazgos altos/críticos de las comprobaciones seleccionadas | Must | OE3 | SEQ2 |
| H3-RNF02 | Eficiencia | Portal local con p95 ≤2000 ms y errores <1% en etapas de 5/10 clientes, 15 s cada una | Must | OE4 | SEQ1 |
| H3-RNF03 | Mantenibilidad | Suites/tipos/build aprobados y cobertura ≥70% de líneas del alcance de servidor declarado | Should | OE4 | SEQ1/SEQ2 |
| H3-RNF04 | Recuperación | Recuperar el tablero de referencia de 96 tarjetas y reintentar hasta 64 eventos pendientes sin duplicar tras ACK | Should | OE4 | ACT1, CL1 |

Los permisos concretos están en [FLUJO_ROLES](FLUJO_ROLES.md). La administración de adultos no incluye vincular o reasignar automáticamente hardware.

## Alcance incluido y estado de entrega

| Elemento | Decisión | Justificación / objetivo | Límite |
| --- | --- | --- | --- |
| Portal y responsables | Incluido | Administrar apoyos y proteger información; OE3 | Cuatro roles adultos; child sin login; permisos en servidor |
| Imagen, frase y voz | Incluido | Adaptar el mensaje al perfil; OE2 | Nombre/imagen/frase independientes, medios privados y voz vigente |
| Comunicador | Incluido | Seleccionar y expresar mensajes; OE1 | Hasta cuatro categorías, cuatro opciones por página; tablero de referencia de 96 activos, 24 por categoría y seis páginas. El tablero de Luis conserva 97 registros, 94 visibles. La adaptación por niño está publicada y comprobada en el ESP; el límite es 45 activos por categoría y 180 en total |
| Capacidad | Incluida con límite | Ampliar vocabulario dentro del hardware; OE2/OE4 | 180 activos/45 por categoría; doce páginas, última con uno; rechazo de exceso |
| Wi-Fi, caché y eventos | Incluidos | Sincronizar y conservar lo disponible; OE4 | Cola de 64, caché acotada, AP sin timeout; voz offline no garantizada |
| Informes/orientaciones | Incluidos | Apoyar al docente sin exponer diagnóstico; OE3 | Separación de campos y permisos; sin diagnóstico automático |
| Historial y CSV | Incluidos | Revisar actividad autorizada; OE4 | Consulta publicada; filtros/CSV/auditoría ampliados probados en laboratorio |
| Multicliente | Verificación acotada | Separación por perfil; OE3/OE4 | Dos ESP y varios computadores conformes según autor; no flota mayor |
| Revisión profesional | Realizada el 20/11 | Contrastar pertinencia; OE1/OE2 | Zoom adulto, datos ficticios; sin menores |

## Exclusiones y evolución

| Elemento | Decisión | Razón |
| --- | --- | --- |
| FUT01: motor predictivo | Futuro; diseño incluido | H2-OE7 compromete diseño, no implementación ni precisión |
| FUT02: flota mayor | Fuera de lo probado | No hay ensayo de más de dos ESP ni capacidad cloud representativa |
| FUT03: alta/rotación/reasignación web de ESP | Mejora futura | Equipos previamente configurados; ajuste del propietario del 17/11, TCS-53/75/81 |
| Diagnóstico, eficacia terapéutica y evaluación con menores | Fuera del MVP | El prototipo y su revisión adulta no acreditan resultados clínicos |
| Batería, reparación táctil y voz offline garantizada | Fuera de esta versión | Batería no instalada, tacto inferior mitigado y voz dependiente de red/caché |
| Garantía de disponibilidad/capacidad cloud | No comprometida | La carga local no establece un SLA |

TCS-53 está completada para acceso autorizado y separación de ESP previamente configurados. El ajuste de alcance del propietario no sustituye la aceptación externa. [Deuda y mejoras](riesgos.md).

## Escenarios medibles de calidad

### Seguridad y eficiencia: escenarios principales

| Parte | H3-RNF02 Eficiencia | H3-RNF01 Seguridad |
| --- | --- | --- |
| Fuente | Clientes de prueba autenticados | Adulto sin permiso o petición anónima |
| Estímulo | Consultar /api/stcs/portal con 5/10 clientes; pausa 50 ms | Cambiar perfil o pedir actividad/medios/rutas antiguas; comprobar también proyecciones permitidas |
| Entorno | Next build y PostgreSQL local, un perfil sin pictogramas; 15 s/etapa | Laboratorio aislado; prueba pública Supabase separada, solo GET de IDs |
| Respuesta | JSON correcto del perfil autorizado | 401/403 cuando corresponde, o proyección permitida sin datos restringidos |
| Medida de respuesta | p95 ≤2000 ms y errores <1% en cada etapa | Todos los negativos seleccionados con resultado esperado y cero fugas; cero altos/críticos sin tratar; medios residuales justificados |
| Prueba | [Sonda](../frontend/scripts/measure-quality.mjs) | [API](../frontend/scripts/verify-roles.mjs), [E2E](../frontend/tests/e2e/portal.spec.mjs), TLS/RLS y ZAP |

Un 200 de portal puede ser correcto para docente/admin si contiene solo su proyección permitida. No se exige un registro universal de intentos denegados. p95 usa duraciones registradas; tasa de error = respuestas fallidas/incorrectas / total.

### Escenarios complementarios

| ID | Estímulo y entorno | Respuesta | Medida |
| --- | --- | --- | --- |
| H3-RNF03 Mantenibilidad | Cambio de código antes de integrar; laboratorio/CI | Ejecutar suites, tipos y build | Pruebas seleccionadas aprobadas; ≥70% de líneas del alcance de servidor; informar exclusiones |
| H3-RNF04 Recuperación | Reinicio o pérdida de red del ESP | Recuperar tablero/recursos y reintentar hasta ACK | Seis páginas por categoría en tablero de 96; hasta 64 pendientes y deduplicación; PF-02–05 |

## Evidencia y cumplimiento observado

Los [reportes de A6](calidad/README.md) comparan umbrales y resultados; [A5](pruebas/RESULTADOS.md) detalla ejecuciones y defectos. Carga, cobertura y seguridad son mediciones técnicas acotadas, no certificación ni garantía de operación clínica. El estado de publicación y aceptación está en [DEFENSA](DEFENSA.md).
