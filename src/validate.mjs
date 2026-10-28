// Valida la estructura de un caso antes de generar su página.
// Devuelve una lista de errores legibles; vacía si el caso está bien.

const CONSENTIMIENTOS = ["anonimo", "con-permiso"];
const isStr = (v) => typeof v === "string" && v.trim().length > 0;
const isArr = (v) => Array.isArray(v) && v.length > 0;

export function validarCaso(caso, archivo) {
  const e = [];
  const req = (cond, msg) => { if (!cond) e.push(`${archivo}: ${msg}`); };

  req(isStr(caso.slug) && /^[a-z0-9-]+$/.test(caso.slug), "\"slug\" debe tener solo minúsculas, números y guiones");
  req(isStr(caso.titulo), "falta \"titulo\"");
  req(isStr(caso.resumen), "falta \"resumen\"");
  req(isStr(caso.publicado) && !Number.isNaN(Date.parse(caso.publicado)), "\"publicado\" debe ser una fecha AAAA-MM-DD");
  req(CONSENTIMIENTOS.includes(caso.consentimiento), `"consentimiento" debe ser uno de: ${CONSENTIMIENTOS.join(", ")}`);

  if (caso.consentimiento === "con-permiso") {
    req(isStr(caso.cuenta?.handle), "con \"con-permiso\" hay que poner cuenta.handle");
  }
  if (caso.consentimiento === "anonimo") {
    req(!caso.cuenta?.handle && !caso.cuenta?.url, "un caso anónimo no puede llevar cuenta.handle ni cuenta.url");
  }

  req(Number.isInteger(caso.corpus?.posts) && caso.corpus.posts > 0, "corpus.posts debe ser un número entero mayor que 0");
  req(isStr(caso.perfil), "falta \"perfil\"");
  req(isStr(caso.sentimiento?.titular), "falta sentimiento.titular");
  req(isArr(caso.animo_por_mes), "\"animo_por_mes\" necesita al menos un mes");
  (caso.animo_por_mes || []).forEach((m, i) => {
    req(isStr(m.etiqueta) && isStr(m.texto), `animo_por_mes[${i}] necesita "etiqueta" y "texto"`);
    req(/^#[0-9a-fA-F]{6}$/.test(m.color || ""), `animo_por_mes[${i}].color debe ser un color hex como #e2a93b`);
  });
  req(isArr(caso.temas), "\"temas\" necesita al menos un tema");
  req(isArr(caso.canciones), "\"canciones\" necesita al menos una canción");
  (caso.canciones || []).forEach((c, i) => {
    req(isStr(c.titulo), `canciones[${i}] necesita "titulo"`);
    req(isStr(c.animo) && isStr(c.genero), `canciones[${i}] necesita "animo" y "genero"`);
    if (c.youtube_id != null) req(/^[\w-]{6,20}$/.test(c.youtube_id), `canciones[${i}].youtube_id no parece un ID de YouTube`);
  });
  if (caso.actividad != null) {
    const entradas = Object.entries(caso.actividad);
    req(entradas.length > 0, "\"actividad\" está vacío");
    entradas.forEach(([d, n]) => {
      req(/^\d{4}-\d{2}-\d{2}$/.test(d) && Number.isInteger(n) && n >= 0, `actividad["${d}"] debe ser una fecha AAAA-MM-DD con un número entero`);
    });
    const total = entradas.reduce((a, [, n]) => a + n, 0);
    req(total === caso.corpus?.posts, `la suma de "actividad" (${total}) no coincide con corpus.posts (${caso.corpus?.posts})`);
    (caso.eventos || []).forEach((ev, i) => req(ev.fecha in caso.actividad, `eventos[${i}].fecha no tiene datos en "actividad"`));
  }
  if (caso.playlist_youtube_id != null) {
    req(/^[\w-]{10,64}$/.test(caso.playlist_youtube_id), "playlist_youtube_id no parece un ID de lista de YouTube");
  }
  return e;
}
