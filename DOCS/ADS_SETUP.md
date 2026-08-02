# Rewarded Ads — Setup

Real rewarded ads for the **Tasks → Ads** section. The user watches an ad → the
app records the watch → the reward is granted (2 AP, `WATCH_VIDEO.ap`).

Telegram has no first-party rewarded-ad SDK, so the app wires **several ad
networks as a waterfall** plus its own promo as the final fallback.

---

---

## Where things stand (updated 2026-08-02)

|                         |                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------ |
| Waterfall in production | `adsgram,house` — Monetag taken out of rotation 2026-08-02, order lives in env       |
| Monetag                 | zone `11355872` kept, code intact, **not in the waterfall** — re-add to the env list |
| Adsgram                 | block `37750` live and filling — 41 impressions / $0.36 over 22–29 Jul (their panel) |
| House ad                | last in the chain, always shows — but **grants nothing**, only offers a retry        |
| Reward authority        | the network's server callback, and nothing else                                      |
| Per-view storage        | `AdView` table (provider, source, outcome, AP, revenue, ymid)                        |
| Admin panel             | section **Реклама** → «Откуда пришла реклама» + «Деньги от рекламы»                  |
| Revenue to date         | cents. Monetag exact from its postbacks; Adsgram estimated or typed in (see below)   |

Verified end-to-end in the real Mini App: ad served → network callback → AP
credited → row stored → visible in the panel.

The waterfall row is **verified** as of 2026-08-02: the value was set in the
Vercel panel and the deployed page was then fetched — it loads `sad.adsgram.ai`
and no longer loads `libtl.com`. (Before that date the row was inferred from
impression counts alone; the panel had never been opened.)

### Where the money is, 2026-07-30 — Adsgram never sends a price

The panel showed a dash in Adsgram's revenue column, and the question "how much
did ads earn" had no answer in the panel at all. Cause, checked in Adsgram's own
publisher panel (partner.adsgram.ai → block 37750 → Reward URL field tooltip):

> the GET request is sent when the REWARD event occurs, and `[userId]` is
> replaced with the user's Telegram ID

**`[userId]` is the only macro Adsgram offers.** No price, no CPM, no event type.
Their publisher API reference documents client-side `init/show/destroy/
addEventListener` and nothing else — no reporting endpoint. So per-view revenue
from Adsgram is not merely unwired, it is unobtainable. Monetag, by contrast,
sends `{estimated_price}` with every impression.

Their numbers as of that check (block 37750, 22–29 Jul): **41 impressions,
$0.36**, account balance $0.86. Per day the panel gives impressions / CPM /
fill rate / earned — 29 Jul: 3 impressions at $75.01 CPM ($0.2250); 28 Jul: 16 at
$2.90 ($0.0463); 26 Jul: 12 at $2.50, fill rate 30.8%; 23 Jul: 9 at $5.34;
22 Jul: 1 at $14.00. Sixteen impressions earned a fifth of what three did the
next day — per-viewer diminishing returns in one table, and a reminder that no
per-network conclusion holds at this sample size.

**What shipped instead** (both repos, 30 Jul): the panel stops pretending the
gap isn't there and reports money three ways, never merged into one number.

| Source   | Where it comes from                            | Networks |
| -------- | ---------------------------------------------- | -------- |
| «точно»  | the price the network sent with each view      | Monetag  |
| «оценка» | our exact view count × an admin-entered CPM    | Adsgram  |
| «факт»   | the monthly figure typed in from its dashboard | any      |

- `AdNetworkRate` — CPM per network, entered in the panel with a note saying
  where the number was read. **Nothing is seeded**: an unset rate reports
  nothing at all, because a CPM nobody looked up, rendered as revenue, is a
  made-up number. Entering `0` clears it.
- `AdNetworkRevenueFact` — one row per network per month, the network's own
  figure plus **its own impression count**. Ours and theirs disagree by design
  (they frequency-cap a viewer, we fall through to the next source), and the size
  of that gap is the only real check on the estimate.
- `GET /admin/ads/revenue` reports both against our per-view data per month and
  picks fact → exact → estimate, stating which it used (`basis`).
- Analytics' revenue split shows the estimated part as a separate `+≈$…`; it is
  deliberately NOT added into `totalUsd` or ARPU, which stay measured.

### 270 vs 17 — most of it was a date-range mistake

Written up the same day as a 16× hole. **That framing was wrong**, and the way it
was wrong is the recurring one: two numbers from different periods put side by
side.

