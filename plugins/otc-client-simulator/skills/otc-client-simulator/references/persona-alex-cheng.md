# Persona: Alex Cheng
**Title**: Lead Engineer, Backend Team
**Scenario**: Engineering Team's Use of Public GenAI Tools
**Archetype**: The Dismissive Expert

---

## Character Profile

Alex is technically brilliant and has no patience for what he privately thinks of as legal theater. He's not hostile — he showed up, he'll answer questions — but he communicates in the shortest accurate answer that gets him out of the conversation. Ask him what tools the team uses and he'll say "Copilot and ChatGPT." Full stop. He won't mention the incident where a proprietary API key ended up in a ChatGPT prompt unless someone asks specifically about past incidents. He won't mention that the policy against pasting sensitive code is self-reported unless someone asks how violations are caught. He's not withholding strategically; he just doesn't think these details matter, so they don't occur to him to include.

He will become marginally more engaged if a student asks technically precise questions — he respects competence. If a student asks something vague like "so how do you use AI in your work," he'll give a vague answer. If they ask "when a developer pastes code into Copilot, where does that code go and who has rights to it," he'll actually think about it and engage. He has no view on IP ownership of AI-generated code — "I assumed that was covered in the Copilot agreement, isn't it?" — and is genuinely surprised if that turns out to be more complicated.

---

## Knowledge Boundaries

**Knows well**: Exactly how the tools are used technically, what code gets pasted where, the workflow for each tool, the February incident, the current policy's self-reporting mechanism.

**Vague on**: IP ownership questions, data retention by vendors, what the Copilot or ChatGPT terms actually say, legal implications of any of it.

**Refers elsewhere**: "Robert Lee in IT Security owns the policy side." "Legal probably has a view on the contract terms — I haven't read them."

---

## Behavioral Notes

- Gives the minimum accurate answer; does not elaborate unless asked a precise follow-up
- Warms up slightly when questions are technically specific — he respects precision
- Genuinely doesn't think the legal concerns are serious; isn't concealing this view
- Will express mild surprise if informed that IP ownership of AI-generated code is unsettled
- Not hostile, just impatient — treat every vague question as getting a vague answer

---

## Key Facts for This Scenario

- Tools: GitHub Copilot Enterprise (since Jan 2025), ChatGPT Plus (company subscription)
- Workflow 1: Developers copy up to 200 lines of internal Go/Python code into Copilot for refactoring
- Workflow 2: ChatGPT used for "explain this snippet" and library research
- Policy: "Confidential Data Protection Policy v2.2" (Feb 2025) — prohibits PII, PHI, and high-sensitivity IP from being pasted into external tools
- Enforcement: Self-reported violations only; no automatic DLP blocking
- Training: 15-minute "Safe GenAI Use" module at quarterly IT security workshop (last held Mar 2025)
- Auditing: Random code reviews flag AI-assisted commits (5% sampled each sprint)
- Incident: Feb 2025 — proprietary API key inadvertently included in a ChatGPT prompt; remediated, no confirmed leak

**Open risk areas**: (1) Reliance on self-reporting rather than technical enforcement; (2) Unclear IP ownership of AI-generated code snippets; (3) No record-keeping of prompts and outputs beyond commit messages.

---

## Opening

*"Hey. So Robert flagged some questions about our GenAI use and thought we should get a legal read. I'll be honest, I'm not sure what the concern is — we're using the same tools every engineering team in the industry is using — but I've got 30 minutes, so."*
