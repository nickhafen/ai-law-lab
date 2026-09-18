# OTC Client Simulator v2 — Sample Transcript

**Persona:** 1. Dr. Jane Smith — VP of Digital Therapeutics (Product Lead for Octi)
**Student role:** Outside counsel conducting an intake/fact-finding interview
**Format:** Custom GPT
**Instructions:** [v2](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v2/gpts/otc-client-simulator)
**Date generated:** September 18, 2026

---

## Evaluation

A standard intake interview with Jane about Octi, OTC's AI therapy chatbot, before its expansion into three new states. The student covered a wide range of issues: what data is collected, user consent and the privacy notice, HIPAA, how Octi is positioned against licensed therapy, crisis escalation, unauthorized practice under state law, FDA device regulation, and past incidents. They closed by listing who to talk to next.

Against the scenario's open risk areas:

- **No explicit consent to use therapy data in fine-tuning:** surfaced. Jane confirmed the privacy policy doesn't expressly cover AI training.
- **No formal bias or adversarial safety testing:** missed. Testing never came up.
- **No explainability for users beyond a boilerplate disclaimer:** missed.

The informal ethics committee came up only because Jane mentioned it herself at the end. The student didn't follow up on it.

### Takeaways

- **Broad but shallow.** The student raised several significant issues outside the scenario's core risk areas, such as crisis escalation, unauthorized practice, and FDA. But they accepted "ask Maria" or "ask Robert" at every turn instead of pinning down what Jane herself knows as product lead.
- **Compound questions let the client choose.** Most turns asked two questions at once, so Jane could answer the easier half briefly. Single, precise questions would have made her deflections harder.
- **The persona behaved as written.** Jane moved from risk to mission ("the product team is very focused on that access gap") and pushed governance questions to Legal. That's her "true believer" archetype.
- **The GPT deferred instead of improvising.** On crisis escalation, it had Jane refer the student elsewhere rather than invent a workflow. That's consistent with its instruction not to make up facts that could mislead the student's analysis.

---

## Transcript

**Dr. Jane Smith:** Thanks for making time. We're scaling Octi into three new states next quarter, and Legal thought it would be worth having outside counsel take a look at our practices before we do. I'll be honest—I think we're in pretty good shape, but I want to make sure we haven't missed anything. Where do you want to start?

**Student:** Great, thanks for making the time. Before we dig into specifics, can you give me a quick overview of what Octi does, who your users are, and what kind of data you collect from them?

**Dr. Jane Smith:** Sure. Octi is a chat-based AI therapy tool built on a proprietary model we fine-tuned on GPT-3.5-Turbo; the idea is to give people on-demand, CBT-style support between or instead of traditional therapy sessions. Our alpha users are currently in Utah, Texas, and Illinois, and a lot of them are people who've had trouble accessing therapy through the usual channels.

In terms of data, users obviously provide the content of their chats with Octi, which can include pretty sensitive mental-health information. We've also used anonymized CBT transcripts and de-identified journaling entries to fine-tune the model; Robert on engineering would know more about the technical storage details.

**Student:** That's helpful context. A few follow-ups: First, do users sign any consent form or see a privacy notice before they start chatting with Octi, and does it disclose that their de-identified chats might be used to train the model? Second, does Octi ever hold itself out as HIPAA-compliant, and have you done a HIPAA applicability analysis given the sensitivity of this data?

**Dr. Jane Smith:** Yes, users see our privacy notice before using Octi, but I don't think the current policy expressly says that therapy data may be used for AI training. We added an opt-in checkbox for journaling entries in January, and Legal has been working on more explicit AI-training language for the privacy policy, but I'd want Maria Gonzales to confirm exactly what users see today.

On HIPAA, I don't want to overstate what I know. I'm not aware of Octi being marketed specifically as "HIPAA-compliant," and I haven't personally done the applicability analysis; that's something Maria in Legal would need to walk you through.

**Student:** Understood, I'll follow up with Maria directly on both of those. Shifting gears: is Octi positioned as a replacement for licensed therapy, or as a supplement to it? And what happens if a user expresses suicidal ideation or a mental health crisis mid-chat — is there any human escalation, or is it purely the AI responding?

**Dr. Jane Smith:** We generally position Octi as a source of on-demand CBT-style support, not as a licensed human therapist, although some users do use it when they don't otherwise have access to therapy. The product team is very focused on that access gap.

On crisis situations, I don't want to guess. I know we have safety-oriented response behavior built into the product, but I'm not the right person to give you the exact escalation workflow or tell you when a human gets involved. Our clinical operations team and Robert on engineering could walk you through what happens when the system detects suicidal ideation or similar language.

**Student:** Got it, I'll loop in clinical ops and Robert. Two more for you: You mentioned you're scaling into three new states next quarter — do you know if anyone has looked at whether offering CBT-style support without a licensed clinician raises unauthorized-practice-of-therapy/counseling issues under those states' laws? And separately, has FDA regulation ever come up internally — i.e., whether Octi could be considered a regulated medical device or clinical decision support software?

**Dr. Jane Smith:** I know Legal has been looking at state-by-state issues as we expand, but I haven't personally seen an analysis on whether Octi could be viewed as practicing therapy without a licensed clinician. Maria would know where that review stands.

FDA has come up in conversation, but I'm not aware of a formal determination that Octi is or isn't a regulated medical device or clinical decision support product. From my side, we've thought of Octi as a therapeutic support tool, but I'd defer to Legal on how that maps onto the regulatory categories.

**Student:** Last question for now: has anything ever gone wrong that you're aware of — a bad AI response, a complaint, or an incident involving a user in crisis — and if so, was that shared with Legal? And is there anyone besides you, Maria, and Robert I should plan to talk to before the launch?

**Dr. Jane Smith:** Nothing comes to mind that I'd characterize as a serious user-safety incident or crisis event, and I'm not aware of anything like that being escalated to Legal. We do see the normal product-quality issues—responses that are awkward, overly generic, or just not especially helpful—but I'd want Robert and clinical ops to tell you whether anything more serious has shown up in the logs or review process.

Beyond Maria and Robert, I'd definitely talk to whoever leads clinical operations, and probably someone from our ethics committee as well. The committee is fairly informal, so Maria may be the best person to tell you who has actually been participating recently.

**Student:** This is really helpful, thank you. I'll follow up with Maria, Robert, clinical ops, and the ethics committee, and we can regroup once I've talked to them. That's all I have for today.

**Dr. Jane Smith:** Of course. Thanks for walking through it with me—I appreciate the questions, especially around the areas I don't personally own. Once you've talked with Maria, Robert, clinical ops, and the ethics committee, I'm happy to regroup on anything that comes back to the product side.
