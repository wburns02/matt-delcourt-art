/**
 * Matt Delcourt Art — Scenes of Reclamation
 * Scroll-triggered painting reveals, progress bar, parallax
 */

(function () {
  'use strict';

  // =============================================
  // SCROLL PROGRESS BAR
  // =============================================
  const progressBar = document.querySelector('.scroll-progress-bar');

  function updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = progress + '%';
    }
  }

  // =============================================
  // PAINTING REVEAL ON SCROLL
  // =============================================
  const paintings = document.querySelectorAll('.wall-painting');
  const reveals = document.querySelectorAll('.reveal');

  const paintingObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger the paintings slightly
          const delay = entry.target.classList.contains('companion-painting') ? 600 : 200;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  paintings.forEach((p) => paintingObserver.observe(p));

  // =============================================
  // CAPTION / REVEAL ANIMATION
  // =============================================
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    },
    {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  reveals.forEach((r) => revealObserver.observe(r));

  // =============================================
  // SUBTLE PARALLAX ON SCENE BACKGROUNDS
  // =============================================
  const scenes = document.querySelectorAll('.scene');
  let ticking = false;

  function updateParallax() {
    scenes.forEach((scene) => {
      const rect = scene.getBoundingClientRect();
      const vh = window.innerHeight;

      // Only process if scene is in or near viewport
      if (rect.top < vh && rect.bottom > 0) {
        const progress = (vh - rect.top) / (vh + rect.height);
        const offset = (progress - 0.5) * 40; // +-20px of movement

        const bg = scene.querySelector('.scene-bg');
        if (bg) {
          bg.style.transform = `translateY(${offset}px) scale(1.05)`;
        }
      }
    });

    ticking = false;
  }

  // =============================================
  // COMBINED SCROLL HANDLER
  // =============================================
  window.addEventListener('scroll', () => {
    updateProgress();

    if (!ticking) {
      requestAnimationFrame(() => {
        updateParallax();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Initial call
  updateProgress();
})();
