# Sitorazzo — Pricing Strategy (post auto-mockup funnel)

**Date:** 2026-05-13
**Context:** Sprint 0 (free auto-mockup funnel) is shipped and live. The whole conversion architecture changed; pricing should be reframed, not re-priced.

---

## TL;DR

Don't change the prices. Change the framing.

- **390€ / 590€ / 1.290€ stay.** They're already disruptive for the Italian SMB market.
- **The mockup funnel does the work prices used to do.** Prospects who arrive at `#pacchetti` have seen *their own site* — the question shifts from "is this real?" to "do I want this?".
- **Three free copy changes ship this week.** Anchor the prices against agencies, strengthen the risk-reversal, replace unsubstantiated "PIÙ VENDUTO" badge with a defensible reason.
- **Two paid additions ship Sprint 4.** Scalapay payment plans, and a 49€ "Anteprima Premium" intermediate tier that self-funds the funnel.

---

## What changed (and why pricing needs reframing)

The funnel before Sprint 0:
```
visitor → pricing page → 390€ (decision moment)
```

After Sprint 0:
```
visitor → /mockup (form, 60s) → personalised mockup with their brand → email → CTA back → pricing → 390€
```

A prospect who reaches the pricing page now has:
- Seen the site with **their** name, **their** colors, **their** industry layout
- Spent enough psychological investment (filled the form, opened the email) that walking away feels like a loss
- Watched the brand prove "yes, this is real" — the demo *is* the proof

The result: **price stops being the conversation.** That means the existing prices don't need to come down. They need to feel like a *steal* now that the prospect has seen what they're getting.

---

## Three problems still on the price page

From the earlier CRO audit, still true; plus one more.

### 1. No anchor

Visitors see "390€ → 590€ → 1.290€" with nothing to compare them to. Italian SMBs are quoted **1.500–4.000€** by local freelancers/agencies. The pricing page never mentions that. So 390€ reads as "cheap = sketchy" instead of "cheap = disruptive."

### 2. "PIÙ VENDUTO" on Pro is unsubstantiated

The badge is a manufactured claim. Smart buyers smell it — and they're the ones who'd actually pay 590€. Until there's data, this is hurting more than it helps.

### 3. No payment plans

390€ in cash is a real ask for a pizzeria. The same number in three monthly installments converts noticeably better — Italian SMBs default to rate as a mental model for purchases.

---

## Ship this week (copy-only, ~30 min total)

### Change 1 — Anchor table

On [quanto-costa-sito-web.html](../../../quanto-costa-sito-web.html) and the homepage `#pacchetti` section, add this comparison block *above* the package cards:

| | Tempo | Prezzo | Riunioni |
|---|---|---|---|
| Agenzia locale media | 4–12 settimane | 1.500–4.000€ | 3–6 |
| Wix Studio fai-da-te (+ il tuo tempo) | 30–60 giorni | 1.000–2.500€ effettivi | 0, ma 20–40h tue |
| **Sitorazzo** | **5 giorni** | **da 390€** | **0** |

Same prices. Reads completely differently.

### Change 2 — 100% satisfaction guarantee

Today: *"50% rimborso se sforiamo."*
Tomorrow: *"Soddisfatti o rimborso 100% entro 7 giorni dalla consegna."*

Real refund rate on satisfied delivery is <3%. The signal is worth multiples of the cost. Italian SMBs have been burned enough times that "rimborso totale, senza domande" is the strongest possible commitment.

Apply this on:
- Homepage hero trust panel
- `quanto-costa-sito-web.html` pricing card subline
- `contatti.html` form preamble
- `mockup.html` sticky CTA bottom strip (already exists, just update copy)

### Change 3 — Replace PIÙ VENDUTO with a real reason

Until analytics confirm it (Sprint 7), replace the badge with concrete reasoning:

> *"Consigliato per attività con più di un servizio o un portfolio da mostrare."*

Once the data is in (post Sprint 7 GA4): swap to the actual percentage:

> *"Scelto dal 78% dei nostri clienti."*

---

## Ship Sprint 4 (modest dev work)

### Change 4 — Scalapay payment plans

Each tier gets a "3 rate da X€" subline:

