/* ============================================================
   SITORAZZO — ONBOARDING BRIEF WIZARD
   ============================================================ */

const TOTAL_STEPS = 8;
const VALID_PACKAGES = ['start', 'pro', 'power'];

/* ---------- State ---------- */
const params = new URLSearchParams(location.search);
const pkgFromUrl = params.get('pacchetto');
const formData = {
  pacchetto:        VALID_PACKAGES.includes(pkgFromUrl) ? pkgFromUrl : 'pro',
  nome:             '',
  settore:          '',
  citta:            '',
  descrizione:      '',
  referente:        '',
  ruolo:            '',
  email:            '',
  telefono:         '',
  whatsapp:         '',
  logoStatus:       '',
  files:            [],
  dominio:          '',
  dominioStatus:    '',
  sitoEsistente:    '',
  sitoUrl:          '',
  social: {
    instagram: '',
    facebook:  '',
    tiktok:    '',
    linkedin:  '',
  },
  altriLink:        '',
  socialVisibility: '',
  indirizzo:        '',
  tipoSede:         '',
  orari: {
    lun: { apre: '09:00', chiude: '18:00', chiuso: false },
    mar: { apre: '09:00', chiude: '18:00', chiuso: false },
    mer: { apre: '09:00', chiude: '18:00', chiuso: false },
    gio: { apre: '09:00', chiude: '18:00', chiuso: false },
    ven: { apre: '09:00', chiude: '18:00', chiuso: false },
    sab: { apre: '09:00', chiude: '13:00', chiuso: true  },
    dom: { apre: '09:00', chiude: '13:00', chiuso: true  },
  },
  mood:             '',
  coloriLogo:       '',
  riferimenti:      '',
  nonVuole:         '',
  noteFinali:       '',
};
let currentStep = 0;

/* ---------- DOM refs ---------- */
const card          = document.getElementById('step-card');
const progressBar   = document.getElementById('progress-bar');
const stepIndicator = document.getElementById('step-indicator');
const navStepText   = document.getElementById('nav-step-text');
const btnBack       = document.getElementById('btn-back');
const btnNext       = document.getElementById('btn-next');
const navBar        = document.getElementById('nav-bar');

