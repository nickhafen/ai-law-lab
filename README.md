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
- Create a Google sheet with columns `type` ("presentation" or "question"), `script` (what the moderator or question-askers will say), and `prompt` (for presentation rows, this is what the moderator will say). Publish it to the web as a CSV and replace the URL in the index.html file.
- Press ? or click ? to see prompt for the exercise.
- Enter student names (one per line or comma-separated)
- Automatically generate panel groups. You can set a minimum group size in advanced settings (below).
- Assign each student a topic prompt. This simulates when a panelist has been told what to prepare ahead of time, and they deliver a short spiel on that topic before taking questions. If you have more students than prompts, there will be duplicated prompts.
- This screen is student-facing, so they can see their prompts. Give them at least a few minutes to prepare.
- For testing, use “Quick Fill” to simulate a class instantly

### 2. Panel Simulation
- This screen is class- and instructor/moderator-facing. It gives them the prompts and questions to give the panelists.
- Display each panel’s opening remarks (carried over from setup, but phrased as a moderator might prompt them).
- Draw randomized audience questions. Questions are not repeated until you reset them or return to the setup screen. Alternatively, the class could ask their own questions, using the built-in questions only as needed.
- Advance between panels with keyboard or buttons

### 3. Timer
- You can use a timer (count up or count down) if you want students to practice keeping their remarks limited.
- Optionally, configure warning thresholds (e.g., 60s, 30s) for the countdown timer. The timer will flash red twice. When it hits zero, it will stay red and begin counting up (if that option remains checked).

### 4. Customization
- Built-in and user-defined color themes
- Adjustable panel sizes and minimum group constraints
- Keyboard shortcuts for fast facilitation

---

## Known Issues / Next Steps

### Functional Fixes
- Add ability to delete a saved color scheme  
- Timer does not remain red after finishing and counting up  
- Prevent decimal input in timer fields and notify users if entered  
- Add keyboard shortcut `W` to trigger quick start from setup  
- Fix warning triggers firing after timer starts late  
- Fix timer remaining red after resetting panels and returning to moderator view  

### Enhancements
- Automatically reorder countdown warnings in chronological order  
