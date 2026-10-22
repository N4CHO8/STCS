# Guia de demostracion - Hito 2

## Preparacion

1. Cargar el firmware en el ESP32-S3; no se necesita una microSD.
2. En el primer encendido, esperar mientras los audios se instalan en la flash.
3. Comprobar que aparece el menu principal.
4. Cerrar el monitor serie de Arduino IDE, porque el navegador necesita usar el mismo puerto USB.
5. Abrir la plataforma STCS en Chrome o Edge e iniciar sesion.
6. Ir a `Historial` y pulsar `Conectar ESP32`.
7. Elegir el puerto `USB JTAG/serial debug unit` del ESP32-S3.

## Recorrido de la demo

1. Mostrar las cuatro categorias visuales: Necesidades, Emociones, Acciones y Lugares.
2. Explicar que cada opcion combina pictograma ARASAAC, palabra y color secundario.
3. Entrar en Necesidades, deslizar hacia la izquierda y mostrar `Dolor` en la segunda pagina.
4. Seleccionar `Agua`, `Comida` y `Dolor` y mostrar que las miniaturas aparecen en el mismo orden.
5. Pulsar `Reproducir` y comprobar que los tres audios suenan en el mismo orden.
6. Pulsar `Limpiar` y confirmar que la frase queda vacia sin reiniciar el equipo.
7. Pulsar `Volver`, abrir otra categoria y repetir una seleccion.
8. Mantener abierta la vista `Historial` y mostrar que las acciones aparecen desde la mas reciente.
9. Explicar el recorrido real: ESP32 -> USB serial -> API STCS -> Supabase -> Historial web.

## Prueba de extremo a extremo

1. Pulsar `Conectar ESP32` y comprobar que el boton cambia a `ESP32 conectado`.
2. En la pantalla redonda, abrir `Necesidades` y tocar `Agua`.
3. Esperar uno o dos segundos y comprobar en Historial `Selecciono: Agua`.
4. Verificar que el registro indica `Conexion USB`, `Dispositivo ESP32`, categoria y fecha real.
5. Pulsar `Reproducir` en la pantalla y comprobar tanto el audio como el nuevo evento web.
6. Actualizar la pagina y demostrar que los registros siguen presentes: no son datos simulados, estan persistidos en Supabase.

Si el selector de puerto no aparece, usar Chrome o Edge y comprobar que el monitor serie de Arduino IDE este cerrado. Un puerto serial solo puede ser utilizado por una aplicacion a la vez.

## Decisiones tecnicas para explicar

- Los pictogramas estan integrados en el firmware, por lo que la interfaz visual no depende de la microSD.
- SPIFFS contiene los WAV y permite reproducirlos sin una microSD.
- LVGL administra la interfaz y los eventos tactiles.
- La frase conserva hasta seis selecciones y reproduce un archivo por cada elemento.
- El puente Web Serial no simula toques: recibe los eventos que genera el firmware real por USB y los envia a la API autenticada.
- El endpoint Wi-Fi directo tambien acepta el nombre y categoria del pictograma, resolviendolos contra la configuracion vigente en Supabase.
- La seleccion de simbolos, fuente y licencia esta trazada en `PICTOGRAMS.md`.
- Los requisitos, implementacion y pruebas estan relacionados en `VALIDACION_HITO2.md`.

## Evidencias recomendadas

- Foto del menu principal.
- Una foto de cada categoria.
- Foto de una frase de tres pictogramas.
- Video continuo de seleccionar, reproducir, limpiar y volver.
- Captura del monitor serie durante el mismo recorrido.
- Captura del historial con `Conexion USB`, actor `Dispositivo ESP32` y hora del evento.
- Recarga del historial para demostrar persistencia real.
- Resultado de compilacion sin errores.

## Validacion pendiente con personas

La seleccion inicial de simbolos es tecnicamente funcional, pero debe revisarse
con un fonoaudiologo o especialista en CAA. Se debe comprobar el significado de
cada imagen antes de leer la etiqueta y registrar cualquier confusion. Las
pruebas con menores requieren el protocolo y consentimiento correspondientes.