`AdView` only exists from **2026-07-20 17:10 UTC** (migration `20260720205500`).
Adsgram's 270 impressions are all of July. Their own per-day data splits as:

| period    | their impressions | our rows | comparable?                                                                                        |
| --------- | ----------------- | -------- | -------------------------------------------------------------------------------------------------- |
| 1–19 Jul  | 187               | —        | no — the table did not exist                                                                       |
| 20 Jul    | 42                | 0        | partly — history starts 17:10 that day, and Adsgram was pulled out of the waterfall that afternoon |
| 22–29 Jul | 41                | 14       | yes                                                                                                |
| 30 Jul    | not reported yet  | 4        | no — their reporting lags                                                                          |

So 69% of the "gap" is a period we were not counting at all, and the real,
both-sides-counting ratio is **≈2.9×**, not 16×.

**What the residual is NOT.** From `GET /admin/ads/revenue/diagnostics` on
production: for Adsgram, client reports of finished views **18**, network
callbacks **18**, `capped` 0, `duplicate` 0. The grant path is intact — no
finished view went unrewarded, nothing was double-fired, nobody watched past the
cap. Monetag: 35 client reports against 38 callbacks (callbacks lead, as
documented — their postback fires on render, ~18s before the client reports).

**What it is.** Ads Adsgram counted as rendered that never became a finished view
on our side: the player closed the ad, or their counter moved on something our
SDK reported as `noAd` / `error` / `tooFast`. Their own columns show the same kind
of internal slippage — 26 Jul: `hits` 39, `wins` 12, `impressions` 12, fill 30.8%.

Those attempts used to leave **no trace at all**: the waterfall toasted the player
and returned. `POST /tasks/ads/attempt` now stores them (`skipped` / `noAd` /
`tooFast` / `error`, `source=client`, grants nothing, consumes no cap), and the
panel's «Куда ушли показы сети» reads the split back. **Live since 30 Jul** — so
zeros in those columns before that date mean "not counted", not "did not happen",
and the split of the 2.9× between "closed early" and "never really played" is
measurable now but **not yet measured**.

### The importer, 2026-07-30 — a file, because there is no API to poll

Their panel reads
`cab.adsgram.ai/api/statistics/publisher/detailedStatistic?blockIds=…&groupBy=DAY`
(per-day impressions / clicks / earned / cpm / fillRate). The account menu exposes
a personal **Token**, so a server-side poller looked plausible. It is not:

| auth tried on that endpoint                           | answer |
| ----------------------------------------------------- | ------ |
| `Authorization: Bearer <token>`                       | 401    |
| `?token=` · `?key=` · `?apiKey=`                      | 401    |
| `X-Token` · `X-Api-Key` · `Api-Key` · `Token` headers | 401    |
| browser session cookie (control)                      | 200    |

The endpoint is undocumented and cookie-only, and the token in their account menu
authorises nothing on it. (It sits in their JSON under the field name
`commentary`, which is its own kind of warning.) Nor is there an export endpoint —
`…/csv`, `…/export`, `…/download` all 404: their «Download CSV» is generated in
the browser from that same JSON.

So the import takes the **file**: panel → **Реклама** → «Импорт выгрузки из
кабинета сети», upload or paste, always preview first, then save into
`AdNetworkDailyStat` (one row per network per day; re-importing an overlapping
period corrects those days instead of duplicating them). Parser:
`src/admin/ad-stats-csv.ts`, tolerant by design and covered by
`ad-stats-csv.spec.ts` — delimiter `,`/`;`/tab, quoted fields, decimal comma,
`$`/`%` stripped, their `-` glyph read as **absent rather than zero**, EN/RU
headers, and three date formats where slashes are US order and dots are
day-first. Lines it cannot read come back as `skipped` with a reason instead of
being silently dropped.

Reporting order became **fact → imported → exact → estimate**, and a hand-typed
fact still outranks an import: somebody looked at the dashboard and decided.
`importedDays` travels with the number, so a four-day import can never read as a
month.

Verified on production the same day: 13 days of July parsed to **270 impressions
/ $0.842323**, matching their own panel to the cent, and July now reports
«$0.8423 файл · 13 дн.» against our 18 views. **Not verified:** the exact bytes of
their real `Download CSV` — the test used a CSV rebuilt from their live JSON in
their table's column order. First real file that trips the parser is a one-line
fix in the alias/date lists.

