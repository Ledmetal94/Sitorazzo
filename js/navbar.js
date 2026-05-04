(function () {
  'use strict';

  var navbar = document.getElementById('sr-navbar');
  if (!navbar) return;

  function onScroll() {
    var scrolled = window.scrollY > 60;
    navbar.style.boxShadow = scrolled ? '0 8px 32px rgba(0,0,0,0.35)' : '';
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
