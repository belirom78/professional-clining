const CONFIG = {
  tgUsername: 'USERNAME',
  waPhone: '70000000000',
  vkUrl: 'https://vk.com/USERNAME',
  phoneDisplay: '+7 (3812) 99-99-99',
  phoneTel: '+73812999999'
};

/* ---- Contact links ---- */

const initContactLinks = () => {
  document.querySelectorAll('.js-tg').forEach((link) => {
    link.setAttribute('href', `https://t.me/${CONFIG.tgUsername}`);
  });

  document.querySelectorAll('.js-wa').forEach((link) => {
    link.setAttribute('href', `https://wa.me/${CONFIG.waPhone}`);
  });

  document.querySelectorAll('.js-vk').forEach((link) => {
    link.setAttribute('href', CONFIG.vkUrl);
  });

  document.querySelectorAll('.js-phone').forEach((link) => {
    link.setAttribute('href', `tel:${CONFIG.phoneTel}`);
  });

  document.querySelectorAll('.js-phone-display').forEach((node) => {
    node.textContent = CONFIG.phoneDisplay;
  });
};

initContactLinks();

/* ---- Mobile menu ---- */

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---- Feature detection ---- */

const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---- Parallax (multi-layer + mouse move + blob wobble) ---- */

const parallaxBackgrounds = document.querySelectorAll('.js-parallax-bg');
const parallaxDecor = document.querySelectorAll('.js-parallax-decor');

if ((parallaxBackgrounds.length || parallaxDecor.length) && !isMobileViewport && !prefersReducedMotion) {
  let latestScrollY = window.scrollY;
  let ticking = false;
  let mouseX = 0;
  let mouseY = 0;
  const startTime = performance.now();
  let blobRafId = null;

  /* Smoothed mouse values for easing */
  let smoothMouseX = 0;
  let smoothMouseY = 0;
  const mouseEasing = 0.08;

  /* Scroll-based parallax for background layers — AGAINST scroll, stronger amplitude */
  const updateBackgrounds = () => {
    parallaxBackgrounds.forEach((element) => {
      const speed = Number(element.dataset.speed || 0.1);
      /* Move AGAINST scroll direction (negative offset) with 2x amplitude */
      const offset = Math.round(latestScrollY * speed * -2);
      const scaleVal = 1 + Math.abs(latestScrollY * 0.00003) * speed;
      const clampedScale = Math.min(scaleVal, 1.08);
      element.style.transform = `translate3d(0, ${offset}px, 0) scale(${clampedScale.toFixed(4)})`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    latestScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateBackgrounds);
      ticking = true;
    }
  }, { passive: true });

  /* Mouse move tracking for desktop (stronger depth effect) */
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  /* Continuous blob animation: drift + scroll offset + mouse influence — enhanced */
  const animateBlobs = () => {
    const elapsed = (performance.now() - startTime) / 1000;

    /* Smooth mouse easing for fluid movement */
    smoothMouseX += (mouseX - smoothMouseX) * mouseEasing;
    smoothMouseY += (mouseY - smoothMouseY) * mouseEasing;

    parallaxDecor.forEach((element, i) => {
      const speed = Number(element.dataset.speed || 0.7);
      /* Move AGAINST scroll with doubled amplitude */
      const scrollOffset = Math.round(latestScrollY * speed * -2);

      /* Stronger organic drift (2x amplitude) */
      const driftX = Math.sin(elapsed * 0.35 + i * 2.1) * 32;
      const driftY = Math.cos(elapsed * 0.28 + i * 1.7) * 22;
      const driftScale = 1 + Math.sin(elapsed * 0.18 + i * 0.8) * 0.06;
      /* Scale pulse between 1.05 and 1.08 based on scroll */
      const scrollScale = 1.05 + Math.sin(elapsed * 0.12 + i) * 0.015;
      const combinedScale = driftScale * scrollScale;
      const clampedScale = Math.min(Math.max(combinedScale, 1.0), 1.08);

      /* Stronger mouse influence (3x previous) */
      const mx = smoothMouseX * 18 * (1 + i * 0.35);
      const my = smoothMouseY * 12 * (1 + i * 0.3);

      /* Slight rotation for organic feel */
      const rotation = Math.sin(elapsed * 0.2 + i * 1.5) * 3;

      element.style.transform =
        `translate3d(${driftX + mx}px, ${scrollOffset + driftY + my}px, 0) scale(${clampedScale.toFixed(3)}) rotate(${rotation.toFixed(1)}deg)`;
    });

    blobRafId = requestAnimationFrame(animateBlobs);
  };

  animateBlobs();
  updateBackgrounds();

  /* Pause animation when tab is hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(blobRafId);
    } else {
      animateBlobs();
    }
  });
}

/* ---- Particle dot field ---- */

