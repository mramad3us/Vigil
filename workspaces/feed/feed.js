/* ============================================================
   VIGIL — workspaces/feed/feed.js
   Intelligence feed workspace: scrolling list, filters, detail.
   ============================================================ */

(function() {

  var _selectedFeedId = null;
  var _feedFilter = 'ALL';
  var _renderedIds = {};

  registerWorkspace({
    id: 'feed',
    label: 'Intel Feed',
    icon: '⫘',

    init: function() {
      var container = $('ws-feed');
      container.innerHTML =
        '<div class="ws-two-pane">' +
          '<div class="ws-list-pane" style="width:320px;max-width:400px">' +
            '<div class="ws-list-header">' +
              '<span class="ws-list-title">INTELLIGENCE FEED</span>' +
              '<span class="ws-list-count" id="feed-count"></span>' +
            '</div>' +
            '<div class="ws-toolbar" id="feed-toolbar"></div>' +
            '<div class="ws-list-body" id="feed-list"></div>' +
          '</div>' +
          '<div class="ws-detail-pane">' +
            '<div class="ws-detail-body" id="feed-detail">' +
              '<div class="ws-detail-empty">Select an intelligence item to view details</div>' +
            '</div>' +
          '</div>' +
        '</div>';
    },

    activate: function() {},
    deactivate: function() {},

    render: function() {
      renderFeedList();
      renderFeedToolbar();
      if (_selectedFeedId) renderFeedDetail(_selectedFeedId);
    },
  });

  // --- Feed List ---

  function renderFeedList() {
    var listEl = $('feed-list');
    var countEl = $('feed-count');
    if (!listEl) return;

    var items = getFilteredFeed();
    if (countEl) countEl.textContent = items.length + ' items';

    var html = '';
    for (var i = 0; i < items.length && i < 100; i++) {
      var item = items[i];
      var severityCls = (item.severity || 'routine').toLowerCase();
      var selectedCls = item.id === _selectedFeedId ? ' selected' : '';
      var unreadCls = item.read ? '' : ' unread';

      var newCls = _renderedIds[item.id] ? '' : ' new-item';

      html += '<div class="feed-item' + selectedCls + unreadCls + newCls + '" onclick="selectFeedItem(\'' + item.id + '\')">' +
        '<div class="feed-severity ' + severityCls + '"></div>' +
        '<div class="feed-item-content">' +
          '<div class="feed-item-header">' + item.header + '</div>' +
          '<div class="feed-item-meta">' +
            '<span class="feed-item-type">' + (item.type || 'INTEL') + '</span>' +
            '<span>' + formatTimestamp(item.timestamp) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
    }

    if (items.length === 0) {
      html = '<div class="ws-detail-empty" style="height:200px">No intelligence items</div>';
    }

    listEl.innerHTML = html;

    // Track rendered IDs and remove new-item class after animation
    for (var j = 0; j < items.length && j < 100; j++) {
      _renderedIds[items[j].id] = true;
    }
    var newItems = listEl.querySelectorAll('.new-item');
    for (var k = 0; k < newItems.length; k++) {
      (function(el) {
        el.addEventListener('animationend', function() {
          el.classList.remove('new-item');
        });
      })(newItems[k]);
    }
  }

  // --- Feed Toolbar ---

  function renderFeedToolbar() {
    var toolbar = $('feed-toolbar');
    if (!toolbar) return;

    var filters = ['ALL', 'CRITICAL', 'HIGH', 'ELEVATED', 'UNREAD'];
    var html = '<div class="feed-filters">';
    for (var i = 0; i < filters.length; i++) {
      var activeCls = _feedFilter === filters[i] ? ' active' : '';
      html += '<button class="feed-filter' + activeCls + '" onclick="setFeedFilter(\'' + filters[i] + '\')">' + filters[i] + '</button>';
    }
    html += '</div>';
    toolbar.innerHTML = html;
  }

  // --- Feed Detail ---

  function renderFeedDetail(feedId) {
    var detailEl = $('feed-detail');
    if (!detailEl) return;

    var item = null;
    for (var i = 0; i < V.feed.length; i++) {
      if (V.feed[i].id === feedId) { item = V.feed[i]; break; }
    }

    if (!item) {
      detailEl.innerHTML = '<div class="ws-detail-empty">Select an intelligence item to view details</div>';
      return;
    }

    var severityCls = (item.severity || 'routine').toLowerCase();

    var html =
      '<div class="feed-detail-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
      '<div class="feed-detail-title">' + item.header + '</div>' +
      '<div class="feed-detail-meta">' +
        '<span class="feed-detail-meta-key">SEVERITY</span>' +
        '<span class="feed-detail-meta-val"><span class="urgent-severity severity-' + severityCls + '" style="font-size:9px">' + item.severity + '</span></span>' +
        '<span class="feed-detail-meta-key">TYPE</span>' +
        '<span class="feed-detail-meta-val">' + (item.type || 'INTELLIGENCE') + '</span>' +
        '<span class="feed-detail-meta-key">TIME</span>' +
        '<span class="feed-detail-meta-val">' + formatTimestamp(item.timestamp) + '</span>' +
        (item.theaterId ? '<span class="feed-detail-meta-key">THEATER</span><span class="feed-detail-meta-val">' + (THEATERS[item.theaterId] ? THEATERS[item.theaterId].name : item.theaterId) + '</span>' : '') +
      '</div>' +
      '<div class="feed-detail-body"><p>' + item.body + '</p></div>';

    // Action buttons
    html += '<div class="feed-detail-actions">';
    if (item.opId) {
      html += '<button class="feed-action-btn primary" onclick="activateWorkspace(\'operations\')">VIEW OPERATION</button>';
    }
    if (item.geo && item.geo.lat && item.geo.lon) {
      html += '<button class="feed-action-btn" onclick="globeFlyTo(' + item.geo.lat + ',' + item.geo.lon + ')">VIEW ON GLOBE</button>';
    }
    html += '</div>';

    detailEl.innerHTML = html;
  }

  // --- Helpers ---

  function getFilteredFeed() {
    if (_feedFilter === 'ALL') return V.feed;
    if (_feedFilter === 'UNREAD') return V.feed.filter(function(i) { return !i.read; });
    return V.feed.filter(function(i) { return i.severity === _feedFilter; });
  }

  // --- Global functions for onclick ---

  window.selectFeedItem = function(feedId) {
    _selectedFeedId = feedId;

    // Mark as read
    for (var i = 0; i < V.feed.length; i++) {
      if (V.feed[i].id === feedId) {
        V.feed[i].read = true;
        break;
      }
    }

    renderFeedList();
    renderFeedDetail(feedId);
    updateWorkspaceBadge('feed', getUnreadFeedCount());
  };

  window.setFeedFilter = function(filter) {
    _feedFilter = filter;
    renderFeedList();
    renderFeedToolbar();
  };

})();
