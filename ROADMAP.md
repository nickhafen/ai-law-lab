# Roadmap

Ideas for expanding the AI & Law Lab, and how far along each one is. This file is public, like the rest of the repo.

**Stages:** 💡 Idea → 🔍 Exploring → 📝 Spec'd → 🛠️ Building → ✅ Shipped · ⏸️ Parked

| Idea | Area | Stage | Notes |
|---|---|---|---|
| [Copyright & AI exercises](#copyright--ai-exercises) | Copyright | 💡 Idea | Three paired-case comparisons |
| [NLP history timeline](#nlp-history-timeline) | How AI works | 💡 Idea | Interactive; includes a base (not post-trained) model |
| [AI history timeline](#ai-history-timeline) | How AI works | 💡 Idea | Might fold into the NLP timeline |
| [Dog Trainer (RL)](#dog-trainer-rl) | How AI works | 📝 Spec'd | [Spec v0.2](docs/specs/dog-trainer.md) |
| [Token Explorer: ⎵ for spaces](#token-explorer--for-spaces) | Token Explorer | 💡 Idea | Small tweak |
| [AI terms of service explorer](#ai-terms-of-service-explorer) | Contracts / ethics | 💡 Idea | |
| [AI lawsuit explorer](#ai-lawsuit-explorer) | Litigation | 💡 Idea | |
| [OTC Client Simulator: try-it card](#otc-client-simulator-try-it-card) | Client counseling | 📝 Spec'd | Skill and plugin shipped; the card needs a Worker route |
| [Transcript capture for the simulator](#transcript-capture-for-the-simulator) | Client counseling | 💡 Idea | Deliberately deferred out of the card |
| [Skill Explorer](#skill-explorer) | Using AI | 🔍 Exploring | Demo (replay) + active (run your own prompt) modes; next step is an API feasibility test |

When an idea moves, update its row. Specs go in [`docs/specs/`](docs/specs/).

---

## Copyright & AI exercises

Examples, cases, and exercises built around paired comparisons. Two recurring questions: does fair use apply, and given this use of AI, is the output copyrightable?

**1. How much human input is enough for copyright protection?**
- *Zarya of the Dawn.* A comic book with AI art, first registered, then narrowed to cover only the text and the arrangement of the AI-generated images. (Lecture slide 27 has images and links.)
- *A Single Piece of American Cheese.* First denied. The artist submitted a [video](https://youtu.be/Fp-XulmbSbY?si=vARaGQQj9Sba4GC9&t=159) of the creation process, which showed lots of back-and-forth between human and AI, and the Copyright Office granted registration. (Slides 33–34.)

**2. Is training a model on copyrighted works fair use?**
- [*Bartz v. Anthropic*](https://www.courtlistener.com/docket/69058235/231/bartz-v-anthropic-pbc/): Judge Alsup held training was fair use, relying heavily on how transformative it is. He separately held that using pirated copies was not fair use.
- [*Kadrey v. Meta*](https://www.courtlistener.com/docket/67569326/598/kadrey-v-meta-platforms-inc/): Meta won partial dismissal, but the judge treated market effect as far more important than Judge Alsup did.

**3. Is a platform liable for its users' infringement?**
- *Disney v. Midjourney*: Disney argues Midjourney should have built stronger controls at both training and inference. [Complaint](https://www.courtlistener.com/docket/70513159/1/disney-enterprises-inc-v-midjourney-inc/), [answer](https://www.courtlistener.com/docket/70513159/20/disney-enterprises-inc-v-midjourney-inc/). (Slides 20–23.)
- Midjourney's [terms of service](https://docs.midjourney.com/hc/en-us/articles/32083055291277-Terms-of-Service) (§10) make users indemnify Midjourney.
- The reverse: Adobe and Microsoft (among others) indemnify users, under conditions, for infringing AI output, which lowers risk and helps enterprise sales. [Adobe generative AI terms](https://www.adobe.com/cc-shared/assets/pdf/legal/servicetou/adobe-generative-ai-product-specific-terms-en-us-20260423.pdf) (§8), [Microsoft Copilot Copyright Commitment](https://blogs.microsoft.com/on-the-issues/2023/09/07/copilot-copyright-commitment-ai-legal-concerns/).

## NLP history timeline

An interactive timeline with examples: ELIZA, BERT, early ChatGPT, and others. Background on how each was built and how it works, and the technical advances that made each step possible.

- Would love to find a model that hasn't been post-trained, to show what post-training does.

## AI history timeline

Like the NLP timeline, but for AI generally, with examples. Could share a component with the NLP timeline or become one timeline with a filter.

## Dog Trainer (RL)

Train a robot dog to kick a ball with reinforcement learning, based on Melanie Mitchell's example. Shows that weights are learned, not written; that people control only the training setup; and that the weights aren't human-readable.

- Spec: [docs/specs/dog-trainer.md](docs/specs/dog-trainer.md) (draft v0.2, open decisions in §13)

## Token Explorer: ⎵ for spaces

Show spaces with ⎵ (bottom square bracket) instead of the "SP" marker.

## AI terms of service explorer

AI terms of service examples from the lawyer's and/or the client's perspective.

- Compare consumer, paid, and enterprise tiers.
- Apply lawyers' ethical duties to each.
- Maybe a map of the agreements that apply and how they cross-reference each other (privacy policy, DPA, terms of service, EULA, AUP, …).

## AI lawsuit explorer

Show the different theories of liability in AI lawsuits, possibly as a data visualizer.

## OTC Client Simulator: try-it card

A card on the site that runs the simulator in the browser, so anyone can interview an OTC employee with no account and no install. It calls the existing Cloudflare Worker, which bundles the skill files at deploy time, so the card and every other install of the simulator run the same prompt. There is never a second copy.

**Shipped already:** the simulator is an Agent Skill inside a Claude Code plugin at [`plugins/otc-client-simulator/`](plugins/otc-client-simulator/), replacing the custom GPT that OpenAI is retiring. It installs in Claude Code, Claude.ai, Codex, and anything else that supports [Agent Skills](https://agentskills.io). Verified end to end against a cold agent: one persona file read per session, all three hint tiers in order, and prompt-extraction and false-authority attempts refused.

**Still to build:**
- An `/otc/chat` route on the Worker, alongside the Token Explorer's existing route. It strips the frontmatter from `SKILL.md`, adds a web-mode preamble, and appends only the chosen persona plus the questionnaire — about 4,600–4,900 tokens of system prompt per request. The card deliberately does no progressive disclosure: not sending the other three personas is what keeps their open risk areas out of reach.
- Caps on messages, message length, conversation length and `max_tokens`, a model whitelist separate from the Token Explorer's, and rate limiting keyed on the caller's IP.
- The card itself: a persona picker, a model select that names which model replied, a chat log, tiered hint and debrief buttons, and a transcript download.

**Open decision:** which non-OpenAI model to offer next to `openai/gpt-4.1-mini`. `google/gemini-2.5-flash` is the closest match on cost; `mistralai/mistral-medium-3.1` makes the vendor contrast sharper.

**Watch out for:** changing the skill means redeploying the Worker, or the card keeps serving the old prompt. Claude Code installs are versioned copies in `~/.claude/plugins/cache/`, so editing the repo changes nothing until the version is bumped and the marketplace updated.

## Transcript capture for the simulator

Keeping student transcripts or debriefs, so an instructor can see how a class did. Left out of the try-it card on purpose — it would mean a new Firebase path and a rule, and it raises a question worth answering first: the card is public and anonymous, so whose transcripts are these and what does the notice above the input need to say? Possibly better as an opt-in "submit your debrief" form on the student submit page than as silent logging.

## Skill Explorer

Teach what Agent Skills do that a plain prompt can't, without students having to install anything. Built around the [engagement-letter skill](https://github.com/nickhafen/nh-ai-skills), which shows five things: auto-triggering, progressive disclosure, bundled scripts, bundled templates, and real tracked changes. Should work for any skill, not just this one.

**Two modes:**
- *Demo:* replay a recorded run, faster than real time, with play / step / speed controls. A simplified file tree lights up as each file is read, each script runs, or each output is written. A context meter shows tokens growing as files load, starting from just the `description`. The .docx outputs render in the page (docx-preview), including the redline's tracked changes.
- *Active:* students send their own prompts to skills the instructor provided. Live visuals are nice to have. They come almost free if both modes share one internal event format and parser.

**Leaning toward:**
- Active runs go through the Claude API (Skills API + code execution) via a new `cf-worker/` route, so the key stays server-side. Each skill is uploaded once, and its ID is stored at `/configs/skills`.
- Demo traces are recorded from real API runs, then trimmed and annotated with teaching notes.
- Cost controls, enforced by the Worker and by Anthropic, not the page: a separate Anthropic workspace with a spend limit, an on/off flag in `/configs/skills`, a class code, and per-person or per-day limits.

**Open questions:**
- Get an Anthropic API key in its own workspace.
- Record demo traces from the API, or from Claude Code? Claude Code shows the multiple-choice intake; the API can't.
- Where it lives: an instructor card for demo, and maybe a `#submit-view` tab for active?
- Should the class be able to watch the presenter's live run? That needs a new Firebase path and rule.
- ChatGPT as a second platform later, to show that skills are an open format?

**Next steps:** a `/skills/run` feasibility test (2–3 litigation and transactional runs to see the real event shapes, where the skill sits in the sandbox, how long a run takes, what it costs, and how `pause_turn` behaves), then the event parser, then demo mode, then active mode. Later: a skill picker, and no-skill comparison runs that show how much the answer deadline varies without the skill.
