import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
const p = await b.newPage({ width: 1280, height: 900, dsf: 1, mobile: false });
const errores = [];
p.on?.('console', m => errores.push(m));
await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 1500 });
const info = await p.eval(`(() => {
  const l = document.querySelector('#lista-platos');
  const c = document.querySelector('#contador-platos');
  return 'lista hijos=' + l.children.length + ' html=' + l.innerHTML.slice(0, 120) + ' | contador=' + c.textContent + ' | filtros=' + document.querySelector('#filtros').children.length;
})()`);
console.log(info);
await b.close();
