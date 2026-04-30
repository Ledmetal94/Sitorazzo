# Sitorazzo — Piano B: Onboarding Brief Form

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wizard post-pagamento a 9 step (`onboarding.html`) che raccoglie il brief del cliente e lo invia ad Airtable via Make.com webhook, con upload file su Uploadcare.

**Architecture:** HTML statico + Vanilla JS. Nessun framework. State centralizzato in un oggetto `formData`, rendering dichiarativo: ogni `render()` disegna solo lo step corrente. Il pacchetto è pre-selezionato dalla query string `?pacchetto=pro|start|power` impostata da Stripe dopo il pagamento. Submit via POST a webhook Make.com (no backend proprio).

**Tech Stack:** HTML statico, Vanilla JS ES6+, tokens.css + components.css brand, Uploadcare (file upload CDN), Make.com webhook → Airtable, Resend (email conferma via Make), Vercel (deploy).

---

## File Map

| File | Azione | Responsabilità |
|------|--------|----------------|
| `onboarding.html` | Crea | Shell wizard: topbar, progress bar, form card |
| `js/onboarding.js` | Crea | State, render, validazione, step navigation, submit |
| `grazie.html` | Crea | Thank-you page post-submit (riepilogo ordine) |

---

## Costanti da configurare prima dell'esecuzione

Prima di iniziare, inserire questi valori reali in `js/onboarding.js`:

```js
const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/XXXXXXXXXXXXXXXXXX'; // webhook Make.com
const UPLOADCARE_PUBLIC_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXX';                  // Uploadcare dashboard
```

---

## Task 1: Shell HTML onboarding.html

**Files:**
- Create: `onboarding.html`

- [ ] **Step 1.1: Crea `onboarding.html` con head e shell**

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brief — Sitorazzo</title>
  <meta name="robots" content="noindex, nofollow">

  <!-- Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

  <!-- CSS brand -->
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/main.css">

  <!-- Uploadcare widget -->
  <script src="https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js"></script>
  <script>UPLOADCARE_PUBLIC_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXX';</script>

  <style>
    /* Progress bar */
    #progress-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 4px;
      background: var(--sr-yellow);
      transition: width 0.4s var(--sr-ease-out);
      z-index: var(--sr-z-sticky);
    }
    /* Topbar */
    #topbar {
      position: fixed;
      top: 4px;
      left: 0;
      right: 0;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--sr-space-6);
      background: var(--sr-paper);
      border-bottom: var(--sr-border-thin);
      z-index: var(--sr-z-sticky);
    }
    /* Form area */
    #form-area {
      min-height: 100vh;
      padding: 108px var(--sr-space-6) 80px;
    }
    #step-card {
      max-width: 640px;
      margin: 0 auto;
    }
    /* Pill selezionabili (settore, mood, pacchetto) */
    .pill-option {
      display: inline-flex;
      align-items: center;
      padding: var(--sr-space-2) var(--sr-space-4);
      border-radius: var(--sr-radius-full);
      border: 2px solid var(--sr-border);
      font-family: var(--sr-font-body);
      font-size: var(--sr-fs-sm);
      font-weight: var(--sr-fw-medium);
      cursor: pointer;
      transition: border-color var(--sr-duration-fast) var(--sr-ease-out),
                  background var(--sr-duration-fast) var(--sr-ease-out),
                  color var(--sr-duration-fast) var(--sr-ease-out);
      user-select: none;
    }
    .pill-option.selected {
      border-color: var(--sr-ink);
      background: var(--sr-ink);
      color: var(--sr-paper);
    }
    /* Card pacchetto selezionabile */
    .pkg-card {
      border: 2px solid var(--sr-border);
      border-radius: var(--sr-radius-xl);
      padding: var(--sr-space-6);
      cursor: pointer;
      transition: border-color var(--sr-duration-fast) var(--sr-ease-out),
                  background var(--sr-duration-fast) var(--sr-ease-out);
    }
    .pkg-card.selected {
      border-color: var(--sr-ink);
      background: var(--sr-warm);
    }
    /* Drag & drop zone */
    #drop-zone {
      border: 2px dashed var(--sr-border);
      border-radius: var(--sr-radius-xl);
      padding: var(--sr-space-12) var(--sr-space-8);
      text-align: center;
      transition: border-color var(--sr-duration-fast) var(--sr-ease-out),
                  background var(--sr-duration-fast) var(--sr-ease-out);
      cursor: pointer;
    }
    #drop-zone.drag-over {
      border-color: var(--sr-yellow);
      background: var(--sr-yellow-10);
    }
    /* Mood card */
    .mood-card {
      border: 2px solid var(--sr-border);
      border-radius: var(--sr-radius-lg);
      padding: var(--sr-space-4);
      cursor: pointer;
      text-align: center;
      transition: border-color var(--sr-duration-fast) var(--sr-ease-out),
                  background var(--sr-duration-fast) var(--sr-ease-out);
    }
    .mood-card.selected {
      border-color: var(--sr-ink);
      background: var(--sr-warm);
    }
    /* Toggle chiuso/aperto (orari) */
    .toggle-chiuso {
      position: relative;
      width: 44px;
      height: 24px;
      border-radius: var(--sr-radius-full);
      background: var(--sr-border);
      cursor: pointer;
      transition: background var(--sr-duration-fast) var(--sr-ease-out);
      flex-shrink: 0;
    }
    .toggle-chiuso.active { background: var(--sr-alert); }
    .toggle-chiuso::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: white;
      transition: transform var(--sr-duration-fast) var(--sr-ease-out);
      box-shadow: var(--sr-shadow-xs);
    }
    .toggle-chiuso.active::after { transform: translateX(20px); }
    /* Nav buttons fissi in fondo */
    #nav-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      padding: var(--sr-space-4) var(--sr-space-6);
      background: var(--sr-paper);
      border-top: var(--sr-border-thin);
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--sr-space-4);
      z-index: var(--sr-z-sticky);
    }
  </style>
