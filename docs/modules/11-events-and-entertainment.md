# Module 11 — Events and entertainment

## Purpose

Events (gigs, workshops, festivals) and entertainment (cinemas, theatres, arcades, bowling) as first-class categories, without ticketing. Venues list what's on, showtimes, coupons and events; consumers send ticket requests or enquiries, claim coupons, or follow a link to the venue's own booking page.

## Rules

1. Lesho never sells tickets, holds seats or confirms bookings. Every screen says so in plain words.
2. Events have date, time, venue, price label, entry rules, capacity note (organiser-stated), organiser and media.
3. "Request tickets" creates an `event_request` lead with quantity. "Enquire" creates an `event_enquiry`. Neither is a ticket. The organiser confirms and issues tickets directly; it can then mark the lead `attended` after checking the reference at the door.
4. Films and shows are catalogue items (`kind: movie` or `activity`) with `showtimes` for a date. Showtimes, formats and ticket price ranges are merchant-provided with an update time.
5. "Booking page" opens the venue's external URL and records an `external_click`. It never counts as a lead or a purchase.
6. Cinema discounts are **coupons** (module 07): the code is revealed on claim and redeemed at the box office or on the venue's own site. Claim expiry applies if the venue sets it.
7. Group bookings and accessibility questions are enquiries with category options (`Group booking (10+)`, `Accessibility`, `Seat types and prices`).
8. Venues can rent spaces (private screening hall, party room) through module 09.
9. Events belong to a category (`events` or `entertainment`); Explore filters by it.

## Prototype screens

`Detail.jsx` → `EventDetail` (gallery, teaser reel, when, where, price, capacity, conditions, organiser, "How tickets work here", WhatsApp and ticket page clicks, Enquire, Request tickets), `ProductDetail` with `ShowBlock` (today's showtimes, format, screen, price range, honesty note, group booking enquiry, Booking page, Get coupon). `Home.jsx` "Events this week", "Now showing". `Explore.jsx` Entertainment chip and Events tab.

## Entities

`events`, `products` (movies, activities), `showtimes`, `offers` (coupons), `leads`.

## Endpoints

### GET /v1/events        auth: optional

`?categoryId=events|entertainment&from=&to=&areaId=&maxPricePaise=&cursor=`.

### GET /v1/events/{id}        auth: optional

```json
{
  "data": {
    "id": "evt_ev4", "name": "Ek Sanj Rangmanch Par — Gujarati play", "category": "entertainment", "eventType": "Theatre",
    "startsAt": "2026-11-21T13:30:00Z", "endsAt": "2026-11-21T15:45:00Z", "dateLabel": "Sat, 21 Nov", "timeLabel": "7:00 pm – 9:15 pm",
    "venue": { "name": "Rangmanch Theatre, Ellisbridge", "location": { "lat": 23.02, "lng": 72.57 }, "area": "Navrangpura" },
    "price": { "minPaise": 30000, "maxPaise": 60000, "label": "₹300 – ₹600 by seating", "provenance": { "source": "merchant" } },
    "capacityNote": "320 seats (venue-stated)",
    "rules": ["Ages 8+", "Doors close at 7:00 pm"],
    "organiser": { "id": "biz_rangmanch", "name": "Rangmanch Theatre", "verified": true },
    "media": [ … ], "teaserPostId": null,
    "externalTicketUrl": "https://…", "howTicketsWork": "Lesho sends your request to the organiser with a reference…",
    "viewer": { "saved": false, "openRequest": null }
  }
}
```

### GET /v1/products/{id}/showtimes        auth: optional

`?date=2026-11-14` → `{ date, branch, times: ["10:30","13:45"], format, screen, price: {minPaise,maxPaise}, provenance }`. Returns `404` for a date with no data rather than an empty list that looks like "sold out".

### POST /v1/leads (type `event_request` / `event_enquiry`)        auth: consumer · idempotent

See module 08. `details: { "eventId": "…", "quantity": 2 }`. Response `typeLabel: "Ticket request"`, disclaimer "This is an enquiry, not a confirmed ticket."

### POST /v1/events/clicks with `type: "external_click"`        auth: optional

Returns `{ "url": "https://…" }` for the client to open externally.

### Merchant

- `POST /v1/merchant/events`, `PATCH …/{id}`, `POST …/{id}/cancel` (notifies everyone with an open request).
- `PUT /v1/merchant/products/{id}/showtimes` (module 03).
- Coupons through `POST /v1/merchant/offers` with `couponCode` and `couponUse: ["box_office","merchant_site"]`.
- Ticket requests appear in the lead inbox as intents; actions `acknowledge`, `contacted`, `reference-checked` (attended), `not-interested`.

## Real-time

Lead updates as module 08. Showtimes and events are cached for 60 s.

## Edge cases

- Event cancelled: all open requests get a system message and a notification; leads closed as `cancelled`, not billed.
- Event in the past: hidden from discovery; detail page shows "This event has ended".
- Showtimes not updated today: show the last update time; never extrapolate.
- A venue wants Lesho to sell tickets: out of scope; use an external ticket URL.
- Film certificate (U/A, A): shown as an attribute; no age verification in the app.
