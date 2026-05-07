import { Resend } from 'resend';

let _resend = null;
function getResend() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    const err = new Error('RESEND_API_KEY non configurato.');
    err.statusCode = 500;
    throw err;
  }
  _resend = new Resend(key);
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || 'Sitorazzo <hello@sitorazzo.it>';
const REPLY_TO = process.env.RESEND_REPLY_TO || 'info@sitorazzo.it';
const SITE_URL = process.env.SITE_URL || 'https://sitorazzo.it';

function esc(s) {
  if (s == null) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildHtml({ businessName, mockupUrl, primary, textOnPrimary }) {
  const safeName = esc(businessName);
  const url = esc(mockupUrl);
  const accent = esc(primary || '#FFD60A');
  const onAccent = esc(textOnPrimary || '#0A0A0A');

  return `<!DOCTYPE html>
<html lang="it">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Ecco la tua anteprima — Sitorazzo</title>
</head>
<body style="margin:0;padding:0;background:#FAFAFA;font-family:'Helvetica Neue',Arial,sans-serif;color:#0A0A0A;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FAFAFA;">
  <tr><td align="center" style="padding:40px 20px;">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(10,10,10,0.06);">
      <tr><td style="background:${accent};padding:40px 32px;text-align:center;">
        <div style="font-family:Helvetica,Arial,sans-serif;font-weight:900;font-size:28px;letter-spacing:-0.02em;color:${onAccent};line-height:1.2;">
          La tua anteprima è pronta
        </div>
        <div style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:${onAccent};opacity:0.8;margin-top:8px;">
          Generata da Sitorazzo · 60 secondi
        </div>
      </td></tr>

      <tr><td style="padding:32px;">
        <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:#0A0A0A;">
          Ciao,<br><br>
          ecco l'anteprima della homepage di <strong>${safeName}</strong> con i tuoi colori, il tuo settore e una bozza di copy. Puoi aprirla, scorrerla, e immaginare il tuo sito già online.
        </p>

        <div style="margin:28px 0;text-align:center;">
          <a href="${url}" style="display:inline-block;background:#FFD60A;color:#0A0A0A;font-family:Helvetica,Arial,sans-serif;font-weight:700;font-size:16px;text-decoration:none;padding:16px 32px;border-radius:12px;">
            Apri la mia anteprima →
          </a>
        </div>

        <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:rgba(10,10,10,0.7);">
          <strong style="color:#0A0A0A;">Ti piace?</strong> Lo facciamo davvero in 5 giorni, a partire da 390€. Zero riunioni, prezzo fisso, 50% rimborso se sforiamo.
        </p>

        <p style="margin:16px 0 0;font-size:13px;line-height:1.6;color:rgba(10,10,10,0.5);">
          Hai dubbi? Rispondi a questa email — leggiamo tutto.<br>
          Il link dell'anteprima è personale e resta attivo per 30 giorni.
        </p>
      </td></tr>

      <tr><td style="background:#0A0A0A;padding:24px 32px;text-align:center;color:rgba(255,255,255,0.65);font-size:12px;line-height:1.6;">
        <div style="margin-bottom:8px;color:#fff;font-weight:700;letter-spacing:0.04em;">SITORAZZO</div>
        Siti web professionali per PMI italiane · Latina, Lazio<br>
        <a href="${esc(SITE_URL)}" style="color:#FFD60A;text-decoration:none;">sitorazzo.it</a>
      </td></tr>
    </table>

    <div style="font-size:11px;color:rgba(10,10,10,0.4);margin-top:16px;line-height:1.5;">
      Hai ricevuto questa email perché hai richiesto un'anteprima sul nostro sito.<br>
      © 2026 Sitorazzo · Virtual Zone S.r.l. · P.IVA IT03696930591
    </div>

  </td></tr>
</table>
</body>
</html>`;
}

function buildText({ businessName, mockupUrl }) {
  return `Ciao,

ecco l'anteprima della homepage di ${businessName} con i tuoi colori, il tuo settore e una bozza di copy.

Apri la tua anteprima:
${mockupUrl}

Ti piace? Lo facciamo davvero in 5 giorni, a partire da 390€. Zero riunioni, prezzo fisso, 50% rimborso se sforiamo.

Hai dubbi? Rispondi a questa email — leggiamo tutto.
Il link dell'anteprima è personale e resta attivo per 30 giorni.

—
Sitorazzo · Latina, Lazio
${SITE_URL}`;
}

export async function sendMockupReadyEmail({ to, businessName, mockupUrl, primary, textOnPrimary }) {
  const resend = getResend();
  const subject = `Ecco la tua anteprima, ${businessName}`;
  const html = buildHtml({ businessName, mockupUrl, primary, textOnPrimary });
  const text = buildText({ businessName, mockupUrl });

  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    reply_to: REPLY_TO,
    subject,
    html,
    text,
    tags: [
      { name: 'type', value: 'mockup_ready' },
      { name: 'industry', value: 'mockup' },
    ],
  });

  if (error) {
    const err = new Error(`Resend error: ${error.message || error.name || 'unknown'}`);
    err.original = error;
    throw err;
  }

  return data; // { id }
}
