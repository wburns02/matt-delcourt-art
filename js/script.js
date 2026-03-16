/**
 * Matt Delcourt Art — Site Interactions
 * Particles, cursor trail, scroll-linked vines, lightbox, loading screen, easter egg
 */

(function () {
  'use strict';

  // =============================================
  // PAINTING DATA
  // =============================================
  var PAINTINGS = [
    { src: 'images/painting1.jpeg', title: 'Cycle of the Sacred', desc: 'Bone returns to earth, and from the earth, the heart persists.', glow: '#0d7377' },
    { src: 'images/painting2.jpeg', title: 'The Seat of Knowing', desc: 'Stillness reveals what the body has always carried.', glow: '#c41e6a' },
    { src: 'images/painting3.jpeg', title: 'The Offering', desc: 'To give the heart is to hold nothing back from the world.', glow: '#d4842a' },
    { src: 'images/painting4.jpeg', title: 'Armored & Unguarded', desc: 'Even among weapons, the heart refuses to harden.', glow: '#5b2d8e' }
  ];

  var isDesktop = window.matchMedia('(pointer: fine)').matches;
  var isMobile = !isDesktop;

  // =============================================
  // LOADING SCREEN
  // =============================================
  var loadingScreen = document.getElementById('loading-screen');
  if (loadingScreen) {
    setTimeout(function () {
      loadingScreen.classList.add('fade-out');
      document.body.classList.remove('loading');
      setTimeout(function () {
        loadingScreen.remove();
      }, 500);
    }, 1800);
  }

  // =============================================
  // FILM GRAIN ANIMATION (desktop only)
  // =============================================
  if (isDesktop) {
    var grainSeed = document.getElementById('grain-seed');
    if (grainSeed) {
      var seed = 0;
      setInterval(function () {
        seed = (seed + 1) % 10;
        grainSeed.setAttribute('seed', seed);
      }, 120);
    }
  }

  // =============================================
  // FLOATING ORGANIC PARTICLES
  // =============================================
  var particleCanvas = document.getElementById('particle-canvas');
  var particleCtx = particleCanvas ? particleCanvas.getContext('2d') : null;
  var particles = [];
  var particleBaseCount = isMobile ? 20 : 40;
  var particleMaxCount = isMobile ? 50 : 120;

  var PARTICLE_COLORS = [
    'rgba(212,132,42,',   // gold
    'rgba(58,122,50,',    // green
    'rgba(232,224,212,',  // cream
    'rgba(13,115,119,'    // teal
  ];

  function resizeParticleCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function spawnParticle(randomY) {
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
      size: 1 + Math.random() * 2,
      speedY: -(0.3 + Math.random() * 0.7),
      speedX: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      alpha: 0.2 + Math.random() * 0.5,
      life: 0,
      maxLife: 300 + Math.random() * 200
    };
  }

  function burstParticles(count) {
    var cx = window.innerWidth / 2;
    var cy = window.innerHeight / 2;
    for (var i = 0; i < count; i++) {
      var p = spawnParticle(false);
      p.x = cx + (Math.random() - 0.5) * 200;
      p.y = cy + (Math.random() - 0.5) * 200;
      p.speedY = -(1 + Math.random() * 2);
      p.speedX = (Math.random() - 0.5) * 2;
      p.size = 1.5 + Math.random() * 2.5;
      p.alpha = 0.5 + Math.random() * 0.5;
      particles.push(p);
    }
  }

  // Expose for easter eggs
  window.__burstParticles = burstParticles;

  function updateParticles() {
    if (!particleCtx) return;

    var scrollPercent = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    var targetCount = Math.floor(particleBaseCount + (particleMaxCount - particleBaseCount) * scrollPercent);

    while (particles.length < targetCount) {
      particles.push(spawnParticle(particles.length < particleBaseCount));
    }

    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    var alive = [];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.life++;
      p.x += p.speedX + Math.sin(p.wobble) * 0.3;
      p.y += p.speedY;
      p.wobble += p.wobbleSpeed;

      var alpha = p.alpha;
      if (p.life < 30) alpha *= p.life / 30;
      if (p.life > p.maxLife - 60) alpha *= (p.maxLife - p.life) / 60;

      if (p.y < -10 || p.life >= p.maxLife) continue;

      // Glow
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      particleCtx.fillStyle = p.color + (alpha * 0.15) + ')';
      particleCtx.fill();

      // Core
      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fillStyle = p.color + alpha + ')';
      particleCtx.fill();

      alive.push(p);
    }
    particles = alive;
  }

  // =============================================
  // CURSOR VINE TRAIL (desktop only)
  // =============================================
  var cursorCanvas = document.getElementById('cursor-canvas');
  var cursorCtx = cursorCanvas ? cursorCanvas.getContext('2d') : null;
  var trailPoints = [];
  var TRAIL_MAX_AGE = 50;

  function resizeCursorCanvas() {
    if (!cursorCanvas) return;
    cursorCanvas.width = window.innerWidth;
    cursorCanvas.height = window.innerHeight;
  }

  if (isDesktop && cursorCanvas) {
    document.addEventListener('mousemove', function (e) {
      var last = trailPoints[trailPoints.length - 1];
      if (!last || Math.hypot(e.clientX - last.x, e.clientY - last.y) > 8) {
        trailPoints.push({
          x: e.clientX,
          y: e.clientY,
          age: 0,
          curl: (Math.random() - 0.5) * 15
        });
      }
    });
  }

  function updateCursorTrail() {
    if (!cursorCtx || !isDesktop) return;

    cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

    var alive = [];
    for (var i = 0; i < trailPoints.length; i++) {
      trailPoints[i].age++;
      if (trailPoints[i].age < TRAIL_MAX_AGE) {
        alive.push(trailPoints[i]);
      }
    }
    trailPoints = alive;

    for (var j = 1; j < trailPoints.length; j++) {
      var p0 = trailPoints[j - 1];
      var p1 = trailPoints[j];
      var ageFrac = p1.age / TRAIL_MAX_AGE;

      // Green → brown as it ages
      var r = Math.round(45 + ageFrac * 94);
      var g = Math.round(122 - ageFrac * 53);
      var b = Math.round(39 - ageFrac * 20);
      var a = (1 - ageFrac) * 0.5;

      var midX = (p0.x + p1.x) / 2 + p1.curl;
      var midY = (p0.y + p1.y) / 2 + p1.curl * 0.5;

      cursorCtx.beginPath();
      cursorCtx.strokeStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
      cursorCtx.lineWidth = 2 * (1 - ageFrac * 0.5);
      cursorCtx.lineCap = 'round';
      cursorCtx.moveTo(p0.x, p0.y);
      cursorCtx.quadraticCurveTo(midX, midY, p1.x, p1.y);
      cursorCtx.stroke();

      // Leaf buds on some segments
      if (j % 5 === 0 && ageFrac < 0.3) {
        cursorCtx.beginPath();
        cursorCtx.fillStyle = 'rgba(58,122,50,' + ((1 - ageFrac) * 0.35) + ')';
        cursorCtx.ellipse(midX, midY, 3.5, 2, Math.atan2(p1.y - p0.y, p1.x - p0.x), 0, Math.PI * 2);
        cursorCtx.fill();
      }
    }
  }

  // =============================================
  // SCROLL REVEAL (IntersectionObserver)
  // =============================================
  var revealElements = document.querySelectorAll('.reveal-up');

  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.dataset.delay || 0;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  );

  revealElements.forEach(function (el) { revealObserver.observe(el); });

  // =============================================
  // SCROLL-LINKED VINE GROWTH
  // =============================================
  var vinePaths = document.querySelectorAll('.vine-path');
  var vineLeaves = document.querySelectorAll('.vine-leaf');

  function updateVines() {
    var scrollPercent = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    var vineProgress = Math.min(scrollPercent * 2.5, 1); // Full growth at ~40% scroll
    var dashOffset = 2000 * (1 - vineProgress);

    vinePaths.forEach(function (path) {
      path.style.strokeDashoffset = dashOffset;
    });

    vineLeaves.forEach(function (leaf, i) {
      var threshold = 0.12 + (i * 0.08);
      leaf.style.opacity = vineProgress > threshold ? 0.6 : 0;
    });
  }

  // =============================================
  // PAINTING GLOW ON SCROLL
  // =============================================
  var paintingCards = document.querySelectorAll('.painting-card');

  var glowObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.3 }
  );

  paintingCards.forEach(function (card) { glowObserver.observe(card); });

  // =============================================
  // PARALLAX EFFECT ON HERO
  // =============================================
  var heroTexture = document.querySelector('.hero-texture');
  var heroSection = document.getElementById('hero');

  function updateHeroParallax() {
    if (!heroTexture || !heroSection) return;
    var scrollY = window.scrollY;
    var heroHeight = heroSection.offsetHeight;
    if (scrollY < heroHeight) {
      heroTexture.style.transform = 'translateY(' + (scrollY * 0.3) + 'px)';
    }
  }

  // =============================================
  // SMOOTH SCROLL FOR NAV
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =============================================
  // PAINTING HOVER — subtle breathing effect
  // =============================================
  paintingCards.forEach(function (card) {
    var frame = card.querySelector('.painting-frame');
    if (!frame) return;

    frame.addEventListener('mouseenter', function () {
      card.style.transition = 'transform 0.6s ease';
      card.style.transform = 'translateY(-4px)';
    });

    frame.addEventListener('mouseleave', function () {
      card.style.transform = 'translateY(0)';
    });
  });

  // =============================================
  // PROGRESSIVE BACKGROUND TINT
  // =============================================
  function updateBackgroundTint() {
    var scrollPercent = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    var greenIntensity = Math.min(scrollPercent * 0.08, 0.06);

    if (!document.body.classList.contains('reclamation-active')) {
      document.body.style.backgroundColor = 'rgb(' +
        Math.round(26 - greenIntensity * 80) + ',' +
        Math.round(26 + greenIntensity * 120) + ',' +
        Math.round(26 - greenIntensity * 60) + ')';
    }
  }

  // =============================================
  // LIGHTBOX
  // =============================================
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxTitle = document.getElementById('lightbox-title');
  var lightboxDesc = document.getElementById('lightbox-desc');
  var lightboxInquire = document.getElementById('lightbox-inquire');
  var lightboxClose = document.getElementById('lightbox-close');
  var lightboxPrev = document.getElementById('lightbox-prev');
  var lightboxNext = document.getElementById('lightbox-next');
  var lightboxBackdrop = document.getElementById('lightbox-backdrop');
  var currentPaintingIndex = 0;

  function openLightbox(index) {
    currentPaintingIndex = index;
    var p = PAINTINGS[index];
    lightboxImg.src = p.src;
    lightboxImg.alt = p.title;
    lightboxTitle.textContent = p.title;
    lightboxDesc.textContent = p.desc;
    lightboxInquire.href = 'mailto:hello@mattdelcourt.com?subject=Inquiry%3A%20' + encodeURIComponent(p.title);
    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function nextPainting() {
    openLightbox((currentPaintingIndex + 1) % PAINTINGS.length);
  }

  function prevPainting() {
    openLightbox((currentPaintingIndex - 1 + PAINTINGS.length) % PAINTINGS.length);
  }

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextPainting);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevPainting);

  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPainting();
    if (e.key === 'ArrowLeft') prevPainting();
  });

  // Painting card click → lightbox
  paintingCards.forEach(function (card) {
    var frame = card.querySelector('.painting-frame');
    if (!frame) return;
    frame.addEventListener('click', function () {
      var idx = parseInt(card.dataset.painting);
      if (!isNaN(idx)) openLightbox(idx);
    });
  });

  // =============================================
  // EASTER EGG: FULL RECLAMATION
  // =============================================
  var heartLogo = document.querySelector('.heart-logo');
  var eggClickCount = 0;
  var eggClickTimer = null;
  var reclamationActive = false;

  if (heartLogo) {
    heartLogo.addEventListener('click', function (e) {
      e.preventDefault();
      eggClickCount++;
      clearTimeout(eggClickTimer);

      if (eggClickCount >= 5 && !reclamationActive) {
        reclamationActive = true;
        eggClickCount = 0;
        document.body.classList.add('reclamation-active');
        burstParticles(200);

        setTimeout(function () {
          document.body.classList.remove('reclamation-active');
          reclamationActive = false;
        }, 5000);
      } else {
        eggClickTimer = setTimeout(function () { eggClickCount = 0; }, 800);
      }
    });
  }

  // =============================================
  // ANIMATION LOOP
  // =============================================
  resizeParticleCanvas();
  resizeCursorCanvas();

  window.addEventListener('resize', function () {
    resizeParticleCanvas();
    resizeCursorCanvas();
  });

  var scrollTicking = false;

  window.addEventListener('scroll', function () {
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        updateVines();
        updateHeroParallax();
        updateBackgroundTint();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });

  // Initialize vines at current scroll position
  updateVines();

  function animationLoop() {
    updateParticles();
    updateCursorTrail();
    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);
})();
