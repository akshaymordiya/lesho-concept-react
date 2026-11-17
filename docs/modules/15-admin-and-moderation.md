# Module 15 — Admin and moderation

## Purpose

Lesho staff keep the marketplace trustworthy: verify businesses, moderate content, resolve lead disputes, review fraud flags, and manage configuration.

## Roles

| Role | Can |
| --- | --- |
| moderator | Content and review moderation, reports |
| support | Look up users, businesses and leads; resolve disputes; resend notifications |
| finance | Billing rules, invoices, credits, plans |
| super_admin | Everything, including admin role management and category configuration |

Every admin action is written to `audit_log` with before and after values.

## Queues

| Queue | Source | Actions |
| --- | --- | --- |
| Verification | `verification_requests` | Approve, reject with reason, request more documents |
| Reports | `reports` on posts, stories, reviews, businesses, threads | Remove, restore, warn, suspend, dismiss |
| Disputes | `disputes` | Uphold (credit), reject |
| Fraud flags | Duplicate and fraud scan | Mark invalid, clear, suspend account |
| Offer and event checks | New offers and events from new businesses | Approve, remove |

## Configuration

- Categories: labels, icons, lead config, attribute schemas, status (live or hidden).
- Areas and cities: centre, status (live or coming soon).
- Billing rules and plans.
- Feature flags: lead creation per category, messaging, AI guide, rentals, coupons.
- Duplicate window, response timers, notification caps.

## Endpoints (all under `/v1/admin`, admin audience, second factor required)

- `GET /verification-requests`, `POST /verification-requests/{id}/approve|reject|request-info`
- `GET /reports`, `POST /reports/{id}/action` `{ action: remove|restore|warn|dismiss, reason }`
- `GET /disputes`, `POST /disputes/{id}/resolve` `{ outcome: upheld|rejected, note }`
- `GET /fraud-flags`, `POST /fraud-flags/{id}/resolve`
- `GET /users/{id}`, `POST /users/{id}/suspend|restore`, `POST /users/{id}/sessions/revoke`
- `GET /businesses/{id}`, `POST /businesses/{id}/suspend|restore`, `PUT /businesses/{id}/plan`, `PUT /businesses/{id}/entitlements/{feature}`
- `GET /leads/{id}` (full timeline, both sides)
- `GET|PUT /categories/{id}`, `GET|PUT /areas/{id}`, `GET|POST /billing-rules`, `GET|PUT /plans/{slug}`, `GET|PUT /flags/{key}`
- `GET /audit-log?targetType=&targetId=`

## Real-time

Short polling every 30 s on queue pages. No sockets.

## Edge cases

- Suspending a business: listings, posts and offers hidden; open claims expired; open leads frozen with a banner; billing on hold.
- Removing a post that drove leads: leads keep their `source` for attribution; the post shows "Removed" if opened from an old link.
- Admin access from outside the allowed network: denied regardless of token.
