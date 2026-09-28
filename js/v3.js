(function () {
  'use strict';

  var header = document.getElementById('header');
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');

  function onScroll() {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.setAttribute('aria-hidden', String(!open));
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setMenu(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setMenu(false);
  });

  window.addEventListener('resize', function () {
    if (window.innerWidth > 760) setMenu(false);
  });

  // Golden-angle hue steps keep every distinct label on a visibly different hue.
  var chipHues = {};
  document.querySelectorAll('.project-stack li, .steps .step-list li').forEach(function (chip) {
    var key = chip.textContent.trim().toLowerCase();
    if (!(key in chipHues)) {
      chipHues[key] = Math.round((215 + Object.keys(chipHues).length * 137.508) % 360);
    }
    chip.style.setProperty('--chip-bg', 'hsl(' + chipHues[key] + ' 85% 93%)');
    chip.style.setProperty('--chip-ink', 'hsl(' + chipHues[key] + ' 55% 30%)');
  });

  var track = document.getElementById('projects-track');
  var navButtons = document.querySelectorAll('.carousel-btn');

  if (track) {
    var step = function () {
      var card = track.querySelector('.project');
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return card ? card.offsetWidth + gap : track.clientWidth;
    };

    var updateNav = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      navButtons.forEach(function (btn) {
        btn.disabled = btn.dataset.dir === '-1' ? track.scrollLeft <= 2 : track.scrollLeft >= max;
      });
    };

    navButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        track.scrollBy({ left: step() * Number(btn.dataset.dir), behavior: 'smooth' });
      });
    });

    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        track.scrollBy({ left: step() * (e.key === 'ArrowRight' ? 1 : -1), behavior: 'smooth' });
      }
    });

    track.addEventListener('scroll', updateNav, { passive: true });
    window.addEventListener('resize', updateNav);
    updateNav();
  }

  var items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { observer.observe(el); });
})();
