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
  document.getElementById('citation-app').classList.add('hidden');
  document.getElementById('home-screen').classList.remove('hidden');
}

function showPlotterApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
  document.getElementById('token-app').classList.add('hidden');
  document.getElementById('citation-app').classList.add('hidden');
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
  document.getElementById('citation-app').classList.add('hidden');
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
  document.getElementById('citation-app').classList.add('hidden');
  document.getElementById('token-app').classList.remove('hidden');
  if (!tokenInitialized) {
    tokenInitialized = true;
    onExerciseConfig('tokenExplorer', tokenApplyConfig);
  }
}

function showCitationApp() {
  document.getElementById('home-screen').classList.add('hidden');
  document.getElementById('panel-app').classList.add('hidden');
  document.getElementById('counsel-app').classList.add('hidden');
  document.getElementById('plotter-app').classList.add('hidden');
  document.getElementById('research-app').classList.add('hidden');
  document.getElementById('token-app').classList.add('hidden');
  document.getElementById('citation-app').classList.remove('hidden');
  if (!citationInitialized) {
    citationInitialized = true;
    citeStartListener();
    citeBuildQR();
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

// ── CSV export (shared by the archiving exercises) ──
function csvCell(value) {
  const str = String(value ?? '');
  // A leading =, +, - or @ makes Excel treat the cell as a formula.
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function csvRow(values) {
  return values.map(csvCell).join(',');
}

// Hands the browser a finished file. The BOM keeps Excel from mangling UTF-8.
function csvDownload(filename, header, rows) {
  const blob = new Blob([`﻿${header}\n${rows.join('\n')}\n`], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function csvDateStamp() {
  return new Date().toISOString().slice(0, 10);
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
  const onToken   = !document.getElementById('token-app').classList.contains('hidden');
  const onCites   = !document.getElementById('citation-app').classList.contains('hidden');
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
  show('help-section-token',         onToken);
  show('help-section-citations',     onCites);
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

    // ── Citation-only shortcuts ──
    if (!document.getElementById('citation-app').classList.contains('hidden')) {
      if (e.key === 'g' || e.key === 'G') { document.getElementById('cite-group-dupes')?.click(); return; }
      if (e.key === 'd' || e.key === 'D') { citeSetDemoMode(!citeDemoMode); return; }
      return;
    }

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
// Same split as the citations exercise, both under the permitted `plotter`
// path: clearing the board archives the round instead of destroying it, and
// the export reads live and archive together.
//   plotter/live/{pushId}
//   plotter/archive/{sessionId}/{records,axes,archivedAt}
const PLOTTER_LIVE_PATH    = 'plotter/live';
const PLOTTER_ARCHIVE_PATH = 'plotter/archive';

let plotterInitialized = false;
let plotterData        = [];
let plotterCamera      = null;
let plotterUiRevision  = 'init';
let _plotterListener   = null;
let plotterConfig      = { words: [], axisX: 'Female', axisY: 'Alive', axisZ: 'Royal' };
let plotterDemoMode    = false;   // showing simulated data instead of live submissions
let plotterLiveCount   = 0;       // raw submission count from Firebase
let _plotterDemoPoints = null;    // generated once, then cached

// ── Sample data ───────────────────────────────────
// Lets the plotter work as a standalone visual when nobody is submitting.
// Each word is a simulated class: a centroid plus per-axis spread, so words a
// class would argue about (Crown's gender, Doctor's gender, Ghost's aliveness,
// Wedding generally) scatter while King/Queen stay tight.
const PLOTTER_DEMO_AXES  = { axisX: 'Female', axisY: 'Alive', axisZ: 'Royal' };
const PLOTTER_DEMO_WORDS = [
  //  word          centroid [x,y,z]        spread [x,y,z]        n
  { word: 'King',     c: [0.05, 0.75, 0.95], s: [0.06, 0.18, 0.06], n: 11 },
  { word: 'Queen',    c: [0.95, 0.75, 0.95], s: [0.06, 0.18, 0.06], n: 11 },
  { word: 'Prince',   c: [0.08, 0.85, 0.90], s: [0.07, 0.12, 0.08], n:  8 },
  { word: 'Princess', c: [0.93, 0.85, 0.90], s: [0.07, 0.12, 0.08], n:  8 },
  { word: 'Crown',    c: [0.50, 0.05, 0.97], s: [0.20, 0.07, 0.04], n:  9 },
  { word: 'Wedding',  c: [0.65, 0.35, 0.35], s: [0.18, 0.25, 0.22], n:  9 },
  { word: 'Frog',     c: [0.45, 0.90, 0.10], s: [0.15, 0.10, 0.12], n:  8 },
  { word: 'Doctor',   c: [0.35, 0.95, 0.10], s: [0.22, 0.06, 0.09], n: 10 },
  { word: 'Nurse',    c: [0.80, 0.95, 0.08], s: [0.16, 0.06, 0.07], n: 10 },
  { word: 'Ghost',    c: [0.45, 0.15, 0.15], s: [0.12, 0.22, 0.13], n:  9 },
  { word: 'Angel',    c: [0.60, 0.55, 0.30], s: [0.18, 0.28, 0.20], n:  9 },
];

// Far enough back that the cube and its axis titles both fit the viewport.
const PLOTTER_FITTED_CAMERA = { eye: { x: 1.6, y: 1.6, z: 1.2 } };

// ── Helpers ──────────────────────────────────────
function plotterSnap(v) { return Math.round(v * 10) / 10; }

// Seeded PRNG (mulberry32) so the sample cloud looks identical every session.
function plotterDemoRng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simulated submissions: jittered around each centroid, then snapped to the
// same 0.1 slider steps a real student is limited to.
function plotterDemoPoints() {
  if (_plotterDemoPoints) return _plotterDemoPoints;
  const rand  = plotterDemoRng(20250820);
  const gauss = () => (rand() + rand() + rand() + rand() - 2) / 0.5774;
  const jitter = (c, s) => Math.min(1, Math.max(0, plotterSnap(c + gauss() * s)));
  const pts = [];
  for (const w of PLOTTER_DEMO_WORDS) {
    for (let i = 0; i < w.n; i++) {
      pts.push({
        name: w.word,
        x: jitter(w.c[0], w.s[0]),
        y: jitter(w.c[1], w.s[1]),
        z: jitter(w.c[2], w.s[2]),
      });
    }
  }
  _plotterDemoPoints = pts;
  return pts;
}

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

  const ref = _fbDB.ref(PLOTTER_LIVE_PATH);
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
    plotterData      = points;
    plotterLiveCount = Object.keys(raw).length;
    if (plotterDemoMode) { plotterShowDemoStatus(); return; }  // keep the sample view on screen
    plotterShowLiveStatus();
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

// Clearing moves the round into the archive instead of destroying it, so the
// plot can be emptied between classes while the export still sees everything.
async function plotterHandleClear() {
  const count = plotterLiveCount;
  if (!count) { alert('There are no submissions on the plot to clear.'); return; }
  if (!confirm(`Archive these ${count} submission${count !== 1 ? 's' : ''} and clear the plot?\n\nThey stay in the export — this is not a delete.`)) return;

  const btn = document.getElementById('plotter-btn-clear');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const snap    = await _fbDB.ref(PLOTTER_LIVE_PATH).once('value');
    const records = snap.val() || {};
    if (Object.keys(records).length) {
      const sessionId = new Date().toISOString().replace(/[.:]/g, '-');
      await _fbDB.ref(`${PLOTTER_ARCHIVE_PATH}/${sessionId}`).set({
        archivedAt: Date.now(),
        // The ratings only mean something alongside the axes they were made on.
        axes: { x: plotterConfig.axisX || '', y: plotterConfig.axisY || '', z: plotterConfig.axisZ || '' },
        records,
      });
    }
    await _fbDB.ref(PLOTTER_LIVE_PATH).remove();
    // The listener repaints an empty plot on the way out — land the
    // confirmation after it, or its own status message overwrites this one.
    setTimeout(() => plotterSetStatus('ok', `Archived ${count} submission${count !== 1 ? 's' : ''}. Plot cleared.`), 300);
  } catch (err) {
    alert(`Could not clear: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✕ Clear'; }
  }
}

// ── Export ───────────────────────────────────────
// Every rating ever collected — the plot plus every archived round — with the
// axis labels each round was rated against.
function plotterCsvRow(sessionLabel, axes, rec) {
  return csvRow([
    sessionLabel, axes.x || '', axes.y || '', axes.z || '',
    rec.name ?? '', rec.word ?? '', rec.x ?? '', rec.y ?? '', rec.z ?? '',
    rec.ts ? new Date(Number(rec.ts)).toISOString() : '',
  ]);
}

async function plotterHandleExport() {
  const btn = document.getElementById('plotter-btn-export');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  plotterSetStatus('loading', 'Building export…');
  try {
    const [liveSnap, archiveSnap] = await Promise.all([
      _fbDB.ref(PLOTTER_LIVE_PATH).once('value'),
      _fbDB.ref(PLOTTER_ARCHIVE_PATH).once('value'),
    ]);

    const header = csvRow(['session', 'axis_x', 'axis_y', 'axis_z', 'student', 'word', 'x', 'y', 'z', 'submitted_at']);
    const rows   = [];

    const archive = archiveSnap.val() || {};
    for (const sessionId of Object.keys(archive).sort()) {
      const session = archive[sessionId] || {};
      for (const rec of Object.values(session.records || {})) {
        rows.push(plotterCsvRow(sessionId, session.axes || {}, rec));
      }
    }
    const liveAxes = { x: plotterConfig.axisX, y: plotterConfig.axisY, z: plotterConfig.axisZ };
    for (const rec of Object.values(liveSnap.val() || {})) {
      rows.push(plotterCsvRow('current', liveAxes, rec));
    }

    if (!rows.length) { plotterSetStatus('ok', 'Nothing to export yet.'); return; }

    csvDownload(`word-plotter-${csvDateStamp()}.csv`, header, rows);
    plotterSetStatus('ok', `Exported ${rows.length} submission${rows.length !== 1 ? 's' : ''}.`);
  } catch (err) {
    plotterSetStatus('error', `Export failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⤓ Export'; }
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
  // Sample data only makes sense on its own axes, so it overrides the live config.
  const src = plotterDemoMode ? PLOTTER_DEMO_AXES : plotterConfig;
  return {
    xOn:    document.getElementById('plotter-axis-x')?.checked ?? true,
    yOn:    document.getElementById('plotter-axis-y')?.checked ?? false,
    zOn:    document.getElementById('plotter-axis-z')?.checked ?? false,
    xLabel: src.axisX || 'X',
    yLabel: src.axisY || 'Y',
    zLabel: src.axisZ || 'Z',
  };
}

// Side-panel read-only axis labels
function plotterUpdateAxisLabels() {
  const src = plotterDemoMode ? PLOTTER_DEMO_AXES : plotterConfig;
  const lx = document.getElementById('plotter-label-x');
  const ly = document.getElementById('plotter-label-y');
  const lz = document.getElementById('plotter-label-z');
  if (lx) lx.textContent = src.axisX;
  if (ly) ly.textContent = src.axisY;
  if (lz) lz.textContent = src.axisZ;
}

// Apply config to the panel label spans and the settings inputs
function plotterApplyConfig(cfg) {
  plotterConfig = { ...plotterConfig, ...cfg };
  plotterUpdateAxisLabels();
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
  // Plotly's default eye (1.25 each) fills the whole viewport with zero margins,
  // which pushes the axis titles off-screen. Pull back so they always fit.
  // uirevision keeps whatever the instructor has rotated to, so handing Plotly
  // the fitted camera on every render only sets the starting and reset view.
  scene.camera = camera || PLOTTER_FITTED_CAMERA;
  return {
    scene,
    paper_bgcolor: col.paper, plot_bgcolor: col.plot,
    font: { color: col.font, family: 'Segoe UI, system-ui, sans-serif' },
    margin: { l: 0, r: 0, t: 0, b: 0 },
    showlegend: true,
    // Legend top-left, modebar stacked vertically top-right — otherwise the two
    // collide in the same corner and the plot controls sit on top of the words.
    legend: {
      x: 0.01, xanchor: 'left', y: 0.99, yanchor: 'top',
      font: { color: col.fontBright, size: 11 },
      bgcolor: col.axisPane, bordercolor: col.grid, borderwidth: 1,
    },
    modebar: {
      orientation: 'v',
      bgcolor: 'rgba(0,0,0,0)', color: col.font, activecolor: col.fontBright,
    },
    uirevision: plotterUiRevision,
    hoverlabel: { bgcolor: col.axisPane, bordercolor: col.grid, font: { color: col.fontBright, size: 12 } },
  };
}

function plotterRender(points) {
  const plotEl = document.getElementById('plotter-plot');
  if (!plotEl) return;

  // Plotly 2.35 never re-enables a 3D axis title once that axis has been drawn
  // with visible:false — ticks and grid come back, the title stays gone. Since
  // the plotter starts with Y and Z off, "Alive" and "Royal" would never appear.
  // Rebuilding the plot whenever the visible-axis set changes is the only fix
  // through the public API; the tracked camera is passed back in, so the
  // instructor's viewing angle survives the rebuild.
  const ax       = plotterAxisSettings();
  const axisKey  = `${ax.xOn}|${ax.yOn}|${ax.zOn}`;
  const rebuild  = !!plotEl._plotterAxisKey && plotEl._plotterAxisKey !== axisKey;
  if (rebuild) {
    Plotly.purge(plotEl);
    plotEl._plotterCamAttached = false;
  }
  plotEl._plotterAxisKey = axisKey;

  // Plotly's own "reset to default" jumps to an eye of 1.25, the zoomed-in view
  // that clips the axis titles — the panel's Reset view button replaces it.
  Plotly.react(plotEl, plotterBuildTraces(points), plotterBuildLayout(plotterCamera),
    { responsive: true, displaylogo: false,
      modeBarButtonsToRemove: ['toImage', 'resetCameraDefault3d', 'resetCameraLastSave3d'] });
  if (!plotEl._plotterCamAttached) {
    plotEl.on('plotly_relayout', event => {
      const cam = event['scene.camera'];
      if (cam) plotterCamera = cam;
    });
    plotEl._plotterCamAttached = true;
  }
}

// Back to the framing where the whole cube and all three axis titles are visible.
// Goes through relayout because uirevision makes Plotly ignore a camera handed
// to react once the instructor has dragged the scene.
function plotterResetView() {
  const plotEl = document.getElementById('plotter-plot');
  plotterCamera = JSON.parse(JSON.stringify(PLOTTER_FITTED_CAMERA));
  if (plotEl && plotEl._fullLayout) Plotly.relayout(plotEl, { 'scene.camera': plotterCamera });
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

function plotterShowLiveStatus() {
  plotterSetStats(`Submissions : ${plotterLiveCount}\nValid points : ${plotterData.length}`);
  plotterSetStatus('ok', plotterData.length === 0
    ? 'No submissions yet.'
    : `Showing ${plotterData.length} point${plotterData.length !== 1 ? 's' : ''}.`);
}

function plotterShowDemoStatus() {
  const pts   = plotterDemoPoints();
  const words = new Set(pts.map(p => p.name)).size;
  plotterSetStats(
    `Sample points : ${pts.length}\nWords         : ${words}` +
    (plotterLiveCount > 0 ? `\nLive (hidden) : ${plotterLiveCount}` : '')
  );
  plotterSetStatus('ok', `Sample data — ${pts.length} simulated plots. Live submissions hidden.`);
}

// Toggle between live Firebase submissions and the built-in sample cloud.
function plotterSetDemoMode(on) {
  plotterDemoMode = on;
  const btn = document.getElementById('plotter-btn-demo');
  if (btn) {
    btn.textContent = on ? '◉ Show live submissions' : '▦ Show sample data';
    btn.setAttribute('aria-pressed', String(on));
    btn.style.color       = on ? 'var(--accent)' : 'var(--muted)';
    btn.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
  }
  document.getElementById('plotter-demo-badge')?.classList.toggle('hidden', !on);
  plotterUpdateAxisLabels();
  if (on) {
    plotterShowDemoStatus();
    plotterRender(plotterDemoPoints());
  } else {
    plotterShowLiveStatus();
    plotterRender(plotterData);
  }
}

function plotterReRender() {
  const pts = plotterDemoMode ? plotterDemoPoints() : plotterData;
  if (pts.length > 0) plotterRender(pts);
}

function plotterBuildQR() {
  // Named form of the parameter — bare `?submit` still routes here, so links
  // and QR codes handed out before the citations exercise existed keep working.
  const submitUrl  = window.location.origin + window.location.pathname + '?submit=plotter';
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
  document.getElementById('plotter-btn-export')?.addEventListener('click', plotterHandleExport);

  // Sample-data toggle
  document.getElementById('plotter-btn-demo')?.addEventListener('click', () => {
    plotterSetDemoMode(!plotterDemoMode);
  });

  // Copy link button
  document.getElementById('plotter-btn-copy-link')?.addEventListener('click', () => {
    const url = document.getElementById('plotter-student-link')?.value
             || window.location.origin + window.location.pathname + '?submit=plotter';
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

  document.getElementById('plotter-btn-reset-view')?.addEventListener('click', plotterResetView);

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

}

// ── Student submit routing ─────────────────────────
// `?submit` is the shared entry point for every student-facing form. The bare
// parameter stays with the plotter so QR codes and links printed before the
// citations exercise existed keep working.
function bindSubmitRouter() {
  const params = new URLSearchParams(window.location.search);
  if (!params.has('submit')) return;
  const which = (params.get('submit') || '').trim().toLowerCase();
  if (which === 'citations' || which === 'citation') citeInitSubmitView();
  else plotterInitSubmitView();
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
      await _fbDB.ref(PLOTTER_LIVE_PATH).push({ name: student, word, x, y, z, ts: Date.now() });
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
//  HALLUCINATED CITATIONS
// ════════════════════════════════════════════════
// Students invent a case citation for a case that does not exist. The class's
// submissions are collected anonymously and then broken apart: reporters,
// courts, and years collapse onto a handful of repeated values because those
// parts follow patterns, while case names almost never repeat.
//
// Firebase layout, all under the single permitted `citations` path:
//   citations/live/{pushId}                  — the class currently on screen
//   citations/archive/{sessionId}/records    — every class cleared before it
//   citations/archive/{sessionId}/{prompt,archivedAt}
// Clearing archives rather than deletes, so the export can aggregate every
// round ever run without the instructor having to remember to save first.
const CITE_LIVE_PATH    = 'citations/live';
const CITE_ARCHIVE_PATH = 'citations/archive';

// Shown when the instructor hasn't set a prompt of their own.
const CITE_DEFAULT_PROMPT = 'Make up a citation for a case that does not exist. Fill in every part, as you would if you were citing a real one.';

// Field order is Bluebook order — it drives the form, the assembled citation,
// and the part cards, so adding a part means touching this list and the markup.
const CITE_PARTS = [
  { key: 'caption',  label: 'Case name'  },
  { key: 'volume',   label: 'Volume'     },
  { key: 'reporter', label: 'Reporter'   },
  { key: 'page',     label: 'First page' },
  { key: 'court',    label: 'Court'      },
  { key: 'year',     label: 'Year'       },
];
const CITE_MAXLEN = { caption: 120, volume: 8, reporter: 40, page: 8, court: 40, year: 8, student: 60 };

// The student's name rides along with the record but is deliberately not a
// CITE_PART: it is never assembled into the citation, never broken into a part
// card, and never drawn on the projected board — it exists for the CSV export
// so the instructor can tell who submitted what.
const CITE_STUDENT_KEY = 'student';

let citationInitialized = false;
let citeData         = [];     // normalized live submissions, oldest first
let citeLiveCount    = 0;      // raw record count from Firebase
let citeDemoMode     = false;  // showing the simulated class instead of live submissions
let citeConfig       = { prompt: '' };
let _citeListener    = null;
let _citeSeenIds     = null;   // null until the first render, so a full load doesn't flash

function citePrompt() {
  return citeConfig.prompt || CITE_DEFAULT_PROMPT;
}

// Live config from Firebase — the instructor's prompt, pushed from ⚙ Exercises.
// Runs on both the instructor view and every open student form.
function citeApplyConfig(cfg) {
  citeConfig = { ...citeConfig, ...cfg };
  const prompt = citePrompt();

  const projected = document.getElementById('cite-prompt-text');
  if (projected) projected.textContent = prompt;

  const onForm = document.getElementById('cite-submit-instructions');
  if (onForm) onForm.textContent = prompt;

  // Keep the settings textarea in step, but never yank text out from under
  // an instructor who is mid-edit.
  const box = document.getElementById('settings-cite-prompt');
  if (box && box !== document.activeElement) {
    box.value = citeConfig.prompt || '';
    citeUpdatePromptCount();
  }
}

function citeUpdatePromptCount() {
  const box = document.getElementById('settings-cite-prompt');
  const out = document.getElementById('settings-cite-count');
  if (box && out) out.textContent = `${box.value.length} / 400 characters`;
}

// ── Sample data ───────────────────────────────────
// A simulated class, so the exercise can be rehearsed with nobody submitting.
// Deliberately shaped like real results: every case name is unique, while the
// reporters, courts, and years pile onto a few familiar values.
const CITE_DEMO_RECORDS = [
  ['Hartley v. Brennan',            '412', 'F.3d',        '118', '9th Cir.',  '2004'],
  ['Marston v. Delgado',            '287', 'F.3d',        '551', '2d Cir.',   '2002'],
  ['United States v. Coyle',        '533', 'U.S.',        '204', 'U.S.',      '2001'],
  ['Whitfield v. Ramsey',           '119', 'F. Supp. 2d', '442', 'S.D.N.Y.',  '2010'],
  ['Ellison v. Vance',              '764', 'F.3d',        '89',  '10th Cir.', '2015'],
  ['Barlow v. Ridgeway Holdings',   '221', 'P.3d',        '1032','Utah',      '2010'],
  ['State v. Pruitt',               '318', 'F.3d',        '77',  '9th Cir.',  '1996'],
  ['Cardoza v. Fenwick',            '605', 'F.3d',        '1145','9th Cir.',  '2010'],
  ['Ingram v. Sutter County',       '478', 'U.S.',        '331', 'U.S.',      '1986'],
  ['Delacroix v. Meridian Bank',    '92',  'F. Supp. 2d', '210', 'D. Utah',   '1999'],
  ['Okafor v. Trellis Systems',     '831', 'F.3d',        '664', '10th Cir.', '2015'],
  ['Nunley v. Ashcombe',            '145', 'P.3d',        '509', 'Utah',      '2006'],
  ['Rivera v. Halloran',            '299', 'F.3d',        '1201','2d Cir.',   '2002'],
  ['Weatherby v. Colston',          '514', 'U.S.',        '87',  'U.S.',      '1995'],
  ['Aldridge v. Pemberton Mills',   '673', 'F.3d',        '412', '9th Cir.',  '2012'],
  ['In re Kessler Estate',          '208', 'P.3d',        '918', 'Utah',      '2018'],
  ['Salazar v. Grantham',           '387', 'F. Supp. 2d', '55',  'S.D.N.Y.',  '2005'],
  ['Bristow v. Kaneko',             '752', 'F.3d',        '229', '2d Cir.',   '2015'],
  ['Tavares v. Milbank County',     '166', 'P.3d',        '744', 'Utah',      '2007'],
  ['Fenton v. Aurora Logistics',    '941', 'F.3d',        '1077','9th Cir.',  '2019'],
  ['United States v. Marchetti',    '461', 'U.S.',        '612', 'U.S.',      '2010'],
  ['Halstead v. Verity Health',     '327', 'F. Supp. 2d', '881', 'D. Utah',   '2004'],
  ['Quinlan v. Broadmoor Trust',    '588', 'F.3d',        '340', '10th Cir.', '2012'],
  ['Ferrand v. Oakes',              '134', 'P.3d',        '62',  'Utah',      '2005'],
];

let _citeDemoRecords = null;
function citeDemoRecords() {
  if (_citeDemoRecords) return _citeDemoRecords;
  // Spread the timestamps a minute apart so "newest first" has something to sort.
  const base = Date.now() - CITE_DEMO_RECORDS.length * 60000;
  _citeDemoRecords = CITE_DEMO_RECORDS.map((row, i) => ({
    id: `demo-${i}`,
    caption: row[0], volume: row[1], reporter: row[2],
    page: row[3], court: row[4], year: row[5],
    ts: base + i * 60000,
  }));
  return _citeDemoRecords;
}

// ── Helpers ──────────────────────────────────────
function citeClean(value, key) {
  return String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, CITE_MAXLEN[key] || 120);
}

// Firebase record → display record. Anything with no parts at all is dropped.
function citeNormalize(id, raw) {
  if (!raw || typeof raw !== 'object') return null;
  const rec = { id, ts: Number(raw.ts) || 0 };
  rec[CITE_STUDENT_KEY] = citeClean(raw[CITE_STUDENT_KEY], CITE_STUDENT_KEY);
  for (const part of CITE_PARTS) rec[part.key] = citeClean(raw[part.key], part.key);
  return CITE_PARTS.some(p => rec[p.key]) ? rec : null;
}

// Assembles the parts into a citation: name, then volume/reporter/page, then
// court and year in parentheses. Missing parts are simply left out.
function citeFormat(rec) {
  const middle = [rec.volume, rec.reporter, rec.page].filter(Boolean).join(' ');
  const paren  = [rec.court, rec.year].filter(Boolean).join(' ');
  let rest = '';
  if (middle) rest += `, ${middle}`;
  if (paren)  rest += `${middle ? ' ' : ', '}(${paren})`;
  if (rest)   rest += '.';
  return { name: rec.caption, rest };
}

function citeGroupValues(values) {
  const counts = new Map();
  for (const v of values) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function citeRecords() {
  return citeDemoMode ? citeDemoRecords() : citeData;
}

function citeSetLive(connected) {
  const dot   = document.getElementById('cite-live-dot');
  const label = document.getElementById('cite-live-label');
  if (dot)   dot.style.background = connected ? '#22c55e' : '#f87171';
  if (label) {
    label.textContent = connected ? 'Live' : 'Disconnected';
    label.style.color = connected ? '#22c55e' : '#f87171';
  }
}

function citeSetStatus(type, message) {
  const el = document.getElementById('cite-status-text');
  if (el) { el.className = `plotter-status-text ${type}`; el.textContent = message; }
}



// ── Firebase listener (instructor view) ──────────
function citeStartListener() {
  if (_citeListener) return;
  // Draw the empty scaffold first, so the projected screen shows the list and
  // the six part cards even if Firebase never answers.
  citeRender();
  citeSetStatus('loading', 'Connecting…');

  const ref = _fbDB.ref(CITE_LIVE_PATH);
  _citeListener = ref.on('value', snapshot => {
    citeSetLive(true);
    const raw = snapshot.val() || {};
    citeData = Object.entries(raw)
      .map(([id, rec]) => citeNormalize(id, rec))
      .filter(Boolean)
      .sort((a, b) => a.ts - b.ts);
    citeLiveCount = Object.keys(raw).length;
    citeRender();
  }, err => {
    citeSetLive(false);
    citeSetStatus('error', `Firebase error: ${err.message}`);
  });

  _fbDB.ref('.info/connected').on('value', snap => citeSetLive(!!snap.val()));
}

// Clearing moves the round into the archive instead of destroying it, so the
// board can be emptied between classes while the export still sees everything.
async function citeHandleClear() {
  const count = citeData.length;
  if (!count) { alert('There are no citations on the board to clear.'); return; }
  if (!confirm(`Archive these ${count} citation${count !== 1 ? 's' : ''} and clear the board?\n\nThey stay in the export — this is not a delete.`)) return;

  const btn = document.getElementById('cite-btn-clear');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  try {
    const snap    = await _fbDB.ref(CITE_LIVE_PATH).once('value');
    const records = snap.val() || {};
    if (Object.keys(records).length) {
      const sessionId = new Date().toISOString().replace(/[.:]/g, '-');
      await _fbDB.ref(`${CITE_ARCHIVE_PATH}/${sessionId}`).set({
        archivedAt: Date.now(),
        prompt:     citePrompt(),
        records,
      });
    }
    await _fbDB.ref(CITE_LIVE_PATH).remove();
    // The listener repaints an empty board on the way out — land the
    // confirmation after it, or its own status message overwrites this one.
    setTimeout(() => citeSetStatus('ok', `Archived ${count} citation${count !== 1 ? 's' : ''}. Board cleared.`), 300);
  } catch (err) {
    alert(`Could not clear: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '✕ Clear'; }
  }
}

// ── Export ───────────────────────────────────────
// One CSV of every citation ever collected — the board plus every archived
// round — so results can be aggregated across classes and semesters.
function citeCsvRow(sessionLabel, prompt, rec) {
  return csvRow([
    sessionLabel, prompt,
    // Rounds archived before the form asked for a name have no student field.
    rec[CITE_STUDENT_KEY] ?? '',
    ...CITE_PARTS.map(p => rec[p.key] ?? ''),
    rec.ts ? new Date(Number(rec.ts)).toISOString() : '',
  ]);
}

async function citeHandleExport() {
  const btn = document.getElementById('cite-btn-export');
  if (btn) { btn.disabled = true; btn.textContent = '…'; }
  citeSetStatus('loading', 'Building export…');
  try {
    const [liveSnap, archiveSnap] = await Promise.all([
      _fbDB.ref(CITE_LIVE_PATH).once('value'),
      _fbDB.ref(CITE_ARCHIVE_PATH).once('value'),
    ]);

    const header = csvRow(['session', 'prompt', 'Student', ...CITE_PARTS.map(p => p.label), 'submitted_at']);
    const rows = [];

    // Archived rounds first, oldest session first, then the current board.
    const archive = archiveSnap.val() || {};
    for (const sessionId of Object.keys(archive).sort()) {
      const session = archive[sessionId] || {};
      for (const rec of Object.values(session.records || {})) {
        rows.push(citeCsvRow(sessionId, session.prompt || '', rec));
      }
    }
    for (const rec of Object.values(liveSnap.val() || {})) {
      rows.push(citeCsvRow('current', citePrompt(), rec));
    }

    if (!rows.length) {
      citeSetStatus('ok', 'Nothing to export yet.');
      return;
    }

    csvDownload(`hallucinated-citations-${csvDateStamp()}.csv`, header, rows);
    citeSetStatus('ok', `Exported ${rows.length} citation${rows.length !== 1 ? 's' : ''}.`);
  } catch (err) {
    citeSetStatus('error', `Export failed: ${err.message}`);
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '⤓ Export'; }
  }
}

// ── Rendering ────────────────────────────────────
function citeRender() {
  const records    = citeRecords();
  const newestFirst = document.getElementById('cite-newest-first')?.checked ?? true;
  const ordered    = newestFirst ? [...records].reverse() : [...records];
  citeRenderList(ordered);
  citeRenderParts(ordered);
  

  const countEl = document.getElementById('cite-count');
  if (countEl) countEl.textContent = `${records.length} submitted`;

  if (citeDemoMode) {
    citeSetStatus('ok', `Sample data — ${records.length} simulated citations. Live submissions hidden.`);
  } else {
    citeSetStatus('ok', records.length === 0
      ? 'No submissions yet.'
      : `Showing ${records.length} citation${records.length !== 1 ? 's' : ''}.`);
  }
}

function citeRenderList(records) {
  const list = document.getElementById('cite-list');
  if (!list) return;
  list.innerHTML = '';

  if (!records.length) {
    const empty = document.createElement('div');
    empty.className = 'cite-empty';
    empty.textContent = 'Waiting for the first citation…';
    list.appendChild(empty);
    _citeSeenIds = citeDemoMode ? _citeSeenIds : new Set();
    return;
  }

  // Flash only what arrived since the last render — never on the first load,
  // which would set the whole screen blinking when the app opens.
  const firstRender = _citeSeenIds === null;
  const seen        = _citeSeenIds || new Set();

  for (const rec of records) {
    const { name, rest } = citeFormat(rec);
    const item = document.createElement('div');
    item.className = 'cite-item';
    if (!firstRender && !citeDemoMode && !seen.has(rec.id)) item.classList.add('is-new');

    const nameEl = document.createElement('span');
    nameEl.className = 'cite-item-name';
    nameEl.textContent = name;
    const restEl = document.createElement('span');
    restEl.className = 'cite-item-rest';
    restEl.textContent = rest;

    item.appendChild(nameEl);
    item.appendChild(restEl);
    list.appendChild(item);
  }

  // Demo records must not poison the seen set, or every live submission would
  // flash again the moment sample mode is switched off.
  if (!citeDemoMode) _citeSeenIds = new Set(records.map(r => r.id));
}

function citeRenderParts(records) {
  const wrap = document.getElementById('cite-parts');
  if (!wrap) return;
  const grouped = document.getElementById('cite-group-dupes')?.checked ?? true;
  citeHideTooltip();
  _citeHoverRow = null;
  wrap.innerHTML = '';

  for (const part of CITE_PARTS) {
    const present  = records.filter(r => r[part.key]);
    const values   = present.map(r => r[part.key]);
    const distinct = new Set(values).size;

    const card = document.createElement('div');
    card.className = 'cite-part-card';

    const head = document.createElement('div');
    head.className = 'cite-part-head';
    head.textContent = part.label;
    card.appendChild(head);

    const body = document.createElement('div');
    body.className = 'cite-part-values';
    if (!values.length) {
      const empty = document.createElement('div');
      empty.className = 'cite-part-value';
      empty.style.color = 'var(--muted)';
      empty.textContent = '—';
      body.appendChild(empty);
    } else if (grouped) {
      for (const { value, count } of citeGroupValues(values)) {
        const row = document.createElement('div');
        row.className = 'cite-part-value has-records';
        // Every submission this value came from, for the hover tooltip.
        row._citeRecords = present.filter(r => r[part.key] === value);
        const text = document.createElement('span');
        text.textContent = value;
        row.appendChild(text);
        if (count > 1) {
          const badge = document.createElement('span');
          badge.className = 'cite-part-count';
          badge.textContent = `×${count}`;
          row.appendChild(badge);
        }
        body.appendChild(row);
      }
    } else {
      for (const rec of present) {
        const row = document.createElement('div');
        row.className = 'cite-part-value has-records';
        row._citeRecords = [rec];
        row.textContent = rec[part.key];
        body.appendChild(row);
      }
    }
    card.appendChild(body);

    const foot = document.createElement('div');
    foot.className = 'cite-part-foot';
    // Highlight the part nobody agreed on — that's the hallucination.
    if (values.length > 1 && distinct === values.length) foot.classList.add('all-distinct');
    foot.textContent = values.length
      ? `${values.length} submitted · ${distinct} distinct`
      : '0 submitted';
    card.appendChild(foot);

    wrap.appendChild(card);
  }
}

// ── Part-value hover tooltip ─────────────────────
// Hovering a part value shows the whole citation it came from — and for a
// grouped value, every citation that used it, so a reporter repeated eleven
// times can be traced back to the eleven different cases invented around it.
const CITE_TOOLTIP_MAX = 15;
let _citeHoverRow = null;

function citeTooltipEl() {
  let el = document.getElementById('cite-tooltip');
  if (!el) {
    el = document.createElement('div');
    el.id = 'cite-tooltip';
    el.className = 'cite-tooltip hidden';
    document.body.appendChild(el);
  }
  return el;
}

function citeHideTooltip() {
  document.getElementById('cite-tooltip')?.classList.add('hidden');
}

function citeShowTooltip(row) {
  const records = row._citeRecords;
  if (!records || !records.length) return;
  const el = citeTooltipEl();
  el.innerHTML = '';

  if (records.length > 1) {
    const head = document.createElement('div');
    head.className = 'cite-tooltip-head';
    head.textContent = `${records.length} citations`;
    el.appendChild(head);
  }

  for (const rec of records.slice(0, CITE_TOOLTIP_MAX)) {
    const { name, rest } = citeFormat(rec);
    const line   = document.createElement('div');
    line.className = 'cite-tooltip-line';
    const nameEl = document.createElement('span');
    nameEl.className = 'cite-item-name';
    nameEl.textContent = name;
    const restEl = document.createElement('span');
    restEl.textContent = rest;
    line.appendChild(nameEl);
    line.appendChild(restEl);
    el.appendChild(line);
  }

  if (records.length > CITE_TOOLTIP_MAX) {
    const more = document.createElement('div');
    more.className = 'cite-tooltip-more';
    more.textContent = `…and ${records.length - CITE_TOOLTIP_MAX} more`;
    el.appendChild(more);
  }

  // Show it before measuring — a display:none box has no dimensions to clamp.
  el.classList.remove('hidden');
  el.style.left = '0px';
  el.style.top  = '0px';
  const rowRect = row.getBoundingClientRect();
  const box     = el.getBoundingClientRect();
  const pad     = 10;
  // Prefer the right of the value; flip to the left when it would run off.
  let left = rowRect.right + pad;
  if (left + box.width > window.innerWidth - pad) {
    left = Math.max(pad, rowRect.left - box.width - pad);
  }
  let top = rowRect.top;
  if (top + box.height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - box.height - pad);
  }
  el.style.left = `${Math.round(left)}px`;
  el.style.top  = `${Math.round(top)}px`;
}

function bindCiteTooltip() {
  const wrap = document.getElementById('cite-parts');
  if (!wrap) return;

  wrap.addEventListener('mouseover', e => {
    const row = e.target.closest?.('.cite-part-value.has-records');
    if (!row || row === _citeHoverRow) return;
    _citeHoverRow = row;
    citeShowTooltip(row);
  });
  wrap.addEventListener('mouseout', e => {
    const row = e.target.closest?.('.cite-part-value.has-records');
    if (!row || row.contains(e.relatedTarget)) return;
    _citeHoverRow = null;
    citeHideTooltip();
  });

  // Scrolling moves the row out from under an anchored tooltip. Capture, since
  // scroll events from the inner value lists don't bubble.
  wrap.addEventListener('scroll', citeHideTooltip, true);
  document.getElementById('cite-main')?.addEventListener('scroll', citeHideTooltip);
  window.addEventListener('resize', citeHideTooltip);
}

// Toggle between live Firebase submissions and the built-in sample class.
function citeSetDemoMode(on) {
  citeDemoMode = on;
  const btn = document.getElementById('cite-btn-demo');
  if (btn) {
    btn.textContent = on ? '◉ Show live submissions' : '▦ Show sample data';
    btn.setAttribute('aria-pressed', String(on));
    btn.style.color       = on ? 'var(--accent)' : 'var(--muted)';
    btn.style.borderColor = on ? 'var(--accent)' : 'var(--border)';
  }
  document.getElementById('cite-demo-badge')?.classList.toggle('hidden', !on);
  citeRender();
}

function citeBuildQR() {
  const submitUrl = `${window.location.origin + window.location.pathname}?submit=citations`;
  const qrUrl     = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=6&data=${encodeURIComponent(submitUrl)}`;
  const img       = document.getElementById('cite-qr-img');
  const loading   = document.getElementById('cite-qr-loading');
  const linkInput = document.getElementById('cite-student-link');
  if (linkInput) linkInput.value = submitUrl;
  if (img) {
    img.src = qrUrl;
    img.onload  = () => { img.style.display = 'block'; if (loading) loading.style.display = 'none'; };
    img.onerror = () => { if (loading) loading.textContent = 'QR unavailable (offline?)'; };
  }
}

function bindCitationEvents() {
  bindCiteTooltip();

  // One listener for every surface: the projected prompt line, the student
  // form's instructions, and the settings textarea all read from it — and it
  // has to be live on the submit page too, where no app is ever "opened".
  onExerciseConfig('citations', citeApplyConfig);

  document.getElementById('cite-btn-clear')?.addEventListener('click', citeHandleClear);
  document.getElementById('cite-btn-export')?.addEventListener('click', citeHandleExport);
  document.getElementById('cite-btn-demo')?.addEventListener('click', () => citeSetDemoMode(!citeDemoMode));

  // ── Settings: prompt ─────────────────────────────
  const promptBox = document.getElementById('settings-cite-prompt');
  promptBox?.addEventListener('input', citeUpdatePromptCount);

  document.getElementById('settings-cite-reset')?.addEventListener('click', () => {
    if (promptBox) { promptBox.value = ''; citeUpdatePromptCount(); promptBox.focus(); }
  });

  document.getElementById('settings-cite-save')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('settings-cite-save-status');
    const prompt   = (promptBox?.value ?? '').trim().slice(0, 400);
    if (statusEl) statusEl.textContent = 'Saving…';
    try {
      await saveExerciseConfig('citations', { prompt });
      if (statusEl) {
        statusEl.textContent = prompt ? '✓ Pushed to students' : '✓ Default restored';
        setTimeout(() => { statusEl.textContent = ''; }, 3000);
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = `Error: ${err.message}`;
    }
  });

  ['cite-group-dupes', 'cite-newest-first'].forEach(id => {
    document.getElementById(id)?.addEventListener('change', citeRender);
  });

  document.getElementById('cite-btn-copy-link')?.addEventListener('click', () => {
    const btn = document.getElementById('cite-btn-copy-link');
    const url = document.getElementById('cite-student-link')?.value
             || `${window.location.origin + window.location.pathname}?submit=citations`;
    navigator.clipboard.writeText(url).then(() => {
      const orig = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = orig; }, 1800);
    });
  });
}

// ── Student submit view ──────────────────────────
function citeSubmitCount() {
  return parseInt(localStorage.getItem('citations_submitted') || '0', 10) || 0;
}
function citeSubmitTally(n) {
  localStorage.setItem('citations_submitted', String(n));
  const el = document.getElementById('cite-submit-tally');
  if (el) el.textContent = n ? `You've submitted ${n} citation${n !== 1 ? 's' : ''}.` : '';
}

// The name survives a submission — a student sending a second citation should
// not have to type it again — so it is kept out of the per-round field reset
// and restored on the next visit.
function citeSubmitStudent() {
  return citeClean(document.getElementById('cite-field-student')?.value, CITE_STUDENT_KEY);
}
function citeRememberStudent(name) {
  try { localStorage.setItem('citations_student', name); } catch {}
}
function citeRecallStudent() {
  try { return localStorage.getItem('citations_student') || ''; } catch { return ''; }
}

function citeSubmitFields() {
  const rec = {};
  for (const part of CITE_PARTS) {
    rec[part.key] = citeClean(document.getElementById(`cite-field-${part.key}`)?.value, part.key);
  }
  return rec;
}

function citeSubmitUpdatePreview() {
  const el = document.getElementById('cite-submit-preview');
  if (!el) return;
  const rec = citeSubmitFields();
  if (!CITE_PARTS.some(p => rec[p.key])) {
    el.className = 'cite-sub-preview cite-sub-preview-empty';
    el.textContent = 'Fill in the fields above.';
    return;
  }
  const { name, rest } = citeFormat(rec);
  el.className = 'cite-sub-preview';
  el.innerHTML = '';
  const nameEl = document.createElement('span');
  nameEl.className = 'cite-item-name';
  nameEl.textContent = name;
  const restEl = document.createElement('span');
  restEl.textContent = rest;
  el.appendChild(nameEl);
  el.appendChild(restEl);
}

function citeInitSubmitView() {
  // Show only the submit overlay
  document.querySelectorAll('#home-screen, #panel-app, #plotter-app, #counsel-app, #research-app, #token-app, #citation-app')
    .forEach(el => el.classList.add('hidden'));
  document.getElementById('cite-submit-view').classList.remove('hidden');

  CITE_PARTS.forEach(part => {
    document.getElementById(`cite-field-${part.key}`)?.addEventListener('input', citeSubmitUpdatePreview);
  });
  citeSubmitUpdatePreview();
  citeSubmitTally(citeSubmitCount());

  const studentField = document.getElementById('cite-field-student');
  if (studentField) studentField.value = citeRecallStudent();

  document.getElementById('cite-submit-form').addEventListener('submit', async e => {
    e.preventDefault();
    const errEl   = document.getElementById('cite-submit-error');
    const btn     = document.getElementById('cite-submit-btn');
    const rec     = citeSubmitFields();
    const student = citeSubmitStudent();

    errEl.classList.add('hidden'); errEl.textContent = '';
    if (!student) {
      errEl.textContent = 'Please enter your name.';
      errEl.classList.remove('hidden');
      document.getElementById('cite-field-student')?.focus();
      return;
    }
    const missing = CITE_PARTS.filter(p => !rec[p.key]);
    if (missing.length) {
      errEl.textContent = `Please fill in every part — missing: ${missing.map(p => p.label.toLowerCase()).join(', ')}.`;
      errEl.classList.remove('hidden');
      document.getElementById(`cite-field-${missing[0].key}`)?.focus();
      return;
    }

    btn.disabled = true; btn.textContent = 'Submitting…';
    try {
      await _fbDB.ref(CITE_LIVE_PATH).push({ ...rec, [CITE_STUDENT_KEY]: student, ts: Date.now() });
      citeRememberStudent(student);
      const { name, rest } = citeFormat(rec);
      const confirmEl = document.getElementById('cite-submit-confirm-text');
      const successEl = document.getElementById('cite-submit-success');
      if (confirmEl) confirmEl.textContent = `Submitted — ${name}${rest}`;
      if (successEl) successEl.classList.remove('hidden');
      citeSubmitTally(citeSubmitCount() + 1);
      // Clear for a second round
      CITE_PARTS.forEach(part => {
        const field = document.getElementById(`cite-field-${part.key}`);
        if (field) field.value = '';
      });
      citeSubmitUpdatePreview();
      document.getElementById('cite-field-caption')?.focus();
      setTimeout(() => successEl?.classList.add('hidden'), 5000);
    } catch (err) {
      errEl.textContent = `Submit failed: ${err.message}`;
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false; btn.textContent = 'Submit';
    }
  });
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
// Default to a paid model: the :free variants share an upstream provider pool across
// all OpenRouter users and are frequently saturated (HTTP 429), which is fatal for a
// live classroom demo. Gemma stays selectable for the no-system-turn comparison.
let tokenConfig = { model: 'openai/gpt-4.1-mini', temperature: 0.7, altCount: 5, systemPrompt: '' };
// The last system prompt the instructor pushed, plus whether this student has
// typed over it. Together they decide if a new push may overwrite the field.
let tokenSystemPushed = '';
let tokenSystemEdited = false;
let tokenResults = []; // [{ token, logprob, top_logprobs: [{token, logprob}, ...] }]
let tokenLockedIndex = null;

const TOKEN_SAMPLE_PROMPTS = Object.freeze({
  gettysburg: 'What is the Gettysburg address?',
  'pride-prejudice': 'What is Pride and Prejudice about?',
  'black-mirror': 'Give me 3 ideas for Black Mirror episodes.',
});
// Real captured responses, including live token probabilities. Generated by
// scripts/capture-cached-examples.mjs and fetched on first expand so the payload
// costs nothing to anyone who never opens the panel.
const TOKEN_CACHED_URL = 'token-cached-examples.json';
let tokenCachedData = null;
let tokenCachedPromise = null;
let tokenCachedRenderId = 0;

function tokenLoadCachedExamples() {
  if (tokenCachedData) return Promise.resolve(tokenCachedData);
  if (!tokenCachedPromise) {
    tokenCachedPromise = fetch(TOKEN_CACHED_URL)
      .then(response => {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(data => { tokenCachedData = data; return data; })
      .catch(error => { tokenCachedPromise = null; throw error; });
  }
  return tokenCachedPromise;
}


function tokenUseSample() {
  const select = document.getElementById('token-sample-select');
  const promptEl = document.getElementById('token-prompt');
  const prompt = TOKEN_SAMPLE_PROMPTS[select?.value];
  if (!promptEl || !prompt) return;
  promptEl.value = prompt;
  promptEl.focus();
  return tokenGenerate();
}

function tokenToggleCachedExamples() {
  const header = document.getElementById('token-cached-toggle-header');
  const body = document.getElementById('token-cached-body');
  const icon = document.getElementById('token-cached-toggle-icon');
  if (!body) return;
  const expanded = body.classList.toggle('expanded');
  header?.setAttribute('aria-expanded', String(expanded));
  if (icon) icon.textContent = expanded ? '▲ Hide' : '▼ Show';
  // Fetch the capture file only once someone actually opens the panel.
  if (expanded) tokenRenderCachedExamples();
}

function tokenBindCollapsible(headerId, bodyId, iconId) {
  const header = document.getElementById(headerId);
  const body = document.getElementById(bodyId);
  const icon = document.getElementById(iconId);
  if (!header || !body) return;

  const toggle = () => {
    const expanded = body.classList.toggle('expanded');
    header.setAttribute('aria-expanded', String(expanded));
    if (icon) icon.textContent = expanded ? '▲ Hide' : '▼ Show';
  };

  header.addEventListener('click', toggle);
  header.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
}

function tokenBindInfoToggle(buttonId, noteId) {
  const button = document.getElementById(buttonId);
  const note = document.getElementById(noteId);
  if (!button || !note) return;
  button.addEventListener('click', () => {
    const shown = note.classList.toggle('hidden');
    button.setAttribute('aria-expanded', String(!shown));
  });
}

function tokenUpdateSystemCount() {
  const field = document.getElementById('token-system-prompt');
  const counter = document.getElementById('token-system-count');
  if (!field || !counter) return;
  const used = field.value.length;
  counter.textContent = used.toLocaleString() + ' / ' + TOKEN_SYSTEM_CHAR_CAP.toLocaleString() + ' characters';
  counter.classList.toggle('error', used > TOKEN_SYSTEM_CHAR_CAP);
}
function tokenPopulateAlternativeRows(list, tokenData) {
  const alternatives = Array.isArray(tokenData?.top_logprobs) ? [...tokenData.top_logprobs] : [];
  alternatives.sort((a, b) => b.logprob - a.logprob);
  list.replaceChildren();

  const chosenRank = alternatives.findIndex(a => a.token === tokenData?.token);
  const maxProbability = alternatives.length ? Math.exp(alternatives[0].logprob) : 1;

  alternatives.forEach((alternative, index) => {
    const probability = Math.exp(alternative.logprob);
    const row = document.createElement('div');
    row.className = 'token-alt-row';
    if (index === chosenRank) row.classList.add('chosen');
    row.title = 'log probability: ' + Number(alternative.logprob).toFixed(6);

    const label = document.createElement('span');
    label.className = 'token-alt-label';
    label.textContent = tokenVisibleLabel(alternative.token);

    const track = document.createElement('span');
    track.className = 'token-alt-bar-track';
    const fill = document.createElement('span');
    fill.className = 'token-alt-bar-fill';
    fill.style.width = Math.max(2, (probability / maxProbability) * 100) + '%';
    track.appendChild(fill);

    const percent = document.createElement('span');
    percent.className = 'token-alt-pct';
    percent.textContent = tokenFormatProbability(alternative.logprob);

    row.append(label, track, percent);
    list.appendChild(row);
  });
}

function tokenBindCachedInteraction(output, alternativesTitle, alternativesList, results) {
  let lockedIndex = null;

  const showAlternatives = index => {
    output.querySelectorAll('.token-pill').forEach((pill, pillIndex) => {
      pill.classList.toggle('active', pillIndex === index);
      pill.classList.toggle('locked', pillIndex === lockedIndex);
      pill.setAttribute('aria-pressed', String(pillIndex === lockedIndex));
    });

    const tokenData = results[index];
    const lockedText = lockedIndex === index ? ' 🔒' : '';
    alternativesTitle.textContent = 'Alternatives for "' + tokenVisibleLabel(tokenData.token) + '"' + lockedText;
    tokenPopulateAlternativeRows(alternativesList, tokenData);
  };

  results.forEach((tokenData, index) => {
    const probability = Math.exp(tokenData.logprob);
    const pill = document.createElement('span');
    pill.className = 'token-pill';
    pill.textContent = tokenData.token;
    pill.tabIndex = 0;
    pill.setAttribute('role', 'button');
    pill.setAttribute('aria-pressed', 'false');

    const background = tokenConfidenceColor(probability);
    if (background) pill.style.backgroundColor = background;
    pill.title = Math.round(probability * 100) + '% likely';

    pill.addEventListener('click', () => {
      lockedIndex = lockedIndex === index ? null : index;
      showAlternatives(index);
    });
    pill.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        lockedIndex = lockedIndex === index ? null : index;
        showAlternatives(index);
      }
    });
    pill.addEventListener('mouseenter', () => {
      if (lockedIndex === null) showAlternatives(index);
    });

    output.appendChild(pill);
  });
}

function tokenCachedMessage(container, text) {
  const message = document.createElement('div');
  message.className = 'token-cached-empty';
  message.textContent = text;
  container.replaceChildren(message);
}

async function tokenRenderCachedExamples() {
  const container = document.getElementById('token-cached-responses');
  const promptKey = document.getElementById('token-cached-prompt')?.value;
  if (!container || !promptKey) return;

  const selectedTemperatures = Array.from(document.querySelectorAll('input[name="token-cached-temperature"]:checked'))
    .map(input => Number(input.value))
    .sort((a, b) => a - b);

  container.replaceChildren();
  if (!selectedTemperatures.length) {
    tokenCachedMessage(container, 'Select at least one temperature to show a cached response.');
    return;
  }

  // The fetch is async, so a fast click could otherwise render a stale selection
  // on top of a newer one. Only the most recent call is allowed to paint.
  const renderId = ++tokenCachedRenderId;
  let data;
  try {
    if (!tokenCachedData) tokenCachedMessage(container, 'Loading cached examples…');
    data = await tokenLoadCachedExamples();
  } catch (error) {
    if (renderId !== tokenCachedRenderId) return;
    tokenCachedMessage(container, 'Could not load cached examples (' + error.message + '). They are stored in token-cached-examples.json.');
    return;
  }
  if (renderId !== tokenCachedRenderId) return;

  const modelLabel = data?.modelLabel || data?.model || 'Model';
  container.replaceChildren();

  selectedTemperatures.forEach(temperature => {
    const card = document.createElement('article');
    card.className = 'token-cached-response';

    const title = document.createElement('div');
    title.className = 'token-cached-response-title';
    title.textContent = modelLabel + ' · Temperature ' + temperature;

    const output = document.createElement('div');
    output.className = 'token-cached-output';

    const instructions = document.createElement('p');
    instructions.className = 'token-cached-instructions';
    instructions.textContent = 'Hover to explore. Click a token to lock its alternatives; click it again to unlock.';

    const alternatives = document.createElement('div');
    alternatives.className = 'token-cached-alternatives';

    const alternativesTitle = document.createElement('div');
    alternativesTitle.className = 'token-cached-alternatives-title';
    alternativesTitle.textContent = 'Alternatives';

    const alternativesList = document.createElement('div');


    const results = data?.examples?.[promptKey]?.responses?.[temperature];
    if (!Array.isArray(results) || !results.length) {
      const missing = document.createElement('p');
      missing.className = 'token-cached-instructions';
      missing.textContent = 'This example was not captured. Re-run scripts/capture-cached-examples.mjs to add it.';
      card.append(title, missing);
      container.appendChild(card);
      return;
    }

    tokenBindCachedInteraction(output, alternativesTitle, alternativesList, results);

    alternatives.append(alternativesTitle, alternativesList);
    card.append(title, output, instructions, alternatives);
    container.appendChild(card);
  });
}
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

  const sSystemEl = document.getElementById('settings-token-system-prompt');
  if (sSystemEl && sSystemEl !== document.activeElement) sSystemEl.value = tokenConfig.systemPrompt;

  tokenApplySystemPrompt(tokenConfig.systemPrompt);
}

// Push the instructor's system prompt into the student's field, but never over
// text the student wrote themselves — they get a restore button instead.
function tokenApplySystemPrompt(next) {
  const field = document.getElementById('token-system-prompt');
  if (field) {
    const current = field.value;
    const untouched = !tokenSystemEdited || current.trim() === '' || current === tokenSystemPushed;
    if (untouched && current !== next) {
      field.value = next;
      tokenSystemEdited = false;
      tokenUpdateSystemCount();
    }
  }
  tokenSystemPushed = next;
  tokenUpdateSystemNotice();
}

function tokenUpdateSystemNotice() {
  const notice = document.getElementById('token-system-notice');
  const text = document.getElementById('token-system-notice-text');
  const restore = document.getElementById('token-system-restore');
  const field = document.getElementById('token-system-prompt');
  if (!notice || !text || !restore || !field) return;

  if (!tokenSystemPushed) {
    notice.classList.add('hidden');
    return;
  }
  notice.classList.remove('hidden');
  const matches = field.value === tokenSystemPushed;
  text.textContent = matches
    ? 'Your instructor set this system prompt. Edit or clear it to see how the answers change.'
    : 'Your instructor pushed a system prompt; you are using your own.';
  restore.classList.toggle('hidden', matches);
}

function tokenSetStatus(text, isError) {
  const el = document.getElementById('token-status-text');
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('error', !!isError);
}

function tokenModelDisplayName(modelId) {
  const option = Array.from(document.querySelectorAll('#token-model option'))
    .find(item => item.value === modelId);
  return option?.textContent?.trim() || modelId || 'Model';
}

function tokenFormatCost(cost) {
  if (!Number.isFinite(cost)) return null;
  if (cost === 0) return '$0.000000';
  if (cost < 0.01) return '$' + cost.toFixed(6);
  return '$' + cost.toFixed(4);
}

const tokenPricingCache = new Map();

async function tokenGetModelPricing(modelId) {
  if (modelId?.endsWith(':free')) return { prompt: '0', completion: '0' };
  if (tokenPricingCache.has(modelId)) return tokenPricingCache.get(modelId);

  const request = (async () => {
    const urls = [
      TOKEN_PROXY_URL + '?model=' + encodeURIComponent(modelId),
      'https://openrouter.ai/api/v1/model/' + modelId.split('/').map(encodeURIComponent).join('/'),
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url);
        if (!response.ok) continue;
        const data = await response.json();
        const pricing = data?.pricing || data?.data?.pricing;
        if (pricing) return pricing;
      } catch (_) {
        // Try the next pricing source. Cost totals still render if both are unavailable.
      }
    }
    return null;
  })();

  tokenPricingCache.set(modelId, request);
  return request;
}

function tokenUsageValues(usage) {
  const inputTokens = usage?.prompt_tokens ?? usage?.input_tokens;
  const outputTokens = usage?.completion_tokens ?? usage?.output_tokens;
  const totalCost = usage?.cost === null || usage?.cost === undefined ? null : Number(usage.cost);
  return {
    inputTokens: Number.isFinite(Number(inputTokens)) ? Number(inputTokens) : null,
    outputTokens: Number.isFinite(Number(outputTokens)) ? Number(outputTokens) : null,
    totalCost: Number.isFinite(totalCost) ? totalCost : null,
  };
}

function tokenEstimateCostSplit(values, pricing) {
  const inputRate = Number(pricing?.prompt);
  const outputRate = Number(pricing?.completion);
  if (!Number.isFinite(inputRate) || !Number.isFinite(outputRate)
      || values.inputTokens === null || values.outputTokens === null) {
    return { inputCost: null, outputCost: null };
  }

  let inputCost = values.inputTokens * inputRate;
  let outputCost = values.outputTokens * outputRate;
  const estimatedTotal = inputCost + outputCost;

  if (values.totalCost !== null && estimatedTotal > 0) {
    const scale = values.totalCost / estimatedTotal;
    inputCost *= scale;
    outputCost *= scale;
  } else if (values.totalCost === 0) {
    inputCost = 0;
    outputCost = 0;
  }

  return { inputCost, outputCost };
}

function tokenWriteUsage(container, usage, modelId, costs) {
  const values = tokenUsageValues(usage);
  const hasUsage = values.inputTokens !== null || values.outputTokens !== null || values.totalCost !== null;
  container.replaceChildren();
  container.classList.toggle('hidden', !hasUsage);
  if (!hasUsage) return;

  const entries = [
    tokenModelDisplayName(modelId),
    values.inputTokens !== null ? 'Input: ' + values.inputTokens.toLocaleString() + ' tokens' : null,
    values.outputTokens !== null ? 'Output: ' + values.outputTokens.toLocaleString() + ' tokens' : null,
    costs === undefined ? 'Input cost: calculating…' : 'Input cost (est.): ' + (tokenFormatCost(costs.inputCost) || 'unavailable'),
    costs === undefined ? 'Output cost: calculating…' : 'Output cost (est.): ' + (tokenFormatCost(costs.outputCost) || 'unavailable'),
    values.totalCost !== null ? 'Total cost: ' + tokenFormatCost(values.totalCost) : 'Total cost: unavailable',
  ].filter(Boolean);

  entries.forEach(value => {
    const item = document.createElement('span');
    item.className = 'token-usage-item';
    item.textContent = value;
    container.appendChild(item);
  });
}

async function tokenRenderUsageInto(container, usage, modelId) {
  if (!container) return;
  const values = tokenUsageValues(usage);
  tokenWriteUsage(container, usage, modelId);

  const pricing = await tokenGetModelPricing(modelId);
  if (!container.isConnected) return;
  tokenWriteUsage(container, usage, modelId, tokenEstimateCostSplit(values, pricing));
}

function tokenRenderUsage(usage, modelId) {
  return tokenRenderUsageInto(document.getElementById('token-usage'), usage, modelId);
}

const TOKEN_SYSTEM_CHAR_CAP = 2000;

function tokenReadSystemPrompt() {
  return (document.getElementById('token-system-prompt')?.value ?? '').trim();
}

function tokenReadAdvanced() {
  const rawSeed = document.getElementById('token-seed')?.value ?? '';
  const rawTopK = document.getElementById('token-top-k')?.value ?? '';
  const rawTopP = document.getElementById('token-top-p')?.value ?? '';
  const seed = rawSeed.trim() === '' ? null : Math.trunc(Number(rawSeed));
  const topK = rawTopK.trim() === '' ? 0 : Math.trunc(Number(rawTopK));
  const topP = rawTopP.trim() === '' ? null : Number(rawTopP);
  return {
    seed: Number.isFinite(seed) ? seed : null,
    topK: Number.isFinite(topK) ? topK : 0,
    topP: Number.isFinite(topP) ? topP : null,
  };
}

function tokenBuildRequestBody({ prompt, system, model, temperature, altCount, seed, topK, topP }) {
  const body = {
    model,
    messages: [{ role: 'user', content: prompt }],
    temperature,
    top_logprobs: altCount,
  };
  if (system) body.system = system;
  if (Number.isInteger(seed)) body.seed = seed;
  if (Number.isInteger(topK) && topK > 0) body.top_k = topK;
  if (Number.isFinite(topP)) body.top_p = topP;
  return body;
}

function tokenBuildRequestBlock(label, payload) {
  const wrapper = document.createElement('div');
  wrapper.className = 'token-request-block';

  const heading = document.createElement('div');
  heading.className = 'token-request-block-title';
  heading.textContent = label;

  const pre = document.createElement('pre');
  pre.textContent = JSON.stringify(payload, null, 2);

  wrapper.append(heading, pre);
  return wrapper;
}

// Shows both hops so the trip is visible end to end: what the page sent, and what
// the Worker actually forwarded (server-side caps included). The upstream copy is
// echoed back by the Worker as `_request`, so it is the real payload, not a guess.
function tokenBuildRequestViewer(clientPayload, upstreamPayload) {
  const details = document.createElement('details');
  details.className = 'token-request-viewer';

  const summary = document.createElement('summary');
  summary.textContent = 'View request';

  const note = document.createElement('p');
  note.className = 'plotter-hint';
  note.textContent = 'Everything below left this browser.';

  details.append(summary, note, tokenBuildRequestBlock('Sent by this page to the Worker', clientPayload));

  if (upstreamPayload) {
    details.appendChild(tokenBuildRequestBlock('Forwarded by the Worker to the provider', upstreamPayload));
  } else {
    const pending = document.createElement('p');
    pending.className = 'plotter-hint';
    pending.textContent = 'The forwarded payload appears here once the provider responds.';
    details.appendChild(pending);
  }

  return details;
}

// A provider that honors top_k can never emit a token ranked below K, so a single
// out-of-range token proves the parameter was dropped. Inferring it from the response
// beats hardcoding which providers support it, since that list changes without notice.
function tokenTopKWasIgnored(requestedTopK, content) {
  if (!Number.isInteger(requestedTopK) || requestedTopK <= 0) return false;
  if (!Array.isArray(content) || !content.length) return false;
  return content.some(entry => {
    const alts = [...(entry?.top_logprobs || [])].sort((a, b) => b.logprob - a.logprob);
    if (!alts.length) return false;
    const rank = alts.findIndex(a => a.token === entry.token);
    // Only conclusive when the ranked list is long enough to see past K.
    if (rank === -1) return alts.length >= requestedTopK;
    return rank >= requestedTopK;
  });
}

function tokenBuildTopKWarning(requestedTopK) {
  const warning = document.createElement('p');
  warning.className = 'token-param-warning';
  warning.textContent = 'Top-K = ' + requestedTopK + ' was sent but ignored by this model. '
    + 'It generated a token ranked below ' + requestedTopK + ', which a provider honoring Top-K cannot do. '
    + 'OpenAI models have no Top-K parameter — use Temperature instead, or select a model that supports it.';
  return warning;
}

function tokenShowRequest(clientPayload, upstreamPayload) {
  const slot = document.getElementById('token-request-slot');
  if (!slot) return;
  // Preserve the open/closed state so a re-render after the response does not
  // collapse a panel the user just opened.
  const wasOpen = slot.querySelector('.token-request-viewer')?.open;
  const viewer = tokenBuildRequestViewer(clientPayload, upstreamPayload);
  if (wasOpen) viewer.open = true;
  slot.replaceChildren(viewer);
}

async function tokenRequestCompletion({ body, onRetry }) {
  const requestBody = JSON.stringify(body);
  const maxAttempts = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) onRetry?.(attempt, maxAttempts);

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);
      let response;
      try {
        response = await fetch(TOKEN_PROXY_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: requestBody,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      let data;
      try {
        data = await response.json();
      } catch (_) {
        const error = new Error('The service returned an unreadable response (HTTP ' + response.status + ')');
        error.retryable = response.status >= 500;
        error.status = response.status;
        throw error;
      }

      if (!response.ok) {
        // OpenRouter's top-level message is often just "Provider returned error"; the
        // sentence that actually explains what happened sits in error.metadata.raw.
        const raw = data?.error?.metadata?.raw;
        const message = (typeof raw === 'string' && raw.trim())
          || data?.error?.message || data?.error || 'Request failed (HTTP ' + response.status + ')';
        const error = new Error(typeof message === 'string' ? message : 'Request failed (HTTP ' + response.status + ')');
        error.limitSource = data?.error?.metadata?.limit_source || null;
        error.retryable = response.status === 408 || response.status === 429 || response.status >= 500;
        error.status = response.status;
        const retryAfter = Number(response.headers.get('Retry-After'));
        if (Number.isFinite(retryAfter) && retryAfter > 0) {
          error.retryAfterMs = Math.min(retryAfter * 1000, 15000);
        }
        throw error;
      }

      const content = data?.choices?.[0]?.logprobs?.content;
      if (!Array.isArray(content) || content.length === 0) {
        const error = new Error('This provider returned no token probabilities. OpenRouter routes each request to whichever provider is available, and not all of them support logprobs — trying again may reach one that does');
        error.retryable = true;
        throw error;
      }

      // Some providers return a logprobs array with tokens missing from the middle of
      // the sequence. The card renders that array, so an incomplete one silently shows
      // text the model never wrote — one provider turned "Gettysburg" into "Getburg".
      // Refuse the response rather than display a corrupted transcript.
      const message = data?.choices?.[0]?.message?.content;
      const rendered = content.map(entry => entry.token).join('');
      if (typeof message === 'string' && message.trim() && rendered.trim() !== message.trim()) {
        const expected = data?.usage?.completion_tokens;
        const error = new Error('This provider returned incomplete token probabilities ('
          + content.length + ' entries for ' + (expected ?? 'the') + ' generated tokens), so the response cannot be shown accurately. '
          + 'Trying again may reach a provider that returns all of them');
        error.retryable = true;
        error.incompleteLogprobs = true;
        throw error;
      }

      return data;
    } catch (caught) {
      let error = caught;
      if (error.name === 'AbortError') {
        error = new Error('The provider took more than 30 seconds to respond');
        error.retryable = true;
        error.status = 408;
      }
      lastError = error;
      if (error.retryable === false || attempt === maxAttempts) throw error;
      await new Promise(resolve => setTimeout(resolve, error.retryAfterMs || 1000 * (2 ** (attempt - 1))));
    }
  }

  throw lastError;
}

function tokenErrorDescription(error, includeRetryNote = true) {
  const category = error.status === 429 ? 'Rate limit'
    : error.status === 408 ? 'Provider timeout'
    : error.status >= 500 ? 'Provider temporarily unavailable'
    : 'Request failed';
  const retryNote = includeRetryNote && error.retryable !== false
    ? ' Three automatic attempts were made.'
    : '';
  // A saturated shared pool is not the user's quota and will not clear by waiting a
  // moment or by adding credits, so point at the fix that actually works.
  const poolNote = error.limitSource === 'upstream_provider_shared_pool'
    ? ' This is a shared free-tier pool used by all OpenRouter users, not your own quota — adding credits will not help. Switch to a paid model for reliable classroom use.'
    : '';
  const text = String(error.message || '').trim();
  const punctuated = /[.!?]$/.test(text) ? text : text + '.';
  return category + ': ' + punctuated + retryNote + poolNote;
}

function tokenUpdateCompareControl() {
  const compare = document.getElementById('token-compare-temperatures');
  const temperature = document.getElementById('token-temperature');
  if (temperature) temperature.disabled = !!compare?.checked || !!compare?.disabled;
}

function tokenSetGenerationControls(disabled) {
  [
    'token-generate-btn',
    'token-use-sample-btn',
    'token-sample-select',
    'token-compare-temperatures',
    'token-model',
    'token-temperature',
    'token-alt-count',
    'token-system-prompt',
    'token-system-clear',
    'token-seed',
    'token-top-k',
    'token-top-p',
  ].forEach(id => {
    const control = document.getElementById(id);
    if (control) control.disabled = disabled;
  });
  tokenUpdateCompareControl();
}

function tokenShowSingleResults() {
  document.getElementById('token-results')?.classList.remove('hidden');
  document.getElementById('token-comparison-results')?.classList.add('hidden');
}

function tokenShowComparisonResults() {
  document.getElementById('token-results')?.classList.add('hidden');
  document.getElementById('token-comparison-results')?.classList.remove('hidden');
}

function tokenCreateComparisonCard(temperature, modelId) {
  const card = document.createElement('section');
  card.className = 'section-card token-comparison-response';

  const title = document.createElement('div');
  title.className = 'token-cached-response-title';
  title.textContent = tokenModelDisplayName(modelId) + ' · Temperature ' + temperature;

  const loading = document.createElement('div');
  loading.className = 'token-comparison-loading';
  loading.textContent = 'Waiting to generate…';

  card.append(title, loading);
  return card;
}

function tokenSetComparisonLoading(card, message) {
  const loading = card.querySelector('.token-comparison-loading');
  if (loading) loading.textContent = message;
}

function tokenRenderComparisonError(card, error, clientPayload) {
  const old = card.querySelector('.token-comparison-loading');
  old?.remove();
  const message = document.createElement('p');
  message.className = 'token-comparison-error';
  message.textContent = tokenErrorDescription(error);
  card.appendChild(message);
  if (clientPayload) card.appendChild(tokenBuildRequestViewer(clientPayload, null));
}

function tokenRenderComparisonSuccess(card, data, temperature, requestedModel, clientPayload) {
  const content = data.choices[0].logprobs.content;
  const resolvedModel = data?.model || requestedModel;
  card.replaceChildren();

  const title = document.createElement('div');
  title.className = 'token-cached-response-title';
  title.textContent = tokenModelDisplayName(resolvedModel) + ' · Temperature ' + temperature;

  const output = document.createElement('div');
  output.className = 'token-cached-output';

  const usage = document.createElement('div');
  usage.className = 'token-usage hidden';
  usage.setAttribute('aria-live', 'polite');

  const instructions = document.createElement('p');
  instructions.className = 'token-cached-instructions';
  instructions.textContent = 'Hover to explore. Click a token to lock its alternatives; click it again to unlock.';

  const alternatives = document.createElement('div');
  alternatives.className = 'token-cached-alternatives';
  const alternativesTitle = document.createElement('div');
  alternativesTitle.className = 'token-cached-alternatives-title';
  alternativesTitle.textContent = 'Alternatives';
  const alternativesList = document.createElement('div');


  tokenBindCachedInteraction(output, alternativesTitle, alternativesList, content);
  alternatives.append(alternativesTitle, alternativesList);
  card.append(title, output, usage, instructions, alternatives);
  if (clientPayload && tokenTopKWasIgnored(clientPayload.top_k, content)) {
    card.appendChild(tokenBuildTopKWarning(clientPayload.top_k));
  }
  if (clientPayload) card.appendChild(tokenBuildRequestViewer(clientPayload, data?._request));
  tokenRenderUsageInto(usage, data?.usage, resolvedModel);
}

async function tokenGenerateComparison({ prompt, system, model, altCount, seed, topK, topP }) {
  const container = document.getElementById('token-comparison-results');
  const temperatures = [0, 1, 2];
  const cards = temperatures.map(temperature => tokenCreateComparisonCard(temperature, model));
  container.replaceChildren(...cards);
  tokenShowComparisonResults();

  let successes = 0;
  const errors = [];

  for (let index = 0; index < temperatures.length; index++) {
    const temperature = temperatures[index];
    const card = cards[index];
    tokenSetComparisonLoading(card, 'Generating…');
    tokenSetStatus('Generating temperature ' + temperature + ' (' + (index + 1) + ' of 3)…');
    const body = tokenBuildRequestBody({ prompt, system, model, temperature, altCount, seed, topK, topP });

    try {
      const data = await tokenRequestCompletion({
        body,
        onRetry: (attempt, maxAttempts) => {
          tokenSetComparisonLoading(card, 'Retrying… (' + (attempt - 1) + '/' + (maxAttempts - 1) + ')');
          tokenSetStatus('Temperature ' + temperature + ': retry ' + (attempt - 1) + '/' + (maxAttempts - 1) + '…');
        },
      });
      tokenRenderComparisonSuccess(card, data, temperature, model, body);
      successes++;
    } catch (error) {
      errors.push(error);
      tokenRenderComparisonError(card, error, body);
    }
  }

  if (!errors.length) {
    tokenSetStatus('');
  } else if (successes) {
    tokenSetStatus(successes + ' of 3 responses generated. Failed temperatures can be retried with Generate.', true);
  } else {
    tokenSetStatus(tokenErrorDescription(errors[0]) + ' Try Generate again.', true);
  }
}

async function tokenGenerate() {
  const promptEl = document.getElementById('token-prompt');
  const prompt = (promptEl?.value ?? '').trim();
  if (!prompt) { tokenSetStatus('Enter a prompt first.', true); return; }

  const model = document.getElementById('token-model')?.value || tokenConfig.model;
  const temperature = Number(document.getElementById('token-temperature')?.value ?? tokenConfig.temperature);
  const altCount = Number(document.getElementById('token-alt-count')?.value ?? tokenConfig.altCount);
  const compareTemperatures = !!document.getElementById('token-compare-temperatures')?.checked;
  const system = tokenReadSystemPrompt();
  const { seed, topK, topP } = tokenReadAdvanced();

  if (system.length > TOKEN_SYSTEM_CHAR_CAP) {
    tokenSetStatus('System prompt is too long (' + system.length.toLocaleString() + ' characters, limit ' + TOKEN_SYSTEM_CHAR_CAP.toLocaleString() + ').', true);
    return;
  }

  tokenSetGenerationControls(true);
  tokenLockedIndex = null;
  tokenResetAlternatives();

  try {
    if (compareTemperatures) {
      await tokenGenerateComparison({ prompt, system, model, altCount, seed, topK, topP });
      return;
    }

    tokenShowSingleResults();
    tokenSetStatus('Generating…');
    const body = tokenBuildRequestBody({ prompt, system, model, temperature, altCount, seed, topK, topP });
    tokenShowRequest(body, null);

    const data = await tokenRequestCompletion({
      body,
      onRetry: (attempt, maxAttempts) => {
        tokenSetStatus('Generating… (retry ' + (attempt - 1) + '/' + (maxAttempts - 1) + ')');
      },
    });

    tokenResults = data.choices[0].logprobs.content;
    tokenRenderOutput();
    tokenRenderUsage(data?.usage, data?.model || model);
    tokenShowRequest(body, data?._request);
    if (tokenTopKWasIgnored(body.top_k, tokenResults)) {
      document.getElementById('token-request-slot')?.prepend(tokenBuildTopKWarning(body.top_k));
    }
    tokenSetStatus('');
  } catch (error) {
    tokenSetStatus(tokenErrorDescription(error) + ' You can try Generate again.', true);
  } finally {
    tokenSetGenerationControls(false);
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
  tokenLockedIndex = null;
  tokenResults.forEach((t, i) => {
    const prob = Math.exp(t.logprob);
    const span = document.createElement('span');
    span.className = 'token-pill';
    span.textContent = t.token;
    span.tabIndex = 0;
    span.setAttribute('role', 'button');
    span.setAttribute('aria-pressed', 'false');
    const bg = tokenConfidenceColor(prob);
    if (bg) span.style.backgroundColor = bg;
    span.title = `${Math.round(prob * 100)}% likely`;
    span.addEventListener('click', () => tokenToggleLock(i));
    span.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tokenToggleLock(i); }
    });
    span.addEventListener('mouseenter', () => {
      if (tokenLockedIndex === null) tokenShowAlternatives(i);
    });
    out.appendChild(span);
  });
  tokenRenderMarkdown();
}

function tokenResetAlternatives() {
  tokenLockedIndex = null;
  document.querySelectorAll('#token-output .token-pill').forEach(el => {
    el.classList.remove('active', 'locked');
    el.setAttribute('aria-pressed', 'false');
  });
  document.getElementById('token-alts-word-wrap').textContent = '';
  document.getElementById('token-alts-list').replaceChildren();

}

function tokenToggleLock(index) {
  tokenLockedIndex = tokenLockedIndex === index ? null : index;
  tokenShowAlternatives(index);
}

function tokenVisibleLabel(raw) {
  const value = String(raw ?? '');
  if (!value) return '∅ (empty token)';
  return value
    .replace(/ /g, '␠')
    .replace(/\t/g, '⇥')
    .replace(/[\r\n]/g, '↵');
}

function tokenFormatProbability(logprob) {
  const pct = Math.exp(logprob) * 100;
  if (pct === 0) return '<0.000001%';
  if (pct < 0.001) return '<0.001%';
  if (pct < 0.1) return `${pct.toFixed(3)}%`;
  return `${pct.toFixed(1)}%`;
}

function tokenShowAlternatives(index) {
  document.querySelectorAll('#token-output .token-pill').forEach((el, i) => {
    el.classList.toggle('active', i === index);
    el.classList.toggle('locked', i === tokenLockedIndex);
    el.setAttribute('aria-pressed', String(i === tokenLockedIndex));
  });

  const tokenData = tokenResults[index];
  const lockedText = tokenLockedIndex === index ? ' 🔒' : '';
  document.getElementById('token-alts-word-wrap').textContent = ' for "' + tokenVisibleLabel(tokenData.token) + '"' + lockedText;
  tokenPopulateAlternativeRows(document.getElementById('token-alts-list'), tokenData);
}
function tokenRenderMarkdown() {
  const rendered = document.getElementById('token-output-rendered');
  if (!rendered) return;
  const text = tokenResults.map(t => t.token).join('');
  if (window.marked && window.DOMPurify) {
    rendered.innerHTML = DOMPurify.sanitize(marked.parse(text));
  } else {
    rendered.textContent = text;
  }
}

function tokenUpdateOutputView() {
  const renderedMode = !!document.getElementById('token-render-toggle')?.checked;
  document.getElementById('token-output')?.classList.toggle('hidden', renderedMode);
  document.getElementById('token-output-rendered')?.classList.toggle('hidden', !renderedMode);
}

function bindTokenEvents() {
  // Subscribe at load, not on first open of the card: the Settings panel shows
  // the pushed defaults, so an instructor who never opens the card must not see
  // (and re-push) blank fields over what is already live.
  if (!tokenInitialized) {
    tokenInitialized = true;
    onExerciseConfig('tokenExplorer', tokenApplyConfig);
  }

  document.getElementById('token-generate-btn')?.addEventListener('click', tokenGenerate);
  document.getElementById('token-render-toggle')?.addEventListener('change', tokenUpdateOutputView);
  document.getElementById('token-use-sample-btn')?.addEventListener('click', tokenUseSample);
  document.getElementById('token-compare-temperatures')?.addEventListener('change', tokenUpdateCompareControl);
  tokenUpdateCompareControl();
  document.getElementById('token-cached-prompt')?.addEventListener('change', tokenRenderCachedExamples);
  document.querySelectorAll('input[name="token-cached-temperature"]').forEach(input => {
    input.addEventListener('change', tokenRenderCachedExamples);
  });

  const cachedHeader = document.getElementById('token-cached-toggle-header');
  cachedHeader?.addEventListener('click', tokenToggleCachedExamples);
  cachedHeader?.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      tokenToggleCachedExamples();
    }
  });

  document.getElementById('token-prompt')?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      tokenGenerate();
    }
  });

  const tempEl = document.getElementById('token-temperature');
  const tempVal = document.getElementById('token-temperature-val');
  tempEl?.addEventListener('input', () => { if (tempVal) tempVal.textContent = tempEl.value; });

  tokenBindCollapsible('token-system-toggle-header', 'token-system-body', 'token-system-toggle-icon');
  tokenBindCollapsible('token-advanced-toggle-header', 'token-advanced-body', 'token-advanced-toggle-icon');
  tokenBindInfoToggle('token-seed-info-btn', 'token-seed-info');
  tokenBindInfoToggle('token-top-k-info-btn', 'token-top-k-info');
  tokenBindInfoToggle('token-top-p-info-btn', 'token-top-p-info');

  const systemEl = document.getElementById('token-system-prompt');
  systemEl?.addEventListener('input', () => {
    tokenSystemEdited = true;
    tokenUpdateSystemCount();
    tokenUpdateSystemNotice();
  });
  systemEl?.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      tokenGenerate();
    }
  });
  document.getElementById('token-system-clear')?.addEventListener('click', () => {
    if (!systemEl) return;
    systemEl.value = '';
    tokenSystemEdited = true;
    tokenUpdateSystemCount();
    tokenUpdateSystemNotice();
    systemEl.focus();
  });
  document.getElementById('token-system-restore')?.addEventListener('click', () => {
    if (!systemEl) return;
    systemEl.value = tokenSystemPushed;
    tokenSystemEdited = false;
    tokenUpdateSystemCount();
    tokenUpdateSystemNotice();
    systemEl.focus();
  });
  tokenUpdateSystemCount();
  tokenUpdateSystemNotice();

  document.getElementById('settings-token-save')?.addEventListener('click', async () => {
    const statusEl = document.getElementById('settings-token-save-status');
    const model = document.getElementById('settings-token-model')?.value || tokenConfig.model;
    const temperature = Number(document.getElementById('settings-token-temperature')?.value ?? tokenConfig.temperature);
    const altCount = Number(document.getElementById('settings-token-alt-count')?.value ?? tokenConfig.altCount);
    const systemPrompt = (document.getElementById('settings-token-system-prompt')?.value ?? '').trim();
    if (statusEl) statusEl.textContent = 'Saving…';
    try {
      await saveExerciseConfig('tokenExplorer', { model, temperature, altCount, systemPrompt });
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
  bindCitationEvents();
  bindSubmitRouter();

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
