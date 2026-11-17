# 03 — Data model

Engine-independent. It works as relational tables or as document collections; section 9 lists where the two differ.

## 1. Conventions

| Type | Meaning |
| --- | --- |
| `id` | Opaque, unique, time-sortable string (ULID recommended). Primary key of every entity. |
| `ref<X>` | An `id` pointing at entity X. Must exist (foreign key or validated on write). |
| `string` | Short text, length limit in notes. |
| `text` | Long text. |
| `int` | Integer. |
| `money` | Integer paise. Currency is INR unless a `currency` field says otherwise. |
| `bool` | True or false. |
| `timestamp` | UTC instant. |
| `date` | Calendar date in the branch's timezone. |
| `enum` | One of the listed values. |
| `json` | Structured object; shape given in notes. |
| `geo` | Latitude and longitude. |

Every entity has `id`, `createdAt`, `updatedAt`. User-facing content also has `removedAt` (soft delete). These are not repeated below.

Marks: **PK** primary key, **U** unique, **IX** indexed, **?** nullable.

## 2. Identity

### users

| Field | Type | Notes |
| --- | --- | --- |
| phone | string **U** | E.164. The sign-in identity. |
| name | string ? | Display name. |
| avatarMediaId | ref<media> ? | |
| status | enum | `active`, `suspended`, `deleted` |
| isAdmin | bool | Admin roles live in `admin_roles`. |
| lastSeenAt | timestamp ? | |

### sessions

| Field | Type | Notes |
| --- | --- | --- |
| userId | ref<users> **IX** | |
| refreshTokenHash | string **U** | Never store the token itself. |
| deviceId | ref<devices> ? | |
| audience | enum | `consumer`, `merchant`, `admin` |
| expiresAt | timestamp | |
| revokedAt | timestamp ? | |
| ip, userAgent | string | For the security log. |

### devices

`userId` **IX**, `platform` enum(`ios`,`android`,`web`), `pushToken` string ?, `lastActiveAt`.

### otp_challenges

`phone` **IX**, `codeHash`, `attemptsLeft` int, `expiresAt`, `purpose` enum(`login`). Stored in the KV store with a TTL; a table is acceptable.

### consumer_profiles

| Field | Type | Notes |
| --- | --- | --- |
| userId | ref<users> **U** | |
| areaId | ref<areas> ? | Last selected area. |
| interests | json | Array of category ids. |
| personalisation | bool | Default true. |
| offerNotifications | bool | Default true. |
| shareApproxAreaOnly | bool | Default true. |

### consents

Append-only. `userId`, `leadId` ?, `businessId` ?, `scope` enum(`share_name`,`share_phone`,`terms`), `textVersion`, `grantedAt`. A lead cannot be created without its consent row.

## 3. Places and categories

### cities / areas

`cities`: `name`, `state`, `timezone`, `status` enum(`live`,`coming_soon`).
`areas`: `cityId` **IX**, `name`, `centre` geo, `status`.

### categories

| Field | Type | Notes |
| --- | --- | --- |
| slug | string **U** | `fashion`, `food`, `events`, `entertainment`, `beauty`, `electronics`, `home`, `auto`, `fitness`, `services` |
| label, icon | string | |
| leadConfig | json | `{cta, leadType, refPrefix, optionLabel, options[], placeholder, note}` |
| attributeSchema | json | Allowed attribute keys with type and unit, used to validate `products.attributes` and to build filters. |
| listingNouns | json | `{item, action}` wording per category. |
| status | enum | `live`, `hidden` |
| sort | int | |

## 4. Businesses

### businesses

| Field | Type | Notes |
| --- | --- | --- |
| name | string **IX** | |
| categoryId | ref<categories> **IX** | Primary category. |
| tagline | string ? | 80 chars |
| about | text ? | |
| logoMediaId, coverMediaId | ref<media> ? | |
| verification | enum **IX** | `pending`, `verified`, `rejected`, `suspended` |
| verifiedAt | timestamp ? | |
| establishedYear | int ? | Merchant-stated. |
| ratingAvg | int | Rating × 10, denormalised. |
| ratingCount | int | |
| planId | ref<plans> | |
| status | enum | `active`, `paused`, `closed` |

