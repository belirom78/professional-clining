const CONFIG = {
  tgUsername: 'USERNAME',
  waPhone: '70000000000',
  vkUrl: 'https://vk.com/USERNAME',
  phoneDisplay: '+7 (3812) 99-99-99',
  phoneTel: '+73812999999'
};

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

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

if (menuButton && nav) {
  menuButton.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
}

const isMobileViewport = window.matchMedia('(max-width: 768px)').matches;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const parallaxBackgrounds = document.querySelectorAll('.js-parallax-bg');
const parallaxDecor = document.querySelectorAll('.js-parallax-decor');

if ((parallaxBackgrounds.length || parallaxDecor.length) && !isMobileViewport && !prefersReducedMotion) {
  let latestScrollY = 0;
  let ticking = false;

  const updateParallax = () => {
    parallaxBackgrounds.forEach((element) => {
      const speed = Number(element.dataset.speed || 0.1);
      const offset = Math.round(latestScrollY * speed);
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    parallaxDecor.forEach((element) => {
      const speed = Number(element.dataset.speed || 0.7);
      const offset = Math.round(latestScrollY * speed);
      element.style.transform = `translate3d(0, ${offset}px, 0)`;
    });
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    latestScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  updateParallax();
}

const formatRub = (value) => `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

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
      totalOutput.textContent = '0 ₽';
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
