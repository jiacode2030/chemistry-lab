#!/usr/bin/env python3
"""Assemble the single-file site: python3 build.py  ->  index.html

src/
  head.html shell_top.html shell_bottom.html   page shell (title/fonts, drawers, rail, <main> wrapper)
  css/*.css                                    engine.css (shared design system) + chem.css
  js/core.js registry.js chemlib.js ...        shared engine, in the order listed in JS_ORDER below
  modules/<id>.html + <id>.js                  one view and one script per module (ids from groups.json)
  review/*.html                                overview + the review/practice views
  ref/eq.html sol.html                         reference-sheet panes
  groups.json mods.json                        unit order and module titles; a module without files is "soon"
The output has no doctype on purpose (it renders in quirks mode like the Mechanics site), so ids and
class names match case-insensitively: never use two names that differ only by case.
"""
import json, pathlib, re, subprocess, sys, tempfile

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / 'src'
rd = lambda p: (SRC / p).read_text(encoding='utf-8')

groups = json.loads(rd('groups.json'))
mods = json.loads(rd('mods.json'))

def built(mid):
    return (SRC / 'modules' / f'{mid}.html').exists() and (SRC / 'modules' / f'{mid}.js').exists()

GROUPS, ROADMAP = [], []
for g in groups:
    ids = [i for i in g['ids'] if built(i)]
    soon = [i for i in g['ids'] if not built(i)]
    ROADMAP.append({**{k: g[k] for k in ('w', 'name', 'tag')}, 'ids': ids, 'soon': soon})
    if ids:
        GROUPS.append({**{k: g[k] for k in ('w', 'name', 'tag')}, 'ids': ids})
order = [i for g in GROUPS for i in g['ids']]

# --- css
css = rd('css/engine.css') + '\n' + rd('css/chem.css')

# --- html
body_modules = '\n'.join(rd(f'modules/{i}.html') for i in order)
# overview comes first in <main>, then modules, then the review views
ov = rd('review/overview.html')
rest = '\n'.join(rd(f'review/{n}.html') for n in ('practice', 'methods', 'exam', 'review', 'frq'))
shell_top = rd('shell_top.html').replace('@@EQSHEET@@', rd('ref/eq.html')).replace('@@SOLSHEET@@', rd('ref/sol.html'))
html = '\n'.join([rd('head.html'), '<style>', css, '</style>', shell_top, ov, body_modules, rest, rd('shell_bottom.html')])

# --- js
JS_ORDER = ['core.js', 'registry.js', 'chemlib.js']
js_parts = []
for n in JS_ORDER:
    t = rd(f'js/{n}')
    t = (t.replace('@@MODS@@', json.dumps({k: {'t': v['t'], 'd': v['d']} for k, v in mods.items()}, ensure_ascii=False))
          .replace('@@GROUPS@@', json.dumps(GROUPS, ensure_ascii=False))
          .replace('@@ROADMAP@@', json.dumps(ROADMAP, ensure_ascii=False)))
    js_parts.append(f'/* ===== {n} ===== */\n' + t)
for i in order:
    js_parts.append(f'/* ===== modules/{i}.js ===== */\n' + rd(f'modules/{i}.js'))
for n in ['overview.js', 'practice.js', 'teach.js', 'review_core.js', 'exam_review.js', 'route.js', 'ui.js', 'panels.js', 'report.js']:
    js_parts.append(f'/* ===== {n} ===== */\n' + rd(f'js/{n}'))
data_files = sorted((SRC / 'data').glob('*.js'))
# problem and FRQ banks load before the practice views are built, so insert them ahead of overview.js
bank = '\n'.join(f'/* ===== data/{p.name} ===== */\n' + p.read_text(encoding='utf-8') for p in data_files)
idx = next(k for k, t in enumerate(js_parts) if t.startswith('/* ===== overview.js'))
js_parts.insert(idx, bank)
tail = "if(/[?&]debug/.test(location.search))window.__chem={PROBS,FRQS,GROUPS,MODS,METHODS,fmt,sci};\nif(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{redraw();navSync(true);stepSync(true);});\ncurrent='';route();\n"
js = "(function(){\n'use strict';\n" + '\n'.join(js_parts) + '\n' + tail + '})();\n'

# syntax check with node before writing
with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as f:
    f.write(js)
r = subprocess.run(['node', '--check', f.name], capture_output=True, text=True)
if r.returncode:
    print(r.stderr)
    sys.exit('JS syntax error (see above). The line numbers refer to %s' % f.name)

out = html + '\n<script>\n' + js + '</script>\n'
# quirks-mode id check: no two ids differing only by case
ids = re.findall(r'\bid="([^"]+)"', out)
seen = {}
for i in ids:
    seen.setdefault(i.lower(), set()).add(i)
bad = {k: v for k, v in seen.items() if len(v) > 1}
dups = [k for k in seen if sum(1 for i in ids if i.lower() == k) > 1 and not k.startswith(('prob-',))]
if bad:
    sys.exit(f'ids differing only by case: {bad}')
(ROOT / 'index.html').write_text(out, encoding='utf-8')
print(f'index.html: {len(out)/1024:.0f} KB, {len(order)} modules built, {sum(len(g["soon"]) for g in ROADMAP)} planned')
if dups:
    print('warning: duplicate ids:', dups[:10])
