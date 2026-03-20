const CONFIG = {
  tgUsername: 'belclean_cleaning',
  phoneDisplay: '+7 (937) 103-49-09',
  phoneTel: '+79371034909'
};

/* ---- Contact links ---- */

const initContactLinks = () => {
  document.querySelectorAll('.js-tg').forEach((link) => {
    link.setAttribute('href', `https://t.me/${CONFIG.tgUsername}`);
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

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('click', (event) => {
    if (!nav.classList.contains('open')) return;
    if (nav.contains(event.target) || menuButton.contains(event.target)) return;
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded', 'false');
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960) {
      nav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    }
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

/* ---- Success modal + submit cooldown ---- */

const successModal = document.querySelector('.js-success-modal');
const successModalDialog = successModal?.querySelector('.success-modal-dialog');
const successModalCloseButtons = successModal?.querySelectorAll('.js-success-modal-close, .success-modal-close') || [];
const formCooldownUntil = new WeakMap();
const formCooldownTimers = new WeakMap();
let previousBodyOverflow = '';
let lastFocusedElement = null;

const openSuccessModal = () => {
  if (!successModal) return;

  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  previousBodyOverflow = document.body.style.overflow;
  document.body.style.overflow = 'hidden';
  successModal.hidden = false;
  successModalDialog?.setAttribute('tabindex', '-1');
  successModalDialog?.focus();
};

const closeSuccessModal = () => {
  if (!successModal || successModal.hidden) return;

  successModal.hidden = true;
  document.body.style.overflow = previousBodyOverflow;
  lastFocusedElement?.focus?.();
};

successModalCloseButtons.forEach((button) => {
  button.addEventListener('click', closeSuccessModal);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && successModal && !successModal.hidden) {
    closeSuccessModal();
  }
});

const getFormCooldownRemaining = (form) => {
  const cooldownUntil = formCooldownUntil.get(form) || 0;
  return Math.max(0, cooldownUntil - Date.now());
};

const startFormCooldown = (form, button, messageNode, idleText) => {
  if (!form || !button) return;

  const cooldownUntil = Date.now() + 15000;
  const baseText = idleText || button.dataset.idleText || button.textContent;
  const existingTimer = formCooldownTimers.get(form);

  button.dataset.idleText = baseText;
  formCooldownUntil.set(form, cooldownUntil);

  if (existingTimer) {
    clearInterval(existingTimer);
  }

  const updateCooldownState = () => {
    const remaining = getFormCooldownRemaining(form);

    if (remaining <= 0) {
      const timerId = formCooldownTimers.get(form);
      if (timerId) clearInterval(timerId);
      formCooldownTimers.delete(form);
      formCooldownUntil.delete(form);
      button.disabled = false;
      button.textContent = baseText;
      if (messageNode && messageNode.textContent.includes('Повторная отправка')) {
        messageNode.textContent = '';
      }
      return;
    }

    const seconds = Math.ceil(remaining / 1000);
    button.disabled = true;
    button.textContent = `Повторно через ${seconds} сек`;
    if (messageNode) {
      messageNode.textContent = 'Повторная отправка будет доступна через несколько секунд';
    }
  };

  updateCooldownState();
  formCooldownTimers.set(form, window.setInterval(updateCooldownState, 1000));
};

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

/* ---- Order form integration ---- */

const orderCalculators = document.querySelectorAll('.js-calc');

orderCalculators.forEach((calc) => {
  const calcSection = calc.closest('.calc-section') || document;
  const areaInput = calc.querySelector('.js-area');
  const totalOutput = calc.querySelector('.js-total');
  const orderShell = calcSection.querySelector('.js-order-shell');
  const orderForm = calcSection.querySelector('.js-order-form');
  const orderNameInput = calcSection.querySelector('.js-order-name');
  const orderPhoneInput = calcSection.querySelector('.js-order-phone');
  const orderDateInput = calcSection.querySelector('.js-order-date');
  const orderAreaInput = calcSection.querySelector('.js-order-area');
  const orderTypeInput = calcSection.querySelector('.js-order-type');
  const orderOptionsInput = calcSection.querySelector('.js-order-options');
  const orderTotalInput = calcSection.querySelector('.js-order-total');
  const summaryArea = calcSection.querySelector('.js-summary-area');
  const summaryType = calcSection.querySelector('.js-summary-type');
  const summaryOptions = calcSection.querySelector('.js-summary-options');
  const summaryTotal = calcSection.querySelector('.js-summary-total');
  const orderError = calcSection.querySelector('.js-order-error');
  const orderSuccess = calcSection.querySelector('.js-order-success');
  const orderSubmit = calcSection.querySelector('.js-order-submit');

  if (!areaInput || !totalOutput || !orderForm || !orderShell || !orderError || !orderSuccess || !orderSubmit) return;

  const getSelectedType = () => calc.querySelector('input[name="cleaningType"]:checked');

  const getSelectedOptions = () => {
    const selectedOptions = [...calc.querySelectorAll('.js-option:checked')];
    const total = selectedOptions.reduce((sum, option) => sum + Number(option.value || 0), 0);
    const labels = selectedOptions.map((option) => option.dataset.label || option.value);
    return { total, labels };
  };

  const calculateOrder = () => {
    const area = Number(areaInput.value);
    const selectedType = getSelectedType();
    const rate = Number(selectedType?.dataset.rate || 0);
    const { total: optionsTotal, labels } = getSelectedOptions();
    const optionsText = labels.length ? labels.join(', ') : 'Без доп. опций';

    if (!Number.isFinite(area) || area < 1 || area > 1000) {
      return {
        valid: false,
        area: 0,
        type: selectedType?.value || '',
        optionsText,
        total: 0,
        totalText: '0 ₽'
      };
    }

    const total = Math.round(area * rate + optionsTotal);

    return {
      valid: true,
      area,
      type: selectedType?.value || '',
      optionsText,
      total,
      totalText: formatRub(total)
    };
  };

  const syncOrderState = () => {
    const result = calculateOrder();

    if (summaryArea) summaryArea.textContent = result.valid ? `${result.area} м²` : '0 м²';
    if (summaryType) summaryType.textContent = result.valid ? result.type : 'Не выбран';
    if (summaryOptions) summaryOptions.textContent = result.optionsText;
    if (summaryTotal) summaryTotal.textContent = result.valid ? result.totalText : '0 ₽';

    if (orderAreaInput) orderAreaInput.value = result.valid ? String(result.area) : '';
    if (orderTypeInput) orderTypeInput.value = result.valid ? result.type : '';
    if (orderOptionsInput) orderOptionsInput.value = result.optionsText;
    if (orderTotalInput) orderTotalInput.value = result.valid ? String(result.total) : '';

    return result;
  };

  const revealOrderForm = () => {
    orderShell.hidden = false;
    const targetTop = orderShell.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  if (orderDateInput) {
    const now = new Date();
    const today = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .split('T')[0];
    orderDateInput.min = today;
  }

  calc.addEventListener('input', () => {
    syncOrderState();
  });

  calc.addEventListener('change', () => {
    syncOrderState();
  });

  calc.addEventListener('submit', (event) => {
    const result = syncOrderState();

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!result.valid) {
      areaInput.focus();
      return;
    }

    orderError.textContent = '';
    orderSuccess.hidden = true;
    revealOrderForm();
    orderNameInput?.focus();
  }, true);

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const result = syncOrderState();
    const name = orderNameInput?.value.trim() || '';
    const phone = orderPhoneInput?.value.trim() || '';

    if (!result.valid) {
      orderError.textContent = 'Сначала рассчитайте стоимость уборки.';
      areaInput.focus();
      return;
    }

    if (!name) {
      orderError.textContent = 'Укажите имя, чтобы мы знали, как к вам обращаться.';
      orderNameInput?.focus();
      return;
    }

    if (!phone) {
      orderError.textContent = 'Укажите телефон для связи.';
      orderPhoneInput?.focus();
      return;
    }

    orderError.textContent = '';
    orderSuccess.hidden = true;

    const initialButtonText = orderSubmit.textContent;
    orderSubmit.disabled = true;
    orderSubmit.textContent = 'Отправляем...';

    try {
      const response = await fetch(orderForm.action, {
        method: 'POST',
        body: new FormData(orderForm),
        headers: {
          'X-Requested-With': 'fetch'
        }
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Не удалось обработать ответ сервера.'
      }));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      orderSuccess.textContent = data.message || 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      orderSuccess.hidden = false;
      orderForm.reset();
      syncOrderState();
    } catch (error) {
      orderError.textContent = error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      orderSubmit.disabled = false;
      orderSubmit.textContent = initialButtonText;
    }
  });

  syncOrderState();
});

