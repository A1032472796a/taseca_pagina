/* =========================================================
   TASECA — Interacciones del sitio (JavaScript vanilla)
   ========================================================= */
document.documentElement.classList.remove('no-js');

/* ===== CONFIGURACIÓN — misma conexión del sitio actual ===== */
const CONFIG = {
  SUPABASE_URL: 'https://gckssepifcqxozbsxfsd.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_xtFAK7C-8p5GGbBb-evdiA_gys88PVh',
  TABLES: { contactos: 'contactos' }
};
const REST = CONFIG.SUPABASE_URL.replace(/\/+$/, '') + '/rest/v1/';
const SUPA_HEADERS = {
  'apikey': CONFIG.SUPABASE_ANON_KEY,
  'Authorization': 'Bearer ' + CONFIG.SUPABASE_ANON_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=minimal'
};

/* ===== Header al hacer scroll ===== */
const header = document.querySelector('.site-header');
const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 12);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* ===== Menú móvil ===== */
const toggle = document.querySelector('.nav-toggle');
if (toggle) {
  const setOpen = (open) => {
    document.body.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  };
  toggle.addEventListener('click', () => setOpen(!document.body.classList.contains('nav-open')));
  document.querySelectorAll('.nav-links a, .nav-cta a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) setOpen(false); });
}

/* ===== Animación de entrada ===== */
const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach((el) => io.observe(el));
} else {
  reveals.forEach((el) => el.classList.add('in'));
}

/* ===== Contadores animados (data-count) ===== */
const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  if (reduceMotion) { el.textContent = prefix + target.toLocaleString('es-CO') + suffix; return; }
  const duration = 1600;
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = prefix + Math.round(target * eased).toLocaleString('es-CO') + suffix;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
if (counters.length && 'IntersectionObserver' in window) {
  const co = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => co.observe(el));
}

/* ===== FAQ: un solo elemento abierto a la vez ===== */
document.querySelectorAll('.faq').forEach((faq) => {
  faq.addEventListener('toggle', (e) => {
    if (e.target.open) faq.querySelectorAll('details[open]').forEach((d) => { if (d !== e.target) d.open = false; });
  }, true);
});

/* ===== Preseleccionar servicio desde la URL (?servicio=...) ===== */
const params = new URLSearchParams(location.search);
const servicioSelect = document.querySelector('select[name="servicio"]');
if (servicioSelect && params.get('servicio')) {
  const wanted = params.get('servicio');
  const opt = [...servicioSelect.options].find((o) => o.dataset.key === wanted);
  if (opt) servicioSelect.value = opt.value;
}

/* ===== Videos de YouTube (miniatura + ventana emergente) =====
   Uso: <div class="video" data-youtube="ID_DEL_VIDEO" data-title="Título"></div>
   Si data-youtube está vacío se muestra "Video próximamente". */
