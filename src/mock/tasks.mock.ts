import {
  TaskCategory,
  TaskFrequency,
  TaskRarity,
  TaskRewardType,
  TaskStatus,
} from '@/types/enums/tasks.enums';
import type {
  AdsBlock,
  CategoryTasks,
  ClaimTaskResponse,
  Quest,
  StreakInfo,
  Task,
  TaskReward,
  TasksResponse,
} from '@/types/interfaces/tasks.interfaces';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const inHours = (h: number) => new Date(Date.now() + h * HOUR_MS).toISOString();

const ltc = (amount: number): TaskReward => ({ type: TaskRewardType.LTC, amount });
const tickets = (amount: number): TaskReward => ({ type: TaskRewardType.TICKETS, amount });
const ap = (amount: number): TaskReward => ({ type: TaskRewardType.ACTIVITY_POINTS, amount });
const stars = (amount: number): TaskReward => ({ type: TaskRewardType.STARS, amount });
const premium = (amount: number = 1): TaskReward => ({ type: TaskRewardType.PREMIUM, amount });

let _id = 0;
const nextId = (prefix: string) => `${prefix}-${++_id}`;

const buildSubSteps = (_prefix: string, count: number, completedCount: number, apPerStep: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: nextId('ss'),
    label: '',
    completed: i < completedCount,
    claimed: false,
    reward: ap(apPerStep),
  }));

const baseTask = (override: Partial<Task>): Task => {
  const target = override.progress?.target ?? 1;
  const current = override.progress?.current ?? 0;
  const status =
    override.status ?? (current >= target ? TaskStatus.READY_TO_CLAIM : TaskStatus.IN_PROGRESS);
  return {
    id: nextId('t'),
    category: TaskCategory.PROFILE,
    frequency: TaskFrequency.DAILY,
    status,
    rarity: TaskRarity.COMMON,
    title: 'Task',
    rewards: [ltc(1)],
    progress: { current, target },
    resetAt: undefined,
    ...override,
  };
};

// ───────────────── ADS ─────────────────
const buildAds = (): AdsBlock => {
  const slots = Array.from({ length: 10 }, (_, i) => {
    const index = i + 1;
    const watched = i < 3;
    const rewards: TaskReward[] =
      index === 10
        ? [ltc(5), tickets(1), stars(2)]
        : index >= 7
          ? [ltc(2), ap(15)]
          : index >= 4
            ? [ltc(1), ap(10)]
            : [ap(5)];
    return {
      id: nextId('ad'),
      index,
      rewards,
      watched,
    };
  });
  return {
    total: 10,
    watchedToday: 3,
    resetAt: inHours(8),
    slots,
  };
};

// ───────────────── QUEST ─────────────────
const QUEST: Quest = {
  id: 'quest-week-1',
  title: 'Rookie path',
  subtitle: 'Complete 5 steps to earn the weekly Legendary chest.',
  rarity: TaskRarity.LEGENDARY,
  expiresAt: inHours(24 * 5),
  finalReward: [ltc(50), tickets(3), stars(10)],
  steps: [
    {
      id: 'qs-1',
      title: 'Open the app',
      description: 'Launch Lucky Ticket today.',
      status: TaskStatus.COMPLETED,
      rewards: [ap(10)],
    },
    {
      id: 'qs-2',
      title: 'Join your first tournament',
      description: 'Enter any tournament from the Tournaments tab.',
      status: TaskStatus.COMPLETED,
      rewards: [ltc(2), ap(20)],
    },
    {
      id: 'qs-3',
      title: 'Invite 1 friend',
      description: 'Share your invite link with a friend.',
      status: TaskStatus.READY_TO_CLAIM,
      rewards: [ltc(3), tickets(1)],
    },
    {
      id: 'qs-4',
      title: 'Place a stake',
      description: 'Open Stakes and lock LTC for 3 hours.',
      status: TaskStatus.IN_PROGRESS,
      rewards: [ltc(5), ap(50)],
    },
    {
      id: 'qs-5',
      title: 'Reach Silver tier',
      description: 'Earn enough activity points to unlock Silver.',
      status: TaskStatus.LOCKED,
      rewards: [ltc(10), tickets(2)],
    },
  ],
};

