# Module 01 — Identity and accounts

## Purpose

One account per phone number. The same person can act as a consumer and, if they belong to a business, as a merchant member. Admins are separate roles on the same identity with a stricter session policy.

## Rules

- Sign-in is phone plus OTP only. No passwords.
- An account is created on first successful OTP verification.
- Name is optional until the user creates their first lead; a lead needs a display name.
- Mode (consumer or merchant) is a client choice. The token audience decides which endpoints are reachable.
- Area selection never requires location permission.
- Deleting an account cancels open leads, closes threads, removes saves and follows, anonymises reviews ("Former Lesho user"), and keeps billing records without personal data.

## Prototype screens

`concept/src/screens/Me.jsx`: Onboarding (welcome, location choice), Profile (preferences, interests, merchant switch). `Flows.jsx`: AreaSheet.

## Entities

`users`, `sessions`, `devices`, `otp_challenges`, `consumer_profiles`, `consents`, `areas`, `cities` (see `03-data-model.md` section 2).

## Endpoints

### POST /v1/auth/otp        auth: none

```json
{ "phone": "+919812345678", "purpose": "login" }
```

`200` → `{ "data": { "challengeId": "otp_01J…", "expiresAt": "…", "resendAfterSec": 30 } }`

Errors: `422 validation_failed` (not E.164 or not an Indian mobile at launch), `429 rate_limited`. Same response whether or not the account exists.

### POST /v1/auth/verify        auth: none

```json
{ "challengeId": "otp_01J…", "code": "482913", "audience": "consumer", "device": { "platform": "android", "pushToken": "…" } }
```

`200` →

```json
{
  "data": {
    "accessToken": "…", "accessExpiresAt": "…",
    "refreshToken": "…",
    "user": { "id": "usr_…", "phone": "+91 98•• ••• 678", "name": null, "isNew": true },
    "memberships": [ { "businessId": "biz_…", "name": "Rangoli Silks", "role": "owner" } ]
  }
}
```

Errors: `401 otp_invalid` (with `attemptsLeft`), `410 otp_expired`, `429`. With `audience: "merchant"` and no active membership: `403 no_business`.

### POST /v1/auth/refresh        auth: refresh token

`{ "refreshToken": "…" }` → new pair. Reuse of a rotated token → `401` and session family revoked.

### POST /v1/auth/logout        auth: any

Revokes the current session. `204`.

### GET /v1/me        auth: consumer

```json
{
  "data": {
    "id": "usr_…", "name": "Aarav Mehta", "phoneMasked": "+91 98•• ••• 412",
    "profile": { "areaId": "area_nav", "interests": ["fashion", "food", "events"], "personalisation": true, "offerNotifications": true, "shareApproxAreaOnly": true },
    "memberships": [ { "businessId": "biz_…", "name": "Rangoli Silks", "role": "owner" } ],
    "counts": { "activeEnquiries": 6, "unreadMessages": 2, "saved": 3 }
  }
}
```

### PATCH /v1/me        auth: consumer

Any of `name`, `avatarMediaId`. `200` with the user.

### PATCH /v1/me/profile        auth: consumer

Any of `areaId`, `interests[]`, `personalisation`, `offerNotifications`, `shareApproxAreaOnly`. `200`.

### GET /v1/areas        auth: none

`?cityId=` optional. Returns cities with areas, `status` (`live`, `coming_soon`) and `centre`.

### POST /v1/me/devices        auth: any

Registers or updates a push token. Idempotent on `pushToken`.

### POST /v1/me/export        auth: consumer

`202`; a download link is sent in-app within 24 hours.

### DELETE /v1/me        auth: consumer

Requires a fresh OTP (`X-Reauth-Challenge` header). `202`; deletion completes within 30 days.

## Real-time

None. Counts in `/me` are refreshed with the unread poll (module 10).

## Edge cases

- Phone change: not supported at launch; support-assisted.
- A merchant member removed from a business: next request with that `X-Business-Id` returns `403`; open merchant sockets for that business are closed.
- OTP provider down: return `503 sms_unavailable`, do not consume rate limit.
- Same phone signing in on two devices: two sessions; both valid.
