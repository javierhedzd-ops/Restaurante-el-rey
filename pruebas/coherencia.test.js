// Coherencia entre index.html y datos.js.
//
// Algunos precios y teléfonos van escritos en el HTML (la tarjeta del kilo, el
// cierre de la carta, las preguntas, Visítanos) para que se vean sin JS. Si el
// dueño cambia un precio en datos.js y nadie toca el HTML, la página diría dos
// precios distintos. Estas pruebas lo detectan. También comprueban que cada
// foto o archivo que pide la página exista de verdad en el proyecto.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { NEGOCIO, PLATOS } from "../datos.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(RAIZ, "index.html"), "utf8");
const precio = (id) => PLATOS.find((p) => p.id === id).precio;

test("los precios del kilo escritos en el HTML coinciden con datos.js", () => {
  const surtido = precio("kg-surtida");
  const alGusto = precio("kg-gusto");
  const medioDesde = Math.min(...PLATOS.filter((p) => p.id.startsWith("medio-")).map((p) => p.precio));

  // La tarjeta del kilo en la portada.
  assert.match(html, new RegExp(`hero__tarjeta-precio">\\$${surtido} <small>el kilo surtido`));
  // Cierre de la carta y pregunta frecuente: kilo surtido, al gusto y medio kilo.
  const frases = html.match(/El kilo surtido cuesta \$\d+[\s\S]*?Medio kilo desde \$\d+/g) || [];
  assert.ok(frases.length >= 2, "faltan las frases de precios del cierre de la carta o de las preguntas");
  for (const frase of frases) {
    const [s, g, m] = frase.match(/\$(\d+)/g).map((x) => Number(x.slice(1)));
    assert.deepEqual([s, g, m], [surtido, alGusto, medioDesde], `precios desactualizados en: ${frase.replace(/\s+/g, " ")}`);
  }
});

test("los teléfonos del HTML son los de datos.js", () => {
  const validos = new Set([NEGOCIO.telefonoPedidos, "52" + NEGOCIO.telefonoFijo.replace(/\s/g, "")]);
  const usados = [...html.matchAll(/(?:tel:\+|wa\.me\/)(\d+)/g)].map((m) => m[1]);
  assert.ok(usados.length > 0);
  for (const t of usados) assert.ok(validos.has(t), `teléfono que no está en datos.js: ${t}`);
});

test("cada archivo local que pide la página existe (fotos, mapa, estilos, scripts)", () => {
  const rutas = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map((m) => m[1]).filter((r) => !r.startsWith("//"));
  assert.ok(rutas.includes("fotos/mapa.svg"), "el mapa de Visítanos no está en la página");
  for (const ruta of rutas) assert.ok(existsSync(join(RAIZ, ruta)), `falta ${ruta}`);
});
