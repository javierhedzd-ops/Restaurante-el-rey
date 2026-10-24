import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
for (const [w, h, nombre] of [[1280, 900, 'escritorio'], [768, 1024, 'tableta'], [390, 844, 'movil']]) {
  const p = await b.newPage({ width: w, height: h, dsf: 1, mobile: w < 500 });
  await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 600 });
  const info = await p.eval(`(() => {
    const out = [];
    const s = document.querySelector('#nosotros');
    const r0 = s.getBoundingClientRect();
    out.push('seccion alto=' + Math.round(r0.height));
    for (const sel of ['.nosotros__cita', '.nosotros__ficha', '.nosotros__columnas', '.nosotros__foto']) {
      const el = s.querySelector(sel); const r = el.getBoundingClientRect();
      out.push('  ' + sel.padEnd(22) + ' x' + Math.round(r.left) + '-' + Math.round(r.right) + ' y' + Math.round(r.top - r0.top) + '-' + Math.round(r.bottom - r0.top));
    }
    const q = document.querySelector('#preguntas');
    const rq = q.getBoundingClientRect();
    out.push('preguntas alto=' + Math.round(rq.height));
    for (const el of q.querySelectorAll('.pregunta')) {
      const r = el.getBoundingClientRect();
      out.push('  pregunta x' + Math.round(r.left) + '-' + Math.round(r.right) + ' y' + Math.round(r.top - rq.top) + ' h' + Math.round(r.height));
    }
    return out.join('\\n');
  })()`);
  console.log('=== ' + nombre + ' ' + w + 'x' + h + '\n' + info);
  await p.close();
}
await b.close();
