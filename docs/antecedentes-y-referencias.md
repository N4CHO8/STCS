# Fundamento y comparación de STCS

STCS aborda las dificultades de comunicación de niños con TEA que necesitan apoyo para expresar mensajes. Propone un comunicador de pictogramas y voz, personalizable por adultos responsables. La integración web–ESP permite configurar ese apoyo; su existencia no demuestra un efecto terapéutico.

## CAA y decisiones de interfaz

La evaluación de CAA debe considerar vocabulario, acceso motor, visión y necesidades de comunicación de cada persona. Por eso, las cuatro opciones por página de STCS son una decisión para su pantalla y prototipo, no una regla universal para niños con TEA. [ASHA, guía de CAA](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/).

El ensayo de Kasari y colaboradores estudió dispositivos generadores de voz dentro de una intervención estructurada con niños mínimamente verbales. Ayuda a situar la propuesta, pero no permite trasladar sus resultados a STCS, que no ha realizado ese ensayo. [Kasari et al., 2014](https://pubmed.ncbi.nlm.nih.gov/24839882/).

Light y colaboradores revisan cómo las variables de diseño de pantallas de CAA afectan la atención y el desempeño. Esto justifica revisar distribución, símbolos y carga visual, además de comprobar que los botones funcionan. [Light et al., 2019](https://pubmed.ncbi.nlm.nih.gov/30648896/).

## Alternativas concretas

Comparación documental, consultada el 18/11/2026. No es un ensayo de rendimiento ni eficacia entre productos.

| Solución | Qué ofrece según su fuente | Relación con STCS |
| --- | --- | --- |
| [Cboard](https://www.cboard.io/en/) | Aplicación abierta de símbolos y texto a voz para navegadores; soporte offline declarado para Chrome en escritorio/Android | Permite estudiar CAA sin fabricar un comunicador. STCS explora un ESP dedicado con administración separada |
| [Proloquo2Go](https://www.assistiveware.com/products/proloquo2go/) | CAA con símbolos para iPad/iPhone; personalización de vocabulario, fotos y distribuciones | Ofrece un producto especializado de alcance mayor. STCS es un prototipo académico, sin equivalencia clínica ni comparación de precio acreditada |
| STCS | ESP32-S3, web por roles, imágenes/frases propias y eventos por perfil | Aporte del proyecto: integrar ese hardware con configuración remota y privacidad por responsable. Voz sin red no garantizada |

La elección del ESP permite trabajar con el equipo adquirido y separar la comunicación del portal adulto. A cambio, impone una pantalla pequeña, memoria limitada y dependencia de red para voz no conservada. [Decisiones y alternativas técnicas](arquitectura/README.md), [costo](factibilidad.md).

## Protección de datos y recursos gráficos

La [Ley 19.628](https://www.bcn.cl/leychile/navegar?idNorma=141599) regula el tratamiento de datos personales y contempla datos sensibles de salud. STCS limita datos por rol y usa perfiles ficticios en la revisión. Esas medidas no constituyen por sí solas una certificación de cumplimiento.

La [Ley 21.719](https://www.bcn.cl/leychile/Navegar?idNorma=1209272) modifica el marco de protección de datos. Antes de un despliegue con personas reales deberán comprobarse su vigencia y obligaciones aplicables, responsables, bases del tratamiento, derechos, conservación y eliminación. La demo adulta no autoriza un piloto con menores.

El catálogo candidato incorpora 91 pictogramas ARASAAC: autor Sergio Palao, propiedad del Gobierno de Aragón, licencia CC BY-NC-SA. Se conserva la procedencia por archivo y se presentan créditos en la web. Inseguridad, Frustración y Entusiasmo quedan fuera del selector hasta revisión; sus imágenes anteriores se mantienen para registros existentes. Lucide continúa en los iconos de la interfaz. Las imágenes propias no se atribuyen a ARASAAC. [Catálogo y condiciones](PICTOGRAMAS.md).

La elección de un recurso ARASAAC no demuestra por sí sola que sea adecuado para cada niño ni implica aprobación de STCS por sus autores. El especialista conserva esa decisión. Este cambio sigue en local; la interfaz publicada se comprobará al liberar la versión.

## Referencias

1. ASHA. *Augmentative and Alternative Communication*. Guía profesional, consulta 18/11/2026.
2. Kasari et al. (2014). *Communication interventions for minimally verbal children with autism: a sequential multiple assignment randomized trial*. PMID 24839882.
3. Light et al. (2019). *Designing effective AAC displays for individuals with developmental or acquired disabilities: State of the science and future research directions*. PMID 30648896.

Los enlaces a leyes, licencias y productos se incluyen junto a la afirmación que respaldan. Los estudios citados contextualizan el proyecto; sus muestras y resultados no son resultados de STCS.
