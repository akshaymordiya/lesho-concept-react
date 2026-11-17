# 05 — Security, privacy and abuse

What must be true before anything ships. Each item is a requirement unless marked "should".

## 1. Authentication

- Phone number with a one-time code is the only consumer and merchant sign-in.
- Codes are 6 digits, valid 5 minutes, single use, stored hashed, with 5 attempts. Rate limits per phone and per IP (see `04-api-conventions.md` section 10).
- The response to an OTP request is the same whether or not the phone is registered.
- Access tokens last 15 minutes. Refresh tokens last 30 days, rotate on every use, are stored hashed, and reuse of a rotated token revokes the whole session family.
- Tokens are signed with an asymmetric key; keys rotate; the key id is in the header.
- Admin accounts additionally require a second factor and are limited to an allow-listed network or SSO.
- Mobile clients store tokens in the platform keystore. Web clients keep the refresh token in an `HttpOnly`, `Secure`, `SameSite=Strict` cookie and the access token in memory.

## 2. Authorisation

- Deny by default. Every handler names the permission it needs.
- Consumer resources are owned by `userId`. A consumer may read and act only on their own leads, claims, threads, saves and reviews.
- Merchant actions require an active `business_members` row for `X-Business-Id`, the right role, and, for staff, access to the lead's branch.

| Action | owner | manager | staff |
| --- | --- | --- | --- |
| View and answer leads, chat | yes | yes | own branches |
| Redeem claims, hand over rentals | yes | yes | own branches |
| Publish content, edit catalogue, create offers | yes | yes | no |
| View analytics | yes | yes | no |
| Billing, plan, team, business profile | yes | no | no |

- Never trust ids from the client for scoping. Load the resource, then check that it belongs to the actor's user or business.
- Return `404` rather than `403` for resources the actor should not know exist.
- The realtime gateway authorises every channel subscription with the same rules.

## 3. Input and output

- Validate every body, query and path parameter against a schema; reject unknown fields.
- Length limits on all strings (see data model). Strip control characters.
- User text is stored as plain text and escaped on output. No HTML is accepted anywhere.
- Parameterised queries only. No string-built queries, in either database engine.
- Uploaded media: verify type by content, not extension; scan for malware; strip metadata including GPS; re-encode images.
- External links (ticket pages) must be `https`, are shown with the destination host, and are opened outside the app.

## 4. Data protection

- TLS 1.2+ everywhere, including internal calls. HSTS on web.
- Encryption at rest for the database, backups and object storage.
- Field-level encryption for phone numbers and coupon codes; the lookup uses a keyed hash of the phone.
- Secrets come from a secrets manager, never from the repository. `.env` files are git-ignored.
- Logs never contain tokens, OTPs, full phone numbers, message bodies or coupon codes.
- Least-privilege database users: the API user cannot drop tables; analytics reads from a replica.

## 5. Privacy

- **Consent.** A lead is created only with a recorded consent for each personal field shared. The consent text version is stored.
- **Minimum disclosure.** A business sees the consumer's first name and last initial by default; the phone number only with `share_phone` consent, and only on that lead.
- **No tracking leak.** Browsing, saves, follows, preferences and location are never exposed to businesses. Analytics shown to merchants are aggregated; a metric with fewer than 5 contributors is shown as "fewer than 5".
- **Location.** Asked only when it adds value; manual area selection always works. Precise location is used for the session and not stored against the user. Businesses receive only the area name.
- **Rights.** A user can export their data and delete their account. Deletion removes or anonymises personal data within 30 days; billing records are kept with personal fields nulled.
- **Retention.** See `02-architecture.md` section B13.
- **Children.** Accounts are for adults; age is confirmed at sign-up.
- India's Digital Personal Data Protection Act applies: purpose limitation, notice, consent, grievance contact. Get legal review before launch.

## 6. Abuse and fraud

| Threat | Control |
| --- | --- |
| Fake or bot leads to inflate a rival's bill | Rate limits, device and phone reputation, duplicate rule, no charge on flagged leads, dispute flow |
| Merchant creating leads for itself | Block members from enquiring with their own business; flag shared devices |
| Merchant under-reporting outcomes | Billing keyed to evidence (reference checks), not self-report; consumer confirmation prompts |
| Coupon code scraping | Code returned only to a holder of an active claim; per-user limits; claim rate limits |
| Claim hoarding | Per-user and total limits; merchant-set claim expiry releases unused claims |
| Redeeming an expired or used claim | Server-side conditional update (see architecture B5); the client timer is display only |
| Reference guessing | 5 characters from a 31-symbol set plus type prefix; lookup is scoped to the merchant's own business and rate limited; no enumeration endpoint |
| Rental double-booking | Transactional overlap check; exclusion constraint |
| Spam in chat | A business cannot open a thread; rate limits; report and block |
| Fake reviews | One review per author per target; verified label only with a linked verified lead; report flow |
| Off-platform harassment | Phone shared only by consent; a consumer can close a thread, which stops further messages |
| Misleading listings and fake offers | Structured offer fields, moderation queue, reports, verification state shown on profiles |
| Scraping | Rate limits, pagination caps, no bulk export endpoints |

## 7. Platform hardening

- WAF and DDoS protection at the edge. Request size limits (1 MB JSON).
- CORS allow-list for web clients. CSRF protection on cookie-authenticated routes.
- Security headers on web: CSP, `X-Content-Type-Options`, `Referrer-Policy`, frame denial.
- Dependency scanning and pinned versions. No secrets in images.
- Separate cloud accounts or projects per environment.
- Admin console on a separate origin with its own session policy.

## 8. Audit

- `audit_log` records every admin action and these merchant actions: redeem claim, hand over or return rental, dispute, team change, offer publish, plan change.
- `lead_events` is the per-lead audit trail and is shown, in part, to both parties.
- Audit data is append-only and retained for 3 years.

## 9. Incident readiness

- Named on-call, runbooks for: SMS provider outage (queue and retry, show a clear error), realtime outage (clients fall back to polling automatically), database failover, leaked key (rotate, revoke sessions).
- Ability to revoke all sessions for a user or globally.
- Feature flags to disable lead creation per category, messaging, and the AI guide independently.

## 10. Security checklist per endpoint

Before merging an endpoint, confirm:

1. Authentication requirement stated and tested.
2. Authorisation tested with another user's and another business's ids.
3. Schema validation with negative tests.
4. Rate limit applied where listed.
5. Idempotency where listed.
6. No personal data beyond the privacy rules in the response.
7. Audit or lead event written for state changes.
8. No sensitive values in logs.
