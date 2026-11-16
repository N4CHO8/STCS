# A2 Requerimientos y alcance de cierre

Los RF-01–RF-08 y RD-01 del Hito 2 ya se recuperaron y se conservan en la [equivalencia histórica](ANTECEDENTES_HITOS_1_2.md). Este catálogo H3-RF/H3-RNF amplía y agrupa el estado actual; no renumera aquellos requisitos. Must es la prioridad propuesta para el MPV técnico de cierre, no una aprobación externa. Los IDs CP-RF/CP-RNF de las pruebas ejecutadas se conservan como nombres de caso y se vinculan aquí al catálogo H3.

| ID | Tipo / prioridad | Requerimiento y objetivo | Lugar en el modelo |
| --- | --- | --- | --- |
| H3-RF01 | Funcional / Must | Portal adulto con sesión y cuatro roles; child no inicia sesión (OE3) | UC1, SEQ2 |
| H3-RF02 | Funcional / Must | Solo niños asignados; admin sin identidad/clinica, teacher sin diagnóstico/progreso (OE3) | UC2, CL1, SEQ2 |
| H3-RF03 | Funcional / Must | Crear/editar imagen, nombre, categoría y frase independiente con validación; voz vigente (OE2) | UC3, SEQ1, ACT1 |
| H3-RF04 | Funcional / Must | ESP con cuatro categorías, páginas, selección, Hablar, Borrar y conservación de frase (OE1) | UC4, ACT1 |
| H3-RF05 | Funcional / Must | Eventos de dispositivo individual con ACK y consulta por responsable autorizado (OE4) | UC5, CL1 |
| H3-RF06 | Funcional / Must | Configurar Wi-Fi desde el celular; estado visible en ESP (OE1/OE4) | UC6 |
| H3-RF07 | Funcional / Should | Informes del especialista separados de orientaciones al docente (OE3) | UC2, CL1 |
| H3-RF08 | Funcional / Should | Último tablero y caché limitada ante reinicio/pérdida de servidor (OE4) | ACT1, CL1 |
| H3-RF09 | Funcional / Should | Administración y aprobaciones de asignación sin acceso clínico del admin (OE3) | UC1, CL1 |
| H3-RF10 | Funcional / Should | Historial, filtros y exportación autorizada (OE4) | UC5 |
| H3-RF11 | Funcional / Should | Capacidad operacional 180 activos, 45 por categoría y rechazo de exceso (OE2) | SEQ1 |
| FUT01 | Futuro / Could | Sugerencias predictivas del comunicador | Análisis TCS-68–73; implementación no acreditada |
| FUT02 | Futuro / Could | Validar multicliente con varios ESP físicos | Un ESP disponible; no demostrado con una flota |

Incluido: MPV técnico y revisión adulta con datos ficticios. Excluido de la demostración: diagnóstico automático, predicción implementada, eficacia terapéutica, pruebas con menores y autonomía por batería (no instalada). Estas exclusiones propuestas no reemplazan el alcance aprobado del curso.

## Escenarios de calidad

| ID / atributo | Fuente y estímulo | Entorno / respuesta | Medida y estado |
| --- | --- | --- | --- |
| H3-RNF01 Seguridad / Must | Adulto autenticado intenta acceder a perfil/medios ajenos o rol prohibido | API rechaza y no entrega datos privados, incluidas rutas antiguas | 100% de negativos seleccionados; 0 dependencias altas/críticas sin tratar. Suite y npm audit aprobados; DAST Baseline ejecutado, con alcance y aviso residual en A6 |
| H3-RNF02 Eficiencia / Must | 5 y 10 clientes consultan el portal con sesión | Build Next y PostgreSQL descartable en localhost; respuesta JSON correcta | p95 ≤2000 ms y errores <1%, 15 s/etapa. Umbral técnico definido en plan, no acordado con stakeholder; no extrapolar a Vercel |
| H3-RNF03 Mantenibilidad / Should | Se cambia un validador o contrato | CI ejecuta unitarias, integración, tipos y build | Todos los checks aprobados; cobertura ≥70% del servidor, rutas API y proxy definidos en A6. Cobertura ampliada de servidor documentada en pruebas/CIERRE_20261116.md |
| H3-RNF04 Recuperación / Should | Reinicio o pérdida de servidor del ESP | Conserva metadatos, recursos disponibles y eventos hasta ACK | 96 tarjetas tras reinicio confirmadas; límite real de cola 64. 64 aceptados como alcance final; PF-03–05 informados conformes, trazas pendientes; voz sin red no garantizada (L-01) |

Seguridad, eficiencia y mantenibilidad se expresan como escenarios medibles de calidad. No se declara certificación ISO/IEC 25010. La carga de 10 clientes es un ensayo acotado del escenario definido, no diez niños/ESP probados.
