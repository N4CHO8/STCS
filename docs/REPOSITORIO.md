# A8 Repositorio y control de versiones

[GitHub](https://github.com/N4CHO8/STCS), [Jira TCS](https://uandresbello-team-bg7iosbc.atlassian.net/jira/software/projects/TCS), [web](https://0stcs0.vercel.app). Configuración e historial comprobados el 17/11. [Registro](evidencias/a8-repositorio-20261117.json).

## Estado frente al criterio del profesor

| Elemento | Estado |
| --- | --- |
| Main protegida | PR y `verify` obligatorios, también para administradores; 0 revisores obligatorios, sin revisión independiente atribuida |
| CI publicado | [PR #18 aprobado](https://github.com/N4CHO8/STCS/actions/runs/45025353582), integrado como f8b743f; Vercel READY y comprobaciones de nube registradas. Las revisiones documentales posteriores pasan también por PR y verify |
| HU y criterios | Historias con criterios Dado/Cuando/Entonces; Heriber como stakeholder de pertinencia y comprobación técnica por pruebas. Revisión profesional del 20/11 registrada. [Detalle A3](historias.md) |
| Ramas/commits/PR | Convención reciente con ticket; existen PR antiguos sin él y agrupaciones de varias HU |
| Plantillas | [PR](../.github/PULL_REQUEST_TEMPLATE.md) y [HU](../.github/ISSUE_TEMPLATE/historia-de-usuario.md); enlazan objetivo, requisito, casos y evidencia |
| Tablero | Por hacer, En curso, Hecho y Listo; falta columna «Aprobada por stakeholder» |
| Sprints | Tres con objetivo; 37 historias principales asignadas y 7 referencias consolidadas sin sprint |
| Prioridad y tipo | MoSCoW/requisito en etiquetas; tipo en campo Jira. Etiquetas feat/fix no uniformes en PR antiguos |
| Versiones | hito-2 conserva el corte anterior; [hito3](https://github.com/N4CHO8/STCS/tree/hito3) fija la entrega funcional; [hito3-revision-documental-1](https://github.com/N4CHO8/STCS/tree/hito3-revision-documental-1) conserva la documentación corregida, sin mover el tag original |

Las plantillas orientan la revisión; CI no valida automáticamente todos sus campos. [A4](trazabilidad.md) conserva las excepciones sin alterar el historial.

El Sprint 3 utiliza 31 subtareas reales bajo sus diez HU principales. Los desgloses anteriores se conservan como antecedentes; no se presentan como tareas planificadas con esos IDs antes de desarrollarse. [Ficha y anexo](gestion.md).

## Estructura real y correspondencia con la guía

```text
STCS/
├── README.md, CHANGELOG.md, CONTRIBUTING.md
├── .github/       # plantillas y verify.yml
├── docs/
│   ├── DEFENSA.md, objetivos.md, requerimientos.md, historias.md
│   ├── trazabilidad.md, REPOSITORIO.md, riesgos.md
│   ├── pruebas/   # plan, casos, resultados y reportes
│   ├── calidad/   # seguridad y eficiencia
│   └── arquitectura/  # UML y adr/
├── frontend/
│   ├── src/       # UI, API y servidor
│   ├── tests/, scripts/
│   └── api/voice.py
├── firmware/STCS_UI_Arduino/
└── supabase/      # esquema y migraciones
```

Los artefactos se localizan desde [DEFENSA](DEFENSA.md). Presentaciones/guiones personales, respaldos de memoria y credenciales quedan fuera de Git.

## Convención y muestra real

Para cambios nuevos: `codex/TCS-<id>-<cambio>`, ticket en cuerpo de commit y PR, requisitos/casos/reportes de la revisión. Se prefiere una HU por cambio; un PR de integración debe declarar todas las HU que reúne.

Muestra: [PR #16](https://github.com/N4CHO8/STCS/pull/16), rama `codex/TCS-60-defensa-documentacion`, commit [ebfc605](https://github.com/N4CHO8/STCS/commit/ebfc605612b1ecfa237569e64801eb65ba32f0c1). Título `Hito3-ValidacionClinica`, cuerpo TCS-60/TCS-88 y [su propio CI](https://github.com/N4CHO8/STCS/actions/runs/43932850718). El título no acredita que la revisión clínica haya ocurrido.

Los cuerpos de PR #1–10 no citan ticket; PR #5/#6 comparten rama. A4 conserva su correspondencia por contenido. No se cumple la convención retrospectivamente en toda muestra.

En Jira, el PR se enlaza como vínculo o comentario técnico. La aprobación se registra por separado con nombre, rol, fecha y alcance; `Closes #12` de GitHub no sustituye un enlace TCS.

## Sprints y entrega

| Sprint | Objetivo | Estado |
| --- | --- | --- |
| S1 (202) | Alcance y base técnica del comunicador | Cerrado |
| S2 (320) | Integrar ESP, web y Supabase; coherencia de requisitos/diseño/pruebas | Cerrado, retraso histórico conservado |
| S3 (321) | Verificar prototipo, trazabilidad y revisión profesional | Activo; inicio aproximado 26/10 según autor, término previsto 23/11; exposición 27/11 |

MoSCoW y prioridad High/Medium son campos distintos. Las fechas administrativas no prueban aceptación. [Snapshot de sprints](evidencias/a8-repositorio-20261117.json).

## Reproducir, desplegar y recuperar

El [README](../README.md#despliegue-en-los-servicios-existentes) contiene requisitos, variables, comandos y publicación en Vercel existente. [Pruebas](PRUEBAS.md): solo laboratorio para escrituras. [Firmware](../firmware/STCS_UI_Arduino/README.md): compilación verificable con clave ficticia, distinta de una imagen operativa.

CI verifica código, pero no ejecuta todas las sondas de carga/DAST/recuperación ni hardware. La recuperación local sintética no acredita restauración real cloud/flota. [A5](pruebas/PLAN.md), [A9](riesgos.md).

## Identificación y reproducción de la entrega

Los reportes del 21/11 identifican el commit base `ebfc605` y las huellas de sus fuentes. La compilación y las pruebas corresponden a esa revisión con cambios, no al despliegue del commit base. Se preservan los PR históricos y las excepciones de convención; no se reescribe el historial para aparentar una metodología distinta.

Una versión de entrega se identifica por el commit integrado, su CI y despliegue y un tag inmutable `hito3`. El [registro final](pruebas/reportes/comprobacion-final-20261121/README.md) distingue las comprobaciones de Vercel, el firmware físico y las suites aisladas. Los reportes previos mantienen sus versiones; el tag no cambia sus resultados originales.

La evaluación utiliza acceso de lectura al repositorio y al tablero; los secretos y respaldos privados permanecen fuera de Git. Las presentaciones y guiones personales también se conservan fuera del repositorio.
