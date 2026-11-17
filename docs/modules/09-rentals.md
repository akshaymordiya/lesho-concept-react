# Module 09 — Rentals

## Purpose

Businesses in any category can rent items out by the day or month. A consumer sends a dated **rental request**; the business accepts or declines, hands over against the reference, and marks the return. Rent and deposit are collected by the business, outside Lesho.

## Rules

1. A listing is rentable when `mode` is `rent` or `both` and it has `rental_terms`. Needs a verified business and the `rental_listings` feature.
2. Pricing: `rate` per `unit` (day or month); optional `weeklyRate` applied per full 7 days for day rentals; `minUnits`; optional `maxUnits`; `deposit` (refundable, held by the business); optional `deliveryFee`.
3. Availability: the business blocks days (`rental_blocks` with source `merchant`). Accepting a rental blocks its days automatically (source `accepted_rental`). A request is valid only if no day in `[startDate, endDate)` is blocked for every unit. For month rentals only the start date is checked against blocks.
4. Request is not booking. Accepting is the business's commitment; the confirmation and every screen say so. "Charged on Lesho ₹0" appears on the estimate.
5. Estimate = rent for the units (weekly rate where it applies) + delivery fee if delivery is chosen. Deposit is shown on its own line and is never part of the estimate.
6. Statuses are separate dimensions: rental status (`requested`, `accepted`, `declined`, `handed_over`, `returned`, `cancelled`), deposit status (`none`, `not_collected`, `held`, `refunded`, `deducted` — always merchant-reported), lead status and billing.
7. Handover is a verified outcome only when the business checks the reference.
8. Category-specific confirmations (for example a driving licence statement for motorcycles) are stored as `requiresConfirmation` and must be ticked.
9. `rental_records.completedCount` increases only when a rental reaches `returned`.

## Prototype screens

`Rental.jsx`: `RentalBlock` (rates, deposit, minimum, handover, included, 14-day availability strip, rental record, terms), `RentRequest` (start date chips with booked days disabled, length stepper, clash card with next free date and similar rentals, handover, option, estimate, note, confirmations), `RentalSummary`, `RentalLeadActions` (accept, decline, hand over, return, return with deduction), `RentalsStrip`. `Explore.jsx` For rent filter; `Home.jsx` "Rent, don't buy".

## Endpoints

### GET /v1/products/{id}/availability        auth: optional

`?from=2026-11-14&days=30` →

```json
{ "data": { "unit": "day", "quantity": 1, "days": [ { "date": "2026-11-14", "available": true }, { "date": "2026-11-21", "available": false } ] } }
```

### POST /v1/rentals/quote        auth: optional

```json
{ "productId": "prd_p6", "startDate": "2026-11-24", "units": 3, "fulfilment": "pickup" }
```

`200` →

```json
{ "data": { "endDate": "2026-11-27", "rentPaise": 225000, "weeklyApplied": false, "deliveryFeePaise": 0, "estimatePaise": 225000, "depositPaise": 400000, "chargedOnLeshoPaise": 0,
  "conflicts": [], "nextAvailableStart": null } }
```

With a clash: `"conflicts": ["2026-11-21"], "nextAvailableStart": "2026-11-24", "alternatives": [ { … product card … } ]`.

### POST /v1/rentals        auth: consumer · idempotent

```json
{
  "productId": "prd_p6", "branchId": "br_cg",
  "startDate": "2026-11-24", "units": 3, "fulfilment": "pickup", "option": "M",
  "note": "For my sister's engagement",
  "confirmations": [], "consents": ["share_name", "share_phone"], "agreedToTerms": true,
  "source": { "surface": "rental_listing" }
}
```

`201` → lead (type `rental`, reference `LSH-RNT-…`) with a `rental` block:

```json
{ "rental": { "id": "rnt_…", "status": "requested", "startDate": "2026-11-24", "endDate": "2026-11-27", "units": 3, "unit": "day",
  "fulfilment": "pickup", "option": "M", "estimate": { "rentPaise": 225000, "deliveryFeePaise": 0, "totalPaise": 225000, "depositPaise": 400000 },
  "depositStatus": "not_collected" } }
```

Errors: `409 rental_dates_unavailable` (with `conflicts`, `nextAvailableStart`), `422 rental_min_units`, `422 confirmation_required`, `422 fulfilment_not_offered`, `422 date_in_past`, `403 business_not_verified`.

The request does **not** block dates. Several consumers may request the same days; the first one accepted wins.

### POST /v1/me/rentals/{id}/cancel        auth: consumer

Allowed in `requested` or `accepted`. Releases blocks created by acceptance.

### Merchant actions        staff+ · idempotent

| Endpoint | From → to | Body | Notes |
| --- | --- | --- | --- |
| `POST /v1/merchant/rentals/{id}/accept` | requested → accepted | `{ "finalEstimatePaise"?: int, "note"?: string }` | Re-checks overlap atomically; inserts blocks. `409 rental_dates_unavailable` if another rental was accepted first. |
| `POST /v1/merchant/rentals/{id}/decline` | requested → declined | `{ "reason": "dates_unavailable|item_unavailable|other", "suggestedStart"?: date }` | Not billable. |
| `POST /v1/merchant/rentals/{id}/handover` | accepted → handed_over | `{ "method": "scan|typed", "depositStatus": "held|not_collected|none", "conditionNote"?: string, "mediaIds"?: [] }` | Evidence `reference_checked`; billing milestone `verified_handover`. |
| `POST /v1/merchant/rentals/{id}/return` | handed_over → returned | `{ "depositStatus": "refunded|deducted|none", "deductionNote"?: string, "conditionNote"?: string }` | Increments `completedCount`; releases future blocks if returned early. |

Every action writes a system message into the thread ("Rental accepted by the shop", "Handed over — reference checked", "Returned — rental closed").

### GET /v1/merchant/rentals        staff+

`?status=requested|accepted|handed_over|returned&productId=` — for the dashboard strip and a rentals calendar.

## Real-time

`rental.accepted`, `rental.declined`, `rental.handed_over`, `rental.returned` on `user:{id}` and `business:{id}`; push notification to the consumer on accept and decline.

## Atomic operations

```
accept:
BEGIN
  SELECT rental FOR UPDATE; require status = 'requested'
  lock product (row lock or advisory lock on productId)
  for each day in [start, end): count blocks for the product < quantity
  INSERT rental_blocks (source 'accepted_rental')
  UPDATE rental SET status='accepted'
  INSERT lead_event, thread system message, outbox
COMMIT
```

Relational: an exclusion constraint on `(productId, unitNo, daterange)` makes overlap impossible even if the check is skipped. Document: one block row per product-unit-day with a unique index.

## Background jobs

- Daily: "Return due today" to consumer and merchant; "Overdue" from the day after `endDate`.
- Requests not answered in 48 hours: reminder to the merchant; at 72 hours the request expires.
- Requests whose start date has passed without acceptance: expire.

## Billing

`verified_handover` only. Requests, acceptances, declines and returns are not billed.

## Edge cases

- Late return: status stays `handed_over`; overdue flag; later acceptances that overlap the overdue period are warned in the merchant UI.
- Early return: future blocked days released.
- Item damaged: merchant records `deducted` with a note; disputes go through support, not the app.
- Two requests for the same days: both visible to the merchant; accepting one makes the other's accept return `409`; the merchant declines it with a suggested start.
- Month rental crossing month lengths: `endDate` = same day-of-month after `units` months, clamped to the month's last day.
