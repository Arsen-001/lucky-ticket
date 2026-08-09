import { routes, type Route } from '@/constants/routes';
import type { TestQuestAction } from '@/types/interfaces/testQuest.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

/**
 * Test-Quest ladder — the 31-day launch quest ("Тестировщик 31 → 1").
 *
 * PROTOTYPE DATA. The per-level rewards and checklists are front-end placeholder
 * content so the pinned card can be seen and clicked in the running app. When the
 * backend ships the `test-quest` endpoint the card switches to live data (rewards
 * become admin-editable, already-localized labels) and the reward strings here
 * fall back to the pre-load state only.
 *
 * i18n: every user-visible checklist step is a message KEY (`labelKey`) resolved
 * with `t()` at render, never a hardcoded string — so the ladder text follows the
 * shell locale (en / ru / de). Rewards render as iconified chips whose display is
 * derived from language-neutral tokens (see {@link parseRewardChips}).
 *
 * Countdown mechanic (see the launch design): every player enters at level 31
 * and climbs toward level 1 (1 = the top). Levels 31→4 are the daily ladder;
 * levels 3→1 are the competitive crown (leaderboard-assigned at test end).
 */

export type TestQuestZone = 'entry' | 'ladder' | 'wall' | 'crown';

export interface TestQuestLevel {
  /** Badge level. 31 = entry, 1 = top crown. */
  level: number;
  /** Day of the test the level maps to (null for entry / crown). */
  day: number | null;
  /**
   * Reward that drops when the level is taken, as language-neutral tokens
   * ("25k LC · 1 TIX · 5 LS · LP 2d"). Rendered as iconified chips — the icon
   * carries the unit, so no localized unit word is needed. Prototype fallback
   * only: live rewards come from the server's `rewardLabel`.
   */
  drop: string;
  zone: TestQuestZone;
}

export const TEST_QUEST_TOTAL_LEVELS = 31;

/** Demo: the level the pinned card starts on in the running app. */
export const TEST_QUEST_START_LEVEL = 31;

/** Official channel the Test-Quest gate checks membership of. */
export const TEST_QUEST_CHANNEL_HANDLE = '@luckyticket365';
export const TEST_QUEST_CHANNEL_URL = 'https://t.me/luckyticket365';

/** Full ladder, level 31 (entry) down to level 1 (top crown). */
export const testQuestLadder: TestQuestLevel[] = [
  { level: 31, day: null, drop: '5k LC · 1 LS', zone: 'entry' },
  { level: 30, day: 1, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 29, day: 2, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 28, day: 3, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 27, day: 4, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 26, day: 5, drop: '25k LC · 1 TIX · 5 LS · LP 2d', zone: 'wall' },
  { level: 25, day: 6, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 24, day: 7, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 23, day: 8, drop: '10k LC · 2 LS', zone: 'ladder' },
  { level: 22, day: 9, drop: '15k LC · 3 LS', zone: 'ladder' },
  { level: 21, day: 10, drop: '15k LC · 3 LS', zone: 'ladder' },
  { level: 20, day: 11, drop: '30k LC · 1 TIX · 6 LS · LP 3d', zone: 'wall' },
  { level: 19, day: 12, drop: '35k LC · 1 TIX · 7 LS', zone: 'wall' },
  { level: 18, day: 13, drop: '15k LC · 1 TIX · 3 LS', zone: 'ladder' },
  { level: 17, day: 14, drop: '15k LC · 1 TIX · 3 LS', zone: 'ladder' },
  { level: 16, day: 15, drop: '40k LC · 1 TIX · 8 LS · LP 4d', zone: 'wall' },
  { level: 15, day: 16, drop: '40k LC · 1 TIX · 8 LS', zone: 'wall' },
  { level: 14, day: 17, drop: '20k LC · 1 TIX · 4 LS', zone: 'ladder' },
  { level: 13, day: 18, drop: '20k LC · 1 TIX · 4 LS', zone: 'ladder' },
  { level: 12, day: 19, drop: '45k LC · 1 TIX · 9 LS · 1 ENG', zone: 'wall' },
  { level: 11, day: 20, drop: '20k LC · 1 TIX · 4 LS', zone: 'ladder' },
  { level: 10, day: 21, drop: '45k LC · 1 TIX · 9 LS · LP 5d', zone: 'wall' },
  { level: 9, day: 22, drop: '20k LC · 1 TIX · 4 LS', zone: 'ladder' },
  { level: 8, day: 23, drop: '20k LC · 1 TIX · 4 LS', zone: 'ladder' },
  { level: 7, day: 24, drop: '50k LC · 2 TIX · 10 LS', zone: 'wall' },
  { level: 6, day: 25, drop: '25k LC · 1 TIX · 5 LS', zone: 'ladder' },
  { level: 5, day: 26, drop: '55k LC · 2 TIX · 11 LS', zone: 'wall' },
  { level: 4, day: 27, drop: '55k LC · 2 TIX · 11 LS · LP 6d', zone: 'wall' },
  { level: 3, day: null, drop: '105k LC · 3 TIX · 21 LS', zone: 'crown' },
  { level: 2, day: null, drop: '105k LC · 3 TIX · 21 LS · VIP 1', zone: 'crown' },
  { level: 1, day: null, drop: '110k LC · 3 TIX · 22 LS · VIP 3', zone: 'crown' },
];

