# LuckyTicket365 — Launch Plan

> **Status: PLANNING / not yet implemented.** This document captures the launch
> promo video brief and the Beta Early-Adopter Program while they are being
> designed. It is intentionally kept **out of `DOCS/DOCS.md`** (the authoritative
> product spec) so that unbuilt mechanics don't create docs-drift. When the beta
> program is actually implemented, its rules graduate into `DOCS/DOCS.md` and the
> corresponding section here is trimmed to a pointer.
>
> Last updated: 2026-07-18.

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

At launch the product runs a **1-month test (beta) period**. Activity during the
beta is tracked and, when the beta ends, converts into **exclusive early-adopter
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

---

## 3. Next steps

1. Finalize the video hook, length, CTA link, and languages (§1.5).
2. Decide whether the promo leads with the beta FOMO (§2.5).
3. On "создавай" — build/update the Remotion video accordingly.
4. Separately, spec the beta program mechanics (§2.6) for implementation; once
   built, move its rules into `DOCS/DOCS.md`.
