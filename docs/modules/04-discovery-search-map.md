# Module 04 — Discovery, search and map

## Purpose

Manual exploration, equal in weight to the AI guide: an editorial Home, search with filters, category browsing, area selection and a map.

## Rules

- Distances are from the centre of the selected area unless the consumer shares location for the session.
- Exploring another city is allowed. In an area without enough supply, show an honest empty state; never fabricate sections or trends.
- Home sections appear only when they have content. Order depends on area, interests (if personalisation is on) and inventory.
- Ranking: intent and text match, category, distance, budget fit, freshness, rating evidence, then engagement. Paid placement is one labelled slot and never reorders organic results.
- Every content card leads somewhere useful: product, business, event, offer or viewer.
- The map shows one pin per business for listings (with a count badge), one per venue for events. Pins use the cover photo.

## Prototype screens

`Home.jsx` (greeting, search, AI card, category row, Picked for you, Near you, Rent don't buy, Stories, Product reels, New arrivals, Popular, Offers, Events, Now showing, reviews, Shops you follow). `Explore.jsx` (search, category chips, For rent, type tabs, filters and sort sheets, list or map, sponsored slot). `Flows.jsx` → `AreaSheet`.

## Endpoints

### GET /v1/home        auth: optional

`?areaId=` or `?lat=&lng=`.

```json
{
  "data": {
    "area": { "id": "area_nav", "name": "Navrangpura", "city": "Ahmedabad", "supply": "live" },
    "sections": [
      { "key": "picked_for_you", "title": "Picked for you", "subtitle": "Based on your interests — change in You", "kind": "products", "items": [ … ] },
      { "key": "near_you", "title": "Near you", "kind": "businesses", "items": [ … ], "action": { "label": "Map", "explore": { "view": "map", "type": "business" } } },
      { "key": "rentals", "title": "Rent, don't buy", "kind": "products", "items": [ … ] },
      { "key": "stories", "title": "Stories", "kind": "stories", "items": [ … ] },
      { "key": "reels", "title": "Product reels", "kind": "posts", "items": [ … ] },
      { "key": "offers", "title": "Offers worth a look", "kind": "offers", "items": [ … ] },
      { "key": "events", "title": "Events this week", "kind": "events", "items": [ … ] },
      { "key": "now_showing", "title": "Now showing", "kind": "products", "items": [ … ] }
    ],
    "promptChips": ["Wedding saree around ₹5,000", "Rent a camera for the weekend", "Movie offers tonight"]
  }
}
```

When `supply` is `coming_soon`, `sections` is empty and the client shows the empty state.

Card shapes (shared everywhere):

- Product card: `{id, name, image, price:{amountPaise,note}|null, rent:{ratePaise,unit}|null, mode, offerBadge|null, business:{id,name,verified}, distanceKm|areaName, saved}`
- Business card: `{id, name, tagline, cover, category, rating, distanceKm, verified}`
- Event card: `{id, name, image, startsAt, dateLabel, venueName, priceLabel, type}`
- Offer card: `{id, title, shortLabel, business:{id,name,verified}, validLabel, hasCode}`
- Post tile: `{id, type, title, image, durationSec|null, slideCount|null, business:{id,name}}`
- Story tile: `{businessId, businessName, cover, count, lastPublishedAt, seen}`

### GET /v1/search        auth: optional

| Param | Meaning |
| --- | --- |
| `q` | Text |
| `type` | `product` (default), `business`, `event` |
| `categoryId` | Category or omitted for all |
| `mode` | `rent` to show only rentable listings |
| `maxPricePaise` | For products and events; for rentals compares the rental rate |
| `minRating` | e.g. `4.5` |
| `verifiedOnly`, `hasOffer` | Booleans |
| `radiusKm` | 2, 5, 10 |
| `sort` | `relevance`, `distance`, `price_asc`, `rating` |
| `areaId` or `lat,lng` | Location context |

```json
{
  "data": [ { "kind": "product", "item": { … product card … } } ],
  "sponsored": { "position": 2, "item": { … }, "label": "Sponsored" },
  "page": { "nextCursor": "…", "hasMore": true },
  "meta": { "total": 30, "groupedShops": 12 }
}
```

`sponsored` is absent when any filter, sort or query other than relevance is active.

### GET /v1/map        auth: optional

`?bbox=minLng,minLat,maxLng,maxLat` plus the same filters as search.

```json
{
  "data": {
    "centre": { "lat": 23.03, "lng": 72.56, "label": "Navrangpura centre" },
    "pins": [ {
      "id": "biz_rangoli", "kind": "business", "location": { "lat": 23.026, "lng": 72.556 },
      "image": "…", "title": "Rangoli Silks", "subtitle": "3 matching items · 0.8 km",
      "count": 3, "preview": [ { … product card … } ]
    } ]
  }
}
```

Up to 200 pins; beyond that the server clusters and returns `{kind:"cluster", count, location}`.

### POST /v1/events/attribution        auth: optional

Batch of impressions and views (module 08). Clients send it every 15 s or on background.

## Real-time

None. Home is cached per area for 2–5 minutes; search is not cached.

## Edge cases

- Location permission denied: area selection works; no prompt again in that session.
- Area changed while on a pushed screen: pushed screens keep their data; tab screens refetch.
- Search with no results: suggest "Ask the guide" with the query pre-filled.
- Sponsored item that is unavailable or unverified: not served.
- Remote area (another city): distances are replaced by the area name.
