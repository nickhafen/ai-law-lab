# Spec: Instructor / student role separation

Give instructors real control over what students see, when they see it, and what they can change — enforced by Firebase rules, not just hidden in the interface. Exactly one person ever signs in.

Status: draft v0.1 · Owner: Nick Hafen · Target: site-wide (all exercises)

---

## 1. Why this exists

Every app on the site shares one `index.html`, and the instructor console is the default view. A student who opens the site without `?submit` lands on the full console: roster, data-source URLs, config push, and the Clear buttons that archive a live round.

Three distinct problems get conflated under "split the interfaces":

1. **The interface has no roles.** Setup screens, answer reveals, and destructive controls are reachable by anyone with the URL.
2. **Permissions are path-level, not direction-level.** Rules allow `plotter`, `configs`, and `citations` wholesale, so they cannot distinguish "a student adding a submission" from "a student reading everyone else's" or "a student rewriting the class prompt." Hiding a button in CSS does not change what the database permits.
3. **Exercise content is served from a published Google Sheet.** The URL is in `app.js`, so the Product Counsel scenarios and their priority legal issues are readable by anyone who looks. No amount of sign-in changes that while the content is fetched from a public URL.

Problems 1 and 2 are the role split. Problem 3 is why the content bank exists.

## 2. What this is not

- Not a student identity system. Students never sign in (see §4).
- Not a migration to Firestore. The Realtime Database already does this; its rules are equally expressive here.
- Not a move off GitHub Pages. Authentication is entirely client-side; hosting is unchanged.

## 3. The five paths

The organizing idea: sort data by **which direction it travels**, and give each direction its own address and its own permissions.

| Path | Carries | Student access | Status |
|---|---|---|---|
| `/content/{exercise}` | The bank — questions, scenarios, answer keys | None | New |
| `/configs/{exercise}` | Published settings: prompts, word lists, which controls to show | Read | Exists |
| `/sessions/{sessionId}/{exercise}` | Live class state: the drawn question, the current group, whether a reveal has happened | Read, with the address | New |
| `/courses/{code}` | The stable Canvas link, pointing at whichever session is live | Read, with the code | New |
| `/{exercise}/live` + `/archive` | Student submissions | Add only; never read or delete | Exists |

### 3.1 Why this solves "no peeking ahead"

The bank is invisible to students. Drawing a question **copies that one item** into the session path, which students read. Question 4 is not hidden by styling or filtered in the browser — it has never been sent to the device. There is nothing to inspect.

**Watch out for:** `counselDrawEntry()` returns `{ name, title, text, risks }` as one bundle, and `risks` is the answer key. Publishing a draw must strip `risks` and send it separately only on reveal. Sending the whole object and hiding the panel in CSS would undo the entire design.

## 4. Roles

Three roles, only one of which authenticates:

- **Instructor** (signed in) — everything, plus the control surface.
- **Student** (never signed in) — submits without an account; reads published config and released session state. Keeps as much of the site public as possible.
- **Board** (the projector) — a read-only renderer over session state.

Student sign-in would buy exactly one thing: attribution that cannot be spoofed. Today a student types a name and could type someone else's. That matters only if these submissions ever carry a participation grade. Rules can read a verified email address later, so adding it is a change rather than a redesign.

Keeping students unauthenticated is what removes password resets, per-semester account lifecycles, permission tiers, and access monitoring from the project entirely.

## 5. Sign-in

Google sign-in with a law school account, via **popup** (not redirect — redirect is unreliable when the site's domain differs from Firebase's auth domain, which it does on GitHub Pages).

Setup, in order:

1. Firebase console → Authentication → enable **Google**. Optionally also enable email-link sign-in as a fallback.
2. Authentication → Settings → **Authorized domains** → add `nickhafen.github.io` (and `localhost` for local testing). Sign-in fails silently without this.
3. Sign in once from the live site, then copy the **User UID** from Authentication → Users.
4. Realtime Database → Data → add `/instructors/{uid}: true`. The console bypasses rules, so this works before the rules are published.

Benefits over a password: nothing to store, **no reset flow to build**, BYU's own multi-factor applies, and access dies with the account.

**Unverified:** whether BYU's Google Cloud org policies permit the Google provider. Firebase Authentication does not create IAM grants, so there is no reason to expect the domain-restricted-sharing policy that blocked Cloud Functions (see CLAUDE.md) to apply here — but this is step 1 precisely so it fails in ten minutes rather than after the work is built on it.

## 6. Session and course links

Students reach a session through a link, with no sign-in and no code to type — the "anyone with the link" model.

- **One stable course link** posted to Canvas once: `?c=lawai-f26`. It reads `/courses/{code}`, finds the live session, and joins it. It never changes.
- Starting a session generates a **random** session ID and points the course code at it. Not the archive's timestamp format, which is guessable.
- Two sections are two course codes pointing at two sessions. No collision, nothing to coordinate.
- When no session is live, the link shows the closing screen — "This session has ended," with links back to the publicly available exercises — rather than an error or a frozen view.

