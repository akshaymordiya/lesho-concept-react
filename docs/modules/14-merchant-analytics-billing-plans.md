# Module 14 — Merchant analytics, billing and plans

## Purpose

Show merchants what Lesho did for them in four separate stages, bill only for clearly defined lead milestones with a transparent breakdown, and gate premium features by plan.

## Analytics rules

1. Four stages, never merged into one "conversion" number:

| Stage | Metrics |
| --- | --- |
| Visibility | Impressions, unique viewers, video views, profile views |
| Consideration | Product detail views, catalogue opens, saves, shares, offer detail views |
| Intent | Enquiries, visit intents, ticket requests, rental requests, offer claims, call clicks, WhatsApp clicks, direction requests |
| Outcomes | Acknowledged, contacted, verified visits, verified redemptions, verified rental handovers, attended, merchant-reported sales, expired claims, disputed or invalid leads |

2. Clicks sit in Intent but are labelled as clicks and are never billed.
3. "Verified" counts only `reference_checked` or `consumer_confirmed`. Merchant-reported sales are labelled as such.
4. Metrics with fewer than 5 underlying users are shown as "fewer than 5".
5. Date ranges: today, 7 days, 30 days, custom up to 13 months. Data refreshes every 15 minutes; the screen shows "Updated 10 min ago".

## Billing rules

1. Billable milestones come from `billing_rules` per category: by default `qualified_enquiry` and `verified_*`. Rates are configuration and are shown to the merchant before they apply.
2. A lead is billed at most once per milestone (ledger unique key).
3. Never billed: impressions, views, saves, shares, likes, clicks, duplicates, spam, expired claims, declined or cancelled rentals, unacknowledged expired leads.
4. Disputed leads are `on_hold` until resolved; upheld disputes produce a credit.
5. Monthly invoice with line items per milestone, credits, tax (GST) and total. Each line links to the leads behind it.
6. Payment of invoices happens outside the lead flow (payment gateway or bank transfer) and is out of scope for v1 beyond recording `paid`.

## Plans and premium features

| Feature flag | What it unlocks |
| --- | --- |
| `claim_expiry` | Setting a time limit on claims |
| `coupon_codes` | Coupon codes on offers |
| `rental_listings` | Listing items for rent |
| `scheduled_posts` | Publishing posts at a future time |
| `max_listings` | Catalogue size limit |
| `team_members` | Number of members beyond the owner |
| `free_leads_per_month` | Billable leads waived each month |

Checks happen on the server for every gated write (`403 feature_not_in_plan` with `feature` and `upgradeHint`). The merchant UI shows a "Premium" badge on gated controls and explains the upgrade instead of hiding the control.

## Prototype screens

`Merchant.jsx` → `MDashboard` (new leads, acknowledged, verified, lead spend, 7-day bar chart, rentals strip, reference lookup), `MAnalytics` (funnel, stage tabs, bill breakdown, never-billed list, sample-rates note), offer composer Premium badge.

## Endpoints

### GET /v1/merchant/dashboard        staff+

```json
{ "data": { "newLeads": 5, "acknowledgedOrContacted": 2, "verifiedOutcomes": 1, "leadSpendPaise": 13000,
  "week": [ { "date": "2026-11-08", "label": "Sat", "leads": 6 } ],
  "rentals": { "awaitingReply": 1, "out": 1 }, "updatedAt": "…" } }
```

### GET /v1/merchant/analytics        manager+

`?from=&to=&branchId=` → `{ stages: [ { key, label, hint, headline, rows: [ { key, label, value, isClick } ] } ], updatedAt }`.

### GET /v1/merchant/billing/summary        owner

`?period=2026-11` → `{ lines: [ { milestone, label, quantity, ratePaise, amountPaise } ], credits: [ … ], netPaise, billableLeads, perLeadPaise, neverBilled: [ … ], ratesNote }`.

### GET /v1/merchant/billing/events        owner

Ledger rows with lead references, filterable by milestone.

### GET /v1/merchant/invoices, GET /v1/merchant/invoices/{id}        owner

### GET /v1/merchant/plan        owner

`{ plan: { slug, name }, features: { claim_expiry: true, … }, usage: { listings: 12, max_listings: 50 } }`.

### POST /v1/merchant/plan/change-request        owner

Creates a request for sales or support; plan change itself is admin-side in v1.

## Jobs

- Roll-up every 15 minutes into `analytics_daily`; nightly full recompute for the last 2 days.
- Billing: ledger rows on milestone events; invoice generation on the 1st of each month for the previous month; credits for disputes upheld after an invoice go to the next invoice.
- Reconciliation: nightly check that ledger rows match lead outcomes.

## Edge cases

- Rate change mid-month: each ledger row stores the rate in effect when the milestone happened.
- Lead's business switches plan mid-month: billing uses the plan at milestone time.
- Branch-level reporting: every lead and attribution event carries `branchId` when known.
