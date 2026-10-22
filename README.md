# Chemistry Lab

An interactive, intuition-first study site for **AP Chemistry**: 3D molecules you can spin, particle simulations you can squeeze and heat, worked examples, randomized practice, and review tools. It is a sibling of [Mechanics Lab](https://github.com/jiacode2030/physics-mechanics) and shares its engine and design.

The whole site is one HTML file (`index.html`), built from a small `src/` folder. Open `index.html` in a browser, or serve the repo with GitHub Pages.

> **Unofficial study aid.** Not affiliated with the College Board.
>
> **Use it to study, not on graded work.** Don't use this site on homework you submit, in labs, or during quizzes and exams.

## Layout

```
build.py                 assembles src/ into index.html (checks JS syntax and id clashes)
src/
  head.html shell_top.html shell_bottom.html    page shell: fonts, drawers, side menu
  css/engine.css chem.css                       design system (shared with Mechanics Lab) + chemistry additions
  js/core.js                                    helpers, particles/confetti, the 3D viewer (view3d)
  js/registry.js chemlib.js                     roster/registries, atoms, molecules, the balloon (VSEPR) model
  js/practice.js teach.js ...                   problem cards, FRQ scoring, the teaching layer, router, theme, search
  modules/<id>.html + <id>.js                   one view and one script per module
  review/*.html                                 overview, practice, which-tool, exam, mistakes, FRQ views
  data/*.js                                     periodic table data (and, later, problem and FRQ banks)
  ref/eq.html sol.html                          equations/constants and solubility/ions reference sheets
  groups.json mods.json                         unit order and module titles
tests/
  check.js     visits every view at desktop and phone width (light/dark): overflow, blank canvases, NaN text, Set-it-up buttons
  flow.js      end-to-end flows: practice, mistakes queue, exam builder, quiz, search, periodic table, report dialog
  probdump.js  prints generated samples of every practice problem so the answers can be checked by hand
  audit.js     stress-tests every generator (400 samples each) for NaN text, bad choices, impossible values
  design.js    contrast, touch-target and reduced-motion checks
```

A module is "built" when both `src/modules/<id>.html` and `<id>.js` exist; modules listed in `groups.json` without files show as "Coming soon" on the overview.

## Build and test

```
python3 build.py                  # writes index.html
node tests/check.js [module ...]  # needs Node and Playwright (global install)
node tests/flow.js
N=3 node tests/probdump.js        # three samples of every generator
```

localStorage keys all start with `chem-` (Mechanics Lab uses `kin-`), so both sites can share a GitHub Pages domain. The page deliberately has no doctype and renders in quirks mode, so ids and class names match case-insensitively: never use two names that differ only by case (`build.py` checks ids).

## Reporting a problem

Every module and practice problem has a **Report an issue** link that opens a pre-filled GitHub issue. You can also [open an issue](https://github.com/jiacode2030/chemistry-lab/issues/new) directly.
