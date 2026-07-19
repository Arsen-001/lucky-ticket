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
    qualified,
    crownLevel: null,
    badgeLevel: null,
    frozen: false,
    chestsPaid: 0,
    chestsTotal: 6,
    finished: qualified,
  };
};

export const testQuestMock = {
  'test-quest': () => view(),
  'POST test-quest/claim': () => {
    const before = view();
    if (!before.finished) climbed += 1;
    return {
      ...view(),
      granted: {},
      grantedLabel: before.rewardLabel,
      newBalance: { lc: 0, tickets: 0, activityPoints: 0 },
    };
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
