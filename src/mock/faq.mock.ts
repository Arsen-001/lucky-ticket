import type { FaqArticle, FaqSection, LocalizedText } from '@/types/interfaces/faq.interfaces';

/**
 * Knowledge-base content for the FAQ page. Sourced from DOCS/DOCS.md (the
 * product source of truth); keep figures in sync with it when business rules
 * change.
 *
 * **English only, deliberately.** The rest of the app is localized into every
 * language it ships; this screen is not. The knowledge base is long-form prose
 * that states thresholds, percentages and refund windows, and a translation of
 * it that nobody here can read is a support article quietly telling a player
 * something untrue. `getLocalizedText` falls back to `en`, so every reader gets
 * the English article rather than a blank one.
 */

/** Compact constructor: the FAQ carries one language. */
const tx = (en: string): LocalizedText => ({ en });

const articles: FaqArticle[] = [
  // ── 1. Getting Started ───────────────────────────────────────────────
  {
    id: '1',
    sectionId: '1',
    title: tx('What is LuckyTicket365?'),
    description: tx('A quick overview of the platform.'),
    content: tx(
      'LuckyTicket365 is a multilingual, gamified reward platform with its own virtual economy and a built-in TON crypto wallet. You turn daily activity into value: collect tickets, join tournaments, complete tasks and earn Lucky Coins (LC). LC can be spent inside the app or converted to TON and withdrawn.'
    ),
  },
  {
    id: '2',
    sectionId: '1',
    title: tx('How do I start playing?'),
    description: tx('Your first steps and welcome gift.'),
    content: tx(
      'Right after you pick your language on first launch, you receive a welcome pack — 1 Bronze producer engine, 5 Bronze tickets and 1 Activity Point — by tapping Claim. The Bronze engine immediately starts minting tickets for free, so you can begin progressing with no purchase or unlock required. A guided tour then shows you around the app.'
    ),
  },
  {
    id: '3',
    sectionId: '1',
    title: tx('What can I do in the app?'),
    description: tx('The main systems at a glance.'),
    content: tx(
      'Own engines that produce tickets, spend those tickets to join tournaments for LC prizes, complete daily/weekly tasks for rewards, lock LC in stakes to earn yield, climb tiers with Activity Points, buy upgrades in the Market, compete on the leaderboard, invite friends for a share of their tickets, and collect 100+ badges. A single global Jackpot can also drop on any tournament at any time.'
    ),
  },
  {
    id: '4',
    sectionId: '1',
    title: tx('Which languages and platforms are supported?'),
    description: tx('Localization and access.'),
    content: tx(
      'LuckyTicket365 is a web app that runs as a Telegram Mini App and also in a regular browser. The interface, tasks, support articles and notifications are available in 18 languages. You can switch language any time in Settings.'
    ),
  },

  // ── 2. Activity Points & Tiers ───────────────────────────────────────
  {
    id: '5',
    sectionId: '2',
    title: tx('What are Activity Points (AP)?'),
    description: tx('The single progression metric.'),
    content: tx(
      "Activity Points are the one progression metric of the platform — there is no separate 'level'. AP measures your engagement and consistency, and acts as the universal gate that unlocks higher-tier content (engines, tournaments, stakes, tier market items). Your profile shows the raw AP count."
    ),
  },
  {
    id: '6',
    sectionId: '2',
    title: tx('What are the tiers and how do I move up?'),
    description: tx('Bronze → Diamond progression.'),
    content: tx(
      // Numbers deliberately absent. This answer used to publish 1 650 AP for
      // Gold and 5 900 for Platinum — a hundredth of the live thresholds — and
      // it was corrected in the backend catalog only, so the two texts drifted
      // and any `sync-faq` run would have shipped the wrong ladder back to
      // players. Kept identical to `faq.catalog.ts` on purpose: this file is
      // the source, the catalog is the copy.
      'There are five tiers — Bronze, Silver, Gold, Platinum and Diamond. Each one opens on two conditions at once: enough accumulated Activity Points, and enough invited friends — 2 for Silver, 5 for Gold, 10 for Platinum, 20 for Diamond. The AP totals themselves are not published: the ladder is retuned as the game grows, and the Activity screen always shows how far along the current step you already are. Tournaments and one-off tasks move it fastest; missed days move it back through AP decay.'
    ),
  },
  {
    id: '7',
    sectionId: '2',
    title: tx('How do I earn Activity Points?'),
    description: tx('All the AP sources.'),
    content: tx(
      // EMAIL OFF (2026-08-17) — «verifying email (20, one-time)» dropped from
      // the list: the flow is off in the Mini App, so that AP cannot be earned.
      // It goes back between the task line and the ads line — grep `EMAIL OFF`.
      'Almost every meaningful action grants AP: daily login streak (3), daily/weekly tasks (scaling 1–5 / 2–6 by tier), watching ads (2 each), sending tickets to friends (1), liking profiles (1), inviting friends (10, or 20 for a Telegram Premium friend), joining tournaments (1–5 by tier), and spending — 1 AP per 10 Lucky Stars or per 25,000 LC spent (uncapped). Completing a stake credits LC×months÷50,000.'
    ),
  },
  {
    id: '8',
    sectionId: '2',
    title: tx('What is the daily baseline?'),
    description: tx('How much AP an active player earns per day.'),
    content: tx(
      // EMAIL OFF (2026-08-17) — `verify email` dropped from the one-off list.
      'The daily baseline is the approximate AP a fully-active player earns each day without spending money. It rises with tier because tasks scale: ~33 at Bronze, ~39 Silver, ~47 Gold, ~57 Platinum, ~70 Diamond. One-off sources (invites, tournaments, stakes, purchases) are earned on top of this baseline.'
    ),
  },
  {
    id: '9',
    sectionId: '2',
    title: tx('What happens if I stop playing? (Activity Decay)'),
    description: tx('Inactivity lowers AP — but you lose no assets.'),
    content: tx(
      "After 7 days of inactivity (a grace period with no decay), AP drops by 0.5× your tier's daily baseline per inactive day (≈35 AP at Bronze, ≈76 at Diamond), down to a floor of 0. Any action resets the timer. Lower AP can freeze content above your new tier, but no assets are lost — engines, tickets and LC remain and unfreeze when AP recovers. You can never fall below Bronze."
    ),
  },
  {
    id: '10',
    sectionId: '2',
    title: tx('What is the AP tier gate?'),
    description: tx('How tiers unlock content.'),
    content: tx(
      // AVATARS OFF (2026-08-09) — the cosmetics feature is switched off, so it
      // cannot be named among the things a tier does not gate. Put `avatars, `
      // back at the head of that list when it returns — grep `AVATARS OFF`.
      'A feature of tier T requires your AP-tier ≥ T, and you can always use your own tier and every lower tier. Tier-gated: producer engines, tournaments, stakes and tier-bound market items. Not gated: statuses/VIP and the referral system.'
    ),
  },

  // ── 3. Currencies ────────────────────────────────────────────────────
  {
    id: '11',
    sectionId: '3',
    title: tx('What is Lucky Coin (LC)?'),
    description: tx('The internal reward currency.'),
    content: tx(
      'LC is the internal reward currency, earned only by playing — tournament prizes, stake yield, task and ad rewards. It is spent on tickets, engines, speed boosts and status upgrades. LC cannot be bought with real money; it reaches real value by converting to TON at a fixed platform rate, which is then withdrawn. A direct LC withdrawal is coming soon.'
    ),
  },
  {
    id: '12',
    sectionId: '3',
    title: tx('What are Lucky Stars (LS)?'),
    description: tx('The premium real-money currency.'),
    content: tx(
      'Lucky Stars are the premium currency used for premium upgrades and the Mega Market. You buy them with Telegram Stars (1:1) or TON, and also earn them in-game from stakes, tasks and invites. LS is never withdrawn and does not convert into LC or TON — it flows in and is spent inside the platform.'
    ),
  },
  {
    id: '13',
    sectionId: '3',
    title: tx('Can I convert LC and Lucky Stars into each other?'),
    description: tx('No — they are separate.'),
    content: tx(
      'No. LC and Lucky Stars are two separate currencies and never convert into each other. LC is earned by playing and leaves the economy only by converting to TON. Lucky Stars are bought or earned and are only spent in-app. There is no LC deposit and Lucky Stars cannot be withdrawn.'
    ),
  },

  // ── 4. Tickets ───────────────────────────────────────────────────────
  {
    id: '14',
    sectionId: '4',
    title: tx('What are tickets?'),
    description: tx('The core participation resource.'),
    content: tx(
      'Tickets are the core resource you spend to join tournaments, send to friends, or hold in inventory. They come in five rarities — Bronze, Silver, Gold, Platinum, Diamond — plus Partner tickets used for specific partner tournaments. Every ticket you own was produced by an engine you own.'
    ),
  },
  {
    id: '15',
    sectionId: '4',
    title: tx('How do I get more tickets?'),
    description: tx('Production, market and rewards.'),
    content: tx(
      'Tickets are minted by your producer engines on a cycle and collected by claiming. You can also buy tickets directly in the Market with LC, or receive them as task rewards and tournament prizes. Higher-tier tickets require their tier to be AP-unlocked.'
    ),
  },
  {
    id: '16',
    sectionId: '4',
    title: tx('How do I unlock higher ticket tiers?'),
    description: tx('The AP tier gate on engines.'),
    content: tx(
      'At first only Bronze is available (gifted on launch). Higher-tier producer engines unlock with your AP tier: reaching Silver AP unlocks Silver engines, Gold AP unlocks Gold, and so on. Once a tier is unlocked you can own as many engines of that tier as you like. If AP decays below a threshold, that tier freezes until AP recovers — nothing is lost.'
    ),
  },
  {
    id: '17',
    sectionId: '4',
    title: tx('What are Partner tickets?'),
    description: tx('For partner tournaments.'),
    content: tx(
      'Partner tickets are a separate category required to join partner tournaments (e.g. an A-partner tournament needs an A-ticket). They appear under the Partners tab on the Tickets page, which currently shows partner integrations as they roll out.'
    ),
  },

  // ── 5. Producer Engines ──────────────────────────────────────────────
  {
    id: '18',
    sectionId: '5',
    title: tx('What is a producer engine?'),
    description: tx('The thing that mints your tickets.'),
    content: tx(
      'An engine is a permanent, ownable producer that mints one specific ticket type on a fixed production cycle. Each engine has a per-cycle output (default 1 ticket) and accumulates produced tickets into a pending pool until you claim them. Engines never expire, decay or get lost.'
    ),
  },
  {
    id: '19',
    sectionId: '5',
    title: tx('How does production and claiming work?'),
    description: tx('The claim-gated cycle.'),
    content: tx(
      'An engine runs one cycle and outputs its ticket(s) into a pending pool, then pauses — the next cycle does not begin until you claim what it produced. Claiming moves tickets into your inventory and immediately restarts the engine. This claim-gates-production rule applies per engine, so claiming regularly keeps output flowing.'
    ),
  },
  {
    id: '20',
    sectionId: '5',
    title: tx('What are the base production times per tier?'),
    description: tx('Cycle times double each tier.'),
    content: tx(
      'Base cycle time doubles per tier, with 1 ticket per cycle by default: Bronze 2h, Silver 4h, Gold 8h, Platinum 16h, Diamond 32h. These can be sped up with boosts and chips, but one ticket can never be minted faster than 15 minutes (a hard floor).'
    ),
  },
  {
    id: '21',
    sectionId: '5',
    title: tx('Can I run multiple engines at once?'),
    description: tx('Unlimited parallel production.'),
    content: tx(
      'Yes — you can own and run an unlimited number of engines of any unlocked tier in parallel. They all produce independently and accumulate output simultaneously. For example, 3 Bronze engines plus 1 Silver engine yield 3 Bronze tickets per Bronze cycle and 1 Silver ticket per Silver cycle at the same time.'
    ),
  },
  {
    id: '22',
    sectionId: '5',
    title: tx('What is Instant Claim?'),
    description: tx('Skip the wait with Lucky Stars.'),
    content: tx(
      "Instant Claim lets you pay Lucky Stars to receive an engine's next ticket immediately, skipping the remaining cycle time. The cost is 1 Star per remaining hour, minimum 1 Star (so a 30-min remainder costs 1★, a 90-min remainder 2★). It gets cheaper as the cycle nears completion and delivers the full per-cycle output, including any capacity bonus."
    ),
  },
  {
    id: '23',
    sectionId: '5',
    title: tx('How do I get more engines?'),
    description: tx('Unlock, buy or earn.'),
    content: tx(
      'Beyond the free Bronze engine, you acquire engines by unlocking their tier with AP and buying them in the Market with LC (you can own as many of a tier as you want), or by receiving them as task rewards, tournament prizes or stake bonuses.'
    ),
  },

  // ── 6. Engine Boosts, Chips & Boosters ───────────────────────────────
  {
    id: '24',
    sectionId: '6',
    title: tx('What is a Speed Boost vs a Capacity Upgrade?'),
    description: tx('Two independent engine parameters.'),
    content: tx(
      "A Speed Boost reduces an engine's cycle time so it produces more often (bought with LC or granted by status). A Capacity Upgrade increases per-cycle output — 2 or more tickets per cycle instead of 1 (bought only with Lucky Stars, on the engine itself). They target independent parameters and multiply: a 2× speed + 2× capacity engine produces 4× its base rate."
    ),
  },
  {
    id: '25',
    sectionId: '6',
    title: tx('What are chips?'),
    description: tx('Tournament-won engine upgrades.'),
    content: tx(
      'Chips are a third boost layer earned only from tournaments. There are two types: Speed Chips (reduce cycle time) and Capacity Chips (increase output). Each engine has one Speed slot and one Capacity slot. Each chip levels up +0.5% per level, up to +100% at level 200. Chips stack multiplicatively with Speed Boosts and Capacity Upgrades.'
    ),
  },
  {
    id: '26',
    sectionId: '6',
    title: tx('What are chip shards and how do I level chips?'),
    description: tx('Fragments won from tournaments.'),
    content: tx(
      'Shards are fragments dropped by tournaments (top-3 only: 3 / 2 / 1 shards for 1st/2nd/3rd). Your first shard of a type auto-mints a chip at level 1; further shards level it up — level 2 needs 1 shard, level 3 needs 3, and the cost keeps rising. Each tournament drops only one chip type (Speed or Capacity), alternating between events. Shard quality matches the tournament tier.'
    ),
  },
  {
    id: '27',
    sectionId: '6',
    title: tx('What is a Chip Builder?'),
    description: tx('Minting extra chips.'),
    content: tx(
      'Chips are assembled from shards in the inventory: spend matching shards to mint a new chip of that type+tier, or to level up one you already own. Shards come from tournaments and from the Market Shards tab. Pre-built chips and Chip Builders are not sold.'
    ),
  },
  {
    id: '28',
    sectionId: '6',
    title: tx('What are the chip tier and equip rules?'),
    description: tx('Chips work down the tier ladder.'),
    content: tx(
      'A chip of quality X can be equipped on an engine of tier X or lower (a Gold chip works on Bronze/Silver/Gold engines), making higher-tier chips more valuable. Equipping costs Lucky Stars equal to the chip level (Lvl 12 = 12★); unequipping costs half, rounded up (Lvl 12 = 6★). Moving a chip between engines pays both, discouraging constant shuffling.'
    ),
  },
  {
    id: '29',
    sectionId: '6',
    title: tx('What are Engine Boosters?'),
    description: tx('One-shot timed buffs.'),
    content: tx(
      'Boosters are one-shot, time-limited consumables (Time or Capacity) you activate on an engine for a fixed duration — 3h, 6h, 12h, 24h or 48h. They are tier-locked (a Bronze booster only fits a Bronze engine) and come from tasks and tournament prize pools — they are no longer sold in the Market. The countdown runs in real time and cannot be paused once started.'
    ),
  },
  {
    id: '30',
    sectionId: '6',
    title: tx('What is the Boost Inventory?'),
    description: tx('Where your boost items live.'),
    content: tx(
      'The Boost Inventory stores every owned-but-not-equipped boost item: Speed and Capacity Chips, the shards you have not spent yet, and your boosters. From there you mint a new chip or level one up with shards, and put chips onto engines. Chips are permanent — a chip keeps working for as long as it stays in a slot. The timed layer is the booster: it runs its 3–48 hours once and is gone.'
    ),
  },

  // ── 7. Tournaments ───────────────────────────────────────────────────
  {
    id: '31',
    sectionId: '7',
    title: tx('What is a tournament?'),
    description: tx('Competition for LC prizes.'),
    content: tx(
      'Tournaments are timed competitions you enter by submitting tickets (which are consumed). At the start time, winners are drawn randomly from all participants — submitting more tickets increases your chance. The prize pool is LC plus chip shards for the top 3. Daily project tournaments are named by time-of-day and tier, e.g. "Morning Bronze", "Night Diamond".'
    ),
  },
  {
    id: '32',
    sectionId: '7',
    title: tx('What do I need to join a tournament?'),
    description: tx('Three entry conditions.'),
    content: tx(
      'Entry requires three things: the correct ticket type, your AP-tier ≥ the tournament tier, and the tier being platform-activated (higher tiers open only once the active player base is large enough). You can enter your own tier and any lower tier. Joining also grants AP scaled by tier (1 at Bronze up to 5 at Diamond).'
    ),
  },
  {
    id: '33',
    sectionId: '7',
    title: tx('How big are the prizes?'),
    description: tx('Prize pool by tier.'),
    content: tx(
      'The prize pool is teamSize × LC-per-seat, where per-seat LC is Bronze 40,000, Silver 100,000, Gold 250,000, Platinum 600,000, Diamond 1,500,000. It is split top-heavy: 1st gets 12%, 2nd 8%, 3rd 5%, 4–5 4% each, 6–10 2% each, down to small shares for places up to 500. (10% of every pool is first skimmed into the global Jackpot.)'
    ),
  },
  {
    id: '33b',
    sectionId: '7',
    title: tx('How are results delivered?'),
    description: tx('Auto-credited, no manual claim.'),
    content: tx(
      'When a tournament finishes, every participant\'s reward is computed and auto-credited to their balance — there is no manual claim step. The top 3 also receive chip shards automatically. You get an in-app notification with your placement, and opening the finished tournament shows a result popup (celebratory for top-3, a placement summary for 4–500, or "better luck next time" beyond 500). You can re-open it anytime via the Result button.'
    ),
  },
  {
    id: '34',
    sectionId: '7',
    title: tx('How do the tournament tabs work?'),
    description: tx('All, Top, Participated, History.'),
    content: tx(
      'The tournaments list has four tabs: All (upcoming tournaments), Top (upcoming you have not joined yet), Participated (upcoming you have joined), and History (finished tournaments you took part in, read-only). Each tab shows a count badge.'
    ),
  },

  // ── 8. Stakes ────────────────────────────────────────────────────────
  {
    id: '35',
    sectionId: '8',
    title: tx('What is a stake?'),
    description: tx('A time-locked LC deposit.'),
    content: tx(
      'A stake locks an amount of LC for a chosen number of months. On completion you get your principal back plus an APR yield in LC, an AP completion bonus, and a guaranteed Lucky Stars payout. Stakes are the LC "bank" — they pull LC out of circulation to fight inflation while paying a modest return.'
    ),
  },
  {
    id: '36',
    sectionId: '8',
    title: tx('How much yield do stakes pay?'),
    description: tx('Duration and APR.'),
    content: tx(
      'You choose 1 to 12 months. The yield rate scales linearly with duration — 1% at 1 month up to 5% at 12 months. For example, 1,000,000 LC locked for 12 months returns +50,000 LC. Lucky Player adds +20% on top of the yield and VIP adds +40% (they do not stack — the higher wins).'
    ),
  },
  {
    id: '37',
    sectionId: '8',
    title: tx('What are the stake tiers?'),
    description: tx('Minimum deposit per tier.'),
    content: tx(
      'Stakes have five AP-gated tiers by minimum deposit: Bronze 100,000 LC, Silver 500,000 LC, Gold 1,000,000 LC, Platinum 2,500,000 LC, Diamond 5,000,000 LC. The tier sets the per-month Lucky Stars multiplier on completion (Bronze 2 → Diamond 6 stars per month).'
    ),
  },
  {
    id: '38',
    sectionId: '8',
    title: tx('What rewards does a completed stake give?'),
    description: tx('Principal, yield, stars and AP.'),
    content: tx(
      'A completed stake returns the full principal, the APR yield in LC, guaranteed Lucky Stars (months × per-tier multiplier — e.g. a 12-month Diamond stake pays 72★), and AP. The base AP (LC×months÷50,000) is credited at start and kept even if cancelled, plus a +50% completion bonus granted only if it runs to the end.'
    ),
  },
  {
    id: '39',
    sectionId: '8',
    title: tx('Can I cancel a stake early?'),
    description: tx('Yes, but you forfeit the extras.'),
    content: tx(
      'You can cancel early to get your principal back and keep the base AP credited at start. However the APR yield, the +50% AP completion bonus and the completion Stars are all forfeited, and a Stars cancellation fee applies. You can also run multiple stakes at the same time.'
    ),
  },
  {
    id: '40',
    sectionId: '8',
    title: tx('What are the stake fees?'),
    description: tx('Stars to open and cancel.'),
    content: tx(
      'Both opening and cancelling cost Telegram Stars. The base unit is ceil(deposit / 100,000) — 100,000 LC = 1★. The opening fee applies month and volume discounts (longer + larger = cheaper), minimum 1★. Cancelling costs max(2, 2 × base). As onboarding, your first 10 Bronze stakes ever are free to open (the cancel fee still applies).'
    ),
  },

  // ── 9. Market ────────────────────────────────────────────────────────
  {
    id: '41',
    sectionId: '9',
    title: tx('What can I buy in the Market?'),
    description: tx('The Mega Market categories.'),
    content: tx(
      // AVATARS OFF (2026-08-09) — the Cosmetics chip is filtered out of
      // `MARKET_CATEGORY_ORDER` while avatars are off, so the article listed a
      // category the storefront does not show. Gifts are named instead, with
      // the condition that actually governs the chip (the shop being open).
      'The Market is the single storefront — there is no separate Shop. Paid in LC or Lucky Stars (no fiat). Surfaced categories: Status (Lucky Player/VIP), Tickets, Shards and Engines — plus Telegram Gifts while the gift shop is open. Engine Capacity Upgrades are not sold here — they are bought with Lucky Stars on the engine itself.'
    ),
  },
  {
    id: '42',
    sectionId: '9',
    title: tx('What are the Passes?'),
    description: tx('Time-limited subscriptions.'),
    content: tx(
      'Passes are time-limited subscriptions: Auto-Claim Pass (auto-claims every cycle, sold in 1/7/15/30-day durations), Ad-Free Pass (removes ads but keeps ad-task rewards), +25% LC Pass (extra LC on every claim), and Tournament Pass (free entry, priority matchmaking, exclusive chip drop).'
    ),
  },
  {
    id: '43',
    sectionId: '9',
    title: tx('Why do bought tickets cost more than they return?'),
    description: tx('The house edge keeps the economy stable.'),
    content: tx(
      "Market prices follow a ~×3 per-tier ladder (e.g. a Bronze engine 2,000,000 LC, Bronze ticket 60,000 LC). A ticket's price equals 1.5× the tournament LC-per-seat, always above the average LC a ticket returns. This house edge stops bought tickets from being a money loop — free engine-produced tickets are your free roll, and the Market is the main LC sink that keeps LC valuable."
    ),
  },

  // ── 10. Wallet, TON & Lucky Stars ────────────────────────────────────
  {
    id: '44',
    sectionId: '10',
    title: tx('What does the Wallet show?'),
    description: tx('Three balances.'),
    content: tx(
      'The Wallet shows three balances: Lucky Coin (LC, earned by playing), Lucky Stars (premium, bought or earned), and TON (your Toncoin used to buy Lucky Stars). From here you connect an external wallet, buy Lucky Stars, convert LC to TON and withdraw TON.'
    ),
  },
  {
    id: '45',
    sectionId: '10',
    title: tx('How do I buy Lucky Stars?'),
    description: tx('Telegram Stars or TON.'),
    content: tx(
      'Two ways: with Telegram Stars (XTR) at a fixed 1:1 rate (1 Telegram Star = 1 Lucky Star, via the Telegram Bot Payments API), or with TON at the live TON rate, with a volume bonus on larger packages (e.g. +0% / +5% / +10% / +15%). Buying is one-directional — Lucky Stars are not converted back.'
    ),
  },
  {
    id: '46',
    sectionId: '10',
    title: tx('How do I cash out my LC?'),
    description: tx('Convert to TON, then withdraw.'),
    content: tx(
      'LC reaches real money through TON. You convert LC to TON at a fixed platform rate; the TON lands in your wallet and is withdrawn from there. Withdrawals handle TON only — LC is never withdrawn directly. A direct LC withdrawal (to fiat/USDT) is coming soon.'
    ),
  },

  // ── 11. Statuses: Lucky Player & VIP ─────────────────────────────────
  {
    id: '47',
    sectionId: '11',
    title: tx('What statuses exist?'),
    description: tx('Verified, Lucky Player, VIP.'),
    content: tx(
      // EMAIL OFF (2026-08-17) — Verified said "confirm identity via email or
      // phone". Email confirmation is switched off in the Mini App and phone
      // confirmation was never built at all, so the sentence named two ways to
      // earn a badge and neither existed. It now says what is true: the badge is
      // permanent and free, and there is currently no way to earn it. Restore
      // the email half when the flow returns — grep `EMAIL OFF`.
      'There are three statuses: Verified (a free, permanent badge — earning it is temporarily closed), Lucky Player (a paid monthly subscription with benefits — time-limited) and VIP (a permanent, leveled high-tier status). Statuses are bought with LC or Lucky Stars and are NOT gated by Activity Points.'
    ),
  },
  {
    id: '48',
    sectionId: '11',
    title: tx('What does Lucky Player give me?'),
    description: tx('Mid-tier paid perks.'),
    content: tx(
      'Lucky Player is a paid subscription: faster engines, a bigger LC yield on stakes, a Market discount, extra rewarded-ad views per day, higher per-tier ticket-send limits (including Platinum and Diamond), one-tap "Claim all", and a daily gift. The exact amounts are platform settings and can change — Settings → Lucky Player always lists what the subscription grants right now.'
    ),
  },
  {
    id: '49',
    sectionId: '11',
    title: tx('What does VIP give me, and how is it priced?'),
    description: tx('High-tier permanent status.'),
    content: tx(
      'VIP is permanent and leveled (up to level 20) — it never expires or drops. Each level raises the same perk set: engine speed, stake LC yield, Market discount, daily rewarded-ad views and per-tier ticket-send limits; the higher levels also unlock one-tap "Claim all". Levels are bought one at a time with LC or Lucky Stars, and every level has its own price. Settings → VIP shows what your level grants today and exactly what the next one adds.'
    ),
  },
  {
    id: '50',
    sectionId: '11',
    title: tx('Do Lucky Player and VIP stack?'),
    description: tx('Mostly the higher tier wins — with three exceptions.'),
    content: tx(
      'Mostly no — when both are active, the percent-based perks (stake yield, Market discount, ad views per day, ticket sends) use the VIP value and are never summed. Three things a Lucky Player keeps no matter the VIP level: the engine-speed multiplier (it multiplies on top of the VIP bonus), the daily ad views taken without watching a video, and one-tap "Claim all". Taking a view without watching pays the same reward and uses up that view for the day, but it does not count as a watched ad — the "watch N ads" tasks only move when an ad actually plays. Also, the matching discount is excluded when buying that status (no VIP discount on buying VIP).'
      // AVATARS OFF (2026-08-09) — the sentence that closed this answer,
      // «Avatar boosts do still stack on top of your status.», describes a boost
      // nobody can own while the feature is off. Restore it verbatim with the
      // feature — grep `AVATARS OFF`.
    ),
  },

  // ── 12. Tasks ────────────────────────────────────────────────────────
  {
    id: '51',
    sectionId: '12',
    title: tx('How do tasks work?'),
    description: tx('Daily, weekly, monthly goals.'),
    content: tx(
      'Tasks are structured goals in Daily, Weekly and Monthly categories. Each gives a reward (tickets, coins or boosts) plus a fixed number of Activity Points. Examples include inviting friends, joining a tournament, visiting partner links or daily check-ins. Completing ALL tasks in a category grants an extra bonus on top of the individual rewards.'
    ),
  },
  {
    id: '52',
    sectionId: '12',
    title: tx('What are the Ads watch milestones?'),
    description: tx('A lifetime ad-watching chain.'),
    content: tx(
      'The Ads one-time task is a milestone chain rewarding cumulative ads watched (never resets): 10, 25, 50, 100, 200, 400, 800 ads. Rewards grow from 200 LC + 1 AP at level 1 up to 15,000 LC + 10 tickets + 3 Stars + 21 AP at level 7, with extra levels coming soon.'
    ),
  },

  // ── 13. Leaderboard ──────────────────────────────────────────────────
  {
    id: '53',
    sectionId: '13',
    title: tx('How does the leaderboard work?'),
    description: tx('Global AP ranking.'),
    content: tx(
      "The leaderboard is a global ranking based on Activity Points, displaying the top users. Because AP comes from daily activity, tasks and tournaments, climbing the leaderboard is a direct reflection of how active and consistent you are. Tapping any avatar opens that player's public profile."
    ),
  },

  // ── 14. Invite Friends & Referrals ───────────────────────────────────
  {
    id: '54',
    sectionId: '14',
    title: tx('How do referrals work?'),
    description: tx('A cut of what your friends win.'),
    content: tx(
      'Share your invite link: everyone who opens the game through it becomes your friend permanently. When a friend takes a prize in a tournament, 4% of that prize accrues to you in LC — and 1% of a prize won by someone THEY invited, so a second level pays you too (it stops there). The money is minted on top: your friend loses nothing, and the jackpot is not included. A friend counts as a referral — and pays — while they stay subscribed to the official channel and have not blocked the bot; if they drop out they remain your friend and keep whatever they already earned you, but stop paying until they return.'
    ),
  },
  {
    id: '55',
    sectionId: '14',
    title: tx('How do I get my referral rewards?'),
    description: tx('It accumulates, then you claim it.'),
    content: tx(
      "The LC is not credited instantly: it accumulates per friend on the Invite Friends screen and is claimed there, one friend at a time or with «Claim all». One press pays both halves at once — that friend's own cut and everything their own invitees have brought in — and it only pays while they still count as a referral. Inviting a friend also pays a one-off 10 AP + 1 Lucky Star immediately, the same for every friend, with no condition attached."
    ),
  },

  // ── 15. Jackpot ──────────────────────────────────────────────────────
  {
    id: '56',
    sectionId: '15',
    title: tx('What is the Jackpot?'),
    description: tx('A secret, platform-wide prize pool.'),
    content: tx(
      'The Jackpot is a single global prize pool that grows from tournament play and drops — without warning — onto one secretly chosen tournament, paying a large bonus to everyone in that tournament. There is no separate jackpot ticket: any regular ticket you submit could be the lucky one, because nobody knows which tournament is charged.'
    ),
  },
  {
    id: '57',
    sectionId: '15',
    title: tx('How does the Jackpot grow and drop?'),
    description: tx('Accrual and the secret moment.'),
    content: tx(
      'Every tournament skims 10% of its prize pool into the one global pot (the placement table then splits the remaining 90%). An operator secretly "charges" the pot onto a single tournament instance of any tier; when that tournament finishes, the pot drops. There is intentionally no countdown anywhere — the suspense is spread across every tournament.'
    ),
  },
  {
    id: '58',
    sectionId: '15',
    title: tx('How is the Jackpot split when it drops?'),
    description: tx('20% to all, 80% to the podium.'),
    content: tx(
      'When the pot drops, 20% is split equally among every player in the charged tournament (so nobody walks away with zero), and 80% goes to the podium — 1st gets 40% of the whole pot, 2nd 24%, 3rd 16%. It is paid on top of the normal tournament prize and shown as a distinct "JACKPOT" block in the result popup. After a drop the pot resets and starts climbing again.'
    ),
  },

  // ── 16. Profile & Avatars ────────────────────────────────────────────
  {
    id: '59',
    sectionId: '16',
    title: tx('What is on my profile?'),
    description: tx('Your public identity and stats.'),
    content: tx(
      // The badge showcase and the achievements collage are commented out in
      // `ProfilePage`/`ProfileHero` — achievements are not being issued yet — so
      // the answer must not promise two blocks the screen does not draw.
      'Your profile shows your avatar with a status ring, username, status badges, Activity Points, activity streak, and detailed stats per system (tickets, tournaments, stakes, tasks). Others can view a public version where your balances and transaction history are hidden, and can Send Ticket, Invite to Tournament, Share or Like you.'
    ),
  },
  // AVATARS OFF (2026-08-09) — the whole article is parked, not reworded: it
  // answers a question about a ladder the player cannot reach at all. The
  // picker row is out of Settings, the Cosmetics chip is out of the Market and
  // the profile pencil is gone, so every route into it is closed. A knowledge
  // base that describes a feature nobody can find reads as breakage, not as
  // documentation. Uncomment it together with the feature — grep `AVATARS OFF`.
  /*
  {
    id: '60',
    sectionId: '16',
    title: tx('How do avatars and their boosts work?'),
    description: tx('Free and paid avatar tiers.'),
    content: tx(
      'Avatars have a 10-level ladder. Levels 1–2 are free (cosmetic only); levels 3–10 are paid in the Market and carry a bound boost (engine speed, market discount, claim multiplier, AP earn or tournament reward), growing from ~3–5% up to ~25% at the animated level-10 apex. Ownership is permanent, but only one avatar is active at a time — its boost stacks with your status and engine boosts.'
    ),
  },
  */
  {
    id: '61',
    sectionId: '16',
    title: tx('What are profile likes?'),
    description: tx('A lightweight social signal.'),
    content: tx(
      'Any user can like your profile once every 24 hours (no lifetime cap). Your total received likes are shown on the profile and feed into the Social badge category (milestones at 100 / 1,000 / 10,000 likes). Likes grant no currency — they are a pure vanity signal tied to badges.'
    ),
  },

  // ── 17. Badges & Achievements ────────────────────────────────────────
  {
    id: '62',
    sectionId: '17',
    title: tx('What are badges and achievements?'),
    description: tx('100+ collectible milestones.'),
    content: tx(
      'LuckyTicket365 ships 100+ badges across categories like Status, Stakes, Tickets, Engines, Tournaments, Streaks, Social, Finance, Tasks, Leaderboard and rare Exclusives. Every meaningful action contributes to one or more badges. They are account-bound (non-tradeable) and act as a visible identity layer other players see on your profile.'
    ),
  },
  {
    id: '63',
    sectionId: '17',
    title: tx('What are rarities and the showcase?'),
    description: tx('From Common to Mythic.'),
    content: tx(
      'Badges have five rarities — Common, Rare, Epic, Legendary, Mythic — driving their visuals and animations. All badges stay visible (locked ones are dimmed with a progress indicator). You pin favorites into a showcase: 5 free slots, expandable up to 20 via one-time Lucky Stars purchases. Some badges grant a bonus reward when first earned.'
    ),
  },

  // ── 18. Promo Codes ──────────────────────────────────────────────────
  {
    id: '64',
    sectionId: '18',
    title: tx('How do promo codes work?'),
    description: tx('Redeem operator-issued rewards.'),
    content: tx(
      'Enter an operator-issued promo code on the Promo page (in the drawer). A valid code grants one or more rewards — any mix of LC, tickets of a given tier, or Lucky Stars — and your balances refresh. Codes are single-use per account: redeeming the same one twice returns "already used", and invalid or expired codes show their own message. Watch the Telegram channel for codes.'
    ),
  },

  // ── 19. Account, Settings & Security ─────────────────────────────────
  {
    id: '65',
    sectionId: '19',
    title: tx('What can I change in Settings?'),
    description: tx('Account and personalization.'),
    content: tx(
      // The answer listed six things Settings does not have. Rewritten from the
      // screen itself, row by row:
      //  - EMAIL OFF (2026-08-17) — the email row and its "+20 AP" are gone;
      //  - 2FA has no row at all: nothing links to /settings/security, and the
      //    toggle behind that URL writes `twoFactorEnabled` with no secret, no
      //    verification and no second factor — see `2FA OFF` in tasks.mock;
      //  - AVATARS OFF (2026-08-09) — the avatar picker row is commented out;
      //  - language is switched from the side menu, and there is no sign-out in
      //    the app at all (the session is the Telegram one).
      // What IS there: username, notification toggles, the paid-upgrade
      // confirmation switch and the tour. Grep `EMAIL OFF` / `AVATARS OFF`.
      'Settings hold your username, your notification preferences (a toggle per event for the Telegram bot), a switch that asks before every paid engine upgrade, and a replay of the app walkthrough. Language is changed from the side menu.'
    ),
  },
  {
    id: '66',
    sectionId: '19',
    title: tx('How do notification preferences work?'),
    description: tx('Per-channel toggles.'),
    content: tx(
      // EMAIL OFF (2026-08-17) — the email channel is off, so there is one
      // channel left and no channel tabs on the screen. The event list is also
      // brought up to what Settings actually shows (it named four of the eight).
      // Restore the two-channel wording with the flow — grep `EMAIL OFF`.
      'Notifications come from the Telegram bot, with a toggle per event: Tournament start (~10 min before a joined tournament), Tournament end, Tournament invites, Staking ready (when a stake matures), Gifts, Friends joined, Achievements, and News & announcements. Toggles save instantly, no submit button — and the in-app inbox keeps every event either way.'
    ),
  },
];

