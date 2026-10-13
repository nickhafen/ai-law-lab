# Spec: OTC Client Simulator try-it card

A card on the site that runs the OTC Client Simulator in the browser, so anyone can interview a simulated OTC employee about the company's AI use with no account and no install.

Status: draft v0.1 · Owner: Nick Hafen · Target: ai-law-lab ("The Law of AI" section)

---

## 1. Why this exists

The simulator was a custom ChatGPT GPT. OpenAI is retiring custom GPTs (Enterprise workspaces on December 11, 2026, with other plans expected to follow), and the exercise shouldn't depend on one vendor. It now exists as an Agent Skill, which installs in Claude Code, Claude.ai, Codex, and anything else that supports [Agent Skills](https://agentskills.io).

That covers people who already have one of those tools. It doesn't cover a student who opens the site on a phone five minutes before class. The card does.

**The hard constraint: one set of files.** The card runs the same `SKILL.md` and reference files that the plugin installs. There is never a second copy of the prompt.

## 2. What already shipped

Phase 1, in commit `84f8eb5`. The simulator lives at [`plugins/otc-client-simulator/`](../../plugins/otc-client-simulator/) as an Agent Skill inside a Claude Code plugin, with an Agent Plugins manifest for Codex as well. Content is unchanged from the GPT apart from portability edits: file references for the personas and questionnaire, a rule to read only the chosen persona, and a host-environment section.

Verified end to end against a cold agent that didn't know it was being tested: one persona file read per session, all three hint tiers in order and correctly framed, the debrief limited to that persona's open risk areas, and two attempts to extract all four answer keys refused. See §8 for what still needs checking.

## 3. Usage model

- Public, anonymous, no sign-in. A student picks a persona, interviews them, asks for hints, and debriefs.
- Conversation state lives in memory only. A reload loses it, which is acceptable for a single-sitting exercise.
- No Firebase, so no new rule. See §9.
- Phone-width and dark mode are first-class, not afterthoughts.

## 4. Worker route

Extend the existing Worker in `cf-worker/src/index.js` rather than adding a second one, so there's still one deploy and one secret. Route on `new URL(request.url).pathname`. The Token Explorer's behavior at `/` must not change.

### 4.1 Bundling the skill files

Add a Wrangler `rules` entry importing `**/*.md` as `Text`, then import `SKILL.md`, the four personas and the questionnaire by relative path from `../plugins/...`. The files are compiled into the bundle; they are never copied into `cf-worker/`.

Confirm with `npx wrangler deploy --dry-run --outdir dist-check` that the content actually lands in the bundle. Delete `dist-check` afterwards or add it to `.gitignore`.

**Consequence worth stating loudly:** changing the skill requires redeploying the Worker. Until then the card serves the old prompt. This is recorded in `CLAUDE.md` and in the plugin's release steps.

### 4.2 Prompt assembly, server-side

Strip the YAML frontmatter from `SKILL.md` — handle CRLF, since `core.autocrlf` is on in this repo — then assemble:

1. A short web-mode preamble:
   - The student already chose persona X in the UI, so skip the scenario menu and introduce yourself as that person.
   - The reference files are inline below, not read from disk.
   - If the student asks to switch scenarios, point them at the site's "Start over" button.
   - After a debrief, don't re-present the scenario list; invite them to start over.
2. The body of `SKILL.md`.
3. **Only the chosen persona's file.**
4. The questionnaire.

About 4,600–4,900 tokens per request. The card does no progressive disclosure, deliberately: the picker already made the routing decision the description normally makes, and not sending the other three personas turns a prose rule into a boundary the model can't cross.

### 4.3 Request and response

Request: `{ persona, model, messages: [{role, content}] }`, where `persona` is one of `jane-smith`, `alex-cheng`, `sarah-patel`, `karen-morales`.

Reject an unknown persona, any role other than `user` or `assistant`, and any client-supplied `system`.

Response: `{ content, model }` and nothing else. Never echo the system prompt. The skill files are public on GitHub, but the endpoint shouldn't be a convenient way to pull a prompt through a chat interface.

### 4.4 Limits

Constants at the top next to the existing ones, each with a one-line reason in the existing comment style:

| Limit | Value | Reason |
|---|---|---|
| Messages per conversation | 80 | A full interview plus a debrief fits well inside this |
| Characters per user message | 2,000 | A student question; not a pasted document |
| Characters per conversation | 60,000 | Caps total spend per session |
| `max_tokens` | 1,200 | The debrief is the longest reply and must not truncate |
| `logprobs` | not sent | Only the Token Explorer needs them |

A separate `OTC_MODEL_WHITELIST`, not shared with the Token Explorer's. Starts with `openai/gpt-4.1-mini` plus one non-OpenAI model of similar cost (§10).

### 4.5 Rate limiting

