# Module 07 — Offers, coupons and claims

## Purpose

Structured offers with terms and validity, optional coupon codes, and claims that create a traceable reference. Merchants can give a claim a time limit (claim expiry), a premium feature.

## Concepts

- **Offer**: title, benefit, eligible items and branches, start and end, eligibility, limits, redemption steps, terms.
- **Coupon**: an offer with `couponCode`. The code is revealed only after claiming. A coupon is a discount, never a ticket or seat.
- **Claim**: a consumer taking an offer. Creates a lead of type `claim` with a reference and a QR.
- **Claim expiry** (`claimWindowMinutes`): how long a claim stays usable after it is made.
  - `null` → the claim never expires on its own; it lasts until the offer's `endsAt`.
  - A value (for example 120 or 1440) → `expiresAt = min(claimedAt + window, offer.endsAt)`.
- **Redemption**: the business checks the reference (scan or type) and confirms. This is a verified outcome.

## Rules

1. Only verified businesses can publish offers. Coupon codes and claim expiry need the plan features `coupon_codes` and `claim_expiry`.
2. Offers need `endsAt`. Terms are shown before claiming; the consumer ticks agreement and consent.
3. `perUserLimit` active claims per user (default 1); `totalLimit` across all users if set.
4. Claim expiry is enforced on the server. The countdown on the client is a display of `expiresAt`.
5. Redemption succeeds only if the claim is `claimed` and `expiresAt` is null or in the future, at the moment of the update.
6. An expired claim: status `expired`, coupon code hidden from the consumer, lead closed as `expired`, not billable, moved to "Past" in the consumer's enquiries. If `allowReclaim` is true and the offer is still live, the consumer can claim again (subject to limits).
7. Changing `claimWindowMinutes` on a live offer applies to new claims only; existing claims keep their `expiresAt`.
8. Ending an offer early expires all open claims at that moment and notifies their holders.
9. The offer page states the rule up front: "After you claim: use within 24 hours" or "No time limit — use it any time before the offer ends".

## Prototype screens

`Detail.jsx` → `OfferDetail` (orange header card, hidden coupon code, validity, after-you-claim row, how to redeem, applies to, terms, timer line, claim button). `Flows.jsx` → `RefConfirm` (timer box, expired state, coupon box). `Activity.jsx` (timer badge on cards and in the code popover). `Merchant.jsx` → `MCreate` offer form (claim expiry chips with Premium badge, coupon code field), lead detail (claim expiry row).

## Entities

`offers`, `claims`, `leads` (type `claim`), `lead_events`, `billing_events`.

## Consumer endpoints

### GET /v1/offers/{id}        auth: optional

```json
{
  "data": {
    "id": "off_o5", "title": "₹100 off a ticket on weekday shows", "shortLabel": "₹100 off",
    "business": { "id": "biz_galaxy", "name": "Galaxy Cinemas", "verified": true },
    "category": "entertainment",
    "validLabel": "Mon–Thu, till 30 Nov 2026", "startsAt": "…", "endsAt": "2026-11-30T18:29:59Z",
    "branches": ["Thaltej"], "eligibility": "Shows starting before 6:00 pm", "limitLabel": "Up to 2 tickets per claim",
    "products": [ { … product card … } ],
    "redemptionSteps": ["Claim to reveal the coupon code and your Lesho reference", "…"],
    "terms": ["A coupon is a discount, not a ticket…"],
    "isCoupon": true, "couponUse": ["box_office", "merchant_site"],
    "claimWindowMinutes": 1440,
    "viewer": {
      "activeClaim": { "claimId": "clm_…", "reference": "LSH-OFR-D22JR", "expiresAt": "2026-11-15T12:30:00Z", "couponCode": "GALAXY100" },
      "lastClaimExpired": false,
      "canClaim": false
    }
  }
}
```

`couponCode` appears only inside `viewer.activeClaim`.

### POST /v1/offers/{id}/claims        auth: consumer · idempotent

```json
{ "agreedToTerms": true, "consents": ["share_name"], "branchId": null }
```

`201` →

```json
{
  "data": {
    "claimId": "clm_…", "leadId": "led_…", "reference": "LSH-OFR-GJX84",
    "status": "claimed", "claimedAt": "2026-11-14T12:30:00Z", "expiresAt": "2026-11-15T12:30:00Z",
    "couponCode": "GALAXY100", "qr": { "payload": "lesho://ref/LSH-OFR-GJX84", "svg": "…" }
  }
}
```

Errors: `409 offer_ended`, `409 claim_limit_reached` (with `activeClaimId`), `409 total_limit_reached`, `422 consent_required`, `403 business_not_verified`.

