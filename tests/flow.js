// End-to-end flows: practice (right and wrong answers), mistakes queue, exam builder, quiz, theme switch, search, reference drawer, report dialog.
const { chromium } = require(require('child_process').execSync('npm root -g').toString().trim() + '/playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
  let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } else console.log('ok  ', m); };
  p.on('pageerror', e => { bad++; console.log('PAGEERR', e.message); });
  await p.goto('file://' + path.join(__dirname, '..', 'index.html') + '?debug'); await p.waitForTimeout(400);
  // practice: wrong then right on a choice problem
  await p.evaluate(() => location.hash = 'practice'); await p.waitForTimeout(400);
  const first = await p.evaluate(() => { const c = document.querySelector('#pr-list .prob:not([hidden])'); return c.id; });
  const card = '#' + first;
  const info = await p.evaluate(sel => { const c = document.querySelector(sel); return { choice: !!c.querySelector('.sopts'), ans: c.rpCtx.ans }; }, card);
  console.log('first problem', first, JSON.stringify(info));
  if (info.choice) {
    const wrongIdx = await p.evaluate(sel => { const c = document.querySelector(sel); return Array.from(c.querySelectorAll('.sopts button')).findIndex(b => b.textContent !== c.rpCtx.ans); }, card);
    await p.click(`${card} .sopts button:nth-child(${wrongIdx + 1})`);
    ok(await p.evaluate(sel => document.querySelector(sel + ' .fb').classList.contains('no'), card), 'wrong answer shows red feedback');
    ok(await p.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('chem-review') || '{}')).length === 1), 'wrong answer queued for review');
    await p.evaluate(sel => { const c = document.querySelector(sel); Array.from(c.querySelectorAll('.sopts button')).find(b => b.textContent === c.rpCtx.ans).click(); }, card);
    ok(await p.evaluate(sel => document.querySelector(sel).classList.contains('solved'), card), 'right answer marks solved');
  } else {
    await p.fill(`${card} input`, '999'); await p.click(`${card} button[type=submit]`);
    ok(await p.evaluate(sel => document.querySelector(sel + ' .fb').classList.contains('no'), card), 'wrong numeric answer');
    await p.fill(`${card} input`, String(info.ans)); await p.click(`${card} button[type=submit]`);
    ok(await p.evaluate(sel => document.querySelector(sel).classList.contains('solved'), card), 'right numeric answer marks solved');
  }
  ok((await p.textContent('#pr-score')).startsWith('1 of'), 'score updates');
  // review queue
  await p.evaluate(() => location.hash = 'review'); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelectorAll('#rv-list .prob').length >= 1), 'mistakes queue lists the missed problem');
  // exam
  await p.evaluate(() => location.hash = 'exam'); await p.waitForTimeout(300);
  await p.click('#ex-all'); await p.click('#ex-start'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.querySelectorAll('#ex-list .prob').length > 0), 'exam set built');
  await p.click('#ex-submit'); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('#ex-result').hidden), 'exam graded');
  // quiz and done button
  await p.evaluate(() => location.hash = 'vsepr'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelectorAll('#v-vsepr .quiz .opts button')[3].click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('chem-done') || '{}').vsepr === 1), 'right quiz answer marks the module done');
  // worked example steps
  await p.evaluate(() => { const b = document.querySelector('#v-vsepr [data-next]'); b.click(); b.click(); });
  ok(await p.evaluate(() => document.querySelectorAll('#v-vsepr .exsteps li:not([hidden])').length === 2), 'worked example reveals one step per click');
  // theme + search + drawer + report
  await p.click('#theme-btn'); ok(await p.evaluate(() => document.documentElement.getAttribute('data-theme') === 'light'), 'theme button cycles');
  await p.keyboard.press('/'); await p.waitForTimeout(300); await p.keyboard.type('vsepr'); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('#cmd-list li[data-id]').length >= 1), 'search finds VSEPR'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('#fs-btn'); await p.click('#fs-tabs [data-tab=pt]'); await p.click('#pt-grid button[data-z="26"]');
  ok((await p.textContent('#pt-info')).includes('Iron') && (await p.textContent('#pt-info')).includes('[Ar] 4s² 3d⁶'), 'periodic table shows iron with its configuration');
  await p.click('#fs-close'); await p.waitForTimeout(400);
  await p.evaluate(() => document.querySelector('[data-report="vsepr"]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => document.getElementById('rp').open), 'report dialog opens');
  console.log(bad ? bad + ' failure(s)' : 'all flows passed'); await b.close(); process.exit(bad ? 1 : 0);
})();
