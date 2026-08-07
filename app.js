// ════════════════════════════════════════════════
//  NAVIGATION
// ════════════════════════════════════════════════
function showHomeScreen() {
  document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m));
  if (panelTimer) panelTimer.stop();
  if (counselTimer) counselTimer.stop();
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
  document.getElementById('token-app').classList.add('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
}

function showPlotterApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
  document.getElementById('token-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.remove('hidden');
  if (!plotterInitialized) {
    plotterInitialized = true;
    plotterStartListener();
    plotterBuildQR();
  }
}

function showResearchApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.add('hidden');
  document.getElementById('token-app').classList.add('hidden');
  document.getElementById('research-app').classList.remove('hidden');
  const roster = document.getElementById('settings-roster');
  if (roster && roster.value.trim()) document.getElementById('research-names').value = roster.value;
}

function showTokenApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
  document.getElementById('token-app').classList.remove('hidden');
  if (!tokenInitialized) {
    tokenInitialized = true;
    onExerciseConfig('tokenExplorer', tokenApplyConfig);
  }
}

let panelDataLoaded = false;
let panelDataLoading = false;

function showPanelApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
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
  document.getElementById('research-app').classList.add('hidden');
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
//  MODAL HELPERS + FOCUS TRAP
// ════════════════════════════════════════════════
const FOCUSABLE_SEL = [
  'a[href]', 'button:not([disabled])', 'input:not([disabled])',
  'select:not([disabled])', 'textarea:not([disabled])', '[tabindex]:not([tabindex="-1"])',
].join(', ');

let _ftEl = null, _ftHandler = null, _ftTrigger = null;

