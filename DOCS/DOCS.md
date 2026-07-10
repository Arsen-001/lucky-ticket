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

### 4.2 User Profile

The profile represents the user publicly and internally. It contains:

- **Avatar:** Visual identity, which will be customizable via the Market in the future.
- **Activity Points:** Earned through engagement and used for rankings and VIP eligibility.
- **Lucky Coin (LC):** The primary internal currency.
- **Current Status:** Verified, Lucky Player, or VIP.
- **Personal Statistics:** Tracking performance across the platform.

The profile connects to the leaderboard, tournaments, Market, and social features.

---

## 5. Activity Points System

### Purpose

Activity Points (AP) are the **single progression metric** of LuckyTicket365. They measure engagement and consistency, and act as the **universal gate** that unlocks higher-tier content across the whole platform. There is no separate "player level" — the profile shows the raw AP count.

### 5.1 Tiers

A user's **tier** is derived from accumulated AP:

| Tier     | AP threshold | Reached by (perfect daily-baseline player) |
| :------- | :----------- | :----------------------------------------- |
| Bronze   | 0            | start                                      |
| Silver   | 500          | ~2 weeks                                   |
| Gold     | 1,650        | ~1.5 months                                |
| Platinum | 5,900        | ~4.5 months                                |
| Diamond  | 16,000       | ~10.3 months                               |

Thresholds implement the product pacing targets — Silver in ~15 days, Gold +1 month, Platinum +3 months, Diamond +6 months — **computed against the derived daily baselines** (§5.4), i.e. against what a fully-active player can actually collect per day from every capped source. The legs land at ≈15.2 / 29.5 / 90.4 / 177.2 days, each visibly longer than the previous one — the pacing guardrail is asserted in `tests/economy-sim.test.ts`. (Thresholds were retuned down when engine-claim AP was removed from the source registry, so the pacing targets held.)

The pacing describes a player who collects the full daily baseline every day. Tournaments make it faster; missed days slower.

### 5.2 The AP Tier Gate

AP-tier is the universal gate. A feature of tier `T` requires `AP-tier ≥ T`; the user can always use their own tier and every lower tier.

- **Tier-gated:** producer engines, tournaments, stakes, tier-bound market items.
- **Not gated:** avatars, statuses / VIP, referral.

### 5.3 How Activity Points Are Earned

AP is earned from a data-driven **source registry** — every meaningful action grants AP. Each source carries a base amount, an optional daily cap, and (for spendable actions) proportional scaling:

| Source                    | AP                                    | Limit                                                                                          |
| :------------------------ | :------------------------------------ | :--------------------------------------------------------------------------------------------- |
| Daily login streak        | 3                                     | 1×/day                                                                                         |
| Daily task                | 1 / 2 / 3 / 4 / 5                     | by task tier; a tier-T player completes 3–7/day (`dailyTasksCountByTier`)                      |
| Weekly task               | 2 / 3 / 4 / 5 / 6                     | by task tier; a tier-T player completes 3–7/week (`weeklyTasksCountByTier`)                    |
| One-time task             | varies                                | once per task                                                                                  |
| Verify email              | 20                                    | one-time                                                                                       |
| Watch a video             | 2                                     | 10×/day default · 20×/day with LP · 40×/day with VIP (daily cap = limit × 2 AP)                |
| Send a ticket to a friend | 1                                     | 3×/day                                                                                         |
| Like a profile            | 1                                     | 3×/day                                                                                         |
| Invite a friend           | 10 (20 for a Telegram Premium friend) | per invite                                                                                     |
| Join a tournament         | 1 / 2 / 3 / 4 / 5                     | by tournament tier (Bronze→Diamond), per join                                                  |
| Purchase                  | 1 per 10 LS spent                     | no daily cap                                                                                   |
| Spend LC                  | 1 per 2,500 LC spent                  | no daily cap                                                                                   |
| Complete a stake          | `LC staked × months / 5,000`          | base credited on start (retained on cancel), +50% bonus on completion (forfeited if cancelled) |

Tiered sources (daily / weekly tasks, tournament join) scale with the relevant tier — Bronze→Diamond — and recurring daily sources carry per-day caps. **Claiming engine output awards no AP** — claims pay in tickets only, so farming the claim button cannot drive progression. **One-off and on-top sources** — verify-email, one-time tasks, friend invites, tournament joins, stake completion — are earned above the daily baseline (Section 5.4). **Purchases are uncapped:** 1 AP per 10 LS or per 2,500 LC spent with no daily limit, so a heavy spender climbs tiers substantially faster than a free player.

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

LC connects market, tournaments, stakes, tasks, and progression. LS connects the Market premium rail, the Shop, the Wallet purchase paths, and engine premium actions (instant claim, capacity upgrade).

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

### 7.3 Status Benefits

Statuses grant a fixed set of privileges. **Lucky Player** and **VIP** never stack — when both are active, the higher-tier (VIP) value supersedes Lucky Player. The same magnitude is also never applied to the matching status purchase (e.g. VIP discount is **not** applied when buying / upgrading VIP itself).

All perk magnitudes live in `src/constants/global.constants.ts` and can be tuned without code changes.

#### Lucky Player perks

| Perk                            | Value                     | Source constant                                  |
| :------------------------------ | :------------------------ | :----------------------------------------------- |
| Engine speed boost (additive)   | +10%                      | `luckyPlayerEngineSpeedBoostPct`                 |
| Stake LC yield boost            | +20%                      | `luckyPlayerStakeYieldBoostPct`                  |
| Stake fee volume discount       | doubled brackets (20–30%) | `appConfig.stakes.feeVolumeDiscount.luckyPlayer` |
| Market discount on every item   | −10%                      | `luckyPlayerMarketDiscountPct`                   |
| Tournament LC reward boost      | +25%                      | `luckyPlayerTournamentRewardBoostPct`            |
| Tournament join AP boost        | +50%                      | `luckyPlayerTournamentJoinApBoostPct`            |
| Daily ads cap                   | 20                        | `apRewards.luckyPlayerWatchVideoDailyLimit`      |
| Referral percentage             | 15%                       | `luckyPlayerReferralPercentage`                  |
| Higher ticket send daily limits | B5/S4/G3/P2/D1            | `ticketSendDailyLimits.luckyPlayer`              |
| Send Platinum/Diamond tickets   | allowed                   | `ticketSendDailyLimits.default = 0` for P/D      |
| Bulk "Claim all" per tier       | enabled                   | n/a (UI gate, LP only)                           |
| Profile badge                   | LP icon + glow            | n/a (visual)                                     |

