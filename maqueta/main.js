// Carnitas Michoacán El Rey — interfaz.
// Pinta el menú, los filtros, el estado de horario y el carrito de pedido.

import { NEGOCIO, CATEGORIAS, PROTEINAS, PLATOS } from "./datos.js";
import {
  formatearPrecio,
  filtrarPlatos,
  estadoHorario,
  diaSemana,
  agregarAlCarrito,
  cambiarCantidad,
  totalCarrito,
  piezasCarrito,
  urlWhatsApp,
  fechaHoy,
  validarReserva,
  urlWhatsAppReserva,
  RESERVA_ULTIMA_HORA,
} from "./logica.js";

const CLAVE_CARRITO = "elrey-carrito-v1";

const estado = {
  categoria: "todo",
  texto: "",
  carrito: cargarCarrito(),
};

// ---------- Utilidades ----------

function $(selector, raiz = document) {
  return raiz.querySelector(selector);
}

function $$(selector, raiz = document) {
  return Array.from(raiz.querySelectorAll(selector));
}

function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || "[]");
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(estado.carrito));
  } catch {
    /* modo privado: el carrito vive solo en memoria */
  }
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[c]);
}

// ---------- Horario ----------

function pintarHorario() {
  const contenedor = $("#estado-horario");
  if (!contenedor) return;
  const { abierto, texto } = estadoHorario(new Date());
  contenedor.textContent = texto;
  contenedor.classList.toggle("esta-abierto", abierto);
  contenedor.classList.toggle("esta-cerrado", !abierto);
}

// Marca en la tabla de horario la fila del día de hoy (data-dia="0"…"6").
function marcarDiaDeHoy() {
  const hoy = diaSemana(new Date());
  $$(".horario tr[data-dia]").forEach((fila) => {
    const esHoy = Number(fila.dataset.dia) === hoy;
    fila.classList.toggle("horario__hoy", esHoy);
    if (esHoy) fila.setAttribute("aria-current", "date");
    else fila.removeAttribute("aria-current");
  });
}

// ---------- Menú ----------

function tarjetaPlato(plato, indice) {
  // Número de orden de la carta: 01, 02… Se reinicia en cada categoría.
  const numero = String(indice + 1).padStart(2, "0");

  const etiquetas = (plato.etiquetas || [])
    .map((e) => `<span class="etiqueta etiqueta--${e}">${escapar(nombreEtiqueta(e))}</span>`)
    .join("");

  const opciones = plato.opciones === "proteina"
    ? `<label class="opciones">
         <span class="opciones__texto">Proteína</span>
         <select class="opciones__select" data-proteina="${plato.id}">
           ${PROTEINAS.map((p) => `<option value="${escapar(p)}">${escapar(p)}</option>`).join("")}
         </select>
       </label>`
    : "";

  const sinPrecio = plato.precio === null;

  // Foto opcional: si el plato no tiene, la tarjeta va solo con texto.
  const foto = plato.foto
    ? `<figure class="plato__foto">
         <img src="${escapar(plato.foto.src)}" alt="${escapar(plato.foto.alt)}" loading="lazy" decoding="async" width="640" height="480">
         <figcaption>${escapar(plato.foto.credito)}</figcaption>
       </figure>`
    : "";

  return `
    <article class="plato${foto ? " plato--con-foto" : ""}" data-id="${plato.id}">
      ${foto}
      <div class="plato__cuerpo">
        <div class="plato__cabecera">
          <span class="plato__numero" aria-hidden="true">${numero}</span>
          <h3 class="plato__nombre">${escapar(plato.nombre)}</h3>
          <span class="plato__precio">${formatearPrecio(plato.precio)}</span>
        </div>
        <p class="plato__desc">${escapar(plato.desc)}</p>
        ${etiquetas ? `<div class="plato__etiquetas">${etiquetas}</div>` : ""}
        <div class="plato__pie">
          ${opciones}
          <button class="boton-anadir" type="button" data-anadir="${plato.id}" ${sinPrecio ? "disabled" : ""}>
            ${sinPrecio ? "Preguntar" : "Añadir"}
          </button>
        </div>
      </div>
    </article>`;
}

function nombreEtiqueta(etiqueta) {
  return {
    popular: "Más pedido",
    picante: "Picante",
    "para-compartir": "Para compartir",
  }[etiqueta] || etiqueta;
}

