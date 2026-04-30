import formidable from 'formidable';
import { google } from 'googleapis';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

/* ------------------------------------------------------------------ */
/*  Auth                                                                 */
/* ------------------------------------------------------------------ */
function getAuth() {
  const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!rawCredentials) {
    const error = new Error('GOOGLE_SERVICE_ACCOUNT_JSON non configurato.');
    error.statusCode = 500;
    throw error;
  }

  let credentials;
  try {
    credentials = JSON.parse(rawCredentials);
  } catch {
    const error = new Error('GOOGLE_SERVICE_ACCOUNT_JSON non è un JSON valido.');
    error.statusCode = 500;
    throw error;
  }

  return new google.auth.GoogleAuth({
    credentials,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
    ],
  });
}

/* ------------------------------------------------------------------ */
/*  Drive helpers                                                        */
/* ------------------------------------------------------------------ */
async function createFolder(drive, name, parentId) {
  const res = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [parentId],
    },
    fields: 'id, webViewLink',
  });
  return res.data;
}

async function uploadFile(drive, file, folderId) {
  const res = await drive.files.create({
    requestBody: {
      name: file.originalFilename || file.newFilename,
      parents: [folderId],
    },
    media: {
      mimeType: file.mimetype || 'application/octet-stream',
      body: fs.createReadStream(file.filepath),
    },
    fields: 'id, name',
  });
  return res.data;
}

/* ------------------------------------------------------------------ */
/*  Google Doc builder                                                   */
/* ------------------------------------------------------------------ */
function briefToDocRequests(brief) {
  const lines = [];

  const add = (text, bold, heading) => lines.push({ text, bold: !!bold, heading: heading || null });

  add(`BRIEF CLIENTE — ${brief.nome || ''}`, true, 'HEADING_1');
  add(`Inviato il: ${new Date(brief.submittedAt).toLocaleString('it-IT')}`);
  add('');

  add('ATTIVITÀ', true, 'HEADING_2');
  add(`Nome: ${brief.nome || '—'}`);
  add(`Città: ${brief.citta || '—'}`);
  add(`Settore: ${brief.settore || '—'}`);
  add(`Descrizione: ${brief.descrizione || '—'}`);
  add('');

  add('CONTATTI', true, 'HEADING_2');
  add(`Referente: ${brief.referente || '—'}`);
  add(`Ruolo: ${brief.ruolo || '—'}`);
  add(`Email: ${brief.email || '—'}`);
  add(`Telefono: ${brief.telefono || '—'}`);
  add(`WhatsApp: ${brief.whatsapp || '—'}`);
  add('');

  add('PACCHETTO', true, 'HEADING_2');
  add(`Piano: ${brief.pacchetto || '—'}`);
  add('');

  add('LOGO E IMMAGINI', true, 'HEADING_2');
  add(`Stato logo: ${brief.logoStatus || '—'}`);
  add('');

  add('DOMINIO', true, 'HEADING_2');
  add(`Dominio desiderato: ${brief.dominio || '—'}`);
  add(`Stato dominio: ${brief.dominioStatus || '—'}`);
  add(`Sito esistente: ${brief.sitoEsistente || '—'}`);
  if (brief.sitoUrl) add(`URL sito: ${brief.sitoUrl}`);
  add('');

  add('SOCIAL', true, 'HEADING_2');
  add(`Instagram: ${brief.social?.instagram || '—'}`);
  add(`Facebook: ${brief.social?.facebook || '—'}`);
  add(`TikTok: ${brief.social?.tiktok || '—'}`);
  add(`LinkedIn: ${brief.social?.linkedin || '—'}`);
  add(`Altri link: ${brief.altriLink || '—'}`);
  add(`Visibilità social: ${brief.socialVisibility || '—'}`);
  add('');

  add('SEDE E ORARI', true, 'HEADING_2');
  add(`Indirizzo: ${brief.indirizzo || '—'}`);
  add(`Tipo sede: ${brief.tipoSede || '—'}`);
  if (Array.isArray(brief.orari)) {
    brief.orari.forEach(g => {
      add(`${g.giorno}: ${g.chiuso ? 'Chiuso' : `${g.apre} – ${g.chiude}`}`);
    });
  }
  add('');

  add('STILE E PREFERENZE', true, 'HEADING_2');
  add(`Mood: ${brief.mood || '—'}`);
  add(`Colori brand: ${brief.coloriLogo || '—'}`);
  add(`Riferimenti: ${brief.riferimenti || '—'}`);
  add(`NON vuole: ${brief.nonVuole || '—'}`);
  add(`Note finali: ${brief.noteFinali || '—'}`);

  // Build Docs API batchUpdate requests (insert from end to preserve indices)
  const fullText = lines.map(l => l.text + '\n').join('');
  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: fullText,
      },
    },
  ];

  // Apply heading styles
  let index = 1;
  for (const line of lines) {
    const len = line.text.length + 1; // +1 for \n
    if (line.heading) {
      requests.push({
        updateParagraphStyle: {
          range: { startIndex: index, endIndex: index + len },
          paragraphStyle: { namedStyleType: line.heading },
          fields: 'namedStyleType',
        },
      });
    }
    if (line.bold) {
      requests.push({
        updateTextStyle: {
          range: { startIndex: index, endIndex: index + line.text.length },
          textStyle: { bold: true },
          fields: 'bold',
        },
      });
    }
    index += len;
  }

  return requests;
}

