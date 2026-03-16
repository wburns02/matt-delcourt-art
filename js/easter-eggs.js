/**
 * Matt Delcourt Art — Easter Eggs
 * Hidden interactions for the curious. Shared across both pages.
 */

(function () {
  'use strict';

  var isDesktop = window.matchMedia('(pointer: fine)').matches;

  // =============================================
  // 1. CONSOLE ASCII ART
  // =============================================
  console.log(
    '%c\n' +
    '       ♥♥   ♥♥\n' +
    '     ♥♥♥♥♥ ♥♥♥♥♥\n' +
    '    ♥♥♥♥♥♥♥♥♥♥♥♥♥\n' +
    '    ♥♥♥♥♥♥♥♥♥♥♥♥♥\n' +
    '     ♥♥♥♥♥♥♥♥♥♥♥\n' +
    '      ♥♥♥♥♥♥♥♥♥\n' +
    '       ♥♥♥♥♥♥♥\n' +
    '        ♥♥♥♥♥\n' +
    '         ♥♥♥\n' +
    '          ♥\n' +
    '\n' +
    '  You looked behind the walls.\n' +
    '  The heart was always here.\n' +
    '\n' +
    '         — Matt Delcourt\n',
    'color: #c41e6a; font-size: 14px; font-family: monospace; line-height: 1.4;'
  );

  // =============================================
  // 2. KONAMI CODE → RAINSTORM
  // =============================================
  var KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  var konamiIndex = 0;
  var rainActive = false;

  document.addEventListener('keydown', function (e) {
    if (rainActive) return;
    if (e.key === KONAMI[konamiIndex]) {
      konamiIndex++;
      if (konamiIndex === KONAMI.length) {
        konamiIndex = 0;
        triggerRainstorm();
      }
    } else {
      konamiIndex = e.key === KONAMI[0] ? 1 : 0;
    }
  });

  function triggerRainstorm() {
    rainActive = true;
    document.body.classList.add('rain-active');

    // Rain canvas
    var canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9000;pointer-events:none;';
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    var ctx = canvas.getContext('2d');

    // Spawn raindrops
    var drops = [];
    for (var i = 0; i < 350; i++) {
      drops.push({
        x: Math.random() * canvas.width * 1.2,
        y: Math.random() * canvas.height,
        len: 12 + Math.random() * 22,
        speed: 18 + Math.random() * 12,
        opacity: 0.08 + Math.random() * 0.25,
        width: 0.5 + Math.random() * 1
      });
    }

    // Lightning flash element
    var flash = document.createElement('div');
    flash.style.cssText = 'position:fixed;inset:0;z-index:8999;pointer-events:none;background:white;opacity:0;transition:opacity 0.05s;';
    document.body.appendChild(flash);

    // Schedule lightning flashes
    function doFlash(delay, intensity) {
      setTimeout(function () {
        if (!rainActive) return;
        flash.style.opacity = intensity;
        setTimeout(function () { flash.style.opacity = '0'; }, 80);
        // Double flash
        setTimeout(function () {
          if (!rainActive) return;
          flash.style.opacity = String(intensity * 0.5);
          setTimeout(function () { flash.style.opacity = '0'; }, 60);
        }, 200);
      }, delay);
    }
    doFlash(1200, 0.6);
    doFlash(3800, 0.45);
    doFlash(5500, 0.3);

    // Burst particles if available
    if (window.__burstParticles) window.__burstParticles(80);

    var start = Date.now();
    var duration = 8000;

    function animateRain() {
      var elapsed = Date.now() - start;
      if (elapsed > duration) {
        canvas.remove();
        flash.remove();
        document.body.classList.remove('rain-active');
        rainActive = false;
        return;
      }

      var fade = elapsed > duration - 2000 ? (duration - elapsed) / 2000 : Math.min(elapsed / 500, 1);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Mist at bottom
      var mistGrad = ctx.createLinearGradient(0, canvas.height * 0.7, 0, canvas.height);
      mistGrad.addColorStop(0, 'rgba(180,200,220,0)');
      mistGrad.addColorStop(1, 'rgba(180,200,220,' + (0.04 * fade) + ')');
      ctx.fillStyle = mistGrad;
      ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);

      for (var i = 0; i < drops.length; i++) {
        var d = drops[i];
        d.y += d.speed;
        d.x -= d.speed * 0.12;

        if (d.y > canvas.height) {
          d.y = -d.len;
          d.x = Math.random() * canvas.width * 1.2;
        }

        ctx.beginPath();
        ctx.moveTo(d.x, d.y);
        ctx.lineTo(d.x - d.len * 0.12, d.y + d.len);
        ctx.strokeStyle = 'rgba(180,200,220,' + (d.opacity * fade) + ')';
        ctx.lineWidth = d.width;
        ctx.stroke();
      }

      requestAnimationFrame(animateRain);
    }

    requestAnimationFrame(animateRain);
  }

  // =============================================
  // 3. IDLE TAKEOVER (30s inactivity)
  // =============================================
  var idleTimer = null;
  var idleActive = false;
  var IDLE_TIMEOUT = 30000;

  // Create idle overlay
  var idleOverlay = document.createElement('div');
  idleOverlay.className = 'idle-overlay';
  document.body.appendChild(idleOverlay);

  function resetIdle() {
    clearTimeout(idleTimer);
    if (idleActive) {
      document.body.classList.remove('idle-takeover');
      idleActive = false;
    }
    idleTimer = setTimeout(function () {
      idleActive = true;
      document.body.classList.add('idle-takeover');
    }, IDLE_TIMEOUT);
  }

  ['mousemove', 'scroll', 'click', 'keydown', 'touchstart', 'touchmove'].forEach(function (evt) {
    document.addEventListener(evt, resetIdle, { passive: true });
  });

  resetIdle();

  // =============================================
  // 4. SHAKE TO QUAKE (mobile)
  // =============================================
  if (!isDesktop && window.DeviceMotionEvent) {
    var lastAccel = { x: 0, y: 0, z: 0 };
    var lastShake = 0;

    window.addEventListener('devicemotion', function (e) {
      var acc = e.accelerationIncludingGravity;
      if (!acc) return;

      var dx = Math.abs(acc.x - lastAccel.x);
      var dy = Math.abs(acc.y - lastAccel.y);
      var dz = Math.abs(acc.z - lastAccel.z);

      lastAccel = { x: acc.x, y: acc.y, z: acc.z };

      if (dx + dy + dz > 20 && Date.now() - lastShake > 3000) {
        lastShake = Date.now();
        triggerQuake();
      }
    });
  }

  function triggerQuake() {
    document.body.classList.add('quake-active');
    if (window.__burstParticles) window.__burstParticles(100);

    setTimeout(function () {
      document.body.classList.remove('quake-active');
    }, 1200);
  }

  // =============================================
  // 5. PI PAINTING SEQUENCE (3-1-4-2)
  // =============================================
  var PI_SEQ = [2, 0, 3, 1]; // paintings 3,1,4,2 → 0-indexed
  var piIndex = 0;
  var piTimer = null;

  var SRC_TO_IDX = {
    'images/painting1.jpeg': 0,
    'images/painting2.jpeg': 1,
    'images/painting3.jpeg': 2,
    'images/painting4.jpeg': 3
  };

  function checkPi(idx) {
    if (idx === PI_SEQ[piIndex]) {
      piIndex++;
      clearTimeout(piTimer);
      if (piIndex === PI_SEQ.length) {
        piIndex = 0;
        triggerSignature();
      } else {
        piTimer = setTimeout(function () { piIndex = 0; }, 5000);
      }
    } else {
      piIndex = idx === PI_SEQ[0] ? 1 : 0;
    }
  }

  // Gallery page: painting cards
  document.querySelectorAll('.painting-card').forEach(function (card) {
    card.addEventListener('click', function () {
      var idx = parseInt(card.dataset.painting);
      if (!isNaN(idx)) checkPi(idx);
    });
  });

  // Scenes page: wall paintings
  document.querySelectorAll('.wall-painting').forEach(function (wp) {
    wp.addEventListener('click', function () {
      var img = wp.querySelector('img');
      if (!img) return;
      var idx = SRC_TO_IDX[img.getAttribute('src')];
      if (idx !== undefined) checkPi(idx);
    });
  });

  function triggerSignature() {
    var overlay = document.createElement('div');
    overlay.className = 'signature-overlay';
    overlay.innerHTML =
      '<svg viewBox="0 0 200 220" class="signature-heart">' +
        '<defs><linearGradient id="sigGrad" x1="0%" y1="0%" x2="100%" y2="100%">' +
          '<stop offset="0%" style="stop-color:#c41e6a"/>' +
          '<stop offset="100%" style="stop-color:#5b2d8e"/>' +
        '</linearGradient></defs>' +
        '<path fill="url(#sigGrad)" d="M100,200 C60,170 10,140 10,80 C10,40 40,10 70,10 C85,10 95,20 100,35 C105,20 115,10 130,10 C160,10 190,40 190,80 C190,140 140,170 100,200Z"/>' +
      '</svg>' +
      '<p class="signature-text">To whoever found this &mdash;<br>you looked close enough.<br>That&rsquo;s all I ever wanted.</p>' +
      '<span class="signature-credit">&mdash; M.D.</span>';

    document.body.appendChild(overlay);
    if (window.__burstParticles) window.__burstParticles(60);

    setTimeout(function () {
      overlay.remove();
    }, 6200);
  }

  // =============================================
  // 6. DOUBLE-CLICK CRACKS
  // =============================================
  document.addEventListener('dblclick', function (e) {
    // Don't trigger on interactive elements
    if (e.target && e.target.closest && e.target.closest('a, button, .painting-frame, .wall-painting, .lightbox, input, textarea')) return;
    createCrack(e.clientX, e.clientY);
  });

  function createCrack(x, y) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;left:' + (x - 60) + 'px;top:' + (y - 60) + 'px;width:120px;height:120px;z-index:999;pointer-events:none;';

    // Random crack direction
    var angle = Math.random() * Math.PI * 2;
    var len = 30 + Math.random() * 35;
    var ex = 60 + Math.cos(angle) * len;
    var ey = 60 + Math.sin(angle) * len;
    var mx = 60 + Math.cos(angle) * len * 0.5 + (Math.random() - 0.5) * 12;
    var my = 60 + Math.sin(angle) * len * 0.5 + (Math.random() - 0.5) * 12;

    // Branch
    var ba = angle + (Math.random() - 0.5) * 1.8;
    var bl = len * 0.35;
    var bx = mx + Math.cos(ba) * bl;
    var by = my + Math.sin(ba) * bl;

    // Vine sprout position
    var vx = ex + Math.cos(angle) * 5;
    var vy = ey + Math.sin(angle) * 5;

    // Leaf angle perpendicular to crack
    var la = (angle + Math.PI / 2) * (180 / Math.PI);

    el.innerHTML =
      '<svg viewBox="0 0 120 120" width="120" height="120" style="overflow:visible">' +
        // Main crack
        '<path d="M60,60 L' + mx + ',' + my + ' L' + ex + ',' + ey + '" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="1.5" stroke-linecap="round" style="stroke-dasharray:120;stroke-dashoffset:120;animation:crack-draw 0.5s ease-out forwards"/>' +
        // Branch
        '<path d="M' + mx + ',' + my + ' L' + bx + ',' + by + '" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1" stroke-linecap="round" style="stroke-dasharray:60;stroke-dashoffset:60;animation:crack-draw 0.4s ease-out 0.3s forwards"/>' +
        // Vine sprout (circle)
        '<circle cx="' + vx + '" cy="' + vy + '" r="3" fill="#3a7a32" opacity="0" style="animation:crack-appear 0.6s ease-out 0.8s forwards"/>' +
        // Tiny leaf
        '<ellipse cx="' + (vx + 5) + '" cy="' + (vy - 3) + '" rx="5" ry="2.5" fill="#4a9a42" opacity="0" transform="rotate(' + la + ' ' + (vx + 5) + ' ' + (vy - 3) + ')" style="animation:crack-appear 0.5s ease-out 1.1s forwards"/>' +
      '</svg>';

    document.body.appendChild(el);

    // Fade and remove
    setTimeout(function () {
      el.style.transition = 'opacity 1.5s ease';
      el.style.opacity = '0';
      setTimeout(function () { el.remove(); }, 1500);
    }, 3500);
  }

  // =============================================
  // 7. MIDNIGHT MODE (12AM–3AM)
  // =============================================
  var hour = new Date().getHours();
  if (hour >= 0 && hour < 3) {
    document.body.classList.add('midnight-mode');

    var midOverlay = document.createElement('div');
    midOverlay.className = 'midnight-overlay';
    document.body.appendChild(midOverlay);

    // Log for the night owls
    console.log(
      '%c🌙 Midnight mode active. The ruins are quieter at this hour.',
      'color: #4a7aaa; font-style: italic;'
    );
  }

  // =============================================
  // 8. LONG-PRESS HEART → X-RAY PULSE
  // =============================================
  var heartEls = document.querySelectorAll('.heart-logo, .outro-heart, .contact-heart');
  var xrayActive = false;

  heartEls.forEach(function (heartEl) {
    var pressTimer = null;

    function startPress() {
      if (xrayActive) return;
      pressTimer = setTimeout(function () {
        triggerXRay();
      }, 3000);
    }

    function endPress() {
      clearTimeout(pressTimer);
    }

    heartEl.addEventListener('mousedown', startPress);
    heartEl.addEventListener('mouseup', endPress);
    heartEl.addEventListener('mouseleave', endPress);
    heartEl.addEventListener('touchstart', startPress);
    heartEl.addEventListener('touchend', endPress);
    heartEl.addEventListener('touchcancel', endPress);
  });

  function triggerXRay() {
    xrayActive = true;

    var targets = document.querySelectorAll('.painting-frame, .frame');
    var overlays = [];

    targets.forEach(function (frame) {
      // Ensure relative positioning
      var pos = getComputedStyle(frame).position;
      if (pos === 'static') frame.style.position = 'relative';

      var overlay = document.createElement('div');
      overlay.className = 'xray-heart';
      overlay.innerHTML =
        '<svg viewBox="0 0 200 220" class="xray-heart-svg">' +
          '<path fill="rgba(196,30,106,0.35)" d="M100,200 C60,170 10,140 10,80 C10,40 40,10 70,10 C85,10 95,20 100,35 C105,20 115,10 130,10 C160,10 190,40 190,80 C190,140 140,170 100,200Z"/>' +
        '</svg>';

      frame.appendChild(overlay);
      overlays.push(overlay);
    });

    if (window.__burstParticles) window.__burstParticles(40);

    setTimeout(function () {
      overlays.forEach(function (o) { o.remove(); });
      xrayActive = false;
    }, 3500);
  }

})();
