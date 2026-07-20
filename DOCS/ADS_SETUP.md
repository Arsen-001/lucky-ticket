# Rewarded Ads — Setup

Real rewarded ads for the **Tasks → Ads** section. The user watches an ad → the
app records the watch → the reward is granted (2 AP, `WATCH_VIDEO.ap`).

Telegram has no first-party rewarded-ad SDK, so the app wires **several ad
networks as a waterfall** plus its own promo as the final fallback.

---

## How it works

`showRewardedAd()` (`src/lib/ads/index.ts`) plays **one** ad per user action. It
walks the configured providers in order and only asks the next one after the
previous returned nothing:

| Outcome                      | What the waterfall does                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------- |
| `completed`                  | stop → grant the reward                                                                              |
| `skipped` (user closed it)   | **stop**, grant nothing — falling through would turn "close the ad" into a second chance at a reward |
| `noAd` / `tooFast` / `error` | try the next provider                                                                                |
| every provider empty         | report the last failure → `AdUnavailableModal`                                                       |
| no network configured at all | `unavailable` → the dev/mock flow grants directly                                                    |

Providers:

| id        | Module                            | Notes                               |
| --------- | --------------------------------- | ----------------------------------- |
| `adsgram` | `src/lib/ads/adsgram.provider.ts` | SDK script + block id               |
| `monetag` | `src/lib/ads/monetag.provider.ts` | SDK tag + zone id, supports preload |
| `house`   | `src/lib/ads/house.provider.ts`   | the app's own promo — always fills  |

The **house ad** is what makes the feature independent of fill. Networks never
guarantee an ad; without it the task dead-ends on "no ads right now". Its UI is
`HouseAdOverlay` (mounted in `TasksContent`), which registers itself with the
provider on mount — if it isn't mounted, the waterfall simply ends at the last
network. Promos live in `src/constants/house-ads.constants.ts` and rotate per
show. The reward unlocks only after `houseAdDurationSeconds` (10s), matching a
typical network video so the house ad can't become the cheaper way to farm the
daily quota.

`watchAd` POSTs the serving `provider` to the backend — a house impression is
unpaid and may be priced differently, and per-network attribution is the only
honest way to compare real eCPM later.

---

## Environment

```bash
# Adsgram
NEXT_PUBLIC_ADSGRAM_BLOCK_ID=37750
NEXT_PUBLIC_ADSGRAM_DEBUG=false   # "true" = test creatives (disables the S2S callback)

# Monetag
NEXT_PUBLIC_MONETAG_ZONE_ID=

# Waterfall order — blank means adsgram,monetag,house
NEXT_PUBLIC_AD_PROVIDERS=
```

Set them in `.env.local` for local testing and in **Vercel → Settings →
Environment Variables** for production. A network with no id is skipped and its
SDK script is not even loaded. **Reordering the waterfall is an env change, not
a code change** — once real per-network eCPM is known, put the better payer
first.

Real ads only render inside the actual Telegram Mini App, not a desktop browser.

---

## 1. Adsgram

1. Register at <https://partner.adsgram.ai/registration>.
2. **Create an Ad Platform** → needs (all from BotFather): app name, Telegram
   direct link and Web App URL (`/myapps`), bot id (`/mybots`).
3. **Create an Ad Unit**, block type **Reward**.
4. **Submit for moderation** (contact @adsgramsupport with the platform link and
   a forwarded BotFather message). A block stays dead until it is activated.
5. Copy the **Block ID** from **Show code**.

**Diagnosing a block** — `curl "https://api.adsgram.ai/adv?blockId=<id>"` with a
`Referer` header matching the deployed Mini App URL:

| Response                     | Meaning                                               |
| ---------------------------- | ----------------------------------------------------- |
| `Not found this id`          | no such block                                         |
| `Wrong referer`              | block exists but is bound to a different Web App URL  |
| `Need to use active blockid` | block exists but was never activated/moderated        |
| `No available ad`            | **block is live** — there is simply no fill right now |

Gotchas learned the hard way:

