# 02 — System architecture

Technology-neutral. Where a concrete choice is unavoidable the doc names a default and marks it as replaceable.

## Part A — High-level design

### A1. Shape

A **modular monolith** for the API plus separate **worker** processes, sharing one database. Modules have clear boundaries (section B1) so any of them can be split out later. Do not start with microservices.

```
 Consumer app   Merchant app   Admin console
      \              |              /
       \             |             /
        ---------- CDN / WAF ----------
                     |
              API gateway / LB
          (TLS, rate limit, request id)
              /                \
     REST API (stateless)   Realtime gateway
     /v1/...                (WebSocket + SSE fallback)
          |                        |
          +-----------+------------+
                      |
      +---------------+----------------+-----------------+
      |               |                |                 |
  Primary DB      Cache / KV       Search index     Object storage
 (system of     (sessions, rate   (text + geo)     (media) + CDN
  record)        limits, pub/sub,
                 counters)
      |
   Outbox  --->  Message queue  --->  Workers
                                      - notifications (push, SMS, in-app)
                                      - media processing
                                      - search indexing
                                      - expiry sweepers (claims, stories, leads)
                                      - analytics aggregation
                                      - billing
                                      - AI guide calls
```

### A2. Components

| Component | Responsibility | Default (replaceable) |
| --- | --- | --- |
| REST API | All reads and writes. Stateless; horizontal scale. | Any mainstream web framework |
| Realtime gateway | Pushes events to connected clients. Holds no business logic; subscribes to pub/sub. | WebSocket, SSE fallback |
| Primary database | System of record with transactions. | PostgreSQL or MongoDB (replica set, for transactions) |
| Cache / KV | Sessions denylist, rate limits, OTP attempts, pub/sub, hot counters, idempotency keys. | Redis-compatible |
| Search index | Full-text and geo queries over listings, businesses, events. | Start in the primary DB; move to a search engine when needed |
| Object storage + CDN | Images and video, resized variants, HLS renditions. | S3-compatible |
| Queue | At-least-once job delivery with retries and dead-letter. | Any durable queue |
| Scheduler | Cron-style triggers for sweepers and aggregation. | Queue-native delayed jobs or a cron runner |
| SMS / push providers | OTP, transactional alerts. | Behind an interface |
| AI provider | Intent extraction for the guide. | Behind an interface, deterministic fallback |

### A3. Clients

| Client | Users | Notes |
| --- | --- | --- |
| Consumer app | Consumers | Mobile-first. Offline tolerance for saved items and references. |
| Merchant app | Merchant members | Same design system; lead inbox must work on a low-end phone at a shop counter. |
| Admin console | Lesho staff | Desktop web. Separate auth audience and network restrictions. |

### A4. Environments

`local` → `dev` → `staging` → `production`. Each has its own database, storage bucket, keys and SMS sender. Staging mirrors production configuration and uses test SMS numbers. No production data in lower environments.

### A5. Non-functional targets (initial)

| Area | Target |
| --- | --- |
| API latency | p95 under 300 ms for reads, under 500 ms for writes |
| Realtime delivery | Message visible to the other party within 1 s when both are online |
| Availability | 99.5% monthly for the API |
| Lead durability | Zero lost leads: a 2xx on create means the lead is stored and its notification is queued |
| Media | First reel frame within 1.5 s on 4G |
| Scale to plan for | 1 city, 5,000 businesses, 200,000 consumers, 50 leads per second at peak |

---

## Part B — Low-level design

### B1. Module boundaries

Each module owns its entities and exposes functions to others. No module writes another module's tables directly.

| Module | Owns | Calls |
| --- | --- | --- |
| identity | users, sessions, devices, consents | notifications (OTP) |
| businesses | businesses, branches, members, verification | identity |
| catalogue | categories, products, rental terms, availability blocks, showtimes | businesses |
| content | posts, stories, media | catalogue, businesses |
| offers | offers, claims | catalogue, leads |
| leads | leads, lead events, attribution events, references | businesses, catalogue, offers, rentals, messaging, billing |
| rentals | rental requests, deposit status | leads, catalogue |
| messaging | threads, messages, read state | leads, notifications |
| events | events, showtimes | businesses, leads |
| reviews | reviews, replies | leads (verification check) |
| engagement | saves, follows, likes, views | content, catalogue |
| discovery | feed assembly, search, ranking | catalogue, content, offers, events, engagement |
| guide | intent parsing, result explanation | discovery |
| notifications | in-app, push, SMS, preferences | identity |
| analytics | daily aggregates | reads events from all |
| billing | billing rules, ledger, invoices, plans, entitlements | leads |
| admin | moderation, disputes, config | all |

### B2. Request path

