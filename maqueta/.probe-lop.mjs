import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
const p = await b.newPage({ width: 768, height: 1024, dsf: 1, mobile: false });
await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 800 });
const info = await p.eval(`(() => {
  const W = innerWidth, out = [];
  const s = document.querySelector('#cazo');
  const r0 = s.getBoundingClientRect();
  const top = r0.top + scrollY, bot = r0.bottom + scrollY;
  const flow = [];
  for (const el of s.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') continue;
    const r = el.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    const t = el.tagName;
    let kind = null;
    if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(t)) kind = 'media';
    else if (t === 'svg') { if (el.parentElement.closest('svg')) continue; kind = 'media'; }
    else if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(t) || el.getAttribute('role') === 'button') kind = 'control';
    else if (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1)) kind = 'text';
    else if (cs.backgroundImage && cs.backgroundImage.includes('url(')) kind = 'media';
    if (!kind) continue;
    flow.push({ kind, l: r.left, r: r.right, t: r.top + scrollY, b: r.bottom + scrollY, tag: t, cls: (el.className && el.className.baseVal === undefined ? el.className : '') });
  }
  const inside = flow.filter(x => x.t >= top - 2 && x.b <= bot + 2);
  const own = inside.filter(x => x.r - x.l < W * 0.97);
  out.push('W=' + W + ' section ' + Math.round(top) + '-' + Math.round(bot));
  out.push('own: ' + own.length + '  left=' + Math.round(Math.min(...own.map(x => x.l))) + ' right=' + Math.round(W - Math.max(...own.map(x => x.r))));
  for (const x of own.sort((a,b)=>a.l-b.l)) out.push('  ' + x.kind.padEnd(8) + x.tag.padEnd(8) + String(x.cls).slice(0,28).padEnd(30) + Math.round(x.l) + '-' + Math.round(x.r) + '  y ' + Math.round(x.t) + '-' + Math.round(x.b));
  return out.join('\\n');
})()`);
console.log(info);
await b.close();
