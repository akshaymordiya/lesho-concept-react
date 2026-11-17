# Lesho documentation

Version 1, written from the concept prototype in `concept/` and the product definition in `concept/LESHO_PRODUCT_CONCEPT_AND_FABLE5_PROMPT.md`.

The prototype lives in https://github.com/akshaymordiya/lesho-concept-react. Paths such as `concept/src/styles.css` in these docs are relative to that repository's root.

These documents are the build specification. An engineer or agent should be able to pick up any task in `06-backend-tasks.md` or `07-frontend-tasks.md` and find every rule, field and payload it needs here.

## Reading order

| # | File | Read it when |
| --- | --- | --- |
| 00 | `00-overview.md` | First. Product, actors, modules, vocabulary, what is decided and what is open. |
| 01 | `01-design-system.md` | Before any UI work. Tokens, type, components, patterns, wording rules. |
| 02 | `02-architecture.md` | Before any backend work. High-level and low-level design, real-time strategy, atomic operations, jobs, caching, environments. |
| 03 | `03-data-model.md` | When creating storage. Every entity, field, constraint, index and state machine, independent of database engine. |
| 04 | `04-api-conventions.md` | Before writing or calling any endpoint. |
| 05 | `05-security.md` | Before shipping anything. Threats, controls, privacy, abuse. |
| 06 | `06-backend-tasks.md` | The ordered backend plan. |
| 07 | `07-frontend-tasks.md` | The ordered frontend plan. |

## Module files

Each file in `modules/` covers one feature area: purpose, rules, screens in the prototype, entities, endpoints with request and response bodies, real-time behaviour, atomic operations and edge cases.

| File | Area |
| --- | --- |
| `modules/01-identity-and-accounts.md` | Sign-in, sessions, roles, consumer profile, preferences |
| `modules/02-businesses-and-branches.md` | Business profiles, branches, team, verification |
| `modules/03-catalogue.md` | Products, services, dishes, shows, listing modes, category attributes |
| `modules/04-discovery-search-map.md` | Home feed, search, filters, areas, map |
| `modules/05-ai-guide.md` | Guided discovery |
| `modules/06-content.md` | Reels, stories, image posts, photo dumps, updates |
| `modules/07-offers-coupons-claims.md` | Offers, coupon codes, claims, claim expiry, redemption |
| `modules/08-leads-and-references.md` | The lead engine: enquiries, visit intents, references, attribution, disputes |
| `modules/09-rentals.md` | Rental listings, availability, requests, handover, return |
| `modules/10-messaging.md` | Inbox and chat per enquiry |
| `modules/11-events-and-entertainment.md` | Events, ticket requests, showtimes |
| `modules/12-reviews.md` | Reviews, verification labels, replies |
| `modules/13-saved-follows-notifications.md` | Saved items, follows, notifications |
| `modules/14-merchant-analytics-billing-plans.md` | Funnel analytics, billable events, invoices, plans and premium features |
| `modules/15-admin-and-moderation.md` | Verification queue, moderation, disputes, configuration |

## How the prototype maps to these docs

| Prototype file | Documented in |
| --- | --- |
| `concept/src/styles.css` | `01-design-system.md` |
| `concept/src/data.js` | `03-data-model.md` (shapes), module files (rules) |
| `concept/src/App.jsx` | `02-architecture.md` (state that becomes server state) |
| `concept/src/screens/*.jsx` | The matching module file, "Screens" section |

## Conventions used in these docs

- **Must / must not** mark requirements. **Should** marks a strong default that can be changed with a written reason.
- **Decided** means settled. **Open** means a product decision is still needed; the doc gives a default so work is not blocked, and the default is isolated behind configuration.
- Field types are abstract: `id`, `string`, `text`, `int`, `money`, `bool`, `timestamp`, `date`, `enum`, `json`, `geo`. See `03-data-model.md` section 1.
- Amounts are integers in paise. `₹4,850` is `485000`.
- All example ids and tokens are illustrative.
