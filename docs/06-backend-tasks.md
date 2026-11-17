# 06 — Backend task plan

Ordered for one team working top to bottom. Each phase ends in something that can be demonstrated. Tasks inside a phase can run in parallel unless a dependency is listed.

## How to use this list

- Take tasks in order. Do not start a phase until the previous phase's exit criteria are met.
- Each task names the docs to read, what to build, and how to know it is done.
- "Done" always includes: tests (unit plus API), the security checklist in `05-security.md` section 10, and docs updated if behaviour changed.
- Ids like `B3.2` are stable; reference them in branches and commits.

## Why this order

1. **Foundations before features.** Idempotency, the outbox, error format and auth are cheap early and painful to retrofit.
2. **The lead engine is the product.** Catalogue and businesses exist to feed it; build the simplest path from a listing to a lead to an acknowledged lead first (phase 3) so the core loop is demonstrable early.
3. **Atomic and time-based features next** (claims with expiry, rentals) because they carry the most correctness risk.
4. **Real-time after the data is right.** Polling works first; sockets replace it without changing data.
5. **Discovery polish, AI and analytics last.** They read data the earlier phases produce.

---

## Phase 0 — Decisions and skeleton (week 1)

| Id | Task | Detail | Done when |
| --- | --- | --- | --- |
| B0.1 | Choose stack | Language, framework, database engine, queue, cache, hosting. Record in `backend/DECISIONS.md` with reasons. Check that the engine supports transactions, unique and partial indexes, geo and text search, or plan the search index. | Decision file merged |
| B0.2 | Repository layout | `backend/src/modules/<module>/{routes, service, repo, schemas, events}`, `backend/src/platform/{db, cache, queue, auth, http, outbox, realtime, config, logging}`, `backend/test`. Lint, format, type checks. | CI runs lint and tests on every push |
| B0.3 | Configuration | Typed config from environment; secrets from a manager; `.env.example`. Separate local, dev, staging, prod. | App boots with missing optional config and fails fast on missing required config |
| B0.4 | Local environment | Containers for database, cache, queue, object storage emulator. One command to start. Seed script. | `make up && make seed` gives a working API |
| B0.5 | Observability base | Structured logging with request id, metrics endpoint, tracing hooks, health and readiness endpoints. | `/health` and `/ready` respond; logs carry request ids |

## Phase 1 — Platform foundations (weeks 1–2)

| Id | Task | Read | Done when |
| --- | --- | --- | --- |
| B1.1 | HTTP conventions | `04-api-conventions.md` 1–7 | Envelope, error codes, validation with `fields`, cursor pagination helper, `X-Request-Id`, `Date` |
| B1.2 | Idempotency middleware | 04 §8, 03 infrastructure | Same key + same body replays; different body → `409 idempotency_conflict`; TTL 24 h |
| B1.3 | Transaction + outbox | 02 B2–B3 | Helper that runs a use case in a transaction and writes outbox rows; relay publishes to queue and pub/sub; consumers dedupe by event id |
| B1.4 | Job runner | 02 B7 | Delayed jobs, cron jobs, retries with backoff, dead-letter, metrics |
| B1.5 | Rate limiter | 04 §10 | Sliding window in cache; headers returned; per-route config |
| B1.6 | Audit log | 05 §8 | `audit(actor, action, target, before, after)` helper used by later tasks |
| B1.7 | Media upload | 04 §14, 02 B10 | Presigned upload, complete, worker that scans, strips metadata, makes variants; video transcode can be stubbed until B6 |
| B1.8 | Reference generator | Module 08 rule 3 | Unique, collision-retry, prefix by type |