/* ---------- Navigation ---------- */
function goTo(step) {
  currentStep = step;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateChrome() {
  const pct = currentStep === 0 ? 0
            : currentStep === 9 ? 100
            : Math.round((currentStep / TOTAL_STEPS) * 100);
  progressBar.style.width = pct + '%';

  if (currentStep >= 1 && currentStep <= TOTAL_STEPS) {
    stepIndicator.textContent = `Step ${currentStep} di ${TOTAL_STEPS}`;
    navStepText.textContent   = `${currentStep}/${TOTAL_STEPS}`;
  } else {
    stepIndicator.textContent = '';
    navStepText.textContent   = '';
  }

  btnBack.style.visibility = currentStep <= 1 ? 'hidden' : 'visible';
  navBar.style.display = (currentStep === 0 || currentStep === 9) ? 'none' : 'flex';

  if (currentStep === TOTAL_STEPS) {
    setButtonContent(btnNext, 'Invia brief', 'check');
  } else {
    setButtonContent(btnNext, 'Avanti', 'arrow-right');
  }
}

btnBack.addEventListener('click', () => {
  if (currentStep > 1) goTo(currentStep - 1);
});

btnNext.addEventListener('click', () => {
  const err = validate(currentStep);
  if (err) { showError(err); return; }
  clearError();
  if (currentStep === TOTAL_STEPS) {
    submitForm();
  } else {
    goTo(currentStep + 1);
  }
});

/* ---------- Error display ---------- */
function showError(msg) {
  let el = document.getElementById('form-error');
  if (!el) {
    el = document.createElement('p');
    el.id = 'form-error';
    el.className = 'form-error';
    el.setAttribute('role', 'alert');
    card.appendChild(el);
  }
  el.textContent = msg;
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}
function clearError() {
  const el = document.getElementById('form-error');
  if (el) el.remove();
}

/* ---------- Render ---------- */
function render() {
  updateChrome();
  switch (currentStep) {
    case 0: renderWelcome();  break;
    case 1: renderStep1();    break;
    case 2: renderStep2();    break;
    case 3: renderStep3();    break;
    case 4: renderStep4();    break;
    case 5: renderStep5();    break;
    case 6: renderStep6();    break;
    case 7: renderStep7();    break;
    case 8: renderStep8();    break;
    case 9: renderThankyou(); break;
  }
}

/* ---------- Helpers ---------- */
function field(labelText, inputEl, hint) {
  const wrap = document.createElement('div');
  wrap.style.marginBottom = 'var(--sr-space-5)';
  const lbl = document.createElement('label');
  lbl.className = 'sr-label';
  lbl.textContent = labelText;
  wrap.appendChild(lbl);
  wrap.appendChild(inputEl);
  if (hint) {
    const p = document.createElement('p');
    p.style.cssText = 'font-size:var(--sr-fs-xs);color:var(--sr-ink-40);margin-top:var(--sr-space-1);';
    p.textContent = hint;
    wrap.appendChild(p);
  }
  return wrap;
}

function input(type, placeholder, value, onchange) {
  const el = document.createElement('input');
  el.type = type;
  el.className = 'sr-input';
  el.placeholder = placeholder;
  el.value = value || '';
  el.addEventListener('input', e => onchange(e.target.value));
  return el;
}

function textarea(placeholder, value, onchange, rows) {
  rows = rows || 4;
  const el = document.createElement('textarea');
  el.className = 'sr-textarea';
  el.placeholder = placeholder;
  el.rows = rows;
  el.value = value || '';
  el.addEventListener('input', e => onchange(e.target.value));
  return el;
}

function stepHeader(eyebrow, title, lead) {
  const wrap = document.createElement('div');
  wrap.style.marginBottom = 'var(--sr-space-8)';
  wrap.innerHTML = `
    <p class="sr-eyebrow" style="margin-bottom:var(--sr-space-2);">${eyebrow}</p>
    <h1 class="sr-h2" style="margin-bottom:var(--sr-space-3);">${title}</h1>
    ${lead ? `<p class="sr-lead">${lead}</p>` : ''}
  `;
  return wrap;
}

function icon(name) {
  const paths = {
    'arrow-right': '<path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    'check-circle': '<path d="M9 12l2 2 4-4"></path><circle cx="12" cy="12" r="10"></circle>',
    diamond: '<path d="M6 3h12l4 6-10 12L2 9Z"></path><path d="M11 3 8 9l4 12 4-12-3-6"></path><path d="M2 9h20"></path>',
    landmark: '<path d="M3 21h18"></path><path d="M5 21V10h14v11"></path><path d="M12 3 4 8h16Z"></path><path d="M9 21v-8"></path><path d="M15 21v-8"></path>',
    layout: '<rect width="18" height="14" x="3" y="5" rx="2"></rect><path d="M3 10h18"></path><path d="M9 10v9"></path>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"></path>',
    monitor: '<rect width="20" height="14" x="2" y="3" rx="2"></rect><path d="M8 21h8"></path><path d="M12 17v4"></path>',
    rocket: '<path d="M4.5 16.5c-1.5 1.3-2 3-2 5 2 0 3.7-.5 5-2"></path><path d="M9 15 5 11l6-6c3-3 6.5-3 8-3 .1 1.5 0 5-3 8Z"></path><path d="M9 15h5l1-1"></path><path d="M9 15v-5l1-1"></path><circle cx="15" cy="7" r="1"></circle>',
    'shield-check': '<path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3Z"></path><path d="m9 12 2 2 4-4"></path>',
    sun: '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path>',
    trophy: '<path d="M8 21h8"></path><path d="M12 17v4"></path><path d="M7 4h10v4a5 5 0 0 1-10 0Z"></path><path d="M5 5H3v2a4 4 0 0 0 4 4"></path><path d="M19 5h2v2a4 4 0 0 1-4 4"></path>',
    zap: '<path d="M13 2 3 14h8l-1 8 10-12h-8Z"></path>',
  };
  return `<svg class="sr-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || ''}</svg>`;
}

function setButtonContent(button, label, iconName) {
  button.innerHTML = `${label} ${icon(iconName)}`;
}

/* ---------- Validation ---------- */
function validate(step) {
  const markInvalid = (selector) => {
    const el = document.querySelector(selector);
    if (el) {
      el.classList.add('is-error');
      el.focus({ preventScroll: true });
      el.addEventListener('input', () => el.classList.remove('is-error'), { once: true });
    }
  };

  switch (step) {
    case 1:
      if (!formData.nome.trim()) {
        markInvalid('[data-field="nome"]');
        return 'Inserisci il nome della tua attività.';
      }
      if (!formData.settore)        return 'Seleziona il settore di attività.';
      if (!formData.citta.trim()) {
        markInvalid('[data-field="citta"]');
        return 'Inserisci la città.';
      }
      break;
    case 2:
      if (!formData.referente.trim()) {
        markInvalid('[data-field="referente"]');
        return 'Inserisci il tuo nome.';
      }
      if (!formData.email.trim()) {
        markInvalid('[data-field="email"]');
        return 'Inserisci la tua email.';
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        markInvalid('[data-field="email"]');
        return 'Email non valida.';
      }
      if (!formData.telefono.trim()) {
        markInvalid('[data-field="telefono"]');
        return 'Inserisci un numero di telefono.';
      }
      break;
    case 8:
      if (!formData.mood) return 'Seleziona lo stile visivo preferito.';
      break;
  }
  return null;
}

/* ============================================================
   STEP 0 — WELCOME
   ============================================================ */
function renderWelcome() {
  const pkg = { start: { label: 'Start', price: '390€', days: 5 },
                pro:   { label: 'Pro',   price: '590€', days: 7 },
                power: { label: 'Power', price: '1.290€', days: 10 } };
  const p = pkg[formData.pacchetto] || pkg.pro;

  card.innerHTML = `
    <div style="text-align:center; padding: var(--sr-space-8) 0;">
      <img src="/assets/Sitorazzo_Logomark_256px.png" alt="Sitorazzo" style="height:64px; margin: 0 auto var(--sr-space-6);">
      <div class="onboarding-hero-icon">${icon('rocket')}</div>
      <h1 class="sr-h2" style="margin-bottom:var(--sr-space-4);">Perfetto, ci siamo!</h1>
      <p class="sr-lead" style="margin-bottom:var(--sr-space-6); max-width:480px; margin-left:auto; margin-right:auto;">
        Hai scelto il piano <strong>${p.label}</strong> a <strong>${p.price}</strong>.
        Il tuo sito sarà online in <strong>${p.days} giorni lavorativi</strong> dall'invio di questo brief.
      </p>
      <div class="sr-card" style="display:inline-block; text-align:left; max-width:400px; width:100%; margin-bottom:var(--sr-space-8);">
        <p class="sr-eyebrow" style="margin-bottom:var(--sr-space-3);">Cosa succede ora</p>
        <ol style="padding-left:var(--sr-space-5); margin:0; display:flex; flex-direction:column; gap:var(--sr-space-2);">
          <li class="text-sm">Compili questo brief in 10–15 minuti</li>
          <li class="text-sm">Il nostro team inizia a lavorare il giorno lavorativo successivo</li>
          <li class="text-sm">Ricevi il sito finito nei tempi garantiti</li>
          <li class="text-sm">Approvazione, trasferimento credenziali e sito live</li>
        </ol>
      </div>
      <button class="sr-btn sr-btn-primary sr-btn-lg" id="btn-start">
        Inizia il brief ${icon('arrow-right')}
      </button>
      <p style="margin-top:var(--sr-space-4); font-size:var(--sr-fs-xs); color:var(--sr-ink-40);">
        Hai domande? Scrivici su
        <a href="https://wa.me/39NUMEROQUI" target="_blank" style="color:var(--sr-ink);">WhatsApp</a>
      </p>
    </div>
  `;
  document.getElementById('btn-start').addEventListener('click', () => goTo(1));
}

/* ============================================================
   STEP 1 — LA TUA ATTIVITÀ
   ============================================================ */
const SETTORI = [
  'Ristorante / Bar','Parrucchiere / Estetica','Idraulico / Elettricista',
  'B&B / Affittacamere','Commercialista / Consulente','Palestra / Personal Trainer',
  'Fotografo / Creativo','Artigiano / Falegname','Negozio / Retail',
  'Studio Medico / Dentista','Avvocato / Notaio','Altro',
];

function renderStep1() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 1 di 8', 'La tua attività', 'Raccontaci chi sei. Queste informazioni guidano tutto il progetto.'));

  const nomeInput = input('text', 'Es. Pizzeria Da Mario', formData.nome, v => formData.nome = v);
  nomeInput.dataset.field = 'nome';
  card.appendChild(field('Nome attività *', nomeInput));

  const cittaInput = input('text', 'Es. Latina', formData.citta, v => formData.citta = v);
  cittaInput.dataset.field = 'citta';
  card.appendChild(field('Città *', cittaInput));

  const settoreWrap = document.createElement('div');
  settoreWrap.style.marginBottom = 'var(--sr-space-5)';
  const settoreLbl = document.createElement('label');
  settoreLbl.className = 'sr-label';
  settoreLbl.textContent = 'Settore *';
  settoreWrap.appendChild(settoreLbl);
  const pillsContainer = document.createElement('div');
  pillsContainer.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  SETTORI.forEach(s => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.settore === s ? ' selected' : '');
    pill.textContent = s;
    pill.addEventListener('click', () => {
      formData.settore = s;
      pillsContainer.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    pillsContainer.appendChild(pill);
  });
  settoreWrap.appendChild(pillsContainer);
  card.appendChild(settoreWrap);

  card.appendChild(field(
    'Descrizione attività',
    textarea('Descrivi brevemente cosa fai, i tuoi clienti tipici, cosa ti distingue dalla concorrenza…', formData.descrizione, v => formData.descrizione = v, 5),
    'Più dettagli fornisci, più il sito sarà personalizzato. Non è obbligatorio ma aiuta molto.'
  ));
}

