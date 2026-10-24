import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
const p = await b.newPage({ width: 1280, height: 900, dsf: 1, mobile: false });
await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 1500 });
const info = await p.eval(`(() => {
  const out = [];
  out.push('readyState=' + document.readyState);
  out.push('PLATOS=' + (typeof PLATOS) + ' NEGOCIO=' + (typeof NEGOCIO) + ' iniciar=' + (typeof iniciar));
  out.push('horario pintado=' + document.querySelectorAll('.horario tr').length);
  out.push('carrito=' + document.querySelector('#carrito-vacio')?.textContent?.trim().slice(0,40));
  return out.join('\\n');
})()`);
console.log(info);
await b.close();