</head>
<body>
  <!-- Progress bar -->
  <div id="progress-bar" style="width: 0%;"></div>

  <!-- Topbar -->
  <div id="topbar">
    <a href="/" aria-label="Sitorazzo home">
      <img src="/assets/Sitorazzo_Lockup_OnWarmWhite.png" alt="Sitorazzo" style="height:28px; width:auto;">
    </a>
    <div id="step-indicator" class="sr-mono text-sm" style="color: var(--sr-ink-40);"></div>
  </div>

  <!-- Form area -->
  <div id="form-area">
    <div id="step-card">
      <!-- Renderizzato da onboarding.js -->
    </div>
  </div>

  <!-- Nav bar (Indietro / Avanti) -->
  <div id="nav-bar">
    <button id="btn-back" class="sr-btn sr-btn-ghost" style="visibility:hidden;">← Indietro</button>
    <div id="nav-right" class="flex items-center gap-3">
      <span id="nav-step-text" class="text-sm" style="color:var(--sr-ink-40);"></span>
      <button id="btn-next" class="sr-btn sr-btn-primary">Avanti →</button>
    </div>
  </div>

  <script src="/js/onboarding.js"></script>
</body>
</html>
```

- [ ] **Step 1.2: Build CSS**

```bash
npm run build
```

Atteso: nessun errore.

- [ ] **Step 1.3: Commit**

```bash
git add onboarding.html
git commit -m "feat: shell onboarding.html topbar + progress bar + layout"
```

---

## Task 2: State management + navigation core

**Files:**
- Create: `js/onboarding.js`

- [ ] **Step 2.1: Crea `js/onboarding.js` con state e navigation**

```js
/* ============================================================
   SITORAZZO — ONBOARDING BRIEF WIZARD
   ============================================================ */

