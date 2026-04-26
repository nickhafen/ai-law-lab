// ════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════
function showHomeScreen() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  stopTimer();
  counselStopTimer();
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.add('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
}

function showPlotterApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.remove('hidden');
  if (!plotterInitialized) {
    plotterInitialized = true;
    plotterHandleRefresh();
  }
}

let panelDataLoaded = false;
let panelDataLoading = false;

function showPanelApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('panel-app').classList.remove('hidden');
  const roster = document.getElementById('settings-roster');
  if (roster && roster.value.trim()) $namesTextarea.value = roster.value;
  if (!panelDataLoaded && !panelDataLoading) {
    panelDataLoading = true;
    loadPanelData();
  }
}

function showCounselApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.remove('hidden');
  const roster = document.getElementById('settings-roster');
  if (roster && roster.value.trim()) document.getElementById('counsel-names').value = roster.value;
}

// ════════════════════════════════════════════════
//  SHARED UTILITIES
// ════════════════════════════════════════════════
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ════════════════════════════════════════════════
//  INSTRUCTOR SETTINGS
// ════════════════════════════════════════════════
const SETTINGS_KEY = 'panel-instructor-settings';

function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch(e) {}
  const roster      = document.getElementById('settings-roster');
  const panelUrl    = document.getElementById('settings-panel-url');
  const counselUrl  = document.getElementById('settings-counsel-url');
  const plotterUrl  = document.getElementById('settings-plotter-url');
  const qfCount     = document.getElementById('settings-qf-count');
  if (roster     && s.roster     !== undefined) roster.value     = s.roster;
  if (panelUrl   && s.panelUrl)                 panelUrl.value   = s.panelUrl;
  if (counselUrl && s.counselUrl)               counselUrl.value = s.counselUrl;
  if (plotterUrl && s.plotterUrl)               plotterUrl.value = s.plotterUrl;
  if (qfCount    && s.qfCount    !== undefined) qfCount.value    = s.qfCount;
}

function saveSettings() {
  const s = {
    roster:     document.getElementById('settings-roster')?.value     ?? '',
    panelUrl:   document.getElementById('settings-panel-url')?.value  ?? SHEET_CSV_URL,
    counselUrl: document.getElementById('settings-counsel-url')?.value ?? '',
    plotterUrl: document.getElementById('settings-plotter-url')?.value ?? PLOTTER_CSV_URL,
    qfCount:    document.getElementById('settings-qf-count')?.value   ?? '9'
  };
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(s)); } catch(e) {}
}

