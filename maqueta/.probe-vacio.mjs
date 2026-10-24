import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
for (const [w, h, nombre] of [[1280, 900, 'escritorio'], [768, 1024, 'tableta'], [390, 844, 'movil']]) {
  const p = await b.newPage({ width: w, height: h, dsf: 1, mobile: w < 500 });
  await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 600 });
  const info = await p.eval(`(() => {
    const out = [];
    const W = innerWidth, B = document.body;
    const shown = (el) => { for (let p = el, i = 0; p && p !== B && i < 30; p = p.parentElement, i++) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
    const boxes = [];
    const walker = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); const rg = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const t = n.nodeValue.replace(/\\s+/g, ' ').trim(); if (t.length < 2) continue;
      const el = n.parentElement; if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest('svg')) continue;
      rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      if (!shown(el)) continue;
      boxes.push({ el, l: r.left, r: r.right, t: r.top + scrollY, b: r.bottom + scrollY });
    }
    for (const el of B.querySelectorAll('img, video, canvas, picture, iframe, svg, input, select, textarea, button, [role="button"]')) {
      const r = el.getBoundingClientRect(); if (r.width < 24 || r.height < 24) continue;
      if (!shown(el)) continue;
      boxes.push({ el, l: r.left, r: r.right, t: r.top + scrollY, b: r.bottom + scrollY });
    }
    for (const s of document.querySelectorAll('section')) {
      const r0 = s.getBoundingClientRect(); const top = r0.top + scrollY, bot = r0.bottom + scrollY;
      const inside = boxes.filter(x => x.t >= top - 2 && x.b <= bot + 2 && s.contains(x.el));
      const own = inside.filter(x => x.r - x.l < W * 0.97);
      const left = own.filter(x => x.l < W * 0.5), right = own.filter(x => x.r > W * 0.5);
      out.push('#' + (s.id || '?') + ' alto=' + Math.round(r0.height) + ' inside=' + inside.length + ' own=' + own.length + ' izq=' + left.length + ' der=' + right.length);
    }
    return out.join('\\n');
  })()`);
  console.log('=== ' + nombre + ' ' + w + 'x' + h + '\n' + info);
  await p.close();
}
await b.close();