const SECTION_TITLES: Record<string, LocalizedText> = {
  '1': tx('Getting Started'),
  '2': tx('Activity Points & Tiers'),
  '3': tx('Currencies: LC & Lucky Stars'),
  '4': tx('Tickets'),
  '5': tx('Producer Engines'),
  '6': tx('Engine Boosts, Chips & Boosters'),
  '7': tx('Tournaments'),
  '8': tx('Stakes'),
  '9': tx('Market'),
  '10': tx('Wallet, TON & Lucky Stars'),
  '11': tx('Statuses: Lucky Player & VIP'),
  '12': tx('Tasks'),
  '13': tx('Leaderboard'),
  '14': tx('Invite Friends & Referrals'),
  '15': tx('Jackpot'),
  // AVATARS OFF (2026-08-09) — was 'Profile & Avatars'; the section no longer
  // holds an avatar article. Restore the title with the feature.
  '16': tx('Profile'),
  '17': tx('Badges & Achievements'),
  '18': tx('Promo Codes'),
  // Was 'Account, Settings & Security'. With 2FA out of the Settings answer the
  // section holds nothing about security, and a heading that promises one is the
  // same kind of false signpost the answers themselves were.
  '19': tx('Account & Settings'),
};

const sections: FaqSection[] = Object.entries(SECTION_TITLES).map(([id, title]) => ({
  id,
  title,
  articles: articles
    .filter(article => article.sectionId === id)
    .map(article => ({
      id: article.id,
      title: article.title,
      description: article.description,
    })),
}));

export const faqMock = { articles, sections };
