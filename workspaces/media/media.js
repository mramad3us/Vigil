/* ============================================================
   VIGIL — workspaces/media/media.js
   Media workspace — story generation from game events,
   read-only news feed. 5th workspace tab.
   ============================================================ */

(function() {

  var MEDIA_SOURCES = ['AP', 'Reuters', 'BBC', 'CNN', 'Al Jazeera'];

  registerWorkspace({
    id: 'media',
    label: 'Media',
    icon: '▤',

    init: function() {
      var container = $('ws-media');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:100%;max-width:100%">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">MEDIA MONITORING</span>' +
              '<span class="ws-list-count" id="media-count"></span>' +
            '</div>' +
            '<div class="ws-list-body" id="media-list">' +
              '<div class="ws-detail-empty">No media stories yet</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderMediaList();
      updateWorkspaceBadge('media', V.media.length);
    },
  });

  // --- Render Media Feed ---

  function renderMediaList() {
    var listEl = $('media-list');
    var countEl = $('media-count');
    if (!listEl) return;

    if (!V.media || V.media.length === 0) {
      listEl.innerHTML = '<div class="ws-detail-empty" style="height:200px">No media coverage yet. Stories appear when threats manifest, overt operations resolve, or diplomatic incidents occur.</div>';
      if (countEl) countEl.textContent = '0 stories';
      return;
    }

    if (countEl) countEl.textContent = V.media.length + ' stor' + (V.media.length === 1 ? 'y' : 'ies');

    var html = '';
    for (var i = 0; i < V.media.length; i++) {
      var story = V.media[i];
      var sentimentCls = story.sentiment === 'NEGATIVE' ? 'negative' : story.sentiment === 'POSITIVE' ? 'positive' : 'neutral';

      html += '<div class="media-story">' +
        '<div class="media-story-header">' +
          '<span class="media-source">' + story.source + '</span>' +
          '<span class="media-story-header-right">' +
            '<button class="media-read-btn" onclick="dismissMediaStory(\'' + story.id + '\')">DISMISS</button>' +
            '<span class="media-timestamp">' + formatTimestamp(story.timestamp) + '</span>' +
          '</span>' +
        '</div>' +
        '<div class="media-headline ' + sentimentCls + '">' + story.headline + '</div>' +
        '<div class="media-body">' + story.body + '</div>' +
      '</div>';
    }

    listEl.innerHTML = html;
  }

  // --- Story Generation ---

  function generateMediaStory(data) {
    var story = {
      id: uid('MS'),
      headline: data.headline,
      body: data.body,
      source: pick(MEDIA_SOURCES),
      timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
      relatedOpId: data.opId || null,
      relatedThreatId: data.threatId || null,
      sentiment: data.sentiment || 'NEUTRAL',
    };

    V.media.unshift(story);
    if (V.media.length > 5) V.media.length = 5;

    // Badge the media tab
    updateWorkspaceBadge('media', V.media.length);

    return story;
  }

  window.dismissMediaStory = function(storyId) {
    for (var i = 0; i < V.media.length; i++) {
      if (V.media[i].id === storyId) {
        V.media.splice(i, 1);
        break;
      }
    }
    updateWorkspaceBadge('media', V.media.length);
    renderMediaList();
  };

  // --- Story Templates ---

  var MANIFEST_HEADLINES = [
    'Breaking: Attack in {city} leaves casualties',
    'Security incident in {city}, {country} under investigation',
    '{country} reels from coordinated attack in {city}',
    'Terror attack strikes {city}; authorities scramble to respond',
    'Explosion in {city} commercial district; casualties reported',
    'Armed assault in {city}: {country} declares state of emergency',
  ];

  var MANIFEST_BODIES = [
    'Reports emerging from {city} indicate a significant security incident has occurred. Local authorities have cordoned off the area and casualty reports are still coming in. No group has yet claimed responsibility. International security analysts are monitoring the situation closely.',
    'A coordinated attack in {city}, {country} has left the region in shock. Emergency services are on scene and hospitals are reporting multiple casualties. The government has convened an emergency security meeting. Sources say intelligence agencies had been tracking a potential threat in the region.',
    'Witnesses in {city} describe scenes of chaos following what appears to be a premeditated attack. {country} security forces have locked down the area. The US State Department has issued a travel advisory for the region.',
  ];

  // --- Foreign Military Op Templates ---

  var FOREIGN_OP_SUCCESS_HEADLINES = [
    'US military operation in {country} targets security threat',
    'Pentagon confirms successful operation near {city}',
    'US forces neutralize threat in {country}; no civilian casualties reported',
    'Military strike in {city} region draws international attention',
    'US special operations in {country}: Pentagon reports mission success',
  ];

  var FOREIGN_OP_SUCCESS_BODIES = [
    'The US Department of Defense has confirmed a military operation in {city}, {country}. A Pentagon spokesperson stated that the operation targeted a credible threat to national security and was carried out successfully. {assetContext}',
    'US forces conducted an operation near {city}, {country} in what officials describe as a response to an imminent security threat. {assetContext} The {country} government has not yet commented publicly.',
  ];

  var FOREIGN_OP_FAILURE_HEADLINES = [
    'US military operation in {country} reportedly fails to achieve objectives',
    'Questions raised after botched US operation near {city}',
    'Failed US operation in {country} sparks diplomatic tensions',
    '{country} condemns unauthorized US military action near {city}',
  ];

  var FOREIGN_OP_FAILURE_BODIES = [
    'A US military operation in {city}, {country} has reportedly failed to achieve its stated objectives. {assetContext} The incident is likely to strain diplomatic relations between Washington and {country}.',
    'The Pentagon has acknowledged an operation near {city} that did not go as planned. {assetContext} Congressional leaders are demanding a briefing on the incident.',
  ];

  // --- Domestic Sanctioned Op Templates ---

  var DOMESTIC_SUCCESS_HEADLINES = [
    '{agency} operation in {city} results in multiple arrests',
    'Federal authorities announce successful operation near {city}',
    '{agency} neutralizes security threat in {city}',
    'Law enforcement action in {city}: {agency} confirms suspects in custody',
    '{agency} disrupts plot in {city}; press conference scheduled',
  ];

  var DOMESTIC_SUCCESS_BODIES = [
    'The {agency} has announced the successful conclusion of a law enforcement operation in {city}. {assetContext} A spokesperson confirmed that the operation targeted a credible domestic security threat and resulted in arrests. Further details are expected at a press briefing later today.',
    'Federal authorities in {city} have concluded a major operation targeting a domestic security threat. {assetContext} The {agency} stated that all objectives were met and there were no civilian casualties. The investigation is ongoing.',
  ];

  var DOMESTIC_FAILURE_HEADLINES = [
    'Federal operation in {city} ends without arrests; questions mount',
    '{agency} operation near {city} falls short of objectives',
    'Suspects evade authorities in botched {city} raid',
    '{agency} acknowledges setback in {city} operation',
  ];

  var DOMESTIC_FAILURE_BODIES = [
    'A federal law enforcement operation in {city} has failed to achieve its objectives according to sources familiar with the matter. {assetContext} The {agency} has declined to comment on specifics but acknowledged the operation did not proceed as planned. Congressional oversight committees have been notified.',
    'An operation led by the {agency} near {city} has reportedly ended without the intended outcome. {assetContext} Officials are reviewing what went wrong. Civil liberties groups are demanding transparency regarding the scope of the operation.',
  ];

  // --- Domestic Covert Military Op Templates (Posse Comitatus violation) ---

  var DOMESTIC_COVERT_SUCCESS_HEADLINES = [
    'Sources report classified federal operation near {city}',
    'Unexplained security activity in {city} draws speculation',
  ];

  var DOMESTIC_COVERT_SUCCESS_BODIES = [
    'Residents near {city} reported unusual security activity in the area. Federal authorities have declined to comment. Unconfirmed reports suggest a classified operation may have been conducted, though no agency has claimed responsibility.',
  ];

  var DOMESTIC_COVERT_FAILURE_HEADLINES = [
    'Mysterious federal activity near {city} raises questions',
    'Unidentified operation in {city} reportedly goes wrong',
  ];

  var DOMESTIC_COVERT_FAILURE_BODIES = [
    'Reports of an unidentified security operation near {city} have raised questions after witnesses described a chaotic scene. No federal agency has claimed responsibility. Local law enforcement says they were not informed in advance.',
  ];

  var DIPLOMATIC_HEADLINES = [
    '{country} recalls ambassador over sovereignty violation',
    'Diplomatic crisis: {country} condemns unauthorized US military presence',
    'US-{country} relations plummet after military incident',
    '{country} demands explanation for unauthorized operations on its soil',
    'International outcry as US forces operate without permission in {country}',
  ];

  var DIPLOMATIC_BODIES = [
    'Relations between the United States and {country} have deteriorated sharply following what {country} officials describe as an unauthorized military operation on sovereign territory. The {country} foreign ministry has issued a formal protest and recalled its ambassador from Washington for consultations.',
    'The diplomatic fallout from US military operations in {country} continues to grow. Allied nations have expressed concern over the unilateral action, and the UN Security Council is expected to address the incident. Analysts warn this could have lasting implications for US security partnerships in the region.',
  ];

  // --- Story Generation Hooks ---

  // Threat manifestation — always covered
  hook('threat:manifest', function(data) {
    if (!data || !data.threat) {
      // Try from feed data
      return;
    }
  });

  // Hook into threat manifestation via the existing system
  // We need to hook into when manifestThreat is called
  // Use a tick hook that checks for newly manifested threats
  var _lastManifestCheck = {};

  hook('tick', function() {
    for (var i = 0; i < V.threats.length; i++) {
      var t = V.threats[i];
      if (t.status === 'MANIFESTED' && !_lastManifestCheck[t.id]) {
        _lastManifestCheck[t.id] = true;
        var vars = {
          city: t.location.city,
          country: t.location.country,
          theater: t.location.theater ? t.location.theater.name : '?',
        };
        generateMediaStory({
          headline: fillTemplate(pick(MANIFEST_HEADLINES), vars),
          body: fillTemplate(pick(MANIFEST_BODIES), vars),
          threatId: t.id,
          sentiment: 'NEGATIVE',
        });
      }
    }
  }, 12);

  // Operation resolved — generate context-appropriate media coverage
  hook('operation:resolved', function(data) {
    var op = data.operation;
    if (!op || !op.location) return;

    // No assets deployed — op never happened operationally, no media coverage
    if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return;

    // Classify deployed assets
    var hasOvert = false;
    var hasDomesticAuth = false;
    var assetNames = [];
    var agencies = {};
    for (var i = 0; i < op.assignedAssetIds.length; i++) {
      var asset = getAsset(op.assignedAssetIds[i]);
      if (!asset) continue;
      if (asset.deniability === 'OVERT') hasOvert = true;
      if (asset.domesticAuthority) hasDomesticAuth = true;
      assetNames.push(asset.name);
      // Extract agency from asset name (e.g. "FBI HRT" → "FBI")
      var agencyMatch = asset.name.match(/^(FBI|DEA|ATF|DHS|USCG|USMS|CBP|Secret Service|Treasury)/i);
      if (agencyMatch) agencies[agencyMatch[1].toUpperCase()] = true;
    }

    // Covert ops with no overt footprint — no media coverage
    if (!hasOvert) return;

    var isDomestic = op.domestic;
    var agencyList = Object.keys(agencies);
    var primaryAgency = agencyList.length > 0 ? agencyList[0] : 'FBI';

    var vars = {
      city: op.location.city,
      country: op.location.country,
      theater: op.location.theater ? op.location.theater.name : '?',
      agency: primaryAgency,
      assetContext: '',
    };

    // Build asset context string for body templates
    if (isDomestic && hasDomesticAuth) {
      // Sanctioned domestic — agencies are public about it
      if (assetNames.length === 1) {
        vars.assetContext = 'The operation was conducted by ' + assetNames[0] + '.';
      } else {
        vars.assetContext = 'The operation involved ' + assetNames.join(', ') + ' in a coordinated response.';
      }
    } else if (isDomestic) {
      // Unsanctioned domestic (covert military on US soil) — vague coverage
      vars.assetContext = 'Details about the forces involved remain unclear. No federal agency has claimed the operation.';
    } else {
      // Foreign military — Pentagon framing, assets described generically
      var catCounts = {};
      for (var j = 0; j < op.assignedAssetIds.length; j++) {
        var a = getAsset(op.assignedAssetIds[j]);
        if (a) catCounts[a.category] = (catCounts[a.category] || 0) + 1;
      }
      var catDescs = [];
      if (catCounts.SOF) catDescs.push('special operations forces');
      if (catCounts.AIR) catDescs.push('air assets');
      if (catCounts.NAVY) catDescs.push('naval forces');
      if (catCounts.ISR) catDescs.push('intelligence platforms');
      if (catCounts.GROUND) catDescs.push('ground forces');
      vars.assetContext = catDescs.length > 0
        ? 'The operation reportedly involved ' + catDescs.join(' and ') + '.'
        : 'Details of the forces involved remain classified.';
    }

    var headlines, bodies, sentiment;

    if (isDomestic && hasDomesticAuth) {
      // Sanctioned domestic law enforcement op
      if (op.status === 'SUCCESS') {
        headlines = DOMESTIC_SUCCESS_HEADLINES;
        bodies = DOMESTIC_SUCCESS_BODIES;
        sentiment = 'NEUTRAL';
      } else {
        headlines = DOMESTIC_FAILURE_HEADLINES;
        bodies = DOMESTIC_FAILURE_BODIES;
        sentiment = 'NEGATIVE';
      }
    } else if (isDomestic) {
      // Unsanctioned covert military on US soil — minimal, vague coverage
      if (op.status === 'SUCCESS') {
        headlines = DOMESTIC_COVERT_SUCCESS_HEADLINES;
        bodies = DOMESTIC_COVERT_SUCCESS_BODIES;
        sentiment = 'NEUTRAL';
      } else {
        headlines = DOMESTIC_COVERT_FAILURE_HEADLINES;
        bodies = DOMESTIC_COVERT_FAILURE_BODIES;
        sentiment = 'NEGATIVE';
      }
    } else {
      // Foreign military operation
      if (op.status === 'SUCCESS') {
        headlines = FOREIGN_OP_SUCCESS_HEADLINES;
        bodies = FOREIGN_OP_SUCCESS_BODIES;
        sentiment = 'NEUTRAL';
      } else {
        headlines = FOREIGN_OP_FAILURE_HEADLINES;
        bodies = FOREIGN_OP_FAILURE_BODIES;
        sentiment = 'NEGATIVE';
      }
    }

    generateMediaStory({
      headline: fillTemplate(pick(headlines), vars),
      body: fillTemplate(pick(bodies), vars),
      opId: op.id,
      sentiment: sentiment,
    });
  });

  // Diplomatic incidents
  hook('diplomatic:incident', function(data) {
    if (!data || !data.country) return;

    var vars = { country: data.country };

    // Get op location for city if available
    if (data.op && data.op.location) {
      vars.city = data.op.location.city;
    } else {
      vars.city = data.country;
    }

    generateMediaStory({
      headline: fillTemplate(pick(DIPLOMATIC_HEADLINES), vars),
      body: fillTemplate(pick(DIPLOMATIC_BODIES), vars),
      opId: data.op ? data.op.id : null,
      sentiment: 'NEGATIVE',
    });
  });

})();
