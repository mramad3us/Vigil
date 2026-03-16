/* ============================================================
   VIGIL — ui/login.js
   Orthanc boot sequence → Vigil loading → biometric auth.
   Faux13-quality animations throughout.
   ============================================================ */

var _bootPhase = 0;
var _isReturningOperator = false;

function getSavedCallsign() {
  try {
    var raw = localStorage.getItem('vigil_saves');
    if (!raw) return null;
    var saves = JSON.parse(raw);
    // Find most recent save with a callsign
    var best = null;
    for (var k in saves) {
      if (saves[k].callsign && (!best || (saves[k].timestamp || 0) > (best.timestamp || 0))) {
        best = saves[k];
      }
    }
    return best ? best.callsign : null;
  } catch (e) {
    return null;
  }
}

function initLogin() {
  var callsignInput = $('auth-callsign');
  var authBtn = $('auth-btn');

  // Enable button when callsign entered
  callsignInput.addEventListener('input', function() {
    authBtn.disabled = this.value.trim().length < 2;
  });

  // Enter key submits
  callsignInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !authBtn.disabled) {
      beginAuth();
    }
  });

  authBtn.addEventListener('click', function() {
    if (!this.disabled) beginAuth();
  });

  // Start boot sequence
  setTimeout(bootSequence, 400);
}

// --- Boot Sequence ---

function bootSequence() {
  var logo = $('login-logo');
  var output = $('boot-output');

  // Phase 1: Show and draw logo
  logo.classList.add('visible', 'drawing');

  // Phase 2: Company name
  setTimeout(function() {
    $('login-company').classList.add('visible');
  }, 2200);

  // Phase 3: System check lines
  var bootLines = [
    { key: 'ORTHANC CORE',           val: 'v' + V.version },
    { key: 'CRYPTOGRAPHIC MODULE',   val: 'AES-512-GCM' },
    { key: 'QUANTUM MESH',           val: 'SYNCHRONIZED' },
    { key: 'BIOMETRIC ARRAY',        val: 'ONLINE' },
    { key: 'NEURAL INTERFACE',       val: 'CALIBRATED' },
    { key: 'GLOBAL SENSOR NETWORK',  val: '847 NODES' },
    { key: 'SIGINT ARRAY',           val: 'ACTIVE' },
    { key: 'SATELLITE UPLINK',       val: '12 BIRDS LOCKED' },
  ];

  var bootDelay = 2800;
  for (var i = 0; i < bootLines.length; i++) {
    (function(line, idx) {
      setTimeout(function() {
        var div = document.createElement('div');
        div.className = 'boot-line';
        div.innerHTML =
          '<span class="boot-key">' + line.key + '</span>' +
          '<span class="boot-dots"></span>' +
          '<span class="boot-val">' + line.val + '</span>';
        output.appendChild(div);
        // Trigger animation
        requestAnimationFrame(function() {
          div.classList.add('visible');
        });
      }, bootDelay + idx * 180);
    })(bootLines[i], i);
  }

  // Phase 4: Logo transitions to drawn state
  setTimeout(function() {
    logo.classList.remove('drawing');
    logo.classList.add('drawn');
  }, 2500);

  // Phase 5: VIGIL wordmark
  var wordmarkDelay = bootDelay + bootLines.length * 180 + 500;
  setTimeout(function() {
    $('login-wordmark').classList.add('visible');
  }, wordmarkDelay);

  // Phase 6: Subtitle
  setTimeout(function() {
    $('login-subtitle').classList.add('visible');
  }, wordmarkDelay + 600);

  // Phase 7: Auth form
  setTimeout(function() {
    $('login-auth').classList.add('visible');

    // Check for existing save — auto-fill callsign with typing effect
    var savedCallsign = getSavedCallsign();
    if (savedCallsign) {
      _isReturningOperator = true;
      var input = $('auth-callsign');
      input.disabled = true;
      var idx = 0;
      var typeInterval = setInterval(function() {
        if (idx < savedCallsign.length) {
          input.value += savedCallsign[idx];
          idx++;
        } else {
          clearInterval(typeInterval);
          input.disabled = false;
          $('auth-btn').disabled = false;
          $('auth-btn').focus();
        }
      }, 60);

      // Show "new operator" option
      var newOpEl = $('auth-new-operator');
      if (newOpEl) {
        newOpEl.innerHTML = '<button class="auth-new-btn" onclick="startNewOperator()">REQUEST NEW OPERATOR CREDENTIALS</button>';
      }
    } else {
      _isReturningOperator = false;
      $('auth-callsign').focus();
    }
  }, wordmarkDelay + 1200);

  // Phase 8: Government warning footer — last element drawn
  setTimeout(function() {
    $('login-footer').classList.add('visible');
  }, wordmarkDelay + 1800);
}

// --- Authentication ---

