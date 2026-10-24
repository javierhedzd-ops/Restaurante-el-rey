// Carnitas Michoacán El Rey — página de administración (admin.html).
// Edita la carta (PLATOS de datos.js) y la publica en GitHub con la llave del
// dueño, o la descarga para subirla a mano. La lógica está en editor.js.
import { CATEGORIAS, PLATOS } from "./datos.js";
import { ETIQUETAS, reemplazarPlatos, idDesdeNombre, validarPlatos, preciosEnHTML } from "./editor.js";

// Dónde vive la web en GitHub (la rama es la que sirve GitHub Pages).
const REPO = "javierhedzd-ops/Restaurante-el-rey";
const RAMA = "ari/rediseno-cazo";
const CLAVE_LLAVE = "elrey-admin-llave";

const NOMBRE_ETIQUETA = { popular: "Más pedido", picante: "Picante", "para-compartir": "Para compartir" };

const estado = {
  platos: PLATOS.map((p) => ({ ...p, etiquetas: [...(p.etiquetas || [])] })),
  cambios: false,
};

const $ = (s, raiz = document) => raiz.querySelector(s);

function escapar(t) {
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// ---------- Pintar la carta ----------

function tarjeta(p, i) {
  const categorias = CATEGORIAS.map((c) => `<option value="${c.id}"${c.id === p.categoria ? " selected" : ""}>${escapar(c.nombre)}</option>`).join("");
  const etiquetas = ETIQUETAS.map(
    (e) => `<label class="admin__marca-check"><input type="checkbox" data-campo="etiqueta" value="${e}"${(p.etiquetas || []).includes(e) ? " checked" : ""}> ${NOMBRE_ETIQUETA[e]}</label>`,
  ).join("");
  return `
    <article class="admin__plato" data-i="${i}">
      <div class="admin__fila">
        <label class="campo admin__nombre">
          <span class="campo__texto">Nombre</span>
          <input data-campo="nombre" type="text" maxlength="80" value="${escapar(p.nombre)}">
        </label>
        <label class="campo admin__precio">
          <span class="campo__texto">Precio <small>($)</small></span>
          <input data-campo="precio" type="number" inputmode="numeric" min="1" step="1" value="${p.precio ?? ""}" placeholder="Consultar">
        </label>
      </div>
      <label class="campo">
        <span class="campo__texto">Descripción</span>
        <textarea data-campo="desc" rows="2" maxlength="200">${escapar(p.desc)}</textarea>
      </label>
      <div class="admin__fila admin__fila--opciones">
        <label class="campo admin__categoria">
          <span class="campo__texto">Categoría</span>
          <select data-campo="categoria">${categorias}</select>
        </label>
        <div class="admin__marcas">
          ${etiquetas}
          <label class="admin__marca-check"><input type="checkbox" data-campo="proteina"${p.opciones === "proteina" ? " checked" : ""}> Elige proteína</label>
        </div>
      </div>
      <div class="admin__pie-plato">
        <span class="admin__foto">${p.foto && p.foto.src ? `Con foto (${escapar(p.foto.src.split("/").pop())})` : "Sin foto"}</span>
        <button class="admin__quitar" type="button" data-accion="quitar">Quitar</button>
      </div>
    </article>`;
}

function pintar() {
  const carta = $("#carta");
  carta.innerHTML = CATEGORIAS.map((c) => {
    const items = estado.platos.map((p, i) => [p, i]).filter(([p]) => p.categoria === c.id);
    return `
      <section class="admin__categoria-bloque" aria-labelledby="cat-${c.id}">
        <h2 class="admin__subtitulo" id="cat-${c.id}">${escapar(c.nombre)} <small>(${items.length})</small></h2>
        ${items.map(([p, i]) => tarjeta(p, i)).join("")}
        <button class="boton boton--secundario admin__anadir" type="button" data-accion="anadir" data-categoria="${c.id}">Añadir a ${escapar(c.nombre)}</button>
      </section>`;
  }).join("");
}

// ---------- Editar ----------

function marcarCambio() {
  estado.cambios = true;
  $("#resultado").textContent = "";
}

function leerCampo(evento) {
  const campo = evento.target.dataset.campo;
  const caja = evento.target.closest(".admin__plato");
  if (!campo || !caja) return;
  const p = estado.platos[Number(caja.dataset.i)];
  const valor = evento.target.value;
  if (campo === "nombre") p.nombre = valor;
  else if (campo === "desc") p.desc = valor;
  else if (campo === "precio") p.precio = valor.trim() === "" ? null : Number(valor);
  else if (campo === "categoria") { p.categoria = valor; pintar(); }
  else if (campo === "proteina") { if (evento.target.checked) p.opciones = "proteina"; else delete p.opciones; }
  else if (campo === "etiqueta") {
    p.etiquetas = (p.etiquetas || []).filter((e) => e !== valor);
    if (evento.target.checked) p.etiquetas.push(valor);
    p.etiquetas.sort((a, b) => ETIQUETAS.indexOf(a) - ETIQUETAS.indexOf(b));
  }
  marcarCambio();
}

function accion(evento) {
  const boton = evento.target.closest("[data-accion]");
  if (!boton) return;
  if (boton.dataset.accion === "anadir") {
    const categoria = boton.dataset.categoria;
    const id = idDesdeNombre(`nuevo ${categoria}`, estado.platos.map((p) => p.id));
    // Al final de su categoría, para que la carta siga agrupada.
    let pos = estado.platos.map((p) => p.categoria).lastIndexOf(categoria);
    pos = pos === -1 ? estado.platos.length : pos + 1;
    estado.platos.splice(pos, 0, { id, nombre: "", precio: null, categoria, desc: "", etiquetas: [] });
    pintar();
    $(`.admin__plato[data-i="${pos}"] [data-campo="nombre"]`)?.focus();
    marcarCambio();
  } else if (boton.dataset.accion === "quitar") {
    const i = Number(boton.closest(".admin__plato").dataset.i);
    const p = estado.platos[i];
    if (!window.confirm(`¿Quitar "${p.nombre || "este producto"}" de la carta?`)) return;
    estado.platos.splice(i, 1);
    pintar();
    marcarCambio();
  }
}

// Los productos nuevos toman el id de su nombre (antes de guardar, para que sea legible).
function prepararIds() {
  const usados = [];
  for (const p of estado.platos) {
    if (/^nuevo-/.test(p.id) && p.nombre.trim()) p.id = idDesdeNombre(p.nombre, usados.concat(estado.platos.filter((x) => x !== p).map((x) => x.id)));
    usados.push(p.id);
  }
}

function revisar() {
  prepararIds();
  const errores = validarPlatos(estado.platos, CATEGORIAS);
  const lista = $("#errores");
  lista.innerHTML = errores.map((e) => `<li>${escapar(e)}</li>`).join("");
  lista.hidden = errores.length === 0;
  if (errores.length) lista.scrollIntoView({ block: "center" });
  return errores.length === 0;
}

// ---------- Guardar ----------

const aBase64 = (texto) => {
  let bin = "";
  for (const b of new TextEncoder().encode(texto)) bin += String.fromCharCode(b);
  return btoa(bin);
};
const deBase64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

async function github(ruta, opciones = {}, llave) {
  const r = await fetch(`https://api.github.com/repos/${REPO}/contents/${ruta}${opciones.method ? "" : `?ref=${encodeURIComponent(RAMA)}`}`, {
    ...opciones,
    headers: { Accept: "application/vnd.github+json", Authorization: `Bearer ${llave}`, ...(opciones.body ? { "Content-Type": "application/json" } : {}) },
  });
  if (r.status === 401) throw new Error("La llave no vale o caducó.");
  if (r.status === 403 || r.status === 404) throw new Error("La llave no tiene permiso de escritura en este repositorio.");
  if (r.status === 409) throw new Error("Alguien cambió la web a la vez. Recarga la página y vuelve a intentarlo.");
  if (!r.ok) throw new Error(`GitHub respondió ${r.status}.`);
  return r.json();
}

function llaveGuardada() {
  try {
    return localStorage.getItem(CLAVE_LLAVE) || sessionStorage.getItem(CLAVE_LLAVE) || "";
  } catch {
    return "";
  }
}

function guardarLlave(llave, recordar) {
  try {
    localStorage.removeItem(CLAVE_LLAVE);
    sessionStorage.removeItem(CLAVE_LLAVE);
    (recordar ? localStorage : sessionStorage).setItem(CLAVE_LLAVE, llave);
  } catch {
    // Sin almacenamiento: habrá que pegar la llave cada vez.
  }
}

async function publicar() {
  const resultado = $("#resultado");
  if (!revisar()) return;
  const llave = $("#llave").value.trim();
  if (!llave) {
    resultado.textContent = "Pega la llave de GitHub para publicar (o usa Descargar).";
    $("#llave").focus();
    return;
  }
  guardarLlave(llave, $("#recordar").checked);
  const boton = $("#publicar");
  boton.disabled = true;
  resultado.textContent = "Publicando…";
  try {
    // Se parte de lo que hay en GitHub ahora (no de la copia de esta página): así no se pisa otro cambio.
    const datos = await github("datos.js", {}, llave);
    const nuevoDatos = reemplazarPlatos(deBase64(datos.content), estado.platos, CATEGORIAS);
    const indice = await github("index.html", {}, llave);
    const { html, avisos } = preciosEnHTML(deBase64(indice.content), estado.platos);
    const mensaje = "Actualiza la carta desde la página de administración";
    await github("datos.js", { method: "PUT", body: JSON.stringify({ message: mensaje, content: aBase64(nuevoDatos), sha: datos.sha, branch: RAMA }) }, llave);
    if (html !== deBase64(indice.content)) {
      await github("index.html", { method: "PUT", body: JSON.stringify({ message: "Pone al día los precios escritos en la página", content: aBase64(html), sha: indice.sha, branch: RAMA }) }, llave);
    }
    estado.cambios = false;
    resultado.textContent = `Publicado. La web se actualiza sola en uno o dos minutos.${avisos.length ? " Ojo: " + avisos.join(" ") : ""}`;
  } catch (e) {
    resultado.textContent = `No se publicó: ${e.message}`;
  } finally {
    boton.disabled = false;
  }
}

function bajar(nombre, contenido, tipo) {
  const url = URL.createObjectURL(new Blob([contenido], { type: tipo }));
  const a = Object.assign(document.createElement("a"), { href: url, download: nombre });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function descargar() {
  if (!revisar()) return;
  const resultado = $("#resultado");
  try {
    const [datos, indice] = await Promise.all([fetch("datos.js", { cache: "no-store" }).then((r) => r.text()), fetch("index.html", { cache: "no-store" }).then((r) => r.text())]);
    bajar("datos.js", reemplazarPlatos(datos, estado.platos, CATEGORIAS), "text/javascript");
    const { html, avisos } = preciosEnHTML(indice, estado.platos);
    if (html !== indice) bajar("index.html", html, "text/html");
    resultado.textContent = `Descargado. Sube ${html !== indice ? "datos.js e index.html" : "datos.js"} a la carpeta de la web.${avisos.length ? " Ojo: " + avisos.join(" ") : ""}`;
  } catch (e) {
    resultado.textContent = `No se pudo preparar la descarga: ${e.message}`;
  }
}

// ---------- Arranque ----------

function iniciar() {
  pintar();
  const carta = $("#carta");
  carta.addEventListener("input", leerCampo);
  carta.addEventListener("change", (e) => { if (e.target.matches('select, input[type="checkbox"]')) leerCampo(e); });
  carta.addEventListener("click", accion);
  $("#publicar").addEventListener("click", publicar);
  $("#descargar").addEventListener("click", descargar);
  const llave = llaveGuardada();
  if (llave) {
    $("#llave").value = llave;
    try { $("#recordar").checked = Boolean(localStorage.getItem(CLAVE_LLAVE)); } catch { /* sin almacenamiento */ }
  }
  // Avisa antes de salir con cambios sin publicar.
  window.addEventListener("beforeunload", (e) => { if (estado.cambios) { e.preventDefault(); e.returnValue = ""; } });
}

iniciar();