// Level → zone lookup. Walls and the crown are structural (fixed by the ladder
// design, not admin-editable), so a level's zone is safe to derive even for the
// server-driven ladder, whose entries omit it.
const ZONE_BY_LEVEL: ReadonlyMap<number, TestQuestZone> = new Map(
  testQuestLadder.map(l => [l.level, l.zone])
);

/** The design-fixed zone (entry / ladder / wall / crown) for a level. */
export const getTestQuestZone = (level: number): TestQuestZone =>
  ZONE_BY_LEVEL.get(level) ?? 'ladder';

/**
 * Visual/navigation category of a checklist step. Drives the leading icon (a
 * {@link TestQuestStepKind} → icon map lives in `TestQuestStepRow`) and the inline
 * "go there" nav button (see {@link testQuestStepHref}). Replaces the old
 * keyword-regex heuristics, which coupled the icon/href to Russian task text.
 */
export type TestQuestStepKind =
  | 'tickets'
  | 'ads'
  | 'share'
  | 'referral'
  | 'engine'
  | 'market'
  | 'wallet'
  | 'stake'
  | 'status'
  | 'profile'
  | 'rank'
  | 'channel';

/** The screen a step's inline "go there" button deep-links to, by kind. Kinds
 *  without an entry (rank, channel) render no nav button. */
export const testQuestStepHref: Partial<Record<TestQuestStepKind, Route>> = {
  tickets: routes.tournaments.index,
  ads: routes.tasks,
  share: routes.inviteFriends,
  referral: routes.inviteFriends,
  engine: routes.home,
  market: routes.market(),
  wallet: routes.wallet,
  stake: routes.stakes.index,
  status: routes.settings.vip,
  profile: routes.profile.index,
};

/**
 * One actionable step toward completing a level's task, shown in the checklist
 * under the pyramid on the Test-Quest screen. Purely informational — tapping a
 * step's nav button navigates but never claims. Text is a message key resolved at
 * render, so the checklist follows the shell locale.
 */
export interface TestQuestStep {
  /** i18n key for the row label. Countable steps use a number-less label (the
   *  count lives in `target`, shown as a "done / target" badge). Typed as a
   *  message id so every authored key is validated against `messages/en.json`. */
  labelKey: MessageIds;
  /** Target count for a countable step (e.g. 90 ads) → done/target progress badge. */
  target?: number;
  /** Which live counter (from {@link TestQuestProgress}) fills this step's badge.
   *  Absent ⇒ no live source; the step falls back to the claimed done-state. */
  action?: TestQuestAction;
  /** Visual + nav category — drives the leading icon and the "go there" button. */
  kind: TestQuestStepKind;
  /** Marks the channel-subscription gate. Its done-state follows the live
   *  subscription status (not the level's claimed state), and while unsatisfied
   *  it blocks the level's reward claim. */
  gate?: 'channel';
}

// The channel-subscription gate — required on EVERY level to claim its reward.
const CHANNEL_GATE: TestQuestStep = {
  labelKey: 'quest step channel gate',
  kind: 'channel',
  gate: 'channel',
};

