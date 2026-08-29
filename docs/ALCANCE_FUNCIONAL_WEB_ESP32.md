# Alcance funcional de la plataforma web STCS

La plataforma web STCS esta orientada a cuidadores, docentes, especialistas y administradores. El nino no interactua directamente con la web: la comunicacion principal ocurre mediante el dispositivo fisico Waveshare ESP32-S3-Touch-LCD-1.46 con pantalla redonda tactil.

## Funcionalidades implementadas para el prototipo

1. Login con perfiles demo: permite ingresar como cuidador, docente, especialista o administrador usando credenciales de prueba.

2. Perfil del nino: la web carga el perfil asignado al usuario autenticado, incluyendo nombre, edad, nivel de apoyo y contexto principal.

3. Gestion del dispositivo: se muestra el comunicador ESP32 asociado al perfil, con codigo, estado, bateria, red Wi-Fi, firmware y ultima sincronizacion.

4. Configuracion del tablero: se visualizan pictogramas organizados por categoria, color, texto asociado y orden de sincronizacion.

5. Simulacion de datos del ESP32: como aun no existe el dispositivo fisico conectado, la web permite registrar eventos ficticios al seleccionar pictogramas, sincronizar o reiniciar el dispositivo.

6. Persistencia en base de datos: los eventos simulados se guardan en PostgreSQL/Supabase mediante API Routes de Next.js desplegadas en Vercel.

7. Historial: la web muestra los ultimos eventos registrados, indicando accion, contexto, actor y fecha.

8. Progreso: se generan metricas y graficos a partir de los eventos guardados, como uso semanal, uso por categoria y registro emocional.

## Flujo esperado a futuro con ESP32 real

Cuando el dispositivo fisico este disponible, el ESP32 enviara eventos a la API mediante Wi-Fi. La API guardara esos eventos en la base de datos y la web los mostrara en el dashboard, historial y graficos de progreso. Para esta etapa, el flujo se valida con eventos ficticios generados desde la interfaz.
