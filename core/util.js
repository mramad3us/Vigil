/* ============================================================
   VIGIL — core/util.js
   Shared utility functions. Evolved from Faux13's util patterns.
   ============================================================ */

// --- Random & Selection ---

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick(arr) {
  const total = arr.reduce((s, x) => s + (x.weight || 1), 0);
  let r = Math.random() * total;
  for (const x of arr) {
    r -= (x.weight || 1);
    if (r <= 0) return x;
  }
  return arr[arr.length - 1];
}

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}

function randFloat(a, b) {
  return a + Math.random() * (b - a);
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// --- Unique IDs ---

const _uidCounters = {};
function uid(prefix) {
  _uidCounters[prefix] = (_uidCounters[prefix] || 0) + 1;
  return prefix + '_' + _uidCounters[prefix];
}

// --- Template Engine (evolved from Faux13) ---

function fillTemplate(tpl, vars) {
  if (!tpl) return '';
  let result = tpl;
  for (let pass = 0; pass < 2; pass++) {
    result = result.replace(/\{(\w+)\}/g, function(_, key) {
      return vars[key] !== undefined ? vars[key] : '{' + key + '}';
    });
  }
  return result;
}

function resolveVars(varsTemplate, baseVars) {
  const resolved = Object.assign({}, baseVars);
  for (const k in varsTemplate) {
    if (!varsTemplate.hasOwnProperty(k)) continue;
    const v = varsTemplate[k];
    if (Array.isArray(v)) {
      resolved[k] = pick(v);
    } else if (typeof v === 'function') {
      resolved[k] = v();
    } else {
      resolved[k] = v;
    }
  }
  // Resolve nested placeholders within resolved values
  for (const k in resolved) {
    if (typeof resolved[k] === 'string' && resolved[k].indexOf('{') >= 0) {
      resolved[k] = fillTemplate(resolved[k], resolved);
    }
  }
  return resolved;
}

function generateReport(sections, vars) {
  return sections.map(function(section) {
    var tpl = Array.isArray(section) ? pick(section) : section;
    return fillTemplate(tpl, vars);
  });
}

// --- Date & Time Formatting ---

const MONTH_NAMES = [
  'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
  'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
];

const MONTH_FULL = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function dayToDate(day, startYear, startMonth) {
  var y = startYear || 2052;
  var m = (startMonth || 1) - 1;
  var d = day;
  while (d > DAYS_IN_MONTH[m]) {
    d -= DAYS_IN_MONTH[m];
    m++;
    if (m >= 12) { m = 0; y++; }
  }
  return { year: y, month: m, dayOfMonth: d };
}

function formatGameDate(time) {
  var dt = dayToDate(time.day, time.year, time.month);
  return dt.dayOfMonth + ' ' + MONTH_NAMES[dt.month] + ' ' + dt.year;
}

function formatGameDateFull(time) {
  var dt = dayToDate(time.day, time.year, time.month);
  return MONTH_FULL[dt.month] + ' ' + dt.dayOfMonth + ', ' + dt.year;
}

function formatGameTime(time) {
  var h = Math.floor(time.hour);
  var m = Math.floor(time.minutes);
  return String(h).padStart(2, '0') + String(m).padStart(2, '0');
}

function formatGameDateTime(time) {
  return formatGameTime(time) + ' · ' + formatGameDate(time);
}

function formatTimestamp(ts) {
  return String(ts.hour).padStart(2, '0') + String(ts.minute || 0).padStart(2, '0') +
    ' · DAY ' + ts.day;
}

// --- DOM Helpers ---

function $(id) {
  return document.getElementById(id);
}

function qs(sel, parent) {
  return (parent || document).querySelector(sel);
}

function qsa(sel, parent) {
  return (parent || document).querySelectorAll(sel);
}

function el(tag, cls, html) {
  var e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html !== undefined) e.innerHTML = html;
  return e;
}

function applyFlash(elem, cls) {
  elem.classList.remove('flash-green', 'flash-red', 'flash-amber', 'flash-blue');
  void elem.offsetWidth;
  elem.classList.add(cls);
  elem.addEventListener('animationend', function handler() {
    elem.classList.remove(cls);
    elem.removeEventListener('animationend', handler);
  });
}

function applyAnimClass(elem, cls, duration) {
  elem.classList.add(cls);
  var dur = duration || 600;
  setTimeout(function() { elem.classList.remove(cls); }, dur);
}