### branches

| Field | Type | Notes |
| --- | --- | --- |
| businessId | ref<businesses> **IX** | |
| name | string | "CG Road" |
| address | string | |
| areaId | ref<areas> **IX** | |
| location | geo **IX (geo)** | |
| serviceAreaIds | json ? | For businesses that travel to the customer. |
| hours | json | `[{day:0-6, open:"10:30", close:"21:00"}]`, plus `closedDates[]` |
| phone, whatsapp | string ? | Shown only as call or WhatsApp actions. |
| isPrimary | bool | |

### business_members

`businessId` + `userId` **U**, `role` enum(`owner`,`manager`,`staff`), `branchIds` json ? (restrict staff to branches), `status` enum(`invited`,`active`,`removed`).

### verification_requests

`businessId` **IX**, `documents` json (media ids and types), `status` enum(`submitted`,`approved`,`rejected`), `reviewedBy` ref<users> ?, `notes` text ?.

## 5. Catalogue

### products

One entity for every listing kind.

| Field | Type | Notes |
| --- | --- | --- |
| businessId | ref<businesses> **IX** | |
| branchIds | json | Branches that offer it; empty means all. |
| categoryId | ref<categories> **IX** | |
| kind | enum | `product`, `service`, `dish`, `movie`, `activity`, `rental` |
| mode | enum **IX** | `sale`, `rent`, `both` |
| name | string **IX (text)** | 120 chars |
| description | text | |
| price | money ? | Required when mode includes sale. |
| priceNote | enum ? | `from`, `per_person`, `per_month` |
| variants | json | Array of strings (sizes, colours, options). |
| attributes | json | Key-value, validated by the category's `attributeSchema`. |
| tags | json | Lower-case search tags. |
| stockState | enum | `in_stock`, `limited`, `not_maintained`, `by_appointment`, `walk_in` |
| stockUpdatedAt | timestamp ? | Drives the freshness label. |
| mediaIds | json | Ordered; first is the cover. |
| ratingAvg, ratingCount | int | Denormalised. |
| status | enum **IX** | `draft`, `published`, `removed` |
| detailsUpdatedAt | timestamp | "Merchant-provided · updated 2 days ago". |

Indexes: `(businessId, status)`, `(categoryId, status, mode)`, text on `name, tags`, geo through the branch.

### rental_terms (one per product with mode `rent` or `both`)

| Field | Type | Notes |
| --- | --- | --- |
| productId | ref<products> **U** | |
| unit | enum | `day`, `month` |
| rate | money | Per unit. |
| weeklyRate | money ? | Applied per full 7 days when unit is `day`. |
| minUnits | int | ≥ 1 |
| maxUnits | int ? | |
| deposit | money | 0 for none. |
| fulfilment | json | Subset of `pickup`, `delivery`, `at_venue`. |
| deliveryFee | money ? | |
| includes | json | Array of strings. |
| terms | json | Array of strings. |
| askOption | json ? | `{label, options[]}` e.g. size. |
| requiresConfirmation | string ? | Text the renter must tick, e.g. licence statement. |
| quantity | int | Units available at once. Default 1. |

### rental_blocks

Days a unit is unavailable. `productId` **IX**, `startDate`, `endDate` (inclusive), `source` enum(`merchant`,`accepted_rental`), `rentalId` ref<rentals> ?. With a relational engine, add an exclusion constraint so accepted rentals for one unit cannot overlap.

### rental_records (the "rental record" shown on a listing)

`productId` **U**, `completedCount` int (system-maintained from returned rentals), `lastConditionCheckAt` date ?, `checks` json (merchant-provided strings).

### showtimes

`productId` **IX** (kind `movie` or show), `branchId`, `date`, `times` json (array of "HH:mm"), `format` string, `screen` string ?, `priceMin`, `priceMax` money, `updatedAt`. Informational only.

## 6. Content

### media

`ownerUserId`, `businessId` ?, `kind` enum(`image`,`video`), `status` enum(`uploaded`,`processing`,`ready`,`rejected`), `storageKey`, `variants` json, `width`, `height`, `durationMs` ?, `checksum`.

### posts