// ───────────────── CATEGORY TASKS ─────────────────
const TOURNAMENTS: CategoryTasks = {
  category: TaskCategory.TOURNAMENTS,
  daily: [
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Join 4 Bronze tournaments',
      subtitle: 'All 4 daily Bronze brackets — easy AP grind.',
      rewards: [ltc(1), ap(120)],
      progress: { current: 4, target: 4 },
      status: TaskStatus.READY_TO_CLAIM,
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.COMMON,
      tier: 'bronze',
      subSteps: buildSubSteps('Bronze', 4, 4, 30),
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Join 2 Silver tournaments',
      subtitle: 'Both daily Silver brackets.',
      rewards: [ltc(2), ap(160)],
      progress: { current: 1, target: 2 },
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.RARE,
      tier: 'silver',
      subSteps: buildSubSteps('Silver', 2, 1, 80),
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Bet 1 ticket on a starting Gold tournament',
      subtitle: 'Spectate-bet on todayʼs Gold bracket — no Gold tier needed.',
      rewards: [ltc(2), ap(180)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Gold tier to bet on Gold.',
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.RARE,
      tier: 'gold',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Bet 1 ticket on a starting Platinum tournament',
      subtitle: 'Place a ticket on the daily Platinum bracket.',
      rewards: [ltc(4), ap(260)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Platinum tier to bet on Platinum.',
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.EPIC,
      tier: 'platinum',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Bet 1 ticket on a starting Diamond tournament',
      subtitle: 'Place a ticket on the daily Diamond bracket.',
      rewards: [ltc(8), tickets(1), ap(400)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Diamond tier to bet on Diamond.',
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.LEGENDARY,
      tier: 'diamond',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.DAILY,
      title: 'Complete all available tournament tasks',
      subtitle: 'Finish every unlocked tier task today. Each new tier adds steps + bigger reward.',
      rewards: [ltc(6), ap(450)],
      progress: { current: 5, target: 6 },
      status: TaskStatus.IN_PROGRESS,
      resetAt: inHours(8),
      deeplink: '/tournaments',
      rarity: TaskRarity.LEGENDARY,
      tier: 'all',
      subSteps: [
        {
          id: nextId('all-bronze'),
          label: 'Bronze · 4/4',
          completed: true,
          claimed: false,
          reward: ap(10),
        },
        {
          id: nextId('all-silver'),
          label: 'Silver · 1/2',
          completed: false,
          claimed: false,
          reward: ap(20),
        },
      ],
    }),
  ],
  weekly: [
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Complete daily Bronze task 7 times',
      subtitle: 'Finish the full daily Bronze run × 7 days.',
      rewards: [ltc(8), ap(900)],
      progress: { current: 2, target: 7 },
      resetAt: inHours(72),
      deeplink: '/tasks?frequency=daily&category=tournaments',
      rarity: TaskRarity.RARE,
      tier: 'bronze',
      subSteps: buildSubSteps('Bronze', 7, 2, 120),
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play 14 Silver tournaments this week',
      subtitle: '2 Silver × 7 days.',
      rewards: [ltc(15), tickets(1), ap(1200)],
      progress: { current: 3, target: 14 },
      resetAt: inHours(72),
      deeplink: '/tournaments',
      rarity: TaskRarity.EPIC,
      tier: 'silver',
      subSteps: buildSubSteps('Silver', 14, 3, 80),
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play 1 Gold tournament',
      subtitle: 'Single Gold bracket — counts toward your weekly tier progress.',
      rewards: [ltc(4), ap(200)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Gold tier to unlock.',
      resetAt: inHours(72),
      deeplink: '/tournaments',
      rarity: TaskRarity.EPIC,
      tier: 'gold',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play 7 Gold tournaments this week',
      subtitle: '1 Gold × 7 days.',
      rewards: [ltc(25), tickets(2), ap(1500)],
      progress: { current: 0, target: 7 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Gold tier to unlock.',
      resetAt: inHours(72),
      deeplink: '/tournaments',
      rarity: TaskRarity.EPIC,
      tier: 'gold',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Full week clear: 49 daily tournaments',
      subtitle: 'All Bronze + Silver + Gold for the entire week.',
      rewards: [ltc(60), tickets(5), ap(4000)],
      progress: { current: 0, target: 49 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Gold tier to unlock all daily brackets.',
      resetAt: inHours(72),
      deeplink: '/tournaments',
      rarity: TaskRarity.LEGENDARY,
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play 1 Platinum tournament',
      subtitle: 'The weekly Platinum bracket.',
      rewards: [ltc(8), tickets(1), ap(400)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Platinum tier to unlock.',
      resetAt: inHours(24 * 6),
      deeplink: '/tournaments',
      rarity: TaskRarity.EPIC,
      tier: 'platinum',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play 1 Diamond tournament',
      subtitle: 'Diamond bracket — every 15 days.',
      rewards: [ltc(20), tickets(2), ap(800)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Diamond tier to unlock.',
      resetAt: inHours(24 * 12),
      deeplink: '/tournaments',
      rarity: TaskRarity.LEGENDARY,
      tier: 'diamond',
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.WEEKLY,
      title: 'Play the 30-day mega tournament',
      subtitle: 'The biggest event — once every 30 days.',
      rewards: [ltc(50), tickets(5), ap(1500)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Diamond tier to unlock.',
      resetAt: inHours(24 * 22),
      deeplink: '/tournaments',
      rarity: TaskRarity.LEGENDARY,
    }),
  ],
  once: [
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'Win 1 tournament',
      subtitle: 'Finish 1st in any bracket — counts forever.',
      rewards: [ltc(3), ap(100)],
      progress: { current: 0, target: 1 },
      deeplink: '/tournaments',
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.TOURNAMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'Reach top-10 in any leaderboard',
      subtitle: 'One-time milestone, never resets.',
      rewards: [ltc(2), ap(80)],
      progress: { current: 4, target: 10 },
      deeplink: '/leaderboard',
      rarity: TaskRarity.RARE,
    }),
  ],
};

const SOCIAL: CategoryTasks = {
  category: TaskCategory.SOCIAL,
  daily: [
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.DAILY,
      title: 'Share your daily result',
      rewards: [ap(15)],
      progress: { current: 0, target: 1 },
      resetAt: inHours(8),
      externalLink: 'https://t.me/lucky_ticket_channel',
    }),
  ],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.ONCE,
      title: 'Follow our Telegram channel',
      rewards: [ltc(1), ap(50)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      externalLink: 'https://t.me/lucky_ticket_channel',
    }),
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.ONCE,
      title: 'Subscribe on Twitter / X',
      rewards: [ltc(1), ap(50)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://x.com/lucky_ticket',
    }),
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.ONCE,
      title: 'Join Discord community',
      rewards: [ap(40)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://discord.gg/luckyticket',
    }),
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.ONCE,
      title: 'Share leaderboard standing',
      subtitle: 'Share at least once — never resets.',
      rewards: [ap(80)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://t.me/lucky_ticket_channel',
    }),
    baseTask({
      category: TaskCategory.SOCIAL,
      frequency: TaskFrequency.ONCE,
      title: 'Subscribe to YouTube channel',
      rewards: [ltc(2), ap(75)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://youtube.com/@luckyticket',
    }),
  ],
};