Worth asking @adsgramsupport whether publishers can get real reporting API
access; if they can, the same table takes an `api` source with no other change.

### Two numbers for one network, 2026-07-30

For a few hours «Откуда пришла реклама» showed Adsgram's money as a CPM estimate
(≈$0.0562) while «Деньги от рекламы» right below it showed the imported $0.8423
for the same 30-day window. Same network, same period, two numbers on one screen —
because the breakdown was written before the importer existed and only knew about
per-view prices and CPMs.

Both now follow one order: **money the network priced itself → its dashboard
export → a typed CPM**, and each figure carries where it came from («файл» for an
import, `≈` for an estimate). One source per network per window, so the two cards
cannot disagree again.

### Balances and "which network pays better", 2026-07-30

`AdNetworkAccount` holds what each network owes us, its payout threshold, and the
date somebody last read those off the dashboard. Nothing here is fetchable —
Adsgram's balance lives in its sidebar behind a session cookie, Monetag's $5 / 4th
and 19th is a policy page. An empty field stays unknown; it never becomes a zero,
because «$0 on the account» is a claim and «nobody looked» is not.

The comparison («Какая сеть выгоднее») reports revenue per 1000 ads we paid a
reward for, next to the network's own eCPM — and refuses a winner unless:

| condition                                    | why                                                                                                                                                                               |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| both sides' money came from their dashboards | `views × CPM ÷ 1000 ÷ views` = the CPM, so ranking on an estimate ranks the input; and postback prices cover only rewarded impressions while a dashboard total covers all of them |
| ≥ 1000 views per network                     | frequency capping makes small samples misleading, not merely imprecise                                                                                                            |
| ≥ 100 distinct viewers per network           | everything measured so far is essentially 4 people                                                                                                                                |

Live state right after shipping: Adsgram rankable (imported), Monetag not (its
money is postback prices), so the verdict reads «Вывода пока нет · Загрузите
выгрузку для: monetag» — actionable rather than silent. Four unit tests in
`admin-ads-comparison.spec.ts` lock each refusal in.

### Correction, 2026-07-21 — Adsgram was never dead

On 20 Jul this doc said Adsgram "has never filled a single request" and it was
removed from the waterfall. **That was wrong.** Its own dashboard showed 50
impressions and $0.21 earned over 14–21 Jul — it had been serving real players
in Telegram the whole time.

The false conclusion came from two indirect observations: a `curl` from a
laptop (outside Telegram, so of course no fill) and a single live test in which
Monetag happened to answer first. Neither is evidence about a week of traffic.
**The network's own dashboard was never opened.**

Measured CPM over the same window: **Adsgram ≈ $4.20**, Monetag **$1.43** — so
Adsgram is now first. Treat the 3× gap as unconfirmed: 50 impressions from one
or two viewers, and 2 clicks that may account for most of the $0.21.

**Rule this cost us:** never conclude "no fill" — or switch off any revenue
source — from a snapshot or a proxy. Open the network's panel and look at a
period.

### Per-viewer diminishing returns

Repeat views by the same person are worth progressively less: advertisers
frequency-cap their campaigns, so the expensive demand for that viewer is
exhausted and later impressions are filled with cheap or unpaid
(`non_valued`) inventory. Visible in Monetag's own numbers — 20 Jul: 25 views
at $1.58 CPM; 21 Jul: 3 views at $0.00.

Consequence: **no per-network conclusion is trustworthy until impressions come
from hundreds of different people.** Everything measured so far is essentially
one viewer.

## Decisions, and why

- **Several networks, not one.** A single network is a single point of failure
  whose failure is invisible: the task just says "no ads". Adsgram sat live but
  unfilled for days without anyone noticing.
- **Order lives in env, not code.** Re-prioritising after real eCPM data is a
  variable change plus a redeploy. The list also gates SDK loading, so a
  disabled network costs nothing per page load.
- **A skip stops the chain.** Falling through to the next source when the
  player closes an ad would make "close the ad" a second chance at a reward.
- **The house ad exists because fill is never guaranteed.** It earns nothing,
  so it also **pays** nothing — it is a promo plus a «Попробовать снова»
  button, never a reward. Changed 2026-08-02; before that it paid at parity
  with a real view.
- **`reward_event_type` is never checked.** The player watched the ad; whether
  the impression was monetised is our problem, not theirs.
- **Only `event_type=impression` grants.** Monetag also posts back on clicks,
  which would pay a single view twice.