- A **platform id is not a block id**. The SDK init'd with a platform id (35479)
  returns `onBannerNotFound` on every request instead of a hard error. Always
  copy the Block ID from the ad unit's **Show code**.
- Adsgram hard-matches the platform's Web App URL against the running origin. If
  the production domain changes, a new platform + block id is needed (blocks
  35472 and 35475 died on this).

## 2. Monetag

1. Register at <https://monetag.com> (publisher). Country must match reality —
   it drives payout methods and is checked against payment details.
2. Add the Telegram Mini App as a property (needs the direct link from
   BotFather). **No moderation gate and no minimum DAU.**
3. Create a zone of type **Rewarded Interstitial** and copy the **zone id** from
   _Getting SDK tag_.

Docs: <https://docs.monetag.com>. The SDK tag defines one global,
`show_<zoneId>(options) => Promise<void>`, which resolves when the ad was
watched and rejects otherwise. It gives no reason code, so the provider treats a
rejection faster than 2s as "no fill" and a slower one as a user skip.

`ymid` carries the Telegram user id so Monetag's S2S postback can attribute the
view.

Rates (published, dynamic): Rewarded Interstitial from **$2 CPM**, Rewarded
Popup **$5–6**. Popup pays more but navigates the user out of the Mini App —
deliberately not used. Payouts: **$5 minimum**, on the 4th and 19th.

---

## 3. Backend

The backend lives in the separate NestJS project (`lucky-ticket-backend`).

### Now (any account size) — client-attested

`POST /tasks/ads/watch  { adId, provider }` → `TasksService.watchAd`. The client
calls it only after a genuine ad completion. The server:

- Enforces the **daily cap** (`WATCH_VIDEO.dailyLimit` = 10 / 20 (Lucky Player) /
  40 (VIP)) via a Redis per-UTC-day counter — never trusts the client count. The
  cap is shared across every provider, house ad included.
- Grants `WATCH_VIDEO.ap` (2 AP) per view, bumps `AdWatchProgress`, returns
  `{ adId, rewards }`.

This is **client-attested** (the client says "I watched it") — the standard
starting point for small publishers, cap-bounded until S2S is available.

### Later (server-to-server callbacks) — authoritative

**Adsgram.** Set `ADSGRAM_REWARD_SECRET` in the backend env, then configure the
**Reward URL** in the Adsgram block form (the form requires it now — the old
~50k DAU gate is gone):

```
https://<your-backend>/tasks/ads/adsgram/reward?key=<ADSGRAM_REWARD_SECRET>&userid=[userId]
```

Adsgram replaces `[userId]` with the user's **Telegram id** and sends a GET after
each verified completion. The implemented endpoint
(`TasksService.rewardFromAdsgram`):

- Is **public + secret-guarded** (constant-time compare) + throttle-exempt, **GET**, **HTTPS**.
- Resolves the user by `telegramId`, is **idempotent** (Redis latch — prefers an
  Adsgram nonce, else coalesces instant retries), **cap-aware**, and the
  **authoritative** grant path.
- Acks unknown users with `200` so Adsgram stops retrying.

When the secret is set, `watchAd` automatically flips to **UI-sync only** (no
grant, no cap consumed — just reports the expected reward for the claim modal),
so a spoofed POST with no matching callback grants nothing. The callback does
**not** fire in debug mode.

**Monetag.** Set `MONETAG_REWARD_SECRET` in the backend env, then configure
this as the zone's postback URL in the Monetag dashboard:

```
https://<your-backend>/tasks/ads/monetag/reward/<MONETAG_REWARD_SECRET>?ymid={ymid}&event_type={event_type}
```

**The secret goes in the PATH, not in `?key=`.** The dashboard validates the URL
by requiring every query parameter to look like `name={macro}`, so a literal
`key=<secret>` makes it reject the whole thing as "url not valid". Both routes
exist on the backend; the path form is the one that saves.

Only `ymid` and `event_type` are needed — the other macros (`telegram_id`,
`zone_id`, `estimated_price`, …) are accepted and ignored. Attribution comes
from the `ymid` prefix.