function openModal(el) {
  if (!el) return;
  _ftTrigger = (document.activeElement && document.activeElement !== document.body)
    ? document.activeElement : null;
  el.classList.add('open');
  _ftEl = el;
  const focusable = Array.from(el.querySelectorAll(FOCUSABLE_SEL))
    .filter(n => n.offsetParent !== null);
  if (focusable.length) setTimeout(() => focusable[0].focus(), 10);
  _ftHandler = (e) => {
    if (e.key !== 'Tab') return;
    const all = Array.from(el.querySelectorAll(FOCUSABLE_SEL))
      .filter(n => n.offsetParent !== null);
    if (!all.length) return;
    const first = all[0], last = all[all.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  el.addEventListener('keydown', _ftHandler);
}

function closeModal(el) {
  if (!el) return;
  el.classList.remove('open');
  if (_ftEl === el) {
    if (_ftHandler) el.removeEventListener('keydown', _ftHandler);
    _ftEl = null; _ftHandler = null;
    if (_ftTrigger) { try { _ftTrigger.focus(); } catch (_) {} _ftTrigger = null; }
  }
}

// ════════════════════════════════════════════════
//  SHARED TIMER FACTORY
// ════════════════════════════════════════════════
function createTimer(ids) {
  let interval = null;
  let seconds = 0;
  let running = false;
  let mode = 'down';
  let countdownTotal = 120;
  let countingUpAfterCD = false;
  let warningEntries = [{value:60,unit:'s'},{value:30,unit:'s'}];
  let flashedThresholds = new Set();

  let $card, $display, $startBtn, $resetBtn, $toggleHeader, $toggleIcon, $body,
      $countdownInputs, $minInput, $secInput;

  function getWarnSecondsArray() {
    return warningEntries
      .map(e => e.unit === 'm' ? (e.value || 0) * 60 : (e.value || 0))
      .filter(v => v > 0)
      .sort((a, b) => b - a);
  }

  function triggerFlash(thenDone) {
    if (!$card) return;
    $card.classList.remove('timer-flash-active', 'timer-flash-done');
    void $card.offsetWidth;
    $card.classList.add('timer-flash-active');
    if (thenDone) {
      const onEnd = () => {
        $card.removeEventListener('animationend', onEnd);
        $card.classList.remove('timer-flash-active');
        $card.classList.add('timer-flash-done');
      };
      $card.addEventListener('animationend', onEnd);
    }
  }

  function updateFlash() {
    if (!$card || (mode !== 'down' && !countingUpAfterCD)) {
      if ($card) $card.classList.remove('timer-flash-active', 'timer-flash-done');
      flashedThresholds.clear();
      return;
    }
    if (countingUpAfterCD) return;
    if (seconds === 0) {
      if (!flashedThresholds.has('zero')) { flashedThresholds.add('zero'); triggerFlash(true); }
      return;
    }
    for (const ws of getWarnSecondsArray()) {
      if (seconds <= ws && !flashedThresholds.has(ws) && countdownTotal > ws) {
        flashedThresholds.add(ws); triggerFlash(false); break;
      }
    }
  }

  function updateDisplay() {
    if (!$display) return;
    const m = Math.floor(Math.abs(seconds) / 60);
    const s = Math.abs(seconds) % 60;
    $display.textContent = `${m}:${s.toString().padStart(2, '0')}`;
  }

  function renderWarnings() {
    const list = ids.warnListId ? document.getElementById(ids.warnListId) : null;
    if (!list) return;
    list.innerHTML = '';
    warningEntries.forEach((entry, i) => {
      const row = document.createElement('div');
      row.className = 'warn-entry-row';
      row.innerHTML = `
        <input type="number" value="${entry.value}" min="1" max="9999" class="warn-val-input" data-i="${i}">
        <label><input type="radio" name="wu_${ids.cardId}_${i}" value="s" class="warn-unit-input" data-i="${i}" ${entry.unit==='s'?'checked':''}> s</label>
        <label><input type="radio" name="wu_${ids.cardId}_${i}" value="m" class="warn-unit-input" data-i="${i}" ${entry.unit==='m'?'checked':''}> min</label>
        <button class="warn-remove-btn" data-i="${i}" title="Remove">✕</button>
      `;
      list.appendChild(row);
    });
    list.querySelectorAll('.warn-val-input').forEach(inp => {
      inp.addEventListener('change', () => { warningEntries[+inp.dataset.i].value = parseInt(inp.value) || 1; });
    });
    list.querySelectorAll('.warn-unit-input').forEach(inp => {
      inp.addEventListener('change', () => { warningEntries[+inp.dataset.i].unit = inp.value; });
    });
    list.querySelectorAll('.warn-remove-btn').forEach(btn => {
      btn.addEventListener('click', () => { warningEntries.splice(+btn.dataset.i, 1); renderWarnings(); });
    });
  }

  function start() {
    if (mode === 'down' && seconds === 0 && !countingUpAfterCD) {
      const mins = $minInput ? parseInt($minInput.value) || 0 : 0;
      const secs = $secInput ? parseInt($secInput.value) || 0 : 0;
      countdownTotal = mins * 60 + secs;
      seconds = countdownTotal;
      if (seconds <= 0) return;
    }
    running = true;
    if ($startBtn) $startBtn.textContent = 'Pause';
    interval = setInterval(() => {
      if (mode === 'up' || countingUpAfterCD) {
        seconds++;
      } else {
        seconds--;
        if (seconds <= 0) {
          seconds = 0;
          updateDisplay();
          updateFlash();
          const countUpAfterEl = ids.countupAfterId ? document.getElementById(ids.countupAfterId) : null;
          if (countUpAfterEl && countUpAfterEl.checked) {
            countingUpAfterCD = true;
          } else {
            stop();
            if ($startBtn) $startBtn.textContent = 'Start';
            running = false;
          }
          return;
        }
      }
      updateDisplay();
      updateFlash();
    }, 1000);
    updateDisplay();
    updateFlash();
  }

  function pause() {
    clearInterval(interval); interval = null; running = false;
    if ($startBtn) $startBtn.textContent = 'Start';
  }

  function stop() {
    clearInterval(interval); interval = null; running = false; countingUpAfterCD = false;
  }

  function reset() {
    stop();
    flashedThresholds.clear();
    if ($startBtn) $startBtn.textContent = 'Start';
    if (mode === 'down') {
      const mins = $minInput ? parseInt($minInput.value) || 0 : 0;
      const secs = $secInput ? parseInt($secInput.value) || 0 : 0;
      seconds = mins * 60 + secs;
    } else {
      seconds = 0;
    }
    if ($card) $card.classList.remove('timer-flash-active', 'timer-flash-done');
    updateDisplay();
  }

  function bind() {
    $card            = ids.cardId            ? document.getElementById(ids.cardId) : null;
    $display         = ids.displayId         ? document.getElementById(ids.displayId) : null;
    $startBtn        = ids.startBtnId        ? document.getElementById(ids.startBtnId) : null;
    $resetBtn        = ids.resetBtnId        ? document.getElementById(ids.resetBtnId) : null;
    $toggleHeader    = ids.toggleHeaderId    ? document.getElementById(ids.toggleHeaderId) : null;
    $toggleIcon      = ids.toggleIconId      ? document.getElementById(ids.toggleIconId) : null;
    $body            = ids.bodyId            ? document.getElementById(ids.bodyId) : null;
    $countdownInputs = ids.countdownInputsId ? document.getElementById(ids.countdownInputsId) : null;
    $minInput        = ids.minId             ? document.getElementById(ids.minId) : null;
    $secInput        = ids.secId             ? document.getElementById(ids.secId) : null;

    if ($toggleHeader) {
      $toggleHeader.addEventListener('click', () => {
        const expanded = $body.classList.toggle('expanded');
        if ($toggleIcon) $toggleIcon.textContent = expanded ? '▲ Hide' : '▼ Show';
        if (!expanded) reset();
      });
    }

    document.querySelectorAll(`input[name="${ids.modeRadioName}"]`).forEach(radio => {
      radio.addEventListener('change', () => {
        mode = radio.value;
        const isDown = mode === 'down';
        if ($countdownInputs) $countdownInputs.classList.toggle('hidden', !isDown);
        const warnSection = ids.warnSectionId ? document.getElementById(ids.warnSectionId) : null;
        if (warnSection) warnSection.classList.toggle('hidden', !isDown);
        const countupRow = ids.countupRowId ? document.getElementById(ids.countupRowId) : null;
        if (countupRow) countupRow.classList.toggle('hidden', !isDown);
        if ($card) $card.classList.remove('timer-flash-active', 'timer-flash-done');
        flashedThresholds.clear();
        stop(); seconds = 0; updateDisplay();
        if ($startBtn) $startBtn.textContent = 'Start';
        running = false;
      });
    });

    if ($startBtn) $startBtn.addEventListener('click', () => { if (running) pause(); else start(); });
    if ($resetBtn) $resetBtn.addEventListener('click', reset);

    [ids.minId, ids.secId].forEach(inputId => {
      if (!inputId) return;
      const inp = document.getElementById(inputId);
      if (!inp) return;
      inp.addEventListener('input', () => {
        if (inp.value !== '' && inp.value.includes('.')) {
          inp.value = Math.floor(parseFloat(inp.value));
          const warn = ids.decimalWarnId ? document.getElementById(ids.decimalWarnId) : null;
          if (warn) {
            warn.style.display = '';
            clearTimeout(inp._decWarnTimer);
            inp._decWarnTimer = setTimeout(() => { warn.style.display = 'none'; }, 2500);
          }
        }
      });
    });

    const addWarnBtn = ids.addWarnBtnId ? document.getElementById(ids.addWarnBtnId) : null;
    if (addWarnBtn) addWarnBtn.addEventListener('click', () => { warningEntries.push({value:30,unit:'s'}); renderWarnings(); });

    renderWarnings();
    updateDisplay();
  }

  return {
    start, pause, stop, reset, bind,
    get $startBtn()    { return $startBtn; },
    get $resetBtn()    { return $resetBtn; },
    get $toggleHeader(){ return $toggleHeader; },
  };
}

// ════════════════════════════════════════════════
//  INSTRUCTOR SETTINGS
// ════════════════════════════════════════════════
const SETTINGS_KEY = 'panel-instructor-settings';

function loadSettings() {
  let s = {};
  try { s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}'); } catch(e) {}
  const roster               = document.getElementById('settings-roster');
  const panelUrl             = document.getElementById('settings-panel-url');
  const counselUrl           = document.getElementById('settings-counsel-url');
  const plotterUrl           = document.getElementById('settings-plotter-url');
  const qfCount              = document.getElementById('settings-qf-count');
  const researchAlgorithmUrl   = document.getElementById('settings-research-algorithm-url');
  const researchCaseUrl        = document.getElementById('settings-research-case-url');
  const researchLegislativeUrl = document.getElementById('settings-research-legislative-url');
  if (roster                 && s.roster                 !== undefined) roster.value                 = s.roster;
  if (panelUrl               && s.panelUrl)                             panelUrl.value               = s.panelUrl;
  if (counselUrl             && s.counselUrl)                           counselUrl.value             = s.counselUrl;
  if (plotterUrl             && s.plotterUrl)                           plotterUrl.value             = s.plotterUrl;
  if (qfCount                && s.qfCount                !== undefined) qfCount.value                = s.qfCount;
  if (researchAlgorithmUrl   && s.researchAlgorithmUrl)                 researchAlgorithmUrl.value   = s.researchAlgorithmUrl;
  if (researchCaseUrl        && s.researchCaseUrl)                      researchCaseUrl.value        = s.researchCaseUrl;
  if (researchLegislativeUrl && s.researchLegislativeUrl)               researchLegislativeUrl.value = s.researchLegislativeUrl;
  // Plotter exercise settings are loaded from Firebase via plotterApplyConfig() in plotterStartListener()
}

function saveSettings() {
  const s = {
    roster:               document.getElementById('settings-roster')?.value                   ?? '',
    panelUrl:             document.getElementById('settings-panel-url')?.value                ?? SHEET_CSV_URL,
    counselUrl:           document.getElementById('settings-counsel-url')?.value              ?? '',
    plotterUrl:           document.getElementById('settings-plotter-url')?.value              ?? '',
    qfCount:              document.getElementById('settings-qf-count')?.value                 ?? '9',
    researchAlgorithmUrl:    document.getElementById('settings-research-algorithm-url')?.value    ?? '',
    researchCaseUrl:         document.getElementById('settings-research-case-url')?.value         ?? '',
    researchLegislativeUrl:  document.getElementById('settings-research-legislative-url')?.value  ?? '',
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

let panelTimer;

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

  panelTimer.reset();
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
    panelTimer.stop();
    showScreen('setup');
  });

  $groupPrevBtn.addEventListener('click', () => {
    if (currentGroupIndex > 0) {
      panelTimer.reset();
      $qaDrawnArea.innerHTML = '';
      currentGroupIndex--;
      renderGroupView(currentGroupIndex);
      updateGroupNav();
    }
  });
  $groupNextBtn.addEventListener('click', () => {
    if (currentGroupIndex < groups.length - 1) {
      panelTimer.reset();
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

  const $viewAllQBtn = document.getElementById('view-all-q-btn');
  const $allQModal   = document.getElementById('all-q-modal');
  const $allQModalClose = document.getElementById('all-q-modal-close');

  if ($viewAllQBtn) $viewAllQBtn.addEventListener('click', () => { renderAllQuestionsModal(); openModal($allQModal); });
  if ($allQModalClose) $allQModalClose.addEventListener('click', () => closeModal($allQModal));
  if ($allQModal) $allQModal.addEventListener('click', e => { if (e.target === $allQModal) closeModal($allQModal); });

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
//  PANEL EXERCISE — HELP + SETTINGS
// ════════════════════════════════════════════════
function openSettings() { openModal(document.getElementById('settings-modal')); }
function closeSettings() { closeModal(document.getElementById('settings-modal')); }

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
    btn.addEventListener('click', () => { renderHelpModal(); openModal($helpModal); });
  });
  $helpModalClose.addEventListener('click', () => closeModal($helpModal));
  $helpModal.addEventListener('click', e => { if (e.target === $helpModal) closeModal($helpModal); });

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
    // Escape closes the topmost open modal and restores focus — fires even from inputs
    if (e.key === 'Escape') {
      const open = document.querySelector('.modal-overlay.open');
      if (open) { closeModal(open); return; }
    }

    const tag = e.target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

    // ── Global shortcuts (fire on every screen) ──
    if (e.key === 's' || e.key === 'S') { openSettings(); return; }
    if (e.key === 'm' || e.key === 'M') { showHomeScreen(); return; }

    // ── Home screen shortcuts ──
    const onHome = !document.getElementById('home-screen').classList.contains('hidden');
    if (e.key === '1' && onHome) { showPanelApp(); return; }
    if (e.key === '2' && onHome) { showCounselApp(); return; }

    if (e.key === '?') { renderHelpModal(); openModal($helpModal); return; }

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
        if (e.key === 'f' || e.key === 'F') { counselTimer.$startBtn?.click(); return; }
        if (e.key === 'g' || e.key === 'G') { counselTimer.$resetBtn?.click(); return; }
        if (e.key === 't' || e.key === 'T') { counselTimer.$toggleHeader?.click(); return; }
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
    else if ((e.key === 't' || e.key === 'T') && onMod) { panelTimer.$toggleHeader?.click(); }
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
    else if ((e.key === 'f' || e.key === 'F') && onMod) { panelTimer.$startBtn?.click(); }
    else if ((e.key === 'g' || e.key === 'G') && onMod) { panelTimer.$resetBtn?.click(); }

    if ((e.key === 'q' || e.key === 'Q') && onSetup) { quickFill(); }
    else if ((e.key === 'w' || e.key === 'W') && onSetup) { quickFillAndStart(); }
    else if (e.key === 'Enter' && onSetup) { e.preventDefault(); $startPanelBtn.click(); }
    else if ((e.key === 'a' || e.key === 'A') && onSetup) { document.getElementById('advanced-toggle-header').click(); }

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
  // Settings modal tabs
  document.querySelectorAll('.settings-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const targetId = 'stab-' + tab.dataset.tab;
      document.querySelectorAll('.settings-tab').forEach(t => {
        t.classList.toggle('active', t === tab);
        t.setAttribute('aria-selected', t === tab ? 'true' : 'false');
      });
      document.querySelectorAll('.settings-tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.id === targetId);
      });
    });
  });

  document.getElementById('advanced-toggle-header').addEventListener('click', () => {
    const body = document.getElementById('advanced-body');
    const icon = document.getElementById('advanced-toggle-icon');
    const expanded = body.classList.toggle('expanded');
    icon.textContent = expanded ? '▲ Hide' : '▼ Show';
  });

  document.getElementById('panel-roster-toggle-header').addEventListener('click', () => {
    const body = document.getElementById('panel-roster-body');
    const icon = document.getElementById('panel-roster-toggle-icon');
    const expanded = body.classList.toggle('expanded');
    icon.textContent = expanded ? '▲ Hide' : '▼ Show';
  });

  document.getElementById('counsel-roster-toggle-header').addEventListener('click', () => {
    const body = document.getElementById('counsel-roster-body');
    const icon = document.getElementById('counsel-roster-toggle-icon');
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

  const settingsResearchAlgorithmUrl = document.getElementById('settings-research-algorithm-url');
  if (settingsResearchAlgorithmUrl) settingsResearchAlgorithmUrl.addEventListener('input', saveSettings);

  const settingsResearchCaseUrl = document.getElementById('settings-research-case-url');
  if (settingsResearchCaseUrl) settingsResearchCaseUrl.addEventListener('input', saveSettings);

  const settingsResearchLegislativeUrl = document.getElementById('settings-research-legislative-url');
  if (settingsResearchLegislativeUrl) settingsResearchLegislativeUrl.addEventListener('input', saveSettings);

  const settingsQfBtn = document.getElementById('settings-qf-btn');
  if (settingsQfBtn) settingsQfBtn.addEventListener('click', settingsQuickFill);

  const settingsQfCount = document.getElementById('settings-qf-count');
  if (settingsQfCount) settingsQfCount.addEventListener('input', saveSettings);
  // Note: plotter data now comes from Firebase (not a CSV URL)
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
let counselScenarioAssignments = [];
let counselScenariosAssigned = false;

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
    const res = await fetch(url, { signal: controller.signal });
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

async function counselAssignScenarios() {
  const $warnNames     = document.getElementById('counsel-warn-no-names');
  const $warnScenarios = document.getElementById('counsel-warn-no-scenarios');
  $warnNames.classList.remove('show');
  $warnScenarios.classList.remove('show');

  const names = parseCounselNames();
  if (!names.length) { $warnNames.classList.add('show'); return; }

  if (SCENARIOS.length === 0) {
    await counselLoadCSV();
    if (SCENARIOS.length === 0) return;
  }

  const shuffled = shuffle(SCENARIOS);
  counselScenarioAssignments = names.map((name, i) => ({
    name,
    scenario: shuffled[i % shuffled.length],
  }));
  counselScenariosAssigned = true;
  renderCounselAssignments();
}

function renderCounselAssignments() {
  const display = document.getElementById('counsel-scenarios-display');
  if (!display) return;
  display.innerHTML = '';
  if (!counselScenarioAssignments.length) return;

  display.style.marginTop = '18px';
  counselScenarioAssignments.forEach(({ name, scenario }) => {
    const row = document.createElement('div');
    row.className = 'group-member';
    row.innerHTML = `<div class="group-member-name">${escHtml(name)}</div>
                     <div class="group-member-prompt">${escHtml(scenario.title)}</div>`;
    display.appendChild(row);
  });
}

async function counselStart() {
  const names = parseCounselNames();
  if (names.length === 0) { alert('Please enter at least one name.'); return; }

  if (counselScenariosAssigned && counselScenarioAssignments.length) {
    nameQueue     = counselScenarioAssignments.map(a => a.name);
    scenarioQueue = counselScenarioAssignments.map(a => a.scenario);
    lastNames     = [...nameQueue];
  } else {
    const $warn = document.getElementById('counsel-warn-no-scenarios');
    if ($warn) $warn.classList.add('show');
    if (SCENARIOS.length === 0) {
      await counselLoadCSV();
      if (SCENARIOS.length === 0) return;
    }
    ensureQueues(names);
  }
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
    ? DOMPurify.sanitize(marked.parse(entry.risks))
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
  counselTimer.stop();
  counselHistory = [];
  counselHistoryIndex = -1;
  nameQueue = [];
  scenarioQueue = shuffle(SCENARIOS);
  lastNames = [];
  counselScenarioAssignments = [];
  counselScenariosAssigned = false;
  const display = document.getElementById('counsel-scenarios-display');
  if (display) display.innerHTML = '';
  document.getElementById('counsel-warn-no-scenarios')?.classList.remove('show');
  document.getElementById('counsel-warn-no-names')?.classList.remove('show');
  document.getElementById('counsel-mod').classList.remove('active');
  document.getElementById('counsel-setup').classList.add('active');
  document.getElementById('counsel-names').focus();
}

// ════════════════════════════════════════════════
//  COUNSEL EXERCISE — TIMER
// ════════════════════════════════════════════════
let counselTimer;

// ════════════════════════════════════════════════
//  3D PLOTTER
// ════════════════════════════════════════════════

// ── Firebase config ──────────────────────────────
const FIREBASE_CONFIG = {
  apiKey:            'AIzaSyB7YIYmoH58UDQog_G7R9tlDvIMotuGtmM',
  authDomain:        'ai-law-lab.firebaseapp.com',
  databaseURL:       'https://ai-law-lab-default-rtdb.firebaseio.com',
  projectId:         'ai-law-lab',
  storageBucket:     'ai-law-lab.firebasestorage.app',
  messagingSenderId: '766455788338',
  appId:             '1:766455788338:web:82fdc54aff559b25c75d2b',
};
const _fbApp = firebase.initializeApp(FIREBASE_CONFIG);
const _fbDB  = firebase.database();

// ── Generic exercise config helpers ──────────────
// Any exercise can call these to push/receive live config via Firebase.
//   saveExerciseConfig('plotter', { words, axisX, axisY, axisZ })
//   onExerciseConfig('plotter', config => { ... })
async function saveExerciseConfig(exercise, config) {
  await _fbDB.ref(`configs/${exercise}`).set(config);
}
function onExerciseConfig(exercise, callback) {
  _fbDB.ref(`configs/${exercise}`).on('value', snap => callback(snap.val() || {}));
}

// ── Plotter state ─────────────────────────────────
let plotterInitialized = false;
let plotterData        = [];
let plotterCamera      = null;
let plotterUiRevision  = 'init';
let _plotterListener   = null;
let plotterConfig      = { words: [], axisX: 'Female', axisY: 'Alive', axisZ: 'Royal' };

// ── Helpers ──────────────────────────────────────
function plotterSnap(v) { return Math.round(v * 10) / 10; }

function plotterSetLive(connected) {
  const dot   = document.getElementById('plotter-live-dot');
  const label = document.getElementById('plotter-live-label');
  if (dot)   dot.style.background   = connected ? '#22c55e' : '#f87171';
  if (label) label.textContent      = connected ? 'Live' : 'Disconnected';
  if (label) label.style.color      = connected ? '#22c55e' : '#f87171';
}

// ── Firebase listener (instructor view) ──────────
function plotterStartListener() {
  if (_plotterListener) return;           // already attached
  plotterSetStatus('loading', 'Connecting…');

  const ref = _fbDB.ref('plotter');
  _plotterListener = ref.on('value', snapshot => {
    plotterSetLive(true);
    const raw = snapshot.val() || {};
    const points = Object.values(raw).map(r => ({
      name: String(r.word ?? r.name ?? '').trim() || '(unnamed)',
      x: plotterSnap(Number(r.x)),
      y: plotterSnap(Number(r.y)),
      z: plotterSnap(Number(r.z)),
    })).filter(p =>
      !isNaN(p.x) && !isNaN(p.y) && !isNaN(p.z) &&
      p.x >= 0 && p.x <= 1 && p.y >= 0 && p.y <= 1 && p.z >= 0 && p.z <= 1
    );
    plotterData = points;
    plotterSetStats(`Submissions : ${Object.keys(raw).length}\nValid points : ${points.length}`);
    plotterSetStatus('ok', points.length === 0 ? 'No submissions yet.' : `Showing ${points.length} point${points.length !== 1 ? 's' : ''}.`);
    plotterRender(points);
  }, err => {
    plotterSetLive(false);
    plotterSetStatus('error', `Firebase error: ${err.message}`);
  });

  // connectivity indicator
  _fbDB.ref('.info/connected').on('value', snap => plotterSetLive(!!snap.val()));

  // live config (axis labels + word list)
  onExerciseConfig('plotter', cfg => plotterApplyConfig(cfg));
}

async function plotterHandleClear() {
  if (!confirm('Delete all submissions from Firebase? This cannot be undone.')) return;
  try {
    await _fbDB.ref('plotter').remove();
  } catch (err) {
    alert(`Could not clear: ${err.message}`);
  }
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
    xLabel: plotterConfig.axisX || 'X',
    yLabel: plotterConfig.axisY || 'Y',
    zLabel: plotterConfig.axisZ || 'Z',
  };
}

// Apply config to the panel label spans and the settings inputs
function plotterApplyConfig(cfg) {
  plotterConfig = { ...plotterConfig, ...cfg };
  // Side-panel read-only labels
  const lx = document.getElementById('plotter-label-x');
  const ly = document.getElementById('plotter-label-y');
  const lz = document.getElementById('plotter-label-z');
  if (lx) lx.textContent = plotterConfig.axisX;
  if (ly) ly.textContent = plotterConfig.axisY;
  if (lz) lz.textContent = plotterConfig.axisZ;
  // Settings inputs (keep in sync so instructor sees current values on open)
  const sx = document.getElementById('settings-plotter-label-x');
  const sy = document.getElementById('settings-plotter-label-y');
  const sz = document.getElementById('settings-plotter-label-z');
  if (sx && sx !== document.activeElement) sx.value = plotterConfig.axisX;
  if (sy && sy !== document.activeElement) sy.value = plotterConfig.axisY;
  if (sz && sz !== document.activeElement) sz.value = plotterConfig.axisZ;
  // Settings word textarea
  const sw = document.getElementById('settings-plotter-words');
  if (sw && sw !== document.activeElement && Array.isArray(plotterConfig.words)) {
    sw.value = plotterConfig.words.join('\n');
  }
  if (plotterInitialized) plotterReRender();
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

function plotterBuildQR() {
  const submitUrl  = window.location.origin + window.location.pathname + '?submit';
  const qrUrl      = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(submitUrl)}`;
  const img        = document.getElementById('plotter-qr-img');
  const loading    = document.getElementById('plotter-qr-loading');
  const linkInput  = document.getElementById('plotter-student-link');
  if (linkInput) linkInput.value = submitUrl;
  if (img) {
    img.src = qrUrl;
    img.onload  = () => { img.style.display = 'block'; if (loading) loading.style.display = 'none'; };
    img.onerror = () => { if (loading) loading.textContent = 'QR unavailable (offline?)'; };
  }
}

function bindPlotterEvents() {
  document.getElementById('plotter-btn-clear')?.addEventListener('click', plotterHandleClear);

  // Copy link button
  document.getElementById('plotter-btn-copy-link')?.addEventListener('click', () => {
    const url = document.getElementById('plotter-student-link')?.value
             || window.location.origin + window.location.pathname + '?submit';
    navigator.clipboard.writeText(url).then(() => {
      const btn = document.getElementById('plotter-btn-copy-link');
      const orig = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });
  });

  // Axis checkboxes re-render
  ['plotter-show-labels','plotter-axis-x','plotter-axis-y','plotter-axis-z'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', plotterReRender);
  });

  // ── Settings: Quick Fill word list ───────────────
  const PLOTTER_WORD_BANK = [
    'King','Queen','Prince','Princess','Frog','Crown','Wedding',
    'Apple','Dog','Cat','Doctor','Nurse','Hospital','Ghost',
    'Angel','Virus','Library','Love','Algorithm',
  ];
  document.getElementById('settings-plotter-qf-btn')?.addEventListener('click', () => {
    const countEl  = document.getElementById('settings-plotter-qf-count');
    const count    = Math.min(Math.max(1, parseInt(countEl?.value) || 10), PLOTTER_WORD_BANK.length);
    const shuffled = [...PLOTTER_WORD_BANK].sort(() => Math.random() - 0.5).slice(0, count);
    const ta       = document.getElementById('settings-plotter-words');
    if (ta) ta.value = shuffled.join('\n');
  });

  // ── Settings: Save & Push plotter config ─────────
  document.getElementById('settings-plotter-save')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('settings-plotter-save-status');
    const words = (document.getElementById('settings-plotter-words')?.value ?? '')
      .split('\n').map(w => w.trim()).filter(Boolean);
    const axisX = document.getElementById('settings-plotter-label-x')?.value.trim() || 'X';
    const axisY = document.getElementById('settings-plotter-label-y')?.value.trim() || 'Y';
    const axisZ = document.getElementById('settings-plotter-label-z')?.value.trim() || 'Z';
    if (statusEl) statusEl.textContent = 'Saving…';
    try {
      await saveExerciseConfig('plotter', { words, axisX, axisY, axisZ });
      if (statusEl) { statusEl.textContent = '✓ Pushed to students'; setTimeout(() => { statusEl.textContent = ''; }, 3000); }
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error: ${err.message}`;
    }
  });

  // ── Student submit view ──────────────────────────
  if (new URLSearchParams(window.location.search).has('submit')) {
    plotterInitSubmitView();
  }
}