function beginAuth() {
  var callsign = $('auth-callsign').value.trim().toUpperCase();

  // Disable form
  $('auth-callsign').disabled = true;
  $('auth-btn').disabled = true;
  $('auth-btn').textContent = 'AUTHENTICATING...';

  // Start fingerprint scan
  $('auth-fp-icon').classList.add('scanning');

  // Show verification lines
  var checks = [
    { label: 'RETINAL SCAN',        status: 'VERIFIED' },
    { label: 'VOICEPRINT',          status: 'MATCHED' },
    { label: 'NEURAL SIGNATURE',    status: 'CONFIRMED' },
    { label: 'SECURITY CLEARANCE',  status: 'VERIFIED' },
    { label: 'OPERATOR STATUS',     status: 'ACTIVE' },
  ];

  var checksEl = $('auth-checks');

  for (var i = 0; i < checks.length; i++) {
    (function(check, idx) {
      setTimeout(function() {
        // Replace previous check instead of stacking
        checksEl.innerHTML =
          '<div class="auth-check visible">' +
            '<span class="check-label">' + check.label + '</span>' +
            '<span class="check-status ok">' + check.status + '</span>' +
          '</div>';

        // Progress bar
        var bar = $('auth-bar');
        var wrap = $('auth-bar-wrap');
        wrap.classList.add('visible');
        bar.style.width = ((idx + 1) / checks.length * 100) + '%';

      }, 600 + idx * 400);
    })(checks[i], i);
  }

  // Fingerprint confirmed
  setTimeout(function() {
    $('auth-fp-icon').classList.remove('scanning');
    $('auth-fp-icon').classList.add('confirmed');
  }, 600 + checks.length * 400 - 200);

  // Auth success
  var successDelay = 600 + checks.length * 400 + 400;

  setTimeout(function() {
    $('auth-btn').classList.add('success');
    $('auth-btn').textContent = 'ACCESS GRANTED';
  }, successDelay);

  // Transition to main
  setTimeout(function() {
    initState();
    V.player.callsign = callsign;

    // Load most recent save for returning operator (by timestamp, any slot)
    if (_isReturningOperator) {
      var saves = {};
      try { saves = JSON.parse(localStorage.getItem('vigil_saves') || '{}'); } catch(e) {}
      var bestKey = null, bestTime = 0;
      for (var k in saves) {
        if (saves[k].data && (saves[k].timestamp || 0) > bestTime) {
          bestKey = k;
          bestTime = saves[k].timestamp;
        }
      }
      if (bestKey) loadGameSlot(bestKey);
    }

    startGame();
  }, successDelay + 1400);
}

// --- New Operator ---

window.startNewOperator = function() {
  _isReturningOperator = false;
  var input = $('auth-callsign');
  input.value = '';
  input.disabled = false;
  input.focus();
  $('auth-btn').disabled = true;
  $('auth-btn').textContent = 'INITIALIZE SESSION';
  var newOpEl = $('auth-new-operator');
  if (newOpEl) newOpEl.innerHTML = '';
};

// --- Logout ---

function resetLoginScreen() {
  // Reset auth form
  var input = $('auth-callsign');
  input.value = '';
  input.disabled = false;
  $('auth-btn').disabled = true;
  $('auth-btn').textContent = 'INITIALIZE SESSION';
  $('auth-btn').classList.remove('success');

  // Clear auth checks
  $('auth-checks').innerHTML = '';

  // Reset progress bar
  $('auth-bar').style.width = '0%';
  $('auth-bar-wrap').classList.remove('visible');

  // Reset fingerprint
  $('auth-fp-icon').classList.remove('scanning', 'confirmed');

  // Reset new operator link
  var newOpEl = $('auth-new-operator');
  if (newOpEl) newOpEl.innerHTML = '';
}

window.logoutGame = function() {
  // Autosave before logout
  if (typeof quickSave === 'function') {
    try {
      var saves = JSON.parse(localStorage.getItem('vigil_saves') || '{}');
      saves['__autosave__'] = {
        id: '__autosave__',
        label: 'Autosave — Day ' + V.time.day,
        callsign: V.player.callsign,
        day: V.time.day,
        viability: Math.round(V.resources.viability),
        timestamp: Date.now(),
        data: JSON.parse(JSON.stringify(V)),
      };
      localStorage.setItem('vigil_saves', JSON.stringify(saves));
    } catch(e) {}
  }

  // Stop engine
  stopEngine();

  // Switch screens
  $('screen-main').classList.remove('active');
  $('screen-login').classList.add('active');

  // Reset login screen and pre-fill returning operator
  resetLoginScreen();

  // Skip boot, go straight to auth
  var savedCallsign = getSavedCallsign();
  if (savedCallsign) {
    _isReturningOperator = true;
    var input = $('auth-callsign');
    input.disabled = true;
    var idx = 0;
    var typeInterval = setInterval(function() {
      if (idx < savedCallsign.length) {
        input.value += savedCallsign[idx];
        idx++;
      } else {
        clearInterval(typeInterval);
        input.disabled = false;
        $('auth-btn').disabled = false;
        $('auth-btn').focus();
      }
    }, 60);

    var newOpEl = $('auth-new-operator');
    if (newOpEl) {
      newOpEl.innerHTML = '<button class="auth-new-btn" onclick="startNewOperator()">REQUEST NEW OPERATOR CREDENTIALS</button>';
    }
  } else {
    $('auth-callsign').focus();
  }

  $('login-footer').classList.add('visible');
  $('screen-login').scrollTop = 0;
};

// --- Initialize on load ---
document.addEventListener('DOMContentLoaded', initLogin);