const MAKE_WEBHOOK_URL = 'https://hook.eu2.make.com/XXXXXXXXXXXXXXXXXX';
const UPLOADCARE_PUBLIC_KEY = 'XXXXXXXXXXXXXXXXXXXXXXXX';
const TOTAL_STEPS = 8; // step 1-8 (step 0 = welcome, step 9 = thankyou)

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
  files:            [],          // array di URL Uploadcare
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
  // Progress bar: 0 su welcome, 100 su thankyou, proporzionale nei form steps
  const pct = currentStep === 0 ? 0
            : currentStep === 9 ? 100
            : Math.round((currentStep / TOTAL_STEPS) * 100);
  progressBar.style.width = pct + '%';

  // Step indicator
  if (currentStep >= 1 && currentStep <= TOTAL_STEPS) {
    stepIndicator.textContent = `Step ${currentStep} di ${TOTAL_STEPS}`;
    navStepText.textContent   = `${currentStep}/${TOTAL_STEPS}`;
  } else {
    stepIndicator.textContent = '';
    navStepText.textContent   = '';
  }

  // Back button
  btnBack.style.visibility = currentStep <= 1 ? 'hidden' : 'visible';

  // Nav bar hidden su welcome e thankyou
  navBar.style.display = (currentStep === 0 || currentStep === 9) ? 'none' : 'flex';

  // Next button label
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
    case 0: renderWelcome();       break;
    case 1: renderStep1();         break;
    case 2: renderStep2();         break;
    case 3: renderStep3();         break;
    case 4: renderStep4();         break;
    case 5: renderStep5();         break;
    case 6: renderStep6();         break;
    case 7: renderStep7();         break;
    case 8: renderStep8();         break;
    case 9: renderThankyou();      break;
  }
}

/* ---------- Helpers ---------- */
function h(tag, attrs, ...children) {
  const el = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === 'class') el.className = v;
    else if (k === 'style') el.style.cssText = v;
    else el.setAttribute(k, v);
  });
  children.flat().forEach(c => {
    if (typeof c === 'string') el.insertAdjacentHTML('beforeend', c);
    else if (c) el.appendChild(c);
  });
  return el;
}

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

