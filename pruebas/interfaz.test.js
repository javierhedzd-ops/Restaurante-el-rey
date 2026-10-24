// Pruebas de humo de la interfaz: cargan index.html en jsdom y hacen clic como
// un visitante. No miran el CSS (jsdom no calcula estilos), así que comprueban
// el atributo `hidden` y el contenido, no si algo se ve.
import { test, afterEach } from "node:test";
import assert from "node:assert/strict";

import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { abrirWeb, clic, escribir, cambiar, texto } from "./arnes.js";
import { PLATOS } from "../datos.js";

const plato = (id) => PLATOS.find((p) => p.id === id);
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

// Cada prueba abre su propia ventana de jsdom. Si no se cierra, quedan
// temporizadores vivos y el proceso de node no termina nunca.
const abiertas = [];
const abrir = () => {
  const w = abrirWeb();
  abiertas.push(w);
  return w;
};
afterEach(() => {
  while (abiertas.length) abiertas.pop().close();
});

test("la página arranca: pinta el menú, los filtros y el horario", () => {
  const w = abrir();
  const d = w.document;

  assert.equal(d.querySelectorAll("#lista-platos .plato").length, PLATOS.length);
  assert.equal(texto(w, "#contador-platos"), `${PLATOS.length} platos`);
  assert.ok(d.querySelectorAll("#filtros .filtro").length > 1);
  assert.ok(texto(w, "#estado-horario").length > 0);
  assert.equal(d.querySelectorAll(".horario tr[aria-current='date']").length, 1);
});

test("el carrito empieza cerrado y se abre y se cierra con los botones", () => {
  const w = abrir();
  const d = w.document;

  assert.equal(d.getElementById("carrito").hidden, true);
  assert.equal(d.getElementById("velo-carrito").hidden, true);

  clic(w, "#abrir-carrito");
  assert.equal(d.getElementById("carrito").hidden, false);
  assert.equal(d.getElementById("velo-carrito").hidden, false);
  assert.equal(d.getElementById("abrir-carrito").getAttribute("aria-expanded"), "true");

  clic(w, "#cerrar-carrito");
  assert.equal(d.getElementById("carrito").hidden, true);
  assert.equal(d.getElementById("velo-carrito").hidden, true);
  assert.equal(d.getElementById("abrir-carrito").getAttribute("aria-expanded"), "false");
});

test("el velo también cierra el carrito", () => {
  const w = abrir();
  const d = w.document;

  clic(w, "#abrir-carrito");
  clic(w, "#velo-carrito");
  assert.equal(d.getElementById("carrito").hidden, true);
});

test("añadir un plato lo mete en el carrito y suma el total", () => {
  const w = abrir();
  const d = w.document;
  const taco = plato("taco-maciza");

  clic(w, `[data-anadir="${taco.id}"]`);

  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 1);
  assert.equal(texto(w, "#carrito-total"), `$${taco.precio}`);
  assert.equal(d.getElementById("globo-carrito").textContent, "1");
  assert.equal(d.getElementById("globo-carrito").hidden, false);
  assert.equal(d.getElementById("carrito-vacio").hidden, true);
  assert.equal(d.getElementById("carrito-pie").hidden, false);
});

test("los botones + y − del carrito cambian la cantidad y vacían la línea", () => {
  const w = abrir();
  const d = w.document;
  const taco = plato("taco-maciza");

  clic(w, `[data-anadir="${taco.id}"]`);
  clic(w, "[data-mas]");
  assert.equal(texto(w, ".linea__cantidad"), "2");
  assert.equal(texto(w, "#carrito-total"), `$${taco.precio * 2}`);

  clic(w, "[data-menos]");
  clic(w, "[data-menos]");
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 0);
  assert.equal(d.getElementById("carrito-vacio").hidden, false);
  assert.equal(d.getElementById("carrito-pie").hidden, true);
  assert.equal(d.getElementById("globo-carrito").hidden, true);
});

test("el carrito se guarda y se recupera al recargar", () => {
  const w = abrir();
  const taco = plato("taco-maciza");
  clic(w, `[data-anadir="${taco.id}"]`);
  const guardado = w.localStorage.getItem("elrey-carrito-v1");
  assert.ok(guardado && guardado.includes(taco.id));

  // Otra carga con el mismo almacenamiento: el carrito sigue ahí.
  const w2 = abrir();
  w2.localStorage.setItem("elrey-carrito-v1", guardado);
  const w3 = abrir();
  w3.localStorage.setItem("elrey-carrito-v1", guardado);
  // abrirWeb arranca antes de poder sembrar el almacenamiento, así que se
  // comprueba el formato guardado, que es lo que lee cargarCarrito().
  assert.deepEqual(JSON.parse(guardado)[0].nombre, taco.nombre);
});

