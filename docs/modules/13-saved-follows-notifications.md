# Module 13 — Saved, follows and notifications

## Purpose

Personal collections (saved products, businesses, posts, offers, events), follows, and the notifications that bring people back to their leads.

## Rules

- Saves and follows are private to the consumer. Businesses see counts only.
- Saving or following is not a lead and is never billed.
- Notifications are transactional first. Marketing notifications (new offers from followed shops) require the `offerNotifications` preference and are capped at 1 per business per day and 3 per user per day.
- Quiet hours 22:00–08:00 for non-urgent pushes; lead updates and expiring claims are allowed.
- Every notification deep-links to the relevant screen.

## Prototype screens

`Me.jsx` → `Saved` (type chips, rows with unsave), `Profile` (preferences toggles). Bookmark buttons across cards and detail pages. Follow buttons on business profiles and viewers.

## Endpoints

### GET /v1/me/saved        auth: consumer

`?type=product|business|post|offer|event&cursor=` → mixed list of card shapes with `type`.

### PUT /v1/me/saved/{type}/{id}    DELETE /v1/me/saved/{type}/{id}        auth: consumer

Idempotent. `204`.

### GET /v1/me/following        auth: consumer

### GET /v1/me/notifications        auth: consumer
### GET /v1/merchant/notifications        staff+

```json
{ "data": [ { "id": "ntf_…", "type": "lead.acknowledged", "title": "Rangoli Silks replied", "body": "Your availability enquiry was acknowledged.", "deepLink": "lesho://lead/led_…", "readAt": null, "at": "…" } ] }
```

### POST /v1/me/notifications/read        auth: consumer

`{ "ids": [ … ] }` or `{ "all": true }`.

## Notification catalogue

| Event | Consumer | Merchant |
| --- | --- | --- |
| Lead created | — | New lead (push + in-app) |
| Lead acknowledged / contacted | In-app; push for acknowledgement | — |
| New message | Push if not active in thread | Push if not active in thread |
| Rental accepted / declined | Push | — |
| Rental return due / overdue | Push | In-app |
| Claim expiring | Push at 1 hour before (only for windows ≥ 2 h) | — |
| Claim expired | In-app | In-app |
| Claim redeemed | In-app | — |
| Lead unacknowledged 24 h | — | Push reminder |
| Event cancelled | Push | — |
| New offer from followed shop | Push (opt-in, capped) | — |
| Review received | — | In-app |
| Verification decided | — | Push |

## Real-time

`notification.created` on `user:{id}` / `business:{id}` updates the bell badge; push for closed apps.

## Edge cases

- Push token invalid: remove on provider error; keep in-app notification.
- User blocked a business: no notifications from it.
- Many leads at once for a merchant: collapse into "5 new leads" after the third within 10 minutes.
