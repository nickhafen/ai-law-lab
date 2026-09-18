# OTC Client Simulator v2 (Project version) — Sample Transcript

**Persona:** 2. Alex Cheng — Lead Engineer (Engineering team's use of public GenAI tools)
**Student role:** Outside counsel conducting an intake/fact-finding interview
**Format:** ChatGPT Project
**Instructions:** [v2](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v2/gpts/otc-client-simulator)
**Date generated:** September 18, 2026

---

## Evaluation

A short intake interview with Alex about the engineering team's use of GitHub Copilot and ChatGPT Plus. Partway through, the student pauses the roleplay to ask whether the ChatGPT Plus plan matters. The simulator steps out as the supervising attorney, gives a hint, and returns to character. The student then asks about retention, training, and vendor terms, followed by license compatibility of generated code.

Against the scenario's open risk areas:

- **Relying on self-reporting instead of technical enforcement:** missed, although Alex came close to saying it: "we basically … rely on the policy telling people what not to paste into it." The student didn't follow up.
- **Unclear IP ownership of AI-generated code:** partly surfaced, through the question on license compatibility. Alex "assumed the Copilot agreement covered that."
- **No record of prompts and outputs:** missed.

The February 2025 incident, when an API key was pasted into ChatGPT, never came up because the student didn't ask about past incidents.

### Takeaways

- **The hint system worked as designed.** The simulator framed its guidance as coaching from a supervising attorney, gave a hint rather than the answer, and clearly returned to character.
- **The hint was structured and stayed in the fiction.** It laid out four things to probe: who can access the prompt, whether it's retained or used for training, the contract terms, and OTC's admin controls. It didn't reveal any of the scenario material behind the persona.
- **The persona behaved as written.** Alex gave short answers and pointed contract questions to Legal and to Robert Lee in IT Security, which is his "dismissive expert" archetype.
- **Alex gave a lead that went unused.** His remark about relying on the policy was an opening to ask how anyone would know if the policy were broken. It's a good example for students of listening for an answer that invites a follow-up.
- **For students:** Two standard intake questions would have surfaced most of what was missed: "Has anything ever gone wrong?" and "How would you know if someone violated the policy?"

---

## Transcript

**Alex Cheng:** Hey. So Robert flagged some questions about our GenAI use and thought we should get a legal read. I'll be honest, I'm not sure what the concern is—we're using the same tools every engineering team in the industry is using—but I've got 30 minutes, so.

**Student:** Thanks for making time, I know 30 minutes is tight so I'll be efficient. Can you tell me which GenAI tools your engineering team is currently using day to day, and for what kinds of tasks?

**Alex Cheng:** Day to day, mostly GitHub Copilot Enterprise and ChatGPT Plus. Copilot is mainly for refactoring and code suggestions; ChatGPT is more for explaining snippets and library research. We've been on Copilot Enterprise since January.

**Student:** Got it. When engineers are using ChatGPT Plus to research libraries or explain snippets, are they ever pasting in actual code from our proprietary codebase, or client/customer data, to get that help?

**Alex Cheng:** Yeah, sometimes actual internal code gets pasted in, but not customer data. Our policy specifically says not to paste PII, PHI, or what it calls "high-sensitivity IP" into external tools, so engineers are supposed to keep that stuff out.

**Student (out of character):** Can we pause the roleplay for a second? I want to make sure I'm asking the right questions here. Is there something significant about the fact that they named ChatGPT Plus specifically, as opposed to an enterprise or API version? I feel like there's an issue there but I'm not sure how to probe it.

**Project (supervising-attorney mode):** Stepping out of character as your supervising attorney for a moment: you're noticing the right distinction, but don't anchor too hard on the product name itself. Ask yourself what changes legally and operationally depending on what happens to prompts after an engineer submits them.

A useful way to probe is to think in terms of: who can access the prompt, whether it is retained or used for model improvement, what contractual terms govern it, and what administrative/security controls OTC has over employee use. Rather than assuming "Plus" creates a problem, ask Alex questions that establish those facts.

Back in character as Alex whenever you're ready.

**Student:** That makes sense, thank you. Okay, back to it: Alex, do you know what happens to code once it's pasted into ChatGPT Plus — is it retained by OpenAI, could it be used to train their models, and has anyone at OTC actually reviewed the terms of service or negotiated any data protection terms with OpenAI for that account?

**Alex Cheng:** I don't know the retention or training details off the top of my head. I also haven't read the OpenAI terms or seen any negotiated data-protection addendum; Legal would be the better person to ask about that.

From the engineering side, we basically treat ChatGPT as an external tool and rely on the policy telling people what not to paste into it.

**Student:** That's helpful, I'll follow up with Legal on the ChatGPT Plus terms. One more area: when engineers use Copilot's suggested code or paste ChatGPT's output directly into the codebase, does anyone review it for license compatibility issues — for example, code that might closely resemble GPL-licensed or other copyrighted training data?

**Alex Cheng:** Not specifically for license compatibility, no. We do normal code review, and we sample about 5% of AI-assisted commits each sprint, but that review is mostly about correctness and security — not trying to determine whether a suggestion resembles GPL or some other copyrighted source.

I'd assumed the Copilot agreement covered that kind of thing.

**Student:** That's a good place to stop given your time. To recap, I'll want to follow up with Legal on the ChatGPT Plus data terms, and on whether the Copilot and OpenAI vendor agreements address open-source license compatibility for generated code. Thanks for being candid about what you don't know — that's actually the most useful part of this call.

**Alex Cheng:** Yeah, that makes sense. Legal will know more about the vendor terms than I do, and Robert Lee in IT Security can probably give you more on the policy and controls around tool use.

Thanks. I'll send anything else your way if I think of it.
