// Pedido a domicilio: el carrito pide nombre y dirección (o solo el nombre si
// pasan a recogerlo) y los manda en el mensaje de WhatsApp.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { PLATOS } from "../datos.js";
import { agregarAlCarrito, mensajePedido, urlWhatsApp, validarEntrega } from "../logica.js";
import { abrirWeb, clic, escribir } from "./arnes.js";

const taco = PLATOS.find((p) => p.id === "taco-maciza");
const carrito = agregarAlCarrito([], taco);
const domicilio = { modo: "domicilio", nombre: "Javi", direccion: "Calle 14 93-F, Chuminópolis", referencias: "Casa verde" };

// ---------- Lógica ----------

test("validarEntrega: a domicilio pide nombre y dirección; para recoger, solo nombre", () => {
  assert.deepEqual(validarEntrega(domicilio), {});
  assert.deepEqual(Object.keys(validarEntrega({ modo: "domicilio" })).sort(), ["direccion", "nombre"]);
  assert.deepEqual(Object.keys(validarEntrega({ nombre: "Javi" })), ["direccion"], "sin modo cuenta como domicilio");
  assert.deepEqual(validarEntrega({ modo: "recoger", nombre: "Javi" }), {});
  assert.deepEqual(Object.keys(validarEntrega({ modo: "recoger", nombre: " " })), ["nombre"]);
  assert.ok(validarEntrega({ ...domicilio, direccion: "x".repeat(161) }).direccion);
  assert.ok(validarEntrega({ ...domicilio, referencias: "x".repeat(161) }).referencias);
});

test("mensajePedido: a domicilio lleva nombre, dirección y referencias", () => {
  const m = mensajePedido(carrito, undefined, domicilio);
  assert.match(m, /Total: \$49\n\nPara entrega a domicilio:\nNombre: Javi\nDirección: Calle 14 93-F, Chuminópolis\nReferencias: Casa verde\n\n¿Me confirman disponibilidad y tiempo de entrega\?$/);
});

test("mensajePedido: para recoger lleva el nombre y no pide dirección", () => {
  const m = mensajePedido(carrito, undefined, { modo: "recoger", nombre: "Javi", direccion: "no se usa" });
  assert.match(m, /Paso a recogerlo\.\nNombre: Javi/);
  assert.doesNotMatch(m, /Dirección/);
  assert.match(m, /a qué hora paso\?$/);
});

test("mensajePedido sin entrega es el de siempre, y los saltos de línea del cliente no rompen el mensaje", () => {
  assert.doesNotMatch(mensajePedido(carrito), /Nombre:/);
  const m = mensajePedido(carrito, undefined, { ...domicilio, direccion: "Calle 14\n93-F", referencias: "" });
  assert.match(m, /Dirección: Calle 14 93-F\n/);
  assert.doesNotMatch(m, /Referencias/);
  assert.ok(decodeURIComponent(urlWhatsApp(carrito, undefined, domicilio)).includes("Dirección: Calle 14 93-F"));
});

// ---------- Interfaz ----------

const abiertas = [];
const abrir = () => {
  const w = abrirWeb();
  abiertas.push(w);
  return w;
};
afterEach(() => {
  while (abiertas.length) abiertas.pop().close();
});

function conPedido() {
  const w = abrir();
  clic(w, `[data-anadir="${taco.id}"]`);
  clic(w, "#abrir-carrito"); // el botón de enviar se pulsa con el carrito abierto
  w.abiertas = [];
  w.open = (url) => {
    w.abiertas.push(url);
    return null;
  };
  return w;
}

test("sin nombre ni dirección no se envía: avisa en cada campo y lleva el foco al primero", () => {
  const w = conPedido();
  const d = w.document;
  clic(w, "#enviar-pedido");
  assert.equal(w.abiertas.length, 0);
  assert.match(d.getElementById("error-entrega-nombre").textContent, /nombre/);
  assert.match(d.getElementById("error-entrega-direccion").textContent, /dirección/);
  assert.equal(d.getElementById("entrega-nombre").getAttribute("aria-invalid"), "true");
  assert.equal(d.activeElement.id, "entrega-nombre");
  // Al escribir el nombre, su aviso se va y el de la dirección se queda.
  escribir(w, "#entrega-nombre", "Javi");
  assert.equal(d.getElementById("error-entrega-nombre").textContent, "");
  assert.notEqual(d.getElementById("error-entrega-direccion").textContent, "");
});

test("a domicilio: el mensaje de WhatsApp lleva nombre y dirección, y se recuerdan para la próxima", () => {
  const w = conPedido();
  escribir(w, "#entrega-nombre", "Javi");
  escribir(w, "#entrega-direccion", "Calle 14 93-F, Chuminópolis");
  escribir(w, "#entrega-referencias", "Casa verde");
  clic(w, "#enviar-pedido");
  assert.equal(w.abiertas.length, 1);
  const texto = decodeURIComponent(w.abiertas[0]);
  assert.match(texto, /Taco de maciza/);
  assert.match(texto, /Nombre: Javi\nDirección: Calle 14 93-F, Chuminópolis\nReferencias: Casa verde/);
  const guardada = JSON.parse(w.localStorage.getItem("elrey-entrega-v1"));
  assert.equal(guardada.direccion, "Calle 14 93-F, Chuminópolis");
});

test("paso a recogerlo: esconde la dirección y basta con el nombre", () => {
  const w = conPedido();
  const d = w.document;
  const recoger = d.querySelector('input[name="entrega-modo"][value="recoger"]');
  recoger.checked = true;
  recoger.dispatchEvent(new w.Event("change", { bubbles: true }));
  assert.equal(d.getElementById("entrega-domicilio").hidden, true);
  escribir(w, "#entrega-nombre", "Javi");
  clic(w, "#enviar-pedido");
  assert.equal(w.abiertas.length, 1);
  assert.match(decodeURIComponent(w.abiertas[0]), /Paso a recogerlo\.\nNombre: Javi/);
});
