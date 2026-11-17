# Module 03 — Catalogue

## Purpose

Every listing a business offers, in ten categories, with category-specific attributes and three listing modes: sell, rent out, or both. Products, services, dishes, films, activities and rentals share one entity.

## Rules

- A listing belongs to a business and optionally to specific branches.
- `mode = sale` needs `price`. `mode = rent` needs `rental_terms` (module 09). `mode = both` needs both.
- `attributes` are validated against the category's `attributeSchema`. Unknown keys are rejected so filters stay meaningful.
- Stock is optional. `stockState` is one of `in_stock`, `limited`, `not_maintained`, `by_appointment`, `walk_in`, and always shown with "merchant-reported on {date}". If the merchant does not maintain stock, say so; never imply availability.
- Films and shows carry `showtimes` (module 11). They are informational.
- Publishing requires at least one image and a verified business for `mode` rent or both (premium: `rental_listings`).
- Editing a published listing updates `detailsUpdatedAt`; posts and offers that link to it show the new data immediately (they reference, not copy).
- Removing a listing that is linked from a live offer returns `409 linked_from_offer` with the offer ids.

## Prototype screens

`Detail.jsx` → `ProductDetail` (gallery, price, rent price, variants, availability note, offer card, rental block, showtimes block, attributes, seller, reviews, similar). `Merchant.jsx` → `MCatalogue`, `ProductEditor` (sell / rent out / sell and rent, category, rental fields, booked days).

## Entities

`categories`, `products`, `rental_terms`, `rental_blocks`, `rental_records`, `showtimes`.

## Consumer endpoints

### GET /v1/categories        auth: none

```json
{ "data": [ { "id": "fashion", "label": "Fashion", "icon": "shirt",
  "lead": { "cta": "Ask about availability", "type": "Availability enquiry", "optionLabel": "What would you like to check?", "options": ["In-store availability", "Colour options"], "placeholder": "…", "note": null },
  "filters": [ { "key": "fabric", "type": "enum", "values": ["Silk", "Georgette"] } ] } ] }
```

### GET /v1/products/{id}        auth: optional

```json
{
  "data": {
    "id": "prd_p6", "kind": "product", "mode": "both",
    "name": "Ivory embroidered lehenga set", "description": "…",
    "category": { "id": "fashion", "label": "Fashion" },
    "price": { "amountPaise": 1250000, "note": null },
    "rent": { "unit": "day", "ratePaise": 75000, "weeklyRatePaise": null, "minUnits": 3, "depositPaise": 400000, "fulfilment": ["pickup", "delivery"], "deliveryFeePaise": 15000, "includes": ["Dry-cleaning after return"], "terms": ["Minimum 3 days"], "askOption": { "label": "Size to keep ready", "options": ["S", "M", "L", "XL"] }, "requiresConfirmation": null,
      "blockedDates": ["2026-11-21", "2026-11-22", "2026-11-23"],
      "record": { "completedCount": 14, "lastConditionCheckAt": "2026-11-12", "checks": ["Dry-cleaned after every rental"] } },
    "variants": ["Ivory", "Blush"],
    "attributes": { "fabric": "Net over satin", "work": "Thread and sequin embroidery" },
    "stock": { "state": "limited", "provenance": { "source": "merchant", "updatedAt": "2026-11-09T10:00:00Z" } },
    "media": [ { "id": "med_…", "url": "…", "w": 800, "h": 1000 } ],
    "rating": { "avg": 4.6, "count": 9 },
    "business": { "id": "biz_rangoli", "name": "Rangoli Silks", "verified": true, "branch": { "id": "br_cg", "area": "Navrangpura", "distanceKm": 0.8 } },
    "activeOffer": { "id": "off_o1", "shortLabel": "₹500 off", "title": "…" },
    "showtimes": null,
    "provenance": { "source": "merchant", "updatedAt": "2026-11-12T09:00:00Z" },
    "viewer": { "saved": false }
  }
}
```

### GET /v1/products/{id}/similar        auth: optional

Same category and overlapping tags, other businesses first. `?limit=6`.

## Merchant endpoints

### GET /v1/merchant/products        manager+

`?status=&mode=&categoryId=&cursor=`. Each item adds `linkedPostCount`, `activeOfferCount`, `openRentalCount`.

### POST /v1/merchant/products        manager+ · idempotent

```json
{
  "categoryId": "events", "kind": "rental", "mode": "rent", "name": "Mandap decor set",
  "description": "…", "mediaIds": ["med_…"], "variants": [], "attributes": {}, "tags": ["decor"],
  "pricePaise": null, "stockState": "not_maintained",
  "rent": { "unit": "day", "ratePaise": 650000, "minUnits": 1, "depositPaise": 500000, "fulfilment": ["pickup", "delivery"], "includes": ["Setup"], "terms": [], "quantity": 1 },
  "blockedDates": ["2026-11-21"],
  "status": "published"
}
```

`201` with the product. Errors: `422` field errors (`price_required`, `rent_rate_required`, `fulfilment_required`, `attribute_unknown`), `403 feature_not_in_plan` (rental listings), `403 business_not_verified`.

### PATCH /v1/merchant/products/{id}        manager+

Partial update with `If-Match`. Stock-only changes: `PATCH /v1/merchant/products/{id}/stock` `{ "state": "in_stock" }` — updates provenance time. Staff are allowed to call the stock endpoint.

### DELETE /v1/merchant/products/{id}        manager+

Soft delete. `409 linked_from_offer` or `409 has_open_rentals` when applicable.

### PUT /v1/merchant/products/{id}/blocked-dates        manager+

`{ "dates": ["2026-11-21", "2026-11-22"] }` replaces merchant-sourced blocks. Cannot remove blocks created by accepted rentals.

### PUT /v1/merchant/products/{id}/showtimes        manager+

`{ "date": "2026-11-14", "branchId": "…", "times": ["10:30", "13:45"], "format": "2D", "screen": "Screens 1 and 3", "priceMinPaise": 18000, "priceMaxPaise": 32000 }`.

## Real-time

None. Product detail is cached 60 s and purged on `product.updated`.

## Edge cases

- Price changed after a lead was created: the lead keeps its snapshot; the listing shows the new price.
- Category changed: allowed only if attributes validate under the new schema.
- A rental listing with `quantity > 1`: blocks and overlaps are per unit (module 09).
- Merchant sets stock `in_stock` daily: freshness label stays honest because it uses `stockUpdatedAt`.