## Phase 2 — Identity, places, businesses, catalogue (weeks 2–4)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B2.1 | OTP sign-in, sessions, refresh rotation, logout | B1.* | Module 01 endpoints; refresh reuse revokes family; OTP limits enforced; SMS behind an interface with a console adapter for dev |
| B2.2 | Roles and authorisation layer | B2.1 | Consumer ownership checks; merchant membership + role + branch checks via `X-Business-Id`; admin audience; tests prove cross-tenant access is denied |
| B2.3 | Me, profile, devices, consents | B2.1 | `GET/PATCH /me`, profile, device registration, consent rows |
| B2.4 | Cities, areas | — | `GET /areas`; seed Ahmedabad areas from the prototype |
| B2.5 | Categories | — | Category entity with lead config and attribute schemas; seed all ten from `concept/src/data.js` |
| B2.6 | Businesses, branches, team | B2.2 | Module 02 merchant endpoints; verification requests; admin approve and reject |
| B2.7 | Catalogue | B2.5, B2.6 | Products with `mode`, attribute validation, stock endpoint, rental terms and blocked dates, showtimes; module 03 endpoints |
| B2.8 | Public reads | B2.7 | `GET /businesses/{id}` (+ tabs), `GET /products/{id}`, `/similar`, with provenance fields and viewer flags |

Exit: a merchant can sign in, create and get a business verified, publish listings in any category including rentals and films; a consumer can read them.

## Phase 3 — The lead engine, messaging and the core loop (weeks 4–6)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B3.1 | Leads: create | B2.* | `POST /v1/leads` for enquiry, visit, event request, event enquiry; category validation; consent required; idempotent; duplicate rule; thread + system message in the same transaction |
| B3.2 | Leads: consumer reads | B3.1 | `GET /me/leads` with search and active/past grouping, detail with timeline, cancel, confirm outcome |
| B3.3 | Leads: merchant inbox and actions | B3.1 | `GET /merchant/leads` with kinds, detail with privacy rules, all transitions as verbs with conditional updates, lookup by reference or suffix, transfer branch |
| B3.4 | Clicks and attribution events | B2.8 | `POST /events/clicks`, batched `POST /events/attribution`, high-volume storage partitioned by day |
| B3.5 | Messaging | B3.1 | Threads, messages with per-thread `seq`, read state, unread counts, long-poll endpoint, close, report; business reply moves lead to contacted |
| B3.6 | Lead timers | B1.4 | 24 h reminder and 72 h expiry jobs |
| B3.7 | Disputes | B3.3 | Merchant dispute; admin resolve; billing state on hold |

Exit: end-to-end — consumer enquires from a product page, merchant sees it, replies in chat, marks contacted, checks the reference; consumer sees every step (by polling).

## Phase 4 — Offers, coupons, claims with expiry (weeks 6–7)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B4.1 | Plans and entitlements | B2.6 | `plans`, `entitlements`, feature check helper returning `403 feature_not_in_plan`; seed free and premium plans |
| B4.2 | Offers CRUD | B4.1 | Module 07 merchant endpoints; coupon code encrypted, unique per business among live offers; `claimWindowMinutes` validated and gated |
| B4.3 | Claim | B4.2, B3.1 | Atomic claim per module 07 (limits, counter, `expiresAt = min(window, endsAt)`), lead type `claim`, coupon code only to holder |
| B4.4 | Redeem | B4.3 | Conditional update; `410 claim_expired`, `409 claim_already_redeemed`; evidence and outcome recorded |
| B4.5 | Expiry | B4.3, B1.4 | Delayed job at `expiresAt` and minute sweeper running the same conditional update; `claim.expired` event; lead closed; never billed; reclaim allowed per `allowReclaim` |
| B4.6 | Offer end | B4.5 | Ending an offer expires open claims and notifies |
| B4.7 | Concurrency tests | B4.4, B4.5 | Parallel redeem vs expire at the boundary; parallel claims at `totalLimit`; exactly-once proven |

## Phase 5 — Rentals (weeks 7–8)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B5.1 | Availability and quote | B2.7 | Module 09 availability and quote, including conflicts, next available start and alternatives |
| B5.2 | Rental request | B5.1, B3.1 | Creates a `rental` lead and `rentals` row; validation per terms; does not block dates |
| B5.3 | Accept and decline | B5.2 | Atomic overlap check and block insert; exclusion constraint or per-day unique rows; system messages |
| B5.4 | Handover and return | B5.3 | Evidence, deposit status (merchant-reported), completed count, early-return release |
| B5.5 | Rental jobs | B1.4 | Return due, overdue, unanswered request expiry |
| B5.6 | Concurrency tests | B5.3 | Two accepts for overlapping dates → exactly one succeeds |

