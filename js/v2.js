(function () {
  const header = document.getElementById('header');
  const lightSections = document.querySelectorAll('[data-theme="light"]');

  const updateHeader = () => {
    const probe = header.getBoundingClientRect().top + 28;
    let onLight = false;
    lightSections.forEach((s) => {
      const r = s.getBoundingClientRect();
      if (r.top <= probe && r.bottom >= probe) onLight = true;
    });
    header.classList.toggle('is-light', onLight);
  };
  window.addEventListener('scroll', updateHeader, { passive: true });
  window.addEventListener('resize', updateHeader);
  updateHeader();

  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');

  const setMenu = (open) => {
    toggle.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', String(!open));
  };

  toggle.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const items = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => observer.observe(el));
})();
