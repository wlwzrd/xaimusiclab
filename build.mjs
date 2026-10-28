// Genera el sitio estático en dist/ a partir de content/casos/*.json.
// Sin dependencias: solo Node 18+.
//
//   node build.mjs            → genera dist/
//   node build.mjs --check    → solo valida los casos
//   BASE_PATH=/repo/ node build.mjs  → para GitHub Pages en un subdirectorio

import { readFile, readdir, writeFile, mkdir, rm, cp } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { validarCaso } from "./src/validate.mjs";
import { paginaInicio, paginaCaso, paginaMetodo, paginaParticipa, pagina404 } from "./src/templates.mjs";

const raiz = dirname(fileURLToPath(import.meta.url));
const dist = join(raiz, "dist");
const soloValidar = process.argv.includes("--check");

let base = process.env.BASE_PATH || "/";
if (!base.startsWith("/")) base = "/" + base;
if (!base.endsWith("/")) base += "/";

const site = JSON.parse(await readFile(join(raiz, "site.config.json"), "utf8"));

// Los archivos que empiezan por "_" (como _plantilla.json) no se publican.
const dirCasos = join(raiz, "content", "casos");
const archivos = (await readdir(dirCasos)).filter((f) => f.endsWith(".json") && !f.startsWith("_"));

const casos = [];
const errores = [];
for (const archivo of archivos) {
  let caso;
  try {
    caso = JSON.parse(await readFile(join(dirCasos, archivo), "utf8"));
  } catch (err) {
    errores.push(`${archivo}: JSON inválido (${err.message})`);
    continue;
  }
  errores.push(...validarCaso(caso, archivo));
  casos.push(caso);
}
const slugs = casos.map((c) => c.slug);
slugs.filter((s, i) => slugs.indexOf(s) !== i).forEach((s) => errores.push(`slug repetido: "${s}"`));

if (errores.length) {
  console.error(`✗ ${errores.length} error(es) en los casos:\n  - ${errores.join("\n  - ")}`);
  process.exit(1);
}
console.log(`✓ ${casos.length} caso(s) válidos: ${slugs.join(", ") || "ninguno"}`);
if (soloValidar) process.exit(0);

casos.sort((a, b) => b.publicado.localeCompare(a.publicado));

async function escribir(ruta, html) {
  const destino = join(dist, ruta);
  await mkdir(dirname(destino), { recursive: true });
  await writeFile(destino, html);
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
await cp(join(raiz, "public"), dist, { recursive: true, filter: (src) => !src.endsWith(".gitkeep") });
await cp(join(raiz, "src", "styles.css"), join(dist, "styles.css"));

await escribir("index.html", paginaInicio({ site, base, casos }));
await escribir("metodo/index.html", paginaMetodo({ site, base, casos }));
await escribir("participa/index.html", paginaParticipa({ site, base }));
await escribir("404.html", pagina404({ site, base }));
for (const caso of casos) {
  await escribir(`casos/${caso.slug}/index.html`, paginaCaso({ site, base, caso }));
}

console.log(`✓ Sitio generado en dist/ (base "${base}", ${casos.length + 4} páginas)`);
