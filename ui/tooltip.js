/* ============================================================
   VIGIL — ui/tooltip.js
   Global tooltip system. Hover-triggered info overlays.
   ============================================================ */

(function() {

  var _tooltipEl = null;
  var _showTimeout = null;
  var _hideTimeout = null;

  // Create tooltip DOM element
  function ensureTooltip() {
    if (_tooltipEl) return;
    _tooltipEl = document.createElement('div');
    _tooltipEl.className = 'vigil-tooltip';
    _tooltipEl.setAttribute('role', 'tooltip');
    document.body.appendChild(_tooltipEl);
  }

  function showTooltip(target, content, opts) {
    ensureTooltip();
    clearTimeout(_hideTimeout);

    _tooltipEl.innerHTML = content;
    _tooltipEl.classList.add('visible');

    // Position relative to target
    var rect = target.getBoundingClientRect();
    var ttRect = _tooltipEl.getBoundingClientRect();
    var align = (opts && opts.align) || 'top';

    var x, y;

    if (align === 'top') {
      x = rect.left + rect.width / 2 - ttRect.width / 2;
      y = rect.top - ttRect.height - 8;
    } else if (align === 'bottom') {
      x = rect.left + rect.width / 2 - ttRect.width / 2;
      y = rect.bottom + 8;
    } else if (align === 'right') {
      x = rect.right + 8;
      y = rect.top + rect.height / 2 - ttRect.height / 2;
    } else if (align === 'left') {
      x = rect.left - ttRect.width - 8;
      y = rect.top + rect.height / 2 - ttRect.height / 2;
    }

    // Keep on screen
    x = Math.max(8, Math.min(x, window.innerWidth - ttRect.width - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - ttRect.height - 8));

    // If tooltip would overlap target when pushed, flip to bottom
    if (align === 'top' && y > rect.top - 4) {
      y = rect.bottom + 8;
    }

    _tooltipEl.style.left = x + 'px';
    _tooltipEl.style.top = y + 'px';
  }

  function hideTooltip() {
    if (!_tooltipEl) return;
    _tooltipEl.classList.remove('visible');
  }

  // --- Global event delegation ---

  document.addEventListener('mouseover', function(e) {
    var target = e.target.closest('[data-tip]');
    if (!target) return;

    clearTimeout(_showTimeout);
    clearTimeout(_hideTimeout);

    _showTimeout = setTimeout(function() {
      var content = target.getAttribute('data-tip');
      var align = target.getAttribute('data-tip-align') || 'top';
      showTooltip(target, content, { align: align });
    }, 300);
  });

  document.addEventListener('mouseout', function(e) {
    var target = e.target.closest('[data-tip]');
    if (!target) return;

    clearTimeout(_showTimeout);
    _hideTimeout = setTimeout(hideTooltip, 100);
  });

  // --- Rich tooltip API for programmatic use ---

  window.showRichTooltip = function(target, html, opts) {
    clearTimeout(_showTimeout);
    clearTimeout(_hideTimeout);
    showTooltip(target, html, opts);
  };

  window.hideRichTooltip = function() {
    clearTimeout(_showTimeout);
    hideTooltip();
  };

})();
