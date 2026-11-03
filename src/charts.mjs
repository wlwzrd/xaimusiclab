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
// Del ánimo al sonido (método v1.1): la emoción define la energía, la dinámica
// y la voz. El tempo lo define el género que escucha la cuenta.
// ---------------------------------------------------------------------------
export const MAPA_SONIDO = [
  { emocion: "Confianza", energia: "Alta", dinamica: "Golpe firme, coro que se grita", voz: "Con actitud, segura", ejemplos: "Dembow (LOWKEY), salsa (DE ROTA A REINA)" },
  { emocion: "Alegría y fiesta", energia: "Alta", dinamica: "Ritmo bailable, llamada y respuesta", voz: "Coros grupales, pícara", ejemplos: "Perreo, reggaetón viejo" },
  { emocion: "Deseo", energia: "Media", dinamica: "Groove constante, espacio para la voz", voz: "Sensual o tierna, cercana", ejemplos: "Afrobeats, bachata" },
  { emocion: "Introspección", energia: "Baja", dinamica: "Mucho espacio, pocas capas", voz: "Íntima, casi susurrada", ejemplos: "Trap melódico, R&B" },
  { emocion: "Tristeza", energia: "Baja", dinamica: "Crece de a poco hasta un coro que estalla", voz: "Frágil pero firme", ejemplos: "Balada, despecho urbano" },
  { emocion: "Miedo", energia: "Media", dinamica: "Tensión que se resuelve en calma", voz: "Narrativa, de crónica", ejemplos: "Vallenato" },
  { emocion: "Irritación", energia: "Media-alta", dinamica: "Directa, sin adornos", voz: "Cortante, de 'se acabó'", ejemplos: "Regional mexicano" },
  { emocion: "Raíz y solidaridad", energia: "De baja a alta", dinamica: "Balada que rompe en orquesta", voz: "Potente, con coro", ejemplos: "Salsa" },
];

// Tempo de cada canción, en el orden del álbum.
export function graficaTempo(caso) {
  const canciones = caso.canciones.filter((s) => Number.isFinite(s.bpm));
  const W = 720, fila = 44, mt = 12, mb = 34, ml = 230, mr = 40;
  const H = mt + canciones.length * fila + mb;
  const lo = 60, hi = 200;
  const x = (bpm) => ml + ((bpm - lo) / (hi - lo)) * (W - ml - mr);
  const base = mt + canciones.length * fila;
  const cy = (i) => mt + i * fila + fila / 2;

  const ticks = [];
  for (let v = lo; v <= hi; v += 20) {
    ticks.push(`<line x1="${x(v)}" x2="${x(v)}" y1="${mt}" y2="${base}" class="grid"/>`);
    ticks.push(`<text x="${x(v)}" y="${base + 18}" text-anchor="middle" class="tick">${v}</text>`);
  }
  const camino = canciones.map((s, i) => `${i ? "L" : "M"}${x(s.bpm)},${cy(i)}`).join("");
  const filas = canciones
    .map(
      (s, i) => `<g class="row">
        <text x="0" y="${cy(i) - 3}" class="row-title">${esc(s.titulo)}</text>
        <text x="0" y="${cy(i) + 13}" class="tick">${esc(s.animo)} · ${esc(s.genero)}</text>
        <circle class="dot" cx="${x(s.bpm)}" cy="${cy(i)}" r="6"><title>${esc(`${s.titulo}: ${s.bpm} BPM, ${s.genero}`)}</title></circle>
        <text x="${x(s.bpm) + 11}" y="${cy(i) + 4}" class="value">${s.bpm}</text>
      </g>`
    )
    .join("");

  return `<figure class="chart">
    <figcaption><b>Tempo de cada canción de ${esc(caso.titulo)}</b><span>Beats por minuto (BPM), en el orden del álbum. El tempo sale del género, no de la emoción.</span></figcaption>
    <div class="chart-scroll">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Tempo de cada canción del álbum, en orden">
        ${ticks.join("")}<line x1="${ml}" x2="${W - mr}" y1="${base}" y2="${base}" class="axis"/>
        <text x="${W - mr}" y="${base + 32}" text-anchor="end" class="tick">BPM</text>
        <path d="${camino}" class="path"/>
        ${filas}
      </svg>
    </div>
  </figure>`;
}

// ---------------------------------------------------------------------------
// Distribución de emociones: cuántos posts recibieron cada emoción.
// caso.emociones = { "Deseo": 44, ... }  (método v1.1, una etiqueta por post)
// ---------------------------------------------------------------------------
export function graficaEmociones(caso) {
  const filas = Object.entries(caso.emociones).sort((a, b) => b[1] - a[1]);
  const total = filas.reduce((a, [, n]) => a + n, 0);
  const W = 720, fila = 30, mt = 6, mb = 6, ml = 130, mr = 70;
  const H = mt + filas.length * fila + mb;
  const max = filas[0][1];
  const x = (n) => (n / max) * (W - ml - mr);
  const barras = filas
    .map(([emo, n], i) => {
      const y = mt + i * fila;
      const pct = Math.round((n / total) * 100);
      const w = Math.max(2, x(n));
      return `<g class="row"><title>${esc(`${emo}: ${n} posts (${pct}%)`)}</title>
        <text x="${ml - 10}" y="${y + 19}" text-anchor="end" class="row-title">${esc(emo)}</text>
        <path class="mark" d="M${ml},${y + 6}H${ml + w - 3}Q${ml + w},${y + 6} ${ml + w},${y + 9}V${y + 21}Q${ml + w},${y + 24} ${ml + w - 3},${y + 24}H${ml}Z"/>
        <text x="${ml + w + 8}" y="${y + 19}" class="value">${n} · ${pct}%</text>
      </g>`;
    })
    .join("");
  return `<figure class="chart">
    <figcaption><b>Emoción principal de cada post</b><span>${total} posts, una etiqueta por post.</span></figcaption>
    <div class="chart-scroll">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cantidad de posts por emoción">
        <line x1="${ml}" x2="${ml}" y1="${mt}" y2="${H - mb}" class="axis"/>
        ${barras}
      </svg>
    </div>
  </figure>`;
}