The course code is semi-public by nature; it is on Canvas. That is the same exposure as the room. Rotate and repost if it ever leaks further.

## 7. Firebase rules

Target state. `<instructor>` below stands for
`auth != null && root.child('instructors').child(auth.uid).val() === true`.

| Path | `.read` | `.write` |
|---|---|---|
| `/` (default) | false | false |
| `/instructors` | false | false |
| `/instructors-private/$uid` | `auth.uid === $uid` | `auth.uid === $uid` |
| `/content/$exercise` | `<instructor>` | `<instructor>` |
| `/configs/$exercise` | true | `<instructor>` |
| `/sessions` | **false** | — |
| `/sessions/$sessionId` | true | `<instructor>` |
| `/courses` | **false** | — |
| `/courses/$code` | true | `<instructor>` |
| `/{exercise}/live` | `<instructor>` | — |
| `/{exercise}/live/$pushId` | — | `!data.exists() && newData.exists()` |
| `/{exercise}/archive` | `<instructor>` | `<instructor>` |

**The rule that is easy to get wrong:** permissions cascade downward and cannot be narrowed at a deeper level. `".read": true` on `sessions` itself would not expose one session — it would make the whole tree readable *and listable*, so anyone could enumerate every class ever run. Read permission therefore sits on `$sessionId` and `$code`, never the parent. Knowing an address gets you in; there is no way to ask what addresses exist.

Write-only submissions use `!data.exists() && newData.exists()` so a submission can be created but never edited or deleted. Add `.validate` length caps — the submissions path is public by necessity, and length limits are what stop someone pasting a novel into the database.

## 8. Phases

Order matters for the first two: sign-in must exist before the database is locked, or you lock yourself out. Phases 3–7 are independent.

| # | Phase | Effort | Notes |
|---|---|---|---|
| 1 | Turn on sign-in | ~2 hrs | Nothing locked yet; app behaves as before |
| 2 | Lock down the database | ~2 hrs | Highest risk; test signed out before trusting it |
| 3 | Role-aware interface | ~4 hrs | `data-role` on `<html>`, CSS does the hiding |
| 4 | Thin student page | ~4 hrs | Also a large load-time win (see §9) |
| 5 | Live sessions | ~4–6 hrs | Panel first as the proving ground, then Counsel |
| 6 | Content bank + Sheet import | ~3 hrs | Covers Panel and Counsel together |
| 7 | Token Explorer visibility config | ~2 hrs | Plus ~2 hrs if the Worker must verify sign-in |

### Phase 3 — role-aware interface

`data-role="student|instructor"` on `<html>`, derived from auth state by **one** shared function. CSS does the bulk of the hiding (`[data-role="student"] .instructor-only { display: none }`), which is far less work than editing every id-driven render function. This is convenience, not a boundary — §7 is the boundary.

Instructor-only surfaces: the settings modal (all tabs), Clear and Export, the QR/link panels, demo-mode toggles, setup screens, and the Input · Function · Output board (`#iof-app`), which is instructor-only presentation by design.

### Phase 4 — thin student page

Student submit currently renders as an overlay inside `index.html`, so a phone on classroom wifi downloads Plotly, PapaParse, Marked, DOMPurify, the full HTML and JS, and `favicon.png` — to show a six-field form. A separate page loading only the two Firebase scripts is a large win independent of roles, and it makes the split structural: a page with no instructor markup cannot leak instructor UI.

The forms were consolidated into one tabbed `#submit-view` with `SUBMIT_TABS` in `ce95109`, which does most of the extraction work already. Keep `?submit` working; `plotterBuildQR()` / `citeBuildQR()` build their URLs at runtime, so pointing them at the new page updates every QR and copy-link at once. Leave a redirect for links already handed out.

### Phase 5 — live sessions

`SHOW_LEGAL_RISKS` stops being a hardcoded constant and becomes a control pressed during class, recorded in the session. `drawQuestion()` and `counselDrawEntry()` already compute the right payload — they write it to local variables instead of Firebase.

Because the projector is the primary surface, the first job is driving the projected view from a second device, where the answer key is visible only to the instructor. See §12.

### Phase 6 — content bank

Keep Google Sheets as the **authoring** surface; stop **serving** from it. An "Import to lab" button parses the CSV (PapaParse is already loaded) and writes to `/content/{exercise}`. Bulk editing stays in a spreadsheet, no editor gets built, and class stops depending on a published Sheet URL resolving.

### Phase 7 — Token Explorer

Two kinds of control, which must live in different places:

- **Cost ceilings** (`MODEL_WHITELIST`, `MAX_TOKENS_CEILING`, `PROMPT_CHAR_CAP`) protect the OpenRouter bill and stay enforced in the Worker. Never client-editable. Raising one for a demo means the Worker verifies a Firebase ID token and applies instructor-tier limits.
- **Pedagogical controls** (which parameters appear, defaults, model chosen from among those allowed) are pure interface and belong in `/configs/tokenExplorer`, which already works. Add a `visible: { temperature, topK, seed, systemPrompt }` object; `tokenApplyConfig()` toggles a class per control. It currently pushes parameter *values* but has no concept of parameter *visibility*.

## 9. Protecting the OpenRouter budget

The one place an attacker gains something real. Per-request cost is already tightly bounded — 60 output tokens, 8,000 input characters, three approved models — so no single request can be made expensive. The only available attack is volume.

| Control | Effort | Verdict |
|---|---|---|
| An OpenRouter key with its own credit limit | 2 min, no code | **Do this first.** Turns "someone drained my account" into "a key stopped working." Also disable auto top-up and keep a modest balance. |
| Cloudflare Turnstile | ~2 hrs | Hold in reserve. Free, unlimited, sits naturally in front of a Worker, invisible to real users — but one more thing that can fail in front of a class. |
| Per-visitor rate limiting | ~4 hrs + possible $5/mo | Last resort. Needs per-request KV writes (free tier is 1,000/day, which one class could approach) or Durable Objects on the paid plan. |

The origin allowlist in the Worker stops other *websites* from embedding the endpoint. It is not a defense against direct calls, so it should not be counted as one.

`token-cached-examples.json` already serves some demonstrations without touching the API. Leaning on cached examples for the demos repeated every semester cuts live calls and makes the exercise work when the network does not.

## 10. Conventions to match

- Reuse `saveExerciseConfig()` / `onExerciseConfig()` for anything config-shaped.
- Reuse the shared CSV helpers (`csvCell`, `csvRow`, `csvDownload`, `csvDateStamp`) for exports.
- Button roles per the rule above `.btn-primary` in `styles.css`.
- Clearing archives rather than deletes. Keep that — it means even a successful attack is recoverable, and it is the project's best existing mitigation.
- Every new path in §3 needs its rule published before it will work (CLAUDE.md, Firebase Rules).

## 11. Acceptance checks

1. Signed out, the main page shows no settings modal, no Clear or Export, no setup screens, no QR panels.
2. Signed out, a browser console cannot read `/{exercise}/live`, write `/configs/*`, or read `/content/*`.
3. Signed out, a submission still succeeds — and cannot then be edited or deleted.
4. `/sessions` and `/courses` cannot be listed; a known session ID or course code still reads.
5. A released question appears in the student payload; an undrawn question appears nowhere in it.
6. A Product Counsel draw reaches the session path **without** `risks` until reveal is pressed.
7. The course link shows the closing screen when no session is live.
8. Signed in on a second machine, the roster falls back to the synced copy; with local data present, local wins.

## 12. Open decisions

1. **Mirror or extend to the projector?** Mirroring means one screen shown twice, so there is nowhere private for controls or the answer key — the fix is a phone as remote, which needs the session path and classroom wifi. Extending means two browser windows can share state directly, no database and no wifi involved: less code and more robust. This decides how Phase 5 is built. The session path is worth having either way, because it is also what makes optional student follow views possible.
2. **Does the Token Explorer ever need caps raised live?** If not, Phase 7 is config-only and the Worker never learns about sign-in.
3. **Panel questions: secret or not?** The Counsel legal issues are the answer and worth protecting. The Panel questions may not be. Splitting the decision by exercise is allowed, though building one bank for both is simpler.

## 13. Settled

| Question | Decision |
|---|---|
| Projector or student devices? | Projector is primary; never *require* a phone beyond simple forms |
| Concurrent sections? | Unlikely now, but session IDs and course codes from day one |
| How much stays public? | As much as possible; restrict only where role separation demands it |
| Roster across machines? | Browser storage stays the source of truth; synced copy is a backup, local wins |
| End-of-session screen? | "This session has ended," linking back to the public exercises |
| Must content be secret? | Not strictly, but build one bank serving both exercises |
| Other instructors? | Just one for now; each addition later is a single console step |

## 14. What this unblocks

Three roadmap items currently wait on pieces of this spec:

- **Skill Explorer** wants a class code, per-person limits, and "should the class watch the presenter's live run?" — that is `/courses` and `/sessions`.
- **OTC Client Simulator try-it card** wants rate limiting and a model whitelist separate from the Token Explorer's — §9 is the same problem with the same answer.
- **Transcript capture** is blocked on "the card is public and anonymous, so whose transcripts are these?" — the role and session model is where that question gets answered.

This is infrastructure those three depend on, not a fourth idea beside them.