const PROFILE: CategoryTasks = {
  category: TaskCategory.PROFILE,
  daily: [
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.DAILY,
      title: 'Daily check-in',
      subtitle: 'Open the app and tap to claim.',
      rewards: [ap(10)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.READY_TO_CLAIM,
      resetAt: inHours(8),
    }),
  ],
  weekly: [
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.WEEKLY,
      title: 'Check in 7 days this week',
      subtitle: 'Open the app every day for a full week.',
      rewards: [ltc(2), ap(150)],
      progress: { current: 5, target: 7 },
      resetAt: inHours(72),
      rarity: TaskRarity.RARE,
    }),
  ],
  once: [
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.ONCE,
      title: 'Verify your email',
      rewards: [ap(50)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/email',
    }),
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.ONCE,
      title: 'Connect TON wallet',
      rewards: [ltc(1), ap(75)],
      progress: { current: 0, target: 1 },
      deeplink: '/wallet',
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.ONCE,
      title: 'Set a username',
      rewards: [ap(20)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      deeplink: '/settings/username',
    }),
    baseTask({
      category: TaskCategory.PROFILE,
      frequency: TaskFrequency.ONCE,
      title: 'Enable 2FA',
      rewards: [ap(60)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/security',
    }),
  ],
};

const FRIENDS: CategoryTasks = {
  category: TaskCategory.FRIENDS,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.FRIENDS,
      frequency: TaskFrequency.ONCE,
      title: 'Invite 1 friend',
      rewards: [ltc(2), ap(80)],
      progress: { current: 0, target: 1 },
      deeplink: '/invite-friends',
    }),
    baseTask({
      category: TaskCategory.FRIENDS,
      frequency: TaskFrequency.ONCE,
      title: 'Invite 5 friends',
      rewards: [ltc(8), tickets(2), ap(300)],
      progress: { current: 1, target: 5 },
      deeplink: '/invite-friends',
      rarity: TaskRarity.EPIC,
    }),
    baseTask({
      category: TaskCategory.FRIENDS,
      frequency: TaskFrequency.ONCE,
      title: 'Invite 10 friends total',
      rewards: [ltc(20), tickets(5)],
      progress: { current: 1, target: 10 },
      deeplink: '/invite-friends',
      rarity: TaskRarity.LEGENDARY,
    }),
  ],
};