/* ---- Order form UX enhancements ---- */

const enhancedOrderForms = document.querySelectorAll('.js-order-form');

enhancedOrderForms.forEach((orderForm) => {
  const calcSection = orderForm.closest('.calc-section') || document;
  const calc = calcSection.querySelector('.js-calc');
  const areaInput = calcSection.querySelector('.js-area');
  const orderNameInput = orderForm.querySelector('.js-order-name');
  const orderPhoneInput = orderForm.querySelector('.js-order-phone');
  const orderRoomTypeInput = orderForm.querySelector('.js-order-room-type');
  const orderDateInput = orderForm.querySelector('.js-order-date');
  const orderTimeInput = orderForm.querySelector('.js-order-time');
  const orderCallbackInput = orderForm.querySelector('.js-order-callback');
  const orderHoneypotInput = orderForm.querySelector('input[name="website"]');
  const orderAreaInput = orderForm.querySelector('.js-order-area');
  const orderTypeInput = orderForm.querySelector('.js-order-type');
  const orderOptionsInput = orderForm.querySelector('.js-order-options');
  const orderTotalInput = orderForm.querySelector('.js-order-total');
  const summaryArea = calcSection.querySelector('.js-summary-area');
  const summaryType = calcSection.querySelector('.js-summary-type');
  const summaryOptions = calcSection.querySelector('.js-summary-options');
  const summaryTotal = calcSection.querySelector('.js-summary-total');
  const orderError = orderForm.querySelector('.js-order-error');
  const orderSuccess = orderForm.querySelector('.js-order-success');
  const orderSubmit = orderForm.querySelector('.js-order-submit');
  const orderNameError = orderForm.querySelector('.js-order-name-error');
  const orderPhoneError = orderForm.querySelector('.js-order-phone-error');
  const orderDateError = orderForm.querySelector('.js-order-date-error');
  const orderTimeError = orderForm.querySelector('.js-order-time-error');
  const orderShell = calcSection.querySelector('.js-order-shell');

  if (!calc || !areaInput || !orderPhoneInput || !orderDateInput || !orderTimeInput || !orderSubmit || !orderError || !orderSuccess) return;

  const getSelectedType = () => calc.querySelector('input[name="cleaningType"]:checked');

  const getSelectedOptions = () => {
    const selectedOptions = [...calc.querySelectorAll('.js-option:checked')];
    const total = selectedOptions.reduce((sum, option) => sum + Number(option.value || 0), 0);
    const labels = selectedOptions.map((option) => option.dataset.label || option.value);
    return { total, labels };
  };

  const normalizePhoneDigits = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') return `7${digits.slice(1)}`;
    if (digits[0] === '7') return digits;
    return `7${digits}`;
  };

  const formatPhoneInput = (value) => {
    const digits = normalizePhoneDigits(value).slice(0, 11);
    if (!digits) return '';

    const part1 = digits.slice(1, 4);
    const part2 = digits.slice(4, 7);
    const part3 = digits.slice(7, 9);
    const part4 = digits.slice(9, 11);

    let formatted = '+7';
    if (part1) formatted += ` (${part1}`;
    if (part1.length === 3) formatted += ')';
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += `-${part3}`;
    if (part4) formatted += `-${part4}`;

    return formatted;
  };

  const setFieldError = (input, errorNode, message) => {
    const field = input?.closest('.order-field');
    if (errorNode) errorNode.textContent = message || '';
    if (field) field.classList.toggle('is-invalid', Boolean(message));
  };

  const clearFieldErrors = () => {
    setFieldError(orderNameInput, orderNameError, '');
    setFieldError(orderPhoneInput, orderPhoneError, '');
    setFieldError(orderDateInput, orderDateError, '');
    setFieldError(orderTimeInput, orderTimeError, '');
    orderError.textContent = '';
  };

  const getCalculationData = () => {
    const area = Number(areaInput.value);
    const selectedType = getSelectedType();
    const rate = Number(selectedType?.dataset.rate || 0);
    const { total: optionsTotal, labels } = getSelectedOptions();
    const optionsText = labels.length ? labels.join(', ') : 'Без доп. опций';

    if (!Number.isFinite(area) || area < 1 || area > 1000) {
      return {
        valid: false,
        area: 0,
        type: selectedType?.value || '',
        optionsText,
        total: 0,
        totalText: '0 ₽'
      };
    }

    const total = Math.round(area * rate + optionsTotal);
    return {
      valid: true,
      area,
      type: selectedType?.value || '',
      optionsText,
      total,
      totalText: formatRub(total)
    };
  };

  const syncOrderData = () => {
    const result = getCalculationData();

    if (summaryArea) summaryArea.textContent = result.valid ? `${result.area} м²` : '0 м²';
    if (summaryType) summaryType.textContent = result.valid ? result.type : 'Не выбран';
    if (summaryOptions) summaryOptions.textContent = result.optionsText;
    if (summaryTotal) summaryTotal.textContent = result.valid ? result.totalText : '0 ₽';

    if (orderAreaInput) orderAreaInput.value = result.valid ? String(result.area) : '';
    if (orderTypeInput) orderTypeInput.value = result.valid ? result.type : '';
    if (orderOptionsInput) orderOptionsInput.value = result.optionsText;
    if (orderTotalInput) orderTotalInput.value = result.valid ? String(result.total) : '';

    return result;
  };

  const isPastDate = (value) => {
    if (!value) return false;
    const selectedDate = new Date(`${value}T00:00:00`);
    if (Number.isNaN(selectedDate.getTime())) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today;
  };

  const validateEnhancedOrder = (result) => {
    const name = orderNameInput?.value.trim() || '';
    const phoneDigits = normalizePhoneDigits(orderPhoneInput.value);
    const dateValue = orderDateInput.value;
    const timeValue = orderTimeInput.value;
    let isValid = true;

    clearFieldErrors();

    if (!result.valid) {
      orderError.textContent = 'Сначала рассчитайте стоимость уборки.';
      return false;
    }

    if (!name) {
      setFieldError(orderNameInput, orderNameError, 'Укажите имя.');
      isValid = false;
    }

    if (phoneDigits.length !== 11) {
      setFieldError(orderPhoneInput, orderPhoneError, 'Введите телефон полностью в формате +7 (999) 999-99-99.');
      isValid = false;
    }

    if (!dateValue) {
      setFieldError(orderDateInput, orderDateError, 'Выберите дату уборки.');
      isValid = false;
    } else if (isPastDate(dateValue)) {
      setFieldError(orderDateInput, orderDateError, 'Дата уборки не может быть в прошлом.');
      isValid = false;
    }

    if (!timeValue) {
      setFieldError(orderTimeInput, orderTimeError, 'Выберите удобное время.');
      isValid = false;
    }

    if (!isValid) {
      orderError.textContent = 'Проверьте заполнение полей формы.';
    }

    return isValid;
  };

  const focusFirstInvalidField = () => {
    const invalidField = orderForm.querySelector('.order-field.is-invalid input, .order-field.is-invalid select, .order-field.is-invalid textarea');
    invalidField?.focus();
  };

  const today = new Date();
  const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
  orderDateInput.min = localToday;

  const applyPhoneMask = () => {
    orderPhoneInput.value = formatPhoneInput(orderPhoneInput.value);
  };

  orderPhoneInput.addEventListener('input', applyPhoneMask);
  orderPhoneInput.addEventListener('focus', applyPhoneMask);
  orderPhoneInput.addEventListener('blur', applyPhoneMask);

  orderNameInput?.addEventListener('input', () => setFieldError(orderNameInput, orderNameError, ''));
  orderPhoneInput.addEventListener('input', () => setFieldError(orderPhoneInput, orderPhoneError, ''));
  orderDateInput.addEventListener('input', () => setFieldError(orderDateInput, orderDateError, ''));
  orderTimeInput.addEventListener('change', () => setFieldError(orderTimeInput, orderTimeError, ''));

  calc.addEventListener('input', syncOrderData);
  calc.addEventListener('change', syncOrderData);

  const revealOrderForm = () => {
    if (!orderShell) return;

    orderShell.hidden = false;

    const targetTop = orderShell.getBoundingClientRect().top + window.scrollY - 24;
    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: prefersReducedMotion ? 'auto' : 'smooth'
    });
  };

  calc.addEventListener('submit', (event) => {
    const result = syncOrderData();

    event.preventDefault();
    event.stopImmediatePropagation();

    if (!result.valid) {
      areaInput.focus();
      return;
    }

    orderError.textContent = '';
    orderSuccess.hidden = true;
    revealOrderForm();
    orderNameInput?.focus();
  }, true);

  orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();

    const result = syncOrderData();
    const cooldownRemaining = getFormCooldownRemaining(orderForm);

    if (!validateEnhancedOrder(result)) {
      focusFirstInvalidField();
      return;
    }

    if (orderHoneypotInput?.value.trim()) {
      orderError.textContent = 'Не удалось отправить заявку. Проверьте данные и попробуйте снова.';
      return;
    }

    if (cooldownRemaining > 0) {
      orderError.textContent = 'Повторная отправка будет доступна через несколько секунд';
      return;
    }

    clearFieldErrors();
    orderSuccess.hidden = true;

    const initialButtonText = orderSubmit.textContent;
    orderSubmit.disabled = true;
    orderSubmit.textContent = 'Отправляем...';

    try {
      const response = await fetch(orderForm.action, {
        method: 'POST',
        body: new FormData(orderForm),
        headers: {
          'X-Requested-With': 'fetch'
        }
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Не удалось обработать ответ сервера.'
      }));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      orderSuccess.textContent = data.message || 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      orderForm.reset();
      orderPhoneInput.value = '';
      if (orderRoomTypeInput && !orderRoomTypeInput.value) {
        orderRoomTypeInput.value = 'Квартира';
      }
      if (orderCallbackInput) orderCallbackInput.checked = false;
      clearFieldErrors();
      syncOrderData();
      openSuccessModal();
      startFormCooldown(orderForm, orderSubmit, orderError, initialButtonText);
    } catch (error) {
      orderError.textContent = error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      if (getFormCooldownRemaining(orderForm) <= 0) {
        orderSubmit.disabled = false;
        orderSubmit.textContent = initialButtonText;
      }
    }
  }, true);

  syncOrderData();
});

