# Correcciones de auditoría — 2026-11-11

## Cambios

| Hallazgo | Corrección | Evidencia disponible |
| --- | --- | --- |
| Login inicializaba datos demo | Eliminada la inicialización; cuentas históricas requieren verificar correo | Suite aislada: no crea ni reescribe usuarios |
| Dependencias vulnerables | Next 16.4.6, React 19.3.1, lock actualizado y parámetros dinámicos asincrónicos | Build, tipos y npm audit de producción |
| Administrador podía suplantar responsables | No elige contraseñas ni cambia correos; asignación clínica pendiente hasta aprobación independiente | Pruebas de rechazo, autoaprobación y acceso antes/después |
| TLS sin verificar | PostgreSQL valida CA de Supabase; firmware valida raíces HTTPS y espera reloj NTP | Conexión PostgreSQL verificada; prueba física del ESP pendiente |
| Clave global de dispositivos | Hash por dispositivo; compatibilidad heredada limitada explícitamente a STCS-ESP32-001 | Una clave no sirve para otro código |
| Web podía fabricar eventos del ESP | Endpoint web retirado con 410; dispositivos conservan su API autenticada | Pruebas de rutas web y hardware |
| Logout y expiración incompletos | Sesiones revocables en servidor, temporizador y sincronización entre pestañas | Revocación API verificada; revisión de sesión entre pestañas pendiente |
| Selecciones emocionales no contaban | Normalización por imagen de catálogo, conservando el evento de selección | Métrica emocional e idempotencia verificadas |
| Límite de pictogramas con carrera | Bloqueo transaccional por perfil para conteo y escritura | 12 altas simultáneas: ocho creadas y cuatro rechazadas |
| Entradas malformadas producían errores internos | Validación de JSON, UUID, tipos, fechas, longitudes y capacidad UTF-8 del ESP | Respuestas JSON 400 verificadas |
| Caída de base confundida con sesión inválida | 503 para indisponibilidad; health también falla con JSON 503 | Dos comprobaciones con base inaccesible |
| Contraseñas normalizadas | Se conservan espacios; límite bcrypt medido en bytes | Login con y sin espacios verificado |
| Historial truncado y total incorrecto | Páginas de 100 con total real, offset validado y navegación | 108 eventos recorridos sin solapamiento |
| Días calculados en UTC | Métricas según America/Santiago; timestamps históricos interpretados como UTC | Evento a las 23:30 local no cuenta como el día UTC siguiente |
| Cola del firmware perdía o bloqueaba eventos | Cola NVS acotada, ID persistente, errores permanentes separados y rechazo visible al llenarse | Compilación completa aprobada; comportamiento físico pendiente |
| Tablero vacío ignorado | Configuración vacía aceptada y aplicada | Compilación completa aprobada; pantalla física pendiente |
| WiFi mostraba éxito sin confirmación | Lectura de ACK serial con timeout, validación UTF-8 y liberación de locks | Código modificado; prueba USB física pendiente |
| Verificador dependía de .env y GET modificaba datos | Archivos opcionales, credenciales explícitas y descarga de configuración de solo lectura | GET mantiene last_sync_at; verificador no usa contraseñas demo |
| JWT aceptaba estructuras incompletas | Tres segmentos, expiración numérica obligatoria y sesión vigente | Tokens alterados y expirados rechazados |

## Resultado local

Build y revisión de tipos aprobados. Suite: 105 comprobaciones de integración más dos de indisponibilidad de base de datos. Cero vulnerabilidades de producción informadas por npm audit. Las filas ficticias se retiraron; Supabase no se utilizó para las pruebas de escritura.

No se afirma que todos los flujos en la nube o el hardware estén verificados únicamente por estos resultados. La entrega real del correo, la activación del propietario, las comprobaciones visuales adicionales y las pruebas físicas requieren evidencia adicional. El estado de conexiones y publicación se mantiene en CONEXIONES.md.

El asesor de seguridad de Supabase informa RLS habilitado sin políticas en las tablas: es deliberado, porque el cliente público no accede a estas tablas y la API aplica autorización con PostgreSQL privilegiado. [Explicación del asesor](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Revisión local en Chrome: ingreso y salida, navegación de los cuatro roles, nombres numerados para admin, orientaciones del docente sin diagnósticos, publicación de informe del especialista, historial de 100+8 eventos y edición de ficha del apoderado. Consola sin errores ni advertencias en el recorrido revisado. Las escrituras fueron exclusivamente sobre fixtures locales. Se corrigió además la confirmación persistente de guardado y el texto de estado de conexión.

Firmware completo compilado para ESP32-S3: 2.986.393 bytes de programa y 163.456 de variables globales. Se añadió lv_conf.h, ausente en el repositorio, para reproducir fuentes y dependencias LVGL. No se flasheó ningún equipo.