function pintarMenu() {
  const contenedor = $("#lista-platos");
  if (!contenedor) return;

  const visibles = filtrarPlatos(PLATOS, estado.categoria, estado.texto);

  if (!visibles.length) {
    contenedor.innerHTML = `<p class="vacio">No encontramos nada con eso. Prueba con "taco", "kilo" o "guacamole".</p>`;
  } else {
    contenedor.innerHTML = visibles.map((plato, i) => tarjetaPlato(plato, i)).join("");
  }

  const contador = $("#contador-platos");
  if (contador) {
    contador.textContent = `${visibles.length} ${visibles.length === 1 ? "plato" : "platos"}`;
  }
}

function pintarFiltros() {
  const contenedor = $("#filtros");
  if (!contenedor) return;

  const botones = [{ id: "todo", nombre: "Todo" }, ...CATEGORIAS];
  contenedor.innerHTML = botones
    .map(
      (c) => `<button class="filtro${c.id === estado.categoria ? " filtro--activo" : ""}"
        type="button" role="tab" aria-selected="${c.id === estado.categoria}"
        data-categoria="${c.id}">${escapar(c.nombre)}</button>`
    )
    .join("");
}

// ---------- Arma tu kilo ----------
// El selector de la sección "El cazo" arma un pedido real: elige el plato de
// kilos de datos.js y lo añade al carrito con la proteína elegida.

// Qué plato de kilos corresponde a cada combinación peso + proteína.
const KILOS = {
  "medio|surtida": "medio-surtido",
  "medio|maciza": "medio-maciza",
  "medio|al-gusto": "medio-parrilla",
  "kilo|surtida": "kg-surtida",
  "kilo|maciza": "kg-gusto",
  "kilo|al-gusto": "kg-gusto",
};

// Cómo se llama cada combinación en el carrito y qué se lleva de acompañamiento.
const KILOS_TEXTO = {
  "medio|surtida": { nombre: "½ kg surtido", nota: "Con tortillas, cebolla, cilantro, limones y salsas." },
  "medio|maciza": { nombre: "½ kg maciza", nota: "Con tortillas, cebolla, cilantro, limones y salsas." },
  "medio|al-gusto": { nombre: "½ kg surtido de la casa", nota: "Maciza, costilla, buche, oreja y cuero, para armar tacos." },
  "kilo|surtida": { nombre: "1 kg surtida", nota: "Maciza y surtido, con todo lo de acompañamiento." },
  "kilo|maciza": { nombre: "1 kg de maciza", nota: "Con tortillas, cebolla, cilantro, limones, aguacate y salsas." },
  "kilo|al-gusto": { nombre: "1 kg al gusto", nota: "Elige la proteína; con todo lo de acompañamiento." },
};

function leerArmador() {
  const formulario = $("#armador");
  if (!formulario) return null;
  const peso = formulario.querySelector('input[name="peso"]:checked')?.value || "medio";
  const proteina = formulario.querySelector('input[name="proteina"]:checked')?.value || "surtida";
  const select = $("#armador-proteina");
  const gusto = select ? select.value : "";
  return { peso, proteina, gusto, clave: `${peso}|${proteina}` };
}

function pintarArmador() {
  const eleccion = leerArmador();
  if (!eleccion) return;

  const campo = $("#armador-proteina-campo");
  if (campo) campo.hidden = eleccion.proteina !== "al-gusto";

  const plato = PLATOS.find((p) => p.id === KILOS[eleccion.clave]);
  const texto = KILOS_TEXTO[eleccion.clave];
  if (!plato || !texto) return;

  const nombre = $("#armador-nombre");
  const precio = $("#armador-precio");
  const nota = $("#armador-nota");
  if (nombre) nombre.textContent = texto.nombre;
  if (precio) precio.textContent = formatearPrecio(plato.precio);
  if (nota) nota.textContent = texto.nota;
}

function conectarArmador() {
  const formulario = $("#armador");
  if (!formulario) return;

  const select = $("#armador-proteina");
  if (select) {
    select.innerHTML = PROTEINAS.map(
      (p) => `<option value="${escapar(p)}">${escapar(p)}</option>`
    ).join("");
  }

  formulario.addEventListener("change", pintarArmador);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const eleccion = leerArmador();
    if (!eleccion) return;
    const plato = PLATOS.find((p) => p.id === KILOS[eleccion.clave]);
    if (!plato) return;

    // "Al gusto" lleva la proteína elegida; el resto, sin opciones.
    const opciones = eleccion.proteina === "al-gusto" ? eleccion.gusto : "";
    estado.carrito = agregarAlCarrito(estado.carrito, plato, opciones);
    guardarCarrito();
    pintarCarrito();
    avisar(`${KILOS_TEXTO[eleccion.clave].nombre} añadido`);
  });

  pintarArmador();
}