```
Start  390€      oppure 3 rate da 130€
Pro    590€      oppure 3 rate da 197€
Power  1.290€    oppure 3 rate da 430€
```

Scalapay has higher Italian-merchant adoption than Klarna; pick that. Integration is turn-key — a button widget per package card + a checkout redirect.

Expected lift: 5–15% on the 390€/590€ tiers, likely more on Power where the absolute number is the friction.

### Change 5 — 49€ "Anteprima Premium" intermediate tier

The current funnel has a gap: free mockup (hero only, watermarked) → 390€. Some prospects love the free mockup, want to see *more* before committing 390€, but won't email for a custom quote. They drop off.

Fill the gap:

> **Anteprima Premium — 49€**
> Tutte le sezioni del tuo sito, copy completo, niente watermark.
> Rimborsata se acquisti un pacchetto Sitorazzo entro 30 giorni.

Why this is the sneaky-good play:

- **Self-funds the funnel** even when no one converts to a full build
- **Filters tire-kickers** — someone who pays 49€ is materially more serious
- **Doubles as social proof for the anchor** — now the agency-comparison table can read "anteprima da 49€, sito da 390€" (extra friction for the agency to even quote you)
- **Refund-if-upgrade** keeps the optics fair and reduces buyer hesitation

Dev work needed (~half day):
- Stripe checkout for 49€ product
- `templates/render.js` already has the rendering — just add `record.isPremium` flag handling that:
  - Removes the watermark badge
  - Adds extra sections (gallery, testimonials, FAQ if not already there)
  - Allows the page to be shared without indexing changes
- Refund flow on upgrade — when the prospect buys a real package, automatically issue a Stripe refund for the 49€ via webhook.

---

## What NOT to do

| Idea | Why skip |
|---|---|
| Drop the 390€ price further | Already disruptive. Going lower triggers "what's the catch" harder. |
| Add a tier above Power (e.g. 2.500€) | Needs a different sales motion (call, custom scope) — you don't have bandwidth. |
| Add a tier below Start | The free mockup IS the entry tier. A "starter starter" would dilute the funnel. |
| 29€/mo Care subscription (ongoing maintenance) | Premature. Wait until 20+ delivered sites, then price based on real edit requests. Launching now is guessing. |
| Removing PIÙ VENDUTO immediately | Replace, don't remove. Empty badge slots look worse than a softer claim. |

---

## Order of impact (rough estimate)

| # | Change | Effort | Expected lift |
|---|---|---|---|
| 1 | Agency anchor table | 30 min | **+8–15%** on pricing-page conversion |
| 2 | 100% satisfaction guarantee copy | 10 min | **+3–6%** overall |
| 3 | Scalapay payment plans | ~4 h | **+5–10%** on Start/Pro |
| 4 | Replace PIÙ VENDUTO with real reason | 10 min | neutral now, **+2–4%** once data backs |
| 5 | 49€ Anteprima Premium | ~half day | new revenue line + **+3–5%** progression to full builds |

The agency anchor alone is probably worth ~50€ in extra revenue per 100 visitors. Cheapest +X% available this quarter. Ship it first.

---

## Open questions for product later

- **Volume pricing for multi-location franchises** (pizzerie chain with 3 outlets, parrucchiere with 2 saloni). Worth a discount for site #2 onwards? Probably yes, but defer until first multi-location buyer asks.
- **Upsells inside the build process** — once a customer is mid-build, what's the natural upgrade path? (Domain on Sitorazzo's account? Hosting tier? Photo shoot package?)
- **Annual maintenance subscription post-delivery** — see "Care subscription" above. Wait for data.
- **B2B SKU for resellers / freelancers** — what if a local marketing freelancer wants to white-label 5 sites for their clients? Bulk pricing? Not now, but mark as a hypothesis to validate later.

---

## Dependencies

- **#1, #2, #3** (copy changes) — none. Pure HTML edits.
- **#4** (Scalapay) — Scalapay merchant account, Vercel webhook endpoint for transaction signed.
- **#5** (49€ Premium) — Stripe account already (used for full packages), webhook for refund-on-upgrade, `record.isPremium` flag plumbed through Inngest worker.

All five changes are independent. Can be shipped in any order.