1. Gateway assigns `X-Request-Id`, terminates TLS, applies IP rate limits.
2. API authenticates the bearer token, loads the actor and role, checks authorisation for the resource.
3. Validates the body against a schema. Unknown fields are rejected.
4. For mutating requests with `Idempotency-Key`, looks up the key; replays the stored response if present.
5. Runs the use case inside one database transaction. Side effects are written to the **outbox** in the same transaction.
6. Commits, stores the idempotent response, returns.
7. An outbox relay publishes events to the queue and to pub/sub. Workers and the realtime gateway react.

### B3. Outbox and events

Every state change that others care about writes an outbox row `{id, type, aggregateId, payload, createdAt}` in the same transaction as the change. A relay publishes rows in order and marks them sent. Consumers are idempotent (dedupe on event id).

Core event types:

`lead.created`, `lead.status_changed`, `lead.expired`, `claim.created`, `claim.redeemed`, `claim.expired`, `rental.accepted`, `rental.declined`, `rental.handed_over`, `rental.returned`, `message.created`, `thread.read`, `post.published`, `story.published`, `story.expired`, `offer.published`, `offer.ended`, `product.updated`, `business.verified`, `review.created`, `billing.event_recorded`, `report.created`.

### B4. Real-time strategy

Decide per data type. The rule: push what a person is waiting on; poll what is merely nice to have; compute on the client what is deterministic.

| Data | Mechanism | Detail |
| --- | --- | --- |
| Chat messages, typing | **WebSocket push** | Channel `thread:{id}`. Fallback: **long polling** `GET /threads/{id}/messages?after=…&wait=25`. |
| Consumer: lead and claim status | **WebSocket push** | Channel `user:{id}`. Events `lead.status_changed`, `claim.redeemed`, `claim.expired`, `rental.*`. |
| Merchant: new leads, lead updates | **WebSocket push** | Channel `business:{id}`. Fallback: **short polling** every 15 s on the inbox while open. |
| Unread counts (badge) | Push, with **short polling** every 60 s as a safety net | `GET /me/unread`. |
| Claim countdown | **Client-side** from `expiresAt` and server clock offset | No polling. Expiry is enforced on the server. The client re-fetches the claim once when its timer hits zero. |
| Story and reel feeds | Request on open, pull to refresh | No push. |
| Home feed, search, map | Request and response, cached | No push. |
| Merchant analytics | Request on open; **short polling** every 5 min while visible | Data is aggregated, not live. |
| Notifications when the app is closed | **Push notification** (FCM / APNs) | Sent by workers. |
| Moderation queue (admin) | **Short polling** every 30 s | Low volume. |

WebSocket rules:

- Authenticate on connect with a short-lived token from `POST /realtime/token`. Re-issue on expiry.
- The server authorises every subscription: a user may join `user:{self}`, `thread:{id}` only if a participant, `business:{id}` only if a member.
- Events carry an increasing `seq` per channel. On reconnect the client sends the last `seq`; the server replays missed events or tells the client to refetch.
- Heartbeat every 25 s. Clients back off exponentially on reconnect (1 s to 30 s, with jitter).
- The gateway is stateless apart from connections; fan-out is through pub/sub.

Clock handling: every response includes `Date`. The client computes `offset = serverNow − deviceNow` once per session and uses it for countdowns, so a wrong device clock cannot show a wrong timer.

### B5. Atomic operations

These must be all-or-nothing and safe under concurrency. Use a transaction with a conditional update (compare-and-set) or a unique constraint; never read-then-write without a guard.

| Operation | Guarantee | How |
| --- | --- | --- |
| Create lead | One lead per `Idempotency-Key`; duplicate rule applied | Unique `(actorId, idempotencyKey)`; duplicate lookup inside the transaction |
| Generate reference | Globally unique public code | Unique index on `reference`; regenerate on collision |
| Claim offer | Respects per-user limit and total limit; stamps `expiresAt` | Unique `(offerId, userId, activeSlot)`; atomic counter `claimsCount < maxClaims` |
| Redeem claim | Exactly once; only if not expired | `UPDATE … SET status='redeemed' WHERE id=? AND status='claimed' AND (expiresAt IS NULL OR expiresAt > now)`; check affected rows |
| Expire claim | Does not race with redeem | Same conditional update, `status='claimed' AND expiresAt <= now` |
| Accept rental | No overlapping accepted rentals for one unit | Overlap check and insert of a hold in one transaction; exclusion constraint or a per-product lock |
| Rental status steps | Only legal transitions | Conditional update on current status |
| Send message | Ordered, no duplicates | Per-thread sequence incremented atomically; unique `(threadId, clientMessageId)` |
| Mark thread read | Monotonic | `lastReadSeq = max(lastReadSeq, ?)` |
| Record billable event | Charged once per milestone | Unique `(leadId, milestone)` in the ledger; append-only |
| Like, save, follow | Idempotent toggles | Unique `(userId, targetType, targetId)`; counters updated in the same transaction or by a worker |
| OTP verify | Limited attempts, single use | Atomic decrement of attempts; delete on success |
| Publish story or post | Has at least one valid link | Validated in the transaction that inserts it |