// ---------- Carrito ----------

function pintarCarrito() {
  const lista = $("#carrito-lineas");
  const total = $("#carrito-total");
  const globo = $("#globo-carrito");
  const vacio = $("#carrito-vacio");
  const pie = $("#carrito-pie");
  if (!lista) return;

  const piezas = piezasCarrito(estado.carrito);

  if (globo) {
    globo.textContent = piezas;
    globo.hidden = piezas === 0;
  }

  if (!estado.carrito.length) {
    lista.innerHTML = "";
    if (vacio) vacio.hidden = false;
    if (pie) pie.hidden = true;
    return;
  }

  if (vacio) vacio.hidden = true;
  if (pie) pie.hidden = false;

  lista.innerHTML = estado.carrito
    .map(
      (linea) => `
      <li class="linea">
        <div class="linea__info">
          <span class="linea__nombre">${escapar(linea.nombre)}</span>
          ${linea.opciones ? `<span class="linea__opciones">${escapar(linea.opciones)}</span>` : ""}
        </div>
        <div class="linea__controles">
          <button type="button" class="linea__boton" data-menos="${linea.clave}" aria-label="Quitar uno de ${escapar(linea.nombre)}">−</button>
          <span class="linea__cantidad">${linea.cantidad}</span>
          <button type="button" class="linea__boton" data-mas="${linea.clave}" aria-label="Añadir uno de ${escapar(linea.nombre)}">+</button>
        </div>
        <span class="linea__precio">${linea.precio ? formatearPrecio(linea.precio * linea.cantidad) : "—"}</span>
      </li>`
    )
    .join("");

  if (total) total.textContent = formatearPrecio(totalCarrito(estado.carrito));
}

function abrirCarrito(abrir) {
  const panel = $("#carrito");
  const boton = $("#abrir-carrito");
  const velo = $("#velo-carrito");
  if (!panel) return;
  const visible = abrir ?? panel.hidden;
  panel.hidden = !visible;
  if (velo) velo.hidden = !visible;
  // Con el carrito abierto, la página de detrás no se desplaza.
  document.body.classList.toggle("sin-scroll", visible);
  if (boton) boton.setAttribute("aria-expanded", String(visible));
  if (visible) {
    const primero = $("#cerrar-carrito");
    if (primero) primero.focus();
  } else if (boton) {
    // Al cerrar, el foco vuelve al botón que abrió el carrito.
    boton.focus();
  }
}

// Mantiene el tabulador dentro del carrito mientras está abierto.
function atraparFoco(evento) {
  const panel = $("#carrito");
  if (!panel || panel.hidden || evento.key !== "Tab") return;
  const enfocables = $$(
    'button:not([disabled]), a[href], input, select, [tabindex]:not([tabindex="-1"])',
    panel
  ).filter((el) => el.offsetParent !== null);
  if (!enfocables.length) return;
  const primero = enfocables[0];
  const ultimo = enfocables[enfocables.length - 1];
  if (evento.shiftKey && document.activeElement === primero) {
    evento.preventDefault();
    ultimo.focus();
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault();
    primero.focus();
  }
}

function avisar(texto) {
  const aviso = $("#aviso");
  if (!aviso) return;
  aviso.textContent = texto;
  aviso.classList.add("aviso--visible");
  clearTimeout(avisar.temporizador);
  avisar.temporizador = setTimeout(() => aviso.classList.remove("aviso--visible"), 2200);
}

// ---------- Reservas ----------

// Horas que se pueden reservar: de la apertura a RESERVA_ULTIMA_HORA, cada media hora.
function horasReserva() {
  const horas = [];
  for (let minutos = 13 * 60; minutos <= RESERVA_ULTIMA_HORA * 60; minutos += 30) {
    const h = String(Math.floor(minutos / 60)).padStart(2, "0");
    const m = String(minutos % 60).padStart(2, "0");
    horas.push(`${h}:${m}`);
  }
  return horas;
}

function pintarReserva() {
  const fecha = $("#reserva-fecha");
  const hora = $("#reserva-hora");
  if (!fecha || !hora) return;

  const hoy = fechaHoy(new Date());
  fecha.min = hoy;
  if (!fecha.value) fecha.value = hoy;

  const elegida = hora.value;
  hora.innerHTML = `<option value="">Elige</option>` +
    horasReserva().map((h) => `<option value="${h}">${h}</option>`).join("");
  if (elegida) hora.value = elegida;
}

