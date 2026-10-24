// Fotos que se pueden cambiar: cada foto de la página tiene un hueco con nombre
// (<figure data-foto="…">) y sus datos en FOTOS (datos.js). `npm run fotos`
// deja index.html al día. Estas pruebas comprueban que lo está y que el
// cambio de una foto llega a su <img>, a su pie y a los créditos.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { FOTOS, PLATOS } from "../datos.js";
import { creditosFotos } from "../logica.js";
import { sincronizar, medidas } from "../herramientas/fotos.mjs";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(RAIZ, "index.html"), "utf8");
const fingir = () => ({ ancho: 800, alto: 600 });

test("index.html está al día con FOTOS (si falla: npm run fotos)", () => {
  assert.equal(sincronizar(html), html);
});

test("cada hueco de FOTOS está una vez en index.html y su archivo es de fotos/sitio/", () => {
  for (const [hueco, f] of Object.entries(FOTOS)) {
    assert.equal(html.split(`data-foto="${hueco}"`).length - 1, 1, `hueco ${hueco}`);
    assert.match(f.src, /^fotos\//);
    assert.ok(f.alt && f.alt.length > 5, `falta alt en ${hueco}`);
  }
});

test("cambiar una foto en FOTOS cambia su img, su pie y los créditos", () => {
  const fotos = { ...FOTOS, portada: { src: "fotos/sitio/portada.jpg", alt: "El cazo del Rey", pie: "", credito: null } };
  const out = sincronizar(html, { fotos, medidasDe: fingir });
  const figura = out.match(/<figure[^>]*data-foto="portada"[^>]*>[\s\S]*?<\/figure>/)[0];
  assert.match(figura, /alt="El cazo del Rey"/);
  assert.match(figura, /width="800"/);
  assert.match(figura, /height="600"/);
  assert.match(figura, /<figcaption[^>]*hidden><\/figcaption>/, "sin pie, el figcaption se esconde");
  assert.match(figura, /fetchpriority="high"/, "los demás atributos se quedan");
  // Ferfive sigue en los créditos porque la galería-1 es suya.
  assert.match(out, /Créditos de las fotos: [^<]*Ferfive/);
});

test("con todas las fotos propias, el pie de página no inventa créditos", () => {
  const propias = Object.fromEntries(Object.entries(FOTOS).map(([h, f]) => [h, { ...f, pie: "", credito: null }]));
  const out = sincronizar(html, { fotos: propias, platos: [], medidasDe: fingir });
  assert.match(out, /<p class="pie__creditos">\s*Fotos de Carnitas Michoacán El Rey\.\s*<\/p>/);
});

test("un hueco que falta o que sobra se avisa en vez de romper la página en silencio", () => {
  const { portada, ...sinPortada } = FOTOS;
  assert.throws(() => sincronizar(html, { fotos: sinPortada, medidasDe: fingir }), /pide la foto "portada"/);
  assert.throws(() => sincronizar(html, { fotos: { ...FOTOS, extra: portada }, medidasDe: fingir }), /no usa: extra/);
});

test("lee las medidas reales de JPEG y SVG", () => {
  assert.deepEqual(medidas(join(RAIZ, "fotos/sitio/portada.jpg")), { ancho: 1280, alto: 1700 });
  assert.deepEqual(medidas(join(RAIZ, "fotos/mapa.svg")), { ancho: 640, alto: 400 });
});

test("creditosFotos: sin repetir, en orden y sin las fotos propias", () => {
  const fotos = { a: { credito: "Ana · CC0" }, b: { credito: null }, c: { credito: "Ana · CC0" } };
  const platos = [{ foto: { credito: "Beto · CC BY 4.0" } }, { foto: null }, {}];
  assert.deepEqual(creditosFotos(fotos, platos), ["Ana · CC0", "Beto · CC BY 4.0"]);
  assert.deepEqual(creditosFotos({}, []), []);
  assert.ok(creditosFotos(FOTOS, PLATOS).length > 0);
});