/* ============================================================
   STEP 2 — I TUOI CONTATTI
   ============================================================ */
function renderStep2() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 2 di 8', 'I tuoi contatti', 'Chi gestisce il progetto? Usiamo questi dati solo per comunicare con te.'));

  const referenteInput = input('text', 'Es. Mario Rossi', formData.referente, v => formData.referente = v);
  referenteInput.dataset.field = 'referente';
  card.appendChild(field('Il tuo nome *', referenteInput));

  const ruoliWrap = document.createElement('div');
  ruoliWrap.style.marginBottom = 'var(--sr-space-5)';
  const ruoliLbl = document.createElement('label');
  ruoliLbl.className = 'sr-label';
  ruoliLbl.textContent = 'Ruolo';
  ruoliWrap.appendChild(ruoliLbl);
  const ruoliPills = document.createElement('div');
  ruoliPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Titolare', 'Responsabile marketing', 'Dipendente', 'Altro'].forEach(r => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.ruolo === r ? ' selected' : '');
    pill.textContent = r;
    pill.addEventListener('click', () => {
      formData.ruolo = r;
      ruoliPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    ruoliPills.appendChild(pill);
  });
  ruoliWrap.appendChild(ruoliPills);
  card.appendChild(ruoliWrap);

  const emailInput = input('email', 'mario@esempio.it', formData.email, v => formData.email = v);
  emailInput.dataset.field = 'email';
  card.appendChild(field('Email *', emailInput));

  const telefonoInput = input('tel', '+39 XXX XXX XXXX', formData.telefono, v => formData.telefono = v);
  telefonoInput.dataset.field = 'telefono';
  card.appendChild(field('Telefono *', telefonoInput));
  card.appendChild(field(
    'WhatsApp (se diverso dal telefono)',
    input('tel', '+39 XXX XXX XXXX', formData.whatsapp, v => formData.whatsapp = v),
    'Lascia vuoto se uguale al telefono.'
  ));
}

