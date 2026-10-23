// Arnés para probar la web sin navegador.
//
// Carga index.html en jsdom y ejecuta datos.js, logica.js y main.js como si
// fueran módulos: quita los import/export y los evalúa en el mismo ámbito, así
// las funciones de un archivo ven las del otro. Devuelve la ventana de jsdom
// para que las pruebas puedan hacer clic, escribir y leer el DOM.
//
// Lo que NO comprueba: el CSS. jsdom no calcula estilos, así que un
// `display:flex` que se coma un `[hidden]` no se ve aquí. Para eso hace falta
// un navegador de verdad (Playwright) o mirarlo a ojo.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JSDOM } from "jsdom";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");

// Quita las líneas de import y la palabra export, sin tocar el resto.
function comoScript(codigo) {
  return codigo
    .replace(/^import\s+[\s\S]*?from\s+"[^"]+";\s*$/gm, "")
    .replace(/^export\s+/gm, "");
}

export function abrirWeb({ url = "http://localhost/" } = {}) {
  const html = readFileSync(join(RAIZ, "index.html"), "utf8");
  const dom = new JSDOM(html, { runScripts: "outside-only", url });
  const ventana = dom.window;

  // localStorage existe en jsdom, pero por si acaso.
  if (!ventana.localStorage) {
    const datos = new Map();
    Object.defineProperty(ventana, "localStorage", {
      value: {
        getItem: (k) => (datos.has(k) ? datos.get(k) : null),
        setItem: (k, v) => datos.set(k, String(v)),
        removeItem: (k) => datos.delete(k),
        clear: () => datos.clear(),
      },
    });
  }

  // Los tres archivos se juntan y se ejecutan dentro de una sola función.
  // Ojo: con ventana.eval las `const` de nivel superior NO quedan como
  // propiedades de window (las `function` sí), y main.js no veía NEGOCIO.
  // Con new Function comparten ámbito y devolvemos lo que las pruebas usan.
  const codigo = ["datos.js", "logica.js", "main.js"]
    .map((archivo) => comoScript(readFileSync(join(RAIZ, archivo), "utf8")))
    .join("\n;\n");

  const exportados = [
    "NEGOCIO",
    "PLATOS",
    "estado",
    "abrirCarrito",
    "pintarCarrito",
    "pintarPlatos",
    "pintarHorario",
    "iniciar",
    "validarReserva",
    "urlWhatsAppReserva",
  ];
  const devolver = exportados
    .map((nombre) => `${nombre}: typeof ${nombre} !== "undefined" ? ${nombre} : undefined`)
    .join(", ");

  const ejecutar = new ventana.Function(`${codigo}\n;return { ${devolver} };`);
  const api = ejecutar.call(ventana);

  // main.js arranca con DOMContentLoaded si el documento aún carga.
  ventana.document.dispatchEvent(new ventana.Event("DOMContentLoaded"));

  // La ventana sigue siendo lo primero (las pruebas la usan como primer
  // argumento); lo exportado va colgado de ella como `ventana.api`.
  ventana.api = api;
  return ventana;
}

// Atajos para las pruebas.
export function clic(ventana, selector) {
  const el = ventana.document.querySelector(selector);
  if (!el) throw new Error(`No existe el elemento ${selector}`);
  el.click();
  return el;
}

export function escribir(ventana, selector, valor) {
  const el = ventana.document.querySelector(selector);
  if (!el) throw new Error(`No existe el elemento ${selector}`);
  el.value = valor;
  el.dispatchEvent(new ventana.Event("input", { bubbles: true }));
  return el;
}

export function cambiar(ventana, selector, valor) {
  const el = ventana.document.querySelector(selector);
  if (!el) throw new Error(`No existe el elemento ${selector}`);
  el.value = valor;
  el.dispatchEvent(new ventana.Event("change", { bubbles: true }));
  return el;
}

export function texto(ventana, selector) {
  const el = ventana.document.querySelector(selector);
  return el ? el.textContent.trim() : null;
}
