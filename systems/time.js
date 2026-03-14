/* ============================================================
   VIGIL — systems/time.js
   Game clock display and date helpers.
   ============================================================ */

function getGameDate() {
  return dayToDate(V.time.day, V.time.year, V.time.month);
}

function getGameWeekday() {
  var days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  return days[(V.time.day - 1) % 7];
}

function isNightTime() {
  return V.time.hour < 6 || V.time.hour >= 22;
}

function getTimeOfDay() {
  var h = V.time.hour;
  if (h < 6) return 'NIGHT';
  if (h < 12) return 'MORNING';
  if (h < 18) return 'AFTERNOON';
  if (h < 22) return 'EVENING';
  return 'NIGHT';
}

function daysUntil(targetDay) {
  return Math.max(0, targetDay - V.time.day);
}
