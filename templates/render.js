/**
 * Mockup renderer. Takes a KV record and returns a full HTML document.
 * Day 2: structural templates with industry-default copy.
 * Day 3: AI-generated copy will override `record.copy`.
 */

/* ------------------------------------------------------------------ */
/*  Helpers                                                              */
/* ------------------------------------------------------------------ */
function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pickReadableTextColor(hex) {
  const c = (hex || '#FFD60A').replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? '#0A0A0A' : '#FFFFFF';
}

/* ------------------------------------------------------------------ */
/*  Industry profiles — fallback copy when AI copy isn't ready yet      */
/* ------------------------------------------------------------------ */
const INDUSTRY_PROFILES = {
  'ristoranti': {
    label: 'Ristorante',
    eyebrow: 'Cucina italiana · Specialità della casa',
    headline: (name) => `Benvenuti da ${name}`,
    sub: 'Una cucina che racconta storie. Prenota il tuo tavolo o sfoglia il menù del giorno.',
    ctaPrimary: 'Prenota un tavolo',
    ctaSecondary: 'Vedi il menù',
    services: [
      { icon: '🍝', title: 'Cucina del territorio', body: 'Materie prime selezionate, ricette di famiglia, sapori autentici.' },
      { icon: '🍷', title: 'Cantina e vini', body: 'Una selezione curata di etichette italiane per ogni piatto.' },
      { icon: '🎉', title: 'Eventi privati', body: 'Compleanni, anniversari, cene di lavoro. Ti aiutiamo a organizzarli.' },
    ],
    contactLabel: 'Vieni a trovarci',
    hoursPlaceholder: 'Mar–Dom · 12:30–14:30 · 19:30–23:00',
  },
  'parrucchieri-estetiste': {
    label: 'Beauty & Wellness',
    eyebrow: 'Salone · Centro estetico',
    headline: (name) => `${name}, il tuo momento di bellezza`,
    sub: 'Servizi su misura, prodotti professionali, un ambiente che ti coccola dal primo all\'ultimo minuto.',
    ctaPrimary: 'Prenota online',
    ctaSecondary: 'Scopri i servizi',
    services: [
      { icon: '✂️', title: 'Taglio & piega', body: 'Lo stile che ti rappresenta, sempre fresco, sempre tuo.' },
      { icon: '🌿', title: 'Trattamenti viso & corpo', body: 'Programmi personalizzati con prodotti professionali.' },
      { icon: '💅', title: 'Manicure & pedicure', body: 'Cura delle mani e dei piedi, pausa rigenerante garantita.' },
    ],
    contactLabel: 'Trovaci facilmente',
    hoursPlaceholder: 'Mar–Sab · 9:00–19:00',
  },
  'artigiani': {
    label: 'Artigiano · Servizio professionale',
    eyebrow: 'Pronto intervento · Preventivi gratuiti',
    headline: (name) => `${name} — esperienza al tuo servizio`,
    sub: 'Interventi rapidi, lavoro a regola d\'arte, prezzo onesto. Da noi nessuna sorpresa.',
    ctaPrimary: 'Richiedi preventivo',
    ctaSecondary: 'Chiamaci subito',
    services: [
      { icon: '🔧', title: 'Pronto intervento', body: 'Disponibili anche nei weekend per emergenze e urgenze.' },
      { icon: '📋', title: 'Preventivi gratuiti', body: 'Sopralluogo gratuito e preventivo trasparente, sempre per iscritto.' },
      { icon: '✅', title: 'Garanzia sul lavoro', body: 'Se qualcosa non va, torniamo. Lavoro garantito 12 mesi.' },
    ],
    contactLabel: 'Chiamaci o scrivici',
    hoursPlaceholder: 'Lun–Ven · 8:00–19:00 · Reperibilità 24/7',
  },
  'professionisti': {
    label: 'Studio professionale',
    eyebrow: 'Consulenza · Assistenza · Affidabilità',
    headline: (name) => `${name}: competenza al tuo fianco`,
    sub: 'Anni di esperienza al servizio dei tuoi obiettivi. Trasparenza, riservatezza, risultati concreti.',
    ctaPrimary: 'Prenota una consulenza',
    ctaSecondary: 'Scopri di più',
    services: [
      { icon: '📑', title: 'Consulenza specialistica', body: 'Un punto di riferimento esperto per le tue decisioni.' },
      { icon: '🤝', title: 'Assistenza dedicata', body: 'Ti seguiamo passo dopo passo, senza tempi morti.' },
      { icon: '🔒', title: 'Riservatezza totale', body: 'I tuoi dati e i tuoi interessi al sicuro, sempre.' },
    ],
    contactLabel: 'Vieni in studio',
    hoursPlaceholder: 'Lun–Ven · 9:00–13:00 · 15:00–19:00',
  },
  'generico': {
    label: 'La tua attività',
    eyebrow: 'Qualità · Esperienza · Servizio',
    headline: (name) => `Benvenuto da ${name}`,
    sub: 'Una realtà nata per offrirti il meglio. Scopri chi siamo e cosa possiamo fare per te.',
    ctaPrimary: 'Contattaci',
    ctaSecondary: 'Scopri di più',
    services: [
      { icon: '⭐', title: 'Qualità garantita', body: 'Standard elevati, attenzione al dettaglio, soddisfazione del cliente.' },
      { icon: '🤝', title: 'Servizio dedicato', body: 'Ti ascoltiamo, capiamo le tue esigenze, ti offriamo soluzioni su misura.' },
      { icon: '📍', title: 'Vicini a te', body: 'Una realtà locale, con la passione e la cura del territorio.' },
    ],
    contactLabel: 'Vieni a trovarci',
    hoursPlaceholder: 'Lun–Sab · 9:00–19:00',
  },
};

