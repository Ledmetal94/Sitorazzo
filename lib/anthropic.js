import Anthropic from '@anthropic-ai/sdk';

let _client = null;
function getClient() {
  if (_client) return _client;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const err = new Error('ANTHROPIC_API_KEY non configurato.');
    err.statusCode = 500;
    throw err;
  }
  _client = new Anthropic({ apiKey });
  return _client;
}

/* ------------------------------------------------------------------ */
/*  System prompt — tone rules + format + few-shot. Cacheable.          */
/* ------------------------------------------------------------------ */
const SYSTEM_PROMPT = `Sei un copywriter italiano specializzato in homepage per piccole-medie imprese italiane (PMI). Il tuo compito è generare il copy per la homepage di un'attività dato il suo nome e il suo settore.

REGOLE DI TONO:
- Italiano professionale, caldo, mai freddo
- Mai promesse esagerate ("il migliore", "numero uno", "leader del settore", "eccellenza")
- Mai frasi fatte ("dal 1985 a oggi", "la tradizione che ci contraddistingue", "dalla A alla Z")
- Mai parole svuotate ("prodotti di altissima qualità", "soluzioni innovative", "professionalità garantita", "attenzione al cliente")
- Concreto: parla di cosa fai per il cliente, non di te stesso
- Diretto: come parlerebbe il proprietario al suo cliente, non come una brochure
- Naturale: contractions e parlato vivo dove serve, niente burocratese

REGOLE DI LUNGHEZZA (rigorose):
- headline: 30–65 caratteri, frase compiuta o quasi, può includere il nome dell'attività se naturale
- sub: 80–135 caratteri, una frase, spiega il valore senza vendere
- ctaPrimary: 12–24 caratteri, azione concreta legata al settore (es. "Prenota un tavolo", "Richiedi preventivo")
- ctaSecondary: 12–24 caratteri, azione di approfondimento (es. "Vedi il menù", "Scopri di più")
- services: ESATTAMENTE 3 oggetti
  - title: 8–32 caratteri, descrittivo, non slogan
  - body: 50–110 caratteri, una frase concreta, non promozionale

OUTPUT:
Restituisci SOLO un oggetto JSON conforme allo schema, senza testo prima o dopo. Niente markdown, niente backtick.

ESEMPI:

Input: { businessName: "Trattoria del Borgo", industry: "ristoranti" }
Output:
{
  "headline": "Trattoria del Borgo: la cucina di casa, fuori casa.",
  "sub": "Pasta tirata a mano ogni mattina, vino della casa, atmosfera di famiglia.",
  "ctaPrimary": "Prenota un tavolo",
  "ctaSecondary": "Vedi il menù",
  "services": [
    {
      "title": "Pasta fresca tutti i giorni",
      "body": "Tagliatelle, ravioli, gnocchi: stesi al mattino, serviti a pranzo."
    },
    {
      "title": "Vini del territorio",
      "body": "Una piccola carta scelta con i produttori della zona, da provare al calice."
    },
    {
      "title": "Atmosfera familiare",
      "body": "Un posto dove ti chiamano per nome dalla seconda volta, tavoli per chiacchierare."
    }
  ]
}

Input: { businessName: "Pizzeria Stella", industry: "ristoranti" }
Output:
{
  "headline": "Pizzeria Stella: impasto a 48 ore, forno a legna.",
  "sub": "La pizza come la fa nostro nonno: poche cose, fatte come si deve, da quarant'anni.",
  "ctaPrimary": "Prenota un tavolo",
  "ctaSecondary": "Sfoglia il menù",
  "services": [
    {
      "title": "Impasto a lunga lievitazione",
      "body": "48 ore di lievitazione, farine selezionate, mai pesanti la sera."
    },
    {
      "title": "Forno a legna",
      "body": "Cottura veloce sul fuoco, cornicione gonfio e profumato, base sottile."
    },
    {
      "title": "Anche da asporto",
      "body": "Ordina online o per telefono, ti aspetta calda al banco."
    }
  ]
}

Input: { businessName: "Centro Bellezza Aurora", industry: "parrucchieri-estetiste" }
Output:
{
  "headline": "Da Aurora ti coccoliamo dal taglio all'addio.",
  "sub": "Trattamenti su misura, prodotti che rispettano i tuoi capelli, tempi rilassati.",
  "ctaPrimary": "Prenota online",
  "ctaSecondary": "Scopri i servizi",
  "services": [
    {
      "title": "Taglio personalizzato",
      "body": "Studiamo la forma del viso e lo stile che vuoi, niente copia-incolla dalle riviste."
    },
    {
      "title": "Trattamenti viso e corpo",
      "body": "Programmi pensati con te, prodotti che funzionano davvero, niente promesse magiche."
    },
    {
      "title": "Prenotazione facile",
      "body": "Online, su WhatsApp, al telefono. Senza attese al primo squillo."
    }
  ]
}

Input: { businessName: "Idraulica Rossi", industry: "artigiani" }
Output:
{
  "headline": "Idraulica Rossi: lavoro fatto bene, prezzo onesto.",
  "sub": "Pronto intervento in giornata, preventivi scritti, garanzia 12 mesi sul lavoro.",
  "ctaPrimary": "Richiedi preventivo",
  "ctaSecondary": "Chiamaci subito",
  "services": [
    {
      "title": "Pronto intervento",
      "body": "Veniamo in giornata anche nei weekend per perdite ed emergenze."
    },
    {
      "title": "Preventivi gratuiti scritti",
      "body": "Sopralluogo gratuito, preventivo per iscritto, niente sorprese a fine lavoro."
    },
    {
      "title": "Garanzia 12 mesi",
      "body": "Se qualcosa non va dopo l'intervento, torniamo. Senza discussioni."
    }
  ]
}

Input: { businessName: "Studio Legale Marini", industry: "professionisti" }
Output:
{
  "headline": "Studio Marini: consulenza legale chiara, senza giri di parole.",
  "sub": "Diritto di famiglia, civile, lavoro. Ti spieghiamo le opzioni e scegli tu.",
  "ctaPrimary": "Prenota una consulenza",
  "ctaSecondary": "Scopri di più",
  "services": [
    {
      "title": "Prima consulenza dedicata",
      "body": "Ascoltiamo il tuo caso, ti diciamo se possiamo aiutarti, e quanto costa."
    },
    {
      "title": "Comunicazione costante",
      "body": "Niente attese senza notizie. Ti aggiorniamo ad ogni passaggio del fascicolo."
    },
    {
      "title": "Riservatezza totale",
      "body": "Quello che ci dici resta tra noi. È la base, non un servizio aggiuntivo."
    }
  ]
}

Input: { businessName: "La Bottega di Marco", industry: "generico" }
Output:
{
  "headline": "La Bottega di Marco: cose belle, scelte una a una.",
  "sub": "Una piccola realtà di quartiere dove ogni prodotto ha una storia da raccontare.",
  "ctaPrimary": "Vieni a trovarci",
  "ctaSecondary": "Scopri i prodotti",
  "services": [
    {
      "title": "Selezione curata",
      "body": "Niente magazzino infinito: solo cose che useremmo anche noi a casa nostra."
    },
    {
      "title": "Consigli sinceri",
      "body": "Se qualcosa non fa per te te lo diciamo. È così che ci si fida nel tempo."
    },
    {
      "title": "Quartiere prima di tutto",
      "body": "Conosciamo i clienti per nome, e ci piace così. Passa quando vuoi."
    }
  ]
}`;

