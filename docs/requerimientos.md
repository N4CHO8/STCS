# A2 Requerimientos y alcance de cierre

Catálogo de correspondencia preparado el 16/11/2026 a partir de código, Jira y pruebas. Los ID son de cierre y deben reconciliarse con la especificación académica original antes del tag. Must indica función imprescindible para el MPV técnico propuesto; no declara aceptación externa.

| ID | Tipo / prioridad | Requerimiento y objetivo | Lugar en el modelo |
| --- | --- | --- | --- |
| RF01 | Funcional / Must | Portal adulto con sesión y cuatro roles; child no inicia sesión (OE3) | UC1, SEQ2 |
| RF02 | Funcional / Must | Solo niños asignados; admin sin identidad/clinica, teacher sin diagnóstico/progreso (OE3) | UC2, CL1, SEQ2 |
| RF03 | Funcional / Must | Crear/editar imagen, nombre, categoría y frase independiente con validación; voz vigente (OE2) | UC3, SEQ1, ACT1 |
| RF04 | Funcional / Must | ESP con cuatro categorías, páginas, selección, Hablar, Borrar y conservación de frase (OE1) | UC4, ACT1 |
| RF05 | Funcional / Must | Eventos de dispositivo individual con ACK y consulta por responsable autorizado (OE4) | UC5, CL1 |
| RF06 | Funcional / Must | Configurar Wi-Fi desde el celular; estado visible en ESP (OE1/OE4) | UC6 |
| RF07 | Funcional / Should | Informes del especialista separados de orientaciones al docente (OE3) | UC2, CL1 |
| RF08 | Funcional / Should | Último tablero y caché limitada ante reinicio/pérdida de servidor (OE4) | ACT1, CL1 |
| RF09 | Funcional / Should | Administración y aprobaciones de asignación sin acceso clínico del admin (OE3) | UC1, CL1 |
| RF10 | Funcional / Should | Historial, filtros y exportación autorizada (OE4) | UC5 |
| RF11 | Funcional / Should | Capacidad operacional 180 activos, 45 por categoría y rechazo de exceso (OE2) | SEQ1 |
| FUT01 | Futuro / Could | Sugerencias predictivas del comunicador | Análisis TCS-68–73; implementación no acreditada |
| FUT02 | Futuro / Could | Validar multicliente con varios ESP físicos | Un ESP disponible; no demostrado con una flota |

Incluido: MPV técnico y revisión adulta con datos ficticios. Excluido de la demostración: diagnóstico automático, predicción implementada, eficacia terapéutica, pruebas con menores y autonomía por batería (no instalada). Estas exclusiones propuestas no reemplazan el alcance aprobado del curso.

## Escenarios de calidad

| ID / atributo | Fuente y estímulo | Entorno / respuesta | Medida y estado |
| --- | --- | --- | --- |
| RNF01 Seguridad / Must | Adulto autenticado intenta acceder a perfil/medios ajenos o rol prohibido | API rechaza y no entrega datos privados, incluidas rutas antiguas | 100% de negativos seleccionados; 0 dependencias altas/críticas sin tratar. Suite y npm audit aprobados; DAST pendiente |
| RNF02 Eficiencia / Must | 5 y 10 clientes consultan el portal con sesión | Build Next y PostgreSQL descartable en localhost; respuesta JSON correcta | p95 ≤2000 ms y errores <1%, 15 s/etapa. Umbral técnico definido en plan, no acordado con stakeholder; no extrapolar a Vercel |
| RNF03 Mantenibilidad / Should | Se cambia un validador o contrato | CI ejecuta unitarias, integración, tipos y build | Todos los checks aprobados; cobertura ≥70% en tres módulos medidos. Cobertura total de negocio pendiente |
| RNF04 Recuperación / Should | Reinicio o pérdida de servidor del ESP | Conserva metadatos, recursos disponibles y eventos hasta ACK | 96 tarjetas tras reinicio confirmadas; límite real de cola 64. Requisito Jira de 256 y ensayo completo de cortes pendientes |

Seguridad, eficiencia y mantenibilidad se expresan como escenarios medibles de calidad. No se declara certificación ISO/IEC 25010. La carga de 10 clientes es un ensayo acotado del escenario definido, no diez niños/ESP probados.
