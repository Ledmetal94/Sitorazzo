(function () {
  const navbar  = document.getElementById('navbar');
  const inner   = document.getElementById('navbar-inner');
  const toggle  = document.getElementById('mobile-menu-toggle');
  const menu    = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('hamburger-icon');
  const iconClose = document.getElementById('close-icon');
  if (!navbar || !inner) return;

  /* ── Scroll: opacità navbar ── */
  function onScroll() {
    if (window.scrollY > 40) {
      inner.style.background   = 'rgba(255,255,255,0.97)';
      inner.style.boxShadow    = 'var(--sr-shadow-md)';
      inner.style.borderColor  = 'transparent';
    } else {
      inner.style.background   = 'rgba(255,255,255,0.80)';
      inner.style.boxShadow    = 'var(--sr-shadow-sm)';
      inner.style.borderColor  = 'var(--sr-border)';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ── Mobile menu ── */
  if (!toggle || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.removeAttribute('inert');
    menu.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Chiudi menu');
    iconOpen.style.display  = 'none';
    iconClose.style.display = 'block';
  }

  function closeMenu() {
    toggle.focus();
    menu.classList.remove('is-open');
    menu.setAttribute('inert', '');
    menu.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Apri menu');
    iconOpen.style.display  = 'block';
    iconClose.style.display = 'none';
  }

  toggle.addEventListener('click', function () {
    menu.classList.contains('is-open') ? closeMenu() : openMenu();
  });

  /* Chiudi su click link */
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* Chiudi su click fuori */
  document.addEventListener('click', function (e) {
    if (menu.classList.contains('is-open') && !navbar.contains(e.target)) {
      closeMenu();
    }
  });

  /* Chiudi su Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      closeMenu();
      toggle.focus();
    }
  });

  /* Chiudi su resize > 768px */
  window.addEventListener('resize', function () {
    if (window.innerWidth >= 768 && menu.classList.contains('is-open')) {
      closeMenu();
    }
  }, { passive: true });
})();
