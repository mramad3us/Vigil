/* ============================================================
   VIGIL — core/state.js
   Global state object (V). Evolved from Faux13's G.
   Single source of truth for all game data.
   ============================================================ */

var V = {};

function initState() {
  V.version = '0.1.0';

  // Time
  V.time = {
    day: 1,
    hour: 8,
    minutes: 0,
    totalMinutes: 0,
    year: 2052,
    month: 1,
  };

  // Player
  V.player = {
    callsign: '',
    clearance: 'COSMIC TOP SECRET',
  };

  // Resources
  V.resources = {
    confidence: 70,
    budget: 100,
    intel: 0,
    xp: 0,
  };

  // Departments
  V.departments = {};
  if (typeof DEPT_CONFIG !== 'undefined') {
    for (var i = 0; i < DEPT_CONFIG.length; i++) {
      var dc = DEPT_CONFIG[i];
      V.departments[dc.id] = {
        id: dc.id,
        capacity: dc.baseCapacity,
        maxCapacity: dc.maxCapacity,
      };
    }
  }

  // Operations
  V.operations = [];
  V.opIdCounter = 0;
  V.usedCodenames = new Set();

  // Intelligence Feed
  V.feed = [];
  V.feedIdCounter = 0;

  // Threats
  V.threats = [];
  V.threatIdCounter = 0;

  // Crises
  V.crises = [];
  V.crisisIdCounter = 0;

  // Events
  V.events = {
    activeEffects: [],
    history: [],
    nextEventDay: 3,
  };

  // Geopolitics
  V.theaters = {};
  if (typeof THEATERS !== 'undefined') {
    for (var tid in THEATERS) {
      V.theaters[tid] = {
        risk: THEATERS[tid].baseRisk,
        volatility: THEATERS[tid].volatility,
        activeEvents: [],
        eventCount: 0,
      };
    }
  }

  // Globe
  V.globe = {
    cameraPosition: null,
    activeLayers: ['threats', 'operations'],
    selectedEntity: null,
  };

  // UI
  V.ui = {
    activeWorkspace: 'globe',
    speed: 2,
    lastSpeed: 2,
    notifications: [],
  };

  // Log
  V.log = [];

  // Play stats
  V.playStats = {
    opsCompleted: 0,
    opsSucceeded: 0,
    opsFailed: 0,
    totalDaysPlayed: 0,
    threatsNeutralized: 0,
    crisesResolved: 0,
  };
}

// --- Computed Accessors (never cached — Faux13 pattern) ---

function deptAllocated(deptId) {
  var n = 0;
  for (var i = 0; i < V.operations.length; i++) {
    var op = V.operations[i];
    if (op.status === 'INVESTIGATING' && op.assignedDept === deptId) n++;
    if (op.status === 'EXECUTING') {
      var depts = op.assignedExecDepts || [];
      for (var j = 0; j < depts.length; j++) {
        if (depts[j] === deptId) n++;
      }
    }
  }
  return n;
}

function deptAvail(deptId) {
  var d = V.departments[deptId];
  if (!d) return 0;
  return Math.max(0, d.capacity - deptAllocated(deptId));
}

function deptCapacity(deptId) {
  var d = V.departments[deptId];
  return d ? d.capacity : 0;
}

function getOp(id) {
  for (var i = 0; i < V.operations.length; i++) {
    if (V.operations[i].id === id) return V.operations[i];
  }
  return null;
}

function getThreat(id) {
  for (var i = 0; i < V.threats.length; i++) {
    if (V.threats[i].id === id) return V.threats[i];
  }
  return null;
}

function getCrisis(id) {
  for (var i = 0; i < V.crises.length; i++) {
    if (V.crises[i].id === id) return V.crises[i];
  }
  return null;
}

function addLog(text, cls) {
  V.log.unshift({ text: text, cls: cls || '', day: V.time.day, hour: V.time.hour });
  if (V.log.length > 200) V.log.length = 200;
}

function getUnreadFeedCount() {
  var n = 0;
  for (var i = 0; i < V.feed.length; i++) {
    if (!V.feed[i].read) n++;
  }
  return n;
}

function getActiveOpsCount() {
  var n = 0;
  for (var i = 0; i < V.operations.length; i++) {
    var s = V.operations[i].status;
    if (s !== 'SUCCESS' && s !== 'FAILURE' && s !== 'ARCHIVED' && s !== 'EXPIRED') n++;
  }
  return n;
}

function getActiveCrisesCount() {
  var n = 0;
  for (var i = 0; i < V.crises.length; i++) {
    if (!V.crises[i].resolved) n++;
  }
  return n;
}

function getGlobalThreatLevel() {
  var maxRisk = 0;
  for (var tid in V.theaters) {
    if (V.theaters[tid].risk > maxRisk) maxRisk = V.theaters[tid].risk;
  }
  if (maxRisk >= 5) return { level: 'CRITICAL', color: 'var(--red)' };
  if (maxRisk >= 4) return { level: 'SEVERE', color: 'var(--severity-high)' };
  if (maxRisk >= 3) return { level: 'ELEVATED', color: 'var(--amber)' };
  if (maxRisk >= 2) return { level: 'GUARDED', color: 'var(--accent)' };
  return { level: 'LOW', color: 'var(--green)' };
}