| Field | Type | Notes |
| --- | --- | --- |
| businessId | ref<businesses> **IX** | |
| type | enum **IX** | `reel`, `image`, `dump`, `update` |
| title | string | 60 chars |
| caption | text ? | 300 chars |
| mediaIds | json | One for reel and image; 2–10 for dump. |
| slides | json ? | For dumps: `[{mediaId, caption?, productId?}]` |
| links | json | `[{type: product|offer|event|business, id}]`. At least one, except `update`, which links to the business. |
| categoryId | ref<categories> | |
| likeCount, saveCount, viewCount | int | Denormalised. |
| status | enum | `draft`, `published`, `removed` |
| publishedAt | timestamp ? **IX** | |

### stories / story_items

`stories`: one open story per business per day. `businessId` **IX**, `expiresAt` **IX**.
`story_items`: `storyId` **IX**, `mediaId`, `text` string (120), `link` json `{type, id}` (required), `publishedAt`, `expiresAt` (publishedAt + 24 h), `status`.

### story_views

`storyItemId` + `userId` **U**, `viewedAt`. Drives the seen ring.

## 7. Offers, leads and what hangs off them

### offers

| Field | Type | Notes |
| --- | --- | --- |
| businessId | ref<businesses> **IX** | |
| title | string | |
| shortLabel | string | Badge text, e.g. "₹500 off". |
| description | text ? | |
| benefit | json | `{type: amount|percent|freebie|price, value}` |
| productIds | json | Empty means all eligible items stated in terms. |
| branchIds | json | |
| startsAt, endsAt | timestamp | `endsAt` required. |
| eligibility | string ? | Minimum purchase etc. |
| perUserLimit | int | Active claims a user may hold. Default 1. |
| totalLimit | int ? | Null means unlimited. |
| claimsCount | int | Atomic counter. |
| redemptionSteps | json | Array of strings. |
| terms | json | Array of strings. |
| couponCode | string ? | If set, the offer is a coupon. Stored encrypted; returned only to a user holding an active claim. |
| couponUse | json ? | Where it can be used: `box_office`, `counter`, `merchant_site`. |
| claimWindowMinutes | int ? | **Claim expiry.** Null means a claim never expires on its own. Premium feature. |
| allowReclaim | bool | Whether a user may claim again after an expired claim. Default true. |
| status | enum **IX** | `draft`, `published`, `ended`, `removed` |

### leads

The central entity. Every enquiry, visit request, ticket request, rental request and claim is a lead.

| Field | Type | Notes |
| --- | --- | --- |
| reference | string **U** | Public code `LSH-{PREFIX}-{5}`; charset without 0, O, 1, I, L. |
| type | enum **IX** | `enquiry`, `visit`, `event_request`, `event_enquiry`, `rental`, `claim` |
| typeLabel | string | Display label from the category config at creation time. |
| consumerId | ref<users> **IX** | |
| businessId | ref<businesses> **IX** | |
| branchId | ref<branches> ? **IX** | Branch-level attribution. |
| categoryId | ref<categories> | |
| subjectType | enum | `product`, `business`, `event`, `offer` |
| subjectId | id | |
| subjectName | string | Snapshot at creation. |
| source | json | `{surface: product_page|offer|guide|reel|story|dump|business_profile|event_page|rental_listing|map, postId?, guideSessionId?}` |
| options | json | Chosen form options. |
| note | text ? | Consumer's message, 500 chars. |
| details | json | Type-specific snapshot (see below). |
| status | enum **IX** | See architecture B6. |
| outcome | enum ? | `visited`, `redeemed`, `attended`, `converted`, `handed_over`, `returned` |
| evidence | enum | `none`, `merchant_reported`, `reference_checked`, `consumer_confirmed` |
| billing | enum | `pending`, `billable`, `not_billable`, `on_hold`, `credited` |
| duplicateOfId | ref<leads> ? | |
| acknowledgedAt, contactedAt, closedAt | timestamp ? | |
| expiresAt | timestamp ? **IX** | For claims with a window; also the 72 h response deadline for others. |
| idempotencyKey | string | Unique with `consumerId`. |

`details` by type:

- `visit`: `{date, windowStart, windowEnd, partySize}`
- `event_request`: `{eventId, quantity}`
- `rental`: none here; see `rentals`
- `claim`: `{offerId, claimId}`

Indexes: `(businessId, status, createdAt)`, `(consumerId, createdAt)`, `(consumerId, businessId, subjectId, createdAt)` for duplicate detection, `reference`.

### lead_events

Append-only timeline and audit. `leadId` **IX**, `type` (`created`, `delivered`, `acknowledged`, `status_changed`, `reference_checked`, `disputed`, …), `fromStatus`, `toStatus`, `actorType` enum(`consumer`,`merchant`,`system`,`admin`), `actorId` ?, `data` json, `at`.

### claims

| Field | Type | Notes |
| --- | --- | --- |
| offerId | ref<offers> **IX** | |
| userId | ref<users> **IX** | |
| leadId | ref<leads> **U** | |
| status | enum **IX** | `claimed`, `redeemed`, `expired`, `cancelled` |
| claimedAt | timestamp | |
| expiresAt | timestamp ? **IX** | `min(claimedAt + claimWindowMinutes, offer.endsAt)`; null only if the offer has neither. |
| redeemedAt | timestamp ? | |
| redeemedBy | ref<users> ? | Merchant member. |
| redeemedBranchId | ref<branches> ? | |

Unique: at most `perUserLimit` rows with status `claimed` per `(offerId, userId)`.

### rentals

| Field | Type | Notes |
| --- | --- | --- |
| leadId | ref<leads> **U** | |
| productId | ref<products> **IX** | |
| startDate, endDate | date | End is the return date. |
| units | int | Number of days or months. |
| fulfilment | enum | `pickup`, `delivery`, `at_venue` |
| chosenOption | string ? | Size, machine, etc. |
| estimate | json | `{rent, deliveryFee, total, deposit, weeklyApplied}` — snapshot from listed rates. |
| status | enum **IX** | `requested`, `accepted`, `declined`, `handed_over`, `returned`, `cancelled` |
| depositStatus | enum | `none`, `not_collected`, `held`, `refunded`, `deducted` (merchant-reported) |
| acceptedAt, handedOverAt, returnedAt | timestamp ? | |
| declineReason | string ? | |

### attribution_events

High-volume, append-only. `type` enum(`impression`,`view`,`detail_view`,`catalogue_open`,`call_click`,`whatsapp_click`,`direction_click`,`external_click`,`share`), `userId` ?, `sessionId`, `businessId` **IX**, `branchId` ?, `subjectType`, `subjectId`, `source` json, `at` **IX**. Partition or bucket by day.

### threads / messages / thread_participants

`threads`: `leadId` **U**, `businessId` **IX**, `consumerId` **IX**, `lastSeq` int, `lastMessageAt` **IX**, `lastMessagePreview` string.

`messages`: `threadId` **IX**, `seq` int (unique with `threadId`), `senderType` enum(`consumer`,`merchant`,`system`), `senderId` ?, `body` text (1,000), `clientMessageId` string (unique with `threadId`), `createdAt`.

`thread_participants`: `threadId` + `side` enum(`consumer`,`business`) **U**, `lastReadSeq` int, `mutedUntil` ?.

## 8. Events, reviews, engagement, operations

### events

`businessId` **IX**, `branchId` ?, `categoryId` (`events` or `entertainment`), `name`, `eventType` string, `startsAt` **IX**, `endsAt`, `venueName`, `location` geo, `areaId`, `priceMin`, `priceMax` money, `priceLabel`, `capacityNote` string ?, `rules` json, `description`, `mediaIds`, `externalTicketUrl` ?, `status`.

### reviews

| Field | Type | Notes |
| --- | --- | --- |
| authorId | ref<users> **IX** | |
| targetType | enum | `product`, `business`, `event` |
| targetId | id **IX** | |
| businessId | ref<businesses> **IX** | |
| rating | int | 1–5 |
| body | text | 20–600 chars |
| mediaIds | json | |
| verification | enum | `none`, `visit`, `purchase` |
| leadId | ref<leads> ? | The lead that justified verification. |
| reply | json ? | `{body, byUserId, at}` |
| status | enum | `published`, `hidden`, `removed` |

