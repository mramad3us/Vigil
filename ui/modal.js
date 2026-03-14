/* ============================================================
   VIGIL — ui/modal.js
   Modal/popup system and urgent alert overlays.
   ============================================================ */

var _modalStack = [];

function showModal(title, bodyHtml, options) {
  var overlay = $('modal-overlay');
  var titleEl = $('modal-title');
  var bodyEl = $('modal-body');

  titleEl.textContent = title;
  bodyEl.innerHTML = bodyHtml;

  overlay.classList.remove('hidden');

  // Auto-pause on modal if requested
  if (options && options.pause) {
    togglePause();
  }

  _modalStack.push({ title: title });
}

function hideModal() {
  var overlay = $('modal-overlay');
  overlay.classList.add('hidden');
  $('modal-body').innerHTML = '';
  _modalStack.pop();
}

function isModalOpen() {
  return _modalStack.length > 0;
}

// --- Urgent Alert Overlay ---

var _urgentQueue = [];

function showUrgentAlert(feedItem) {
  var overlay = $('alert-overlay');

  var severityCls = (feedItem.severity || 'HIGH').toLowerCase();
  var timeStr = formatTimestamp(feedItem.timestamp);

  var actionsHtml = '';
  if (feedItem.actions && feedItem.actions.length > 0) {
    actionsHtml = '<div class="urgent-actions">';
    for (var i = 0; i < feedItem.actions.length; i++) {
      var act = feedItem.actions[i];
      var btnCls = act.primary ? 'urgent-dismiss urgent-action-primary' : 'urgent-dismiss urgent-action-secondary';
      actionsHtml += '<button class="' + btnCls + '" onclick="' + act.onclick + '">' + act.label + '</button>';
    }
    actionsHtml += '</div>';
  } else {
    actionsHtml = '<button class="urgent-dismiss" onclick="dismissUrgentAlert()">ACKNOWLEDGED</button>';
  }

  overlay.innerHTML =
    '<div class="urgent-panel">' +
      '<div class="urgent-header">' +
        '<span class="urgent-severity severity-' + severityCls + '">' + feedItem.severity + '</span>' +
        '<span class="urgent-time">' + timeStr + '</span>' +
      '</div>' +
      '<div class="urgent-title">' + feedItem.header + '</div>' +
      '<div class="urgent-body">' + feedItem.body + '</div>' +
      actionsHtml +
    '</div>';

  overlay.classList.remove('hidden');
}

function dismissUrgentAlert() {
  var overlay = $('alert-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';

  // Show next in queue
  if (_urgentQueue.length > 0) {
    showUrgentAlert(_urgentQueue.shift());
  }
}

function queueUrgentAlert(feedItem) {
  var overlay = $('alert-overlay');
  if (overlay.classList.contains('hidden')) {
    showUrgentAlert(feedItem);
  } else {
    _urgentQueue.push(feedItem);
  }
}

// --- Event Choice Modal ---

function showEventChoiceModal(event) {
  var bodyHtml = '<div style="margin-bottom:var(--sp-4)">' +
    '<div style="font-family:var(--font-mono);font-size:var(--fs-xs);color:var(--text-dim);letter-spacing:1px;margin-bottom:var(--sp-2)">SITUATION REPORT</div>' +
    '<p style="color:var(--text);line-height:1.7">' + event.description + '</p>' +
    '</div>';

  if (event.choices && event.choices.length) {
    bodyHtml += '<div style="display:flex;flex-direction:column;gap:var(--sp-2)">';
    for (var i = 0; i < event.choices.length; i++) {
      var c = event.choices[i];
      bodyHtml += '<button class="modal-btn modal-btn-primary" onclick="resolveEventChoice(\'' +
        event.id + '\',' + i + ')" style="text-align:left;padding:var(--sp-3)">' +
        '<div style="font-weight:600">' + c.label + '</div>' +
        '<div style="font-size:var(--fs-xs);color:var(--text-dim);margin-top:2px">' + (c.desc || '') + '</div>' +
        '</button>';
    }
    bodyHtml += '</div>';
  }

  showModal('DECISION REQUIRED', bodyHtml, { pause: true });
}

function resolveEventChoice(eventId, choiceIdx) {
  fire('event:choice', { eventId: eventId, choiceIdx: choiceIdx });
  hideModal();
}

// --- Save Modal ---

function showSaveModal() {
  if (typeof renderSaveModalContent === 'function') {
    showModal('SAVE / LOAD', renderSaveModalContent());
  }
}

// ESC to close modal
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    if (!$('modal-overlay').classList.contains('hidden')) {
      hideModal();
    }
    if (!$('alert-overlay').classList.contains('hidden')) {
      dismissUrgentAlert();
    }
  }
});
