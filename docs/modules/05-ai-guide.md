# Module 05 — AI guide

## Purpose

A local shopping guide: the consumer describes a need, the guide states what it understood, and returns cross-store options with reasons. It never gates browsing.

## Rules

- The guide extracts intent; the catalogue supplies facts. The model never produces prices, stock, ratings, hours or availability.
- Ask a clarifying question only when an essential slot is missing and cannot be defaulted (for example, rental with no item at all). Otherwise search with sensible defaults and offer refinement chips.
- State the interpretation in one sentence ("Here's what I understood: wedding saree around ₹5,000 near Navrangpura").
- Show items over budget only within a stretch margin and label them "Over budget by ₹X".
- Each result shows up to three reasons built from stored facts: budget fit, tags, distance, rating, rental rate and deposit, coupon, showtimes.
- Follow-ups refine the current intent ("only silk", "cheaper", "near me") unless a new category is named.
- Every result opens the normal product, business or event page.
- Sponsored items are never inserted into guide results.
- Conversation history is visible to the user only. It is not shared with businesses.

## Prototype screens

`Guide.jsx`: empty state with prompts, chat, interpretation bubble, refinement chips, result cards with "Why this matches", compare sheet (up to 3), composer. The keyword parser there is the reference fallback and the test oracle.

## Intent schema

```json
{
  "type": "product | business | event | unknown",
  "categoryId": "fashion",
  "subject": "saree",
  "rent": false,
  "budgetPaise": 500000,
  "occasion": "wedding",
  "style": "silk",
  "nearOnly": false,
  "dates": null,
  "confidence": 0.82,
  "missing": []
}
```

## Interfaces

```
IntentParser.parse(text, previousIntent, locale) -> Intent
Explainer.reasons(item, intent, context) -> string[]   // deterministic, from stored facts
```

`IntentParser` has two implementations: the LLM-backed parser (with a JSON-schema constrained output and a 2 s timeout) and the keyword parser. If the LLM fails or times out, the keyword parser answers. Both are tested against the same fixture set.

## Endpoints

### POST /v1/guide/sessions        auth: optional

`201` → `{ "data": { "sessionId": "gs_…" } }`. Anonymous sessions live 24 h.

### POST /v1/guide/sessions/{id}/messages        auth: optional · idempotent

```json
{ "text": "I need a wedding saree around ₹5,000", "areaId": "area_nav", "filters": { "stretch": true } }
```

`200` →

```json
{
  "data": {
    "intent": { "type": "product", "categoryId": "fashion", "subject": "saree", "budgetPaise": 500000, "occasion": "wedding", "rent": false, "refined": false },
    "summary": "Here's what I understood: saree for a wedding around ₹5,000 near Navrangpura. I found 5 options across 3 stores. 2 are slightly over budget and marked.",
    "chips": [ { "key": "stretch", "label": "Allow +15%", "on": true }, { "key": "near", "label": "Within 5 km of Navrangpura", "on": false }, { "key": "style", "value": "silk", "label": "Silk", "on": false } ],
    "results": [ {
      "kind": "product", "item": { … product card … },
      "overBudgetPaise": 20000,
      "reasons": ["₹200 over your budget — shown as a close alternative", "Tagged for weddings by the store", "0.6 km from Satellite"]
    } ],
    "followUps": ["Show cheaper options", "Only near me", "Only silk"],
    "disclaimer": "Recommendations use merchant data, not live inventory."
  }
}
```

### PATCH /v1/guide/sessions/{id}/filters        auth: optional

Toggles a chip without a new message; returns the same shape.

### POST /v1/guide/compare        auth: optional

`{ "productIds": ["…", "…"] }` (2 or 3) → attribute table: price, store, distance, rating, stock state, and the union of attribute keys. Missing values are `null` and rendered as "—".

### GET /v1/guide/sessions/{id}        auth: owner

History for resuming a conversation.

## Real-time

Request and response. Show a typing indicator client-side while waiting. Target p95 under 2.5 s including the LLM call.

## Edge cases

- Unknown intent: reply with category chips; no results.
- Rental intent with no item ("something to rent this weekend"): search all rentals, sorted by distance.
- "Weekend" with rent means a time, not events.
- Budget below every item: return the closest options labelled over budget, or an empty state with "Browse all".
- Prompt injection in user text: the parser's output is schema-validated; free text is never executed or echoed into system prompts.
