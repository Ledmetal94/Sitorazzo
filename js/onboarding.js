/* ============================================================
   SITORAZZO — ONBOARDING BRIEF WIZARD
   ============================================================ */

const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/XXXXXXXXXXXXXXXXXX';
const UPLOADCARE_PUBLIC_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXX';
const TOTAL_STEPS = 8;

/* ---------- State ---------- */
const params = new URLSearchParams(location.search);
const formData = {
  pacchetto:        params.get('pacchetto') || 'pro',
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
    btnNext.textContent = 'Invia brief ✓';
  } else {
    btnNext.textContent = 'Avanti →';
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
    el.style.cssText = 'color:var(--sr-alert);font-size:var(--sr-fs-sm);margin-top:var(--sr-space-3);';
    navBar.prepend(el);
  }
  el.textContent = msg;
}
function clearError() {
  const el = document.getElementById('form-error');
  if (el) el.textContent = '';
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

/* ---------- Validation ---------- */
function validate(step) {
  switch (step) {
    case 1:
      if (!formData.nome.trim())    return 'Inserisci il nome della tua attività.';
      if (!formData.settore)        return 'Seleziona il settore di attività.';
      if (!formData.citta.trim())   return 'Inserisci la città.';
      break;
    case 2:
      if (!formData.referente.trim()) return 'Inserisci il tuo nome.';
      if (!formData.email.trim())     return 'Inserisci la tua email.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Email non valida.';
      if (!formData.telefono.trim()) return 'Inserisci un numero di telefono.';
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
      <h1 class="sr-h2" style="margin-bottom:var(--sr-space-4);">Perfetto, ci siamo! 🚀</h1>
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
          <li class="text-sm">Approvazione + trasferimento credenziali → sei live</li>
        </ol>
      </div>
      <button class="sr-btn sr-btn-primary sr-btn-lg" id="btn-start">
        Inizia il brief →
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

  card.appendChild(field('Nome attività *', input('text', 'Es. Pizzeria Da Mario', formData.nome, v => formData.nome = v)));
  card.appendChild(field('Città *', input('text', 'Es. Latina', formData.citta, v => formData.citta = v)));

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

  card.appendChild(field('Il tuo nome *', input('text', 'Es. Mario Rossi', formData.referente, v => formData.referente = v)));

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

  card.appendChild(field('Email *', input('email', 'mario@esempio.it', formData.email, v => formData.email = v)));
  card.appendChild(field('Telefono *', input('tel', '+39 XXX XXX XXXX', formData.telefono, v => formData.telefono = v)));
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
    badge: '⚡ Più venduto',
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
            ${pkg.badge ? `<span class="sr-badge sr-badge-yellow" style="font-size:10px;">${pkg.badge}</span>` : ''}
          </div>
          <p class="text-sm" style="color:var(--sr-ink-70); margin:0;">${pkg.desc}</p>
          <p class="text-xs" style="color:var(--sr-ink-40); margin-top:4px;">Consegna in ${pkg.days} giorni lavorativi</p>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div class="sr-mono font-bold" style="font-size:var(--sr-fs-xl);">${pkg.price}</div>
          <div class="sr-badge ${formData.pacchetto === pkg.key ? 'sr-badge-ink' : 'sr-badge-warm'}" id="badge-${pkg.key}" style="margin-top:4px;">
            ${formData.pacchetto === pkg.key ? '✓ Selezionato' : 'Seleziona'}
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
          badge.textContent = p.key === pkg.key ? '✓ Selezionato' : 'Seleziona';
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

  const uploadWrap = document.createElement('div');
  uploadWrap.style.marginBottom = 'var(--sr-space-6)';
  const uploadLbl = document.createElement('label');
  uploadLbl.className = 'sr-label';
  uploadLbl.textContent = 'Carica file (logo, immagini, documenti)';
  uploadWrap.appendChild(uploadLbl);

  const hint = document.createElement('p');
  hint.style.cssText = 'font-size:var(--sr-fs-xs); color:var(--sr-ink-40); margin-bottom:var(--sr-space-3);';
  hint.textContent = 'Formati accettati: PNG, JPG, SVG, PDF, AI, ZIP. Max 100MB totali. Puoi caricare più file contemporaneamente.';
  uploadWrap.appendChild(hint);

  const ucInput = document.createElement('input');
  ucInput.type = 'hidden';
  ucInput.setAttribute('role', 'uploadcare-uploader');
  ucInput.setAttribute('data-public-key', UPLOADCARE_PUBLIC_KEY);
  ucInput.setAttribute('data-multiple', 'true');
  ucInput.setAttribute('data-multiple-max', '20');
  ucInput.setAttribute('data-images-only', 'false');
  ucInput.setAttribute('data-preview-step', 'true');
  uploadWrap.appendChild(ucInput);

  const fileList = document.createElement('div');
  fileList.id = 'file-list';
  fileList.style.marginTop = 'var(--sr-space-3)';
  if (formData.files.length) {
    fileList.innerHTML = formData.files.map(() =>
      `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px;">✓ File caricato</div>`
    ).join('');
  }
  uploadWrap.appendChild(fileList);
  card.appendChild(uploadWrap);

  requestAnimationFrame(() => {
    if (typeof uploadcare !== 'undefined') {
      const widget = uploadcare.Widget(ucInput);
      widget.onUploadComplete(info => {
        if (info.files) {
          info.files().then(files => {
            formData.files = files.map(f => f.cdnUrl);
            const fl = document.getElementById('file-list');
            if (fl) fl.innerHTML = formData.files.map(() =>
              `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px;">✓ File caricato</div>`
            ).join('');
          });
        } else {
          formData.files = [info.cdnUrl];
          const fl = document.getElementById('file-list');
          if (fl) fl.innerHTML = `<div class="text-sm" style="color:var(--sr-success);">✓ File caricato</div>`;
        }
      });
    }
  });

  card.insertAdjacentHTML('beforeend', `
    <p style="font-size:var(--sr-fs-xs); color:var(--sr-ink-40); margin-top:var(--sr-space-2);">
      Non hai file ora? Nessun problema — puoi saltare questo step. Ci contatteremo dopo per raccoglierli.
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
    row.style.cssText = 'display:flex; align-items:center; gap:var(--sr-space-3); margin-bottom:var(--sr-space-3); flex-wrap:wrap;';

    const dayLabel = document.createElement('span');
    dayLabel.style.cssText = 'font-size:var(--sr-fs-sm); font-weight:600; min-width:90px;';
    dayLabel.textContent = g.label;

    const toggle = document.createElement('div');
    toggle.className = 'toggle-chiuso' + (formData.orari[g.key].chiuso ? ' active' : '');
    toggle.title = 'Chiuso';

    const toggleLabel = document.createElement('span');
    toggleLabel.style.cssText = 'font-size:var(--sr-fs-xs); color:var(--sr-ink-40);';
    toggleLabel.textContent = formData.orari[g.key].chiuso ? 'Chiuso' : 'Aperto';

    const timeWrap = document.createElement('div');
    timeWrap.style.cssText = 'display:flex; align-items:center; gap:var(--sr-space-2); flex:1;' +
      (formData.orari[g.key].chiuso ? 'opacity:0.3; pointer-events:none;' : '');
    timeWrap.id = `time-wrap-${g.key}`;

    const makeTimeInput = (valKey) => {
      const inp = document.createElement('input');
      inp.type = 'time';
      inp.className = 'sr-input';
      inp.style.width = '120px';
      inp.value = formData.orari[g.key][valKey];
      inp.addEventListener('change', e => formData.orari[g.key][valKey] = e.target.value);
      return inp;
    };
    timeWrap.appendChild(makeTimeInput('apre'));
    timeWrap.insertAdjacentHTML('beforeend', '<span class="text-sm" style="color:var(--sr-ink-40);">→</span>');
    timeWrap.appendChild(makeTimeInput('chiude'));

    toggle.addEventListener('click', () => {
      formData.orari[g.key].chiuso = !formData.orari[g.key].chiuso;
      const isClosed = formData.orari[g.key].chiuso;
      toggle.classList.toggle('active', isClosed);
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
  { key: 'minimal',       label: 'Minimal',       emoji: '⬜', desc: 'Pulito, bianco, elegante' },
  { key: 'bold',          label: 'Bold',          emoji: '⬛', desc: 'Forte, scuro, impattante' },
  { key: 'caldo',         label: 'Caldo',         emoji: '🟡', desc: 'Colori saturi, amichevole' },
  { key: 'luxury',        label: 'Luxury',        emoji: '✨', desc: 'Sofisticato, premium' },
  { key: 'moderno',       label: 'Moderno',       emoji: '🟦', desc: 'Tech, dinamico, digitale' },
  { key: 'tradizionale',  label: 'Tradizionale',  emoji: '🟫', desc: 'Classico, affidabile' },
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
  moodGrid.style.cssText = 'display:grid; grid-template-columns:repeat(3,1fr); gap:var(--sr-space-3); margin-top:var(--sr-space-3);';
  MOODS.forEach(m => {
    const c = document.createElement('div');
    c.className = 'mood-card' + (formData.mood === m.key ? ' selected' : '');
    c.innerHTML = `
      <div style="font-size:2rem; margin-bottom:4px;">${m.emoji}</div>
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
  btnNext.disabled = true;
  btnNext.textContent = 'Invio in corso…';

  const payload = {
    ...formData,
    orari: Object.entries(formData.orari).map(([day, v]) => ({
      giorno: day,
      apre:   v.chiuso ? null : v.apre,
      chiude: v.chiuso ? null : v.chiude,
      chiuso: v.chiuso,
    })),
    submittedAt: new Date().toISOString(),
    source: 'onboarding-wizard',
  };

  try {
    const res = await fetch(MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error('HTTP ' + res.status);
    goTo(9);
  } catch (err) {
    btnNext.disabled = false;
    btnNext.textContent = 'Invia brief ✓';
    showError('Errore nell\'invio. Riprova o contattaci su WhatsApp.');
    console.error('Submit error:', err);
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
      <div style="font-size:4rem; margin-bottom:var(--sr-space-4);">🚀</div>
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
        💬 Scrivici su WhatsApp
      </a>
    </div>
  `;
}

/* ---------- Init ---------- */
render();