function leerReserva() {
  return {
    nombre: $("#reserva-nombre")?.value || "",
    telefono: $("#reserva-telefono")?.value || "",
    personas: $("#reserva-personas")?.value || "",
    fecha: $("#reserva-fecha")?.value || "",
    hora: $("#reserva-hora")?.value || "",
    notas: $("#reserva-notas")?.value || "",
  };
}

// Pinta los errores por campo y devuelve true si no hay ninguno.
function pintarErroresReserva(errores) {
  const campos = ["nombre", "telefono", "personas", "fecha", "hora"];
  for (const campo of campos) {
    const entrada = $(`#reserva-${campo}`);
    const salida = $(`#error-${campo}`);
    const mensaje = errores[campo] || "";
    if (salida) salida.textContent = mensaje;
    if (entrada) {
      entrada.classList.toggle("campo--error", Boolean(mensaje));
      if (mensaje) entrada.setAttribute("aria-invalid", "true");
      else entrada.removeAttribute("aria-invalid");
    }
  }
  return Object.keys(errores).length === 0;
}

function conectarReserva() {
  const formulario = $("#form-reserva");
  if (!formulario) return;

  pintarReserva();
  $("#reserva-fecha")?.addEventListener("change", pintarReserva);

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const reserva = leerReserva();
    const errores = validarReserva(reserva);
    if (!pintarErroresReserva(errores)) {
      const primero = formulario.querySelector(".campo--error");
      primero?.focus();
      return;
    }
    window.open(urlWhatsAppReserva(reserva), "_blank", "noopener");
    avisar("Reserva lista para enviar por WhatsApp");
  });
}

// ---------- Eventos ----------

function conectarEventos() {
  // Filtros
  $("#filtros")?.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-categoria]");
    if (!boton) return;
    estado.categoria = boton.dataset.categoria;
    pintarFiltros();
    pintarMenu();
  });

  // Búsqueda
  $("#buscador")?.addEventListener("input", (evento) => {
    estado.texto = evento.target.value;
    pintarMenu();
  });

  // Añadir al carrito
  $("#lista-platos")?.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-anadir]");
    if (!boton) return;
    const plato = PLATOS.find((p) => p.id === boton.dataset.anadir);
    if (!plato) return;
    const selector = $(`[data-proteina="${plato.id}"]`);
    const opciones = selector ? selector.value : "";
    estado.carrito = agregarAlCarrito(estado.carrito, plato, opciones);
    guardarCarrito();
    pintarCarrito();
    avisar(`${plato.nombre} añadido`);
  });

  // Controles del carrito
  $("#carrito-lineas")?.addEventListener("click", (evento) => {
    const mas = evento.target.closest("[data-mas]");
    const menos = evento.target.closest("[data-menos]");
    if (mas) estado.carrito = cambiarCantidad(estado.carrito, mas.dataset.mas, 1);
    if (menos) estado.carrito = cambiarCantidad(estado.carrito, menos.dataset.menos, -1);
    if (mas || menos) {
      guardarCarrito();
      pintarCarrito();
    }
  });

  // Abrir / cerrar carrito
  $("#abrir-carrito")?.addEventListener("click", () => abrirCarrito());
  $("#cerrar-carrito")?.addEventListener("click", () => abrirCarrito(false));
  // Tocar el velo (fuera del panel) también cierra.
  $("#velo-carrito")?.addEventListener("click", () => abrirCarrito(false));
  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") abrirCarrito(false);
    atraparFoco(evento);
  });

  // Enviar pedido: abre WhatsApp y cierra el panel para dejar ver la página.
  $("#enviar-pedido")?.addEventListener("click", () => {
    if (!estado.carrito.length) return;
    window.open(urlWhatsApp(estado.carrito), "_blank", "noopener");
    abrirCarrito(false);
  });

  // Vaciar
  $("#vaciar-carrito")?.addEventListener("click", () => {
    estado.carrito = [];
    guardarCarrito();
    pintarCarrito();
  });
}

// ---------- Arranque ----------

function iniciar() {
  pintarHorario();
  marcarDiaDeHoy();
  pintarFiltros();
  pintarMenu();
  pintarCarrito();
  conectarArmador();
  conectarReserva();
  conectarEventos();
  setInterval(() => {
    pintarHorario();
    marcarDiaDeHoy();
  }, 60_000);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", iniciar);
} else {
  iniciar();
}
