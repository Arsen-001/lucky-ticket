# Lucky Ticket

## Official Product Documentation

---

## 1. Introduction

### 1.1 Product Name

**Lucky Ticket**

### 1.2 Product Type

Lucky Ticket is a multilingual, gamified reward platform with a built-in virtual economy and crypto exchange layer.

### 1.3 Purpose of the Document

This document describes Lucky Ticket as a complete product. It explains **what** each system is, **why** it exists, **how** users interact with it, and **how** it connects to other parts of the platform. The document is intended for product managers, developers, designers, QA engineers, and business stakeholders.

---

## 2. Product Overview

Lucky Ticket is designed to convert user activity into measurable value. By interacting with the app daily, users collect tickets, participate in tournaments, complete tasks, and earn Lucky Coins (LC). These coins can be spent inside the ecosystem or exchanged for cryptocurrency.

The product combines:

- **Engagement mechanics:** Daily usage, streaks, decay
- **Progression systems:** Tickets, statuses, boosts
- **Competitive mechanics:** Tournaments, leaderboards
- **Monetization:** Market, status purchases, exchange offers

All systems are interconnected to encourage long-term retention and consistent activity.

---

## 3. Supported Platforms & Localization

### Purpose

Localization ensures global accessibility and higher user adoption across regions.

### Description

- Lucky Ticket is a web application.
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
- **Current Status:** Verified, Prime, or VIP.
- **Personal Statistics:** Tracking performance across the platform.

The profile connects to the leaderboard, tournaments, Market, and social features.

---

## 5. Activity Points System

### Purpose

Activity Points measure engagement and consistency. They are used to rank users and to gate access to high-level features such as VIP status.

### Description

Activity Points increase when users perform meaningful actions and decrease during inactivity.

### 5.1 How Activity Points Are Earned

Users gain points through every action, including:

- Claiming tickets
- Completing tasks
- Participating in tournaments
- Changing or upgrading status
- Daily app usage

### 5.2 Activity Decay

If the user does not open the app, their activity status decreases:

- A fixed number of Activity Points is deducted for each day the app is not opened.
- This creates pressure for consistent engagement.

### Connections

- Leaderboard ranking
- VIP eligibility
- Overall user progression

---

## 6. Currency System

### Purpose

The currency system enables value exchange, monetization, and rewards.

### 6.1 Lucky Coin (LC)

LC is the internal currency earned through activity and rewards.

### Usage

LC can be used to:

- Buy tickets
- Buy ticket producer engines (see Section 9)
- Purchase engine speed boosts
- Upgrade statuses
- Connect external wallet and exchange to cryptocurrency

### Connections

LC connects all core systems: market, tournaments, wallet, tasks, and progression.

---

## 7. Status System

### Purpose

Statuses reward trust, loyalty, and engagement while enabling monetization and progression control.

### 7.1 Status Levels

| Status       | Description                                           | Duration     |
| :----------- | :---------------------------------------------------- | :----------- |
| **Verified** | Identity confirmed via email or phone                 | Permanent    |
| **Prime**    | Paid mid-tier status with benefits                    | Time-limited |
| **VIP**      | High-tier leveled status with permanent game benefits | Permanent    |

### 7.2 Status Acquisition

- **Verified:** Identity confirmed via email or phone confirmation.
- **Prime:** Purchased via the Market (LC or cryptocurrency).
- **VIP:** Unlocked and upgraded via the Market. No Activity Points requirement. Detailed acquisition rules are described in Section 7.4.

### 7.3 Status Benefits

Statuses grant various privileges, such as:

- Badge displayed aside the user's nickname
- Engine speed boosts (faster production cycles)
- Market/Shop discounts
- Tournament advantages
- Early or priority access to features

### 7.4 VIP Status — Levels & Acquisition

VIP is a permanent, leveled status. Once a level is reached it never decreases or expires. The system is currently structured as a **10-level ladder driven by lifetime Activity Points** — every threshold is permanent and unlocks incrementally stronger game benefits. The ladder may be extended in the future; the values below define the current shipped set.

#### VIP Level Thresholds (Current)

