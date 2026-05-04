/**
 * Sitorazzo — GDPR Cookie Consent
 *
 * Usage: include this script before </body> on every page.
 * Call SRConsent.onReady(fn) to run code that depends on tracking being active.
 *
 * TODO before going live:
 *   Replace GA_ID and PIXEL_ID constants with real values.
 */

(function () {
  'use strict';

  // TODO: Replace with real IDs before deploying
  var GA_ID    = 'G-XXXXXXXXXX';
  var PIXEL_ID = 'PIXEL_ID_QUI';

  var CONSENT_KEY = 'sr_cookie_consent';
  var CONSENT_VER = '1'; // bump to re-ask after policy changes
  var VER_KEY     = 'sr_cookie_consent_v';

  var _ready     = false;
  var _callbacks = [];

  function onReady(fn) {
    if (_ready) { fn(); } else { _callbacks.push(fn); }
  }

  function fireReady() {
    _ready = true;
    _callbacks.forEach(function (fn) { fn(); });
    _callbacks = [];
  }

  function loadGA() {
    if (window.__sr_ga_loaded) return;
    window.__sr_ga_loaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function loadPixel() {
    if (window.__sr_pixel_loaded) return;
    window.__sr_pixel_loaded = true;
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  function loadTracking() {
    loadGA();
    loadPixel();
    fireReady();
  }

  function saveConsent(value) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
      localStorage.setItem(VER_KEY, CONSENT_VER);
    } catch (e) { /* private browsing */ }
  }

  function getConsent() {
    try {
      if (localStorage.getItem(VER_KEY) !== CONSENT_VER) return null;
      return localStorage.getItem(CONSENT_KEY);
    } catch (e) { return null; }
  }

  function dismissBanner(banner) {
    banner.style.transform = 'translateY(110%)';
    banner.style.opacity = '0';
    setTimeout(function () { banner.remove(); }, 400);
  }

  function buildBanner() {
    var banner = document.createElement('div');
    banner.id = 'sr-cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consenso cookie');
    banner.setAttribute('aria-live', 'polite');

    var style = [
      'position:fixed',
      'bottom:20px',
      'left:50%',
      'transform:translateX(-50%) translateY(0)',
      'z-index:9999',
      'width:min(760px, calc(100vw - 32px))',
      'background:#0A0A0A',
      'border:1px solid rgba(255,255,255,0.12)',
      'border-radius:20px',
      'padding:20px 24px',
      'display:flex',
      'align-items:center',
      'gap:20px',
      'box-shadow:0 24px 48px rgba(0,0,0,0.45)',
      'backdrop-filter:blur(12px)',
      '-webkit-backdrop-filter:blur(12px)',
      'transition:transform 350ms cubic-bezier(0.22,1,0.36,1), opacity 350ms',
    ].join(';');
    banner.setAttribute('style', style);

    var text = document.createElement('p');
    text.style.cssText = 'flex:1;margin:0;font-family:Inter,system-ui,sans-serif;font-size:13px;line-height:1.6;color:rgba(255,255,255,0.65)';
    text.innerHTML = 'Usiamo cookie analitici e di marketing per migliorare il sito e misurare le campagne. ' +
      '<a href="/legal/cookie-policy.html" style="color:rgba(255,255,255,0.45);text-decoration:underline;white-space:nowrap;">Cookie Policy</a>';

    var btnGroup = document.createElement('div');
    btnGroup.style.cssText = 'display:flex;gap:10px;flex-shrink:0;flex-wrap:wrap;justify-content:flex-end';

    var btnReject = document.createElement('button');
    btnReject.type = 'button';
    btnReject.textContent = 'Solo essenziali';
    btnReject.style.cssText = [
      'font-family:Inter,system-ui,sans-serif',
      'font-size:13px',
      'font-weight:600',
      'padding:9px 16px',
      'border-radius:9999px',
      'border:1.5px solid rgba(255,255,255,0.18)',
      'background:transparent',
      'color:rgba(255,255,255,0.65)',
      'cursor:pointer',
      'white-space:nowrap',
      'transition:border-color 150ms, color 150ms',
      'min-height:44px',
    ].join(';');
    btnReject.addEventListener('mouseenter', function () {
      btnReject.style.borderColor = 'rgba(255,255,255,0.45)';
      btnReject.style.color = '#fff';
    });
    btnReject.addEventListener('mouseleave', function () {
      btnReject.style.borderColor = 'rgba(255,255,255,0.18)';
      btnReject.style.color = 'rgba(255,255,255,0.65)';
    });

    var btnAccept = document.createElement('button');
    btnAccept.type = 'button';
    btnAccept.textContent = 'Accetta tutto';
    btnAccept.style.cssText = [
      'font-family:Space Grotesk,Inter,system-ui,sans-serif',
      'font-size:13px',
      'font-weight:700',
      'padding:9px 20px',
      'border-radius:9999px',
      'border:none',
      'background:#FFD60A',
      'color:#0A0A0A',
      'cursor:pointer',
      'white-space:nowrap',
      'transition:background 150ms, transform 150ms',
      'min-height:44px',
    ].join(';');
    btnAccept.addEventListener('mouseenter', function () {
      btnAccept.style.background = '#F5B700';
      btnAccept.style.transform = 'translateY(-1px)';
    });
    btnAccept.addEventListener('mouseleave', function () {
      btnAccept.style.background = '#FFD60A';
      btnAccept.style.transform = '';
    });

    btnReject.addEventListener('click', function () {
      saveConsent('rejected');
      dismissBanner(banner);
    });

    btnAccept.addEventListener('click', function () {
      saveConsent('accepted');
      dismissBanner(banner);
      loadTracking();
    });

    btnGroup.appendChild(btnReject);
    btnGroup.appendChild(btnAccept);
    banner.appendChild(text);
    banner.appendChild(btnGroup);

    // Slide in after paint
    banner.style.opacity = '0';
    banner.style.transform = 'translateX(-50%) translateY(30px)';
    document.body.appendChild(banner);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        banner.style.transform = 'translateX(-50%) translateY(0)';
        banner.style.opacity = '1';
      });
    });

    // Responsive: stack on mobile
    function onResize() {
      if (window.innerWidth < 600) {
        banner.style.flexDirection = 'column';
        banner.style.alignItems = 'flex-start';
        btnGroup.style.width = '100%';
      } else {
        banner.style.flexDirection = '';
        banner.style.alignItems = 'center';
        btnGroup.style.width = '';
      }
    }
    window.addEventListener('resize', onResize);
    onResize();
  }

  function init() {
    var consent = getConsent();
    if (consent === 'accepted') {
      loadTracking();
    } else if (consent === null) {
      // Show banner when DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildBanner);
      } else {
        setTimeout(buildBanner, 200);
      }
    }
    // 'rejected' → do nothing, no tracking
  }

  window.SRConsent = { init: init, onReady: onReady, loadTracking: loadTracking };

  // Auto-init
  init();
})();