// ── localStorage helpers for per-student submission tracking ──
function submitGetDone(studentName) {
  try { return JSON.parse(localStorage.getItem(`plotter_done_${studentName}`) || '[]'); } catch { return []; }
}
function submitMarkDone(studentName, word) {
  const done = submitGetDone(studentName);
  if (!done.includes(word)) { done.push(word); localStorage.setItem(`plotter_done_${studentName}`, JSON.stringify(done)); }
}

function plotterInitSubmitView() {
  // Show only the submit overlay
  document.querySelectorAll('#home-screen, #panel-app, #plotter-app, #counsel-app, #research-app').forEach(el => el.classList.add('hidden'));
  document.getElementById('plotter-submit-view').classList.remove('hidden');

  // Slider live readout
  ['x','y','z'].forEach(axis => {
    const slider = document.getElementById(`submit-field-${axis}`);
    const val    = document.getElementById(`submit-val-${axis}`);
    if (slider && val) slider.addEventListener('input', () => { val.textContent = slider.value; });
  });

  // When name changes, refresh the random button hint
  document.getElementById('submit-field-student')?.addEventListener('input', submitUpdateWordHint);

  // Random word button
  document.getElementById('submit-btn-random')?.addEventListener('click', () => {
    const studentName = document.getElementById('submit-field-student')?.value.trim();
    const words = plotterConfig.words || [];
    if (!words.length) return;
    const done      = studentName ? submitGetDone(studentName) : [];
    const available = words.filter(w => !done.includes(w));
    const pool      = available.length ? available : words;   // fallback: ignore done list if all exhausted
    const pick      = pool[Math.floor(Math.random() * pool.length)];
    const sel       = document.getElementById('submit-field-word');
    if (sel) sel.value = pick;
    submitUpdateWordHint();
  });

  // Live config from Firebase — populates dropdown + axis labels
  onExerciseConfig('plotter', cfg => {
    plotterConfig = { ...plotterConfig, ...cfg };
    // Axis labels
    ['x','y','z'].forEach(a => {
      const el = document.getElementById(`submit-label-${a}`);
      if (el) el.textContent = plotterConfig[`axis${a.toUpperCase()}`] || a.toUpperCase();
    });
    // Word dropdown
    const sel   = document.getElementById('submit-field-word');
    const words = Array.isArray(cfg.words) ? cfg.words : [];
    if (sel) {
      const current = sel.value;
      sel.innerHTML = words.length
        ? words.map(w => `<option value="${escHtml(w)}">${escHtml(w)}</option>`).join('')
        : '<option value="">— waiting for word list —</option>';
      if (current && words.includes(current)) sel.value = current;
    }
    submitUpdateWordHint();
  });

  // Form submit
  document.getElementById('plotter-submit-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl   = document.getElementById('plotter-submit-error');
    const btn     = document.getElementById('plotter-submit-btn');
    const student = document.getElementById('submit-field-student').value.trim();
    const word    = document.getElementById('submit-field-word').value;
    const x       = parseFloat(document.getElementById('submit-field-x').value);
    const y       = parseFloat(document.getElementById('submit-field-y').value);
    const z       = parseFloat(document.getElementById('submit-field-z').value);

    errEl.classList.add('hidden'); errEl.textContent = '';
    if (!student) { errEl.textContent = 'Please enter your name.'; errEl.classList.remove('hidden'); return; }
    if (!word)    { errEl.textContent = 'Please select a word.';   errEl.classList.remove('hidden'); return; }

    btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      await _fbDB.ref('plotter').push({ name: student, word, x, y, z, ts: Date.now() });
      submitMarkDone(student, word);
      // Inline confirmation — keep the form visible
      const confirmEl = document.getElementById('plotter-submit-confirm-text');
      const successEl = document.getElementById('plotter-submit-success');
      if (confirmEl) confirmEl.textContent = `"${word}" submitted!`;
      if (successEl) successEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'Submit';
      // Reset word picker and sliders for the next submission
      ['x','y','z'].forEach(a => {
        document.getElementById(`submit-field-${a}`).value = '0.5';
        document.getElementById(`submit-val-${a}`).textContent = '0.5';
      });
      submitUpdateWordHint();
      // Auto-hide confirmation after 3 s
      setTimeout(() => successEl?.classList.add('hidden'), 3000);
    } catch (err) {
      errEl.textContent = `Submit failed: ${err.message}`;
      errEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'Submit';
    }
  });
}

