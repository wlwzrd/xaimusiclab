// Gráficas en SVG generadas en el build. Sin librerías.
// Colores: solo tokens del tema (var(--mark), var(--line), var(--muted)...), así funcionan en claro y oscuro.

import { esc, fechaCorta, mesNombre, MESES_LARGOS } from "./util.mjs";

const DIA = 86400000;
const aFecha = (iso) => Date.UTC(...iso.split("-").map((n, i) => (i === 1 ? Number(n) - 1 : Number(n))));
const aIso = (t) => new Date(t).toISOString().slice(0, 10);
const techo = (max, paso) => Math.max(paso, Math.ceil(max / paso) * paso);

// Barra con la punta redondeada y la base recta, apoyada en el eje.
function barra(x, y, w, base) {
  const r = Math.min(2, w / 2, base - y);
  return `M${x},${base}V${y + r}Q${x},${y} ${x + r},${y}H${x + w - r}Q${x + w},${y} ${x + w},${y + r}V${base}Z`;
}

// ---------------------------------------------------------------------------
// Ritmo de publicación: posts por día, con eventos anotados.
// caso.actividad = { "2026-07-08": 1, ... }  ·  caso.eventos = [{ fecha, texto }]
// ---------------------------------------------------------------------------
export function graficaActividad(caso) {
  const datos = caso.actividad;
  const fechas = Object.keys(datos).sort();
  const inicio = aFecha(`${fechas[0].slice(0, 7)}-01`);
  const ultimo = new Date(aFecha(fechas[fechas.length - 1]));
  const fin = Date.UTC(ultimo.getUTCFullYear(), ultimo.getUTCMonth() + 1, 0);
  const dias = [];
  for (let t = inicio; t <= fin; t += DIA) dias.push(aIso(t));

  const W = 720, H = 250, ml = 30, mr = 8, mt = 34, mb = 28;
  const ancho = W - ml - mr, alto = H - mt - mb, base = mt + alto;
  const paso = ancho / dias.length;
  const bw = Math.max(1.5, paso - 1.5);
  const max = Math.max(...Object.values(datos));
  const ymax = techo(max, 5);
  const y = (v) => base - (v / ymax) * alto;

  const grid = [];
  for (let v = 0; v <= ymax; v += 5) {
    grid.push(`<line x1="${ml}" x2="${W - mr}" y1="${y(v)}" y2="${y(v)}" class="${v === 0 ? "axis" : "grid"}"/>`);
    grid.push(`<text x="${ml - 6}" y="${y(v) + 4}" text-anchor="end" class="tick">${v}</text>`);
  }

  const meses = [];
  dias.forEach((d, i) => {
    if (d.endsWith("-01")) {
      const x = ml + i * paso;
      meses.push(`<line x1="${x}" x2="${x}" y1="${base}" y2="${base + 5}" class="axis"/>`);
      meses.push(`<text x="${x + 3}" y="${base + 18}" class="tick">${mesNombre(Number(d.slice(5, 7)) - 1)}</text>`);
    }
  });

  const barras = dias
    .map((d, i) => {
      const n = datos[d] || 0;
      const x = ml + i * paso;
      const etiqueta = `${fechaCorta(d)}: ${n} ${n === 1 ? "post" : "posts"}`;
      return `<g class="day"><title>${esc(etiqueta)}</title><rect class="hit" x="${x}" y="${mt}" width="${paso}" height="${alto}"/>${
        n ? `<path class="mark" d="${barra(x + (paso - bw) / 2, y(n), bw, base)}"/>` : ""
      }</g>`;
    })
    .join("");

  const eventos = (caso.eventos || [])
    .filter((e) => dias.includes(e.fecha))
    .map((e) => {
      const i = dias.indexOf(e.fecha);
      const x = ml + i * paso + paso / 2;
      const alFinal = x > W * 0.7;
      const n = datos[e.fecha] || 0;
      return `<line x1="${x}" x2="${x}" y1="${mt - 18}" y2="${y(n) - 4}" class="ann-line"/>
        <text x="${alFinal ? x + 4 : x - 4}" y="${mt - 22}" text-anchor="${alFinal ? "end" : "start"}" class="ann">${esc(e.texto)}</text>`;
    })
    .join("");

  // Tabla equivalente, por mes.
  const porMes = {};
  for (const [d, n] of Object.entries(datos)) {
    const k = d.slice(0, 7);
    porMes[k] ??= { posts: 0, dias: 0, pico: 0, diaPico: d };
    porMes[k].posts += n;
    porMes[k].dias += 1;
    if (n > porMes[k].pico) Object.assign(porMes[k], { pico: n, diaPico: d });
  }
  const total = Object.values(datos).reduce((a, b) => a + b, 0);
  const filas = Object.entries(porMes)
    .sort()
    .map(
      ([k, m]) =>
        `<tr><th scope="row">${MESES_LARGOS[Number(k.slice(5, 7)) - 1]}</th><td>${m.posts}</td><td>${m.dias}</td><td>${m.pico} (${esc(fechaCorta(m.diaPico))})</td></tr>`
    )
    .join("");

  return `<figure class="chart">
    <figcaption><b>Posts por día</b><span>${total} posts en ${fechas.length} días con actividad. Pasa el cursor por una barra para ver el día.</span></figcaption>
    <div class="chart-scroll">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Gráfica de barras con los posts publicados por día">
        ${grid.join("")}${meses.join("")}${barras}${eventos}
      </svg>
    </div>
    <details class="chart-table">
      <summary>Ver los datos por mes</summary>
      <div class="table-scroll"><table>
        <thead><tr><th scope="col">Mes</th><th scope="col">Posts</th><th scope="col">Días activos</th><th scope="col">Día con más posts</th></tr></thead>
        <tbody>${filas}</tbody>
      </table></div>
    </details>
  </figure>`;
}

