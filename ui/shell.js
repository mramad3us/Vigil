/* ============================================================
   VIGIL — ui/shell.js
   Workspace manager, status bar updates, taskbar, keyboard.
   ============================================================ */

var _workspaces = {};
var _workspacesInited = false;

// --- Workspace Registration ---

function registerWorkspace(config) {
  _workspaces[config.id] = config;
}

function activateWorkspace(id) {
  var prev = V.ui.activeWorkspace;
  if (prev === id && _workspacesInited) return;

  // Deactivate previous
  if (_workspaces[prev] && _workspaces[prev].deactivate) {
    _workspaces[prev].deactivate();
  }
  var prevEl = $('ws-' + prev);
  if (prevEl) prevEl.classList.remove('active');
  fire('workspace:deactivate', { id: prev });

  // Activate new
  V.ui.activeWorkspace = id;
  var el = $('ws-' + id);
  if (el) el.classList.add('active');

  if (_workspaces[id] && _workspaces[id].activate) {
    _workspaces[id].activate();
  }
  fire('workspace:activate', { id: id });

  // Update taskbar buttons
  var btns = qsa('.tb-app');
  for (var i = 0; i < btns.length; i++) {
    var isActive = btns[i].dataset.workspace === id;
    btns[i].classList.toggle('active', isActive);

    // Re-trigger SVG animation on the newly active tab
    if (isActive) {
      var svg = btns[i].querySelector('.tb-svg');
      if (svg) {
        svg.style.animation = 'none';
        svg.offsetHeight; // Force reflow
        svg.style.animation = '';
      }
    }
  }

  // Render the workspace
  renderWorkspace(id);
}

function renderWorkspace(id) {
  var ws = _workspaces[id || V.ui.activeWorkspace];
  if (ws && ws.render) ws.render();
  fire('render:workspace:' + (id || V.ui.activeWorkspace), V);
}

function initAllWorkspaces() {
  for (var id in _workspaces) {
    if (_workspaces[id].init) _workspaces[id].init();
  }
  _workspacesInited = true;
}

// --- Status Bar Updates ---

function renderStatusBar() {
  // Clock
  var clockEl = $('sb-clock');
  if (clockEl) clockEl.textContent = formatGameDateTime(V.time);

  // Viability
  var confEl = $('sb-viability');
  var confBar = $('sb-viability-bar');
  if (confEl) confEl.textContent = Math.round(V.resources.viability) + '%';
  if (confBar) {
    confBar.style.width = V.resources.viability + '%';
    if (V.resources.viability > 60) confBar.style.background = 'var(--green)';
    else if (V.resources.viability > 30) confBar.style.background = 'var(--amber)';
    else confBar.style.background = 'var(--red)';
  }

  // Intel
  var intelEl = $('sb-intel');
  if (intelEl) intelEl.textContent = V.resources.intel;

  // Threat level
  var threatEl = $('sb-threat');
  if (threatEl) {
    var tl = getGlobalThreatLevel();
    threatEl.textContent = tl.level;
    threatEl.style.color = tl.color;
    threatEl.style.borderColor = tl.color;
  }
}

function renderSpeedControls() {
  var btns = qsa('.speed-btn');
  for (var i = 0; i < btns.length; i++) {
    var spd = parseInt(btns[i].dataset.speed);
    btns[i].classList.toggle('active', spd === _speed);
    btns[i].classList.toggle('paused', spd === 0 && _speed === 0);
  }
}

function updateWorkspaceBadge(workspaceId, count) {
  var badge = $('badge-' + workspaceId);
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.add('visible');
  } else {
    badge.classList.remove('visible');
  }
}

// --- Hooks ---

hook('tick', function() {
  renderStatusBar();
  renderWorkspace();
}, 10);

hook('speed:change', function() {
  renderSpeedControls();
});

// --- Speed Control Click Handlers ---

function initSpeedControls() {
  var btns = qsa('.speed-btn');
  for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener('click', function() {
      setSpeed(parseInt(this.dataset.speed));
    });
  }
}

// --- Keyboard Shortcuts ---

function initKeyboard() {
  document.addEventListener('keydown', function(e) {
    // Don't handle if input focused
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    switch (e.key) {
      case '1': activateWorkspace('globe'); break;
      case '2': activateWorkspace('feed'); break;
      case '3': activateWorkspace('operations'); break;
      case '4': activateWorkspace('sitroom'); break;
      case '5': activateWorkspace('media'); break;
      case '6': activateWorkspace('diplomacy'); break;
      case ' ':
        e.preventDefault();
        togglePause();
        break;
      case '+':
      case '=':
        setSpeed(Math.min(_speed + 1, SPEED_TABLE.length - 1));
        break;
      case '-':
        setSpeed(Math.max(_speed - 1, 0));
        break;
    }
  });
}

// --- Game Start ---

function startGame() {
  // Switch screens
  $('screen-login').classList.remove('active');
  $('screen-main').classList.add('active');

  // Init workspaces
  initAllWorkspaces();
  initSpeedControls();
  initKeyboard();

  // Initial render
  renderStatusBar();
  renderSpeedControls();
  renderWorkspace('globe');

  // Start engine at default speed
  setSpeed(1);
  startEngine();

  fire('game:start', V);
  V.initialized = true;
  addLog('VIGIL system initialized. Operator ' + V.player.callsign + ' active.', 'log-info');
}