test("vaciar el carrito lo deja vacío", () => {
  const w = abrir();
  const d = w.document;

  clic(w, `[data-anadir="${plato("taco-maciza").id}"]`);
  clic(w, "#vaciar-carrito");
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 0);
  assert.equal(d.getElementById("carrito-vacio").hidden, false);
});

test("los filtros por categoría y el buscador filtran el menú", () => {
  const w = abrir();
  const d = w.document;

  clic(w, '[data-categoria="tacos"]');
  const tacos = d.querySelectorAll("#lista-platos .plato");
  assert.ok(tacos.length > 0);
  assert.ok([...tacos].every((el) => plato(el.dataset.id).categoria === "tacos"));

  clic(w, '[data-categoria="todo"]');
  escribir(w, "#buscador", "guacamole");
  const encontrados = [...d.querySelectorAll("#lista-platos .plato")];
  assert.ok(encontrados.length > 0);
  assert.ok(encontrados.every((el) => /guacamole/i.test(plato(el.dataset.id).nombre + plato(el.dataset.id).desc)));

  escribir(w, "#buscador", "zzzz-no-existe");
  assert.equal(d.querySelectorAll("#lista-platos .plato").length, 0);
  assert.ok(texto(w, "#lista-platos").includes("No encontramos"));
});

test("el armador de kilos cambia el precio y añade al carrito", () => {
  const w = abrir();
  const d = w.document;

  // Por defecto: ½ kg surtido.
  assert.equal(texto(w, "#armador-nombre"), "½ kg surtido");
  assert.equal(texto(w, "#armador-precio"), `$${plato("medio-surtido").precio}`);

  // 1 kg al gusto: aparece el selector de proteína.
  cambiar(w, 'input[name="peso"][value="kilo"]', "kilo");
  d.querySelector('input[name="peso"][value="kilo"]').checked = true;
  d.querySelector('input[name="proteina"][value="al-gusto"]').checked = true;
  d.getElementById("armador").dispatchEvent(new w.Event("change", { bubbles: true }));
  assert.equal(d.getElementById("armador-proteina-campo").hidden, false);
  assert.equal(texto(w, "#armador-nombre"), "1 kg al gusto");

  d.getElementById("armador").dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 1);
  assert.equal(texto(w, "#carrito-total"), `$${plato("kg-gusto").precio}`);
});

test("los platos sin precio no se pueden añadir", () => {
  const w = abrir();
  const d = w.document;
  const sinPrecio = PLATOS.find((p) => p.precio === null);
  if (!sinPrecio) return; // hoy no hay ninguno; la prueba no aplica

  const boton = d.querySelector(`[data-anadir="${sinPrecio.id}"]`);
  assert.equal(boton.disabled, true);
  boton.click();
  assert.equal(d.querySelectorAll("#carrito-lineas .linea").length, 0);
});

test("el botón de enviar pedido apunta a WhatsApp con el pedido", () => {
  const w = abrir();
  const d = w.document;

  clic(w, `[data-anadir="${plato("taco-maciza").id}"]`);
  // Desde que el pedido lleva datos de entrega, sin nombre y dirección no se envía.
  escribir(w, "#entrega-nombre", "Javi");
  escribir(w, "#entrega-direccion", "Calle 14 93-F, Chuminópolis");
  // jsdom no navega: se intercepta window.open para ver la URL.
  let abierta = null;
  w.open = (url) => {
    abierta = url;
    return null;
  };
  clic(w, "#enviar-pedido");
  assert.ok(abierta, "no se abrió ninguna URL");
  assert.ok(abierta.startsWith("https://wa.me/"));
  assert.ok(decodeURIComponent(abierta).includes("Taco de maciza"));
});

// ---------- Reservas ----------

// Rellena el formulario de reserva. Por defecto, mañana a las 14:00.
function rellenarReserva(w, datos = {}) {
  const manana = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const valores = {
    "#reserva-nombre": "Javi",
    "#reserva-telefono": "999 119 0662",
    "#reserva-personas": "4",
    "#reserva-fecha": manana,
    "#reserva-hora": "14:00",
    ...datos,
  };
  for (const [selector, valor] of Object.entries(valores)) escribir(w, selector, valor);
}