/* ============================================================
   STEP 3 — IL TUO PACCHETTO
   ============================================================ */
const PACCHETTI = [
  {
    key:   'start',
    label: 'Start',
    price: '390€',
    days:  5,
    desc:  'Fino a 5 pagine. Design professionale. Ideale per chi parte da zero.',
  },
  {
    key:   'pro',
    label: 'Pro',
    price: '590€',
    badge: 'Più venduto',
    icon:  'trophy',
    days:  7,
    desc:  'Fino a 8 pagine + blog. SEO avanzato. Il più richiesto.',
  },
  {
    key:   'power',
    label: 'Power',
    price: '1.290€',
    days:  10,
    desc:  'E-commerce, pagamenti online, campagna Google Ads inclusa.',
  },
];

function renderStep3() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 3 di 8', 'Il tuo pacchetto', 'Conferma o cambia il pacchetto scelto. Puoi modificarlo ora — il prezzo finale è quello pagato.'));

  const grid = document.createElement('div');
  grid.style.cssText = 'display:flex; flex-direction:column; gap:var(--sr-space-4);';

  PACCHETTI.forEach(pkg => {
    const c = document.createElement('div');
    c.className = 'pkg-card' + (formData.pacchetto === pkg.key ? ' selected' : '');
    c.innerHTML = `
      <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:var(--sr-space-4);">
        <div>
          <div style="display:flex; align-items:center; gap:var(--sr-space-2); margin-bottom:var(--sr-space-1);">
            <span style="font-family:var(--sr-font-display); font-weight:700; font-size:var(--sr-fs-lg);">${pkg.label}</span>
            ${pkg.badge ? `<span class="sr-badge sr-badge-yellow" style="font-size:10px;">${icon(pkg.icon)} ${pkg.badge}</span>` : ''}
          </div>
          <p class="text-sm" style="color:var(--sr-ink-70); margin:0;">${pkg.desc}</p>
          <p class="text-xs" style="color:var(--sr-ink-40); margin-top:4px;">Consegna in ${pkg.days} giorni lavorativi</p>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div class="sr-mono font-bold" style="font-size:var(--sr-fs-xl);">${pkg.price}</div>
          <div class="sr-badge ${formData.pacchetto === pkg.key ? 'sr-badge-ink' : 'sr-badge-warm'}" id="badge-${pkg.key}" style="margin-top:4px;">
            ${formData.pacchetto === pkg.key ? 'Selezionato' : 'Seleziona'}
          </div>
        </div>
      </div>
    `;
    c.addEventListener('click', () => {
      formData.pacchetto = pkg.key;
      grid.querySelectorAll('.pkg-card').forEach(el => el.classList.remove('selected'));
      c.classList.add('selected');
      PACCHETTI.forEach(p => {
        const badge = document.getElementById('badge-' + p.key);
        if (badge) {
          badge.className = 'sr-badge ' + (p.key === pkg.key ? 'sr-badge-ink' : 'sr-badge-warm');
          badge.textContent = p.key === pkg.key ? 'Selezionato' : 'Seleziona';
        }
      });
    });
    grid.appendChild(c);
  });

  card.appendChild(grid);
  card.insertAdjacentHTML('beforeend', `
    <p style="font-size:var(--sr-fs-xs); color:var(--sr-ink-40); margin-top:var(--sr-space-4);">
      Nota: il pacchetto qui visualizzato è informativo. Il prezzo che hai pagato su Stripe è definitivo.
    </p>
  `);
}

/* ============================================================
   STEP 4 — LOGO E IMMAGINI
   ============================================================ */
