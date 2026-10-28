# X Account to Music

Archivo de casos: cuentas de X convertidas en álbumes con IA a partir de análisis de sentimiento.

Sitio estático sin dependencias. Solo necesitas Node 18 o más reciente.

## Comandos

```bash
npm run dev     # genera el sitio y lo sirve en http://localhost:4321
npm run build   # genera dist/
npm run check   # solo valida los casos
```

## Agregar un caso nuevo

1. Copia `content/casos/_plantilla.json` a `content/casos/<slug>.json`.
2. Llena los campos. El `slug` es la URL del caso: `/casos/<slug>/`.
3. Pon las portadas en `public/portadas/` y referencia la ruta en cada canción, por ejemplo `"portada": "portadas/lowkey-01.jpg"`.
4. Pega el ID de cada video en `youtube_id` (lo que va después de `watch?v=`, `youtu.be/` o `shorts/`) y el de la lista en `playlist_youtube_id` (lo que va después de `list=`). Si el video es un Short, agrega `"vertical": true` a esa canción.
5. Corre `npm run check`. Si algo falta, te dice qué y en qué archivo.
6. Haz commit y push. El sitio se vuelve a publicar solo.

Los archivos que empiezan por `_` no se publican.

## Consentimiento

Cada caso lleva `"consentimiento"`:

- `"anonimo"`: no se muestra el usuario. La validación falla si pones `cuenta.handle` o `cuenta.url`.
- `"con-permiso"`: se muestra el usuario con enlace a su perfil. Úsalo solo con permiso confirmado de la dueña o dueño de la cuenta.

Los archivos de datos que te compartan las personas no van al repo. La carpeta `datos/` está en `.gitignore` para eso.

## Configuración

`site.config.json` tiene el título, el autor y tres campos para completar:

- `formulario_url`: el enlace del formulario de Tally o Google Forms para la página Participa.
- `correo_retiro`: el correo para pedir que se retire un caso.
- `youtube_canal_url`: el enlace a tu canal, que aparece en el pie de página.

## Publicar

Elige una opción:

- **Vercel o Netlify:** importa el repo y listo. `vercel.json` y `netlify.toml` ya traen el comando y la carpeta de salida.
- **GitHub Pages:** en el repo, ve a Settings → Pages → Source y elige "GitHub Actions". El workflow de `.github/workflows/pages.yml` publica con cada push a `main`.

## Estructura

```
content/casos/      un JSON por caso
public/             archivos que se copian tal cual (portadas, favicon)
src/templates.mjs   el HTML de cada página
src/styles.css      estilos
src/validate.mjs    reglas que debe cumplir cada caso
build.mjs           genera dist/
serve.mjs           servidor local
```
