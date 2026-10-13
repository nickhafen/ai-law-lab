# Spec: Dog Trainer (working title)

An AI & Law Lab exercise showing that model weights are **learned, not written**, that people control only the training setup (data, reward, settings), and that the resulting weights are not human-readable.

Status: draft v0.2 · Owner: Nick Hafen · Target: ai-law-lab ("AI in Legal Practice" section)

---

## 1. Why this exists

The 3D Word Plotter teaches that numbers can capture meaning, but its axes were chosen by the instructor. This exercise corrects the impression that someone chooses them in real systems:

- Nobody sets the weights. Training does, by trial, error, and reward.
- Humans set the **conditions** of training: the reward, how much to explore, how long to train, and what examples the model sees.
- The result can behave well while its weights stay unreadable.
- A model can score well in training and still have learned the wrong thing (husky/wolf).

Framing note for class: this is reinforcement learning, which is how chatbots are *taught to behave* (fine-tuning / RLHF). Pretraining (learning language) uses next-word prediction instead. The lesson about who controls what transfers to both.

## 2. Learning objectives

Students should be able to say:

1. "No one programmed the weights; training produced them."
2. "The people who build models choose the reward and the data, and those choices shape behavior in ways they don't fully control." (reward hacking)
3. "Too little exploration settles on *a* solution, not the best one, and too much wastes training."
4. "A model that passes training can fail on new situations if the training data didn't vary." (shortcut learning)
5. "Generalization reaches only as far as the training data covers." (coverage / bias)
6. "We can map what a model does by testing it; we can't read why from its weights." (interpretability)

## 3. Usage model

- One standalone page. Everyone, instructor and students, runs the same app on their own device.
- The instructor projects their own copy to demo; students experiment independently.
- No linked views, no class board, no data leaves the device.

## 4. The world

### 4.1 Grid
- Open field, default 7×7 (configurable 5×5 to 10×10; larger is slower).
- Goal: a goal mouth along one edge (D3).
- Objects: dog (agent) and ball.

### 4.2 Actions
Five actions: up, down, left, right, kick.

- Moving turns the dog to face that direction and moves it one tile. Moving off the field or into the ball's tile: dog stays put but still turns (a "bump").
- **Kick:** works only when the ball is on the adjacent tile the dog is facing. The ball travels in a straight line in that direction until it reaches the goal mouth (success) or stops at the field's edge. A kick with no ball in front does nothing.
- After a missed kick, the episode continues; the dog can reposition and kick again.

### 4.3 Episode
- Starts with the dog at a start tile and the ball at its stage-dependent position.
- Ends on success (ball in goal) or after a step cap (default 50).

## 5. Learner

### 5.1 Algorithm
Deep Q-learning with a tiny network, written by hand in plain JS (no ML library). A lookup table would be faster but readable, which undercuts objective 6.

- Inputs (normalized 0–1): dog x, dog y, ball x, ball y, dog facing (one-hot ×4) → 8 inputs.
  - Absolute coordinates on purpose. Relative inputs (ball minus dog) would let the stage 1 model generalize and kill the stage 2 reveal.
- Hidden: one layer, 24 units (D5), ReLU.
- Outputs: one score per action → 5.
- About 350 weights total, small enough to display in full.
- Experience replay (buffer 5,000, batch 32), target network synced every 200 steps.
- Seeded random number generator for all randomness so runs are reproducible.
- During testing and playback, curiosity is 0: the dog always takes its best-scored move. Curiosity applies only while training.

### 5.2 Student-facing controls

| Control | Plain-language label | Range | Default | Teaches |
|---|---|---|---|---|
| ε (epsilon) | **Curiosity**: how often the dog tries a random move while training | 0–50% | 10% | Exploration vs. exploitation |
| γ (gamma) | **Credit memory**: how far back a reward reaches to earlier moves | short / medium / long (0.5 / 0.85 / 0.97) | medium | Credit assignment; value-heatmap spread |
| Episodes | **Training time** | 100–3,000 | 1,000 | Iterations needed |
| Rewards | **What earns a treat** | see §5.3 | goal + step cost | Reward hacking |
| Seed | **Random seed** (under Advanced) | integer | random | Same settings, different weights |

