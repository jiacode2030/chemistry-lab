// Visual / sanity test: node tests/check.js [moduleId ...]
// Visits every view at desktop and phone width (light and dark). Looks for page errors, horizontal overflow, blank canvases,
// NaN/undefined text, duplicate ids, and presses every "Set it up for me" button. Screenshots go to tests/shots/.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path'), fs = require('fs');
const only = process.argv.slice(2);
const shots = path.join(__dirname, 'shots'); fs.mkdirSync(shots, { recursive: true });
(async () => {
  const b = await chromium.launch();
  let problems = 0; const say = (...a) => { problems++; console.log(...a); };
  for (const [w, h, dark] of [[1280, 900, false], [390, 800, true]]) {
    const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: dark ? 'dark' : 'light' });
    p.on('pageerror', e => say('PAGEERR', w, e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g|ERR_|Failed to load resource/.test(m.text())) say('CONSOLE', w, m.text()); });
    await p.goto('file://' + path.join(__dirname, '..', 'index.html') + '?debug');
    await p.waitForTimeout(500);
    if (w === 1280) {
      const d = await p.evaluate(() => { const ids = {}; document.querySelectorAll('[id]').forEach(e => ids[e.id.toLowerCase()] = (ids[e.id.toLowerCase()] || 0) + 1); return Object.entries(ids).filter(([k, v]) => v > 1 && !k.startsWith('prob-')); });
      if (d.length) say('DUP IDS', JSON.stringify(d));
    }
    let views = await p.evaluate(() => ['overview', ...Array.from(document.querySelectorAll('#nav a')).map(a => a.dataset.view)].filter((v, i, a) => a.indexOf(v) === i));
    if (only.length) views = views.filter(v => only.includes(v));
    for (const v of views) {
      await p.evaluate(v => location.hash = v, v); await p.waitForTimeout(700);
      if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) {
        const wide = await p.evaluate(() => Array.from(document.querySelectorAll('.view:not([hidden]) *')).filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest('.tablewrap,.steps,.fs,.ptwrap,.eqn')).slice(0, 4).map(e => e.tagName + '.' + e.className + '#' + e.id));
        say('OVERFLOW', w, v, JSON.stringify(wide));
      }
      const ids = await p.evaluate(() => Array.from(document.querySelectorAll('.view:not([hidden]) canvas')).map((c, i) => c.id || (c.id = 'cv-auto-' + i)));
      const blank = [];
      for (const id of ids) {
        await p.evaluate(id => { const c = document.getElementById(id); const y = c.getBoundingClientRect().top + scrollY - innerHeight / 3; scrollTo(0, y); }, id); await p.waitForTimeout(450);
        const isBlank = await p.evaluate(id => { const c = document.getElementById(id); if (!c.width || !c.clientWidth) return true; const x = c.getContext('2d'); const d = x.getImageData(0, 0, c.width, c.height).data; for (let i = 3; i < d.length; i += 4 * 37) if (d[i]) return false; return true; }, id);
        if (isBlank) blank.push(id);
      }
      if (blank.length) say('BLANK', w, v, blank);
      const bad = await p.evaluate(() => (document.querySelector('.view:not([hidden])').innerText.match(/\bNaN\b|undefined|\bInfinity\b|\[object/g) || []).length);
      if (bad) say('BADTEXT', w, v);
      const n = await p.evaluate(() => document.querySelectorAll('.view:not([hidden]) [data-show]').length);
      for (let i = 0; i < n; i++) {
        await p.evaluate(i => document.querySelectorAll('.view:not([hidden]) [data-show]')[i].click(), i); await p.waitForTimeout(160);
        if (await p.evaluate(() => (document.querySelector('.view:not([hidden])').innerText.match(/\bNaN\b|undefined|\bInfinity\b/g) || []).length)) say('SHOWBAD', w, v, i);
      }
      if (only.length || v === 'overview') { await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(shots, `${v}-${w}.png`), fullPage: false }); }
    }
    await p.close();
  }
  await b.close();
  console.log(problems ? `${problems} problem(s)` : 'all clean');
  process.exit(problems ? 1 : 0);
})();
