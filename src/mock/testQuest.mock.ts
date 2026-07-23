import {
  TEST_QUEST_START_LEVEL,
  TEST_QUEST_TOTAL_LEVELS,
  testQuestLadder,
} from '@/constants/testQuest.constants';

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

const view = () => {
  const qualified = climbed >= QUALIFIED_CLIMBED;
  const level = Math.max(DAILY_TOP_LEVEL, TEST_QUEST_TOTAL_LEVELS - climbed); // 31 → 4
  const def = testQuestLadder.find(l => l.level === level);
  return {
    level,
    totalLevels: TEST_QUEST_TOTAL_LEVELS,
    dailyTopLevel: DAILY_TOP_LEVEL,
    climbed,
    progress: Math.round((Math.min(climbed, QUALIFIED_CLIMBED) / QUALIFIED_CLIMBED) * 100),
    task: def?.task ?? '',
    reward: {},
    rewardLabel: def?.drop ?? '',
    ladder: [...testQuestLadder]
      .sort((a, b) => b.level - a.level)
      .map(l => ({ level: l.level, task: l.task, rewardLabel: l.drop })),
    claimableToday: !qualified,
    channelSubscribed,
    qualified,
    crownLevel: null,
    badgeLevel: null,
    frozen: false,
    chestsPaid: 0,
    chestsTotal: 6,
    finished: qualified,
    // Cumulative-since-enrollment progress. Scaled off `climbed` so the current
    // level's countable steps read as partially done (e.g. tickets 5/6) and past
    // levels read fully done — enough to see the live badges move in mock mode.
    stepProgress: {
      ticketsSpent: 5 * climbed,
      adsWatched: 7 * climbed,
      shares: 2 * climbed,
      referrals: Math.floor(climbed / 3),
      engineUpgrades: climbed,
    },
  };
};

export const testQuestMock = {
  'test-quest': () => view(),
  'POST test-quest/claim': () => {
    const before = view();
    // Mirror the server gate: no advance without a channel subscription.
    if (!before.finished && channelSubscribed) climbed += 1;
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