const MARKET: CategoryTasks = {
  category: TaskCategory.MARKET,
  daily: [
    baseTask({
      category: TaskCategory.MARKET,
      frequency: TaskFrequency.DAILY,
      title: 'Visit the Market',
      rewards: [ap(10)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      resetAt: inHours(8),
      deeplink: '/market',
    }),
  ],
  weekly: [
    baseTask({
      category: TaskCategory.MARKET,
      frequency: TaskFrequency.WEEKLY,
      title: 'Visit the Market 7 days this week',
      subtitle: 'Daily Market visit × 7.',
      rewards: [ltc(2), ap(120)],
      progress: { current: 4, target: 7 },
      deeplink: '/market',
      resetAt: inHours(72),
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.MARKET,
      frequency: TaskFrequency.WEEKLY,
      title: 'Buy 1 engine',
      rewards: [ap(150)],
      progress: { current: 0, target: 1 },
      deeplink: '/market',
      resetAt: inHours(96),
    }),
  ],
  once: [
    baseTask({
      category: TaskCategory.MARKET,
      frequency: TaskFrequency.ONCE,
      title: 'Buy your first engine',
      rewards: [ltc(2), ap(100)],
      progress: { current: 0, target: 1 },
      deeplink: '/market',
      rarity: TaskRarity.RARE,
    }),
  ],
};

const STAKES: CategoryTasks = {
  category: TaskCategory.STAKES,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.STAKES,
      frequency: TaskFrequency.ONCE,
      title: 'Place your first stake',
      rewards: [ltc(1), ap(75)],
      progress: { current: 0, target: 1 },
      deeplink: '/stakes',
    }),
    baseTask({
      category: TaskCategory.STAKES,
      frequency: TaskFrequency.ONCE,
      title: 'Hold a stake to completion',
      rewards: [ltc(3), ap(150)],
      progress: { current: 0, target: 1 },
      deeplink: '/stakes',
      rarity: TaskRarity.RARE,
    }),
  ],
};

