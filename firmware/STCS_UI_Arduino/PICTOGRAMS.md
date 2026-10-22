# Pictogramas CAA

La interfaz usa pictogramas de ARASAAC como representacion visual principal,
acompanados por una etiqueta textual y salida de voz. Las imagenes se compilan
en el firmware para que la comunicacion visual no dependa de la microSD.

## Fuente y licencia

- Autor: Sergio Palao.
- Procedencia: ARASAAC (https://arasaac.org/).
- Titular: Gobierno de Aragon.
- Licencia: Creative Commons BY-NC-SA.

La atribucion y la licencia deben conservarse en las demostraciones y en la
documentacion del proyecto. Antes de cualquier uso comercial se debe revisar
la compatibilidad de la clausula no comercial.

## Criterios de diseno visual CAA

La interfaz se diseno como un tablero dinamico inicial y no como una
prescripcion clinica universal. Aplica estas decisiones:

- El pictograma de 52 x 52 px es el elemento principal de cada opcion.
- La palabra escrita permanece como apoyo para el adulto, el aprendizaje y la
  interpretacion del simbolo; no reemplaza a la imagen.
- Cada pagina contiene como maximo cuatro opciones, con areas tactiles de
  136 x 76 px y separacion visible entre ellas.
- Los simbolos conservan posiciones estables dentro de la cuadricula. Las
  paginas adicionales se recorren horizontalmente.
- El color diferencia visualmente las opciones, pero nunca es la unica pista:
  todas incluyen imagen y etiqueta.
- La franja `Mi mensaje` conserva la secuencia seleccionada mediante miniaturas
  y texto antes de producir la salida de voz.
- `Volver`, `Borrar` y `Hablar` mantienen posiciones constantes y combinan un
  simbolo convencional con una palabra de accion.
- El fondo neutro, los bordes contrastados y la ausencia de decoracion reducen
  competencia visual con los pictogramas.

ASHA indica que el tipo, tamano, cantidad y organizacion de simbolos deben
individualizarse de acuerdo con las capacidades visuales, motoras, linguisticas
y cognitivas del usuario. Tambien senala que combinar el simbolo con la palabra
escrita puede facilitar su interpretacion por los interlocutores. Por eso, la
seleccion final del vocabulario, el numero de opciones y la organizacion por
categorias deben validarse con un profesional de CAA y con el nino usuario.

Referencia tecnica: https://www.asha.org/practice-portal/professional-issues/augmentative-and-alternative-communication/

## Seleccion utilizada

| Interfaz | Pictograma | ID ARASAAC |
| --- | --- | ---: |
| Categoria | Necesidades | 37160 |
| Categoria | Emociones | 12359 |
| Categoria | Acciones | 32067 |
| Categoria | Lugares | 32598 |
| Necesidades | Agua | 2248 |
| Necesidades | Comida | 4610 |
| Necesidades | Bano | 2430 |
| Necesidades | Ayuda | 12252 |
| Emociones | Feliz | 35547 |
| Emociones | Triste | 35545 |
| Emociones | Enojado | 35539 |
| Emociones | Cansado | 35537 |
| Acciones | Jugar | 6537 |
| Acciones | Comer | 6456 |
| Acciones | Dormir | 6479 |
| Acciones | Ir | 8142 |
| Lugares | Casa | 6964 |
| Lugares | Escuela | 32446 |
| Lugares | Bano | 6929 |
| Lugares | Parque | 2859 |

Los recursos originales estan en `assets/arasaac`. El script
`tools/generate_pictogram_assets.py` genera los descriptores RGB565 con
transparencia utilizados por LVGL.