Side effects: `claim.created`, `lead.created`; merchant notified; if `expiresAt` is set, a delayed job is scheduled at `expiresAt`.

### GET /v1/me/claims        auth: consumer

`?status=claimed|redeemed|expired`. Each item has `expiresAt` so the client can count down.

### POST /v1/me/claims/{id}/cancel        auth: consumer

Releases the claim. `409` if already redeemed or expired.

## Merchant endpoints

### POST /v1/merchant/offers        manager+ · idempotent

```json
{
  "title": "₹500 off silk sarees above ₹4,000", "shortLabel": "₹500 off",
  "benefit": { "type": "amount", "value": 50000 },
  "productIds": ["prd_p1", "prd_p4"], "branchIds": ["br_cg"],
  "startsAt": "2026-11-14T00:00:00+05:30", "endsAt": "2026-11-30T23:59:59+05:30",
  "eligibility": "Minimum purchase ₹4,000", "perUserLimit": 1, "totalLimit": null,
  "redemptionSteps": [ "…" ], "terms": [ "…" ],
  "couponCode": "SILK500", "couponUse": ["counter"],
  "claimWindowMinutes": 2880, "allowReclaim": true,
  "status": "published"
}
```

`claimWindowMinutes` allowed values: `null`, or 15 to 43,200 (30 days). The client offers presets: Never, 2 hours, 24 hours, 48 hours, 7 days (plus a 1-minute preset in non-production for demos).

Errors: `403 feature_not_in_plan` (`claim_expiry` or `coupon_codes`), `422 invalid_window`, `422 ends_before_starts`, `409 coupon_code_in_use` (codes are unique per business among live offers).

### PATCH /v1/merchant/offers/{id}        manager+

Editable while live: `endsAt` (extend only), `terms` additions, `totalLimit` (not below `claimsCount`), `claimWindowMinutes` (new claims only). `POST /v1/merchant/offers/{id}/end` ends it now.

### GET /v1/merchant/claims/lookup        staff+

`?reference=LSH-OFR-GJX84` or `?code=GJX84` (suffix). Scoped to the caller's business and branches. Returns the claim with `status`, `expiresAt`, `secondsLeft`, consumer first name and last initial.

### POST /v1/merchant/claims/{id}/redeem        staff+ · idempotent

```json
{ "branchId": "br_cg", "method": "scan|typed" }
```

`200` → claim with `status: "redeemed"`. Errors: `410 claim_expired`, `409 claim_already_redeemed`, `404` if not this business.

Side effects: lead outcome `redeemed`, evidence `reference_checked`, billing milestone `verified_redemption`, consumer notified.

## Real-time and timers

- Consumer: `claim.redeemed` and `claim.expired` are pushed on `user:{id}`. The countdown is client-side from `expiresAt` corrected by the server clock offset. When it reaches zero the client refetches the claim once.
- Merchant: lead cards show time left; `claim.expired` arrives on `business:{id}`.
- Server: a delayed job at `expiresAt` plus a once-a-minute sweeper both run the same conditional update, so a missed job cannot leave a claim open.

## Atomic operations

```
-- claim
BEGIN
  check offer published and now within startsAt..endsAt
  count active claims for (offer, user) < perUserLimit            (unique index enforces it)
  UPDATE offers SET claimsCount = claimsCount + 1 WHERE id = ? AND (totalLimit IS NULL OR claimsCount < totalLimit)
  INSERT lead, claim(expiresAt), consent, lead_event, outbox
COMMIT

-- redeem
UPDATE claims SET status='redeemed', redeemedAt=now, redeemedBy=?
 WHERE id=? AND status='claimed' AND (expiresAt IS NULL OR expiresAt > now)
 -> 0 rows: re-read and return claim_expired or claim_already_redeemed

-- expire
UPDATE claims SET status='expired' WHERE id=? AND status='claimed' AND expiresAt <= now
```

## Billing

- Claim created: not billable.
- Verified redemption: billable per `billing_rules` (`verified_redemption`).
- Expired or cancelled claim: never billable.

## Edge cases

- Device clock wrong: server offset fixes the display; the server decides.
- Merchant scans one second after expiry: `410 claim_expired`. The merchant app shows "Expired — ask the customer to claim again" when `allowReclaim` is true.
- Offer ends before the claim window: `expiresAt` is capped at `endsAt`.
- Consumer claims, cancels, claims again: allowed within limits; each claim has its own reference.
- Coupon code shared publicly: still requires presenting a Lesho reference for attribution; the merchant decides whether to honour codes without a reference (setting on the offer, default: reference required).
