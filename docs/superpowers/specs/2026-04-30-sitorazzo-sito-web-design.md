# Design Spec — Sitorazzo Sito Web
**Data:** 30 aprile 2026  
**Progetto:** SITO (vzitalia)  
**Stack:** HTML statico + Tailwind CSS + Vercel

---

## Contesto

Sitorazzo è un brand di Virtual Zone S.r.l. (Latina) che vende siti web professionali a PMI italiane. Promessa core: sito online in 5 giorni a partire da 390€. Il sito è il principale strumento di conversione, alimentato da campagne Meta Ads.

---

## Superfici da costruire

### 1. Landing page marketing (`/`)
### 2. Onboarding brief form (`/onboarding`)
### 3. Pagine standalone (post-lancio)
### 4. Pagine SEO geo + verticali (post-lancio)

---

## Architettura file

```
repo/
├── index.html                  ← Landing page
├── onboarding.html             ← Brief wizard
├── grazie.html                 ← Thank you post-pagamento
├── pacchetti.html
├── come-funziona.html
├── garanzia.html
├── esempi.html
├── testimonianze.html
├── faq.html
├── contatti.html
├── privacy.html
├── cookie.html
├── termini.html
├── css/
│   ├── tokens.css              ← Design tokens (source of truth)
│   ├── components.css          ← Classi componente primitive
│   └── main.css                ← Tailwind output compilato
├── js/
│   ├── navbar.js               ← Scroll behavior navbar
│   ├── onboarding.js           ← State management wizard
│   └── faq.js                  ← Accordion
├── assets/                     ← Loghi, favicon, immagini
│   ├── Sitorazzo_Logomark_256px.png
│   ├── Sitorazzo_Logomark_1024px_black.png
│   ├── Sitorazzo_Lockup_OnBlack.png
│   ├── Sitorazzo_Lockup_OnWarmWhite.png
│   ├── Sitorazzo_Lockup_OnYellow.png
│   ├── favicon_32.png
│   ├── favicon_512.png
│   └── apple-touch-icon.png
├── tailwind.config.js          ← Tailwind config con preset brand
├── package.json
└── vercel.json
```

---

## Design tokens

Fonte di verità: `css/tokens.css`. Mai hardcodare valori hex o px che esistono come token.

### Decisioni design correnti

- La direzione ufficiale della landing è **hero chiara**: sfondo `--sr-paper` / `--sr-warm`, griglia sottile e highlight giallo sotto la headline.
- La navbar default è **light glass**: fondo bianco translucido, testo `--sr-ink`, bordi soft e blur.
- La navbar è **stabile**: non cambia opacità, colore o shadow allo scroll.
- Le varianti navbar `dark`, `smoke` e `cream` restano disponibili solo come opzioni sperimentali/testabili via query string.
- I token principali `--sr-yellow`, `--sr-ink`, `--sr-warm`, tipografia e spacing restano la fonte di verità e non vanno modificati per questa direzione.

**Colori brand:**
- `--sr-yellow: #FFD60A` — CTA primaria, accenti
- `--sr-yellow-dark: #F5B700` — hover
- `--sr-ink: #0A0A0A` — testo principale, sfondi dark
- `--sr-warm: #FFF8E7` — sfondi sezioni alternate
- `--sr-paper: #FFFFFF` — sfondo principale
- `--sr-border: #E5E5E5` — bordi
- `--sr-success: #22C55E` — stati positivi
- `--sr-alert: #EF4444` — errori form

**Font (Google Fonts):**
- Space Grotesk 400/500/700 — display, heading, label
- Inter 400/500/600 — body, form
- Space Mono 400/700 — prezzi, eyebrow, tag

---

## Surface 1 — Landing page (`index.html`)

### Struttura sezioni (ordine di conversione)