function renderStep4() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 4 di 8', 'Logo e immagini', 'Carica il tuo logo e le immagini che vuoi usare nel sito.'));

  // Logo status pills
  const logoWrap = document.createElement('div');
  logoWrap.style.marginBottom = 'var(--sr-space-6)';
  const logoLbl = document.createElement('label');
  logoLbl.className = 'sr-label';
  logoLbl.textContent = 'Hai già un logo?';
  logoWrap.appendChild(logoLbl);
  const logoPills = document.createElement('div');
  logoPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Sì, ce l\'ho', 'No, da creare', 'Ho solo del testo'].forEach(opt => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.logoStatus === opt ? ' selected' : '');
    pill.textContent = opt;
    pill.addEventListener('click', () => {
      formData.logoStatus = opt;
      logoPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    logoPills.appendChild(pill);
  });
  logoWrap.appendChild(logoPills);
  card.appendChild(logoWrap);

  // File upload
  const uploadWrap = document.createElement('div');
  uploadWrap.style.marginBottom = 'var(--sr-space-6)';

  const uploadLbl = document.createElement('label');
  uploadLbl.className = 'sr-label';
  uploadLbl.textContent = 'Carica file (logo, immagini, documenti)';
  uploadWrap.appendChild(uploadLbl);

  const hint = document.createElement('p');
  hint.style.cssText = 'font-size:var(--sr-fs-xs); color:var(--sr-ink-40); margin-bottom:var(--sr-space-3);';
  hint.textContent = 'PNG, JPG, SVG, PDF, AI, ZIP. Max 15MB per file. Puoi selezionare più file contemporaneamente.';
  uploadWrap.appendChild(hint);

  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.multiple = true;
  fileInput.accept = 'image/*,.pdf,.ai,.eps,.svg,.zip,.psd';
  fileInput.id = 'brief-files';
  fileInput.style.cssText = 'position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer;';

  const dropZone = document.createElement('div');
  dropZone.id = 'drop-zone';
  dropZone.style.position = 'relative';
  dropZone.innerHTML = `
    <div class="sr-mono font-bold" style="font-size:var(--sr-fs-sm); margin-bottom:var(--sr-space-2);">Trascina qui i file</div>
    <div class="text-sm" style="color:var(--sr-ink-70);">oppure clicca per selezionarli dal computer</div>
  `;
  dropZone.appendChild(fileInput);

  // Restore previously selected files if navigating back
  const fileListEl = document.createElement('div');
  fileListEl.id = 'file-list';
  fileListEl.style.marginTop = 'var(--sr-space-3)';

  if (formData.files.length) {
    fileListEl.innerHTML = formData.files.map(f =>
      `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px; display:flex; align-items:center; gap:6px;">${icon('check-circle')} File caricato: ${f.name}</div>`
    ).join('');
  }

  const renderFiles = () => {
    fileListEl.innerHTML = formData.files.map(f =>
      `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px; display:flex; align-items:center; gap:6px;">${icon('check-circle')} File caricato: ${f.name} (${(f.size / 1024).toFixed(0)} KB)</div>`
    ).join('');
  };

  fileInput.addEventListener('change', () => {
    formData.files = Array.from(fileInput.files);
    renderFiles();
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  });

  dropZone.addEventListener('drop', (event) => {
    formData.files = Array.from(event.dataTransfer.files || []);
    renderFiles();
  });

  uploadWrap.appendChild(dropZone);
  uploadWrap.appendChild(fileListEl);
  card.appendChild(uploadWrap);

  card.insertAdjacentHTML('beforeend', `
    <p style="font-size:var(--sr-fs-xs); color:var(--sr-ink-40); margin-top:var(--sr-space-2);">
      Non hai file ora? Puoi saltare questo step — ce li mandi dopo via email o WhatsApp.
    </p>
  `);
}

/* ============================================================
   STEP 5 — DOMINIO E URL
   ============================================================ */
function renderStep5() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 5 di 8', 'Dominio e URL', 'Che indirizzo web vuoi per il tuo sito?'));

  card.appendChild(field(
    'Dominio desiderato',
    input('text', 'Es. mariorossi.it o pizzeriadamario.it', formData.dominio, v => formData.dominio = v),
    'Scrivi solo il nome, senza https://. Se non lo sai ancora, lascia vuoto.'
  ));

  const statoDomWrap = document.createElement('div');
  statoDomWrap.style.marginBottom = 'var(--sr-space-5)';
  const statoDomLbl = document.createElement('label');
  statoDomLbl.className = 'sr-label';
  statoDomLbl.textContent = 'Stato del dominio';
  statoDomWrap.appendChild(statoDomLbl);
  const statoPills = document.createElement('div');
  statoPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Da registrare (incluso nel prezzo)', 'Ce l\'ho già', 'Non lo so'].forEach(opt => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.dominioStatus === opt ? ' selected' : '');
    pill.textContent = opt;
    pill.addEventListener('click', () => {
      formData.dominioStatus = opt;
      statoPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    statoPills.appendChild(pill);
  });
  statoDomWrap.appendChild(statoPills);
  card.appendChild(statoDomWrap);

  const sitoEsWrap = document.createElement('div');
  sitoEsWrap.style.marginBottom = 'var(--sr-space-5)';
  const sitoEsLbl = document.createElement('label');
  sitoEsLbl.className = 'sr-label';
  sitoEsLbl.textContent = 'Hai già un sito web?';
  sitoEsWrap.appendChild(sitoEsLbl);
  const sitoEsPills = document.createElement('div');
  sitoEsPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Sì', 'No', 'Ho solo una pagina social'].forEach(opt => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.sitoEsistente === opt ? ' selected' : '');
    pill.textContent = opt;
    pill.addEventListener('click', () => {
      formData.sitoEsistente = opt;
      sitoEsPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
      const urlField = document.getElementById('url-esistente-wrap');
      if (urlField) urlField.style.display = opt === 'Sì' ? 'block' : 'none';
    });
    sitoEsPills.appendChild(pill);
  });
  sitoEsWrap.appendChild(sitoEsPills);
  card.appendChild(sitoEsWrap);

  const urlWrap = field(
    'URL sito esistente',
    input('url', 'https://www.esempio.it', formData.sitoUrl, v => formData.sitoUrl = v),
    'Ci aiuta a capire cosa tenere e cosa migliorare.'
  );
  urlWrap.id = 'url-esistente-wrap';
  urlWrap.style.display = formData.sitoEsistente === 'Sì' ? 'block' : 'none';
  card.appendChild(urlWrap);
}