// ---------------------------------------------------------------------------
// Del ánimo al sonido: el tempo de cada canción frente al rango de referencia
// que el método asigna a su emoción.
// ---------------------------------------------------------------------------
export const MAPA_SONIDO = [
  { emocion: "Confianza", animos: ["Confianza"], min: 95, max: 105, base: "Percusión marcada, bajo pesado", voz: "Rapeada con actitud, coro gritado", generos: "Dembow, reggaetón" },
  { emocion: "Introspección", animos: ["Introspección", "Nostalgia"], min: 65, max: 75, base: "Half-time, piano oscuro, mucho espacio", voz: "Íntima, casi susurrada", generos: "Trap melódico, R&B" },
  { emocion: "Fiesta", animos: ["La noche", "Fiesta", "Alegría"], min: 90, max: 100, base: "Dembow clásico, sintes cortos", voz: "Coros grupales, llamada y respuesta", generos: "Perreo" },
  { emocion: "Libertad", animos: ["Libertad"], min: 90, max: 100, base: "Log drum, guitarra cálida", voz: "Suave, respirada", generos: "Afrobeats, R&B latino" },
  { emocion: "Raíz y homenaje", animos: ["Raíz", "Solidaridad"], min: 170, max: 190, base: "Balada que rompe en orquesta", voz: "Potente, con coro", generos: "Salsa" },
];

export const reglaPara = (animo) => MAPA_SONIDO.find((r) => r.animos.includes(animo));

export function graficaTempo(caso) {
  const canciones = caso.canciones.filter((s) => Number.isFinite(s.bpm));
  const W = 720, fila = 44, mt = 12, mb = 34, ml = 230, mr = 40;
  const H = mt + canciones.length * fila + mb;
  const lo = 60, hi = 200;
  const x = (bpm) => ml + ((bpm - lo) / (hi - lo)) * (W - ml - mr);
  const base = mt + canciones.length * fila;

  const ticks = [];
  for (let v = lo; v <= hi; v += 20) {
    ticks.push(`<line x1="${x(v)}" x2="${x(v)}" y1="${mt}" y2="${base}" class="grid"/>`);
    ticks.push(`<text x="${x(v)}" y="${base + 18}" text-anchor="middle" class="tick">${v}</text>`);
  }

  const filas = canciones
    .map((s, i) => {
      const cy = mt + i * fila + fila / 2;
      const r = reglaPara(s.animo);
      const banda = r
        ? `<rect class="band" x="${x(r.min)}" y="${cy - 8}" width="${x(r.max) - x(r.min)}" height="16" rx="3"><title>${esc(`Rango de referencia para ${r.emocion}: ${r.min}–${r.max} BPM`)}</title></rect>`
        : "";
      return `<g class="row">
        <text x="0" y="${cy - 3}" class="row-title">${esc(s.titulo)}</text>
        <text x="0" y="${cy + 13}" class="tick">${esc(s.animo)}</text>
        ${banda}
        <circle class="dot" cx="${x(s.bpm)}" cy="${cy}" r="6"><title>${esc(`${s.titulo}: ${s.bpm} BPM`)}</title></circle>
        <text x="${Math.max(x(s.bpm) + 11, r ? x(r.max) + 6 : 0)}" y="${cy + 4}" class="value">${s.bpm}</text>
      </g>`;
    })
    .join("");

  return `<figure class="chart">
    <figcaption><b>Tempo de cada canción de ${esc(caso.titulo)}</b><span>Beats por minuto (BPM) frente al rango que el método asigna a su emoción.</span></figcaption>
    <ul class="legend" aria-label="Leyenda">
      <li><span class="key key-band"></span>Rango de referencia</li>
      <li><span class="key key-dot"></span>Tempo de la canción</li>
    </ul>
    <div class="chart-scroll">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tempo de cada canción comparado con su rango de referencia">
        ${ticks.join("")}<line x1="${ml}" x2="${W - mr}" y1="${base}" y2="${base}" class="axis"/>
        <text x="${W - mr}" y="${base + 32}" text-anchor="end" class="tick">BPM</text>
        ${filas}
      </svg>
    </div>
  </figure>`;
}
