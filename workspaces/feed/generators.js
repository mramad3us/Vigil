/* ============================================================
   VIGIL — workspaces/feed/generators.js
   Procedural alert/briefing generation from templates.
   ============================================================ */

function generateFeedItem(type, context) {
  var template = FEED_TEMPLATES[type];
  if (!template) return null;

  var ctx = context || {};
  var loc = ctx.location || generateRandomLocation();

  var baseVars = {
    region: ctx.region || (loc.theater ? loc.theater.name : 'UNKNOWN'),
    city: ctx.city || loc.city || 'Unknown',
    country: ctx.country || loc.country || 'Unknown',
    date: formatGameDate(V.time),
  };

  // Add context vars
  for (var k in ctx) {
    if (ctx.hasOwnProperty(k) && baseVars[k] === undefined) {
      baseVars[k] = ctx[k];
    }
  }

  var vars = resolveVars(template.vars || {}, baseVars);

  var header = fillTemplate(pick(template.headers), vars);
  var body = fillTemplate(pick(template.bodies), vars);
  var severity = Array.isArray(template.severity) ? pick(template.severity) : template.severity;

  return {
    id: uid('FI'),
    type: type,
    severity: severity,
    header: header,
    body: body,
    timestamp: {
      day: V.time.day,
      hour: V.time.hour,
      minute: Math.floor(V.time.minutes),
    },
    read: false,
    geo: { lat: loc.lat, lon: loc.lon },
    theaterId: loc.theaterId || null,
  };
}

// --- Periodic feed generation ---

(function() {

  // Generate situation reports every 3 days
  hook('tick:day', function(data) {
    if (data.day % 3 === 0) {
      var theater = getRandomTheater();
      var loc = pick(theater.cities);
      var item = generateFeedItem('SITUATION_UPDATE', {
        location: {
          theater: theater,
          theaterId: theater.id,
          city: loc.city,
          country: loc.country,
          lat: loc.lat,
          lon: loc.lon,
        },
        region: theater.name,
      });
      if (item) pushFeedItem(item);
    }
  });

  // Random intel reports every 1-2 days
  hook('tick:day', function(data) {
    if (Math.random() < 0.6) {
      var types = ['SIGINT_INTERCEPT', 'HUMINT_REPORT', 'IMAGERY_ANALYSIS', 'ANALYST_NOTE'];
      var type = pick(types);
      var item = generateFeedItem(type);
      if (item) pushFeedItem(item);
    }
  });

  // Generate initial feed items on game start
  hook('game:start', function() {
    // Welcome briefing
    var welcome = {
      id: uid('FI'),
      type: 'SYSTEM',
      severity: 'ROUTINE',
      header: 'VIGIL SYSTEM — OPERATOR BRIEFING',
      body: 'Welcome, Operator ' + V.player.callsign + '. Vigil is online and monitoring ' +
        Object.keys(THEATERS).length + ' global theaters. Current global threat level: ' +
        getGlobalThreatLevel().level + '. ' +
        V.threats.length + ' active threats detected. ' +
        V.operations.length + ' operations pending review. ' +
        'All departments are reporting nominal capacity. Your decisions shape the outcome.',
      timestamp: { day: V.time.day, hour: V.time.hour, minute: 0 },
      read: false,
      geo: null,
    };
    V.feed.unshift(welcome);

    // A few initial intel items
    for (var i = 0; i < 3; i++) {
      var types = ['SIGINT_INTERCEPT', 'IMAGERY_ANALYSIS', 'ANALYST_NOTE'];
      var item = generateFeedItem(pick(types));
      if (item) {
        item.timestamp.minute = i * 5;
        V.feed.push(item);
      }
    }
  }, 200);

})();
