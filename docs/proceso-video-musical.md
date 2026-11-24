# Proceso: del tema al video musical

Resumen de cómo se produjo el primer video musical del proyecto: **"Amo a todos, quiero a pocos"**, del álbum **LOWKEY**. Sirve como guía para repetir el proceso con otras canciones.

## En números

| | |
|---|---|
| Canción | 3:13, generada en Suno |
| Tomas | 29, de 5 a 13 segundos cada una |
| Personaje | Ficticio, entrenado con 22 fotos generadas con IA |
| Versiones | YouTube (16:9, canción completa) y dos TikToks (9:16, unos 25 s cada uno) |
| Herramientas | Higgsfield: Soul 2.0 + Soul ID, Nano Banana Pro y Kling en Cinema Studio |

## El proceso, paso a paso

### 1. Mapa de tiempos
Se marca en qué segundo empieza cada sección de la canción. Para esta canción:

| Sección | Inicio |
|---|---|
| Intro | 0:00 |
| Verso 1 | 0:13 |
| Pre-coro | 0:36 |
| Coro | 0:45 |
| Verso 2 | 1:10 |
| Pre-coro | 1:40 |
| Coro | 1:49 |
| Puente | 2:04 |
| Coro final | 2:17 |
| Outro | 2:43 |

### 2. Concepto y guion de tomas
El concepto sale de la portada de la canción: una fiesta llena de gente vista a través de un vidrio con lluvia, y ella aparte. La historia va de **estar rodeada de todos** a **quedarse con los pocos que importan**.

Cada sección se divide en tomas. Para cada toma se anota la duración, lo que se ve, un **prompt de imagen** y un **prompt de movimiento**. Todo vive en una hoja de cálculo con dos pestañas:

- **Tomas:** la lista de producción, con el estado de cada toma (Pendiente → Imagen lista → Video listo → En el montaje) y una marca para las que también van en vertical.
- **Montaje:** el orden final, el segundo en que entra y sale cada clip, qué tramo usar y qué arreglo necesita.

### 3. Personaje ficticio
- La protagonista **se inventa desde cero**. No se usan fotos de la dueña de la cuenta ni de nadie real, y se revisa que no se parezca a una persona conocida.
- Se genera un retrato base en **Soul 2.0** y, con ese retrato como referencia, **22 fotos** en distintos ángulos, expresiones, planos y luces (incluidas las luces de noche del video).
- Con esas fotos se entrena un personaje en **Soul ID** (`@lowkey`) y se prueba con dos tomas antes de producir: una de espaldas y un primer plano.

### 4. Reglas de continuidad
- **Vestuario por momento de la historia:** en la fiesta, vestido negro, chaqueta corta y aretes; sola en su cuarto, sin chaqueta ni aretes; al volver a salir, con chaqueta y sin aretes.
- **Personajes secundarios con ropa fija:** los dos amigos del final aparecen ya en el brindis de la fiesta, siempre con la misma ropa.
- **Objetos que conectan tomas:** el paraguas rojo aparece en su cuarto antes de usarlo en la calle.
- **Lugares reconocibles:** calles tipo Granada, en Cali, con palmeras y balcones coloniales.
- **Nada de marcas reales:** el bar se llama **CULTO**, un nombre inventado. Ningún otro letrero lleva texto.

### 5. Imagen primero
Cada toma empieza como una imagen fija que se revisa antes de animarla. Si algo falla (letras, vestuario, un detalle), **se edita la imagen en vez de regenerarla**: es más barato y conserva lo que ya salió bien.

| Tipo de toma | Modelo |
|---|---|
| Ella sola, con la cara visible | Soul 2.0 con `@lowkey` |
| Escenas con más gente | Nano Banana Pro, sin la referencia de su cara si está de espaldas |
| Letreros con texto (CULTO) | Nano Banana Pro |
| Ediciones de una imagen | Nano Banana Pro |
| Objetos sin personaje | Soul 2.0, sin `@lowkey` |

### 6. Después el movimiento
La imagen aprobada se sube como cuadro inicial en **Cinema Studio**, con **Kling** como motor. Ajustes que funcionaron:

- **Tempo:** Dynamic. Con *Calm* o *Single Shot* las tomas salían quietas.
- **Cámara siempre en movimiento:** Dolly in, Dolly out, Tracking, Orbit o Handheld. Nunca *Static*.
- **Prompt:** empieza por el movimiento de cámara y usa muchos verbos de acción, uno por cada elemento que se mueve.
- **La misma paleta de color e iluminación *Practicals*** en todas las tomas.

### 7. Montaje
- Proyecto de 1920×1080 a 24 fps, con la canción de Suno en WAV como audio maestro y **el audio de todos los clips en silencio**.
- Cortes directos en los cambios de compás (a 70 BPM, cada ~3,4 s).
- Una sola capa de color y grano sobre todo el video.
- Versión de YouTube en 16:9. Las tomas de los TikToks se **generan otra vez en 9:16**, no se recortan del horizontal.

## Problemas encontrados y cómo se resolvieron

| Problema | Solución |
|---|---|
| Videos casi quietos (Seedance 2.5, cámara fija) | Cambiar a Kling, tempo Dynamic, cámara en movimiento y más verbos en el prompt |
| Invitados con la cara de la protagonista | En escenas con gente, Nano Banana Pro y describirla a ella con palabras |
| Letras inventadas en letreros y pantallas | Nombre corto y explícito ("CULTO", "nada más escrito"), pantallas como brillo desenfocado, o editar la imagen |
| Vestuario distinto entre tomas | Vestuario escrito en cada prompt según el momento de la historia; editar la imagen si falla |
| Teléfono con pantalla por ambos lados | Cortar antes del giro, dar el cuadro final, o cambiar la acción |
| Chaqueta que se transforma al pasar de una persona a otra | Simplificar la acción: la prenda no cambia de dueño |
| Una toma con luz de atardecer entre tomas de noche | Escribir "deep dark night" en el prompt, o corregir el color en el montaje |
| El modelo metió a la protagonista en una toma que no la tenía | Se quedó: contaba mejor la historia. Abre el video detrás del vidrio y lo cierra con el vidrio vacío |

## Principios

- El personaje es ficticio: el video retrata un timeline, no a una persona.
- Todo el contenido generado se marca como IA al publicar.
- Ningún negocio, marca o persona real aparece en el video.
