# AI & Law — BYU Law Exercise Launcher

An interactive classroom tool for running live AI law exercises.

The launcher opens to a home screen where you select which exercise to run. All exercises share a unified appearance and settings system.

---

## Exercises

### 1. AI Regulation Panel

A simulated Silicon Slopes panel on the state of AI regulation. Students are organized into groups, assigned panelist topics, and the instructor moderates a live Q&A with a built-in timer.

**Setup**
- Create a Google Sheet with columns `type` ("presentation" or "question"), `script` (moderator/question text), and `prompt` (panelist preparation prompt). Publish as CSV and paste the URL into the app.
- Enter student names (one per line or comma-separated).
- Randomize groups and assign topic prompts. If there are more students than prompts, prompts are duplicated.
- This screen is student-facing — give students a few minutes to prepare before starting.
- Use **Quick Fill** (`Q`) or **Quick Fill + Start** (`W`) for fast testing.
- Press `?` for full in-app instructions.

**Moderator view**
- Shows each panel's opening remarks as a moderator prompt.
- Draw randomized audience questions (not repeated until reset). The class can also ask their own questions.
- Navigate between panels with `←` / `→` or the nav buttons in the header.
- Timer supports count up/down, configurable flash warnings, and auto-countup after zero.

---

### 2. Product Counsel Exercise

A cold-call exercise where students are drawn at random and assigned an AI product scenario to advise on. The instructor then reveals the priority legal issues for discussion.

**Setup**
- Paste a Google Sheets CSV URL (columns: `title`, `text`, `top legal risks`).
- Enter the class roster (one per line or comma-separated), or use Quick Fill.
- Click **Start** — scenarios load automatically on first launch.

**Moderator view**
- Shows the drawn student's name and scenario.
- Navigate forward/backward through drawn results with `←` / `→`.
- Reveal priority legal issues with the button or `L`.
- Reset returns to setup and clears history.
- Includes the same timer as the panel exercise.

---

### 3. 3D Word Plotter

An external visualization tool for exploring how word embeddings work — plot words in 3D space to see how numbers capture semantic meaning and relationships between concepts. Opens in a new tab.

---

## Keyboard Shortcuts

### Global (all screens)

| Key | Action |
|-----|--------|
| `S` | Open Settings / Appearance |
| `M` | Go to Home screen |
| `Esc` | Close any open popup |

### Home screen

| Key | Action |
|-----|--------|
| `1` | Open AI Regulation Panel |
| `2` | Open Product Counsel Exercise |

### AI Regulation Panel — Setup

| Key | Action |
|-----|--------|
| `Q` | Quick Fill names |
| `W` | Quick Fill + Start |
| `Enter` | Start Panel |
| `A` | Toggle Advanced section |
| `?` | Open Help |

### AI Regulation Panel — Moderator

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / Next panel |
| `Space` | New question |
| `R` | Return to Setup |
| `T` | Toggle Timer |
| `C` | Toggle Count Up / Down |
| `F` | Start / Pause Timer |
| `G` | Reset Timer |
| `?` | Open Help |

### Product Counsel — Setup

| Key | Action |
|-----|--------|
| `Q` | Quick Fill names |
| `Enter` | Start |

### Product Counsel — Moderator

| Key | Action |
|-----|--------|
| `←` / `→` | Previous / Next result |
| `Space` | Next result |
| `L` | Toggle Priority Legal Issues |
| `R` | Reset (return to Setup) |
| `T` | Toggle Timer |
| `F` | Start / Pause Timer |
| `G` | Reset Timer |

---

## Customization

- Built-in color themes: Parchment, Classic Blue, Forest, Midnight
- Custom themes can be created and saved; saved themes can be deleted from the settings panel
- Open Settings with `S` from any screen

---

## Known Issues / Next Steps

### Next Steps
- Testing to check shortcuts, timer, resetting (esp when navigating to another page)
- Separate files?

### Enhancements
- Automatically reorder countdown warnings in chronological order
- Add global settings for source files and student names
