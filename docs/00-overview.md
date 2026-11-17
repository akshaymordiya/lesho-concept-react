# 00 — Product overview

## 1. What Lesho is

Lesho helps people discover products, services, food, events, entertainment and rentals from local businesses, and turns that discovery into attributable enquiries and visits for those businesses.

It is **social in format, commerce-first in purpose**. It borrows reels, stories, photo posts, saves and follows from social apps, but every piece of content must link to a product, service, business, offer or event.

Lesho is **lead-based**. It does not sell goods, take payments, hold deposits, reserve tables, book seats or issue tickets. It creates a traceable **reference** for a customer's intent and carries it through to an outcome the business confirms.

## 2. What Lesho is not

| Not this | Because |
| --- | --- |
| A general social network | Content without a commercial link is out of scope and must be rejected at publish time. |
| A deals app | Businesses are discoverable without discounts. Offers are one signal, not the product. |
| A checkout or booking engine | No payments, no stock locks, no seat or table holds. Wording must never imply them. |
| A peer-to-peer marketplace | Listings come from businesses with a verification state. Individuals do not list. |

## 3. Actors

| Actor | Description | Client |
| --- | --- | --- |
| Consumer | Browses, saves, enquires, claims, requests rentals, chats, reviews. | Consumer app |
| Merchant member | Works for a business. Roles: owner, manager, staff. Publishes, answers leads, redeems claims, hands over rentals. | Merchant app |
| Admin | Lesho staff. Roles: moderator, support, finance, super-admin. Verifies businesses, moderates, resolves disputes, configures categories and pricing. | Admin console |
| System | Scheduled and event-driven jobs: expiry, notifications, aggregation, indexing. | Workers |

One person may be both a consumer and a merchant member. The account is one; the mode is chosen in the client.

## 4. Vocabulary

Use these words consistently in code, API and UI.

| Term | Meaning |
| --- | --- |
| Business | A merchant or organiser identity. Has one or more branches. |
| Branch | A physical outlet or service area with coordinates and hours. |
| Listing / catalogue item | A product, service, dish, show, activity or rental a business offers. Called `product` in the schema. |
| Listing mode | `sale`, `rent`, or `both`. |
| Post | A reel, image, photo dump or business update. Always linked to at least one entity. |
| Story | A short-lived item, visible for 24 hours, linked to an entity. |
| Offer | A structured benefit with validity and terms. A **coupon** is an offer that carries a code. |
| Claim | A consumer taking an offer. Produces a reference. May have an expiry set by the merchant. |
| Lead | Any deliberate consumer intent sent to a business: enquiry, visit intent, ticket request, rental request, claim. |
| Reference | The public code for a lead, for example `LSH-RNT-8K2QD`. Shown as text and as a QR. |
| Click | A tap on call, WhatsApp, directions or an external link. Recorded, never a lead and never billed. |
| Verified outcome | An outcome backed by evidence, normally the business checking the reference in person. |
| Merchant-reported | Stated by the business without Lesho evidence. Must be labelled as such. |
| Thread | The chat conversation attached to one lead. |

## 5. Modules

| # | Module | One-line scope |
| --- | --- | --- |
| 1 | Identity and accounts | Phone sign-in, sessions, roles, profile, preferences, consent. |
| 2 | Businesses and branches | Profiles, branches, hours, team, verification. |
| 3 | Catalogue | Listings in ten categories with category-specific attributes and listing modes. |
| 4 | Discovery, search and map | Home sections, search, filters, area selection, map view. |
| 5 | AI guide | Natural-language intent to cross-store results with reasons. |
| 6 | Content | Reels, stories, image posts, photo dumps, updates. |
| 7 | Offers, coupons and claims | Structured offers, coupon codes, claim expiry, redemption. |
| 8 | Leads and references | The lead engine, attribution, duplicates, disputes. |
| 9 | Rentals | Rental terms, availability, request, accept, handover, return, deposit status. |
| 10 | Messaging | One thread per lead, inbox, unread, real-time delivery. |
| 11 | Events and entertainment | Events, ticket requests, showtimes, venue enquiries. |
| 12 | Reviews | Reviews tied to an entity, verification labels, merchant replies. |
| 13 | Saved, follows, notifications | Bookmarks, follows, push and in-app notifications. |
| 14 | Merchant analytics, billing, plans | Four-stage funnel, billable events, invoices, premium features. |
| 15 | Admin and moderation | Verification, moderation, disputes, configuration. |

