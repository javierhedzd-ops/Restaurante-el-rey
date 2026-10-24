// Carnitas Michoacán El Rey — editor de la carta (lógica pura, sin DOM).
//
// La página de administración (admin.html) usa estas funciones para cambiar
// precios y productos: reescribe la lista PLATOS dentro de datos.js con el
// mismo formato a mano de siempre, y pone al día los precios que index.html
// trae escritos (tarjeta del kilo, cierre de la carta y preguntas).
import { formatearPrecio } from "./logica.js";

export const ETIQUETAS = ["popular", "picante", "para-compartir"];

const texto = (v) => JSON.stringify(String(v));

// Un plato en una línea, con las claves en el orden de siempre.
function lineaPlato(p) {
  const partes = [
    `id: ${texto(p.id)}`,
    `nombre: ${texto(p.nombre)}`,
    `precio: ${p.precio === null ? "null" : Number(p.precio)}`,
    `categoria: ${texto(p.categoria)}`,
    `desc: ${texto(p.desc || "")}`,
    `etiquetas: [${(p.etiquetas || []).map(texto).join(", ")}]`,
  ];
  if (p.opciones) partes.push(`opciones: ${texto(p.opciones)}`);
  if (p.foto && p.foto.src) {
    const f = [`src: ${texto(p.foto.src)}`, `alt: ${texto(p.foto.alt || "")}`];
    if (p.foto.credito) f.push(`credito: ${texto(p.foto.credito)}`);
    partes.push(`foto: { ${f.join(", ")} }`);
  }
  return `  { ${partes.join(", ")} },`;
}

/** El bloque `export const PLATOS = [...]`, agrupado por categoría en el orden de CATEGORIAS. */
export function serializarPlatos(platos, categorias) {
  const grupos = categorias
    .map((c) => ({ c, lista: platos.filter((p) => p.categoria === c.id) }))
    .filter((g) => g.lista.length);
  const cuerpo = grupos.map((g) => [`  // ${g.c.nombre}`, ...g.lista.map(lineaPlato)].join("\n")).join("\n\n");
  return `export const PLATOS = [\n${cuerpo}\n];`;
}

/** Cambia en el texto de datos.js solo el bloque PLATOS; el resto queda igual. */
export function reemplazarPlatos(datosJs, platos, categorias) {
  const inicio = datosJs.indexOf("export const PLATOS = [");
  if (inicio === -1) throw new Error("datos.js no tiene el bloque PLATOS");
  const fin = datosJs.indexOf("\n];", inicio);
  if (fin === -1) throw new Error("el bloque PLATOS de datos.js no se cierra con ];");
  return datosJs.slice(0, inicio) + serializarPlatos(platos, categorias) + datosJs.slice(fin + 3);
}

/** Un id corto y único a partir del nombre ("Taco de lengua" → "taco-de-lengua"). */
export function idDesdeNombre(nombre, existentes = []) {
  const base = String(nombre || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/½/g, "medio").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "plato";
  const usados = new Set(existentes);
  if (!usados.has(base)) return base;
  for (let i = 2; ; i++) if (!usados.has(`${base}-${i}`)) return `${base}-${i}`;
}

/**
 * Revisa la carta antes de guardarla. Devuelve una lista de frases con lo que
 * hay que corregir (vacía si está bien).
 */
export function validarPlatos(platos, categorias) {
  const errores = [];
  const ids = new Set();
  const cats = new Set(categorias.map((c) => c.id));
  platos.forEach((p, i) => {
    const quien = p.nombre ? `"${p.nombre}"` : `El producto ${i + 1}`;
    if (!p.nombre || !String(p.nombre).trim()) errores.push(`${quien}: falta el nombre.`);
    else if (String(p.nombre).length > 80) errores.push(`${quien}: el nombre es demasiado largo.`);
    if (p.precio !== null && !(Number.isInteger(p.precio) && p.precio > 0 && p.precio < 100000)) {
      errores.push(`${quien}: el precio tiene que ser un número entero de pesos (o vacío para "pregunta").`);
    }
    if (!cats.has(p.categoria)) errores.push(`${quien}: elige una categoría.`);
    if (String(p.desc || "").length > 200) errores.push(`${quien}: la descripción es demasiado larga (200 letras como mucho).`);
    if ((p.etiquetas || []).some((e) => !ETIQUETAS.includes(e))) errores.push(`${quien}: tiene una etiqueta que no existe.`);
    if (!p.id || ids.has(p.id)) errores.push(`${quien}: el identificador está repetido.`);
    ids.add(p.id);
  });
  if (!platos.length) errores.push("La carta no puede quedarse vacía.");
  return errores;
}

/**
 * Pone en index.html los precios que trae escritos: la tarjeta del kilo
 * ("$238 el kilo surtido") y las frases "El kilo surtido cuesta $A y el kilo
 * al gusto $B … Medio kilo desde $C". Salen de los platos kg-surtida, kg-gusto
 * y el más barato de los medios kilos. Si alguno ya no existe, esa frase se
 * deja como estaba y se avisa.
 */
export function preciosEnHTML(html, platos) {
  const avisos = [];
  const precio = (id) => {
    const p = platos.find((x) => x.id === id);
    return p && Number.isInteger(p.precio) ? p.precio : null;
  };
  const surtido = precio("kg-surtida");
  const alGusto = precio("kg-gusto");
  const medios = platos.filter((p) => p.id.startsWith("medio-") && Number.isInteger(p.precio)).map((p) => p.precio);
  const medio = medios.length ? Math.min(...medios) : null;
  let out = html;
  if (surtido !== null) {
    // Con función: el precio empieza por "$" y en una cadena de reemplazo se leería como "$1", "$2"…
    out = out.replace(/(hero__tarjeta-precio">)\$\d{1,3}(?:,\d{3})*( <small>el kilo surtido)/, (_, a, b) => `${a}${formatearPrecio(surtido)}${b}`);
  } else avisos.push('No hay "1 kg surtida" con precio: la tarjeta del kilo de la portada no se cambió.');
  if (surtido !== null && alGusto !== null && medio !== null) {
    out = out.replace(
      /El kilo surtido cuesta \$\d{1,3}(?:,\d{3})*([\s\S]*?)el kilo al gusto \$\d{1,3}(?:,\d{3})*([\s\S]*?)Medio kilo desde \$\d{1,3}(?:,\d{3})*/g,
      (_, a, b) => `El kilo surtido cuesta ${formatearPrecio(surtido)}${a}el kilo al gusto ${formatearPrecio(alGusto)}${b}Medio kilo desde ${formatearPrecio(medio)}`,
    );
  } else avisos.push("Faltan el kilo surtido, el kilo al gusto o los medios kilos con precio: las frases de precios del kilo no se cambiaron.");
  return { html: out, avisos };
}