## Phase 6 — Content, stories, events, reviews, engagement (weeks 8–10)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B6.1 | Video pipeline | B1.7 | HLS renditions and poster frames |
| B6.2 | Posts | B6.1 | Reels, images, dumps, updates with link validation; scheduled publishing behind entitlement |
| B6.3 | Stories | B6.1 | Items, 24 h expiry job, views and seen state |
| B6.4 | Likes, saves, follows | B2.8 | Idempotent toggles, counters |
| B6.5 | Events | B2.6 | Module 11 endpoints; cancellation notifies open requests |
| B6.6 | Reviews | B3.3 | Module 12; verification computed from lead outcomes; merchant reply; rating recompute |

## Phase 7 — Notifications and real-time (weeks 10–11)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B7.1 | Notification service | B1.3 | In-app records, push (FCM/APNs), SMS for critical cases; catalogue in module 13; caps and quiet hours |
| B7.2 | Realtime gateway | B1.3 | Token endpoint, WebSocket with SSE fallback, channel authorisation, `seq` and resume, heartbeat |
| B7.3 | Wire events to channels | B7.2 | Messages, typing, read receipts, lead and claim and rental status, inbox updates, unread counts |
| B7.4 | Load test | B7.2 | 5,000 concurrent sockets, message p95 under 1 s |

## Phase 8 — Discovery, search, map, AI guide (weeks 11–13)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B8.1 | Search documents and indexer | B2.8, B6.* | Index listings, businesses, events with flags (`forRent`, `hasOffer`, `verified`) |
| B8.2 | Search endpoint | B8.1 | Filters, sorts, radius, rent mode, sponsored slot rules |
| B8.3 | Map endpoint | B8.1 | Bounding box, grouping by business, clustering beyond 200 pins |
| B8.4 | Home sections | B8.2 | Section assembly per area with caching; empty for coming-soon areas |
| B8.5 | Guide: keyword parser | B8.2 | Port the prototype parser; fixture tests from the prototype prompts |
| B8.6 | Guide: LLM parser | B8.5 | Provider interface, schema-constrained output, timeout and fallback, prompt-injection tests |
| B8.7 | Guide: sessions, results, reasons, compare | B8.5 | Module 05 endpoints; reasons only from stored facts |

## Phase 9 — Analytics, billing, admin (weeks 13–15)

| Id | Task | Depends | Done when |
| --- | --- | --- | --- |
| B9.1 | Analytics roll-up | B3.4 | `analytics_daily` every 15 min; small-number suppression |
| B9.2 | Dashboard and analytics endpoints | B9.1 | Module 14 |
| B9.3 | Billing ledger | B3.3, B4.4, B5.4 | Milestone listeners append ledger rows with unique keys; disputes produce credits |
| B9.4 | Invoices | B9.3 | Monthly run, GST, line items linked to leads |
| B9.5 | Admin console API | B2.6, B3.7 | Module 15 queues and configuration with audit |
| B9.6 | Fraud scan | B3.1 | Bursts, self-leads, shared devices; flags into admin queue |

## Phase 10 — Hardening and launch (weeks 15–16)

| Id | Task | Done when |
| --- | --- | --- |
| B10.1 | Security review against `05-security.md` | Every item checked; findings fixed |
| B10.2 | Privacy: export and deletion | Jobs complete within targets; billing records anonymised |
| B10.3 | Backups and restore drill | Point-in-time restore tested |
| B10.4 | Runbooks and alerts | Alerts from 02 B12 live; runbooks for SMS, realtime, DB failover, key leak |
| B10.5 | Load and soak test | Targets in 02 A5 met for 24 h |
| B10.6 | Feature flags | Lead creation per category, messaging, guide, rentals, coupons can be switched off independently |
| B10.7 | Staging sign-off | Full end-to-end run of every journey in `07-frontend-tasks.md` acceptance list against staging |

## Definition of done (every task)

1. Behaviour matches the module doc; deviations are written back into the doc.
2. Unit tests for rules; API tests for every endpoint including auth, validation and cross-tenant denial.
3. Atomic operations have a concurrency test.
4. Errors use shared codes; responses use the envelope.
5. Events written to the outbox for every state change others need.
6. No personal data in logs; security checklist passed.
7. OpenAPI description updated (generated from schemas).