function settingsQuickFill() {
  const n = Math.min(parseInt(document.getElementById('settings-qf-count')?.value) || 9, FILLER_NAMES.length);
  const roster = document.getElementById('settings-roster');
  if (roster) { roster.value = FILLER_NAMES.slice(0, n).sort().join('\n'); saveSettings(); }
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — CONFIG
// ════════════════════════════════════════════════
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQhb7lQIBLc78-V9CtLw53tZ6E9x3OX6lwHEOSz5kastQG2bkH9gYK1ZmrMHqVnkr5HLBrmwtRAxJvZ/pub?output=csv";

// ════════════════════════════════════════════════
//  PANEL EXERCISE — STATE
// ════════════════════════════════════════════════
let presentationItems = [];
let questions = [];

let groupSize = 3;
let groups = [];
let promptAssigned = [];
let groupsRandomized = false;
let promptsAssigned = false;

let drawnQuestions = [];
let usedQuestionSet = new Set();
let currentGroupIndex = 0;

let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let timerMode = 'down';
let timerCountdownTotal = 120;
let timerFlashState = null;
let timerCountingUpAfterCD = false;
let timerWarningEntries = [{value:60,unit:'s'},{value:30,unit:'s'}];
let timerFlashedThresholds = new Set();

// ════════════════════════════════════════════════
//  PANEL EXERCISE — ELEMENT REFS
// ════════════════════════════════════════════════
const $loading      = document.getElementById('loading-screen');
const $error        = document.getElementById('error-screen');
const $errorDetail  = document.getElementById('error-detail');
const $setup        = document.getElementById('setup-screen');
const $mod          = document.getElementById('mod-screen');

const $namesTextarea    = document.getElementById('names-textarea');
const $groupSizeInput   = document.getElementById('group-size');
const $randomizeBtn     = document.getElementById('randomize-btn');
const $assignPromptsBtn = document.getElementById('assign-prompts-btn');
const $groupsDisplay    = document.getElementById('groups-display');
const $warnNoGroups     = document.getElementById('warn-no-groups');
const $warnNoPrompts    = document.getElementById('warn-no-prompts');
const $startPanelBtn    = document.getElementById('start-panel-btn');

const $modResetBtn   = document.getElementById('mod-reset-btn');
const $groupPrevBtn  = document.getElementById('group-prev-btn');
const $groupNextBtn  = document.getElementById('group-next-btn');
const $groupNavLabel = document.getElementById('group-nav-label');
const $openingCards  = document.getElementById('opening-cards');
const $drawQBtn      = document.getElementById('draw-question-btn');
const $qaExhausted   = document.getElementById('qa-exhausted');
const $qaDrawnArea   = document.getElementById('qa-drawn-area');
const $toggleHistoryBtn = document.getElementById('toggle-history-btn');
const $qHistoryList  = document.getElementById('q-history-list');

const $timerToggleHeader    = document.getElementById('timer-toggle-header');
const $timerToggleIcon      = document.getElementById('timer-toggle-icon');
const $timerBody            = document.getElementById('timer-body');
const $timerDisplay         = document.getElementById('timer-display');
const $timerStartBtn        = document.getElementById('timer-start-btn');
const $timerResetBtn        = document.getElementById('timer-reset-btn');
const $timerCountdownInputs = document.getElementById('timer-countdown-inputs');
const $timerMin             = document.getElementById('timer-min');
const $timerSec             = document.getElementById('timer-sec');
const $timerCard            = document.getElementById('timer-card');

const $helpModal      = document.getElementById('help-modal');
const $helpModalClose = document.getElementById('help-modal-close');

// ════════════════════════════════════════════════
//  PANEL EXERCISE — DATA LOADING
// ════════════════════════════════════════════════
async function loadPanelData() {
  try {
    const urlEl = document.getElementById('settings-panel-url');
    const url = (urlEl && urlEl.value.trim()) || SHEET_CSV_URL;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    parsePanelCSV(text);
    panelDataLoaded = true;
    panelDataLoading = false;
    showScreen('setup');
  } catch (e) {
    panelDataLoading = false;
    $loading.style.display = 'none';
    $error.style.display = 'flex';
    $errorDetail.textContent = e.message || String(e);
  }
}

function parsePanelCSV(text) {
  const rows = text.trim().split('\n').map(line => parsePanelCSVLine(line));
  for (let i = 1; i < rows.length; i++) {
    const [type, script, prompt] = rows[i];
    if (!type) continue;
    if (type.trim().toLowerCase() === 'presentation') {
      presentationItems.push({ script: script || '', prompt: prompt || '' });
    } else if (type.trim().toLowerCase() === 'question') {
      questions.push({ script: script || '' });
    }
  }
}

function parsePanelCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i+1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — SCREEN MANAGEMENT
// ════════════════════════════════════════════════
function showScreen(name) {
  $loading.style.display = 'none';
  $error.style.display = 'none';
  $setup.classList.remove('active');
  $mod.classList.remove('active');
  if (name === 'setup') $setup.classList.add('active');
  if (name === 'mod')   $mod.classList.add('active');
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — SETUP EVENTS
// ════════════════════════════════════════════════
function getNamesFromTextarea() {
  return $namesTextarea.value
    .split(/[\n,]/)
    .map(n => n.trim())
    .filter(n => n.length > 0);
}

function bindSetupEvents() {
  $randomizeBtn.addEventListener('click', randomizeGroups);
  $assignPromptsBtn.addEventListener('click', assignPrompts);
  $startPanelBtn.addEventListener('click', startPanel);
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — RANDOMIZE GROUPS
// ════════════════════════════════════════════════
function randomizeGroups() {
  $warnNoGroups.classList.remove('show');
  document.getElementById('warn-start-blocked').classList.remove('show');

  const names = getNamesFromTextarea();
  if (names.length === 0) {
    $warnNoGroups.textContent = 'No names entered. Add names before randomizing panels.';
    $warnNoGroups.classList.add('show');
    return;
  }

  groupSize = parseInt($groupSizeInput.value) || 3;
  const count = names.length;

  if (groupSize >= count) {
    $warnNoGroups.textContent = `Group size (${groupSize}) is ≥ number of students (${count}). Reduce group size so there is more than one panel.`;
    $warnNoGroups.classList.add('show');
    return;
  }

  $warnNoGroups.textContent = "Groups haven't been created yet. Create groups first.";

  const minSize = parseInt((document.getElementById('min-group-size') || {}).value) || 2;
  const shuffled = shuffle(names);
  groups = [];

  const numGroups = Math.ceil(count / groupSize);
  const bigGroupCount = count % numGroups;
  const bigSize = Math.ceil(count / numGroups);
  const smallSize = Math.floor(count / numGroups);

  let idx = 0;
  for (let g = 0; g < numGroups; g++) {
    const size = (bigGroupCount === 0 || g < bigGroupCount) ? bigSize : smallSize;
    groups.push(shuffled.slice(idx, idx + size));
    idx += size;
  }

  for (let g = groups.length - 1; g >= 0; g--) {
    if (groups[g].length < minSize && groups.length > 1) {
      const members = groups.splice(g, 1)[0];
      members.forEach(member => {
        let minLen = Infinity, minIdx = 0;
        groups.forEach((grp, i) => { if (grp.length < minLen) { minLen = grp.length; minIdx = i; } });
        groups[minIdx].push(member);
      });
    }
  }

  groupsRandomized = true;
  promptsAssigned = false;
  promptAssigned = [];
  renderGroups();
}

function renderGroups() {
  $groupsDisplay.innerHTML = '';
  if (!groups.length) return;
  const grid = document.createElement('div');
  grid.className = 'groups-grid';
  groups.forEach((members, gi) => {
    const card = document.createElement('div');
    card.className = 'group-card';
    card.innerHTML = `<div class="group-card-title">Panel ${gi + 1}</div>`;
    members.forEach(name => {
      const member = document.createElement('div');
      member.className = 'group-member';
      const nameDiv = document.createElement('div');
      nameDiv.className = 'group-member-name';
      nameDiv.textContent = name;
      member.appendChild(nameDiv);
      const pa = promptAssigned.find(p => p.name === name);
      if (pa) {
        const promptDiv = document.createElement('div');
        promptDiv.className = 'group-member-prompt';
        promptDiv.textContent = pa.prompt;
        member.appendChild(promptDiv);
      }
      card.appendChild(member);
    });
    grid.appendChild(card);
  });
  $groupsDisplay.appendChild(grid);
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — ASSIGN PROMPTS
// ════════════════════════════════════════════════
function assignPrompts() {
  $warnNoGroups.classList.remove('show');
  $warnNoPrompts.classList.remove('show');
  document.getElementById('warn-start-blocked').classList.remove('show');
  if (!groupsRandomized || !groups.length) {
    $warnNoGroups.classList.add('show');
    return;
  }

  const allMembers = groups.flat();
  const shuffledPrompts = shuffle(presentationItems);

  promptAssigned = [];
  allMembers.forEach((name, i) => {
    const item = shuffledPrompts[i % shuffledPrompts.length];
    promptAssigned.push({ name, prompt: item.prompt, script: item.script });
  });

  promptsAssigned = true;

  if (allMembers.length > presentationItems.length) {
    $warnNoPrompts.textContent = `Note: there are only ${presentationItems.length} unique prompts for ${allMembers.length} students — some prompts will be repeated.`;
    $warnNoPrompts.classList.add('show');
  }

  renderGroups();
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — START PANEL
// ════════════════════════════════════════════════
function startPanel() {
  $warnNoGroups.classList.remove('show');
  $warnNoPrompts.classList.remove('show');
  const $blocked = document.getElementById('warn-start-blocked');
  $blocked.classList.remove('show');

  if (!groupsRandomized) {
    $blocked.textContent = 'Please create groups and assign prompts before starting.';
    $blocked.classList.add('show');
    return;
  }
  if (!promptsAssigned) {
    $blocked.textContent = 'Please assign prompts before starting.';
    $blocked.classList.add('show');
    return;
  }

  resetTimer();
  buildModeratorScreen();
  showScreen('mod');
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — MODERATOR SCREEN
// ════════════════════════════════════════════════
function buildModeratorScreen() {
  drawnQuestions = [];
  usedQuestionSet = new Set();
  $qaDrawnArea.innerHTML = '';
  $qaExhausted.classList.remove('show');
  $drawQBtn.disabled = false;
  $qHistoryList.innerHTML = '';
  $qHistoryList.classList.remove('show');
  $toggleHistoryBtn.textContent = 'View Question History';

  currentGroupIndex = 0;
  renderGroupView(currentGroupIndex);
  updateGroupNav();

  stopTimer();
  timerSeconds = 0;
  updateTimerDisplay();
  $timerStartBtn.textContent = 'Start';
}

function bindModEvents() {
  $modResetBtn.addEventListener('click', () => {
    groupsRandomized = false;
    promptsAssigned = false;
    groups = [];
    promptAssigned = [];
    $groupsDisplay.innerHTML = '';
    $warnNoGroups.classList.remove('show');
    $warnNoPrompts.classList.remove('show');
    stopTimer();
    showScreen('setup');
  });

  $groupPrevBtn.addEventListener('click', () => {
    if (currentGroupIndex > 0) {
      resetTimer();
      $qaDrawnArea.innerHTML = '';
      currentGroupIndex--;
      renderGroupView(currentGroupIndex);
      updateGroupNav();
    }
  });
  $groupNextBtn.addEventListener('click', () => {
    if (currentGroupIndex < groups.length - 1) {
      resetTimer();
      $qaDrawnArea.innerHTML = '';
      currentGroupIndex++;
      renderGroupView(currentGroupIndex);
      updateGroupNav();
    }
  });

  $drawQBtn.addEventListener('click', drawQuestion);

  $toggleHistoryBtn.addEventListener('click', () => {
    const open = $qHistoryList.classList.toggle('show');
    $toggleHistoryBtn.textContent = open ? 'Hide Question History' : 'View Question History';
  });

  $timerToggleHeader.addEventListener('click', () => {
    const expanded = $timerBody.classList.toggle('expanded');
    $timerToggleIcon.textContent = expanded ? '▲ Hide' : '▼ Show';
    if (!expanded) resetTimer();
  });

  document.querySelectorAll('input[name="timer-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      timerMode = radio.value;
      const isDown = timerMode === 'down';
      $timerCountdownInputs.classList.toggle('hidden', !isDown);
      const warnSection = document.getElementById('timer-warnings-section');
      if (warnSection) warnSection.classList.toggle('hidden', !isDown);
      const countupRow = document.getElementById('timer-countup-row');
      if (countupRow) countupRow.classList.toggle('hidden', !isDown);
      if ($timerCard) { $timerCard.classList.remove('timer-flash-active','timer-flash-done'); }
      timerFlashedThresholds.clear();
      stopTimer();
      timerSeconds = 0;
      updateTimerDisplay();
      $timerStartBtn.textContent = 'Start';
      timerRunning = false;
    });
  });

  const $viewAllQBtn = document.getElementById('view-all-q-btn');
  const $allQModal   = document.getElementById('all-q-modal');
  const $allQModalClose = document.getElementById('all-q-modal-close');

  if ($viewAllQBtn) $viewAllQBtn.addEventListener('click', () => { renderAllQuestionsModal(); $allQModal.classList.add('open'); });
  if ($allQModalClose) $allQModalClose.addEventListener('click', () => $allQModal.classList.remove('open'));
  if ($allQModal) $allQModal.addEventListener('click', e => { if (e.target === $allQModal) $allQModal.classList.remove('open'); });

  const $resetQBtn = document.getElementById('reset-q-btn');
  if ($resetQBtn) {
    $resetQBtn.addEventListener('click', () => {
      drawnQuestions = [];
      usedQuestionSet = new Set();
      $qaDrawnArea.innerHTML = '';
      $qaExhausted.classList.remove('show');
      $drawQBtn.disabled = false;
      $qHistoryList.innerHTML = '';
      $qHistoryList.classList.remove('show');
      $toggleHistoryBtn.textContent = 'View Question History';
    });
  }

  renderTimerWarnings();
  const $addWarnBtn = document.getElementById('add-warning-btn');
  if ($addWarnBtn) $addWarnBtn.addEventListener('click', () => { timerWarningEntries.push({value:30,unit:'s'}); renderTimerWarnings(); });

  $timerStartBtn.addEventListener('click', () => { if (timerRunning) pauseTimer(); else startTimer(); });
  $timerResetBtn.addEventListener('click', resetTimer);

  ['timer-min', 'timer-sec'].forEach(id => {
    const inp = document.getElementById(id);
    if (!inp) return;
    inp.addEventListener('input', () => {
      if (inp.value !== '' && inp.value.includes('.')) {
        inp.value = Math.floor(parseFloat(inp.value));
        const warn = document.getElementById('timer-decimal-warn');
        if (warn) {
          warn.style.display = '';
          clearTimeout(inp._decWarnTimer);
          inp._decWarnTimer = setTimeout(() => { warn.style.display = 'none'; }, 2500);
        }
      }
    });
  });
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — GROUP VIEW
// ════════════════════════════════════════════════
function renderGroupView(idx) {
  $openingCards.innerHTML = '';
  if (!groups.length || idx >= groups.length) {
    $openingCards.innerHTML = '<p style="color:var(--muted);font-size:0.95rem;">No groups formed. Return to setup.</p>';
    return;
  }
  const members = groups[idx];
  if (!promptAssigned.length) {
    $openingCards.innerHTML = '<p style="color:var(--muted);font-size:0.95rem;">No prompts assigned. Return to setup.</p>';
    return;
  }
  members.forEach(name => {
    const pa = promptAssigned.find(p => p.name === name);
    const card = document.createElement('div');
    card.className = 'opening-card';
    card.innerHTML = `
      <div class="opening-card-name">${escHtml(name)}</div>
      <div class="opening-card-script">${escHtml(pa ? pa.script : '(no script assigned)')}</div>
    `;
    $openingCards.appendChild(card);
  });
}

function updateGroupNav() {
  const total = groups.length || 1;
  $groupNavLabel.textContent = `Panel ${currentGroupIndex + 1} of ${total}`;
  $groupPrevBtn.disabled = currentGroupIndex === 0;
  $groupNextBtn.disabled = currentGroupIndex >= groups.length - 1;
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — Q&A
// ════════════════════════════════════════════════
function drawQuestion() {
  if (usedQuestionSet.size >= questions.length) return;

  let idx;
  do { idx = Math.floor(Math.random() * questions.length); }
  while (usedQuestionSet.has(idx));

  usedQuestionSet.add(idx);
  drawnQuestions.push(idx);

  $qaDrawnArea.innerHTML = `
    <div class="qa-drawn-card">
      <div class="qa-drawn-label">Question ${drawnQuestions.length}</div>
      <div class="qa-drawn-script">${escHtml(questions[idx].script)}</div>
    </div>
  `;

  $qHistoryList.innerHTML = '';
  drawnQuestions.forEach((qi, i) => {
    const item = document.createElement('div');
    item.className = 'history-item';
    item.innerHTML = `<span class="history-num">Q${i + 1}.</span>${escHtml(questions[qi].script)}`;
    $qHistoryList.appendChild(item);
  });

  if (usedQuestionSet.size >= questions.length) {
    $drawQBtn.disabled = true;
    $qaExhausted.classList.add('show');
  }
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — TIMER
// ════════════════════════════════════════════════
function getTimerWarnSecondsArray() {
  return timerWarningEntries
    .map(e => e.unit === 'm' ? (e.value || 0) * 60 : (e.value || 0))
    .filter(v => v > 0)
    .sort((a, b) => b - a);
}

function triggerTimerFlash(thenDone) {
  if (!$timerCard) return;
  $timerCard.classList.remove('timer-flash-active', 'timer-flash-done');
  void $timerCard.offsetWidth;
  $timerCard.classList.add('timer-flash-active');
  if (thenDone) {
    const onEnd = () => {
      $timerCard.removeEventListener('animationend', onEnd);
      $timerCard.classList.remove('timer-flash-active');
      $timerCard.classList.add('timer-flash-done');
    };
    $timerCard.addEventListener('animationend', onEnd);
  }
}

function updateTimerFlash() {
  if (!$timerCard || (timerMode !== 'down' && !timerCountingUpAfterCD)) {
    if ($timerCard) $timerCard.classList.remove('timer-flash-active', 'timer-flash-done');
    timerFlashedThresholds.clear();
    return;
  }
  if (timerCountingUpAfterCD) return;

  if (timerSeconds === 0) {
    if (!timerFlashedThresholds.has('zero')) {
      timerFlashedThresholds.add('zero');
      triggerTimerFlash(true);
    }
    return;
  }

  const thresholds = getTimerWarnSecondsArray();
  for (const ws of thresholds) {
    if (timerSeconds <= ws && !timerFlashedThresholds.has(ws) && timerCountdownTotal > ws) {
      timerFlashedThresholds.add(ws);
      triggerTimerFlash(false);
      break;
    }
  }
}

function renderTimerWarnings() {
  const list = document.getElementById('timer-warnings-list');
  if (!list) return;
  list.innerHTML = '';
  timerWarningEntries.forEach((entry, i) => {
    const row = document.createElement('div');
    row.className = 'warn-entry-row';
    row.innerHTML = `
      <input type="number" value="${entry.value}" min="1" max="9999" class="warn-val-input" data-i="${i}">
      <label><input type="radio" name="wu${i}" value="s" class="warn-unit-input" data-i="${i}" ${entry.unit==='s'?'checked':''}> s</label>
      <label><input type="radio" name="wu${i}" value="m" class="warn-unit-input" data-i="${i}" ${entry.unit==='m'?'checked':''}> min</label>
      <button class="warn-remove-btn" data-i="${i}" title="Remove">✕</button>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('.warn-val-input').forEach(inp => {
    inp.addEventListener('change', () => { timerWarningEntries[+inp.dataset.i].value = parseInt(inp.value) || 1; });
  });
  list.querySelectorAll('.warn-unit-input').forEach(inp => {
    inp.addEventListener('change', () => { timerWarningEntries[+inp.dataset.i].unit = inp.value; });
  });
  list.querySelectorAll('.warn-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => { timerWarningEntries.splice(+btn.dataset.i, 1); renderTimerWarnings(); });
  });
}

function startTimer() {
  if (timerMode === 'down' && timerSeconds === 0 && !timerCountingUpAfterCD) {
    const mins = parseInt($timerMin.value) || 0;
    const secs = parseInt($timerSec.value) || 0;
    timerCountdownTotal = mins * 60 + secs;
    timerSeconds = timerCountdownTotal;
    if (timerSeconds <= 0) return;
  }
  timerRunning = true;
  $timerStartBtn.textContent = 'Pause';
  timerInterval = setInterval(() => {
    if (timerMode === 'up' || timerCountingUpAfterCD) {
      timerSeconds++;
    } else {
      timerSeconds--;
      if (timerSeconds <= 0) {
        timerSeconds = 0;
        updateTimerDisplay();
        updateTimerFlash();
        const countUpAfterEl = document.getElementById('timer-countup-after');
        if (countUpAfterEl && countUpAfterEl.checked) {
          timerCountingUpAfterCD = true;
        } else {
          stopTimer();
          $timerStartBtn.textContent = 'Start';
          timerRunning = false;
        }
        return;
      }
    }
    updateTimerDisplay();
    updateTimerFlash();
  }, 1000);
  updateTimerDisplay();
  updateTimerFlash();
}

function pauseTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  $timerStartBtn.textContent = 'Start';
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning = false;
  timerCountingUpAfterCD = false;
}

function resetTimer() {
  stopTimer();
  timerRunning = false;
  timerCountingUpAfterCD = false;
  timerFlashState = null;
  timerFlashedThresholds.clear();
  $timerStartBtn.textContent = 'Start';
  if (timerMode === 'down') {
    const mins = parseInt($timerMin.value) || 0;
    const secs = parseInt($timerSec.value) || 0;
    timerSeconds = mins * 60 + secs;
  } else {
    timerSeconds = 0;
  }
  if ($timerCard) $timerCard.classList.remove('timer-flash-active', 'timer-flash-done');
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const m = Math.floor(Math.abs(timerSeconds) / 60);
  const s = Math.abs(timerSeconds) % 60;
  $timerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — HELP + SETTINGS
// ════════════════════════════════════════════════
function openSettings() {
  const m = document.getElementById('settings-modal');
  if (m) m.classList.add('open');
}
function closeSettings() {
  const m = document.getElementById('settings-modal');
  if (m) m.classList.remove('open');
}

function renderHelpModal() {
  const onHome    = !document.getElementById('home-screen').classList.contains('hidden');
  const onPanel   = !document.getElementById('panel-app').classList.contains('hidden');
  const onCounsel = !document.getElementById('counsel-app').classList.contains('hidden');
  const onPanelSetup    = onPanel   && document.getElementById('setup-screen').classList.contains('active');
  const onPanelMod      = onPanel   && document.getElementById('mod-screen').classList.contains('active');
  const onCounselSetup  = onCounsel && document.getElementById('counsel-setup').classList.contains('active');
  const onCounselMod    = onCounsel && document.getElementById('counsel-mod').classList.contains('active');
  const show = (id, v) => { const el = document.getElementById(id); if (el) el.style.display = v ? '' : 'none'; };
  show('help-section-home',          onHome);
  show('help-section-panel-setup',   onPanelSetup);
  show('help-section-panel-mod',     onPanelMod);
  show('help-section-counsel-setup', onCounselSetup);
  show('help-section-counsel-mod',   onCounselMod);
}

function bindHelpEvents() {
  document.querySelectorAll('.help-btn').forEach(btn => {
    btn.addEventListener('click', () => { renderHelpModal(); $helpModal.classList.add('open'); });
  });
  $helpModalClose.addEventListener('click', () => $helpModal.classList.remove('open'));
  $helpModal.addEventListener('click', e => { if (e.target === $helpModal) $helpModal.classList.remove('open'); });

  const $settingsModal = document.getElementById('settings-modal');
  const $settingsClose = document.getElementById('settings-modal-close');
  document.querySelectorAll('.settings-trigger').forEach(btn => {
    btn.addEventListener('click', openSettings);
  });
  if ($settingsClose) $settingsClose.addEventListener('click', closeSettings);
  if ($settingsModal) $settingsModal.addEventListener('click', e => { if (e.target === $settingsModal) closeSettings(); });
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — KEYBOARD SHORTCUTS
// ════════════════════════════════════════════════
function bindKeyboardShortcuts() {
  document.addEventListener('keydown', e => {
    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // ── Global shortcuts (fire on every screen) ──
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
      return;
    }
    if (e.key === 's' || e.key === 'S') { openSettings(); return; }
    if (e.key === 'm' || e.key === 'M') { showHomeScreen(); return; }

    // ── Home screen shortcuts ──
    const onHome = !document.getElementById('home-screen').classList.contains('hidden');
    if (e.key === '1' && onHome) { showPanelApp(); return; }
    if (e.key === '2' && onHome) { showCounselApp(); return; }

    if (document.querySelector('.modal-overlay.open')) return;

    // ── Counsel-only shortcuts ──
    const onCounsel = !document.getElementById('counsel-app').classList.contains('hidden');
    if (onCounsel) {
      const onCounselMod = document.getElementById('counsel-mod').classList.contains('active');
      const onCounselSetup = document.getElementById('counsel-setup').classList.contains('active');
      if (onCounselMod) {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); counselNextResult(); return; }
        if (e.key === 'ArrowLeft') { e.preventDefault(); counselPrevResult(); return; }
        if (e.key === 'r' || e.key === 'R') { counselReset(); return; }
        if (e.key === 'l' || e.key === 'L') { counselToggleRisks(); return; }
        if (e.key === 'v' || e.key === 'V') { document.getElementById('counsel-view-all-btn')?.click(); return; }
        if (e.key === 'f' || e.key === 'F') { $counselTimerStartBtn && $counselTimerStartBtn.click(); return; }
        if (e.key === 'g' || e.key === 'G') { $counselTimerResetBtn && $counselTimerResetBtn.click(); return; }
        if (e.key === 't' || e.key === 'T') { $counselTimerToggleHeader && $counselTimerToggleHeader.click(); return; }
      }
      if (onCounselSetup) {
        if (e.key === 'q' || e.key === 'Q') { counselQuickFill(); return; }
        if (e.key === 'Enter') { e.preventDefault(); document.getElementById('btn-draw').click(); return; }
      }
      return;
    }

    // ── Panel-only shortcuts (bail if panel not active) ──
    if (document.getElementById('panel-app').classList.contains('hidden')) return;

    const onMod   = $mod.classList.contains('active');
    const onSetup = $setup.classList.contains('active');

    if (e.key === 'ArrowRight' && onMod) { e.preventDefault(); $groupNextBtn.click(); }
    else if (e.key === 'ArrowLeft' && onMod) { e.preventDefault(); $groupPrevBtn.click(); }
    else if (e.key === ' ' && onMod) { e.preventDefault(); if (!$drawQBtn.disabled) $drawQBtn.click(); }
    else if ((e.key === 'r' || e.key === 'R') && onMod) { $modResetBtn.click(); }
    else if ((e.key === 't' || e.key === 'T') && onMod) { $timerToggleHeader.click(); }
    else if ((e.key === 'c' || e.key === 'C') && onMod) {
      e.preventDefault();
      const radios = document.querySelectorAll('input[name="timer-mode"]');
      if (radios && radios.length) {
        const checked = document.querySelector('input[name="timer-mode"]:checked');
        let next = radios[0];
        if (checked) next = (checked === radios[0]) ? (radios[1] || radios[0]) : radios[0];
        next.checked = true;
        next.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
    else if ((e.key === 'f' || e.key === 'F') && onMod) { $timerStartBtn.click(); }
    else if ((e.key === 'g' || e.key === 'G') && onMod) { $timerResetBtn.click(); }

    if ((e.key === 'q' || e.key === 'Q') && onSetup) { quickFill(); }
    else if ((e.key === 'w' || e.key === 'W') && onSetup) { quickFillAndStart(); }
    else if (e.key === 'Enter' && onSetup) { e.preventDefault(); $startPanelBtn.click(); }
    else if ((e.key === 'a' || e.key === 'A') && onSetup) { document.getElementById('advanced-toggle-header').click(); }

    if (e.key === '?') { renderHelpModal(); $helpModal.classList.add('open'); }
  });
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — COLOR SCHEMES
// ════════════════════════════════════════════════
const BUILTIN_SCHEMES = [
  {
    name: 'Parchment',
    vars: {
      '--bg': '#f0ece4', '--header': '#1c1814', '--header-text': '#ffffff',
      '--accent': '#8b1a1a', '--accent-hover': '#6e1414',
      '--card': '#ffffff', '--card-shadow': '0 2px 8px rgba(0,0,0,0.10)',
      '--text': '#1c1814', '--muted': '#6b6259', '--border': '#d8d0c4',
      '--btn-secondary-bg': '#e8e2d8', '--gold': '#a07030'
    }
  },
  {
    name: 'Classic Blue',
    vars: {
      '--bg': '#f4f5f7', '--header': '#1a1f2e', '--header-text': '#ffffff',
      '--accent': '#2563eb', '--accent-hover': '#1d4ed8',
      '--card': '#ffffff', '--card-shadow': '0 2px 8px rgba(0,0,0,0.10)',
      '--text': '#1e2533', '--muted': '#6b7280', '--border': '#e2e6ea',
      '--btn-secondary-bg': '#e5e7eb', '--gold': '#93c5fd'
    }
  },
  {
    name: 'Forest',
    vars: {
      '--bg': '#f0f5f1', '--header': '#1c3829', '--header-text': '#ffffff',
      '--accent': '#16a34a', '--accent-hover': '#15803d',
      '--card': '#ffffff', '--card-shadow': '0 2px 8px rgba(0,0,0,0.10)',
      '--text': '#1a2b1e', '--muted': '#4d7a5a', '--border': '#c8dece',
      '--btn-secondary-bg': '#d9f0df', '--gold': '#86efac'
    }
  },
  {
    name: 'Midnight',
    vars: {
      '--bg': '#0d1117', '--header': '#161b22', '--header-text': '#e6edf3',
      '--accent': '#7c3aed', '--accent-hover': '#6d28d9',
      '--card': '#21262d', '--card-shadow': '0 2px 8px rgba(0,0,0,0.45)',
      '--text': '#e6edf3', '--muted': '#8b949e', '--border': '#30363d',
      '--btn-secondary-bg': '#30363d', '--gold': '#c4b5fd'
    }
  }
];

const SCHEMES_KEY = 'panel-color-schemes';
let colorSchemes = [];

function loadColorSchemes() {
  let userSaved = [];
  try { userSaved = JSON.parse(localStorage.getItem(SCHEMES_KEY) || '[]'); } catch(e) {}
  colorSchemes = [...BUILTIN_SCHEMES, ...userSaved];
  renderSchemeDropdown(0);
  syncPickersFromScheme(BUILTIN_SCHEMES[0]);
}

function renderSchemeDropdown(selectedIdx) {
  const sel = document.getElementById('scheme-select');
  sel.innerHTML = '';
  colorSchemes.forEach((s, i) => {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });
  if (selectedIdx !== undefined) sel.value = selectedIdx;
  const delBtn = document.getElementById('delete-scheme-btn');
  if (delBtn) delBtn.style.display = (selectedIdx !== undefined && selectedIdx >= BUILTIN_SCHEMES.length) ? '' : 'none';
}

function applyScheme(scheme) {
  const root = document.documentElement;
  Object.entries(scheme.vars).forEach(([k, v]) => root.style.setProperty(k, v));
  if (scheme.vars['--accent']) {
    const lum = hexLuminance(scheme.vars['--accent']);
    root.style.setProperty('--btn-primary-text', lum > 0.35 ? '#1e2533' : '#ffffff');
  }
  syncPickersFromScheme(scheme);
  if (plotterInitialized) plotterReRender();
}

function syncPickersFromScheme(scheme) {
  [['cp-bg','--bg','hex-bg'],['cp-header','--header','hex-header'],['cp-accent','--accent','hex-accent'],
   ['cp-card','--card','hex-card'],['cp-text','--text','hex-text'],['cp-gold','--gold','hex-gold']].forEach(([id, v, hexId]) => {
    const el = document.getElementById(id);
    const hexEl = document.getElementById(hexId);
    if (el && scheme.vars[v]) {
      el.value = scheme.vars[v];
      if (hexEl) hexEl.value = scheme.vars[v];
    }
  });
}

function hexLuminance(hex) {
  const r = parseInt(hex.slice(1,3),16)/255;
  const g = parseInt(hex.slice(3,5),16)/255;
  const b = parseInt(hex.slice(5,7),16)/255;
  const toLinear = c => c <= 0.03928 ? c/12.92 : Math.pow((c+0.055)/1.055, 2.4);
  return 0.2126*toLinear(r) + 0.7152*toLinear(g) + 0.0722*toLinear(b);
}

function applyIndividualColor(varName, value) {
  document.documentElement.style.setProperty(varName, value);
  if (varName === '--accent') {
    document.documentElement.style.setProperty('--accent-hover', value);
    const lum = hexLuminance(value);
    document.documentElement.style.setProperty('--btn-primary-text', lum > 0.35 ? '#1e2533' : '#ffffff');
  }
  if (plotterInitialized) plotterReRender();
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — QUICK FILL
// ════════════════════════════════════════════════
const FILLER_NAMES = [
  'Alex','Bailey','Cameron','Dakota','Elliot',
  'Finley','Gray','Harper','Indigo','Jordan',
  'Kenji','Logan','Morgan','Nico','Oakley',
  'Parker','Quinn','Reese','Sage','Taylor',
  'Uma','Val','Winter','Xen','Yara','Zion'
];

function quickFill() {
  const n = Math.min(parseInt(document.getElementById('qf-count').value) || 9, FILLER_NAMES.length);
  const gs = parseInt(document.getElementById('qf-groupsize').value) || 3;
  const chosen = FILLER_NAMES.slice(0, n).slice().sort();
  $namesTextarea.value = chosen.join('\n');
  $groupSizeInput.value = gs;
  randomizeGroups();
  if (groupsRandomized) assignPrompts();
}

function quickFillAndStart() {
  quickFill();
  $startPanelBtn.click();
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — ALL QUESTIONS MODAL
// ════════════════════════════════════════════════
function renderAllQuestionsModal() {
  const $allQList = document.getElementById('all-q-list');
  if (!$allQList) return;
  $allQList.innerHTML = '';

  const unasked = [];
  const asked = [];
  questions.forEach((q, i) => {
    if (usedQuestionSet.has(i)) asked.push({ q, i });
    else unasked.push({ q, i });
  });

  if (unasked.length === 0 && asked.length === 0) {
    $allQList.innerHTML = '<p style="color:var(--muted)">No questions loaded.</p>';
    return;
  }

  unasked.forEach(({ q }) => {
    const div = document.createElement('div');
    div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border);font-size:0.95rem;line-height:1.55;color:var(--text);';
    div.textContent = q.script;
    $allQList.appendChild(div);
  });

  if (asked.length > 0) {
    const sep = document.createElement('div');
    sep.style.cssText = 'margin:14px 0 10px;font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:0.07em;color:var(--muted);';
    sep.textContent = 'Already Asked';
    $allQList.appendChild(sep);
    asked.forEach(({ q }) => {
      const div = document.createElement('div');
      div.style.cssText = 'padding:10px 0;border-bottom:1px solid var(--border);font-size:0.95rem;line-height:1.55;color:var(--muted);text-decoration:line-through;opacity:0.6;';
      div.textContent = q.script;
      $allQList.appendChild(div);
    });
  }
}

// ════════════════════════════════════════════════
//  PANEL EXERCISE — ADVANCED EVENTS
// ════════════════════════════════════════════════
function bindAdvancedEvents() {
  document.getElementById('advanced-toggle-header').addEventListener('click', () => {
    const body = document.getElementById('advanced-body');
    const icon = document.getElementById('advanced-toggle-icon');
    const expanded = body.classList.toggle('expanded');
    icon.textContent = expanded ? '▲ Hide' : '▼ Show';
  });

  document.getElementById('qf-btn').addEventListener('click', quickFill);

  const qfStartBtn = document.getElementById('qf-start-btn');
  if (qfStartBtn) qfStartBtn.addEventListener('click', quickFillAndStart);

  const schemeSelect = document.getElementById('scheme-select');
  if (schemeSelect) schemeSelect.addEventListener('change', function() {
    const idx = parseInt(this.value);
    if (!isNaN(idx) && colorSchemes[idx]) applyScheme(colorSchemes[idx]);
    const delBtn = document.getElementById('delete-scheme-btn');
    if (delBtn) delBtn.style.display = (!isNaN(idx) && idx >= BUILTIN_SCHEMES.length) ? '' : 'none';
  });

  document.querySelectorAll('.color-grid input[type="color"]').forEach(input => {
    const hexId = 'hex-' + input.id.replace('cp-', '');
    const hexInput = document.getElementById(hexId);
    input.addEventListener('input', () => {
      applyIndividualColor(input.dataset.var, input.value);
      if (hexInput) hexInput.value = input.value;
    });
    if (hexInput) {
      hexInput.addEventListener('input', () => {
        const v = hexInput.value.trim();
        if (/^#[0-9a-fA-F]{6}$/.test(v)) {
          input.value = v;
          applyIndividualColor(input.dataset.var, v);
        }
      });
    }
  });

  const deleteSchemeBtn = document.getElementById('delete-scheme-btn');
  if (deleteSchemeBtn) deleteSchemeBtn.addEventListener('click', () => {
    const idx = parseInt(document.getElementById('scheme-select').value);
    if (isNaN(idx) || idx < BUILTIN_SCHEMES.length) return;
    colorSchemes.splice(idx, 1);
    const userSchemes = colorSchemes.slice(BUILTIN_SCHEMES.length);
    try { localStorage.setItem(SCHEMES_KEY, JSON.stringify(userSchemes)); } catch(e) {}
    const newIdx = Math.min(idx, colorSchemes.length - 1);
    renderSchemeDropdown(newIdx);
    applyScheme(colorSchemes[newIdx]);
  });

  const saveSchemeBtn = document.getElementById('save-scheme-btn');
  if (saveSchemeBtn) saveSchemeBtn.addEventListener('click', () => {
    const name = prompt('Name this color scheme:');
    if (!name || !name.trim()) return;
    const root = document.documentElement;
    const cs = getComputedStyle(root);
    const getVar = v => root.style.getPropertyValue(v) || cs.getPropertyValue(v).trim();
    const allVarNames = ['--bg','--header','--header-text','--accent','--accent-hover',
                         '--card','--card-shadow','--text','--muted','--border','--btn-secondary-bg','--gold'];
    const vars = {};
    allVarNames.forEach(v => { vars[v] = getVar(v); });
    const newScheme = { name: name.trim(), vars };
    colorSchemes.push(newScheme);
    const userSchemes = colorSchemes.slice(BUILTIN_SCHEMES.length);
    try { localStorage.setItem(SCHEMES_KEY, JSON.stringify(userSchemes)); } catch(e) {}
    renderSchemeDropdown(colorSchemes.length - 1);
  });

  const $clearNamesBtn = document.getElementById('clear-names-btn');
  if ($clearNamesBtn) {
    $clearNamesBtn.addEventListener('click', () => {
      $namesTextarea.value = '';
      groupsRandomized = false;
      promptsAssigned = false;
      groups = [];
      promptAssigned = [];
      $groupsDisplay.innerHTML = '';
    });
  }

  loadColorSchemes();

  const settingsRoster = document.getElementById('settings-roster');
  if (settingsRoster) settingsRoster.addEventListener('input', saveSettings);

  const settingsPanelUrl = document.getElementById('settings-panel-url');
  if (settingsPanelUrl) settingsPanelUrl.addEventListener('input', () => {
    saveSettings();
    panelDataLoaded = false;
    panelDataLoading = false;
    presentationItems = [];
    questions = [];
  });

  const settingsCounselUrl = document.getElementById('settings-counsel-url');
  if (settingsCounselUrl) settingsCounselUrl.addEventListener('input', () => {
    saveSettings();
    SCENARIOS = [];
    setCounselStatus('', '');
  });

  const settingsQfBtn = document.getElementById('settings-qf-btn');
  if (settingsQfBtn) settingsQfBtn.addEventListener('click', settingsQuickFill);

  const settingsQfCount = document.getElementById('settings-qf-count');
  if (settingsQfCount) settingsQfCount.addEventListener('input', saveSettings);
  // Note: settings-plotter-url binding is in bindPlotterEvents()
}

// ════════════════════════════════════════════════
//  COUNSEL EXERCISE — STATE
// ════════════════════════════════════════════════
// ─────────────────────────────────────────────────────────────────────────────
//  TOGGLE: Show or hide the "Priority Legal Issues" reveal button in the
//  Product Counsel moderator view.
//
//    false  →  button is hidden (default for in-class use)
//    true   →  button appears and students can reveal the legal risks
//
const SHOW_LEGAL_RISKS = false;
// ─────────────────────────────────────────────────────────────────────────────

let SCENARIOS = [];
let nameQueue = [];
let scenarioQueue = [];
let lastNames = [];
let counselHistory = [];
let counselHistoryIndex = -1;
let counselRosterSize = 0;

function parseCounselCSV(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  const s = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < s.length; i++) {
    const ch = s[i], next = s[i + 1];
    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"') { inQuotes = false; }
      else { field += ch; }
    } else {
      if (ch === '"') { inQuotes = true; }
      else if (ch === ',') { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); field = ''; rows.push(row); row = []; }
      else { field += ch; }
    }
  }
  row.push(field);
  if (row.some(f => f !== '')) rows.push(row);

  if (rows.length < 2) return [];

  const headers = rows[0].map(h => h.trim().toLowerCase());
  const ti = headers.indexOf('title');
  const xi = headers.indexOf('text');
  const ri = headers.findIndex(h => h.includes('risk'));

  return rows.slice(1).map(r => ({
    title: (r[ti] || '').trim(),
    text:  (r[xi] || '').trim(),
    risks: (ri >= 0 ? r[ri] : '').trim()
  })).filter(s => s.title && s.text);
}

function parseCounselNames() {
  return document.getElementById('counsel-names').value
    .split(/[\n,]+/).map(n => n.trim()).filter(Boolean);
}

function rosterChanged(names) {
  if (names.length !== lastNames.length) return true;
  return names.some((n, i) => n !== lastNames[i]);
}

function ensureQueues(names) {
  if (rosterChanged(names)) { lastNames = [...names]; nameQueue = shuffle(names); }
  if (nameQueue.length === 0) nameQueue = shuffle(names);
  if (scenarioQueue.length === 0) scenarioQueue = shuffle(SCENARIOS);
}

async function counselLoadCSV() {
  const urlEl = document.getElementById('settings-counsel-url');
  const url = (urlEl && urlEl.value.trim()) || '';

  if (!url) { setCounselStatus('Please enter a URL in Settings (⚙).', 'err'); return; }

  const startBtn = document.getElementById('btn-draw');
  if (startBtn) startBtn.disabled = true;
  setCounselStatus('Loading…', '');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const proxy = 'https://corsproxy.io/?' + encodeURIComponent(url);
    const res = await fetch(proxy, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    const parsed = parseCounselCSV(text);
    if (parsed.length === 0) throw new Error('No rows found — check column headers (title, text, top legal risks)');

    SCENARIOS = parsed;
    scenarioQueue = shuffle(SCENARIOS);
    nameQueue = [];
    lastNames = [];

    setCounselStatus(`✓ Loaded ${SCENARIOS.length} scenario${SCENARIOS.length !== 1 ? 's' : ''}`, 'ok');
  } catch (e) {
    const msg = e.name === 'AbortError' ? 'Timed out after 10 s — check the URL in Settings or try again' : e.message;
    setCounselStatus(`Error: ${msg}`, 'err');
  } finally {
    clearTimeout(timeout);
    if (startBtn) startBtn.disabled = false;
  }
}

function setCounselStatus(msg, cls) {
  const el = document.getElementById('csv-status');
  el.textContent = msg;
  el.className = cls;
}

async function counselStart() {
  if (SCENARIOS.length === 0) {
    await counselLoadCSV();
    if (SCENARIOS.length === 0) return;
  }
  const names = parseCounselNames();
  if (names.length === 0) { alert('Please enter at least one name.'); return; }

  ensureQueues(names);
  counselRosterSize = names.length;
  const entry = counselDrawEntry();
  counselHistory = [entry];
  counselHistoryIndex = 0;

  counselRenderResult(entry);
  document.getElementById('counsel-setup').classList.remove('active');
  document.getElementById('counsel-mod').classList.add('active');
  updateCounselNav();
}

function counselDrawEntry() {
  const name = nameQueue.shift();
  const scenario = scenarioQueue.shift();
  return { name, title: scenario.title, text: scenario.text, risks: scenario.risks };
}

function counselRenderResult(entry) {
  document.getElementById('out-name').textContent = entry.name;
  document.getElementById('out-title').textContent = entry.title;
  document.getElementById('out-scenario').textContent = entry.text;

  const risksDiv = document.getElementById('risks-list');
  risksDiv.innerHTML = entry.risks
    ? marked.parse(entry.risks)
    : '<p>No risks listed.</p>';

  document.getElementById('risks-panel').classList.remove('visible');
  document.getElementById('btn-reveal').style.display = SHOW_LEGAL_RISKS ? '' : 'none';
  document.getElementById('btn-reveal').textContent = '▸ Show Priority Legal Issues';

  ['out-name', 'out-title', 'out-scenario'].forEach(id => {
    const el = document.getElementById(id);
    el.style.animation = 'none'; el.offsetHeight; el.style.animation = '';
  });
}

function counselNextResult() {
  if (counselHistoryIndex < counselHistory.length - 1) {
    counselHistoryIndex++;
  } else {
    const names = parseCounselNames();
    ensureQueues(names);
    counselHistory.push(counselDrawEntry());
    counselHistoryIndex++;
  }
  counselRenderResult(counselHistory[counselHistoryIndex]);
  updateCounselNav();
}

function counselPrevResult() {
  if (counselHistoryIndex > 0) {
    counselHistoryIndex--;
    counselRenderResult(counselHistory[counselHistoryIndex]);
    updateCounselNav();
  }
}

function updateCounselNav() {
  const current = counselHistoryIndex + 1;
  const total = Math.max(counselRosterSize, counselHistory.length);
  document.getElementById('counsel-nav-label').textContent = `Result ${current} of ${total}`;
  document.getElementById('counsel-prev-btn').disabled = counselHistoryIndex === 0;
  document.getElementById('counsel-next-btn').disabled = false;
}

function counselToggleRisks() {
  const panel = document.getElementById('risks-panel');
  const btn   = document.getElementById('btn-reveal');
  const showing = panel.classList.toggle('visible');
  btn.textContent = showing ? '▾ Hide Priority Legal Issues' : '▸ Show Priority Legal Issues';
}

function counselQuickFill() {
  const n = Math.min(parseInt(document.getElementById('counsel-qf-count').value) || 6, FILLER_NAMES.length);
  document.getElementById('counsel-names').value = shuffle(FILLER_NAMES).slice(0, n).sort().join('\n');
}

function renderCounselScenariosModal() {
  const list = document.getElementById('counsel-all-list');
  if (!list) return;
  list.innerHTML = '';

  if (SCENARIOS.length === 0) {
    list.innerHTML = '<p style="color:var(--muted);font-size:0.95rem;">No scenarios loaded.</p>';
    return;
  }

  SCENARIOS.forEach((s, i) => {
    const item = document.createElement('div');
    item.style.cssText = 'padding:14px 0;border-bottom:1px solid var(--border);';

    const title = document.createElement('div');
    title.style.cssText = 'font-weight:600;font-size:0.95rem;color:var(--text);margin-bottom:5px;';
    title.textContent = `${i + 1}. ${s.title}`;

    const text = document.createElement('div');
    text.style.cssText = 'font-size:0.88rem;line-height:1.65;color:var(--muted);';
    text.textContent = s.text;

    item.appendChild(title);
    item.appendChild(text);
    list.appendChild(item);
  });
}

function counselReset() {
  counselStopTimer();
  counselHistory = [];
  counselHistoryIndex = -1;
  nameQueue = [];
  scenarioQueue = shuffle(SCENARIOS);
  lastNames = [];
  document.getElementById('counsel-mod').classList.remove('active');
  document.getElementById('counsel-setup').classList.add('active');
  document.getElementById('counsel-names').focus();
}

// ════════════════════════════════════════════════
//  COUNSEL EXERCISE — TIMER
// ════════════════════════════════════════════════
let counselTimerInterval = null;
let counselTimerSeconds = 0;
let counselTimerRunning = false;
let counselTimerMode = 'down';
let counselTimerCountdownTotal = 120;
let counselTimerCountingUpAfterCD = false;
let counselTimerFlashedThresholds = new Set();

let $counselTimerCard, $counselTimerDisplay, $counselTimerStartBtn, $counselTimerResetBtn,
    $counselTimerToggleHeader, $counselTimerToggleIcon, $counselTimerBody,
    $counselTimerCountdownInputs;

function counselUpdateTimerDisplay() {
  const m = Math.floor(Math.abs(counselTimerSeconds) / 60);
  const s = Math.abs(counselTimerSeconds) % 60;
  $counselTimerDisplay.textContent = `${m}:${s.toString().padStart(2, '0')}`;
}

function counselTriggerTimerFlash(thenDone) {
  if (!$counselTimerCard) return;
  $counselTimerCard.classList.remove('timer-flash-active', 'timer-flash-done');
  void $counselTimerCard.offsetWidth;
  $counselTimerCard.classList.add('timer-flash-active');
  if (thenDone) {
    const onEnd = () => {
      $counselTimerCard.removeEventListener('animationend', onEnd);
      $counselTimerCard.classList.remove('timer-flash-active');
      $counselTimerCard.classList.add('timer-flash-done');
    };
    $counselTimerCard.addEventListener('animationend', onEnd);
  }
}

function counselStartTimer() {
  if (counselTimerMode === 'down' && counselTimerSeconds === 0 && !counselTimerCountingUpAfterCD) {
    const mins = parseInt(document.getElementById('counsel-timer-min').value) || 0;
    const secs = parseInt(document.getElementById('counsel-timer-sec').value) || 0;
    counselTimerCountdownTotal = mins * 60 + secs;
    counselTimerSeconds = counselTimerCountdownTotal;
    if (counselTimerSeconds <= 0) return;
  }
  counselTimerRunning = true;
  $counselTimerStartBtn.textContent = 'Pause';
  counselTimerInterval = setInterval(() => {
    if (counselTimerMode === 'up' || counselTimerCountingUpAfterCD) {
      counselTimerSeconds++;
    } else {
      counselTimerSeconds--;
      if (counselTimerSeconds <= 0) {
        counselTimerSeconds = 0;
        counselUpdateTimerDisplay();
        if (!counselTimerFlashedThresholds.has('zero')) {
          counselTimerFlashedThresholds.add('zero');
          counselTriggerTimerFlash(true);
        }
        const countUpAfterEl = document.getElementById('counsel-timer-countup-after');
        if (countUpAfterEl && countUpAfterEl.checked) {
          counselTimerCountingUpAfterCD = true;
        } else {
          counselStopTimer();
          $counselTimerStartBtn.textContent = 'Start';
          counselTimerRunning = false;
        }
        return;
      }
    }
    counselUpdateTimerDisplay();
  }, 1000);
  counselUpdateTimerDisplay();
}

function counselPauseTimer() {
  clearInterval(counselTimerInterval);
  counselTimerInterval = null;
  counselTimerRunning = false;
  $counselTimerStartBtn.textContent = 'Start';
}

function counselStopTimer() {
  clearInterval(counselTimerInterval);
  counselTimerInterval = null;
  counselTimerRunning = false;
  counselTimerCountingUpAfterCD = false;
}

function counselResetTimer() {
  counselStopTimer();
  counselTimerFlashedThresholds.clear();
  $counselTimerStartBtn.textContent = 'Start';
  if (counselTimerMode === 'down') {
    const mins = parseInt(document.getElementById('counsel-timer-min').value) || 0;
    const secs = parseInt(document.getElementById('counsel-timer-sec').value) || 0;
    counselTimerSeconds = mins * 60 + secs;
  } else {
    counselTimerSeconds = 0;
  }
  if ($counselTimerCard) $counselTimerCard.classList.remove('timer-flash-active', 'timer-flash-done');
  counselUpdateTimerDisplay();
}

function bindCounselTimerEvents() {
  $counselTimerCard           = document.getElementById('counsel-timer-card');
  $counselTimerDisplay        = document.getElementById('counsel-timer-display');
  $counselTimerStartBtn       = document.getElementById('counsel-timer-start-btn');
  $counselTimerResetBtn       = document.getElementById('counsel-timer-reset-btn');
  $counselTimerToggleHeader   = document.getElementById('counsel-timer-toggle-header');
  $counselTimerToggleIcon     = document.getElementById('counsel-timer-toggle-icon');
  $counselTimerBody           = document.getElementById('counsel-timer-body');
  $counselTimerCountdownInputs = document.getElementById('counsel-timer-countdown-inputs');

  $counselTimerToggleHeader.addEventListener('click', () => {
    const expanded = $counselTimerBody.classList.toggle('expanded');
    $counselTimerToggleIcon.textContent = expanded ? '▲ Hide' : '▼ Show';
    if (!expanded) counselResetTimer();
  });

  document.querySelectorAll('input[name="counsel-timer-mode"]').forEach(radio => {
    radio.addEventListener('change', () => {
      counselTimerMode = radio.value;
      const isDown = counselTimerMode === 'down';
      $counselTimerCountdownInputs.classList.toggle('hidden', !isDown);
      const countupRow = document.getElementById('counsel-timer-countup-row');
      if (countupRow) countupRow.classList.toggle('hidden', !isDown);
      if ($counselTimerCard) $counselTimerCard.classList.remove('timer-flash-active', 'timer-flash-done');
      counselTimerFlashedThresholds.clear();
      counselStopTimer();
      counselTimerSeconds = 0;
      counselUpdateTimerDisplay();
      $counselTimerStartBtn.textContent = 'Start';
      counselTimerRunning = false;
    });
  });

  $counselTimerStartBtn.addEventListener('click', () => {
    if (counselTimerRunning) counselPauseTimer(); else counselStartTimer();
  });
  $counselTimerResetBtn.addEventListener('click', counselResetTimer);
}

// ════════════════════════════════════════════════
//  3D PLOTTER
// ════════════════════════════════════════════════
const PLOTTER_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRUA2UWnQ3pn-DUH6y_h9acbKv3SYaDwBcD4mswGofDGx4QicnfTEcFzKi_PHod9VfqUXmCGZa86U4q/pub?gid=892495698&single=true&output=csv';

let plotterInitialized = false;
let plotterData        = [];
let plotterCamera      = null;
let plotterUiRevision  = 'init';

function plotterParseCSV(csvText) {
  const parsed = Papa.parse(csvText, {
    header: true, skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase(),
  });
  const valid = []; let invalidCount = 0;
  for (const row of parsed.data) {
    const name = String(row['word'] ?? row['name'] ?? '').trim() || '(unnamed)';
    const x = parseFloat(row['x'] ?? row['X']);
    const y = parseFloat(row['y'] ?? row['Y']);
    const z = parseFloat(row['z'] ?? row['Z']);
    if (isNaN(x) || isNaN(y) || isNaN(z)) { invalidCount++; continue; }
    if (x < -1 || x > 1 || y < -1 || y > 1 || z < -1 || z > 1) { invalidCount++; continue; }
    const snap = v => Math.round(v * 10) / 10;
    valid.push({ name, x: snap(x), y: snap(y), z: snap(z) });
  }
  return { valid, totalRows: parsed.data.length, invalidCount };
}

async function plotterHandleRefresh() {
  const btn = document.getElementById('plotter-btn-refresh');
  if (btn) btn.disabled = true;
  plotterSetStatus('loading', 'Fetching data…');
  plotterClearStats();
  try {
    const urlEl = document.getElementById('settings-plotter-url');
    const url = (urlEl && urlEl.value.trim()) || PLOTTER_CSV_URL;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    const { valid, totalRows, invalidCount } = plotterParseCSV(text);
    plotterData = valid;
    plotterSetStats(`Rows fetched : ${totalRows}\nValid points : ${valid.length}\nInvalid/skip : ${invalidCount}`);
    plotterSetStatus('ok', valid.length === 0 ? 'No valid data yet.' : `Showing ${valid.length} point${valid.length !== 1 ? 's' : ''}.`);
    plotterRender(valid);
  } catch (err) {
    plotterSetStatus('error', `Fetch failed: ${err.message}\n\nMake sure the Google Sheet is published to the web as CSV.`);
    plotterClearStats();
  }
  if (btn) btn.disabled = false;
}

function plotterThemeColors() {
  const get = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  return {
    paper:      get('--bg'),
    plot:       get('--bg'),
    axisPane:   get('--card'),
    font:       get('--muted'),
    fontBright: get('--text'),
    grid:       get('--muted'),
    zeroline:   get('--muted'),
    markerLine: get('--border'),
  };
}

function plotterAxisSettings() {
  return {
    xOn:    document.getElementById('plotter-axis-x')?.checked ?? true,
    yOn:    document.getElementById('plotter-axis-y')?.checked ?? false,
    zOn:    document.getElementById('plotter-axis-z')?.checked ?? false,
    xLabel: document.getElementById('plotter-label-x')?.value.trim() || 'Female',
    yLabel: document.getElementById('plotter-label-y')?.value.trim() || 'Alive',
    zLabel: document.getElementById('plotter-label-z')?.value.trim() || 'Royal',
  };
}

function plotterBuildTraces(points) {
  const showLabels = document.getElementById('plotter-show-labels')?.checked ?? false;
  const ax  = plotterAxisSettings();
  const col = plotterThemeColors();
  const PALETTE = [
    '#4fc1ff','#ff6b6b','#51cf66','#ffd43b','#cc5de8',
    '#ff922b','#20c997','#f06595','#74c0fc','#a9e34b',
    '#ff8787','#63e6be','#ffec99','#d0bfff','#ffa94d',
  ];
  const wordOrder = [], wordMap = {};
  for (const p of points) {
    if (!(p.name in wordMap)) {
      wordMap[p.name] = { pts: [], color: PALETTE[wordOrder.length % PALETTE.length] };
      wordOrder.push(p.name);
    }
    wordMap[p.name].pts.push(p);
  }
  return wordOrder.map(word => {
    const { pts, color } = wordMap[word];
    return {
      type: 'scatter3d',
      mode: showLabels ? 'markers+text' : 'markers',
      name: word,
      x: pts.map(p => ax.xOn ? p.x : 0),
      y: pts.map(p => ax.yOn ? p.y : 0),
      z: pts.map(p => ax.zOn ? p.z : 0),
      text: pts.map(p => p.name),
      textposition: 'top center',
      hovertext: pts.map(p => `<b>${escHtml(p.name)}</b><br>x: ${p.x}<br>y: ${p.y}<br>z: ${p.z}`),
      hoverinfo: 'text',
      textfont: { size: 11, color: col.fontBright, family: 'Segoe UI, system-ui, sans-serif' },
      marker: { size: 7, color, opacity: 0.92, line: { color: col.markerLine, width: 1 } },
    };
  });
}

function plotterBuildLayout(camera) {
  const ax  = plotterAxisSettings();
  const col = plotterThemeColors();
  function axis(label, visible) {
    return {
      title: { text: visible ? label : '', font: { color: col.fontBright, size: 13 } },
      visible, showgrid: visible, showticklabels: visible, showspikes: false,
      tickfont: { color: col.font, size: 10 },
      gridcolor: col.grid, zerolinecolor: col.zeroline, zerolinewidth: 1,
      backgroundcolor: col.axisPane, range: [0, 1],
    };
  }
  const scene = {
    xaxis: axis(ax.xLabel, ax.xOn),
    yaxis: axis(ax.yLabel, ax.yOn),
    zaxis: axis(ax.zLabel, ax.zOn),
    bgcolor: col.axisPane, aspectmode: 'cube',
  };
  if (camera) scene.camera = camera;
  return {
    scene,
    paper_bgcolor: col.paper, plot_bgcolor: col.plot,
    font: { color: col.font, family: 'Segoe UI, system-ui, sans-serif' },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    showlegend: true,
    legend: { font: { color: col.fontBright, size: 11 }, bgcolor: col.axisPane, bordercolor: col.grid, borderwidth: 1 },
    uirevision: plotterUiRevision,
    hoverlabel: { bgcolor: col.axisPane, bordercolor: col.grid, font: { color: col.fontBright, size: 12 } },
  };
}

function plotterRender(points) {
  const plotEl = document.getElementById('plotter-plot');
  if (!plotEl) return;
  Plotly.react(plotEl, plotterBuildTraces(points), plotterBuildLayout(plotterCamera),
    { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['toImage'] });
  if (!plotEl._plotterCamAttached) {
    plotEl.on('plotly_relayout', event => {
      const cam = event['scene.camera'];
      if (cam) plotterCamera = cam;
    });
    plotEl._plotterCamAttached = true;
  }
}

function plotterSetStatus(type, message) {
  const el = document.getElementById('plotter-status-text');
  if (el) { el.className = `plotter-status-text ${type}`; el.textContent = message; }
}
function plotterSetStats(text) {
  const el = document.getElementById('plotter-stats-text');
  if (el) el.textContent = text;
}
function plotterClearStats() {
  const el = document.getElementById('plotter-stats-text');
  if (el) el.textContent = '';
}

function plotterReRender() {
  if (plotterData.length > 0) plotterRender(plotterData);
}

function bindPlotterEvents() {
  document.getElementById('plotter-btn-refresh')?.addEventListener('click', plotterHandleRefresh);
  ['plotter-show-labels','plotter-axis-x','plotter-axis-y','plotter-axis-z'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', plotterReRender);
  });
  ['plotter-label-x','plotter-label-y','plotter-label-z'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', plotterReRender);
  });

  const settingsPlotterUrl = document.getElementById('settings-plotter-url');
  if (settingsPlotterUrl) settingsPlotterUrl.addEventListener('input', () => {
    saveSettings();
    plotterData = [];
    plotterCamera = null;
  });
}

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  bindSetupEvents();
  bindModEvents();
  bindHelpEvents();
  bindAdvancedEvents();
  bindCounselTimerEvents();
  bindKeyboardShortcuts();
  bindPlotterEvents();

  loadSettings();

  // Bind next/prev nav buttons on counsel mod screen
  document.getElementById('counsel-next-btn').addEventListener('click', counselNextResult);
  document.getElementById('counsel-prev-btn').addEventListener('click', counselPrevResult);

  // Bind View All Scenarios modal
  const $counselAllModal      = document.getElementById('counsel-all-modal');
  const $counselAllModalClose = document.getElementById('counsel-all-modal-close');
  const $counselViewAllBtn    = document.getElementById('counsel-view-all-btn');
  if ($counselViewAllBtn) $counselViewAllBtn.addEventListener('click', () => { renderCounselScenariosModal(); $counselAllModal.classList.add('open'); });
  if ($counselAllModalClose) $counselAllModalClose.addEventListener('click', () => $counselAllModal.classList.remove('open'));
  if ($counselAllModal) $counselAllModal.addEventListener('click', e => { if (e.target === $counselAllModal) $counselAllModal.classList.remove('open'); });
});
