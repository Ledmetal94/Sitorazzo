# Google Drive onboarding setup

## Stato corrente

Il wizard invia un `multipart/form-data` a `/api/submit-brief`.

- `briefData`: JSON serializzato del brief
- `file`: uno o più allegati caricati dal cliente

L'API Vercel:

- crea una cartella cliente in Google Drive
- crea un Google Doc riepilogo brief
- carica gli allegati nella stessa cartella
- ritorna errore JSON gestito se mancano le env Google

Non usare Make, Airtable o Uploadcare per questo flusso.

## Env richieste su Vercel

Configurare in Production, Preview e Development se serve testare localmente con `vercel env pull`.

```bash
vercel env add GOOGLE_SERVICE_ACCOUNT_JSON production
vercel env add GOOGLE_DRIVE_PARENT_FOLDER_ID production
```

Ripetere per `preview` e `development` se necessari.

## Valori

`GOOGLE_SERVICE_ACCOUNT_JSON` deve contenere il JSON completo del service account Google.

`GOOGLE_DRIVE_PARENT_FOLDER_ID` deve contenere l'ID della cartella padre Drive dove creare le cartelle cliente.

La cartella padre deve essere condivisa con l'email `client_email` del service account con permesso Editor.

## QA

Senza env:

- submit dal wizard mostra errore visibile
- API risponde con JSON `500`
- nessun crash lato client

Con env:

- submit crea cartella cliente
- submit crea Google Doc riepilogo brief
- submit carica gli allegati nella stessa cartella
- API risponde `200` con `ok: true`, `folderName`, `folderLink`, `filesUploaded`

## Verifica deploy 2026-04-30

Deploy produzione generato dalla push su `main`:

`https://repo-oyp1l8p48-giacomos-projects-5f88b614.vercel.app`

Stato Vercel: `Ready`.

Nota: al momento della verifica il progetto risponde `401` sulle route pubbliche perché è attiva la protezione Vercel Authentication. `vercel env ls` non mostra env configurate, quindi il test con Google Drive reale resta bloccato finché non vengono aggiunte le env sopra.