⚠️ When copying the URL out of a chat or doc, make sure the secret does not get
broken by a line wrap. A URL with whitespace inside is rejected as invalid —
that, not the format, was what blocked this for an hour.

(`telegram_id` and the other macros are optional — the `ymid` prefix already
carries the user id, and adding macros the dashboard rejects only makes the
URL harder to save.)

`TasksService.rewardFromMonetag` mirrors the Adsgram endpoint (public,
secret-guarded, idempotent, cap-aware, acks unknown users with 200) with two
Monetag-specific rules:

- Monetag posts back for **clicks as well as impressions**, so only
  `event_type=impression` grants — otherwise one view could pay twice.
- `reward_event_type` (`yes`/`no` — was the impression paid) is deliberately
  not checked. The player watched the ad; whether we got paid is our problem,
  not theirs. NB: Monetag's own docs call these values `valued`/`non_valued`,
  but the dashboard's macro reference says `yes`/`no` — trust the dashboard.

The client mints a unique `ymid` per view (`<telegramId>.<unique>`), which is
both the idempotency key and the attribution fallback when the `{telegram_id}`
macro arrives empty. Reusing one id would make every view after the first look
like a retry.

**Order matters when enabling:** configure the postback URL in Monetag FIRST,
then set `MONETAG_REWARD_SECRET`. The moment the secret exists, `watchAd` stops
granting for Monetag views and waits for the callback — if the URL isn't set
yet, players watch ads for nothing. Each provider's switch is independent:
enabling Adsgram's callback does not affect Monetag or the house ad.

---

## Checklist

### Adsgram

- [x] Block `37750` created (type **Reward**) and **active** — the API answers
      `No available ad`, i.e. live but unfilled. Zero impressions so far is a
      traffic problem, not a config problem.
- [x] `NEXT_PUBLIC_ADSGRAM_BLOCK_ID` set (local `.env.local` + Vercel production)
- [x] Reward URL configured in the block form (endpoint verified live — returns
      401 on a wrong key)
- [ ] `ADSGRAM_REWARD_SECRET` set in Railway → Variables (same value as `key=` in
      the Reward URL) → S2S becomes the source of truth
- [ ] Confirm impressions in partner.adsgram.ai → Statistics (requests vs
      impressions is the honest fill-rate measure)

### Monetag

- [x] Publisher account registered (country = Armenia, not the default Andorra)
- [x] Mini App added as a property; SDK tag generated (`< > Get SDK` on the
      **Telegram Mini Apps** tab — there is no separate "create zone" step)
- [x] `NEXT_PUBLIC_MONETAG_ZONE_ID=11355872` set (local + Vercel production)
- [x] Verified live in the real Mini App: Adsgram returned no fill, Monetag
      served a real rewarded video
- [x] S2S postback endpoint implemented (`GET /tasks/ads/monetag/reward`)
- [x] Postback URL saved in the dashboard —
      **publishers.monetag.com → Telegram Mini Apps → the app → Postback**,
      field _Your backend URL_ (2048 chars), then _Save settings_
- [x] `MONETAG_REWARD_SECRET` set in Railway → Variables, container redeployed;
      verified live: the endpoint went 401 → `200 {"status":"ignored",
    "reason":"unknown-user"}`
- [ ] End-to-end check: watch one ad in the real Mini App and confirm the AP
      lands (the grant now comes from the callback, not the client)
- [ ] Property URL switched from the bot link to the Mini App direct link
      (`https://t.me/LuckyTicket365_Bot/lottery`)

### House ad

- [x] `HouseAdOverlay` mounted in Tasks; promos + duration in
      `src/constants/house-ads.constants.ts`
- [x] Daily cap shared with network ads (server-side)
- [x] Reward parity with a paid view — deliberate. The daily cap (10/20/40)
      already bounds it, and the economy's AP baseline assumes a full day of ad
      views (`dailyBaselineApByTier` sums `watchVideo * watchVideoDailyLimit`).
      Paying less for a house view would quietly cut the baseline every time
      fill drops, i.e. punish the player for our lack of demand. Revisit only
      if house views ever dominate the mix — `provider: 'house'` is recorded on
      every watch, so the split is measurable.