// Authoring helpers for the recurring core steps. The label is number-less; the
// count rides in `target` and renders as a "done / target" badge, so the numbers
// stay out of the translated string.
const spend = (n: number): TestQuestStep => ({
  labelKey: 'quest step spend tickets',
  target: n,
  action: 'ticketsSpent',
  kind: 'tickets',
});
const ads = (n: number): TestQuestStep => ({
  labelKey: 'quest step watch ads',
  target: n,
  action: 'adsWatched',
  kind: 'ads',
});
const share = (n?: number): TestQuestStep => ({
  labelKey: 'quest step share',
  target: n,
  action: n != null ? 'shares' : undefined,
  kind: 'share',
});
const invite = (n: number): TestQuestStep => ({
  labelKey: 'quest step invite referrals',
  target: n,
  action: 'referrals',
  kind: 'referral',
});
const upgrade = (n: number): TestQuestStep => ({
  labelKey: 'quest step upgrade engine',
  target: n,
  action: 'engineUpgrades',
  kind: 'engine',
});
const collect = (n: number): TestQuestStep => ({
  labelKey: 'quest step collect tickets',
  target: n,
  kind: 'engine',
});
const holdStakes = (n: number): TestQuestStep => ({
  labelKey: 'quest step hold stakes',
  target: n,
  kind: 'stake',
});

