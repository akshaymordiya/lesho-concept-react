# Module 06 — Content

## Purpose

Social-style formats that always point at commerce: reels, single images, photo dumps (carousels), business updates and 24-hour stories.

## Rules

- Every post and story item links to at least one product, offer, event or the business. Updates link to the business. A post with no link is rejected (`422 content_link_required`).
- Personal, meme, political or unrelated content is out of scope; moderation removes it.
- Photo dumps have 2–10 slides; each slide may tag one product.
- Reels are vertical video up to 60 s. Stories are image or short video, live for 24 hours from publication.
- Likes, saves, shares and views are engagement, never leads.
- Merchant-shared customer media requires the customer's consent (the merchant ticks a confirmation when publishing).

## Viewer behaviour (from the prototype)

- Reels: full-screen vertical feed, snap one per swipe, tap to pause, double-tap to like, progress line, tagged product chips, one call to action.
- Posts: horizontal swipe through photo-dump slides with segmented progress; up and down buttons move between posts.
- Stories: segmented bars, 5 s per item, tap left or right, hold to pause, swipe sideways between businesses, swipe down to close, seen state per item.

## Prototype screens

`Viewer.jsx` (ReelsFeed, PostViewer, StoryViewer); `Home.jsx` (stories row, reels row, new arrivals mosaic); `Merchant.jsx` → `MCreate` (type grid, media picker, linking, preview, publish).

## Entities

`media`, `posts`, `stories`, `story_items`, `story_views`, `likes`, `saves`.

## Consumer endpoints

### GET /v1/feed/reels        auth: optional

`?startId=&areaId=&cursor=` → ordered reels starting at `startId`. Each:

```json
{ "id": "pst_r2", "type": "reel", "title": "How we roast the ghee dosa", "caption": "…",
  "video": { "hls": "…m3u8", "poster": "…", "durationSec": 18 },
  "business": { "id": "…", "name": "Madras Tiffin Room", "verified": true },
  "tags": [ { … product card … } ], "offer": null, "event": null,
  "cta": { "label": "View dish", "target": { "type": "product", "id": "…" } },
  "likeCount": 986, "viewer": { "liked": false, "saved": false, "following": true } }
```

### GET /v1/posts/{id}        auth: optional

Images, dumps (`slides[]` with `caption` and optional product card), updates, review posts.

### GET /v1/stories        auth: optional

`?areaId=` → `[{ businessId, businessName, verified, items: [{id, image|video, text, publishedAt, link:{type,id,label}, seen}] }]`, unseen businesses first only on first load of the day (the client keeps order stable within a session).

### POST /v1/stories/items/{id}/view        auth: consumer

Idempotent. `204`.

### POST /v1/likes | DELETE /v1/likes        auth: consumer

`{ "targetType": "post|story_item", "targetId": "…" }`. Idempotent.

### POST /v1/posts/{id}/share        auth: optional

Records a share event; returns a share URL.

## Merchant endpoints

### POST /v1/merchant/posts        manager+ · idempotent

```json
{
  "type": "dump", "title": "Reception looks, new this week", "caption": "Three drapes for the reception.",
  "slides": [ { "mediaId": "med_1", "productId": "prd_p4" }, { "mediaId": "med_2" } ],
  "links": [ { "type": "product", "id": "prd_p4" } ],
  "customerMediaConsent": false,
  "publishAt": null
}
```

`201`. Errors: `422 content_link_required`, `422 slides_out_of_range`, `409 media_not_ready`, `403 feature_not_in_plan` when `publishAt` is set (scheduled posts are premium).

### POST /v1/merchant/stories/items        manager+ · idempotent

`{ "mediaId": "…", "text": "Teal Chanderi just arrived", "link": { "type": "product", "id": "…" } }` → `201`. Appends to today's story.

### DELETE /v1/merchant/posts/{id}, DELETE /v1/merchant/stories/items/{id}        manager+

Soft delete.

### GET /v1/merchant/posts        manager+

With per-post engagement and attributed leads.

## Real-time

None. Feeds load on open; pull to refresh. Story expiry is applied by the server; the client also hides items past `expiresAt`.

## Atomic

- Like and save toggles are idempotent via unique constraints; counters are updated in the same transaction or by a worker.
- Publishing validates links and media state in the same transaction that inserts the post.

## Edge cases

- Linked product removed: the post stays; the tag shows "No longer available" and is not clickable.
- Linked offer ended: the chip is hidden.
- Story with all items expired: the business disappears from the row.
- Video still processing: the post stays a draft until media is `ready`, then publishes (if the merchant chose "publish when ready").
