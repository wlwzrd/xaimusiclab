// Plantillas HTML del sitio. Cada función devuelve un string.
// Todo texto que viene de los JSON pasa por esc() antes de entrar al HTML.

import { esc, mesCorto } from "./util.mjs";
import { graficaActividad, graficaTempo, MAPA_SONIDO } from "./charts.mjs";

export { esc };

const X_ICON = '<svg class="xicon" viewBox="0 0 24 24" aria-label="X" role="img"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>';
const PLAY ='<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
const periodo = (c) => `${mesCorto(c.corpus.desde)} – ${mesCorto(c.corpus.hasta)}`;
const playlistUrl = (id) => `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;

// Título del álbum con la segunda mitad en color de acento (LOW + KEY).
const tituloDisco = (t) => {
  if (t.length > 14 || /\s/.test(t)) return `<h1 class="long">${esc(t)}</h1>`;
  const mitad = Math.ceil(t.length / 2);
  return `<h1>${esc(t.slice(0, mitad))}<span>${esc(t.slice(mitad))}</span></h1>`;
};

export function layout({ site, base, titulo, descripcion, actual, contenido }) {
  const nav = [
    ["", "Casos", "casos"],
    ["metodo/", "Método", "metodo"],
    ["participa/", "Participa", "participa"],
  ]
    .map(([href, txt, key]) => `<li><a href="${base}${href}"${actual === key ? ' aria-current="page"' : ""}>${txt}</a></li>`)
    .join("");
  const canal = site.youtube_canal_url
    ? ` · <a href="${esc(site.youtube_canal_url)}" target="_blank" rel="noopener">YouTube</a>`
    : "";
  const handle = String(site.x_handle || "").replace(/^@/, "");
  const autoria = handle
    ? `Un experimento de <a class="xlink" href="https://x.com/${esc(handle)}" target="_blank" rel="noopener">${X_ICON}<span>@${esc(handle)}</span></a>`
    : "Un experimento de música con IA";
  return `<!doctype html>
<html lang="${esc(site.idioma || "es")}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:type" content="website">
<link rel="icon" href="${base}favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;800&family=Figtree:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="${base}styles.css">
</head>
<body>
<nav class="nav" aria-label="Principal">
  <a class="brand" href="${base}">X Account <span>to</span> Music</a>
  <ul>${nav}</ul>
</nav>
${contenido}
<footer class="site">
  <span>${autoria}${canal}</span>
  <span>Música, letras y portadas generadas con IA</span>
</footer>
</body>
</html>`;
}

function arteTarjeta(caso, base) {
  const portada = caso.canciones.find((c) => c.portada)?.portada;
  if (portada) {
    return `style="background: url('${esc(base + portada)}') center / cover"`;
  }
  const colores = caso.animo_por_mes.map((m) => m.color);
  const fondo = colores.length > 1 ? `linear-gradient(140deg, ${colores.join(", ")})` : colores[0];
  return `style="background: ${fondo}"`;
}

export function paginaInicio({ site, base, casos }) {
  const tarjetas = casos.length
    ? `<ul class="cases">${casos
        .map(
          (c) => `<li><a class="case" href="${base}casos/${esc(c.slug)}/">
      <div class="art" ${arteTarjeta(c, base)}><strong>${esc(c.titulo)}</strong></div>
      <div class="info">
        <span class="label">${esc(periodo(c))} · ${c.canciones.length} canciones</span>
        <p>${esc(c.resumen)}</p>
      </div>
    </a></li>`
        )
        .join("")}</ul>`
    : `<p class="empty">Todavía no hay casos publicados.</p>`;

  const contenido = `<main class="wrap wide">
  <header class="hero">
    <p class="label">Investigación · Música con IA</p>
    <h1 class="long">¿Cómo suena un timeline?</h1>
    <p class="lede">Analizo los posts públicos de una cuenta de X, mapeo su estado de ánimo y lo convierto en un álbum con letras originales y música generada con IA.</p>
    <div class="ctas">
      <a class="cta" href="${base}participa/">Convierte tu timeline en un álbum</a>
      <a class="cta ghost" href="${base}metodo/">Cómo funciona</a>
    </div>
  </header>
  <section>
    <p class="label">Casos</p>
    <h2>${casos.length === 1 ? "1 álbum" : `${casos.length} álbumes`} hasta ahora</h2>
    ${tarjetas}
  </section>