// Authored, real-only checklist per level (31 → 1). Every level carries the same
// base — engine ticket · tournament spend · ads · invite/share · channel gate —
// with the quantities escalating toward level 1, plus that level's own special
// task(s) (upgrade, stake, status wall, friends milestone, wallet…). CHANNEL_GATE
// is always last: no reward without a channel subscription. Front-end prototype
// until the backend owns per-step data.
const TEST_QUEST_STEP_OVERRIDES: Record<number, TestQuestStep[]> = {
  // 31 · entry
  31: [collect(1), spend(1), ads(1), share(), CHANNEL_GATE],
  // 30 · day 1 — engine-upgrade special
  30: [spend(10), ads(2), share(2), upgrade(1), CHANNEL_GATE],
  // 29 · day 2 — cumulative over the whole test
  29: [
    spend(18),
    ads(5),
    share(3),
    { labelKey: 'quest step buy ticket market', kind: 'market' },
    upgrade(2),
    CHANNEL_GATE,
  ],
  // 28 · day 3 — engine-capacity upgrade + profile
  28: [
    spend(27),
    ads(10),
    share(5),
    invite(1),
    upgrade(3),
    { labelKey: 'quest step setup profile', kind: 'profile' },
    CHANNEL_GATE,
  ],
  // 27 · day 4 — engine-speed upgrade
  27: [spend(35), ads(15), share(6), upgrade(4), CHANNEL_GATE],
  // 26 · day 5
  26: [spend(43), ads(22), share(8), upgrade(5), CHANNEL_GATE],
  // 25 · day 6
  25: [spend(52), ads(29), share(9), invite(2), upgrade(6), CHANNEL_GATE],
  // 24 · day 7 — wallet + stars
  24: [
    spend(60),
    ads(36),
    share(11),
    upgrade(7),
    { labelKey: 'quest step connect wallet', kind: 'wallet' },
    { labelKey: 'quest step swap ton', kind: 'wallet' },
    CHANNEL_GATE,
  ],
  // 23 · day 8
  23: [
    spend(68),
    ads(43),
    share(12),
    upgrade(8),
    { labelKey: 'quest step buy engine shard market', kind: 'market' },
    CHANNEL_GATE,
  ],
  // 22 · day 9
  22: [spend(77), ads(51), share(14), invite(3), upgrade(9), CHANNEL_GATE],
  // 21 · day 10 — first stake
  21: [
    spend(85),
    ads(58),
    share(15),
    upgrade(10),
    { labelKey: 'quest step first stake', kind: 'stake' },
    CHANNEL_GATE,
  ],
  // 20 · day 11 — Silver wall
  20: [
    spend(93),
    ads(65),
    share(17),
    upgrade(11),
    { labelKey: 'quest step reach silver', kind: 'status' },
    { labelKey: 'quest step buy tier ticket market', kind: 'market' },
    CHANNEL_GATE,
  ],
  // 19 · day 12
  19: [spend(102), ads(72), share(18), invite(4), upgrade(12), CHANNEL_GATE],
  // 18 · day 13
  18: [spend(110), ads(79), share(20), upgrade(13), CHANNEL_GATE],
  // 17 · day 14
  17: [spend(118), ads(86), share(21), invite(5), upgrade(14), CHANNEL_GATE],
  // 16 · day 15
  16: [
    spend(127),
    ads(93),
    share(23),
    upgrade(15),
    { labelKey: 'quest step buy shard market', kind: 'market' },
    CHANNEL_GATE,
  ],
  // 15 · day 16 — Gold wall
  15: [
    spend(135),
    ads(100),
    share(24),
    upgrade(16),
    { labelKey: 'quest step reach gold', kind: 'status' },
    { labelKey: 'quest step keep active stake', kind: 'stake' },
    CHANNEL_GATE,
  ],
  // 14 · day 17
  14: [spend(143), ads(108), share(26), invite(6), upgrade(17), CHANNEL_GATE],
  // 13 · day 18
  13: [spend(152), ads(115), share(27), upgrade(18), CHANNEL_GATE],
  // 12 · day 19 — new engine
  12: [
    spend(160),
    ads(122),
    share(29),
    upgrade(19),
    { labelKey: 'quest step launch new engine', kind: 'engine' },
    CHANNEL_GATE,
  ],
  // 11 · day 20 — two stakes
  11: [spend(168), ads(129), share(30), invite(7), upgrade(20), holdStakes(2), CHANNEL_GATE],
  // 10 · day 21
  10: [spend(177), ads(136), share(32), upgrade(21), CHANNEL_GATE],
  // 9 · day 22 — Gold
  9: [
    spend(185),
    ads(143),
    share(33),
    upgrade(22),
    { labelKey: 'quest step keep gold', kind: 'status' },
    { labelKey: 'quest step buy gold shard market', kind: 'market' },
    CHANNEL_GATE,
  ],
  // 8 · day 23
  8: [
    spend(193),
    ads(150),
    share(35),
    invite(8),
    upgrade(23),
    { labelKey: 'quest step buy engine market', kind: 'market' },
    CHANNEL_GATE,
  ],
  // 7 · day 24
  7: [spend(202), ads(157), share(36), upgrade(24), CHANNEL_GATE],
  // 6 · day 25 — new engine
  6: [
    spend(210),
    ads(164),
    share(38),
    upgrade(25),
    { labelKey: 'quest step launch another engine', kind: 'engine' },
    CHANNEL_GATE,
  ],
  // 5 · day 26
  5: [spend(218), ads(172), share(39), invite(9), upgrade(26), CHANNEL_GATE],
  // 4 · day 27 — Platinum + qualification
  4: [
    spend(227),
    ads(179),
    share(41),
    upgrade(27),
    { labelKey: 'quest step reach platinum', kind: 'status' },
    { labelKey: 'quest step crown qualified', kind: 'rank' },
    CHANNEL_GATE,
  ],
  // 3 → 1 · crown — the base still counts daily; the crown itself is the
  // competitive top (topmost climbers), decided at test end.
  3: [
    spend(235),
    ads(186),
    share(42),
    upgrade(28),
    { labelKey: 'quest step top 50', kind: 'rank' },
    CHANNEL_GATE,
  ],
  2: [
    spend(243),
    ads(193),
    share(44),
    invite(10),
    upgrade(29),
    { labelKey: 'quest step top 10', kind: 'rank' },
    CHANNEL_GATE,
  ],
  1: [
    spend(250),
    ads(200),
    share(45),
    invite(10),
    upgrade(30),
    { labelKey: 'quest step become first', kind: 'rank' },
    CHANNEL_GATE,
  ],
};

/**
 * The checklist for a level (31 → 1) — the authored steps, each carrying its
 * i18n label key, live-counter target/action, and visual/nav kind. Every level
 * has an authored list; an unknown level returns []. The caller resolves each
 * `labelKey` with `t()` and each `kind` to an icon + `testQuestStepHref` link.
 */
export const getTestQuestSteps = (level: number): TestQuestStep[] =>
  TEST_QUEST_STEP_OVERRIDES[level] ?? [];
