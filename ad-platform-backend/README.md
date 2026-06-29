# Ad-platform backend

Sponsor ad-tournament platform for a Telegram Web App lottery. Advertisers
(casinos) build campaigns step-by-step and pay a **hybrid** model:

- **Fixed fees** (one-off, booked as platform revenue on creation)
- **CPC** — pay per _unique_ player click, billed from a **frozen budget (hold)**

## Stack

TypeScript · Express · PostgreSQL (`pg`) · `node-cron` · `zod`. All money is
stored and computed as **integer cents** — never floats.

## Pricing

| Item                                  | Price                |
| ------------------------------------- | -------------------- |
| Create tournament (base, required)    | $50                  |
| Custom banner (option)                | +$50                 |
| Long ad text, ≤500 chars (option)     | +$20                 |
| CPC — web link / landing / TG channel | $0.80 / unique click |
| CPC — `play.google.com` (Android)     | $1.00 / unique click |
| CPC — `apps.apple.com` (iOS)          | $1.50 / unique click |

Source of truth: [`src/config/pricing.ts`](src/config/pricing.ts).

## Setup

```bash
cp .env.example .env          # then point DATABASE_URL at your Postgres
npm install
npm run migrate               # applies schema.sql + seeds a demo advertiser
npm run dev                   # http://localhost:3000
```

`npm run migrate` creates a `demo_casino` advertiser funded with **$1000.00**.

## Data model

- **`advertisers`** — id, username, `balance` (cents).
- **`tournaments`** — texts, `target_url`, `link_type_detected`, `fixed_cost`,
  `cpc_rate`, `clicks_requested` / `clicks_current`, `click_budget_hold`,
  `status` (`HOLD` / `ACTIVE` / `COMPLETED` / `CANCELED`), `starts_at` /
  `expires_at` / `completed_at`.
- **`click_logs`** — one row per unique click, `UNIQUE(tournament_id, telegram_id)`
  — the anti-fraud / dedupe guarantee.
- **`ledger`** — append-only money-movement audit (`HOLD`, `FIXED_FEE`,
  `CLICK_CHARGE`, `REFUND`). Platform revenue = `SUM(amount)` over
  `FIXED_FEE` + `CLICK_CHARGE`.

## API

### `POST /api/tournaments/calculate`

Auto-detects link type from the URL host and returns the full cost (cents +
formatted USD) for the builder UI.

```bash
curl -X POST localhost:3000/api/tournaments/calculate \
  -H 'content-type: application/json' \
  -d '{"url":"https://play.google.com/store/apps/details?id=x","clicksRequested":1000,"withBanner":true}'
```

### `POST /api/tournaments/create`

Checks balance, freezes (HOLD) the whole campaign budget, books the fixed fee as
revenue, leaves the click budget in hold, sets status `ACTIVE`.

```bash
curl -X POST localhost:3000/api/tournaments/create \
  -H 'content-type: application/json' \
  -d '{"advertiserId":1,"title":"Big Bonus","targetUrl":"https://example.com","clicksRequested":1000,"durationHours":168}'
```

### `POST /api/tournaments/click`

Player jumps from the game. First unique click → bill `cpc_rate` from the hold,
log the player, `+1` click, return the URL. Repeat click → just return the URL,
no charge.

```bash
curl -X POST localhost:3000/api/tournaments/click \
  -H 'content-type: application/json' \
  -d '{"tournamentId":1,"telegramId":123456789}'
```

## Safety & automation

- **Race conditions** — `processClick` runs in a transaction and takes
  `SELECT ... FOR UPDATE` on the tournament row, serializing all clicks on it.
  Thousands of simultaneous clicks queue on the lock, so the budget can't be
  double-spent, driven negative, or billed for free. The
  `UNIQUE(tournament_id, telegram_id)` index is the final backstop.
- **Auto-complete** — when the hold can no longer fund a click (reaches $0) or
  the requested click goal is met, the tournament auto-completes and any
  remainder is refunded.
- **Refund cron** — `EXPIRY_CRON` (default: every minute) closes ACTIVE
  tournaments past `expires_at` and returns their unused hold to the
  advertiser's balance (`FOR UPDATE SKIP LOCKED`, so it never blocks live clicks).
