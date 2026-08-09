# LuckyTicket365

## Official Product Documentation

---

## 1. Introduction

### 1.1 Product Name

**LuckyTicket365**

### 1.2 Product Type

LuckyTicket365 is a multilingual, gamified reward platform with a built-in virtual economy and an integrated TON crypto wallet.

### 1.3 Purpose of the Document

This document describes LuckyTicket365 as a complete product. It explains **what** each system is, **why** it exists, **how** users interact with it, and **how** it connects to other parts of the platform. The document is intended for product managers, developers, designers, QA engineers, and business stakeholders.

---

## 2. Product Overview

LuckyTicket365 is designed to convert user activity into measurable value. By interacting with the app daily, users collect tickets, participate in tournaments, complete tasks, and earn Lucky Coins (LC). These coins can be spent inside the ecosystem or exchanged for cryptocurrency.

The product combines:

- **Engagement mechanics:** Daily usage, streaks, decay
- **Progression systems:** Tickets, statuses, boosts
- **Competitive mechanics:** Tournaments, leaderboards
- **Monetization:** Market, status purchases, Lucky Stars

All systems are interconnected to encourage long-term retention and consistent activity.

---

## 3. Supported Platforms & Localization

### Purpose

Localization ensures global accessibility and higher user adoption across regions.

### Description

- LuckyTicket365 is a web application.
- All user-facing content supports multiple languages.

### Usage

Users can change their language at any time via settings. Language choice affects UI text, tasks, support articles, and notifications.

### Live languages

**`en` · `ru` · `de`.** Armenian (`hy`) exists in the enum and in the database for parity, but is deliberately **not** offered as an app language — an `hy` locale cookie is treated as invalid and falls back to the default.

Two conventions coexist and are easy to confuse: the Mini App, the locale cookie and the admin API contract use **lower case** (`de`), while the Prisma enum, `User.locale` and the panel's filters use **UPPER case** (`DE`). A mismatched case does not throw — it just fails to match and quietly serves English.

> **Adding or dropping a language touches ~20 places across all three repos.** The verified checklist, with deploy order, is [`ADDING_A_LANGUAGE.md`](ADDING_A_LANGUAGE.md). Keep it current whenever a new language-dependent surface appears.

---

## 4. User Account & Profile

### Purpose

The user account system uniquely identifies users, stores progress, and enables personalization, security, and monetization.

### 4.1 User Account

Each account includes:

- Unique username
- Optional email address or phone number
- Verification state

The account is required to participate in all platform activities.

#### Two names: the handle and the shown name

A player has a **username** and a **display name**, and they answer different
questions.

- **`username`** — unique, ASCII only (letters, digits, `.`, `-`, `_`), 3–32
  characters. It IDENTIFIES an account: leaderboard rows, referrals and admin
  search all key off it. Assigned at first Telegram sign-in from the `@handle`,
  or `tg_<telegram id>` when that handle is taken or absent.
- **`displayName`** — the name the player wrote for themselves in Telegram
  (`first_name` + `last_name`), refreshed on **every login**, exactly like the
  avatar. It is only ever PRINTED. Telegram allows anything here — `(.)`, emoji,
  Cyrillic, right-to-left — so most real names could never be a `username`.

**What the app shows** (in order): the player's own in-app name if they renamed
themselves in Settings → otherwise their Telegram name → otherwise `username`.
Renaming in Settings latches that choice permanently (`usernameCustom`), so the
Telegram name stops overriding it — without that latch, the rename screen would
let someone type a name that never appears anywhere.

The shown name is used in the header, drawer, profile, leaderboard, friends
list, tournament podium, and the channel post announcing tournament results —
everywhere a human reads a name. Names arriving from Telegram are stripped of
invisible and bidirectional-override characters (which can visually reverse the
row around them) and capped at 32 characters.

Accounts that existed before this shipped have no `displayName` until their
owner next opens the app, and show their `username` in the meantime.

### 4.2 User Profile

The profile represents the user publicly and internally. It contains:

- **Avatar:** Visual identity, which will be customizable via the Market in the future.
- **Activity Points:** Earned through engagement and used for rankings and VIP eligibility.
- **Lucky Coin (LC):** The primary internal currency.
- **Current Status:** Verified, Lucky Player, or VIP.
- **Personal Statistics:** Tracking performance across the platform.

The profile connects to the leaderboard, tournaments, Market, and social features.

### 4.3 Account Ban

An admin can **ban / unban** any account from the admin panel (user card → «Забанить», with confirmation; the action is audit-logged). A ban takes effect **immediately and everywhere**:

- **Live sessions die instantly** — every authenticated request re-checks the flag (JWT strategy) and answers **403 `BANNED`**, so a valid access token stops working the moment the ban lands.
- **No way back in** — the Telegram Mini App sign-in, the web password login, and the token-refresh endpoint all refuse banned accounts with the same 403 `BANNED`.
- **The Mini App shows a blocking "Account blocked" screen** (`BannedOverlay`) — opaque, full-screen, no dismiss action, localized in all four languages. It triggers on the first 403 `BANNED` from any request (the login itself included) and never clears within the session; the banned user can see nothing else of the app.
- **Unban** is the same admin toggle; the user gets back in on the next app open (banned state is never cached client-side).

The literal `BANNED` message on a 403 response is the backend↔frontend contract for this flow. Admin accounts are subject to the same check — a banned admin also loses panel access.

---

## 5. Activity Points System

### Purpose

Activity Points (AP) are the **single progression metric** of LuckyTicket365. They measure engagement and consistency, and act as the **universal gate** that unlocks higher-tier content across the whole platform. There is no separate "player level" — the profile shows the raw AP count.

### 5.1 Tiers

A user's **tier** is derived from accumulated AP **and** invited friends. A tier unlocks only when BOTH conditions hold: the AP threshold is reached AND the required number of friends has been invited (cumulative count of activated referrals — friends who actually opened the Mini App via the link, §19):

| Tier     | AP threshold | Referrals required | Reached by (perfect daily-baseline player) |
| :------- | :----------- | :----------------- | :----------------------------------------- |
| Bronze   | 0            | 0                  | start                                      |
| Silver   | 500          | 2                  | ~2 weeks                                   |
| Gold     | 1,650        | 5                  | ~1.5 months                                |
| Platinum | 5,900        | 10                 | ~4.5 months                                |
| Diamond  | 16,000       | 20                 | ~10.3 months                               |

AP thresholds implement the product pacing targets — Silver in ~15 days, Gold +1 month, Platinum +3 months, Diamond +6 months — **computed against the derived daily baselines** (§5.4), i.e. against what a fully-active player can actually collect per day from every capped source. The legs land at ≈15.2 / 29.5 / 90.4 / 177.2 days, each visibly longer than the previous one — the pacing guardrail is asserted in `tests/economy-sim.test.ts`. (Thresholds were retuned down when engine-claim AP was removed from the source registry, so the pacing targets held.)

