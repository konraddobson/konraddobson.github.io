/* =========================================================
   Shared Site Utilities
   ========================================================= */
(function () {
  const nav = document.getElementById('mainNav');
  if (!nav) return;

  const navLinks = Array.from(nav.querySelectorAll('a'));
  const navIndicator = document.getElementById('navIndicator');
  const navToggle = document.getElementById('navToggle');
  let vantaEffect = null;

  /* ---------------------------------------------------------
     Navigation Indicator Effect
     --------------------------------------------------------- */
  function isMobileMenu() {
    return window.innerWidth <= 640;
  }

  function updateNavIndicator(target, animate = true) {
    if (!target || !navIndicator || isMobileMenu()) return;

    const textWidth = target.scrollWidth;
    const x = target.offsetLeft + (target.offsetWidth - textWidth) / 2;

    if (!animate) navIndicator.style.transition = 'none';

    navIndicator.style.width = `${Math.round(textWidth)}px`;
    navIndicator.style.transform = `translateX(${Math.round(x)}px)`;
    navIndicator.style.opacity = '1';

    if (!animate) {
      requestAnimationFrame(() => {
        navIndicator.style.transition = 'transform 220ms ease, width 220ms ease';
      });
    }
  }

  function closeMobileMenu() {
    if (!navToggle) return;
    nav.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  function syncMenuMode() {
    if (!navToggle) return;

    if (isMobileMenu()) {
      navToggle.hidden = false;
      closeMobileMenu();
    } else {
      navToggle.hidden = true;
      nav.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
      updateNavIndicator(nav.querySelector('a.active') || navLinks[0], false);
    }
  }

  /* ---------------------------------------------------------
     Background Fog Effect (Vanta)
     --------------------------------------------------------- */
  function initVanta() {
    if (!window.VANTA || !window.VANTA.FOG) return;
    if (vantaEffect) vantaEffect.destroy();

    vantaEffect = window.VANTA.FOG({
      el: '#vanta-bg',
      mouseControls: false,
      touchControls: false,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 2,
      scaleMobile: 4,
      speed: 1,
      zoom: 0.8,
      backgroundAlpha: 1,
      baseColor: 0x001122,
      highlightColor: 0x0060a4,
      midtoneColor: 0x002766,
      lowlightColor: 0x005a91,
      blurFactor: 0.52
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => updateNavIndicator(link));
    link.addEventListener('focus', () => updateNavIndicator(link));
    link.addEventListener('click', () => {
      if (isMobileMenu()) closeMobileMenu();
    });
  });

  nav.addEventListener('mouseleave', () => {
    updateNavIndicator(nav.querySelector('a.active') || navLinks[0]);
  });

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', (event) => {
      if (!isMobileMenu()) return;
      if (nav.contains(event.target) || navToggle.contains(event.target)) return;
      closeMobileMenu();
    });
  }

  window.addEventListener('resize', () => {
    syncMenuMode();
    updateNavIndicator(nav.querySelector('a.active') || navLinks[0], false);
    if (vantaEffect && vantaEffect.resize) vantaEffect.resize();
  });

  window.addEventListener('load', () => {
    initVanta();
    syncMenuMode();
    updateNavIndicator(nav.querySelector('a.active') || navLinks[0], false);
  });
})();