function getIndustryProfile(industry) {
  return INDUSTRY_PROFILES[industry] || INDUSTRY_PROFILES.generico;
}

/**
 * Merge AI-generated copy (when present) into the structural industry profile.
 * AI copy is validated upstream in lib/anthropic.js — but we still defensively
 * fall through to industry defaults per-field in case of partial data.
 */
function applyCopy(profile, copy, businessName) {
  if (!copy) {
    return {
      ...profile,
      headline: profile.headline(businessName),
      eyebrow: profile.eyebrow,
      sub: profile.sub,
      ctaPrimary: profile.ctaPrimary,
      ctaSecondary: profile.ctaSecondary,
      services: profile.services,
    };
  }
  return {
    ...profile,
    headline: copy.headline || profile.headline(businessName),
    eyebrow: profile.eyebrow,
    sub: copy.sub || profile.sub,
    ctaPrimary: copy.ctaPrimary || profile.ctaPrimary,
    ctaSecondary: copy.ctaSecondary || profile.ctaSecondary,
    services: Array.isArray(copy.services) && copy.services.length === 3
      ? profile.services.map((s, i) => ({
          icon: s.icon, // keep industry emoji
          title: copy.services[i]?.title || s.title,
          body: copy.services[i]?.body || s.body,
        }))
      : profile.services,
  };
}

/* ------------------------------------------------------------------ */
/*  Section builders                                                     */
/* ------------------------------------------------------------------ */
function renderHero({ businessName, profile, primary, textOnPrimary, logoUrl }) {
  const headline = profile.headline;
  return `
<section class="mk-hero" style="position:relative; overflow:hidden; padding:160px 24px 100px; background:#fff;">
  <div style="position:absolute; inset:0; background:radial-gradient(ellipse at 80% 20%, ${primary}33 0%, transparent 60%); pointer-events:none;"></div>
  <div style="position:relative; max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;">
    <div>
      <span style="display:inline-flex; align-items:center; gap:8px; font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${primary}; background:${primary}1A; padding:6px 14px; border-radius:9999px; margin-bottom:20px;">
        ${esc(profile.eyebrow)}
      </span>
      <h1 style="font-family:'Space Grotesk','Inter',sans-serif; font-weight:900; font-size:clamp(40px, 5.5vw, 68px); line-height:1.04; letter-spacing:-0.03em; margin:0 0 20px; color:#0A0A0A;">
        ${esc(headline)}
      </h1>
      <p style="font-family:'Inter',sans-serif; font-size:18px; line-height:1.6; color:rgba(10,10,10,0.7); margin:0 0 36px; max-width:520px;">
        ${esc(profile.sub)}
      </p>
      <div style="display:flex; gap:12px; flex-wrap:wrap;">
        <a href="#contatti" style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; background:${primary}; color:${textOnPrimary}; padding:16px 28px; border-radius:14px; text-decoration:none; display:inline-flex; align-items:center; gap:8px; min-height:54px;">
          ${esc(profile.ctaPrimary)} →
        </a>
        <a href="#servizi" style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; background:transparent; color:#0A0A0A; padding:16px 28px; border-radius:14px; text-decoration:none; border:1.5px solid rgba(10,10,10,0.15); display:inline-flex; align-items:center; min-height:54px;">
          ${esc(profile.ctaSecondary)}
        </a>
      </div>
    </div>
    <div style="position:relative; min-height:380px; display:flex; align-items:center; justify-content:center;">
      <div style="position:absolute; inset:0; background:${primary}; border-radius:32px; transform:rotate(-3deg);"></div>
      <div style="position:relative; background:#fff; border-radius:24px; padding:48px; box-shadow:0 24px 60px rgba(10,10,10,0.18); width:100%; max-width:380px; text-align:center;">
        ${logoUrl
          ? `<img src="${esc(logoUrl)}" alt="${esc(businessName)} logo" style="max-width:200px; max-height:120px; margin:0 auto 16px; display:block;">`
          : `<div style="width:88px; height:88px; border-radius:24px; background:${primary}; color:${textOnPrimary}; display:flex; align-items:center; justify-content:center; margin:0 auto 16px; font-family:'Space Grotesk',sans-serif; font-weight:900; font-size:36px;">${esc(businessName.charAt(0).toUpperCase())}</div>`}
        <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; color:#0A0A0A; margin-bottom:8px;">${esc(businessName)}</div>
        <div style="font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(10,10,10,0.5);">${esc(profile.label)}</div>
      </div>
    </div>
  </div>
</section>`;
}

