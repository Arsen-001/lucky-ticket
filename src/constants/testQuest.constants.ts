import { routes, type Route } from '@/constants/routes';
import type { TestQuestAction, TestQuestStepDto } from '@/types/interfaces/testQuest.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';
import en from '@messages/en.json';

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
/** Telegram's boost page for the channel — where the "boost" step sends you. */
export const TEST_QUEST_BOOST_URL = 'https://t.me/boost/luckyticket365';

/** Full ladder, level 31 (entry) down to level 1 (top crown). */
export const testQuestLadder: TestQuestLevel[] = [
  { level: 31, day: null, drop: '5k LC', zone: 'entry' },
  { level: 30, day: 1, drop: '10k LC', zone: 'ladder' },
  { level: 29, day: 2, drop: '10k LC', zone: 'ladder' },
  { level: 28, day: 3, drop: '10k LC', zone: 'ladder' },
  { level: 27, day: 4, drop: '10k LC', zone: 'ladder' },
  { level: 26, day: 5, drop: '25k LC · 1 TIX · 5 LS · LP 2d', zone: 'wall' },
  { level: 25, day: 6, drop: '10k LC', zone: 'ladder' },
  { level: 24, day: 7, drop: '10k LC', zone: 'ladder' },
  { level: 23, day: 8, drop: '10k LC', zone: 'ladder' },
  { level: 22, day: 9, drop: '15k LC', zone: 'ladder' },
  { level: 21, day: 10, drop: '15k LC', zone: 'ladder' },
  { level: 20, day: 11, drop: '30k LC · 1 TIX · 5 LS · LP 3d', zone: 'wall' },
  { level: 19, day: 12, drop: '35k LC · 1 TIX · 5 LS', zone: 'wall' },
  { level: 18, day: 13, drop: '15k LC · 1 TIX', zone: 'ladder' },
  { level: 17, day: 14, drop: '15k LC · 1 TIX', zone: 'ladder' },
  { level: 16, day: 15, drop: '40k LC · 1 TIX · 5 LS · LP 4d', zone: 'wall' },
  { level: 15, day: 16, drop: '40k LC · 1 TIX · 5 LS', zone: 'wall' },
  { level: 14, day: 17, drop: '20k LC · 1 TIX', zone: 'ladder' },
  { level: 13, day: 18, drop: '20k LC · 1 TIX', zone: 'ladder' },
  { level: 12, day: 19, drop: '45k LC · 1 TIX · 5 LS · 1 ENG', zone: 'wall' },
  { level: 11, day: 20, drop: '20k LC · 1 TIX', zone: 'ladder' },
  { level: 10, day: 21, drop: '45k LC · 1 TIX · 5 LS · LP 5d', zone: 'wall' },
  { level: 9, day: 22, drop: '20k LC · 1 TIX', zone: 'ladder' },
  { level: 8, day: 23, drop: '20k LC · 1 TIX', zone: 'ladder' },
  { level: 7, day: 24, drop: '50k LC · 2 TIX · 5 LS', zone: 'wall' },
  { level: 6, day: 25, drop: '25k LC · 1 TIX', zone: 'ladder' },
  { level: 5, day: 26, drop: '55k LC · 2 TIX · 5 LS', zone: 'wall' },
  { level: 4, day: 27, drop: '55k LC · 2 TIX · 5 LS · LP 6d', zone: 'wall' },
  { level: 3, day: null, drop: '105k LC · 3 TIX · 15 LS', zone: 'crown' },
  { level: 2, day: null, drop: '105k LC · 3 TIX · 17 LS · VIP 1', zone: 'crown' },
  { level: 1, day: null, drop: '110k LC · 3 TIX · 19 LS · VIP 3', zone: 'crown' },
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
  | 'chip'
  | 'wallet'
  | 'stake'
  | 'status'
  | 'profile'
  | 'rank'
  | 'boost'
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
  chip: routes.inventory,
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

/**
 * Every label key this build can render — the white-list server steps are
 * checked against, so a key we have no translation for never reaches `t()`.
 *
 * Read from the DICTIONARY, not from a local copy of the checklist. There used
 * to be such a copy, and it is exactly what broke: it also served as a fallback
 * list, so the app rendered its own steps whenever the server's looked wrong —
 * which hid, for a whole day, the fact that the server was sending steps with no
 * counters at all. One source now: whatever `GET /test-quest` says, minus rows
 * this build has no words or no icon for.
 */
const KNOWN_STEP_KEYS: ReadonlySet<string> = new Set(Object.keys(en));

const KNOWN_KINDS: ReadonlySet<string> = new Set<TestQuestStepKind>([
  'tickets',
  'ads',
  'share',
  'referral',
  'engine',
  'market',
  'chip',
  'wallet',
  'stake',
  'status',
  'profile',
  'rank',
  'boost',
  'channel',
]);

const KNOWN_ACTIONS: ReadonlySet<string> = new Set<TestQuestAction>([
  'ticketsSpent',
  'adsWatched',
  'shares',
  'referrals',
  'engineUpgrades',
  'shardsBought',
  'ticketsCollected',
  'activeStakes',
  'stakesMade',
  'enginesOwned',
  'enginesBought',
  'chipsOwned',
  'chipsEquipped',
  'ticketsBought',
  'nicknameSet',
  'walletConnected',
  'channelBoosted',
]);

/**
 * The checklist to render for a level — **the server's list, and only that**.
 *
 * What the server sends is untrusted wire data, so each row is narrowed here
 * first: an unknown `labelKey` has no translation in this build and would render
 * as a raw key on someone's screen, and an unknown `kind` has no icon — both are
 * dropped rather than shown broken.
 *
 * Nothing is substituted when the server sends nothing. This build used to carry
 * its own copy of the whole ladder and fall back to it, and that is precisely
 * what hid the worst defect of 18.08.2026: the server was sending steps with no
 * counters, the app quietly drew its own correct-looking list instead, every
 * screen and every test agreed — and production showed `0/20` no matter how many
 * shards the player bought. An empty checklist is the honest picture of "the
 * server has not answered yet"; a borrowed one is a lie the player cannot act on.
 */
export const resolveTestQuestSteps = (serverSteps?: TestQuestStepDto[]): TestQuestStep[] => {
  if (!serverSteps?.length) return [];

  const usable = serverSteps
    .filter(s => KNOWN_STEP_KEYS.has(s.labelKey) && KNOWN_KINDS.has(s.kind))
    .map<TestQuestStep>(s => ({
      labelKey: s.labelKey as MessageIds,
      kind: s.kind as TestQuestStepKind,
      ...(typeof s.target === 'number' && s.target > 0 ? { target: s.target } : {}),
      ...(s.action && KNOWN_ACTIONS.has(s.action) ? { action: s.action as TestQuestAction } : {}),
      ...(s.gate === 'channel' ? { gate: 'channel' as const } : {}),
    }));

  return usable;
};