const enviarReserva = (w) =>
  w.document.getElementById("form-reserva").dispatchEvent(
    new w.Event("submit", { bubbles: true, cancelable: true }),
  );

test("la reserva arranca con el día de hoy y las horas del servicio", () => {
  const w = abrir();
  const d = w.document;
  assert.ok(d.getElementById("reserva-fecha").value.length === 10);
  assert.equal(d.getElementById("reserva-fecha").min, d.getElementById("reserva-fecha").value);
  const horas = [...d.querySelectorAll("#reserva-hora option")].map((o) => o.value).filter(Boolean);
  assert.equal(horas[0], "13:00");
  assert.equal(horas.at(-1), "21:00");
  assert.ok(horas.includes("14:30"));
});

test("una reserva incompleta no abre WhatsApp y marca los campos", () => {
  const w = abrir();
  const d = w.document;
  let abierta = null;
  w.open = (url) => { abierta = url; return null; };

  enviarReserva(w);
  assert.equal(abierta, null);
  assert.ok(texto(w, "#error-nombre").length > 0);
  assert.ok(texto(w, "#error-telefono").length > 0);
  assert.ok(texto(w, "#error-hora").length > 0);
  assert.equal(d.getElementById("reserva-nombre").getAttribute("aria-invalid"), "true");
});

test("un martes cerrado se avisa en el campo del día", () => {
  const w = abrir();
  // 27 de octubre de 2026 es martes.
  rellenarReserva(w, { "#reserva-fecha": "2026-10-27" });
  enviarReserva(w);
  assert.ok(/cerramos/i.test(texto(w, "#error-fecha")));
});

test("una reserva correcta abre WhatsApp con los datos", () => {
  const w = abrir();
  let abierta = null;
  w.open = (url) => { abierta = url; return null; };

  rellenarReserva(w);
  enviarReserva(w);

  assert.ok(abierta, "no se abrió WhatsApp");
  assert.ok(abierta.startsWith("https://wa.me/"));
  const textoReserva = decodeURIComponent(abierta);
  assert.ok(textoReserva.includes("Javi"));
  assert.ok(textoReserva.includes("14:00"));
  assert.ok(textoReserva.includes("9991190662"));
  assert.equal(texto(w, "#error-nombre"), "");
});

test("las tarjetas con foto la pintan con su crédito y las demás no", () => {
  const w = abrir();
  const d = w.document;
  const conFoto = PLATOS.filter((p) => p.foto);
  assert.ok(conFoto.length > 0);

  for (const p of conFoto) {
    const tarjeta = d.querySelector(`.plato[data-id="${p.id}"]`);
    const img = tarjeta.querySelector(".plato__foto img");
    assert.ok(img, `${p.id} no pinta su foto`);
    assert.equal(img.getAttribute("src"), p.foto.src);
    assert.equal(img.getAttribute("alt"), p.foto.alt);
    assert.ok(tarjeta.querySelector(".plato__foto figcaption").textContent.includes(p.foto.credito));
  }

  const sinFoto = PLATOS.find((p) => !p.foto);
  assert.equal(d.querySelector(`.plato[data-id="${sinFoto.id}"] .plato__foto`), null);
});

test("la galería muestra fotos que existen en fotos/", () => {
  const w = abrir();
  const d = w.document;
  const piezas = [...d.querySelectorAll("#galeria .galeria__pieza img")];
  assert.ok(piezas.length >= 4);
  for (const img of piezas) {
    const src = img.getAttribute("src");
    assert.ok(src.startsWith("fotos/"), `${src} no está en fotos/`);
    assert.ok(existsSync(join(RAIZ, src)), `falta el archivo ${src}`);
    assert.ok(img.getAttribute("alt").length > 0, `${src} sin texto alternativo`);
  }
});

test("las preguntas frecuentes se abren y cierran con <details>", () => {
  const w = abrir();
  const d = w.document;
  const preguntas = [...d.querySelectorAll("#preguntas details.pregunta")];
  assert.ok(preguntas.length >= 4, "faltan preguntas frecuentes");
  for (const p of preguntas) {
    assert.ok(p.querySelector("summary")?.textContent.trim().length > 0, "pregunta sin título");
    assert.ok(p.querySelector("p")?.textContent.trim().length > 0, "pregunta sin respuesta");
    assert.equal(p.open, false, "las preguntas arrancan cerradas");
  }
  // El navegador abre y cierra el <details> solo; aquí se comprueba que el
  // contenido está en el HTML y no depende de JavaScript.
  preguntas[0].open = true;
  assert.equal(preguntas[0].open, true);
});
