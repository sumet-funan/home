# home

A small collection of personal projects.

## Home page

`index.html` at the repo root is a Thai-language menu page that links to every app below. It is live at https://sumet-funan.github.io/home/. It is one HTML file with no build step. To add a new app, add an entry to the `apps` array in its `<script>` (`href`, `icon`, `name`, `desc`, `tag`, and `accent` as a `[light, dark]` colour pair). For an app with a build step, point `href` at the built folder, as `greenhouse/app/` does.

## Math Lesson

A Thai-language math practice web app for kids, covering addition, subtraction, multiplication, and division. Built with vanilla HTML/JS, jQuery, Bootstrap 5, and SweetAlert2 — no build step required, just open `math-lesson/index.html` in a browser.

## Bird Scarer

A Thai-language, step-by-step build guide for a solar-powered pigeon scarer (ESP32 + HLK-LD2410C radar + DFPlayer + horn speaker): parts list with running totals, assembly steps with saved progress, wiring diagram, firmware and troubleshooting. Plain HTML/CSS/JS with no build step; serve the `bird-scarer-web` folder over HTTP (for example `npx serve bird-scarer-web`), since the page loads its data and diagrams with `fetch`.

## Greenhouse

A Thai-language, step-by-step 3D build guide for a 3×6 m gable salad greenhouse made of galvanized box steel and M8 bolts: every step from site layout to shelving is animated (new parts fly in from the material pile, bolts are shown going in from the right side), with end-of-phase checklists saved in the browser. Vite + React + TypeScript with three.js (react-three-fiber) and GSAP; all numbers come from `greenhouse/docs/greenhouse-spec.md` and are checked by tests. Run `npm i && npm run dev` inside `greenhouse/`; see `greenhouse/README.md` for build and deployment. Live at https://sumet-funan.github.io/home/greenhouse/app/ (rebuild with `npm run build:pages` and commit `greenhouse/app/` to update it).

## Image Color Diff (สีตรงกันไหม?)

A Thai-language party-game helper: each player buys 3 snacks or drinks, photographs them on one phone, and the app finds each package's main colours and shows a **% similarity** for every pair across players (CIEDE2000 on the main colour, plus a secondary whole-palette score), with an adjustable "match" threshold (default 80%), a per-player summary and a shareable result image. Everything stays on the phone. Plain HTML/CSS/JS with no build step (ES modules, so serve over HTTP); tests with `node --test image-color-diff/test`, including the 34 Sharma ΔE2000 reference pairs. Live at https://sumet-funan.github.io/home/image-color-diff/.
