# Telegram Stars Purchase — Setup

Users top up their in-app **Lucky Stars (LS)** balance by paying real **Telegram
Stars (XTR)** through Telegram's native payment sheet. Rate: **1 XTR = 1 LS**.

The code is implemented across both repos; going live needs one env var + a
one-time `setWebhook` call — no code changes.

---

## How it works

1. User taps **Buy Stars** (wallet) → picks an amount → **Buy**.
2. Frontend `POST /wallet/stars/invoice { stars }` → backend creates a Stars
   invoice link via Bot API `createInvoiceLink` (`currency: "XTR"`).
3. Frontend opens it with `Telegram.WebApp.openInvoice(link, cb)` — the **native
   Telegram Stars payment sheet**.
4. Telegram → bot **webhook** (`POST /telegram/webhook`):
   - `pre_checkout_query` → backend answers OK (within 10s).
   - `message.successful_payment` → backend credits LS (idempotent on the
     Telegram charge id) and writes a `BUY_STARS` wallet transaction.
5. `openInvoice`'s callback returns `paid` → frontend refetches the balance.

Key files — **frontend**: `hooks/useBuyTelegramStars.ts`, `api/wallet.api.ts`
(`createStarsInvoice`), `components/.../wallet/BuyStarsModal.tsx`. **backend**:
`src/telegram/` (`telegram-bot.service.ts`, `stars.service.ts`, `stars.controller.ts`,
`telegram-webhook.controller.ts`).

---

## Backend setup (one-time)

1. **Env** (`.env` / Railway):
   - `TELEGRAM_BOT_TOKEN` — already set (used for initData auth); also signs invoices.
   - `TELEGRAM_WEBHOOK_SECRET` — a random string you choose (guards the webhook).

2. **Register the webhook** (points Telegram at the backend and sets the secret
   Telegram echoes back in the `X-Telegram-Bot-Api-Secret-Token` header):

   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
     -d "url=https://<your-backend>/telegram/webhook" \
     -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
     -d 'allowed_updates=["pre_checkout_query","message"]'
   ```

   Verify with `getWebhookInfo`:

   ```bash
   curl "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
   ```

Notes:

- Telegram Stars (XTR) need **no** BotFather payment provider — it's built in.
- `provider_token` is intentionally empty for XTR invoices.
- This bot had no webhook before (auth is via Mini App initData), so `setWebhook`
  is free to use. If you later add bot commands, extend the same webhook handler.

---

## Frontend

No env needed. `openInvoice` only exists inside the Telegram client, so in a
plain browser / local dev the flow reports `unavailable` and shows a toast
("Open in Telegram to pay with Stars") — test the real payment inside Telegram.

---

## Security / correctness

- The webhook is **public but secret-guarded** (constant secret token) and
  throttle-exempt.
- Crediting uses `successful_payment.total_amount` (what Telegram confirms was
  paid), not the client — and is **idempotent** on `telegram_payment_charge_id`
  (a charge credits at most once), so retries never double-credit.
- Unknown users / bad payloads are logged and ignored (acked with 200).

## Checklist

- [ ] `TELEGRAM_WEBHOOK_SECRET` set on the backend (Railway)
- [ ] `setWebhook` called with the same secret + `allowed_updates`
- [ ] `getWebhookInfo` shows the URL with no `last_error_message`
- [ ] Test a purchase inside Telegram → LS balance increases