#### VIP perks

VIP is the high-tier permanent status; values exceed Lucky Player at every category and apply regardless of VIP level (no per-level scaling).

| Perk                            | Value                         | Source constant                                  |
| :------------------------------ | :---------------------------- | :----------------------------------------------- |
| Engine speed boost (additive)   | +25%                          | `vipEngineSpeedBoostPct`                         |
| Stake LC yield boost            | +40%                          | `vipStakeYieldBoostPct`                          |
| Stake fee volume discount       | doubled brackets (same as LP) | `appConfig.stakes.feeVolumeDiscount.luckyPlayer` |
| Market discount on every item   | −20%                          | `vipMarketDiscountPct`                           |
| Tournament LC reward boost      | +50%                          | `vipTournamentRewardBoostPct`                    |
| Tournament join AP boost        | +100%                         | `vipTournamentJoinApBoostPct`                    |
| Daily ads cap                   | 40                            | `vipWatchVideoDailyLimit`                        |
| Referral percentage             | 25%                           | `vipReferralPercentage`                          |
| Higher ticket send daily limits | inherits LP table             | `ticketSendDailyLimits.luckyPlayer`              |
| Send Platinum/Diamond tickets   | allowed                       | (same gate as LP)                                |
| Profile badge                   | Animated VIP-level            | n/a (visual)                                     |
| Dedicated support               | yes                           | n/a (operations)                                 |

#### Stacking & self-discount rules

- **Higher-tier wins.** If both LP and VIP are active, every percent-based perk uses the VIP value. The two values are never summed.
- **No self-discount.** When buying / upgrading the **VIP** status, the VIP market discount is excluded. When buying the **Lucky Player** status, the LP market discount is excluded.
- **Avatar boosts** still stack additively on top of the chosen status (DOCS §6 / market avatars).

Benefit magnitudes stay bounded so they cannot break economy balance: combined boosts from all sources stay within ~×2 effective output, and discounts stay within ~30%.

### 7.4 VIP Status — Levels & Acquisition

VIP is a permanent, leveled status. Once unlocked it never decreases or expires. VIP has a **maximum level of 20** (`maxVipLevel`).

#### Payment Options

VIP can be purchased and upgraded with either **Lucky Coins (LC)** or **Lucky Stars (LS)** — both currencies are accepted for the initial unlock and for every level upgrade.

#### Pricing Model

| Action            | Cost                             | Notes                                                          |
| :---------------- | :------------------------------- | :------------------------------------------------------------- |
| **First unlock**  | ~500 LS (or LC equivalent)       | Higher one-time barrier to entry                               |
| **Level upgrade** | ~100 × 1.15^(n−1) LS for level n | Grows per level; cheaper than the initial unlock at low levels |

> Exact LC and LS prices per level are knobs and may be tuned by the product team.

#### Rules

- The first purchase (unlock) costs more than the first few subsequent upgrades.
- VIP level is permanent: it cannot decrease, expire, or be lost through inactivity.
- Higher VIP levels grant incrementally stronger game benefits, up to level 20.

#### VIP Benefits

The full list of VIP perks (engine speed, stake yield, market discount, tournament boosts, ads cap, referral %, send limits, profile badge, dedicated support) and their concrete magnitudes are documented in **Section 7.3 — Status Benefits → VIP perks table**. Values currently apply uniformly to every VIP level (no per-level scaling); the leveling system is reserved for future cosmetic / social differentiation. Stacking and self-discount rules from §7.3 apply.

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
  - **Unlocked tier:** A summary card (`X tickets in inventory · Y engines active`), a `{count} tickets ready · Claim all` callout (when any engine has pending output **and** the player holds **Lucky Player** — otherwise each engine is claimed individually; see Section 7), and a 2-column grid of engine preview cards. Each card opens that engine's dedicated page.
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

- **Acquisition:** Available directly from the Tickets / Ticket Details page on any engine that is currently mid-cycle.
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

- Each **engine level** above 1 contributes `+100%` speed (`ENGINE_LEVEL_SPEED_BOOST_PCT`) **and** raises the engine's **base per-cycle output** by `+10` (`baseCapacity = 1 + (engineLevel − 1) × 10`: base `1 → 11 → 21 …`). Engine level is reached by **promotion** — see Section 10.2.
- Each **speed-level upgrade** contributes `+10%` (`SPEED_LEVEL_BOOST_PCT_PER_LEVEL`) — 10 levels max, so a fully speed-upgraded engine runs its cycle **twice as fast**.
- Each **capacity-level upgrade** contributes `+10%` to capacity (`CAPACITY_LEVEL_BOOST_PCT_PER_LEVEL`) — 10 levels max, so a fully capacity-upgraded engine mints **2 tickets per cycle** _at engine level 1_ (base 1 → 2). At higher levels the same `+100%` is applied to the bigger base, e.g. a level-2 engine's maxed capacity mints `round(11 × 2) = 22`.
- **Status boost** uses VIP value if active, otherwise LP, otherwise 0 (DOCS §7.3).
- **Equipped-avatar boost** contributes the currently-equipped avatar's `engineSpeed` boost `pct` (0 if the equipped avatar has no speed boost). Like the status boost it is permanent-while-equipped, so it applies to the real production cycle, not just the UI (§14 cosmetics).

**Hard speed floor.** No matter how many boosts stack, one ticket can never be minted faster than `GlobalConstants.engineMinSecondsPerTicket = 900s` (15 minutes per ticket). `effectiveCycleSeconds()` clamps the result against `capacity × 900s`. Because a promoted engine's base capacity is larger, that per-cycle floor rises with it — so promotion is felt as a **bigger batch per cycle at the 900s/ticket floor**, not a proportionally shorter cycle (e.g. a level-2 Bronze engine mints its 11-ticket batch in `11 × 900s`, i.e. 900s per ticket, rather than halving the 2 h cycle).

### 9.8 Productivity Metric

