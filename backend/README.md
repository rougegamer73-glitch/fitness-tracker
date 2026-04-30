# FitChain Backend

Express and MongoDB API for the FitChain app.

## Current Routes

- `GET /api/health`
- `GET /api/auth/status`
- `POST /api/auth/nonce`
- `POST /api/auth/verify`
- `GET /api/workouts`
- `POST /api/workouts`
- `GET /api/workouts/stats`
- `GET /api/rewards`

## Wallet Auth Flow

1. `POST /api/auth/nonce` with `{ "walletAddress": "0x..." }`.
2. Sign the returned `message` in MetaMask.
3. `POST /api/auth/verify` with `{ "walletAddress": "0x...", "signature": "0x...", "displayName": "Optional name" }`.
4. Use the returned JWT as `Authorization: Bearer <token>` for protected API routes.

The backend verifies MetaMask signatures with ethers.js, stores a random nonce
per user, rotates the nonce after successful login, and never stores passwords.

## Workout API

Workout routes require `Authorization: Bearer <token>`.

`POST /api/workouts` saves a workout for the authenticated wallet:

```json
{
  "exerciseType": "Run",
  "durationMinutes": 30,
  "steps": 6000,
  "calories": 350,
  "notes": "Easy pace",
  "workoutDate": "2026-04-30"
}
```

`GET /api/workouts` returns that wallet's workouts newest first.

`GET /api/workouts/stats` returns totals, recent workouts, and
`eligibleAchievements`. Eligibility is informational only; the blockchain
contract is still responsible for final achievement claims and reward balances.
