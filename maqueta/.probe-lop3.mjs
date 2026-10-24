import { Browser } from '/data/data/com.termux/files/home/ari-skills/design-taste-frontend/scripts/lib/cdp.mjs';
const b = await Browser.launch();
const p = await b.newPage({ width: 768, height: 1024, dsf: 1, mobile: false });
await p.goto('file://' + process.cwd() + '/index.html', { timeoutMs: 30000, settleMs: 800 });
const info = await p.eval(`(() => {
  const W = innerWidth, SY = scrollY, B = document.body, out = [];
  const shown = (el) => { for (let p = el, i = 0; p && p !== B && i < 30; p = p.parentElement, i++) { const cs = getComputedStyle(p); if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false; } return true; };
  const boxes = [];
  const walker = document.createTreeWalker(B, NodeFilter.SHOW_TEXT); const rg = document.createRange();
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    const t = n.nodeValue.replace(/\\s+/g, ' ').trim(); if (t.length < 2) continue;
    const el = n.parentElement; if (!el || /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(el.tagName) || el.closest('svg')) continue;
    rg.selectNodeContents(n); const r = rg.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
    if (!shown(el)) continue;
    boxes.push({ kind: 'text', el, l: r.left, r: r.right, t: r.top + SY, b: r.bottom + SY, text: t.slice(0, 40) });
  }
  for (const el of B.querySelectorAll('img, video, canvas, picture, iframe, svg, input, select, textarea, button, [role="button"], a, div, section, figure, span, li')) {
    const tag = el.tagName; let kind = null;
    if (/^(IMG|VIDEO|CANVAS|PICTURE|IFRAME)$/.test(tag)) kind = 'media';
    else if (tag === 'svg') { if (el.parentElement && el.parentElement.closest('svg')) continue; kind = 'media'; }
    else if (/^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(tag) || el.getAttribute('role') === 'button') kind = 'control';
    else { const bi = getComputedStyle(el).backgroundImage; if (bi && bi.includes('url(')) kind = 'media'; else continue; }
    const r = el.getBoundingClientRect(); if (r.width < 24 || r.height < 24) continue;
    if (kind === 'media' && r.width * r.height < 48 * 48) continue;
    if (!shown(el)) continue;
    boxes.push({ kind, el, l: r.left, r: r.right, t: r.top + SY, b: r.bottom + SY, text: tag });
  }
  const s = document.querySelector('#cazo');
  const r0 = s.getBoundingClientRect(); const top = r0.top + SY, bot = r0.bottom + SY;
  const inside = boxes.filter(x => x.t >= top - 2 && x.b <= bot + 2 && s.contains(x.el));
  const own = inside.filter(x => x.r - x.l < W * 0.97);
  out.push('inside=' + inside.length + ' own=' + own.length);
  for (const x of own) out.push('  ' + x.kind.padEnd(8) + Math.round(x.l) + '-' + Math.round(x.r) + '  ' + x.text);
  return out.join('\\n');
})()`);
console.log(info);
await b.close();
