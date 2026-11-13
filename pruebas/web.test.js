// Pruebas sin dependencias: npm test (node --test busca los *.test.js)
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const RAIZ = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(RAIZ, 'index.html'), 'utf8');
const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];

// Lee la configuración (MENU, HORARIO, VITRINA_PRIMERO, WHATSAPP) sin tocar el DOM
function configuracion() {
  const inicio = script.indexOf('const WHATSAPP');
  const fin = script.indexOf('/* ====', script.indexOf('const VITRINA_PRIMERO'));
  const codigo = script.slice(inicio, fin) + '\n({ WHATSAPP, HORARIO, MENU, VITRINA_PRIMERO })';
  return vm.runInNewContext(codigo);
}

test('el JavaScript de la página no tiene errores de sintaxis', () => {
  assert.doesNotThrow(() => new vm.Script(script));
});

test('existe cada archivo local que pide la página (menos las fotos opcionales)', () => {
  const rutas = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g), ...html.matchAll(/url\('([^')]+)'\)/g)]
    .map(m => m[1]).filter(r => !r.startsWith('fotos/') && !r.includes('${'));
  assert.ok(rutas.length > 0);
  for (const r of rutas) assert.ok(fs.existsSync(path.join(RAIZ, r)), `falta ${r}`);
});

test('no carga nada de otros servidores (ni CDN ni Google Fonts)', () => {
  const externos = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map(m => m[1])
    .filter(u => !/^https:\/\/(maps\.google\.com|maps\.app\.goo\.gl|wa\.me)\//.test(u));
  assert.deepEqual(externos, []);
  assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(html));
});

test('el menú es coherente: ids únicos, foto y precio válido en cada platillo', () => {
  const { MENU, VITRINA_PRIMERO } = configuracion();
  const ids = new Set();
  for (const sec of MENU) for (const it of sec.items) {
    assert.ok(!ids.has(it.id), `id repetido: ${it.id}`); ids.add(it.id);
    assert.match(it.foto, /^[a-z0-9-]+$/, `foto sin nombre válido: ${it.id}`);
    assert.ok(it.p === null || (Number.isInteger(it.p) && it.p > 0), `precio raro: ${it.id}`);
  }
  for (const id of VITRINA_PRIMERO) assert.ok(ids.has(id), `la vitrina pide un id que no existe: ${id}`);
});

test('el teléfono del pie es el mismo número que recibe los pedidos', () => {
  const { WHATSAPP } = configuracion();
  const tel = html.match(/href="tel:\+(\d+)"/)[1];
  assert.equal(tel, WHATSAPP);
});

test('el horario escrito coincide con el que decide "abierto / cerrado"', () => {
  const { HORARIO } = configuracion();
  assert.deepEqual([...HORARIO.diasCerrado], [2]); // martes
  assert.match(html, /MARTES CERRADO/);
  const h12 = t => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
  assert.match(html, new RegExp(`${h12(HORARIO.abre)} A ${h12(HORARIO.cierra)}`));
});

test('la página trae la regla [hidden] (si no, se ven cosas ocultas)', () => {
  assert.match(html, /\[hidden\]\s*\{\s*display:\s*none/);
});

test('cada platillo y cada sección tienen su traducción al inglés', () => {
  const { MENU } = configuracion();
  for (const sec of MENU) {
    assert.ok(sec.titulo_en, `falta titulo_en en ${sec.cat}`);
    if (sec.nota) assert.ok(sec.nota_en, `falta nota_en en ${sec.cat}`);
    if (sec.etiqueta) assert.ok(sec.etiqueta_en, `falta etiqueta_en en ${sec.cat}`);
    for (const it of sec.items) assert.ok(it.n_en && it.d_en, `falta n_en o d_en en ${it.id}`);
  }
});

test('los textos de la página en español e inglés tienen las mismas claves', () => {
  const bloque = script.slice(script.indexOf('const TXT = {'), script.indexOf('let idioma'));
  const TXT = vm.runInNewContext('(' + bloque.replace('const TXT =', '').trim().replace(/;$/, '') + ')');
  assert.deepEqual(Object.keys(TXT.en).sort(), Object.keys(TXT.es).sort());
});

test('envío por distancia: cuota base y precio por km adicional', () => {
  const inicio = script.indexOf('const ENVIO'); const fin = script.indexOf('};', inicio) + 2;
  const ENVIO = vm.runInNewContext(script.slice(inicio, fin) + '\nENVIO');
  assert.ok(ENVIO.restaurante === null || (Math.abs(ENVIO.restaurante.lat - 20.97) < 0.3 && Math.abs(ENVIO.restaurante.lng + 89.62) < 0.3), 'la ubicación del restaurante debe estar en Mérida');
  assert.ok(ENVIO.factorCalle >= 1 && ENVIO.factorCalle <= 2);
  for (const k of ['base', 'baseKm', 'porKm', 'maxKm', 'minutos']) assert.ok(Number.isFinite(ENVIO[k]) && ENVIO[k] >= 0, k + ' no válido');
  const i2 = script.indexOf('function costoEnvio'); const f2 = script.indexOf('\n    }', i2) + 6;
  const costo = vm.runInNewContext(script.slice(i2, f2) + '\ncostoEnvio', { ENVIO, Math });
  assert.equal(costo(3), ENVIO.base, 'dentro de la distancia base cobra la cuota base');
  assert.equal(costo(ENVIO.baseKm), ENVIO.base);
  assert.equal(costo(ENVIO.baseKm + 0.4), ENVIO.base + ENVIO.porKm, 'cada km empezado de más suma porKm');
  assert.equal(costo(ENVIO.baseKm + 2), ENVIO.base + 2 * ENVIO.porKm);
});