1. **Navbar pill** — fixed top:20px, light glass stabile, nessun cambio allo scroll
2. **Hero** — light (`--sr-paper`/`--sr-warm`), griglia sottile, highlight giallo sotto headline, badge "FIRST 50", card RAZZO PRO flottante, trust stats row
3. **Trust bar** — 5 pillole: "5 giorni garantiti", "prezzo fisso", "zero riunioni", "sede a Latina", "rimborso 50%"
4. **Problema** — "Sei stanco di…" / pain agitation, lista 4 dolori del cliente
5. **Come funziona** — 4 step (Lun/Lun sera/Mer-Gio/Ven), copy dal BP
6. **Pacchetti** — 3 piani (Start 390€, Pro 590€ promo, Power 1.290€), PRO featured e scaled
7. **Cosa è incluso** — feature list comune a tutti i pacchetti
8. **Confronto prezzi** — tabella Sitorazzo vs Agenzia vs Wix vs Freelance + screenshot competitor reali (da aggiungere quando disponibili, placeholder al lancio)
9. **Garanzia** — box giallo, "5-7-10 giorni o rimborso 50%"
10. **Showcase** — griglia 6-9 mockup siti realizzati (placeholder template al lancio)
11. **Testimonianze** — video + screenshot (placeholder al lancio, si riempie con i primi clienti)
12. **Virtual Zone — azienda reale** — chi siamo, sede Latina, Google Maps embed
13. **FAQ** — accordion, 2 colonne per categoria (Pagamento & garanzia / Processo / Tecnico)
14. **CTA finale** — prezzo + garanzia ripetuta + 2 CTA (acquista / WhatsApp)
15. **Footer** — logo, link nav, info legali Virtual Zone, disclaimer Meta/Google/TikTok
16. **WhatsApp sticky** — sempre visibile, angolo inferiore destro

### Comportamenti JS (vanilla)
- Query `?nav=dark|smoke|cream|light` → cambia variante navbar solo per test
- Nessun comportamento scroll-reactive sulla navbar: opacità, colore e shadow restano stabili
- Click CTA hero/finale → scroll to `#pacchetti`
- Click "Come funziona ↓" → scroll to `#come-funziona`
- FAQ accordion: click → expand/collapse con easing brand
- WhatsApp sticky: sempre visibile

### Performance target
- Lighthouse 95+ su tutte le metriche
- LCP < 1.5s, CLS < 0.05
- Google Fonts con `display=swap`
- Immagini ottimizzate (WebP dove possibile)

### Tracking
- Meta Pixel: PageView, ViewContent (sezione pacchetti), InitiateCheckout (click CTA pacchetto)
- GA4: stessi eventi
- Microsoft Clarity (heatmap)

### Schema markup (JSON-LD)
- Organization
- LocalBusiness
- Service (per ogni pacchetto)
- FAQPage
- BreadcrumbList

### Responsività
- Mobile-first, breakpoint 768px e 1024px
- Hero 2 colonne → 1 colonna sotto 768px
- Navbar pill → bottom bar o collasso sotto 480px

---

## Surface 2 — Onboarding Brief Form (`onboarding.html`)

### Flusso wizard

```
Step 0: Welcome screen
Step 1: La tua attività (nome, settore pill, città, descrizione)
Step 2: I tuoi contatti (referente, ruolo, email, telefono, WhatsApp)
Step 3: Il tuo pacchetto (card selezionabili Start/Pro/Power)
Step 4: Logo e immagini (drag & drop upload PNG/JPG/SVG/PDF/AI/ZIP)
Step 5: Dominio e URL (dominio desiderato, stato, sito esistente)
Step 6: I tuoi social (Instagram, Facebook, TikTok, LinkedIn + altri)
Step 7: Sede e orari (indirizzo + orari per giorno con toggle "Chiuso")
Step 8: Stile e preferenze (mood card, colori logo, riferimenti, no-list)
Step 9: Conferma (thank you screen con riepilogo ordine)
```

### Layout shell
- Progress bar: `position:fixed; top:0; height:4px; background:var(--sr-yellow)`
- Topbar: `position:fixed; top:4px` — logo sx + "Step N di 8" dx (Space Mono)
- Form card: `max-width:640px; margin:auto; padding:108px 24px 80px`

