/* CAZADOR — Cinematic interactions */

(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  /* ── Loader ── */
  const loader = document.getElementById('loader');
  const loaderFill = document.querySelector('.loader-bar-fill');
  let loadProgress = 0;

  function tickLoader() {
    loadProgress = Math.min(loadProgress + Math.random() * 18 + 8, 100);
    if (loaderFill) loaderFill.style.width = loadProgress + '%';
    if (loadProgress < 100) {
      requestAnimationFrame(() => setTimeout(tickLoader, 120));
    } else {
      setTimeout(() => {
        loader?.classList.add('hidden');
        document.body.classList.remove('loading');
      }, 400);
    }
  }
  document.body.classList.add('loading');
  tickLoader();

  /* ── Custom cursor ── */
  if (!isTouch && !prefersReduced) {
    const ring = document.querySelector('.cursor-ring');
    const dot = document.querySelector('.cursor-dot');
    let mx = 0, my = 0, rx = 0, ry = 0;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; }
    });

    function animCursor() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; }
      requestAnimationFrame(animCursor);
    }
    animCursor();

    document.querySelectorAll('a, button, .film-card, .archive-card').forEach((el) => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  /* ── Nav scroll & active ── */
  const nav = document.querySelector('.nav');
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('[data-section]');

  window.addEventListener('scroll', () => {
    nav?.classList.toggle('scrolled', window.scrollY > 60);

    let current = '';
    sections.forEach((sec) => {
      if (window.scrollY >= sec.offsetTop - 120) current = sec.id;
    });
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });

  document.querySelector('.nav-toggle')?.addEventListener('click', () => {
    document.querySelector('.nav-links')?.classList.toggle('open');
  });

  /* ── Particle network ── */
  const pCanvas = document.getElementById('particle-canvas');
  if (pCanvas && !prefersReduced) {
    const ctx = pCanvas.getContext('2d');
    let particles = [];
    const COUNT = Math.min(90, Math.floor(window.innerWidth / 14));
    const CONNECT = 140;

    function resizeParticles() {
      pCanvas.width = window.innerWidth;
      pCanvas.height = window.innerHeight;
    }
    resizeParticles();
    window.addEventListener('resize', resizeParticles);

    for (let i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random() * pCanvas.width,
        y: Math.random() * pCanvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        hue: Math.random() > 0.5 ? 185 : 38
      });
    }

    let mouseX = -9999, mouseY = -9999;
    document.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

    function drawParticles() {
      ctx.clearRect(0, 0, pCanvas.width, pCanvas.height);

      particles.forEach((p) => {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180 && dist > 0) {
          p.vx += dx / dist * 0.008;
          p.vy += dy / dist * 0.008;
        }
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99;

        if (p.x < 0 || p.x > pCanvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > pCanvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 100%, 65%, 0.7)`;
        ctx.fill();
      });

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i], b = particles[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < CONNECT) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.22 * (1 - d / CONNECT)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ── DNA Helix background ── */
  const hCanvas = document.getElementById('helix-canvas');
  if (hCanvas && !prefersReduced) {
    const hctx = hCanvas.getContext('2d');
    let helixT = 0;

    function resizeHelix() {
      hCanvas.width = window.innerWidth;
      hCanvas.height = window.innerHeight;
    }
    resizeHelix();
    window.addEventListener('resize', resizeHelix);

    function drawHelix() {
      hctx.clearRect(0, 0, hCanvas.width, hCanvas.height);
      const cx = hCanvas.width * 0.85;
      const segments = 60;
      const amp = 60;
      const spacing = hCanvas.height / segments;

      for (let i = 0; i < segments; i++) {
        const y = i * spacing + (helixT % spacing);
        const phase = (i / segments) * Math.PI * 4 + helixT * 0.01;
        const x1 = cx + Math.sin(phase) * amp;
        const x2 = cx + Math.sin(phase + Math.PI) * amp;

        hctx.beginPath();
        hctx.moveTo(x1, y);
        hctx.lineTo(x2, y);
        hctx.strokeStyle = `rgba(0, 240, 255, ${0.14 + (i / segments) * 0.1})`;
        hctx.lineWidth = 1;
        hctx.stroke();

        hctx.beginPath();
        hctx.arc(x1, y, 2.5, 0, Math.PI * 2);
        hctx.fillStyle = 'rgba(77, 255, 145, 0.25)';
        hctx.fill();

        hctx.beginPath();
        hctx.arc(x2, y, 2.5, 0, Math.PI * 2);
        hctx.fillStyle = 'rgba(245, 166, 35, 0.25)';
        hctx.fill();
      }
      helixT += 0.6;
      requestAnimationFrame(drawHelix);
    }
    drawHelix();
  }

  /* ── Tech grid & data stream ── */
  const tCanvas = document.getElementById('tech-grid-canvas');
  if (tCanvas && !prefersReduced) {
    const tctx = tCanvas.getContext('2d');
    let gridOffset = 0;
    const dataBits = Array.from({ length: 24 }, (_, i) => ({
      x: Math.random(),
      y: Math.random(),
      speed: 0.002 + Math.random() * 0.004,
      char: ['0','1','A','T','G','C','λ','∑','∞','⚛'][Math.floor(Math.random() * 10)]
    }));

    function resizeTech() {
      tCanvas.width = window.innerWidth;
      tCanvas.height = window.innerHeight;
    }
    resizeTech();
    window.addEventListener('resize', resizeTech);

    function drawTech() {
      tctx.clearRect(0, 0, tCanvas.width, tCanvas.height);
      const gap = 50;
      gridOffset = (gridOffset + 0.3) % gap;

      tctx.strokeStyle = 'rgba(0, 240, 255, 0.06)';
      tctx.lineWidth = 0.5;
      for (let x = -gap; x < tCanvas.width + gap; x += gap) {
        tctx.beginPath();
        tctx.moveTo(x + gridOffset, 0);
        tctx.lineTo(x + gridOffset, tCanvas.height);
        tctx.stroke();
      }
      for (let y = -gap; y < tCanvas.height + gap; y += gap) {
        tctx.beginPath();
        tctx.moveTo(0, y + gridOffset * 0.5);
        tctx.lineTo(tCanvas.width, y + gridOffset * 0.5);
        tctx.stroke();
      }

      tctx.font = '11px Orbitron, monospace';
      dataBits.forEach((bit) => {
        bit.y -= bit.speed;
        if (bit.y < -0.05) { bit.y = 1.05; bit.x = Math.random(); }
        const px = bit.x * tCanvas.width;
        const py = bit.y * tCanvas.height;
        tctx.fillStyle = `rgba(0, 240, 255, ${0.15 + Math.sin(Date.now() * 0.003 + bit.x * 10) * 0.1})`;
        tctx.fillText(bit.char, px, py);
      });

      requestAnimationFrame(drawTech);
    }
    drawTech();
  }

  /* ── Scroll reveal ── */
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => revealObs.observe(el));

  /* ── Counter animation ── */
  const counters = document.querySelectorAll('[data-count]');
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current + suffix;
        if (current >= target) clearInterval(timer);
      }, 40);
      countObs.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach((el) => countObs.observe(el));

  /* ── Portrait orbital particles ── */
  const portraitCanvas = document.querySelector('.portrait-particles');
  if (portraitCanvas && !prefersReduced) {
    const pCtx = portraitCanvas.getContext('2d');
    const orbitParticles = [];
    const ORBIT_COUNT = 24;

    function resizePortrait() {
      const wrap = portraitCanvas.parentElement;
      if (!wrap) return;
      portraitCanvas.width = wrap.offsetWidth;
      portraitCanvas.height = wrap.offsetHeight;
    }
    resizePortrait();
    window.addEventListener('resize', resizePortrait);

    for (let i = 0; i < ORBIT_COUNT; i++) {
      orbitParticles.push({
        angle: (i / ORBIT_COUNT) * Math.PI * 2,
        radius: 130 + Math.random() * 60,
        speed: 0.003 + Math.random() * 0.006,
        size: Math.random() * 2 + 1,
        hue: Math.random() > 0.5 ? 185 : 45
      });
    }

    function drawPortraitParticles() {
      if (!pCtx) return;
      const cx = portraitCanvas.width / 2;
      const cy = portraitCanvas.height / 2;
      pCtx.clearRect(0, 0, portraitCanvas.width, portraitCanvas.height);

      orbitParticles.forEach((p) => {
        p.angle += p.speed;
        const x = cx + Math.cos(p.angle) * p.radius;
        const y = cy + Math.sin(p.angle) * p.radius * 0.85;
        pCtx.beginPath();
        pCtx.arc(x, y, p.size, 0, Math.PI * 2);
        pCtx.fillStyle = `hsla(${p.hue}, 100%, 65%, ${0.4 + Math.sin(p.angle * 3) * 0.3})`;
        pCtx.fill();
      });

      requestAnimationFrame(drawPortraitParticles);
    }
    drawPortraitParticles();
  }

  /* ── 3D tilt on cards ── */
  if (!isTouch && !prefersReduced) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ── Radio player ── */
  let activeAudio = null;
  let activeTrack = null;
  let animFrame = null;

  document.querySelectorAll('.radio-track').forEach((track) => {
    const audio = track.querySelector('audio');
    const playBtn = track.querySelector('.radio-play-btn');
    const canvas = track.querySelector('canvas');
    const timeEl = track.querySelector('.radio-time');
    if (!audio || !playBtn) return;

    const ctx2d = canvas?.getContext('2d');
    const bars = 48;
    const heights = Array.from({ length: bars }, () => Math.random());

    function drawWave(active) {
      if (!ctx2d || !canvas) return;
      const w = canvas.width = canvas.offsetWidth * 2;
      const h = canvas.height = canvas.offsetHeight * 2;
      ctx2d.clearRect(0, 0, w, h);
      const bw = w / bars;

      heights.forEach((_, i) => {
        if (active) heights[i] += (Math.random() - 0.5) * 0.15;
        heights[i] = Math.max(0.08, Math.min(1, heights[i]));
        const bh = heights[i] * h * 0.7;
        const x = i * bw + bw * 0.15;
        const grad = ctx2d.createLinearGradient(0, h, 0, h - bh);
        grad.addColorStop(0, 'rgba(0,232,255,0.3)');
        grad.addColorStop(1, 'rgba(245,166,35,0.8)');
        ctx2d.fillStyle = grad;
        ctx2d.fillRect(x, h - bh, bw * 0.7, bh);
      });
    }

    function formatTime(s) {
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60).toString().padStart(2, '0');
      return `${m}:${sec}`;
    }

    function updateTime() {
      if (timeEl) timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
    }

    function setPlayState(playing) {
      playBtn.textContent = playing ? '⏸' : '▶';
      playBtn.setAttribute('aria-label', playing ? 'Pausar' : 'Reproducir');
      track.classList.toggle('playing', playing);
    }

    function resetOtherTrack() {
      if (!activeTrack || activeTrack === track) return;
      activeTrack.classList.remove('playing');
      const btn = activeTrack.querySelector('.radio-play-btn');
      if (btn) { btn.textContent = '▶'; btn.setAttribute('aria-label', 'Reproducir'); }
    }

    playBtn.addEventListener('click', () => {
      if (activeAudio && activeAudio !== audio) {
        activeAudio.pause();
        resetOtherTrack();
      }

      if (audio.paused) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setPlayState(true);
            activeAudio = audio;
            activeTrack = track;
            function anim() {
              drawWave(true);
              updateTime();
              animFrame = requestAnimationFrame(anim);
            }
            cancelAnimationFrame(animFrame);
            anim();
          }).catch(() => {
            setPlayState(false);
            if (timeEl) timeEl.textContent = 'Error de señal';
          });
        }
      } else {
        audio.pause();
        setPlayState(false);
        cancelAnimationFrame(animFrame);
        drawWave(false);
      }
    });

    audio.addEventListener('loadedmetadata', updateTime);
    audio.addEventListener('error', () => {
      if (timeEl) timeEl.textContent = 'Sin señal';
      setPlayState(false);
    });

    audio.addEventListener('ended', () => {
      setPlayState(false);
      cancelAnimationFrame(animFrame);
      drawWave(false);
    });

    drawWave(false);
  });

  /* ── Film card click ── */
  document.querySelectorAll('.film-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('a')) return;
      const link = card.querySelector('.film-link');
      if (link) window.open(link.href, '_blank');
    });
  });

  /* ── Parallax hero ── */
  if (!prefersReduced) {
    const hero = document.querySelector('.hero');
    const logo = document.querySelector('.hero-logo');
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight && logo) {
        logo.style.transform = `translateY(${y * 0.25}px)`;
        if (hero) hero.style.opacity = 1 - y / (window.innerHeight * 0.8);
      }
    }, { passive: true });
  }
})();