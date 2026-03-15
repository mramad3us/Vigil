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
      updateWorkspaceBadge('media', getUnreadMediaCount());
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
      var readCls = story.read ? ' read' : '';

      html += '<div class="media-story' + readCls + '">' +
        '<div class="media-story-header">' +
          '<span class="media-source">' + story.source + '</span>' +
          '<span class="media-story-header-right">' +
            (story.read ? '' : '<button class="media-read-btn" onclick="markMediaRead(\'' + story.id + '\')">DISMISS</button>') +
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
    if (V.media.length > 100) V.media.length = 100;

    // Badge the media tab
    updateWorkspaceBadge('media', getUnreadMediaCount());

    return story;
  }

  function getUnreadMediaCount() {
    var count = 0;
    for (var i = 0; i < V.media.length; i++) {
      if (!V.media[i].read) count++;
    }
    return count;
  }

  window.markMediaRead = function(storyId) {
    for (var i = 0; i < V.media.length; i++) {
      if (V.media[i].id === storyId) {
        V.media[i].read = true;
        break;
      }
    }
    updateWorkspaceBadge('media', getUnreadMediaCount());
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

  var OVERT_OP_SUCCESS_HEADLINES = [
    'US military operation in {country} targets security threat',
    'Pentagon confirms successful operation near {city}',
    'US forces neutralize threat in {country}; no civilian casualties reported',
    'Military strike in {city} region draws international attention',
    'US special operations in {country}: Pentagon reports mission success',
  ];

  var OVERT_OP_SUCCESS_BODIES = [
    'The US Department of Defense has confirmed a military operation in {city}, {country}. A Pentagon spokesperson stated that the operation targeted a credible threat to national security and was carried out successfully. Details remain classified but sources indicate precision assets were employed to minimize collateral damage.',
    'US forces conducted an operation near {city} in what officials describe as a response to an imminent security threat. The operation involved multiple military assets and was coordinated with allied intelligence. The {country} government has not yet commented publicly.',
  ];

  var OVERT_OP_FAILURE_HEADLINES = [
    'US military operation in {country} reportedly fails to achieve objectives',
    'Questions raised after botched US operation near {city}',
    'Failed US operation in {country} sparks diplomatic tensions',
    '{country} condemns unauthorized US military action near {city}',
  ];

  var OVERT_OP_FAILURE_BODIES = [
    'A US military operation in {city}, {country} has reportedly failed to achieve its stated objectives. Details are scarce but sources indicate the operation encountered unexpected resistance. The incident is likely to strain diplomatic relations between Washington and {country}.',
    'The Pentagon has acknowledged an operation near {city} that did not go as planned. Congressional leaders are demanding a briefing on the incident. The {country} government has summoned the US ambassador for consultations.',
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

  // Operation resolved — only if overt assets involved
  hook('operation:resolved', function(data) {
    var op = data.operation;
    if (!op || !op.location) return;

    // Check for overt assets
    var hasOvert = false;
    if (op.assignedAssetIds) {
      for (var i = 0; i < op.assignedAssetIds.length; i++) {
        var asset = getAsset(op.assignedAssetIds[i]);
        if (asset && asset.deniability === 'OVERT') { hasOvert = true; break; }
      }
    }

    if (!hasOvert) return; // Covert ops stay hidden

    var vars = {
      city: op.location.city,
      country: op.location.country,
      theater: op.location.theater ? op.location.theater.name : '?',
    };

    if (op.status === 'SUCCESS') {
      generateMediaStory({
        headline: fillTemplate(pick(OVERT_OP_SUCCESS_HEADLINES), vars),
        body: fillTemplate(pick(OVERT_OP_SUCCESS_BODIES), vars),
        opId: op.id,
        sentiment: 'NEUTRAL',
      });
    } else {
      generateMediaStory({
        headline: fillTemplate(pick(OVERT_OP_FAILURE_HEADLINES), vars),
        body: fillTemplate(pick(OVERT_OP_FAILURE_BODIES), vars),
        opId: op.id,
        sentiment: 'NEGATIVE',
      });
    }
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