(function initParticles() {
  const canvas = document.querySelector('.particles-canvas');
  if (!canvas || isMobileViewport || prefersReducedMotion) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const particleCount = 35;
  let particles = [];
  let animId = null;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function seed() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.6 + 0.4,
        dx: (Math.random() - 0.5) * 0.25,
        dy: (Math.random() - 0.5) * 0.18,
        o: Math.random() * 0.25 + 0.06
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const p of particles) {
      p.x += p.dx;
      p.y += p.dy;
      if (p.x < -10) p.x = canvas.width + 10;
      if (p.x > canvas.width + 10) p.x = -10;
      if (p.y < -10) p.y = canvas.height + 10;
      if (p.y > canvas.height + 10) p.y = -10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 201, 183, ${p.o})`;
      ctx.fill();
    }
    animId = requestAnimationFrame(draw);
  }

  resize();
  seed();
  draw();

  window.addEventListener('resize', () => { resize(); seed(); }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });
})();

/* ---- Scroll reveal (IntersectionObserver) ---- */

(function initScrollReveal() {
  const reveals = document.querySelectorAll('.js-reveal');
  if (!reveals.length) return;

  if (prefersReducedMotion) {
    reveals.forEach((el) => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: '0px 0px -40px 0px'
  });

  reveals.forEach((el) => observer.observe(el));
})();

/* ---- Calculator ---- */

const formatRub = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} \u20BD`;

const calculators = document.querySelectorAll('.js-calc');

calculators.forEach((calc) => {
  const areaInput = calc.querySelector('.js-area');
  const totalOutput = calc.querySelector('.js-total');
  const submitButton = calc.querySelector('.js-submit');
  let errorOutput = calc.querySelector('.js-error');

  if (!areaInput || !totalOutput || !submitButton) return;

  if (!errorOutput) {
    errorOutput = document.createElement('p');
    errorOutput.className = 'calc-error js-error';
    errorOutput.setAttribute('aria-live', 'polite');
    areaInput.closest('.calc-field')?.after(errorOutput);
  }

  const getSelectedType = () => calc.querySelector('input[name="cleaningType"]:checked');

  const getOptions = () => {
    const selectedOptions = [...calc.querySelectorAll('.js-option:checked')];
    const total = selectedOptions.reduce((sum, option) => sum + Number(option.value || 0), 0);
    const labels = selectedOptions.map((option) => option.dataset.label || option.value);
    return { total, labels };
  };

  const validateArea = (value) => {
    if (!Number.isFinite(value) || value < 1) return 'Введите площадь от 1 м².';
    if (value > 1000) return 'Площадь не должна превышать 1000 м².';
    return '';
  };

  const calculate = () => {
    const area = Number(areaInput.value);
    const selectedType = getSelectedType();
    const rate = Number(selectedType?.dataset.rate || 0);
    const { total: optionsTotal } = getOptions();
    const validationError = validateArea(area);

    if (validationError) {
      totalOutput.textContent = '0 \u20BD';
      return { valid: false, error: validationError, area: 0, rate, total: 0, type: selectedType?.value || '' };
    }

    const total = Math.round(area * rate + optionsTotal);
    totalOutput.textContent = formatRub(total);

    return { valid: true, error: '', area, rate, total, type: selectedType?.value || '' };
  };

  calc.addEventListener('input', () => {
    const result = calculate();
    errorOutput.textContent = result.valid ? '' : result.error;
  });

  calc.addEventListener('change', () => {
    const result = calculate();
    errorOutput.textContent = result.valid ? '' : result.error;
  });

  calc.addEventListener('submit', (event) => {
    event.preventDefault();
    const result = calculate();

    if (!result.valid) {
      errorOutput.textContent = result.error;
      areaInput.focus();
      return;
    }

    errorOutput.textContent = '';
    const { labels } = getOptions();
    const optionsText = labels.length ? labels.join(', ') : 'нет';

    const message = [
      'Заявка с сайта:',
      `Тип: ${result.type}`,
      `Площадь: ${result.area} м²`,
      `Опции: ${optionsText}`,
      `Итого: ${formatRub(result.total)}`
    ].join('\n');

    const telegramUrl = `https://t.me/${CONFIG.tgUsername}?text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank', 'noopener');
  });

  calculate();
});

/* ---- Before / After sliders ---- */

const beforeAfterSliders = document.querySelectorAll('.js-before-after');

beforeAfterSliders.forEach((slider) => {
  const range = slider.querySelector('.ba-range');
  const initial = Number(slider.dataset.start || range?.value || 50);

  const updatePosition = (value) => {
    const safeValue = Math.min(100, Math.max(0, Number(value) || 0));
    slider.style.setProperty('--position', `${safeValue}%`);
  };

  if (!range) return;

  range.value = String(initial);
  updatePosition(initial);

  range.addEventListener('input', () => {
    updatePosition(range.value);
  });

  range.addEventListener('change', () => {
    updatePosition(range.value);
  });
});

/* ---- Accordion (FAQ & included sections) ---- */

(function initAccordion() {
  const accordions = document.querySelectorAll('.js-accordion');
  if (!accordions.length) return;

  accordions.forEach((accordion) => {
    const triggers = accordion.querySelectorAll('.accordion-trigger');

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panel = trigger.nextElementSibling;
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        /* Close all panels in this accordion */
        triggers.forEach((otherTrigger) => {
          const otherPanel = otherTrigger.nextElementSibling;
          otherTrigger.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.hidden = true;
        });

        /* Toggle clicked panel */
        if (!isOpen && panel) {
          trigger.setAttribute('aria-expanded', 'true');
          panel.hidden = false;
        }
      });
    });
  });
})();