function submitUpdateWordHint() {
  const hintEl      = document.getElementById('submit-word-hint');
  if (!hintEl) return;
  const studentName = document.getElementById('submit-field-student')?.value.trim();
  const words       = plotterConfig.words || [];
  if (!words.length || !studentName) { hintEl.textContent = ''; return; }
  const done      = submitGetDone(studentName);
  const remaining = words.filter(w => !done.includes(w)).length;
  hintEl.textContent = done.length
    ? `${remaining} word${remaining !== 1 ? 's' : ''} remaining (${done.length} already submitted)`
    : '';
}

// ════════════════════════════════════════════════
//  RESEARCH EXERCISE
// ════════════════════════════════════════════════
const RESEARCH_INSTRUCTIONS = {
  algorithm: '',
  case: '',
  legislative: '',
};

function researchSelectedType() {
  const checked = document.querySelector('input[name="research-type"]:checked');
  return checked ? checked.value : null;
}

function researchUpdateTypeUI() {
  const type = researchSelectedType();
  const subtitle = document.getElementById('research-header-subtitle');
  const placeholder = document.getElementById('research-instructions-placeholder');
  const content = document.getElementById('research-instructions-content');
  const assignBtn = document.getElementById('research-assign-btn');

  if (!type) {
    if (subtitle) subtitle.textContent = 'Select an exercise type';
    if (placeholder) placeholder.style.display = '';
    if (content) content.style.display = 'none';
    if (assignBtn) assignBtn.disabled = true;
    return;
  }

  const labels = { algorithm: 'Algorithm Research', case: 'Case Research', legislative: 'Legislative Research' };
  if (subtitle) subtitle.textContent = labels[type];

  const instructions = RESEARCH_INSTRUCTIONS[type];
  if (instructions) {
    if (placeholder) placeholder.style.display = 'none';
    if (content) { content.style.display = ''; content.innerHTML = marked.parse(instructions); }
  } else {
    if (placeholder) { placeholder.style.display = ''; placeholder.textContent = 'Instructions will appear here.'; }
    if (content) content.style.display = 'none';
  }

  if (assignBtn) assignBtn.disabled = false;
  document.getElementById('research-results').innerHTML = '';
  document.getElementById('research-status').textContent = '';
}