function textarea(placeholder, value, onchange, rows = 4) {
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

/* ---------- Init ---------- */
render();
```

- [ ] **Step 2.2: Verifica shell**

Apri `onboarding.html` nel browser. La pagina deve caricarsi senza errori JS nella console. Il card centrale è vuoto (le funzioni render step non esistono ancora), ma la struttura topbar + progress bar + nav bar è visibile.

- [ ] **Step 2.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: onboarding state management, navigation, validation core"
```

---

## Task 3: Step 0 — Welcome screen

**Files:**
- Modify: `js/onboarding.js` (aggiungere dopo `function validate()`)

- [ ] **Step 3.1: Aggiungi `renderWelcome()` in `js/onboarding.js`**

Inserire prima della riga `/* ---------- Init ---------- */`:

```js
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
```

- [ ] **Step 3.2: Verifica**

Ricarica `onboarding.html`. La welcome screen deve mostrare logo, titolo, il nome del pacchetto letto da `?pacchetto=pro`, la lista dei passi e il pulsante "Inizia il brief". Cliccarlo deve portare allo step 1 (card vuota, le render step arrivano nei task seguenti).

- [ ] **Step 3.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 0 welcome screen con pacchetto da URL"
```

---

## Task 4: Step 1 — La tua attività

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 4.1: Aggiungi `renderStep1()` in `js/onboarding.js`**

Inserire prima di `/* ---------- Init ---------- */`:

```js
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

  // Settore pills
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
```

- [ ] **Step 4.2: Verifica**

Naviga a step 1. Deve mostrare i campi Nome, Città, le pills dei settori (click seleziona con sfondo nero), textarea descrizione. Compilare e cliccare "Avanti" senza settore deve mostrare errore. Con settore deve avanzare a step 2 (ancora vuoto).

- [ ] **Step 4.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 1 attività con pills settore e validazione"
```

---

## Task 5: Step 2 — I tuoi contatti

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 5.1: Aggiungi `renderStep2()` in `js/onboarding.js`**

```js
/* ============================================================
   STEP 2 — I TUOI CONTATTI
   ============================================================ */
function renderStep2() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 2 di 8', 'I tuoi contatti', 'Chi gestiamo il progetto? Usiamo questi dati solo per comunicare con te.'));

  card.appendChild(field('Il tuo nome *', input('text', 'Es. Mario Rossi', formData.referente, v => formData.referente = v)));

  // Ruolo pills
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
```

- [ ] **Step 5.2: Verifica**

Step 2 mostra campi nome, ruolo (pills), email, telefono, WhatsApp. Click "Avanti" senza email mostra errore. Con email non valida mostra "Email non valida". Con tutto compilato avanza a step 3.

- [ ] **Step 5.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 2 contatti con validazione email e telefono"
```

---

## Task 6: Step 3 — Il tuo pacchetto

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 6.1: Aggiungi `renderStep3()` in `js/onboarding.js`**

```js
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
```

- [ ] **Step 6.2: Verifica**

Step 3 mostra 3 card pacchetto. La card corrispondente a `?pacchetto=pro` è pre-selezionata (bordo scuro, badge "✓ Selezionato"). Clic su altra card cambia selezione.

- [ ] **Step 6.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 3 selezione pacchetto pre-selezionato da URL Stripe"
```

---

## Task 7: Step 4 — Logo e immagini

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 7.1: Aggiungi `renderStep4()` in `js/onboarding.js`**

```js
/* ============================================================
   STEP 4 — LOGO E IMMAGINI
   ============================================================ */
function renderStep4() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 4 di 8', 'Logo e immagini', 'Carica il tuo logo e le immagini che vuoi usare nel sito.'));

  // Status logo pills
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

  // Uploadcare widget
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

  // Uploadcare input (il widget gestisce l'UI)
  const ucInput = document.createElement('input');
  ucInput.type = 'hidden';
  ucInput.setAttribute('role', 'uploadcare-uploader');
  ucInput.setAttribute('data-public-key', UPLOADCARE_PUBLIC_KEY);
  ucInput.setAttribute('data-multiple', 'true');
  ucInput.setAttribute('data-multiple-max', '20');
  ucInput.setAttribute('data-images-only', 'false');
  ucInput.setAttribute('data-preview-step', 'true');
  uploadWrap.appendChild(ucInput);

  // File list display
  const fileList = document.createElement('div');
  fileList.id = 'file-list';
  fileList.style.marginTop = 'var(--sr-space-3)';
  if (formData.files.length) {
    fileList.innerHTML = formData.files.map(url =>
      `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px;">✓ ${url}</div>`
    ).join('');
  }
  uploadWrap.appendChild(fileList);
  card.appendChild(uploadWrap);

  // Init Uploadcare widget after DOM insertion
  requestAnimationFrame(() => {
    if (typeof uploadcare !== 'undefined') {
      const widget = uploadcare.Widget(ucInput);
      widget.onUploadComplete(info => {
        if (info.files) {
          // Multiple files group
          info.files().then(files => {
            formData.files = files.map(f => f.cdnUrl);
            const fl = document.getElementById('file-list');
            if (fl) fl.innerHTML = formData.files.map(url =>
              `<div class="text-sm" style="color:var(--sr-success); margin-bottom:4px;">✓ File caricato</div>`
            ).join('');
          });
        } else {
          // Single file
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
```

- [ ] **Step 7.2: Verifica**

Step 4 mostra pills "Hai già un logo?" e il widget Uploadcare (se `UPLOADCARE_PUBLIC_KEY` è configurato). Cliccare "Avanti" senza caricare file deve funzionare (step opzionale).

- [ ] **Step 7.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 4 upload logo e immagini via Uploadcare"
```

---

## Task 8: Step 5 — Dominio e URL

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 8.1: Aggiungi `renderStep5()` in `js/onboarding.js`**

```js
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

  // Stato dominio pills
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

  // Sito esistente pills
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
      // Mostra/nascondi campo URL
      const urlField = document.getElementById('url-esistente-wrap');
      if (urlField) urlField.style.display = opt === 'Sì' ? 'block' : 'none';
    });
    sitoEsPills.appendChild(pill);
  });
  sitoEsWrap.appendChild(sitoEsPills);
  card.appendChild(sitoEsWrap);

  // URL sito esistente (condizionale)
  const urlWrap = field(
    'URL sito esistente',
    input('url', 'https://www.esempio.it', formData.sitoUrl, v => formData.sitoUrl = v),
    'Ci aiuta a capire cosa tenere e cosa migliorare.'
  );
  urlWrap.id = 'url-esistente-wrap';
  urlWrap.style.display = formData.sitoEsistente === 'Sì' ? 'block' : 'none';
  card.appendChild(urlWrap);
}
```

- [ ] **Step 8.2: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 5 dominio e sito esistente con campo condizionale"
```

---

## Task 9: Step 6 — Social

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 9.1: Aggiungi `renderStep6()` in `js/onboarding.js`**

```js
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

  // Visibilità social pills
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
```

- [ ] **Step 9.2: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 6 social links e visibilità"
```

---

## Task 10: Step 7 — Sede e orari

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 10.1: Aggiungi `renderStep7()` in `js/onboarding.js`**

```js
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

  // Tipo sede pills
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

  // Orari
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
```

- [ ] **Step 10.2: Verifica**

Step 7 mostra indirizzo, tipo sede pills, e la tabella orari con toggle. Sabato e domenica pre-impostati come Chiuso (toggle attivo, campi ora grigi). Clic sul toggle alterna aperto/chiuso.

- [ ] **Step 10.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 7 sede e orari con toggle chiuso per giorno"
```

---

## Task 11: Step 8 — Stile e preferenze

**Files:**
- Modify: `js/onboarding.js`

- [ ] **Step 11.1: Aggiungi `renderStep8()` in `js/onboarding.js`**

```js
/* ============================================================
   STEP 8 — STILE E PREFERENZE
   ============================================================ */
const MOODS = [
  { key: 'minimal',    label: 'Minimal',    emoji: '⬜', desc: 'Pulito, bianco, elegante' },
  { key: 'bold',       label: 'Bold',       emoji: '⬛', desc: 'Forte, scuro, impattante' },
  { key: 'caldo',      label: 'Caldo',      emoji: '🟡', desc: 'Colori saturi, amichevole' },
  { key: 'luxury',     label: 'Luxury',     emoji: '✨', desc: 'Sofisticato, premium' },
  { key: 'moderno',    label: 'Moderno',    emoji: '🟦', desc: 'Tech, dinamico, digitale' },
  { key: 'tradizionale', label: 'Tradizionale', emoji: '🟫', desc: 'Classico, affidabile' },
];

function renderStep8() {
  card.innerHTML = '';
  card.appendChild(stepHeader('Step 8 di 8', 'Stile e preferenze', 'Aiutaci a capire il tono visivo che vuoi per il tuo sito.'));

  // Mood grid
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
```

- [ ] **Step 11.2: Verifica**

Step 8 mostra la griglia 3×2 di mood card (click seleziona), campi colori, riferimenti, no-list, note finali. Click "Invia brief" senza mood deve mostrare errore di validazione.

- [ ] **Step 11.3: Commit**

```bash
git add js/onboarding.js
git commit -m "feat: step 8 stile mood card e preferenze visive"
```

---

## Task 12: Submit + Step 9 Thank You

**Files:**
- Modify: `js/onboarding.js`
- Create: `grazie.html`

- [ ] **Step 12.1: Aggiungi `submitForm()` e `renderThankyou()` in `js/onboarding.js`**

Inserire prima di `/* ---------- Init ---------- */`:

```js
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
  card.appendChild(stepHeader('', ''));

  const pkg = { start: { label: 'Start', days: 5 },
                pro:   { label: 'Pro',   days: 7 },
                power: { label: 'Power', days: 10 } };
  const p = pkg[formData.pacchetto] || pkg.pro;

  // Calcola data consegna stimata (giorni lavorativi da oggi)
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
        Grazie ${formData.referente ? ', <strong>' + formData.referente + '</strong>' : ''}! Il team di Sitorazzo inizierà a lavorare il prossimo giorno lavorativo.
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
```

- [ ] **Step 12.2: Verifica flusso completo**

1. Apri `onboarding.html?pacchetto=pro`
2. Step 0 → Inizia → compila step 1-8
3. Step 8 → "Invia brief" (con webhook URL reale configurato): deve mostrare step 9 thank you con nome attività, pacchetto, data stimata
4. Se webhook non configurato: verificare che l'errore sia catturato e mostri il messaggio di errore in nav bar (non crash)

- [ ] **Step 12.3: Crea `grazie.html`** (redirect post-pagamento Stripe, prima del wizard)

```html
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Grazie — Sitorazzo</title>
  <meta name="robots" content="noindex, nofollow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/tokens.css">
  <link rel="stylesheet" href="/css/components.css">
  <link rel="stylesheet" href="/css/main.css">
  <!-- Meta Pixel Purchase -->
  <script>
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', 'PIXEL_ID_QUI');
    fbq('track', 'PageView');
    // Legge pacchetto da URL per il Purchase event
    const pkg = new URLSearchParams(location.search).get('pacchetto') || 'pro';
    const prices = { start: 390, pro: 590, power: 1290 };
    fbq('track', 'Purchase', { value: prices[pkg] || 590, currency: 'EUR', content_name: 'Sitorazzo ' + pkg });
    if (typeof gtag !== 'undefined') gtag('event', 'purchase', { value: prices[pkg] || 590, currency: 'EUR' });
  </script>
</head>
<body>
  <div style="min-height:100vh; display:flex; align-items:center; justify-content:center; padding: var(--sr-space-8) var(--sr-space-6);">
    <div style="text-align:center; max-width:560px;">
      <div style="font-size:4rem; margin-bottom:var(--sr-space-4);">🎉</div>
      <h1 class="sr-h2" style="margin-bottom:var(--sr-space-4);">Pagamento confermato!</h1>
      <p class="sr-lead" style="margin-bottom:var(--sr-space-8);">Perfetto. Ora compila il brief — ci vogliono solo 10–15 minuti. Raccoglieremo tutto quello che ci serve per costruire il tuo sito.</p>
      <script>
        // Redirect automatico al wizard con pacchetto
        const pkgParam = new URLSearchParams(location.search).get('pacchetto') || 'pro';
        document.write(`<a href="/onboarding?pacchetto=${pkgParam}" class="sr-btn sr-btn-primary sr-btn-lg">Compila il brief ora →</a>`);
      </script>
      <p style="margin-top:var(--sr-space-4); font-size:var(--sr-fs-xs); color:var(--sr-ink-40);">
        Hai già ricevuto la ricevuta di pagamento via email da Stripe.
      </p>
    </div>
  </div>
  <link rel="stylesheet" href="/css/main.css">
</body>
</html>
```

- [ ] **Step 12.4: Commit**

```bash
git add js/onboarding.js grazie.html
git commit -m "feat: submit webhook Make.com, step 9 thank you, grazie.html post-pagamento"
```

---

## Task 13: QA flusso completo + deploy

**Files:**
- Nessuna modifica — test e deploy

- [ ] **Step 13.1: Test flusso completo end-to-end**

Checklist manuale:

- [ ] `?pacchetto=start` → card pro welcome mostra "Start / 390€ / 5 giorni"
- [ ] `?pacchetto=power` → card pro welcome mostra "Power / 1.290€ / 10 giorni"
- [ ] Step 1: "Avanti" senza nome → errore "Inserisci il nome"
- [ ] Step 1: "Avanti" senza settore → errore "Seleziona il settore"
- [ ] Step 2: email non valida → errore "Email non valida"
- [ ] Step 4: "Avanti" senza file → ok (step opzionale)
- [ ] Step 7: toggle chiuso/aperto funziona, campi ora si griggiano
- [ ] Step 8: "Invia brief" senza mood → errore "Seleziona lo stile"
- [ ] Pulsante "← Indietro" assente su step 1, visibile da step 2 in poi
- [ ] Barra progress avanza da 0% (step 0) a 100% (step 9)
- [ ] Step indicator mostra "Step N di 8" nella topbar

- [ ] **Step 13.2: Test mobile**

DevTools → iPhone 14 (390px).
- [ ] Form card non fuoriesce
- [ ] Pills a capo su più righe
- [ ] Nav bar (Indietro/Avanti) non copre il contenuto
- [ ] Orari: campi time e toggle su righe leggibili

- [ ] **Step 13.3: Build + push**

```bash
npm run build
git add css/main.css
git commit -m "chore: css minificato per deploy"
git push origin main
```

Vercel farà auto-deploy. Verificare su preview URL:
- `/onboarding?pacchetto=pro` funzionante
- `/grazie?pacchetto=pro` funzionante
- CSS caricato correttamente

- [ ] **Step 13.4: Configura webhook Make.com**

1. Make.com → Crea scenario → "Custom Webhook"
2. Copia URL webhook → incolla in `js/onboarding.js` → `MAKE_WEBHOOK_URL`
3. Aggiungi modulo Airtable → "Create Record" con mapping campi `formData`
4. Aggiungi modulo Resend (o Gmail) → email conferma al cliente con riepilogo ordine
5. Attiva scenario
6. Test: invia brief reale → verifica record Airtable + email ricevuta

- [ ] **Step 13.5: Commit finale**

```bash
git add js/onboarding.js
git commit -m "config: webhook Make.com e Uploadcare key configurati"
git tag v1.1.0-onboarding
git push origin --tags
```

---

## Checklist Sprint 3 (Onboarding)

- [ ] `onboarding.html` shell con topbar, progress bar, nav bar, CSS inline
- [ ] `js/onboarding.js` state `formData` con tutti i campi
- [ ] Navigation: `goTo()`, `updateChrome()`, progress bar proporzionale
- [ ] Validation: step 1 (nome, settore, città), step 2 (email, telefono), step 8 (mood)
- [ ] Step 0: welcome con pacchetto letto da `?pacchetto=`
- [ ] Step 1: attività + pills settore
- [ ] Step 2: contatti + pills ruolo + validazione email
- [ ] Step 3: selezione pacchetto pre-selezionato
- [ ] Step 4: upload Uploadcare multi-file
- [ ] Step 5: dominio + campo URL condizionale
- [ ] Step 6: social links + visibilità
- [ ] Step 7: indirizzo + orari con toggle chiuso
- [ ] Step 8: mood card grid + preferenze + validazione
- [ ] Step 9: thank you con riepilogo e data stimata
- [ ] `submitForm()`: POST Make.com webhook con error handling
- [ ] `grazie.html`: post-pagamento Stripe con Meta Pixel Purchase
- [ ] Test mobile 390px
- [ ] Webhook Make.com → Airtable configurato e testato
- [ ] Uploadcare public key configurata
- [ ] Deploy Vercel funzionante