| Level    | Lifetime AP threshold | Notes                              |
| :------- | --------------------: | :--------------------------------- |
| Level 1  |                   100 | Entry tier                         |
| Level 2  |                   500 | Early progression                  |
| Level 3  |                 2,000 | Casual play                        |
| Level 4  |                 5,000 | Regular player                     |
| Level 5  |                10,000 | Engaged user                       |
| Level 6  |                25,000 | High commitment                    |
| Level 7  |                50,000 | Heavy user                         |
| Level 8  |               100,000 | Dedicated player                   |
| Level 9  |               250,000 | Veteran                            |
| Level 10 |               500,000 | Top tier (current cap; extensible) |

> Exact reward payouts per level are defined by the product team in `tasks.mock.ts → VIP_LEVELS` (mirrored by the backend in production).

#### Payment Options

VIP levels are reached automatically by accumulating Activity Points — there is no direct purchase. Users may also accelerate progression indirectly:

- **Lucky Coins (LC)** spent in market actions that grant AP.
- **Telegram Stars (XTR)** spent on Capacity Upgrades / Instant Claims that drive engagement.

#### Rules

- VIP level is permanent: it cannot decrease, expire, or be lost through inactivity.
- Each level is reached when lifetime Activity Points first cross its threshold.
- Higher VIP levels grant incrementally stronger game benefits. Exact benefits per level are to be defined by the product team.

#### VIP Benefits

VIP benefits are game advantages granted per level. The full list will be defined by the product team. Benefits are permanent and stack with level progression.

### 7.5 Profile Status Category (Tasks)

In the **Tasks page**, the Premium-related and VIP-tier tasks are unified under a single **"Profile Status"** category. The category contains two presentation blocks:

1. **VIP-level slider** — a horizontal milestone slider showing the 10 VIP levels with their AP thresholds, current progress, and per-level rewards.
2. **Buy Prime row** — a single compact row prompting the user to acquire Prime status (LC or crypto via Market, see §14).

This grouping keeps all "user identity / progression status" tasks in one place rather than scattering Premium and VIP across the task list.

### Connections

Statuses influence market prices, claim efficiency, tournaments, and social visibility.

---

## 8. Ticket System

### Purpose

Tickets are the core progression and participation resource in Lucky Ticket. All available tickets can be viewed on the dedicated **Tickets page**.

### 8.1 Tickets Page

The Tickets page displays all project and partner tickets. Users can tap on any ticket to open its **Ticket Details page**.

### 8.2 Ticket Details Page

The Details page provides in-depth information about a specific ticket, including its rarity, claim speed, and duration.

- **Locked Ticket:** If the user does not yet own an engine that produces this ticket type, the bottom of the page displays the specific requirements (e.g., lower-tier claims, friend invites) needed to unlock the engine for this tier.
- **Unlocked Ticket:** If the user owns at least one engine of this tier, the page displays action buttons:
  - **Claim:** Collect tickets accumulated by the user's engine(s) of this tier.
  - **Buy Ticket:** Purchase the ticket directly using LC.
  - **Buy Engine:** Purchase an additional producer engine of this tier (see Section 9).
  - **Send:** Send the ticket to another user.

### 8.3 Ticket Categories

- **Project Tickets:** Bronze, Silver, Gold, Diamond, Platinum.
- **Partner Tickets:** Required to participate in tournaments from partners (e.g., A-partner tournament can only be joined via having an A-ticket).

### 8.4 Ticket Rarities

- Bronze (the Bronze producer engine is gifted to every user on first app launch — see Section 9)
- Silver
- Gold
- Diamond
- Platinum

### 8.5 Engine Unlocking

At first, only the Bronze engine is available (gifted on first launch). Higher-tier **producer engines** are unlocked by meeting specific requirements:

- Claiming a required number of lower-tier tickets (e.g., Bronze)
- Inviting a certain number of friends
- Participating in a specific number of tournaments
- Maintaining daily activity (visiting every day during X consecutive days)
- Completing specific tasks

Once an engine tier is unlocked, the user may acquire as many engines of that tier as desired (see Section 9).

### Connections

Tickets connect the Tickets page, claiming, tournaments, tasks, boosts, and market systems.

---

## 9. Ticket Producer Engines

### Purpose

Ticket production in Lucky Ticket is driven by **producer engines**. Every ticket the user accumulates is generated by an engine they own. Engines replace the previous direct-claim model: users no longer "mine" tickets generically — they own one or more engines, each of which produces a specific ticket type on its own cycle.

