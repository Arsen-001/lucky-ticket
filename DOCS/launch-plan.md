# LuckyTicket365 — Launch Plan

> **Status: PLANNING / not yet implemented.** This document captures the launch
> promo video brief and the Beta Early-Adopter Program while they are being
> designed. It is intentionally kept **out of `DOCS/DOCS.md`** (the authoritative
> product spec) so that unbuilt mechanics don't create docs-drift. When the beta
> program is actually implemented, its rules graduate into `DOCS/DOCS.md` and the
> corresponding section here is trimmed to a pointer.
>
> Last updated: 2026-07-24 — **§2.8 Founder Draw drafted** (the implementable
> spec; supersedes the rejected §2.7 ladder). §2.8 has a "Decisions needed"
> block at its end — those must be signed off before build.

---

## 1. Launch Promo Video

### 1.1 Purpose & placement

- **Primary use:** the **first / pinned post** of the Telegram channel
  [@luckyticket365](https://t.me/luckyticket365).
- **Secondary use:** cross-posted to other social networks (Reels / Shorts /
  TikTok / etc.).
- **Nature:** evergreen brand intro (it stays pinned and is seen by everyone who
  joins later) — **not** a date-bound campaign creative.

### 1.2 Hard constraints (from the placement)

- **Must read fully muted.** Social autoplay is silent → all meaning must be
  carried by on-screen text, not voiceover. (Current text-driven style already
  satisfies this.)
- **Hook in the first 1–2 seconds** — lead with the benefit, or viewers scroll
  past. The brand logo should come at the _end_, not the open.
- **One clear CTA** — open the bot / Mini App.

### 1.3 Recommended concept — "hype launch + mini-explainer"

1. **Hook (0–2s):** the single strongest promise, large. (Beta FOMO is a strong
   candidate — see §2.5.)
2. **Core loop (middle):** enter → collect tickets → play / win → withdraw to
   TON. 2–3 strong features max.
3. **Brand + CTA (end):** LuckyTicket365 logo + "Играть в Telegram" button.

### 1.4 Decided

- **Format:** vertical **1080×1920**, 30 fps, H.264 + AAC.
- **Style:** dark premium-gaming; brand gradients (pink/purple); real in-app
  assets (tier tickets, LC coin, TON/diamond); Space Grotesk wordmark +
  Montserrat Cyrillic headings.
- **Background (LOCKED — user liked it):** the persistent animated backdrop from
  the first draft — dark base + slowly drifting pink/purple glow blobs + floating
  twinkling particles, carried through every scene. Keep it as the signature
  canvas.
- **Wordmark (LOCKED):** always write the brand as a single word **`LuckyTicket365`**
  — one line, no separate "365" badge/pill, no line breaks or spaces. Inline color
  accents are kept: `Lucky` white · `Ticket` pink gradient · `365` **gold** — all
  in the one unbroken word. "Always together" is the rule.
- **Hook (LOCKED):** **beta early-adopter exclusivity / FOMO** — "join the test
  period now → boosts + gifts + a badge that's never issued again" (see §2.5).
- **Length (LOCKED):** **15 seconds** (450 frames @ 30fps) — room for hook +
  stakes + how-to-earn + CTA without rushing.
- **CTA (LOCKED):** button "Играть в Telegram" → **`t.me/luckyticket365_bot`**.
- **Language (LOCKED):** **RU only** — single version.
- **Badge (LOCKED):** design an exclusive founder "seal" from scratch (no
  supplied asset).
- **Logo (LOCKED):** typed wordmark `LuckyTicket365` (Space Grotesk / Montserrat);
  no supplied logo file.
- **Music:** Pixabay "Play Time" (fassounds) — Pixabay Content License, free for
  commercial use, no attribution. Fade-in/out via volume envelope.
- **Tech:** Remotion project at `~/WebstormProjects/lucky-ticket-video`; render →
  `out/lucky-ticket-promo.mp4`.
- A working 10s draft (4 scenes: intro → tickets → coins → TON+CTA) is already
  rendered as the starting point.

### 1.5 Status

All decisions resolved (§1.4). **Built & rendered 2026-07-18** — the 15s launch
version with the beta-FOMO hook and the founder-seal badge is at
`~/WebstormProjects/lucky-ticket-video/out/lucky-ticket-promo.mp4` (1080×1920,
H.264 + AAC). Scenes: BetaHook → BetaRewards → HowToEarn → BrandCta.

> ⚠️ This cut names the "тестовый период" explicitly, so it should be
> **retired/replaced once the test period ends** (it is a launch creative, not an
> evergreen intro).

On-screen copy deliberately avoids the word "beta" — it uses **ТЕСТ / тестовый**
("ТЕСТ · 30 ДНЕЙ" pill, "ТЕСТ" seal ribbon, "Забери за тест", "Успей в тестовый
период"). Music level held at 0.6. (Internal naming in this doc still says
"beta"; only the rendered copy changed.)

### 1.6 15-second beat sheet (draft, per §1.3 + beta hook)

- **0–3s — Hook:** "Тестовый месяц уже идёт" / "Успей войти первым", large,
  over the signature background.
- **3–8s — Stakes:** what you keep for beta activity — **усиления · подарки ·
  badge, который больше не выдадут** (three reward beats).
- **8–12s — How to earn:** зови друзей · проходи уровни · смотри рекламу · играй
  (reuse ticket/coin scenes).
- **12–15s — Brand + CTA:** `LuckyTicket365` + "Играть в Telegram".

---

## 2. Beta Early-Adopter Program (1-month test period)

### 2.1 Concept

At launch the product runs a **31-day test (beta) period** (decided: **31 days,
not 30** — note the RU grammar consequence: on-screen copy is «31 ДЕНЬ»
singular, not «ДНЕЙ»; the already-rendered video still says «30 ДНЕЙ» and must be
re-cut to «31 ДЕНЬ» on the next render — see §1.5). Activity during the beta is
tracked and, when the beta ends, converts into **exclusive early-adopter
rewards** scaled to how much each player achieved. The exclusivity is the point:
some rewards (especially the badge) can **never** be obtained again after the
beta closes — a limited-time "founder" moment to drive activity and retention.

### 2.2 Tracked during the beta

Reward tier scales with a player's beta achievements across:

- **Referrals** — number of friends invited.
- **Levels / status** — progression reached.
- **Ads watched** — total rewarded-ad views.
- **General activity / development** — overall engagement.

### 2.3 Rewards granted at beta end

- **Усиления (permanent boosts)** — power-ups that persist after the beta.
- **Подарки (gifts)** — one-off rewards.
- **Exclusive badge** — a founder/early-adopter badge that is **never issued
  again** after the beta. Higher beta achievement → higher badge tier / bigger
  boosts.

### 2.4 Purpose

Front-load activity, referrals, ad views, and retention during the launch window
by making early participation uniquely and permanently rewarded (FOMO).

### 2.5 Why it matters for the video

The beta window is time-limited and never repeats, which makes it the **strongest
possible hook for the first channel post**:

> "Тестовый период уже идёт. Всё, что соберёшь сейчас, после старта превратится
> в усиления, подарки и эксклюзивный badge, который больше никогда не выдадут."

If we lead the promo with this, the video doubles as a launch-activation driver,
not just a brand intro.

### 2.6 Open questions / TBD (must be resolved before implementation)

- **Exact tiers & thresholds** — how many referrals / which level / how many ads
  map to which badge tier and which boost size.
- **Weighting** — are referrals, levels, and ads weighted equally, or is one the
  primary axis?
- **What the boosts actually are** — permanent multipliers? extra ticket rates?
  a standing status perk? define concretely.
- **What the gifts are** — LC, engines, market items, Lucky Stars, tickets?
- **Badge identity** — name (e.g. Founder / Genesis / Pioneer / OG), visual, and
  how many tiers.
- **Timing** — exact beta start & end dates (convert to absolute dates when set).
- **Anti-abuse** — guard against fake/self referrals inflating tiers.
- **Surfaces** — how progress shows in the UI during the beta and in the admin
  panel; how the grant is executed at beta end.

### 2.7 REJECTED direction — the FP ladder (kept for history)

> ⚠️ **Superseded 2026-07-18.** The composite-FP / 5-rung battle-pass ladder below
> was rejected as too generic — it "reads like someone else's mechanic." The new
> direction is the **Founder Draw** (on-brand raffle) — see §2.8. This section is
> kept only as a record of what was tried, and of the calls that may still carry
> over: referrals as the main lever, ads double-counting, the exclusive
> never-again seal, and engine-speed as a permanent boost.

**Decided:**

- **One composite scale**, not per-axis tracks. All four §2.2 axes fold into a
  single **Founder Points (FP)** count → one progress bar, one ladder of 5 rungs.
  Everyone has a path up (referrer, grinder, ad-watcher).
- **31-day** window (see §2.1). At launch everyone starts at AP = 0, so "beta AP"
  = the player's whole AP — no separate beta-only counter needed.
- **Top rungs (IV–V) are rich**: permanent Founder boosts **+ real VIP level + LS**
  (**CONFIRMED** — one-time grant, tiny top-player population, max FOMO).
- **The Founder seal/badge is the only permanent, never-reissued reward**; LC /
  LS / status-days / boosts are the scaling bundle.
- **The permanent Founder boost is an engine-speed multiplier** — a **third
  stacking layer** (like a chip) on top of `luckyPlayerEngineSpeedBoostPct` /
  `vipEngineSpeedBoostPct`. Small %s per rung (3 → 12%, per the table). The
  **referral-%** boost is a _secondary_ perk only at rungs IV–V (social players
  only, so never the primary boost).

**FP accrual (draft):** `+1 FP` per AP earned · **`+100 FP` per activated
referral** (main growth lever — one friend ≈ ~a week of solo play; on top of
invite AP) · flat chunks for "development" milestones (first engine,
first stake, first tournament win, email verified, each tier reached) ·
**`+1 FP` per ad watched — ads double-count** toward FP (**CONFIRMED** — revenue
incentive during the test).

**5-rung ladder (DRAFT magnitudes — the main thing left to nail down):**

| Rung | Seal (exclusive)  | FP     | LC         | Lucky Player   | Permanent boost                       | Premium                         |
| ---- | ----------------- | ------ | ---------- | -------------- | ------------------------------------- | ------------------------------- |
| I    | Bronze Founder    | 300    | 500,000    | 3 d            | —                                     | 5 tickets                       |
| II   | Silver Founder    | 800    | 2,000,000  | 7 d            | +3% engine speed                      | 15 tickets                      |
| III  | Gold Founder      | 1,800  | 6,000,000  | 14 d           | +5% engine speed                      | 1 free engine + 50 LS           |
| IV   | Platinum Founder  | 3,500  | 15,000,000 | 30 d           | +8% speed, +5% referral               | VIP 1 + 150 LS                  |
| V    | Diamond / Genesis | 6,000+ | 40,000,000 | (VIP replaces) | +12% speed, +10% referral, +10% stake | VIP 3 + 500 LS + Founders' Hall |

Player receives the bundle of their **highest reached rung** (each rung strictly
supersedes the one below). Anti-abuse: referral FP counts only for **activated**
referrals (friend reached a tier), reusing the existing `referralsCount` gate.

**Still open (the "всё нужно обсудить" list):**

- Exact reward magnitudes per rung (LC / LS / LP-days / VIP levels) and the
  engine-speed boost %s (draft 3/5/8/12).
- Rung **naming** (metals Bronze→Diamond Founder · Genesis/Pioneer/OG · RU names) —
  not yet chosen.

---

## 2.8 Founder Draw — the implementable spec (supersedes §2.7)

> **Status: DRAFT for sign-off.** This is the concrete, buildable version of the
> Beta Early-Adopter Program. It replaces the §2.7 FP-ladder (rejected as too
> generic). Magnitudes below are **anchored to the current economy** — not the
> §2.7 table, which was written pre-rebalance and is ~30–40× out of scale (it
> listed 40M LC / 500 LS; the whole 31-day Test-Quest now tops out at ~1.1M LC /
> 200 LS for the single L1 winner). Nothing here is built yet.

### 2.8.1 The core idea — the product's own mechanic, turned on its founders

LuckyTicket365 **is** a lucky-ticket-and-draw app. So the on-brand beta reward is
itself a draw: the founding cohort's activity mints an **exclusive Founder Ticket**
(чеканится только в эти 31 день — never issued again), and at beta close a
**Founder Draw** is held. This is what §2.7 lacked — it reads as _our_ mechanic,
not a generic battle pass.

Two layers, so effort is never purely random:

1. **Guaranteed (deterministic) — the Founder Seal.** Every participant keeps a
   permanent **Founder Seal** whose tier is set by how far they climbed, plus a
   one-time bundle. Grind always pays.
2. **Draw (probabilistic) — the FOMO upside.** Every Founder Ticket is one entry
   in a raffle for a short list of **headline prizes**. More activity → more
   entries → better odds, but anyone with ≥1 ticket can win.

### 2.8.2 Reuse what already exists — no new tracking

The **Test-Quest ("Тестировщик 31 → 1") is already the live beta activity ladder**
(deployed; per-level drops; competitive crown decided at test end; step progress =
lifetime profile totals, backend `b39312a`). The Founder Draw is the **finale
layered on top of it**, not a parallel system:

> **Channel gate (enforced server-side since 2026-07-26).** Taking the daily
> level requires the player to be subscribed to the official Telegram channel
> (`TELEGRAM_CHANNEL_ID`, default `@luckyticket365`). `GET /test-quest` returns
> `channelSubscribed`, `POST /test-quest/check-channel` re-reads it live after
> the player subscribes, and `POST /test-quest/claim` rejects a confirmed
> non-member with `403 channel-subscription-required`. Like the daily check-in
> and promo gates it is **fail-open** — an undeterminable membership counts as
> subscribed — and all three now share one cached lookup
> (`ChannelMembershipService`, DOCS §5.x / §17.6), so the "check again" button
> opens every gate at once. Before this the field was mock-only and the
> frontend defaulted it to `true`, i.e. the gate did nothing in production.

- **Seal tier = the Test-Quest level band the player reached.** No new "Founder
  Points" counter (that was §2.7's generic move). The four Test-Quest zones map
  1:1 to four seals.
- **Draw entries = the same counters the Test-Quest already tracks** — `referrals`,
  `adsWatched`, `ticketsSpent`, `engineUpgrades`, level reached. The backend
  already has this data, so accrual is a derivation, not new instrumentation.

### 2.8.3 Founder Seal bands (guaranteed, one-time, permanent seal)

Keyed to the highest Test-Quest level reached. Bundles are **deliberately modest**
next to the Test-Quest's own drops — the value is the _permanent_ perk + the
never-again seal + the draw entry, not a second LC firehose. Each band supersedes
the one below (you get your highest only).

| Seal (permanent, never re-issued) | Reached            | One-time gift                    | Permanent perk (stacks as a 3rd engine-speed layer) |
| --------------------------------- | ------------------ | -------------------------------- | --------------------------------------------------- |
| **Bronze Founder**                | L20 (Silver wall)  | 25k LC · 10 LS · LP 2d           | — (seal only)                                       |
| **Silver Founder**                | L15 (Gold wall)    | 75k LC · 25 LS · LP 5d           | +3% engine speed                                    |
| **Gold Founder**                  | L4 (Platinum wall) | 150k LC · 50 LS · LP 10d · 1 ENG | +5% engine speed                                    |
| **Diamond Founder**               | crown L3–L1        | 300k LC · 100 LS · VIP 14d       | +8% engine speed · +5% referral                     |

- Engine-speed % stacks on top of `luckyPlayerEngineSpeedBoostPct` (10) /
  `vipEngineSpeedBoostPct` (25), bounded by the existing 900s/ticket floor.
- +5% referral only at Diamond (social players), on top of the 5/10/15/25% base
  ladder — never the primary perk.

### 2.8.4 Founder Ticket accrual (draw entries) — referrals are the lever

| Source                 | Entries | Note                                                                                  |
| ---------------------- | ------- | ------------------------------------------------------------------------------------- |
| Test-Quest level taken | +2 each | up to ~60 for a full climb                                                            |
| **Activated referral** | **+25** | the main growth lever; **activated only** (friend reached a tier)                     |
| Ad watched during beta | +1 each | **double-counts** (revenue incentive); already daily-capped                           |
| Development milestone  | +10     | first engine · first stake · first tournament win · email verified · each new AP tier |

Per-person entry **cap** (anti-whale) so no single account sweeps the draw —
draft **1500**.

### 2.8.5 The Founder Draw (headline prizes, drawn at beta close)

A handful of prizes, each Founder Ticket = one weighted entry. Everyone Bronze+
keeps their guaranteed seal + bundle **regardless** of the draw outcome — the draw
is pure upside.

| Prize     | Count | Contents (DRAFT)                                                                             |
| --------- | ----- | -------------------------------------------------------------------------------------------- |
| **Grand** | 1     | **[real-money TON — amount TBD, see decisions]** + 1-of-1 **Genesis** seal + permanent VIP 5 |
| **Major** | 3     | permanent VIP 3 · 100 LS                                                                     |
| **Minor** | 10    | 1 premium engine · 50 LS                                                                     |

### 2.8.6 Anti-abuse, timing, surfaces

- **Anti-abuse:** referral entries only for **activated** referrals (reuse
  `referralsCount` gate + existing self-referral guards); ads bounded by the live
  `watchVideoDailyLimit`; per-person entry cap (§2.8.4); draw seed logged for
  auditability.
- **Timing:** 31-day window (§2.1). Draw executes at `end + curation window` (same
  pattern as the tournament deferred-draw). Start/end are **absolute dates — TBD**.
- **Surfaces:** _during_ beta — a "Founder" strip on the Test-Quest screen
  (entries earned · current seal band · rough draw odds); _admin_ — entry
  leaderboard, band distribution, prize config + a **draw-execution button**
  (money-critical → same atomic compare-and-swap discipline as tournament
  `finish()`, PR #1); _at close_ — a reveal animation for the draw + seal grant.

### 2.8.7 Decisions needed from you (blockers before build)

1. **Real money?** Does the Grand prize pay **TON**? If yes — how much, and note
   the treasury: TON deposit/withdraw is built but **INERT** until
   `TON_TREASURY_MNEMONIC`/`TON_API_KEY` are set and it's funded (see the
   TON-Connect status). Alternative: an all-in-app Grand (huge LC + VIP + Genesis)
   with no real-money dependency.
2. **Exact beta start & end dates** (absolute) — drives the draw execution date.
3. **Sign off / adjust the DRAFT magnitudes** in §2.8.3–2.8.5.
4. **Naming:** metals (Bronze→Diamond Founder) for the bands + **Genesis** reserved
   for the 1-of-1 Grand seal? Or Pioneer / OG / RU names?
5. **Axis split** confirm: seal = level reached, draw = activity entries (my
   proposal) — or fold everything into one entry count?

Once 1–5 are answered these rules graduate into `DOCS/DOCS.md` and the build is:
BE (Founder entry derivation + seal grant + atomic draw endpoint + admin config) →
FE (Founder strip + reveal) → admin (config + draw button). Est. similar surface
to the Test-Quest feature.

---

## 3. Next steps

1. Finalize the video hook, length, CTA link, and languages (§1.5).
2. Decide whether the promo leads with the beta FOMO (§2.5).
3. On "создавай" — build/update the Remotion video accordingly.
4. Beta program is now spec'd — **§2.8 Founder Draw**. Blocked on the
   **§2.8.7 decisions** (real-money TON? dates? magnitudes? naming?). Answer
   those → build (BE → FE → admin) → graduate rules into `DOCS/DOCS.md`.