### State management
```js
const formData = {
  pacchetto: pkgFromUrl || 'pro', // legge ?pacchetto= da URL Stripe
  nome: '', settore: '', citta: '', descrizione: '',
  referente: '', ruolo: '', email: '', telefono: '', whatsapp: '',
  logoStatus: '', files: [],
  dominio: '', dominioStatus: '', sitoEsistente: '', sitoUrl: '',
  social: { instagram: '', facebook: '', tiktok: '', linkedin: '' },
  altriLink: '', socialVisibility: '',
  indirizzo: '', tipoSede: '',
  orari: { lun:{apre:'09:00',chiude:'18:00',chiuso:false}, ... },
  mood: '', coloriLogo: '', riferimenti: '', nonVuole: '', noteFinali: ''
}
let step = 0; // 0=welcome, 1-8=form, 9=thankyou
```

### Submit (Step 8 → onNext)
1. POST multipart a `/api/submit-brief`
2. Campo `briefData` con JSON serializzato del wizard
3. Allegati nel campo multipart `file`
4. API Vercel crea cartella cliente su Google Drive
5. API Vercel crea Google Doc riepilogo brief nella stessa cartella
6. API Vercel carica gli allegati nella stessa cartella
7. Se mancano le env Google, l'API ritorna errore JSON gestito e il wizard mostra un messaggio visibile
8. → Step 9 (thank you) solo dopo submit riuscito

### Env Vercel richieste

- `GOOGLE_SERVICE_ACCOUNT_JSON`
- `GOOGLE_DRIVE_PARENT_FOLDER_ID`

Non usare Make, Airtable o Uploadcare per il flusso onboarding corrente.

### Integrazione URL Stripe
```js
const pkgFromStripe = new URLSearchParams(location.search).get('pacchetto') || 'pro';
```

---

## Pagine standalone (Sprint 3, post-lancio)

| Pagina | Priorità | Note |
|--------|----------|------|
| `/pacchetti` | Alta | Listino dettagliato + CTA Stripe per pacchetto |
| `/come-funziona` | Alta | Processo step-by-step espanso |
| `/garanzia` | Media | Pagina dedicata alla promessa 5 giorni |
| `/esempi` | Media | Portfolio per settore con filtro |
| `/testimonianze` | Media | Video + screenshot (riempire con clienti reali) |
| `/faq` | Bassa | 20+ domande con search |
| `/contatti` | Bassa | Form + mappa + WhatsApp |

---

## Pagine SEO (Sprint 4, post-lancio)

**Geo (layer 2):**
`/realizzazione-siti-web-latina` + Aprilia, Cisterna, Sabaudia, Terracina, Formia, Gaeta

**Verticali (layer 3):**
`/sito-per-ristoranti`, `/sito-per-parrucchieri-estetiste`, `/sito-per-idraulici-elettricisti`, `/sito-per-bb-affittacamere`, `/sito-per-commercialisti-consulenti`, `/sito-per-palestre-pt`, `/sito-per-fotografi-creativi`, `/sito-per-artigiani`

---

## Pagine legali

`/privacy`, `/cookie`, `/termini` — generate da template standard, da revisionare con consulente legale.

---

## Toolchain

```json
{
  "scripts": {
    "dev": "tailwindcss -i ./css/input.css -o ./css/main.css --watch",
    "build": "tailwindcss -i ./css/input.css -o ./css/main.css --minify"
  }
}
```

`tailwind.config.js` usa `tailwind.preset.cjs` dal design handoff.

---

## Sprint plan (overview)

| Sprint | Contenuto | Obiettivo |
|--------|-----------|-----------|
| 1 | Setup repo + toolchain + assets | Repo pronta, deploy Vercel funzionante |
| 2 | Landing page completa | Landing live su sitorazzo.it |
| 3 | Onboarding brief form | Wizard post-pagamento funzionante |
| 4 | Pagine standalone + legali | Sito completo per SEO |
| 5 | Pagine SEO geo + verticali | Traffico organico locale |
