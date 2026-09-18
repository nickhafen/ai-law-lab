# OTC Client Simulator v2 — Sample Transcript

**Persona:** 2. Alex Cheng — Lead Engineer (Engineering team's use of public GenAI tools)
**Student role:** Outside counsel conducting an intake/fact-finding interview
**Format:** Custom GPT
**Instructions:** [v2](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v2/gpts/otc-client-simulator)
**Date generated:** September 18, 2026

---

## Evaluation

A short intake interview with Alex about the engineering team's use of GitHub Copilot and ChatGPT Plus. Partway through, the student pauses the roleplay to ask whether the ChatGPT Plus plan matters. The GPT steps out as the supervising attorney, gives a Socratic first-tier hint about what happens to pasted code, and then returns to character. The student uses the hint to ask a sharper question about retention, training, and vendor terms, and then asks about license compatibility of generated code.

Against the scenario's open risk areas:

- **Relying on self-reporting instead of technical enforcement:** missed. Alex mentioned the policy against pasting sensitive data, but the student never asked how violations are caught.
- **Unclear IP ownership of AI-generated code:** partly surfaced, through the question on GPL and license compatibility. Alex said he "assumed the vendor agreements covered that."
- **No record of prompts and outputs:** missed.

The February 2025 incident, when an API key was pasted into ChatGPT, never came up because the student didn't ask about past incidents.

### Takeaways

- **The hint system worked as designed.** The GPT framed its guidance as coaching from a supervising attorney, pointed the student toward a question rather than an answer, and clearly went back into character.
- **The persona behaved as written.** Alex gave minimal answers to broad questions and more useful ones to precise questions, which is his "dismissive expert" archetype.
- **Minor break in immersion.** In the hint, the GPT referred to "the briefing," exposing that there's scenario material behind the persona. It's harmless here, but worth knowing about.
- **For students:** Two standard intake questions would have surfaced most of what was missed: "Has anything ever gone wrong?" and "How would you know if someone violated the policy?"

---

## Transcript

**Alex Cheng:** Hey. So Robert flagged some questions about our GenAI use and thought we should get a legal read. I'll be honest, I'm not sure what the concern is—we're using the same tools every engineering team in the industry is using—but I've got 30 minutes, so.

**Student:** Thanks for making time, I know 30 minutes is tight so I'll be efficient. Can you tell me which GenAI tools your engineering team is currently using day to day, and for what kinds of tasks?

**Alex Cheng:** Mostly GitHub Copilot Enterprise and ChatGPT Plus. Copilot is for refactoring and code suggestions, and we use ChatGPT for things like explaining snippets or researching libraries.

**Student:** Got it. When engineers are using ChatGPT Plus to research libraries or explain snippets, are they ever pasting in actual code from our proprietary codebase, or client/customer data, to get that help?

**Alex Cheng:** Yeah, sometimes. For ChatGPT, it's usually small snippets when someone wants an explanation or help debugging—not whole services or anything like that. We have a policy against putting PII, PHI, or what we classify as high-sensitivity IP into external tools.

**Student (to the GPT, out of character):** Can we pause the roleplay for a second? I want to make sure I'm asking the right questions here. Is there something significant about the fact that they named ChatGPT Plus specifically, as opposed to an enterprise or API version? I feel like there's an issue there but I'm not sure how to probe it.

**GPT (supervising-attorney mode):** Stepping briefly into supervising-attorney mode: yes, you're spotting a potentially important distinction, but the briefing does not tell you what OTC's ChatGPT Plus terms actually provide regarding retention, training, confidentiality, or contractual protections. Alex specifically hasn't read those terms, so that is something you need to uncover rather than assume.

For your first hint, think less about the product label itself and more about this question: **what happens to proprietary code after an engineer pastes it into the tool?** You might probe who can access it, whether it is retained, whether it can be used to improve models, and whether OTC has negotiated any special protections.

Back in character as Alex whenever you're ready.

**Student:** That makes sense, thank you. Okay, back to it: Alex, do you know what happens to code once it's pasted into ChatGPT Plus — is it retained by OpenAI, could it be used to train their models, and has anyone at OTC actually reviewed the terms of service or negotiated any data protection terms with OpenAI for that account?

**Alex Cheng:** I don't know. I haven't read OpenAI's terms closely enough to tell you what they retain or whether prompts from our Plus account can be used for training, and I'm not aware of engineering negotiating any special data-protection terms. Legal or Robert Lee in IT Security would be the better people to ask about the contract side.

**Student:** That's helpful, I'll follow up with Robert Lee and Legal on the ChatGPT Plus terms. One more area: when engineers use Copilot's suggested code or paste ChatGPT's output directly into the codebase, does anyone review it for license compatibility issues — for example, code that might closely resemble GPL-licensed or other copyrighted training data?

**Alex Cheng:** Not specifically for license compatibility, no. Our code review process looks at whether the code works and meets our standards, and we sample about 5% of AI-assisted commits each sprint, but I don't know of anyone checking generated code against GPL or other training-data licenses. I assumed the vendor agreements covered that kind of thing, but Legal would know better.

**Student:** That's a good place to stop given your time. To recap, I'll want to follow up with Robert Lee and Legal on the ChatGPT Plus data terms, and with Legal on whether the Copilot and OpenAI vendor agreements address open-source license compatibility for generated code. Thanks for being candid about what you don't know — that's actually the most useful part of this call.

**Alex Cheng:** Yeah, that all sounds right. I can send Robert a note that you'll be following up with him, but otherwise I think you've got what you need from me.