## 6. Categories

Ten categories. Each defines its own lead type, form fields and wording. Configuration lives in the `categories` entity, not in code branches.

| Id | Label | Primary lead action | Lead type |
| --- | --- | --- | --- |
| `fashion` | Fashion | Ask about availability | Availability enquiry |
| `food` | Food and dining | Plan a visit | Visit request, menu enquiry |
| `events` | Events | Request tickets | Ticket request, event enquiry |
| `entertainment` | Entertainment | Get coupon, ask the venue | Coupon claim, venue enquiry |
| `beauty` | Beauty | Request appointment | Appointment request |
| `electronics` | Electronics | Ask for quotation | Quotation request |
| `home` | Home | Request consultation | Showroom consultation request |
| `auto` | Automotive | Request service slot | Service appointment request |
| `fitness` | Fitness | Request a trial | Trial request |
| `services` | Local services | Request a callback | Callback request |

Rentals and offers cut across all categories.

## 7. Principles that constrain every feature

1. **Two equal discovery modes.** Guided (AI) and manual browsing. Neither gates the other.
2. **Honest labels.** Prices, stock, hours, showtimes and capacity are "merchant-provided" with a freshness time unless Lesho has evidence. A request is never shown as a confirmation.
3. **Engagement is not a lead; a click is not a contact.** Views, likes, saves, shares and clicks are diagnostics. They are stored separately and never billed.
4. **Category-aware conversion.** One lead foundation, different forms, labels and status paths per category.
5. **Consent before contact details move.** A consumer's phone number reaches a business only for a lead the consumer created, after an explicit consent tick.
6. **Privacy.** Businesses never see browsing, saves, preferences or live location.
7. **Paid placement is labelled** and never overrides relevance silently.
8. **Progressive disclosure.** Show the most useful information first.

## 8. Decided and open

### Decided

- Lead-based model; no in-app payment, deposit, booking or ticketing.
- Businesses only; no individual listers.
- Ten categories; rentals and offers available in all of them.
- One chat thread per lead; a business cannot start a conversation.
- Claim expiry is set per offer by the merchant and is a premium feature.
- The visual theme in `01-design-system.md` is fixed.
- India-first, INR, one launch city with a small number of areas.

### Open (defaults given so work is not blocked)

| # | Decision | Default used in these docs |
| --- | --- | --- |
| 1 | Which lead milestone is billable per category | Qualified enquiry and verified outcome, configurable per category in `billing_rules` |
| 2 | Lead prices | Placeholder rates in configuration; never hard-coded |
| 3 | Free allowance or trial | Entitlement `free_leads_per_month`, default 0 |
| 4 | Wallet prepay or monthly invoice | Monthly invoice; ledger supports either |
| 5 | Which features are premium | Claim expiry, coupon codes, rental listings, scheduled posts; held in `plans.features` |
| 6 | Duplicate window | Same consumer, same business, same subject within 24 hours |
| 7 | Merchant response expectation | Lead marked `expired` after 72 hours without acknowledgement |
| 8 | Review verification rule | Verified only when a linked lead reached a verified outcome |
| 9 | Database engine | Not chosen; schema is engine-neutral |
| 10 | Client platform | React-based clients assumed; tokens and flows are platform-neutral |
| 11 | AI provider | Not chosen; the guide is specified as an interface with a deterministic fallback |

Every open item is behind configuration or an interface so that a later decision does not require a schema or API change.