With a document database, use multi-document transactions for the rows marked above and unique indexes for the rest. With a relational database, use transactions, unique constraints and, for rentals, an exclusion constraint on a date range.

### B6. State machines

Kept as separate dimensions. Never one status field that mixes them.

**Lead status** (shared core):

```
created -> delivered -> acknowledged -> contacted -> qualified -> outcome
                                                               \-> not_interested | unreachable
created|delivered -> expired        (no acknowledgement in time)
any open -> cancelled               (by consumer)
any -> disputed -> upheld | rejected
any -> invalid                      (spam or duplicate)
```

`outcome` is one of `visited`, `redeemed`, `attended`, `converted` (merchant-reported sale), `handed_over`/`returned` (rentals).

**Claim status:** `claimed -> redeemed`, `claimed -> expired`, `claimed -> cancelled`.

**Rental status:** `requested -> accepted -> handed_over -> returned`; `requested -> declined`; `requested|accepted -> cancelled`.

**Deposit status** (rentals, merchant-reported): `none | not_collected | held | refunded | deducted`.

**Verification status** (business): `pending -> verified | rejected`; `verified -> suspended`.

**Content status:** `draft -> published -> removed`; stories also `published -> expired`.

**Billing status** (per lead): `pending | billable | not_billable | on_hold | credited`.

### B7. Background jobs

| Job | Trigger | Does |
| --- | --- | --- |
| Claim expiry sweeper | Every minute, plus a delayed job at `expiresAt` | Conditionally expires claims; emits `claim.expired` |
| Story expiry | Every 5 min | Marks stories older than 24 h expired; removes from feeds |
| Lead response timer | Hourly | Reminds merchants at 24 h; expires unacknowledged leads at 72 h |
| Rental reminders | Daily | Return due today or overdue |
| Offer end | Hourly | Ends offers past `endsAt`; expires their open claims |
| Notification fan-out | On events | In-app record, push, SMS where configured |
| Media pipeline | On upload | Virus scan, image variants, video transcode, poster frame |
| Search indexer | On `product.updated`, `business.verified`, etc. | Upserts search documents |
| Analytics roll-up | Every 15 min and nightly | Builds `analytics_daily` from event tables |
| Billing | On billable milestones; monthly invoice run | Appends ledger rows; produces invoices |
| Duplicate and fraud scan | On `lead.created` and nightly | Flags repeats, bursts and self-leads |

Jobs are idempotent and retried with backoff. Failures go to a dead-letter queue with alerting.

### B8. Caching

| What | Where | TTL / invalidation |
| --- | --- | --- |
| Category configuration | In-process + KV | 10 min; purge on admin change |
| Business profile, product detail | KV | 60 s; purge on update event |
| Home sections per area | KV | 2–5 min |
| Search results | None initially | — |
| Counters (likes, views) | KV, flushed to DB | Flush every 30 s |
| Media | CDN | Immutable URLs, long max-age |

Never cache personalised or permission-dependent responses in a shared cache.

### B9. Search and geo

- Each listing, business and event has a search document: text fields, category, area, coordinates, price, rating, flags (`hasOffer`, `forRent`, `verified`).
- Distance is measured from the centre of the selected area unless the consumer has shared location for this session.
- Ranking inputs, in order: text and intent match, category, distance, budget fit, data freshness, rating evidence, engagement (secondary). Paid placement is a separate, labelled slot and never reorders organic results.
- Map queries take a bounding box and return pins grouped by business for listings.

### B10. Media

Upload is direct to object storage with a presigned URL; the API never proxies bytes. After upload the client confirms with the media id; a worker scans and processes. Only processed media can be attached to published content. Images get 200, 400, 800 px variants in a modern format. Reels get HLS renditions and a poster.

### B11. AI guide

`POST /guide/messages` → guide module → `IntentParser` interface → structured intent → discovery search → `Explainer` builds reasons from stored facts only. The model never sees or produces prices, stock or ratings; those come from the catalogue. A keyword parser (the one in `concept/src/screens/Guide.jsx`) is the fallback and the test oracle.

### B12. Observability

- Structured logs with request id, actor id, module. No personal data or tokens in logs.
- Metrics: request rate, latency, error rate per endpoint; queue depth and age; websocket connections; leads created, delivered, acknowledged; claims created, redeemed, expired.
- Tracing across API, queue and workers.
- Alerts: lead delivery lag over 1 min, expiry sweeper lag over 2 min, error rate over 2%, dead-letter growth.

### B13. Data lifecycle

- Soft-delete user-facing content (`removedAt`); hard-delete on account erasure requests, keeping billing records with personal fields nulled.
- Stories are retained 30 days after expiry for moderation, then deleted.
- Attribution events older than 13 months are aggregated and dropped.
- Backups: daily full, point-in-time recovery, restore tested quarterly.
