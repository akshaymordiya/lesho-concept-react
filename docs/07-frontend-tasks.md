# 07 — Frontend task plan

Three clients share one design system: the **consumer app**, the **merchant app** and the **admin console**. The concept prototype in `concept/` is the reference for every screen. Production keeps its layout, wording and honesty labels and replaces mock state with the API.

## How to use this list

- Work top to bottom; ids (`F2.3`) are stable.
- Before each screen: open it in the prototype (desktop side panel has a jump list), read the module doc, then build.
- Until the matching backend phase lands, build against a mock server generated from the OpenAPI description, using the shapes in the module docs. Never hard-code mock data in components.

## Why this order

1. **Design system first** so every screen is consistent and fast to build.
2. **Data layer and auth next**: one API client, caching, errors, idempotency keys, clock offset.
3. **The core consumer loop** (browse → product → enquiry → reference → chat) and the **merchant inbox** together, matching backend phase 3, so the product can be demonstrated end to end early.
4. **Claims, rentals, content** follow the backend.
5. **Real-time** replaces polling once the gateway exists.
6. **Guide, map, analytics and admin** last.

## Platform decision (F0)

| Id | Task | Done when |
| --- | --- | --- |
| F0.1 | Choose platform | React Native (one codebase for iOS and Android, web through React Native Web) or native apps plus a React web app. Record in `frontend/DECISIONS.md`. The design tokens and components are platform-neutral. |
| F0.2 | Monorepo layout | `frontend/packages/{tokens, ui, api, state, i18n}`, `frontend/apps/{consumer, merchant, admin}`. Lint, type checks, unit tests, visual tests in CI. |

## Phase 1 — Design system (weeks 1–3)

| Id | Task | Read | Done when |
| --- | --- | --- | --- |
| F1.1 | Tokens | `01-design-system.md` §2–4 | Colours, type scale, spacing, radius, shadows, motion exported from `tokens`; values match `concept/src/styles.css` exactly |
| F1.2 | Typography and icons | §3, §6 | Plus Jakarta Sans bundled; Lucide icons; text components (`H1`, `H2`, `H3`, `Body`, `Small`, `Tiny`, `Eyebrow`, `Price`) |
| F1.3 | Primitives | §6 | Button (primary, dark, soft, ghost, sizes), IconButton, Chip, Badge (tones), SegmentedControl, Card (tones), Note, KeyValue row, Divider, Toggle, Checkbox row, Stepper |
| F1.4 | Inputs | §7 | TextField, TextArea with label and error, SearchField, OTP input |
| F1.5 | Overlays | §6 | Bottom sheet, centred popover, toast, confirm dialog |
| F1.6 | Navigation | §5 | Floating dark pill tab bar with label morph and badges; stack navigation that preserves scroll; sticky top bar; bottom action bar |
| F1.7 | Commerce cards | §6 | ProductCard (sale, rent, buy-or-rent, offer badge), BusinessCard, EventCard, OfferCard, PostTile, StoryTile, ListRow variants, ReviewCard |
| F1.8 | Media | §7 | Image with shimmer and fallback; carousel with dots; video player for reels |
| F1.9 | Reference and timer | §6 | QR code component (real QR in production), reference code text, Countdown that uses server clock offset, TimerBox, TimerLine |
| F1.10 | Empty, loading, error states | §7 | Empty component; skeleton rows for each card type; inline and full-screen error with retry |
| F1.11 | Catalogue of components | — | Storybook (or equivalent) with every component and state; visual regression baseline |

## Phase 2 — App shell, data layer, auth (weeks 3–4)

| Id | Task | Done when |
| --- | --- | --- |
| F2.1 | API client | Typed from OpenAPI; envelope and error parsing; `X-Request-Id` logging; `Idempotency-Key` generated per user action and reused on retry; `X-Business-Id` in merchant app |
| F2.2 | Server state | Query cache with stale times per resource (see 02 B8); optimistic updates for saves, likes, follows, read receipts; cursor pagination helpers |
| F2.3 | Clock offset | Compute from `Date` header once per session; expose `serverNow()` for timers |
| F2.4 | Auth | Phone + OTP screens, token storage (keystore or HttpOnly cookie), refresh rotation, logout, session expiry handling |
| F2.5 | Onboarding | Welcome collage, value proposition, location choice (use location or choose area), merchant demo entry → real "I run a business" entry |
| F2.6 | Area context | Area sheet, persisted selection, remote-city empty states |
| F2.7 | Deep links | `lesho://` and https links for product, business, event, offer, lead, thread, story, post |
| F2.8 | Analytics events | Batched impressions and views to `/events/attribution`; clicks through `/events/clicks` before opening the external app |
| F2.9 | Mode switch | One account in both apps or one app with a mode switch (decided in F0); merchant mode requires membership |

