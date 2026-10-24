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

/**
 * Lee un carrito guardado (el JSON de localStorage) y devuelve solo las líneas
 * que se pueden usar: clave e id de texto, cantidad entera mayor que cero y
 * precio número o null. Lo que no encaja se descarta en vez de romper la
 * página. Si el texto no es un arreglo, devuelve un carrito vacío.
 */
export function normalizarCarrito(guardado) {
  let lineas = guardado;
  if (typeof lineas === "string") {
    try {
      lineas = JSON.parse(lineas);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(lineas)) return [];

  return lineas
    .filter(
      (linea) =>
        linea &&
        typeof linea === "object" &&
        typeof linea.clave === "string" &&
        linea.clave !== "" &&
        typeof linea.id === "string" &&
        Number.isInteger(linea.cantidad) &&
        linea.cantidad > 0 &&
        (linea.precio === null || (typeof linea.precio === "number" && Number.isFinite(linea.precio)))
    )
    .map((linea) => ({
      clave: linea.clave,
      id: linea.id,
      nombre: typeof linea.nombre === "string" ? linea.nombre : linea.id,
      precio: linea.precio,
      opciones: typeof linea.opciones === "string" ? linea.opciones : "",
      cantidad: linea.cantidad,
    }));
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

// ---------- Reservas ----------

/** Cuántas personas caben en una sola reserva. */
export const RESERVA_MAX_PERSONAS = 20;

/** Hora a la que se puede reservar como muy tarde (el cierre es a las 22:00). */
export const RESERVA_ULTIMA_HORA = 21;

/** Fecha de hoy en el restaurante, como "AAAA-MM-DD". */
export function fechaHoy(ahora, negocio = NEGOCIO) {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: negocio.zonaHoraria,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ahora);
  const valor = (tipo) => partes.find((p) => p.type === tipo)?.value;
  return `${valor("year")}-${valor("month")}-${valor("day")}`;
}

/**
 * Valida una reserva y devuelve los errores por campo.
 * Un objeto vacío significa que la reserva se puede mandar.
 *
 * reserva: { nombre, telefono, personas, fecha ("AAAA-MM-DD"), hora ("HH:MM"), notas }
 * La fecha y la hora se comparan con el reloj del restaurante, no con el del visitante.
 */
export function validarReserva(reserva, ahora = new Date(), negocio = NEGOCIO) {
  const errores = {};
  const nombre = (reserva.nombre || "").trim();
  const telefono = (reserva.telefono || "").replace(/[\s\-().]/g, "");
  const personas = Number(reserva.personas);
  const fecha = reserva.fecha || "";
  const hora = reserva.hora || "";

  if (nombre.length < 2) {
    errores.nombre = "Escribe tu nombre.";
  } else if (nombre.length > 60) {
    errores.nombre = "El nombre es demasiado largo.";
  }

  // México: 10 dígitos. Se aceptan con lada de país (52) delante.
  const soloDigitos = telefono.replace(/^\+?52/, "");
  if (!/^\d{10}$/.test(soloDigitos)) {
    errores.telefono = "Escribe un teléfono de 10 dígitos.";
  }

  if (!Number.isInteger(personas) || personas < 1) {
    errores.personas = "¿Cuántas personas son?";
  } else if (personas > RESERVA_MAX_PERSONAS) {
    errores.personas = `Para más de ${RESERVA_MAX_PERSONAS} personas, llámanos.`;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    errores.fecha = "Elige el día.";
  } else if (fecha < fechaHoy(ahora, negocio)) {
    errores.fecha = "Ese día ya pasó.";
  } else {
    // El día tiene que tener servicio (el martes cierra).
    const [anio, mes, dia] = fecha.split("-").map(Number);
    const diaSemanaFecha = new Date(Date.UTC(anio, mes - 1, dia)).getUTCDay();
    const tramo = negocio.horario[diaSemanaFecha];
    if (!tramo) {
      errores.fecha = "Ese día cerramos. Elige otro.";
    } else if (!/^\d{2}:\d{2}$/.test(hora)) {
      errores.hora = "Elige la hora.";
    } else {
      const [h, m] = hora.split(":").map(Number);
      const minutos = h * 60 + m;
      if (minutos < tramo[0] * 60 || minutos > RESERVA_ULTIMA_HORA * 60) {
        errores.hora = `Reservamos de ${tramo[0]}:00 a ${RESERVA_ULTIMA_HORA}:00.`;
      } else if (fecha === fechaHoy(ahora, negocio)) {
        // Hoy no se puede reservar para una hora que ya pasó.
        const partes = new Intl.DateTimeFormat("en-GB", {
          timeZone: negocio.zonaHoraria,
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }).formatToParts(ahora);
        const valor = (tipo) => partes.find((p) => p.type === tipo)?.value;
        const minutosAhora = (Number(valor("hour")) % 24) * 60 + Number(valor("minute"));
        if (minutos <= minutosAhora) {
          errores.hora = "Esa hora ya pasó. Elige una más tarde.";
        }
      }
    }
  }

  return errores;
}

/** Texto de la reserva para WhatsApp. */
export function mensajeReserva(reserva, negocio = NEGOCIO) {
  const nombre = (reserva.nombre || "").trim();
  const telefono = (reserva.telefono || "").replace(/[\s\-().]/g, "").replace(/^\+?52/, "");
  const personas = Number(reserva.personas);
  const notas = (reserva.notas || "").trim();
  const [anio, mes, dia] = (reserva.fecha || "").split("-");
  const fecha = `${dia}/${mes}/${anio}`;

  return [
    `Hola, quiero reservar en ${negocio.nombre} (${negocio.sucursal}):`,
    "",
    `• Nombre: ${nombre}`,
    `• Personas: ${personas}`,
    `• Día: ${fecha}`,
    `• Hora: ${reserva.hora}`,
    `• Teléfono: ${telefono}`,
    ...(notas ? ["", `Notas: ${notas}`] : []),
    "",
    "¿Me confirman la mesa?",
  ].join("\n");
}

/** URL de WhatsApp con la reserva ya escrita. */
export function urlWhatsAppReserva(reserva, negocio = NEGOCIO) {
  const texto = mensajeReserva(reserva, negocio);
  return `https://wa.me/${negocio.telefonoPedidos}?text=${encodeURIComponent(texto)}`;
}
