/* ============================================================
   VIGIL — ui/login.js
   Orthanc boot sequence → Vigil loading → biometric auth.
   Faux13-quality animations throughout.
   ============================================================ */

var _bootPhase = 0;

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
    { key: 'ORTHANC CORE',           val: 'v7.4.2' },
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
    $('auth-callsign').focus();
  }, wordmarkDelay + 1200);
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
    { label: 'CLEARANCE LEVEL',     status: 'COSMIC TOP SECRET' },
    { label: 'OPERATOR STATUS',     status: 'ACTIVE' },
  ];

  var checksEl = $('auth-checks');

  for (var i = 0; i < checks.length; i++) {
    (function(check, idx) {
      setTimeout(function() {
        var div = document.createElement('div');
        div.className = 'auth-check';
        div.innerHTML =
          '<span class="check-label">' + check.label + '</span>' +
          '<span class="check-status ok">' + check.status + '</span>';
        checksEl.appendChild(div);
        requestAnimationFrame(function() {
          div.classList.add('visible');
        });

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

  // Classification banner
  setTimeout(function() {
    $('login-class-banner').classList.add('visible');
  }, successDelay + 400);

  // Transition to main
  setTimeout(function() {
    initState();
    V.player.callsign = callsign;
    startGame();
  }, successDelay + 1400);
}

// --- Initialize on load ---
document.addEventListener('DOMContentLoaded', initLogin);
