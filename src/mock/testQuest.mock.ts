import {
  TEST_QUEST_START_LEVEL,
  TEST_QUEST_TOTAL_LEVELS,
  testQuestLadder,
} from '@/constants/testQuest.constants';
import type { TestQuestStepDto } from '@/types/interfaces/testQuest.interfaces';

/**
 * Dev-mock for the Test-Quest card (used only in mock mode, i.e. when
 * NEXT_PUBLIC_API_URL is unset). Stateful: `claim` advances the level so the
 * card can be clicked through 31 → 1. The one-per-day gate is relaxed here so
 * the whole ladder is walkable in a single session.
 */
let climbed = TEST_QUEST_TOTAL_LEVELS - TEST_QUEST_START_LEVEL;
// Channel-subscription gate: starts unsatisfied so the gate is visible in the
// demo. Tapping "subscribe" hits POST test-quest/check-channel, which flips it
// (mock stand-in for a live getChatMember). A page reload resets it.
let channelSubscribed = false;

const DAILY_TOP_LEVEL = 4;
const QUALIFIED_CLIMBED = TEST_QUEST_TOTAL_LEVELS - DAILY_TOP_LEVEL + 1; // 28

/**
 * The checklist the mock backend serves, mirroring `TEST_QUEST_STEPS` in the
 * backend's `test-quest.levels.ts` — the real source of truth.
 *
 * It lives HERE, in the mock, and not in `constants/testQuest.constants.ts`,
 * because it is server data: the app renders only what the server sends, and in
 * dev the server is this file. As a frontend constant it was worse than useless
 * — it doubled as a fallback, so a broken server response was silently replaced
 * by a correct-looking local list and the bug reached production instead of the
 * screen in front of us. `tests/quest-steps-parity.test.ts` diffs this against
 * the backend copy field by field.
 */