function researchParseNames(raw) {
  return raw.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
}

async function researchAssign() {
  const type = researchSelectedType();
  if (!type) {
    document.getElementById('research-status').textContent = 'Please select an exercise type first.';
    return;
  }

  const names = researchParseNames(document.getElementById('research-names').value);
  if (!names.length) {
    document.getElementById('research-status').textContent = 'Enter at least one student name.';
    return;
  }

  const urlId = type === 'algorithm' ? 'settings-research-algorithm-url'
              : type === 'case'      ? 'settings-research-case-url'
              :                        'settings-research-legislative-url';
  const url = document.getElementById(urlId)?.value?.trim();
  if (!url) {
    document.getElementById('research-status').textContent = 'No CSV URL configured. Add one in Settings ⚙.';
    return;
  }

  const statusEl = document.getElementById('research-status');
  const resultsEl = document.getElementById('research-results');
  const assignBtn = document.getElementById('research-assign-btn');
  statusEl.textContent = 'Loading…';
  resultsEl.innerHTML = '';
  assignBtn.disabled = true;

  try {
    const rows = await new Promise((resolve, reject) => {
      Papa.parse(url, {
        download: true,
        header: true,
        skipEmptyLines: true,
        complete: r => resolve(r.data),
        error: e => reject(e),
      });
    });

    if (!rows.length) {
      statusEl.textContent = 'The sheet appears to be empty.';
      assignBtn.disabled = false;
      return;
    }

    const shuffledRows = shuffle(rows);
    const headers = Object.keys(rows[0]);

    const assignments = names.map((name, i) => ({
      name,
      row: shuffledRows[i % shuffledRows.length],
    }));

    statusEl.textContent = '';
    resultsEl.innerHTML = assignments.map(({ name, row }) => `
      <div class="research-result-card">
        <div class="research-result-name">${escHtml(name)}</div>
        <div class="research-result-row">
          ${headers.map(h => row[h] ? `<div class="research-result-cell"><span class="research-cell-label">${escHtml(h)}</span><span class="research-cell-value">${escHtml(row[h])}</span></div>` : '').join('')}
        </div>
      </div>
    `).join('');
  } catch (err) {
    statusEl.textContent = 'Could not load the sheet. Make sure the URL is published as CSV.';
  }

  assignBtn.disabled = false;
}

