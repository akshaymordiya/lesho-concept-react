# Module 12 — Reviews

## Purpose

Consumer reviews tied to a product, business visit or event, with honest verification labels and one merchant reply.

## Rules

1. A review targets a `product`, `business` or `event`. Free-standing opinions are not allowed.
2. Rating 1–5, body 20–600 characters, up to 4 photos.
3. One review per author per target; editing replaces it and shows "Edited".
4. Verification: `visit` or `purchase` only when the author has a lead with the same business that reached a `reference_checked` or `consumer_confirmed` outcome (visited, redeemed, attended, handed over, returned, or a confirmed sale). Otherwise "Unverified". The label is computed on write and never set by the client.
5. A business can post one public reply per review and edit it. It cannot delete or hide reviews; it can report them.
6. Reviews are not removed for being negative. Moderation removes only policy violations.
7. Business and product ratings are recomputed from published reviews.

## Prototype screens

`ui.jsx` → `ReviewCard` (author, stars, date, verified or unverified badge, target link, photos, merchant reply). `Flows.jsx` → `ReviewComposer` (stars, text, sample photos, verification explanation). `Viewer.jsx` review posts.

## Endpoints

### GET /v1/reviews        auth: optional

`?targetType=&targetId=` or `?businessId=` with `cursor`. Includes summary `{ avg, count, verifiedCount }` on the first page.

### POST /v1/reviews        auth: consumer · idempotent

```json
{ "targetType": "business", "targetId": "biz_thal", "rating": 5, "body": "Went for Sunday lunch…", "mediaIds": ["med_…"] }
```

`201` → review with `verification` (`visit`, `purchase` or `none`) and `verificationReason` ("You have a merchant-confirmed visit with this business"). Errors: `409 already_reviewed` (with `reviewId`), `422 body_too_short`.

### PATCH /v1/reviews/{id}, DELETE /v1/reviews/{id}        auth: author

### POST /v1/merchant/reviews/{id}/reply        manager+

`{ "body": "Thanks for visiting…" }` → `200`. Replacing an existing reply is allowed.

### POST /v1/reviews/{id}/report        auth: any

## Real-time

None. New reviews notify the business (in-app).

## Edge cases

- Review written before the verified outcome: re-evaluated when the outcome is recorded; the label upgrades automatically.
- Lead later found fraudulent: verification downgrades.
- Author deletes account: review stays as "Former Lesho user" unless the user asks for removal.
