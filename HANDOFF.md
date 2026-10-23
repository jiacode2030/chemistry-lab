# Handoff: publish Chemistry Lab to GitHub

You are receiving a finished project: **Chemistry Lab**, an interactive AP Chemistry study site (44 modules, 194 randomized problem generators, FRQs, review tools). It is one self-contained `index.html` built from `src/` by `build.py`. The full git history (21 commits) is included.

## What to do
1. Unpack the archive and `cd chemistry-lab`. Check `git log --oneline` shows the history.
2. Create an empty GitHub repo named **chemistry-lab** under the owner `jiacode2030` (the site's "Report an issue" link points to `jiacode2030/chemistry-lab`; if the owner or name differs, change the `REPO` string in `src/js/report.js` and rebuild).
3. Add the remote and push the default branch:
   `git remote add origin https://github.com/jiacode2030/chemistry-lab.git && git push -u origin HEAD`
4. Turn on GitHub Pages: Settings, Pages, deploy from the default branch, root folder. The repo already has `.nojekyll`. The site will be at `https://jiacode2030.github.io/chemistry-lab/`.
5. Open the live URL and check that the overview loads, a simulation animates, and "Report an issue" opens a pre-filled issue on the repo.
6. Do **not** add analytics copied from the physics site (it reports to the Mechanics Lab counter). Add a separate counter only if asked.

## Facts to keep
- No build step is needed to view: `index.html` is committed. After editing `src/`, run `python3 build.py` (needs Python 3 and Node for the JS syntax check) and commit the new `index.html`.
- localStorage keys use the prefix `chem-`. The page has no doctype (quirks mode), so never create two ids or class names that differ only by case; `build.py` checks this.
- AP exam countdown: `AP_EXAM_DATES` in `src/js/ui.js` is set to 2027-05-06 (AP Chemistry, afternoon session). Confirm against https://apstudents.collegeboard.org/exam-dates each year.
- The footer states: "Unofficial study aid. Not affiliated with the College Board." and the study-only notice. Keep them.
- Theme: pastel green layer at the end of `src/css/chem.css`.

## Tests (optional, need Playwright with Chromium)
`node tests/check.js` (every module, desktop and phone, light and dark), `node tests/flow.js` (end-to-end flows), `node tests/audit.js` (stress-tests every problem generator), `node tests/design.js` (contrast and touch targets), `node tests/probdump.js <id>` (print sample problems). They load `index.html` from the repo folder.

## Known uncertainties
VSEPR 5 and 6 region shapes go beyond the exam; PES energies are approximate; some tabulated constants (Ksp, S°, ΔHf°) differ slightly between textbooks; the FRQs and "Which tool?" items are original and should be read by a teacher.