function bindResearchEvents() {
  document.querySelectorAll('input[name="research-type"]').forEach(radio => {
    radio.addEventListener('change', researchUpdateTypeUI);
  });
  researchUpdateTypeUI();
}

// ════════════════════════════════════════════════
//  TOKEN EXPLORER
// ════════════════════════════════════════════════
const TOKEN_PROXY_URL = 'https://ai-law-lab-token-explorer.nickhafen.workers.dev';

let tokenInitialized = false;
let tokenConfig = { model: 'google/gemma-4-26b-a4b-it:free', temperature: 0.7, altCount: 5 };
let tokenResults = []; // [{ token, logprob, top_logprobs: [{token, logprob}, ...] }]

function tokenApplyConfig(cfg) {
  tokenConfig = { ...tokenConfig, ...cfg };

  const modelEl = document.getElementById('token-model');
  const tempEl  = document.getElementById('token-temperature');
  const tempVal = document.getElementById('token-temperature-val');
  const altEl   = document.getElementById('token-alt-count');
  if (modelEl && modelEl !== document.activeElement) modelEl.value = tokenConfig.model;
  if (tempEl && tempEl !== document.activeElement) { tempEl.value = tokenConfig.temperature; if (tempVal) tempVal.textContent = tokenConfig.temperature; }
  if (altEl && altEl !== document.activeElement) altEl.value = tokenConfig.altCount;

  const sModelEl = document.getElementById('settings-token-model');
  const sTempEl  = document.getElementById('settings-token-temperature');
  const sAltEl   = document.getElementById('settings-token-alt-count');
  if (sModelEl && sModelEl !== document.activeElement) sModelEl.value = tokenConfig.model;
  if (sTempEl && sTempEl !== document.activeElement) sTempEl.value = tokenConfig.temperature;
  if (sAltEl && sAltEl !== document.activeElement) sAltEl.value = tokenConfig.altCount;
}

