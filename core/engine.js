/* ============================================================
   VIGIL — core/engine.js
   Hook system (evolved from Faux13) + tick engine with
   variable speed control.
   ============================================================ */

// --- Hook System ---

const _hooks = {};
let _hookId = 0;

function hook(name, fn, priority) {
  var id = ++_hookId;
  var entry = { id: id, fn: fn, priority: priority || 100 };
  var list = _hooks[name] = _hooks[name] || [];
  list.push(entry);
  list.sort(function(a, b) { return a.priority - b.priority; });
  return id;
}

function hookOnce(name, fn, priority) {
  var id = hook(name, function wrapper(data) {
    unhook(name, id);
    fn(data);
  }, priority);
  return id;
}

function unhook(name, id) {
  var list = _hooks[name];
  if (!list) return;
  var idx = list.findIndex(function(e) { return e.id === id; });
  if (idx >= 0) list.splice(idx, 1);
}

function fire(name, data) {
  var list = _hooks[name];
  if (!list) return;
  for (var i = 0; i < list.length; i++) {
    list[i].fn(data);
  }
}

// --- Speed Configuration ---

var SPEED_TABLE = [
  { id: 0, label: 'PAUSED',    minutesPerTick: 0,   icon: '⏸' },
  { id: 1, label: 'REAL-TIME', minutesPerTick: 1,   icon: '▶' },
  { id: 2, label: '1H/S',      minutesPerTick: 60,  icon: '▶▶' },
  { id: 3, label: '12H/S',     minutesPerTick: 720, icon: '▶▶▶' },
];

// --- Tick Engine ---

var _tickInterval = null;
var _speed = 0;
var _engineRunning = false;

function getSpeed() { return _speed; }
function getSpeedConfig() { return SPEED_TABLE[_speed]; }

function setSpeed(speed) {
  var prev = _speed;
  _speed = clamp(speed, 0, SPEED_TABLE.length - 1);

  if (_speed !== prev) {
    V.ui.speed = _speed;
    fire('speed:change', { prev: prev, current: _speed });
  }

  if (_speed === 0) {
    if (_tickInterval) {
      clearInterval(_tickInterval);
      _tickInterval = null;
    }
    if (prev !== 0) fire('game:paused', {});
  } else {
    if (!_tickInterval && _engineRunning) {
      _tickInterval = setInterval(tick, 1000);
    }
    if (prev === 0) fire('game:resumed', {});
  }
}

function togglePause() {
  if (_speed === 0) {
    setSpeed(V.ui.lastSpeed || 1);
  } else {
    V.ui.lastSpeed = _speed;
    setSpeed(0);
  }
}

function startEngine() {
  _engineRunning = true;
  if (_speed > 0 && !_tickInterval) {
    _tickInterval = setInterval(tick, 1000);
  }
  fire('engine:start', {});
}

function stopEngine() {
  _engineRunning = false;
  if (_tickInterval) {
    clearInterval(_tickInterval);
    _tickInterval = null;
  }
  fire('engine:stop', {});
}

function tick() {
  if (_speed === 0 || !_engineRunning) return;

  var cfg = SPEED_TABLE[_speed];
  var minutesToAdd = cfg.minutesPerTick;
  if (minutesToAdd <= 0) return;

  var prevDay = V.time.day;
  var prevHour = V.time.hour;
  var prevWeek = Math.floor((V.time.day - 1) / 7);

  // Advance game clock
  V.time.minutes += minutesToAdd;

  while (V.time.minutes >= 60) {
    V.time.minutes -= 60;
    V.time.hour++;
  }

  while (V.time.hour >= 24) {
    V.time.hour -= 24;
    V.time.day++;
  }

  V.time.totalMinutes += minutesToAdd;

  // Fire tick event every second
  fire('tick', { minutesElapsed: minutesToAdd, speed: _speed });

  // Fire periodic hooks when boundaries are crossed
  // At high speeds, multiple hours pass per tick — fire tick:hour for each
  var totalPrevHours = (prevDay - 1) * 24 + prevHour;
  var totalCurHours = (V.time.day - 1) * 24 + V.time.hour;
  var hoursElapsed = totalCurHours - totalPrevHours;

  if (hoursElapsed > 0) {
    for (var h = 0; h < hoursElapsed; h++) {
      var absHour = totalPrevHours + h + 1;
      fire('tick:hour', {
        hour: absHour % 24,
        day: Math.floor(absHour / 24) + 1,
        isMultiHour: hoursElapsed > 1
      });
    }
  }

  // Day boundary — may fire multiple times at VERY FAST speed
  if (V.time.day !== prevDay) {
    var daysElapsed = V.time.day - prevDay;
    for (var d = 0; d < daysElapsed; d++) {
      fire('tick:day', {
        day: prevDay + d + 1,
        prevDay: prevDay + d,
        isMultiDay: daysElapsed > 1
      });
    }
    V.playStats.totalDaysPlayed += daysElapsed;
  }

  // Week boundary
  var currentWeek = Math.floor((V.time.day - 1) / 7);
  if (currentWeek !== prevWeek) {
    fire('tick:week', { week: currentWeek, prevWeek: prevWeek });
  }
}
