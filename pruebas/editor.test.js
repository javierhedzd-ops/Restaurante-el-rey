// El editor de la carta (admin.html): reescribe PLATOS en datos.js sin tocar
// lo demás y pone al día los precios que index.html trae escritos.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { CATEGORIAS, PLATOS } from "../datos.js";
import { serializarPlatos, reemplazarPlatos, idDesdeNombre, validarPlatos, preciosEnHTML } from "../editor.js";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const datosJs = readFileSync(join(RAIZ, "datos.js"), "utf8");
const html = readFileSync(join(RAIZ, "index.html"), "utf8");
const copia = () => PLATOS.map((p) => ({ ...p, etiquetas: [...p.etiquetas] }));

// Evalúa el bloque PLATOS generado como JavaScript y devuelve la lista.
const evaluar = (bloque) => new Function(bloque.replace("export const PLATOS =", "return"))();

test("sin cambios, datos.js sale idéntico (mismo formato a mano)", () => {
  assert.equal(reemplazarPlatos(datosJs, PLATOS, CATEGORIAS), datosJs);
});

test("lo escrito se vuelve a leer igual, también con comillas, saltos y acentos", () => {
  const platos = copia();
  platos[0] = { ...platos[0], nombre: 'Taco "especial" de ½ kg', desc: "Línea 1\nlínea 2 \\ y más" };
  assert.deepEqual(evaluar(serializarPlatos(platos, CATEGORIAS)), platos);
});

test("cambiar, añadir y quitar productos solo toca el bloque PLATOS", () => {
  const platos = copia().filter((p) => p.id !== "quesadillas");
  platos.find((p) => p.id === "kg-surtida").precio = 250;
  platos.push({ id: "taco-lengua", nombre: "Taco de lengua", precio: 55, categoria: "tacos", desc: "", etiquetas: ["picante"] });
  const nuevo = reemplazarPlatos(datosJs, platos, CATEGORIAS);
  const [antesA, antesB] = [datosJs.split("export const PLATOS = [")[0], datosJs.split("\n];")[datosJs.split("\n];").length - 1]];
  assert.ok(nuevo.startsWith(antesA), "lo de antes de PLATOS queda igual");
  assert.ok(nuevo.includes("export const FOTOS"), "FOTOS sigue ahí");
  const leidos = evaluar(nuevo.slice(nuevo.indexOf("export const PLATOS"), nuevo.indexOf("\n];", nuevo.indexOf("export const PLATOS")) + 3));
  assert.equal(leidos.find((p) => p.id === "kg-surtida").precio, 250);
  assert.ok(!leidos.some((p) => p.id === "quesadillas"));
  // El taco nuevo se agrupa con los tacos, aunque se añadió al final.
  const ids = leidos.map((p) => p.id);
  assert.ok(ids.indexOf("taco-lengua") < ids.indexOf("torta-maciza"));
  assert.ok(antesB.length > 0);
});

test("idDesdeNombre: corto, sin acentos y sin repetir", () => {
  assert.equal(idDesdeNombre("Taco de Lengua"), "taco-de-lengua");
  assert.equal(idDesdeNombre("½ kg de Buche", []), "medio-kg-de-buche");
  assert.equal(idDesdeNombre("Taco de lengua", ["taco-de-lengua"]), "taco-de-lengua-2");
  assert.equal(idDesdeNombre("!!!"), "plato");
});

test("validarPlatos: avisa de precio, nombre, categoría e ids repetidos", () => {
  assert.deepEqual(validarPlatos(PLATOS, CATEGORIAS), []);
  const malos = [
    { id: "a", nombre: "", precio: 10, categoria: "tacos", desc: "", etiquetas: [] },
    { id: "b", nombre: "Caro", precio: 12.5, categoria: "tacos", desc: "", etiquetas: [] },
    { id: "c", nombre: "Sin categoría", precio: 10, categoria: "nada", desc: "", etiquetas: [] },
    { id: "c", nombre: "Repetido", precio: null, categoria: "tacos", desc: "", etiquetas: [] },
  ];
  const errores = validarPlatos(malos, CATEGORIAS).join(" | ");
  assert.match(errores, /falta el nombre/);
  assert.match(errores, /"Caro": el precio/);
  assert.match(errores, /"Sin categoría": elige una categoría/);
  assert.match(errores, /"Repetido": el identificador está repetido/);
  assert.match(validarPlatos([], CATEGORIAS).join(), /vacía/);
});

test("preciosEnHTML: sin cambios deja el HTML igual; con cambios pone los precios nuevos en sus tres sitios", () => {
  assert.equal(preciosEnHTML(html, PLATOS).html, html);
  const platos = copia();
  platos.find((p) => p.id === "kg-surtida").precio = 1250;
  platos.find((p) => p.id === "kg-gusto").precio = 300;
  const { html: nuevo, avisos } = preciosEnHTML(html, platos);
  assert.deepEqual(avisos, []);
  assert.match(nuevo, /hero__tarjeta-precio">\$1,250 <small>el kilo surtido/);
  assert.equal((nuevo.match(/El kilo surtido cuesta \$1,250/g) || []).length, 2);
  assert.equal((nuevo.match(/el kilo al gusto \$300/g) || []).length, 2);
  // Y la siguiente vez lo vuelve a encontrar aunque lleve coma de miles.
  platos.find((p) => p.id === "kg-surtida").precio = 240;
  assert.match(preciosEnHTML(nuevo, platos).html, /hero__tarjeta-precio">\$240 /);
});

test("preciosEnHTML: si falta el kilo surtido, no inventa precios y avisa", () => {
  const { html: nuevo, avisos } = preciosEnHTML(html, PLATOS.filter((p) => p.id !== "kg-surtida"));
  assert.equal(nuevo, html);
  assert.equal(avisos.length, 2);
});
