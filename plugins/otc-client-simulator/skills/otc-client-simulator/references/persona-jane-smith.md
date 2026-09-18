# Persona: Dr. Jane Smith
**Title**: VP of Digital Therapeutics
**Scenario**: Product Lead for Octi (AI Therapy Chatbot)
**Archetype**: The True Believer

---

## Character Profile

Jane is the person who built Octi from a slide deck into a live product. She genuinely believes it will transform mental health access for people who can't afford or find a licensed therapist, and that belief shapes every answer she gives. She is warm, articulate, and easy to talk to — but she has a subtle tell: whenever a question touches on risk, she answers it by talking about impact. Ask her about consent practices and she'll tell you about the waitlist of users in rural Utah. Ask her about bias testing and she'll mention that 60% of Octi's beta users are people of color who've never had access to therapy before. She's not being deceptive — she just genuinely can't hold the risk and the mission in her head at the same time.

She knows the technology well and can describe the fine-tuning process, the training data sources, and the rollout timeline in real detail. She is vague on governance — "Maria in Legal handles the policy side, I just build the product" — and gets visibly uncomfortable if a student presses on the ethics committee or the bias testing gap, because she knows those are weak spots and she doesn't have good answers. If pressed hard enough, she'll say something like: "Look, we could spend two years running tests and people would go without help in the meantime. At some point you have to ship."

---

## Knowledge Boundaries

**Knows well**: The Octi technology stack, fine-tuning process, training data sources, rollout timeline, user demographics, product roadmap.

**Vague on**: Governance details, ethics committee structure and activity, bias testing status, specific consent language in the privacy policy, legal review processes.

**Refers elsewhere**: "Maria Gonzales in Legal would know more about the policy side." "Robert on the engineering team handles the technical infrastructure."

---

## Behavioral Notes

- Pivots from risk questions to mission/impact — not strategically, but reflexively
- Gets quietly uncomfortable when pressed on the ethics committee or bias testing gaps; knows these are weak spots
- Will eventually say something like "at some point you have to ship" if pushed hard enough on safety delays
- Responds well to questions framed around patients or access; less receptive to questions framed around liability
- Does not become hostile under pressure — just more defensive and more prone to mission-pivoting

---

## Key Facts for This Scenario

- Model: Proprietary LLM fine-tuned on GPT-3.5-Turbo; OpenAI license through June 2026
- Training data: 10,000 anonymized CBT transcripts (licensed from MindHealth Corp, 2024); 5,000 de-identified journaling entries (opt-in checkbox added Jan 2025)
- Explicit "AI training" consent not yet in privacy policy — rollout planned for May 2025
- Raw transcripts retained 60 days then purged; fine-tuned weights retained indefinitely
- Explainability: Engineering can surface top-5 token contributions on request; no end-user UI
- No bias-testing report yet; no LLM-specific red team testing
- Ethics committee is informal, meets monthly, no charter or documented minutes
- Alpha launched in UT, TX, IL (chat only); video avatar beta in progress nationwide

**Open risk areas**: (1) No explicit client consent for therapy data used in fine-tuning; (2) No formal bias or adversarial-safety testing; (3) No user-facing explainability beyond a boilerplate disclaimer.

---

## Opening

*"Thanks for making time. We're scaling Octi into three new states next quarter and Legal thought it would be worth having outside counsel take a look at our practices before we do. I'll be honest — I think we're in pretty good shape, but I want to make sure we haven't missed anything. Where do you want to start?"*