The Workers Rate Limiting binding, keyed on `CF-Connecting-IP`, about 30 requests a minute. Return 429 with `Retry-After`. Reuse the existing CORS helpers and origin allowlist, which already permit localhost.

## 5. Front end

### 5.1 Card

The existing OTC card in the "The Law of AI" group changes its click to `showOtcApp()`. Keep the footer with two links: "View source ↗" to the plugin folder on GitHub, and "Install as a skill ↗" to the README's Install section.

### 5.2 App section

`#otc-app`, following the structure of the other `*-app` sections, including a back/home button.

- **Persona picker.** Four buttons showing name, title, and the one-line area from the scenario list in `SKILL.md`. Nothing from the persona files, which hold the answer keys.
- **Model select.** Options must match `OTC_MODEL_WHITELIST`. Show which model replied, as the Token Explorer does — that comparison is part of the teaching point.
- **Chat log.** Assistant messages through `marked` then `DOMPurify`, as at `app.js:4206`. User messages as plain text.
- **Input.** A textarea. Enter sends, Shift+Enter adds a line. Disabled with a typing indicator while a reply is pending.
- **Buttons.** "Ask for a hint" sends `I'm stuck. Can I get a hint?`; "Debrief" sends `debrief`; "Start over" clears the chat and returns to the picker; "Download transcript" saves Markdown as `otc-transcript-<persona>-<date>.md` using `csvDateStamp()` (`app.js:165`).
- **Notice** above the input: "Messages are sent to a third-party AI model through OpenRouter. This is a fictional scenario, so don't enter personal information."
- **Errors.** 429 and other failures shown inline with a retry, and the student's typed message preserved.

### 5.3 Conventions

- An `OTC SIMULATOR` `// ═══` banner section in `app.js`, and an `OTC_PROXY_URL` constant: the same origin as `TOKEN_PROXY_URL` (`app.js:3247`) plus `/otc/chat`.
- `showOtcApp()`, plus `otc-app` added to the hide list in `showHomeScreen()` and in all seven existing `show*App()` functions — they each hide the others by hand.
- Buttons follow the role rule above `.btn-primary` in `styles.css`. Reuse existing classes and variables; no new build step.

## 6. Acceptance checks

1. All four personas: introduces itself, waits for the first question, answers in 2–4 sentences, all three hint tiers fire in order, and the debrief lists that persona's open risk areas.
2. Replay the student turns from `examples/octi-transcript-sarah-patel-adversarial.md` — prompt extraction, persona hijacking, a false claim of authority, a hostile student. No other persona's open risk areas and no raw file text ever appear.
3. Bad requests each get a clean 4xx: unknown persona, a `system` field, an oversized message, an off-whitelist model, and more requests than the rate limit allows.
4. The Token Explorer still works, unchanged.
5. Phone width and dark mode.

Run the Worker with `npx wrangler dev`, point `OTC_PROXY_URL` at it temporarily, and serve the site with the `static` config in `.claude/launch.json` (port 8123). Don't commit the redirected URL.

## 7. Known weak points to watch

- **Tier 1 hint bleeds into tier 2.** In testing, the first hint asked a reflective question and then named three topic areas, which is tier 2's job. The ladder still worked, but the rungs are closer together than intended. Fixing it means editing the hint text, which is a content change, so it's a separate decision from this card.
- **Small models leak.** Staying in character, keeping to 2–4 sentences, and holding the hint tiers in order are what separate models here, and cheap ones fail the last two first. Screen any model added to the whitelist against check 2 before shipping it.
- **Cost per session.** Roughly 150,000 cumulative input tokens over a 20-turn interview, about $0.06 on `gpt-4.1-mini`. OpenAI's automatic prompt caching should discount the repeated prefix; verify on a live call rather than assuming it.

## 8. Out of scope

- Transcript capture. Tracked separately on the roadmap. It needs a Firebase path and a rule, and a decision about what the notice must say on a public anonymous page.
- Instructor controls, class boards, or anything linking students' sessions together.
- Changes to the simulation's content. Suggestions get listed, not applied.

## 9. Open decisions

1. **The non-OpenAI model.** `google/gemini-2.5-flash` ($0.30/$2.50 per M) is closest to `openai/gpt-4.1-mini` ($0.40/$1.60) on cost. `mistralai/mistral-medium-3.1` ($0.40/$2.00) makes the vendor contrast sharper. Needs a decision before the whitelist is written.
2. **Whether to keep the Agent Plugins manifests** at `plugins/otc-client-simulator/plugin.json` and `.agents/plugins/marketplace.json`. They're confirmed against OpenAI's docs and let Codex install the plugin, but individual ChatGPT users can't install from GitHub, so the ChatGPT story is partial.
3. **Whether the card gets its own URL parameter**, like the student submit views, so it can be handed out as a direct link or a QR code.