function renderServices({ profile, primary }) {
  return `
<section id="servizi" style="padding:100px 24px; background:#FAFAFA;">
  <div style="max-width:1100px; margin:0 auto;">
    <div style="text-align:center; margin-bottom:64px;">
      <span style="font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(10,10,10,0.5);">Cosa offriamo</span>
      <h2 style="font-family:'Space Grotesk',sans-serif; font-weight:900; font-size:clamp(32px, 4vw, 48px); line-height:1.1; letter-spacing:-0.02em; color:#0A0A0A; margin:12px 0 0;">
        I nostri servizi
      </h2>
    </div>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(260px, 1fr)); gap:24px;">
      ${profile.services.map(s => `
        <div style="background:#fff; border:1px solid rgba(10,10,10,0.08); border-radius:20px; padding:32px; transition:transform 200ms, box-shadow 200ms;">
          <div style="width:56px; height:56px; border-radius:16px; background:${primary}1A; display:flex; align-items:center; justify-content:center; font-size:28px; margin-bottom:20px;">${esc(s.icon)}</div>
          <h3 style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:20px; color:#0A0A0A; margin:0 0 10px;">${esc(s.title)}</h3>
          <p style="font-family:'Inter',sans-serif; font-size:15px; line-height:1.6; color:rgba(10,10,10,0.65); margin:0;">${esc(s.body)}</p>
        </div>
      `).join('')}
    </div>
  </div>
</section>`;
}

function renderContact({ profile, primary, textOnPrimary, businessName, whatsapp }) {
  const waNumber = (whatsapp || '').replace(/\D/g, '');
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Ciao! Ho visto la tua anteprima Sitorazzo e sono interessato.')}`
    : null;
  return `
<section id="contatti" style="padding:100px 24px; background:#0A0A0A; color:#fff;">
  <div style="max-width:1100px; margin:0 auto; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center;">
    <div>
      <span style="font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:${primary};">${esc(profile.contactLabel)}</span>
      <h2 style="font-family:'Space Grotesk',sans-serif; font-weight:900; font-size:clamp(32px, 4vw, 48px); line-height:1.1; letter-spacing:-0.02em; color:#fff; margin:12px 0 24px;">
        Pronti a conoscervi.
      </h2>
      <p style="font-family:'Inter',sans-serif; font-size:17px; line-height:1.6; color:rgba(255,255,255,0.7); margin:0 0 32px;">
        Scrivici, chiamaci, o vienici a trovare. Siamo qui per te.
      </p>
      ${waUrl ? `
        <a href="${waUrl}" target="_blank" rel="noopener" style="display:inline-flex; align-items:center; gap:10px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; background:#25D366; color:#fff; padding:16px 28px; border-radius:14px; text-decoration:none; min-height:54px;">
          <span style="font-size:20px;">💬</span> WhatsApp
        </a>
      ` : `
        <a href="#" style="display:inline-flex; align-items:center; gap:10px; font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:16px; background:${primary}; color:${textOnPrimary}; padding:16px 28px; border-radius:14px; text-decoration:none; min-height:54px;">
          Contattaci →
        </a>
      `}
    </div>
    <div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:24px; padding:36px;">
      <div style="display:flex; flex-direction:column; gap:24px;">
        <div>
          <div style="font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:6px;">Indirizzo</div>
          <div style="font-family:'Inter',sans-serif; font-size:16px; color:#fff;">Il tuo indirizzo qui</div>
        </div>
        <div>
          <div style="font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:6px;">Telefono</div>
          <div style="font-family:'Inter',sans-serif; font-size:16px; color:#fff;">${esc(whatsapp || 'Il tuo numero qui')}</div>
        </div>
        <div>
          <div style="font-family:'Space Mono',monospace; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:rgba(255,255,255,0.5); margin-bottom:6px;">Orari</div>
          <div style="font-family:'Inter',sans-serif; font-size:16px; color:#fff;">${esc(profile.hoursPlaceholder)}</div>
        </div>
      </div>
    </div>
  </div>
</section>`;
}

