// Pruebas de los botones: que cada uno haga lo que promete y que el teclado no
// se pierda. Salen de la auditoría del 24/10/2026 (Playwright pulsando todo):
// Escape robaba el foco, "Preguntar" no hacía nada, Vaciar no se podía
// deshacer y +/− dejaban el foco en el aire al repintar la lista.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

import { abrirWeb, clic } from "./arnes.js";
import { PLATOS, NEGOCIO } from "../datos.js";
import { urlPregunta } from "../logica.js";

const abiertas = [];
const abrir = () => {
  const w = abrirWeb();
  abiertas.push(w);
  return w;
};
afterEach(() => {
  while (abiertas.length) abiertas.pop().close();
});

const conPrecio = PLATOS.find((p) => p.precio !== null && !p.opciones);
const tecla = (w, key) => w.document.dispatchEvent(new w.KeyboardEvent("keydown", { key, bubbles: true }));

test("urlPregunta: WhatsApp del negocio con la pregunta por ese plato", () => {
  const url = urlPregunta({ nombre: "Cervezas y coctelería" }, NEGOCIO);
  assert.ok(url.startsWith(`https://wa.me/${NEGOCIO.telefonoPedidos}?text=`));
  const texto = decodeURIComponent(url.split("?text=")[1]);
  assert.match(texto, /cervezas y coctelería/);
  assert.match(texto, /^Hola/);
});

test("Escape con el carrito cerrado no mueve el foco", () => {
  const w = abrir();
  const d = w.document;
  const buscador = d.getElementById("buscador");
  buscador.focus();
  tecla(w, "Escape");
  assert.equal(d.activeElement, buscador);
  assert.equal(d.getElementById("carrito").hidden, true);
});

test("Escape con el carrito abierto lo cierra y devuelve el foco a Mi pedido", () => {
  const w = abrir();
  const d = w.document;
  clic(w, "#abrir-carrito");
  assert.equal(d.getElementById("carrito").hidden, false);
  tecla(w, "Escape");
  assert.equal(d.getElementById("carrito").hidden, true);
  assert.equal(d.activeElement.id, "abrir-carrito");
});

test("Añadir confirma en el mismo botón y el globo late", () => {
  const w = abrir();
  const d = w.document;
  const boton = clic(w, `[data-anadir="${conPrecio.id}"]`);
  assert.ok(boton.classList.contains("hecho"), "el botón no dice Añadido");
  assert.ok(boton.querySelector(".boton-anadir__hecho"), "falta la etiqueta Añadido");
  assert.ok(d.getElementById("globo-carrito").classList.contains("globo--late"));
});

test("+ y − dejan el foco en el mismo botón aunque la lista se repinte", () => {
  const w = abrir();
  const d = w.document;
  clic(w, `[data-anadir="${conPrecio.id}"]`);
  clic(w, "#abrir-carrito");
  const mas = d.querySelector("[data-mas]");
  mas.focus();
  mas.click();
  assert.equal(d.activeElement.getAttribute("data-mas"), mas.getAttribute("data-mas"));
  assert.notEqual(d.activeElement, mas, "la lista debía repintarse (botón nuevo)");

  const menos = d.querySelector("[data-menos]");
  menos.click(); // 2 → 1
  menos.ownerDocument.querySelector("[data-menos]").click(); // 1 → 0: la línea se va
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 0);
  assert.ok(d.getElementById("carrito").contains(d.activeElement), "el foco se salió del carrito");
});

test("Vaciar deja Deshacer con el foco y Deshacer recupera el pedido", () => {
  const w = abrir();
  const d = w.document;
  clic(w, `[data-anadir="${conPrecio.id}"]`);
  clic(w, `[data-anadir="${conPrecio.id}"]`);
  clic(w, "#abrir-carrito");

  clic(w, "#vaciar-carrito");
  const deshacer = d.getElementById("deshacer-vaciar");
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 0);
  assert.equal(deshacer.hidden, false);
  assert.equal(d.activeElement, deshacer);

  clic(w, "#deshacer-vaciar");
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 1);
  assert.equal(d.getElementById("globo-carrito").textContent, "2");
  assert.equal(deshacer.hidden, true);
});

test("Deshacer desaparece en cuanto se añade algo nuevo", () => {
  const w = abrir();
  const d = w.document;
  clic(w, `[data-anadir="${conPrecio.id}"]`);
  clic(w, "#vaciar-carrito");
  assert.equal(d.getElementById("deshacer-vaciar").hidden, false);
  clic(w, `[data-anadir="${conPrecio.id}"]`);
  assert.equal(d.getElementById("deshacer-vaciar").hidden, true);
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 1);
});

test("ningún botón de la página está deshabilitado de entrada", () => {
  // Un botón gris que no hace nada parece roto (así estaba "Preguntar").
  const w = abrir();
  const muertos = [...w.document.querySelectorAll("button[disabled]")].map((b) => b.textContent.trim());
  assert.deepEqual(muertos, []);
});
