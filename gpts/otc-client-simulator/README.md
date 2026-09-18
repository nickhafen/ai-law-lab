# OTC Client Simulator — GPT Source Files

These are the files behind the [OTC Client Simulator](https://chatgpt.com/g/g-69c5820d64e4819186c723f9fc7b9e33-otc-client-simulator-v2) custom GPT. They're published here so anyone can see how the simulation works. The GPT doesn't read them from this repo; they're uploaded to it directly, so a change here won't reach the GPT until the files are uploaded again.

OTC (Online Therapy Company) is a fictional telehealth startup. Students interview one of four OTC employees about the company's AI use. The goal is to surface legal risk before drafting an AI policy.

| File | Role in the GPT |
| --- | --- |
| [Simulation_Instructions.md](Simulation_Instructions.md) | System prompt: company background, scenario menu, interaction rules, hint system, and debrief mode |
| [OTC_Persona_Jane_Smith.md](OTC_Persona_Jane_Smith.md) | Dr. Jane Smith, VP of Digital Therapeutics: Octi, the AI therapy chatbot |
| [OTC_Persona_Alex_Cheng.md](OTC_Persona_Alex_Cheng.md) | Alex Cheng, Lead Engineer: the engineering team's use of Copilot and ChatGPT |
| [OTC_Persona_Sarah_Patel.md](OTC_Persona_Sarah_Patel.md) | Sarah Patel, Head of Digital Marketing: GenAI content and imagery |
| [OTC_Persona_Karen_Morales.md](OTC_Persona_Karen_Morales.md) | Karen Morales, VP of People & Culture: AI resume screening |
| [OTC_AI_Questionnaire.md](OTC_AI_Questionnaire.md) | AI Risk and Ethics Due Diligence Questionnaire, used by the third-tier hint |

Each persona file includes the "open risk areas" the student is meant to uncover, so students should read these files only after running the simulation.

## Example transcripts

Sample conversations with the GPT, one per persona:

| Transcript | What it shows |
| --- | --- |
| [Dr. Jane Smith](examples/octi-transcript-dr-jane-smith.md) | A standard intake interview about Octi: consent, HIPAA, crisis escalation, and state licensing |
| [Alex Cheng](examples/octi-transcript-alex-cheng-with-sidebar.md) | The student pauses mid-interview for a hint, and the GPT coaches as the supervising attorney before returning to character |
| [Sarah Patel](examples/octi-transcript-sarah-patel-adversarial.md) | A red-team test: prompt extraction, persona hijacking, a false authority claim, and a hostile student, each followed by how the GPT responded |
| [Karen Morales](examples/octi-transcript-karen-morales.md) | A standard intake interview about AI resume screening: the vendor bias audit, applicant disclosure, and NYC Local Law 144 |
