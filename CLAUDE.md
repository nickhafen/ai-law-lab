# ai-law-lab — Project Instructions

## Stack & Hosting
- Pure static site: HTML, CSS, vanilla JS — no build step
- Hosted on GitHub Pages (`main` branch → https://nickhafen.github.io/ai-law-lab/)
- Firebase Realtime Database for live student submissions and exercise config
- External CDNs: Plotly, PapaParse, Marked, DOMPurify, Firebase compat SDK

## After Significant Revisions
Whenever a meaningful change is made (new feature, refactored logic, new Firebase path, changed form behavior), provide step-by-step testing instructions in the following format:

1. **What to open** — instructor view, student submit URL, Firebase console, etc.
2. **What to do** — exact steps to exercise the changed behavior
3. **What to verify** — what a working result looks like
4. **What might be broken** — specific things to check if something feels off (e.g., a Firebase rule that needs updating, a settings field that needs re-saving, a browser that may behave differently)

Keep instructions concrete and ordered — assume the tester will follow them top to bottom on a real device.

## Architecture Notes
- All apps share a single `index.html` / `app.js` / `styles.css`
- Student submit view is triggered by `?submit` in the URL; it hides all instructor UI and shows only the submit form
- Exercise configs live in Firebase at `/configs/{exerciseName}` (e.g. `/configs/plotter`)
- Submission data lives at `/plotter`, `/configs`, etc. — see Firebase rules before adding new paths
- Generic helpers `saveExerciseConfig(exercise, config)` and `onExerciseConfig(exercise, callback)` should be reused for any new interactive exercise

## Firebase Rules
Any new Firebase path needs a corresponding rule in the Firebase console (Realtime Database → Rules) before it will work. Current allowed paths: `plotter`, `configs`.
