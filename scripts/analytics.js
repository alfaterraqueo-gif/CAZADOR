/* Monitoreo de visitas y eventos — Google Analytics 4 */
(function () {
  'use strict';

  const cfg = window.CAZADOR_ANALYTICS || {};
  const ID = (cfg.MEASUREMENT_ID || '').trim();
  const enabled = cfg.ENABLED !== false;
  const isValid = enabled && /^G-[A-Z0-9]+$/.test(ID) && !ID.includes('XXXX');

  window.cazadorTrack = function (eventName, params) {
    if (!isValid || typeof gtag !== 'function') return;
    gtag('event', eventName, Object.assign({ send_to: ID }, params || {}));
  };

  if (!isValid) {
    console.info('[CAZADOR Analytics] Sin ID de medición. Edita scripts/analytics-config.js');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(ID);
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('js', new Date());
  gtag('config', ID, {
    send_page_view: true,
    anonymize_ip: true,
    cookie_flags: 'SameSite=None;Secure'
  });

  gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname,
    site_name: cfg.SITE_NAME || 'CAZADOR'
  });

  function linkLabel(el) {
    return (el.getAttribute('aria-label')
      || el.textContent
      || el.getAttribute('href')
      || 'enlace').trim().replace(/\s+/g, ' ').slice(0, 120);
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a[href]');
    if (!a) return;

    const href = a.getAttribute('href') || '';
    const label = linkLabel(a);

    if (a.classList.contains('film-link')) {
      window.cazadorTrack('ver_video', { event_category: 'documentales', link_url: href, link_text: label });
      return;
    }
    if (a.classList.contains('archive-dl')) {
      window.cazadorTrack('descargar_pdf', { event_category: 'archivo', file_name: href, link_text: label });
      return;
    }
    if (a.classList.contains('share-btn')) {
      window.cazadorTrack('compartir_red', { event_category: 'difusion', red: label, link_url: href });
      return;
    }
    if (a.classList.contains('social-card') || a.closest('.social-grid')) {
      window.cazadorTrack('click_red_social', { event_category: 'redes', link_url: href, link_text: label });
      return;
    }
    if (a.closest('.nav-links')) {
      window.cazadorTrack('nav_menu', { event_category: 'navegacion', link_url: href, link_text: label });
      return;
    }
    if (href.startsWith('http') && !href.includes(location.hostname)) {
      window.cazadorTrack('click_externo', { event_category: 'salida', link_url: href, link_text: label });
    }
  });

  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.radio-play-btn');
    if (!btn) return;
    const track = btn.closest('.radio-track');
    const title = track?.querySelector('.radio-title')?.textContent?.trim() || 'audio';
    window.cazadorTrack('radio_play', { event_category: 'radio', audio_title: title });
  });

  const seen = new Set();
  const sections = document.querySelectorAll('[data-section]');
  if (sections.length && 'IntersectionObserver' in window) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.35) return;
        const id = entry.target.id;
        if (!id || seen.has(id)) return;
        seen.add(id);
        window.cazadorTrack('ver_seccion', { event_category: 'scroll', section_id: id, section_name: id });
      });
    }, { threshold: [0.35] });
    sections.forEach(function (sec) { obs.observe(sec); });
  }

  let maxScroll = 0;
  window.addEventListener('scroll', function () {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    const pct = Math.round((window.scrollY / h) * 100);
    if (pct >= 25 && maxScroll < 25) { maxScroll = 25; window.cazadorTrack('scroll_profundidad', { percent: 25 }); }
    if (pct >= 50 && maxScroll < 50) { maxScroll = 50; window.cazadorTrack('scroll_profundidad', { percent: 50 }); }
    if (pct >= 75 && maxScroll < 75) { maxScroll = 75; window.cazadorTrack('scroll_profundidad', { percent: 75 }); }
    if (pct >= 90 && maxScroll < 90) { maxScroll = 90; window.cazadorTrack('scroll_profundidad', { percent: 90 }); }
  }, { passive: true });
})();