### 9.1 What an Engine Is

An engine is a permanent, ownable producer that:

- Produces **one specific ticket type** (Bronze, Silver, Gold, Diamond, Platinum, or partner-specific).
- Runs on a **production cycle** — a fixed time interval after which it outputs tickets.
- Has a **per-cycle output** — the number of tickets generated each cycle (default: 1, increasable via Telegram Stars upgrade).
- Accumulates produced tickets into a pending pool until the user claims them.

Engine ownership is permanent. Engines do not expire, decay, or get lost through inactivity.

### 9.2 Initial Engine (First-Launch Gift)

Every new user receives **one Bronze producer engine** for free on first app launch. This engine starts producing immediately, allowing every user to begin progressing without any purchase, unlock, or external action.

### 9.3 Acquiring Additional Engines

Beyond the initial gift, users obtain engines through:

- **Tier unlock:** Higher-tier engines (Silver, Gold, Diamond, Platinum) become available once the user satisfies the requirements in Section 8.5.
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

### 9.6 Instant Claim (Telegram Stars)

Users may pay **Telegram Stars (XTR)** to receive an engine's next ticket immediately, skipping the remaining wait time of the current production cycle. After an instant claim, the engine begins its next cycle just as it would after a normal claim.

- **Acquisition:** Available directly from the Tickets / Ticket Details page on any engine that is currently mid-cycle.
- **Cost:** Defined per engine tier by the product team. Higher-tier engines (Gold, Diamond, Platinum) cost more Stars to instant-claim than lower tiers.
- **Scope:** Targets a specific engine — only that engine's current cycle is fulfilled instantly; other owned engines continue their normal cycles.
- **Stacking:** Can be combined with active Speed Boosts and Capacity Upgrades — instant claim delivers the full per-cycle output (e.g., 2 tickets if a 2× Capacity Upgrade is active).

### 9.7 Engine Parameters

Each engine has two tunable parameters:

| Parameter            | Meaning                                                   | Modified By                          |
| :------------------- | :-------------------------------------------------------- | :----------------------------------- |
| **Production Speed** | Time per production cycle (e.g., 1 ticket every 2 hours). | Engine Speed Boost (Section 10.1)    |
| **Per-Cycle Output** | Number of tickets generated per cycle (default 1).        | Capacity Upgrade (Section 10.2, XTR) |

> Default cycle times and base outputs per engine tier are defined by the product team and may be tuned independently of this document.

### Connections

Engines connect to: ticket inventory, the Market (engine purchase), Section 8.5 (engine unlocks), Section 10 (boosts and capacity upgrades), tasks and tournaments (consumption of generated tickets), the Wallet (LC for purchases, Stars for capacity upgrades), and the Status system (status-granted speed boosts).

---

## 10. Engine Boosts & Upgrades

### Purpose

Boosts and upgrades let users increase the output of engines they already own without acquiring new ones.

### 10.1 Engine Speed Boost

A Speed Boost reduces an engine's production cycle time, increasing how often it produces tickets. Per-cycle output is unchanged.

**Example:** A Bronze engine that normally produces 1 ticket every 2 hours, with a 2× speed boost active, produces 1 ticket every 1 hour — doubling the production rate.

- **Acquisition:** Market purchase (LC) or status-based privilege (see Section 7.3).
- **Scope:** Applied to a specific engine the user owns.
- **Duration:** Time-limited (defined by product team).
- **Stacking:** Multiple speed boosts may stack within product-defined limits.

### 10.2 Capacity Upgrade (Telegram Stars)

A Capacity Upgrade increases an engine's **per-cycle output** — instead of producing 1 ticket per cycle, the engine produces 2 (or more) tickets per cycle. Cycle time is unchanged.

**Example:** A Bronze engine that normally produces 1 ticket every 2 hours, with a 2× capacity upgrade, produces 2 tickets every 2 hours — doubling output without changing the cycle.

- **Acquisition:** Purchased exclusively with **Telegram Stars (XTR)** in the Lucky Ticket Shop (see Section 19.2).
- **Scope:** Applied to a specific engine the user owns.
- **Tiers:** Higher-tier capacity upgrades may yield 3 or more tickets per cycle (defined by product team).
- **Duration:** Defined by product team (permanent or time-limited per upgrade tier).