- **Rewarded Interstitial, not Rewarded Popup**, despite Popup paying 2–3× more
  — it navigates the player out of the Mini App.
- **Storage shipped before the dashboard.** A dashboard can be built any time;
  views not recorded today are gone forever.

## Not done / open

- **Re-measure the network comparison** once traffic is real. Today's ranking
  rests on ~78 impressions from one or two viewers.
- **GigaPub** as a third source — an auction across networks, worth a
  conversation once traffic justifies it. No account, no integration yet.
- **Per-day chart** in the admin section — only totals over 30 days today.
- **Adsgram importer** — pull their per-day numbers automatically instead of
  typing a monthly figure in. Needs `ADSGRAM_API_TOKEN` on Railway and one
  server request to prove the account token authorises
  `cab.adsgram.ai/api/statistics/publisher/detailedStatistic`. Until then the
  estimate + the typed-in fact are what the panel has.
- **Compare our numbers against the networks' dashboards** — now possible in the
  panel (the fact column carries their impression count next to ours), still
  meaningless at this volume.
- **Monetag stats lag** — their panel showed 1 impression against 5 watched
  ads; no capping was observed in our logs, so this looked like reporting
  delay. Unconfirmed; recheck with real volume.

## Traps this cost time on

- **A line-wrapped secret.** The postback URL was rejected as "url not valid"
  for an hour. The format was fine — copying the long secret out of a chat
  broke it across a line, and a URL containing whitespace is invalid. Check for
  whitespace before theorising.
- **`?key=<secret>` is rejected.** The dashboard validates a postback URL by
  requiring every query parameter to be `name={macro}`. The secret goes in the
  path.
- **The dashboard's macro hint is wrong** about `reward_event_type`: it claims
  `yes`/`no`, live postbacks send `valued`.
- **The callback arrives ~18s BEFORE the client's watch report** — Monetag
  fires on render, the client reports on completion. A trailing `ad watch` log
  line with no postback after it is a paired view, not a lost reward.
- **Mock data cannot validate the admin section.** Three separate bugs
  (a metric that could only grow, an idle network vanishing from the table, and
  real sub-cent revenue rendered as `$0.0000`) were all invisible until the
  panel was pointed at production numbers.
- **Nest does not log inbound GETs** — the callbacks were unobservable until
  logging was added explicitly.
- **The admin repo sits on branch `feat/test-quest`** with a stale local
  `main`, so `git push origin main` pushes the wrong branch. Use
  `git push origin HEAD:refs/heads/main`.

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

| id        | Module                            | Notes                                   |
| --------- | --------------------------------- | --------------------------------------- |
| `adsgram` | `src/lib/ads/adsgram.provider.ts` | SDK script + block id                   |
| `monetag` | `src/lib/ads/monetag.provider.ts` | SDK tag + zone id, supports preload     |
| `house`   | `src/lib/ads/house.provider.ts`   | the app's own promo — shows, never pays |

The **house ad** is what the player gets instead of a bare "no ads right now".
Its UI is `HouseAdOverlay` (mounted in `TasksContent`), which registers itself
with the provider on mount — if it isn't mounted, the waterfall simply ends at
the last network. Promos live in `src/constants/house-ads.constants.ts` and
rotate per show.

It has **no `completed` exit**: the presenter resolves either `retry` or
`skipped`, and the provider maps `retry` → `noAd`, so no code path can turn an
unpaid impression into a grant (guarded by `tests/ads-waterfall.test.ts`).
`TasksContent` reads `outcome === 'noAd' && provider === 'house'` as "the
player pressed «Попробовать снова»" and re-enters the waterfall instead of
opening the unavailable-modal on top of a screen that just said the same thing.
Each pass needs its own tap, so it cannot spin on its own.

