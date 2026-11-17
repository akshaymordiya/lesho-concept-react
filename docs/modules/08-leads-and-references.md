# Module 08 — Leads and references

## Purpose

The core of Lesho. One foundation for every consumer intent sent to a business, with category-specific forms, a public reference, a status path, evidence, attribution and billing state.

## Lead types

| Type | Created from | Category examples | Typical outcome |
| --- | --- | --- | --- |
| `enquiry` | Product, business or show page | Availability, quotation, appointment, trial, callback, consultation, venue enquiry | `contacted`, `qualified`, `converted` |
| `visit` | Restaurant "Plan a visit" | Food | `visited` |
| `event_request` | Event "Request tickets" | Events, entertainment | `attended` (organiser-confirmed) |
| `event_enquiry` | Event "Enquire" | Events, entertainment | `contacted` |
| `claim` | Offer or coupon | All | `redeemed` (module 07) |
| `rental` | Rental listing | All | `handed_over`, `returned` (module 09) |

Clicks (call, WhatsApp, directions, external booking link) are **attribution events**, not leads.

## Rules

1. Creating a lead requires: a signed-in consumer with a name, a recorded consent, the category's required fields, and a verified or pending (not suspended) business.
2. Wording: every confirmation states what the lead is not ("not a confirmed reservation", "not a ticket", "nothing has been booked or purchased").
3. Reference format `LSH-{PREFIX}-{XXXXX}`. Prefix from the category lead config (`ENQ`, `VIS`, `EVT`, `APT`, `QUO`, `CON`, `SRV`, `TRL`, `CBK`, `ENT`, `OFR`, `RNT`). Body is 5 characters from `ABCDEFGHJKMNPQRSTUVWXYZ23456789`.
4. Duplicate rule (configurable): same consumer, same business, same subject within 24 hours → the new lead is created with status `invalid`, `duplicateOfId` set, and is never billed. The consumer is told they already have an open request.
5. A thread (module 10) is created with every lead.
6. Response expectation: merchants are reminded at 24 hours; an unacknowledged lead expires at 72 hours and is not billed.
7. Evidence levels: `none` → `merchant_reported` → `reference_checked` → `consumer_confirmed`. "Verified" appears in the UI only for `reference_checked` or `consumer_confirmed`.
8. Disputes: a merchant can dispute a lead (spam, duplicate, wrong business, unreachable). Billing goes `on_hold` until an admin resolves it.
9. Staff can act only on leads for their branches.

## Prototype screens

`Flows.jsx` → `LeadSheet` (category-aware enquiry), `VisitIntent`, `RefConfirm`. `Activity.jsx` (enquiries list with search and filters, QR popover). `Merchant.jsx` → `MLeads` (filters by click, enquiry, intent, verified), `MLeadDetail` (status actions, evidence button, dispute), dashboard reference lookup.

## Consumer endpoints

### POST /v1/leads        auth: consumer · idempotent

```json
{
  "type": "enquiry",
  "businessId": "biz_rangoli", "branchId": "br_cg",
  "subject": { "type": "product", "id": "prd_p1", "variant": "Magenta" },
  "options": ["Colour options"],
  "note": "Is this available in a deeper maroon?",
  "details": {},
  "consents": ["share_name", "share_phone"],
  "source": { "surface": "guide", "guideSessionId": "gs_…" }
}
```

For `visit`: `"details": { "date": "2026-11-15", "window": "20:00-20:30", "partySize": 3 }`.
For `event_request`: `"details": { "eventId": "evt_ev1", "quantity": 2 }`.

`201` →

```json
{
  "data": {
    "id": "led_…", "reference": "LSH-ENQ-RDHNX", "type": "enquiry", "typeLabel": "Availability enquiry",
    "status": "created", "statusLabel": "Sent to business",
    "business": { "id": "…", "name": "Rangoli Silks", "verified": true },
    "subject": { "type": "product", "id": "prd_p1", "name": "Banarasi silk saree, magenta & gold" },
    "details": { … }, "createdAt": "…",
    "threadId": "thr_…",
    "qr": { "payload": "lesho://ref/LSH-ENQ-RDHNX" },
    "timeline": [ { "step": "created", "label": "Enquiry created", "state": "done" }, { "step": "delivered", "label": "Sent to the business", "state": "done" }, { "step": "acknowledged", "label": "Business acknowledges", "state": "next" }, { "step": "contacted", "label": "Business contacts you", "state": "todo" } ],
    "disclaimer": "Nothing has been booked or purchased."
  }
}
```