</main>`;
  return layout({ site, base, titulo: site.titulo, descripcion: site.descripcion, actual: "casos", contenido });
}

function bloqueCancion(s, i, base) {
  const spec = [s.genero, s.bpm ? `${s.bpm} BPM` : null, s.tonalidad].filter(Boolean).map(esc).join(" · ");
  const portada = s.portada
    ? `<img class="cover" src="${esc(base + s.portada)}" alt="Portada de ${esc(s.titulo)}" loading="lazy" width="120" height="120">`
    : "";
  const video = s.youtube_id
    ? `<div class="video${s.vertical ? " vertical" : ""}"><iframe src="https://www.youtube-nocookie.com/embed/${esc(s.youtube_id)}" title="${esc(s.titulo)}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`
    : "";
  return `<li class="track">
    <span class="no">${String(i + 1).padStart(2, "0")}</span>
    <div class="body">
      <span class="mood">${esc(s.animo)}</span>
      <h3>${esc(s.titulo)}</h3>
      <p class="desc">${esc(s.descripcion)}</p>
      ${s.verso ? `<blockquote>"${esc(s.verso)}"</blockquote>` : ""}
      ${portada}${video}
    </div>
    <span class="spec">${spec}</span>
  </li>`;
}

export function paginaCaso({ site, base, caso: c }) {
  const listaBtn = (txt) =>
    c.playlist_youtube_id
      ? `<a class="cta" href="${playlistUrl(c.playlist_youtube_id)}" target="_blank" rel="noopener">${PLAY} ${txt}</a>`
      : "";
  const cuenta =
    c.consentimiento === "con-permiso"
      ? `<p class="note">Cuenta analizada con permiso de su dueña o dueño: <a href="${esc(c.cuenta.url || `https://x.com/${c.cuenta.handle.replace(/^@/, "")}`)}" target="_blank" rel="noopener">${esc(c.cuenta.handle)}</a>.</p>`
      : `<p class="note">La cuenta analizada se mantiene anónima a propósito. Este resumen describe patrones de tono y temas, no a la persona: no incluye su nombre, su usuario, su ubicación exacta ni detalles de su vida privada.</p>`;

  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">Caso · ${esc(c.cuenta?.ciudad || "")}</p>
    ${tituloDisco(c.titulo)}
    <p class="lede">${esc(c.resumen)}</p>
    <div class="meta">
      <span>${c.corpus.posts} posts públicos</span><span>${esc(periodo(c))}</span><span>${c.canciones.length} canciones</span>
    </div>
    ${listaBtn("Escuchar la lista en YouTube")}
    ${cuenta}
  </header>

  <section>
    <p class="label">Ficha del perfil</p>
    <h2>Quién habla en el timeline</h2>
    <p>${esc(c.perfil)}</p>
    <div class="facts">
      <div class="fact"><strong>${c.corpus.posts}</strong><span>publicaciones analizadas</span></div>
      <div class="fact"><strong>${esc(periodo(c))}</strong><span>periodo del análisis</span></div>
      ${c.corpus.ritmo ? `<div class="fact"><strong>Ritmo</strong><span>${esc(c.corpus.ritmo)}</span></div>` : ""}
      ${c.corpus.idiomas ? `<div class="fact"><strong>Idioma</strong><span>${esc(c.corpus.idiomas)}</span></div>` : ""}
    </div>
  </section>

  ${
    c.actividad
      ? `<section>
    <p class="label">Ritmo de publicación</p>
    <h2>${esc(c.actividad_titular || "Cuándo publica")}</h2>
    ${c.actividad_resumen ? `<p>${esc(c.actividad_resumen)}</p>` : ""}
    ${graficaActividad(c)}
  </section>`
      : ""
  }

  <section>
    <p class="label">Sentimiento general</p>
    <h2>${esc(c.sentimiento.titular)}</h2>
    ${c.sentimiento.resumen ? `<p>${esc(c.sentimiento.resumen)}</p>` : ""}
    <ul class="tones" aria-label="Tonos detectados">
      ${(c.sentimiento.tonos_principales || []).map((t) => `<li class="tone main">${esc(t)}</li>`).join("")}
      ${(c.sentimiento.tonos || []).map((t) => `<li class="tone">${esc(t)}</li>`).join("")}
    </ul>
    <ul class="strip" aria-label="Estado de ánimo por mes">
      ${c.animo_por_mes
        .map((m) => `<li class="month"><div class="bar" style="--c: ${esc(m.color)}"></div><h3>${esc(m.etiqueta)}</h3><p>${esc(m.texto)}</p></li>`)
        .join("")}
    </ul>
  </section>

  <section>
    <p class="label">Ejes temáticos</p>
    <h2>Lo que se repite</h2>
    <div class="themes">
      ${c.temas.map((t) => `<div class="theme"><h3>${esc(t.nombre)}</h3><p>${esc(t.descripcion)}</p></div>`).join("")}
    </div>
  </section>

  ${
    c.patrones?.length
      ? `<section>
    <p class="label">Patrones de escritura</p>
    <h2>Cómo publica</h2>
    <ul class="traits">
      ${c.patrones.map((p) => `<li><b>${esc(p.nombre)}</b><span>${esc(p.descripcion)}</span></li>`).join("")}
    </ul>
  </section>`
      : ""
  }

  ${
    c.musica
      ? `<section>
    <p class="label">Gustos musicales</p>
    <h2>${esc(c.musica.titular || "Lo que escucha")}</h2>
    <ul class="genres">${(c.musica.generos || []).map((g) => `<li class="genre">${esc(g)}</li>`).join("")}</ul>
    ${
      c.musica.artistas?.length
        ? `<p class="artists">Artistas que cita o menciona: ${c.musica.artistas.map((a) => `<b>${esc(a)}</b>`).join(", ")}. ${esc(c.musica.nota || "")}</p>`
        : ""
    }
  </section>`
      : ""
  }

  <section>
    <p class="label">Resultado</p>
    <h2>El álbum</h2>
    <ol class="tracks">
      ${c.canciones.map((s, i) => bloqueCancion(s, i, base)).join("")}
    </ol>
    ${listaBtn(`Ver ${c.canciones.length === 1 ? "el video" : `los ${c.canciones.length} videos`}`)}
  </section>

  <section>
    <p class="label">Créditos</p>
    <p>Análisis de sentimiento asistido por IA. Letras originales escritas con IA, sin copiar publicaciones. Producción con ${esc((c.herramientas || []).join(" y "))}. Publicado el ${esc(c.publicado)}.</p>
  </section>
</main>`;
  return layout({ site, base, titulo: `${c.titulo} · ${site.titulo}`, descripcion: c.resumen, actual: "casos", contenido });
}

const REGLAS = `<div class="rules">
      <div class="rule"><h3>Solo posts públicos</h3><p>Nada de mensajes privados ni cuentas cerradas.</p></div>
      <div class="rule"><h3>Sin datos personales</h3><p>Ni pareja, ni salud, ni ubicación, ni viajes concretos.</p></div>
      <div class="rule"><h3>Con permiso</h3><p>Las cuentas aparecen con nombre solo si su dueña o dueño está de acuerdo.</p></div>
      <div class="rule"><h3>IA declarada</h3><p>Letras, música y portadas están marcadas como generadas con IA.</p></div>
    </div>`;

const TAXONOMIA = ["Confianza", "Alegría", "Gratitud", "Deseo", "Nostalgia", "Introspección", "Irritación", "Tristeza", "Solidaridad"];

function pasosMetodo(ejemplo, base) {
  const enlace = ejemplo ? `<a href="${base}casos/${esc(ejemplo.slug)}/">${esc(ejemplo.titulo)}</a>` : "";
  return [
    {
      id: "recoleccion",
      nombre: "Recolección",
      intro: "Se arma la muestra de publicaciones que representa a la cuenta durante un periodo concreto.",
      entra: "El archivo de datos que la persona descarga de X, o sus posts públicos.",
      mide: "Todavía nada. Se define la ventana de tiempo, normalmente de 3 a 4 meses, para tener suficientes posts sin mezclar etapas muy distintas de la vida de la cuenta.",
      sale: `Una muestra con la fecha de cada post.${ejemplo?.actividad ? ` En ${enlace} fueron ${ejemplo.corpus.posts} posts.` : ""}`,
    },
    {
      id: "limpieza",
      nombre: "Limpieza",
      intro: "Antes de analizar, se quita todo lo que identifica a personas o lugares y se separa lo que no es la voz de la cuenta.",
      entra: "La muestra completa.",
      mide: "Se eliminan enlaces, menciones a otras cuentas, nombres y lugares precisos. Los posts que son versos de canciones se apartan: dicen más del gusto musical que del ánimo.",
      sale: "Un corpus limpio y una lista de canciones y artistas citados.",
    },
    {
      id: "sentimiento",
      nombre: "Sentimiento",
      intro: "Cada post se lee con una lista fija de emociones, la misma para todos los casos, para que los álbumes se puedan comparar.",
      entra: "El corpus limpio.",
      mide: "La emoción principal de cada post, su intensidad (baja, media o alta) y cómo cambia de un mes a otro. El sarcasmo y el humor se marcan antes de clasificar, porque dicen lo contrario de lo que parece.",
      sale: "Los tonos dominantes, los picos emocionales y la franja de ánimo por mes.",
      extra: `<ul class="tones" aria-label="Emociones de la taxonomía">${TAXONOMIA.map((t) => `<li class="tone">${t}</li>`).join("")}</ul>`,
    },
    {
      id: "patrones",
      nombre: "Temas y patrones",
      intro: "Además de cómo se siente, importa de qué habla, cuándo y con quién.",
      entra: "El corpus limpio y las fechas de cada post.",
      mide: "Los temas que se repiten, el ritmo de publicación (días de ráfaga, silencios, picos), el registro (jerga, idiomas, spanglish) y si le habla a su público o a sí misma.",
      sale: `Entre 4 y 6 ejes temáticos y la gráfica de ritmo de publicación.${ejemplo?.actividad ? ` Mira la de ${enlace}.` : ""}`,
    },
    {
      id: "sonido",
      nombre: "Del ánimo al sonido",
      intro: "Cada emoción se traduce en parámetros musicales con una regla fija. Los géneros finales se ajustan a lo que la cuenta escucha.",
      entra: "Los ejes temáticos, los tonos dominantes y los gustos musicales.",
      mide: "Para cada canción: emoción, tempo, energía de la base, tipo de voz y género.",
      sale: "Una ficha de sonido por canción, que luego se convierte en el prompt de estilo.",
      extra: "SONIDO",
    },
    {
      id: "letras",
      nombre: "Escritura",
      intro: "La IA escribe una letra original por cada eje temático elegido.",
      entra: "La ficha de sonido y el eje temático de cada canción.",
      mide: "La letra toma la actitud, las imágenes y el vocabulario general del timeline. Nunca toma frases literales, nombres, lugares, relaciones, salud ni temas delicados. Si un verso suena parecido a un post real, se reescribe.",
      sale: "La letra con su estructura marcada: intro, versos, coro, puente y outro.",
    },
    {
      id: "produccion",
      nombre: "Producción",
      intro: "La letra y la ficha de sonido se convierten en una canción, una portada y un video.",
      entra: "La letra y la ficha de sonido.",
      mide: "El prompt de estilo y las exclusiones para Suno salen de la ficha. Las portadas se generan con Gemini con una figura anónima, sin rostros reconocibles ni logos.",
      sale: "Las canciones, las portadas y los videos en YouTube, marcados como contenido generado con IA.",
    },
  ];
}

export function paginaMetodo({ site, base, casos = [] }) {
  const retiro = site.correo_retiro
    ? `escribe a <b>${esc(site.correo_retiro)}</b>`
    : "escríbeme por cualquiera de los canales del proyecto";
  const ejemplo = casos.find((c) => c.canciones.some((s) => Number.isFinite(s.bpm))) || null;
  const pasos = pasosMetodo(ejemplo, base);

  const tablaSonido = `<div class="table-scroll"><table>
      <thead><tr><th scope="col">Emoción</th><th scope="col">Tempo</th><th scope="col">Base</th><th scope="col">Voz</th><th scope="col">Géneros</th></tr></thead>
      <tbody>${MAPA_SONIDO.map(
        (r) => `<tr><th scope="row">${esc(r.emocion)}</th><td class="num">${r.min}–${r.max} BPM</td><td>${esc(r.base)}</td><td>${esc(r.voz)}</td><td>${esc(r.generos)}</td></tr>`
      ).join("")}</tbody>
    </table></div>
    ${ejemplo ? graficaTempo(ejemplo) : ""}`;

  const bloquePaso = (p, i) => `<article class="method-step" id="${p.id}">
      <header>
        <span class="step-no">${String(i + 1).padStart(2, "0")}</span>
        <h3>${esc(p.nombre)}</h3>
      </header>
      <p>${esc(p.intro)}</p>
      <dl class="io">
        <div><dt>Entra</dt><dd>${esc(p.entra)}</dd></div>
        <div><dt>Qué se hace</dt><dd>${esc(p.mide)}</dd></div>
        <div><dt>Sale</dt><dd>${p.sale}</dd></div>
      </dl>
      ${p.extra === "SONIDO" ? tablaSonido : p.extra || ""}
    </article>`;

  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">Método</p>
    <h1 class="long">Del timeline a la canción</h1>
    <p class="lede">Siete pasos que se repiten en cada caso, para que los álbumes se puedan comparar entre sí.</p>
    <ol class="flow" aria-label="Pasos del método">
      ${pasos.map((p) => `<li><a href="#${p.id}">${esc(p.nombre)}</a></li>`).join("")}
    </ol>
    <p class="note"><b>Versión actual del método: v1.</b> El análisis es una lectura asistida por IA con categorías fijas. La siguiente versión clasificará cada post de forma automática, para que la franja de ánimo salga directamente de los datos.</p>
  </header>

  <section class="method">
    ${pasos.map(bloquePaso).join("")}
  </section>

  <section>
    <p class="label">Límites</p>
    <h2>Lo que el análisis no puede saber</h2>
    <ul class="traits">
      <li><b>Es una muestra</b><span>Unos meses de posts públicos no son la vida entera de nadie. El álbum retrata un timeline, no a una persona.</span></li>
      <li><b>El sarcasmo engaña</b><span>Una queja puede ser un chiste y un elogio puede ser ironía. Por eso se marca el humor antes de clasificar.</span></li>
      <li><b>Lo que no se publica</b><span>Los silencios también dicen algo, pero el análisis solo puede medir que existen, no qué significan.</span></li>
      <li><b>Lectura asistida, no medición</b><span>En la v1 el ánimo por mes es una interpretación con criterios fijos, no un puntaje calculado.</span></li>
    </ul>
  </section>

  <section>
    <p class="label">Reglas</p>
    <h2>Lo que no entra en las canciones</h2>
    ${REGLAS}
  </section>

  <section>
    <p class="label">Retiro</p>
    <h2>Retirar un caso</h2>
    <p>Si un caso habla de tu cuenta y quieres que lo baje, ${retiro}. Lo retiro de la web y de YouTube sin preguntas.</p>
  </section>
</main>`;
  return layout({ site, base, titulo: `Método · ${site.titulo}`, descripcion: "Cómo se convierte un timeline de X en un álbum.", actual: "metodo", contenido });
}

