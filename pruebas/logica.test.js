// Pruebas de la lógica pura (sin DOM). Ejecutar: node --test
import { test } from "node:test";
import assert from "node:assert/strict";

import { NEGOCIO, PLATOS } from "../datos.js";
import {
  formatearPrecio,
  filtrarPlatos,
  estadoHorario,
  diaSemana,
  agregarAlCarrito,
  cambiarCantidad,
  totalCarrito,
  piezasCarrito,
  mensajePedido,
  urlWhatsApp,
  fechaHoy,
  validarReserva,
  mensajeReserva,
  urlWhatsAppReserva,
  RESERVA_MAX_PERSONAS,
} from "../logica.js";

// Mérida es UTC-6 todo el año (no tiene horario de verano).
const enMerida = (dia, hora, minuto = 0) =>
  new Date(Date.UTC(2026, 9, dia, hora + 6, minuto));

test("formatearPrecio: número, cero y null", () => {
  assert.equal(formatearPrecio(49), "$49");
  assert.equal(formatearPrecio(1234), "$1,234");
  assert.equal(formatearPrecio(null), "Consultar");
});

test("filtrarPlatos: por categoría", () => {
  const tacos = filtrarPlatos(PLATOS, "tacos", "");
  assert.ok(tacos.length > 0);
  assert.ok(tacos.every((p) => p.categoria === "tacos"));
});

test("filtrarPlatos: 'todo' devuelve todos", () => {
  assert.equal(filtrarPlatos(PLATOS, "todo", "").length, PLATOS.length);
});

test("filtrarPlatos: busca en nombre y descripción sin distinguir mayúsculas", () => {
  const resultado = filtrarPlatos(PLATOS, "todo", "GUACAMOLE");
  assert.ok(resultado.length >= 3);
  assert.ok(resultado.every((p) => (p.nombre + p.desc).toLowerCase().includes("guacamole")));
});

test("filtrarPlatos: categoría y texto se combinan", () => {
  const resultado = filtrarPlatos(PLATOS, "entradas", "guacamole");
  assert.ok(resultado.every((p) => p.categoria === "entradas"));
});

test("estadoHorario: viernes a las 15:00 está abierto", () => {
  // 23 de octubre de 2026 es viernes.
  const estado = estadoHorario(enMerida(23, 15));
  assert.equal(estado.abierto, true);
  assert.match(estado.texto, /Abierto/);
});

test("estadoHorario: viernes a las 23:00 está cerrado y abre mañana", () => {
  const estado = estadoHorario(enMerida(23, 23));
  assert.equal(estado.abierto, false);
  assert.match(estado.texto, /mañana/);
});

test("estadoHorario: martes cerrado, abre el miércoles", () => {
  // 27 de octubre de 2026 es martes.
  const estado = estadoHorario(enMerida(27, 14));
  assert.equal(estado.abierto, false);
  assert.match(estado.texto, /miércoles/);
});

test("estadoHorario: antes de abrir avisa de la hora de hoy", () => {
  const estado = estadoHorario(enMerida(23, 10));
  assert.equal(estado.abierto, false);
  assert.match(estado.texto, /hoy a las 13:00/);
});

test("estadoHorario: usa la zona del negocio, no la del visitante", () => {
  // 23:30 UTC del viernes = 17:30 en Mérida: abierto.
  const estado = estadoHorario(new Date(Date.UTC(2026, 9, 23, 23, 30)));
  assert.equal(estado.abierto, true);
});

test("carrito: añadir suma cantidades con las mismas opciones", () => {
  const taco = PLATOS.find((p) => p.id === "taco-maciza");
  let carrito = agregarAlCarrito([], taco);
  carrito = agregarAlCarrito(carrito, taco);
  assert.equal(carrito.length, 1);
  assert.equal(carrito[0].cantidad, 2);
});

test("carrito: distintas opciones son líneas distintas", () => {
  const taco = PLATOS.find((p) => p.id === "taco-gusto");
  let carrito = agregarAlCarrito([], taco, "Maciza");
  carrito = agregarAlCarrito(carrito, taco, "Buche");
  assert.equal(carrito.length, 2);
});

test("carrito: cambiarCantidad quita la línea al llegar a cero", () => {
  const taco = PLATOS.find((p) => p.id === "taco-maciza");
  const carrito = agregarAlCarrito([], taco);
  const vacio = cambiarCantidad(carrito, carrito[0].clave, -1);
  assert.equal(vacio.length, 0);
});

test("carrito: total y piezas", () => {
  const taco = PLATOS.find((p) => p.id === "taco-maciza"); // 49
  const torta = PLATOS.find((p) => p.id === "torta-maciza"); // 105
  let carrito = agregarAlCarrito([], taco);
  carrito = agregarAlCarrito(carrito, taco);
  carrito = agregarAlCarrito(carrito, torta);
  assert.equal(totalCarrito(carrito), 49 * 2 + 105);
  assert.equal(piezasCarrito(carrito), 3);
});

test("carrito: los platos sin precio no suman al total", () => {
  const cervezas = PLATOS.find((p) => p.id === "cervezas");
  const carrito = agregarAlCarrito([], cervezas);
  assert.equal(totalCarrito(carrito), 0);
});

test("mensajePedido: incluye líneas, opciones y total", () => {
  const taco = PLATOS.find((p) => p.id === "taco-gusto");
  const carrito = agregarAlCarrito([], taco, "Buche");
  const mensaje = mensajePedido(carrito);
  assert.match(mensaje, /1 × Taco al gusto \(Buche\)/);
  assert.match(mensaje, /Total: \$49/);
  assert.match(mensaje, /Chuminópolis/);
});