/* ============================================================
   STEP 6 — SOCIAL
   ============================================================ */
function renderStep6() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 6 di 8', 'I tuoi social', 'Inseriamo i link ai tuoi profili nel sito. Lascia vuoto quelli che non hai.'));

  const socials = [
    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/tuoprofilo' },
    { key: 'facebook',  label: 'Facebook',  placeholder: 'https://facebook.com/tuapagina' },
    { key: 'tiktok',    label: 'TikTok',    placeholder: 'https://tiktok.com/@tuoprofilo' },
    { key: 'linkedin',  label: 'LinkedIn',  placeholder: 'https://linkedin.com/in/tuoprofilo' },
  ];
  socials.forEach(s => {
    card.appendChild(field(
      s.label,
      input('url', s.placeholder, formData.social[s.key], v => formData.social[s.key] = v)
    ));
  });

  card.appendChild(field(
    'Altri link (Google My Business, Tripadvisor, ecc.)',
    textarea('Incolla qui altri link utili, uno per riga', formData.altriLink, v => formData.altriLink = v, 3)
  ));

  const visWrap = document.createElement('div');
  visWrap.style.marginBottom = 'var(--sr-space-5)';
  const visLbl = document.createElement('label');
  visLbl.className = 'sr-label';
  visLbl.textContent = 'Come mostrare i social nel sito?';
  visWrap.appendChild(visLbl);
  const visPills = document.createElement('div');
  visPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Icone nel footer', 'Icone + feed Instagram', 'Non mostrare', 'Non lo so, decidete voi'].forEach(opt => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.socialVisibility === opt ? ' selected' : '');
    pill.textContent = opt;
    pill.addEventListener('click', () => {
      formData.socialVisibility = opt;
      visPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    visPills.appendChild(pill);
  });
  visWrap.appendChild(visPills);
  card.appendChild(visWrap);
}

/* ============================================================
   STEP 7 — SEDE E ORARI
   ============================================================ */
const GIORNI = [
  { key: 'lun', label: 'Lunedì' },
  { key: 'mar', label: 'Martedì' },
  { key: 'mer', label: 'Mercoledì' },
  { key: 'gio', label: 'Giovedì' },
  { key: 'ven', label: 'Venerdì' },
  { key: 'sab', label: 'Sabato' },
  { key: 'dom', label: 'Domenica' },
];

function renderStep7() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 7 di 8', 'Sede e orari', 'Questi dati appaiono nella sezione "Contatti" del sito e su Google Maps.'));

  card.appendChild(field(
    'Indirizzo sede',
    input('text', 'Es. Via Roma 1, 04100 Latina (LT)', formData.indirizzo, v => formData.indirizzo = v)
  ));

  const tipoWrap = document.createElement('div');
  tipoWrap.style.marginBottom = 'var(--sr-space-6)';
  const tipoLbl = document.createElement('label');
  tipoLbl.className = 'sr-label';
  tipoLbl.textContent = 'Tipo di sede';
  tipoWrap.appendChild(tipoLbl);
  const tipoPills = document.createElement('div');
  tipoPills.style.cssText = 'display:flex; flex-wrap:wrap; gap:var(--sr-space-2); margin-top:var(--sr-space-2);';
  ['Negozio / Studio fisico', 'Solo online', 'A domicilio / Mobile', 'Non applicabile'].forEach(opt => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'pill-option' + (formData.tipoSede === opt ? ' selected' : '');
    pill.textContent = opt;
    pill.addEventListener('click', () => {
      formData.tipoSede = opt;
      tipoPills.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      pill.classList.add('selected');
    });
    tipoPills.appendChild(pill);
  });
  tipoWrap.appendChild(tipoPills);
  card.appendChild(tipoWrap);

  const orariLbl = document.createElement('label');
  orariLbl.className = 'sr-label';
  orariLbl.style.marginBottom = 'var(--sr-space-3)';
  orariLbl.textContent = 'Orari di apertura';
  card.appendChild(orariLbl);

  GIORNI.forEach(g => {
    const row = document.createElement('div');
    row.className = 'hours-row';

    const dayLabel = document.createElement('span');
    dayLabel.style.cssText = 'font-size:var(--sr-fs-sm); font-weight:600;';
    dayLabel.textContent = g.label;

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'toggle-chiuso' + (formData.orari[g.key].chiuso ? ' active' : '');
    toggle.title = 'Chiuso';
    toggle.setAttribute('aria-label', `Segna ${g.label} come chiuso`);
    toggle.setAttribute('aria-pressed', String(formData.orari[g.key].chiuso));

    const toggleLabel = document.createElement('span');
    toggleLabel.style.cssText = 'font-size:var(--sr-fs-xs); color:var(--sr-ink-40);';
    toggleLabel.textContent = formData.orari[g.key].chiuso ? 'Chiuso' : 'Aperto';

    const timeWrap = document.createElement('div');
    timeWrap.className = 'hours-time-wrap';
    timeWrap.style.cssText =
      (formData.orari[g.key].chiuso ? 'opacity:0.3; pointer-events:none;' : '');
    timeWrap.id = `time-wrap-${g.key}`;

    const makeTimeInput = (valKey) => {
      const inp = document.createElement('input');
      inp.type = 'time';
      inp.className = 'sr-input';
      inp.value = formData.orari[g.key][valKey];
      inp.addEventListener('change', e => formData.orari[g.key][valKey] = e.target.value);
      return inp;
    };
    timeWrap.appendChild(makeTimeInput('apre'));
    timeWrap.insertAdjacentHTML('beforeend', '<span class="text-sm" style="color:var(--sr-ink-40);">a</span>');
    timeWrap.appendChild(makeTimeInput('chiude'));

    toggle.addEventListener('click', () => {
      formData.orari[g.key].chiuso = !formData.orari[g.key].chiuso;
      const isClosed = formData.orari[g.key].chiuso;
      toggle.classList.toggle('active', isClosed);
      toggle.setAttribute('aria-pressed', String(isClosed));
      toggleLabel.textContent = isClosed ? 'Chiuso' : 'Aperto';
      const tw = document.getElementById(`time-wrap-${g.key}`);
      if (tw) tw.style.opacity = isClosed ? '0.3' : '1';
      if (tw) tw.style.pointerEvents = isClosed ? 'none' : 'auto';
    });

    row.appendChild(dayLabel);
    row.appendChild(toggle);
    row.appendChild(toggleLabel);
    row.appendChild(timeWrap);
    card.appendChild(row);
  });
}