function renderWatermarkBadge() {
  return `
<div style="position:fixed; top:20px; right:20px; z-index:9998; display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:9999px; background:rgba(10,10,10,0.85); color:#fff; font-family:'Space Mono',monospace; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; backdrop-filter:blur(10px); pointer-events:none;">
  <span style="width:6px; height:6px; border-radius:50%; background:#FFD60A;"></span>
  Anteprima Sitorazzo
</div>`;
}

function renderStickyCTA({ id }) {
  return `
<div style="position:fixed; bottom:0; left:0; right:0; z-index:9999; background:#0A0A0A; color:#fff; padding:14px 16px; box-shadow:0 -8px 32px rgba(0,0,0,0.3);">
  <div style="max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px; flex-wrap:wrap;">
    <div>
      <div style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; line-height:1.3;">Ti piace? Lo facciamo davvero in 5 giorni.</div>
      <div style="font-family:'Inter',sans-serif; font-size:13px; color:rgba(255,255,255,0.65); line-height:1.3; margin-top:2px;">A partire da 390€ · Zero riunioni · 50% rimborso se sforiamo</div>
    </div>
    <a href="https://sitorazzo.it/#pacchetti?utm_source=mockup&utm_medium=sticky-cta&utm_campaign=${esc(id)}" target="_blank" rel="noopener" style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:15px; background:#FFD60A; color:#0A0A0A; padding:12px 22px; border-radius:12px; text-decoration:none; white-space:nowrap; min-height:46px; display:inline-flex; align-items:center;">
      Voglio questo sito →
    </a>
  </div>
</div>`;
}

function renderMockupNavbar({ businessName, primary, textOnPrimary, logoUrl }) {
  return `
<nav style="position:fixed; top:0; left:0; right:0; z-index:200; background:rgba(255,255,255,0.92); backdrop-filter:blur(14px); border-bottom:1px solid rgba(10,10,10,0.06); padding:12px 24px;">
  <div style="max-width:1100px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:16px;">
    <div style="display:flex; align-items:center; gap:10px;">
      ${logoUrl
        ? `<img src="${esc(logoUrl)}" alt="" style="max-width:32px; max-height:32px; border-radius:6px;">`
        : `<div style="width:32px; height:32px; border-radius:8px; background:${primary}; color:${textOnPrimary}; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-weight:900; font-size:16px;">${esc(businessName.charAt(0).toUpperCase())}</div>`}
      <span style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:17px; color:#0A0A0A;">${esc(businessName)}</span>
    </div>
    <a href="#contatti" style="font-family:'Space Grotesk',sans-serif; font-weight:700; font-size:14px; background:${primary}; color:${textOnPrimary}; padding:10px 18px; border-radius:9999px; text-decoration:none; min-height:42px; display:inline-flex; align-items:center;">
      Contatti →
    </a>
  </div>
</nav>`;
}

/* ------------------------------------------------------------------ */
/*  Public render                                                        */
/* ------------------------------------------------------------------ */
export function renderMockup(record) {
  const businessName = record.businessName || 'La tua attività';
  const industry = record.industry || 'generico';
  const baseProfile = getIndustryProfile(industry);
  const profile = applyCopy(baseProfile, record.copy, businessName);
  const colors = record.colors || { primary: '#FFD60A', secondary: '#0A0A0A' };
  const primary = colors.primary || '#FFD60A';
  const textOnPrimary = colors.textOnPrimary || pickReadableTextColor(primary);
  const logoUrl = record.logoUrl || null;
  const whatsapp = record.whatsapp || null;
  const id = record.id || '';

  const headTitle = `${businessName} — Anteprima Sitorazzo`;

  return `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>${esc(headTitle)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&family=Inter:wght@400;500;600&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  <style>
    *,*::before,*::after { box-sizing:border-box; }
    html,body { margin:0; padding:0; }
    body { font-family:'Inter',sans-serif; color:#0A0A0A; background:#fff; padding-bottom:96px; }
    a { color:inherit; }
    img { max-width:100%; height:auto; display:block; }
    @media (max-width:760px) {
      .mk-hero > div { grid-template-columns:1fr !important; gap:40px !important; padding:0 !important; }
      section { padding:80px 20px !important; }
      section > div { grid-template-columns:1fr !important; }
    }
  </style>
</head>
<body>
${renderMockupNavbar({ businessName, primary, textOnPrimary, logoUrl })}
${renderHero({ businessName, profile, primary, textOnPrimary, logoUrl })}
${renderServices({ profile, primary })}
${renderContact({ profile, primary, textOnPrimary, businessName, whatsapp })}
${renderWatermarkBadge()}
${renderStickyCTA({ id })}
</body>
</html>`;
}
