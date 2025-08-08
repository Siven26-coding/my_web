(function () {
  const root = document.documentElement;

  // Dynamic year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.getElementById('site-nav');
  navToggle?.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', (!expanded).toString());
    document.body.classList.toggle('nav-open', !expanded);
    if (!expanded) siteNav?.querySelector('a')?.focus();
  });

  // Close nav on link click (mobile)
  siteNav?.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLElement && target.tagName === 'A') {
      document.body.classList.remove('nav-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  // Smooth scroll for anchor links
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target instanceof HTMLAnchorElement && target.getAttribute('href')?.startsWith('#')) {
      const id = target.getAttribute('href');
      if (id && id.length > 1) {
        const el = document.querySelector(id);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    }
  });

  // Intersection Observer reveal
  const revealEls = document.querySelectorAll('.copy-reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach((el) => io.observe(el));

  // Slideshow
  const slidesContainer = document.querySelector('.slides');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const prevBtn = document.querySelector('.slide-control.prev');
  const nextBtn = document.querySelector('.slide-control.next');
  const dotsContainer = document.querySelector('.slide-dots');

  let activeIdx = 0;
  let autoplayTimer; const AUTOPLAY_MS = 5000;

  function goToSlide(idx) {
    slides[activeIdx]?.classList.remove('is-active');
    activeIdx = (idx + slides.length) % slides.length;
    slides[activeIdx]?.classList.add('is-active');
    updateDots();
    restartAutoplay();
  }

  function next() { goToSlide(activeIdx + 1); }
  function prev() { goToSlide(activeIdx - 1); }

  function buildDots() {
    dotsContainer.innerHTML = '';
    slides.forEach((_, i) => {
      const btn = document.createElement('button');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
      btn.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(btn);
    });
    updateDots();
  }

  function updateDots() {
    const dots = Array.from(dotsContainer.querySelectorAll('button'));
    dots.forEach((dot, i) => {
      dot.setAttribute('aria-selected', (i === activeIdx).toString());
    });
  }

  function restartAutoplay() {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(next, AUTOPLAY_MS);
  }

  prevBtn?.addEventListener('click', prev);
  nextBtn?.addEventListener('click', next);
  buildDots();
  restartAutoplay();

  // Pause autoplay on hover/focus
  const slideshow = document.querySelector('.slideshow');
  if (slideshow) {
    slideshow.addEventListener('mouseenter', () => clearTimeout(autoplayTimer));
    slideshow.addEventListener('mouseleave', restartAutoplay);
    slideshow.addEventListener('focusin', () => clearTimeout(autoplayTimer));
    slideshow.addEventListener('focusout', restartAutoplay);
  }

  // Back to top
  document.querySelector('.back-to-top')?.addEventListener('click', (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Canvas festive animation: floating marigold flowers and glowing diyas
  const canvas = document.getElementById('festive-canvas');
  if (!(canvas instanceof HTMLCanvasElement)) return;
  const ctx = canvas.getContext('2d');

  let devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  function resizeCanvas() {
    const { clientWidth, clientHeight } = canvas;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas.width !== Math.floor(clientWidth * dpr) || canvas.height !== Math.floor(clientHeight * dpr)) {
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      devicePixelRatio = dpr;
    }
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  class Particle {
    constructor(type) {
      this.type = type; // 'flower' | 'diya' | 'sparkle'
      this.reset(true);
    }
    reset(initial = false) {
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      this.x = Math.random() * w;
      this.y = initial ? Math.random() * h : -20 - Math.random() * 40;
      this.vx = lerp(-0.15, 0.15, Math.random());
      this.vy = lerp(0.15, 0.45, Math.random());
      this.size = lerp(8, 18, Math.random());
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = lerp(-0.01, 0.01, Math.random());
      this.alpha = lerp(0.6, 1, Math.random());
      this.twinkle = Math.random() * Math.PI * 2;
      this.color = Math.random() < 0.6 ? '#ffa600' : '#f6c453';
    }
    step(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rotation += this.rotationSpeed * dt;
      this.twinkle += 0.02 * dt;
      const w = canvas.width / devicePixelRatio;
      const h = canvas.height / devicePixelRatio;
      if (this.y - this.size > h + 20) this.reset(false);
      if (this.x < -20) this.x = w + 20;
      if (this.x > w + 20) this.x = -20;
    }
    draw(ctx) {
      ctx.save();
      ctx.translate(this.x * devicePixelRatio, this.y * devicePixelRatio);
      ctx.rotate(this.rotation);
      ctx.globalAlpha = this.alpha * (0.85 + 0.15 * Math.sin(this.twinkle));
      const s = this.size * devicePixelRatio;
      if (this.type === 'flower') drawMarigold(ctx, s, this.color);
      else if (this.type === 'diya') drawDiya(ctx, s);
      else drawSparkle(ctx, s * 0.3);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  function drawMarigold(ctx, size, color) {
    ctx.fillStyle = color;
    const petals = 10;
    for (let i = 0; i < petals; i++) {
      const ang = (i / petals) * Math.PI * 2;
      const r = size * (0.35 + 0.25 * Math.sin(i));
      ctx.beginPath();
      ctx.ellipse(Math.cos(ang) * size * 0.35, Math.sin(ang) * size * 0.35, r * 0.35, r * 0.6, ang, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#b95a00';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawDiya(ctx, size) {
    // Base
    ctx.fillStyle = '#8b4513';
    ctx.beginPath();
    ctx.ellipse(0, 0, size * 0.6, size * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();
    // Oil
    ctx.fillStyle = '#5a2e0e';
    ctx.beginPath();
    ctx.ellipse(0, -size * 0.02, size * 0.5, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Flame
    const glow = ctx.createRadialGradient(0, -size * 0.48, 0, 0, -size * 0.48, size * 0.6);
    glow.addColorStop(0, 'rgba(255, 200, 80, 0.9)');
    glow.addColorStop(1, 'rgba(255, 200, 80, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, -size * 0.48, size * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffd27a';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.68);
    ctx.quadraticCurveTo(size * 0.18, -size * 0.56, 0, -size * 0.36);
    ctx.quadraticCurveTo(-size * 0.18, -size * 0.56, 0, -size * 0.68);
    ctx.fill();

    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.62);
    ctx.quadraticCurveTo(size * 0.12, -size * 0.54, 0, -size * 0.44);
    ctx.quadraticCurveTo(-size * 0.12, -size * 0.54, 0, -size * 0.62);
    ctx.fill();
  }

  function drawSparkle(ctx, size) {
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = Math.max(1, size * 0.6);
    ctx.beginPath();
    ctx.moveTo(-size, 0); ctx.lineTo(size, 0);
    ctx.moveTo(0, -size); ctx.lineTo(0, size);
    ctx.stroke();
  }

  let particles = [];
  function createParticles() {
    const w = canvas.width / devicePixelRatio;
    const h = canvas.height / devicePixelRatio;
    const area = w * h;
    const targetCount = Math.min(90, Math.max(24, Math.floor(area / 18000)));
    particles = [];
    for (let i = 0; i < targetCount; i++) {
      const r = Math.random();
      const type = r < 0.65 ? 'flower' : (r < 0.9 ? 'sparkle' : 'diya');
      particles.push(new Particle(type));
    }
  }

  let lastTs = performance.now();
  function frame(ts) {
    const dt = Math.min(32, ts - lastTs) * 0.06;
    lastTs = ts;

    resizeCanvas();
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Subtle background gradient
    const grd = ctx.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, 'rgba(255, 235, 204, 0.55)');
    grd.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);

    particles.forEach((p) => { p.step(dt); p.draw(ctx); });

    requestAnimationFrame(frame);
  }

  // Setup
  resizeCanvas();
  createParticles();
  window.addEventListener('resize', () => { resizeCanvas(); createParticles(); });
  requestAnimationFrame(frame);
})();