function tokenSetStatus(text, isError) {
  const el = document.getElementById('token-status-text');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error', !!isError);
}

async function tokenGenerate() {
  const promptEl = document.getElementById('token-prompt');
  const prompt = (promptEl?.value ?? '').trim();
  if (!prompt) { tokenSetStatus('Enter a prompt first.', true); return; }

  const model = document.getElementById('token-model')?.value || tokenConfig.model;
  const temperature = Number(document.getElementById('token-temperature')?.value ?? tokenConfig.temperature);
  const altCount = Number(document.getElementById('token-alt-count')?.value ?? tokenConfig.altCount);

  const btn = document.getElementById('token-generate-btn');
  if (btn) btn.disabled = true;
  tokenSetStatus('Generating…');
  document.getElementById('token-output-card').style.display = 'none';
  document.getElementById('token-alts-card').style.display = 'none';

  try {
    const res = await fetch(TOKEN_PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        top_logprobs: altCount,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.error || `Request failed (${res.status})`);

    const content = data?.choices?.[0]?.logprobs?.content;
    if (!Array.isArray(content) || content.length === 0) {
      throw new Error('This model did not return token probabilities.');
    }
    tokenResults = content;
    tokenRenderOutput();
    tokenSetStatus('');
  } catch (err) {
    tokenSetStatus(`Error: ${err.message}`, true);
  } finally {
    if (btn) btn.disabled = false;
  }
}

// Below ~85% confidence, tint the token from yellow toward red as confidence drops.
// Confident tokens (the vast majority in fluent text) stay unhighlighted so the
// uncertain ones — the pedagogically interesting ones — stand out.
function tokenConfidenceColor(prob) {
  const clamped = Math.min(1, Math.max(0, prob));
  if (clamped >= 0.85) return null;
  const t = 1 - clamped / 0.85; // 0 = just under threshold, 1 = totally uncertain
  const hue = 50 - 50 * t; // 50° yellow → 0° red
  const lightness = 88 - 26 * t; // 88% → 62%
  return `hsla(${hue}, 85%, ${lightness}%, ${0.4 + 0.35 * t})`;
}

