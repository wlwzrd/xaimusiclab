// Servidor local mínimo para revisar dist/ en http://localhost:4321
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const dist = join(dirname(fileURLToPath(import.meta.url)), "dist");
const port = Number(process.env.PORT) || 4321;
const tipos = {
  ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
  ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
};

createServer(async (req, res) => {
  const ruta = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^(\.\.[/\\])+/, "");
  let archivo = join(dist, ruta);
  try {
    if ((await stat(archivo)).isDirectory()) archivo = join(archivo, "index.html");
    res.writeHead(200, { "content-type": tipos[extname(archivo)] || "application/octet-stream" });
    res.end(await readFile(archivo));
  } catch {
    res.writeHead(404, { "content-type": tipos[".html"] });
    res.end(await readFile(join(dist, "404.html")).catch(() => "404"));
  }
}).listen(port, () => console.log(`→ http://localhost:${port}`));
