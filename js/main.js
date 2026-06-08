/* ═══════════════════════════════════════════════════════════
   AGUSTÍN MACKO PORTFOLIO — MAIN JS
   ═══════════════════════════════════════════════════════════ */

// ─── LOADER ─────────────────────────────────────────────────
(function () {
    const loader  = document.getElementById('loader');
    const fill    = document.getElementById('loader-fill');
    const counter = document.getElementById('loader-counter');
  
    let progress = 0;
    const target = 100;
    const duration = 1600; // ms
    const interval = 30;
    const steps = duration / interval;
    const increment = target / steps;
  
    const tick = setInterval(() => {
      progress = Math.min(progress + increment + (Math.random() * 2 - 1), target);
      const pct = Math.floor(progress);
      counter.textContent = pct + '%';
      fill.style.width = pct + '%';
  
      if (progress >= target) {
        clearInterval(tick);
        counter.textContent = '100%';
        fill.style.width = '100%';
        setTimeout(() => {
          loader.classList.add('hidden');
          document.body.style.overflow = '';
          initAll();
        }, 400);
      }
    }, interval);
  
    document.body.style.overflow = 'hidden';
  })();
  
  // ─── INIT ALL ────────────────────────────────────────────────
  function initAll() {
    initCursor();
    initNav();
    initMobileNav();
    initReveal();
    initCounters();
    initProjectHover();
    initHeroParallax();
  }
  
  // ─── CUSTOM CURSOR ───────────────────────────────────────────
  function initCursor() {
    if (window.innerWidth <= 768) return;
  
    const cursor   = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
  
    let mx = 0, my = 0;
    let fx = 0, fy = 0;
    let raf;
  
    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
    });
  
    function animateFollower() {
      fx += (mx - fx) * 0.1;
      fy += (my - fy) * 0.1;
      follower.style.left = fx + 'px';
      follower.style.top  = fy + 'px';
      raf = requestAnimationFrame(animateFollower);
    }
    animateFollower();
  
    // Hover states
    const interactables = document.querySelectorAll('a, button, [data-cursor]');
    interactables.forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hover');
        follower.classList.add('hover');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hover');
        follower.classList.remove('hover');
      });
    });
  
    // Click state
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup',   () => cursor.classList.remove('clicking'));
  
    // Hide on leave
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity   = '0';
      follower.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity   = '1';
      follower.style.opacity = '1';
    });
  }
  
  // ─── NAV SCROLL ──────────────────────────────────────────────
  function initNav() {
    const nav = document.getElementById('nav');
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ─── MOBILE NAV ──────────────────────────────────────────────
  function initMobileNav() {
    const toggle = document.getElementById('nav-toggle');
    const menu   = document.getElementById('nav-mobile');
    if (!toggle || !menu) return;

    const close = () => {
      toggle.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú');
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('nav-open');
    };

    const open = () => {
      toggle.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú');
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      document.body.classList.add('nav-open');
    };

    toggle.addEventListener('click', () => {
      menu.classList.contains('is-open') ? close() : open();
    });

    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', close);
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) close();
    });
  }
  
  // ─── SCROLL REVEAL ───────────────────────────────────────────
  function initReveal() {
    const elements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -60px 0px'
    });
  
    elements.forEach(el => observer.observe(el));
  }
  
  // ─── COUNTERS ────────────────────────────────────────────────
  function initCounters() {
    const nums = document.querySelectorAll('.stat-num[data-target]');
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = +el.dataset.target;
        const duration = 1400;
        const start = performance.now();
  
        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
          el.textContent = Math.floor(eased * target);
          if (progress < 1) requestAnimationFrame(update);
          else el.textContent = target;
        }
        requestAnimationFrame(update);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
  
    nums.forEach(el => observer.observe(el));
  }
  
  // ─── PROJECT PREVIEW TILT ────────────────────────────────────
  function initProjectHover() {
    if (window.innerWidth <= 768) return;

    document.querySelectorAll('.project-item').forEach(item => {
      const preview = item.querySelector('.project-preview');
      if (!preview) return;

      item.addEventListener('mousemove', (e) => {
        const rect = item.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        preview.style.transform =
          `translateY(-50%) rotate(${x * -6}deg) scale(1) translate(${x * 12}px, ${y * 8}px)`;
      });

      item.addEventListener('mouseleave', () => {
        preview.style.transform = '';
      });
    });
  }

  // ─── HERO PARALLAX ───────────────────────────────────────────
  function initHeroParallax() {
    if (window.innerWidth <= 768) return;

    const watermark = document.querySelector('.hero-watermark');
    const stripes = document.querySelectorAll('.hero-stripe');
    if (!watermark) return;

    document.addEventListener('mousemove', (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      watermark.style.transform = `translate(${x * 20}px, ${y * 10}px)`;
      stripes.forEach((s, i) => {
        s.style.transform = `rotate(-12deg) translate(${x * (12 + i * 8)}px, ${y * 6}px)`;
      });
    });
  }
  
  // ─── SMOOTH ANCHOR LINKS ─────────────────────────────────────
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (!href || href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  
  // ─── PAGE VISIBILITY ANIMATION PAUSE ─────────────────────────
  document.addEventListener('visibilitychange', () => {
    const ticker = document.querySelector('.ticker-track');
    if (ticker) {
      ticker.style.animationPlayState =
        document.hidden ? 'paused' : 'running';
    }
  });