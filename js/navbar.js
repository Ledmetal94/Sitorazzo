(function () {
  const navbar = document.getElementById('navbar');
  const inner = document.getElementById('navbar-inner');
  if (!navbar || !inner) return;

  function onScroll() {
    if (window.scrollY > 40) {
      inner.style.background = 'rgba(255,255,255,0.97)';
      inner.style.boxShadow = 'var(--sr-shadow-md)';
      inner.style.borderColor = 'transparent';
    } else {
      inner.style.background = 'rgba(255,255,255,0.80)';
      inner.style.boxShadow = 'var(--sr-shadow-sm)';
      inner.style.borderColor = 'var(--sr-border)';
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
