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
