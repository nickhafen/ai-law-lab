# AI Regulation Panel Simulator

An interactive classroom tool for running a live AI regulation panel exercise.

Designed for law students, this application simulates a professional panel environment where participants deliver opening remarks, respond to audience questions, and manage time under realistic conditions.

---

## Purpose

This tool supports experiential learning in AI law by helping students:

- Translate complex legal concepts into clear, accessible explanations
- Practice speaking in a panel format (not a lecture)
- Respond to unpredictable audience questions
- Develop confidence discussing AI regulation in public-facing settings

---

## What It Does

### 1. Setup
- Create a Google Sheet with columns `type` ("presentation" or "question"), `script` (what the moderator or question-askers will say), and `prompt` (for presentation rows, this is what the moderator will say). Publish it to the web as a CSV and replace the URL in the index.html file.
- Press `?` or click the help icon to see instructions for the exercise.
- Enter student names (one per line or comma-separated)
- Automatically generate panel groups. You can set a minimum group size in Advanced settings.
- Assign each student a topic prompt. This simulates when a panelist has been told what to prepare ahead of time, and they deliver a short spiel on that topic before taking questions. If you have more students than prompts, prompts will be duplicated.
- This screen is student-facing, so they can see their prompts. Give them at least a few minutes to prepare.
- Use **Quick Fill** (`Q`) to auto-populate names and groups for testing, or **Quick Fill + Start** (`W`) to jump straight to the moderator view.

### 2. Panel Simulation
- This screen is instructor/moderator-facing.
- Display each panel's opening remarks (carried over from setup, phrased as a moderator prompt).
- Draw randomized audience questions. Questions are not repeated until you reset them or return to the setup screen. Alternatively, the class can ask their own questions, using the built-in questions only as needed.
- Advance between panels with keyboard shortcuts (`←` / `→`) or the nav buttons.

### 3. Timer
- Count up or count down. Timer resets automatically when switching panels or hiding the timer card.
- Configure flash warning thresholds (e.g., 60s, 30s) for the countdown timer — warnings only trigger if the countdown started above that threshold.
- At zero, the timer flashes twice then stays red and begins counting up (if that option is checked).
- Decimal values are not allowed in timer inputs and will be rounded down automatically.

### 4. Customization
- Built-in color themes (Classic Blue, Forest, Midnight) plus user-saved custom themes
- User-saved themes can be deleted from the settings panel
- Adjustable panel sizes and minimum group constraints
- Keyboard shortcuts for fast facilitation (press `?` to view all)

---

## Keyboard Shortcuts

| Key | Screen | Action |
|-----|--------|--------|
| `?` | Both | Open Help |
| `S` | Both | Open Settings |
| `Esc` | Both | Close popups |
| `Q` | Setup | Quick Fill |
| `W` | Setup | Quick Fill + Start |
| `Enter` | Setup | Start Panel |
| `A` | Setup | Toggle Advanced |
| `←` / `→` | Moderator | Previous / Next Panel |
| `Space` | Moderator | New Question |
| `R` | Moderator | Return to Setup |
| `T` | Moderator | Toggle Timer |
| `C` | Moderator | Toggle Count Up / Down |
| `F` | Moderator | Start / Pause Timer |
| `G` | Moderator | Reset Timer |

---

## Known Issues / Next Steps

### Enhancements
- Automatically reorder countdown warnings in chronological order
