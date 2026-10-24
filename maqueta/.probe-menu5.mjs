import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
const p = await b.newPage({ width: 1280, height: 900, dsf: 1, mobile: false });
await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 1500 });
const info = await p.eval(`(() => {
  const out = [];
  out.push('platos=' + document.querySelectorAll('.plato').length + ' filtros=' + document.querySelector('#filtros').children.length + ' contador=' + JSON.stringify(document.querySelector('#contador-platos').textContent));
  const l = document.querySelector('#lista-platos');
  out.push('lista hijos=' + l.children.length + ' alto=' + Math.round(l.getBoundingClientRect().height));
  const s = document.querySelector('#menu').getBoundingClientRect();
  out.push('menu alto=' + Math.round(s.height));
  return out.join('\\n');
})()`);
console.log(info);
await b.close();
