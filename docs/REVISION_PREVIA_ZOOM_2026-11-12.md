# Estado previo a la revisión profesional por Zoom

Fecha: 12 de noviembre de 2026. Alcance confirmado por el propietario:
**revisión del prototipo con un profesional, sin niños ni datos reales**.

## Resultado

Se puede preparar la presentación de la web y del comunicador local. Todavía
no se acredita el recorrido integrado ESP → nube → historial y no se declara
la preparación al 100 %. La reunión debe identificar esa limitación si no se
resuelve antes; puede servir para revisar vocabulario/interacción sin atribuir
una integración o validación clínica que no se ejecutó.

## Comprobaciones y límites

| Área | Resultado observado | Qué sigue pendiente |
| --- | --- | --- |
| GitHub | Acceso autenticado; punto de partida main 680dcd6, sin cambios previos pendientes | Consultar SHA publicado y ejecución de Verify STCS en Actions para esta revisión |
| Jira | Acceso al Sprint 3 y sus 10 tareas comprobado | El estado Finalizada de una tarjeta no acredita un criterio ausente en el código o un ensayo físico |
| Vercel principal | Dominio 0stcs0.vercel.app, despliegue READY; health 200 con database connected y login 200 | Verificar cada liberación nueva por SHA y pruebas HTTP |
| Supabase | Consulta SQL correcta, tres adultos demo y un admin real activo/verificado | No se modificaron fichas reales ni se ejecutaron seeds/migraciones para conectividad |
| Portal | Roles y separación demo/real probados; edición/persistencia en la suite local | No acredita evaluación de usuarios finales ni toda la matriz móvil/accesible |
| Sesiones | Cambiadas a cookie HttpOnly/SameSite Strict, Secure sobre HTTPS; sin token en JSON/localStorage; control de origen, revocación y sustitución de sesión probados | Compatibilidad Bearer continúa solo para herramientas/API existentes; proteger asimismo XSS y permisos de servidor |
| Software local | Build, tipos, auditoría de producción sin vulnerabilidades informadas y 170 comprobaciones aprobadas (168 integración + 2 caída de base) | No equivalen a certificación de seguridad ni validación clínica |
| Navegador local | Login real, recarga conservando sesión, métricas explicadas, logout y URL directa posterior comprobados; consola sin errores en el recorrido | Navegadores móviles, zoom/teclado completos y condiciones reales de Zoom |
| ESP físico | Detectado COM7; firmware leído por serie v0.6.7-touch; propietario confirmó pantalla, tacto y audio de Agua | Fuente de esa versión no localizado; el repositorio contiene red v0.5.0-private |
| ESP–nube | Mensajes de serie mostraron STCS_SYNC con HTTP 503; el dispositivo histórico no tiene sincronización reciente en Supabase | Identificar destino/credencial del firmware instalado y alinear versión/configuración; enlazar a perfil demo y verificar evento nuevo en nube |
| Ensayo antiguo | Existe stcs-hito3-ensayo independiente, pero su health devolvió HTTP 500 | No usarlo como staging operativo ni asumir que es el destino del ESP: ese destino no pudo confirmarse |
| Preparación profesional | Guion de 45 minutos, resumen, pauta y plantilla de observaciones preparados | Contacto/confirmación del profesional, aceptación del alcance por profesor y ejecución real de la reunión |

La lectura de copia del firmware por esptool quedó esperando conexión y se
detuvo; no produjo copia recuperable y no se escribió ni borró flash. El
propietario reconectó el equipo y confirmó nuevamente pantalla/tacto/audio.
No se cargó firmware distinto ni se reasignó el dispositivo histórico.

## Acciones técnicas antes de mostrar sincronización en vivo

1. Recuperar el fuente/configuración de v0.6.7-touch o preparar una versión reproducible compatible, conservando las mejoras de tacto/audio. La extracción binaria incompleta no se presenta como respaldo.
2. Confirmar URL y credencial del equipo sin publicar secretos. El HTTP 200 del servidor principal no demuestra que el ESP lo esté usando.
3. Usar un dispositivo/perfil demo explícito; no trasladar historial de la asignación anterior ni enviar eventos de prueba a fichas reales.
4. Editar un pictograma demo en web, comprobar descarga real al ESP, seleccionarlo y verificar una única fila nueva y visible para los responsables correctos.
5. Ensayar reinicio y desconexión/reconexión sin perder comunicación local. No atribuir la cola de 24 eventos NVS del código disponible al firmware instalado ni afirmar cumplimiento de 256 eventos LittleFS.

## Lo que debe hacer Ignacio

- Confirmar profesional y fecha; enviar el resumen y acordar con el profesor que esta primera instancia es revisión experta remota.
- Preparar cámara enfocada al ESP, micrófono y audio compartido; ensayar que el profesional vea y escuche las acciones sin perder privacidad.
- Mostrar solo cuentas demo y completar las observaciones durante la reunión; pedir permiso antes de grabar/citar al profesional.
- Para la integración pendiente, colaborar en reconexión/modo de carga/pruebas físicas cuando exista una versión identificada y un plan de conservación de configuración. No proporcionar contraseñas por chat.

## Material preparado

- [Guion y resumen para el profesional](VALIDACION_ZOOM.md).
- [Plantilla de observaciones sin resultados inventados](validacion/observaciones.csv).
- [Pruebas reproducibles](PRUEBAS.md).
- [Ejecuciones CI de STCS](https://github.com/N4CHO8/STCS/actions/workflows/verify.yml).

El uso con menores o datos reales sigue siendo una etapa diferente: requiere
definición profesional/institucional de protocolo, autorizaciones,
consentimiento/asentimiento aplicables, tratamiento de datos, seguridad física
y aceptación técnica integrada. Esta revisión de prototipo no sustituye esas
decisiones.
