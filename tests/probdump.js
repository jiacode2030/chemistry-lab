// Prints one generated sample of every practice problem (question, answer, solution) so each can be checked by hand.
// node tests/probdump.js [id ...]     (use  N=5 node tests/probdump.js  for five samples each)
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('file://' + path.join(__dirname, '..', 'index.html') + '?debug'); await p.waitForTimeout(400);
  const only = process.argv.slice(2), N = +(process.env.N || 1);
  const out = await p.evaluate(({ only, N }) => {
    const strip = h => String(h).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
    return window.__chem.PROBS.filter(q => !only.length || only.includes(q.id)).map(q => Array.from({ length: N }, () => { const d = q.gen(); return { id: q.id, topic: q.topic, title: q.title, q: strip(d.q), ans: d.choices ? `[${d.ans}] ${d.choices[d.ans]}` : d.ans, shown: d.choices ? '' : window.__chem.fmt(d.ans, 4), unit: d.unit, tol: d.abs != null ? '±' + d.abs : (d.tol ?? .02), sol: strip(d.sol) }; }));
  }, { only, N });
  out.flat().forEach(o => console.log(`\n[${o.topic}/${o.id}] ${o.title}\n  Q: ${o.q}\n  A: ${o.shown || o.ans} ${o.unit || ''}  (tol ${o.tol})\n  S: ${o.sol}`));
  console.log(`\n${out.length} generators`); await b.close();
})();