const MOCK_STEPS: Record<number, TestQuestStepDto[]> = {
  31: [
    {
      labelKey: 'quest step collect tickets',
      target: 1,
      action: 'ticketsCollected',
      kind: 'engine',
    },
    { labelKey: 'quest step spend tickets', target: 1, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 1, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 1, action: 'shares', kind: 'share' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  30: [
    { labelKey: 'quest step spend tickets', target: 10, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 2, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 2, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 1, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  29: [
    { labelKey: 'quest step spend tickets', target: 18, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 5, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 3, action: 'shares', kind: 'share' },
    {
      labelKey: 'quest step buy ticket market',
      target: 1,
      action: 'ticketsBought',
      kind: 'market',
    },
    { labelKey: 'quest step upgrade engine', target: 2, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  28: [
    { labelKey: 'quest step spend tickets', target: 27, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 10, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 5, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 1, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 3, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step set nickname', target: 1, action: 'nicknameSet', kind: 'profile' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  27: [
    { labelKey: 'quest step spend tickets', target: 35, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 15, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 6, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 4, action: 'engineUpgrades', kind: 'engine' },
    // Premium-only, exactly like the server's catalog: a channel boost is a paid
    // Telegram perk, so the row exists for Premium players and for nobody else.
    {
      labelKey: 'quest step boost channel',
      target: 1,
      action: 'channelBoosted',
      kind: 'boost',
      requires: 'telegramPremium',
    },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  26: [
    { labelKey: 'quest step spend tickets', target: 43, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 22, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 8, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 5, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  25: [
    { labelKey: 'quest step spend tickets', target: 52, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 29, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 9, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 2, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 6, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  24: [
    { labelKey: 'quest step spend tickets', target: 60, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 36, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 11, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 7, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step connect wallet', target: 1, action: 'walletConnected', kind: 'wallet' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  23: [
    { labelKey: 'quest step spend tickets', target: 68, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 43, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 12, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 8, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step buy shards', target: 2, action: 'shardsBought', kind: 'market' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  22: [
    { labelKey: 'quest step spend tickets', target: 77, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 51, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 14, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 3, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 9, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  21: [
    { labelKey: 'quest step spend tickets', target: 85, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 58, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 15, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 10, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step first stake', target: 1, action: 'stakesMade', kind: 'stake' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  20: [
    { labelKey: 'quest step spend tickets', target: 93, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 65, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 17, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 11, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  19: [
    { labelKey: 'quest step spend tickets', target: 102, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 72, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 18, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 4, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 12, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  18: [
    { labelKey: 'quest step spend tickets', target: 110, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 79, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 20, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 13, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  17: [
    { labelKey: 'quest step spend tickets', target: 118, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 86, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 21, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 5, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 14, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  16: [
    { labelKey: 'quest step spend tickets', target: 127, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 93, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 23, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 15, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step buy shards', target: 8, action: 'shardsBought', kind: 'market' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  15: [
    { labelKey: 'quest step spend tickets', target: 135, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 100, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 24, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 16, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step hold stakes', target: 1, action: 'activeStakes', kind: 'stake' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  14: [
    { labelKey: 'quest step spend tickets', target: 143, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 108, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 26, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 6, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 17, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  13: [
    { labelKey: 'quest step spend tickets', target: 152, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 115, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 27, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 18, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  12: [
    { labelKey: 'quest step spend tickets', target: 160, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 122, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 29, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 19, action: 'engineUpgrades', kind: 'engine' },
    {
      labelKey: 'quest step buy engine market',
      target: 1,
      action: 'enginesBought',
      kind: 'market',
    },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  11: [
    { labelKey: 'quest step spend tickets', target: 168, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 129, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 30, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 7, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 20, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step hold stakes', target: 2, action: 'activeStakes', kind: 'stake' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  10: [
    { labelKey: 'quest step spend tickets', target: 177, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 136, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 32, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 21, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  9: [
    { labelKey: 'quest step spend tickets', target: 185, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 143, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 33, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 22, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step buy shards', target: 14, action: 'shardsBought', kind: 'market' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  8: [
    { labelKey: 'quest step spend tickets', target: 193, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 150, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 35, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 8, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 23, action: 'engineUpgrades', kind: 'engine' },
    {
      labelKey: 'quest step buy engine market',
      target: 2,
      action: 'enginesBought',
      kind: 'market',
    },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  7: [
    { labelKey: 'quest step spend tickets', target: 202, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 157, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 36, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 24, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  6: [
    { labelKey: 'quest step spend tickets', target: 210, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 164, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 38, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 25, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step buy shards', target: 20, action: 'shardsBought', kind: 'market' },
    {
      labelKey: 'quest step buy engine market',
      target: 3,
      action: 'enginesBought',
      kind: 'market',
    },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  5: [
    { labelKey: 'quest step spend tickets', target: 218, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 172, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 39, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 9, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 26, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  4: [
    { labelKey: 'quest step spend tickets', target: 227, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 179, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 41, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 27, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step mint chip', target: 1, action: 'chipsOwned', kind: 'chip' },
    { labelKey: 'quest step equip chip', target: 1, action: 'chipsEquipped', kind: 'chip' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  3: [
    { labelKey: 'quest step spend tickets', target: 235, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 186, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 42, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 28, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  2: [
    { labelKey: 'quest step spend tickets', target: 243, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 193, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 44, action: 'shares', kind: 'share' },
    { labelKey: 'quest step invite referrals', target: 10, action: 'referrals', kind: 'referral' },
    { labelKey: 'quest step upgrade engine', target: 29, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
  1: [
    { labelKey: 'quest step spend tickets', target: 250, action: 'ticketsSpent', kind: 'tickets' },
    { labelKey: 'quest step watch ads', target: 200, action: 'adsWatched', kind: 'ads' },
    { labelKey: 'quest step share', target: 45, action: 'shares', kind: 'share' },
    { labelKey: 'quest step upgrade engine', target: 30, action: 'engineUpgrades', kind: 'engine' },
    { labelKey: 'quest step channel gate', kind: 'channel', gate: 'channel' },
  ],
};

/**
 * The mock player is not on Telegram Premium — the common case, and the one that
 * has to be right: a Premium-only step must be absent from their checklist, not
 * merely unenforced. Flip to `true` to see the level-27 boost row in dev.
 */
const MOCK_TELEGRAM_PREMIUM = false;

/** Mock side of the server's `stepsForPlayer` — drops steps that are not this
 *  player's to do, so dev sees the same list production would send. */
const mockStepsForPlayer = (level: number) =>
  (MOCK_STEPS[level] ?? []).filter(
    step => step.requires !== 'telegramPremium' || MOCK_TELEGRAM_PREMIUM
  );

/** Countable steps of a level the fake progress below has NOT reached — the mock
 *  side of the server's `unmetSteps`. */
const unmetMockSteps = (level: number, progress: Record<string, number>) =>
  mockStepsForPlayer(level).filter(
    step => step.action && step.target != null && (progress[step.action] ?? 0) < step.target
  );

const view = () => {
  const qualified = climbed >= QUALIFIED_CLIMBED;
  const level = Math.max(DAILY_TOP_LEVEL, TEST_QUEST_TOTAL_LEVELS - climbed); // 31 → 4
  const def = testQuestLadder.find(l => l.level === level);
  // Cumulative-since-enrollment progress. Scaled off `climbed` so the current
  // level's countable steps read as partially done (e.g. tickets 5/6) and past
  // levels read fully done — enough to see the live badges move in mock mode.
  const stepProgress = {
    ticketsSpent: 5 * climbed,
    adsWatched: 7 * climbed,
    shares: 2 * climbed,
    referrals: Math.floor(climbed / 3),
    engineUpgrades: climbed,
    shardsBought: Math.floor(climbed / 2),
    ticketsCollected: 3 * climbed,
    // Live, not cumulative — a stake that matured stops counting, so this one
    // deliberately does not scale with the climb.
    activeStakes: climbed > 10 ? 2 : climbed > 5 ? 1 : 0,
    stakesMade: climbed > 5 ? 1 : 0,
    // Starter engine + one per ~8 days climbed, so the 2 → 3 → 4 ladder is
    // reachable in mock mode without hand-editing this file.
    enginesOwned: 1 + Math.floor(climbed / 8),
    // Purchases only — the mock's climb grants one engine on level 12, and the
    // ladder must not tick off a gift.
    enginesBought: Math.floor(climbed / 10),
    chipsOwned: climbed > 25 ? 1 : 0,
    chipsEquipped: climbed > 26 ? 1 : 0,
    ticketsBought: climbed > 1 ? 1 : 0,
    nicknameSet: climbed > 2 ? 1 : 0,
    walletConnected: climbed > 6 ? 1 : 0,
    channelBoosted: climbed > 3 ? 1 : 0,
  };
  const unmet = unmetMockSteps(level, stepProgress);
  return {
    level,
    totalLevels: TEST_QUEST_TOTAL_LEVELS,
    dailyTopLevel: DAILY_TOP_LEVEL,
    climbed,
    progress: Math.round((Math.min(climbed, QUALIFIED_CLIMBED) / QUALIFIED_CLIMBED) * 100),
    // `task` (the one-line daily label) is no longer rendered — the checklist is
    // keyed per level and localized — so the mock leaves it empty.
    task: '',
    reward: {},
    rewardLabel: def?.drop ?? '',
    // Checklists ride along exactly as the real backend sends them, so mock mode
    // exercises the server-driven path instead of the local fallback.
    ladder: [...testQuestLadder]
      .sort((a, b) => b.level - a.level)
      .map(l => ({
        level: l.level,
        task: '',
        rewardLabel: l.drop,
        steps: mockStepsForPlayer(l.level),
      })),
    claimableToday: !qualified,
    channelSubscribed,
    qualified,
    crownLevel: null,
    badgeLevel: null,
    frozen: false,
    chestsPaid: 0,
    chestsTotal: 6,
    finished: qualified,
    stepProgress,
    stepsComplete: unmet.length === 0,
    stepsRemaining: unmet.length,
  };
};

export const testQuestMock = {
  'test-quest': () => view(),
  'POST test-quest/claim': () => {
    const before = view();
    // Mirror the server gates: no advance without a channel subscription, and
    // none while the level's checklist is short of its targets.
    if (!before.finished && channelSubscribed && before.stepsComplete) climbed += 1;
    return {
      ...view(),
      granted: {},
      grantedLabel: before.rewardLabel,
      newBalance: { lc: 0, tickets: 0, activityPoints: 0 },
    };
  },
  'POST test-quest/check-channel': () => {
    // Mock stand-in for a live getChatMember re-check after the player subscribes.
    channelSubscribed = true;
    return view();
  },
  'test-quest/leaderboard': () => ({
    total: 128,
    myRank: 7,
    myReferrals: 9,
    top: [
      { rank: 1, username: 'crypto_king', referrals: 42, level: 3, isMe: false },
      { rank: 2, username: 'lucky_ann', referrals: 31, level: 5, isMe: false },
      { rank: 3, username: 'max_ton', referrals: 27, level: 6, isMe: false },
      { rank: 4, username: 'nika_win', referrals: 19, level: 8, isMe: false },
      { rank: 5, username: 'dmitry', referrals: 15, level: 10, isMe: false },
      { rank: 6, username: 'sveta_lucky', referrals: 12, level: 12, isMe: false },
      { rank: 7, username: 'Arsen 001', referrals: 9, level: 27, isMe: true },
    ],
  }),
};
