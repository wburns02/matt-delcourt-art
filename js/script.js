/**
 * Matt Delcourt Art — Site Interactions
 * Scroll reveals, vine growth, painting glows
 */

(function () {
  'use strict';

  // =============================================
  // SCROLL REVEAL (IntersectionObserver)
  // =============================================
  const revealElements = document.querySelectorAll('.reveal-up');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.delay || 0;
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, parseInt(delay));
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  revealElements.forEach((el) => revealObserver.observe(el));

  // =============================================
  // VINE GROWTH ANIMATION
  // =============================================
  const vinePaths = document.querySelectorAll('.vine-path');
  const vineLeaves = document.querySelectorAll('.vine-leaf');

  // Start vine growth after a short delay (let hero animations play first)
  function growVines() {
    vinePaths.forEach((path) => {
      path.classList.add('animate');
    });

    // Show leaves after vines have grown a bit
    setTimeout(() => {
      vineLeaves.forEach((leaf) => {
        leaf.classList.add('visible');
      });
    }, 800);
  }

  // Trigger vine growth when user scrolls past hero
  const heroSection = document.getElementById('hero');
  const vineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        // When hero starts leaving viewport (scrolling down)
        if (!entry.isIntersecting) {
          growVines();
          vineObserver.disconnect();
        }
      });
    },
    { threshold: 0.5 }
  );

  if (heroSection) {
    vineObserver.observe(heroSection);
  }

  // =============================================
  // PAINTING GLOW ON SCROLL
  // =============================================
  const paintingCards = document.querySelectorAll('.painting-card');

  const glowObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    { threshold: 0.3 }
  );

  paintingCards.forEach((card) => glowObserver.observe(card));

  // =============================================
  // PARALLAX EFFECT ON HERO
  // =============================================
  const heroTexture = document.querySelector('.hero-texture');
  let ticking = false;

  function updateParallax() {
    if (!heroTexture) return;
    const scrollY = window.scrollY;
    const heroHeight = heroSection ? heroSection.offsetHeight : window.innerHeight;

    if (scrollY < heroHeight) {
      heroTexture.style.transform = `translateY(${scrollY * 0.3}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  });

  // =============================================
  // SMOOTH SCROLL FOR NAV (future use)
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =============================================
  // PAINTING HOVER — subtle breathing effect
  // =============================================
  paintingCards.forEach((card) => {
    const frame = card.querySelector('.painting-frame');
    if (!frame) return;

    frame.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.6s ease';
      card.style.transform = 'translateY(-4px)';
    });

    frame.addEventListener('mouseleave', () => {
      card.style.transform = 'translateY(0)';
    });
  });

  // =============================================
  // PROGRESSIVE BACKGROUND TINT
  // =============================================
  // As user scrolls deeper, the page gets subtly greener
  // (nature taking over the digital space)
  function updateBackgroundTint() {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const greenIntensity = Math.min(scrollPercent * 0.08, 0.06);

    document.body.style.backgroundColor = `rgb(
      ${Math.round(26 - greenIntensity * 80)},
      ${Math.round(26 + greenIntensity * 120)},
      ${Math.round(26 - greenIntensity * 60)}
    )`;
  }

  let bgTicking = false;
  window.addEventListener('scroll', () => {
    if (!bgTicking) {
      requestAnimationFrame(() => {
        updateBackgroundTint();
        bgTicking = false;
      });
      bgTicking = true;
    }
  });
})();
