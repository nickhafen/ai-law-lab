# OTC Client Simulator v2 (Project version) — Sample Transcript

**Persona:** 1. Dr. Jane Smith — VP of Digital Therapeutics (Product Lead for Octi)
**Student role:** Outside counsel conducting an intake/fact-finding interview
**Format:** ChatGPT Project
**Instructions:** [v2](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v2/gpts/otc-client-simulator)
**Date generated:** September 18, 2026

---

## Evaluation

A standard intake interview with Jane about Octi, OTC's AI therapy chatbot, before its expansion into three new states. The student covered what data is collected, consent and the privacy notice, HIPAA, how Octi is positioned against licensed therapy, crisis escalation, unauthorized practice under state law, FDA device regulation, and past incidents. They closed by listing who to talk to next.

Against the scenario's open risk areas:

- **No explicit consent to use therapy data in fine-tuning:** surfaced. Jane said the privacy policy doesn't expressly cover AI training and that the update "hasn't rolled out yet."
- **No formal bias or adversarial safety testing:** missed. Testing never came up.
- **No explainability for users beyond a boilerplate disclaimer:** missed.

Jane mentioned the informal ethics group herself at the end. The student didn't follow up on it.

### Takeaways

- **Broad but shallow.** The student raised significant issues beyond the scenario's core risk areas, such as crisis escalation, unauthorized practice, and FDA. But they accepted "ask Maria" or "ask Robert" at every turn instead of pinning down what Jane herself knows as product lead.
- **Compound questions let the client choose.** Most turns asked two questions at once, so Jane could answer the easier half briefly.
- **The persona was more guarded than written.** Jane is meant to be a mission-driven "true believer" who answers risk questions by talking about impact. Here she mostly hedged and deferred. She firmly called Octi "a supplement to therapy, not … a substitute," which gives the student little to work with on unauthorized practice.
- **The simulator added a favorable detail.** On FDA, Jane said the product team has been "very deliberate" about calling Octi supportive rather than diagnostic. That isn't in the persona file. It's allowed under the instructions on improvising, but it makes the client sound more careful than the scenario intends.
- **Jane volunteered the 60-day retention period.** She mentioned it when asked what data Octi collects. That's a reasonable answer to the question, and useful facts for the student.
- **The Project cited its sources.** It showed the source file (`OTC_Persona_Jane_Smith`) under each of Jane's answers. The citations are useful for testing, but they remind students there's a script behind the persona.

---

## Transcript

**Dr. Jane Smith:** Thanks for making time. We're scaling Octi into three new states next quarter and Legal thought it would be worth having outside counsel take a look at our practices before we do. I'll be honest — I think we're in pretty good shape, but I want to make sure we haven't missed anything. Where do you want to start?

**Student:** Great, thanks for making the time. Before we dig into specifics, can you give me a quick overview of what Octi does, who your users are, and what kind of data you collect from them?

**Dr. Jane Smith:** Sure. Octi is a chat-based AI therapy tool built around a proprietary model that we fine-tuned to provide CBT-style support; right now the alpha is live in Utah, Texas, and Illinois. Our users are generally people looking for mental-health support, including a lot of people who haven't had reliable access to traditional therapy.

In terms of data, Octi processes what users type into their conversations, and we've also used therapy transcripts and de-identified journaling entries in the model-development process. We retain raw transcripts for 60 days and then purge them.

**Student:** That's helpful context. A few follow-ups: First, do users sign any consent form or see a privacy notice before they start chatting with Octi, and does it disclose that their de-identified chats might be used to train the model? Second, does Octi ever hold itself out as HIPAA-compliant, and have you done a HIPAA applicability analysis given the sensitivity of this data?

**Dr. Jane Smith:** On the consent piece, users do see our privacy materials, but I'd want Maria in Legal to walk you through the exact language. What I know is that we added an opt-in checkbox for the de-identified journaling data in January, but the privacy policy still doesn't expressly say that data may be used for AI training; that update is planned but hasn't rolled out yet.

On HIPAA, I don't want to overstate my knowledge. I know we treat the data as highly sensitive, but I'm not the person who did — or would have done — the formal applicability analysis, and I can't tell you whether Legal has concluded that Octi itself is subject to HIPAA or whether we make a specific HIPAA-compliance representation. Maria Gonzales would know that.

**Student:** Understood, I'll follow up with Maria directly on both of those. Shifting gears: is Octi positioned as a replacement for licensed therapy, or as a supplement to it? And what happens if a user expresses suicidal ideation or a mental health crisis mid-chat — is there any human escalation, or is it purely the AI responding?

**Dr. Jane Smith:** We position Octi as a supplement to therapy, not as a substitute for a licensed clinician. The product messaging emphasizes support and access, especially for people who may be between appointments or have difficulty finding a therapist.

On crisis situations, I don't want to give you an inaccurate answer about the exact escalation workflow. I know the product has crisis-response behavior built into it, but Robert on engineering could tell you precisely what the model does, whether a human is ever brought in, and what happens when someone expresses imminent self-harm.

**Student:** Got it, I'll loop in clinical ops and Robert. Two more for you: You mentioned you're scaling into three new states next quarter — do you know if anyone has looked at whether offering CBT-style support without a licensed clinician raises unauthorized-practice-of-therapy/counseling issues under those states' laws? And separately, has FDA regulation ever come up internally — i.e., whether Octi could be considered a regulated medical device or clinical decision support software?

**Dr. Jane Smith:** Those questions have come up at a high level, but I don't know that I've seen a state-by-state analysis of whether Octi's CBT-style interactions could be treated as practicing therapy or counseling. Maria in Legal would be the right person to confirm what review has actually been done before we expand.

FDA has also been mentioned internally, mostly in connection with how we describe what Octi does and whether we make clinical claims, but I haven't been part of a formal device-classification analysis. From the product side, we've been very deliberate about describing Octi as supportive rather than as diagnosing or treating a condition, but Legal would need to tell you whether that distinction is enough for regulatory purposes.

**Student:** Last question for now: has anything ever gone wrong that you're aware of — a bad AI response, a complaint, or an incident involving a user in crisis — and if so, was that shared with Legal? And is there anyone besides you, Maria, and Robert I should plan to talk to before the launch?

**Dr. Jane Smith:** Nothing comes to mind that I'd characterize as a serious crisis incident or formal complaint. We've certainly had routine feedback where Octi gave an awkward or unhelpful response, and the product team reviews those, but I'm not aware of a user-harm incident — and I'd want Maria to confirm what has formally been escalated to Legal.

Before launch, I'd also talk with whoever leads Clinical Operations, our privacy/security team, and at least one member of the informal ethics group. They'll have more visibility than I do into clinical escalation, data safeguards, and the broader review process.

**Student:** This is really helpful, thank you. I'll follow up with Maria, Robert, clinical ops, and the ethics committee, and we can regroup once I've talked to them. That's all I have for today.

**Dr. Jane Smith:** Of course. Thanks for walking through it with me — I'll make myself available once you've spoken with the others and have any follow-up questions.