### 10.3 Stacking Speed and Capacity

Speed Boosts and Capacity Upgrades target independent engine parameters and may be applied simultaneously. Their effects multiply.

**Example:** A Bronze engine with both a 2× Speed Boost and a 2× Capacity Upgrade produces **2 tickets every 1 hour — 4× the base rate**.

### Connections

Boosts and upgrades connect engines to the Market (LC speed boosts), the Telegram Stars system (capacity upgrades), the Status system (boost privileges), and the LC and Stars currency systems.

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
- **Required Ticket:** The specific ticket type needed to join (Project or Partner).
- **Prize Pool:** The summary of all coins that will be distributed among winners.
- **Start Time:** The date and time when the tournament begins and winners are decided.
- **Team Size:** The total number of users participating in the tournament.

### 11.3 Participation & Winning Logic

- Users join by submitting one or more tickets.
- Winners are selected randomly from the pool of participants at the designated Start Time.
- **Probability:** Joining with more tickets increases the chance of winning.

### Connections

Tournaments connect tickets, LC rewards, tasks, and leaderboard positioning.

---

## 12. Task System

### Purpose

Tasks guide user behavior and introduce structured goals.

### 12.1 Task Frequencies

Tasks are organized by reset cadence into three top-level tabs:

- **Daily** — reset every 24 hours
- **Weekly** — reset every 7 days
- **Once** (one-time / lifetime) — never reset

### 12.2 Task Categories

Within each frequency tab, tasks are grouped into thematic categories. Each category corresponds to one gameplay system or progression axis:

- **Tournaments** — participation, place wins, tier-specific play
- **Tickets** — ticket collection milestones (general + per-tier)
- **Engines** — engine ownership milestones (general + per-tier)
- **Stakes** — completed stake count + total LC volume staked
- **Stars** — purchasing and earning Telegram Stars
- **Friends** — referral / invite milestones
- **Leaderboard** — rank achievements per period (daily / weekly / monthly / all-time)
- **Social** — platform follows (Telegram, Twitter/X, Discord, YouTube)
- **Achievements** — wide-ranging lifetime badges spanning every system (see §12.5)
- **Profile Status** — VIP-level progression + Buy Prime row (see §7.5)
- **Profile** — account setup actions (verify email, 2FA, avatar, wallet)
- **Partners** — cross-promotion with partner mini-apps
- **Market** — first-touch and recurring market actions
- **Quest** — onboarding chain shown only in the Once tab

### 12.3 Task Structure

Each task contains:

- **Title:** A pre-localized clear name for the task.
- **Subtitle / Description:** Pre-localized explanation of what the user needs to do.
- **Reward(s):** One or more prizes awarded upon completion (tickets, LC, AP, Stars, engines, premium).
- **Progress:** `{ current, target }` numeric progress (target=1 for binary tasks).
- **Status:** One of `IN_PROGRESS`, `READY_TO_CLAIM`, `COMPLETED`, `LOCKED`.
- **Sub-steps (optional):** A list of sub-tasks (e.g., 7 day-of-week steps) that can be claimed individually or all at once via "Claim all".
- **Tier (optional):** Tier this task belongs to — used for gating and tier-themed visuals.
- **Rarity:** Visual rarity frame (`COMMON` / `RARE` / `EPIC` / `LEGENDARY`).
- **Deeplink / External Link (optional):** Where the card navigates when tapped.

### 12.4 Task Examples

Tasks guide user behavior and include actions such as:

- Inviting a certain amount of friends.
- Visiting specified websites or partner links.
- Joining a tournament.
- Sharing content on social media.
- Daily/Weekly/Monthly check-ins.

### 12.5 Achievements Category

The **Achievements** category contains wide-ranging lifetime badges that span every gameplay system but **never duplicate** the count milestones already covered by the other category sliders. Achievements focus on:

- **Special feats** — one-shot moments tied to specific actions (e.g., "Diamond Ticket", "Maxed Out", "Diamond Engineer").
- **Cross-system combos** — challenges that span multiple systems in a window (e.g., "Triple Threat", "Currency Tycoon", "Quest Master").
- **Hidden / time-based** — soft easter eggs (e.g., "Night Owl", "Early Bird", "Last Second", "Anniversary").
- **Persistence / loyalty** — long-horizon goals (7/30/90/365-day streaks, "Loyal" — 1 year of activity).
- **Statuses & wallet first-touch** — Verified, Prime, VIP unlock, wallet linked, first deposit/withdrawal, Stars→LC swap.
- **Referral depth** — referrals beyond a count milestone (Premium friend, VIP referral, 3rd-level chain).

#### Progressive Disclosure (Collapse)

Achievements is a long list. The UI shows the **3 most actionable** achievements by default (READY_TO_CLAIM and IN_PROGRESS first, COMPLETED at the bottom). Two action buttons let the user expand:

- **See more (+N)** — reveals the next batch (currently +2 per click).
- **See all (N)** — expands every remaining achievement at once.
- **Show less** — appears once expanded; collapses back to the initial 3 and smooth-scrolls back to the section start.

When the section is expanded, the action row sticks to the bottom of the viewport (above the tab bar) so the user can collapse from anywhere in the list.

#### Pin Mechanism (Achievements only)

Inside Achievements, every non-completed / non-locked / non-ready task has a **pin button** in the top-right corner. Pinned achievements float to the top of their status group (after READY_TO_CLAIM and before unpinned IN_PROGRESS). There is no upper bound on the number of pins. Pin state is persisted in `localStorage` under the key `lt:pinned-tasks`.

### 12.6 Milestone Sliders

For categories with progressive count-based goals, the **once tab** renders a horizontal milestone slider above the regular row grid. Each card shows one threshold (e.g., 100 → 250 → 500 → 1000) and progresses left-to-right. Sliders apply to:

- **Tournaments** — podium / participation / place 1st-2nd-3rd, plus per-tier variants
- **Tickets** — collect N tickets (general + 4 tier sub-tabs: Silver/Gold/Platinum/Diamond)
- **Engines** — own N engines (general + 4 tier sub-tabs)
- **Stakes** — complete N stakes + stake N LC total (general + 4 tier sub-tabs)
- **Stars** — purchase N Stars + earn N Stars (no sub-tabs)
- **Friends** — invite N friends (no sub-tabs)
- **Leaderboard** — reach top-N rank (4 period sub-tabs: daily / weekly / monthly / all-time)
- **Profile Status** — VIP-level progression (single 10-card slider, see §7.5)

Slider sub-tabs include a sliding indicator and animate a brief skeleton (~320 ms) on swap. Tier-tab keys whose tasks are locked for the current user (tier > USER_TIER) render a Lock icon.

### 12.7 All-Tasks Completion Bonus

When a user completes **all tasks** within a given frequency tab (Daily or Weekly), they receive an extra gift in addition to the individual task rewards. This bonus is separate from the per-task rewards and is awarded automatically upon finishing the last task in the set.

### 12.8 One-Time Tab Category Order

The Once tab uses a fixed ordering optimized for player progression and frequency of interaction:

1. Tournaments
2. Tickets
3. Engines
4. Stakes
5. Stars
6. Friends
7. Leaderboard
8. Social
9. Achievements
10. Profile Status
11. Profile (hidden in Once — daily/weekly only)
12. Partners (hidden in Once)
13. Market (hidden in Once — first-touch lives in Profile)

Profile, Partners, and Market are intentionally **excluded from the Once tab** because their tasks are either daily-recurring (Market visit) or already covered by Profile setup / Partner promotions in other surfaces.

### Connections

Tasks drive activity, ticket acquisition, and retention.

---

## 13. Leaderboard

### Purpose

The leaderboard provides social comparison and competitive motivation.

### Description

- Global ranking based on Activity Points.
- Displays top users.

### 13.1 Leaderboard Periods

The leaderboard is computed across **four time windows**, each maintained independently and reset on its own cycle:

| Period       | Reset cycle   | Notes                                           |
| :----------- | :------------ | :---------------------------------------------- |
| **Daily**    | Every 24 h    | Most volatile; rewards short bursts of activity |
| **Weekly**   | Every 7 days  | Mid-term consistency                            |
| **Monthly**  | Every 30 days | Long-term commitment                            |
| **All-time** | Never resets  | Lifetime competitive ladder; hardest to crack   |

