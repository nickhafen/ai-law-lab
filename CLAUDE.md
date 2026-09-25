# ai-law-lab — Project Instructions

## Stack & Hosting
- Pure static site: HTML, CSS, vanilla JS — no build step
- Hosted on GitHub Pages (`main` branch → https://nickhafen.github.io/ai-law-lab/)
- Firebase Realtime Database for live student submissions and exercise config
- External CDNs: Plotly, PapaParse, Marked, DOMPurify, Firebase compat SDK
- One backend component: `cf-worker/` — a Cloudflare Worker that proxies OpenRouter API calls for the Token Explorer card, keeping the OpenRouter key server-side (stored as a Wrangler secret, never in the repo or the browser). Deployed separately with `npx wrangler deploy` from `cf-worker/`. Firebase Cloud Functions were tried first but BYU's Google Cloud org enforces a domain-restricted-sharing policy that blocks public (`allUsers`) invocation of any Cloud Run/Cloud Functions service — including via a Firebase Hosting rewrite — so the proxy lives on Cloudflare instead, outside that org. Everything else on the site remains build-step-free static files.
- `plugins/otc-client-simulator/` — the OTC Client Simulator, packaged as an Agent Skill (`skills/otc-client-simulator/SKILL.md` + `references/`) inside a Claude Code plugin. `.claude-plugin/marketplace.json` at the repo root lists it for Claude Code, and `.agents/plugins/marketplace.json` lists it for Codex. This is the only copy of the simulator's prompt; it replaced the old `gpts/` folder. Release steps, including the `version` bump in both `plugin.json` files and the `otc-sim-vN` tag, are in the plugin's `README.md`

## After Significant Revisions
Whenever a meaningful change is made (new feature, refactored logic, new Firebase path, changed form behavior), provide step-by-step testing instructions in the following format:

1. **What to open** — instructor view, student submit URL, Firebase console, etc.
2. **What to do** — exact steps to exercise the changed behavior
3. **What to verify** — what a working result looks like
4. **What might be broken** — specific things to check if something feels off (e.g., a Firebase rule that needs updating, a settings field that needs re-saving, a browser that may behave differently)

Keep instructions concrete and ordered — assume the tester will follow them top to bottom on a real device.

## Architecture Notes
- All apps share a single `index.html` / `app.js` / `styles.css`
- Student submit view is triggered by `?submit` in the URL; it hides all instructor UI and shows one tabbed page (`#submit-view`) holding every student form, so a single QR code covers every exercise. The parameter's value only picks the opening tab (`?submit=plotter`, `?submit=citations`; a bare `?submit` opens on the plotter), and switching tabs rewrites it with `replaceState` so a reload stays put. The name field sits above the tabs and is shared by every form (remembered in `localStorage` as `submit_student`). A new exercise's form needs a tab button, a `role="tabpanel"` wrapper, and an entry in `SUBMIT_TABS`
- Exercise configs live in Firebase at `/configs/{exerciseName}` (e.g. `/configs/plotter`)
- Submission data lives at `/plotter`, `/citations`, `/configs`, etc. — see Firebase rules before adding new paths
- Plotter and citations both split into `live` and `archive` under their one permitted path — `/plotter/live/{pushId}` + `/plotter/archive/{sessionId}/{records,axes,archivedAt}`, `/citations/live/{pushId}` + `/citations/archive/{sessionId}/{records,prompt,archivedAt}`. Clearing archives the round instead of deleting it, and the CSV export reads live and archive together. No extra Firebase rule is needed, since rules cascade to children
- Shared CSV helpers (`csvCell`, `csvRow`, `csvDownload`, `csvDateStamp`) live in SHARED UTILITIES — reuse them for any new export
- Generic helpers `saveExerciseConfig(exercise, config)` and `onExerciseConfig(exercise, callback)` should be reused for any new interactive exercise
- The Input · Function · Output board (`#iof-app`, `iof*` functions) is instructor-only presentation: it saves to `localStorage` (`iofBoard`, `iofTextSize`) and never touches Firebase, so it needs no rule. Cards drag with pointer events, not native HTML5 drag-and-drop, so touchscreens work. Arrows between cards are drawn on an SVG layer under the cards from live DOM positions; a ResizeObserver on each card redraws them, so anything that moves a card without resizing it must call `iofDrawLinks()` / `iofScheduleLinks()`

## Firebase Rules
Any new Firebase path needs a corresponding rule in the Firebase console (Realtime Database → Rules) before it will work. Current allowed paths: `plotter`, `configs`, `citations`.