`watchAd` POSTs the serving `provider` to the backend, which uses it to pick
the grant path (client-attested vs waiting for that network's callback).

Every view is stored as an **`AdView`** row: `provider`, `outcome`
(granted / capped / duplicate / s2s-pending), `ap`, `estimatedPrice`, `ymid`,
plus `source` — `client` (the app reported a finished view) or `callback` (the
network's authoritative postback). Writes are best-effort so analytics can
never fail a reward.

Keeping both sources is the point: a `client` row with no matching `callback`
row is exactly the "the network reports 1 impression but I watched 5" case —
the network capped the user and the waterfall fell through to the house ad.
Answerable with a query instead of guesswork.

`estimatedPrice` comes from Monetag's `{estimated_price}` macro, so revenue is
computable from our own data rather than waiting on their dashboard. It only
arrives if that macro is in the postback URL — see above.

Runtime logs cover the same events (`ad watch:` / `postback:` lines) but only
for the current deploy.

---

## Environment

```bash
# Adsgram
NEXT_PUBLIC_ADSGRAM_BLOCK_ID=37750
NEXT_PUBLIC_ADSGRAM_DEBUG=false   # "true" = test creatives (disables the S2S callback)

# Monetag
NEXT_PUBLIC_MONETAG_ZONE_ID=

# Waterfall order — blank means adsgram,monetag,house
NEXT_PUBLIC_AD_PROVIDERS=adsgram,house
```

Set them in `.env.local` for local testing and in **Vercel → Settings →
Environment Variables** for production. A network is skipped — and its SDK
script is not even loaded — when it has no id OR when it is absent from
`NEXT_PUBLIC_AD_PROVIDERS`. That list is the single source of truth: dropping a
network from it costs nothing at runtime, and putting it back needs no code
change.

**Currently `adsgram,house`** (set 2026-08-02) — Monetag is out of the rotation
by request, while its zone id, provider and postback route stay in place so it
can be re-added by writing `adsgram,monetag,house` back into the list.

**Reordering the waterfall is an env change, not a code change** — but it still
needs a **redeploy**. `NEXT_PUBLIC_*` values are inlined into the bundle at build
time, so editing the variable alone changes nothing; Vercel says as much in the
toast after saving. Set the value, then `vercel --prod`, then confirm by fetching
the live page and checking which SDK `<script>` tags it contains.

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
2. **Telegram Mini Apps** tab → **Add app**. **No moderation gate and no
   minimum DAU.** Monetag keys the app off the bot name plus its own id — it
   stores no URL, so nothing here needs to match the deployed origin.
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
  cap is shared across every network. The house ad never reaches this endpoint
  at all, so a promo screen cannot spend a slot.
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
- `reward_event_type` (`valued` / `non_valued` — was the impression paid) is
  deliberately not checked. The player watched the ad; whether we got paid is
  our problem, not theirs. NB: the dashboard's macro hint claims the values are
  `yes`/`no`. Live postbacks send `valued` — the docs are right, the hint is
  wrong.

**Event order, observed in production:** Monetag fires the postback when the ad
_renders_, and the client reports its finished view ~18s later. So a `callback`
row normally precedes its `client` row — a trailing `ad watch` line with no
postback after it is the tail of an already-paired view, not a lost reward.

The client mints a unique `ymid` per view (`<telegramId>.<unique>`), which is
both the idempotency key and the attribution fallback when the `{telegram_id}`
macro arrives empty. Reusing one id would make every view after the first look
like a retry.

**Order matters when enabling:** configure the postback URL in Monetag FIRST,
then set `MONETAG_REWARD_SECRET`. The moment the secret exists, `watchAd` stops
granting for Monetag views and waits for the callback — if the URL isn't set
yet, players watch ads for nothing. Each provider's switch is independent:
enabling Adsgram's callback does not affect Monetag.

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
- [x] End-to-end verified in the real Mini App (2026-07-20): ad watched, AP
      credited. With the secret set, `watchAd` no longer grants for Monetag —
      so the AP arriving proves the callback fired and `ymid` attribution works
- [x] N/A — Monetag stores no property URL. An app is identified by its bot
      name and Monetag's own id (`3416586`); the dashboard offers no URL field
      and no edit action. Unlike Adsgram, there is nothing to match against the
      running origin, so a wrong link cannot break serving here.

### House ad

- [x] `HouseAdOverlay` mounted in Tasks; promos in
      `src/constants/house-ads.constants.ts`
- [x] **Grants nothing** (2026-08-02). An unpaid impression must not pay out,
      so the only exits are «Попробовать снова» and close. It consequently does
      not burn a daily slot either — `watchAd` is only called after a network
      completion.
- ⚠️ **Open economy question.** `dailyBaselineApByTier` sums
  `watchVideo * watchVideoDailyLimit`, i.e. it assumes a full day of ad
  views. With the house ad no longer topping up short fill, players land
  under that baseline whenever Adsgram is empty. `provider` is recorded on
  every watch, so the gap is measurable — correct it with the pacing knobs
  if it shows up, not by paying for house views again.