Unique `(authorId, targetType, targetId)`.

### saves / follows / likes

`saves`: `userId` + `targetType` + `targetId` **U**; targets `product`, `business`, `post`, `offer`, `event`.
`follows`: `userId` + `businessId` **U**.
`likes`: `userId` + `targetType` + `targetId` **U**; targets `post`, `story_item`.

### notifications

`userId` **IX**, `audience` enum(`consumer`,`merchant`), `businessId` ?, `type`, `title`, `body`, `data` json (deep link), `readAt` ?, `createdAt` **IX**.

### reports / moderation_actions

`reports`: `reporterId`, `targetType`, `targetId`, `reason` enum, `note`, `status` enum(`open`,`actioned`,`dismissed`).
`moderation_actions`: `targetType`, `targetId`, `action` enum(`remove`,`restore`,`warn`,`suspend`), `adminId`, `reason`, `at`.

### disputes

`leadId` **U**, `raisedBy` ref<users>, `reason` enum(`spam`,`duplicate`,`wrong_business`,`unreachable`,`other`), `note`, `status` enum(`open`,`upheld`,`rejected`), `resolvedBy` ?, `resolvedAt` ?.

### Billing

`billing_rules`: `categoryId` ?, `milestone` enum(`qualified_enquiry`,`verified_visit`,`verified_redemption`,`verified_handover`,`confirmed_booking`), `amount` money, `effectiveFrom`. Configuration, not code.

`billing_events` (append-only ledger): `businessId` **IX**, `leadId`, `milestone`, `amount` money (negative for credits), `type` enum(`charge`,`credit`), `invoiceId` ?, `at`. Unique `(leadId, milestone, type)`.

`invoices`: `businessId` **IX**, `periodStart`, `periodEnd`, `subtotal`, `credits`, `tax`, `total` money, `status` enum(`draft`,`issued`,`paid`,`void`), `lineItems` json.

`plans`: `slug` **U**, `name`, `features` json (flags: `claim_expiry`, `coupon_codes`, `rental_listings`, `scheduled_posts`, limits such as `max_listings`), `price` money ?.

`entitlements`: `businessId` + `feature` **U**, `value` json, `source` enum(`plan`,`override`), `expiresAt` ?.

### analytics_daily

`businessId` + `branchId` + `date` **U**, counters for each funnel metric (see module 14). Built by the roll-up job.

### Infrastructure

`idempotency_keys`: `actorId` + `key` **U**, `requestHash`, `responseStatus`, `responseBody`, `expiresAt` (24 h).
`outbox`: `type`, `aggregateId`, `payload` json, `createdAt`, `publishedAt` ?.
`audit_log`: `actorId`, `actorType`, `action`, `targetType`, `targetId`, `before` json ?, `after` json ?, `ip`, `at`. Append-only; covers admin and merchant-sensitive actions.
`guide_sessions` / `guide_messages`: conversation history and parsed intents for the AI guide.

## 9. Relational versus document notes

| Concern | Relational | Document |
| --- | --- | --- |
| `json` arrays of ids (`mediaIds`, `productIds`, `branchIds`) | Prefer join tables (`post_media`, `offer_products`) when you need to query by the child | Embed arrays; index them |
| `rental_terms`, `rental_records`, `showtimes` | Separate tables, 1:1 or 1:n | Embed in the product document |
| `slides`, `hours`, `benefit`, `details` | JSON columns | Embedded sub-documents |
| Rental overlap | Exclusion constraint on a date range | Transaction that checks then inserts into `rental_blocks`, with a unique index on `(productId, unitNo, day)` rows per day |
| Claim limit | Partial unique index on `(offerId, userId) WHERE status='claimed'` | Unique index on `(offerId, userId, activeSlot)` where `activeSlot` is null once the claim closes |
| Counters | `UPDATE … SET n = n + 1` | `$inc` |
| Ledger | Append-only table with a unique constraint | Append-only collection with a unique index |
| Transactions | Native | Requires a replica set; keep transactions small |
| Search | Full-text and geo extensions | Text and 2dsphere indexes |

Whichever engine is chosen, the unique constraints and conditional updates in `02-architecture.md` section B5 are mandatory.