Within the Tasks page, the Leaderboard category shows period sub-tabs that let the user view rank-milestone tasks per period. Reward payouts scale with period difficulty (All-time pays the most for the same rank).

### 13.2 Rank Milestones

For each period, rank-based milestone tasks are exposed as a horizontal slider:

- top 1000 → top 500 → top 100 → top 50 → top 10 → **#1** (LEGENDARY)

Reaching a higher (lower-numbered) rank in any period awards proportionally larger rewards. The #1 milestone always carries a Stars bonus.

### Connections

Leaderboard ranking depends on activity, tasks, and tournaments.

---

## 14. Market System

### Purpose

The market is a central hub for purchasing improvements, resources, and statuses using internal or external currency.

### Sections

- **Engines:** Purchase additional ticket producer engines for any unlocked tier using LC (see Section 9).
- **Boosts:** Purchase Engine Speed Boosts that reduce an engine's production cycle time (see Section 10.1).
- **Tickets:** Purchase project or partner tickets directly using LC.
- **Statuses:** Purchase Prime status (LC or cryptocurrency) or unlock/upgrade VIP status (LC or Telegram Stars). See Section 7.4 for VIP level details.

> **Note:** Engine **Capacity Upgrades** are not sold here — they are exclusive to the Lucky Ticket Shop and purchased only with Telegram Stars (see Section 19.2).

### Connections

The Market integrates with LC, engines, boosts, tickets, and statuses.

---

## 15. Wallet Page

### Purpose

The Wallet page serves as the central hub for managing the user's balances and performing financial actions, including connecting external wallets, swapping currencies, and moving funds in or out of the platform.

### Balances

The top of the Wallet page displays two balance figures:

- **Lucky Coin (LC) Balance:** The user's current internal currency holdings.
- **Telegram Stars (XTR) Balance:** The user's current Telegram Stars holdings earned through platform activity.

### Action Sections

The Wallet page provides three action sections:

#### 1. Connect Wallet

Allows users to link an external cryptocurrency wallet to the platform. A connected wallet is required for withdrawals and deposits involving cryptocurrency.

#### 2. Swap Telegram Stars to Coins

Allows users to convert their accumulated Telegram Stars (XTR) into Lucky Coins (LC) at a defined exchange rate. This action bridges Telegram's native currency back into the platform's internal economy.

#### 3. Withdraw and Deposit

Allows users to move funds in and out of the platform via a connected external wallet. Supported currency pairs:

- **USD ↔ LC:** Deposit USD to receive LC, or withdraw LC as USD.
- **TON ↔ LC:** Deposit TON (Toncoin) to receive LC, or withdraw LC as TON.

Both directions (deposit and withdrawal) are available for each supported currency.

**Withdrawal Rules:**

- **Minimum Withdrawal Amount:** A minimum LC threshold must be met before a withdrawal can be initiated. Withdrawals below this limit are not permitted.
- **Commission Fee:** A fee is deducted from each withdrawal. The fee amount or percentage is defined by the product team and displayed to the user before confirming the transaction.

### Transaction History

A detailed record of all past activities, including earnings, purchases, swaps, and wallet-related events, is maintained in the history log:

- **Type:** The nature of the transaction (e.g., LC to USDT, Stars to LC, Deposit, Withdrawal).
- **Amount:** The quantity involved.
- **Date:** Timestamp of the transaction.
- **Status:** (e.g., Completed, Pending, Failed).

---

## 16. Settings & Security

### Purpose

Settings provide control, security, and personalization for the user's account.

### Available Options

- **Two-Factor Authentication (2FA):** Enable extra security for the account.
- **Email Confirmation:** Confirm or change the linked email address.
- **Phone Confirmation:** Confirm or change the linked phone number.
- **Change Username:** Update the public display name.
- **Sign Out:** Securely log out of the application.

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
- Friend's status (Verified, Prime, VIP).
- Friend's Activity Points.
- Friend's username and avatar.

**Referral Benefits:**

When an invited friend claims tickets, the inviter earns **10% of those tickets** as a claimable reward — mirroring the same claim mechanic used for regular tickets:

- **Ticket Commission:** For every ticket a referred friend claims, the inviter accumulates a percentage of that amount as claimable tickets of the same type. The commission rate depends on whether the friend has **Telegram Premium**:

  | Friend's Telegram Account | Commission Rate |
  | :------------------------ | :-------------- |
  | Regular                   | 10%             |
  | Telegram Premium          | 20%             |

  For example, if a regular friend claims 20 Bronze and 10 Silver tickets, the inviter can claim 2 Bronze and 1 Silver tickets. If that friend has Telegram Premium, the inviter can claim 4 Bronze and 2 Silver tickets.

- **Claim Mechanic:** These referral tickets are not credited instantly — they accumulate and must be actively claimed by the inviter, the same way regular tickets are claimed.
- **No LC Commission:** Referral rewards apply only to tickets. There is no commission on Lucky Coins (LC) earned by referred friends.

### 17.3 Profile Page (Statistics)

A dedicated section where users can view their performance, transaction history, and detailed progression metrics.

---

## 18. Stakes System

### Purpose

Stakes allow users to lock a portion of their LC coins for a fixed period in exchange for guaranteed and bonus rewards. The mechanic encourages long-term coin commitment and rewards users proportionally to how much they stake.

### Description

A stake is a 3-hour claim-like session. The user selects an amount of LC to lock, and after the full 3-hour period completes, the user receives all rewards associated with their stake level. Coins cannot be used while locked, but the user may cancel the stake early to retrieve their coins — however, no rewards are granted if the stake ends before the full duration.

### 18.1 Stake Levels

Stakes are organized into numbered levels (Level 1 through Level 5). Each level requires a minimum LC deposit and grants a set of rewards. Higher levels include all rewards from every level below them — a user who meets the Level 3 threshold automatically receives all Level 1, Level 2, and Level 3 rewards.

| Level   | Minimum Deposit | Guaranteed Ticket | Bonus Prizes                                                 | Includes Lower Levels |
| :------ | :-------------- | :---------------- | :----------------------------------------------------------- | :-------------------- |
| Level 1 | 100 LC          | Bronze            | LC coins, Engine Speed Boost                                 | (base level)          |
| Level 2 | 500 LC          | Silver            | LC coins, Engine Speed Boost, Engine Capacity Upgrade        | + Level 1             |
| Level 3 | 1,000 LC        | Gold              | LC coins, Engine Speed Boost, Engine Capacity Upgrade, Badge | + Level 1–2           |
| Level 4 | 2,500 LC        | Platinum          | LC coins, Engine Boosts & Upgrades, Premium Badge            | + Level 1–3           |
| Level 5 | 5,000 LC        | Diamond           | Large LC bonus, Engine Boosts & Upgrades, Exclusive Badge    | + Level 1–4           |

> Thresholds and level count may be updated by the product team independently of this document.

### 18.2 Reward Structure

Every completed stake grants:

- **Guaranteed Ticket:** A ticket corresponding to the user's stake level (Bronze at L1, Silver at L2, Gold at L3, Platinum at L4, Diamond at L5).
- **All Lower-Level Tickets:** Tickets from every level below the user's current level are also awarded.
- **Chance at Bonus Prizes:** Each level enters the user into a random draw for extra prizes, which may include:
  - Additional LC coins
  - Engine Speed Boosts or Engine Capacity Upgrades (see Section 10)
  - Badges (Premium Badge at Level 4, Exclusive Badge at Level 5)
- **Chance at Telegram Stars:** Completing a stake session enters the user into a draw for Telegram Stars proportional to the stake level (see Section 19). Stars are not guaranteed — they are part of the bonus prize pool.

### 18.3 Stake Duration & Early Cancellation

- **Duration:** Every stake lasts exactly **3 hours** regardless of level.
- **Completion:** After 3 hours, all rewards (tickets, bonuses, and Telegram Stars) are distributed and become claimable.
- **Consecutive Stakes:** A new stake can only be started after the user claims the rewards from the previous one. Unclaimed rewards block the next stake session.
- **Early Cancellation:** The user may cancel the stake at any time before the 3-hour period ends. Locked coins are returned in full. No rewards are granted — including guaranteed tickets, bonus prizes, or a chance at Telegram Stars.

### Connections

