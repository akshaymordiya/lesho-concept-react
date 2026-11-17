# Module 02 — Businesses and branches

## Purpose

The trustworthy home for a merchant: identity, verification state, branches with hours and location, team, and the tabs that aggregate catalogue, rentals, posts, offers, events and reviews.

## Rules

- A business has one primary category and one or more branches. Each branch has coordinates and hours.
- Verification is about ownership and contact, not quality. The badge reads "Ownership verified". It cannot be bought with a plan.
- Unverified businesses can be listed (with a "Verification pending" label) but cannot run offers, coupons or rentals.
- Hours are merchant-provided and shown with that label. "Open now" is computed from hours and the branch timezone.
- Call and WhatsApp numbers are exposed only as actions; tapping records a click (module 08).
- Following a business is visible to the consumer only. The business sees a follower count, not names.

## Prototype screens

`Detail.jsx` → `BusinessProfile` (cover, avatar with story ring, follow, quick actions, tabs: Catalogue/Menu/What's on, Rentals, Events, Posts, Offers, Reviews, About). Merchant header in `Merchant.jsx` → `MDashboard`.

## Entities

`businesses`, `branches`, `business_members`, `verification_requests`.

## Consumer endpoints

### GET /v1/businesses/{id}        auth: optional

```json
{
  "data": {
    "id": "biz_rangoli", "name": "Rangoli Silks", "tagline": "Handpicked silk sarees and occasion wear",
    "category": { "id": "fashion", "label": "Fashion" },
    "verification": "verified",
    "rating": { "avg": 4.6, "count": 212 },
    "logo": { "url": "…" }, "cover": { "url": "…" },
    "about": "…", "establishedYear": 1998,
    "branches": [ {
      "id": "br_cg", "name": "CG Road", "address": "CG Road, Navrangpura",
      "location": { "lat": 23.03, "lng": 72.56 }, "area": "Navrangpura",
      "distanceKm": 0.8, "hours": [ { "day": 1, "open": "10:30", "close": "21:00" } ],
      "openNow": true, "actions": { "call": true, "whatsapp": true, "directions": true },
      "provenance": { "source": "merchant", "updatedAt": "…" }
    } ],
    "tabs": { "catalogue": 4, "rentals": 1, "events": 0, "posts": 3, "offers": 1, "reviews": 2 },
    "hasActiveStory": true, "storySeen": false,
    "viewer": { "following": true, "saved": false }
  }
}
```

### GET /v1/businesses/{id}/catalogue | /rentals | /posts | /offers | /events | /reviews        auth: optional

Cursor-paginated lists using the same item shapes as their own modules.

### POST /v1/businesses/{id}/follow    DELETE /v1/businesses/{id}/follow        auth: consumer

Idempotent. `204`.

### POST /v1/businesses/{id}/report        auth: consumer

`{ "reason": "misleading|fake_offer|abusive|closed|other", "note": "…" }` → `201`.

## Merchant endpoints

### POST /v1/merchant/businesses        auth: merchant (any user)

Creates a business with the caller as owner and status `pending`.

```json
{ "name": "Rangoli Silks", "categoryId": "fashion", "tagline": "…", "branch": { "name": "CG Road", "address": "…", "location": { "lat": 23.03, "lng": 72.56 }, "areaId": "area_nav", "hours": [ … ], "phone": "+91…" } }
```

### PATCH /v1/merchant/business        owner

Any of `name`, `tagline`, `about`, `logoMediaId`, `coverMediaId`, `establishedYear`. Uses `If-Match`.

### POST /v1/merchant/branches | PATCH /v1/merchant/branches/{id} | DELETE …        owner, manager

Deleting a branch with open leads returns `409 branch_has_open_leads`.

### POST /v1/merchant/verification        owner

`{ "documents": [ { "type": "gst|shop_licence|udyam|utility_bill|id_proof", "mediaId": "…" } ] }` → `201`, status `submitted`.

### GET /v1/merchant/team | POST /v1/merchant/team/invite | PATCH /v1/merchant/team/{userId} | DELETE …        owner

Invite by phone with `role` and optional `branchIds`. The invitee accepts after signing in.

## Admin endpoints

`GET /v1/admin/verification-requests?status=submitted`, `POST /v1/admin/verification-requests/{id}/approve|reject` with `notes`. Approval sets `businesses.verification = verified` and emits `business.verified`.

## Real-time

None. Profile data is cached 60 s and purged on update.

## Edge cases

- Business suspended: profile returns `404` to consumers; open leads stay readable to their consumers with a "This business is unavailable" banner; new leads are blocked.
- Temporarily closed branch (`closedDates`): profile shows "Closed today"; leads still allowed with a note.
- Hours spanning midnight: `close` earlier than `open` means next day.
- Two branches in different areas: discovery uses the nearest branch to the selected area.
