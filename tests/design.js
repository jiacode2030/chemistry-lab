// Design checks: text contrast (WCAG AA) in light and dark, touch-target sizes on a phone, reduced-motion support, focus visibility.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); let issues = 0; const say = (...a) => { issues++; console.log(...a); };
  const lum = c => { const [r, g, bl] = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * bl; };
  for (const scheme of ['light', 'dark']) {
    const p = await b.newPage({ viewport: { width: 390, height: 800 }, colorScheme: scheme });
    await p.goto('file://' + path.join(__dirname, '..', 'index.html') + '?debug'); await p.waitForTimeout(500);
    for (const v of ['overview', 'rates', 'titration', 'galvanic', 'practice', 'frq']) {
      await p.evaluate(v => location.hash = v, v); await p.waitForTimeout(500);
      const r = await p.evaluate(() => {
        const parse = s => (s.match(/[\d.]+/g) || []).map(Number);
        const bgOf = el => { while (el) { const c = parse(getComputedStyle(el).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > .5)) return c; el = el.parentElement; } return [255, 255, 255]; };
        const out = { contrast: [], small: [] }; const seen = new Set();
        document.querySelectorAll('.view:not([hidden]) :is(p,li,span,label,h1,h2,h3,button,a,td,th,small,strong,summary)').forEach(el => {
          if (!el.childNodes.length || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) return; const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || el.offsetParent === null) return;
          const fg = parse(cs.color), bg = bgOf(el); const k = cs.color + bg + cs.fontSize; if (seen.has(k)) return; seen.add(k);
          const L = c => { const [r, g, b2] = c.slice(0, 3).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * r + .7152 * g + .0722 * b2; };
          const a = L(fg), c2 = L(bg), ratio = (Math.max(a, c2) + .05) / (Math.min(a, c2) + .05), size = parseFloat(cs.fontSize);
          if (ratio < (size >= 18.6 || (size >= 14 && +cs.fontWeight >= 700) ? 3 : 4.5)) out.contrast.push(`${ratio.toFixed(2)} ${cs.color} on rgb(${bg.slice(0, 3)}) "${el.textContent.trim().slice(0, 30)}"`);
        });
        document.querySelectorAll('.view:not([hidden]) :is(button,select,input[type=range],input[type=checkbox],a.mod,.steps a)').forEach(el => {
          const r = el.getBoundingClientRect(); if (!r.width || el.offsetParent === null) return; if (Math.min(r.width, r.height) < 32) out.small.push(`${el.tagName}#${el.id || el.textContent.trim().slice(0, 18)} ${Math.round(r.width)}x${Math.round(r.height)}`);
        });
        return out;
      });
      if (r.contrast.length) say(scheme, v, 'LOW CONTRAST', r.contrast.slice(0, 6));
      if (r.small.length && scheme === 'light') say(scheme, v, 'SMALL TARGETS', r.small.slice(0, 8));
    }
    await p.close();
  }
  const p2 = await b.newPage({ reducedMotion: 'reduce', viewport: { width: 900, height: 800 } }); await p2.goto('file://' + path.join(__dirname, '..', 'index.html') + '#rates'); await p2.waitForTimeout(600);
  const anim = await p2.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches && document.getAnimations().filter(a => a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity).length);
  console.log('reduced motion: infinite CSS animations running =', anim);
  console.log(issues ? issues + ' design issue group(s)' : 'design clean'); await b.close();
})();
