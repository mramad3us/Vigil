/* ============================================================
   VIGIL — ui/notifications.js
   Alert routing, badge counts, feed push.
   ============================================================ */

function pushFeedItem(feedItem) {
  V.feed.unshift(feedItem);
  if (V.feed.length > 500) V.feed.length = 500;

  // Badge the feed tab
  updateWorkspaceBadge('feed', getUnreadFeedCount());

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
  updateWorkspaceBadge('feed', getUnreadFeedCount());
  updateWorkspaceBadge('operations', getActiveOpsCount());
  updateWorkspaceBadge('sitroom', getActiveCrisesCount());
}, 50);
