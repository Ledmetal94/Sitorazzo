(function () {
  const navbar = document.getElementById('sr-navbar');
  if (!navbar) return;

  const variants = ['dark', 'smoke', 'light', 'cream'];
  const selected = new URLSearchParams(window.location.search).get('nav');
  if (!variants.includes(selected)) return;

  variants.forEach(function (variant) {
    navbar.classList.remove('sr-navbar--' + variant);
  });
  navbar.classList.add('sr-navbar--' + selected);
})();
