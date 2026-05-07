(function () {
  'use strict';

  const form = document.getElementById('mockup-form');
  if (!form) return;

  const submitBtn = document.getElementById('mockup-submit');
  const submitLabel = document.getElementById('submit-label');
  const submitSpinner = document.getElementById('submit-spinner');
  const messageEl = document.getElementById('form-message');

  const logoInput = document.getElementById('logo');
  const logoDrop = document.getElementById('logo-drop');
  const logoPlaceholder = document.getElementById('logo-placeholder');
  const logoPreview = document.getElementById('logo-preview');
  const logoPreviewImg = document.getElementById('logo-preview-img');
  const logoPreviewName = document.getElementById('logo-preview-name');
  const logoClear = document.getElementById('logo-clear');

  const MAX_LOGO_BYTES = 5 * 1024 * 1024;
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];

  /* ---- Logo preview ---- */
  function updateLogoPreview(file) {
    if (!file) {
      logoPlaceholder.hidden = false;
      logoPreview.hidden = true;
      logoPreviewImg.src = '';
      logoPreviewName.textContent = '';
      return;
    }
    logoPlaceholder.hidden = true;
    logoPreview.hidden = false;
    logoPreview.style.display = 'flex';
    logoPreviewName.textContent = file.name;
    if (file.type === 'image/svg+xml') {
      logoPreviewImg.src = URL.createObjectURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => { logoPreviewImg.src = e.target.result; };
      reader.readAsDataURL(file);
    }
  }

  function validateLogo(file) {
    if (!file) return null;
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Formato logo non supportato. Usa PNG, JPG, SVG o WebP.';
    }
    if (file.size > MAX_LOGO_BYTES) {
      return 'Il logo è troppo grande (max 5MB).';
    }
    return null;
  }

  logoInput.addEventListener('change', () => {
    const file = logoInput.files && logoInput.files[0];
    const err = validateLogo(file);
    if (err) {
      showMessage(err, 'error');
      logoInput.value = '';
      updateLogoPreview(null);
      return;
    }
    clearMessage();
    updateLogoPreview(file);
  });

  logoClear.addEventListener('click', () => {
    logoInput.value = '';
    updateLogoPreview(null);
  });

  /* ---- Drag & drop ---- */
  ['dragenter', 'dragover'].forEach(evt => {
    logoDrop.addEventListener(evt, (e) => { e.preventDefault(); logoDrop.classList.add('is-dragover'); });
  });
  ['dragleave', 'drop'].forEach(evt => {
    logoDrop.addEventListener(evt, (e) => { e.preventDefault(); logoDrop.classList.remove('is-dragover'); });
  });
  logoDrop.addEventListener('drop', (e) => {
    const file = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    const err = validateLogo(file);
    if (err) { showMessage(err, 'error'); return; }
    const dt = new DataTransfer();
    dt.items.add(file);
    logoInput.files = dt.files;
    clearMessage();
    updateLogoPreview(file);
  });

  /* ---- Messages ---- */
  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = kind === 'error' ? 'is-error' : 'is-success';
    messageEl.hidden = false;
    messageEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  function clearMessage() {
    messageEl.hidden = true;
    messageEl.textContent = '';
    messageEl.className = '';
  }

  /* ---- Loading state ---- */
  function setLoading(on) {
    submitBtn.disabled = on;
    submitLabel.textContent = on ? 'Generazione in corso…' : 'Genera la mia anteprima gratis →';
    submitSpinner.hidden = !on;
  }

  /* ---- Validation ---- */
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  }

  function validateForm(formData) {
    const businessName = (formData.get('businessName') || '').trim();
    const industry = formData.get('industry') || '';
    const email = (formData.get('email') || '').trim();
    const privacy = formData.get('privacy');

    if (businessName.length < 2) return 'Inserisci un nome attività valido.';
    if (businessName.length > 80) return 'Il nome attività è troppo lungo.';
    if (!['ristoranti', 'parrucchieri-estetiste', 'artigiani', 'professionisti', 'generico'].includes(industry)) {
      return 'Scegli un settore valido.';
    }
    if (!validateEmail(email)) return 'Inserisci un indirizzo email valido.';
    if (!privacy) return 'Devi accettare la privacy policy per continuare.';

    const logoFile = formData.get('logo');
    if (logoFile && logoFile.size > 0) {
      const err = validateLogo(logoFile);
      if (err) return err;
    }

    return null;
  }

  /* ---- Submit ---- */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessage();

    // Honeypot
    const honeypot = form.querySelector('input[name="website"]');
    if (honeypot && honeypot.value) {
      // Bot detected — fake success to avoid signal
      showMessage('Anteprima generata. Controlla la tua email.', 'success');
      return;
    }

    const formData = new FormData(form);
    const validationError = validateForm(formData);
    if (validationError) {
      showMessage(validationError, 'error');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/generate-mockup', {
        method: 'POST',
        body: formData
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Errore durante la generazione. Riprova.');
      }

      // Success — Day 1 ends here. Day 2 will redirect to /anteprima/[id].
      const redirectUrl = data.mockupUrl || `/anteprima/${data.id}`;
      showMessage('✓ Anteprima registrata! Ti stiamo creando la tua homepage. Controlla la tua email entro 60 secondi.', 'success');
      form.reset();
      updateLogoPreview(null);

      // Optional: redirect after 2s if mockupUrl is ready (Day 2+)
      if (data.ready && redirectUrl) {
        setTimeout(() => { window.location.href = redirectUrl; }, 1800);
      }
    } catch (err) {
      console.error('Submit error:', err);
      showMessage(err.message || 'Errore di rete. Riprova tra un momento.', 'error');
    } finally {
      setLoading(false);
    }
  });
})();
