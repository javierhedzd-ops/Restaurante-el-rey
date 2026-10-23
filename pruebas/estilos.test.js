// Pruebas del CSS que jsdom no puede ver.
//
// jsdom no calcula estilos: un `display:flex` en un panel con `[hidden]` se
// come el atributo y el panel no se cierra, y las pruebas de interfaz no se
// enteran. Aquí se lee styles.css como texto y se comprueban las reglas que
// ya nos mordieron una vez.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(RAIZ, "styles.css"), "utf8");

// Quita los comentarios para no confundir reglas comentadas con reglas vivas.
const sinComentarios = css.replace(/\/\*[\s\S]*?\*\//g, "");

test("el atributo hidden gana a cualquier display de componente", () => {
  // Sin esta regla, #carrito (display:flex) y el velo (display:grid) se
  // quedaban abiertos aunque el JS les pusiera hidden.
  const regla = sinComentarios.match(/\[hidden\]\s*\{[^}]*\}/);
  assert.ok(regla, "falta la regla [hidden] en styles.css");
  assert.match(regla[0], /display\s*:\s*none\s*!important/);
});

test("la regla [hidden] va en la capa reset, antes que los componentes", () => {
  const capaReset = sinComentarios.indexOf("@layer reset");
  const capaComponentes = sinComentarios.indexOf("@layer componentes");
  const posicion = sinComentarios.search(/\[hidden\]\s*\{/);
  assert.ok(capaReset >= 0, "no existe la capa reset");
  assert.ok(capaComponentes >= 0, "no existe la capa componentes");
  assert.ok(
    posicion > capaReset && posicion < capaComponentes,
    "la regla [hidden] debe estar dentro de la capa reset",
  );
});

test("los paneles que se ocultan con hidden no fijan display sin condicional", () => {
  // #carrito y #velo se ocultan con el atributo hidden. Si su display se
  // declara a secas, el navegador lo aplica igual y el panel no se cierra.
  for (const selector of ["#carrito", "#velo"]) {
    const bloque = sinComentarios.match(
      new RegExp(`${selector}\\s*\\{([^}]*)\\}`),
    );
    if (!bloque) continue; // el selector puede estar agrupado; no se exige
    assert.doesNotMatch(
      bloque[1],
      /display\s*:\s*(flex|grid|block)\s*;/,
      `${selector} fija display sin condición: hidden no lo cerrará`,
    );
  }
});

test("las llaves del CSS están equilibradas", () => {
  const abre = (sinComentarios.match(/\{/g) || []).length;
  const cierra = (sinComentarios.match(/\}/g) || []).length;
  assert.equal(abre, cierra, "hay llaves sin cerrar en styles.css");
});