/* ---- Hero lead form ---- */

const heroLeadForms = document.querySelectorAll('.js-hero-lead-form');

heroLeadForms.forEach((form) => {
  const nameInput = form.querySelector('.js-hero-name');
  const phoneInput = form.querySelector('.js-hero-phone');
  const honeypotInput = form.querySelector('input[name="website"]');
  const errorOutput = form.querySelector('.js-hero-error');
  const successOutput = form.querySelector('.js-hero-success');
  const submitButton = form.querySelector('.js-hero-submit');

  if (!nameInput || !phoneInput || !errorOutput || !successOutput || !submitButton) return;

  const normalizePhoneDigits = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    if (digits[0] === '8') return `7${digits.slice(1)}`;
    if (digits[0] === '7') return digits;
    return `7${digits}`;
  };

  const formatPhoneInput = (value) => {
    const digits = normalizePhoneDigits(value).slice(0, 11);
    if (!digits) return '';

    const part1 = digits.slice(1, 4);
    const part2 = digits.slice(4, 7);
    const part3 = digits.slice(7, 9);
    const part4 = digits.slice(9, 11);

    let formatted = '+7';
    if (part1) formatted += ` (${part1}`;
    if (part1.length === 3) formatted += ')';
    if (part2) formatted += ` ${part2}`;
    if (part3) formatted += `-${part3}`;
    if (part4) formatted += `-${part4}`;

    return formatted;
  };

  const setFieldInvalid = (input, invalid) => {
    const field = input.closest('.hero-lead-field');
    if (field) field.classList.toggle('is-invalid', invalid);
  };

  const clearErrors = () => {
    errorOutput.textContent = '';
    setFieldInvalid(nameInput, false);
    setFieldInvalid(phoneInput, false);
  };

  const applyPhoneMask = () => {
    phoneInput.value = formatPhoneInput(phoneInput.value);
  };

  phoneInput.addEventListener('input', applyPhoneMask);
  phoneInput.addEventListener('focus', applyPhoneMask);
  phoneInput.addEventListener('blur', applyPhoneMask);

  nameInput.addEventListener('input', () => setFieldInvalid(nameInput, false));
  phoneInput.addEventListener('input', () => setFieldInvalid(phoneInput, false));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = nameInput.value.trim();
    const phoneDigits = normalizePhoneDigits(phoneInput.value);
    const cooldownRemaining = getFormCooldownRemaining(form);

    clearErrors();
    successOutput.hidden = true;

    if (!name) {
      setFieldInvalid(nameInput, true);
      errorOutput.textContent = 'Укажите имя.';
      nameInput.focus();
      return;
    }

    if (phoneDigits.length !== 11) {
      setFieldInvalid(phoneInput, true);
      errorOutput.textContent = 'Введите телефон полностью в формате +7 (999) 999-99-99.';
      phoneInput.focus();
      return;
    }

    if (honeypotInput?.value.trim()) {
      errorOutput.textContent = 'Не удалось отправить заявку. Проверьте данные и попробуйте снова.';
      return;
    }

    if (cooldownRemaining > 0) {
      errorOutput.textContent = 'Повторная отправка будет доступна через несколько секунд';
      return;
    }

    const initialButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправляем...';

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: {
          'X-Requested-With': 'fetch'
        }
      });

      const data = await response.json().catch(() => ({
        success: false,
        message: 'Не удалось обработать ответ сервера.'
      }));

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Не удалось отправить заявку. Попробуйте ещё раз.');
      }

      successOutput.textContent = data.message || 'Заявка отправлена. Скоро свяжемся.';
      form.reset();
      phoneInput.value = '';
      clearErrors();
      openSuccessModal();
      startFormCooldown(form, submitButton, errorOutput, initialButtonText);
    } catch (error) {
      errorOutput.textContent = error.message || 'Не удалось отправить заявку. Попробуйте ещё раз.';
    } finally {
      if (getFormCooldownRemaining(form) <= 0) {
        submitButton.disabled = false;
        submitButton.textContent = initialButtonText;
      }
    }
  });
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