const PREMIUM: CategoryTasks = {
  category: TaskCategory.PREMIUM,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.PREMIUM,
      frequency: TaskFrequency.ONCE,
      title: 'Activate Telegram Premium',
      rewards: [ltc(10), stars(20), premium(1)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://t.me/premiumbot',
      rarity: TaskRarity.EPIC,
    }),
  ],
};

const VIP: CategoryTasks = {
  category: TaskCategory.VIP,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.VIP,
      frequency: TaskFrequency.ONCE,
      title: 'Reach Silver tier',
      rewards: [ltc(5), tickets(1)],
      progress: { current: 320, target: 500 },
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.VIP,
      frequency: TaskFrequency.ONCE,
      title: 'Reach Gold tier',
      rewards: [ltc(15), tickets(2)],
      progress: { current: 0, target: 2000 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Silver first.',
      rarity: TaskRarity.EPIC,
    }),
    baseTask({
      category: TaskCategory.VIP,
      frequency: TaskFrequency.ONCE,
      title: 'Reach Diamond tier',
      rewards: [ltc(50), tickets(5), stars(20)],
      progress: { current: 0, target: 10000 },
      status: TaskStatus.LOCKED,
      unlockHint: 'Reach Gold first.',
      rarity: TaskRarity.LEGENDARY,
    }),
  ],
};

const ACHIEVEMENTS: CategoryTasks = {
  category: TaskCategory.ACHIEVEMENTS,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.ACHIEVEMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'First win',
      subtitle: 'Win your first tournament.',
      rewards: [ltc(1), ap(50)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.COMMON,
    }),
    baseTask({
      category: TaskCategory.ACHIEVEMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'Tournament veteran',
      subtitle: 'Play 100 tournaments.',
      rewards: [ltc(20), tickets(3), ap(500)],
      progress: { current: 32, target: 100 },
      rarity: TaskRarity.EPIC,
    }),
    baseTask({
      category: TaskCategory.ACHIEVEMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'High roller',
      subtitle: 'Stake 1000 LTC total.',
      rewards: [ltc(30), tickets(5)],
      progress: { current: 240, target: 1000 },
      rarity: TaskRarity.LEGENDARY,
    }),
    baseTask({
      category: TaskCategory.ACHIEVEMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'Social butterfly',
      subtitle: 'Invite 25 friends.',
      rewards: [ltc(40), tickets(5)],
      progress: { current: 1, target: 25 },
      rarity: TaskRarity.LEGENDARY,
    }),
    baseTask({
      category: TaskCategory.ACHIEVEMENTS,
      frequency: TaskFrequency.ONCE,
      title: 'Daily devotee',
      subtitle: 'Maintain a 30-day streak.',
      rewards: [ltc(25), stars(10)],
      progress: { current: 5, target: 30 },
      rarity: TaskRarity.EPIC,
    }),
  ],
};

