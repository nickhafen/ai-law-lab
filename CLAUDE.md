# ai-law-lab — Project Instructions

## Stack & Hosting
- Pure static site: HTML, CSS, vanilla JS — no build step
- Hosted on GitHub Pages (`main` branch → https://nickhafen.github.io/ai-law-lab/)
- Firebase Realtime Database for live student submissions and exercise config
- External CDNs: Plotly, PapaParse, Marked, DOMPurify, Firebase compat SDK
- One backend component: `cf-worker/` — a Cloudflare Worker that proxies OpenRouter API calls for the Token Explorer card, keeping the OpenRouter key server-side (stored as a Wrangler secret, never in the repo or the browser). Deployed separately with `npx wrangler deploy` from `cf-worker/`. Firebase Cloud Functions were tried first but BYU's Google Cloud org enforces a domain-restricted-sharing policy that blocks public (`allUsers`) invocation of any Cloud Run/Cloud Functions service — including via a Firebase Hosting rewrite — so the proxy lives on Cloudflare instead, outside that org. Everything else on the site remains build-step-free static files.

## After Significant Revisions
Whenever a meaningful change is made (new feature, refactored logic, new Firebase path, changed form behavior), provide step-by-step testing instructions in the following format:

1. **What to open** — instructor view, student submit URL, Firebase console, etc.
2. **What to do** — exact steps to exercise the changed behavior
3. **What to verify** — what a working result looks like
4. **What might be broken** — specific things to check if something feels off (e.g., a Firebase rule that needs updating, a settings field that needs re-saving, a browser that may behave differently)

Keep instructions concrete and ordered — assume the tester will follow them top to bottom on a real device.

## Architecture Notes
- All apps share a single `index.html` / `app.js` / `styles.css`
- Student submit view is triggered by `?submit` in the URL; it hides all instructor UI and shows only the submit form. `bindSubmitRouter()` dispatches on the parameter's value (`?submit=plotter`, `?submit=citations`); a bare `?submit` routes to the plotter for links handed out before the parameter took a value
- Exercise configs live in Firebase at `/configs/{exerciseName}` (e.g. `/configs/plotter`)
- Submission data lives at `/plotter`, `/citations`, `/configs`, etc. — see Firebase rules before adding new paths
- Plotter and citations both split into `live` and `archive` under their one permitted path — `/plotter/live/{pushId}` + `/plotter/archive/{sessionId}/{records,axes,archivedAt}`, `/citations/live/{pushId}` + `/citations/archive/{sessionId}/{records,prompt,archivedAt}`. Clearing archives the round instead of deleting it, and the CSV export reads live and archive together. No extra Firebase rule is needed, since rules cascade to children
- Shared CSV helpers (`csvCell`, `csvRow`, `csvDownload`, `csvDateStamp`) live in SHARED UTILITIES — reuse them for any new export
- Generic helpers `saveExerciseConfig(exercise, config)` and `onExerciseConfig(exercise, callback)` should be reused for any new interactive exercise

## Firebase Rules
Any new Firebase path needs a corresponding rule in the Firebase console (Realtime Database → Rules) before it will work. Current allowed paths: `plotter`, `configs`, `citations`.