test("mensajePedido: carrito vacío devuelve cadena vacía", () => {
  assert.equal(mensajePedido([]), "");
});

test("diaSemana: usa la zona horaria del restaurante, no la del visitante", () => {
  // Viernes 23 de octubre de 2026, 23:30 en Mérida (ya es sábado en UTC).
  assert.equal(diaSemana(enMerida(23, 23, 30)), 5);
  // Domingo 25 a las 00:30 en Mérida (en UTC sigue siendo domingo, pero es el caso límite).
  assert.equal(diaSemana(enMerida(25, 0, 30)), 0);
  // Martes 27: día de descanso.
  assert.equal(diaSemana(enMerida(27, 14)), 2);
});

test("urlWhatsApp: apunta al número del negocio y codifica el texto", () => {
  const taco = PLATOS.find((p) => p.id === "taco-maciza");
  const url = urlWhatsApp(agregarAlCarrito([], taco));
  assert.ok(url.startsWith(`https://wa.me/${NEGOCIO.telefonoPedidos}?text=`));
  assert.ok(!url.includes(" "));
  assert.ok(url.includes("Taco%20de%20maciza"));
});

// ---------- Reservas ----------
// Viernes 23 de octubre de 2026, 12:00 en Mérida (UTC-6).
const viernesMediodia = enMerida(23, 12);

const reservaBuena = {
  nombre: "Javi",
  telefono: "999 119 0662",
  personas: 4,
  fecha: "2026-10-23",
  hora: "14:00",
  notas: "",
};

test("fechaHoy: usa la zona del restaurante, no la del visitante", () => {
  // 23:30 en Mérida ya es el día 24 en UTC.
  assert.equal(fechaHoy(enMerida(23, 23, 30)), "2026-10-23");
  assert.equal(fechaHoy(enMerida(24, 0, 30)), "2026-10-24");
});

test("validarReserva: una reserva correcta no da errores", () => {
  assert.deepEqual(validarReserva(reservaBuena, viernesMediodia), {});
});

test("validarReserva: nombre y teléfono", () => {
  assert.ok(validarReserva({ ...reservaBuena, nombre: " " }, viernesMediodia).nombre);
  assert.ok(validarReserva({ ...reservaBuena, nombre: "x".repeat(61) }, viernesMediodia).nombre);
  assert.ok(validarReserva({ ...reservaBuena, telefono: "12345" }, viernesMediodia).telefono);
  assert.ok(validarReserva({ ...reservaBuena, telefono: "abc" }, viernesMediodia).telefono);
  // Con lada de país y separadores sí vale.
  assert.equal(validarReserva({ ...reservaBuena, telefono: "+52 999-119-0662" }, viernesMediodia).telefono, undefined);
});

test("validarReserva: personas entre 1 y el máximo", () => {
  assert.ok(validarReserva({ ...reservaBuena, personas: 0 }, viernesMediodia).personas);
  assert.ok(validarReserva({ ...reservaBuena, personas: 2.5 }, viernesMediodia).personas);
  assert.ok(validarReserva({ ...reservaBuena, personas: RESERVA_MAX_PERSONAS + 1 }, viernesMediodia).personas);
  assert.equal(validarReserva({ ...reservaBuena, personas: RESERVA_MAX_PERSONAS }, viernesMediodia).personas, undefined);
});

test("validarReserva: fecha pasada, martes cerrado y fecha mal escrita", () => {
  assert.ok(validarReserva({ ...reservaBuena, fecha: "2026-10-22" }, viernesMediodia).fecha);
  assert.ok(validarReserva({ ...reservaBuena, fecha: "2026-10-27" }, viernesMediodia).fecha); // martes
  assert.ok(validarReserva({ ...reservaBuena, fecha: "23/10/2026" }, viernesMediodia).fecha);
});

test("validarReserva: hora dentro del servicio y no en el pasado", () => {
  assert.ok(validarReserva({ ...reservaBuena, hora: "12:00" }, viernesMediodia).hora);
  assert.ok(validarReserva({ ...reservaBuena, hora: "21:30" }, viernesMediodia).hora);
  assert.ok(validarReserva({ ...reservaBuena, hora: "" }, viernesMediodia).hora);
  // Hoy a las 12:00 no se puede reservar para las 12:00 ni antes.
  assert.ok(validarReserva({ ...reservaBuena, hora: "12:00" }, viernesMediodia).hora);
  assert.equal(validarReserva({ ...reservaBuena, hora: "13:00" }, viernesMediodia).hora, undefined);
  // Mañana a la misma hora sí.
  assert.equal(validarReserva({ ...reservaBuena, fecha: "2026-10-24", hora: "13:00" }, viernesMediodia).hora, undefined);
});

test("mensajeReserva: lleva los datos y la fecha en formato mexicano", () => {
  const texto = mensajeReserva({ ...reservaBuena, notas: "Cumpleaños" });
  assert.ok(texto.includes("Javi"));
  assert.ok(texto.includes("4"));
  assert.ok(texto.includes("23/10/2026"));
  assert.ok(texto.includes("14:00"));
  assert.ok(texto.includes("9991190662"));
  assert.ok(texto.includes("Cumpleaños"));
  assert.ok(!mensajeReserva(reservaBuena).includes("Notas:"));
});

test("urlWhatsAppReserva: apunta al número del negocio y codifica el texto", () => {
  const url = urlWhatsAppReserva(reservaBuena);
  assert.ok(url.startsWith(`https://wa.me/${NEGOCIO.telefonoPedidos}?text=`));
  assert.ok(decodeURIComponent(url).includes("Javi"));
});