const PARTNERS: CategoryTasks = {
  category: TaskCategory.PARTNERS,
  daily: [],
  weekly: [],
  once: [
    baseTask({
      category: TaskCategory.PARTNERS,
      frequency: TaskFrequency.ONCE,
      title: 'Try Hamster Kombat',
      subtitle: 'Cross-promo from our partner.',
      rewards: [ltc(2), ap(50)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://t.me/hamster_kombat_bot',
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.PARTNERS,
      frequency: TaskFrequency.ONCE,
      title: 'Spin partner wheel on Notcoin',
      rewards: [ltc(2), ap(50)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://t.me/notcoin_bot',
      rarity: TaskRarity.RARE,
    }),
    baseTask({
      category: TaskCategory.PARTNERS,
      frequency: TaskFrequency.ONCE,
      title: 'Connect a partner exchange account',
      rewards: [ltc(10), tickets(2)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.EPIC,
    }),
  ],
};

const STREAK: StreakInfo = {
  currentDays: 5,
  bestDays: 14,
  nextMilestoneDay: 7,
  upcomingMilestones: [
    { day: 7, reward: ltc(2), reached: false },
    { day: 14, reward: ltc(5), reached: false },
    { day: 21, reward: ltc(10), reached: false },
    { day: 30, reward: tickets(2), reached: false },
    { day: 60, reward: ltc(50), reached: false },
    { day: 100, reward: stars(50), reached: false },
  ],
};

const computeDailyProgress = (categories: CategoryTasks[]) => {
  const dailyTasks = categories.flatMap(c => c.daily);
  const completedToday = dailyTasks.filter(
    t => t.status === TaskStatus.COMPLETED || t.status === TaskStatus.READY_TO_CLAIM
  ).length;
  const readyToClaim = dailyTasks.filter(t => t.status === TaskStatus.READY_TO_CLAIM).length;
  return {
    completedToday,
    totalToday: dailyTasks.length,
    readyToClaim,
  };
};

const CATEGORIES: CategoryTasks[] = [
  TOURNAMENTS,
  SOCIAL,
  PROFILE,
  FRIENDS,
  MARKET,
  STAKES,
  PREMIUM,
  VIP,
  ACHIEVEMENTS,
  PARTNERS,
];

const TASKS_RESPONSE: TasksResponse = {
  streak: STREAK,
  dailyProgress: computeDailyProgress(CATEGORIES),
  ads: buildAds(),
  quest: QUEST,
  categories: CATEGORIES,
};

const claimTaskHandler = (args: { body?: { id?: string; subStepIds?: string[] } }) => {
  const id = args.body?.id ?? '';
  const subStepIds = args.body?.subStepIds ?? [];
  const allTasks = CATEGORIES.flatMap(c => [...c.daily, ...c.weekly, ...c.once]);
  const found = allTasks.find(t => t.id === id);
  let rewards: TaskReward[] = found?.rewards ?? [];
  const allSubSteps = allTasks.flatMap(t => t.subSteps ?? []);
  if (!found) {
    const sub = allSubSteps.find(s => s.id === id);
    if (sub?.reward) rewards = [sub.reward];
  }
  // Bundle any extra sub-step rewards (when user claims main without collecting sub-steps first)
  if (subStepIds.length) {
    const bundled = subStepIds
      .map(sid => allSubSteps.find(s => s.id === sid))
      .filter(s => s?.reward)
      .map(s => s!.reward!);
    rewards = [...rewards, ...bundled];
  }
  if (!rewards.length) rewards = [ltc(1)];
  const ltcDelta = rewards
    .filter(r => r.type === TaskRewardType.LTC)
    .reduce((s, r) => s + r.amount, 0);
  const ticketsDelta = rewards
    .filter(r => r.type === TaskRewardType.TICKETS)
    .reduce((s, r) => s + r.amount, 0);
  const apDelta = rewards
    .filter(r => r.type === TaskRewardType.ACTIVITY_POINTS)
    .reduce((s, r) => s + r.amount, 0);
  const response: ClaimTaskResponse = {
    id,
    rewards,
    newBalance: {
      ltc: 12345 + ltcDelta,
      tickets: 12 + ticketsDelta,
      activityPoints: 4500 + apDelta,
    },
  };
  return response;
};

export const tasksMock = {
  tasks: TASKS_RESPONSE,
  'POST tasks/claim': claimTaskHandler,
  'POST tasks/ads/watch': (args: { body?: { adId?: string } }) => {
    const adId = args.body?.adId ?? '';
    const slot = TASKS_RESPONSE.ads.slots.find(s => s.id === adId);
    return {
      adId,
      rewards: slot?.rewards ?? [ap(5)],
    };
  },
};

export type TasksMock = typeof tasksMock;

export const __dev_tasks_seed = TASKS_RESPONSE;
const _ = DAY_MS;
void _;