export function paginaParticipa({ site, base }) {
  const boton = site.formulario_url
    ? `<a class="cta" href="${esc(site.formulario_url)}" target="_blank" rel="noopener">Proponer mi cuenta</a>`
    : `<p class="note">El formulario abre pronto.</p>`;
  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">Participa</p>
    <h1 class="long">Convierte tu timeline en un álbum</h1>
    <p class="lede">Propón tu cuenta de X. Si la elijo, analizo tus posts públicos y te devuelvo un álbum hecho a partir de tu estado de ánimo.</p>
    ${boton}
  </header>
  <section>
    <h2>Cómo funciona</h2>
    <ol class="steps">
      <li><div><b>Te postulas.</b> <span>Llenas el formulario con tu usuario de X.</span></div></li>
      <li><div><b>Confirmas que es tu cuenta.</b> <span>Me escribes por DM desde ella o publicas un código que te envío.</span></div></li>
      <li><div><b>Compartes tus datos.</b> <span>Descargas tu archivo desde X (Configuración → Tu cuenta → Descargar un archivo de tus datos) y me pasas solo los posts.</span></div></li>
      <li><div><b>Revisas el borrador.</b> <span>Ves el análisis y las letras antes de publicar, y puedes vetar cualquier tema.</span></div></li>
      <li><div><b>Sale tu álbum.</b> <span>Publico el caso aquí y los videos en YouTube. Eliges si aparece tu usuario o si queda anónimo.</span></div></li>
    </ol>
  </section>
  <section>
    <h2>Las reglas</h2>
    ${REGLAS}
  </section>
</main>`;
  return layout({ site, base, titulo: `Participa · ${site.titulo}`, descripcion: "Propón tu cuenta de X para convertirla en un álbum.", actual: "participa", contenido });
}

export function pagina404({ site, base }) {
  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">404</p>
    <h1 class="long">Esta página no está en el álbum</h1>
    <a class="cta" href="${base}">Volver a los casos</a>
  </header>
</main>`;
  return layout({ site, base, titulo: `No encontrada · ${site.titulo}`, descripcion: site.descripcion, actual: "", contenido });
}