Each engine has a derived stat — **Productivity (tickets/hour)** — visible in the engine UI. It represents the engine's output rate **before any time-limited Engine Booster** (Section 10.6) is applied, but **with** the Speed Chip and Capacity Chip currently equipped.

Formula:

```
productivity = (3600 / cycleSeconds_with_chip) × capacity_with_chip
```

Where:

- `cycleSeconds_with_chip` = base engine cycle reduced by the equipped Speed Chip's `effectPct` (and any permanent Speed Boost from 10.1 / status).
- `capacity_with_chip` = base per-cycle output increased by the equipped Capacity Chip's `effectPct` (and any Capacity Upgrade from 10.2).
- One-shot **Engine Boosters** (10.6) are deliberately **excluded** so the user sees their long-term baseline rate, not a number that drops when a 3-hour booster expires.

### 9.9 Engine UI — Rotating Cube

On the home screen, each owned engine is rendered as a **3D rotating cube** the user can swipe vertically (front → bottom → back → top → front). Four of the six faces carry distinct content:

| Face       | Content                                                                                                                                                                                                                                                                                                                                     |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Front**  | Live engine card — Reactor dial, tier-coloured Claim button, Speed/Capacity boost rows, cycle stats.                                                                                                                                                                                                                                        |
| **Bottom** | **Equipment grid** — 2 Chip slots (Speed / Capacity, see 10.4) on top, 2 Booster slots (10.6) below. Tapping a filled slot opens its picker; an active chip slot also shows an **X** unequip control (cost rules in 10.4).                                                                                                                  |
| **Back**   | **Stats panel** — header (`ENGINE STATS` + level pill), then five stacked stat rows (`BASE` factory cycle/capacity → `ENGINE` level upgrades → `CHIP` slot effects → `BOOST` active boosters → `LP/VIP` status perk), and a `TOTAL` row at the bottom showing aggregated ⚡ and 📦 boost percentages. Uses the LM-additive model from §9.7. |
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

**Example:** A Bronze engine that normally produces 1 ticket every 2 hours, with a 2× capacity upgrade, produces 2 tickets every 2 hours — doubling output without changing the cycle.

- **Acquisition:** Purchased exclusively with **Lucky Stars (LS)** in the LuckyTicket365 Shop (see Section 19.3).
- **Scope:** Applied to a specific engine the user owns.
- **Tiers:** Higher-tier capacity upgrades may yield 3 or more tickets per cycle (defined by product team).
- **Duration:** Defined by product team (permanent or time-limited per upgrade tier).

**Permanent level upgrades — effect & LS cost curves** (knobs in `appConfig.economy.engineUpgrades`, helpers in `economy.utils.ts`): each engine carries a permanent **speed level** and **capacity level**, both 0–10, both paid in LS per level. Every level adds **+10%** to its additive boost stack (§9.7) — a maxed speed engine cycles 2× as fast; a maxed capacity engine mints 2 tickets per cycle _at engine level 1_. Level costs grow with **both** the sub-level **and** the engine level — each engine level adds +1 LS to every price: speed `level + engineLevel` LS, capacity `level + engineLevel + 1` LS (level = current sub-level 0–9 before the upgrade). The whole price then **scales by tier** (`tierCostMultiplier`): **Bronze ×1, Silver ×2, Gold ×3, Platinum ×4, Diamond ×5** — leveling a higher-tier engine is proportionally more expensive. So a **Bronze** level-1 engine pays speed **1…10** / capacity **2…11** across its ladder; a level-5 engine pays speed **5…14** / capacity **6…15**. Fully maxing one **Bronze** engine across all 5 levels (100 upgrades) totals **800 LS**; the same on higher tiers costs that × their multiplier — **Silver 1,600 / Gold 2,400 / Platinum 3,200 / Diamond 4,000 LS**.

**Engine promotion (level-up).** Speed level and capacity level each cap at 10. When **both** reach 10, the next paid upgrade **promotes** the engine to the next **engine level** and resets both sub-levels back to 0 — a fresh `0–10 / 0–10` ladder on a stronger base (`promoteEngineIfMaxed`, `ticket-engine.utils.ts`). Each engine level permanently:

- adds **+100%** to the speed stack (§9.7), and
- raises **base per-cycle output** by **+10** (`baseCapacity = 1 + (engineLevel − 1) × 10`: base `1 → 11 → 21 …`).

Because the per-ticket time is already at the 900 s hard floor (§9.7), the net effect of a promotion is felt as a **much bigger batch per cycle** (base 1 → 11 → 21) rather than a shorter cycle. Reaching the next engine level therefore costs a **full 10 speed + 10 capacity = 20 Lucky-Star upgrades**, making promotion a real-money **LS sink**, not a free multiplier (see the economic framing in §14.2).