The pacing describes a player who collects the full daily baseline every day **and keeps the referral requirement satisfied**. Tournaments make it faster; missed days and missing invites slower. A player who out-earns the AP threshold but lacks the invites stays capped at the lower tier (and earns/decays at that tier's baseline) until they invite enough friends.

The referral requirements (0 / 2 / 5 / 10 / 20, cumulative and monotonically non-decreasing) live in `tierReferralRequirements` (frontend) / `TIER_REFERRAL_REQUIREMENTS` (backend) and are admin-tunable live via `referralConfig.tierRequirements`. Both the AP and referral halves are asserted in `tests/economy-sim.test.ts` (with a backend parity check).

### 5.2 The Tier Gate (AP + referrals)

The tier (§5.1) is the universal gate. A feature of tier `T` requires `tier ≥ T`; the user can always use their own tier and every lower tier.

- **Tier-gated:** producer engines, tournaments, stakes, tier-bound market items.
- **Not gated:** avatars, statuses / VIP, the referral/invite screen itself (inviting must never be locked — it is a tier requirement).

### 5.3 How Activity Points Are Earned

AP is earned from a data-driven **source registry** — every meaningful action grants AP. Each source carries a base amount, an optional daily cap, and (for spendable actions) proportional scaling:

| Source                    | AP                                    | Limit                                                                                          |
| :------------------------ | :------------------------------------ | :--------------------------------------------------------------------------------------------- |
| Daily login streak        | 3                                     | 1×/day                                                                                         |
| Daily task                | 1 / 2 / 3 / 4 / 5                     | by task tier; a tier-T player completes 3–7/day (`dailyTasksCountByTier`)                      |
| Weekly task               | 2 / 3 / 4 / 5 / 6                     | by task tier; a tier-T player completes 3–7/week (`weeklyTasksCountByTier`)                    |
| One-time task             | varies                                | once per task                                                                                  |
| Verify email              | 20 (admin-configurable gift, §16.3)   | one-time                                                                                       |
| Watch a video             | 2                                     | 10×/day default · 20×/day with LP · 11→30×/day with VIP by level (daily cap = limit × 2 AP)    |
| Send a ticket to a friend | 1                                     | 3×/day                                                                                         |
| Like a profile            | 1                                     | 3×/day                                                                                         |
| Invite a friend           | 10 (20 for a Telegram Premium friend) | per invite                                                                                     |
| Join a tournament         | 1 / 2 / 3 / 4 / 5                     | by tournament tier (Bronze→Diamond), per join                                                  |
| Purchase                  | 1 per 10 LS spent                     | no daily cap                                                                                   |
| Spend LC                  | 1 per 2,500 LC spent                  | no daily cap                                                                                   |
| Complete a stake          | `LC staked × months / 5,000`          | base credited on start (retained on cancel), +50% bonus on completion (forfeited if cancelled) |

Tiered sources (daily / weekly tasks, tournament join) scale with the relevant tier — Bronze→Diamond — and recurring daily sources carry per-day caps. **Claiming engine output awards no AP** — claims pay in tickets only, so farming the claim button cannot drive progression. For the same reason **a tournament pays its join AP once**, however many times the player re-enters it to add tickets (Section 11). **One-off and on-top sources** — verify-email, one-time tasks, friend invites, tournament joins, stake completion — are earned above the daily baseline (Section 5.4). **Purchases are uncapped:** 1 AP per 10 LS or per 2,500 LC spent with no daily limit, so a heavy spender climbs tiers substantially faster than a free player.

### 5.4 Daily Baseline

The **daily baseline** is the AP a fully-active player earns per day without donation. It is **DERIVED, not hand-set**: `dailyBaselineApByTier` is computed from the source registry (§5.3) as the sum of every capped recurring source — streak + ads + ticket sends + likes + daily tasks + weekly tasks averaged per day. Tune a source rate or cap and the baseline, the decay rate and the tier pacing all follow automatically. It is tier-dependent — daily and weekly tasks scale with tier:

| Tier     | Daily baseline (derived) |
| :------- | :----------------------- |
| Bronze   | 33                       |
| Silver   | 39                       |
| Gold     | 47                       |
| Platinum | 57                       |
| Diamond  | 70                       |

The baseline is shown on the AP dashboard and is the basis of the decay rate (Section 5.5). One-off and on-top sources — verify-email, one-time tasks, invites, tournaments, stakes, purchases — are earned above this baseline.

### 5.5 Activity Decay

If the user stops opening the app, AP decays:

- **Grace period:** 7 days of inactivity with no decay.
- **After grace:** AP drops by `0.5 ×` the player's tier daily baseline per inactive day (≈ 17 AP at Bronze, ≈ 35 at Diamond). Floor: 0.
- Any action resets the grace timer and stops the decay.
- Decay lowers AP → lowers tier → **freezes** (makes temporarily unusable) content above the new tier. **No assets are lost** — engines, tickets, LC remain; they are frozen until AP recovers.
- Bronze tier is 0 AP and the decay floor is 0, so a user can never fall below Bronze — Bronze content and non-gated AP sources always remain available, so a returning user can always climb back.

### 5.6 AP Dashboard

AP has a dedicated dashboard screen, opened by tapping the AP count on the profile. It shows current AP, tier, progress to the next tier, decay status, the full breakdown of AP sources with the no-donation daily ceiling, and which tournaments the current tier unlocks.

Every row in the AP-source breakdown is a **deep link** to the screen where that action is performed. On arrival the relevant target briefly **shines** — and scrolls into view if it is off-screen — so the player sees exactly where to earn the AP. A source that points at a whole screen (like a profile, join a tournament, purchase) glows the page; a source that points at a specific block (verify email, watch a video, invite a friend, send a ticket, complete a stake, daily login streak) glows that block's heading. Task sources additionally open the correct frequency tab (daily / weekly / one-time).

### Connections

AP connects to: the tier gate on engines / tournaments / stakes / market, the leaderboard ranking, the profile (AP shown instead of a level), and the daily task surface (each task shows its AP reward).

---

## 6. Currency System

### Purpose

LuckyTicket365 runs on **two separate currencies**: Lucky Coin (LC), the internal reward currency, and Lucky Stars (LS), the real-money currency. They do not convert into each other.

### 6.1 Lucky Coin (LC) — internal reward currency

LC is the internal reward currency. It is **earned only by playing** — tournament prizes, stake yield (APR), task and ad rewards — and is spent inside the platform: buying tickets, producer engines, and upgrading statuses. (Engine speed/capacity upgrades are paid in **LS**, not LC — §10.2.)

- LC has a fixed real-money valuation of **$0.000001 per LC** ($1 = 1,000,000 LC), used to price its conversion to TON.
- LC **cannot be acquired by conversion** — there is no TON→LC or LS→LC path, and no fiat/crypto LC deposit. LC enters the economy only by playing.
- LC reaches real money by **converting to TON** at its $0.000001 valuation; the resulting TON is withdrawn through the wallet (Section 15). A **direct LC withdrawal is coming soon**.
- The LC→TON exit carries two backend-enforced guards (`appConfig.economy.lcConversion`): a **15% conversion fee** and a **$10/day per-account cap**. They are the hard bound on real-money outflow regardless of how the internal LC faucet is tuned (§14.2).

### 6.2 Lucky Stars (LS) — real-money currency

LS is the premium / real-money currency (see Section 19). It is **bought with real money** (Telegram Stars at 1:1, or TON) in unlimited quantity, and is also earned in-game from stakes, tasks, and invites. LS is spent on premium upgrades. **LS is never withdrawn and does not convert into LC or TON** — it flows in and is spent inside the platform.

### Connections

LC connects market, tournaments, stakes, tasks, and progression. LS connects the Market premium rail, the Wallet purchase paths, and engine premium actions (instant claim, capacity upgrade).

---

## 7. Status System

### Purpose

Statuses reward trust, loyalty, and engagement while enabling monetization. Statuses are **not** AP-tier-gated — they are acquired with currency, independently of progression.

### 7.1 Status Levels

| Status           | Description                                           | Duration     |
| :--------------- | :---------------------------------------------------- | :----------- |
| **Verified**     | Identity confirmed via email or phone                 | Permanent    |
| **Lucky Player** | Paid mid-tier status with benefits                    | Time-limited |
| **VIP**          | High-tier leveled status with permanent game benefits | Permanent    |

### 7.2 Status Acquisition

- **Verified:** Identity confirmed via email or phone confirmation. Free.
- **Lucky Player:** A paid, time-limited **weekly** subscription (7 days), purchased via the Market with Lucky Coins (LC) or Lucky Stars (LS) — **100⭐ ($2) / 2,000,000 LC ($2)** per week, priced at parity (the week costs the same $2 in either currency; no grind premium — unlike VIP).
- **VIP:** Unlocked and upgraded via the Market. No Activity Points requirement. Detailed rules in Section 7.4.

### 7.2a Lucky Player daily gift

A running Lucky Player subscription pays a **fixed drop once per UTC day**: `dailyGift.lc` coins plus `dailyGift.ticketCount` tickets of `dailyGift.ticketTier`. Live defaults: **25,000 LC + 1 Bronze ticket**, i.e. ~175,000 LC and 7 tickets across the 7-day subscription it is attached to. Everything here is admin-tunable in one place (Admin → Настройки → Статусы → Lucky Player → «Подарок за ежедневный вход»), including an off switch.

**It is not a streak.** Every day pays the same, and a missed day is simply not paid — there is no accrual, no back-pay and no ladder to reset. Two consequences, both deliberate: a week away costs a player nothing but that week, and the emission this adds is exactly `lc × active subscribers × days`, a number the economy report can state rather than model.

**The modal opens by itself on the first entry of the day** (`DailyGiftAutoSurface`, mounted in the tabs layout). It takes its turn at the shared app-open popup slot **behind** the tournament result and admin notifications — those expire or matter more, this one stays collectable until midnight UTC regardless.

**Who decides "once a day" matters.** The **server** answers `shouldSurface` from the account's `lpDailyGiftClaimedAt`; the client only remembers that the player waved the popup away today, so a dismissal is not re-nagged on every navigation. A purely client-side counter would hand out a second gift after a reinstall, on a second device, or after cleared storage — all three reset local state while the subscription does not.

**A free player sees the same modal as an offer** when `promoForNonLp` is on (default): identical numbers, but the button buys Lucky Player instead of collecting. One component renders both, so the offer can never drift away from the gift an admin has since retuned.

| Path                      | Method | What it does                                                                                 |
| :------------------------ | :----- | :------------------------------------------------------------------------------------------- |
| `status/daily-gift`       | GET    | State: the configured drop, `canClaim`, `shouldSurface`, `surfaceReason` (`gift` \| `promo`) |
| `status/daily-gift/claim` | POST   | Credits the drop once. `gift-disabled` / `lucky-player-required` / `already-claimed-today`   |

The claim stamps `User.lpDailyGiftClaimedAt` and credits inside **one interactive transaction**, where the stamp is a conditional update still carrying the previous timestamp in its `WHERE`. Two taps that race both read "not collected yet", but only one matches the row; the loser credits nothing. The LC side writes an `LP_DAILY_GIFT` ledger row — its own type because this is a recurring emission bought by a subscription, not a task reward, and the economy report has to be able to separate the two.

### 7.3 Status Benefits

Statuses grant a fixed set of privileges. **Lucky Player** and **VIP** never stack — when both are active, the higher-tier (VIP) value supersedes Lucky Player. The same magnitude is also never applied to the matching status purchase (e.g. VIP discount is **not** applied when buying / upgrading VIP itself).

All perk magnitudes live in `src/constants/global.constants.ts` and can be tuned without code changes.

#### Lucky Player perks

**Every** Lucky Player perk is **admin-tunable** in one place (Admin → Настройки → Статусы): price (LC + LS), duration (days), and the full perk set — engine speed, stake yield, tournament reward, tournament join-AP, **market discount %, daily ads cap, and per-tier ticket-send limits**. The backend resolves these into `me.statusPerks` so the Mini App shows exactly what the server enforces. Admins can also set/extend a specific player's LP expiry from the user editor.

The table below is the **live production configuration**. The `luckyPlayer*` code constants are the flat fallback a fresh environment boots with and no longer match it — production runs `PlatformConfig.statusConfig`.

| Perk                            | Value                                              | Source constant                                  |
| :------------------------------ | :------------------------------------------------- | :----------------------------------------------- |
| Engine speed boost (additive)   | +10%                                               | `luckyPlayerEngineSpeedBoostPct`                 |
| Stake LC yield boost            | +5%                                                | `luckyPlayerStakeYieldBoostPct`                  |
| Stake fee volume discount       | base 10–20% only (**no LP bonus**)                 | `statusPerks.stakeFeeDiscountBonusPct` (`0`)     |
| Market discount on every item   | −10%                                               | `luckyPlayerMarketDiscountPct`                   |
| Tournament LC reward boost      | — (`0`)                                            | `luckyPlayerTournamentRewardBoostPct`            |
| Tournament join AP boost        | — (`0`)                                            | `luckyPlayerTournamentJoinApBoostPct`            |
| Daily ads cap                   | 20 (base 10 **+10**)                               | `statusPerks.adsDailyBonus`                      |
| Higher ticket send daily limits | B5/S4/G3/P2/D1 (base 1/1/1/0/0 **+4/+3/+2/+2/+1**) | `statusPerks.ticketSendDailyBonus`               |
| Send Platinum/Diamond tickets   | allowed                                            | base is 0 → any positive bonus opens the tier    |
| Bulk "Claim all" per tier       | enabled (admin-tunable)                            | `statusPerks.bulkClaimEnabled` (LP default true) |
| Profile badge                   | LP icon + glow                                     | n/a (visual)                                     |

#### VIP perks

VIP is the high-tier permanent status. **Every VIP perk is admin-tunable per level** (Admin → Настройки → Статусы) — engine speed, stake yield, tournament reward, tournament join-AP, **market discount %, daily ads cap, per-tier ticket-send limits and bulk claim**, plus the per-level price. The market / referral / tasks sections keep only the NON-status values (base market prices, the flat referral %, default ads cap); the VIP/LP values moved to Статусы and the backend reads them from there (single source of truth, surfaced to the client via `me.statusPerks`).

**VIP is a ramp, not a flat status.** The values below are the **Level 20 ceiling**; a VIP starts far under Lucky Player and only overtakes it at the very top. The full per-level ladder — the actual live numbers — is in **§7.4**. The two milestones that matter: **Level 15** is where VIP takes the "Claim all" capability; **Level 20** is the table below, and it is a deliberate step, not a next rung — every column on it stands **20% above Level 19**. The code constants (`vipEngineSpeedBoostPct` etc.) are the flat fallback a fresh environment boots with; production runs the ladder from `statusConfig`.

**Three perks are switched off for both statuses entirely** — tournament LC reward, tournament join AP, and the stake-fee volume discount are `0` for Lucky Player and on all twenty VIP levels. The stake-fee volume discount is therefore **the same 10/12/15/20% ladder for everybody**, paid and unpaid alike: no status buys a cheaper stake any more.

| Perk                            | Value at Level 20                   | Level 1 · Level 10                 | Source constant                               |
| :------------------------------ | :---------------------------------- | :--------------------------------- | :-------------------------------------------- |
| Engine speed boost (additive)   | +20%                                | +1% · +8.8%                        | `vipEngineSpeedBoostPct`                      |
| Stake LC yield boost            | +5%                                 | +0.1% · +2.2%                      | `vipStakeYieldBoostPct`                       |
| Stake fee volume discount       | base 10–20% only (**no VIP bonus**) | same at every level                | `statusPerks.stakeFeeDiscountBonusPct` (`0`)  |
| Market discount on every item   | −10%                                | −1% · −4.7%                        | `vipMarketDiscountPct`                        |
| Tournament LC reward boost      | — (`0` at every level)              | —                                  | `vipTournamentRewardBoostPct`                 |
| Tournament join AP boost        | — (`0` at every level)              | —                                  | `vipTournamentJoinApBoostPct`                 |
| Daily ads cap                   | 30 (base 10 **+20**)                | 11 · 19                            | `statusPerks.adsDailyBonus`                   |
| Higher ticket send daily limits | 21/19/17/14/12 by tier              | 3/2/1/0/0 · 11/9/7/5/3             | `statusPerks.ticketSendDailyBonus`            |
| Bulk "Claim all"                | yes                                 | no · **unlocks at L15**            | `bulkClaimEnabled` (LP-only in code defaults) |
| Send Platinum/Diamond tickets   | allowed                             | Platinum from L5 · Diamond from L7 | (bonus > 0 is the gate, §7.3)                 |
| Profile badge                   | Animated VIP-level                  | every level                        | n/a (visual)                                  |
| Dedicated support               | yes                                 | every level                        | n/a (operations)                              |

#### Every status perk is a bonus over a base, never a replacement

**A status never states a final number — it states what it ADDS to the number a free player already has.** That is the rule for the whole perk set, and the two counted perks are where it is easiest to get wrong:

| Perk                      | Base a free player has                           | What the admin types                                                                            |
| :------------------------ | :----------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| Daily ad views            | `watchVideoDailyLimit` (10, Настройки → Задания) | `adsDailyBonus` — `+1` on VIP 1 → the player gets 11                                            |
| Ticket sends by tier      | `TICKET_SEND_DAILY_LIMITS.default` (1/1/1/0/0)   | `ticketSendDailyBonus` — `+4` Bronze → the player has 5                                         |
| Stake fee volume discount | `STAKE.feeVolumeDiscount` (10/12/15/20%)         | `stakeFeeDiscountBonusPct` — live value is `0` for both statuses; `+10` would give 20/22/25/30% |

The other percentage perks (engine speed, stake yield, tournament reward/join-AP, market discount) were always deltas over an implicit base of 0, so they already obey the rule. **Every table in this document quotes the effective number; the admin panel quotes the bonus**, prefixed with `+` and captioned with the total it works out to.

Both counted perks used to be absolute values that replaced the base. That let a status be written _below_ the free limit, and production shipped exactly that: VIP levels 1 and 2 were capped at 4 and 2 ad views against a free 10, so paying players watched fewer ads than free ones. With a `Min(0)` floor on a bonus that is unrepresentable — the worst an admin can now do is add nothing. Configs written before the switch still store the old `adsDailyLimit` / `ticketSendDailyLimits` keys and are converted on read (`value − base`, floored at 0), which reproduces the same effective numbers — see `mergeStatusPerks` in the backend.

Platinum and Diamond sends have a base of **0**, so there is no separate "may send this tier" flag: a positive bonus is what opens the tier, and `0 + 0` is the refusal.

#### Stacking & self-discount rules

- **Higher-tier wins.** If both LP and VIP are active, every percent-based perk uses the VIP value. The two values are never summed.
- **No self-discount.** When buying / upgrading the **VIP** status, the VIP market discount is excluded. When buying the **Lucky Player** status, the LP market discount is excluded.
- **Avatar boosts** still stack additively on top of the chosen status (DOCS §6 / market avatars).
- **The discount is stated, not just applied.** The Market header names the player's own rate ("−2% · VIP 2 · already in every price"), the item sheet and the purchase confirmation print what it takes off **in coins** rather than in percent, and the Statuses section carries the 30-day total the status has saved. A player without a status sees what one would give instead. The monthly total is summed from the ledger's `discountSaved`, written at charge time, so it counts what was actually charged — it starts at zero for everyone (it counts from the 09.08.2026 backend release) and is never back-estimated from today's rate, which would be most wrong for the players who bought the most.

Benefit magnitudes stay bounded so they cannot break economy balance: combined boosts from all sources stay within ~×2 effective output, and discounts stay within ~30%.

### 7.4 VIP Status — Levels & Acquisition

VIP is a permanent, leveled status. Once unlocked it never decreases or expires. VIP has a **maximum level of 20** (`maxVipLevel`).

#### Payment Options

VIP can be purchased and upgraded with either **Lucky Coins (LC)** or **Lucky Stars (LS)** — both currencies are accepted for the initial unlock and for every level upgrade.

#### Pricing Model

VIP pricing is **per level and admin-tunable** (Admin → Настройки → Статусы). Each level 1…`maxLevel` has its own LC + LS price: **level 1 is the first unlock**, and **levels 2+ are the cost to upgrade to that level**. Both the price ceiling (`maxLevel`) and every per-level price are knobs.

**LC price = LS price × 10,000 at every level.** The ratio is uniform across the whole ladder, so neither currency is the cheap path _relative to another level_ — but it is **half** the $-parity rate Lucky Player is priced at (`lcUsdRate` 0.000001 × 20,000 = `lsUsdRate` 0.02 would give ×20,000). In other words the coin price of VIP is deliberately half of dollar parity: grinding to VIP is cheaper than paying for it. Any edit to one side must move the other.

#### The ladder (live values)

`Ads/day` and `Send B/S/G/P/D` are the **effective** numbers a VIP of that level is held to. In the admin panel the same rows are typed as bonuses over the free base — level 1's `11` ads is entered as `+1` against a base of 10, and its `3/2/1/0/0` sends as `+2/+1/0/0/0` against `1/1/1/0/0` (§7.3).

Tournament reward, tournament join AP and the stake-fee discount are `0` on every level and are omitted from the table rather than printed as twenty dashes.

|  Lv | Price          | Engine | Stake | Market | Ads/day | Send B/S/G/P/D | Claim all |
| --: | :------------- | -----: | ----: | -----: | ------: | :------------- | :-------- |
|   1 | 100 ⭐ / 1.00M |    +1% | +0.1% |    −1% |      11 | 3/2/1/0/0      | —         |
|   2 | 110 ⭐ / 1.10M |  +1.9% | +0.3% |  −1.4% |      12 | 4/3/1/0/0      | —         |
|   3 | 115 ⭐ / 1.15M |  +2.7% | +0.6% |  −1.8% |      13 | 5/4/2/0/0      | —         |
|   4 | 125 ⭐ / 1.25M |  +3.6% | +0.8% |  −2.2% |      14 | 6/4/3/0/0      | —         |
|   5 | 135 ⭐ / 1.35M |  +4.5% |   +1% |  −2.6% |      15 | 6/5/4/1/0      | —         |
|   6 | 140 ⭐ / 1.40M |  +5.4% | +1.2% |    −3% |      15 | 7/6/4/2/0      | —         |
|   7 | 150 ⭐ / 1.50M |  +6.2% | +1.5% |  −3.4% |      16 | 8/7/5/3/1      | —         |
|   8 | 160 ⭐ / 1.60M |  +7.1% | +1.7% |  −3.8% |      17 | 9/7/6/3/2      | —         |
|   9 | 165 ⭐ / 1.65M |    +8% | +1.9% |  −4.2% |      18 | 10/8/7/4/3     | —         |
|  10 | 175 ⭐ / 1.75M |  +8.8% | +2.2% |  −4.7% |      19 | 11/9/7/5/3     | —         |
|  11 | 185 ⭐ / 1.85M |  +9.7% | +2.4% |  −5.1% |      20 | 11/10/8/6/4    | —         |
|  12 | 190 ⭐ / 1.90M | +10.6% | +2.6% |  −5.5% |      21 | 12/11/9/7/5    | —         |
|  13 | 200 ⭐ / 2.00M | +11.5% | +2.8% |  −5.9% |      22 | 13/11/10/7/6   | —         |
|  14 | 210 ⭐ / 2.10M | +12.3% | +3.1% |  −6.3% |      23 | 14/12/10/8/6   | —         |
|  15 | 215 ⭐ / 2.15M | +13.2% | +3.3% |  −6.7% |      23 | 15/13/11/9/7   | **yes**   |
|  16 | 225 ⭐ / 2.25M | +14.1% | +3.5% |  −7.1% |      24 | 16/14/12/10/8  | yes       |
|  17 | 235 ⭐ / 2.35M |   +15% | +3.7% |  −7.5% |      25 | 16/14/13/10/9  | yes       |
|  18 | 240 ⭐ / 2.40M | +15.8% |   +4% |  −7.9% |      26 | 17/15/13/11/9  | yes       |
|  19 | 250 ⭐ / 2.50M | +16.7% | +4.2% |  −8.3% |      27 | 18/16/14/12/10 | yes       |
|  20 | 300 ⭐ / 3.00M |   +20% |   +5% |   −10% |      30 | 21/19/17/14/12 | yes       |

**Reading the ladder.** Level 1 is a small perk behind a small unlock (100 ⭐) — it buys _permanence and a seat on the ladder_, not power, and it is the cheapest step on the whole climb. From there price and perks rise together in near-linear steps to Level 19, and **Level 20 stands 20% above Level 19 on every single column** — perks and price alike (2.50M → 3.00M, 250 ⭐ → 300 ⭐). That last rung is the one deliberate discontinuity in the table: the top level is meant to read as an achievement, not as "one more step". The whole climb from nothing to Level 20 is **3,625 ⭐ (≈ $73) or 36,250,000 LC**, and reaching Level 10 is 1,375 ⭐. Every column is monotone — **no level ever takes a perk away from the level below it**, which is also the rule any future admin edit has to preserve.

**Where it crosses Lucky Player.** For nineteen levels VIP is genuinely weaker than a 50 ⭐/week LP subscription, and that is the intent: LP is rented power, VIP is owned power. VIP only overtakes LP at the very top — engine speed passes it at **Level 12**, ads at **Level 11**, ticket sends much earlier (**Level 3**), while stake yield and market discount merely _draw level_ at **Level 20** and never exceed it. "Claim all" transfers to VIP at **Level 15**. The **stake-fee volume discount never enters the comparison**: it is `0` for both statuses, so every player stakes on the same 10/12/15/20% ladder.

That ordering matters more than it looks, because of "higher tier wins" (§7.3): a VIP+LP holder resolves to the **VIP** row, so subscribing to LP while holding a low VIP level makes almost every number _worse_ than the subscription alone. It is a known, accepted consequence of the rule; it is also the strongest reason not to stall a player in the middle of the ladder.

> The catalog carries the full ladder in `attrs.levelPrices`; the Mini App shows the price to reach the player's next level (both the market card and `/settings/vip`). The backend charges the exact per-level price server-side (`market.buyStatus`). The code defaults in `STATUS_CONFIG_DEFAULTS` remain the older flat unlock + flat upgrade model — a fresh environment boots flat, production runs the ladder above from `PlatformConfig.statusConfig`.

#### Rules

- The first purchase (unlock, 100 ⭐) is the **cheapest** step on the ladder; every upgrade above it costs more. The old model had it the other way round — a large unlock and then cheap upgrades.
- VIP level is permanent: it cannot decrease, expire, or be lost through inactivity.
- Perks are **cumulative by level, never stacking with Lucky Player** — a VIP always resolves to their own row.
- The ads cap must never drop below the free `watchVideoDailyLimit` (10): a VIP row of 4 would hand a paying player _fewer_ rewarded views than a free one. Level 1 starts at 11 for exactly this reason.
- **Level 20 is 20% above Level 19 on every column, price included.** That ratio is the top of the ladder's defining rule; a future edit that rebalances the middle has to re-derive Level 19 as `Level 20 ÷ 1.2` or restate the rule.

#### VIP Benefits

The perk ceiling and the LP comparison live in **Section 7.3 — Status Benefits → VIP perks table**; the per-level numbers are the ladder above. Stacking and self-discount rules from §7.3 apply.

### Connections

Statuses influence market prices, claim efficiency, tournaments, and social visibility. They are bought with LC or LS and are not gated by AP.

---

## 8. Ticket System

### Purpose

Tickets are the core progression and participation resource in LuckyTicket365. All available tickets can be viewed on the dedicated **Tickets page**.

### 8.1 Tickets Page

The Tickets page is structured as a tier-tabs view:

- **Summary row (top):** A 5-tile grid (Bronze · Silver · Gold · Platinum · Diamond) showing the user's current inventory count for each tier. Tapping a tile switches the active tier tab.
- **Tab strip:** Six pill-style chips — five tier tabs (Bronze → Diamond) plus a **Partners** tab. Locked tiers render with a lock icon. The active tab carries a tier-color dot/icon plus a `×N` ready-to-claim badge in white.
- **Tab content per tier:**
  - **Unlocked tier:** A summary card (`X tickets in inventory · Y engines active`), a `{count} tickets ready · Claim all` callout (when any engine has pending output **and** the player's effective status grants the **bulk-claim** perk — `statusPerks.bulkClaimEnabled`, an **admin-tunable capability** that is **Lucky Player-only in the code defaults** (VIP off) and in production is granted to **VIP from Level 15 up** (§7.4), toggled per status in Admin → Настройки → Статусы; enforced server-side on `engines/claim-all`. Otherwise each engine is claimed individually; see Section 7), and a 2-column grid of engine preview cards. Each card opens that engine's dedicated page.
  - **Locked tier:** A locked-state hero plus the requirements list (Section 8.5).
- **Partners tab:** Reserved for partner-ticket integrations — currently shows a "Coming soon" placeholder.

Tapping a single engine's claim pill triggers an in-place claim (no navigation) and surfaces a confetti-style "Added to inventory" modal showing the claimed amount and tier. The general card area still navigates to that engine's details page.

### 8.2 Engine Details Page

Each engine has its own dedicated page (`/engines/[id]`). The page mirrors the four faces of the home-screen engine cube as stacked sections, with each face wrapped in a neutral card with a tier-accent bottom shine line that pulses from center to edges:

- **Front face — Reactor & claim:** Reactor dial with status (producing / output ready), cycle/capacity readout, claim CTA, and instant-claim (Stars).
- **Top face — Engine passport:** Sci-fi HUD with lifetime tickets produced, tickets per hour, per-day projection, owner, and creation date.
- **Bottom face — Slots:** 2 chip slots (speed / capacity) and 2 booster slots (speed / capacity). Tap to install/remove.
- **Back face — Badges:** Earned achievement badges (Spark, Quick, Bulk, Veteran).
- **Upgrades:** Speed and capacity upgrade rows (priced in Lucky Stars).

### 8.3 Ticket Categories

- **Project Tickets:** Bronze, Silver, Gold, Platinum, Diamond.
- **Partner Tickets:** Required to participate in tournaments from partners (e.g., A-partner tournament can only be joined via having an A-ticket).

### 8.4 Ticket Rarities

- Bronze (the Bronze producer engine is gifted to every user on first app launch — see Section 9)
- Silver
- Gold
- Diamond
- Platinum

### 8.5 Engine Unlocking — AP Tier Gate

At first, only the Bronze engine is available (gifted on first launch). Higher-tier **producer engines** are gated by the **AP tier** (Section 5.2): an engine of tier `T` can be acquired and used only when the user's `AP-tier ≥ T`.

This replaces the former per-engine requirement checklist. The AP system already aggregates every engagement action (inviting friends, playing tournaments, daily activity, completing tasks) into a single number — so the AP-tier gate **is** that checklist, unified into one metric.

- Reaching Silver AP unlocks Silver engines, Gold AP unlocks Gold engines, and so on.
- Once a tier is unlocked, the user may acquire as many engines of that tier as desired (see Section 9).
- If AP decays below a tier threshold, engines of that tier **freeze** (no production, no claim) until AP recovers — they are not lost (see Section 5.5).

### Connections

Tickets connect the Tickets page, claiming, tournaments, tasks, boosts, and market systems.

---

## 9. Ticket Producer Engines

### Purpose

Ticket production in LuckyTicket365 is driven by **producer engines**. Every ticket the user accumulates is generated by an engine they own. Engines replace the previous direct-claim model: users no longer "mine" tickets generically — they own one or more engines, each of which produces a specific ticket type on its own cycle.

### 9.1 What an Engine Is

An engine is a permanent, ownable producer that:

- Produces **one specific ticket type** (Bronze, Silver, Gold, Platinum, Diamond, or partner-specific).
- Runs on a **production cycle** — a fixed time interval after which it outputs tickets.
- Has a **per-cycle output** — the number of tickets generated each cycle (default: 1, increasable via a Capacity Upgrade purchased in Lucky Stars).
- Accumulates produced tickets into a pending pool until the user claims them.

Engine ownership is permanent. Engines do not expire, decay, or get lost through inactivity.

### 9.2 Initial Engine (First-Launch Gift)

Every new user receives **one Bronze producer engine** for free — part of a **welcome pack** granted during onboarding, not at account creation. Right after the first-run **language selection** step a gifts screen presents the pack — **1 Bronze engine, 5 Bronze tickets, and 1 activity point** (see Section 17.5) — and the player taps **Claim** to receive it. A brand-new account owns **no engine and no tickets** until then. Once granted, the engine starts producing immediately (it arrives with one ready ticket so the guided tour's claim finale works), allowing every user to begin progressing without any purchase, unlock, or external action. (The ticket/AP amounts live in `appConfig.onboardingTour.welcomePack`.)

### 9.3 Acquiring Additional Engines

Beyond the initial gift, users obtain engines through:

- **Tier unlock:** Higher-tier engines (Silver, Gold, Platinum, Diamond) become available once the user satisfies the requirements in Section 8.5.
- **Market purchase:** Once a tier is unlocked, the user can buy as many engines of that tier as desired with **Lucky Coins (LC)**.
- **Rewards:** Engines may be granted as task rewards, tournament prizes, or stake bonuses.

### 9.4 Multiple Engines per Tier (Parallel Production)

Users may own and run an **unlimited number of engines of any tier in parallel**. All owned engines run independently and accumulate output simultaneously.

**Example:** A user with 3 Bronze engines and 1 Silver engine running concurrently produces 3 Bronze tickets per Bronze cycle and 1 Silver ticket per Silver cycle — all in parallel.

### 9.5 Production & Claim Flow

1. The engine runs through one production cycle and outputs its per-cycle ticket(s) into a pending pool tied to that ticket type.
2. **The engine pauses after each cycle until its pending output is claimed.** The next cycle does not begin until the user claims what the engine has already produced.
3. The user actively **claims** pending tickets to move them into their inventory, where they can be used for tournaments, sent to friends, or held as needed.
4. Once claimed, the engine immediately begins its next production cycle.
5. Claiming is performed from the Tickets page or Ticket Details page (see Sections 8.1–8.2).

This claim-gates-production rule applies per engine: each engine independently waits for its own output to be claimed before starting the next cycle. With multiple engines of the same tier, each engine's pending output must be claimed for that specific engine to resume — though the user claims the combined pool in a single action from the UI.

### 9.6 Instant Claim (Lucky Stars)

Users may pay **Lucky Stars (LS)** to receive an engine's next ticket immediately, skipping the remaining wait time of the current production cycle. After an instant claim, the engine begins its next cycle just as it would after a normal claim.

- **Acquisition:** Available on any engine that is currently mid-cycle — from the Home engine slider, the Tickets page and the Engine Details page. It is **one tap**: the payment, the collection and the next cycle's start happen in a single action, with a confirm step showing the Star price.
- **Counts as a claim:** the tickets land in the tier balance and advance the ticket-collection tasks exactly like a free claim does. Like a free claim, it awards **no AP** (Section 5.3).
- **Cost formula:** **1 Lucky Star per remaining hour of the cycle, minimum 1 Star** — `cost = max(1, ceil(remainingSeconds / 3600))`. So skipping a 30-min remainder costs 1 ★, a 90-min remainder costs 2 ★, a 4h05m remainder costs 5 ★. The cost is recomputed live as the cycle elapses, getting cheaper the closer the engine is to finishing on its own.
- **Scope:** Targets a specific engine — only that engine's current cycle is fulfilled instantly; other owned engines continue their normal cycles.
- **Stacking:** Can be combined with active Speed Boosts and Capacity Upgrades — instant claim delivers the full per-cycle output (e.g., 2 tickets if a 2× Capacity Upgrade is active).

### 9.7 Engine Parameters

Each engine has two tunable parameters:

| Parameter            | Meaning                                                           | Modified By                                                                                                                  |
| :------------------- | :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- |
| **Production Speed** | Time per production cycle (e.g., 1 ticket every 2 hours).         | Engine Speed Boost (Section 10.1) **+** Speed Chip (Section 10.4)                                                            |
| **Per-Cycle Output** | Number of tickets generated per cycle (base 1 at engine level 1). | Engine level / promotion (Section 10.2) **+** Capacity Upgrade (Section 10.2, paid in LS) **+** Capacity Chip (Section 10.4) |

**Base production ladder per tier** (knobs — cycle time doubles each tier, base output is 1 ticket/cycle for all tiers):

| Tier     | Cycle time | Base output    |
| :------- | :--------- | :------------- |
| Bronze   | 2 h        | 1 ticket/cycle |
| Silver   | 4 h        | 1 ticket/cycle |
| Gold     | 8 h        | 1 ticket/cycle |
| Platinum | 16 h       | 1 ticket/cycle |
| Diamond  | 32 h       | 1 ticket/cycle |

Because production is claim-gated (Section 9.5), the effective output also depends on how often the player claims.

In addition to the two parameters above, every engine exposes **two chip slots** (one Speed, one Capacity) into which tournament-won chips may be equipped. See Section 10.4 for the full chip mechanic.

#### Boost-stacking model (Lords-Mobile-style additive)

All speed boosts stack **additively**, then are applied as a single divisor to the base cycle. The same model applies to capacity.

```
totalBoostPct = engineLevelBoostPct + speedLevelBoostPct + statusEngineSpeedBoostPct
              + avatarEngineSpeedBoostPct + speedChip.effectPct + speedBooster.effectPct
rawCycle      = engine.cycleSeconds / (1 + totalBoostPct / 100)
floor         = capacity × engineMinSecondsPerTicket
finalCycle    = max(rawCycle, floor)
```

Where:

- **What each level gives is now defined by explicit lookup tables**, not a fixed per-level scalar — and the tables are **admin-tunable live** (Admin → Настройки → Двигатели → «Очки развития» / «Уровень куба», stored as `engines.levelTables` in the platform config). The backend computes every claim/upgrade from the config tables; the Mini App reads the same tables via `GET /config` (hook `useEngineConfig`), so admin edits reach both sides without a redeploy. Adding/removing a table cell literally adds/removes a level (ceilings derive from array length). The code defaults live in `ticket-engine.utils.ts` (FE) and `economy.constants.ts` (BE); a malformed override falls back to them. The four tables and their **default** values:
  - Each **engine level** contributes a per-level speed **%** (`ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE`, default `0 / 100 / 200 / 300 / 400` → `+100%` per level above 1) **and** an **absolute base per-cycle output** (`ENGINE_LEVEL_BASE_CAPACITY_TABLE`, default `1 → 22 → 43 → 64 → 86`). The top cell is a **design anchor**: a FULL-maxed engine (level 5, both ladders 10/10 → batch 86 + 10 = 96) floors at exactly `96 × 900 s = 24 h` — one big batch per day. Engine level is reached by **promotion** — see Section 10.2.
  - Each **speed-level upgrade** contributes `SPEED_LEVEL_BOOST_PCT_TABLE[level]` (default `+10%`/level, `0…100%`). `MAX_BOOST_LEVEL` (= table length − 1, default 10) is the max, so at the default curve a fully speed-upgraded engine runs its cycle **twice as fast**.
  - Each **capacity-level upgrade** adds an **absolute per-cycle ticket bonus** — `CAPACITY_LEVEL_BONUS_TICKETS_TABLE[level]`, default **+1 ticket per paid tap** (`0…10`). The bonus is the same +1 at every engine level: `perCycle = (base + bonus) × (1 + chips%)`, so a maxed level-1 engine mints **11 per cycle** (1 + 10) and a maxed level-2 mints **21** (11 + 10). Chips/boosters stay percentage-based and scale the whole batch.
- **Status boost** uses VIP value if active, otherwise LP, otherwise 0 (DOCS §7.3).
- **Equipped-avatar boost** contributes the currently-equipped avatar's `engineSpeed` boost `pct` (0 if the equipped avatar has no speed boost). Like the status boost it is permanent-while-equipped, so it applies to the real production cycle, not just the UI (§14 cosmetics). _(**Pinned to 0 in the Mini App since 2026-08-09** — Section 16.1. The backend still applies it, so an owner's engine mints on the boosted cycle while the app counts the base one.)_

**Hard speed floor.** No matter how many boosts stack, one ticket can never be minted faster than `GlobalConstants.engineMinSecondsPerTicket = 900s` (15 minutes per ticket). `effectiveCycleSeconds()` clamps the result against `capacity × 900s`. Because a promoted engine's base capacity is larger, that per-cycle floor rises with it — so promotion is felt as a **bigger batch per cycle at the 900s/ticket floor**, not a proportionally shorter cycle (e.g. a level-2 Bronze engine mints its 11-ticket batch in `11 × 900s`, i.e. 900s per ticket, rather than halving the 2 h cycle).

### 9.8 Productivity Metric

Each engine has a derived stat — **Productivity (tickets/hour)** — visible in the engine UI. It is the **live** rate: what the engine is minting right now, with every boost that is currently running, **including** a time-limited Engine Booster (Section 10.6).

Formula:

```
productivity = (3600 / effectiveCycleSeconds) × capacity
```

Where both terms are exactly the ones the engine runs on: `effectiveCycleSeconds` (§9.7 — the full additive speed stack plus the 900 s/ticket floor) and `capacity` (§9.7 — base batch, capacity sub-level bonus, capacity chip and booster).

_(Until 2026-08-09 this metric deliberately EXCLUDED time-limited boosters, to show "the long-term baseline". The number that produced disagreed with the countdown and the ×N on the same screen — an engine with a running booster minted faster than its own stat promised — so the definition was unified on the live rate. What a booster contributes is not hidden: it is a named row in the speed breakdown on both the engine screen and the cube's stats face, marked as time-limited.)_

### 9.9 Engine UI — Rotating Cube

On the home screen, each owned engine is rendered as a **3D rotating cube** the user can swipe vertically (front → bottom → back → top → front). Four of the six faces carry distinct content:

| Face       | Content                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Front**  | Live engine card — Reactor dial, tier-coloured Claim button, Speed/Capacity boost rows, cycle stats.                                                                                                                                                                                                                                        |
| **Bottom** | **Equipment grid** — 2 Chip slots (Speed / Capacity, see 10.4) on top, 2 Booster slots (10.6) below. Tapping a filled slot opens its picker; an active chip slot also shows an **X** unequip control (cost rules in 10.4).                                                                                                                  |
| **Back**   | **Reactor panel** — the whole calculation as two dials. The ⚡ ring is the speed stack: a grey arc for the factory ×1 plus one coloured arc per boost (engine level, speed upgrades, status, chip, booster, badge), with the resulting **cycle** in its centre and the total `+N%` under it. The 📦 ring is the capacity ladder (factory batch → engine level → capacity upgrades → chip/booster %), with the **batch ×N** in its centre and its build-up under it. Below both: a colour-matched legend of every contributing term, and a footer line with the arithmetic (`base cycle ÷ multiplier = raw cycle`) and the live rate (`T/H · per day`), or the **at speed cap** marker when the 900 s/ticket floor is what decides the cycle. Uses the LM-additive model from §9.7. |
| **Top**    | **Engine Passport** — header with engine level pill, lifetime tickets (huge number), Productivity (Section 9.8), and footer with Owner + Created date.                                                                                                                                                                                      |

The two unused faces (left / right) are reserved for future content. The cube also carries a glowing core in the center, visible through the inner edges, that uses the engine's tier color.

### Connections

Engines connect to: ticket inventory, the Market (engine purchase), Section 8.5 (engine unlocks), Section 10 (boosts and capacity upgrades), tasks and tournaments (consumption of generated tickets), the Wallet (LC for purchases, Stars for capacity upgrades), and the Status system (status-granted speed boosts).

---

## 10. Engine Boosts & Upgrades

### Purpose

Boosts and upgrades let users increase the output of engines they already own without acquiring new ones.

### 10.1 Engine Speed Boost

A Speed Boost reduces an engine's production cycle time, increasing how often it produces tickets. Per-cycle output is unchanged.

**Example:** A Bronze engine that normally produces 1 ticket every 2 hours, with a 2× speed boost active, produces 1 ticket every 1 hour — doubling the production rate.

- **Acquisition:** The engine's permanent **speed level** (0–10, paid in **LS** per level — §10.2) or a **status** privilege (§7.3). _(A standalone Market-purchased LC Speed Boost previously existed but was **retired** — engine speed now lives on the engine's speed level, not a separate market item.)_
- **Scope:** Applied to a specific engine the user owns.
- **Stacking:** Speed sources stack **additively** into one divisor on the base cycle (§9.7 / §10.3), down to the 900 s per-ticket floor.

### 10.2 Capacity Upgrade (Lucky Stars)

A Capacity Upgrade increases an engine's **per-cycle output** — instead of producing 1 ticket per cycle, the engine produces 2 (or more) tickets per cycle. Cycle time is unchanged.

**Example:** A Bronze engine that normally produces 1 ticket every 2 hours, after 3 capacity taps produces 4 tickets per cycle (1 + 3) — a bigger batch without changing the cycle (until the 900 s/ticket floor stretches it — §9.7).

- **Acquisition:** Purchased exclusively with **Lucky Stars (LS)** on the engine itself (the engine cube / engine details screen — §10.2). It is not a Market catalog item.
- **Scope:** Applied to a specific engine the user owns.
- **Tiers:** Higher-tier capacity upgrades may yield 3 or more tickets per cycle (defined by product team).
- **Duration:** Defined by product team (permanent or time-limited per upgrade tier).

**Permanent level upgrades — effect & LS cost curves** (price knobs **admin-tunable** in Admin → Настройки → Двигатели, stored as `engines.upgrade`; the server charges from the config and the Mini App shows the same config prices via `GET /config` — code defaults in `appConfig.economy.engineUpgrades`, helpers in `economy.utils.ts`): each engine carries a permanent **speed level** and **capacity level**, both `0…MAX_BOOST_LEVEL` (default 10), both paid in LS per level. Every **speed** level adds the per-level **%** from its boost table (§9.7, default **+10%** — maxed = the cycle runs 2× as fast); every **capacity** level adds the **absolute ticket bonus** from its table (§9.7, default **+1 ticket per tap** — maxed = base + 10 per cycle, e.g. 11 at engine level 1). Level costs grow with **both** the sub-level **and** the engine level — each engine level adds +1 LS to every price: speed `level + engineLevel` LS, capacity `level + engineLevel + 1` LS (level = current sub-level 0–9 before the upgrade). The whole price then **scales by tier** (`tierCostMultiplier`): **every tier is double the previous** — Bronze ×1, Silver ×2, Gold ×4, Platinum ×8, Diamond ×16. So a **Bronze** level-1 engine pays speed **1…10** / capacity **2…11** across its ladder; a level-5 engine pays speed **5…14** / capacity **6…15**. Fully maxing one **Bronze** engine across all 5 levels (100 upgrades) totals **800 LS**; the same on higher tiers costs that × their multiplier — **Silver 1,600 / Gold 3,200 / Platinum 6,400 / Diamond 12,800 LS**.

**Engine promotion (level-up).** Speed level and capacity level each cap at 10. When **both** reach 10, the next paid upgrade **promotes** the engine to the next **engine level** and resets both sub-levels back to 0 — a fresh `0–10 / 0–10` ladder on a stronger base (`promoteEngineIfMaxed`, `ticket-engine.utils.ts`). Each engine level permanently:

- adds its table's speed **%** to the stack (§9.7, `ENGINE_LEVEL_SPEED_BOOST_PCT_TABLE`, default **+100%**/level), and
- sets **base per-cycle output** to the table value (`ENGINE_LEVEL_BASE_CAPACITY_TABLE`, default `1 → 22 → 43 → 64 → 86`).

Because the per-ticket time is already at the 900 s hard floor (§9.7), the net effect of a promotion is felt as a **much bigger batch on a longer cycle** (base 1 → 22 → 43 → 64 → 86; maxed cycles stretch 2.75 h → 8 h → 13.25 h → 18.5 h → **24 h at full max**) rather than faster output — the floor caps throughput at 4 tickets/hour throughout, so maturing an engine converges on a **once-a-day collect** of a 96-ticket batch. Reaching the next engine level costs a **full 10 speed + 10 capacity = 20 Lucky-Star upgrades**, making promotion a real-money **LS sink**, not a free multiplier (see the economic framing in §14.2).

**Engine-level cap.** The engine level itself is capped at **5 by default** (`MAX_ENGINE_LEVEL` = engine-level table length − 1; an admin adding cells to the engine-level tables raises the cap live). The backend enforces the cap server-side in its upgrade path from the same config tables. At the cap the 10/10 sub-level state is **terminal** — the ladders stay full and no further promotion occurs. `tests/engine-table-parity.test.ts` diffs the four **default** tables between the two repos, so a one-sided default edit fails CI instead of silently drifting.

### 10.3 Stacking Speed and Capacity

Speed Boosts and Capacity Upgrades target independent engine parameters and may be applied simultaneously. Their effects multiply.

**Example:** A Bronze engine with both a 2× Speed Boost and a 2× Capacity Upgrade produces **2 tickets every 1 hour — 4× the base rate**.

### 10.4 Chip Boosts (Tournament Rewards)

In addition to the per-engine-level Speed (10.1) and Capacity (10.2) upgrades, engines support a third boost layer: **Chip Boosts**. Chips are big inventory items earned exclusively from tournaments (Section 11) and equipped onto engines through dedicated chip slots. Chips are assembled from **shards** — small fragments dropped by tournaments — that the user collects and spends to grow each chip's level.

#### Chip Types

There are exactly **two types of chip boosts**, each modifying one engine parameter:

| Chip Type         | Affects                 | Effect Direction             |
| :---------------- | :---------------------- | :--------------------------- |
| **Speed Chip**    | Production cycle time   | Reduces cycle time per level |
| **Capacity Chip** | Per-cycle ticket output | Increases per-cycle output   |

#### Chip Levels & Effect

Each chip is a leveled item with effect that grows linearly with level:

- **Effect per level:** **+0.5%** of the chip's parameter (cumulative).
- **Maximum effect:** **+100%** of the parameter, reached at the final level (`100% / 0.5% = 200` total levels).
- **Level 1 is granted by minting** — the user spends the tier's shard price in the inventory's Mint modal and the chip enters the inventory at Level 1 with +0.5% effect.

#### Multiple Chips per Type & Quality

A user is **not limited to one chip per type or one chip per quality**. Each chip is an independent inventory item — over time a user accumulates many chips, especially of the lower tiers (Bronze chips are the most common because Bronze tournaments are the most frequent). Each chip carries its own level, its own shard progress toward the next level, and its own equipped/unequipped state. The user chooses which chip to equip into the engine's two slots (one Speed slot, one Capacity slot — see 9.7).

A typical user might end up holding, for example, eight Bronze Speed Chips at various levels, three Silver Speed Chips, and one Diamond Speed Chip — all coexisting in the inventory and ready to be slotted onto different engines.

#### Minting Chips — Flat Shard Price per Tier

Every chip is minted through the inventory's **Mint modal** for a flat, tier-specific shard price — no free mints, no auxiliary crafting items. The price falls with tier because lower-tier tournaments run (and drop shards) far more often:

| Chip tier | Shards to mint (`CHIP_MINT_SHARD_COST`) |
| :-------- | :-------------------------------------- |
| Bronze    | **10**                                  |
| Silver    | **8**                                   |
| Gold      | **6**                                   |
| Platinum  | **4**                                   |
| Diamond   | **2**                                   |

The price applies to every mint equally — the first Bronze Speed Chip and the fifth cost the same 10 Bronze Speed shards. A freshly minted chip always starts at **Lvl 1** (+0.5%). This flat pricing (mirrored by the backend and the frontend constant `CHIP_MINT_SHARD_COST`) is the only mint cost; the previously documented **Chip Builder** item is removed from the design.

**Dead-end redirects.** The UI never leaves the user stranded on an empty chip flow: when an engine's chip-slot picker has no eligible chips, it shows the matching shard balance vs. the mint price and a CTA — to the **Inventory** mint modal if the user already holds enough matching shards, otherwise straight to the **Market's Shards tab**. Likewise, the Mint modal itself swaps its Mint button for a **Buy shards** shortcut (→ Market Shards tab) whenever the selected type/tier combination lacks shards.

#### Chip Shards — How Levels Are Earned

Chips are not handed out at a finished level. Instead, each tournament awards **chip shards** — fragments that the user accumulates and spends either on minting new chips (table above) or on levelling up existing ones.

- Shards may be spent to upgrade an existing chip one level at a time, or — at the user's discretion — saved up to mint a brand-new chip at Lvl 1 (so the user can deliberately choose to grow many small chips or one big chip).
- The **shard cost per level rises with the target level** — higher levels demand more shards. The progression is non-linear:

| Target level | Shards required for THIS upgrade |
| :----------- | :------------------------------- |
| Lvl 2        | 1                                |
| Lvl 3        | 3                                |
| Lvl 4 …      | grows further (TBD by product)   |

> The shard-cost curve beyond Lvl 3 is defined by the product team. The intent is to make later levels increasingly costly so that reaching +100% is a long-term aspirational goal.

#### Shard Quality (Tournament Tier)

Shards are tagged with a **quality tier** matching the tournament they were won in:

- **Bronze shards** — from Bronze tournaments
- **Silver shards** — from Silver tournaments
- **Gold shards** — from Gold tournaments
- **Platinum shards** — from Platinum tournaments
- **Diamond shards** — from Diamond tournaments

Quality determines visual rarity and may also factor into upgrade rules (e.g., higher-quality shards counting more toward level-up cost). The exact rule is defined by the product team.

#### Acquisition — Tournaments Only

Chip shards (and therefore chips themselves) are obtainable **exclusively from tournaments** — they cannot be bought, traded, or earned from tasks/stakes. This makes them a pure competitive-progression reward.

The default placement-based shard distribution is:

| Placement | Shards awarded |
| :-------- | :------------- |
| 1st place | 3              |
| 2nd place | 2              |
| 3rd place | 1              |
| 4th+      | 0              |

Shard quality is fixed by the tournament's tier (see above). Admins can **override the top-3 shard counts per tournament** in the panel; a tournament with custom values awards those instead of the 3/2/1 default, and any field left blank falls back to the global default.

#### Type Rotation — One Chip Type per Tournament

Each tournament awards shards of **only one chip type** — either Speed **or** Capacity, never both in the same tournament. The two types **alternate**: consecutive tournaments cycle Speed → Capacity → Speed → Capacity… so users earn shards for both chips over time without any single tournament deciding both.

- The next tournament's awarded shard type is shown on the tournament card before it starts, so users can pick which one to compete in based on which chip they want to grow.
- The rotation runs independently per tournament tier (Bronze rotation, Silver rotation, etc.) and per tournament family (Project, Partner). Exact rotation schedule is defined by the product team.

#### Visual Tier Styling

Both shards and the resulting chips use the **tier color of their source tournament** for visual identity:

| Quality  | Visual accent (theme variable) |
| :------- | :----------------------------- |
| Bronze   | `--color-bronze`               |
| Silver   | `--color-silver`               |
| Gold     | `--color-gold`                 |
| Platinum | `--color-platinum`             |
| Diamond  | `--color-diamond`              |

In the inventory and on the engine cube's chip slots, each chip renders with its tier's gradient, border, and glow — keeping the rarity legible at a glance.

#### Equipping & Re-equipping

Each engine exposes **chip slots** — one slot per chip type (Speed and Capacity), so an engine can hold at most one Speed Chip and one Capacity Chip simultaneously.

- **Attach:** A user equips an owned chip from the **Boost Inventory** (Section 10.5) into the matching slot on a specific engine.
- **Tier rule:** A chip of quality X can be equipped on an engine whose tier is **X or lower** — chips work down the tier ladder, not up. Concretely:
  - Bronze chip → only on Bronze engines.
  - Silver chip → on Bronze or Silver engines.
  - Gold chip → on Bronze, Silver, or Gold engines.
  - Platinum chip → on Bronze, Silver, Gold, or Platinum engines.
  - Diamond chip → on any engine.
  - This makes higher-tier chips strictly more valuable (they cover lower tiers too) and prevents a fresh Bronze player from skipping straight to a Diamond engine boost.
- **Equip cost:** Equipping a chip costs **Lucky Stars equal to the chip's current level** — a Lvl 1 chip costs 1 Star, a Lvl 12 chip costs 12 Stars, a Lvl 200 chip costs 200 Stars. The cost is paid at the moment of equip.
- **Unequip cost:** Unequipping a chip costs **half of the equip price**, rounded up — `ceil(level / 2)` Stars. A Lvl 1 chip costs 1 Star to detach, a Lvl 12 chip costs 6, a Lvl 200 chip costs 100. This penalty discourages constantly shuffling chips between engines.
- **Re-attach (full cost):** Moving a chip from engine A to engine B costs `unequip + equip` — `ceil(level/2) + level` Stars in total. Re-attaching back later pays the cost again.
- **Tier rule still applies on re-attach:** the destination engine must still be at-or-below the chip's tier (see Tier rule above).
- **Duration:** Each chip has either a **permanent** lifetime or a **time-limited** lifetime, declared per chip variant (see Section 10.5). The chip's effect is active only while it is equipped, and additionally only while the chip is alive (for time-limited variants).

#### Stacking with Other Boosts

Chip effects stack multiplicatively with the Speed Boost (10.1) and Capacity Upgrade (10.2), the same way 10.3 already describes for those two systems. A fully-equipped engine therefore combines four independent multipliers: base parameters × Speed Boost × Capacity Upgrade × Speed Chip × Capacity Chip.

### 10.5 Boost Inventory

The **Boost Inventory** is the user's storage for every owned-but-not-yet-equipped boost item. Anything acquired through the Market, tournaments (chips), tasks, or stake bonuses lands in the inventory until the user equips it onto an engine.

#### What the Inventory Holds

The inventory is a unified view across all boost categories defined in this section:

- **Speed Boosts** (Section 10.1) — from the engine's speed level (LS) or status-granted.
- **Capacity Upgrades** (Section 10.2) — purchased with Lucky Stars on the engine itself, not in the Market.
- **Speed Chips** and **Capacity Chips** (Section 10.4) — built up from tournament-won shards.
- **Chip Shards** (Section 10.4) — uncommitted fragments waiting to be spent on a level-up.

Each inventory entry shows: type, current level (for chips) or remaining count (for shards) or magnitude (for Market boosts), and **lifetime state**.

#### Shards in the Inventory

Chip shards are not equipped on engines — they are spent. The inventory groups shards by chip type (Speed / Capacity) and by quality tier (Bronze, Silver, Gold, Platinum, Diamond). From the inventory the user:

- Sees how many shards of each type/quality they currently hold.
- Sees the next level-up cost for each chip (e.g., "Lvl 4 needs 5 shards").
- Triggers a level-up action that consumes the required shards and bumps the chip by one level. Level-ups are one at a time; the user explicitly chooses when to commit.

#### Lifetime: Permanent vs. Time-Limited

Every boost item carries one of two lifetime variants:

| Lifetime         | Behavior                                                                                                                                                                                           |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Permanent**    | The item never expires. As long as it is equipped on an engine, its effect is active indefinitely. Unequipping does not consume it.                                                                |
| **Time-Limited** | The item carries a duration (e.g., 24h, 7d). Its lifer counter ticks down only while the item is equipped on an engine. When it reaches zero, the item is consumed and removed from the inventory. |

The lifetime variant is declared per boost item at acquisition time and is visible in the inventory. Higher-tier or rarer items lean permanent; common rewards lean time-limited. Exact split is defined by the product team.

#### Equipping Flow

From the inventory, a user selects a boost item and chooses an owned engine to apply it to. The corresponding slot on that engine (Speed slot or Capacity slot — see Section 9.7) accepts the item.

- An engine slot accepts only items of the matching type.
- Equipping a new item into an occupied slot replaces the previous occupant, which returns to the inventory (still alive, with any remaining time-limited duration intact).
- Time-limited items pause their countdown when unequipped and resume only when equipped again — so the player can stockpile time-limited rewards and burn them strategically.

#### Where the User Sees It

The Boost Inventory is rendered as a dedicated screen reachable from the engine detail view (the engine's chip-slot face on the Engine Cube — see UI), and from the global navigation. From any equippable slot on an engine, tapping the empty slot ("+") opens the inventory filtered by matching type.

### 10.6 Engine Boosters (One-Shot Timed Buffs)

In contrast to the permanent **Chip Boosts** (Section 10.4) which sit in the chip slots and grant a continuous effect for as long as they are equipped, **Engine Boosters** are **one-shot, time-limited consumables** that the user activates on a specific engine. Once activated, the booster runs its duration, then disappears.

#### Booster Stats

A booster carries one of two stats — exactly the same axes as Chip Boosts:

| Stat         | What it does                             |
| :----------- | :--------------------------------------- |
| **Time**     | Reduces the engine's production cycle.   |
| **Capacity** | Increases the engine's per-cycle output. |

The exact effect magnitude per booster variant (e.g., "−25% time" or "+1 per cycle") is defined by the product team.

#### Booster Durations

Each booster is sold/awarded with a fixed lifetime. The standard duration ladder is:

| Duration     | Tier of impact           |
| :----------- | :----------------------- |
| **3 hours**  | Short burst — entry tier |
| **6 hours**  | Standard short session   |
| **12 hours** | Half-day buff            |
| **24 hours** | Full-day buff            |
| **48 hours** | Two-day buff — top tier  |

The countdown starts when the booster is activated on an engine and runs in real time regardless of whether the user is in-app. The booster cannot be paused, transferred, or detached once activated.

#### Booster Quality (Tier Lock)

Each booster is **quality-tagged** Bronze / Silver / Gold / Platinum / Diamond — and the quality is **strictly tier-locked to the engine it can be applied to**:

- A **Bronze** booster can ONLY be used on a **Bronze** engine.
- A **Silver** booster can ONLY be used on a **Silver** engine.
- … and so on for Gold, Platinum, Diamond.

A higher-quality booster cannot be downgraded onto a lower-tier engine, and a lower-quality booster cannot be upgraded onto a higher-tier engine. This keeps Bronze rewards meaningful for early-game players and prevents end-game whales from stockpiling cheap Bronze boosters and applying them to Diamond engines.

#### Acquisition

Boosters are obtainable through two independent channels:

- ~~**Market purchase**~~ — **retired.** The Market booster listing (`MarketItemCategory.BOOSTER`) was removed from the seed, the catalog response and the FE contract (§19.3); boosters are no longer sold anywhere. They remain an inventory item, earned only from the two channels below.
- **Tasks** — awarded as drops from completing daily / weekly / monthly tasks (Section 12). Higher-tier task chains drop higher-tier boosters.
- **Tournaments** — included in the prize pool of every tournament (Section 11) alongside LC, tickets, and chip shards. The tournament's tier dictates the booster's quality (Bronze tournament → Bronze booster).

Unlike chip shards (Section 10.4) which are tournaments-only, boosters are intentionally available through multiple channels — they are the everyday consumable layer of engine progression.

#### Activation Flow

From the Boost Inventory or directly from the engine view, the user picks a booster and selects an owned engine of the matching tier. The booster activates immediately, its countdown timer starts, and the engine's stat is multiplied by the booster's effect for the full duration. Multiple boosters of different stats may run on the same engine simultaneously (e.g., a Time booster and a Capacity booster both ticking).

#### Stacking

Booster effects stack on top of base parameters and any equipped Chip Boosts. The stacking rule mirrors Section 10.3 — independent multipliers compound multiplicatively. A fully buffed engine simultaneously combines: base × Speed Boost (legacy 10.1) × Capacity Upgrade (legacy 10.2) × Speed Chip × Capacity Chip × active Time Booster(s) × active Capacity Booster(s).

### Connections

Boosts and upgrades connect engines to the Lucky Stars system (speed/capacity level upgrades — Section 19), the Status system (boost privileges), the Tournament system (chip shards + boosters — Section 11), the Task system (booster drops — Section 12), the Boost Inventory (Section 10.5), and the LC and LS currency systems.

---

## 11. Tournament System

### Purpose

Tournaments introduce competition, excitement, and high-value rewards.

### 11.1 Tournament Categories

- Main Project Tournaments
- Partner Tournaments

Each tournament requires a specific ticket type.

### 11.2 Tournament Properties

Each tournament includes:

- **Name:** The title of the tournament.
- **Tier:** Bronze / Silver / Gold / Platinum / Diamond — drives the AP-tier entry gate and the reward magnitudes.
- **Required Ticket:** The specific ticket type needed to join (Project or Partner).
- **Prize Pool:** The LC distributed among winners, plus chip shards for the top 3. The pool is `prizePool = teamSize × prizeLcPerSeat`, where `prizeLcPerSeat` is a per-tier knob:

  | Tier     | LC per seat |
  | :------- | ----------: |
  | Bronze   |       4,000 |
  | Silver   |      10,000 |
  | Gold     |      25,000 |
  | Platinum |      60,000 |
  | Diamond  |     150,000 |

  At the $0.000001/LC anchor a full 500-seat instance is worth **$2 / $5 / $12.50 / $30 / $75** by tier — the per-seat knob is what caps the platform's real-money faucet.

- **Start Time:** The date and time when the tournament begins and winners are decided.
- **Team Size:** The total number of seats. `teamSizeCap` = 500 per instance; when more eligible players exist than the cap, additional parallel instances of the slot are spawned. For **admin-created project tournaments** the panel sets this seat count explicitly and it is enforced as a hard cap at join time — a full tournament rejects new entrants (already-joined players may still add tickets). Leaving the field blank creates an **unlimited (∞)** tournament with no seat cap.

  The **auto-spawned daily slots** (Section 11.2.1) are unlimited by default — `tournamentsConfig.spawnerTeamSize = null`, one seat cap shared by every tier the spawner fills. They are the only way into a tournament for most players, and the spawned pool is a fixed LC amount rather than `seats × prizeLcPerSeat`, so an extra entrant dilutes nobody's payout — the ladder just runs deeper (down to place 500, Section 11.3). A cap there could only turn a latecomer away. The admin panel can still set a number, which applies to slots spawned from then on; tournaments already created keep the seat count they were spawned with.

The prize pool is the platform's main LC faucet; it scales with the player base because more players spawn more tournament instances.

### 11.2.1 Tournament Naming Convention

Daily project tournaments follow the pattern **`<TimeOfDay> <Tier>`**, where `TimeOfDay` is one of:

- **Morning** — starts at 06:00
- **Afternoon** — starts at 12:00
- **Evening** — starts at 18:00
- **Night** — starts at 00:00

Examples: `Morning Bronze`, `Afternoon Silver`, `Evening Gold`, `Night Diamond`.

The exact start time is **not** part of the name — it's surfaced separately in the UI as a date pill (`DD/MM/YYYY · HH:mm`) and a live countdown chip on every tournament surface. This keeps names short and reusable across days while the time/date metadata stays explicit.

The time-of-day vocabulary belongs to **tournament names only**. The daily tournament **tasks** used to reuse it for their sub-steps ("Morning Bronze · 06:00" … "Night Bronze · 00:00"), and it was a lie: a sub-step is completed by "the day's join counter reached N", so nothing binds step #4 to the night bracket. Sub-steps are now numbered `n / total` (§12.2).

Tier coverage across the day is uneven by design — lower tiers run more often, higher tiers are scarcer and concentrate on premium time slots:

| Tier     | Intended slots                                  |
| -------- | ----------------------------------------------- |
| Bronze   | Morning · Afternoon · Evening · Night (any/all) |
| Silver   | Afternoon · Night                               |
| Gold     | Evening                                         |
| Platinum | Evening                                         |
| Diamond  | Night                                           |

**The spawner schedules every tier, and each tier is switched on separately.**
`tournamentsConfig.spawnerHoursByTier` holds a list of UTC hours **per tier**
(`{ BRONZE: [6, 12, 18, 0], SILVER: [], … }`) and `spawnerPrizePoolByTier` the LC
each spawned bracket of that tier mints. An **empty hour list means the tier does
not spawn at all** — which is how Silver…Diamond ship. Until 2026-08 the config
held a single `spawnerTier` plus one `spawnerHours` list, so the platform could
auto-run exactly ONE tier: Bronze. Everything above it existed only if an admin
hand-created a tournament, which in practice meant never — four of the five tiers
were dead, and with them the tier tasks that ask for them (§12.2). A stored config
in the old shape is read as "that one tier on those hours, every other tier off",
so the split changed no live schedule by itself.

Turning a tier on is a **money decision, not a config tidy-up**: every hour listed
against a tier mints that tier's whole pool once a day whether anyone enters or
not, and the pools scale steeply with tier (100 seats × the per-seat value —
400 000 LC at Bronze, 15 000 000 at Diamond). Attendance is what decides whether
that is a prize or an emission: at 1–4 entrants a slot the coins are minted
regardless. The admin panel refuses to save a tier that has hours but a pool of 0
— such a slot would run, draw, and pay its winners nothing after the player spent
a ticket to enter.

### 11.2.2 Tier Activation — Active-Player Gate

Beyond the per-user AP-tier gate, every tournament tier carries a **platform-wide activation threshold**: the tier only becomes playable once the number of **active players** on the platform crosses a hidden threshold. Reaching Silver AP-tier does **not**, by itself, let a user into Silver tournaments — the platform must also have grown large enough.

| Tier     | Active players required to open the tier |
| -------- | ---------------------------------------- |
| Bronze   | 0 — open from launch                     |
| Silver   | 10,000                                   |
| Gold     | 50,000                                   |
| Platinum | 200,000                                  |
| Diamond  | 1,000,000                                |

- The count is **active players only** — not total registered accounts.
- The threshold is **never surfaced in the UI** — there is no progress bar or "X players to unlock" hint. A tier that has not been activated simply shows no tournaments.
- In practice the gate is one-directional: once a tier opens it stays open as the player base keeps growing.
- Thresholds live in `tournamentTierActivePlayerThresholds` in `global.constants.ts`.

### 11.3 Participation & Winning Logic

- **Entry requires three conditions:** the correct ticket, `AP-tier ≥ tournament tier` (Section 5.2), **and** the tournament tier must be platform-activated (Section 11.2.2). A player can enter their own tier and every lower tier.
- Users join by submitting one or more tickets. Submitted tickets are **consumed**.
- Winners are selected randomly from the pool of participants at the designated Start Time.
- **Probability:** Joining with more tickets increases the chance of winning.
- **AP reward:** joining grants AP scaled by the tournament's tier — 1 AP at Bronze up to 5 AP at Diamond (`apRewards.tournamentJoinByTier`). Placement does not grant AP.
- **The AP is paid per tournament, not per join call.** A player may enter the same tournament repeatedly to add tickets, and every added ticket counts toward the draw — but only the **first** entry pays the AP and advances the tournament tasks. Without that rule the participation row (an upsert) let a ticket pile be traded straight for tier progression: 20 separate one-ticket entries into one tournament paid 20× the AP of a single 20-ticket entry, for the same draw weight. "First entry" is read off the upsert's own result inside the transaction rather than a prior lookup, so two simultaneous first joins cannot both collect.

**Prize distribution.** The prize pool is split across placements by a top-heavy percentage table:

| Placement | Share of pool          |
| :-------- | :--------------------- |
| 1st       | 12%                    |
| 2nd       | 8%                     |
| 3rd       | 5%                     |
| 4–5       | 4% each                |
| 6–10      | 2% each                |
| 11–25     | 1% each                |
| 26–50     | 0.4% each              |
| 51–100    | 0.2% each              |
| 101–500   | remainder, ~0.05% each |
| 501+      | 0                      |

> **Jackpot skim.** Before this distribution, **10% of every tournament's prize pool is diverted into the single global Jackpot pot** (Section 20). The percentage table above therefore distributes the remaining **90%**. The skim is EV-neutral — it is paid back when the jackpot drops — so it changes neither the long-run LC faucet nor the house edge.

**Economic role:** a tournament is a ticket **sink** and an LC **faucet** — tickets are consumed, LC is created and distributed. To prevent an infinite-money loop, the LC cost of buying a ticket in the Market exceeds the average LC a ticket returns in a tournament (see Section 14).

### 11.4 Chip Shards as Tournament Rewards

The top three placements in every tournament receive **chip shards** (see Section 10.4) as part of the prize pool. Shards are the only way to obtain or upgrade a Chip Boost — they cannot be bought, traded, or earned outside tournaments.

| Placement | Shards awarded |
| :-------- | :------------- |
| 1st place | 3              |
| 2nd place | 2              |
| 3rd place | 1              |

The 3/2/1 counts are the platform default; an admin may set custom top-3 shard rewards per tournament in the panel (blank fields fall back to the default).

Each individual tournament awards shards of **only one chip type** — Speed **or** Capacity. Consecutive tournaments alternate the awarded type (Speed → Capacity → Speed → …) so both chips grow over time. The awarded type and shard quality are visible on the tournament card before it starts.

Shard quality matches the tournament tier (Bronze, Silver, Gold, Platinum, Diamond). The user spends shards in the Inventory (Section 10.5) to mint a new chip at Lvl 1 or to level up an existing chip — with rising cost per level toward the ultimate +100% effect ceiling. Chips live in the inventory and are equipped/re-equipped on any owned engine via the engine's two chip slots.

### 11.5 Tournament Lifecycle & Result Notification

Each tournament has a **status**:

- **`upcoming`** — tournament has not yet reached its Start Time. Users can join with tickets; the card shows a live countdown.
- **`finished`** — Start Time has passed; winners are selected and the tournament is closed to new entries.

Between the countdown hitting zero and the scheduler's finish job flipping the status (at most one scheduler tick), the UI shows a teal **Started** chip in place of the countdown and replaces Join with a non-interactive **Started** badge — the join window is closed, results are pending.

**Result distribution at finish:**

When a tournament transitions to `finished`, every participant's reward is computed from the percentage table (Section 11.3) applied to the prize pool, and **rewards are auto-credited** to each participant's balance — there is no manual claim step. Top 3 also receive their chip shards (Section 11.4) automatically.

- Places **1–500** receive an LC share according to the percentage breakdown.
- Place **501+** (if more participants exist than the percentage table covers) receive nothing.
- Top 3 additionally receive shards (3 / 2 / 1).

**How places are decided:** by default the finishing order is a **weighted random draw** — each participant's odds scale with their ticket count (more tickets → better expected place). From the admin panel ("Назначение мест") the admin may instead **fix a subset of players at explicit places** (the winners); everyone left unfixed is then **scattered across the free slots of the visible field** — the real roster plus the cosmetic fake-join padding — by that same ticket-weighted draw. So a non-selected real player lands at a believable deep rank (e.g. "347 / 500") rather than packing right behind the fixed winners. A fixed place may exceed the real roster size (a real player deliberately buried inside the fake field); the payout is by the ladder for that exact place (outside the prize bracket → 0).

**Notification & result popup:**

When a tournament finishes, every participant receives an in-app notification with their final placement and reward, deep-linked back to the tournament. Winners additionally get a Telegram DM (gated by the **Tournament end** toggle, Section 16.2); players who won nothing get the feed row only — four draws a day times a full roster of "you finished #312" is how a bot gets muted. A **Tournament start** reminder goes out ~10 minutes before the draw, to everyone entered, once per tournament.

When the user opens the finished tournament's detail page, a **result popup** auto-appears once:

- **Top-3 winners:** celebratory popup with the medal, "You won", LC + shards.
- **Placed 4–500:** "Your result" popup with the placement and LC.
- **501+ (no place):** "Better luck next time" popup with no reward block.

The popup is dismissible; once dismissed (`resultSeen: true`) it does not reappear, but the user can re-open it from the tournament page via the **Result** button at any time.

**Page changes when finished:**

- Countdown chip is replaced with an "Ended Xh ago" timestamp.
- Join button is replaced with either **Result** (if user participated and has a placement) or **Tournament ended** (otherwise) — both clickable to open the result popup.
- The detail page replaces the static trophies with a **leaderboard-style podium** (`LeaderboardPodium`, `maxRank=3`) showing the top-3 winners with their avatars, usernames, LC won, and shard reward chip.
- Below the podium, a list of all other placement tiers (4–5, 6–10, …) shows the LC share for each tier. The user's own tier (if any) is highlighted with a tournament-tier-pink border, glow, and a Crown icon on the right.
- Falling background animation in the podium is rendered as **small Star icons** in the tournament's tier color (`bronze` / `silver` / `gold` / `platinum` / `diamond`) instead of generic confetti pieces.

### 11.6 Tournament List & Filters

The tournaments tab lists every Personal Tournament, filtered through 5 tabs (sliding pink-gradient indicator, identical to the Tasks category nav):

- **All** — only `upcoming` tournaments. Finished tournaments are hidden from this view.
- **Sponsored** — `upcoming` tournaments that carry a `sponsor` (§11.8). A quick way to view only sponsored tournaments; placed right after **All**.
- **Top** — `upcoming` tournaments the user has not joined yet.
- **Participated** — `upcoming` tournaments the user has joined (active participations).
- **History** — `finished` tournaments the user participated in (read-only result entries).

Each tab shows a count badge of matching tournaments. Tournaments outside any tab (e.g. finished + not participated) do not appear in the list — the user can only enter their detail page via direct link.

### 11.7 Tournament API & Data Contract

The Tournament data model (`PersonalTournament`) is a superset of the public `Tournament` plus user-specific fields:

| Field                      | Type                                         | Notes                                                                                      |
| :------------------------- | :------------------------------------------- | :----------------------------------------------------------------------------------------- |
| `id`                       | `string`                                     | UUID                                                                                       |
| `name`                     | `string`                                     | `<TimeOfDay> <Tier>` per 11.2.1                                                            |
| `startTime`                | `string` (ISO)                               | When winners are determined                                                                |
| `teamSize`                 | `number`                                     | Total seats in the tournament                                                              |
| `prizePool`                | `number`                                     | LC distributed among the placement table                                                   |
| `type`                     | `TournamentType`                             | `bronze` / `silver` / `gold` / `platinum` / `diamond`                                      |
| `shardType`                | `'speed'` / `'capacity'`                     | Which chip type's shards are dropped (alternates per 11.4)                                 |
| `status`                   | `'upcoming'` / `'finished'` / `'moderation'` | Lifecycle per 11.5; `moderation` = sponsored, under review (§11.8)                         |
| `winners`                  | `TournamentWinner[]?`                        | Top-3 with `userId` + `username` + `displayName?` + `avatar` (§4.1). Only when `finished`. |
| `places`                   | `TournamentPlacesResponse?`                  | Percentage breakdown (1, 2, 3, 4–5, 6–10, …, 101–500)                                      |
| `participated`             | `boolean`                                    | User has joined                                                                            |
| `participatedTicketsCount` | `number?`                                    | How many tickets the user has submitted                                                    |
| `userResult`               | `TournamentUserResult?`                      | `{ place?, lc, shards? }` — only when `finished` AND user joined                           |
| `resultSeen`               | `boolean?`                                   | Whether the result popup has been dismissed                                                |
| `sponsor`                  | `TournamentSponsor?`                         | Advertiser branding for a sponsored tournament (§11.8)                                     |

**Endpoints** (`src/api/tournaments.api.ts`):

| Endpoint                   | Method | Url                       | Purpose                                                                                                                                                                                              |
| :------------------------- | :----- | :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getTournaments`           | GET    | `tournaments`             | All personal tournaments (used by list page).                                                                                                                                                        |
| `getTopTournaments`        | GET    | `topTournaments`          | Filtered upcoming-only feed (used by home slider).                                                                                                                                                   |
| `getTournamentById`        | GET    | `tournaments/{id}`        | Single tournament detail.                                                                                                                                                                            |
| `getTournamentPlaces`      | GET    | `tournaments/{id}/places` | Percentage placement breakdown. 404s for an unknown tournament; rows are clamped to the instance's `teamSize` (places beyond the seat count don't exist). Exact places are encoded as `to === from`. |
| `joinTournament`           | POST   | `tournaments/join`        | Submit `{ tournamentId, ticketsCount }`. Invalidates `tournaments` + `me`.                                                                                                                           |
| `markTournamentResultSeen` | POST   | `tournaments/result-seen` | Submit `{ tournamentId }` so the popup doesn't auto-open again.                                                                                                                                      |

All endpoints are wired through the `tournaments` cache tag (`rtk-tags.ts`). `joinTournament` additionally invalidates `me` because LC/ticket balance changes.

### 11.8 Sponsored Tournaments

A **sponsored tournament** is a normal, joinable Personal Tournament (tier, prize pool, places, Join flow — everything in 11.7) that additionally carries advertiser branding via an optional `sponsor` field. It is **not** a CPC ad campaign — players join and win LC exactly like any other tournament; the sponsor is attribution, not a paywall.

> **Distinct from §21:** the §21 Partner Ad-Platform object (`PartnerTournament`) is a **click-through CPC ad** and never appears in this catalog. A sponsored tournament is the opposite — it lives **in** the catalog (§11.6) and is joined, not clicked.

`TournamentSponsor`:

| Field         | Type       | Notes                                                               |
| :------------ | :--------- | :------------------------------------------------------------------ |
| `name`        | `string`   | Advertiser brand name (shown via the card's `title`).               |
| `logoUrl`     | `string?`  | Optional brand logo/icon — **replaces the tier medal** on the card. |
| `bannerUrl`   | `string?`  | Optional custom banner — used as the **card background** when set.  |
| `url`         | `string?`  | Optional sponsor destination link.                                  |
| `createdByMe` | `boolean?` | True when the current (demo) user is the advertiser who created it. |

**On the card:** a sponsored tournament gets a **wholly distinct skin** so it never reads as a game tournament — the tier gradient is replaced with an electric-purple→pink fill (`tournament-card-sponsored` / `engine-preview-card-sponsored`), and a **full-bleed header strip** (`TournamentSponsorHeader`) sits across the top carrying the `TournamentSponsorBadge` pill — **"Created by you"** when `createdByMe`, otherwise **"Sponsored"** (Megaphone icon) — plus the advertiser brand name.

- **Background** (`TournamentSponsorBackground`, behind content at `z-0`): the chosen `bannerUrl` under a dark wash when set, otherwise the **default abstract spiderweb** ("паутина") woven from the top-right corner.
- **Medal slot:** the `logoUrl` icon replaces the tier `Medal`; when no logo is provided it falls back to a Megaphone glyph.

The same skin (background, header, logo-in-medal) is applied across the tournaments-tab card (`TournamentCard`), the home slider card (`HomeUpcomingTournamentCard`), and the **player detail hero** (`TournamentInfo`). The detail additionally shows a **"Visit {brand}"** CTA linking to `sponsor.url` when set.

**Filtering:** the tournaments tab has a dedicated **Sponsored** filter tab (§11.6) to view only these.

#### Creating one (partner portal)

The partner "create" screen (`/partners/new`) is the sponsored-tournament builder (`NewSponsoredTournamentContent`):

- **Fields:** name, tier (single-select medals), prize pool (LC), team size (seats), shard type (speed/capacity), start date + time (`:00`/`:30`); **branding** — brand name, logo URL, banner URL, sponsor link. The placement table is the standard one (11.7), not configurable.
- **Cost** (single source of truth: `computeSponsoredTournamentCost`, debited from the advertiser's TON balance): a flat **launch fee** (`appConfig.partners.sponsoredTournament.createFeeTon`) plus **prize funding** — the LC pool priced into TON via `wallet.lcUsdRate` / `wallet.tonUsdRate`, then marked up by `prizeFundingMultiplier` (coins cost **2× more** when funding a pool). A live total + balance gate (402 → toast) keep the advertiser from overspending.
- **API:** `createSponsoredTournament` → `POST tournaments/sponsored`, invalidates `tournaments` + `partnerStats`. The mock debits `mockDb.advertiser`, builds a `PersonalTournament` with `sponsor.createdByMe = true`, and unshifts it into the catalog. On success the creator lands back on the **cabinet** (`/partners`), where it shows under "My Tournaments" as **In Review**.

**Moderation (mandatory).** A freshly-created sponsored tournament enters the new **`moderation`** status (`TournamentStatus`), not `upcoming`. While in moderation it is:

- **hidden from the public** — excluded from the All / Top / Participated / History tabs and the home slider (all of which key off `upcoming`);
- **visible only to its creator** — surfaced in the **Sponsored** tab when `sponsor.createdByMe`, rendered with an **"under review"** pill (`status moderation`), non-joinable and non-navigable.

An admin approval flips it to `upcoming`. In the cabinet the creator approves it from the tournament detail (`/partners/[id]`, §21.3) via `approveSponsoredTournament` (the demo stand-in for admin review).

The demo seeds eight `createdByMe` examples: **"Aurora Bet — Player Cup"** (gold, approved → `upcoming`), **"Neon Spins — Launch Cup"** (silver, still in `moderation`), and **six finished** runs (Winter Cup, Neon Spins Season 1, Aurora Launch Cup, Spin Palace Grand Final, Neon Spins Kickoff, Aurora Diamond Cup) powering the cabinet's **History** view (§21.2).

### Connections

Tournaments connect tickets, LC rewards, tasks, leaderboard positioning, and the Engine Boosts system (Section 10.4 — Chip Boosts). Result notifications integrate with the Notification system (Section 17.1). The detail-page podium UI is the same component as the Leaderboard's (`LeaderboardPodium`).

---

## 12. Task System

### Purpose

Tasks guide user behavior and introduce structured goals.

### 12.1 Task Categories

- Daily tasks
- Weekly tasks
- Monthly tasks

### 12.2 Task Structure

Each task contains:

- **Title:** A clear name for the task.
- **Description:** A detailed explanation of what the user needs to do.
- **Reward:** The prize awarded upon completion (tickets, coins, boosts).
- **Activity Points:** A fixed number of Activity Points granted to the user upon completing the task.

**Task copy is localized data, not an i18n key.** Title, subtitle and unlock hint
are stored on the row as `{en, hy, ru, de}` JSON — the same shape the FAQ, privacy
and terms content uses — and the app picks the active language at render time.
Keys in `messages/*.json` were not an option: tasks are authored through the
admin API, so a new task must be able to carry its own copy without a deploy.

- The 133-task **code catalog** (`milestones.data.ts`) holds the translations and
  re-syncs **code-wins** on every boot, so a catalog task's copy is owned by the
  repo; unit tests reject a catalog entry that is a bare string or whose `ru`/`de`
  merely repeat `en`.
- A **bare string is still accepted** everywhere — from an older admin client, or
  a row written before the column was localized — and is folded into every
  language rather than rendering blank. `hy` mirrors `en` throughout, since
  Armenian is not a selectable app language.

Before this, every task title and subtitle rendered in English regardless of the
chosen language, because the strings went from the database straight into the UI.

**A tier task exists only while that tier has a tournament.** The daily and
weekly tournament tasks are per tier, but only Bronze is auto-spawned
(`tournamentsConfig.spawnerTier`, §11.2.1) — Silver and up appear only when an
admin creates one, and carry the platform-wide activation threshold of §11.2.2
on top. So "Join 2 Silver tournaments" sat on the daily list permanently at 0/2
with nowhere to go. `GET /tasks` now returns a tier's daily/weekly task **only
when that tier has at least one bracket still accepting entries**, or when the
player already entered it this period — the second half matters because progress
is derived from live participation, so without it a player who entered the only
Silver bracket at 11:00 would watch the task and their unclaimed reward vanish
the moment it was drawn. The two **meta** tasks ("complete all available
tournament tasks", daily and weekly) follow the same set: a tier that is not
running contributes no sub-step, and the target becomes the sum of the running
tiers' own targets — 4 a day rather than the stored 8 while Bronze is the only
tier alive (×7 for the weekly one). With nothing running at all, both meta tasks
disappear rather than fall to a target of 0 that would pay out for doing nothing.
The same numbers gate the claim, so the card and the server cannot disagree.

**Sub-steps are a counter, not a schedule.** A daily/weekly task whose target is
greater than 1 expands into `progressTarget` sub-steps, each claimable on its own
for a slice of the AP. Step _n_ is completed by one rule and one only — **the
period counter reached _n_** — so the steps are labelled `1 / 4`, `2 / 4`, … and
nothing more. They used to be named after time slots (`Morning Bronze · 06:00` …
`Night Bronze · 00:00`) and weekdays (`Mon` … `Sun`), which the data cannot back:
step #4 is not the night bracket and step #1 is not Monday. Two consequences the
labels hid: all four daily Bronze brackets are `UPCOMING` at the same time
(§11.2.1), so the "4 Bronze tournaments" task is finished in one sitting rather
than four visits, and it is credited **on entry** — `TournamentParticipation.joinedAt`
inside the current UTC day — not when the tournament is drawn. Task copy says
"join" in every language for that reason. The meta "complete all tournament tasks"
task is the exception that keeps named steps (Bronze … Diamond), because there each
step really is one specific tier's task.

**Reset timing & countdowns.** Daily tasks reset at **00:00 UTC**; weekly tasks reset **Monday 00:00 UTC**; the rewarded-ads block resets with the daily boundary. The backend stamps every daily/weekly task (and the ads block) with `resetAt` — the exact period boundary — and the UI renders live countdowns from it: a small timer on each task card/row (kept on completed tasks to show when they re-open), a period-level "Next reset in …" line under the Daily/Weekly frequency tabs, and the ads-section timer. One-time tasks never reset and show no countdown.

### 12.3 Task Examples

Tasks guide user behavior and include actions such as:

- Inviting a certain amount of friends.
- Visiting specified websites or partner links.
- Joining a tournament.
- Sharing content on social media.
- Daily/Weekly/Monthly check-ins.

**Daily channel check-in (subscription-gated).** The daily check-in task is completed by **staying subscribed to the official Telegram channel** (`TELEGRAM_CHANNEL_ID`, default `@luckyticket365`) rather than a bare tap. The backend drives its progress from a live `getChatMember` check (exposed as the `channel_subscribed` 0/1 counter), cached ~60s per player so the tasks screen never fires a live lookup on every fetch. While the player is not subscribed the task shows **in-progress** with an "open channel" affordance; once subscribed it becomes claimable and grants its Activity Point like any daily task, re-opening at the next 00:00 UTC reset. The check is **strict since 2026-08-04** (it used to fail open): only a confirmed subscription completes the task. An account Telegram will not resolve against the channel — how it answers about someone who was never in it — is not subscribed, and neither is one we could not ask about at all (bot unconfigured, synthetic/seed account, a 429). The old fail-open quietly meant "the gate is off" for exactly the accounts it existed to stop; the cost of the new rule is that a Telegram outage leaves the check-in incomplete for everyone until it answers again, which costs the player nothing — the task re-opens at the next reset. Same rule for the Test-Quest channel gate and promo redemption.

The cached lookup lives in one place (`ChannelMembershipService`) and is shared by every channel gate — this check-in, the promo-code gate (§17.6), and the beta Test-Quest daily claim. One shared answer means the gates cannot disagree inside the cache window, a single screen refresh fires at most one `getChatMember`, and the Test-Quest's "I subscribed, check again" button opens all of them at once.

**Channel boost (one-off, Premium-only).** A separate one-off task (`t-266`, SOCIAL, Gold) pays **1 000 LC + 1 ticket** for giving the official channel a Telegram **boost** — the "отдай голос каналу" action. It sits at the top of the one-off ladder (level with the first-deposit task) because it is the scarcest thing a player can be asked for: it requires Telegram Premium and consumes one of that account's limited boost slots. Progress comes from a live `getUserChatBoosts` check (the `channel_boosted` 0/1 counter), cached ~60s per player in `ChannelBoostService`, and an expired boost stops counting.

The boost check is deliberately **fail-closed**, the opposite of the subscription gate above, and the asymmetry is the point: for the check-in an unknown answer would withhold a reward earned by other means, whereas here the boost _is_ the entire condition — paying out on an unknown answer would pay every player who never boosted, on every Bot-API hiccup. Refusing costs nothing, because the task simply stays incomplete until the player taps again.

A bot **cannot grant, buy or transfer a boost** — Bot API exposes no such method, only reads — so verification is the only honest mechanism, and boosts can only be collected by asking Premium subscribers to give one (the admin panel's «Собрать голоса» block publishes that call-to-action with a `t.me/<name>?boost` button). Telegram likewise never tells a bot the channel's **total** boost count or level; the panel can only list boosts it saw arrive as `chat_boost` events.

### 12.4 All-Tasks Completion Bonus

When a user completes **all tasks** within a given category (Daily, Weekly, or Monthly), they receive an extra gift in addition to the individual task rewards. This bonus is separate from the per-task rewards and is awarded automatically upon finishing the last task in the set.

### 12.5 Ads Watch Milestones

The **Ads** category in the **One-time** tasks tab holds a single task type — a milestone chain that rewards the user for watching rewarded ads (any ad counts). It is rendered as a horizontal milestone slider.

- **Levels:** 7 cumulative view-count thresholds — **10, 25, 50, 100, 200, 400, 800** ads watched.
- **Rewards per level:**

  | Level | Ads watched | Reward                                |
  | ----- | ----------- | ------------------------------------- |
  | 1     | 10          | 200 LC, 5 AP                          |
  | 2     | 25          | 500 LC, 10 AP                         |
  | 3     | 50          | 1,000 LC, 1 ticket, 15 AP             |
  | 4     | 100         | 2,000 LC, 1 ticket, 20 AP             |
  | 5     | 200         | 4,000 LC, 2 tickets, 30 AP            |
  | 6     | 400         | 8,000 LC, 3 tickets, 45 AP            |
  | 7     | 800         | 15,000 LC, 5 tickets, 15 Stars, 60 AP |

- After the 7th level, the slider shows a **“Coming soon”** card — additional levels are planned.
- Tapping a level card sends the user to the daily **Ads** block (`/tasks?frequency=daily&category=ads`), where ads are actually watched. The daily ads block (per-day slot rewards) is a separate mechanic and is unaffected.
- The view count is **cumulative and never resets** — this is a lifetime progression chain, not a recurring task.

**Where the ads come from (waterfall).** The app is not tied to one ad network. A view is served by the first source that has inventory, tried in order:

1. **Adsgram** — the only network in rotation.
2. **House ad** — the app's own promo (channel / invite / Market), shown when the network is empty.

**Monetag is wired but out of rotation** (since 2026-08-02). Its zone, provider and postback all still work; it returns to the waterfall by being named again in `NEXT_PUBLIC_AD_PROVIDERS`, with no code change.

Exactly one ad plays per tap. The next source is asked only if the previous returned nothing; if the player closes an ad themselves, the chain stops and no reward is granted — otherwise closing an ad would become a second chance at one.

**A five-second pause between views.** After a completed view the next slot locks and counts down on its own button (5 → 1), then becomes playable again. The pause is the network's, not a throttle on the player: asked for a second ad immediately, Adsgram answers `onNonStopShow` — which reaches the player as a button that did nothing. The same seconds are spent warming the SDK for the next request. Timed from the moment the ad ends, so the reward modal is read inside the pause rather than after it, and nothing is auto-played when it expires — the player taps. If the ad still isn't there, they get the house promo as usual.

**The house ad pays nothing.** Nobody bought that impression, so rewarding it would be handing out AP for an ad that earned us zero. It is a promo screen with two exits — **«Попробовать снова»**, which asks the waterfall for a real ad again, and close — and neither grants. It therefore does not consume a daily ad slot either: the player's allowance is only spent by a view a network actually served. There is no countdown on it; the old ten-second timer existed to gate a reward that no longer exists.

_Consequence to watch:_ the derived AP baseline (Section 5.4) assumes a full day of ad views. Whenever fill is short, players now come in under that baseline instead of being topped up by house views — the pacing knobs, not the house ad, are the place to correct for that.

**Reward authority.** When a network's server-to-server callback is configured (Monetag and Adsgram both are), that callback is the only thing that grants — the client's "I finished watching" merely syncs the UI, so a spoofed request pays nothing. With the house ad no longer granting, nothing is client-attested any more.

**Per-view rewards (admin-controlled).** Each verified view in the daily ads block grants the admin-configured reward. By default that is the flat per-view knobs (AP per view, default 2; optional LC, default 0). The admin can instead set a **per-view reward ladder** (panel → Настройки → Задания и реклама): view N of the day grants ladder entry N — any mix of AP, LC, Stars, and tickets of a chosen tier — cycling back to the first entry once views outrun the ladder. Every slot in the Mini App ads block advertises exactly what that specific view pays; views past the daily cap grant nothing. Clearing the ladder restores the flat AP/LC behaviour.

**Paid extra views.** Once the free daily cap is spent, a player may **buy more views for the rest of the UTC day** — the offer appears as the last slide of the ads carousel, priced **5 000 LC or 1 ⭐ per view, up to 20 a day** by default (panel → Настройки → «Задания и реклама»). Bought slots sit on top of the status cap, so a default player can reach 30 views in a day; they are spent by watching, and any that go unwatched **expire at the daily reset** — the purchase modal says so before the player pays.

The two prices are deliberately **not at parity**: 5 000 LC is $0.005 at the `lcUsdRate` anchor while the smallest possible Stars price, 1 ⭐, is $0.02. LC is the cheaper path here; a Stars buyer pays to skip the grind, the same shape as every other dual-priced item.

A bought view pays the **same ladder reward** as a free one and counts toward the milestone chain above. Whether it also pays **AP** is an admin switch (`adsExtraGrantsAP`, on by default) and it is the economy valve: the derived daily AP baseline (Section 5.4) is computed from the **free** cap only, so every bought view is AP that baseline never counted. Switching it off makes tier pacing and the leaderboard unbuyable again without a deploy.

Purchases are debited in one transaction with the slot grant and recorded in the LC / Stars ledgers as `AD_EXTRA_VIEWS`, so a bought view is always attributable. The server re-checks price, balance and remaining allowance on every purchase — a stale client can only fail, never overcharge.

**Admin visibility.** Panel → **Реклама** shows, per source (Monetag / Adsgram / Своя реклама), views over the last 30 days, share, views today, AP granted, revenue, cap hits, and views a network never confirmed — plus bought views, what players spent on them, and how many past watchers have gone quiet for 7+ days. Setup, callbacks and operational traps live in [`ADS_SETUP.md`](ADS_SETUP.md).

**How ad revenue is counted — three sources, never merged.** Only Monetag prices each impression for us (`{estimated_price}` in its postback), so only its money is measured. **Adsgram sends no price at all** — its reward callback accepts one macro, `[userId]` — so its earnings can reach the panel two other ways, both labelled for what they are:

| Shown as | Means                                                              |
| -------- | ------------------------------------------------------------------ |
| «точно»  | summed per-view prices the network itself sent                     |
| «оценка» | our exact view count × a CPM an admin read off the network's panel |
| «факт»   | the monthly figure copied in from that panel by hand               |

Both inputs live in panel → **Реклама** → «Деньги от рекламы», and a third one — **«Импорт выгрузки из кабинета сети»** — takes the CSV a network's dashboard hands out and stores its numbers per day (upload or paste, always previewed before saving; re-importing a period corrects those days). Reporting prefers **fact → imported → exact → estimate**, and a hand-typed fact outranks an import because a person looked at the dashboard and decided; how many days an import covers travels with the number, so four days never read as a month. A CPM is never assumed: with none entered, that network's revenue is reported as blank rather than as zero or as a guess, and entering `0` clears it again. A monthly fact is one row per network per month and carries **the network's own impression count** beside ours — the two disagree by design (a network frequency-caps a viewer while we fall through to the next source), and the size of that gap is the only real check on the estimate. Where a month has several, reporting prefers **fact → точно → оценка** and states which it used.

**Счёт в каждой сети.** Panel → **Реклама** → «Счёт — <сеть>» records what a network owes us, its payout threshold and how far the balance is from it. Both numbers are typed in, because neither is reachable: Adsgram shows its balance in its own sidebar and authorises its API by browser session only, and Monetag's threshold ($5, paid on the 4th and 19th) is a published policy rather than an endpoint. Every entry carries **when somebody last looked** — a balance without a date reads as current forever — and an empty field stays «неизвестно» rather than becoming a zero.

**Which network pays better.** Panel → **Реклама** → «Какая сеть выгоднее» reports, per network, revenue per 1000 ads we actually paid a reward for, beside the network's own eCPM. It **refuses to name a winner** unless three conditions hold, and prints which one failed:

- the money on both sides comes from the networks' own dashboards. A CPM somebody typed cannot rank anything — dividing «views × CPM ÷ 1000» by those same views returns the CPM — and postback prices (which cover only rewarded impressions) are not the same quantity as a dashboard total (which covers every impression, including the ones players closed);
- at least **1000 views** per network in the window;
- at least **100 distinct viewers** per network.

The thresholds exist because advertisers frequency-cap per viewer: on small samples a network's yield swings by an order of magnitude (Adsgram's own days range from $0.24 to $75.01 CPM), which is how this project once switched off a network that was paying. Until the bar is cleared the numbers are still shown — refusing a verdict is not hiding data.

The **Аналитика → выручка** split follows the same rule: the estimated part is shown as a separate `+≈$…` and is deliberately excluded from the revenue total, ARPU and ARPPU, which stay measured.

**Why a network's impression count is higher than ours.** A network counts an impression the moment its ad renders; only a **finished** watch pays a reward. So every ad a player closes early is an impression to them and was, until now, nothing at all to us. Attempts that pay nothing are therefore recorded too (`skipped` — closed early, `noAd`, `tooFast`, `error`): they grant nothing, consume no daily slot and touch no balance, and panel → **Реклама** → «Куда ушли показы сети» reads the split back next to `granted` / cap hits / duplicates / «клиент против колбэка». Two dates bound any such comparison and are printed under that table: per-view rows exist only from **2026-07-20**, and the paid-nothing outcomes only from **2026-07-30** — before those, a zero means "not counted", not "did not happen".

**Per-player visibility.** The users list carries an **Реклама** column (lifetime views, today against the free cap, bought slots, and how long since the last view — coloured on the silence, not the total), is sortable by both, and filterable by "watched at least N" and "hasn't watched in N days" (the latter deliberately also matches players who never watched). The user card's **Реклама** tab adds the full picture: lifetime and paid totals, what the player's views earned us, a **per-day chart** with every empty day drawn (which is how "stopped watching three weeks ago" becomes visible at all), the per-network split, and three shares — of what they could have watched lifetime, over the chart window, and how many days they showed up at all.

> **The percentages are estimates and are labelled `≈`.** The denominator projects the player's **current** free cap back over the whole life of the account, and the cap moves with status (a month spent at VIP 20 was 30/day, not the 10 they have now) — no history of past caps is kept. The counts behind each share are printed next to it for exactly this reason. Separately, per-view rows (`AdView`) only exist from **2026-07-20**; before that only the lifetime counter survives, so the chart marks older days as _unknown_ rather than zero, and a player whose last view predates it reports "давность неизвестна" rather than a fabricated date.

### 12.6 One-Time Milestone Catalog (2026-07 rebalance)

The one-time tab holds a curated catalog of **~120 tasks** whose reward budget is subordinated to the AP tier pacing (Section 5): milestones are a bonus on top of the daily baseline, never a highway past it.

**Budget rules** (enforced by backend guardrail tests in `milestones.spec.ts`):

- **Total one-time AP ≈ 2,900** — about 11% of the Diamond threshold. Early steps award 5–25 AP; legendary steps up to 150.
- **Instant one-click actions award 0 AP** (LC/tickets only): account setup, first-claim/first-join achievements. AP lives only in time-gated goals.
- **Paid actions award 0 AP** — VIP levels, Lucky Player, and star purchases give LC/ticket/Stars cashback (~2–5% of spend), but tiers are earned by playing, not paying.
- **Tier-journey achievements (Reach Silver/Gold/Platinum/Diamond) award 0 AP** — awarding AP for reaching an AP threshold would be circular. They pay LC + tickets.
- **Stars giveaways are bounded**: non-cashback Stars live only in legendary steps (top-1 all-time, 365-day streak, 100 friends…), ≤ 500 LS total across the catalog.

**Milestone chains** (each rendered as a horizontal slider):

| Chain                      | Steps                      | Counts               |
| -------------------------- | -------------------------- | -------------------- |
| Watch ads                  | 10/25/50/100/200/400/800   | lifetime ads watched |
| Participate in tournaments | 1/5/10/25/50/100           | any tier             |
| Take a prize place         | 1/5/10/25/50/100           | top-3 finishes       |
| Take 1st place             | 1/5/10/25/50/100           | outright wins        |
| Own engines                | 2/5/10/15/20/30            | engines of any tier  |
| Collect tickets            | 250/1k/2.5k/10k/25k/50k    | lifetime produced    |
| Start stakes               | 3/5/10/15/20/30            | stakes of any tier   |
| Stake volume               | 10k/50k/200k/500k/2M/5M LC | lifetime locked LC   |
| Invite friends             | 1/5/10/25/50/100           | referral joins       |
| Leaderboard rank           | top 1000/500/100/50/10/1   | all-time board only  |
| Purchase Stars             | 100/250/500/1k/2.5k/5k     | cashback chain, 0 AP |
| VIP level                  | 1–20                       | cashback chain, 0 AP |

Plus ~35 single achievements: onboarding (email, username, 2FA, avatar, wallet, deposit), first steps, engine mastery (tier unlocks in ascending order, parallel producer, boosts), tournament prowess (project/partner wins, all-tier winner, Platinum/Diamond winner), referrals, wallet actions, login streaks (7/30/90/365), and the tier journey.

Deliberately **removed** in the rebalance (multi-dipping or stale old-economy scale): the 2nd/3rd-place chains, all per-tier tournament chains, per-tier engine/ticket/stake chains, daily/weekly/monthly leaderboard chains, the star-earn chain, the “10K/100K/1M AP” achievements (replaced by Reach Silver/Gold/Platinum), and duplicate achievements for email/wallet/deposit/status actions.

The catalog is **code-canonical**: the backend upserts it on every boot (code wins over DB/admin edits to seeded tasks — same policy as market ladder prices and periodic task AP) and deletes seeded tasks that were removed from the catalog. Admin-created tasks (UUID ids) are never touched.

### Connections

Tasks drive activity, ticket acquisition, and retention.

---

## 13. Leaderboard

### Purpose

The leaderboard provides social comparison and competitive motivation.

### Description

- Global ranking based on Activity Points.
- Displays top users.

### 13.1 Master switch — the board opens after the test period

The whole board sits behind an admin toggle (`GET /config` → `leaderboardEnabled`, panel: **Настройки → Система → Таблица лидеров**). While it is **off**:

- the drawer entry renders locked ("Скоро", same treatment as the partners cabinet);
- the profile's Leaderboard card still shows **the player's own** Activity Points and rank, but leads nowhere and carries an "opens after the test period" note;
- `/leaderboard` renders the locked screen instead of the standings, and the leaderboard query is **not fired at all**.

Rationale: during the closed beta the standings cover a handful of testers, so publishing them would read as the real ranking. Ranking keeps accruing throughout — only the display waits. The switch defaults to **off**; flipping it on is an admin action, not a redeploy.

### Connections

Leaderboard ranking depends on activity, tasks, and tournaments. Activity Points earned by liking profiles (§17) are collected on the board, so that source is effectively paused while the board is locked.

---

## 14. Market System

### Purpose

The Market is the central hub for purchasing improvements, resources, and statuses. All purchases are paid in **Lucky Coin (LC)** or **Lucky Stars (LS)** — no fiat or crypto (see Section 19.3 for the full Mega Market structure).

### Sections

- **Engines:** Purchase additional producer engines for any unlocked tier with LC.
- **Tickets:** Purchase project or partner tickets directly with LC.
- **Shards:** chip fragments collected to build chips (Section 10.4). The **full tier ladder is listed** (Bronze → Diamond, both chip types, one shard per purchase, LC or LS) but the purchase is AP-tier-gated (14.1) — a player buys shards **of their own tier and below**; higher tiers show locked.
- **Statuses:** Lucky Player subscription and VIP unlock/upgrade (LC or LS — Section 7).
- **Cosmetics:** avatars, badges, themes (Section 16.1) — not tier-gated. _(Switched off in the Mini App since 2026-08-09 — Section 16.1.)_
- Premium items (pre-built chips, chip builders, passes) are defined in the model but **not currently surfaced** — see Section 19.3 for the implemented-vs-deferred category list. (The legacy LC market **Speed Boost** was retired — engine speed is deepened via the engine's speed level, §10.2.)

> Engine **Capacity Upgrades** are not sold here — they are bought on the engine itself (engine cube / details, §10.2), paid only with LS.

### 14.1 AP Tier Gate

Tier-bound market items (engines, chips, chip builders, boosters, tier tickets) are gated by the **AP tier** (Section 5.2): an item of tier `T` is buyable only when `AP-tier ≥ T`. Cosmetics (avatars, badges, themes) are **not** gated.

**Every item explains itself — locked ones included.** Any card in the Market opens an info sheet stating what the item is and **what it is for** (an engine mints tickets of its tier on its own cycle; shards are spent in the inventory to mint or level chips; a ticket names the tournaments and stake level it opens; an avatar's bonus runs while it is equipped), plus its perks, stock and timer. A gated card is not a dead end: it stays tappable, and instead of a price the sheet carries the gate — the AP threshold, the referral count where one applies, progress against whichever half is blocking, and a link to the screen that closes it (Invite Friends / How to earn AP). A tier ticket that is switched off in the catalog says so rather than showing a padlock without a reason, and the showcase carousel follows the same rule: a gated offer shows a lock, never a Buy button the server is bound to refuse. A status the player already holds reads **Active** / **Max**, not "Locked".

### 14.2 LC Price Ladder & Progression Economy

The Market is the platform's main LC **sink** — the counterweight to the tournament LC faucet. All knobs below live in `appConfig.economy` (single source of truth); derivations live in `src/utils/global/economy.utils.ts`, and every rule in this section is asserted by the guardrail simulation `tests/economy-sim.test.ts`.

Base LC prices (first engine of a tier):

| Item   |  Bronze |  Silver |    Gold |  Platinum |   Diamond |
| :----- | ------: | ------: | ------: | --------: | --------: |
| Engine | 200,000 | 360,000 | 675,000 | 1,170,000 | 2,250,000 |
| Ticket |   6,000 |  15,000 |  37,500 |    90,000 |   225,000 |
| Shard  |   3,000 |   7,000 |  15,000 |    32,000 |    65,000 |

Shards also carry a flat by-tier **LS ladder** (1 / 1 / 3 / 6 / 11 ⭐ per shard), mirroring the ticket LS ladder's off-parity design. Both shard price rows are re-synced from the code constants on every backend boot (`syncShardLadder`), like the other ladders.

**House edge.** The ticket price equals `1.5 × prizeLcPerSeat` for its tier (`tournamentHouseEdgeMultiplier`) — always above the average LC a ticket returns in a tournament. Bought tickets are never a profitable money loop; free engine-produced tickets are the free roll.

**Repeat-purchase pricing (anti-inflation valve).** The n-th engine of a tier costs `base × 1.6^(n−1)` (`engineRepeatPriceGrowth`). Flat engine prices made engine-spam exponential — a Bronze engine paid for itself in ~2 days forever, so a perfect player's LC production doubled every few days. Geometric pricing turns that into logarithmic growth and produces the intended tier ladder by itself: after ~3 engines of a tier, the next tier's first engine is the rational buy.

**Payback ladder.** First-engine payback (price ÷ daily LC value at perfect claims) rises gently with the tier — ≈4 / 6 / 9 / 13 / 20 days for Bronze → Diamond — so climbing tiers is always rewarding, never a trap. Simulated over a year of perfect greedy free play, production value grows ≈×5 from day 30 to day 365 (sub-exponential, bounded).

**Engine promotion is an LS sink, not an LC printer.** Beyond buying more engines, a player deepens one via 10 speed + 10 capacity levels; the 20th upgrade **promotes** it (+100% speed, +10 base output — §10.2) and reopens the ladder. Every one of those 20 steps is priced in **Lucky Stars**, so promotion drains premium currency rather than inflating the LC faucet — which is why the greedy free-play bound above (LC-only reinvestment) can ignore it. The promotion gate and its base-capacity/speed curves are pinned by `tests/economy-sim.test.ts` ("engine-level promotion & base-capacity scaling").

**Currency parity (engines).** For **engines**, the Stars price is derived at the USD anchors (`lcUsdRate` / `lsUsdRate`) — neither currency is an arbitrage on the other; this parity is enforced by the guardrail simulation.

**Ticket Stars ladder.** **Tickets** keep their LC economy price (the house-edge / faucet number below), but their **Stars** alternative is a **fixed 1⭐ → 5⭐ by-tier ladder** (Bronze 1 · Silver 2 · Gold 3 · Platinum 4 · Diamond 5), deliberately **off parity** — a flat, legible real-money price per ticket (`MARKET_TICKET_STAR_PRICES` / `appConfig.economy.ticketPriceStarsByTier`).

**Speed Boost retired.** The standalone LC market **Speed Boost** (§10.1) was retired — engine speed is now the engine's per-level **LS** upgrade (§10.2), not a market item. The currency-parity guardrail therefore covers **engines** only (tickets price Stars on a fixed by-tier ladder — see "Ticket Stars ladder" above).

**Balance rule:** total LC spent in the Market per day should be ≥ the total LC faucet per day (tournaments + tasks + ads + stake APR), keeping LC mildly deflationary so it does not lose value.

### 14.6 Gift Counter (Telegram gifts for LC)

The Market sells **real Telegram gifts for Lucky Coins**. The bot sends the gift into the buyer's own chat with it; the catalog is Telegram's live `getAvailableGifts`, so what is on sale and what it costs are not ours to choose.

This is the only LC sink that **costs the platform real money** — a gift is paid out of the bot's own Stars balance. Everything below exists because of that one fact.

**Three brakes, and only one of them actually bounds the cost** (`PlatformConfig.giftShopConfig`, editable in Настройки → Подарки за LC, superadmin only):

| Knob                | Default | What it does                                             |
| :------------------ | ------: | :------------------------------------------------------- |
| `enabled`           | **off** | Master switch. Off = the section does not render at all. |
| `lcPerStar`         |  50,000 | LC charged per Star of the gift's Telegram price.        |
| `monthlyStarBudget` |  200 ⭐ | Platform-wide ceiling per UTC month. **The real brake.** |
| `perUserMonthly`    |       1 | Gifts one player may buy per UTC month.                  |
| `maxGiftStars`      |  100 ⭐ | Priciest gift the shop will list.                        |

**Why price is not the protection.** LC is not scarce: the tournament spawner mints a fixed pool four times a day whether anyone shows up or not, so a coin balance says nothing about how much value a player should be able to take out. The price rations gifts _between_ players; only the monthly Star budget bounds what the feature can cost, and it holds regardless of how much LC exists or how many players arrive.

**Why the price floor is 25,000 LC/⭐.** Buying extra ad views (§12.5) already converts coins into Stars at roughly that rate. Anything cheaper here makes gifts the cheapest exit for LC and silently replaces the ad valve — which at least earns ad revenue against what it pays out. The default of 50,000 is 2.5× the dollar parity of 20,000 LC = 1⭐ (`lcUsdRate` × 20,000 = `lsUsdRate`) because a gift returns nothing at all. Enforced by `src/market/gift-shop.spec.ts` and by a `@Min(25_000)` on the admin DTO.

**Buying does not send anything.** A purchase debits the coins and files a request in Звёзды → Подарки → «Заявки за LC»; the bot spends real Stars only when an admin presses **Подтвердить**. Two things follow, both deliberate:

- **An empty bot balance stops being a failed purchase.** It becomes a scheduling problem — the request waits, the operator tops up, the gift goes out. Sending inline meant a bot at zero Stars turned every purchase into a charge-and-refund the player experienced as breakage.
- **Every gift that leaves is seen by a person.** This is real money against a currency the platform mints on a timer, so the last gate is human.

Coins are taken at request time rather than at approval — they have to be reserved, or the same balance could be spent twice while the request sits in the queue.

| status     | meaning                                                                                                          |
| :--------- | :--------------------------------------------------------------------------------------------------------------- |
| `PENDING`  | paid, waiting for the panel                                                                                      |
| `SENT`     | approved and Telegram accepted it — terminal, cannot be refunded (Telegram cannot recall a gift)                 |
| `FAILED`   | approved but Telegram refused; **coins are still held** and the row stays in the queue to be retried or refunded |
| `REFUNDED` | declined or given up on — coins returned                                                                         |

A refusal is deliberately **not** an automatic refund: the operator who pressed the button is the one who can fix the cause (top the bot up, ask the recipient to allow ordinary gifts) and press it again. Both caps count every row except `REFUNDED`, so a queue of unapproved requests cannot quietly exceed the month's ceiling.

The player's side says so plainly: the confirm sheet states that coins go now and the gift arrives after confirmation, and until the request is resolved the counter shows «Ваш подарок подтверждают» rather than a limit.

**Ledger.** Gift spending is `LcTransactionType.GIFT_PURCHASE`, deliberately apart from `MARKET_PURCHASE`, so the economy report can price the one sink that costs us Stars separately from the ones that cost us nothing.

### Connections

The Market integrates with LC, LS, engines, boosts, tickets, statuses, the AP tier gate, and — through the gift counter — the bot's own Telegram Stars balance.

---

## 15. Wallet Page

### Purpose

The Wallet page is the hub for the user's balances and money actions — connecting an external wallet, buying Lucky Stars, converting Lucky Coin to TON, and withdrawing TON.

### Balances

The Wallet shows three balances:

- **Lucky Coin (LC):** internal reward currency (Section 6.1). Earned by playing; not bought. Reaches real money by **converting to TON** (see Action Section 4).
- **Lucky Stars (LS):** real-money premium currency (Section 6.2, Section 19). Bought with Telegram Stars or TON, also earned in-game; spent on premium. **Not withdrawn.**
- **TON:** the user's TON (Toncoin) holdings, used to buy LS.

### Action Sections

#### 1. Connect Wallet

Links an external TON wallet — required for the TON purchase path.

**Binding has a master switch above both gates: `walletConfig.connectEnabled`.** While it is off, `POST /wallet/connect` answers `403 { error: 'wallet-connect-disabled' }`, the wallet state carries `connectEnabled: false`, and the Mini App draws "the wallet opens after the test" (`TonWalletClosed`) in place of the hero card — with the deposit / withdraw / exchange row removed, since all three are TON-only and would be dead buttons. Stars, LC and every in-app spend keep working; the test period closes the TON wallet, not the account. It is a separate switch from `withdrawalsEnabled` (§15) on purpose: that one shuts the way out while the wallet stays usable, this one shuts the door itself, which is what the app's "opens after the test" promise actually says. **The invite gate below must never be shown in its place** — a progress bar reading `0/1` promises an unlock that inviting a friend cannot deliver, and that mismatch is exactly why the switch exists: during the closed test, players with one invited friend were connecting wallets on a screen that announced the feature as unavailable. Accounts that already bound an address are grandfathered past it (same rule as the invite gate below): their TON is real, and a dropped TON Connect session must not strand it behind a switch nothing they do can flip.

**Two invite gates guard the money path, and they are priced differently.** Binding a wallet only opens the way **in** (deposit, buy), so it is cheap; carrying TON **out** is what a throwaway account is actually after, so it costs more friends. Both answer **403** with the same machine-readable body (`{ error: 'referrals-required', required, current }`), and both are admin-editable in the panel's Кошелёк tab (`0` disables either one):

| Gate                                | Endpoint                | Default   | Grandfathered?                                      |
| ----------------------------------- | ----------------------- | --------- | --------------------------------------------------- |
| `walletConfig.connectMinReferrals`  | `POST /wallet/connect`  | 1 friend  | **Yes** — an address bound earlier stays bindable.  |
| `walletConfig.withdrawMinReferrals` | `POST /wallet/withdraw` | 3 friends | **No** — an old binding says nothing about invites. |

- **Both requirements travel with the state.** `GET /wallet` carries `connectMinReferrals`, `withdrawMinReferrals`, `referralsCount` and the server's own verdicts `canConnect` / `canWithdraw`, so the Mini App renders a locked hero card (`0/1`) instead of opening a TON Connect sheet the API is about to reject, and a locked withdrawal modal (`1/3`, invite-friends CTA) instead of a form whose submit is a 403. Deposit / exchange buttons surface the connect gate in a toast rather than starting a connect.
- **Grandfathering applies to connecting only.** `canConnect` is true whenever an address was ever stored, which is why it is not simply `referralsCount >= connectMinReferrals`: withdrawing requires an _active_ connection, so without it a disconnect — or a gate raised afterwards — would strand real TON. The exit gate deliberately has no such escape hatch; the balance stays spendable in-app either way, so nothing is stranded by it.
- **Nothing else is gated.** Buying Lucky Stars with Telegram Stars, earning, and LC→TON conversion are untouched — converted TON simply cannot leave until the exit gate is met.

**A player can remove their wallet and bind another one, and the old address is kept.** `POST /wallet/disconnect` archives the current binding into `WalletBindingHistory` (address, provider, network, bound/unbound timestamps, and `reason`: `removed` by the player or `replaced` by a new address) and then clears the address, public key and provider from `WalletConnection`. Connecting a different wallet archives the outgoing one the same way — before this it was overwritten in place, so the previous address simply ceased to exist, and a payout dispute could no longer be traced to the wallet that received it. The admin user card renders the list under «Прошлые кошельки».

- **A removed wallet stops working, not just stops being shown.** Withdrawals require an _active_ connection, so removing a wallet blocks cash-out until a new one is bound. (`GET /wallet/onchain-transactions` used to read the stored address without checking `isConnected`, so a disconnected wallet kept publishing its blockchain history inside the app; it was fixed to require an active connection, and the Mini App stopped calling it entirely — see «The wallet page shows our ledger, not the chain» below.)
- **The TON balance belongs to the account, not to the wallet.** `tonBalance` lives on the same row but is deliberately untouched by removal — an LC→TON conversion credits it with no wallet involved. Both wallet-less hero states (disconnected and invite-locked) show it, and the admin card shows it regardless of `isConnected`; hiding it behind a connection blanked out real money on exactly the accounts most likely to ask about it.
- **Grandfathering follows the history.** `canConnect` is true if the account has any past binding, not just a stored address — otherwise removing a wallet below the invite threshold would leave the player unable to bind the replacement, turning the entry gate into a one-way door.

#### 2. Buy Lucky Stars with Telegram Stars

Purchase LS with **Telegram Stars (XTR)** at a fixed **1:1 rate** — 1 Telegram Star = 1 LS. Powered by the Telegram Bot Payments API.

> Reference: 100 Telegram Stars ≈ $2 USD, so 1 LS ≈ $0.02. Final Telegram pricing may change.

#### 3. Buy Lucky Stars with TON

Purchase LS by spending TON. The LS amount is computed from the TON→USD rate against the $0.02/LS anchor, with a **volume bonus** on larger packages (e.g. +0% / +5% / +10% / +15%). This is a one-directional purchase path — LS is not converted back to TON.

**The TON→USD rate is a live price feed** (`TonRateService`). It drives every TON-denominated price: this purchase, the LC→TON cash-out, sponsored-tournament funding and the wallet's USD readout, and it is served to the Mini App through `GET /config` so a client preview always quotes what the server will charge.

- **Sources:** CoinGecko, then Coinbase as fallback — both free and keyless. (Binance is deliberately absent: it answers 451 to US-hosted callers, and the backend runs in Railway's SFO region.)
- **Cache:** 5 minutes in Redis, so pricing calls never wait on an exchange.
- **Guards, because this value moves real money:** a quote is accepted only inside a **$0.5–$100** sanity band **and** within **40%** of the last known good one. A rejected quote is logged as an error and the old rate stands.
- **Degradation:** feed → last known good (up to 24 h) → the bundled `WALLET.tonUsdRate` anchor. It never throws and never returns zero.
- **Manual pin:** `walletConfig.tonUsdRateOverride` (admin) overrides the feed entirely — the escape hatch when a feed misprices, and the way back to a fixed rate without a deploy. `null` = the feed prices.

> **The Stars packages follow the rate.** A package's **TON cost is fixed** (1 / 5 / 10 / 50 TON) and the Lucky Stars it grants are derived (`starsForTon`), so a package is always worth its USD value. At the historical 3.42 anchor this reproduces the old hardcoded catalog exactly (171 / 898 / 1881 / 9833); at TON ≈ $1.50 the same packages grant 75 / 394 / 825 / 4313.
>
> Because the cost is the stable attribute, the SKU ids are keyed on it — `pkg_ton_1`, `pkg_ton_5`, `pkg_ton_10`, `pkg_ton_50`. They were `pkg_171`…`pkg_9833` (the star counts at 3.42) and began lying the moment the feed went in; the old ids are still accepted on purchase (`WALLET.legacyStarsPackageIds`) so a client holding a pre-rename catalog isn't broken. Package ids are never persisted — no historical row references them.

> **History:** until 2026-07-25 the rate was the hardcoded constant **3.42**, written when TON traded there. TON had since fallen to ≈ **$1.50**, so the platform was selling Stars for TON at ~44% of their intended price and paying LC→TON cash-outs at ~44% of what the $0.000001/LC valuation promised. Switching to the feed corrects both.

#### 4. Convert Lucky Coin to TON

LC reaches real money through **TON**. The user converts LC to TON at the fixed **$0.000001/LC** valuation (priced against the TON→USD constant above); the resulting TON lands in the wallet's TON balance and is cashed out via the TON withdrawal path above. Conversions are subject to the **15% fee** and the **$10/day cap** from §6.1 (`appConfig.economy.lcConversion`).

- The withdrawal action itself handles **TON only** — LC is never withdrawn directly.
- A **direct LC withdrawal** (LC straight to fiat/USDT, with its own minimums and commission) is **coming soon**.
- LC cannot be bought with real money (no deposit); it enters the economy solely through play and leaves it only by conversion to TON.

### On-chain deposits & withdrawals are treasury-gated

The two on-chain money paths only exist when the backend has a **treasury wallet** configured (`TON_TREASURY_MNEMONIC`, plus `TON_API_KEY` / `TON_NETWORK`). Everything else on this page — connect, Telegram-Stars purchase, TON→LS exchange, LC→TON conversion, transaction history — works regardless.

- **Treasury configured:** deposits are watched and credited by comment attribution (~40–80 s), and a withdrawal really broadcasts from the treasury, recording the on-chain hash.
- **No treasury:** `GET /wallet/deposit-address` returns **no address at all** and `depositsEnabled: false`; the deposit modal shows a "deposits are paused" notice. `POST /wallet/withdraw` returns **503** and the modal says withdrawals are paused.

> The no-treasury state must never fake success. Until 2026-07-25 a withdrawal without a treasury debited the balance and wrote a `COMPLETED` row with a synthetic hash while nothing moved on-chain, and the deposit modal offered the player's own (or a synthetic) address to send to. Both were removed — an unavailable money path fails loudly.

**Deposits are attributed by an opaque tag, never by the user id.** One treasury address serves everyone, so an incoming transfer is matched to a player by the text comment it carries. That comment used to be the raw user id — which is public on the chain forever, while `GET /profile/:id` is open to every logged-in player, so anyone reading the treasury's history could map a depositor's wallet to their in-app profile. Since 2026-07-27 `GET /wallet/deposit-address` mints a random 16-hex-character tag (`TonDepositTag`), reusing the same one for 30 minutes so repeated opens of the deposit screen don't churn rows, and issuing a fresh one per visit so separate deposits can't be tied together on-chain. **Tags never expire, and the raw user id is still accepted**: a comment the watcher cannot resolve is real TON sitting in the treasury, uncredited — so a QR screenshotted before the change must still work.

**The treasury is a v5r1 (W5) wallet, and the version is part of its address.** The backend derives the address from the mnemonic — it is never configured — so the contract version and the network id both feed into _which account_ the whole money path points at. The same 24 words are a different account under v4r2 than under v5r1, and `WalletContractV5R1.create()` defaults to the **mainnet** network id, so a testnet backend that let it default would watch its own mainnet address: funded by nobody, every withdrawal "underfunded". v5r1 is what Tonkeeper creates by default, so the derived address is the one the owner sees in their wallet — verify they match before funding. `treasury.service.spec.ts` pins all of this: changing those expected addresses means the treasury _moved_, which is a migration (sweep the funds first), not a refactor.

Independently of the treasury, withdrawals and LC→TON conversion also honour the admin kill switch `withdrawalsEnabled`, the live `minWithdrawalLc` minimum, and the §6.1 fee/daily cap.

**Money leaves the platform only after the test period.** Since 2026-08-05 `withdrawalsEnabled` is **off** on production: both exits — `POST /wallet/withdraw` and LC→TON conversion — are closed for the duration of the closed test and are switched back on **by hand** when it ends. The Telegram-Stars purchase, the TON→LS exchange and every in-app spend are unaffected. Binding a wallet — and with it TON deposits — is closed by its own switch, `connectEnabled` (§15.1), flipped off the same way and on the same day: the app announced the wallet as opening after the test while a single invited friend still cleared the entry gate, so players kept connecting. The reopening is deliberately a manual toggle rather than a rule keyed on `testQuestConfig.testEndsAt`, the same shape as `leaderboardEnabled` (§13): the date can move, and a money exit that opens itself on a stale date is the wrong failure. The reason for closing it is that test-period balances are not launch-period balances — LS faucets pay out during the test and tournament prize pools are split between a handful of players (§2.8) — so a withdrawal now would price the test's inflation at mainnet rates.

**The closed exit is a rendered state, not an error.** `GET /config` publishes `wallet.withdrawalsEnabled`, and both exit screens — the TON withdrawal modal and the LC→TON conversion — draw an "opens after the test" lock in place of their form (`WalletWithdrawLocked`). That lock outranks the invite gates above it: while nothing can leave at all, how many friends were invited is beside the point. Both endpoints answer `403 { error: 'withdrawals-disabled' }`, and the client reads that at submit time too, so an exit closed between the config query and the tap turns into the same lock rather than a toast. A backend that doesn't publish the field is treated as open — the 403 is still the last word, and hiding a working feature because a flag is missing would be the worse default. Until 2026-08-05 the switch reached the player only as that 403, after an address and an amount had been typed, and the modal reported it as a generic "action failed": a closed door rendered as a broken button.

**Withdrawal limits are server-owned, served to the client, and shown in the form.** `withdrawFeeTon` (flat, charged **on top** — the recipient gets the amount, the account is debited amount + fee) and the withdrawal minimums are admin-editable and exposed through `GET /config` as `wallet.{withdrawalsEnabled, withdrawFeeTon, minWithdrawTon, firstWithdrawMinTon, maxWithdrawTon, withdrawDailyCapTon, minDepositTon, minWithdrawLc}`, which is what the wallet's forms validate against. The withdrawal modal states the minimum, the per-transaction maximum **and** the daily cap up front: a player who only ever sees the per-transaction ceiling reads the fourth withdrawal's rejection as a bug. The deposit form states `minDepositTon` (0.1 TON) — advisory on purpose, since a transfer that already landed is credited whatever its size; refusing real TON that arrived would be the worse bug. Both were client-side constants until 2026-07-26, which left two holes: the API accepted a dust TON withdrawal because only the Mini App checked the minimum, and the LC→TON form let a player submit below `minWithdrawalLc` and receive a generic failure instead of the limit. Both minimums are now enforced on the server and rendered from the same values.

**The withdrawal minimum is two numbers: the first cash-out is cheaper than every one after it.** `firstWithdrawMinTon` (**1 TON**) applies while the account has never withdrawn; `minWithdrawTon` (**5 TON**) applies from the second withdrawal on. The point of the pair is that a player must be able to prove the exit works with a small amount — a single 5 TON threshold means nobody sees money leave until they have saved five times as much, and an exit nobody has tested is an exit nobody trusts. "Has withdrawn before" is read from the wallet ledger (`WalletTransaction` of type `WITHDRAW_TON` that isn't `FAILED`), never from a flag on the user: the ledger is what records money actually leaving, and a flag would have to be kept in step with refunds and admin corrections. A broadcast that failed refunds the reserve and writes no row, so it does not spend the cheap withdrawal. Both numbers are admin-editable; `GET /config` carries the pair and `GET /wallet` carries the one **this** account is held to (`minWithdrawTon`, plus `firstWithdrawal` and `nextWithdrawMinTon` so the form can say what the minimum becomes next time). The client never decides which applies — it is the side least able to know.

**The fee is a platform fee, not a network one.** `withdrawFeeTon` is **0.5 TON** charged on top, while the on-chain gas of a payout is ~0.001 TON. Together with the first-withdrawal minimum it sets the real entry price of cashing out: **1.5 TON of balance** buys a first withdrawal of 1 TON. It was 0.05 until 2026-08-05.

**Outflow ceilings bound what an automated treasury can lose.** The treasury signs every payout with a key held by the server, so nothing but these caps stands between a wrong balance and an empty hot wallet. Three limits apply on top of the minimums above, all admin-editable in `walletConfig`:

| Limit                 | Default                  | Guards against                                                                                                                                                                                                        |
| --------------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `maxWithdrawTon`      | 10 TON                   | One inflated balance leaving in a single transaction. Served through `GET /config` so the form rejects it before submit. Must stay above `minWithdrawTon`, or the repeat range collapses to a single accepted amount. |
| `withdrawDailyCapTon` | 10 TON/day per account   | The same damage spread over repeated calls, which the per-transaction ceiling alone does not cover.                                                                                                                   |
| `treasuryDailyCapTon` | 25 TON/day platform-wide | Many accounts draining the treasury at once — the shape an exploit actually takes, and the one per-account caps say nothing about.                                                                                    |

Both daily caps are UTC-day Redis counters kept in milliTON (integers, rounded up per withdrawal). They are charged **before** the broadcast and released if it fails, so a failed payout never burns an allowance. Hitting the per-account cap is a `400`; hitting the platform-wide one is a `503` `withdrawals-paused` and is logged as an error — it means either a genuinely busy day that needs the cap raised, or an incident that needs the `withdrawalsEnabled` kill switch.

**`TON_API_KEY` is required in practice, not optional.** A single withdrawal costs one `getSeqno`, the broadcast, up to 20 confirmation polls (one every 2 s) and a final transaction read — roughly 0.5 req/s for up to 40 s, on top of the deposit watcher's 40 s cycle. Unauthenticated Toncenter allows about 1 req/s per IP, so without a key the broadcast reliably fails with HTTP 429 (verified on a testnet dry run, 2026-07-25). Keys are network-bound: a testnet key answers `Network not allowed` on mainnet, and Toncenter accepts the key **only as the `X-API-Key` header** — a `?api_key=` query parameter is rejected as "API key does not exist".

A treasury-side failure never silently eats a balance: the withdrawal reserves the amount, and if the broadcast throws it refunds the reservation and writes no transaction (verified across three consecutive induced failures). An unreachable TON API surfaces as **503** `ton-api-unavailable` rather than a raw 500.

### Note on conversions

LC and LS do not convert into each other, and LS cannot be withdrawn. There is no LC deposit — LC is obtained only by playing, and leaves the economy by converting to TON (Action Section 4).

### Transaction History

A record of all balance events (LS purchases, in-game LS/LC earnings, spends), each with **Type**, **Amount**, **Date**, and **Status** (Completed / Pending / Failed).

**The wallet page shows our ledger, not the chain.** Until 2026-08-02 the history sat behind two tabs — «In-app» and «On-chain», the latter reading the connected wallet's real blockchain history through `GET /wallet/onchain-transactions`. The on-chain tab is gone from the Mini App: inside Telegram the wallet app already shows that history first-hand, and repeating it here mostly listed transfers that have nothing to do with the platform, next to rows that do — two lists of different things under one heading. What the platform actually credited stays the only thing the page claims, and every row carrying an on-chain hash still links out to tonscan, so a deposit or withdrawal can be checked against the chain in one tap. The backend endpoint stays (the admin user card reads the chain via `GET /admin/users/:id/onchain`, which is the view that settles "I sent it and it never arrived").

---

## 16. Settings & Security

### Purpose

Settings provide control, security, and personalization for the user's account.

### Available Options

- **Two-Factor Authentication (2FA):** Enable extra security for the account.
- **Email Confirmation:** Confirm or change the linked email address — see Section 16.3.
- **Change Username:** Update the public display name. Available from Settings and directly on the own-profile screen (pencil next to the name). 3–32 characters, letters/digits/dots/dashes/underscores only, must be unique; the same rule applies to registration and admin edits.
- **Change Avatar:** _(switched off since 2026-08-09 — Section 16.1)_ Pick a profile picture from the user's owned avatar inventory. The picker lists every avatar the user owns — both the default free avatars and any paid avatars purchased in the Market. New avatars are acquired exclusively through the Market (see Section 16.1).
- **Notification Preferences:** Per-channel (Email / Telegram bot) toggles for which notification categories the user receives. See Section 16.2.

There is **no Sign Out action anywhere in the app** — not in Settings, not on the own-profile screen, not in the drawer. The session is established by Telegram `initData` on every launch, so signing out only breaks the current session and the player cannot choose a different account anyway. The `logout` mutation still exists in `src/api/auth.api.ts` (it clears local tokens) but nothing calls it.

### 16.1 Avatars — Free & Paid Tiers

> 🚫 **SWITCHED OFF SINCE 2026-08-09 — planned back around October 2026.**
> Nothing is deleted anywhere: every avatar surface is commented out behind the
> marker `AVATARS OFF` (grep it, in both repos).
>
> **Mini App** — off: the Settings → Change Avatar row, the profile pencil, the
> Market **Cosmetics** section _and its chip_, avatar slides in the Market showcase
> carousel, the accrued daily-reward card on Tasks, and the equipped-avatar
> engine-speed boost in the UI.
>
> **Backend** — off in step, so no client (not just the Mini App) can reach the
> feature and the two sides never disagree about a cycle: `GET /avatars` returns
> an empty inventory; the engine-speed boost (`EnginesService.avatarBoost`) and
> the tournament-reward boost (`avatarTournamentBoostMap`) are pinned to nothing;
> avatar listings leave the storefront response and `syncAvatarCosmetics` no
> longer runs at boot; `buyCosmetic` refuses an avatar before charging; and
> `POST /avatars/daily-reward/claim` returns `avatars-disabled`.
>
> **Nothing is lost while it is off.** `UserAvatar` ownership rows, the DB avatar
> catalog, the Market listings (with the admin's photo/price edits) and every
> accrued reward pile all stay exactly as they are — the accrual is frozen, not
> wiped, and `GET /avatars/daily-reward` still reports the pile with
> `canClaim: false`. Players keep their Telegram profile photo throughout;
> `Avatar`/`UserAvatar` rendering was never part of this.
>
> ⚠️ **Before switching it back on**, roll the accrual clock forward, or every day
> the feature was off back-pays on the first read:
> `UPDATE "AvatarRewardAccrual" SET "accruedThrough" = date_trunc('day', now() AT TIME ZONE 'utc');`
> `settle()` keeps advancing the clock on its own for any row it touches (the
> switch sits in `rewardingAvatarFor`, taking the same no-pay path a free avatar
> already took), but rows nobody touches for two months stay stale.
>
> One edge left standing on purpose: the milestone **t-263 "Customize your
> avatar"** (+300 LC) scores off `has_avatar`, which any Telegram profile photo
> satisfies, so it still completes for practically everyone — but a player whose
> Telegram account has no photo at all cannot clear it while the picker is gone.
> Pulling a live milestone out of the catalog was judged riskier than the edge.
>
> Everything below describes the feature as it stands and as it will come back.

Avatars are a marketable cosmetic category with **two tiers** and a **10-level progression ladder**:

- **Free avatars** — granted to every user out of the box (Levels 1–2). Visual identity only; no gameplay effect.
- **Paid avatars** — purchased in the Market with Lucky Coins (LC) or Lucky Stars (LS) (Levels 3–10). Every paid avatar carries a **bound boost** (engine speed, market discount, claim multiplier, AP earn, or tournament reward — exact boost type and value are defined by the product team per SKU).

**Level ladder (1 → 10, 10 is the best):**

| Level range | Tier         | Boost magnitude | Visual tier ring   |
| :---------- | :----------- | :-------------- | :----------------- |
| 1–2         | Free         | None            | Neutral / white    |
| 3–4         | Paid (entry) | ~3–5%           | Bronze             |
| 5–6         | Paid (mid)   | ~7–10%          | Silver             |
| 7–8         | Paid (high)  | ~12–15%         | Gold               |
| 9           | Paid (rare)  | ~18%            | Diamond            |
| 10          | Paid (apex)  | ~25%            | Rainbow / animated |

Exact boost percentages per SKU are defined by the product team; the table above describes the **progression shape**, not fixed numbers.

**Current paid avatar line-up** (the `AVATAR_CATALOG` `tier: 'paid'` entries, sold as Market cosmetics):

| Avatar   | Level | Bound boost            | Daily reward | Price               |
| :------- | :---- | :--------------------- | :----------- | :------------------ |
| Champion | 6     | +5% engine speed       | +100 LC      | 500 000 LC / 250 ⭐ |
| Legend   | 9     | +10% tournament reward | +5 ⭐        | 500 ⭐ only         |
| Mythic   | 15    | +8% engine speed       | +8 ⭐        | 1 000 ⭐ only       |

**Why the two stars-paying avatars cannot be bought with coins:** LC is soft
currency the platform mints freely (a single tournament pays out over a
million), Lucky Stars are hard currency sold for money, and the economy has
**no LC→stars conversion anywhere** — stars buy coins, never the reverse.
Pricing a stars-paying avatar in LC would open exactly that valve: a one-off
soft-currency purchase turning into a perpetual hard-currency income. Champion
keeps its dual price because it pays in LC. Enforced by a unit test on the
catalog.

Buying one **charges once and grants permanent ownership** (a `UserAvatar` row): `GET /avatars` then reports it `owned`, and equipping a paid avatar is **gated on ownership** (`PATCH /me` rejects an unowned paid avatar). Re-buying an owned avatar is blocked. The listings are code-canonical (re-synced from the catalog on every boot), so admin price edits reset on restart — change prices in `avatars.catalog.ts`.

**Rules:**

- Avatar ownership is **permanent** — once acquired, the avatar stays in the user's inventory and the bound boost remains available whenever that avatar is equipped.
- **Only one avatar is active at a time** — the boost from the currently equipped avatar applies; boosts from other owned avatars do not stack.
- Equipping is performed from the Settings → Change Avatar picker. Switching avatars is free and instantaneous.
- Avatar boosts **stack with status (Lucky Player/VIP) boosts** and with engine chips/boosters according to their respective rules.
- The picker renders avatars in level order, with a level badge and tier-coloured ring per tile. Level 10 carries an animated rainbow ring/badge to mark it as the apex avatar.

**Daily reward — accrual & collection:**

The daily reward of the **equipped** avatar accrues once per UTC day and **never
expires**: it piles up until the player collects it, and the whole pile is
granted in one action. The Tasks screen shows a collect card above the frequency
tabs whenever something is pending (and nothing at all otherwise, since most
players wear a free avatar); the amounts also appear as `avatar_reward` rows in
the LC / Lucky Stars histories.

- `GET /avatars/daily-reward` → `{ avatarId, avatarName, ratePerDay, pendingLc, pendingStars, daysAccrued, canClaim, lastClaimedAt }`. Reading settles first, so the figure is always current.
- `POST /avatars/daily-reward/claim` → credits the balances, zeroes the pile, writes the ledger rows (one transaction; 400 `nothing-to-claim` when empty).
- **Only an owned avatar pays.** A paid avatar that is equipped but not owned accrues nothing — the same "equipped **and** owned" rule the engine-speed and tournament-reward boosts use.
- **No back-pay.** The accrual row is created the first time a player touches the feature and starts counting from that day, so avatars bought before the mechanism existed do not pay retroactively.
- **Days pay at the rate of the avatar actually worn.** Swapping avatars settles the accrual against the avatar being taken off first, so idling in a cheap avatar and switching to an expensive one before collecting does not upgrade the accrued days.
- Because a swap can settle LC and Lucky Stars into the same pile, both currencies can be pending at once, and the day count is tracked rather than derived from an amount.

### 16.2 Notification Preferences

Two channels are supported: **Email** and **Telegram bot**. Each channel has its own independent set of category toggles. Categories cover the high-signal events:

- **Tournament start** — fires ~10 minutes before a joined tournament begins.
- **Tournament end** — fires after final places are announced.
- **Staking ready** — fires when a stake is mature and ready to claim.
- **System** — security, status, and account-related alerts.

Toggles are saved instantly (no submit button). Categories not listed here are not exposed as user-toggleable preferences.

**What a toggle actually silences.** The wording is exact: a toggle controls the **email and Telegram bot** channels, never the in-app feed. The notifications screen is an inbox — muting a category there would delete the player's own history of it, which is worse than the noise it saves — so the feed row is always written and the toggle only decides whether a bot DM goes out beside it. A category with no DM behind it (an admin announcement, a referral, an achievement) is feed-only whatever the toggle says.

**Wired as of 2026-08-05:** Telegram DMs exist for **Tournament start**, **Tournament end** (winners only), **Staking ready** and **Gifts**, and each is gated by its own toggle. The **Email** channel has no sender behind it at all — the toggles persist, but no email is ever dispatched, and the column stays in the UI for the day one exists. **System** has no DM either; it is feed-only.

**Language.** System notifications are rendered in the recipient's account language at the moment they are written, and stored that way — the same rule the bot DMs already followed. Switching language afterwards does not retranslate notifications already delivered.

**The inbox itself.** The notifications screen is a cursor-paginated feed: **20 rows a page**, the next page loading by itself as the end of the list comes into view (with a "Load more" button as the explicit fallback). Filtering is done by the server, so a chip narrows the whole inbox rather than the pages already on screen — and the counts on the chips, in the hero card, and on the header bell come from a separate whole-inbox summary for the same reason. This replaced a flat newest-100 list, which stopped being enough the moment a tournament result was written for every participant: an active player collects roughly four rows a day, so a fixed hundred was about three weeks of history and everything older was simply unreachable.

**Blocking the bot mutes the Telegram channel entirely**, whatever the toggles say — Telegram refuses every message from a bot its user has blocked, and there is no in-app way to override that. The platform records the block the moment it happens (Telegram announces it once, as a `my_chat_member` update, and never answers the question again afterwards), stops counting the player as a broadcast recipient, and clears the mark by itself when they unblock or press Start again. Nothing else changes: a block is not a ban, the account keeps playing, keeps earning and keeps its balances.

Because the signal only exists at the moment of the block, the record is **forward-only** — anyone who blocked the bot before 2026-08-05 is indistinguishable from a reachable player, and "not marked as blocked" therefore means "no block observed", never "confirmed reachable".

---

### 16.3 Email Confirmation & Verification Gift

Changing (or first linking) an email address always goes through a confirmation code:

1. The user enters the address in Settings → Email and requests a code.
2. The backend emails a **6-character code** (A–Z / digits, ambiguous glyphs excluded) valid for **10 minutes**.
3. The user types the code back; on match the address is written and the account is marked **verified**.

**Anti-abuse rules:** resend is throttled to **1/minute**, code requests to **10/day**, and a code dies after **5 wrong attempts**. An address already used by another account is rejected at both request and confirm time. The email cannot be changed any other way — the legacy direct save (`PATCH /me` with `email`) is accepted but ignored.

**Verification gift.** The **first** successful confirmation grants a one-off gift. Its composition is **admin-configured** (Admin Panel → Настройки → Email): any mix of AP / LC / Lucky Stars / tickets of a chosen tier, plus an on/off switch. Default: **20 AP** (the "Verify email" AP source in Section 5.3). The gift is granted once per account ever — changing the address later re-runs the confirmation flow but never re-grants the gift. The settings screen shows the currently configured gift next to the email field; a confirmation that granted the gift celebrates with a reward reveal.

## 17. Additional Features

### 17.1 Support Section

Provides assistance through:

- **Articles:** Detailed guides on how to use the platform.
- **Language Selection:** Switch between supported languages.
- **Notifications:** Manage alerts for system events and rewards.

### 17.2 Invite Friends

Encourages growth through referral rewards. Users can track their invited friends and view details such as:

- Invited friend count, **and how many of them currently count as referrals** (see below).
- Friend's status (Verified, Lucky Player, VIP).
- Friend's Activity Points.
- Friend's username and avatar.
- Whether the friend counts as a referral, and if not — why.

**How a referral is established:**

Each user's invite link is a Telegram deep link — `https://t.me/<bot>?startapp=<referrerId>`. When a friend opens it, Telegram delivers `<referrerId>` as the `start_param` inside the signed `initData`. On the friend's **first** sign-in the backend records the referral (referrer → new user) and pays the inviter the signup reward below. The link is captured only at registration: a user who already has an account cannot be retro-attributed to a referrer, and each user can be referred at most once (self-referral is ignored).

**Friend vs referral — who actually counts.** Everyone who arrives through the link is a **friend**, permanently: the relationship is recorded once and nothing takes it away. A **referral** is the narrower, _live_ thing the friends screen reports — a friend who is currently **subscribed to the official channel** and has **not blocked the bot**. Someone who joined through a link, never opened the channel and blocked the bot is still listed as a friend, still keeps whatever they already generated, but stops counting as a referral — and stops paying (§17.2).

Three things can disqualify a friend — Telegram confirms they are not a channel member, `User.botBlockedAt` is set, or Telegram would not answer at all (outage, 429, unconfigured bot). **The screen no longer distinguishes them.** Since the split became an economy rule the question a player has is "does this person pay me", which has two answers, so a disqualified row carries one neutral «не засчитан» badge and the rule itself is stated once above the list. The three reasons still exist server-side (`notCountedReason` on the endpoint) for support and future admin surfaces.

Like every other channel gate since 2026-08-04 the rule **fails closed**: only a confirmed yes counts, so while Telegram is unreachable the referral number reads low and refills by itself once it answers. That is also exactly why the LC reward is gated on the CLAIM rather than on the accrual — an outage must be able to delay money, never destroy it (§17.2).

Both halves of the rule are admin-switchable (`referralConfig.qualification.requireChannelSubscription` / `.requireBotNotBlocked`); with both off every invited friend counts again, nothing is asked of Telegram at all, and the screen stops stating the condition. The switches exist as the escape hatch for a long Telegram outage — turning them off is the one fix that does not itself depend on Telegram.

**One endpoint owns the rule.** `GET referral/friends` carries `countsAsReferral` + `notCountedReason` per friend; `GET referral/stats` stays a single cheap `COUNT` (`totalInvited` plus the two rule flags) and deliberately does **not** report the referral count. Both endpoints fire together when the screen opens, so computing it in each meant resolving the whole roster against Telegram twice on a cold cache — for the largest referrer on prod (248 friends) that is ~496 `getChatMember` calls to render one screen. The Mini App derives the count from the list it already loads (`useReferralCounts`), which also makes it impossible for the header to disagree with the rows beneath it.

**What the rule does and does not reach.** It governs exactly one thing: whether the **tournament LC reward** can be claimed off that friend (§17.2). Everything cumulative still reads the raw lifetime `User.referralsCount` — **tier requirements** (§5.2), the **wallet connect/withdraw gates** (§16.4) and the **Friends milestone chain** (§21). That is deliberate and not an oversight: those are irreversible things a player already holds, and recomputing them from a live count would demote someone out of Gold, or shut the withdrawal of a player who had already passed the gate, because a friend left a channel. The signup reward is likewise still paid at registration, when no verdict exists yet. The tier ladder on the friends screen therefore draws **all invited friends**, and says so in a note whenever the two numbers differ; drawing the narrower number there would show "7/10 до Gold" to a player who is already Gold.

**Share flow:** On Telegram clients with Bot API 8.0+, tapping **Share invite** sends a **rich invite card** instead of a bare link — a branded 1280×720 image with a localized caption and a "Play" button carrying the `?startapp=<referrerId>` deep link. The backend prepares it per tap (`POST referral/prepare-share`, one-time-use message via Bot API `savePreparedInlineMessage`), and the Mini App forwards it through the native chat picker (`WebApp.shareMessage`). On older clients — or if preparation fails — the flow falls back to the plain `t.me/share/url` link share; outside Telegram it uses the OS share sheet or copies the link.

**Editing the card:** the image, the caption and the button label are admin-controlled — panel → **Настройки → Рефералка**, with a live mock of how the card lands in a chat. They live in the referral config (`PlatformConfig.referralConfig.share`), and any field left empty falls back to the copy built into the backend, so a half-filled form never ships a card with holes in it. The **link itself is deliberately not editable**: it carries the `?startapp=<referrerId>` of whoever is sharing, so an admin-typed URL would silently break attribution for every invite sent. The plain-link fallback text is Mini App i18n, not a panel setting.

**Picture:** one shared banner (`share.imageUrl`) plus an optional per-language override (`share.images[locale]`). Empty means "use the shared one", so a single banner stays a single field and a language only diverges when someone gives it its own. Ladder per send: this language's picture → the shared one → `INVITE_SHARE_IMAGE_URL` → the built-in banner.

**Caption mode** (`share.captionMode`) picks where the copy comes from:

| Режим                   | Что уходит                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `perLocale` (умолчание) | Подпись на языке **отправителя** — ru / en / de правятся отдельно; армянский идёт из кода (в мини-аппе он выключен, поля для него нет). |
| `shared`                | Одна подпись всем отправителям, независимо от их языка.                                                                                 |
| `none`                  | Подписи нет вообще: только картинка и кнопка.                                                                                           |

The recipient's language is **not** available at any point and never can be: `savePreparedInlineMessage` fixes the card's content before the sharer picks a chat, and `WebApp.shareMessage` reports only `sent: true/false` — never who received it. So `perLocale` means "each player sends in _their own_ language", not "each friend reads it in theirs"; `none` is the only mode that cannot land in the wrong language. The Mini App the friend opens is localized for them regardless.

**Referral Benefits:**

- **Signup Reward:** The moment a referred friend registers, the inviter is credited a one-off reward — **10 AP + 1 Lucky Star**, the same for every invited friend. It used to double to 20 AP + 2 Lucky Stars for a **Telegram Premium** invitee; that priced a friend by something the inviter cannot influence — whether the person they happen to know pays Telegram — and made an ordinary friend read as the lesser catch. The doubling is gone from both the screen (one line: what an invite pays) and the mechanic. `referralConfig.signup.premiumAp` / `.premiumStars` still exist, hold the same values as the flat pair and are read by nothing; they survive so a config written before the change still round-trips through an admin save. This is granted instantly (unlike the tournament reward below, which accumulates and must be claimed). It is **not** conditioned on the friend qualifying as a referral — at registration nobody has joined a channel yet, and the payment cannot wait for a verdict that does not exist.
- **Per-invite reward ladder (admin-controlled):** the admin can replace the flat signup reward with a ladder (panel → Настройки → Рефералка → «Награды по номеру друга»): the N-th invited friend grants ladder entry N — any mix of AP, LC, Stars, and tickets of a chosen tier — cycling back to the first entry once invites outrun the ladder. While a ladder is set it applies to all invitees (the Premium doubling does not apply); clearing the ladder restores the flat signup reward.

The ongoing half is a cut of what a friend WINS:

- **Tournament LC reward:** whenever a referred friend takes a prize in a tournament, **5%** of that prize accrues to the inviter as claimable LC (`referralConfig.tournamentLcPct`, admin-tunable, `0` disables it). The number is **flat — the friend's status does not change it.** It replaced a four-step ladder keyed to the friend's account (5 / 10 / 15 / 25% for regular / Premium / Lucky Player / VIP), which was both impossible to state in one sentence on the screen and a perk that paid the wrong person: being VIP raised what somebody _else_ collected off you. The VIP/LP "referral %" perk line is gone from both status perk lists with it.
- **Minted on top.** The friend's own prize is untouched — a 10 000 LC win pays the friend 10 000 and mints 500 for the inviter. Rounding is always **down**, so a prize too small to pay a whole coin pays nothing rather than inventing one.
- **The prize only, never the jackpot.** A jackpot drop (§20.3) redistributes LC that already exists; paying a commission on it would mint new coins against a fixed pot, so `jackpotLc` is excluded and only the placement prize (status/avatar boosts included, as actually credited) counts.
- **Accrued inside the finish transaction.** The commission rides in the same `$transaction` as the payout that produced it and under the same compare-and-swap that makes a double finish impossible — a commission can never outlive a prize that rolled back.
- **Claim Mechanic:** the LC is not credited instantly — it accumulates per friend and is claimed from the friends screen, individually or with «Забрать всё».
- **Only a live referral pays out, and it freezes rather than burns.** The claim — not the accrual — is gated on the friend counting as a referral right now (§17.2 above). Accrual is deliberately ungated: resolving Telegram inside the finish transaction would let a `getChatMember` timeout silently destroy a commission with no way to recover it. So the pile keeps growing, the row shows it locked, and it becomes claimable the moment the friend rejoins the channel or unblocks the bot. `POST referral/claim/:friendId` answers **403** `{ error: 'not-a-referral' }` when the only thing pending is gated LC.
- **Legacy ticket commission.** Before this, the inviter earned a % of the _tickets_ a friend claimed from engines. Nothing accrues there any more, but existing `ReferralClaimable` rows were **not** wiped: the same claim button still pays them out, ungated (they were earned under a rule that made no such demand), and the balance drains to zero on its own. The friends screen shows the ticket stack only while a friend still has one.

**Two lists, not five filters.** The friends screen is two tabs — **Друзья** (everyone who ever arrived through the link) and **Рефералы** (the ones currently paying). A friend who stopped counting carries one neutral «не засчитан» badge; the earlier three-way reason (left the channel / blocked the bot / could not check) is no longer shown per row, because the screen now has exactly two states and the rule that separates them is stated once above the list.

### 17.3 Profile Page (Statistics)

A dedicated section where users can view their performance, transaction history, and detailed progression metrics. The page renders in **two modes**:

- **Own view** — the user looking at their own profile. Has access to private balances, transaction history, settings, and all editing actions.
- **Public view** — any other user looking at this user's profile. Sees the same hero, showcase, and social statistics, but financial balances and transaction history are hidden, and editing actions are replaced by social actions (Send Ticket, Invite to Tournament, Share, Like).

Both modes share the same overall composition and animations — the differences are scoped to which sections render and which actions are exposed.

#### 17.3.0a Routing & Entry Points

- The public profile route is **`/profile/:userId`**.
- **Every avatar in the app is clickable** and opens the corresponding user's public profile — including (but not limited to): the Leaderboard, Friends list / Invite Friends section, Tournament participants list, Referrals list, and any other surface that renders a user avatar.

#### 17.3.0b Telegram WebApp Integration

The Profile page is built to run inside a **Telegram WebApp** when available, with a graceful fallback to a regular web context:

- When running inside Telegram WebApp, the user's identity (Telegram user id, name, default avatar) is sourced from the WebApp `initData`. Sharing the profile uses the native Telegram share API.
- When running outside Telegram WebApp, the page falls back to placeholders for the missing data; sharing falls back to copying the profile link to the clipboard.

#### 17.3.0 Own vs Public — Visibility Matrix

| Element                                                                                     | Own view |    Public view     |
| :------------------------------------------------------------------------------------------ | :------: | :----------------: |
| Avatar, banner, username, status badge                                                      |    ✅    |         ✅         |
| Activity Points                                                                             |    ✅    |         ✅         |
| Activity flame / streak                                                                     |    ✅    |         ✅         |
| Badge showcase (pinned)                                                                     |    ✅    |         ✅         |
| Total badges earned count (e.g., 47 / 120)                                                  |    ✅    |         ✅         |
| "View all" badge grid                                                                       |    ✅    |         ✅         |
| Public social stats (tournaments played/won, stakes completed, tickets sent, friends count) |    ✅    |         ✅         |
| Likes received                                                                              |    ✅    |         ✅         |
| Friends preview (avatars row)                                                               |    ✅    |         ✅         |
| **LC / LS / TON balances**                                                                  |    ✅    |         ❌         |
| **Transaction history entry**                                                               |    ✅    |         ❌         |
| Per-tier ticket inventory counts                                                            |    ✅    |         ❌         |
| Email / phone / 2FA / Settings entry                                                        |    ✅    |         ❌         |
| Edit avatar / username / banner                                                             |    ✅    |         ❌         |
| Pin / Replace / Unpin badge menu                                                            |    ✅    |         ❌         |
| Share own profile                                                                           |    ✅    |         —          |
| **Send Ticket / Like** the profile owner                                                    |    —     |         ✅         |
| **Invite to Tournament**                                                                    |    —     | only own referrals |
| **Share** this profile                                                                      |    —     |         ✅         |

#### 17.3.1 Page Composition (top to bottom)

1. **Hero Header**
   - Large **avatar** with an **animated rotating gradient ring** around it. Ring color reflects the user's current status (Verified / Lucky Player / VIP). Ring fill represents **progress to the next Activity Points threshold**.
   - Cover **banner image** at the top of the page (cosmetic; customizable via the Market). _Banners are not a surfaced Market category today — see §19.3 deferred list._
   - **Username** rendered with a **multi-status shine cycle**: the username's glow effect cycles through styles representing every status the user currently holds. Example: a user with Verified + Lucky Player + VIP cycles through Verified-blue glow → Lucky Player-purple glow → VIP-holographic glow (~2s per phase, looped). A user with a single status displays only that one effect.
   - **Status badges** displayed beside the username (Verified / Lucky Player / VIP X).
   - **Decorative badge collage** — three semi-transparent badge silhouettes drift slowly behind the avatar/name. The three slots are **user-selectable**, similar to showcase pinning: the user actively picks which badges appear in the background. Empty slots simply do not render.
   - **Activity flame** indicator next to the avatar (e.g., 7🔥 / 30🔥 / 100🔥) that pulses while the streak is active.

2. **Quick Stats Row** — four pill cards with count-up animation on first render: Activity Points, LC, LS, TON.

3. **Badge Showcase** — pinned badges (3 slots) with a "View all" entry to the full badge grid (see Section 17.4).

4. **Recent Achievements** — a horizontal carousel of the last 3–5 unlocked badges.

5. **Detailed Statistics** — collapsible sections per system: Tickets, Tournaments, Stakes, Tasks. Each section shows the relevant counters and personal bests.

6. **Friends Preview** — first 5 friend avatars with a "See all" link to the full Invite Friends page.

7. **Transaction History Entry** — a link/CTA opening the full transaction history on the Wallet page.

> Animation principles: every list, grid, and stats row uses staggered entry (`animationDelay` 50–100ms per child). Hero elements (avatar ring, holo username, flame) animate idle; decorative collage drifts slowly.

#### 17.3.1a Banner Decorative Icons

Layered over the cover banner are three small **decorative icons** (a crown, a star, and a gem) — purely cosmetic flair, semi-transparent, with a slow idle drift and a staggered entry that flies each icon out from behind the avatar on load. These are **distinct** from the decorative badge collage (item 1 above): the collage sits behind the avatar/name and is badge-based, whereas these icons sit on the banner and are freely positioned.

- **Owner-arranged.** On their **own** profile (and not while in _Preview as visitor_), the owner can **drag** each icon to reposition it on the banner. Other viewers see the icons but cannot move them.
- **Avatar-safe placement.** Icons are constrained to stay within the banner **and outside the avatar's circular zone** — a dragged icon that would overlap the avatar is pushed to the nearest valid spot, so the avatar is never covered.
- **Server-persisted, last write wins.** Each drag's final position is saved to the backend (keyed per icon), so the arrangement persists across sessions and devices; the most recent edit is the one kept.
- **Public, per-user.** The saved arrangement is part of the profile and is **shown to everyone** who opens it (read-only for visitors). Icons with no saved position fall back to a default layout.

#### 17.3.2 Actions — Own Profile

When viewing one's own profile, the following actions are available:

- **Edit avatar** — _(switched off since 2026-08-09 — Section 16.1)_ opens the avatar picker. The picker is also reachable from Settings (Section 16). New avatars are acquired in the Market; paid avatars carry a bound boost (see Section 16.1). The avatar itself still renders; only the pencil is gone.
- **Edit username** — routes to Settings (see Section 16).
- **Change cover banner** — selects from owned banners. Premium banners are purchased in the Market with Lucky Stars (not a surfaced category today — §19.3).
- **Pin / Replace / Unpin badges** — managed via the showcase long-press menu (see Section 17.4.7).
- **Pin / Replace decorative collage badges** — same long-press menu pattern, but on the three background-collage slots in the hero header.
- **Arrange banner icons** — drag the decorative banner icons (crown / star / gem) to reposition them on the cover banner; positions save automatically and are shown publicly. Icons cannot be placed over the avatar (see Section 17.3.1a).
- **Preview as visitor** — a toggle button (typically in the top-right of the hero) that switches the page into the **Public view** of the user's own profile. While in preview, the page renders exactly as another user would see it — private balances, edit affordances, and Settings entry are hidden; social actions (Send Ticket, Invite to Tournament, Share, Like) appear on the action row but are non-functional (visual only). A persistent "Exit preview" button returns to Own view. Preview never modifies any data.
- **Share own profile** — copy link or share via Telegram.
- **Open Settings** — entry to the Settings & Security page (Section 16).

#### 17.3.3 Actions — Other User's Profile

When viewing another user's profile, the following actions are available (typically rendered as a row of buttons in the hero header):

- **Send Ticket** — opens the ticket-sending modal (selects tier and quantity from the user's owned tickets). Mirrors the Send action defined in Section 8.2.
  - **Daily limit per recipient, by tier.** Bronze / Silver / Gold are sendable by everyone — **1 each per day** to a given player. **Platinum and Diamond require Lucky Player status.**
  - With **Lucky Player**, the per-recipient daily limits rise to **Bronze 5 / Silver 4 / Gold 3 / Platinum 2 / Diamond 1**.
  - The free table is `TICKET_SEND_DAILY_LIMITS.default`; a status adds `statusPerks.ticketSendDailyBonus` on top (§7.3).
- **Invite to Tournament** — opens a picker of upcoming tournaments and sends the target an in-app invite (a notification carrying a deep link to that tournament).
  - **Only one's own referrals can be invited.** The action is offered exclusively on the profile of a player who joined through the viewer's link; on anyone else — a stranger from the leaderboard, a shared profile link — the button is **not rendered at all**, and `POST profile/invite-tournament` answers **403 `{ error: 'not-your-referral' }`** if it is called anyway. The gate is on the invited person, not on the tournament: what a player can invite to is every upcoming tournament, whom they can invite is only the people they brought into the game.
  - The button is absent rather than disabled on purpose. Referral attribution is frozen at the invitee's first sign-in (§17.2) — a player who is not already your referral can never become one — so a greyed-out button would promise an unlock that nothing the viewer does can deliver. This is the opposite of the wallet invite gates (§16.4), which are shown locked precisely because inviting more friends does open them.
  - `GET profile/:id` carries the verdict as **`isMyReferral`** so the Mini App never draws an action the API is about to refuse. It is false on one's own profile.
  - Without the rule every profile in the leaderboard is a free notification channel into a stranger's Telegram; the invite exists to pull back the people a player already invited, which is also why it costs nothing to send.
- **Share profile** — copy link or share via Telegram.
- **Like** — see Section 17.3.4.

> Like is the only social signal action; chat, follow, send-currency, block, and report are intentionally not included.

#### 17.3.4 Profile Likes

Likes are a lightweight social signal that other users can give to a profile.

- **Mechanic:** Each user may like a given profile **once per 24 hours**. After 24 hours have elapsed since the last like, the same user can like the same profile again. There is no global lifetime cap.
- **Display:** The total received like count is visible on the profile (e.g., "❤ 234"). The button toggles its visual state for the viewer based on whether their daily like is currently active.
- **Achievement integration:** Likes received contribute to the **Social** badge category — milestones at 100 / 1,000 / 10,000 received likes (exact tiers defined by the product team).
- **No reverse-mechanic:** Likes do not grant LC, LS, or any other reward to either party. They are a pure vanity signal that ties into the badge progression system.

### 17.4 Badges & Achievements

#### Purpose

Badges and Achievements add a long-term collection meta-game on top of the core systems. They convert milestones, mastery, and rare accomplishments into a visible, persistent identity layer that other users can see when viewing each other's profiles.

#### Description

LuckyTicket365 ships with a deep collection of **100+ badges and achievements** spread across many categories. Every meaningful action in the platform contributes to one or more badges. Badges are non-tradeable — they are tied to the account that earned them.

#### 17.4.0 Where badges come from — the one-time milestones

The badge catalog is **not authored separately**. It is a projection of the one-time milestone catalog (Section 12.6): **a badge is a milestone, re-presented as a collectible** — same target, same counter, same copy in all four languages. The current catalog is **118 badges** — 85 arranged into 14 chains, plus 33 singles — built in code by `achievements.catalog.ts`.

Three rules fall out of that, and guardrail tests hold them:

- **Badges pay nothing.** The milestone behind the badge already paid; a second reward here would be exactly the multi-dipping the 2026-07 rebalance removed.
- **No counter, no badge.** Milestones with no honest data source (manual "share your result", partner follows) are skipped rather than shown with a progress bar nobody can verify.
- **Earned is derived, never granted.** A badge is earned when the player's live counter reaches the target, evaluated the same way the task screen evaluates progress. The stored row records the unlock date and the showcase pin; it is a record of the fact, not its source. (Until this shipped, one ticket claim marked the **entire** Tickets category earned, regardless of any threshold.)

Rarity climbs with the step inside a chain (Bronze → Silver → Gold → Platinum → Diamond → Diamond+), so a chain reads as a collection; singles keep the rarity of the milestone they mirror. The catalog is code-canonical and re-synced on every boot, like the task and market catalogs — badges dropped from the catalog are deleted, and the profile rows pointing at them cascade away.

#### 17.4.1 Categories

Badges are organized into themed categories. Final list and per-category counts are defined by the product team; representative categories include:

- **Status:** Verified, Lucky Player active, VIP I/V/X/XX/…
- **Stakes:** Completed Level 1/2/3/4, total stakes completed, no-cancel streaks
- **Tickets:** Claimed thresholds per tier (e.g., 100 / 1k / 10k Bronze, Silver, Gold, Platinum, Diamond)
- **Engines:** Own all five tiers, own N engines, first Capacity Upgrade installed, total Speed Boosts used
- **Tournaments:** Participated in N tournaments, won 1 / 5 / 25, first partner tournament win
- **Streaks:** 7 / 30 / 100 / 365 consecutive days in app
- **Activity Points:** AP milestones (1k / 10k / 100k cumulative)
- **Leaderboard:** Reached Top 100 / Top 10 / Top 3 / #1 (weekly / monthly / all-time)
- **Social:** Invited 1 / 5 / 25 / 100 friends, invited a Telegram Premium friend, sent N tickets
- **Finance:** Earned cumulative LC, first withdrawal, Lucky Stars earned/spent thresholds
- **Tasks:** All Daily for a week, all Weekly for a month, all Monthly completed
- **Exclusives & Rare:** OG (registered in first N days), seasonal events, partner-specific, beta-tester

#### 17.4.2 Rarity Tiers

Every badge has a rarity that drives its visual treatment and the intensity of its animation effects:

- Common
- Rare
- Epic
- Legendary
- Mythic

> Exact rarity distribution per category is defined by the product team.

#### 17.4.3 Visual Style

Badges follow a **hybrid visual language** based on rarity:

- **Common / Rare:** Premium metal finish — dark base, metallic frames (bronze / silver / gold), subtle highlight
- **Epic / Legendary / Mythic:** Neon abstract — gradient accents (pink / teal / electric-purple), glow, shine sweep, holographic effects on Mythic

Badge **shapes vary per category** — the silhouette itself signals what kind of accomplishment it is (e.g., shield for tournaments, crystal for stakes, hexagon for engines, circle for social, abstract polygon for exclusives). Final shape mapping is defined by the product team.

#### 17.4.4 Animations

Animation intensity scales with rarity:

- **Idle pulse:** subtle breathing glow (all rarities)
- **Shine sweep:** angled highlight passes across the badge periodically (Rare+)
- **Rotating gradient ring:** animated border (Epic+)
- **Holographic shift:** iridescent surface (Mythic)
- **Particle burst:** one-time confetti/spark animation when first unlocked
- **Tap response:** scale + ring pulse on press
- **Stagger entry:** badges enter the profile with sequential `animationDelay` (50–100ms steps)

#### 17.4.5 Locked vs Unlocked Display

**All badges remain visible** to the user — both earned and not yet earned:

- **Earned:** full color, full animations, unlock date displayed
- **Locked:** desaturated/dimmed, lock icon overlay, **progress indicator** (e.g., 5 / 10 tournaments) showing how close the user is

This visibility drives motivation and gives users a complete map of what's possible.

#### 17.4.6 Badge Detail Modal

Tapping any badge opens a detail modal containing:

- Large rendering of the badge with full animations
- Title and description
- Earned date (or "Not yet earned")
- Unlock criteria and current progress
- Rarity tier
- **Holders ratio:** percentage of all users who own the badge — reinforces rarity and prestige

#### 17.4.7 Showcase & "View All"

The Profile page presents badges in two layers:

- **Showcase (top of profile):** A featured selection of pinned badges displayed prominently with full animations. This is the badge view shown to other users when they visit the profile.
- **"View all":** Opens the complete grid of every badge in the system (earned and locked) with their progress and detail modals.

#### 17.4.8 Pinned Badges (Showcase Slots)

Users actively choose which badges appear in their showcase by pinning them into slots:

- The showcase has **exactly 3 slots**, granted to every user for free.
- Paid slot expansion is **disabled** (`showcaseMaxSlots` equals the free count). The buy-slot flow (endpoint, mock, "+slot" UI, and the progressive LS price curve in `calcShowcaseSlotPrice`) remains in the codebase in a dormant state and reactivates by raising `showcaseMaxSlots` in `global.constants.ts`.

#### 17.4.9 Other-User Profile View

When a user opens another user's profile, the badge showcase is fully visible — including animations — and acts as that user's identity statement. Tapping any badge opens the same detail modal, allowing users to compare collections and discover badges they don't yet have.

#### 17.4.10 Badge Data Model

Each badge in the system carries the following fields (delivered by the backend `/badges` endpoint):

- `id` — unique identifier
- `name` — localized name
- `description` — localized description and unlock criteria
- `category` — Status / Stakes / Tickets / Engines / Tournaments / Streaks / Social / Finance / Tasks / Leaderboard / Activity Points / Exclusive
- `rarity` — Common / Rare / Epic / Legendary / Mythic
- `shape` — shield / crystal / hexagon / circle / abstract polygon (drives silhouette per category)
- `iconUrl` (or icon code) — visual asset
- `earned: boolean`
- `earnedAt?: timestamp` — when the user earned it
- `progress?: { current: number, target: number }` — for locked badges with measurable progress
- `holdersPercentage: number` — share of all users who own the badge (drives the rarity-perception UI)
- `isPinned: boolean` — currently in the showcase
- `pinnedSlot?: number` — slot index (0–2) if pinned
- `tier?: { current: number, max: number, thresholds: number[] }` — tier inside a single badge that levels up (e.g., one "Bronze Claimer" badge that progresses through 100 / 1k / 10k claims rather than three separate badges)
- `series?: { id: string, name: string, position: number, total: number }` — group of related badges (e.g., "Stake Master Level 1–4" all share a series)
- `hidden: boolean` — secret badge: invisible in the full grid until earned (used for exclusives, Easter-eggs, OG/limited badges)
- `unlockReward?: { type: 'lc' | 'ls' | 'ticket' | 'boost' | 'capacity', amount?: number, ticketTier?: string }` — bonus granted to the user the moment the badge is earned (extra motivation layer on top of the badge itself)
- `expiresAt?: timestamp` — for seasonal/event badges with a deadline (after expiry, the badge becomes locked-with-no-progress unless already earned, and earned ones may be marked as a "legacy" exclusive)
- `relatedTo?: { type: 'tournament' | 'partner' | 'event' | 'engine', id: string }` — links the badge to a specific entity (a partner tournament badge points at the partner, etc.)
- `shareable: boolean` — whether the user can share the badge externally
- `shareUrl?: string` — when shareable, the URL used by the share action

> Hidden badges (`hidden: true`) are not returned in the catalog listing for users who have not yet earned them. The user only discovers their existence by triggering the unlock condition.

#### 17.4.11 Unlock Notification

When a user earns a new badge, the platform notifies them:

- **Common / Rare:** in-app toast with the badge thumbnail
- **Epic+:** full-screen celebration modal with the badge animation, particle burst, and a CTA to view detail or pin to showcase

#### Connections

Badges connect to virtually every system in the platform: Status (Section 7), Tickets (Section 8), Engines (Section 9), Tournaments (Section 11), Tasks (Section 12), Leaderboard (Section 13), Wallet (Section 15), Stakes (Section 18), Lucky Stars (Section 19), and the Profile page (Section 17.3). They serve as the visible aggregation layer over all user activity.

---

### 17.5 Onboarding Tour

A first-run **guided tour** introduces a brand-new player to the whole app — what each area is and how to play. It targets a **level-zero account** (0 AP, and **no engine yet** — the free Bronze engine is granted after the language step below; see Section 9) and runs as an **interactive spotlight walkthrough**: the screen dims, the relevant on-screen element is highlighted, a short caption explains it, and an **animated hand** points at the spotlight and mimics a tap so the player sees exactly where to press. The tour **navigates itself** between screens; on each one the player taps the highlighted element to advance (there is no "Next" button).

#### Language selection (first run)

Before the very first tour, a **language picker** is shown to the brand-new account. The player chooses the UI language (English, Armenian, Russian, German); the choice is persisted in the `locale` cookie, applied immediately, and the guided tour then runs **in the chosen language** (every tour caption is localized). The selection defaults to the current locale, so a player who just wants English taps **Continue**. After confirming the language, a **welcome-gifts screen** presents the brand-new account's starter pack — **1 Bronze engine, 5 Bronze tickets, and 1 activity point** (Section 9.2) — and tapping **Claim** grants them (the account has none until this point) before the tour begins, so its first step has an engine to spotlight. A search field filters the list (by native name, English name, or locale code) and the list scrolls, so the picker scales to a large language catalogue. The picker and the tour share one trigger (see _Trigger & Persistence_); the language can still be changed any time later via Settings → Language.

#### Steps

The tour visits ten stops, in order:

| #   | Screen         | Highlights                      | Teaches                                          |
| --- | -------------- | ------------------------------- | ------------------------------------------------ |
| 1   | Home           | The free Bronze engine          | It mints tickets automatically                   |
| 2   | Header         | The LC pill                     | LC **is** Lucky Coin — how it's earned and spent |
| 3   | Tickets        | The tickets summary             | Where minted tickets collect                     |
| 4   | Tournaments    | A tournament card               | Spend tickets, win LC + chips                    |
| 5   | Tasks          | The task tab rows               | Earn AP and rewards                              |
| 6   | Header         | The AP pill                     | AP is progression, Bronze→Diamond                |
| 7   | Stakes         | The stakes summary              | Lock LC for yield + AP                           |
| 8   | Invite Friends | The referral hero               | Earn a share from friends                        |
| 9   | Home           | The engine's **Claim** button   | Claims the first ticket                          |
| 10  | Tournaments    | The first tournament's **Join** | Enter the first tournament — the finale          |

Step 2 lands early on purpose: every later caption (tournament prizes, stake yield, market prices) is denominated in LC, and a brand-new player has no way to know that the "LC" in those captions and the "Lucky Coin" they win are the same currency. It names the abbreviation, points at the live balance pill, and states both sides of the loop — earned in tournaments / tasks / stakes, spent on tickets, engines and statuses (Section 6.1).

The last two steps perform a **real action**: the player claims their first ticket, then taps **Join** on the first tournament to enter it (opening the join sheet) — the finale. After the claim step the tour briefly waits for the claim animation to finish (so the ticket actually mints) before navigating to Tournaments. Every other step is acknowledged with a tap. A **Skip tour** control is always available, and pressing Escape exits.

#### Trigger & Persistence

- **First-run flow:** for an account with `activityPoints === 0` that has not seen the tour, the `Onboarding` orchestrator shows the **language picker first**, then starts the guided tour once the language is confirmed — gated by the `appConfig.onboardingTour.autoStart` switch (set it to `false` to suppress the whole first-run flow — picker and tour — while testing the rest of the app).
- **Completion** (finishing or skipping) is persisted on the user via `hasSeenTour`, so it does not reappear.
- **Replay / reset:** Settings → _App tour_ offers "Take the tour" (run it any time, ignoring the flag) and "Reset onboarding" (clear `hasSeenTour` so it auto-shows again for a level-zero account).

#### Extending the Tour

Steps are defined declaratively in one place (`TOUR_STEPS` in `onboarding-tour.constants.ts`). Adding a step requires no engine changes: add a step object, put a `data-tour="<anchor>"` attribute on the element to highlight, and add its two translation keys (title + body) to every locale file (`en` / `ru` / `hy` / `de`). A step may also set `secondaryAnchor` to a second `data-tour` value — the spotlight then covers the **union** of both boxes (used by the Tasks step to highlight its two tab rows: the frequency tabs plus the sticky category nav, which can't share a wrapper without breaking its sticky scroll).

#### Connections

The tour spans Home / Engines (Section 9), Currency (Section 6.1), Tickets (Section 8), Tournaments (Section 11), Tasks (Section 12), Activity Points (Section 5), Stakes (Section 18), and Invite Friends (Section 17.2).

---

### 17.6 Promo Codes

Operator-issued **promo codes** let players redeem rewards from a dedicated page (`/promo`, reached via the drawer). The player enters a code; on success a reward reveal lists what was granted and the affected balances refresh.

- A code grants one or more rewards — any mix of **LC**, **tickets** (of a given tier), or **Lucky Stars**.
- Codes are single-use per account: redeeming the same code twice returns "already used"; invalid and expired codes return their own messages.
- **Channel-subscription gate:** redeeming a code requires the player to be subscribed to the official Telegram channel (`TELEGRAM_CHANNEL_ID`, default `@luckyticket365`). The backend performs a live `getChatMember` check at redemption time and rejects a non-subscriber with a "join the channel" message before any reward is granted. The gate blocks only a **positive** "not a member" — if membership can't be determined (bot unconfigured, a synthetic/seed account, or a transient Bot-API failure) the redemption is allowed, so a lookup hiccup never locks a legitimate player out. This makes promo rewards a subscriber perk and keeps players on the channel where fresh codes are published.
- Codes are created and managed operator-side (admin/backend); the catalog is never exposed to the client. Players discover codes through distribution channels such as the Telegram channel.

## 18. Stakes System

### Purpose

A stake is a **time-locked LC deposit**. The user locks an amount of LC for a chosen number of months and, on completion, receives the deposit back plus an APR yield. Stakes are the LC "bank": they pull LC out of circulation (a velocity sink that fights inflation) while paying a modest, tunable return.

### Description

The user picks an LC amount and a duration. The LC is locked for that period; locked LC cannot be spent. On completion the principal is returned together with the APR yield, an AP completion bonus, and a guaranteed Lucky Stars payout. The stake may be cancelled early to retrieve the principal, but the yield, AP bonus, and completion Stars are forfeited.

A matured stake is **not** claimed automatically. Within five minutes of maturing the player gets a notification — feed row plus a Telegram DM gated by the **Staking ready** toggle (Section 16.2) — sent once per stake and never repeated, however long the stake stays unclaimed.

### 18.1 Duration & APR

- **Duration:** a slider of **1 to 12 months** (the range is a knob).
- **Yield:** `yield = deposit × rate`, where `rate` scales linearly with the chosen duration — **3% at 1 month → 10% at 12 months**. The yield is paid in LC on completion. The band is tuned against the engine economy (§14.2): once a player's marginal engine payback has decayed past the early game under geometric repeat pricing, parking surplus LC in a long stake becomes the rational move.
  - _Example:_ 100,000 LC locked for 12 months → +5,000 LC.
- The APR is a small LC faucet; the locked principal is a much larger velocity sink, so stakes are net anti-inflationary. The APR curve is the primary anti-inflation tuning lever.

### 18.2 Stake Tiers (deposit thresholds)

Stakes have five tiers keyed to the minimum deposit. The tier is **AP-tier gated** (a stake of tier `T` requires `AP-tier ≥ T`, Section 5.2) and determines the per-month multiplier for the completion Stars payout.

| Tier     | Minimum Deposit |
| :------- | :-------------- |
| Bronze   | 10,000 LC       |
| Silver   | 50,000 LC       |
| Gold     | 100,000 LC      |
| Platinum | 250,000 LC      |
| Diamond  | 500,000 LC      |

The gate therefore sets a **maximum stakeable amount**: one LC below the minimum deposit of the cheapest tier the player has not reached (a Gold player caps at 249,999 LC), or their whole balance when every tier is open. The new-stake screen enforces that ceiling on the slider, the presets and the typed amount, and states it next to the amount — a player who could once configure a locked stake in full and only learn of it from a greyed-out button at the bottom of the screen.

**A level is a band, and the server enforces it.** Level `n` covers `[minDeposit(n), minDeposit(n+1))`; the Mini App derives the level from the amount and never sends anything else. The API used to check only the floor, which made the ceiling above a screen-only courtesy: a hand-made request could open 500,000 LC — a Diamond-sized deposit — as a **level 1** stake, drawing the same yield while paying Bronze completion Stars, passing the Bronze tier gate instead of Diamond's, and, inside the Bronze free-start waiver, paying **no start fee at all** against 42 ⭐ for the same deposit at level 5. `POST /stakes/start` now rejects a deposit that belongs to another level and names the level it belongs to.

### 18.3 Reward Structure

Every completed stake grants:

- **Principal returned** in full.
- **APR yield** in LC (Section 18.1). Lucky Player holders receive an additive **+20%** on top of the APR yield (`luckyPlayerStakeYieldBoostPct`); VIP holders receive **+40%** (`vipStakeYieldBoostPct`). The two never stack — the higher-tier value wins (DOCS §7.3).
- **Completion Stars:** a guaranteed Lucky Stars payout = `months × completionStarsPerMonth`, where the per-month multiplier scales by stake tier (Bronze 2 → Silver 3 → Gold 4 → Platinum 5 → Diamond 6). Forfeited on early cancellation.
- **AP:** the base `LC staked × months / 5,000` Activity Points is credited the moment the stake starts, but is **revoked on early cancellation** (floored so AP decay in between can't take the balance below zero). A **+50% completion bonus** on the base is granted only when the stake runs to the end. Rationale: with the AP retained, open→cancel was a near-free infinite AP loop (the deposit returns in full, only the Stars fee is spent) — it was farmed in the wild and closed on 2026-07-07.

### 18.4 Cancellation & Concurrency

- **Early cancellation:** the principal is returned in full; **everything else is forfeited** — the APR yield, the base AP credited at start (revoked), the +50% AP completion bonus, and the completion Stars; a Stars cancellation penalty applies (see Section 18.5).
- **Multiple concurrent stakes** are allowed — the player may run several stakes at once.

### 18.5 Fees (Stars)

Both opening and cancelling a stake costs Telegram Stars. Fees scale with the locked amount and (for stake-start only) with the chosen duration.

**Base fee unit** (used by both):

```
base = ceil(deposit / 10,000)   // 10,000 LC = 1 ⭐
```

**Stake-start fee** — `max(1, ceil(base × (1 − totalDiscount/100)))`, where:

- `monthDiscount = months × 1%` — longer commitments pay less.
- `volumeDiscount` — bracketed by deposit size, doubled for Lucky Player holders:

  | Deposit   | Default | Lucky Player |
  | :-------- | ------: | -----------: |
  | < 100k LC |      0% |           0% |
  | 100k LC+  |     10% |          20% |
  | 250k LC+  |     12% |          22% |
  | 500k LC+  |     15% |          25% |
  | 1M LC+    |     20% |          30% |

- `totalDiscount = monthDiscount + volumeDiscount`, capped at 99%.
- Minimum stake fee: **1 ⭐** (floor).

**Cancellation fee** — `max(2, 2 × base)`. No discounts apply; the cancel multiplier is fixed at 2 and the floor is 2 ⭐.

**Bronze-tier onboarding waiver** — the **first 10 Bronze stakes** a user opens lifetime are free (stake-start fee = 0). The cancel fee still applies normally. The counter is incremented when a Bronze stake is opened (irrespective of outcome).

> All rounding uses `ceil` — partial Stars never round down.

### Connections

Stakes connect the LC currency system (velocity sink + APR faucet), the AP tier gate, and the Lucky Stars faucet via the guaranteed completion Stars payout. The fee schedule (Section 18.5) also routes Stars into platform revenue via stake creation and cancellation.

---

## 19. Lucky Stars (LS) System

### Purpose

**Lucky Stars (LS)** are LuckyTicket365's secondary internal currency, designed for premium upgrades and the Market's premium rail. They run alongside LC and bridge into the broader economy via Telegram Stars and TON. Lucky Stars are the primary monetization currency: most premium in-game purchases are paid in LS rather than LC.

### Description

Lucky Stars are a LuckyTicket365 internal currency, stored in the user's app balance (visible on the Wallet page — see Section 15). Users:

1. **Earn** Lucky Stars through platform activity — stakes, tasks, friend invitations.
2. **Buy** Lucky Stars with Telegram Stars (XTR) at a fixed 1:1 rate, or with TON (with a volume bonus on larger packages).
3. **Spend** Lucky Stars in the Market, and on the engine's premium actions (instant claim, speed / capacity levels).

Lucky Stars are conceptually distinct from **Telegram Stars (XTR)** — Telegram's native virtual currency. LuckyTicket365 integrates Telegram Stars only as a _purchase method_ for Lucky Stars; Telegram Stars themselves are not held in the user's app balance.

### 19.1 How Users Earn Lucky Stars

Lucky Stars are awarded through three channels:

#### Stakes

A completed stake (no early cancellation — Section 18) pays a **guaranteed** Lucky Stars amount = `months × completionStarsPerMonth`. The per-month multiplier scales with the stake tier:

| Stake Tier | Stars per Month | 1-month payout | 12-month payout |
| :--------- | :-------------- | :------------- | :-------------- |
| Bronze     | 2               | 2              | 24              |
| Silver     | 3               | 3              | 36              |
| Gold       | 4               | 4              | 48              |
| Platinum   | 5               | 5              | 60              |
| Diamond    | 6               | 6              | 72              |

> Multipliers are knobs and may be tuned by the product team.

#### Task Completion

Completing tasks from any category (Daily, Weekly, Monthly) gives a **chance** to receive Lucky Stars in addition to the standard ticket/coin/boost prizes. LS are not guaranteed on every task — they appear as a random bonus outcome. LS-eligible tasks are marked distinctly in the task list.

#### Friend Invitations

Invite milestones are implemented as the one-time **Friends** task chain (claimed from the Tasks screen). The steps **2 / 5 / 10 / 20 deliberately mirror the tier referral requirements (§5.1)** — every mandatory invite threshold doubles as a reward checkpoint; 50 and 100 are stretch goals beyond the gate. Guaranteed rewards per step:

| Friends Invited | Reward                                  |
| :-------------- | :-------------------------------------- |
| 1               | 500 LC + 5 AP                           |
| 2               | 800 LC + 10 AP                          |
| 5               | 2,000 LC + 1 ticket + 20 AP             |
| 10              | 5,000 LC + 2 tickets + 5 LS + 30 AP     |
| 20              | 12,000 LC + 4 tickets + 10 LS + 50 AP   |
| 50              | 30,000 LC + 8 tickets + 20 LS + 75 AP   |
| 100             | 60,000 LC + 15 tickets + 40 LS + 100 AP |

> Progress is computed live from the actual referral count (no manual tracking); the user claims each reached step from the Tasks screen. Amounts live in `milestones.data.ts` (backend, code-wins boot sync) and are mirrored in the frontend mock.

#### Test-window faucets (beta only, off by default)

A fourth, **temporary** source exists for the 31-day Test-Quest beta. The quest's
level ladder drops 200 LS while the quest itself demands roughly that much back
in engine upgrades, so without extra income an active tester cannot finish
without buying stars. The faucets add ≈100 LS across the window:

| Faucet                        | Default rate      | Over 31 days |
| :---------------------------- | :---------------- | :----------- |
| Ad views                      | 1 LS per 10 views | ≈31 LS       |
| Completing the daily task set | 1 LS              | ≈31 LS       |
| Completing the weekly set     | 10 LS             | ≈40 LS       |

Because this mints hard currency (the same Lucky Stars the app sells), it is
fenced on three sides:

- **Off by default.** The rates and the window live in
  `PlatformConfig.testQuestConfig.lsFaucets` and are switched on from the admin
  panel's Test-Quest tab, which shows the projected per-player cost next to the
  switch.
- **Participants only.** A player with no `TestQuestState` — or one whose badge
  is already frozen, meaning their test is over — earns nothing extra.
- **Once per period.** Every payout writes a `TestQuestFaucetGrant` row whose
  `(userId, kind, periodKey)` unique key is the idempotency guard, so a repeated
  request or a flushed cache cannot double-pay. The same rows are the audit
  trail for what the test economy cost.

An optional `endsAt` stops the payouts on its own, so the faucets cannot outlive
the beta if nobody remembers to switch them off. The set-completion faucets fire
when the player has claimed as many periodic tasks this period as their tier can
complete (`AP_REWARDS.dailyTasksCountByTier` / `weeklyTasksCountByTier` — the
same counts the AP baseline in §5.4 is derived from).

### 19.2 Buying Lucky Stars

In addition to earning, users may buy Lucky Stars from the Wallet page (see Section 15):

- **With Telegram Stars (XTR):** Fixed **1:1 rate** — 1 Telegram Star = 1 Lucky Star. Powered by the Telegram Bot Payments API. Reference price: 100 XTR ≈ $2 USD at the time of writing.
- **With TON:** Users spend TON to buy Lucky Stars at the live TON-to-USD market rate, anchored to the ~$0.02/LS baseline, with a **volume bonus** on larger packages (e.g. +0% / +5% / +10% / +15% by package size). This is a one-directional purchase — LS is not converted back to TON.

### 19.3 Spending Lucky Stars — The Mega Market

The Market (Mega Market) is the single storefront — there is no separate "Shop" screen; the two names meant the same thing and only "Market" is used now (route `/market`, tab «Маркет»). **All purchases are paid in either Lucky Coin (LC) or Lucky Stars (LS) — no fiat / USDT / TON.** Items that already _grant_ Lucky Stars (bundles containing stars) are LC-only — users cannot pay stars to receive stars.

The Market opens with a **Hero card** showing the current featured deal (with countdown if limited) and a horizontal **filter chip strip**. The **implemented** categories, in priority order:

1. **All** — vertically stacked render of every other category.
2. **Status** — Lucky Player and VIP subscriptions (see Section 7). The card body links to the status's dedicated page; the in-card price buttons buy in place.
3. **Tickets** — buy tier tickets directly with LC (Section 14). Tier-locked.
4. **Shards** — chip fragments ({speed, capacity} per tier) collected and spent to build chips in the inventory (Section 10.4). Tier-locked; currently seeded for Bronze + Silver.
5. **Engines** — one producer engine per tier, level 1, priced with geometric repeat pricing (Section 14.2). Tier-locked.
6. **Cosmetics** — _(the section **and its chip** are switched off in the Mini App since 2026-08-09 — Section 16.1; the backend still lists the items)_ Avatars, badges, themes (mix of tier-themed and brand-themed accents). Always available regardless of tier. **Avatars are a two-tier sub-category** — free avatars (granted by default, cosmetic only) and paid avatars (purchased here; each paid SKU carries a bound boost — see Section 16.1).

**Deferred categories** — defined in the data model / roadmap but **not currently surfaced** as their own tab:

- **Chips** (pre-built, sold at level 1) and **Chip Builders** — today chips are assembled from **Shards** (above), not sold pre-built.
- **Passes** — time-limited subscriptions (Auto-Claim, Ad-Free, +25% LC, Tournament).
- **Bundles** — combo packs (see the Bundles note below).
- **Engine limited supply** — the `stock` / remaining-supply field exists on a market item (`MarketItem.stock`, FE `remainingSupply`) but is **not yet enforced or surfaced**; engines are currently unlimited.
- **Speed / Collect Boosts** (Section 10.1) — **retired.** The standalone LC market boost category (`MarketItemCategory.BOOST`) was removed from the seed, the catalog response, and the FE contract, and legacy DB rows are pruned on boot. Engine speed/capacity is deepened via per-engine-level LS upgrades (the engine cube, Section 10.2).
- **Boosters** — **retired from the storefront.** The market Booster listing (`MarketItemCategory.BOOSTER`, `buyBooster`) was removed from the seed, catalog response, and FE contract, and legacy DB rows are pruned on boot. Boosters remain an **inventory** item — earned from tournaments/tasks and equipped onto engines (Section 10.4 / §12); only the market _sale_ of boosters was removed (the `InventoryBooster` model is unaffected).
- **Avatar frames** (`AVATAR_FRAME` cosmetic) — **retired from the storefront.** No longer seeded; existing frame rows are pruned on boot (by `cosmeticType`, so avatars/badges/themes in the same COSMETIC category stay). The `MarketCosmeticType.AVATAR_FRAME` value is kept in the taxonomy but nothing is sold under it.

**Card visual language:** every Market item card shares the same template — a neutral `bg-background-overlay` card with a tier-accent bottom shine line, a 14×14 rounded-2xl icon stage with tier-tinted border + inset glow, the item name, a meta line (e.g. level / duration / contents), and 1–2 price buttons (LC and/or Lucky Stars), arranged 2 per row.

**Item photos:** the icon stage renders the item's `imageUrl` when the catalog provides one, otherwise a category/tier icon. The **tier-bound SKUs (engine / ticket / shard) and the LP / VIP statuses** ship with a **backend-served default photo** — the real per-tier art (`/assets/icons/…`, plus `crown` / `lucky-player` for statuses) — set at seed time and re-synced on every boot (`MarketService.syncCatalogImages`). The URLs are **absolute** (the Mini App's asset origin), so the photos render both in the app **and** in the admin panel (a separate origin). The sync fills a NULL `imageUrl` and upgrades an older code-set relative default, but never overwrites an admin-uploaded photo (Admin → Маркет) — the admin's choice always wins.

**Purchase flow:**

- Tapping a price button checks the matching balance.
- If the user has enough — opens a centered **purchase confirmation modal** with the item's icon, name, description, and price, plus a pill row showing the **available balance** of the currency being spent (compact-formatted) and — for tickets/shards — how many of that item the player **already owns**.
- If Lucky Stars are insufficient — opens the **Not-enough-Stars bottom sheet** (with top-up presets).
- If LC are insufficient — opens the **Not-enough-LC modal**.
- **Quantity selection** — countable items (tickets, shards) show a tournament-bet-style stepper (MIN / − / tap-to-type value / + / MAX) in the confirmation modal; the price row switches to the order **total** with a `unit × N` breakdown, and the Stars-purchase AP preview scales with the total. MAX is capped by what the balance covers and by a per-order cap (`marketMaxPurchaseQuantity` = 999 for tickets; `marketMaxShardPurchaseQuantity` = 10 for shards, whose backend endpoint buys one unit per request, so the client loops). Single-purchase items (engines, cosmetics, statuses) show no stepper.
- Confirming dispatches the corresponding RTK mutation (`buyEngine`, `buyTicket`, `buyStatus`, `buyShard`, `buyCosmetic`); `buyTicket` sends the chosen `count` natively. Mutations apply optimistic updates: the cost is deducted from `me.coins` / `me.telegramStars`, and the granted item is appended to the relevant cache (engines → ticket-tier engines, shards → inventory, tickets → ticket balance, status → `me`). On error, all patches are rolled back.

**Card-body tap:** tapping a card's body (not its price buttons) opens an item **info sheet** — except **Status** cards (Lucky Player / VIP), whose body links to the status's dedicated page (`/settings/lucky-player`, `/settings/vip` — the single canonical route used everywhere: header pills, profile, stakes, market) where it can be reviewed, bought, or extended. This link stays active even when the status is already owned (the in-card buy buttons lock, the body still navigates). Price buttons always buy in place.

**Discount mechanics:** Items can carry a `discountPct` and an `originalAmount` per price tier; the original is rendered with strikethrough beside the discounted amount. Featured deals can also carry an `expiresAt` rendered as a countdown. For the storefront categories the admin panel manages (chip / booster / cosmetic / bundle / shard), the sale is set directly in **Admin → Маркет → item editor**: a **Скидка, %** field (the `−N%` badge) plus **Старая цена (LC / XTR)** fields (the struck-through `originalAmount`), validated so the old price must exceed the current one. The editor shows a live storefront preview of the resulting card.

**Bundles (deferred):** A bundle category is defined in the data model (combo packs of tickets + stars + LC + boosters + engines + chips) but is not currently surfaced as its own tab. Bundle SKUs that include Lucky Stars in their contents are priced in LC only.

> Market inventory and pricing are managed by the product team and may be updated at any time.

### 19.4 Monetization Principle

Lucky Stars are the **preferred currency for premium in-game purchases**. Whenever a feature offers a paid upgrade, expansion, or exclusive item that is not part of the core LC economy (engine purchases, ticket purchases, status purchases via LC), the payment is collected in Lucky Stars. This concentrates monetization through the Stars channel and incentivizes the Telegram-Stars / TON purchase paths.

**Hard rule:** Lucky Stars cannot be used to buy Lucky Stars. Bundles or items whose contents include LS as a reward are LC-only.

### 19.5 Technical Integration (Telegram Stars Purchase Flow)

LuckyTicket365 integrates the **Telegram Stars** purchase flow via the **Telegram Bot Payments API**:

- Invoice links are generated server-side with `currency: "XTR"`.
- Payments are processed natively inside Telegram — no external checkout.
- Telegram Star transactions are visible in the user's Telegram account.
- Upon successful payment, LuckyTicket365 credits the user's Lucky Stars balance 1:1 with the Telegram Stars paid.
- LuckyTicket365 tracks all purchase events per user for analytics and audit purposes.

### Connections

Lucky Stars connect: the Stakes system, Task system, Invite Friends system, Engine system (Capacity Upgrades and Instant Claims), the Market, and the Wallet (Telegram Stars and TON purchase paths). Telegram Stars (XTR) and TON serve as bridges between external value and the LuckyTicket365 internal economy.

---

## 20. Jackpot

The **Jackpot** is a single, platform-wide progressive prize pool that grows from tournament play and detonates — without warning — onto one secretly-chosen tournament, splashing a large payout across that tournament's players. It is the platform's headline "lucky" moment: every ticket in every tournament carries the dream, because nobody knows which tournament is the charged one.

### 20.1 Accrual

- The jackpot is **one global pot** shared across the whole platform — not per-tier.
- **10% of every tournament's prize pool** (all tiers) is skimmed into the pot when that tournament finishes (`appConfig.jackpot.accrualPercent`). The placement table (Section 11.3) then distributes the remaining 90%.
- The skim is an **EV-neutral redistribution**: no new LC is minted, and the skimmed amount is paid back out when the pot drops. The long-run LC faucet and the Market house edge (Section 14) are unchanged — the jackpot only **concentrates** existing LC into rare, large payouts.
- Because high-tier pools are far larger than low-tier ones (Section 11.2), the pot is funded mostly by the upper tiers, yet it can drop on any tier — a deliberate "anyone can win big" hook.

### 20.2 Charging & the Secret Moment

- An operator **secretly "charges"** the jackpot onto exactly **one tournament instance** of **any tier** (Bronze → Diamond) from the admin side. Charging targets a single instance, not a whole slot: when a popular slot has spawned parallel `teamSizeCap`-capped instances (Section 11.2), only the charged instance pays the jackpot; the others run as normal tournaments.
- The charged tournament's **finish is the drop moment**. Players are **never told** which tournament is charged or when the drop will happen — there is intentionally **no countdown** anywhere in the UI. The suspense is spread across every tournament.

### 20.3 Distribution When the Pot Drops

When the charged instance finishes, the **entire pot** is paid out **on top of** the normal Section 11.3 prize (which is unaffected):

By **default the jackpot pays the top-3 only** — the podium splits the whole pot 50/30/20 and no one else receives anything:

| Recipient     | Share of pot | Notes                          |
| :------------ | -----------: | :----------------------------- |
| 1st place     |      **50%** | Podium split, of the whole pot |
| 2nd place     |      **30%** |                                |
| 3rd place     |      **20%** |                                |
| Everyone else |       **0%** | No consolation share (default) |

- Config (admin-tunable, `appConfig.jackpot` / `platformConfig.tournaments`): `participantsSharePercent` (**0** by default), `podiumSharePercent` (derived `100 − participants`), `podiumSplitPercent` (50/30/20).
- **Raising `participantsSharePercent`** carves out an equal **consolation share for every participant** and the podium splits the remainder — e.g. `20` → 20% shared equally among all players, 80% to the podium (40/24/16 of the whole pot). At the default `0` the podium takes everything.
- **Why top-3 only:** the jackpot is a headline win for the podium. A real player deliberately parked deep in the fake field (e.g. **267 / 500**) must not walk away with a jackpot payout — which the old "20% to everyone" consolation would have handed them. The consolation model stays available via the knob but is off by default.
- The jackpot win is surfaced to recipients **inside the existing tournament result popup** (`TournamentResultModal`, Section 11.5) as a distinct "JACKPOT" block, shown separately from the normal placement prize so the windfall is unmistakable.

### 20.4 Rounding, Reset & Carry-Forward

- Shares are floored to whole LC. Any **indivisible rounding remainder** (a few LC from flooring the podium split — or, when the consolation knob is raised, from the equal split across up to 500 participants) is **carried forward** as the seed of the next round rather than being lost or created.
- **Unfilled podium places stay in the pot.** In a tiny charged field (1–2 players) the 2nd/3rd podium shares have no recipient — they are carried forward exactly like rounding dust, keeping the drop EV-neutral.
- **A charged instance nobody joined does not drop.** The tournament finishes empty, the pot keeps accruing, and the operator can charge another instance.
- After a drop the pot **resets to ≈0** (carrying only that remainder) and immediately begins accruing again. The live odometer on the jackpot page makes the renewed climb visible.

### 20.5 The "Jackpot Ticket"

There is **no separate jackpot-ticket entity**. The "lucky ticket" is thematic: because any tournament could be the charged one, **every regular ticket a player submits is potentially the jackpot ticket**. The fantasy is spread across all play rather than gated behind a special item.

### 20.6 Jackpot Page

Reached from a compact **"Jackpot" button at the top of Home** and from a **drawer entry**. The page (`/jackpot`) shows:

1. **Hero** — the live pot odometer (creeps up with "+X" pops as tournaments feed it), an all-time **Record** line, and the intrigue line "Can drop in any tournament. At any moment." No countdown.
2. **Your involvement** — how many active tournaments the player is in (any could be the charged one), or a prompt to join one if they're in none.
3. **How it works** — the three-step grow → arm → drop explainer.
4. **Where the pot goes** — the 20% / 80% (50·30·20) split, visualised.
5. **Recent jackpots** — a feed of past drops, headed by a lifetime **"paid out all-time"** total (`JackpotState.allTimePaidOut` — the sum of every jackpot ever dropped; a historical figure, not animated live). Each drop is then headlined by the total pot that dropped, with tier, tournament, time, and the 1st-place winner's face.

## 21. Partner Cabinet

A B2B drawer surface (`/partners`) where **advertisers (casinos) create and manage sponsored tournaments** — real, joinable tournaments that carry the advertiser's branding. The full model, card, creation flow, and mandatory moderation live in **§11.8**. Money is denominated in **TON** (decimal), matching the wallet.

> **History:** the cabinet originally ran a CPC **ad-platform** (`PartnerTournament`: click-through ads billed per unique click out of a frozen budget). That model was **removed** — the cabinet is now exclusively about sponsored tournaments. The only partner-specific server state left is the advertiser's TON **balance** (`getPartnerStats` → `{ balanceTon }`), debited when a tournament is created.

### 21.1 Coming-Soon Gate

The cabinet ships behind a master switch — `appConfig.partners.enabled`. When `false` it is a **preview**: the dashboard + builder render on demo data, a "Coming soon · preview" banner sits on top, and submitting the builder surfaces a Coming Soon toast instead of calling `createSponsoredTournament`. The **drawer entry is locked** by the same switch — dimmed, non-navigable, with a lock icon and an animated "Coming Soon" badge. Flip to `true` to make both live.

### 21.2 Dashboard

1. **Stats** (4 cards): **Balance** (TON, `getPartnerStats`), **Created**, **Active** (`upcoming`), **In Review** (`moderation`). The counts derive client-side from the advertiser's own tournaments.
2. **Create Tournament** button → the builder (`/partners/new`, §11.8).
3. **My Tournaments** — `getTournaments` filtered to `sponsor.createdByMe` (so it includes ones still in moderation, which players can't see), split by an **Active / History** toggle: _Active_ = ongoing (`upcoming` + `moderation`), _History_ = `finished` runs. Compact cards (tier medal, name, prize pool, team size, start, status pill) link to the advertiser detail; each view is **paginated** (`appConfig.partners.listPageSize`).

### 21.3 Tournament Detail (`/partners/[id]`)

The advertiser-facing detail (`PartnerTournamentDetail`) shows one created tournament — branding, status, prize pool, team size, tier, start. When the tournament is in **moderation** it surfaces an **Approve** action (`approveSponsoredTournament` → `POST tournaments/approve`; the demo stand-in for admin review) that flips it `moderation → upcoming`, so it becomes public.

## 21.4 The admin money feed

`GET /admin/transactions` merges **all three ledgers**: LC (`LcTransaction`), Lucky Stars (`StarsTransaction`) and the wallet (`WalletTransaction` — Stars purchases plus TON deposits and withdrawals). It previously read only the first and the BUY_STARS slice of the third, so every LS reward and spend, and every real TON movement in or out of the platform, was invisible on the transactions screen.

Each row carries both a coarse `type` (for badges and grouping) and the **exact ledger reason** in `kind` (`TOURNAMENT_PRIZE`, `ENGINE_SKIP`, `WITHDRAW_TON`…), plus `source`, a signed `amount` and its `currency`. `type` buckets a dozen reasons under one label — fine for skimming a feed, useless for finding one specific movement, which is what `kind` is for.

Filters: user / free text, date window, status, coarse type, exact `kind`, `currency` (LC/LS/TON), `source`, `direction` (credit/debit), amount bounds and sort. Amount bounds and the amount sorts compare **|amount| in each row's own currency** — LC, LS and TON are not converted into one another, and the question being asked is "biggest movements", not "biggest number". A currency filter that rules out a ledger skips querying it at all.

**On-chain history per player: `GET /admin/users/:id/onchain`.** Reads the TON wallet the player connected, through the same service the Mini App uses, and renders in the user card next to our own rows. The distinction is the point: our ledger records what we credited, the chain records what actually moved — including transfers that have nothing to do with us. It is the only view that can settle "I sent it and it never arrived". An unreachable TON node surfaces as an explicit failure, never as an empty history.

**A stored address that isn't a TON address is its own state, not a failure.** Wallet connects made before `ton_proof` verification landed (2026-07-02) fell back to a mock that saved a synthetic `EQ<uuid>` — 34 characters where a real address is 48. Those rows still read as connected, so the card linked them to an explorer page that does not exist and the history call returned **503**, which is the same signal as a TON outage: it invited a retry that can never succeed. The endpoint now parses the address first and answers `addressValid: false` with an empty history, and the panel says the address is not on-chain and the player must reconnect. `npm run wallets:audit` in the backend lists every such row (`-- --apply` resets them to disconnected, leaving `tonBalance` alone — that is real ledger money, and payouts go to an address typed at withdrawal time, never to this column).

## 21.5 Analytics & player stats

Two audiences read the same underlying events.

**Operators — `GET /admin/analytics`, the panel's «Аналитика» section.** Day-1/7/30 retention with weekly signup cohorts, the signup → first ticket → first tournament → first payment funnel, every revenue source (Stars, TON deposits, ads) in one place with ARPU/ARPPU and payer share, and the test-quest level distribution. It is its own grantable section rather than part of the dashboard, because it carries per-source revenue.

Two rules hold everywhere on that page. A rate whose denominator is empty renders as **"нет данных", never 0%** — a product launched yesterday has no day-7 cohort, and showing that as zero retention reads like a catastrophe. And **every rate is displayed with the counts behind it**: at this scale "50%" is routinely three people, and the counts are what stop a number that small from being read as a trend.

**Players — `GET /profile/stats`, the «Моя статистика» screen off their own profile.** Lifetime figures the profile itself does not answer: days in game, active days, current and longest streak, tournaments played, top-3 finishes, best place, win rate, LC won and earned, tickets claimed, friends invited. Best place and win rate are `null` until a tournament actually finishes — an empty history renders a dash, not a zero.

Both rest on **`UserActivityDay`**, one row per player per UTC day, written by a global interceptor on authenticated requests (Redis-guarded to one INSERT per player per day, admin traffic excluded). `User.lastActivityAt` is overwritten on every action and can only answer "when were they last here", which is why per-day active counts, retention and streaks were impossible before it existed. The migration that created it backfilled from every table that already timestamps a user action, so the history did not start empty.

## 21.6 Access gates: pre-launch and maintenance

Two switches can take the product away from players, and both are answered by the
backend on every visit — not baked into a build. They share one rule for who is
exempt, so an entry that works for one works for the other.

**Maintenance outranks the countdown.** When both switches are on, a player sees
the maintenance screen, not «скоро» — and the app does not boot behind either.
The order matters because the countdown is a screen for a working platform: it
invites friends, counts referrals and files gift claims against a backend that
is answering 503 to everything else. Turning maintenance on in the panel has to
mean the product is closed, including its waiting room.

**The pre-launch gate («скоро»).** While `PlatformConfig.comingSoonEnabled` is
on, the Mini App renders only the Coming Soon countdown: the root gate sits
outside every provider and renders the app **only** on an explicit "this person
is let in", so no route, store or query is ever mounted behind it — the app does
not boot, rather than booting under a cover. Every route and deep link resolves
to that one screen. The countdown reads `PlatformConfig.launchAt` (admin-set;
falls back to the date bundled in the client).

One request decides it: the Telegram sign-in, which creates the account for a
pre-launch visitor — so whoever opened the app before launch is already a real
player and a real referral — and carries the personal verdict (`appOpen`) back.
The anonymous `GET /config` only reports whether the gate is up at all; it never
answers a question about a specific person.

**Inviting before launch.** The countdown screen also carries the invite link
and the list of people who already arrived through it. Referrals are fully real
before launch: a friend's first open creates their account through that same
sign-in, which binds the referral and pays the inviter — so the list is the true
one, not a preview. Sharing behaves exactly as it does in-app (server-prepared
rich card → Telegram's share sheet → the clipboard); the shared behaviour lives
in `useInviteShare`, used by both screens. The list folds after five rows so a
prolific inviter's roster does not bury the rest of the screen.

**The gift ladder.** Directly under the headline («до открытия игры уже можете
зарабатывать») the screen shows five steps — one per friend brought through the
link, each drawn with the invite icon — ending in a sixth bead: a Telegram
teddy bear (🧸) from the bot. One gift since 2026-08-04; it used to be a
four-way draw (heart / bear / box / rose), so the screen named the pool and
hedged with «случайный», and now names the thing. The threshold is
`comingSoonConfig.giftFriendsRequired` (5), kept equal to the backend's
`PRE_LAUNCH_GIFT_FRIENDS` by the guardrail suite, which also pins the pool on
both sides — a screen advertising a gift the bot will not send is the failure
neither repo notices on its own.

**One gift per account, forever**, enforced in three places: `PreLaunchGift.userId`
is unique (nothing can file a second claim, whatever its status — a REJECTED row
is kept precisely so the promo cannot be re-earned), `approve` refuses a claim
that already went out, and the player's card in the panel (Рефералы →
«Подарок за 7 друзей») says whether this account has had one, so an admin about
to send something by hand does not have to search the queue for the name.

**A friend counts only while they are in the channel.** The promo buys an
audience, and an invited account that never joined `@luckyticket365` is not one,
so the ladder counts _subscribed_ friends (`preLaunchGift.counted`), not the
length of the list. The ladder itself is **seven friends since 2026-08-04** (it
was five): the channel check showed what five was really buying — claims
reaching the queue with none of the six invited friends in the channel.

Membership is the tri-state exact check (`ChannelMembershipService.resolveMany`,
5-minute cache). Telegram says "not in the channel" two ways — the status `left`,
and a refusal to resolve the account against the channel at all, which is how it
answers about someone who was never in it — and **both fail the rule** (measured
on prod: 23 of 23 unresolved players answered `PARTICIPANT_ID_INVALID` while
members answered `member`). **A friend counts only on a confirmed
yes** — an answer we could not get (bot unconfigured, Telegram down, a 429)
does not count either. That is the opposite of every other channel gate here,
on purpose: a gift is paid out of the bot's own Stars, and «мы не смогли
проверить» is not evidence. The cost is owned — while Telegram is unreachable
ladders read low and claims are refused — and nothing is lost by waiting: the
ladder refills from the same live check the moment Telegram answers, and a
claim refused today is claimable tomorrow. The daily check-in and Test-Quest
gates still fail **open**, because they hand a player what they already earned
while this one buys an audience. The
list says which friends do not count yet («без канала»), because a full roster
beside a half-empty ladder otherwise reads as a broken screen. Admin-tunable:
`referral.preLaunchGift.requireChannelSubscription`.

**A day has a fixed number of places.** `referral.preLaunchGift.dailyLimit`
(default 5, editable right on the panel's gift queue) caps how many claims may
be **filed** per UTC day — not gifts sent; sending is still a manual approval.
The screen prints the board («сегодня 5 подарков · осталось 2») while it can
still change what a player does, and hides it once their own claim is filed —
«осталось 0» after your own win reads as a loss. `0` closes the promo for the
day rather than meaning "unlimited": the number always reads as «мест на
сегодня», so a field left at zero can only cost less money than intended.
Running out is a "not today", never a "never": the gift stays lit (`eligible`
stays true, `canClaim` goes false) and the press works tomorrow.

**The player asks; an admin pays.** Crossing the last friend files nothing — it
lights the gift up. The player presses it (`POST referral/prelaunch-gift/claim`),
and that press is the only thing that writes a `PreLaunchGift` row (PENDING).
Then no gift leaves the bot until somebody presses Подтвердить in the panel
(Рефералы → «Подарки за 7 друзей»). Each gate earns its keep: every gift is paid
out of the bot's own Stars balance, and what earns it — a handful of Telegram
accounts opening a link — costs an abuser nothing. The queue shows friends-when-filed
beside friends-now, because a roster that shrank after the claim is the shape a
farm leaves behind.

**The ladder is re-checked at approval, not just at the press.** `referralsAtEarn`
froze the moment the player pressed; the channel did not. Observed on
2026-08-05: a claim filed at 7 confirmed friends read 6/8 in the panel a few
hours later, because one of them left the channel. Since then Подтвердить
refuses such a row outright — the gift is paid on the live count or not at all,
and the claim stays PENDING so it can be paid the day the friend comes back.
One deliberate exception, and it is the difference between «вышел из канала» and
«Telegram не ответил»: the unresolvable friends get the benefit of the doubt
(the refusal triggers on `confirmed + unresolved < 7`, not on `confirmed < 7`).
Without it a Telegram outage would read as everybody's ladder collapsing at once
and freeze the whole queue, and the claim already passed the strict check once,
at filing. A `not_participant` is a confirmed no here as everywhere else and
softens nothing. The panel's «N/M в канале» turns red with «нужно 7» on exactly
the rows this rule would refuse, so the button never surprises.

**And the player's own screen says the same thing.** The ladder is drawn from
the live counted number, so it falls back to 6/7 by itself; on top of that a
filed claim whose ladder came apart shows the gift as **«на паузе»** (amber, ⚠)
instead of the green «запрошен», with «отправим, как только он вернётся» and the
channel rule printed again. It is deliberately not shown as _locked_: the
`PreLaunchGift` row is unique per account and permanent, so there is nothing to
press again — a padlock would invite a tap that can only answer «Подарок уже
запрошен». Only PENDING and FAILED pause; APPROVED, SENT and REJECTED are past
the point where a returning friend changes anything.

**The channel announces it — after the fact.** When a gift actually reaches a
player, autopost publishes it (Каналы → Автопостинг → «Подарок за 7
друзей»): a picture of the bear with the caption «{winner} привёл семерых
друзей в канал». Three things are deliberate. The trigger
is Telegram _accepting the send_, never the claim being filed or approved — a
post about a gift that then failed is a promise the channel cannot take back.
The winner is named `@handle` where there is one (the only form Telegram links),
else the in-app name, else «игрок» — never the `tg_<id>` the sign-in invents,
which reads as a bot talking about a bot. And the post is **silent by its own
flag**, not the global one: five gifts a day would be five pushes to every
subscriber, while a jackpot still deserves to ring. Like every autopost it
respects the queue: in approval mode it waits for a human before it goes out.

A post the settings stopped is written into that queue too, as **«пропущен»**
with the rule that stopped it (event switched off, or a pot/prize below its
threshold). This is not decoration: on 2026-08-04 the gift event sat off for 47
minutes, one gift went out with no announcement, and neither the channel nor the
queue said anything — silence indistinguishable from a broken integration. A
skipped row keeps its picture and can still be released with «Опубликовать».

**Not asking is a state, not a silence.** Because the claim is a request now,
the panel shows a second list under the queue: «Набрали норму, но не запросили
подарок» — accounts with enough counted friends and no row. Nothing is owed to
them by rule; «Выдать» files the claim on their behalf and sends it in one
press, and that grant deliberately ignores the daily places (they pace what
players may take, and this is not a player taking anything).

Rules the implementation holds to:

- **One per player, ever.** `PreLaunchGift.userId` is unique, which is also what
  makes the trigger safe under two referrals landing at once — the loser of the
  race gets a unique violation, not a second gift.
- **Earning is gated on the countdown, approving is not.** A claim can only be
  filed while `comingSoonEnabled` is on (a promo nobody is shown must not keep
  billing the bot), but one filed the day before launch is still payable after.
- **Which gift is decided at approval**, by matching the four emoji against
  `getAvailableGifts` — gift ids are rotated by Telegram as stock runs out, so a
  hardcoded id becomes a failing send with no explanation. Gifts the bot cannot
  currently afford are filtered out first, so «пополни бота» reaches the admin
  instead of a raw Telegram rejection.
- **A refused send is retryable, not final.** FAILED keeps the Telegram error
  verbatim and approving again re-runs it. REJECTED is kept as a row rather than
  deleted, so the promo cannot be re-earned on the next referral.
- **The screen never over-promises.** At 5/5 it says the gift is being confirmed
  while a claim is open, names the gift only once Telegram accepted it, and for
  a rejected claim says only that the steps are done — a refusal is not
  something a player learns from the countdown.

No store exists behind the gate, so this block asks the backend by hand
(`me`, `referral/friends`, `referral/prepare-share`) with the access token the
sign-in returned. That token is short-lived and nothing here refreshes it, which
is why every failure degrades rather than blocks: the list offers a retry, and a
share that cannot fetch its rich card falls back to a plain link carrying the
same referral. Outside Telegram there is no sign-in, so the block is not
rendered at all.

Who gets in while it is up:

- `User.earlyAccess` — a checkbox on the player's admin card (column + filter in
  the users list);
- `PlatformConfig.comingSoonAllowIds` — a hand-written list, the only lever that
  works for a tester who has never opened the app and therefore has no row yet.
  An entry is a Telegram id or a handle, optionally followed by `# note` — the
  note says who this is for the admin reading the list months later and is cut
  off before anyone is matched, so it can never let somebody in;
- any admin — locking the operator out of the product they are gating is a
  special kind of useless.

The bot reads the same switch: someone who can open the app is never told by
`/start` to wait for it. While the gate is up, `/start` records the visitor in
`PreLaunchLead` so the launch announcement can reach people who arrived from
pre-launch ads and never became users.

**Telegram on a phone only.** `PlatformConfig.telegramOnlyEnabled` (**on by
default**) decides that the game is played on a phone: a visitor in a desktop
Telegram client — or in a plain browser tab — is shown a QR code that opens the
Mini App on their phone instead of the app itself. It sits directly under the
boot splash and above everything else the gate can render, so a computer never
reaches the countdown, its invite block or its gift ladder either.

Two ways past it, and they are not interchangeable, because only one of the two
kinds of visitor can be identified at all:

- `PlatformConfig.desktopAllowIds` — people who may play from a computer anyway,
  same entry shape as the lists above (Telegram id or @handle, optional
  `# note`). Works only inside Telegram, where the client is signed in; admins
  pass without being listed. Answered per person by the sign-in
  (`desktopAllowed`), never by the anonymous config.
- `PlatformConfig.desktopAccessKey` — one shared secret for a plain browser,
  where there is no signed payload and therefore nobody to match against a list.
  Opened as `…/?desktop=<key>`, checked by `GET /config/desktop-access` and
  remembered in `localStorage`; the key is never shipped in the bundle. Empty
  means there is no way into the app from a browser at all.

Which client is asking can only be answered by the client — `initData` is signed
but carries no platform, only Telegram's WebApp object knows one — so this rule
**steers** people to the phone rather than sealing the app shut: anyone who can
edit a page in devtools can walk past it. Everything that has to actually hold
(bans, limits, payouts) is still decided on the server. The platform list is a
closed list of DESKTOP clients (`tdesktop`, `macos`, `weba`, `webk`, `web`,
`unigram`), so an unknown or brand-new client counts as a phone: blocking a real
player costs more than letting one desktop through.

**Portrait only.** The game is played upright. A phone turned on its side gets a
"rotate back" wall instead of the app — the layout is a 430px column built for a
thumb, and landscape leaves it under 400px of height for a header, a scrolling
screen and a tab bar, so the modals, the engine cube and the tab bar all crop.
Unlike the two rules above there is no switch and no allow-list: it is a
property of the layout, not a policy.

Enforced twice, because neither half covers the other. Inside Telegram the
client is asked not to rotate at all (`lockOrientation`, Bot API 8.0+) — called
only while the app is already upright, since Telegram freezes whichever
orientation it finds, so an app opened sideways is explicitly *un*locked instead
and locked the moment it is turned back. Everywhere else — older clients,
split-screen, a plain browser — landscape is walled off by a media query, which
also covers a lock request that simply fails. The wall sits outside the gate, so
the countdown, the maintenance screen and the boot splash are behind it too. A
laptop or a tablet in landscape is not affected: the height trigger is set
between the long edge of the largest phone and the shortest desktop window,
which is what keeps `?desktop=<key>` and local development usable.

"On its side" means **the device**, not the shape of the window — a distinction
that cost a day of the wall standing in front of upright players. A Mini App is
handed a webview, not a window, and that webview is wider than it is tall on a
perfectly upright phone: in Telegram's compact mode before `expand()`, during
the fullscreen transition, with the keyboard open, and in Android split-screen.
The media queries see landscape in all of them. So the device's own answer
(`screen.orientation`, `window.orientation` on iOS below 16.4) vetoes them: while
the phone reports itself upright there is no wall, whatever shape the webview
happens to be. It is set before the first paint by an inline script — hydration
is too late to stop a flash — and re-read on every rotation. The same answer now
drives `lockOrientation`, which had the fault in reverse: reading the viewport, a
compact webview made the app _unlock_ the rotation of a phone that was upright.

**Maintenance mode.** `PlatformConfig.maintenanceMode` makes every player-facing
route answer **503**, which the Mini App turns into its maintenance screen.
Deliberately still reachable: `/health` (probes), `/config` (so the app can
render that screen), `/admin/*` (so the switch can be turned back off),
`/telegram/webhook` (Stars payments Telegram has already charged must still
credit) and `/auth/telegram` — without a token nobody can be recognised, so
closing sign-in would lock out exactly the people the exceptions are for.
Exceptions: `PlatformConfig.maintenanceAllowIds` and admins, so whoever is doing
the work can check whether it worked without reopening the app to everyone.

The switch is answered twice, by the same rule (`isUnderMaintenanceFor`): the
guard closes the routes, and the two calls a booting Mini App makes carry the
verdict so it never renders anything else. `GET /config` reports
`maintenance.enabled` anonymously (is the platform closed at all); the Telegram
sign-in returns a personal `maintenance` (are YOU closed out — staff and the
allow-list are already excused there). Mirrored from the pre-launch gate's rule
and inverted on the failure side: only an explicit `true` puts the wall up, so an
old client, an unreadable payload or a config read that threw leaves the platform
open. Maintenance is an operator's convenience, not a boundary that protects
anything, and blacking out the app by accident is the worse error. The screen
carries a **retry** — nothing polls behind it, and inside Telegram there is no
address bar to reload from. A shutdown that starts mid-session still surfaces the
same screen through the 503 handling in the API layer.

**Allow-list semantics (both lists).** A digits-only entry is a Telegram id and
matches exactly; anything else is a name and is matched, case-insensitively and
without a leading `@`, against the current Telegram handle **and** the frozen
in-app username. Ids and names are both accepted because both are what an admin
actually has at hand — an earlier version kept only digits, so a pasted `@handle`
saved as an empty list: a silent no-op that reads as "I added them".

**Fail closed, everywhere.** No answer, a 500, an unrecognised payload or a
config read that throws all resolve to _gated_. The cost of wrongly showing the
countdown is one confused tester; the cost of wrongly opening the app is the
launch. The client env var `NEXT_PUBLIC_COMING_SOON=1` can force the gate **on**
and has deliberately no value that forces it off, so nothing outside the admin
panel can publish the product.

**Nothing opens by itself.** Reaching the countdown's target date changes
nothing — only the toggle does, and turning it off asks for confirmation first.

## 22. Conclusion

LuckyTicket365 is a modular, scalable product built around engagement, fairness, and real value creation. Each system reinforces the others, creating a cohesive ecosystem that rewards consistent participation and long-term loyalty. The Lucky Stars (LS) currency, fueled by both Telegram Stars and TON, bridges the internal economy with external value — giving users tangible real-world worth for their activity on the platform.