function tokenRenderOutput() {
  const out = document.getElementById('token-output');
  if (!out) return;
  out.innerHTML = '';
  tokenResults.forEach((t, i) => {
    const prob = Math.exp(t.logprob);
    const span = document.createElement('span');
    span.className = 'token-pill';
    span.textContent = t.token;
    const bg = tokenConfidenceColor(prob);
    if (bg) span.style.backgroundColor = bg;
    span.title = `${Math.round(prob * 100)}% likely`;
    span.addEventListener('click', () => tokenShowAlternatives(i));
    span.addEventListener('mouseenter', () => tokenShowAlternatives(i));
    out.appendChild(span);
  });
  document.getElementById('token-output-card').style.display = '';
}

function tokenShowAlternatives(index) {
  document.querySelectorAll('#token-output .token-pill').forEach((el, i) => {
    el.classList.toggle('active', i === index);
  });

  const t = tokenResults[index];
  const alts = Array.isArray(t.top_logprobs) ? [...t.top_logprobs] : [];
  alts.sort((a, b) => b.logprob - a.logprob);

  document.getElementById('token-alts-word').textContent = t.token.trim() || t.token;
  const list = document.getElementById('token-alts-list');
  list.innerHTML = '';
  const maxProb = alts.length ? Math.exp(alts[0].logprob) : 1;
  alts.forEach(alt => {
    const prob = Math.exp(alt.logprob);
    const row = document.createElement('div');
    row.className = 'token-alt-row';
    row.innerHTML = `
      <span class="token-alt-label">${(alt.token || '').trim() || alt.token}</span>
      <span class="token-alt-bar-track"><span class="token-alt-bar-fill" style="width:${Math.max(2, (prob / maxProb) * 100)}%;"></span></span>
      <span class="token-alt-pct">${(prob * 100).toFixed(1)}%</span>
    `;
    list.appendChild(row);
  });
  document.getElementById('token-alts-card').style.display = '';
}

function bindTokenEvents() {
  document.getElementById('token-generate-btn')?.addEventListener('click', tokenGenerate);

  const tempEl = document.getElementById('token-temperature');
  const tempVal = document.getElementById('token-temperature-val');
  tempEl?.addEventListener('input', () => { if (tempVal) tempVal.textContent = tempEl.value; });

  document.getElementById('settings-token-save')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('settings-token-save-status');
    const model = document.getElementById('settings-token-model')?.value || tokenConfig.model;
    const temperature = Number(document.getElementById('settings-token-temperature')?.value ?? tokenConfig.temperature);
    const altCount = Number(document.getElementById('settings-token-alt-count')?.value ?? tokenConfig.altCount);
    if (statusEl) statusEl.textContent = 'Saving…';
    try {
      await saveExerciseConfig('tokenExplorer', { model, temperature, altCount });
      if (statusEl) { statusEl.textContent = '✓ Pushed to students'; setTimeout(() => { statusEl.textContent = ''; }, 3000); }
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error: ${err.message}`;
    }
  });
}

// ════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════
window.addEventListener('DOMContentLoaded', () => {
  panelTimer = createTimer({
    cardId: 'timer-card', displayId: 'timer-display',
    startBtnId: 'timer-start-btn', resetBtnId: 'timer-reset-btn',
    toggleHeaderId: 'timer-toggle-header', toggleIconId: 'timer-toggle-icon',
    bodyId: 'timer-body', countdownInputsId: 'timer-countdown-inputs',
    minId: 'timer-min', secId: 'timer-sec',
    warnSectionId: 'timer-warnings-section', warnListId: 'timer-warnings-list',
    addWarnBtnId: 'add-warning-btn', countupRowId: 'timer-countup-row',
    countupAfterId: 'timer-countup-after', decimalWarnId: 'timer-decimal-warn',
    modeRadioName: 'timer-mode',
  });
  counselTimer = createTimer({
    cardId: 'counsel-timer-card', displayId: 'counsel-timer-display',
    startBtnId: 'counsel-timer-start-btn', resetBtnId: 'counsel-timer-reset-btn',
    toggleHeaderId: 'counsel-timer-toggle-header', toggleIconId: 'counsel-timer-toggle-icon',
    bodyId: 'counsel-timer-body', countdownInputsId: 'counsel-timer-countdown-inputs',
    minId: 'counsel-timer-min', secId: 'counsel-timer-sec',
    warnSectionId: 'counsel-timer-warnings-section', warnListId: 'counsel-timer-warnings-list',
    addWarnBtnId: 'counsel-add-warning-btn', countupRowId: 'counsel-timer-countup-row',
    countupAfterId: 'counsel-timer-countup-after', decimalWarnId: 'counsel-timer-decimal-warn',
    modeRadioName: 'counsel-timer-mode',
  });

  bindSetupEvents();
  bindModEvents();
  panelTimer.bind();
  counselTimer.bind();
  bindHelpEvents();
  bindAdvancedEvents();
  bindKeyboardShortcuts();
  bindPlotterEvents();
  bindResearchEvents();
  bindTokenEvents();

  document.getElementById('counsel-assign-btn')?.addEventListener('click', counselAssignScenarios);

  loadSettings();

  // Bind next/prev nav buttons on counsel mod screen
  document.getElementById('counsel-next-btn').addEventListener('click', counselNextResult);
  document.getElementById('counsel-prev-btn').addEventListener('click', counselPrevResult);

  // Bind View All Scenarios modal
  const $counselAllModal      = document.getElementById('counsel-all-modal');
  const $counselAllModalClose = document.getElementById('counsel-all-modal-close');
  const $counselViewAllBtn    = document.getElementById('counsel-view-all-btn');
  if ($counselViewAllBtn) $counselViewAllBtn.addEventListener('click', () => { renderCounselScenariosModal(); openModal($counselAllModal); });
  if ($counselAllModalClose) $counselAllModalClose.addEventListener('click', () => closeModal($counselAllModal));
  if ($counselAllModal) $counselAllModal.addEventListener('click', e => { if (e.target === $counselAllModal) closeModal($counselAllModal); });
});
