# Giveaway API

Base URL: `/api` &nbsp;·&nbsp; All responses are JSON.
Success: `{ "data": ... }` &nbsp;·&nbsp; Error: `{ "error": { "code", "message", "details?" } }`

Auth = `Authorization: Bearer <access token>`. The user is **always** taken from the token, never from the body, query or URL.

## Public

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| GET | `/giveaways/current` | none | Current giveaway (live, else next upcoming, else latest ended), stats, `nextGiveaway`, `serverTime`. |
| GET | `/giveaways/previous` | none | Finished giveaways with their masked winners. |
| GET | `/giveaways/:id` | none | One giveaway by id (`GW-2026-10`) or slug. |
| GET | `/giveaways/:id/winners` | optional | `{ status: PENDING \| SELECTING \| ANNOUNCED, winners[] }`. Empty until announced. `isCurrentUser` is set server-side when a valid token is sent. |

## Authenticated user

| Method | Path | Description |
| --- | --- | --- |
| GET | `/giveaways/:id/my-status` | Balances, participations, entries and winnings (with claim status). |
| POST | `/giveaways/:id/join` | Join one prize draw. Body: `{ "prizeId": "PRIZE-001" }`. Header `Idempotency-Key` recommended. Rate limited (10/min). |
| POST | `/giveaways/:id/claim` | Winner submits claim details. Body shape depends on the prize's `claimType` (below). Rate limited (5/min). |
| GET | `/giveaways/:id/my-claim` | Claim status only (never the submitted details). |
| GET | `/auth/me` | Current user. |
| POST | `/auth/login` | Dev login: `{ email, password }` → `{ accessToken, user }`. Replace with VELOOP auth. Rate limited. |

### Join request / response

```json
POST /api/giveaways/GW-2026-10/join
Idempotency-Key: 6f1d...      X-Device-Id: <random id kept in the browser>
{ "prizeId": "PRIZE-001" }
```
```json
201 { "data": { "participationId": "TXN-...", "prizeId": "PRIZE-001",
                "entryFee": { "currency": "VE", "amount": 250 }, "balanceAfter": 600 } }
```
Any extra field (`amount`, `currency`, `userId`, ...) is dropped by validation. Replaying the same `Idempotency-Key` returns the original result with `200` and `"replayed": true` instead of charging again.

### Claim bodies

`ADDRESS` (physical prizes): `{ prizeId, fullName, phone (10-digit IN mobile), address, city, state, pinCode (6 digits) }`
`EMAIL` (gift card / digital): `{ prizeId, email }`

The server picks which one applies from the prize record.

## Admin (`role: admin`)

| Method | Path | Description |
| --- | --- | --- |
| POST | `/admin/giveaways` | Create a giveaway with its prizes. |
| POST | `/admin/giveaways/:id/archive` | Archive a giveaway. |
| POST | `/admin/giveaways/:id/select-winners` | Run the draw (only after the end time; runs once). |
| GET | `/admin/giveaways/:id/participations` | List participations (max 500). |
| POST | `/admin/participations/:participationId/clear-flag` | Let a FLAGGED entry take part in the draw. |
| GET | `/admin/giveaways/:id/claims` | Fulfilment view, **includes claim details**. |
| PATCH | `/admin/claims/:claimId` | `{ "status": "PROCESSING" \| "COMPLETED" }`. |

## Error codes

| Code | HTTP | Meaning |
| --- | --- | --- |
| `LOGIN_REQUIRED` | 401 | Missing/invalid token |
| `FORBIDDEN` | 403 | Not an admin |
| `GIVEAWAY_NOT_FOUND` / `PRIZE_NOT_FOUND` | 404 | Unknown id |
| `GIVEAWAY_NOT_ACTIVE` | 409 | Not open yet |
| `GIVEAWAY_ENDED` | 409 | Server clock is past `endAt` |
| `ALREADY_PARTICIPATING` | 409 | Already joined this draw |
| `INSUFFICIENT_VE_BALANCE` / `_SVE_` / `_TOKEN_` | 402 | `details.shortfall` says how much is missing |
| `PARTICIPATION_BLOCKED` / `SUSPICIOUS_ACTIVITY` | 403 | Fraud layer stopped it (no detail is revealed) |
| `RATE_LIMITED` | 429 | Too many requests |
| `CLAIM_NOT_ALLOWED` | 403 | Not a winner / already claimed / not announced |
| `CLAIM_EXPIRED` | 410 | Past the claim deadline |
| `VALIDATION_ERROR` | 400 | `details` holds field errors |