**Engine-level cap.** The engine level itself is capped at **5** (`MAX_ENGINE_LEVEL`, mirroring the backend's `ENGINE_FUSION.maxEngineLevel`). At the cap the 10/10 sub-level state is **terminal** — the ladders stay full and no further promotion occurs.

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

Shard quality is fixed by the tournament's tier (see above).

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

The **Boost Inventory** is the user's storage for every owned-but-not-yet-equipped boost item. Anything acquired through the Market, the LuckyTicket365 Shop, tournaments (chips), tasks, or stake bonuses lands in the inventory until the user equips it onto an engine.

#### What the Inventory Holds

The inventory is a unified view across all boost categories defined in this section:

- **Speed Boosts** (Section 10.1) — from the engine's speed level (LS) or status-granted.
- **Capacity Upgrades** (Section 10.2) — purchased with Lucky Stars in the Shop.
- **Speed Chips** and **Capacity Chips** (Section 10.4) — built up from tournament-won shards.
- **Chip Shards** (Section 10.4) — uncommitted fragments waiting to be spent on a level-up.

Each inventory entry shows: type, current level (for chips) or remaining count (for shards) or magnitude (for Market/Shop boosts), and **lifetime state**.

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

Boosters are obtainable through three independent channels:

- **Market / Shop purchase** — bought with LC (lower tiers) or Lucky Stars (higher tiers, durations 24/48h). Exact pricing per quality and duration is product-defined.
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
- **Team Size:** The total number of seats. `teamSizeCap` = 500 per instance; when more eligible players exist than the cap, additional parallel instances of the slot are spawned.

The prize pool is the platform's main LC faucet; it scales with the player base because more players spawn more tournament instances.

### 11.2.1 Tournament Naming Convention

Daily project tournaments follow the pattern **`<TimeOfDay> <Tier>`**, where `TimeOfDay` is one of:

- **Morning** — starts at 06:00
- **Afternoon** — starts at 12:00
- **Evening** — starts at 18:00
- **Night** — starts at 00:00

Examples: `Morning Bronze`, `Afternoon Silver`, `Evening Gold`, `Night Diamond`.

The exact start time is **not** part of the name — it's surfaced separately in the UI as a date pill (`DD/MM/YYYY · HH:mm`) and a live countdown chip on every tournament surface. This keeps names short and reusable across days while the time/date metadata stays explicit.

This pattern mirrors the daily-slot structure used in tasks (`BRONZE_DAILY_SLOTS` / `SILVER_DAILY_SLOTS` in `tasks.mock.ts`) so the player sees a consistent time-of-day vocabulary across both systems.

Tier coverage across the day is uneven by design — lower tiers run more often, higher tiers are scarcer and concentrate on premium time slots:

| Tier     | Typical slots                                   |
| -------- | ----------------------------------------------- |
| Bronze   | Morning · Afternoon · Evening · Night (any/all) |
| Silver   | Afternoon · Night                               |
| Gold     | Evening                                         |
| Platinum | Evening                                         |
| Diamond  | Night                                           |

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

**Notification & result popup:**

When a tournament finishes, every participant receives an in-app notification with their final placement and reward. When the user opens the finished tournament's detail page, a **result popup** auto-appears once:

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

| Field                      | Type                                         | Notes                                                              |
| :------------------------- | :------------------------------------------- | :----------------------------------------------------------------- |
| `id`                       | `string`                                     | UUID                                                               |
| `name`                     | `string`                                     | `<TimeOfDay> <Tier>` per 11.2.1                                    |
| `startTime`                | `string` (ISO)                               | When winners are determined                                        |
| `teamSize`                 | `number`                                     | Total seats in the tournament                                      |
| `prizePool`                | `number`                                     | LC distributed among the placement table                           |
| `type`                     | `TournamentType`                             | `bronze` / `silver` / `gold` / `platinum` / `diamond`              |
| `shardType`                | `'speed'` / `'capacity'`                     | Which chip type's shards are dropped (alternates per 11.4)         |
| `status`                   | `'upcoming'` / `'finished'` / `'moderation'` | Lifecycle per 11.5; `moderation` = sponsored, under review (§11.8) |
| `winners`                  | `TournamentWinner[]?`                        | Top-3 with `userId` + `username` + `avatar`. Only when `finished`. |
| `places`                   | `TournamentPlacesResponse?`                  | Percentage breakdown (1, 2, 3, 4–5, 6–10, …, 101–500)              |
| `participated`             | `boolean`                                    | User has joined                                                    |
| `participatedTicketsCount` | `number?`                                    | How many tickets the user has submitted                            |
| `userResult`               | `TournamentUserResult?`                      | `{ place?, lc, shards? }` — only when `finished` AND user joined   |
| `resultSeen`               | `boolean?`                                   | Whether the result popup has been dismissed                        |
| `sponsor`                  | `TournamentSponsor?`                         | Advertiser branding for a sponsored tournament (§11.8)             |

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

**Reset timing & countdowns.** Daily tasks reset at **00:00 UTC**; weekly tasks reset **Monday 00:00 UTC**; the rewarded-ads block resets with the daily boundary. The backend stamps every daily/weekly task (and the ads block) with `resetAt` — the exact period boundary — and the UI renders live countdowns from it: a small timer on each task card/row (kept on completed tasks to show when they re-open), a period-level "Next reset in …" line under the Daily/Weekly frequency tabs, and the ads-section timer. One-time tasks never reset and show no countdown.

### 12.3 Task Examples

Tasks guide user behavior and include actions such as:

- Inviting a certain amount of friends.
- Visiting specified websites or partner links.
- Joining a tournament.
- Sharing content on social media.
- Daily/Weekly/Monthly check-ins.

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
| VIP level                  | 1–10                       | cashback chain, 0 AP |

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

### Connections

Leaderboard ranking depends on activity, tasks, and tournaments.

---

## 14. Market System

### Purpose

The Market is the central hub for purchasing improvements, resources, and statuses. All purchases are paid in **Lucky Coin (LC)** or **Lucky Stars (LS)** — no fiat or crypto (see Section 19.3 for the full Mega Market structure).

### Sections

- **Engines:** Purchase additional producer engines for any unlocked tier with LC.
- **Tickets:** Purchase project or partner tickets directly with LC.
- **Shards:** chip fragments collected to build chips (Section 10.4). The **full tier ladder is listed** (Bronze → Diamond, both chip types, one shard per purchase, LC or LS) but the purchase is AP-tier-gated (14.1) — a player buys shards **of their own tier and below**; higher tiers show locked.
- **Statuses:** Lucky Player subscription and VIP unlock/upgrade (LC or LS — Section 7).
- **Cosmetics:** avatars, badges, themes (Section 16.1) — not tier-gated.
- Premium items (pre-built chips, chip builders, passes) are defined in the model but **not currently surfaced** — see Section 19.3 for the implemented-vs-deferred category list. (The legacy LC market **Speed Boost** was retired — engine speed is deepened via the engine's speed level, §10.2.)

> Engine **Capacity Upgrades** are not sold here — they are exclusive to the LuckyTicket365 Shop, paid only with LS (Section 19.3).

### 14.1 AP Tier Gate

Tier-bound market items (engines, chips, chip builders, boosters, tier tickets) are gated by the **AP tier** (Section 5.2): an item of tier `T` is buyable only when `AP-tier ≥ T`. Cosmetics (avatars, badges, themes) are **not** gated.

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

### Connections

The Market integrates with LC, LS, engines, boosts, tickets, statuses, and the AP tier gate.

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

#### 2. Buy Lucky Stars with Telegram Stars

Purchase LS with **Telegram Stars (XTR)** at a fixed **1:1 rate** — 1 Telegram Star = 1 LS. Powered by the Telegram Bot Payments API.

> Reference: 100 Telegram Stars ≈ $2 USD, so 1 LS ≈ $0.02. Final Telegram pricing may change.

#### 3. Buy Lucky Stars with TON

Purchase LS by spending TON. The LS amount is computed from the live TON→USD rate against the $0.02/LS anchor, with a **volume bonus** on larger packages (e.g. +0% / +5% / +10% / +15%). This is a one-directional purchase path — LS is not converted back to TON.

#### 4. Convert Lucky Coin to TON

LC reaches real money through **TON**. The user converts LC to TON at the fixed **$0.000001/LC** valuation (priced against the live TON→USD rate); the resulting TON lands in the wallet's TON balance and is cashed out via the TON withdrawal path above. Conversions are subject to the **15% fee** and the **$10/day cap** from §6.1 (`appConfig.economy.lcConversion`).

- The withdrawal action itself handles **TON only** — LC is never withdrawn directly.
- A **direct LC withdrawal** (LC straight to fiat/USDT, with its own minimums and commission) is **coming soon**.
- LC cannot be bought with real money (no deposit); it enters the economy solely through play and leaves it only by conversion to TON.

### Note on conversions

LC and LS do not convert into each other, and LS cannot be withdrawn. There is no LC deposit — LC is obtained only by playing, and leaves the economy by converting to TON (Action Section 4).

### Transaction History

A record of all balance events (LS purchases, in-game LS/LC earnings, spends), each with **Type**, **Amount**, **Date**, and **Status** (Completed / Pending / Failed).

---

## 16. Settings & Security

### Purpose

Settings provide control, security, and personalization for the user's account.

### Available Options

- **Two-Factor Authentication (2FA):** Enable extra security for the account.
- **Email Confirmation:** Confirm or change the linked email address.
- **Change Username:** Update the public display name.
- **Change Avatar:** Pick a profile picture from the user's owned avatar inventory. The picker lists every avatar the user owns — both the default free avatars and any paid avatars purchased in the Market. New avatars are acquired exclusively through the Market (see Section 16.1).
- **Notification Preferences:** Per-channel (Email / Telegram bot) toggles for which notification categories the user receives. See Section 16.2.
- **Sign Out:** Securely log out of the application.

### 16.1 Avatars — Free & Paid Tiers

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

**Rules:**

- Avatar ownership is **permanent** — once acquired, the avatar stays in the user's inventory and the bound boost remains available whenever that avatar is equipped.
- **Only one avatar is active at a time** — the boost from the currently equipped avatar applies; boosts from other owned avatars do not stack.
- Equipping is performed from the Settings → Change Avatar picker. Switching avatars is free and instantaneous.
- Avatar boosts **stack with status (Lucky Player/VIP) boosts** and with engine chips/boosters according to their respective rules.
- The picker renders avatars in level order, with a level badge and tier-coloured ring per tile. Level 10 carries an animated rainbow ring/badge to mark it as the apex avatar.

### 16.2 Notification Preferences

Two channels are supported: **Email** and **Telegram bot**. Each channel has its own independent set of category toggles. Categories cover the high-signal events:

- **Tournament start** — fires ~10 minutes before a joined tournament begins.
- **Tournament end** — fires after final places are announced.
- **Staking ready** — fires when a stake is mature and ready to claim.
- **System** — security, status, and account-related alerts.

Toggles are saved instantly (no submit button). Categories not listed here are not exposed as user-toggleable preferences.

---

## 17. Additional Features

### 17.1 Support Section

Provides assistance through:

- **Articles:** Detailed guides on how to use the platform.
- **Language Selection:** Switch between supported languages.
- **Notifications:** Manage alerts for system events and rewards.

### 17.2 Invite Friends

Encourages growth through referral rewards. Users can track their invited friends and view details such as:

- Invited friend count.
- Friend's status (Verified, Lucky Player, VIP).
- Friend's Activity Points.
- Friend's username and avatar.

**How a referral is established:**

Each user's invite link is a Telegram deep link — `https://t.me/<bot>?startapp=<referrerId>`. When a friend opens it, Telegram delivers `<referrerId>` as the `start_param` inside the signed `initData`. On the friend's **first** sign-in the backend records the referral (referrer → new user) and pays the inviter the signup reward below. The link is captured only at registration: a user who already has an account cannot be retro-attributed to a referrer, and each user can be referred at most once (self-referral is ignored).

**Referral Benefits:**

- **Signup Reward:** The moment a referred friend registers, the inviter is credited a one-off reward — **10 AP + 1 Lucky Star**, doubled to **20 AP + 2 Lucky Stars** when the invited friend is a Telegram Premium user. This is granted instantly (unlike the ticket commission below, which accumulates and must be claimed).

When an invited friend claims tickets, the inviter earns a percentage of those tickets as a claimable reward — mirroring the same claim mechanic used for regular tickets:

- **Ticket Commission:** For every ticket a referred friend claims, the inviter accumulates a percentage of that amount as claimable tickets of the same type. The commission rate has three tiers, keyed to the friend's account:

  | Friend's Account | Commission Rate |
  | :--------------- | :-------------- |
  | Regular          | 5%              |
  | Telegram Premium | 10%             |
  | Lucky Player     | 15%             |

  For example, if a regular friend claims 20 Bronze tickets, the inviter can claim 1 Bronze ticket; a Lucky Player friend claiming the same yields 3 Bronze tickets to the inviter. (Final percentages are knobs.)

- **Claim Mechanic:** These referral tickets are not credited instantly — they accumulate and must be actively claimed by the inviter, the same way regular tickets are claimed.
- **No LC Commission:** Referral rewards apply only to tickets. There is no commission on Lucky Coins (LC) earned by referred friends.

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

| Element                                                                                     | Own view | Public view |
| :------------------------------------------------------------------------------------------ | :------: | :---------: |
| Avatar, banner, username, status badge                                                      |    ✅    |     ✅      |
| Activity Points                                                                             |    ✅    |     ✅      |
| Activity flame / streak                                                                     |    ✅    |     ✅      |
| Badge showcase (pinned)                                                                     |    ✅    |     ✅      |
| Total badges earned count (e.g., 47 / 120)                                                  |    ✅    |     ✅      |
| "View all" badge grid                                                                       |    ✅    |     ✅      |
| Public social stats (tournaments played/won, stakes completed, tickets sent, friends count) |    ✅    |     ✅      |
| Likes received                                                                              |    ✅    |     ✅      |
| Friends preview (avatars row)                                                               |    ✅    |     ✅      |
| **LC / LS / TON balances**                                                                  |    ✅    |     ❌      |
| **Transaction history entry**                                                               |    ✅    |     ❌      |
| Per-tier ticket inventory counts                                                            |    ✅    |     ❌      |
| Email / phone / 2FA / Settings entry                                                        |    ✅    |     ❌      |
| Edit avatar / username / banner                                                             |    ✅    |     ❌      |
| Pin / Replace / Unpin badge menu                                                            |    ✅    |     ❌      |
| Buy showcase slot expansion                                                                 |    ✅    |     ❌      |
| Share own profile                                                                           |    ✅    |      —      |
| **Send Ticket / Invite to Tournament / Like** the profile owner                             |    —     |     ✅      |
| **Share** this profile                                                                      |    —     |     ✅      |

#### 17.3.1 Page Composition (top to bottom)

1. **Hero Header**
   - Large **avatar** with an **animated rotating gradient ring** around it. Ring color reflects the user's current status (Verified / Lucky Player / VIP). Ring fill represents **progress to the next Activity Points threshold**.
   - Cover **banner image** at the top of the page (cosmetic; customizable via the LuckyTicket365 Shop).
   - **Username** rendered with a **multi-status shine cycle**: the username's glow effect cycles through styles representing every status the user currently holds. Example: a user with Verified + Lucky Player + VIP cycles through Verified-blue glow → Lucky Player-purple glow → VIP-holographic glow (~2s per phase, looped). A user with a single status displays only that one effect.
   - **Status badges** displayed beside the username (Verified / Lucky Player / VIP X).
   - **Decorative badge collage** — three semi-transparent badge silhouettes drift slowly behind the avatar/name. The three slots are **user-selectable**, similar to showcase pinning: the user actively picks which badges appear in the background. Empty slots simply do not render.
   - **Activity flame** indicator next to the avatar (e.g., 7🔥 / 30🔥 / 100🔥) that pulses while the streak is active.

2. **Quick Stats Row** — four pill cards with count-up animation on first render: Activity Points, LC, LS, TON.

3. **Badge Showcase** — pinned badges (default 5 slots, expandable up to 20) with the animated "add slot" container and a "View all" entry to the full badge grid (see Section 17.4).

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

- **Edit avatar** — opens the avatar picker. The picker is also reachable from Settings (Section 16). New avatars are acquired in the Market; paid avatars carry a bound boost (see Section 16.1).
- **Edit username** — routes to Settings (see Section 16).
- **Change cover banner** — selects from owned banners. Premium banners are purchased in the Shop with Lucky Stars.
- **Pin / Replace / Unpin badges** — managed via the showcase long-press menu (see Section 17.4.7).
- **Pin / Replace decorative collage badges** — same long-press menu pattern, but on the three background-collage slots in the hero header.
- **Arrange banner icons** — drag the decorative banner icons (crown / star / gem) to reposition them on the cover banner; positions save automatically and are shown publicly. Icons cannot be placed over the avatar (see Section 17.3.1a).
- **Buy showcase slot expansion** — via the animated "+slot" container next to the showcase (see Section 17.4.8).
- **Preview as visitor** — a toggle button (typically in the top-right of the hero) that switches the page into the **Public view** of the user's own profile. While in preview, the page renders exactly as another user would see it — private balances, edit affordances, and Settings entry are hidden; social actions (Send Ticket, Invite to Tournament, Share, Like) appear on the action row but are non-functional (visual only). A persistent "Exit preview" button returns to Own view. Preview never modifies any data.
- **Share own profile** — copy link or share via Telegram.
- **Open Settings** — entry to the Settings & Security page (Section 16).

#### 17.3.3 Actions — Other User's Profile

When viewing another user's profile, the following actions are available (typically rendered as a row of buttons in the hero header):

- **Send Ticket** — opens the ticket-sending modal (selects tier and quantity from the user's owned tickets). Mirrors the Send action defined in Section 8.2.
  - **Daily limit per recipient, by tier.** Bronze / Silver / Gold are sendable by everyone — **1 each per day** to a given player. **Platinum and Diamond require Lucky Player status.**
  - With **Lucky Player**, the per-recipient daily limits rise to **Bronze 5 / Silver 4 / Gold 3 / Platinum 2 / Diamond 1**.
  - Limits live in `ticketSendDailyLimits` (`default` / `luckyPlayer`).
- **Invite to Tournament** — opens a partner tournament picker. Available only for tournaments the inviter holds the required partner ticket for. Sends an in-app invite to the target user.
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

- **5 free slots** are granted to every user.
- Up to **20 total slots** can be unlocked through one-time purchases.
- Each additional slot beyond the 5th costs **more than the previous one** — pricing is progressive (slot 6 cheapest, slot 20 most expensive).
- Slot expansions are paid **exclusively in Lucky Stars (LS)** — consistent with the platform's monetization principle that premium in-game purchases route through the LS channel (see Section 19.4).
- An **animated "add slot" container** is displayed adjacent to the showcase, inviting users to expand their lineup. The animation is intentionally eye-catching to drive monetization.
- A purchased slot is **permanent** — once unlocked it is the user's forever.

> Exact LS price per slot (and the progression curve from slot 6 → slot 20) is defined by the product team.

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
- `pinnedSlot?: number` — slot index (0–19) if pinned
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

The tour visits nine stops, in order:

| #   | Screen         | Highlights                      | Teaches                                 |
| --- | -------------- | ------------------------------- | --------------------------------------- |
| 1   | Home           | The free Bronze engine          | It mints tickets automatically          |
| 2   | Tickets        | The tickets summary             | Where minted tickets collect            |
| 3   | Tournaments    | A tournament card               | Spend tickets, win LC + chips           |
| 4   | Tasks          | The task tab rows               | Earn AP and rewards                     |
| 5   | Header         | The AP pill                     | AP is progression, Bronze→Diamond       |
| 6   | Stakes         | The stakes summary              | Lock LC for yield + AP                  |
| 7   | Invite Friends | The referral hero               | Earn a share from friends               |
| 8   | Home           | The engine's **Claim** button   | Claims the first ticket                 |
| 9   | Tournaments    | The first tournament's **Join** | Enter the first tournament — the finale |

The last two steps perform a **real action**: the player claims their first ticket, then taps **Join** on the first tournament to enter it (opening the join sheet) — the finale. After the claim step the tour briefly waits for the claim animation to finish (so the ticket actually mints) before navigating to Tournaments. Every other step is acknowledged with a tap. A **Skip tour** control is always available, and pressing Escape exits.

#### Trigger & Persistence

- **First-run flow:** for an account with `activityPoints === 0` that has not seen the tour, the `Onboarding` orchestrator shows the **language picker first**, then starts the guided tour once the language is confirmed — gated by the `appConfig.onboardingTour.autoStart` switch (set it to `false` to suppress the whole first-run flow — picker and tour — while testing the rest of the app).
- **Completion** (finishing or skipping) is persisted on the user via `hasSeenTour`, so it does not reappear.
- **Replay / reset:** Settings → _App tour_ offers "Take the tour" (run it any time, ignoring the flag) and "Reset onboarding" (clear `hasSeenTour` so it auto-shows again for a level-zero account).

#### Extending the Tour

Steps are defined declaratively in one place (`TOUR_STEPS` in `onboarding-tour.constants.ts`). Adding a step requires no engine changes: add a step object, put a `data-tour="<anchor>"` attribute on the element to highlight, and add its two translation keys (title + body) to every locale file (`en` / `ru` / `hy` / `de`). A step may also set `secondaryAnchor` to a second `data-tour` value — the spotlight then covers the **union** of both boxes (used by the Tasks step to highlight its two tab rows: the frequency tabs plus the sticky category nav, which can't share a wrapper without breaking its sticky scroll).

#### Connections

The tour spans Home / Engines (Section 9), Tickets (Section 8), Tournaments (Section 11), Tasks (Section 12), Activity Points (Section 5), Stakes (Section 18), and Invite Friends (Section 17.2).

---

### 17.6 Promo Codes

Operator-issued **promo codes** let players redeem rewards from a dedicated page (`/promo`, reached via the drawer). The player enters a code; on success a reward reveal lists what was granted and the affected balances refresh.

- A code grants one or more rewards — any mix of **LC**, **tickets** (of a given tier), or **Lucky Stars**.
- Codes are single-use per account: redeeming the same code twice returns "already used"; invalid and expired codes return their own messages.
- Codes are created and managed operator-side (admin/backend); the catalog is never exposed to the client. Players discover codes through distribution channels such as the Telegram channel.

## 18. Stakes System

### Purpose

A stake is a **time-locked LC deposit**. The user locks an amount of LC for a chosen number of months and, on completion, receives the deposit back plus an APR yield. Stakes are the LC "bank": they pull LC out of circulation (a velocity sink that fights inflation) while paying a modest, tunable return.

### Description

The user picks an LC amount and a duration. The LC is locked for that period; locked LC cannot be spent. On completion the principal is returned together with the APR yield, an AP completion bonus, and a guaranteed Lucky Stars payout. The stake may be cancelled early to retrieve the principal, but the yield, AP bonus, and completion Stars are forfeited.

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

**Lucky Stars (LS)** are LuckyTicket365's secondary internal currency, designed for premium upgrades and access to the exclusive LuckyTicket365 Shop. They run alongside LC and bridge into the broader economy via Telegram Stars and TON. Lucky Stars are the primary monetization currency: most premium in-game purchases are paid in LS rather than LC.

### Description

Lucky Stars are a LuckyTicket365 internal currency, stored in the user's app balance (visible on the Wallet page — see Section 15). Users:

1. **Earn** Lucky Stars through platform activity — stakes, tasks, friend invitations.
2. **Buy** Lucky Stars with Telegram Stars (XTR) at a fixed 1:1 rate, or with TON (with a volume bonus on larger packages).
3. **Spend** Lucky Stars in the LuckyTicket365 Shop.

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

After reaching a specific number of invited friends, the user receives a **guaranteed** Lucky Stars bonus — no draw, no chance. Every defined milestone triggers an automatic LS payout:

| Friends Invited | Guaranteed Lucky Stars |
| :-------------- | :--------------------- |
| Milestone 1     | TBD                    |
| Milestone 2     | TBD                    |
| Milestone N     | TBD                    |

> Exact milestones and LS amounts are defined by the product team. LS are awarded automatically upon reaching the threshold — the user does not need to claim them manually.

### 19.2 Buying Lucky Stars

In addition to earning, users may buy Lucky Stars from the Wallet page (see Section 15):

- **With Telegram Stars (XTR):** Fixed **1:1 rate** — 1 Telegram Star = 1 Lucky Star. Powered by the Telegram Bot Payments API. Reference price: 100 XTR ≈ $2 USD at the time of writing.
- **With TON:** Users spend TON to buy Lucky Stars at the live TON-to-USD market rate, anchored to the ~$0.02/LS baseline, with a **volume bonus** on larger packages (e.g. +0% / +5% / +10% / +15% by package size). This is a one-directional purchase — LS is not converted back to TON.

### 19.3 Spending Lucky Stars — The Mega Market

The Market (Mega Market) is the unified shop. **All purchases are paid in either Lucky Coin (LC) or Lucky Stars (LS) — no fiat / USDT / TON.** Items that already _grant_ Lucky Stars (bundles containing stars) are LC-only — users cannot pay stars to receive stars.

The Market opens with a **Hero card** showing the current featured deal (with countdown if limited) and a horizontal **filter chip strip**. The **implemented** categories, in priority order:

1. **All** — vertically stacked render of every other category.
2. **Status** — Lucky Player and VIP subscriptions (see Section 7). The card body links to the status's dedicated page; the in-card price buttons buy in place.
3. **Tickets** — buy tier tickets directly with LC (Section 14). Tier-locked.
4. **Shards** — chip fragments ({speed, capacity} per tier) collected and spent to build chips in the inventory (Section 10.4). Tier-locked; currently seeded for Bronze + Silver.
5. **Engines** — one producer engine per tier, level 1, priced with geometric repeat pricing (Section 14.2). Tier-locked.
6. **Cosmetics** — Avatars, badges, themes (mix of tier-themed and brand-themed accents). Always available regardless of tier. **Avatars are a two-tier sub-category** — free avatars (granted by default, cosmetic only) and paid avatars (purchased here; each paid SKU carries a bound boost — see Section 16.1).

**Deferred categories** — defined in the data model / roadmap but **not currently surfaced** as their own tab:

- **Chips** (pre-built, sold at level 1) and **Chip Builders** — today chips are assembled from **Shards** (above), not sold pre-built.
- **Passes** — time-limited subscriptions (Auto-Claim, Ad-Free, +25% LC, Tournament).
- **Bundles** — combo packs (see the Bundles note below).
- **Engine limited supply** — the `stock` / remaining-supply field exists on a market item (`MarketItem.stock`, FE `remainingSupply`) but is **not yet enforced or surfaced**; engines are currently unlimited.
- **Speed / Collect Boosts** (Section 10.1) — **retired.** The standalone LC market boost category (`MarketItemCategory.BOOST`) was removed from the seed, the catalog response, and the FE contract, and legacy DB rows are pruned on boot. Engine speed/capacity is deepened via per-engine-level LS upgrades (the engine cube, Section 10.2).
- **Boosters** — **retired from the storefront.** The market Booster listing (`MarketItemCategory.BOOSTER`, `buyBooster`) was removed from the seed, catalog response, and FE contract, and legacy DB rows are pruned on boot. Boosters remain an **inventory** item — earned from tournaments/tasks and equipped onto engines (Section 10.4 / §12); only the market _sale_ of boosters was removed (the `InventoryBooster` model is unaffected).
- **Avatar frames** (`AVATAR_FRAME` cosmetic) — **retired from the storefront.** No longer seeded; existing frame rows are pruned on boot (by `cosmeticType`, so avatars/badges/themes in the same COSMETIC category stay). The `MarketCosmeticType.AVATAR_FRAME` value is kept in the taxonomy but nothing is sold under it.

**Card visual language:** every Market item card shares the same template — a neutral `bg-background-overlay` card with a tier-accent bottom shine line, a 14×14 rounded-2xl icon stage with tier-tinted border + inset glow, the item name, a meta line (e.g. level / duration / contents), and 1–2 price buttons (LC and/or Lucky Stars), arranged 2 per row.

**Purchase flow:**

- Tapping a price button checks the matching balance.
- If the user has enough — opens a centered **purchase confirmation modal** with the item's icon, name, description, and price, plus a pill row showing the **available balance** of the currency being spent (compact-formatted) and — for tickets/shards — how many of that item the player **already owns**.
- If Lucky Stars are insufficient — opens the **Not-enough-Stars bottom sheet** (with top-up presets).
- If LC are insufficient — opens the **Not-enough-LC modal**.
- **Quantity selection** — countable items (tickets, shards) show a tournament-bet-style stepper (MIN / − / tap-to-type value / + / MAX) in the confirmation modal; the price row switches to the order **total** with a `unit × N` breakdown, and the Stars-purchase AP preview scales with the total. MAX is capped by what the balance covers and by a per-order cap (`marketMaxPurchaseQuantity` = 999 for tickets; `marketMaxShardPurchaseQuantity` = 10 for shards, whose backend endpoint buys one unit per request, so the client loops). Single-purchase items (engines, cosmetics, statuses) show no stepper.
- Confirming dispatches the corresponding RTK mutation (`buyEngine`, `buyTicket`, `buyStatus`, `buyShard`, `buyCosmetic`); `buyTicket` sends the chosen `count` natively. Mutations apply optimistic updates: the cost is deducted from `me.coins` / `me.telegramStars`, and the granted item is appended to the relevant cache (engines → ticket-tier engines, shards → inventory, tickets → ticket balance, status → `me`). On error, all patches are rolled back.

**Card-body tap:** tapping a card's body (not its price buttons) opens an item **info sheet** — except **Status** cards (Lucky Player / VIP), whose body links to the status's dedicated page (`/settings/lucky-player`, `/settings/vip` — the single canonical route used everywhere: header pills, profile, stakes, market) where it can be reviewed, bought, or extended. This link stays active even when the status is already owned (the in-card buy buttons lock, the body still navigates). Price buttons always buy in place.

**Discount mechanics:** Items can carry a `discountPct` and an `originalAmount` per price tier; the original is rendered with strikethrough beside the discounted amount. Featured deals can also carry an `expiresAt` rendered as a countdown.

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

Lucky Stars connect: the Stakes system, Task system, Invite Friends system, Engine system (Capacity Upgrades and Instant Claims), the LuckyTicket365 Shop, the Wallet (Telegram Stars and TON purchase paths), and the Profile showcase (slot expansions — Section 17.4). Telegram Stars (XTR) and TON serve as bridges between external value and the LuckyTicket365 internal economy.

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

| Recipient        | Share of pot | Notes                                                        |
| :--------------- | -----------: | :----------------------------------------------------------- |
| All participants |      **20%** | Split **equally** among every player in the charged instance |
| 1st place        |      **40%** | 50% of the 80% podium share                                  |
| 2nd place        |      **24%** | 30% of the podium share                                      |
| 3rd place        |      **16%** | 20% of the podium share                                      |

- Config: `appConfig.jackpot.participantsSharePercent` (20), `podiumSharePercent` (80), `podiumSplitPercent` (50/30/20). The whole-pot figures above are derived by `getJackpotWholePotSplit`.
- The **20% consolation** guarantees nobody in the charged tournament walks away with a jackpot-zero; the **80% podium** delivers the headline payout. A pure winner-takes-all model was rejected in favour of this spread.
- The jackpot win is surfaced to recipients **inside the existing tournament result popup** (`TournamentResultModal`, Section 11.5) as a distinct "JACKPOT" block, shown separately from the normal placement prize so the windfall is unmistakable.

### 20.4 Rounding, Reset & Carry-Forward

- Shares are floored to whole LC. Any **indivisible rounding remainder** (at most a few hundred LC, mostly from the equal 20% split across up to 500 participants) is **carried forward** as the seed of the next round rather than being lost or created.
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

## 22. Conclusion

LuckyTicket365 is a modular, scalable product built around engagement, fairness, and real value creation. Each system reinforces the others, creating a cohesive ecosystem that rewards consistent participation and long-term loyalty. The Lucky Stars (LS) currency, fueled by both Telegram Stars and TON, bridges the internal economy with external value — giving users tangible real-world worth for their activity on the platform.
