(function () {
  'use strict';

  // TODO: pegar acá el link de agenda (Calendly, Cal.com, Google Calendar…).
  // Mientras esté vacío, los botones "Agendar 15 minutos" quedan ocultos.
  var AGENDA_URL = '';

  if (AGENDA_URL) {
    document.querySelectorAll('[data-agenda]').forEach(function (el) {
      el.href = AGENDA_URL;
      el.target = '_blank';
      el.rel = 'noopener noreferrer';
      el.hidden = false;
    });
  }

  var sendEvent = function (name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
  };

  var placeOf = function (el) {
    if (el.closest('.mobile-menu')) return 'menu_mobile';
    if (el.closest('.header')) return 'header';
    var section = el.closest('section[id]');
    return section ? section.id : 'otro';
  };

  var currentCase = document.body.dataset.case;

  var locationOf = function (el) {
    if (el.dataset.location) return el.dataset.location;
    var place = placeOf(el);
    return currentCase ? currentCase + '-' + place : place;
  };

  // The origin goes only inside the prefilled message, so the wa.me URL itself stays clean.
  var tagWhatsAppMessage = function (link, where) {
    if (link.dataset.waTagged) return;
    var parts = link.href.split('?');
    var text = new URLSearchParams(parts[1] || '').get('text') || 'Hola Agustín';
    link.href = parts[0] + '?text=' + encodeURIComponent(text + ' (desde: ' + where + ')');
    link.dataset.waTagged = 'true';
  };

  var MAIL_TO = 'mackoaa@gmail.com';
  var MAIL_SUBJECT = 'Consulta desde agustinmacko.com.ar';
  var MAIL_BODY = 'Hola Agustín, te cuento cómo trabajamos hoy:';
  var isMailLink = function (href) {
    return href.indexOf('mailto:') === 0 || href.indexOf('mail.google.com') !== -1;
  };
  var buildMailHref = function (useGmail, body) {
    var subject = encodeURIComponent(MAIL_SUBJECT);
    body = encodeURIComponent(body);
    return useGmail
      ? 'https://mail.google.com/mail/?view=cm&fs=1&to=' + MAIL_TO + '&su=' + subject + '&body=' + body
      : 'mailto:' + MAIL_TO + '?subject=' + subject + '&body=' + body;
  };

  // Gmail's web composer is clumsy on phones and useless without a Gmail session there,
  // so touch devices get a mailto: link that opens the phone's own mail app.
  var preferMailApp = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (preferMailApp) {
    document.querySelectorAll('a[href*="mail.google.com"]').forEach(function (link) {
      link.href = buildMailHref(false, MAIL_BODY);
      link.removeAttribute('target');
    });
  }

  var tagMailMessage = function (link, where) {
    if (link.dataset.mailTagged) return;
    link.href = buildMailHref(link.href.indexOf('mail.google.com') !== -1, MAIL_BODY + ' (desde: ' + where + ')');
    link.dataset.mailTagged = 'true';
  };

  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href]');
    if (!link) return;
    var href = link.getAttribute('href');
    var project = link.closest('.project');
    var where = locationOf(link);
    var params = { location: where };
    if (project) params.project = project.querySelector('h3').textContent.trim();
    if (currentCase) params.case = currentCase;
    var caseMatch = href.match(/^\/casos\/([^/]+)\//);

    if (href.indexOf('wa.me') !== -1) {
      tagWhatsAppMessage(link, where);
      sendEvent('generate_lead', Object.assign(params, { method: 'whatsapp' }));
    }
    else if (isMailLink(href)) {
      tagMailMessage(link, where);
      sendEvent('contact_email', params);
    }
    else if (href.indexOf('linkedin.com') !== -1) sendEvent('contact_linkedin', params);
    else if (href.indexOf('behance.net') !== -1) sendEvent('contact_behance', params);
    else if (link.hasAttribute('data-agenda')) sendEvent('contact_agenda', params);
    else if (caseMatch) sendEvent('case_open', Object.assign(params, { case_name: caseMatch[1] }));
    else if (project) sendEvent('project_site_click', params);
  });

  var isHome = location.pathname === '/' || /\/index\.html$/.test(location.pathname);
  if (isHome) {
    var depthMarks = [50, 90];
    var onDepth = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var percent = (window.scrollY / max) * 100;
      while (depthMarks.length && percent >= depthMarks[0]) {
        sendEvent('scroll_depth', { percent: depthMarks.shift() });
      }
      if (!depthMarks.length) window.removeEventListener('scroll', onDepth);
    };
    window.addEventListener('scroll', onDepth, { passive: true });
  }

  var testimonials = document.getElementById('testimonios');
  if (testimonials) {
    // ?preview=testimonios shows every slot, finished or not, without publishing them for regular visitors.
    var previewTestimonials = new URLSearchParams(location.search).get('preview') === 'testimonios';
    testimonials.classList.toggle('is-preview', previewTestimonials);
    var shownTestimonials = 0;
    testimonials.querySelectorAll('.testimonial').forEach(function (item) {
      var filled = function (field) { return field.textContent.trim() !== ''; };
      var complete = previewTestimonials || (item.dataset.aprobado === 'si' &&
        Array.prototype.every.call(item.querySelectorAll('[data-field], [data-required]'), filled));
      item.hidden = !complete;
      if (complete) shownTestimonials += 1;
    });
    testimonials.hidden = shownTestimonials === 0;
  }

  // Elements with a pending piece of data stay hidden until every [data-required] is filled;
  // an optional [data-fallback-for] sibling shows a version that doesn't need that data.
  document.querySelectorAll('[data-needs-content]').forEach(function (el) {
    var complete = Array.prototype.every.call(el.querySelectorAll('[data-required]'), function (field) {
      return field.textContent.trim() !== '';
    });
    el.hidden = !complete;
    var fallback = el.id && document.querySelector('[data-fallback-for="' + el.id + '"]');
    if (fallback) fallback.hidden = complete;
  });

  // TODO: completar la foto de "Sobre mí" (src: 'img/agustin.webp') y su alt describiendo lo que se ve.
  // Se muestra solo cuando los dos campos están completos.
  var ABOUT_PHOTO = { src: '', alt: '' };
  // TODO: completar con 'img/domus-figma.webp' cuando subas la captura del diseño en Figma.
  var FIGMA_IMG = '';

  var aboutVisual = document.querySelector('.about-visual');
  if (aboutVisual) {
    var photoFrame = aboutVisual.querySelector('.about-photo');
    var figmaFrame = aboutVisual.querySelector('.about-figma');
    var aboutArrow = aboutVisual.querySelector('.about-arrow');
    var aboutCaption = aboutVisual.querySelector('figcaption');
    var defaultCaption = aboutCaption.textContent;

    var syncAboutVisual = function () {
      var hasPhoto = !photoFrame.hidden;
      var hasFigma = !figmaFrame.hidden;
      aboutVisual.classList.toggle('has-photo', hasPhoto);
      aboutVisual.classList.toggle('has-figma', hasFigma);
      aboutArrow.toggleAttribute('hidden', !hasFigma);
      aboutCaption.textContent = hasFigma ? aboutVisual.dataset.captionFigma : defaultCaption;
    };

    var addAboutImage = function (frame, src, alt, width, height) {
      var img = document.createElement('img');
      img.src = src;
      img.alt = alt;
      img.width = width;
      img.height = height;
      img.loading = 'lazy';
      img.decoding = 'async';
      img.addEventListener('error', function () {
        frame.hidden = true;
        syncAboutVisual();
      });
      frame.appendChild(img);
      frame.hidden = false;
    };

    if (ABOUT_PHOTO.src && ABOUT_PHOTO.alt) addAboutImage(photoFrame, ABOUT_PHOTO.src, ABOUT_PHOTO.alt, 800, 1000);
    if (FIGMA_IMG) addAboutImage(figmaFrame, FIGMA_IMG, 'Diseño en Figma de una pantalla de Domus', 1200, 750);
    syncAboutVisual();
  }

  var UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];
  var query = new URLSearchParams(location.search);
  var readStored = function (key) {
    try { return sessionStorage.getItem(key) || ''; } catch (err) { return ''; }
  };
  UTM_KEYS.forEach(function (key) {
    var value = query.get(key);
    if (!value) return;
    try { sessionStorage.setItem(key, value); } catch (err) { /* storage blocked: the field stays empty */ }
  });

  var fillHiddenFields = function (target) {
    target.querySelectorAll('[data-fill]').forEach(function (input) {
      input.value = input.dataset.fill === 'page' ? location.pathname : readStored(input.dataset.fill);
    });
  };

  var form = document.getElementById('form');
  if (form) {
    fillHiddenFields(form);
    var formStatus = form.querySelector('.form-status');
    var submitButton = form.querySelector('[type="submit"]');
    var submitLabel = submitButton.textContent;

    var showFormStatus = function (html, isError) {
      formStatus.innerHTML = html;
      formStatus.classList.toggle('is-error', Boolean(isError));
      formStatus.hidden = false;
    };

    form.addEventListener('submit', function (e) {
      if (!window.fetch || !window.FormData) return;
      e.preventDefault();
      fillHiddenFields(form);
      submitButton.disabled = true;
      submitButton.textContent = 'Enviando…';
      formStatus.hidden = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Formspree ' + response.status);
          form.reset();
          fillHiddenFields(form);
          showFormStatus('¡Gracias! Recibí tu mensaje y te escribo al mail que dejaste.');
          var params = { method: 'formulario', location: locationOf(form) };
          if (currentCase) params.case = currentCase;
          sendEvent('generate_lead', params);
        })
        .catch(function () {
          showFormStatus('No pude recibir tu mensaje. Probá de nuevo o escribime a <a href="' + buildMailHref(!preferMailApp, MAIL_BODY) + '"' + (preferMailApp ? '' : ' target="_blank" rel="noopener noreferrer"') + ' data-location="formulario-error">mackoaa@gmail.com</a> o por <a href="https://wa.me/5491150560359" target="_blank" rel="noopener noreferrer" data-location="formulario-error">WhatsApp</a>.', true);
        })
        .then(function () {
          submitButton.disabled = false;
          submitButton.textContent = submitLabel;
        });
    });
  }

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
  document.querySelectorAll('.project-stack li').forEach(function (chip) {
    var key = chip.textContent.trim().toLowerCase();
    if (!(key in chipHues)) {
      chipHues[key] = Math.round((215 + Object.keys(chipHues).length * 137.508) % 360);
    }
    chip.style.setProperty('--chip-bg', 'hsl(' + chipHues[key] + ' 85% 93%)');
    chip.style.setProperty('--chip-ink', 'hsl(' + chipHues[key] + ' 55% 30%)');
  });

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