## Phase 3 — Core consumer loop and merchant inbox (weeks 4–7)

Consumer:

| Id | Screen | Prototype | Done when |
| --- | --- | --- | --- |
| F3.1 | Home | `Home.jsx` | Sections from `/home`, only non-empty ones; carousels respect the left gutter; prompt chips open the guide; message icon with unread badge |
| F3.2 | Explore list | `Explore.jsx` | Search, category chips, type tabs, filter and sort sheets, sponsored label, empty state with "Ask the guide" |
| F3.3 | Product detail | `Detail.jsx` ProductDetail | Gallery, price and provenance, variants, stock note, offer card, attributes, seller, reviews, similar; category-specific action bar |
| F3.4 | Business profile | BusinessProfile | Cover, avatar with story ring, follow, quick actions recording clicks, tabs, about with verification explanation, report |
| F3.5 | Enquiry sheet | `Flows.jsx` LeadSheet | Category options, note, consent, validation after first submit |
| F3.6 | Visit intent | VisitIntent | Day chips, arrival windows, party size, note, consent, honest banner |
| F3.7 | Reference confirmation | RefConfirm | Dark screen, ticket card, QR, timeline from API, message and done buttons |
| F3.8 | Enquiries and messages hub | `Activity.jsx` | Enquiries tab with search, All/Active/Past/Rentals filters, QR thumbnail opening the popover; Messages tab |
| F3.9 | Chat | Chat | Header, enquiry card, bubbles with `seq` order, system pills, quick replies, offline send queue, read receipts, polling fallback |
| F3.10 | Saved and profile | `Me.jsx` | Saved with type filters and unsave; profile summary cards; preferences; replay onboarding |

Merchant:

| Id | Screen | Prototype | Done when |
| --- | --- | --- | --- |
| F3.11 | Merchant onboarding | — | Create business, first branch with map pin and hours, verification upload |
| F3.12 | Dashboard | `Merchant.jsx` MDashboard | Header, 7-day chart, four stat cards, rentals strip, reference lookup |
| F3.13 | Lead inbox | MLeads | Leads and Messages tabs, kind filters with explanations, lead cards with billing and timer badges |
| F3.14 | Lead detail | MLeadDetail | Request, privacy-limited consumer info, allowed actions from the API, evidence button, dispute, message button |
| F3.15 | Catalogue and editor | MCatalogue, ProductEditor | List with badges; editor with sell / rent out / both, category, attributes from schema, stock |

Exit: the end-to-end demo in backend phase 3 works on real devices.

## Phase 4 — Offers, coupons, claim expiry (weeks 7–8)

| Id | Task | Done when |
| --- | --- | --- |
| F4.1 | Offer detail | Orange header, coupon code hidden until claimed, "After you claim" row, steps, applies to, terms, timer hint, claim with consent; "Claim again" after an expired claim |
| F4.2 | Claim confirmation | Coupon box, timer box with server-corrected countdown, expired state; refetch once at zero |
| F4.3 | Timers everywhere | Enquiry card badge, QR popover line, merchant lead badge and detail row; all from `expiresAt` |
| F4.4 | Merchant offer composer | Title, validity, eligible items, claim-expiry chips with Premium badge, coupon code, terms, preview; `feature_not_in_plan` handled with an upgrade explanation |
| F4.5 | Redemption at the counter | Scan QR with the camera or type the suffix; result screen for valid, expired, already redeemed |

## Phase 5 — Rentals (weeks 8–9)

| Id | Task | Done when |
| --- | --- | --- |
| F5.1 | Rental block on product detail | Rates, deposit, minimum, handover, included, 14-day strip from `/availability`, rental record, terms |
| F5.2 | Request to rent | Start-date chips with booked days disabled, length stepper, live quote from `/rentals/quote`, clash card with next free start and alternatives, handover, option, confirmations, consent |
| F5.3 | Rental confirmation and status | Summary rows with deposit separate, timeline by rental status |
| F5.4 | Merchant rental actions | Accept, decline with suggested start, hand over (scan), return with deposit status |
| F5.5 | Merchant rental editor | Rate, unit, deposit, minimum, handover, includes, booked-days picker |
| F5.6 | Discovery hooks | "Rent, don't buy" section, For rent filter, Rentals tab on profiles, rental intents in the guide |

## Phase 6 — Content and entertainment (weeks 9–11)