Stakes connect the LC currency system, tickets, boosts, badges, and Telegram Stars. Completing stakes contributes to overall user progression and may interact with tasks and leaderboard activity.

---

## 19. Telegram Stars Integration

### Purpose

Telegram Stars (XTR) are Telegram's native virtual currency. Lucky Ticket integrates Stars as a reward layer that runs alongside the existing LC economy — giving users real Telegram value for their activity and enabling a frictionless in-app shop powered by Telegram's native payment infrastructure.

### Description

Stars are issued by Lucky Ticket directly to users' Telegram accounts via the Bot Payments API (currency code: `XTR`). Users accumulate Stars through platform activity and spend them in the Lucky Ticket Shop without leaving Telegram.

### 19.1 How Users Earn Telegram Stars

Stars are awarded through three channels:

#### Stakes

Every successfully completed stake session (all 3 hours, no early cancellation) enters the user into a **random draw** for Telegram Stars. Stars are not guaranteed — they are part of the bonus prize pool alongside LC coins and Boosts. The chance and potential Star amount scale with stake level:

| Stake Level | Star Draw Chance | Potential Stars Awarded |
| :---------- | :--------------- | :---------------------- |
| Level 1     | TBD              | TBD                     |
| Level 2     | TBD              | TBD                     |
| Level 3     | TBD              | TBD                     |
| Level 4     | TBD              | TBD                     |
| Level 5     | TBD              | TBD                     |

> Exact probabilities and Star amounts per level are defined by the product team.

#### Task Completion

Completing tasks from any category (Daily, Weekly, Monthly) gives a **chance** to receive Telegram Stars in addition to the standard ticket/coin/boost prizes. Stars are not guaranteed on every task — they appear as a random bonus outcome. Star-eligible tasks are marked distinctly in the task list.

#### Friend Invitations

After reaching a specific number of invited friends, the user receives a **guaranteed** Telegram Stars bonus — no draw, no chance. Every defined milestone triggers an automatic Stars payout:

| Friends Invited | Guaranteed Telegram Stars |
| :-------------- | :------------------------ |
| Milestone 1     | TBD                       |
| Milestone 2     | TBD                       |
| Milestone N     | TBD                       |

> Exact milestones and Star amounts are defined by the product team. Stars are awarded automatically upon reaching the threshold — the user does not need to claim them manually.

### 19.2 Spending Telegram Stars — The Shop

Users spend their accumulated Stars in the **Lucky Ticket Shop**, powered by Telegram's native Stars payment flow. The Shop offers items purchasable exclusively with Stars (not LC):

- **Engine Capacity Upgrades:** Increase the per-cycle output of an owned engine (e.g., 2 tickets per cycle instead of 1). Sold exclusively in the Shop and only with Stars (see Section 10.2).
- **Instant Claims:** Skip the remaining wait time on an engine's current cycle and receive its next ticket(s) immediately (see Section 9.6). Triggered from the Tickets / Ticket Details page on a per-engine basis.
- **Cosmetic items:** Avatar frames, profile effects, visual upgrades.
- **Exclusive tickets:** Partner or limited-edition tickets not available in the standard Market.
- **Status upgrades:** Discounted or exclusive access to Prime/VIP status.

> Shop inventory and pricing in Stars are managed by the product team and may be updated at any time.

### 19.3 Technical Integration

Lucky Ticket integrates Telegram Stars via the **Telegram Bot Payments API**:

- Invoice links are generated server-side with `currency: "XTR"`.
- Payments are processed natively inside Telegram — no external checkout.
- Star balances and transaction history are visible in the user's Telegram account.
- Lucky Ticket tracks awarded Stars per user for analytics and audit purposes.

### Connections

Telegram Stars connect the Stakes system, Task system, Invite Friends system, the Engine system (via Capacity Upgrades — see Section 10.2), and the Lucky Ticket Shop. Stars serve as a bridge between Lucky Ticket's internal economy and Telegram's native value ecosystem.

---

## 20. Conclusion

Lucky Ticket is a modular, scalable product built around engagement, fairness, and real value creation. Each system reinforces the others, creating a cohesive ecosystem that rewards consistent participation and long-term loyalty. The Telegram Stars integration extends this ecosystem into the native Telegram economy, giving users tangible real-world value for their activity on the platform.