/* ============================================================
   STEP 8 — STILE E PREFERENZE
   ============================================================ */
const MOODS = [
  { key: 'minimal',       label: 'Minimal',       icon: 'layout', swatches: ['#FFFFFF', '#F5F5F5', '#0A0A0A'], desc: 'Pulito, bianco, elegante' },
  { key: 'bold',          label: 'Bold',          icon: 'zap', swatches: ['#0A0A0A', '#FFD60A', '#FFFFFF'], desc: 'Forte, scuro, impattante' },
  { key: 'caldo',         label: 'Caldo',         icon: 'sun', swatches: ['#FFF8E7', '#D4894A', '#3D2C1E'], desc: 'Colori saturi, amichevole' },
  { key: 'luxury',        label: 'Luxury',        icon: 'diamond', swatches: ['#0A0A0A', '#BFA46A', '#F8F5EA'], desc: 'Sofisticato, premium' },
  { key: 'moderno',       label: 'Moderno',       icon: 'monitor', swatches: ['#E8F0FF', '#2563EB', '#0A0A0A'], desc: 'Tech, dinamico, digitale' },
  { key: 'tradizionale',  label: 'Tradizionale',  icon: 'landmark', swatches: ['#F6EFE6', '#6B4A2D', '#1F2933'], desc: 'Classico, affidabile' },
];

function renderStep8() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 8 di 8', 'Stile e preferenze', 'Aiutaci a capire il tono visivo che vuoi per il tuo sito.'));

  const moodWrap = document.createElement('div');
  moodWrap.style.marginBottom = 'var(--sr-space-6)';
  const moodLbl = document.createElement('label');
  moodLbl.className = 'sr-label';
  moodLbl.textContent = 'Stile visivo preferito *';
  moodWrap.appendChild(moodLbl);
  const moodGrid = document.createElement('div');
  moodGrid.className = 'mood-grid';
  MOODS.forEach(m => {
    const c = document.createElement('div');
    c.className = 'mood-card' + (formData.mood === m.key ? ' selected' : '');
    c.innerHTML = `
      <div class="mood-icon">${icon(m.icon)}</div>
      <div style="display:flex; justify-content:center; gap:6px; margin-bottom:10px;">
        ${m.swatches.map(color => `<span style="width:18px; height:18px; border-radius:9999px; border:1px solid var(--sr-border); background:${color};"></span>`).join('')}
      </div>
      <div style="font-weight:700; font-size:var(--sr-fs-sm);">${m.label}</div>
      <div style="font-size:var(--sr-fs-xs); color:var(--sr-ink-40);">${m.desc}</div>
    `;
    c.addEventListener('click', () => {
      formData.mood = m.key;
      moodGrid.querySelectorAll('.mood-card').forEach(el => el.classList.remove('selected'));
      c.classList.add('selected');
    });
    moodGrid.appendChild(c);
  });
  moodWrap.appendChild(moodGrid);
  card.appendChild(moodWrap);

  card.appendChild(field(
    'Colori del logo / brand (se hai già un brand)',
    input('text', 'Es. rosso e nero, oppure #FF0000 e #000000', formData.coloriLogo, v => formData.coloriLogo = v),
    'Lascia vuoto se non hai ancora un brand definito.'
  ));

  card.appendChild(field(
    'Siti di riferimento che ti piacciono',
    textarea('Incolla qui URL di siti che ti piacciono come stile (anche di competitor o settori diversi)', formData.riferimenti, v => formData.riferimenti = v, 3),
    'Più esempi ci dai, più il risultato sarà vicino a quello che immagini.'
  ));

  card.appendChild(field(
    'Cosa NON vuoi nel sito',
    textarea('Es. niente sfondi scuri, niente animazioni eccessive, niente stock photo generiche…', formData.nonVuole, v => formData.nonVuole = v, 3),
    'I "no" sono utili quanto i "sì".'
  ));

  card.appendChild(field(
    'Note finali (qualsiasi altra cosa voglia dirci)',
    textarea('Tutto quello che non abbiamo chiesto ma che ritieni importante per il progetto…', formData.noteFinali, v => formData.noteFinali = v, 4)
  ));
}

