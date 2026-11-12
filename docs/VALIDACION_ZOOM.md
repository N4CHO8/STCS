# Revisión experta del prototipo STCS por Zoom

Preparado el 12 de noviembre de 2026. Estado: **pendiente de reunión y revisión profesional**.

## Alcance acordado

Revisar con un profesional la pertinencia del prototipo, su vocabulario,
interfaz, operación y límites. No participan niños, no se usan fichas reales y
no se ejecutan evaluaciones diagnósticas ni se miden resultados terapéuticos.
El resultado esperado es una lista de observaciones y decisiones de mejora.
La revisión remota no acredita por sí sola comprensión de pictogramas por
niños, seguridad física del dispositivo o eficacia clínica.

## Antes de la reunión

- Ignacio confirma profesional, experiencia pertinente CAA/TEA, fecha y duración.
- Enviar el resumen que aparece abajo y el enlace a `/demo`, sin datos de pacientes.
- Acordar con el profesor si esta revisión experta satisface la instancia académica solicitada y cómo debe denominarse en el informe.
- Ensayar el guion, el audio compartido y una cámara que muestre pantalla y manos sobre el ESP; verificar que las imágenes sean legibles y el audio del dispositivo audible.
- Cerrar correo y paneles privados antes de compartir pantalla. Mostrar solo cuentas demo y desactivar notificaciones visibles.
- Solicitar autorización antes de grabar o citar al profesional por nombre. Si no acepta, tomar notas y enviar una síntesis para que corrija su contenido.
- Confirmar pantalla, tacto, audio y conexión física del ESP. Si algo falla, declararlo y presentar solo el alcance efectivamente observable; no simular una sincronización real.

## Resumen para enviar al profesional

STCS es un prototipo académico de comunicación aumentativa y alternativa para
explorar el uso de pictogramas en un comunicador portátil. Combina una pantalla
táctil redonda ESP32-S3 con una plataforma web de configuración y seguimiento.
El niño utiliza el comunicador; especialistas y adultos responsables utilizan
la web. Solicitamos revisar vocabulario, claridad de imágenes, interacción,
audio, personalización y límites del diseño. La reunión no incluye menores ni
datos reales y busca orientar mejoras, sin demostrar eficacia terapéutica.

## Guion sugerido: 45 minutos

| Tiempo | Actividad | Pregunta o resultado |
| --- | --- | --- |
| 0–5 min | Presentar contexto, usuarios y alcance | ¿El objetivo y los límites están claros? |
| 5–15 min | Mostrar categorías, imágenes, selección, frase, volver, limpiar y audio en ESP | ¿Qué es claro, ambiguo o difícil de usar? |
| 15–25 min | Mostrar web: especialista, docente y apoderado, cambiando de sesión | ¿La configuración y la separación de información ayudan a cada adulto? |
| 25–30 min | Modificar un pictograma demo; comprobar descarga y selección en el ESP solo si está realmente enlazado a ese perfil demo | ¿El contenido y la personalización son adecuados? |
| 30–40 min | Revisar observaciones sobre vocabulario, accesibilidad y apoyos | ¿Qué cambios son necesarios antes de evaluar con usuarios? |
| 40–45 min | Acordar prioridades y próximos pasos | Confirmar observaciones, limitaciones y eventual segunda revisión |

## Casos para observar

Registrar cada caso como observado satisfactoriamente, con dificultad, fallido
o no observado. Es una pauta de proyecto, no una escala clínica validada.

1. Entender la categoría sin depender exclusivamente del texto o color.
2. Localizar agua, ayuda, baño y una emoción; identificar posibles ambigüedades.
3. Seleccionar con centro y bordes del botón sin activaciones accidentales.
4. Construir una frase, volver y limpiar sin perder control del flujo.
5. Escuchar palabras en orden, volumen y pronunciación comprensibles.
6. Revisar número de opciones, tamaño táctil, contraste, posiciones y fatiga visual.
7. Evaluar palabras, mensajes y categorías que convendría añadir, retirar o personalizar.
8. Editar un pictograma demo como especialista/docente y comprobar persistencia.
9. Comprobar que docente recibe solo nombre/orientaciones y el administrador solo Usuario N, sin ficha clínica infantil.
10. Si hay enlace real, comprobar ESP → API → historial del perfil demo correcto. Anotar si no se ejecutó.
11. Mostrar pérdida de conexión únicamente si se ensayó previamente y no altera datos reales; distinguir comunicación local y envío pendiente.
12. Confirmar las limitaciones del prototipo y las condiciones que el profesional propone para una futura evaluación.

Usar `validacion/observaciones.csv` como plantilla; ninguna fila acredita una
observación hasta completarse durante la reunión.

## Después

Enviar una síntesis para corrección/confirmación del profesional: fecha, rol y
alcance, versión web y firmware realmente mostrados, casos observados/no
observados, problemas, prioridades y decisiones. Registrar desacuerdos y
limitaciones. Incorporar los resultados reales al informe del profesor.

Antes de una futura prueba con participantes deben definirse por separado
protocolo, supervisión, consentimientos/asentimiento aplicables, autorizaciones
institucionales, seguridad física y tratamiento de datos. Esas decisiones las
revisan el profesional y la institución; esta pauta no las sustituye.

## Referencias de contexto

- [ASHA: comunicación aumentativa y alternativa](https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/).
- [ASHA: telepráctica](https://www.asha.org/practice-portal/professional-issues/telepractice/).

Estas referencias profesionales orientan preguntas y límites; no constituyen
aprobación del prototipo ni determinan requisitos institucionales de UNAB.