/* ------------------------------------------------------------------ */
/*  Handler                                                              */
/* ------------------------------------------------------------------ */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const parentFolderId = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !parentFolderId) {
    return res.status(500).json({
      error: 'Google Drive non è configurato. Mancano GOOGLE_SERVICE_ACCOUNT_JSON o GOOGLE_DRIVE_PARENT_FOLDER_ID.',
    });
  }

  // Parse multipart
  const form = formidable({
    maxFileSize: 15 * 1024 * 1024, // 15MB per file
    maxTotalFileSize: 50 * 1024 * 1024, // 50MB totale
    multiples: true,
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(req);
  } catch (err) {
    console.error('Form parse error:', err);
    return res.status(400).json({ error: 'Errore nel parsing del form.' });
  }

  let brief;
  try {
    const rawBriefData = Array.isArray(fields.briefData) ? fields.briefData[0] : fields.briefData;
    brief = JSON.parse(rawBriefData || '{}');
  } catch {
    return res.status(400).json({ error: 'briefData non valido.' });
  }

  // Google auth
  let auth;
  try {
    auth = getAuth();
  } catch (err) {
    console.error('Auth error:', err);
    return res.status(err.statusCode || 500).json({ error: err.message || 'Errore autenticazione Google.' });
  }

  const drive = google.drive({ version: 'v3', auth });
  const docs  = google.docs({ version: 'v1', auth });

  try {
    // 1. Crea cartella cliente
    const date = new Date().toLocaleDateString('it-IT').replace(/\//g, '-');
    const customerName = String(brief.nome || 'Cliente').replace(/[\\/:*?"<>|]/g, '-').trim() || 'Cliente';
    const folderName = `${customerName} — ${date}`;
    const folder = await createFolder(drive, folderName, parentFolderId);

    // 2. Crea Google Doc con il brief
    const doc = await docs.documents.create({
      requestBody: { title: `Brief — ${brief.nome || 'Cliente'}` },
    });
    const docId = doc.data.documentId;

    // Sposta il doc nella cartella cliente
    await drive.files.update({
      fileId: docId,
      addParents: folder.id,
      removeParents: 'root',
      fields: 'id, parents',
    });

    // Scrivi il contenuto del brief nel doc
    const docRequests = briefToDocRequests(brief);
    await docs.documents.batchUpdate({
      documentId: docId,
      requestBody: { requests: docRequests },
    });

    // 3. Carica file allegati
    const uploadedFiles = [];
    const fileList = files.file
      ? (Array.isArray(files.file) ? files.file : [files.file])
      : [];

    for (const file of fileList) {
      const uploaded = await uploadFile(drive, file, folder.id);
      uploadedFiles.push(uploaded.name);
    }

    return res.status(200).json({
      ok: true,
      folderName,
      folderLink: folder.webViewLink,
      filesUploaded: uploadedFiles.length,
    });

  } catch (err) {
    console.error('Drive/Docs error:', err);
    return res.status(500).json({ error: 'Errore durante il salvataggio su Google Drive.' });
  }
}