/* ============================================================
   SUBMIT + STEP 9 — THANK YOU
   ============================================================ */
async function submitForm() {
  clearError();
  btnNext.disabled = true;
  btnNext.setAttribute('aria-busy', 'true');
  setButtonContent(btnNext, 'Invio in corso', 'arrow-right');

  const briefData = {
    ...formData,
    files: undefined, // i File object non sono serializzabili, li mandiamo separati
    orari: Object.entries(formData.orari).map(([day, v]) => ({
      giorno: day,
      apre:   v.chiuso ? null : v.apre,
      chiude: v.chiuso ? null : v.chiude,
      chiuso: v.chiuso,
    })),
    submittedAt: new Date().toISOString(),
    source: 'onboarding-wizard',
  };

  const fd = new FormData();
  fd.append('briefData', JSON.stringify(briefData));

  // Allega i file (File objects da step 4)
  for (const file of (formData.files || [])) {
    fd.append('file', file, file.name);
  }

  try {
    const res = await fetch('/api/submit-brief', {
      method: 'POST',
      body: fd,
      // Niente Content-Type header: il browser lo imposta automaticamente con il boundary corretto
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Il server non ha accettato il brief.');
    }
    goTo(9);
  } catch (err) {
    btnNext.disabled = false;
    btnNext.removeAttribute('aria-busy');
    setButtonContent(btnNext, 'Invia brief', 'check');
    showError('Non siamo riusciti a inviare il brief: ' + err.message + ' Riprova tra poco oppure contattaci su WhatsApp.');
    console.warn('Submit error:', err);
  }
}

function renderThankyou() {
  card.innerHTML = '';

  const pkg = { start: { label: 'Start', days: 5 },
                pro:   { label: 'Pro',   days: 7 },
                power: { label: 'Power', days: 10 } };
  const p = pkg[formData.pacchetto] || pkg.pro;

  function addWorkdays(date, days) {
    let d = new Date(date);
    let added = 0;
    while (added < days) {
      d.setDate(d.getDate() + 1);
      const dow = d.getDay();
      if (dow !== 0 && dow !== 6) added++;
    }
    return d;
  }
  const delivery = addWorkdays(new Date(), p.days);
  const deliveryStr = delivery.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });

  card.innerHTML = `
    <div style="text-align:center; padding: var(--sr-space-8) 0;">
      <div class="onboarding-hero-icon">${icon('shield-check')}</div>
      <h1 class="sr-h2" style="margin-bottom:var(--sr-space-4);">Brief ricevuto!</h1>
      <p class="sr-lead" style="margin-bottom:var(--sr-space-6); max-width:480px; margin-left:auto; margin-right:auto;">
        Grazie${formData.referente ? ', <strong>' + formData.referente + '</strong>' : ''}! Il team di Sitorazzo inizierà a lavorare il prossimo giorno lavorativo.
      </p>
      <div class="sr-card" style="display:inline-block; text-align:left; max-width:400px; width:100%; margin-bottom:var(--sr-space-8);">
        <p class="sr-eyebrow" style="margin-bottom:var(--sr-space-4);">Riepilogo ordine</p>
        <div style="display:flex; flex-direction:column; gap:var(--sr-space-3);">
          <div style="display:flex; justify-content:space-between;">
            <span class="text-sm" style="color:var(--sr-ink-70);">Attività</span>
            <span class="text-sm font-bold">${formData.nome || '—'}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span class="text-sm" style="color:var(--sr-ink-70);">Pacchetto</span>
            <span class="text-sm font-bold">${p.label}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span class="text-sm" style="color:var(--sr-ink-70);">Consegna stimata</span>
            <span class="text-sm font-bold" style="text-transform:capitalize;">${deliveryStr}</span>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span class="text-sm" style="color:var(--sr-ink-70);">Email conferma</span>
            <span class="text-sm font-bold">${formData.email || '—'}</span>
          </div>
        </div>
      </div>
      <p class="text-sm" style="color:var(--sr-ink-40); margin-bottom:var(--sr-space-4);">Hai domande? Scrivici su WhatsApp</p>
      <a href="https://wa.me/39NUMEROQUI?text=Ciao,%20ho%20appena%20inviato%20il%20brief%20per%20${encodeURIComponent(formData.nome || 'la mia attività')}"
         class="sr-btn sr-btn-ghost"
         target="_blank" rel="noopener noreferrer">
        ${icon('message')} Scrivici su WhatsApp
      </a>
    </div>
  `;
}

/* ---------- Init ---------- */
render();