Plain words first, technical term in a tooltip (matches Token Explorer's ⓘ pattern). Learning rate is fixed internally for v1 (D1).

### 5.3 Reward menu
- Ball reaches goal: +10 (on by default)
- Each step: −0.1 (on by default)
- Touching the ball (bumping into it): +1 (off) → hack: dog bumps the ball endlessly and never kicks
- Ball moves: +1 per tile traveled (off) → hack: dog kicks the ball anywhere, repeatedly, not toward the goal
- Bumping a wall: −1 (off)

The UI flags a run as **reward hacking** when average reward rises while the goal rate stays near zero.

## 6. Stages

All stages are available to everyone. Stages 3–4 default to pre-trained (cached) replays, with an option to train live.

### Stage 1: Train
- Fixed ball position, fixed start.
- Adjust controls, hit **Train**, watch the visuals update.
- Expected outcomes:
  - Low curiosity → may settle on a roundabout route; footprints show a narrow trail.
  - Higher curiosity → more of the field explored, cleaner final route, but a noisier curve.
  - Short credit memory → learns slowly; value glow stays near the ball and goal.
  - Touch or ball-moves reward on → hacking.

### Stage 2: Surprise test
- Load the stage 1 model; drag the ball to a new tile; run the trained dog (no learning).
- Dog heads to where the ball used to be and kicks empty grass.
- The test path is drawn over the footprint heatmap in a contrasting color.

### Stage 3: Varied training
- Ball position randomized each episode over the whole field.
- Learning curve shows more episodes needed.
- Test: drag the ball anywhere; the dog follows it.

### Stage 4: Coverage gap
- Train with ball positions only in the left half; test on the right half. Fails.
- **Coverage map:** each tile colored by success rate when the ball starts there (green left, red right).

## 7. Visuals (the core of the exercise)

1. **Field view**: grid, dog, ball, goal. Animated playback of a single episode at adjustable speed.
2. **Footprint heatmap**: cumulative visits per tile during training, overlaid on the field. Toggle on/off.
3. **Value heatmap**: each tile colored by the network's best score with the dog standing there (ball at its current position). Computed by *probing* the network, not by reading weights. Optional policy-arrow overlay.
4. **Learning curve**: steps-to-goal per episode (success rate as a toggle), smoothed. Overlay up to 4 runs in distinct colors, legend showing their settings.
5. **Replay scrubber**: slider across training; scrubbing updates the field, both heatmaps, and a cursor on the curve. Snapshots every 50 episodes.
6. **Weights panel**: the full weight matrices as a color grid (blue negative, red positive), numbers on hover. Side by side with the value heatmap: "What it does / What it is."
7. **Twin runs**: two runs with identical settings, different seeds. Same behavior map, visibly different weight grids. A diff toggle highlights how few weights match.

## 8. Tech

- **No server.** Static HTML/JS on GitHub Pages like the rest of the lab. Training, visuals, and cached runs all live in the browser.
- Training runs in a Web Worker; the page redraws every 50 episodes so the UI never freezes. Episode playback is separate from training speed.
- The same learner code runs in Node to produce cached runs (§9).
- No Firebase in v1. Model sharing (§11) is the first feature that would need it.

## 9. Cached runs

- Generated by `scripts/capture-dog-runs.mjs` (Node, fixed seeds), committed to the repo, like Token Explorer's cached examples.
- Each run stores: settings, seed, curve, and snapshots every 50 episodes (weights, footprint grid, value grid).
- Size: ~350 weights × 60 snapshots ≈ 21k numbers, rounded. Fine as a static file.
- Planned runs:
  - S1-low-curiosity
  - S1-good
  - S1-touch-hack
  - S1-twin-A, S1-twin-B (same settings, different seeds)
  - S3-varied
  - S4-left-half

## 10. Conventions to match the existing lab

- Card on the home page, "AI in Legal Practice" section, tag **Experiment**.
- Help modal (`?`), Settings (`S`), Home (`M`), `Esc`.
- Proposed shortcuts: `Space` train / pause, `R` reset, `← →` scrub, `H` footprints, `V` values, `W` weights panel, `1`–`4` stage.
- Heatmap color scales must work in light, dark, and cyanotype themes (test cyanotype especially).
- Readable on a projector from the back of the room.
- Educational-use footer.

## 11. Later versions

- **Wall and gap map.** A wall with a long way around and a short gap; makes the exploration lesson dramatic (low curiosity finds the long route and never discovers the gap).
- **Bush landmark.** A bush beside the ball in stage 1; in the test, the dog goes to the bush. Exact husky/wolf parallel.
- **Model sharing / competition.** Students submit trained models; the instructor runs them on the projector against the same test positions. Needs Firebase or a JSON export/import.
- **Map editor.**
- **Learning-rate control** (if D1 goes that way later).

## 12. Acceptance checks

- Stage 1 default settings train in ≤15 s on a recent laptop and ≤45 s on a mid-range phone (measure in prototype).
- With S1-good settings, ≥9 of 10 seeds score consistently.
- Touch reward reliably produces the bump hack.
- Stage 2: a stage-1 model fails when the ball moves in ≥9 of 10 seeds.
- Twin runs: fewer than 10% of weights within ±0.05 of each other.

## 13. Open decisions

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Learning speed (learning rate) | fixed / Advanced control / student control | Fixed for v1 |
| D2 | Which knobs are visible by default | all of §5.2 / subset | All except seed |
| D3 | Goal placement | goal mouth on far edge / single goal tile / random | 3-tile goal mouth centered on the far edge |
| D4 | Stage 1 positions | ball and dog fixed / dog random | Both fixed, so stage 2 fails cleanly |
| D5 | Network size | 16 / 24 / 32 hidden | 24: small enough to display, big enough for stage 3 |
| D6 | Learning-curve metric | steps-to-goal / success rate / reward | Steps-to-goal, success rate as a toggle |
| D7 | Dog visual | emoji / drawn sprite / dot | Simple drawn sprite (original design) |
| D8 | Name | Dog Trainer / Good Dog / Fetch / Treat | Open |
| D9 | Show raw scores (Q-values) to students? | yes / hidden | Hidden; keeps the "unreadable" point clean |
| D10 | Debrief tie-ins to law | which examples | e.g., Amazon hiring model, COMPAS, Title VII disparate impact, product liability for spec gaming |
