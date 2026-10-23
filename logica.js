// Carnitas Michoacán El Rey — lógica pura, sin DOM.
// Todo lo que se puede probar sin navegador vive aquí.

import { NEGOCIO } from "./datos.js";

/** Formatea un precio en pesos. null → "Consultar". */
export function formatearPrecio(precio) {
  if (precio === null || precio === undefined) return "Consultar";
  return "$" + precio.toLocaleString("es-MX");
}

/** Filtra los platos por categoría ("todo" = todos) y por texto de búsqueda. */
export function filtrarPlatos(platos, categoria, texto) {
  const busqueda = (texto || "").trim().toLowerCase();
  return platos.filter((plato) => {
    if (categoria && categoria !== "todo" && plato.categoria !== categoria) return false;
    if (!busqueda) return true;
    const heno = (plato.nombre + " " + plato.desc).toLowerCase();
    return heno.includes(busqueda);
  });
}

/**
 * Estado del restaurante en un instante dado.
 * Devuelve { abierto, texto } con el texto listo para mostrar.
 * Usa la zona horaria del negocio, no la del visitante.
 */
export function estadoHorario(ahora, negocio = NEGOCIO) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: negocio.zonaHoraria,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(ahora);

  const valor = (tipo) => partes.find((p) => p.type === tipo)?.value;
  const dias = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const dia = dias[valor("weekday")];
  const hora = Number(valor("hour")) % 24;
  const minuto = Number(valor("minute"));
  const minutosAhora = hora * 60 + minuto;

  const hoy = negocio.horario[dia];
  if (hoy) {
    const [apertura, cierre] = hoy;
    if (minutosAhora >= apertura * 60 && minutosAhora < cierre * 60) {
      return { abierto: true, texto: `Abierto ahora · cierra a las ${cierre}:00` };
    }
    if (minutosAhora < apertura * 60) {
      return { abierto: false, texto: `Cerrado · abre hoy a las ${apertura}:00` };
    }
  }

  // Buscar el próximo día con servicio (máximo una semana).
  for (let salto = 1; salto <= 7; salto++) {
    const siguiente = (dia + salto) % 7;
    const tramo = negocio.horario[siguiente];
    if (!tramo) continue;
    const nombres = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
    // Si hoy no hay servicio, el próximo día con servicio se nombra siempre
    // ("abre el miércoles"): "abre mañana" no dice qué día es.
    const cuando = hoy && salto === 1 ? "mañana" : "el " + nombres[siguiente];
    return { abierto: false, texto: `Cerrado · abre ${cuando} a las ${tramo[0]}:00` };
  }
  return { abierto: false, texto: "Cerrado" };
}

/**
 * Día de la semana en el restaurante (0 = domingo … 6 = sábado).
 * Se calcula con la zona horaria del negocio, no con la del visitante.
 */
export function diaSemana(ahora, negocio = NEGOCIO) {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: negocio.zonaHoraria,
    weekday: "short",
  }).formatToParts(ahora);
  const valor = partes.find((p) => p.type === "weekday")?.value;
  return { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[valor];
}

/** Añade un plato al carrito. Si ya existe con las mismas opciones, suma cantidad. */
export function agregarAlCarrito(carrito, plato, opciones = "") {
  const clave = plato.id + (opciones ? "|" + opciones : "");
  const existente = carrito.find((linea) => linea.clave === clave);
  if (existente) {
    return carrito.map((linea) =>
      linea.clave === clave ? { ...linea, cantidad: linea.cantidad + 1 } : linea
    );
  }
  return [
    ...carrito,
    {
      clave,
      id: plato.id,
      nombre: plato.nombre,
      precio: plato.precio,
      opciones,
      cantidad: 1,
    },
  ];
}

/** Cambia la cantidad de una línea. Si llega a 0, la quita. */
export function cambiarCantidad(carrito, clave, delta) {
  return carrito
    .map((linea) =>
      linea.clave === clave ? { ...linea, cantidad: linea.cantidad + delta } : linea
    )
    .filter((linea) => linea.cantidad > 0);
}

/** Total del carrito. Los platos sin precio (Consultar) no suman. */
export function totalCarrito(carrito) {
  return carrito.reduce(
    (total, linea) => total + (linea.precio || 0) * linea.cantidad,
    0
  );
}

/** Número de piezas del carrito (para el globo del botón). */
export function piezasCarrito(carrito) {
  return carrito.reduce((n, linea) => n + linea.cantidad, 0);
}

/** Arma el texto del pedido para WhatsApp. */
export function mensajePedido(carrito, negocio = NEGOCIO) {
  if (!carrito.length) return "";
  const lineas = carrito.map((linea) => {
    const opciones = linea.opciones ? ` (${linea.opciones})` : "";
    const precio = linea.precio ? ` — ${formatearPrecio(linea.precio * linea.cantidad)}` : "";
    return `• ${linea.cantidad} × ${linea.nombre}${opciones}${precio}`;
  });
  const total = totalCarrito(carrito);
  return [
    `Hola, quiero pedir a ${negocio.nombre} (${negocio.sucursal}):`,
    "",
    ...lineas,
    "",
    `Total: ${formatearPrecio(total)}`,
    "",
    "¿Me confirman disponibilidad y tiempo de entrega?",
  ].join("\n");
}

/** URL de WhatsApp con el pedido ya escrito. */
export function urlWhatsApp(carrito, negocio = NEGOCIO) {
  const texto = mensajePedido(carrito, negocio);
  return `https://wa.me/${negocio.telefonoPedidos}?text=${encodeURIComponent(texto)}`;
}