const PLAY_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>';
let videoModal = null;
function openVideo(id, title) {
  if (!videoModal) {
    videoModal = document.createElement('dialog');
    videoModal.className = 'video-modal';
    videoModal.innerHTML = '<button class="video-close" type="button" aria-label="Cerrar video">&times;</button><div class="video-frame"></div>';
    document.body.appendChild(videoModal);
    const stop = () => { videoModal.querySelector('.video-frame').innerHTML = ''; };
    const closeVideo = () => { stop(); videoModal.close(); };
    videoModal.querySelector('.video-close').addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });
    videoModal.addEventListener('close', stop); // tecla Esc
  }
  const frame = document.createElement('iframe');
  frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0&modestbranding=1';
  frame.title = title || 'Video de TASECA';
  frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  frame.allowFullscreen = true;
  videoModal.querySelector('.video-frame').appendChild(frame);
  videoModal.showModal();
}
document.querySelectorAll('.video').forEach((el) => {
  const id = (el.dataset.youtube || '').trim();
  const title = el.dataset.title || 'Video';
  const poster = el.dataset.poster || (id ? 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg' : '');
  const img = poster ? '<img src="' + poster + '" alt="' + title.replace(/"/g, '&quot;') + '" loading="lazy" decoding="async">' : '';
  if (!id) {
    // Sin video: se muestra solo la imagen de portada (o "Video próximamente" si tampoco hay imagen)
    if (poster) { el.classList.add('is-poster'); el.innerHTML = img; return; }
    el.classList.add('is-empty');
    el.innerHTML = '<span class="video-play">' + PLAY_ICON + '</span><span class="video-label">Video próximamente</span>';
    return;
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'video-thumb';
  btn.setAttribute('aria-label', 'Reproducir video: ' + title);
  btn.innerHTML = img + '<span class="video-play">' + PLAY_ICON + '</span><span class="video-label">Ver video</span>';
  btn.addEventListener('click', () => openVideo(id, title));
  el.appendChild(btn);
});

/* ===== Carrusel continuo: duplica las tarjetas para un ciclo sin cortes ===== */
document.querySelectorAll('[data-marquee]').forEach((m) => {
  const track = m.querySelector('.marquee-track');
  if (!track) return;
  const items = [...track.children];
  items.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.querySelectorAll('a, button').forEach((n) => n.setAttribute('tabindex', '-1'));
    track.appendChild(clone);
  });
  track.style.setProperty('--marquee-duration', (items.length * 9) + 's');
});

/* ===== Footer: red de puntos animada (dorado + cian) que reacciona al mouse ===== */
(() => {
  const canvas = document.querySelector('.footer-canvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const footer = canvas.parentElement;
  const COLORS = ['212, 175, 55', '0, 229, 255', '246, 211, 101'];
  const LINK = 140;
  let w = 0, h = 0, dpr = 1, nodes = [], running = false, raf = 0;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = footer.clientWidth; h = footer.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round(Math.min(90, (w * h) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 1.6 + 0.6, c: COLORS[Math.floor(Math.random() * COLORS.length)],
      p: Math.random() * Math.PI * 2
    }));
  };

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy; n.p += 0.03;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
      if (d < 160) { n.x += dx * 0.004; n.y += dy * 0.004; }
    }
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          ctx.strokeStyle = `rgba(${a.c}, ${(1 - d / LINK) * 0.35})`;
          ctx.lineWidth = 0.7;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const md = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (md < 180) {
        ctx.strokeStyle = `rgba(0, 229, 255, ${(1 - md / 180) * 0.6})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
      const glow = 0.55 + Math.sin(a.p) * 0.35;
      ctx.fillStyle = `rgba(${a.c}, ${glow})`;
      ctx.shadowColor = `rgba(${a.c}, 0.9)`; ctx.shadowBlur = 8;
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(draw);
  };

  const start = () => { if (!running) { running = true; raf = requestAnimationFrame(draw); } };
  const stop = () => { running = false; cancelAnimationFrame(raf); };

  resize();
  window.addEventListener('resize', () => { resize(); });
  footer.addEventListener('mousemove', (e) => { const r = footer.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  footer.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
  // Solo anima cuando el footer está visible (ahorra batería)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver((entries) => entries.forEach((e) => (e.isIntersecting ? start() : stop()))).observe(footer);
  } else { start(); }
})();

/* ===== Año del footer ===== */
document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

/* ===== Toasts ===== */
function toast(msg, type = 'success') {
  let wrap = document.querySelector('.toast-wrap');
  if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  wrap.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 400); }, 5000);
}

/* ===== Formulario de diagnóstico → tabla "contactos" ===== */
const form = document.getElementById('quoteForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.elements.website && form.elements.website.value) return; // honeypot anti-spam
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const btn = form.querySelector('button[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true; btn.textContent = 'Enviando...';
    const d = Object.fromEntries(new FormData(form).entries());
    const mensaje = [
      'Servicio: ' + d.servicio,
      'WhatsApp: ' + (d.whatsapp || '—'),
      'Tamaño del equipo: ' + (d.equipo || '—'),
      '',
      d.mensaje
    ].join('\n');
    try {
      const res = await fetch(REST + CONFIG.TABLES.contactos, {
        method: 'POST',
        headers: SUPA_HEADERS,
        body: JSON.stringify({
          nombre: d.nombre,
          email: d.email,
          empresa: d.empresa || null,
          mensaje,
          origen: 'web_diagnostico',
          creado_en: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error(await res.text());
      form.reset();
      toast('¡Listo! Te escribimos en menos de 24 horas.');
    } catch (err) {
      console.error('[Taseca]', err);
      toast('No se pudo enviar. Intenta de nuevo o escríbenos por WhatsApp.', 'error');
    } finally {
      btn.disabled = false; btn.innerHTML = original;
    }
  });
}
