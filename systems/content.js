/* ============================================================
   VIGIL — systems/content.js
   Procedural content generation: codenames, org names,
   personnel, locations.
   ============================================================ */

function generateCodename() {
  for (var i = 0; i < 200; i++) {
    var c = pick(CODENAME_ADJ) + ' ' + pick(CODENAME_NOUN);
    if (!V.usedCodenames.has(c)) {
      V.usedCodenames.add(c);
      return c;
    }
  }
  return 'OP-' + V.opIdCounter;
}

function generateOrgName() {
  var _usedOrgNames = new Set();
  for (var i = 0; i < V.threats.length; i++) {
    if (V.threats[i].orgName) _usedOrgNames.add(V.threats[i].orgName);
  }

  for (var j = 0; j < 80; j++) {
    var name = 'The ' + pick(ORG_NAME_ADJ) + ' ' + pick(ORG_NAME_NOUN);
    if (!_usedOrgNames.has(name)) return name;
  }
  return 'The ' + pick(ORG_NAME_ADJ) + ' ' + pick(ORG_NAME_NOUN) + ' ' + randInt(2, 9);
}

function generatePersonnelAlias() {
  return pick(PERSONNEL_ALIASES);
}

function generateSourceCode() {
  var prefixes = ['SRC', 'AST', 'CNT', 'AGT'];
  return pick(prefixes) + '-' + pick(PERSONNEL_ALIASES) + '-' + randInt(100, 999);
}

function generateCaseFileId() {
  var letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  return letters[randInt(0, letters.length - 1)] +
    letters[randInt(0, letters.length - 1)] + '-' +
    randInt(1000, 9999);
}

function generateRandomLocation() {
  var theater = getRandomTheater();
  var city = pick(theater.cities);
  return {
    theater: theater,
    theaterId: theater.id,
    city: city.city,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
}

function generateLocationInTheater(theaterId) {
  var theater = getTheater(theaterId);
  if (!theater) return generateRandomLocation();
  var city = pick(theater.cities);
  return {
    theater: theater,
    theaterId: theater.id,
    city: city.city,
    country: city.country,
    lat: city.lat,
    lon: city.lon,
  };
}
