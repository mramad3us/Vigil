/* ============================================================
   VIGIL — ui/notifications.js
   Alert routing, badge counts, feed push.
   ============================================================ */

function pushFeedItem(feedItem) {
  V.feed.unshift(feedItem);
  pruneFeed();

  // Badge the feed tab with active threat count
  var intelThreatCount = typeof getIntelThreats === 'function' ? getIntelThreats().length : 0;
  updateWorkspaceBadge('feed', intelThreatCount);

  // Critical alerts get urgent overlay + auto-pause
  if (feedItem.severity === 'CRITICAL') {
    queueUrgentAlert(feedItem);
    if (_speed > 0) {
      V.ui.lastSpeed = _speed;
      setSpeed(0);
    }
  }

  fire('alert:incoming', { item: feedItem });

  // Render feed if active
  if (V.ui.activeWorkspace === 'feed') {
    renderWorkspace('feed');
  }
}

// --- Badge update on workspace switch ---

hook('workspace:activate', function(data) {
  if (data.id === 'feed') {
    // Don't clear badges on activate — user sees the items
  }
});

// --- Periodic badge updates ---

hook('tick', function() {
  var intelThreatBadge = typeof getIntelThreats === 'function' ? getIntelThreats().length : 0;
  updateWorkspaceBadge('feed', intelThreatBadge);
  updateWorkspaceBadge('operations', getActiveOpsCount());
  updateWorkspaceBadge('sitroom', getActiveCrisesCount());
}, 50);

// --- Vigil urgency pop-ups for ops nearing expiration ---
hook('tick', function() {
  if (!V.operations) return;
  var now = V.time.totalMinutes;

  for (var i = 0; i < V.operations.length; i++) {
    var op = V.operations[i];
    if (op.status !== 'OPTIONS_PRESENTED' || !op.expiresAt) continue;

    var remaining = op.expiresAt - now;
    var totalWindow = op.urgencyHours * 60;
    var pctRemaining = totalWindow > 0 ? (remaining / totalWindow) : 1;
    var hoursLeft = Math.max(1, Math.round(remaining / 60));

    // 20% remaining — urgent popup
    if (pctRemaining <= 0.2 && remaining > 0 && !op._opsUrgencyAlerted) {
      op._opsUrgencyAlerted = true;

      var opsUrgencyMessages = [
        'Operation ' + op.codename + ' requires immediate approval. ' + hoursLeft + ' hours remain before the operational window closes. ' +
          'Vigil has ' + op.options.length + ' deployment options awaiting your selection.',
        'URGENT: ' + op.codename + ' — operational window closing in approximately ' + hoursLeft + 'h. ' +
          'Vigil recommends immediate operator action. Failure to approve will result in operation expiration.',
        'Time-critical: Operation ' + op.codename + ' in ' + op.location.city + ', ' + op.location.country + '. ' +
          'Approval required within ' + hoursLeft + ' hours. The threat will go unaddressed if the window expires.',
      ];

      queueUrgentAlert({
        id: uid('FI'),
        type: 'VIGIL_ALERT',
        severity: 'CRITICAL',
        header: 'APPROVAL URGENCY: ' + op.codename,
        body: pick(opsUrgencyMessages),
        timestamp: { day: V.time.day, hour: V.time.hour, minute: Math.floor(V.time.minutes) },
        read: false,
        opId: op.id,
        geo: op.geo,
      });
    }
  }
}, 51);

// --- Feed Pruning ---
// Keep all unread items + last 50 read items.
function pruneFeed() {
  var readCount = 0;
  for (var i = V.feed.length - 1; i >= 0; i--) {
    if (V.feed[i].read) {
      readCount++;
      if (readCount > 50) {
        V.feed.splice(i, 1);
      }
    }
  }
}