| Id | Task | Done when |
| --- | --- | --- |
| F6.1 | Reels feed | Vertical snap feed, autoplay current only, preload next, tap to pause, double-tap like, progress, tags, CTA, swipe hint once |
| F6.2 | Post viewer | Swipeable slides with segmented progress, per-slide tag, up and down between posts |
| F6.3 | Stories | Segmented progress, 5 s auto-advance, tap zones, hold to pause, swipe between businesses, swipe down to close, seen state |
| F6.4 | Merchant composer | Type grid (product, rental, reel, story, image, photo dump, offer, update, event), media upload with progress, link picker, preview, publish, scheduled publish (premium) |
| F6.5 | Events | Event detail, ticket request sheet, enquiry, external ticket link click |
| F6.6 | Entertainment | Showtimes block, booking page click, coupon CTA, group booking enquiry, "Now showing" section |
| F6.7 | Reviews | Composer with photos and verification explanation; review lists; merchant reply |

## Phase 7 — Real-time and notifications (weeks 11–12)

| Id | Task | Done when |
| --- | --- | --- |
| F7.1 | Socket client | Token fetch, connect, subscribe to `user:self` and open threads (`business:{id}` in merchant app), resume with `afterSeq`, backoff, fall back to polling automatically |
| F7.2 | Live updates | Chat messages and typing, lead and claim and rental status, inbox previews and unread badges without refetching lists |
| F7.3 | Push notifications | Permission prompt after the first lead (not at launch); token registration; deep link handling from cold start |
| F7.4 | In-app notifications | Bell list where present, read state |

## Phase 8 — Guide, map, analytics, admin (weeks 12–15)

| Id | Task | Done when |
| --- | --- | --- |
| F8.1 | AI guide | Empty state with prompts, sessions, interpretation bubble, chips, result cards with reasons, compare sheet, follow-ups, disclaimer |
| F8.2 | Map view | Native map SDK or web map; circular photo pins with counts; selected pin callout; result cards synced with pins; distance chips; recentre; clustering |
| F8.3 | Merchant analytics | Four-stage funnel, stage tabs, bill breakdown, never-billed list, updated-at label |
| F8.4 | Billing and plan | Invoices, ledger with lead references, plan and features page |
| F8.5 | Team management | Invite by phone, roles, branch restriction |
| F8.6 | Admin console | Queues (verification, reports, disputes, fraud), lookups, configuration editors with audit view; desktop layout using the same tokens |

## Phase 9 — Quality and launch (weeks 15–16)

| Id | Task | Done when |
| --- | --- | --- |
| F9.1 | Accessibility pass | Labels, focus order, contrast, dynamic type, reduced motion, screen reader on every screen |
| F9.2 | Performance | Image sizes from variants; list virtualisation; first reel frame under 1.5 s on 4G; cold start under 2.5 s on a mid-range Android |
| F9.3 | Offline and errors | Saved and references readable offline; queued chat sends; clear retry states |
| F9.4 | Localisation readiness | All strings in `i18n`; INR and date formatting helpers; Gujarati and Hindi later |
| F9.5 | End-to-end tests | Every journey in the acceptance list below |
| F9.6 | Store readiness | Privacy labels, permissions copy, screenshots |

## Acceptance journeys (must pass before launch)

1. New user signs in, picks an area without location permission, browses Home.
2. Asks the guide for a wedding saree around ₹5,000, refines to silk, compares two, opens one, sends an availability enquiry.
3. Merchant receives it live, replies in chat; consumer sees the reply live and the status change to contacted.
4. Consumer plans a restaurant visit; confirmation says it is not a reservation; merchant checks the reference; review becomes "Verified visit".
5. Consumer claims a coupon with a 2-hour window; timer shows; merchant redeems with 1 hour left; claim shows redeemed on both sides.
6. Consumer claims an offer with a short window and lets it lapse; it shows expired, the code is hidden, the merchant cannot redeem it, it is not billed, and "Claim again" works.
7. Consumer requests a rental over a booked day, sees the clash, takes the next free start, sends; merchant accepts, hands over, marks returned with deposit refunded.
8. Consumer opens a film, sees showtimes, taps Booking page (recorded as a click), claims the cinema coupon.
9. Consumer watches reels (vertical swipe) and stories (tap, hold, swipe), opens a tagged product.
10. Explore in map view with "For rent", taps a pin, opens a listing from the card.
11. Merchant publishes a photo dump linked to two items, an offer with claim expiry and a coupon, and a rental listing in another category; all appear to consumers.
12. Merchant analytics show the four stages and a bill whose lines link to the leads above.
