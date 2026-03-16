/**
 * Matt Delcourt Art — Scenes of Reclamation
 * Particles, 3D parallax, lightbox, ambient sound, scroll effects
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

  var PAINTING_SRC_MAP = {};
  PAINTINGS.forEach(function (p, i) { PAINTING_SRC_MAP[p.src] = i; });

  var isDesktop = window.matchMedia('(pointer: fine)').matches;
  var isMobile = !isDesktop;

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
  var particleCount = isMobile ? 30 : 80;

  var PARTICLE_COLORS = [
    'rgba(212,132,42,',
    'rgba(58,122,50,',
    'rgba(232,224,212,',
    'rgba(13,115,119,'
  ];

  function resizeCanvas() {
    if (!particleCanvas) return;
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
  }

  function spawnParticle(randomY) {
    return {
      x: Math.random() * window.innerWidth,
      y: randomY ? Math.random() * window.innerHeight : window.innerHeight + 10,
      size: 1 + Math.random() * 2,
      speedY: -(0.2 + Math.random() * 0.6),
      speedX: (Math.random() - 0.5) * 0.3,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.01 + Math.random() * 0.02,
      color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      alpha: 0.15 + Math.random() * 0.4,
      life: 0,
      maxLife: 350 + Math.random() * 250
    };
  }

  function updateParticles() {
    if (!particleCtx) return;

    while (particles.length < particleCount) {
      particles.push(spawnParticle(particles.length < particleCount / 2));
    }

    particleCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);

    var alive = [];
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.life++;
      p.x += p.speedX + Math.sin(p.wobble) * 0.25;
      p.y += p.speedY;
      p.wobble += p.wobbleSpeed;

      var alpha = p.alpha;
      if (p.life < 40) alpha *= p.life / 40;
      if (p.life > p.maxLife - 80) alpha *= (p.maxLife - p.life) / 80;

      if (p.y < -10 || p.life >= p.maxLife) continue;

      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
      particleCtx.fillStyle = p.color + (alpha * 0.12) + ')';
      particleCtx.fill();

      particleCtx.beginPath();
      particleCtx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      particleCtx.fillStyle = p.color + alpha + ')';
      particleCtx.fill();

      alive.push(p);
    }
    particles = alive;
  }

  // =============================================
  // SCROLL PROGRESS BAR
  // =============================================
  var progressBar = document.querySelector('.scroll-progress-bar');

  function updateProgress() {
    var scrollTop = window.scrollY;
    var docHeight = document.body.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }

  // =============================================
  // PAINTING REVEAL ON SCROLL
  // =============================================
  var wallPaintings = document.querySelectorAll('.wall-painting');
  var reveals = document.querySelectorAll('.reveal');

  var paintingObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var delay = entry.target.classList.contains('companion-painting') ? 600 : 200;
          setTimeout(function () {
            entry.target.classList.add('visible');
          }, delay);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
  );

  wallPaintings.forEach(function (p) { paintingObserver.observe(p); });

  // =============================================
  // CAPTION / REVEAL ANIMATION
  // =============================================
  var revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
  );

  reveals.forEach(function (r) { revealObserver.observe(r); });

  // =============================================
  // SCENE PARALLAX + 3D MOUSE DEPTH
  // =============================================
  var scenes = document.querySelectorAll('.scene');
  var mouseX = 0, mouseY = 0;
  var ticking = false;

  if (isDesktop) {
    document.addEventListener('mousemove', function (e) {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  function updateParallax() {
    var vh = window.innerHeight;

    scenes.forEach(function (scene) {
      var rect = scene.getBoundingClientRect();

      if (rect.top < vh && rect.bottom > 0) {
        var progress = (vh - rect.top) / (vh + rect.height);
        var scrollOffset = (progress - 0.5) * 40;

        var bg = scene.querySelector('.scene-bg');
        if (bg) {
          var mx = isDesktop ? mouseX * 8 : 0;
          var my = isDesktop ? mouseY * 5 : 0;
          bg.style.transform = 'translate(' + mx + 'px, ' + (scrollOffset + my) + 'px) scale(1.05)';
        }

        // Paintings move at a different rate for depth (desktop only)
        if (isDesktop) {
          var wrappers = scene.querySelectorAll('.wall-painting.visible .painting-wrapper');
          wrappers.forEach(function (w) {
            w.style.transform = 'translate(' + (mouseX * 3) + 'px, ' + (mouseY * 2) + 'px)';
          });
        }
      }
    });

    ticking = false;
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

  // Wall painting click → lightbox
  wallPaintings.forEach(function (wp) {
    wp.addEventListener('click', function () {
      var img = wp.querySelector('img');
      if (!img) return;
      var src = img.getAttribute('src');
      var idx = PAINTING_SRC_MAP[src];
      if (idx !== undefined) openLightbox(idx);
    });
  });

  // =============================================
  // AMBIENT SOUND (Web Audio API)
  // =============================================
  var audioToggle = document.getElementById('audio-toggle');
  var audioOnIcon = document.getElementById('audio-on-icon');
  var audioOffIcon = document.getElementById('audio-off-icon');
  var audioCtx = null;
  var audioPlaying = false;
  var audioMaster = null;
  var audioNoise = null;
  var dripScheduled = false;

  function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    audioMaster = audioCtx.createGain();
    audioMaster.gain.value = 0;
    audioMaster.connect(audioCtx.destination);

    // Brown noise for wind
    var bufferSize = 2 * audioCtx.sampleRate;
    var noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    var output = noiseBuffer.getChannelData(0);
    var lastOut = 0;
    for (var i = 0; i < bufferSize; i++) {
      var white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 3.5;
    }

    audioNoise = audioCtx.createBufferSource();
    audioNoise.buffer = noiseBuffer;
    audioNoise.loop = true;

    var windFilter = audioCtx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 400;
    windFilter.Q.value = 0.5;

    audioNoise.connect(windFilter);
    windFilter.connect(audioMaster);
    audioNoise.start();

    // Wind variation LFO
    var lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 200;
    lfo.connect(lfoGain);
    lfoGain.connect(windFilter.frequency);
    lfo.start();
  }

  function scheduleDrips() {
    if (!audioPlaying || !audioCtx) return;

    var delay = 2 + Math.random() * 8;
    setTimeout(function () {
      if (!audioPlaying || !audioCtx) return;

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      var filter = audioCtx.createBiquadFilter();

      osc.frequency.value = 800 + Math.random() * 1200;
      filter.type = 'bandpass';
      filter.frequency.value = 1000 + Math.random() * 500;
      filter.Q.value = 10;

      gain.gain.setValueAtTime(0.02, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(audioMaster);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);

      scheduleDrips();
    }, delay * 1000);
  }

  function toggleAudio() {
    if (!audioCtx) initAudio();

    audioPlaying = !audioPlaying;

    if (audioPlaying) {
      audioCtx.resume();
      audioMaster.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 1.5);
      scheduleDrips();
      audioToggle.classList.add('playing');
      audioOnIcon.style.display = '';
      audioOffIcon.style.display = 'none';
    } else {
      audioMaster.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
      audioToggle.classList.remove('playing');
      audioOnIcon.style.display = 'none';
      audioOffIcon.style.display = '';
    }
  }

  if (audioToggle) {
    audioToggle.addEventListener('click', toggleAudio);
  }

  // =============================================
  // COMBINED SCROLL HANDLER
  // =============================================
  window.addEventListener('scroll', function () {
    updateProgress();

    if (!ticking) {
      requestAnimationFrame(function () {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  // =============================================
  // ANIMATION LOOP
  // =============================================
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  updateProgress();

  function animationLoop() {
    updateParticles();
    requestAnimationFrame(animationLoop);
  }

  requestAnimationFrame(animationLoop);
})();
