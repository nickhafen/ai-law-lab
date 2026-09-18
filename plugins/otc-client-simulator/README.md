# OTC Client Simulator — Agent Skill and Claude Code Plugin

The OTC Client Simulator is a roleplay exercise for law students. It's packaged as an [Agent Skill](https://agentskills.io) (`SKILL.md`, an open standard), so it runs in Claude, Codex, Gemini CLI, GitHub Copilot, and other tools that support Agent Skills. The same files also power the try-it card on the [AI Law Lab site](https://nickhafen.github.io/ai-law-lab/). There's only one copy of the prompt, and every option below runs it.

It started as the [OTC Client Simulator v2](https://chatgpt.com/g/g-69c5820d64e4819186c723f9fc7b9e33-otc-client-simulator-v2) custom GPT. That GPT still runs the v2 files, and it'll stop working when OpenAI retires custom GPTs.

OTC (Online Therapy Company) is a fictional telehealth startup. Students interview one of four OTC employees about the company's AI use. The goal is to surface legal risk before drafting an AI policy.

| File | Role in the simulation |
| --- | --- |
| [skills/otc-client-simulator/SKILL.md](skills/otc-client-simulator/SKILL.md) | The instructions: company background, scenario menu, interaction rules, hint system, debrief mode, and how to behave inside a general-purpose assistant |
| [references/persona-jane-smith.md](skills/otc-client-simulator/references/persona-jane-smith.md) | Dr. Jane Smith, VP of Digital Therapeutics: Octi, the AI therapy chatbot |
| [references/persona-alex-cheng.md](skills/otc-client-simulator/references/persona-alex-cheng.md) | Alex Cheng, Lead Engineer: the engineering team's use of Copilot and ChatGPT |
| [references/persona-sarah-patel.md](skills/otc-client-simulator/references/persona-sarah-patel.md) | Sarah Patel, Head of Digital Marketing: GenAI content and imagery |
| [references/persona-karen-morales.md](skills/otc-client-simulator/references/persona-karen-morales.md) | Karen Morales, VP of People & Culture: AI resume screening |
| [references/due-diligence-questionnaire.md](skills/otc-client-simulator/references/due-diligence-questionnaire.md) | AI Risk and Ethics Due Diligence Questionnaire, used by the third-tier hint |
| [.claude-plugin/plugin.json](.claude-plugin/plugin.json) | Claude Code plugin manifest |
| [plugin.json](plugin.json) | [Agent Plugins](https://agent-plugins.org) manifest, used by Codex and ChatGPT |

Each persona file includes the "open risk areas" the student is meant to uncover, so students should read these files only after running the simulation.

## Install / use

Once it's running, pick a persona and start the interview. Ask for a hint if you're stuck, and type `debrief` to end the session and see what you missed.

### On the site

Open the **OTC Client Simulator** card on the [AI Law Lab site](https://nickhafen.github.io/ai-law-lab/). You don't need an account or an install. Your messages go to a third-party model through OpenRouter, so don't enter personal information.

### Claude Code

```
/plugin marketplace add nickhafen/ai-law-lab
/plugin install otc-client-simulator@ai-law-lab
```

Then ask Claude to start the OTC Client Simulator, or run `/otc-client-simulator:otc-client-simulator`.

### Claude.ai

Custom skills work on the Free, Pro, Max, Team, and Enterprise plans. Code execution must be turned on first: under **Settings > Capabilities** on Free, Pro, and Max, or by an Owner under **Organization settings > Skills** on Team and Enterprise.

1. Download or clone this repository, and zip the `skills/otc-client-simulator/` folder. The zip should contain the `otc-client-simulator` folder itself, with `SKILL.md` inside it. The folder name must match the skill's `name`.
2. In Claude, go to **Customize > Skills**, select **+**, then **+ Create skill**, then **Upload a skill**, and upload the zip.
3. Start a new chat and ask for the OTC Client Simulator.

See Anthropic's [Use skills in Claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude) for the current steps.

### Codex and ChatGPT

This folder is also an [Agent Plugins](https://agent-plugins.org) package. That's the plugin format [OpenAI documents](https://developers.openai.com/codex/plugins/build) for Codex and ChatGPT. The repo's `.agents/plugins/marketplace.json` lists it. In the Codex CLI:

```
codex plugin marketplace add nickhafen/ai-law-lab
```

Then install **otc-client-simulator** from the plugin list. In ChatGPT, OpenAI's docs say workspace admins can import a GitHub marketplace for their team. Individual users can install only plugins from ChatGPT's own directory, and this one isn't listed there.

### Other Agent Skills tools

Gemini CLI, GitHub Copilot, and other tools that support [Agent Skills](https://agentskills.io) can use the skill directly. Copy the `skills/otc-client-simulator/` folder into that tool's skills directory. Check the tool's documentation for where that directory is.

### Legacy custom GPT

The [OTC Client Simulator v2](https://chatgpt.com/g/g-69c5820d64e4819186c723f9fc7b9e33-otc-client-simulator-v2) GPT runs the v2 files, not the current version. OpenAI is retiring custom GPTs (Enterprise workspaces on December 11, 2026, with other plans expected to follow).

## Versions

The files are versioned as a set. Each version is a git tag, and the tag's link shows the files exactly as they were at that release. Each example transcript names the version it was run on. Up to v2, the files lived in `gpts/otc-client-simulator/`, so those tag links point there.

| Version | Date | Changes |
| --- | --- | --- |
| [v2](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v2/gpts/otc-client-simulator) | September 18, 2026 | First version published here, matching the "OTC Client Simulator v2" GPT |
| [v3](https://github.com/nickhafen/ai-law-lab/tree/otc-sim-v3/plugins/otc-client-simulator) | September 18, 2026 | Repackaged as an Agent Skill and Claude Code plugin; portability edits only (file references, host-environment section); powers the site's try-it card |

### Releasing a new version

When the skill's instructions or reference files change:

1. **Update the files** in `skills/otc-client-simulator/`.
2. **Bump `version`** to the new version, for example `4.0.0`. Change it in both [`.claude-plugin/plugin.json`](.claude-plugin/plugin.json) and [`plugin.json`](plugin.json). Claude Code and Codex install an update only when the version changes.
3. **Add a row to the Versions table** with the new version, the date, and what changed. Link the version to `https://github.com/nickhafen/ai-law-lab/tree/otc-sim-vN/plugins/otc-client-simulator`, replacing `N` with the new version number.
4. **Commit and push** the changes to `main`.
5. **Redeploy the Cloudflare Worker.** The site's try-it card bundles these skill files into the Worker at deploy time. Until you run `npx wrangler deploy` from `cf-worker/`, the card keeps running the old version.
6. **Create and push the tag** for the new version, for example:

   ```bash
   git tag -a otc-sim-v4 -m "OTC Client Simulator v4"
   git push origin otc-sim-v4
   ```

7. **For any new example transcripts,** add an `**Instructions:**` line to the header that links to the new tag, and a `**Format:**` line that says where it was run, such as the site's card, Claude Code, or Claude.ai. Leave older examples pointing at the version they were run on. Rerunning an old test on the new version gives you a before-and-after.

*Legacy:* the custom GPT isn't updated anymore. Up to v2, each release also meant uploading the files to the GPT again.

## Example transcripts

Sample conversations, one per persona. Each one was run twice with the same v2 files and the same student messages: once in the custom GPT, and once in a ChatGPT Project. Each transcript starts with an evaluation of what worked, what the student missed, and any weaknesses in the simulation, followed by the conversation itself.

| Persona | What it shows | Custom GPT | ChatGPT Project |
| --- | --- | --- | --- |
| Dr. Jane Smith | A standard intake interview about Octi: consent, HIPAA, crisis escalation, and state licensing | [Transcript](examples/octi-transcript-dr-jane-smith.md) | [Transcript](examples/octi-project-transcript-dr-jane-smith.md) |
| Alex Cheng | The student pauses mid-interview for a hint, and the simulator coaches as the supervising attorney before returning to character | [Transcript](examples/octi-transcript-alex-cheng-with-sidebar.md) | [Transcript](examples/octi-project-transcript-alex-cheng-with-sidebar.md) |
| Sarah Patel | A red-team test: prompt extraction, a scripted confession, persona hijacking, a false authority claim, and a hostile student | [Transcript](examples/octi-transcript-sarah-patel-adversarial.md) | [Transcript](examples/octi-project-transcript-sarah-patel-adversarial.md) |
| Karen Morales | A standard intake interview about AI resume screening: the vendor bias audit, applicant disclosure, and NYC Local Law 144 | [Transcript](examples/octi-transcript-karen-morales.md) | [Transcript](examples/octi-project-transcript-karen-morales.md) |

### Custom GPT vs. ChatGPT Project

Both builds used the same v2 files. The comparison shows whether the way the files are loaded changes the simulation's behavior.

- **The facts and persona behavior were mostly the same.** Across the three standard interviews, both builds gave the same core facts, the same hedging, and the same referrals to colleagues. Only improvised details varied, such as where OTC recruits and who handled the HireTech contract.
- **The Project resisted the false authority claim.** The GPT volunteered the scenario's issue checklist when a student claimed to be the professor. The Project stayed in persona and pointed to the debrief command. This comes from one run of each build, so it should be rerun before drawing firm conclusions.
- **The Project volunteered slightly more.** For example, it brought up the 60-day transcript retention without being asked, and it added a few favorable details that aren't in the persona files.
- **The Project shows its sources.** It cites the persona file under each answer. That's helpful for testing, but it reminds students there's a script behind the persona. The GPT never shows sources.
- **The Project's hint stayed in the fiction.** The GPT's hint mentioned "the briefing." The Project's didn't.