Errors: `422 validation_failed` (`option_or_note_required`, `party_size_out_of_range`, `date_in_past`), `422 consent_required`, `409 duplicate_lead` (with `existingLeadId`; returned instead of creating when the client sets `?onDuplicate=return`), `404 business_unavailable`, `429`.

### GET /v1/me/leads        auth: consumer

`?q=&group=active|past&type=rental|claim|…&cursor=`. Search matches reference, business name, subject, status label and details. Each item: reference, type label, business, subject, status label and tone, `expiresAt` (claims), `unreadMessages`.

### GET /v1/me/leads/{id}        auth: consumer

Full lead with timeline, rental or claim block, and thread id.

### POST /v1/me/leads/{id}/cancel        auth: consumer

Allowed before an outcome. Closes the thread for new messages after a final system message.

### POST /v1/me/leads/{id}/confirm-outcome        auth: consumer

`{ "outcome": "visited", "happened": true }`. Raises evidence to `consumer_confirmed` where the outcome is already merchant-reported.

### POST /v1/events/clicks        auth: optional

`{ "type": "call_click|whatsapp_click|direction_click|external_click", "businessId": "…", "subject": { "type": "product", "id": "…" }, "source": { "surface": "product_page" } }` → `204`, plus the deep link to open.

## Merchant endpoints

### GET /v1/merchant/leads        staff+

`?kind=click|enquiry|intent|verified&status=&branchId=&q=&cursor=`. `kind` groups: `intent` covers visit, event request, rental request and claim before an outcome; `verified` covers reference-checked outcomes; `click` returns attribution events shaped like leads with `billing: not_billable`.

Item:

```json
{ "id": "led_…", "reference": "LSH-ENQ-7Q2X8", "kind": "enquiry", "typeLabel": "Availability enquiry",
  "consumer": { "displayName": "Sneha K." }, "subjectName": "…", "sourceLabel": "AI guide result",
  "status": "created", "statusLabel": "New", "billing": "pending", "billingLabel": "Not billed yet",
  "unreadMessages": 1, "expiresAt": null, "createdAt": "…" }
```

### GET /v1/merchant/leads/{id}        staff+

Adds `options`, `note`, `details`, `consumer.phone` (only with consent), `timeline`, `rental` or `claim` blocks, allowed `actions[]`.

### POST /v1/merchant/leads/{id}/{action}        staff+ · idempotent

| Action | Body | Effect |
| --- | --- | --- |
| `acknowledge` | — | `created/delivered → acknowledged` |
| `contacted` | — | `→ contacted`; enquiry becomes billable as `qualified_enquiry` if the rule says so |
| `qualified` | — | `→ qualified` |
| `confirm-visit` | — | visit intent `→ visit_confirmed` |
| `not-interested`, `unreachable` | `{note?}` | closes the lead |
| `reference-checked` | `{branchId, method}` | outcome with evidence `reference_checked` (visit, attended, redeemed) |
| `report-sale` | `{amountPaise?}` | outcome `converted`, evidence `merchant_reported` |
| `dispute` | `{reason, note}` | `→ disputed`, billing `on_hold` |

Illegal transitions return `409 illegal_transition` with `currentStatus` and `allowedActions`.

### GET /v1/merchant/lookup        staff+

`?reference=` or `?suffix=3M9P4`. Finds a lead of any type for this business. Rate limited.

## Real-time

- Merchant: `lead.created`, `lead.status_changed` on `business:{id}`; short-poll fallback every 15 s while the inbox is open. Push notification on new leads.
- Consumer: `lead.status_changed` on `user:{id}`; push notification on acknowledgement and outcome.

## Atomic operations

- Create: idempotency key, duplicate lookup and insert (lead, consent, thread, first system message, lead event, outbox) in one transaction.
- Transitions: conditional update on current status; a lead event written in the same transaction.
- Billing: insert into the ledger with unique `(leadId, milestone, type)`.

## Background jobs

- 24 h reminder, 72 h expiry for unacknowledged leads.
- Duplicate and fraud scan on create.
- Nightly reconciliation: every lead with an outcome has the expected ledger row and vice versa.

## Edge cases

- Business suspended after a lead is created: the consumer sees a banner; the lead is excluded from billing.
- Consumer deletes account: open leads cancelled; merchant sees "Customer left Lesho"; personal fields removed.
- Wrong branch chosen: merchant can transfer the lead to another branch of the same business (`POST …/transfer {branchId}`), recorded in the timeline.
- Two staff act at once: conditional updates make the second one a `409` with the current state.
