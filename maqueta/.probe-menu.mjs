import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
for (const [w, h, nombre] of [[1280, 900, 'escritorio'], [768, 1024, 'tableta'], [390, 844, 'movil']]) {
  const p = await b.newPage({ width: w, height: h, dsf: 1, mobile: w < 500 });
  await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 600 });
  const info = await p.eval(`(() => {
    const out = [];
    const s = document.querySelector('#menu');
    const r0 = s.getBoundingClientRect();
    out.push('alto=' + Math.round(r0.height));
    for (const el of s.querySelectorAll('.seccion__cabecera, .menu__barra, .menu__lista, .plato, .menu__vacio')) {
      const r = el.getBoundingClientRect();
      out.push('  ' + (el.className || el.tagName).slice(0, 24).padEnd(24) + ' x' + Math.round(r.left) + '-' + Math.round(r.right) + ' y' + Math.round(r.top - r0.top) + '-' + Math.round(r.bottom - r0.top) + ' h' + Math.round(r.height));
    }
    out.push('  platos visibles=' + [...s.querySelectorAll('.plato')].filter(e => e.offsetParent).length);
    return out.join('\\n');
  })()`);
  console.log('=== ' + nombre + ' ' + w + 'x' + h + '\n' + info);
  await p.close();
}
await b.close();
