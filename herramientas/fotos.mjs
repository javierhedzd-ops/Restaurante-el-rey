// Deja index.html al día con las fotos de datos.js (FOTOS y las de PLATOS).
//
// Cada foto de la página es un <figure data-foto="hueco">. Este script le pone
// a su <img> el src, el alt y las medidas reales del archivo, escribe el pie
// (<figcaption>) y rehace los créditos del pie de página. Así, para cambiar una
// foto solo se toca datos.js (y el archivo), nunca el HTML a mano.
//
//   npm run fotos              escribe index.html
//   npm run fotos -- --revisar sale con 1 si index.html no está al día (no escribe)
// Después, si se trabaja con la maqueta, se copia index.html a maqueta/ (ARI.md).
//
// Sin dependencias: lee las medidas de JPEG, PNG y SVG por su cuenta.
import { readFileSync, writeFileSync, existsSync, openSync, readSync, closeSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FOTOS, PLATOS } from "../datos.js";
import { creditosFotos } from "../logica.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

const escaparTexto = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escaparAtributo = (t) => escaparTexto(t).replace(/"/g, "&quot;");

// Ancho y alto de una imagen leyendo su cabecera (JPEG, PNG o SVG con width/height o viewBox).
export function medidas(ruta) {
  const buf = Buffer.alloc(256 * 1024);
  const fd = openSync(ruta, "r");
  const n = readSync(fd, buf, 0, buf.length, 0);
  closeSync(fd);
  const b = buf.subarray(0, n);
  if (b[0] === 0x89 && b.toString("ascii", 1, 4) === "PNG") return { ancho: b.readUInt32BE(16), alto: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i + 9 < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const marca = b[i + 1];
      const largo = b.readUInt16BE(i + 2);
      // SOF0..SOF15 salvo DHT (C4), JPG (C8) y DAC (CC): ahí van las medidas.
      if (marca >= 0xc0 && marca <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marca)) return { alto: b.readUInt16BE(i + 5), ancho: b.readUInt16BE(i + 7) };
      i += 2 + largo;
    }
  }
  const texto = b.toString("utf8");
  if (/<svg\b/.test(texto)) {
    const w = texto.match(/<svg\b[^>]*\bwidth="(\d+(?:\.\d+)?)"/);
    const h = texto.match(/<svg\b[^>]*\bheight="(\d+(?:\.\d+)?)"/);
    if (w && h) return { ancho: Math.round(+w[1]), alto: Math.round(+h[1]) };
    const vb = texto.match(/viewBox="[\d.\s-]*?(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)"/);
    if (vb) return { ancho: Math.round(+vb[1]), alto: Math.round(+vb[2]) };
  }
  throw new Error(`no sé leer las medidas de ${ruta} (usa JPEG, PNG o SVG)`);
}

// Cambia en un <img ...> los atributos dados y deja el resto (clase, loading, fetchpriority…) como estaban.
function ponerAtributos(img, valores) {
  let out = img;
  for (const [nombre, valor] of Object.entries(valores)) {
    const re = new RegExp(`\\s${nombre}="[^"]*"`);
    const nuevo = ` ${nombre}="${escaparAtributo(valor)}"`;
    out = re.test(out) ? out.replace(re, nuevo) : out.replace(/^<img\b/, `<img${nuevo}`);
  }
  return out;
}

/**
 * Devuelve el HTML con cada <figure data-foto> y los créditos del pie al día.
 * medidasDe(src) da { ancho, alto } de cada archivo (en las pruebas se puede fingir).
 */
export function sincronizar(html, { fotos = FOTOS, platos = PLATOS, medidasDe = (src) => medidas(join(RAIZ, src)) } = {}) {
  const usados = new Set();
  let out = html.replace(/(<figure\b[^>]*\bdata-foto="([^"]+)"[^>]*>)([\s\S]*?)(<\/figure>)/g, (todo, abre, hueco, dentro, cierra) => {
    const f = fotos[hueco];
    if (!f) throw new Error(`index.html pide la foto "${hueco}", que no está en FOTOS (datos.js)`);
    usados.add(hueco);
    const { ancho, alto } = medidasDe(f.src);
    let nuevo = dentro.replace(/<img\b[^>]*>/, (img) => ponerAtributos(img, { src: f.src, alt: f.alt, width: ancho, height: alto }));
    nuevo = nuevo.replace(/<figcaption\b([^>]*)>[\s\S]*?<\/figcaption>/, (_, atr) => {
      const sinHidden = atr.replace(/\s+hidden\b/, "");
      return f.pie ? `<figcaption${sinHidden}>${escaparTexto(f.pie)}</figcaption>` : `<figcaption${sinHidden} hidden></figcaption>`;
    });
    return abre + nuevo + cierra;
  });
  const sobran = Object.keys(fotos).filter((h) => !usados.has(h));
  if (sobran.length) throw new Error(`FOTOS tiene huecos que index.html no usa: ${sobran.join(", ")}`);

  const creditos = creditosFotos(fotos, platos);
  const texto = creditos.length
    ? `Créditos de las fotos: ${creditos.map(escaparTexto).join("; ")}. Créditos completos en <a class="enlace" href="fotos/CREDITOS.md">la lista de fotos</a>.`
    : "Fotos de Carnitas Michoacán El Rey.";
  out = out.replace(/(<p class="pie__creditos">)[\s\S]*?(<\/p>)/, `$1\n    ${texto}\n  $2`);
  return out;
}

// Uso desde la terminal.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const revisar = process.argv.includes("--revisar");
  const ruta = join(RAIZ, "index.html");
  for (const f of Object.values(FOTOS)) if (!existsSync(join(RAIZ, f.src))) { console.error(`Falta el archivo ${f.src}`); process.exit(1); }
  const antes = readFileSync(ruta, "utf8");
  const despues = sincronizar(antes);
  if (despues === antes) console.log("index.html ya estaba al día con las fotos de datos.js.");
  else if (revisar) { console.log("index.html NO está al día con datos.js. Corre: npm run fotos"); process.exit(1); }
  else { writeFileSync(ruta, despues); console.log("index.html: fotos, medidas y créditos al día."); }
}
