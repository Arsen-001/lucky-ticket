# Adsgram Rewarded Ads — Setup

Real rewarded video ads for the **Tasks → Ads** section are served by
[Adsgram](https://adsgram.ai) (the de-facto ad network for Telegram Mini Apps —
Telegram has no first-party rewarded-ad SDK). The user watches an ad → the app
records the watch → the reward is granted.

The code integration is already in place; it stays dormant (mock/dev flow) until
you provide a **block id**. No code changes are needed to go live — only env vars
and a backend endpoint.

---

## 1. Create an Adsgram account & block id

1. Register at <https://partner.adsgram.ai/registration>.
2. **Create an Ad Platform** → "Ad platform". You'll need (all from BotFather):
   - App name
   - Telegram direct link (`/myapps`)
   - Web app URL (`/myapps`)
   - Bot ID — the first part of the API token (`/mybots`)
3. **Create an Ad Unit** → "Ad unit", block type **Reward**.
4. **Submit for moderation** (contact Adsgram support with the platform link and a
   forwarded BotFather message).
5. Click **Show code** (top-right) and copy the **Block ID** (a numeric string).

---

## 2. Configure the frontend

Set the env vars (see `.env.example`):

```bash
NEXT_PUBLIC_ADSGRAM_BLOCK_ID=123456   # your block id → real ads turn on
NEXT_PUBLIC_ADSGRAM_DEBUG=false       # "true" to serve TEST ads while integrating
```

- Set them in `.env.local` for local testing and in **Vercel → Project → Settings
  → Environment Variables** for preview/production.
- When `NEXT_PUBLIC_ADSGRAM_BLOCK_ID` is empty, the app falls back to the previous
  mock flow (clicking "Watch" grants the reward directly) — handy for dev/e2e.
- `DEBUG=true` shows Adsgram's test creatives so you can verify the flow before
  moderation approves your unit. **Debug disables the server reward callback.**

### How it works in the app

- The SDK (`sad.min.js`) is loaded in `src/app/layout.tsx`, but **only** when a
  block id is set.
- `src/lib/adsgram/adsgram.ts` wraps `window.Adsgram.init({ blockId })` and
  `AdController.show()`, returning a normalized outcome:
  `completed` / `skipped` / `error` / `unavailable`.
- `handleWatchAd` (`src/components/pages/tabs/tasks/TasksContent.tsx`) plays the
  ad first; it only calls `POST /tasks/ads/watch` on `completed` (or `unavailable`
  = the no-network dev fallback). `skipped` shows a toast; `noAd`/`tooFast`/`error`
  open `AdUnavailableModal` and grant nothing. The app subscribes to the SDK's
  error events (`onBannerNotFound` etc.), which suppresses Adsgram's own native
  Telegram alerts in favor of that modal.

---

## 3. Backend

The backend lives in the separate NestJS project (`lucky-ticket-backend`). Both
paths below are already implemented in its `tasks` module — going live is a
matter of the env var + Adsgram dashboard config, not new code.

### Now (any account size) — client-attested

`POST /tasks/ads/watch  { adId }` → `TasksService.watchAd`. The client calls it
only after a genuine ad completion. The server:

- Enforces the **daily cap** (`WATCH_VIDEO.dailyLimit` = 10 / 20 (Lucky Player) /
  40 (VIP)) via a Redis per-UTC-day counter — never trusts the client count.
- Grants `WATCH_VIDEO.ap` (2 AP) per view, bumps `AdWatchProgress`, returns
  `{ adId, rewards }`.

This is **client-attested** (the client says "I watched it") — the standard
starting point for small publishers, cap-bounded until S2S is available.

### Later (Adsgram server-to-server Reward URL) — authoritative

Set `ADSGRAM_REWARD_SECRET` in the backend env, then configure this as the
**Reward URL** in the Adsgram dashboard (Adsgram gates it to ~50k+ DAU):

```
https://<your-backend>/tasks/ads/adsgram/reward?key=<ADSGRAM_REWARD_SECRET>&userid=[userId]
```

Adsgram replaces `[userId]` with the user's **Telegram id** and sends a GET after
each verified completion. The implemented endpoint (`TasksService.rewardFromAdsgram`):

- Is **public + secret-guarded** (constant-time compare) + throttle-exempt, **GET**, **HTTPS**.
- Resolves the user by `telegramId`, is **idempotent** (Redis latch — prefers an
  Adsgram nonce, else coalesces instant retries), **cap-aware**, and the
  **authoritative** grant path.
- Acks unknown users with `200` so Adsgram stops retrying.

When the secret is set, `watchAd` automatically flips to **UI-sync only** (no
grant, no cap consumed — just reports the expected reward for the claim modal),
so a spoofed POST with no matching Adsgram callback grants nothing. The client
passes no extra params — Adsgram derives the telegramId from the Mini App
context. The callback does **not** fire in debug mode.

---

## Checklist

- [x] Block id created (`35479`, **regular platform** — no Test badge, so impressions count
      toward revenue; app url = `https://lucky-ticket-nu.vercel.app`).
      NB: the platform's app url must exactly match the deployed Mini App URL AND the ad unit
      must be attached to the right platform in the dropdown, or the SDK throws `AdsgramError`
      / the API returns `Wrong referer` (blocks 35472 and 35475 died on this)
- [ ] Monetization sanity check: watch one ad inside the real Mini App, then confirm
      impressions grow in partner.adsgram.ai → Statistics. Ads showing while the counter
      stays at zero would mean a test/unmoderated platform
- [x] `NEXT_PUBLIC_ADSGRAM_BLOCK_ID` set (local `.env.local` + Vercel production) — frontend
- [x] Daily cap enforced server-side on `POST /tasks/ads/watch`
- [ ] (When eligible) `ADSGRAM_REWARD_SECRET` set + Reward URL configured →
      S2S endpoint becomes the source of truth (`watchAd` auto-switches to UI-sync)
