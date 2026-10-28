// Plantillas HTML del sitio. Cada función devuelve un string.
// Todo texto que viene de los JSON pasa por esc() antes de entrar al HTML.

export const esc = (v) =>
  String(v ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const PLAY = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z"/></svg>';
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const mesCorto = (ym) => {
  const [y, m] = String(ym).split("-");
  return m ? `${MESES[Number(m) - 1]} ${y}` : ym;
};
const periodo = (c) => `${mesCorto(c.corpus.desde)} – ${mesCorto(c.corpus.hasta)}`;
const playlistUrl = (id) => `https://www.youtube.com/playlist?list=${encodeURIComponent(id)}`;

// Título del disco con la segunda mitad en color de acento (LOW + KEY).
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
  <span>Un experimento de ${esc(site.autor)} · ${esc(site.autor_rol)}${canal}</span>
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
    <p class="lede">Analizo los posts públicos de una cuenta de X, mapeo su estado de ánimo y lo convierto en un disco con letras originales y música generada con IA.</p>
    <div class="ctas">
      <a class="cta" href="${base}participa/">Convierte tu timeline en un disco</a>
      <a class="cta ghost" href="${base}metodo/">Cómo funciona</a>
    </div>
  </header>
  <section>
    <p class="label">Casos</p>
    <h2>${casos.length === 1 ? "1 disco" : `${casos.length} discos`} hasta ahora</h2>
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
      <span>~${c.corpus.posts} posts públicos</span><span>${esc(periodo(c))}</span><span>${c.canciones.length} canciones</span>
    </div>
    ${listaBtn("Escuchar la lista en YouTube")}
    ${cuenta}
  </header>

  <section>
    <p class="label">Ficha del perfil</p>
    <h2>Quién habla en el timeline</h2>
    <p>${esc(c.perfil)}</p>
    <div class="facts">
      <div class="fact"><strong>~${c.corpus.posts}</strong><span>publicaciones analizadas</span></div>
      <div class="fact"><strong>${esc(periodo(c))}</strong><span>periodo del análisis</span></div>
      ${c.corpus.ritmo ? `<div class="fact"><strong>Ritmo</strong><span>${esc(c.corpus.ritmo)}</span></div>` : ""}
      ${c.corpus.idiomas ? `<div class="fact"><strong>Idioma</strong><span>${esc(c.corpus.idiomas)}</span></div>` : ""}
    </div>
  </section>

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
    <h2>El disco</h2>
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

export function paginaMetodo({ site, base }) {
  const retiro = site.correo_retiro
    ? `escribe a <b>${esc(site.correo_retiro)}</b>`
    : "escríbeme por cualquiera de los canales del proyecto";
  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">Método</p>
    <h1 class="long">Del timeline a la canción</h1>
    <p class="lede">Cada caso sigue el mismo proceso, para que los discos se puedan comparar entre sí.</p>
  </header>
  <section>
    <h2>El proceso</h2>
    <ol class="steps">
      <li><div><b>Recolectar.</b> <span>Meses de publicaciones, respuestas y reposts públicos, o el archivo de datos que la persona descarga de X.</span></div></li>
      <li><div><b>Encontrar patrones.</b> <span>Temas, jerga, ritmo de publicación y música citada.</span></div></li>
      <li><div><b>Analizar el sentimiento.</b> <span>Mapa del ánimo en el tiempo y sus picos emocionales.</span></div></li>
      <li><div><b>Escribir.</b> <span>La IA convierte cada tema en una letra original, sin copiar posts.</span></div></li>
      <li><div><b>Producir.</b> <span>Música y voz con IA en los géneros que la cuenta escucha, y portadas generadas con IA.</span></div></li>
    </ol>
  </section>
  <section>
    <h2>Las reglas</h2>
    ${REGLAS}
  </section>
  <section>
    <h2>Retirar un caso</h2>
    <p>Si un caso habla de tu cuenta y quieres que lo baje, ${retiro}. Lo retiro de la web y de YouTube sin preguntas.</p>
  </section>
</main>`;
  return layout({ site, base, titulo: `Método · ${site.titulo}`, descripcion: "Cómo se convierte un timeline de X en un disco.", actual: "metodo", contenido });
}

export function paginaParticipa({ site, base }) {
  const boton = site.formulario_url
    ? `<a class="cta" href="${esc(site.formulario_url)}" target="_blank" rel="noopener">Proponer mi cuenta</a>`
    : `<p class="note">El formulario abre pronto.</p>`;
  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">Participa</p>
    <h1 class="long">Convierte tu timeline en un disco</h1>
    <p class="lede">Propón tu cuenta de X. Si la elijo, analizo tus posts públicos y te devuelvo un disco hecho a partir de tu estado de ánimo.</p>
    ${boton}
  </header>
  <section>
    <h2>Cómo funciona</h2>
    <ol class="steps">
      <li><div><b>Te postulas.</b> <span>Llenas el formulario con tu usuario de X.</span></div></li>
      <li><div><b>Confirmas que es tu cuenta.</b> <span>Me escribes por DM desde ella o publicas un código que te envío.</span></div></li>
      <li><div><b>Compartes tus datos.</b> <span>Descargas tu archivo desde X (Configuración → Tu cuenta → Descargar un archivo de tus datos) y me pasas solo los posts.</span></div></li>
      <li><div><b>Revisas el borrador.</b> <span>Ves el análisis y las letras antes de publicar, y puedes vetar cualquier tema.</span></div></li>
      <li><div><b>Sale tu disco.</b> <span>Publico el caso aquí y los videos en YouTube. Eliges si aparece tu usuario o si queda anónimo.</span></div></li>
    </ol>
  </section>
  <section>
    <h2>Las reglas</h2>
    ${REGLAS}
  </section>
</main>`;
  return layout({ site, base, titulo: `Participa · ${site.titulo}`, descripcion: "Propón tu cuenta de X para convertirla en un disco.", actual: "participa", contenido });
}

export function pagina404({ site, base }) {
  const contenido = `<main class="wrap">
  <header class="hero">
    <p class="label">404</p>
    <h1 class="long">Esta página no está en el disco</h1>
    <a class="cta" href="${base}">Volver a los casos</a>
  </header>
</main>`;
  return layout({ site, base, titulo: `No encontrada · ${site.titulo}`, descripcion: site.descripcion, actual: "", contenido });
}
