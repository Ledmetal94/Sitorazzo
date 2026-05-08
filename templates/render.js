/**
 * Mockup renderer — premium template with stock photos, animations, social proof.
 * Takes a KV record and returns a full HTML document.
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

function unsplash(id, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;
}

/* ------------------------------------------------------------------ */
/*  Industry profiles — fallback copy + visual assets per industry      */
/* ------------------------------------------------------------------ */
const INDUSTRY_PROFILES = {
  'ristoranti': {
    label: 'Ristorante · Cucina del territorio',
    eyebrow: 'Cucina italiana · Specialità della casa',
    heroImage: unsplash('1565299624946-b28f40a0ae38', 1200),
    heroAlt: 'Pizza appena sfornata',
    headline: (name) => `Benvenuti da ${name}`,
    sub: 'Una cucina che racconta storie. Prenota il tuo tavolo o scopri il menù del giorno.',
    ctaPrimary: 'Prenota un tavolo',
    ctaSecondary: 'Vedi il menù',
    services: [
      { title: 'Cucina del territorio', body: 'Materie prime selezionate, ricette di famiglia, sapori autentici.' },
      { title: 'Cantina e vini', body: 'Una selezione curata di etichette italiane per ogni piatto.' },
      { title: 'Eventi privati', body: 'Compleanni, anniversari, cene di lavoro. Ti aiutiamo a organizzarli.' },
    ],
    gallery: [
      { src: unsplash('1574071318508-1cdbab80d002', 800), alt: 'Pizza margherita' },
      { src: unsplash('1551183053-bf91a1d81141', 800), alt: 'Pasta fatta in casa' },
      { src: unsplash('1414235077428-338989a2e8c0', 800), alt: 'Sala del ristorante' },
      { src: unsplash('1510812431401-41d2bd2722f3', 800), alt: 'Bicchiere di vino rosso' },
      { src: unsplash('1546069901-ba9599a7e63c', 800), alt: 'Piatto gourmet' },
      { src: unsplash('1567620905732-2d1ec7ab7445', 800), alt: 'Tavolo apparecchiato' },
    ],
    pricingTitle: 'Alcuni piatti dal menù',
    pricingItems: [
      { name: 'Pizza Margherita DOP', desc: 'Pomodoro San Marzano, mozzarella di bufala, basilico fresco', price: '8€' },
      { name: 'Tagliatelle al ragù', desc: 'Pasta tirata a mano, ragù di carne cotto 6 ore', price: '12€' },
      { name: 'Tagliata di manzo', desc: 'Filetto di manzo italiano, rucola, scaglie di parmigiano', price: '18€' },
      { name: 'Tiramisù della casa', desc: 'Ricetta della nonna, mascarpone fresco, cacao puro', price: '6€' },
    ],
    testimonials: [
      { name: 'Marco R.', text: 'La pizza migliore della zona. Impasto leggero, ingredienti freschi. Tornerò sicuramente.', avatar: unsplash('1507003211169-0a1dd7228f2d', 100) },
      { name: 'Laura B.', text: 'Atmosfera familiare e cucina genuina. Ci siamo sentiti a casa fin dal primo momento.', avatar: unsplash('1494790108377-be9c29b29330', 100) },
      { name: 'Giuseppe T.', text: 'Servizio attento, prezzi onesti, qualità da ristorante stellato. Consigliatissimo.', avatar: unsplash('1568602471122-7832951cc4c5', 100) },
    ],
    contactLabel: 'Vieni a trovarci',
    hoursPlaceholder: 'Mar–Dom · 12:30–14:30 · 19:30–23:00',
  },

  'parrucchieri-estetiste': {
    label: 'Beauty & Wellness',
    eyebrow: 'Salone · Centro estetico',
    heroImage: unsplash('1560066984-138dadb4c035', 1200),
    heroAlt: 'Trattamento per capelli',
    headline: (name) => `${name}, il tuo momento di bellezza`,
    sub: 'Servizi su misura, prodotti professionali, un ambiente che ti coccola dal primo all\'ultimo minuto.',
    ctaPrimary: 'Prenota online',
    ctaSecondary: 'Scopri i servizi',
    services: [
      { title: 'Taglio & piega', body: 'Lo stile che ti rappresenta, sempre fresco, sempre tuo.' },
      { title: 'Trattamenti viso & corpo', body: 'Programmi personalizzati con prodotti professionali.' },
      { title: 'Manicure & pedicure', body: 'Cura delle mani e dei piedi, pausa rigenerante garantita.' },
    ],
    gallery: [
      { src: unsplash('1522337360788-8b13dee7a37e', 800), alt: 'Cliente in salone' },
      { src: unsplash('1503951914875-452162b0f3f1', 800), alt: 'Strumenti professionali' },
      { src: unsplash('1487412947147-5cebf100ffc2', 800), alt: 'Manicure' },
      { src: unsplash('1571902943202-507ec2618e8f', 800), alt: 'Trattamento estetico' },
      { src: unsplash('1562322140-8baeececf3df', 800), alt: 'Salone moderno' },
      { src: unsplash('1604654894610-df63bc536371', 800), alt: 'Make-up professionale' },
    ],
    pricingTitle: 'I nostri servizi più richiesti',
    pricingItems: [
      { name: 'Taglio donna + piega', desc: 'Consulenza stilistica, taglio personalizzato, piega', price: '35€' },
      { name: 'Colore + taglio', desc: 'Tinta professionale, taglio, piega finale', price: '65€' },
      { name: 'Trattamento viso', desc: 'Pulizia profonda, maschera, idratazione', price: '45€' },
      { name: 'Manicure semipermanente', desc: 'Cura della mano, smalto a lunga durata', price: '25€' },
    ],
    testimonials: [
      { name: 'Chiara M.', text: 'Mi sento davvero coccolata ogni volta che vengo. Risultato sempre perfetto.', avatar: unsplash('1438761681033-6461ffad8d80', 100) },
      { name: 'Sara P.', text: 'Hanno saputo consigliarmi il taglio giusto per me. Adesso non vado più da nessun\'altra.', avatar: unsplash('1494790108377-be9c29b29330', 100) },
      { name: 'Anna F.', text: 'Ambiente curato, personale gentile, prezzi corretti. Una vera oasi di relax.', avatar: unsplash('1517841905240-472988babdf9', 100) },
    ],
    contactLabel: 'Trovaci facilmente',
    hoursPlaceholder: 'Mar–Sab · 9:00–19:00',
  },

  'artigiani': {
    label: 'Artigiano · Servizio professionale',
    eyebrow: 'Pronto intervento · Preventivi gratuiti',
    heroImage: unsplash('1581094794329-c8112a89af12', 1200),
    heroAlt: 'Lavoro artigianale',
    headline: (name) => `${name} — esperienza al tuo servizio`,
    sub: 'Interventi rapidi, lavoro a regola d\'arte, prezzo onesto. Da noi nessuna sorpresa.',
    ctaPrimary: 'Richiedi preventivo',
    ctaSecondary: 'Chiamaci subito',
    services: [
      { title: 'Pronto intervento', body: 'Disponibili anche nei weekend per emergenze e urgenze.' },
      { title: 'Preventivi gratuiti', body: 'Sopralluogo gratuito e preventivo trasparente, sempre per iscritto.' },
      { title: 'Garanzia sul lavoro', body: 'Se qualcosa non va, torniamo. Lavoro garantito 12 mesi.' },
    ],
    gallery: [
      { src: unsplash('1504148455328-c376907d081c', 800), alt: 'Strumenti da lavoro' },
      { src: unsplash('1530124566582-a618bc2615dc', 800), alt: 'Officina' },
      { src: unsplash('1572377751842-a1a16ae42d7d', 800), alt: 'Falegname al lavoro' },
      { src: unsplash('1565008447742-97f6f38c985c', 800), alt: 'Impianto elettrico' },
      { src: unsplash('1581092160607-ee22621dd758', 800), alt: 'Riparazione idraulica' },
      { src: unsplash('1503387837-b154d5074bd2', 800), alt: 'Lavoro completato' },
    ],
    pricingTitle: 'Tariffe trasparenti',
    pricingItems: [
      { name: 'Sopralluogo + preventivo', desc: 'Veniamo a casa tua, valutiamo il lavoro, ti diamo il prezzo per iscritto', price: 'Gratis' },
      { name: 'Intervento ordinario', desc: 'Riparazioni, sostituzioni, manutenzione su appuntamento', price: 'da 50€' },
      { name: 'Pronto intervento', desc: 'Emergenze 7 giorni su 7, anche festivi, in giornata', price: 'da 80€' },
      { name: 'Lavori straordinari', desc: 'Ristrutturazioni, nuovi impianti — preventivo dedicato', price: 'su richiesta' },
    ],
    testimonials: [
      { name: 'Luca M.', text: 'Veloci, puntuali, prezzo come pattuito. Hanno risolto il problema in mezz\'ora.', avatar: unsplash('1500648767791-00dcc994a43e', 100) },
      { name: 'Roberta C.', text: 'Lavoro impeccabile e ambiente lasciato pulito. Finalmente artigiani seri!', avatar: unsplash('1487412720507-e7ab37603c6f', 100) },
      { name: 'Antonio S.', text: 'Mi hanno spiegato tutto con calma. Trasparenti sui costi, nessuna sorpresa.', avatar: unsplash('1472099645785-5658abf4ff4e', 100) },
    ],
    contactLabel: 'Chiamaci o scrivici',
    hoursPlaceholder: 'Lun–Ven · 8:00–19:00 · Reperibilità 24/7',
  },

  'professionisti': {
    label: 'Studio professionale',
    eyebrow: 'Consulenza · Assistenza · Affidabilità',
    heroImage: unsplash('1497366216548-37526070297c', 1200),
    heroAlt: 'Studio professionale',
    headline: (name) => `${name}: competenza al tuo fianco`,
    sub: 'Anni di esperienza al servizio dei tuoi obiettivi. Trasparenza, riservatezza, risultati concreti.',
    ctaPrimary: 'Prenota una consulenza',
    ctaSecondary: 'Scopri di più',
    services: [
      { title: 'Consulenza specialistica', body: 'Un punto di riferimento esperto per le tue decisioni.' },
      { title: 'Assistenza dedicata', body: 'Ti seguiamo passo dopo passo, senza tempi morti.' },
      { title: 'Riservatezza totale', body: 'I tuoi dati e i tuoi interessi al sicuro, sempre.' },
    ],
    gallery: [
      { src: unsplash('1521791136064-7986c2920216', 800), alt: 'Studio elegante' },
      { src: unsplash('1450101499163-c8848c66ca85', 800), alt: 'Stretta di mano' },
      { src: unsplash('1554224155-6726b3ff858f', 800), alt: 'Documenti professionali' },
      { src: unsplash('1551836022-d5d88e9218df', 800), alt: 'Riunione' },
      { src: unsplash('1556761175-5973dc0f32e7', 800), alt: 'Consulenza' },
      { src: unsplash('1568992687947-868a62a9f521', 800), alt: 'Pianificazione' },
    ],
    pricingTitle: 'I nostri pacchetti',
    pricingItems: [
      { name: 'Prima consulenza', desc: 'Analisi della tua situazione, prima valutazione, opzioni disponibili', price: 'Gratis · 30min' },
      { name: 'Consulenza singola', desc: 'Approfondimento di un caso specifico con relazione scritta', price: 'da 90€' },
      { name: 'Assistenza continuativa', desc: 'Ti seguiamo per tutto l\'anno con priorità sulle richieste', price: 'da 200€/mese' },
      { name: 'Pratiche e contenziosi', desc: 'Gestione completa di pratiche complesse, preventivo dedicato', price: 'su richiesta' },
    ],
    testimonials: [
      { name: 'Avv. Elena R.', text: 'Approccio serio e competente. Mi hanno fatto risparmiare tempo e soldi.', avatar: unsplash('1573496359142-b8d87734a5a2', 100) },
      { name: 'Massimo P.', text: 'Spiegano tutto in modo chiaro, senza tecnicismi. Mi sono sentito ascoltato.', avatar: unsplash('1519085360753-af0119f7cbe7', 100) },
      { name: 'Francesca D.', text: 'Riservati, puntuali, sempre disponibili. Un punto di riferimento affidabile.', avatar: unsplash('1438761681033-6461ffad8d80', 100) },
    ],
    contactLabel: 'Vieni in studio',
    hoursPlaceholder: 'Lun–Ven · 9:00–13:00 · 15:00–19:00',
  },

  'generico': {
    label: 'La tua attività',
    eyebrow: 'Qualità · Esperienza · Servizio',
    heroImage: unsplash('1556761175-5973dc0f32e7', 1200),
    heroAlt: 'Attività professionale',
    headline: (name) => `Benvenuto da ${name}`,
    sub: 'Una realtà nata per offrirti il meglio. Scopri chi siamo e cosa possiamo fare per te.',
    ctaPrimary: 'Contattaci',
    ctaSecondary: 'Scopri di più',
    services: [
      { title: 'Qualità garantita', body: 'Standard elevati, attenzione al dettaglio, soddisfazione del cliente.' },
      { title: 'Servizio dedicato', body: 'Ti ascoltiamo, capiamo le tue esigenze, ti offriamo soluzioni su misura.' },
      { title: 'Vicini a te', body: 'Una realtà locale, con la passione e la cura del territorio.' },
    ],
    gallery: [
      { src: unsplash('1497032628192-86f99bcd76bc', 800), alt: 'Attività commerciale' },
      { src: unsplash('1486406146926-c627a92ad1ab', 800), alt: 'Vetrina' },
      { src: unsplash('1556761175-5973dc0f32e7', 800), alt: 'Professionista al lavoro' },
      { src: unsplash('1521737604893-d14cc237f11d', 800), alt: 'Team al lavoro' },
      { src: unsplash('1517048676732-d65bc937f952', 800), alt: 'Servizio clienti' },
      { src: unsplash('1559136555-9303baea8ebd', 800), alt: 'Locale curato' },
    ],
    pricingTitle: 'I nostri servizi',
    pricingItems: [
      { name: 'Servizio base', desc: 'Quello che ti serve per partire', price: 'da 30€' },
      { name: 'Servizio completo', desc: 'La soluzione più richiesta dai nostri clienti', price: 'da 80€' },
      { name: 'Consulenza personalizzata', desc: 'Studio dedicato sulla tua situazione', price: 'da 50€' },
      { name: 'Pacchetto premium', desc: 'Tutto incluso, priorità garantita', price: 'su richiesta' },
    ],
    testimonials: [
      { name: 'Paolo V.', text: 'Servizio impeccabile, persone gentili e competenti. Tornerò sicuramente.', avatar: unsplash('1500648767791-00dcc994a43e', 100) },
      { name: 'Giulia N.', text: 'Mi hanno seguito passo passo. Risultato superiore alle aspettative.', avatar: unsplash('1438761681033-6461ffad8d80', 100) },
      { name: 'Davide L.', text: 'Prezzi onesti, qualità alta. Consigliato a chiunque cerchi serietà.', avatar: unsplash('1472099645785-5658abf4ff4e', 100) },
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
 */
function applyCopy(profile, copy, businessName) {
  if (!copy) {
    return {
      ...profile,
      headline: profile.headline(businessName),
      sub: profile.sub,
      ctaPrimary: profile.ctaPrimary,
      ctaSecondary: profile.ctaSecondary,
      services: profile.services,
    };
  }
  return {
    ...profile,
    headline: copy.headline || profile.headline(businessName),
    sub: copy.sub || profile.sub,
    ctaPrimary: copy.ctaPrimary || profile.ctaPrimary,
    ctaSecondary: copy.ctaSecondary || profile.ctaSecondary,
    services: Array.isArray(copy.services) && copy.services.length === 3
      ? profile.services.map((s, i) => ({
          title: copy.services[i]?.title || s.title,
          body: copy.services[i]?.body || s.body,
        }))
      : profile.services,
  };
}

/* ------------------------------------------------------------------ */
/*  SVG icon set — line icons used on service cards                      */
/* ------------------------------------------------------------------ */
const ICONS = [
  // sparkle / quality
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v3M12 18v3M5 12H2M22 12h-3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3"/></svg>',
  // shield / trust
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>',
  // heart / care
  '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
];

/* ------------------------------------------------------------------ */
/*  Section builders                                                     */
/* ------------------------------------------------------------------ */
function renderHero({ businessName, profile, primary, textOnPrimary, logoUrl }) {
  return `
<section class="mk-hero">
  <div class="mk-hero-bg"></div>
  <div class="mk-container mk-hero-grid">
    <div class="mk-hero-copy reveal">
      <span class="mk-eyebrow" style="color:${primary}; background:${primary}1A;">${esc(profile.eyebrow)}</span>
      <h1 class="mk-h1">${esc(profile.headline)}</h1>
      <p class="mk-lead">${esc(profile.sub)}</p>
      <div class="mk-cta-row">
        <a href="#contatti" class="mk-btn mk-btn-primary" style="background:${primary}; color:${textOnPrimary};">
          ${esc(profile.ctaPrimary)}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <a href="#servizi" class="mk-btn mk-btn-ghost">${esc(profile.ctaSecondary)}</a>
      </div>
      <div class="mk-hero-stats">
        <div><div class="mk-stat-num" data-counter="10">10</div><div class="mk-stat-label">Anni di esperienza</div></div>
        <div><div class="mk-stat-num" data-counter="500">500</div><div class="mk-stat-label">Clienti soddisfatti</div></div>
        <div><div class="mk-stat-num" data-counter="50">50</div><div class="mk-stat-label">Recensioni ★ 5</div></div>
      </div>
    </div>
    <div class="mk-hero-visual reveal" style="--reveal-delay:.15s;">
      <div class="mk-hero-image-wrap">
        <img src="${esc(profile.heroImage)}" alt="${esc(profile.heroAlt)}" loading="eager">
        ${logoUrl
          ? `<div class="mk-hero-logo-badge"><img src="${esc(logoUrl)}" alt="${esc(businessName)} logo"></div>`
          : `<div class="mk-hero-logo-badge" style="background:${primary}; color:${textOnPrimary};"><span>${esc(businessName.charAt(0).toUpperCase())}</span></div>`}
      </div>
      <div class="mk-hero-floating-card">
        <div class="mk-rating-stars">★★★★★</div>
        <div class="mk-rating-text">"Esperienza eccezionale"</div>
        <div class="mk-rating-author">— Recensione Google</div>
      </div>
    </div>
  </div>
</section>`;
}

function renderTrustBar({ profile }) {
  return `
<section class="mk-trustbar reveal">
  <div class="mk-container mk-trustbar-grid">
    <div class="mk-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      <span>Servizio professionale garantito</span>
    </div>
    <div class="mk-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      <span>Risposta in 24 ore</span>
    </div>
    <div class="mk-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="7"/><path d="M8.21 13.89 7 23l5-3 5 3-1.21-9.12"/></svg>
      <span>Recensioni ★★★★★ 4.9/5</span>
    </div>
    <div class="mk-trust-item">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      <span>Sede locale, vicino a te</span>
    </div>
  </div>
</section>`;
}

function renderServices({ profile, primary }) {
  return `
<section id="servizi" class="mk-section">
  <div class="mk-container">
    <div class="mk-section-head reveal">
      <span class="mk-section-eyebrow">Cosa offriamo</span>
      <h2 class="mk-h2">I nostri servizi</h2>
      <p class="mk-section-sub">Soluzioni pensate per te, costruite con cura nel tempo.</p>
    </div>
    <div class="mk-services-grid">
      ${profile.services.map((s, i) => `
        <article class="mk-service-card reveal" style="--reveal-delay:${i * 0.1}s;">
          <div class="mk-service-icon" style="color:${primary}; background:${primary}14;">
            ${ICONS[i % ICONS.length]}
          </div>
          <h3 class="mk-service-title">${esc(s.title)}</h3>
          <p class="mk-service-body">${esc(s.body)}</p>
          <span class="mk-service-arrow" style="color:${primary};">
            Scopri di più
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </article>
      `).join('')}
    </div>
  </div>
</section>`;
}

function renderGallery({ profile }) {
  return `
<section class="mk-section mk-section-soft">
  <div class="mk-container">
    <div class="mk-section-head reveal">
      <span class="mk-section-eyebrow">Galleria</span>
      <h2 class="mk-h2">Uno sguardo al nostro mondo</h2>
    </div>
    <div class="mk-gallery-grid">
      ${profile.gallery.map((g, i) => `
        <div class="mk-gallery-item reveal" style="--reveal-delay:${i * 0.06}s;">
          <img src="${esc(g.src)}" alt="${esc(g.alt)}" loading="lazy">
          <div class="mk-gallery-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
</section>`;
}

function renderPricing({ profile, primary, textOnPrimary }) {
  return `
<section class="mk-section">
  <div class="mk-container mk-pricing-wrap">
    <div class="mk-section-head reveal">
      <span class="mk-section-eyebrow">Prezzi trasparenti</span>
      <h2 class="mk-h2">${esc(profile.pricingTitle)}</h2>
      <p class="mk-section-sub">Senza sorprese. Sempre chiaro fin dall'inizio.</p>
    </div>
    <div class="mk-pricing-list">
      ${profile.pricingItems.map((p, i) => `
        <div class="mk-pricing-item reveal" style="--reveal-delay:${i * 0.06}s;">
          <div class="mk-pricing-text">
            <div class="mk-pricing-name">${esc(p.name)}</div>
            <div class="mk-pricing-desc">${esc(p.desc)}</div>
          </div>
          <div class="mk-pricing-price" style="color:${primary};">${esc(p.price)}</div>
        </div>
      `).join('')}
    </div>
    <div class="mk-pricing-cta reveal">
      <a href="#contatti" class="mk-btn mk-btn-primary" style="background:${primary}; color:${textOnPrimary};">
        Richiedi informazioni
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </a>
    </div>
  </div>
</section>`;
}

function renderTestimonials({ profile, primary }) {
  return `
<section class="mk-section mk-section-soft">
  <div class="mk-container">
    <div class="mk-section-head reveal">
      <span class="mk-section-eyebrow">Cosa dicono di noi</span>
      <h2 class="mk-h2">Le voci dei nostri clienti</h2>
    </div>
    <div class="mk-testimonials-grid">
      ${profile.testimonials.map((t, i) => `
        <article class="mk-testimonial reveal" style="--reveal-delay:${i * 0.1}s;">
          <div class="mk-testimonial-stars" style="color:${primary};">★★★★★</div>
          <p class="mk-testimonial-text">"${esc(t.text)}"</p>
          <div class="mk-testimonial-author">
            <img src="${esc(t.avatar)}" alt="" loading="lazy">
            <div>
              <div class="mk-testimonial-name">${esc(t.name)}</div>
              <div class="mk-testimonial-meta">Cliente verificato</div>
            </div>
          </div>
        </article>
      `).join('')}
    </div>
  </div>
</section>`;
}

function renderContact({ profile, primary, textOnPrimary, businessName, whatsapp }) {
  const waNumber = (whatsapp || '').replace(/\D/g, '');
  const waUrl = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent('Ciao! Ho visto la tua anteprima Sitorazzo e sono interessato.')}`
    : 'https://wa.me/?text=Ciao!';
  const mapEmbed = `https://maps.google.com/maps?q=${encodeURIComponent(businessName + ' Italia')}&t=&z=13&ie=UTF8&iwloc=&output=embed`;
  return `
<section id="contatti" class="mk-section mk-section-dark">
  <div class="mk-container mk-contact-grid">
    <div class="reveal">
      <span class="mk-section-eyebrow" style="color:${primary};">${esc(profile.contactLabel)}</span>
      <h2 class="mk-h2 mk-h2-light">Pronti a conoscervi.</h2>
      <p class="mk-lead-light">Scrivici, chiamaci, o vienici a trovare. Siamo qui per te.</p>
      <div class="mk-contact-info">
        <div class="mk-info-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:${primary};"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Il tuo indirizzo, città</span>
        </div>
        <div class="mk-info-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:${primary};"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${esc(whatsapp || 'Il tuo numero')}</span>
        </div>
        <div class="mk-info-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" style="color:${primary};"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <span>${esc(profile.hoursPlaceholder)}</span>
        </div>
      </div>
      <div class="mk-cta-row" style="margin-top:32px;">
        <a href="${waUrl}" target="_blank" rel="noopener" class="mk-btn mk-btn-whatsapp">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413"/></svg>
          WhatsApp
        </a>
      </div>
    </div>
    <div class="mk-map-wrap reveal" style="--reveal-delay:.15s;">
      <iframe src="${esc(mapEmbed)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mappa"></iframe>
    </div>
  </div>
</section>`;
}

function renderFooter({ businessName, primary }) {
  return `
<footer class="mk-footer">
  <div class="mk-container mk-footer-inner">
    <div class="mk-footer-brand">
      <strong>${esc(businessName)}</strong>
      <span style="color:rgba(255,255,255,0.5); font-size:13px;">© ${new Date().getFullYear()} — Tutti i diritti riservati</span>
    </div>
    <nav class="mk-footer-nav">
      <a href="#servizi">Servizi</a>
      <a href="#contatti">Contatti</a>
      <a href="#" style="color:${primary};">Privacy</a>
    </nav>
  </div>
</footer>`;
}

function renderWatermarkBadge() {
  return `
<div class="mk-watermark">
  <span class="mk-wm-dot"></span>
  Anteprima Sitorazzo
</div>`;
}

function renderStickyCTA({ id }) {
  const utm = `?utm_source=mockup&utm_medium=sticky-cta&utm_campaign=${esc(id)}`;
  return `
<div class="mk-sticky-cta" id="mk-sticky-cta">
  <div class="mk-container mk-sticky-inner">
    <div class="mk-sticky-text">
      <div class="mk-sticky-title">Ti piace? Lo facciamo davvero in 5 giorni.</div>
      <div class="mk-sticky-sub">A partire da 390€ · Zero riunioni · 50% rimborso se sforiamo</div>
    </div>
    <a href="https://sitorazzo.it/#pacchetti${utm}" target="_blank" rel="noopener" class="mk-btn mk-btn-yellow">
      Voglio questo sito
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
    </a>
  </div>
</div>`;
}

function renderMockupNavbar({ businessName, primary, textOnPrimary, logoUrl }) {
  return `
<nav class="mk-nav">
  <div class="mk-container mk-nav-inner">
    <a href="#" class="mk-nav-brand">
      ${logoUrl
        ? `<img src="${esc(logoUrl)}" alt="" class="mk-nav-logo">`
        : `<div class="mk-nav-logo-placeholder" style="background:${primary}; color:${textOnPrimary};">${esc(businessName.charAt(0).toUpperCase())}</div>`}
      <span>${esc(businessName)}</span>
    </a>
    <div class="mk-nav-links">
      <a href="#servizi">Servizi</a>
      <a href="#contatti">Contatti</a>
    </div>
    <a href="#contatti" class="mk-nav-cta" style="background:${primary}; color:${textOnPrimary};">
      Prenota ora
    </a>
  </div>
</nav>`;
}

/* ------------------------------------------------------------------ */
/*  Styles + animations                                                  */
/* ------------------------------------------------------------------ */
function renderStyles({ primary, textOnPrimary }) {
  return `<style>
:root {
  --mk-primary: ${primary};
  --mk-on-primary: ${textOnPrimary};
  --mk-ink: #0A0A0A;
  --mk-ink-70: rgba(10,10,10,0.7);
  --mk-ink-50: rgba(10,10,10,0.5);
  --mk-ink-30: rgba(10,10,10,0.3);
  --mk-paper: #ffffff;
  --mk-soft: #FAFAF7;
  --mk-border: rgba(10,10,10,0.08);
}
*,*::before,*::after { box-sizing:border-box; }
html,body { margin:0; padding:0; }
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--mk-ink);
  background: var(--mk-paper);
  padding-bottom: 110px;
  overflow-x: hidden;
}
img { max-width:100%; height:auto; display:block; }
a { color:inherit; }

.mk-container { max-width:1180px; margin:0 auto; padding:0 24px; }
.mk-section { padding:120px 0; }
.mk-section-soft { background:var(--mk-soft); }
.mk-section-dark { background:var(--mk-ink); color:#fff; padding:120px 0; }

/* ===== TYPOGRAPHY ===== */
.mk-eyebrow {
  display:inline-block;
  font-family:'Space Mono', monospace;
  font-size:11px;
  font-weight:700;
  letter-spacing:0.10em;
  text-transform:uppercase;
  padding:8px 14px;
  border-radius:9999px;
  margin-bottom:24px;
}
.mk-section-eyebrow {
  display:inline-block;
  font-family:'Space Mono', monospace;
  font-size:11px;
  font-weight:700;
  letter-spacing:0.10em;
  text-transform:uppercase;
  color:var(--mk-ink-50);
  margin-bottom:14px;
}
.mk-h1 {
  font-family:'Space Grotesk', 'Inter', sans-serif;
  font-weight:900;
  font-size:clamp(40px, 5.4vw, 64px);
  line-height:1.04;
  letter-spacing:-0.03em;
  margin:0 0 22px;
  color:var(--mk-ink);
}
.mk-h2 {
  font-family:'Space Grotesk', 'Inter', sans-serif;
  font-weight:900;
  font-size:clamp(32px, 4vw, 48px);
  line-height:1.08;
  letter-spacing:-0.02em;
  margin:0;
  color:var(--mk-ink);
}
.mk-h2-light { color:#fff; }
.mk-lead {
  font-size:19px;
  line-height:1.6;
  color:var(--mk-ink-70);
  margin:0 0 36px;
  max-width:540px;
}
.mk-lead-light {
  font-size:18px;
  line-height:1.6;
  color:rgba(255,255,255,0.7);
  margin:18px 0 0;
}
.mk-section-head { text-align:center; max-width:680px; margin:0 auto 64px; }
.mk-section-head .mk-h2 { margin-bottom:14px; }
.mk-section-sub { font-size:17px; color:var(--mk-ink-70); margin:0; }

/* ===== BUTTONS ===== */
.mk-cta-row { display:flex; gap:14px; flex-wrap:wrap; }
.mk-btn {
  display:inline-flex;
  align-items:center;
  gap:10px;
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:16px;
  padding:16px 28px;
  border-radius:14px;
  text-decoration:none;
  min-height:54px;
  transition:transform .25s cubic-bezier(.22,.94,.32,1.04), box-shadow .25s, background .25s;
  cursor:pointer;
  border:0;
}
.mk-btn-primary { box-shadow:0 8px 24px rgba(0,0,0,0.08); }
.mk-btn-primary:hover { transform:translateY(-2px); box-shadow:0 14px 32px rgba(0,0,0,0.14); }
.mk-btn-ghost {
  background:transparent;
  color:var(--mk-ink);
  border:1.5px solid var(--mk-border);
}
.mk-btn-ghost:hover { background:var(--mk-ink); color:var(--mk-paper); border-color:var(--mk-ink); transform:translateY(-2px); }
.mk-btn-yellow {
  background:#FFD60A;
  color:#0A0A0A;
  font-size:15px;
  padding:13px 22px;
  min-height:48px;
  white-space:nowrap;
  box-shadow:0 8px 24px rgba(255,214,10,0.3);
}
.mk-btn-yellow:hover { background:#F5B700; transform:translateY(-2px); }
.mk-btn-whatsapp {
  background:#25D366;
  color:#fff;
  box-shadow:0 8px 24px rgba(37,211,102,0.3);
}
.mk-btn-whatsapp:hover { background:#1eb858; transform:translateY(-2px); }

/* ===== NAVBAR ===== */
.mk-nav {
  position:fixed;
  top:0; left:0; right:0;
  z-index:200;
  background:rgba(255,255,255,0.85);
  backdrop-filter:blur(16px);
  -webkit-backdrop-filter:blur(16px);
  border-bottom:1px solid var(--mk-border);
}
.mk-nav-inner {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:16px;
  padding:14px 24px;
}
.mk-nav-brand {
  display:flex;
  align-items:center;
  gap:10px;
  text-decoration:none;
  color:var(--mk-ink);
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:17px;
}
.mk-nav-logo, .mk-nav-logo-placeholder {
  width:36px; height:36px;
  border-radius:10px;
  object-fit:contain;
}
.mk-nav-logo-placeholder {
  display:flex;
  align-items:center;
  justify-content:center;
  font-family:'Space Grotesk', sans-serif;
  font-weight:900;
  font-size:18px;
}
.mk-nav-links {
  display:flex;
  gap:28px;
}
.mk-nav-links a {
  text-decoration:none;
  font-size:15px;
  font-weight:500;
  color:var(--mk-ink-70);
  transition:color .15s;
}
.mk-nav-links a:hover { color:var(--mk-ink); }
.mk-nav-cta {
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:14px;
  padding:10px 20px;
  border-radius:9999px;
  text-decoration:none;
  min-height:42px;
  display:inline-flex;
  align-items:center;
  transition:transform .25s, box-shadow .25s;
}
.mk-nav-cta:hover { transform:translateY(-1px); box-shadow:0 8px 18px rgba(0,0,0,0.12); }
@media (max-width:760px) {
  .mk-nav-links { display:none; }
}

/* ===== HERO ===== */
.mk-hero {
  position:relative;
  padding:160px 0 100px;
  overflow:hidden;
  background:#fff;
}
.mk-hero-bg {
  position:absolute;
  top:-200px; right:-200px;
  width:800px; height:800px;
  background:radial-gradient(circle, var(--mk-primary)22 0%, transparent 70%);
  pointer-events:none;
  z-index:0;
}
.mk-hero-grid {
  display:grid;
  grid-template-columns:1.1fr 1fr;
  gap:80px;
  align-items:center;
  position:relative;
  z-index:1;
}
.mk-hero-stats {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:24px;
  margin-top:48px;
  padding-top:36px;
  border-top:1px solid var(--mk-border);
}
.mk-stat-num {
  font-family:'Space Grotesk', sans-serif;
  font-weight:900;
  font-size:36px;
  letter-spacing:-0.02em;
  color:var(--mk-ink);
  line-height:1;
}
.mk-stat-num::after { content:'+'; }
.mk-stat-label {
  font-size:13px;
  color:var(--mk-ink-50);
  margin-top:6px;
  font-weight:500;
}
.mk-hero-visual {
  position:relative;
  min-height:480px;
}
.mk-hero-image-wrap {
  position:relative;
  border-radius:32px;
  overflow:hidden;
  box-shadow:0 30px 80px rgba(10,10,10,0.18);
  aspect-ratio:4/5;
  animation:floatIn 1.2s cubic-bezier(.22,.94,.32,1.04) both;
}
.mk-hero-image-wrap img {
  width:100%; height:100%;
  object-fit:cover;
  animation:slowZoom 18s ease-in-out infinite alternate;
}
.mk-hero-logo-badge {
  position:absolute;
  top:24px; left:24px;
  width:64px; height:64px;
  border-radius:18px;
  background:#fff;
  display:flex; align-items:center; justify-content:center;
  font-family:'Space Grotesk', sans-serif;
  font-weight:900;
  font-size:30px;
  box-shadow:0 8px 24px rgba(0,0,0,0.18);
  overflow:hidden;
}
.mk-hero-logo-badge img { max-width:48px; max-height:48px; }
.mk-hero-floating-card {
  position:absolute;
  bottom:-24px; left:-24px;
  background:#fff;
  border-radius:18px;
  padding:18px 22px;
  box-shadow:0 16px 40px rgba(10,10,10,0.18);
  animation:floatGently 4s ease-in-out infinite alternate;
}
.mk-rating-stars { color:var(--mk-primary); font-size:18px; letter-spacing:2px; line-height:1; margin-bottom:6px; }
.mk-rating-text { font-weight:700; font-size:14px; }
.mk-rating-author { font-size:12px; color:var(--mk-ink-50); margin-top:2px; }
@media (max-width:900px) {
  .mk-hero-grid { grid-template-columns:1fr; gap:48px; }
  .mk-hero-visual { min-height:0; }
  .mk-hero-image-wrap { aspect-ratio:1/1; }
  .mk-hero-stats { gap:16px; }
  .mk-stat-num { font-size:28px; }
}

/* ===== TRUST BAR ===== */
.mk-trustbar {
  background:var(--mk-soft);
  border-top:1px solid var(--mk-border);
  border-bottom:1px solid var(--mk-border);
  padding:22px 0;
}
.mk-trustbar-grid {
  display:flex;
  justify-content:space-around;
  gap:20px;
  flex-wrap:wrap;
}
.mk-trust-item {
  display:flex;
  align-items:center;
  gap:10px;
  font-size:14px;
  font-weight:500;
  color:var(--mk-ink-70);
}
.mk-trust-item svg { color:var(--mk-primary); flex-shrink:0; }

/* ===== SERVICES ===== */
.mk-services-grid {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:24px;
}
.mk-service-card {
  background:#fff;
  border:1px solid var(--mk-border);
  border-radius:24px;
  padding:36px 32px;
  transition:transform .35s cubic-bezier(.22,.94,.32,1.04), box-shadow .35s, border-color .35s;
  position:relative;
}
.mk-service-card:hover {
  transform:translateY(-6px);
  box-shadow:0 24px 60px rgba(10,10,10,0.10);
  border-color:transparent;
}
.mk-service-icon {
  width:56px; height:56px;
  border-radius:16px;
  display:flex; align-items:center; justify-content:center;
  margin-bottom:24px;
  transition:transform .35s;
}
.mk-service-card:hover .mk-service-icon { transform:scale(1.08) rotate(-4deg); }
.mk-service-title {
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:21px;
  margin:0 0 10px;
  color:var(--mk-ink);
}
.mk-service-body {
  font-size:15px;
  line-height:1.6;
  color:var(--mk-ink-70);
  margin:0 0 20px;
}
.mk-service-arrow {
  display:inline-flex;
  align-items:center;
  gap:6px;
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:14px;
  transition:gap .25s;
}
.mk-service-card:hover .mk-service-arrow { gap:12px; }
@media (max-width:900px) { .mk-services-grid { grid-template-columns:1fr; } }

/* ===== GALLERY ===== */
.mk-gallery-grid {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  grid-auto-rows:240px;
  gap:14px;
}
.mk-gallery-item {
  position:relative;
  border-radius:18px;
  overflow:hidden;
  cursor:pointer;
}
.mk-gallery-item:nth-child(1) { grid-row:span 2; }
.mk-gallery-item:nth-child(4) { grid-row:span 2; }
.mk-gallery-item img {
  width:100%; height:100%;
  object-fit:cover;
  transition:transform .8s cubic-bezier(.22,.94,.32,1.04);
}
.mk-gallery-item:hover img { transform:scale(1.08); }
.mk-gallery-overlay {
  position:absolute; inset:0;
  background:rgba(10,10,10,0.55);
  display:flex; align-items:center; justify-content:center;
  color:#fff;
  opacity:0;
  transition:opacity .25s;
}
.mk-gallery-item:hover .mk-gallery-overlay { opacity:1; }
@media (max-width:900px) {
  .mk-gallery-grid { grid-template-columns:repeat(2, 1fr); grid-auto-rows:180px; }
  .mk-gallery-item:nth-child(1), .mk-gallery-item:nth-child(4) { grid-row:auto; }
}

/* ===== PRICING ===== */
.mk-pricing-wrap { max-width:760px; }
.mk-pricing-list {
  display:flex;
  flex-direction:column;
  gap:0;
  background:#fff;
  border:1px solid var(--mk-border);
  border-radius:20px;
  overflow:hidden;
}
.mk-pricing-item {
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:24px;
  padding:24px 28px;
  border-bottom:1px solid var(--mk-border);
  transition:background .25s;
}
.mk-pricing-item:last-child { border-bottom:0; }
.mk-pricing-item:hover { background:var(--mk-soft); }
.mk-pricing-name {
  font-family:'Space Grotesk', sans-serif;
  font-weight:700;
  font-size:17px;
  margin-bottom:4px;
}
.mk-pricing-desc {
  font-size:14px;
  color:var(--mk-ink-50);
  line-height:1.5;
}
.mk-pricing-price {
  font-family:'Space Grotesk', sans-serif;
  font-weight:900;
  font-size:22px;
  white-space:nowrap;
}
.mk-pricing-cta { text-align:center; margin-top:36px; }

/* ===== TESTIMONIALS ===== */
.mk-testimonials-grid {
  display:grid;
  grid-template-columns:repeat(3, 1fr);
  gap:24px;
}
.mk-testimonial {
  background:#fff;
  border:1px solid var(--mk-border);
  border-radius:24px;
  padding:32px 28px;
  transition:transform .35s, box-shadow .35s;
}
.mk-testimonial:hover {
  transform:translateY(-4px);
  box-shadow:0 24px 60px rgba(10,10,10,0.08);
}
.mk-testimonial-stars { font-size:18px; letter-spacing:2px; margin-bottom:14px; }
.mk-testimonial-text {
  font-size:16px;
  line-height:1.6;
  color:var(--mk-ink);
  margin:0 0 24px;
}
.mk-testimonial-author { display:flex; align-items:center; gap:12px; }
.mk-testimonial-author img {
  width:44px; height:44px;
  border-radius:50%;
  object-fit:cover;
}
.mk-testimonial-name { font-weight:700; font-size:15px; }
.mk-testimonial-meta { font-size:12px; color:var(--mk-ink-50); margin-top:2px; }
@media (max-width:900px) { .mk-testimonials-grid { grid-template-columns:1fr; } }

/* ===== CONTACT ===== */
.mk-contact-grid {
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:64px;
  align-items:center;
}
.mk-contact-info {
  display:flex;
  flex-direction:column;
  gap:18px;
  margin-top:32px;
}
.mk-info-row {
  display:flex;
  align-items:center;
  gap:14px;
  font-size:16px;
}
.mk-map-wrap {
  border-radius:24px;
  overflow:hidden;
  aspect-ratio:1/1;
  border:1px solid rgba(255,255,255,0.1);
}
.mk-map-wrap iframe { width:100%; height:100%; border:0; }
@media (max-width:900px) {
  .mk-contact-grid { grid-template-columns:1fr; gap:40px; }
  .mk-map-wrap { aspect-ratio:4/3; }
}

/* ===== FOOTER ===== */
.mk-footer {
  background:#000;
  color:rgba(255,255,255,0.7);
  padding:32px 0;
  font-size:14px;
}
.mk-footer-inner {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  flex-wrap:wrap;
}
.mk-footer-brand { display:flex; flex-direction:column; gap:4px; }
.mk-footer-brand strong { color:#fff; font-size:16px; font-family:'Space Grotesk', sans-serif; }
.mk-footer-nav { display:flex; gap:24px; }
.mk-footer-nav a { text-decoration:none; transition:color .15s; }
.mk-footer-nav a:hover { color:#fff; }

/* ===== WATERMARK ===== */
.mk-watermark {
  position:fixed;
  bottom:120px; right:20px;
  z-index:9998;
  display:flex; align-items:center; gap:8px;
  padding:8px 14px;
  border-radius:9999px;
  background:rgba(10,10,10,0.78);
  color:#fff;
  font-family:'Space Mono', monospace;
  font-size:11px;
  font-weight:700;
  letter-spacing:0.08em;
  text-transform:uppercase;
  backdrop-filter:blur(10px);
  pointer-events:none;
}
.mk-wm-dot {
  width:6px; height:6px;
  border-radius:50%;
  background:#FFD60A;
  animation:pulseDot 1.6s ease-in-out infinite;
}

/* ===== STICKY CTA ===== */
.mk-sticky-cta {
  position:fixed;
  bottom:0; left:0; right:0;
  z-index:9999;
  background:rgba(10,10,10,0.96);
  backdrop-filter:blur(14px);
  color:#fff;
  padding:14px 0;
  box-shadow:0 -10px 40px rgba(0,0,0,0.3);
  transform:translateY(0);
  transition:transform .4s cubic-bezier(.22,.94,.32,1.04);
}
.mk-sticky-inner {
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  flex-wrap:wrap;
}
.mk-sticky-title { font-family:'Space Grotesk', sans-serif; font-weight:700; font-size:15px; }
.mk-sticky-sub { font-size:13px; color:rgba(255,255,255,0.65); margin-top:2px; }

/* ===== ANIMATIONS ===== */
.reveal {
  opacity:0;
  transform:translateY(28px);
  transition:opacity .9s cubic-bezier(.22,.94,.32,1.04), transform .9s cubic-bezier(.22,.94,.32,1.04);
  transition-delay:var(--reveal-delay, 0s);
}
.reveal.is-visible {
  opacity:1;
  transform:none;
}
@keyframes floatIn {
  from { opacity:0; transform:translateY(40px) scale(.96); }
  to { opacity:1; transform:translateY(0) scale(1); }
}
@keyframes slowZoom {
  from { transform:scale(1); }
  to { transform:scale(1.06); }
}
@keyframes floatGently {
  from { transform:translateY(0); }
  to { transform:translateY(-8px); }
}
@keyframes pulseDot {
  0%, 100% { opacity:1; transform:scale(1); }
  50% { opacity:0.4; transform:scale(0.8); }
}
@media (prefers-reduced-motion: reduce) {
  .reveal { opacity:1; transform:none; transition:none; }
  .mk-hero-image-wrap, .mk-hero-image-wrap img, .mk-hero-floating-card, .mk-wm-dot { animation:none; }
}
</style>`;
}

/* ------------------------------------------------------------------ */
/*  Animation script                                                     */
/* ------------------------------------------------------------------ */
function renderScript() {
  return `<script>
(function(){
  // Scroll-triggered reveal
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          e.target.classList.add('is-visible');
          obs.unobserve(e.target);
        }
      });
    }, { threshold:0.12, rootMargin:'0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(function(el){ obs.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('is-visible'); });
  }

  // Animated counters (run once when stats become visible)
  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-counter'), 10);
    if (!target) return;
    var duration = 1600, start = performance.now();
    function step(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(target * eased);
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var counterObs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) {
          animateCounter(e.target);
          counterObs.unobserve(e.target);
        }
      });
    }, { threshold:0.5 });
    document.querySelectorAll('[data-counter]').forEach(function(el){ counterObs.observe(el); });
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click', function(e){
      var href = a.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior:'smooth', block:'start' });
      }
    });
  });
})();
</script>`;
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
  <link rel="preconnect" href="https://images.unsplash.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700;900&family=Inter:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
  ${renderStyles({ primary, textOnPrimary })}
</head>
<body>
${renderMockupNavbar({ businessName, primary, textOnPrimary, logoUrl })}
${renderHero({ businessName, profile, primary, textOnPrimary, logoUrl })}
${renderTrustBar({ profile })}
${renderServices({ profile, primary })}
${renderGallery({ profile })}
${renderPricing({ profile, primary, textOnPrimary })}
${renderTestimonials({ profile, primary })}
${renderContact({ profile, primary, textOnPrimary, businessName, whatsapp })}
${renderFooter({ businessName, primary })}
${renderWatermarkBadge()}
${renderStickyCTA({ id })}
${renderScript()}
</body>
</html>`;
}