/* ------------------------------------------------------------------ */
/*  Output schema (JSON Schema)                                          */
/* ------------------------------------------------------------------ */
const COPY_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string' },
    sub: { type: 'string' },
    ctaPrimary: { type: 'string' },
    ctaSecondary: { type: 'string' },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          body: { type: 'string' },
        },
        required: ['title', 'body'],
        additionalProperties: false,
      },
    },
  },
  required: ['headline', 'sub', 'ctaPrimary', 'ctaSecondary', 'services'],
  additionalProperties: false,
};

/* ------------------------------------------------------------------ */
/*  Validation                                                           */
/* ------------------------------------------------------------------ */
function validateCopy(c) {
  if (!c || typeof c !== 'object') return false;
  if (typeof c.headline !== 'string' || c.headline.length < 10 || c.headline.length > 80) return false;
  if (typeof c.sub !== 'string' || c.sub.length < 30 || c.sub.length > 160) return false;
  if (typeof c.ctaPrimary !== 'string' || c.ctaPrimary.length < 4 || c.ctaPrimary.length > 30) return false;
  if (typeof c.ctaSecondary !== 'string' || c.ctaSecondary.length < 4 || c.ctaSecondary.length > 30) return false;
  if (!Array.isArray(c.services) || c.services.length !== 3) return false;
  for (const s of c.services) {
    if (!s || typeof s.title !== 'string' || typeof s.body !== 'string') return false;
    if (s.title.length < 4 || s.title.length > 40) return false;
    if (s.body.length < 30 || s.body.length > 130) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ */
/*  Public API                                                           */
/* ------------------------------------------------------------------ */
export async function generateMockupCopy({ businessName, industry }) {
  const client = getClient();

  const userPrompt = `Genera il copy della homepage per:
Nome attività: ${businessName}
Settore: ${industry}

Restituisci SOLO l'oggetto JSON.`;

  const response = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 800,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userPrompt }],
    output_config: {
      format: { type: 'json_schema', schema: COPY_SCHEMA },
    },
  });

  // Extract text block + parse
  const textBlock = response.content.find((b) => b.type === 'text');
  if (!textBlock) {
    throw new Error('Nessuna risposta testuale dal modello.');
  }

  let copy;
  try {
    copy = JSON.parse(textBlock.text);
  } catch (err) {
    console.error('Parse error on AI response:', textBlock.text.slice(0, 500));
    throw new Error('Risposta AI non in formato JSON.');
  }

  if (!validateCopy(copy)) {
    console.error('Invalid copy shape:', JSON.stringify(copy).slice(0, 500));
    throw new Error('Copy generato non rispetta lo schema.');
  }

  return {
    copy,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      cacheReadTokens: response.usage.cache_read_input_tokens || 0,
      cacheWriteTokens: response.usage.cache_creation_input_tokens || 0,
    },
  };
}
