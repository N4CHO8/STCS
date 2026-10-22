# Validacion del incremento CAA - Hito 2

## Decision de diseno

Cada opcion de comunicacion combina un pictograma ARASAAC, una etiqueta escrita
y una salida de voz. La imagen es el medio principal de reconocimiento; el
texto apoya a interlocutores y alfabetizacion emergente; el audio confirma y
comunica la seleccion. El color se usa como clave secundaria y no como unico
indicador.

La seleccion definitiva de simbolos debe validarse con un fonoaudiologo o con
el especialista responsable del usuario. Las fotografias personales se pueden
incorporar posteriormente para personas, objetos y lugares particulares.

## Trazabilidad

| Requisito | Implementacion | Prueba |
| --- | --- | --- |
| Mostrar categorias visuales | `STCS_UI.cpp`, `create_symbol_button` | P01 |
| Mostrar pictogramas con texto | `STCS_Pictograms.c`, `show_category` | P02 |
| Detectar seleccion tactil | `pictogram_event` | P03 |
| Mostrar respuesta visual | `pictogram_event`, franja de frase | P04 |
| Navegar y volver | `category_event`, `back_event` | P05 |
| Limpiar sin reiniciar | `clear_event` | P06 |
| Reproducir frase sin microSD | `STCS_AudioStorage.cpp`, `play_event`, `STCS_Audio_Loop` | P07 |
| Mantener trazabilidad de recursos | `PICTOGRAMS.md` | P08 |
| Instalar audios internos | `STCS_AudioAssets.c`, `STCS_AudioStorage_Init` | P09 |
| Persistir interacciones reales | `DEVICE_EVENT`, puente Web Serial, API y Supabase | P10 |

## Casos de prueba

| ID | Procedimiento | Resultado esperado | Evidencia |
| --- | --- | --- | --- |
| P01 | Reiniciar el dispositivo | Aparecen cuatro categorias con imagen y texto | Foto de inicio |
| P02 | Abrir cada categoria y deslizar a la izquierda | Se muestran 20 pictogramas en paginas de cuatro, sin cortes ni imagenes ausentes | Fotos de ambas paginas |
| P03 | Tocar el centro y bordes de cada opcion | Se registra exactamente la opcion tocada | Video y monitor serie |
| P04 | Seleccionar de uno a seis pictogramas | La franja muestra las imagenes en el mismo orden | Foto de frase |
| P05 | Repetir abrir y volver diez veces | No hay reinicio, bloqueo ni perdida de frase | Video continuo |
| P06 | Crear una frase y pulsar Limpiar | La frase desaparece sin reiniciar | Video y evento serial |
| P07 | Retirar la microSD, crear una frase y pulsar Reproducir | Cada palabra suena una vez y en orden | Video con audio |
| P08 | Revisar documentacion | Cada imagen posee ID, fuente y licencia | `PICTOGRAMS.md` |
| P09 | Cargar el firmware y observar dos encendidos | El primero instala los WAV y el segundo los reutiliza | Monitor serie |
| P10 | Conectar el ESP32 desde Historial y tocar Agua | El evento aparece con contexto Conexion USB y permanece despues de recargar | Video continuo y captura de Historial |

## Validacion de usabilidad

Registrar para cada pictograma si el evaluador comprende su significado antes
de leer la etiqueta. Anotar confusiones y reemplazar los simbolos que no sean
claros. Esta prueba no sustituye una evaluacion profesional de CAA ni autoriza
pruebas con menores sin el protocolo y consentimiento correspondientes.
