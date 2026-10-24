import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
for (const [w, h, nombre] of [[1280, 900, 'escritorio'], [768, 1024, 'tableta'], [390, 844, 'movil']]) {
  const p = await b.newPage({ width: w, height: h, dsf: 1, mobile: w < 500 });
  await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 600 });
  const info = await p.eval(`(() => {
    const out = [];
    const s = document.querySelector('#cazo');
    const r0 = s.getBoundingClientRect();
    out.push('seccion alto=' + Math.round(r0.height));
    for (const el of s.querySelectorAll('.cazo__texto, .cazo__foto, .armador, .armador__resultado, .armador__boton')) {
      const r = el.getBoundingClientRect();
      out.push('  ' + el.className.padEnd(20) + ' x' + Math.round(r.left) + '-' + Math.round(r.right) + ' y' + Math.round(r.top - r0.top) + '-' + Math.round(r.bottom - r0.top));
    }
    return out.join('\\n');
  })()`);
  console.log('=== ' + nombre + ' ' + w + 'x' + h + '\n' + info);
  await p.close();
}
await b.close();
