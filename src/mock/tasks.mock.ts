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
import {
  type TierName,
  TIER_RANK,
  TIER_REWARD_MULTIPLIER,
  tierLabel,
} from '@/types/types/tier.types';
import { GlobalConstants } from '@/constants/global.constants';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const inHours = (h: number) => new Date(Date.now() + h * HOUR_MS).toISOString();

// LC rewards are authored in design units; the ×1000 LC denomination scale (DOCS §6.1) is applied here.
const lc = (amount: number): TaskReward => ({ type: TaskRewardType.LC, amount: amount * 1000 });
const tickets = (amount: number): TaskReward => ({ type: TaskRewardType.TICKETS, amount });
const ap = (amount: number): TaskReward => ({ type: TaskRewardType.ACTIVITY_POINTS, amount });
const stars = (amount: number): TaskReward => ({ type: TaskRewardType.STARS, amount });

let _id = 0;
const nextId = (prefix: string) => `${prefix}-${++_id}`;

// ============================================================
// USER TIER — change this single constant to test different
// access levels. All tier-bound tasks below will auto-lock /
// auto-unlock based on this value, and the master "Complete
// all available tournament tasks" adapts its substeps to match.
// (TierName + TIER_RANK live in src/types/types/tier.types.ts —
//  shared with the rest of the codebase.)
// ============================================================
const USER_TIER: TierName = 'platinum';

const isTierUnlocked = (tier?: string): boolean => {
  if (!tier || tier === 'all') return true;
  const taskRank = TIER_RANK[tier as TierName] ?? 99;
  return TIER_RANK[USER_TIER] >= taskRank;
};

const tierUnlockHint = (tier: string) => `Reach ${tierLabel(tier as TierName)} tier to unlock.`;

// Walks tasks and forces LOCKED + unlockHint when task.tier is above USER_TIER,
// otherwise strips the lock so progress / status flow naturally.
const applyTierLock = (task: Task): Task => {
  if (!task.tier || task.tier === 'all') return task;
  if (isTierUnlocked(task.tier)) {
    if (task.status !== TaskStatus.LOCKED) return task;
    const { unlockHint: _hint, ...rest } = task;
    void _hint;
    const naturalStatus =
      task.progress.current >= task.progress.target
        ? TaskStatus.READY_TO_CLAIM
        : TaskStatus.IN_PROGRESS;
    return { ...rest, status: naturalStatus };
  }
  return {
    ...task,
    status: TaskStatus.LOCKED,
    unlockHint: tierUnlockHint(task.tier),
  };
};

const applyTierLockToCategory = (cat: CategoryTasks): CategoryTasks => ({
  ...cat,
  daily: cat.daily.map(applyTierLock),
  weekly: cat.weekly.map(applyTierLock),
  once: cat.once.map(applyTierLock),
});

// AP on daily/weekly tasks is normalized to the canonical tier rates
// (DOCS §5.3) — daily 1–5, weekly 2–6 by task tier. One-time tasks keep
// their bespoke AP ("varies" in the table). Non-AP rewards are preserved.
const taskTierAp = (frequency: TaskFrequency, tier?: Task['tier']): number | null => {
  const key = tier && tier !== 'all' ? tier : 'bronze';
  if (frequency === TaskFrequency.DAILY) return GlobalConstants.apRewards.dailyTaskByTier[key];
  if (frequency === TaskFrequency.WEEKLY) return GlobalConstants.apRewards.weeklyTaskByTier[key];
  return null;
};

const normalizeTaskAp = (task: Task): Task => {
  const apValue = taskTierAp(task.frequency, task.tier);
  if (apValue === null) return task;
  const nonAp = task.rewards.filter(r => r.type !== TaskRewardType.ACTIVITY_POINTS);
  const rewards = [...nonAp, ap(apValue)];
  if (!task.subSteps?.length) return { ...task, rewards };

  // Each sub-step grants a flat 1 AP; the task header keeps its tier AP.
  const subSteps = task.subSteps.map(step => ({ ...step, reward: ap(1) }));
  return { ...task, rewards, subSteps };
};

const normalizeCategoryAp = (cat: CategoryTasks): CategoryTasks => ({
  ...cat,
  daily: cat.daily.map(normalizeTaskAp),
  weekly: cat.weekly.map(normalizeTaskAp),
});

const buildSubSteps = (
  _prefix: string,
  count: number,
  completedCount: number,
  apPerStep: number,
  labels?: string[]
) =>
  Array.from({ length: count }, (_, i) => ({
    id: nextId('ss'),
    label: labels?.[i] ?? '',
    completed: i < completedCount,
    claimed: false,
    reward: ap(apPerStep),
  }));

const BRONZE_DAILY_SLOTS = [
  'Morning Bronze · 06:00',
  'Afternoon Bronze · 12:00',
  'Evening Bronze · 18:00',
  'Night Bronze · 00:00',
];
const SILVER_DAILY_SLOTS = ['Afternoon Silver · 12:00', 'Night Silver · 00:00'];
const WEEKDAYS_7 = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

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
    rarity: TaskRarity.BRONZE,
    title: 'Task',
    rewards: [lc(1)],
    progress: { current, target },
    resetAt: undefined,
    ...override,
  };
};

// ============================================================
// GENERIC CATEGORY BUILDER
// One blueprint shape for any category. Removes the need to repeat
// `category` and `frequency` on every task; default reset hours are
// auto-applied per frequency. Pass `Task` directly (already-built)
// to opt out of the wrapper for special cases (e.g. tier-bound).
// ============================================================
type TaskBlueprint = Omit<Partial<Task>, 'category' | 'frequency'>;

interface CategoryBlueprint {
  category: TaskCategory;
  dailyResetHours?: number;
  weeklyResetHours?: number;
  daily?: (TaskBlueprint | Task)[];
  weekly?: (TaskBlueprint | Task)[];
  once?: (TaskBlueprint | Task)[];
}

const isBuiltTask = (t: TaskBlueprint | Task): t is Task =>
  typeof (t as Task).id === 'string' && typeof (t as Task).category === 'string';

const buildCategory = (bp: CategoryBlueprint): CategoryTasks => {
  const stamp = (
    items: (TaskBlueprint | Task)[] | undefined,
    frequency: TaskFrequency,
    resetHours?: number
  ): Task[] =>
    (items ?? []).map(item => {
      if (isBuiltTask(item)) return item;
      return baseTask({
        category: bp.category,
        frequency,
        resetAt: item.resetAt ?? (resetHours !== undefined ? inHours(resetHours) : undefined),
        ...item,
      });
    });

  return {
    category: bp.category,
    daily: stamp(bp.daily, TaskFrequency.DAILY, bp.dailyResetHours),
    weekly: stamp(bp.weekly, TaskFrequency.WEEKLY, bp.weeklyResetHours),
    once: stamp(bp.once, TaskFrequency.ONCE),
  };
};

// ───────────────── ADS ─────────────────
// Single source of truth for the ads block. Reward tiers are matched by upper-bound index:
// the first tier whose `upTo` >= slot index wins. Add tiers / slots / change reset by editing this.
interface AdsConfig {
  total: number;
  watchedToday: number;
  resetHours: number;
  rewardTiers: { upTo: number; rewards: TaskReward[] }[];
}

const ADS_CONFIG: AdsConfig = {
  total: 20,
  watchedToday: 3,
  resetHours: 8,
  // Every ad/video grants a flat AP reward — DOCS §5.3 "Watch a video".
  rewardTiers: [{ upTo: 20, rewards: [ap(GlobalConstants.apRewards.watchVideo)] }],
};

const getAdRewards = (index: number): TaskReward[] => {
  const tier = ADS_CONFIG.rewardTiers.find(t => index <= t.upTo);
  return tier?.rewards ?? ADS_CONFIG.rewardTiers[0].rewards;
};

const buildAds = (): AdsBlock => ({
  total: ADS_CONFIG.total,
  watchedToday: ADS_CONFIG.watchedToday,
  resetAt: inHours(ADS_CONFIG.resetHours),
  slots: Array.from({ length: ADS_CONFIG.total }, (_, i) => ({
    id: nextId('ad'),
    index: i + 1,
    rewards: getAdRewards(i + 1),
    watched: i < ADS_CONFIG.watchedToday,
  })),
});

// ───────────────── ADS — WATCH MILESTONES ─────────────────
// One-time milestone chain for the "watch ads" mechanic — a single task type
// whose levels are cumulative view-count thresholds. Rendered as a horizontal
// slider (like Friends invites); the slider auto-appends a "Coming soon" card
// after the 7th level. Demo state: ADS_WATCHED_TOTAL ads watched so far.
const ADS_WATCHED_TOTAL = 60;

type AdsMilestone = { target: number; rewards: TaskReward[] };

const ADS_WATCH_MILESTONES: AdsMilestone[] = [
  { target: 10, rewards: [lc(1), ap(50)] },
  { target: 25, rewards: [lc(3), ap(150)] },
  { target: 50, rewards: [lc(6), tickets(1), ap(300)] },
  { target: 100, rewards: [lc(12), tickets(2), ap(600)] },
  { target: 200, rewards: [lc(25), tickets(3), stars(5), ap(1200)] },
  { target: 400, rewards: [lc(50), tickets(5), stars(10), ap(2400)] },
  { target: 800, rewards: [lc(100), tickets(10), stars(20), ap(5000)] },
];

const ADS = buildCategory({
  category: TaskCategory.ADS,
  once: ADS_WATCH_MILESTONES.map(m => ({
    id: `ads-watch-${m.target}`,
    title: `Watch ${m.target} ads`,
    subtitle: 'Watch rewarded ads — any ad counts.',
    rewards: m.rewards,
    progress: { current: Math.min(ADS_WATCHED_TOTAL, m.target), target: m.target },
    deeplink: '/tasks?frequency=daily&category=ads',
    rarity: TaskRarity.BRONZE,
  })),
});

// ───────────────── QUEST ─────────────────
const QUEST: Quest = {
  id: 'quest-week-1',
  title: 'Rookie path',
  subtitle: 'Complete 5 steps to earn the weekly Legendary chest.',
  rarity: TaskRarity.PLATINUM,
  expiresAt: inHours(24 * 5),
  finalReward: [lc(50), tickets(3), stars(10)],
  steps: [
    {
      id: 'qs-1',
      title: 'Open the app',
      description: 'Launch LuckyTicket365 today.',
      status: TaskStatus.COMPLETED,
      rewards: [ap(10)],
    },
    {
      id: 'qs-2',
      title: 'Join your first tournament',
      description: 'Enter any tournament from the Tournaments tab.',
      status: TaskStatus.COMPLETED,
      rewards: [lc(2), ap(20)],
    },
    {
      id: 'qs-3',
      title: 'Invite 1 friend',
      description: 'Share your invite link with a friend.',
      status: TaskStatus.READY_TO_CLAIM,
      rewards: [lc(3), tickets(1)],
    },
    {
      id: 'qs-4',
      title: 'Place a stake',
      description: 'Open Stakes and lock LC for 3 hours.',
      status: TaskStatus.IN_PROGRESS,
      rewards: [lc(5), ap(50)],
    },
    {
      id: 'qs-5',
      title: 'Reach Silver tier',
      description: 'Earn enough activity points to unlock Silver.',
      status: TaskStatus.LOCKED,
      rewards: [lc(10), tickets(2)],
    },
  ],
};

// ───────────────── TOURNAMENT TIER CONFIGS ─────────────────
// Single source of truth for all tier-bound tournament tasks (daily + weekly).
// Adding a new tier or tweaking rewards is a single config change.
type TournamentKind = 'play' | 'bet';

interface TierTournamentConfig {
  tier: TierName;
  daily: {
    kind: TournamentKind;
    count: number;
    slots: string[];
    title: string;
    subtitle: string;
    rewards: TaskReward[];
    progress: { current: number; target: number };
    rarity: TaskRarity;
    subStepAp: number;
  };
  weekly: {
    rewards: TaskReward[];
    progress: { current: number; target: number };
    rarity: TaskRarity;
    subStepAp: number;
  };
}

const TIER_CONFIGS: TierTournamentConfig[] = [
  {
    tier: 'bronze',
    daily: {
      kind: 'play',
      count: 4,
      slots: BRONZE_DAILY_SLOTS,
      title: 'Join 4 Bronze tournaments',
      subtitle: 'All 4 daily Bronze brackets — easy AP grind.',
      rewards: [lc(1), ap(120)],
      progress: { current: 4, target: 4 },
      rarity: TaskRarity.BRONZE,
      subStepAp: 5,
    },
    weekly: {
      rewards: [lc(8), ap(900)],
      progress: { current: 2, target: 7 },
      rarity: TaskRarity.SILVER,
      subStepAp: 5,
    },
  },
  {
    tier: 'silver',
    daily: {
      kind: 'play',
      count: 2,
      slots: SILVER_DAILY_SLOTS,
      title: 'Join 2 Silver tournaments',
      subtitle: 'Both daily Silver brackets.',
      rewards: [lc(2), ap(160)],
      progress: { current: 1, target: 2 },
      rarity: TaskRarity.SILVER,
      subStepAp: 5,
    },
    weekly: {
      rewards: [lc(15), tickets(1), ap(1200)],
      progress: { current: 1, target: 7 },
      rarity: TaskRarity.GOLD,
      subStepAp: 5,
    },
  },
  {
    tier: 'gold',
    daily: {
      kind: 'bet',
      count: 1,
      slots: [],
      title: 'Bet 1 ticket on a starting Gold tournament',
      subtitle: 'Spectate-bet on todayʼs Gold bracket.',
      rewards: [lc(2), ap(180)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
      subStepAp: 5,
    },
    weekly: {
      rewards: [lc(25), tickets(2), ap(1500)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.GOLD,
      subStepAp: 5,
    },
  },
  {
    tier: 'platinum',
    daily: {
      kind: 'bet',
      count: 1,
      slots: [],
      title: 'Bet 1 ticket on a starting Platinum tournament',
      subtitle: 'Place a ticket on the daily Platinum bracket.',
      rewards: [lc(4), ap(260)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
      subStepAp: 5,
    },
    weekly: {
      rewards: [lc(30), tickets(2), ap(2000)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.GOLD,
      subStepAp: 5,
    },
  },
  {
    tier: 'diamond',
    daily: {
      kind: 'bet',
      count: 1,
      slots: [],
      title: 'Bet 1 ticket on a starting Diamond tournament',
      subtitle: 'Place a ticket on the daily Diamond bracket.',
      rewards: [lc(8), tickets(1), ap(400)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
      subStepAp: 5,
    },
    weekly: {
      rewards: [lc(50), tickets(3), ap(2800)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.PLATINUM,
      subStepAp: 5,
    },
  },
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const buildDailyTierTask = (cfg: TierTournamentConfig): Task => {
  const tierCap = cap(cfg.tier);
  return baseTask({
    id: `task-daily-${cfg.tier}`,
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.DAILY,
    title: cfg.daily.title,
    subtitle: cfg.daily.subtitle,
    rewards: cfg.daily.rewards,
    progress: cfg.daily.progress,
    resetAt: inHours(8),
    deeplink: '/tournaments',
    rarity: cfg.daily.rarity,
    tier: cfg.tier,
    subSteps: buildSubSteps(
      tierCap,
      cfg.daily.count,
      cfg.daily.progress.current,
      cfg.daily.subStepAp,
      cfg.daily.slots
    ),
  });
};

const buildWeeklyTierTask = (cfg: TierTournamentConfig): Task => {
  const tierCap = cap(cfg.tier);
  const verb = cfg.daily.kind === 'bet' ? 'bet' : 'task';
  const subtitle =
    cfg.daily.kind === 'bet'
      ? `Place 1 ticket on ${tierCap} × 7 days.`
      : `Finish the full daily ${tierCap} run × 7 days.`;
  return baseTask({
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.WEEKLY,
    title: `Complete daily ${tierCap} ${verb} 7 times`,
    subtitle,
    rewards: cfg.weekly.rewards,
    progress: cfg.weekly.progress,
    resetAt: inHours(72),
    deeplink: `/tasks?frequency=daily&category=tournaments&task=task-daily-${cfg.tier}`,
    rarity: cfg.weekly.rarity,
    tier: cfg.tier,
    subSteps: buildSubSteps(
      tierCap,
      7,
      cfg.weekly.progress.current,
      cfg.weekly.subStepAp,
      WEEKDAYS_7
    ),
  });
};

// ───────────────── MASTER TASKS (derived from TIER_CONFIGS) ─────────────────
const WEEKLY_TIER_TARGET = 7;
const MASTER_SUBSTEP_AP = 5;
const WEEKLY_MASTER_SUBSTEP_AP = 20;

const unlockedConfigs = () => TIER_CONFIGS.filter(c => isTierUnlocked(c.tier));

const buildMasterSubSteps = () =>
  unlockedConfigs().map(c => ({
    id: nextId(`all-${c.tier}`),
    label: `${cap(c.tier)} · ${c.daily.progress.current}/${c.daily.progress.target}`,
    completed: c.daily.progress.current >= c.daily.progress.target,
    claimed: false,
    reward: ap(MASTER_SUBSTEP_AP),
  }));

const buildMasterProgress = () => {
  const unlocked = unlockedConfigs();
  const target = unlocked.reduce((sum, c) => sum + c.daily.progress.target, 0) || 1;
  const current = unlocked.reduce((sum, c) => sum + c.daily.progress.current, 0);
  return { current, target };
};

const buildWeeklyMasterSubSteps = () =>
  unlockedConfigs().map(c => ({
    id: nextId(`week-all-${c.tier}`),
    label: `${cap(c.tier)} · ${c.weekly.progress.current}/${WEEKLY_TIER_TARGET}`,
    completed: c.weekly.progress.current >= WEEKLY_TIER_TARGET,
    claimed: false,
    reward: ap(WEEKLY_MASTER_SUBSTEP_AP),
  }));

const buildWeeklyMasterProgress = () => {
  const unlocked = unlockedConfigs();
  const target = unlocked.length * WEEKLY_TIER_TARGET || 1;
  const current = unlocked.reduce((sum, c) => sum + c.weekly.progress.current, 0);
  return { current, target };
};

// ───────────────── PLACE MILESTONES (1st / 2nd / 3rd) ─────────────────
// Single source of truth for the per-place milestone chains (1, 5, 10, 25, 50, 100).
// Reward shape mirrors the podium chain — adjust here to tune all 3 sliders at once.
type PlaceKey = '1st' | '2nd' | '3rd';

const PLACE_MILESTONES: { target: number; rewards: TaskReward[]; rarity: TaskRarity }[] = [
  { target: 1, rewards: [ap(100)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(3), ap(200)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(6), tickets(1), ap(350)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(15), tickets(2), ap(700)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(30), tickets(4), ap(1500)], rarity: TaskRarity.GOLD },
  {
    target: 100,
    rewards: [lc(70), tickets(8), stars(15), ap(3000)],
    rarity: TaskRarity.PLATINUM,
  },
];

const buildPlaceMilestones = (place: PlaceKey): TaskBlueprint[] =>
  PLACE_MILESTONES.map(m => ({
    id: `tournament-${place}-${m.target}`,
    title: `Take ${place} place ${m.target} ${m.target === 1 ? 'time' : 'times'}`,
    subtitle:
      m.target === 1
        ? `Take ${place} place in any tournament category.`
        : `${m.target} times ${place} place.`,
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/tournaments',
    rarity: m.rarity,
  }));

// ───────────────── PER-TIER MILESTONES (Bronze/Silver/Gold/Platinum/Diamond) ─────────────────
// For each tier × each chain (participation + 1st/2nd/3rd) we generate 6 milestone tasks.
// Rewards are multiplied per tier difficulty (`TIER_REWARD_MULTIPLIER` from tier.types.ts).
// Tier field triggers applyTierLock.
const PARTICIPATION_MILESTONES: { target: number; rewards: TaskReward[]; rarity: TaskRarity }[] = [
  { target: 1, rewards: [ap(80)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(2), ap(180)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(5), tickets(1), ap(300)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(12), tickets(2), ap(600)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(25), tickets(4), ap(1200)], rarity: TaskRarity.GOLD },
  {
    target: 100,
    rewards: [lc(60), tickets(8), stars(15), ap(2500)],
    rarity: TaskRarity.PLATINUM,
  },
];

const scaleReward = (r: TaskReward, mult: number): TaskReward => ({
  ...r,
  amount: Math.max(1, Math.round(r.amount * mult)),
});

const buildTierPlaceMilestones = (tier: TierName, place: PlaceKey): TaskBlueprint[] => {
  const mult = TIER_REWARD_MULTIPLIER[tier];
  const tierCap = tierLabel(tier);
  return PLACE_MILESTONES.map(m => ({
    id: `tournament-${tier}-${place}-${m.target}`,
    title: `Take ${place} place in ${m.target} ${tierCap} tournament${m.target === 1 ? '' : 's'}`,
    subtitle: `${m.target} ${tierCap} ${place}-place finish${m.target === 1 ? '' : 'es'}.`,
    rewards: m.rewards.map(r => scaleReward(r, mult)),
    progress: { current: 0, target: m.target },
    deeplink: '/tournaments',
    rarity: m.rarity,
    tier,
  }));
};

const buildTierParticipationMilestones = (tier: TierName): TaskBlueprint[] => {
  const mult = TIER_REWARD_MULTIPLIER[tier];
  const tierCap = tierLabel(tier);
  return PARTICIPATION_MILESTONES.map(m => ({
    id: `tournament-${tier}-played-${m.target}`,
    title: `Participate in ${m.target} ${tierCap} tournament${m.target === 1 ? '' : 's'}`,
    subtitle: `${m.target} ${tierCap} tournament${m.target === 1 ? '' : 's'} joined.`,
    rewards: m.rewards.map(r => scaleReward(r, mult)),
    progress: { current: 0, target: m.target },
    deeplink: '/tournaments',
    rarity: m.rarity,
    tier,
  }));
};

const TIER_KEYS: TierName[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

const buildAllTierMilestones = (): TaskBlueprint[] =>
  TIER_KEYS.flatMap(tier => [
    ...buildTierParticipationMilestones(tier),
    ...buildTierPlaceMilestones(tier, '1st'),
    ...buildTierPlaceMilestones(tier, '2nd'),
    ...buildTierPlaceMilestones(tier, '3rd'),
  ]);

// ───────────────── CATEGORY TASKS ─────────────────
const TOURNAMENTS = buildCategory({
  category: TaskCategory.TOURNAMENTS,
  dailyResetHours: 8,
  weeklyResetHours: 72,
  daily: [
    ...TIER_CONFIGS.map(buildDailyTierTask),
    {
      title: 'Complete all available tournament tasks',
      subtitle: 'Finish every unlocked tier task today. Each new tier adds steps + bigger reward.',
      rewards: [lc(6), ap(450)],
      progress: buildMasterProgress(),
      deeplink: '/tournaments',
      rarity: TaskRarity.PLATINUM,
      tier: 'all',
      subSteps: buildMasterSubSteps(),
    },
  ],
  weekly: [
    ...TIER_CONFIGS.map(buildWeeklyTierTask),
    {
      title: 'Complete all available weekly tournament tasks',
      subtitle: 'Finish every unlocked tier weekly task. Each tier adds steps + bigger reward.',
      rewards: [lc(80), tickets(5), ap(5000)],
      progress: buildWeeklyMasterProgress(),
      deeplink: '/tournaments',
      rarity: TaskRarity.PLATINUM,
      tier: 'all',
      subSteps: buildWeeklyMasterSubSteps(),
    },
  ],
  once: [
    // ─── Podium (top-3) milestone chain — rendered as horizontal slider on once tab ───
    {
      id: 'tournament-podium-1',
      title: 'Take a prize place 1 time',
      subtitle: 'Take a prize place in any tournament category.',
      rewards: [ap(100)],
      progress: { current: 0, target: 1 },
      deeplink: '/tournaments',
      rarity: TaskRarity.BRONZE,
    },
    {
      id: 'tournament-podium-5',
      title: 'Take a prize place 5 times',
      subtitle: '5 times prize place.',
      rewards: [lc(3), ap(200)],
      progress: { current: 0, target: 5 },
      deeplink: '/tournaments',
      rarity: TaskRarity.SILVER,
    },
    {
      id: 'tournament-podium-10',
      title: 'Take a prize place 10 times',
      subtitle: '10 times prize place.',
      rewards: [lc(6), tickets(1), ap(350)],
      progress: { current: 0, target: 10 },
      deeplink: '/tournaments',
      rarity: TaskRarity.SILVER,
    },
    {
      id: 'tournament-podium-25',
      title: 'Take a prize place 25 times',
      subtitle: '25 times prize place — solid run.',
      rewards: [lc(15), tickets(2), ap(700)],
      progress: { current: 0, target: 25 },
      deeplink: '/tournaments',
      rarity: TaskRarity.GOLD,
    },
    {
      id: 'tournament-podium-50',
      title: 'Take a prize place 50 times',
      subtitle: '50 times prize place.',
      rewards: [lc(30), tickets(4), ap(1500)],
      progress: { current: 0, target: 50 },
      deeplink: '/tournaments',
      rarity: TaskRarity.GOLD,
    },
    {
      id: 'tournament-podium-100',
      title: 'Take a prize place 100 times',
      subtitle: 'Centurion — 100 times prize place.',
      rewards: [lc(70), tickets(8), stars(15), ap(3000)],
      progress: { current: 0, target: 100 },
      deeplink: '/tournaments',
      rarity: TaskRarity.PLATINUM,
    },
    // ─── Tournament participation milestones — rendered as horizontal slider ───
    {
      id: 'tournament-played-1',
      title: 'Participate in 1 tournament',
      subtitle: 'Join any tournament for the first time.',
      rewards: [ap(80)],
      progress: { current: 0, target: 1 },
      deeplink: '/tournaments',
      rarity: TaskRarity.BRONZE,
    },
    {
      id: 'tournament-played-5',
      title: 'Participate in 5 tournaments',
      subtitle: '5 tournaments joined.',
      rewards: [lc(2), ap(180)],
      progress: { current: 0, target: 5 },
      deeplink: '/tournaments',
      rarity: TaskRarity.SILVER,
    },
    {
      id: 'tournament-played-10',
      title: 'Participate in 10 tournaments',
      subtitle: '10 tournaments joined.',
      rewards: [lc(5), tickets(1), ap(300)],
      progress: { current: 0, target: 10 },
      deeplink: '/tournaments',
      rarity: TaskRarity.SILVER,
    },
    {
      id: 'tournament-played-25',
      title: 'Participate in 25 tournaments',
      subtitle: '25 tournaments — getting serious.',
      rewards: [lc(12), tickets(2), ap(600)],
      progress: { current: 0, target: 25 },
      deeplink: '/tournaments',
      rarity: TaskRarity.GOLD,
    },
    {
      id: 'tournament-played-50',
      title: 'Participate in 50 tournaments',
      subtitle: '50 tournaments joined.',
      rewards: [lc(25), tickets(4), ap(1200)],
      progress: { current: 0, target: 50 },
      deeplink: '/tournaments',
      rarity: TaskRarity.GOLD,
    },
    {
      id: 'tournament-played-100',
      title: 'Participate in 100 tournaments',
      subtitle: 'Centurion of competitions.',
      rewards: [lc(60), tickets(8), stars(15), ap(2500)],
      progress: { current: 0, target: 100 },
      deeplink: '/tournaments',
      rarity: TaskRarity.PLATINUM,
    },
    // ─── Per-place milestone chains (1st / 2nd / 3rd) — rendered as 3 sliders ───
    ...buildPlaceMilestones('1st'),
    ...buildPlaceMilestones('2nd'),
    ...buildPlaceMilestones('3rd'),
    // ─── Per-tier × per-place + participation milestones (5 tiers × 4 chains × 6 = 120 tasks) ───
    ...buildAllTierMilestones(),
  ],
});

// ───────────────── LEADERBOARD ─────────────────
// Four time-period sliders: daily / weekly / monthly / all-time.
// Same rank ladder (1000 → #1) for each, with rewards scaled by period
// difficulty (all-time is hardest to crack, so it pays the most).
type LeaderboardMilestone = { rank: number; rewards: TaskReward[]; rarity: TaskRarity };
type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';

const LEADERBOARD_BASE_MILESTONES: LeaderboardMilestone[] = [
  { rank: 1000, rewards: [lc(2), ap(80)], rarity: TaskRarity.BRONZE },
  { rank: 500, rewards: [lc(5), tickets(1), ap(200)], rarity: TaskRarity.SILVER },
  { rank: 100, rewards: [lc(12), tickets(2), ap(450)], rarity: TaskRarity.SILVER },
  { rank: 50, rewards: [lc(28), tickets(4), ap(900)], rarity: TaskRarity.GOLD },
  { rank: 10, rewards: [lc(60), tickets(8), ap(2000)], rarity: TaskRarity.GOLD },
  {
    rank: 1,
    rewards: [lc(150), tickets(20), stars(35), ap(4500)],
    rarity: TaskRarity.PLATINUM,
  },
];

const LEADERBOARD_PERIOD_KEYS: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'alltime'];

const LEADERBOARD_PERIOD_MULTIPLIER: Record<LeaderboardPeriod, number> = {
  daily: 1,
  weekly: 2,
  monthly: 4,
  alltime: 8,
};

const buildLeaderboardPeriod = (period: LeaderboardPeriod): TaskBlueprint[] => {
  const mult = LEADERBOARD_PERIOD_MULTIPLIER[period];
  const periodLabel = period === 'alltime' ? 'all-time' : period;
  return LEADERBOARD_BASE_MILESTONES.map(m => ({
    id: `leaderboard-${period}-rank-${m.rank}`,
    title:
      m.rank === 1
        ? `Reach #1 on the ${periodLabel} leaderboard`
        : `Reach top ${m.rank} ${periodLabel}`,
    subtitle:
      m.rank === 1
        ? `Top spot on the ${periodLabel} leaderboard.`
        : `Place in the top ${m.rank} of the ${periodLabel} leaderboard.`,
    rewards: m.rewards.map(r => scaleReward(r, mult)),
    progress: { current: 0, target: m.rank },
    deeplink: '/leaderboard',
    rarity: m.rarity,
  }));
};

const LEADERBOARD = buildCategory({
  category: TaskCategory.LEADERBOARD,
  once: LEADERBOARD_PERIOD_KEYS.flatMap(buildLeaderboardPeriod),
});

// ───────────────── SOCIAL ─────────────────
const SOCIAL_PLATFORMS = [
  {
    title: 'Follow our Telegram channel',
    rewards: [lc(1), ap(50)],
    url: 'https://t.me/luckyticket365_channel',
    completed: true,
  },
  {
    title: 'Subscribe on Twitter / X',
    rewards: [lc(1), ap(50)],
    url: 'https://x.com/luckyticket365',
  },
  { title: 'Join Discord community', rewards: [ap(40)], url: 'https://discord.gg/luckyticket' },
  {
    title: 'Subscribe to YouTube channel',
    rewards: [lc(2), ap(75)],
    url: 'https://youtube.com/@luckyticket',
  },
];

const SOCIAL = buildCategory({
  category: TaskCategory.SOCIAL,
  dailyResetHours: 8,
  daily: [
    {
      title: 'Share your daily result',
      rewards: [ap(15)],
      progress: { current: 0, target: 1 },
      externalLink: 'https://t.me/luckyticket365_channel',
    },
  ],
  once: SOCIAL_PLATFORMS.map(p => ({
    title: p.title,
    rewards: p.rewards,
    progress: { current: p.completed ? 1 : 0, target: 1 },
    status: p.completed ? TaskStatus.COMPLETED : undefined,
    externalLink: p.url,
  })),
});

// ───────────────── PROFILE ─────────────────
const PROFILE = buildCategory({
  category: TaskCategory.PROFILE,
  dailyResetHours: 8,
  weeklyResetHours: 72,
  daily: [
    {
      title: 'Daily check-in',
      subtitle: 'Open the app and tap to claim.',
      rewards: [ap(10)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.READY_TO_CLAIM,
    },
  ],
  weekly: [
    {
      title: 'Check in 7 days this week',
      subtitle: 'Open the app every day for a full week.',
      rewards: [lc(2), ap(150)],
      progress: { current: 5, target: 7 },
      rarity: TaskRarity.SILVER,
      subSteps: buildSubSteps('profile-checkin', 7, 5, 15, WEEKDAYS_7),
    },
  ],
  once: [
    // ─── Account setup (DOCS §16 Settings & Security) ───
    {
      title: 'Verify your email',
      subtitle: 'Confirm the email linked to your account.',
      rewards: [ap(50)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/email',
    },
    {
      title: 'Set a username',
      subtitle: 'Pick a public display name.',
      rewards: [ap(20)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      deeplink: '/settings/username',
    },
    {
      title: 'Enable 2FA',
      subtitle: 'Secure your account with two-factor auth.',
      rewards: [ap(60)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/security',
      rarity: TaskRarity.SILVER,
    },
    // ─── Profile (DOCS §4.2) ───
    {
      title: 'Customize your avatar',
      subtitle: 'Upload or pick a profile picture.',
      rewards: [ap(80)],
      progress: { current: 0, target: 1 },
      deeplink: '/profile',
      rarity: TaskRarity.BRONZE,
    },
    // ─── Wallet first-touch (DOCS §15) ───
    {
      title: 'Connect TON wallet',
      subtitle: 'Link a TON wallet for deposits / withdrawals.',
      rewards: [lc(1), ap(75)],
      progress: { current: 0, target: 1 },
      deeplink: '/wallet',
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Make your first deposit',
      subtitle: 'Top up your LC balance from USD or TON.',
      rewards: [lc(2), ap(100)],
      progress: { current: 0, target: 1 },
      deeplink: '/wallet',
      rarity: TaskRarity.SILVER,
    },
    // ─── Onboarding feel ───
    {
      title: 'Visit every tab in the app',
      subtitle: 'Tournaments, Market, Stakes, Tasks.',
      rewards: [lc(1), ap(100)],
      progress: { current: 0, target: 4 },
      rarity: TaskRarity.BRONZE,
    },
  ],
});

// ───────────────── FRIENDS ─────────────────
// Single milestone chain — drives the "Invite N friends" horizontal slider.
type FriendMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const FRIEND_INVITE_MILESTONES: FriendMilestone[] = [
  { target: 1, rewards: [lc(2), ap(100)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(8), tickets(2), ap(300)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(18), tickets(4), ap(700)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(45), tickets(8), ap(1500)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(100), tickets(15), ap(3000)], rarity: TaskRarity.GOLD },
  {
    target: 100,
    rewards: [lc(250), tickets(35), stars(50), ap(7000)],
    rarity: TaskRarity.PLATINUM,
  },
];

const FRIENDS = buildCategory({
  category: TaskCategory.FRIENDS,
  once: FRIEND_INVITE_MILESTONES.map(m => ({
    id: `friend-invite-${m.target}`,
    title: `Invite ${m.target} friend${m.target === 1 ? '' : 's'}`,
    subtitle: 'Bring friends in via your referral link.',
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/invite-friends',
    rarity: m.rarity,
  })),
});

// ───────────────── ENGINES ─────────────────
// Milestone chains — drive the "Own N engines" horizontal sliders.
// Bronze (also shown as the General slider) starts at 1 and caps at 100;
// each higher tier has a smaller cap because higher-tier engines are rarer.
type EngineMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const ENGINE_MILESTONES_BY_TIER: Record<TierName, EngineMilestone[]> = {
  bronze: [
    { target: 5, rewards: [lc(5), ap(200)], rarity: TaskRarity.BRONZE },
    { target: 10, rewards: [lc(12), tickets(2), ap(450)], rarity: TaskRarity.SILVER },
    { target: 15, rewards: [lc(20), tickets(3), ap(700)], rarity: TaskRarity.SILVER },
    { target: 20, rewards: [lc(35), tickets(5), ap(1000)], rarity: TaskRarity.GOLD },
    { target: 25, rewards: [lc(55), tickets(8), ap(1500)], rarity: TaskRarity.GOLD },
    {
      target: 30,
      rewards: [lc(100), tickets(15), stars(30), ap(2500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  silver: [
    { target: 3, rewards: [lc(8), ap(250)], rarity: TaskRarity.BRONZE },
    { target: 6, rewards: [lc(20), tickets(2), ap(550)], rarity: TaskRarity.SILVER },
    { target: 9, rewards: [lc(35), tickets(4), ap(900)], rarity: TaskRarity.SILVER },
    { target: 12, rewards: [lc(60), tickets(7), ap(1400)], rarity: TaskRarity.GOLD },
    { target: 15, rewards: [lc(95), tickets(11), ap(2200)], rarity: TaskRarity.GOLD },
    {
      target: 18,
      rewards: [lc(180), tickets(22), stars(45), ap(4000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  gold: [
    { target: 2, rewards: [lc(15), ap(300)], rarity: TaskRarity.BRONZE },
    { target: 4, rewards: [lc(35), tickets(2), ap(650)], rarity: TaskRarity.SILVER },
    { target: 6, rewards: [lc(60), tickets(4), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 8, rewards: [lc(110), tickets(8), ap(1800)], rarity: TaskRarity.GOLD },
    { target: 10, rewards: [lc(180), tickets(13), ap(2800)], rarity: TaskRarity.GOLD },
    {
      target: 12,
      rewards: [lc(320), tickets(28), stars(60), ap(5500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  platinum: [
    { target: 1, rewards: [lc(25), ap(400)], rarity: TaskRarity.BRONZE },
    { target: 2, rewards: [lc(55), tickets(2), ap(800)], rarity: TaskRarity.SILVER },
    { target: 3, rewards: [lc(95), tickets(4), ap(1400)], rarity: TaskRarity.SILVER },
    { target: 4, rewards: [lc(170), tickets(8), ap(2200)], rarity: TaskRarity.GOLD },
    { target: 5, rewards: [lc(280), tickets(13), ap(3500)], rarity: TaskRarity.GOLD },
    {
      target: 6,
      rewards: [lc(500), tickets(28), stars(80), ap(7000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  diamond: [
    { target: 1, rewards: [lc(45), ap(550)], rarity: TaskRarity.BRONZE },
    { target: 2, rewards: [lc(100), tickets(2), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 3, rewards: [lc(180), tickets(5), ap(1900)], rarity: TaskRarity.SILVER },
    { target: 4, rewards: [lc(330), tickets(10), ap(3200)], rarity: TaskRarity.GOLD },
    {
      target: 5,
      rewards: [lc(700), tickets(25), stars(150), ap(8500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
};

const TIER_ENGINE_KEYS: Exclude<TierName, 'bronze'>[] = ['silver', 'gold', 'platinum', 'diamond'];

const buildTierEngineMilestones = (tier: TierName): TaskBlueprint[] => {
  const tierCap = tierLabel(tier);
  return ENGINE_MILESTONES_BY_TIER[tier].map(m => ({
    id: `engine-${tier}-collect-${m.target}`,
    title: `Own ${m.target} ${tierCap} engine${m.target === 1 ? '' : 's'}`,
    subtitle: `Collect ${tierCap}-tier engines from the market.`,
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/market',
    rarity: m.rarity,
    tier,
  }));
};

const ENGINES = buildCategory({
  category: TaskCategory.ENGINES,
  once: [
    // General slider == Bronze milestones (1 → 100).
    ...ENGINE_MILESTONES_BY_TIER.bronze.map(m => ({
      id: `engine-collect-${m.target}`,
      title: `Own ${m.target} engine${m.target === 1 ? '' : 's'}`,
      subtitle: 'Buy or earn engines from the market and rewards.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/market',
      rarity: m.rarity,
    })),
    ...TIER_ENGINE_KEYS.flatMap(buildTierEngineMilestones),
  ],
});

// ───────────────── STAKES ─────────────────
// Stakes are organized by 5 tier levels (L1=Bronze … L5=Diamond).
// Two milestone chains per tab: number of completed stake sessions + total LC volume staked.
type StakeMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };
type StakeTier = TierName;

const STAKE_COUNT_MILESTONES_BY_TIER: Record<StakeTier, StakeMilestone[]> = {
  bronze: [
    { target: 5, rewards: [lc(5), ap(200)], rarity: TaskRarity.BRONZE },
    { target: 10, rewards: [lc(12), tickets(2), ap(450)], rarity: TaskRarity.SILVER },
    { target: 15, rewards: [lc(20), tickets(3), ap(700)], rarity: TaskRarity.SILVER },
    { target: 20, rewards: [lc(35), tickets(5), ap(1000)], rarity: TaskRarity.GOLD },
    { target: 25, rewards: [lc(55), tickets(8), ap(1500)], rarity: TaskRarity.GOLD },
    {
      target: 30,
      rewards: [lc(100), tickets(15), stars(30), ap(2500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  silver: [
    { target: 3, rewards: [lc(8), ap(250)], rarity: TaskRarity.BRONZE },
    { target: 6, rewards: [lc(20), tickets(2), ap(550)], rarity: TaskRarity.SILVER },
    { target: 9, rewards: [lc(35), tickets(4), ap(900)], rarity: TaskRarity.SILVER },
    { target: 12, rewards: [lc(60), tickets(7), ap(1400)], rarity: TaskRarity.GOLD },
    { target: 15, rewards: [lc(95), tickets(11), ap(2200)], rarity: TaskRarity.GOLD },
    {
      target: 18,
      rewards: [lc(180), tickets(22), stars(45), ap(4000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  gold: [
    { target: 2, rewards: [lc(15), ap(300)], rarity: TaskRarity.BRONZE },
    { target: 4, rewards: [lc(35), tickets(2), ap(650)], rarity: TaskRarity.SILVER },
    { target: 6, rewards: [lc(60), tickets(4), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 8, rewards: [lc(110), tickets(8), ap(1800)], rarity: TaskRarity.GOLD },
    { target: 10, rewards: [lc(180), tickets(13), ap(2800)], rarity: TaskRarity.GOLD },
    {
      target: 12,
      rewards: [lc(320), tickets(28), stars(60), ap(5500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  platinum: [
    { target: 1, rewards: [lc(25), ap(400)], rarity: TaskRarity.BRONZE },
    { target: 2, rewards: [lc(55), tickets(2), ap(800)], rarity: TaskRarity.SILVER },
    { target: 3, rewards: [lc(95), tickets(4), ap(1400)], rarity: TaskRarity.SILVER },
    { target: 4, rewards: [lc(170), tickets(8), ap(2200)], rarity: TaskRarity.GOLD },
    { target: 5, rewards: [lc(280), tickets(13), ap(3500)], rarity: TaskRarity.GOLD },
    {
      target: 6,
      rewards: [lc(500), tickets(28), stars(80), ap(7000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  diamond: [
    { target: 1, rewards: [lc(45), ap(550)], rarity: TaskRarity.BRONZE },
    { target: 2, rewards: [lc(100), tickets(2), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 3, rewards: [lc(180), tickets(5), ap(1900)], rarity: TaskRarity.SILVER },
    { target: 4, rewards: [lc(330), tickets(10), ap(3200)], rarity: TaskRarity.GOLD },
    {
      target: 5,
      rewards: [lc(700), tickets(25), stars(150), ap(8500)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
};

const STAKE_VOLUME_MILESTONES_BY_TIER: Record<StakeTier, StakeMilestone[]> = {
  bronze: [
    { target: 100, rewards: [lc(2), ap(120)], rarity: TaskRarity.BRONZE },
    { target: 500, rewards: [lc(8), tickets(2), ap(300)], rarity: TaskRarity.SILVER },
    { target: 1000, rewards: [lc(18), tickets(3), ap(600)], rarity: TaskRarity.SILVER },
    { target: 5000, rewards: [lc(45), tickets(7), ap(1500)], rarity: TaskRarity.GOLD },
    { target: 10000, rewards: [lc(95), tickets(14), ap(3000)], rarity: TaskRarity.GOLD },
    {
      target: 25000,
      rewards: [lc(220), tickets(30), stars(40), ap(6000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  silver: [
    { target: 500, rewards: [lc(5), ap(180)], rarity: TaskRarity.BRONZE },
    { target: 1000, rewards: [lc(15), tickets(2), ap(400)], rarity: TaskRarity.SILVER },
    { target: 5000, rewards: [lc(45), tickets(5), ap(1200)], rarity: TaskRarity.SILVER },
    { target: 10000, rewards: [lc(95), tickets(10), ap(2400)], rarity: TaskRarity.GOLD },
    { target: 25000, rewards: [lc(220), tickets(22), ap(5000)], rarity: TaskRarity.GOLD },
    {
      target: 50000,
      rewards: [lc(500), tickets(50), stars(70), ap(10000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  gold: [
    { target: 1000, rewards: [lc(12), ap(250)], rarity: TaskRarity.BRONZE },
    { target: 5000, rewards: [lc(40), tickets(2), ap(700)], rarity: TaskRarity.SILVER },
    { target: 10000, rewards: [lc(85), tickets(5), ap(1500)], rarity: TaskRarity.SILVER },
    { target: 25000, rewards: [lc(200), tickets(12), ap(3500)], rarity: TaskRarity.GOLD },
    { target: 50000, rewards: [lc(440), tickets(25), ap(7000)], rarity: TaskRarity.GOLD },
    {
      target: 100000,
      rewards: [lc(950), tickets(55), stars(100), ap(13000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  platinum: [
    { target: 2500, rewards: [lc(25), ap(400)], rarity: TaskRarity.BRONZE },
    { target: 5000, rewards: [lc(55), tickets(2), ap(900)], rarity: TaskRarity.SILVER },
    { target: 10000, rewards: [lc(120), tickets(5), ap(1900)], rarity: TaskRarity.SILVER },
    { target: 25000, rewards: [lc(280), tickets(12), ap(4300)], rarity: TaskRarity.GOLD },
    { target: 50000, rewards: [lc(620), tickets(25), ap(8500)], rarity: TaskRarity.GOLD },
    {
      target: 100000,
      rewards: [lc(1400), tickets(55), stars(140), ap(16000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  diamond: [
    { target: 5000, rewards: [lc(40), ap(500)], rarity: TaskRarity.BRONZE },
    { target: 10000, rewards: [lc(95), tickets(2), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 25000, rewards: [lc(230), tickets(6), ap(2400)], rarity: TaskRarity.SILVER },
    { target: 50000, rewards: [lc(500), tickets(13), ap(5000)], rarity: TaskRarity.GOLD },
    { target: 100000, rewards: [lc(1100), tickets(28), ap(10000)], rarity: TaskRarity.GOLD },
    {
      target: 250000,
      rewards: [lc(2700), tickets(70), stars(220), ap(20000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
};

const STAKE_TIER_KEYS: Exclude<StakeTier, 'bronze'>[] = ['silver', 'gold', 'platinum', 'diamond'];

const buildTierStakeCount = (tier: StakeTier): TaskBlueprint[] => {
  const tierCap = tierLabel(tier);
  return STAKE_COUNT_MILESTONES_BY_TIER[tier].map(m => ({
    id: `stake-${tier}-count-${m.target}`,
    title: `Complete ${m.target} ${tierCap} stake${m.target === 1 ? '' : 's'}`,
    subtitle: `Hold ${tierCap}-tier stakes to completion.`,
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/stakes',
    rarity: m.rarity,
    tier,
  }));
};

const buildTierStakeVolume = (tier: StakeTier): TaskBlueprint[] => {
  const tierCap = tierLabel(tier);
  return STAKE_VOLUME_MILESTONES_BY_TIER[tier].map(m => ({
    id: `stake-${tier}-volume-${m.target}`,
    title: `Stake ${m.target} LC at ${tierCap}`,
    subtitle: `Total LC volume staked at ${tierCap} tier.`,
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/stakes',
    rarity: m.rarity,
    tier,
  }));
};

const STAKES = buildCategory({
  category: TaskCategory.STAKES,
  once: [
    // General == Bronze chains.
    ...STAKE_COUNT_MILESTONES_BY_TIER.bronze.map(m => ({
      id: `stake-count-${m.target}`,
      title: `Complete ${m.target} stake${m.target === 1 ? '' : 's'}`,
      subtitle: 'Hold stake sessions to full completion.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/stakes',
      rarity: m.rarity,
    })),
    ...STAKE_VOLUME_MILESTONES_BY_TIER.bronze.map(m => ({
      id: `stake-volume-${m.target}`,
      title: `Stake ${m.target} LC total`,
      subtitle: 'Cumulative LC volume across all stakes.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/stakes',
      rarity: m.rarity,
    })),
    ...STAKE_TIER_KEYS.flatMap(buildTierStakeCount),
    ...STAKE_TIER_KEYS.flatMap(buildTierStakeVolume),
  ],
});

// ───────────────── (PREMIUM tasks moved into PROFILE_STATUS below) ─────────────────

// ───────────────── STARS (Telegram Stars spend / earn) ─────────────────
// Stars are a flat currency without tiers — two milestone chains: spend + earn.
type StarMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const STAR_PURCHASE_MILESTONES: StarMilestone[] = [
  { target: 100, rewards: [lc(8), ap(300)], rarity: TaskRarity.BRONZE },
  { target: 250, rewards: [lc(18), tickets(2), ap(600)], rarity: TaskRarity.SILVER },
  { target: 500, rewards: [lc(40), tickets(4), ap(1200)], rarity: TaskRarity.SILVER },
  { target: 1000, rewards: [lc(85), tickets(8), ap(2500)], rarity: TaskRarity.GOLD },
  { target: 2500, rewards: [lc(200), tickets(18), ap(5500)], rarity: TaskRarity.GOLD },
  {
    target: 5000,
    rewards: [lc(450), tickets(40), stars(60), ap(11000)],
    rarity: TaskRarity.PLATINUM,
  },
];

const STAR_EARN_MILESTONES: StarMilestone[] = [
  { target: 10, rewards: [lc(2), ap(150)], rarity: TaskRarity.BRONZE },
  { target: 50, rewards: [lc(7), tickets(2), ap(400)], rarity: TaskRarity.SILVER },
  { target: 100, rewards: [lc(16), tickets(3), ap(800)], rarity: TaskRarity.SILVER },
  { target: 500, rewards: [lc(50), tickets(8), ap(2200)], rarity: TaskRarity.GOLD },
  { target: 1000, rewards: [lc(110), tickets(16), ap(4500)], rarity: TaskRarity.GOLD },
  {
    target: 5000,
    rewards: [lc(350), tickets(45), stars(60), ap(11000)],
    rarity: TaskRarity.PLATINUM,
  },
];

const STARS = buildCategory({
  category: TaskCategory.STARS,
  once: [
    ...STAR_PURCHASE_MILESTONES.map(m => ({
      id: `star-purchase-${m.target}`,
      title: `Purchase ${m.target} Stars`,
      subtitle: 'Buy Stars via Telegram to top up your balance.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      rarity: m.rarity,
    })),
    ...STAR_EARN_MILESTONES.map(m => ({
      id: `star-earn-${m.target}`,
      title: `Earn ${m.target} Stars`,
      subtitle: 'Receive Stars from rewards, gifts, and stake bonuses.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      rarity: m.rarity,
    })),
  ],
});

// ───────────────── TICKETS (earn / collect tickets) ─────────────────
// Milestone chains — drive the "Collect N tickets" horizontal sliders.
// Bronze (also shown as the General slider) starts at 1000; each higher tier
// divides the entry-point roughly in half because higher-tier tickets are
// rarer to obtain.
type TicketMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const TICKET_MILESTONES_BY_TIER: Record<TierName, TicketMilestone[]> = {
  bronze: [
    { target: 1000, rewards: [lc(5), ap(200)], rarity: TaskRarity.BRONZE },
    { target: 2500, rewards: [lc(10), tickets(2), ap(500)], rarity: TaskRarity.SILVER },
    { target: 5000, rewards: [lc(20), tickets(4), ap(1000)], rarity: TaskRarity.SILVER },
    { target: 10000, rewards: [lc(40), tickets(8), ap(2000)], rarity: TaskRarity.GOLD },
    { target: 25000, rewards: [lc(100), tickets(15), ap(5000)], rarity: TaskRarity.GOLD },
    {
      target: 50000,
      rewards: [lc(250), tickets(40), stars(50), ap(10000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  silver: [
    { target: 500, rewards: [lc(8), ap(250)], rarity: TaskRarity.BRONZE },
    { target: 1000, rewards: [lc(16), tickets(2), ap(600)], rarity: TaskRarity.SILVER },
    { target: 2500, rewards: [lc(35), tickets(5), ap(1300)], rarity: TaskRarity.SILVER },
    { target: 5000, rewards: [lc(70), tickets(10), ap(2600)], rarity: TaskRarity.GOLD },
    { target: 10000, rewards: [lc(160), tickets(20), ap(6000)], rarity: TaskRarity.GOLD },
    {
      target: 25000,
      rewards: [lc(400), tickets(50), stars(60), ap(12000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  gold: [
    { target: 250, rewards: [lc(12), ap(300)], rarity: TaskRarity.BRONZE },
    { target: 500, rewards: [lc(25), tickets(2), ap(700)], rarity: TaskRarity.SILVER },
    { target: 1000, rewards: [lc(55), tickets(5), ap(1500)], rarity: TaskRarity.SILVER },
    { target: 2500, rewards: [lc(120), tickets(12), ap(3000)], rarity: TaskRarity.GOLD },
    { target: 5000, rewards: [lc(260), tickets(25), ap(7000)], rarity: TaskRarity.GOLD },
    {
      target: 10000,
      rewards: [lc(650), tickets(60), stars(80), ap(15000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  platinum: [
    { target: 100, rewards: [lc(20), ap(400)], rarity: TaskRarity.BRONZE },
    { target: 250, rewards: [lc(45), tickets(2), ap(900)], rarity: TaskRarity.SILVER },
    { target: 500, rewards: [lc(95), tickets(5), ap(1900)], rarity: TaskRarity.SILVER },
    { target: 1000, rewards: [lc(220), tickets(12), ap(4000)], rarity: TaskRarity.GOLD },
    { target: 2500, rewards: [lc(500), tickets(30), ap(9000)], rarity: TaskRarity.GOLD },
    {
      target: 5000,
      rewards: [lc(1200), tickets(80), stars(120), ap(20000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
  diamond: [
    { target: 50, rewards: [lc(35), ap(500)], rarity: TaskRarity.BRONZE },
    { target: 100, rewards: [lc(80), tickets(2), ap(1100)], rarity: TaskRarity.SILVER },
    { target: 250, rewards: [lc(180), tickets(5), ap(2400)], rarity: TaskRarity.SILVER },
    { target: 500, rewards: [lc(420), tickets(12), ap(5200)], rarity: TaskRarity.GOLD },
    { target: 1000, rewards: [lc(950), tickets(30), ap(12000)], rarity: TaskRarity.GOLD },
    {
      target: 2500,
      rewards: [lc(2500), tickets(100), stars(200), ap(28000)],
      rarity: TaskRarity.PLATINUM,
    },
  ],
};

// Tier-specific ticket sliders (Silver, Gold, Platinum, Diamond — Bronze is the General slider).
const TIER_TICKET_KEYS: Exclude<TierName, 'bronze'>[] = ['silver', 'gold', 'platinum', 'diamond'];

const buildTierTicketMilestones = (tier: TierName): TaskBlueprint[] => {
  const tierCap = tierLabel(tier);
  return TICKET_MILESTONES_BY_TIER[tier].map(m => ({
    id: `ticket-${tier}-collect-${m.target}`,
    title: `Collect ${m.target} ${tierCap} tickets`,
    subtitle: `Earn ${tierCap}-tier tickets from tournaments and rewards.`,
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    rarity: m.rarity,
    tier,
  }));
};

const TICKETS = buildCategory({
  category: TaskCategory.TICKETS,
  once: [
    // General slider == Bronze milestones (1000 → 50000).
    ...TICKET_MILESTONES_BY_TIER.bronze.map(m => ({
      id: `ticket-collect-${m.target}`,
      title: `Collect ${m.target} tickets`,
      subtitle: 'Earn through tournaments, friends, ads, or rewards.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      rarity: m.rarity,
    })),
    ...TIER_TICKET_KEYS.flatMap(buildTierTicketMilestones),
  ],
});

// ───────────────── PROFILE STATUS ─────────────────
// 10-level VIP ladder driven by lifetime Activity Points + a single
// "Buy Lucky Player" row. The user's current AP is mocked at USER_AP — anything below it is
// COMPLETED, the next-target level is IN_PROGRESS, the rest are LOCKED.
interface VipLevelConfig {
  level: number;
  target: number;
  rewards: TaskReward[];
  rarity: TaskRarity;
}

const VIP_LEVELS: VipLevelConfig[] = [
  { level: 1, target: 100, rewards: [ap(50)], rarity: TaskRarity.BRONZE },
  { level: 2, target: 500, rewards: [lc(5), tickets(1), ap(120)], rarity: TaskRarity.SILVER },
  { level: 3, target: 2000, rewards: [lc(15), tickets(2), ap(300)], rarity: TaskRarity.SILVER },
  { level: 4, target: 5000, rewards: [lc(30), tickets(3), ap(600)], rarity: TaskRarity.GOLD },
  {
    level: 5,
    target: 10000,
    rewards: [lc(50), tickets(5), stars(20), ap(1200)],
    rarity: TaskRarity.GOLD,
  },
  {
    level: 6,
    target: 25000,
    rewards: [lc(100), tickets(10), stars(30), ap(2500)],
    rarity: TaskRarity.GOLD,
  },
  {
    level: 7,
    target: 50000,
    rewards: [lc(200), tickets(20), stars(50), ap(5000)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 8,
    target: 100000,
    rewards: [lc(400), tickets(35), stars(80), ap(10000)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 9,
    target: 250000,
    rewards: [lc(800), tickets(60), stars(150), ap(20000)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 10,
    target: 500000,
    rewards: [lc(2000), tickets(120), stars(300), ap(40000)],
    rarity: TaskRarity.PLATINUM,
  },
];

// Mock the user's current lifetime Activity Points so the slider has a
// realistic split between completed / in-progress / locked levels.
const USER_AP = 4500;

const PROFILE_STATUS = buildCategory({
  category: TaskCategory.PROFILE_STATUS,
  once: [
    // VIP level milestones — drive the "Level up VIP" horizontal slider.
    // The card shows the level number itself (1-10); the AP threshold lives
    // in the subtitle so the slider headline stays simple and incremental.
    ...VIP_LEVELS.map((cfg, idx) => {
      const prevTarget = VIP_LEVELS[idx - 1]?.target ?? 0;
      const reached = USER_AP >= cfg.target;
      const isCurrent = !reached && USER_AP >= prevTarget;
      const status = reached ? TaskStatus.COMPLETED : isCurrent ? undefined : TaskStatus.LOCKED;
      return {
        id: `vip-level-${cfg.level}`,
        title: `Reach VIP Level ${cfg.level}`,
        subtitle: `${cfg.target.toLocaleString()} AP required`,
        rewards: cfg.rewards,
        rarity: cfg.rarity,
        progress: {
          current: reached ? cfg.level : 0,
          target: cfg.level,
        },
        status,
        unlockHint: !reached && !isCurrent ? `Reach VIP Level ${cfg.level - 1} first.` : undefined,
      };
    }),
    // Single row — buy Lucky Player subscription
    {
      id: 'profile-buy-lucky-player',
      title: 'Buy Lucky Player subscription',
      subtitle: 'Unlock Lucky Player perks with LC or crypto.',
      rewards: [lc(10), tickets(2), ap(500)],
      progress: { current: 0, target: 1 },
      deeplink: '/market',
      rarity: TaskRarity.GOLD,
    },
  ],
});

// ───────────────── ACHIEVEMENTS ─────────────────
// DOCS-aligned badges. Every entry maps to a real mechanic from DOCS.md
// (engines, instant claim, statuses, stakes, referrals, wallet, quest, etc.)
// and avoids duplicating the count milestones already covered by the
// other category sliders.
const ACHIEVEMENTS = buildCategory({
  category: TaskCategory.ACHIEVEMENTS,
  once: [
    // ─── First steps (onboarding, all completed) ───
    {
      title: 'First claim',
      subtitle: 'Claim tickets from your starter Bronze engine.',
      rewards: [lc(1), ap(50)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      title: 'First tournament',
      subtitle: 'Join your first tournament.',
      rewards: [lc(1), ap(50)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      title: 'First win',
      subtitle: 'Get drawn as a tournament winner.',
      rewards: [lc(2), ap(80)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      title: 'First stake',
      subtitle: 'Complete your first stake session.',
      rewards: [lc(2), ap(80)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      title: 'First friend',
      subtitle: 'Invite your first friend.',
      rewards: [lc(1), ap(50)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },

    // ─── Engine progression (DOCS §8.5, §9 — tier unlocks + multiple engines) ───
    {
      title: 'Unlock Silver engine',
      subtitle: 'Meet the Silver engine unlock requirements.',
      rewards: [lc(8), tickets(2), ap(400)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Unlock Gold engine',
      subtitle: 'Meet the Gold engine unlock requirements.',
      rewards: [lc(20), tickets(4), ap(900)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Unlock Diamond engine',
      subtitle: 'Meet the Diamond engine unlock requirements.',
      rewards: [lc(60), tickets(10), stars(20)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      title: 'Unlock Platinum engine',
      subtitle: 'Meet the Platinum engine unlock requirements.',
      rewards: [lc(100), tickets(15), stars(40)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      title: 'Parallel producer',
      subtitle: 'Run 5+ engines of the same tier in parallel.',
      rewards: [lc(15), tickets(3), ap(700)],
      progress: { current: 3, target: 5 },
      rarity: TaskRarity.SILVER,
    },

    // ─── Boosts & instant claim (DOCS §9.6, §10) ───
    {
      title: 'First Speed Boost',
      subtitle: 'Apply an Engine Speed Boost from the Market.',
      rewards: [lc(5), tickets(1), ap(250)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.READY_TO_CLAIM,
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Capacity Upgrade',
      subtitle: 'Buy your first Capacity Upgrade with Stars.',
      rewards: [lc(10), tickets(2), ap(500)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Stack Boosts',
      subtitle: 'Run a Speed Boost + Capacity Upgrade on the same engine.',
      rewards: [lc(15), tickets(3), stars(10)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'First Instant Claim',
      subtitle: 'Skip a cycle with Instant Claim (Stars).',
      rewards: [lc(5), tickets(1), ap(250)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Instant Claim x10',
      subtitle: 'Use Instant Claim 10 times across any engines.',
      rewards: [lc(20), tickets(4), ap(900)],
      progress: { current: 0, target: 10 },
      rarity: TaskRarity.GOLD,
    },

    // ─── Tournaments (DOCS §11 — random draw, ticket-tier specific) ───
    {
      title: 'Project tournament win',
      subtitle: 'Win a Main Project tournament draw.',
      rewards: [lc(8), tickets(2), ap(400)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Partner tournament win',
      subtitle: 'Win a Partner tournament using a partner ticket.',
      rewards: [lc(15), tickets(3), ap(700)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'All-tier winner',
      subtitle: 'Win a tournament in each of the 5 ticket tiers.',
      rewards: [lc(40), tickets(8), ap(1500)],
      progress: { current: 3, target: 5 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Diamond winner',
      subtitle: 'Win a tournament that required a Diamond ticket.',
      rewards: [lc(50), tickets(8), stars(20)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      title: 'Platinum winner',
      subtitle: 'Win a tournament that required a Platinum ticket.',
      rewards: [lc(80), tickets(12), stars(30)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      title: 'Heavy entry',
      subtitle: 'Submit 10 tickets to a single tournament.',
      rewards: [lc(8), tickets(2), ap(400)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },

    // ─── Activity Points (DOCS §5 — drives leaderboard + VIP) ───
    {
      title: '10K AP',
      subtitle: 'Reach 10,000 lifetime Activity Points.',
      rewards: [lc(8), tickets(2), ap(0)],
      progress: { current: 4500, target: 10000 },
      rarity: TaskRarity.SILVER,
    },
    {
      title: '100K AP',
      subtitle: 'Reach 100,000 lifetime Activity Points.',
      rewards: [lc(40), tickets(8), ap(0)],
      progress: { current: 4500, target: 100000 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: '1M AP',
      subtitle: 'Reach 1,000,000 lifetime Activity Points.',
      rewards: [lc(250), tickets(35), stars(80)],
      progress: { current: 4500, target: 1000000 },
      rarity: TaskRarity.PLATINUM,
    },

    // ─── Statuses (DOCS §7) ───
    {
      title: 'Verified',
      subtitle: 'Verify your account.',
      rewards: [lc(2), ap(100)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'Lucky Player subscription',
      subtitle: 'Activate Lucky Player subscription (LC or crypto).',
      rewards: [lc(20), tickets(4), ap(1000)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'VIP unlocked',
      subtitle: 'Unlock VIP status for the first time.',
      rewards: [lc(40), tickets(8), stars(15)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },

    // ─── Stakes (DOCS §18) — only DOCS-defined behaviour ───
    {
      title: 'Diamond Staker',
      subtitle: 'Complete a Diamond-level (L5) stake.',
      rewards: [lc(50), tickets(10), stars(20)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Stars draw winner',
      subtitle: 'Win Stars from a stake bonus draw.',
      rewards: [lc(15), tickets(3), stars(10)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'No Cancel month',
      subtitle: 'Complete every stake you start for 30 days straight.',
      rewards: [lc(40), tickets(8), ap(1500)],
      progress: { current: 0, target: 30 },
      rarity: TaskRarity.GOLD,
    },

    // ─── Referrals (DOCS §17.2 — 10/20% commission, Premium friends) ───
    {
      title: 'Premium friend',
      subtitle: 'Invite a Telegram Premium friend (20% commission).',
      rewards: [lc(15), tickets(3), stars(10)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Referral claimer',
      subtitle: 'Claim 100 referred tickets total.',
      rewards: [lc(20), tickets(4), ap(900)],
      progress: { current: 12, target: 100 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Verified referrals',
      subtitle: 'Have 3 invited friends reach Verified status.',
      rewards: [lc(30), tickets(6), ap(1200)],
      progress: { current: 0, target: 3 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'VIP referral',
      subtitle: 'Have an invited friend reach VIP status.',
      rewards: [lc(60), tickets(10), stars(25)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },

    // ─── Wallet (DOCS §15) ───
    {
      title: 'Wallet linked',
      subtitle: 'Connect an external crypto wallet.',
      rewards: [lc(5), tickets(1), ap(250)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.READY_TO_CLAIM,
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'First deposit',
      subtitle: 'Deposit USD or TON for LC.',
      rewards: [lc(10), tickets(2), ap(500)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    {
      title: 'First withdrawal',
      subtitle: 'Withdraw LC as USD or TON.',
      rewards: [lc(15), tickets(3), ap(700)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Stars → LC swap',
      subtitle: 'Swap Telegram Stars to Lucky Coins.',
      rewards: [lc(5), tickets(1), ap(300)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },

    // ─── Quest & cross-system (DOCS §12.4 all-tasks bonus, Quest chain) ───
    {
      title: 'Quest Master',
      subtitle: 'Complete the entire Quest chain.',
      rewards: [lc(100), tickets(20), stars(50)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      title: 'Daily completionist',
      subtitle: 'Claim the all-daily-tasks bonus 7 days in a row.',
      rewards: [lc(20), tickets(5), ap(1000)],
      progress: { current: 2, target: 7 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Weekly completionist',
      subtitle: 'Claim the all-weekly-tasks bonus 4 weeks in a row.',
      rewards: [lc(40), tickets(8), ap(1800)],
      progress: { current: 0, target: 4 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: 'Ad Maxer',
      subtitle: 'Watch all 10 daily ads on 7 different days.',
      rewards: [lc(25), tickets(5), ap(1200)],
      progress: { current: 2, target: 7 },
      rarity: TaskRarity.GOLD,
    },

    // ─── Loyalty (streaks) ───
    {
      title: '7-day streak',
      subtitle: 'Maintain a 7-day login streak.',
      rewards: [lc(5), tickets(2), ap(300)],
      progress: { current: 7, target: 7 },
      status: TaskStatus.READY_TO_CLAIM,
      rarity: TaskRarity.SILVER,
    },
    {
      title: '30-day streak',
      subtitle: 'Maintain a 30-day login streak.',
      rewards: [lc(25), tickets(5), stars(10)],
      progress: { current: 5, target: 30 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: '90-day streak',
      subtitle: 'Maintain a 90-day login streak.',
      rewards: [lc(80), tickets(15), stars(30)],
      progress: { current: 5, target: 90 },
      rarity: TaskRarity.GOLD,
    },
    {
      title: '365-day streak',
      subtitle: 'Maintain a 365-day login streak.',
      rewards: [lc(400), tickets(60), stars(150)],
      progress: { current: 5, target: 365 },
      rarity: TaskRarity.PLATINUM,
    },

    // ─── Localization (DOCS §3) ───
    {
      title: 'Polyglot',
      subtitle: 'Use the app in 3 different languages.',
      rewards: [lc(6), tickets(2), ap(300)],
      progress: { current: 1, target: 3 },
      rarity: TaskRarity.SILVER,
    },

    // ─── Capstone ───
    {
      title: 'Reach Diamond',
      subtitle: 'Climb to Diamond tier — the top of the ladder.',
      rewards: [lc(250), tickets(35), stars(80), ap(8000)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
  ],
});

// ───────────────── PARTNERS ─────────────────
const PARTNER_TASKS = [
  {
    title: 'Try Hamster Kombat',
    subtitle: 'Cross-promo from our partner.',
    rewards: [lc(2), ap(50)],
    url: 'https://t.me/hamster_kombat_bot',
    rarity: TaskRarity.SILVER,
  },
  {
    title: 'Spin partner wheel on Notcoin',
    rewards: [lc(2), ap(50)],
    url: 'https://t.me/notcoin_bot',
    rarity: TaskRarity.SILVER,
  },
  {
    title: 'Connect a partner exchange account',
    rewards: [lc(10), tickets(2)],
    rarity: TaskRarity.GOLD,
  },
] as const;

const PARTNERS = buildCategory({
  category: TaskCategory.PARTNERS,
  once: PARTNER_TASKS.map(p => ({
    title: p.title,
    subtitle: 'subtitle' in p ? p.subtitle : undefined,
    rewards: [...p.rewards],
    progress: { current: 0, target: 1 },
    externalLink: 'url' in p ? p.url : undefined,
    rarity: p.rarity,
  })),
});

// Streak — single source of truth. `reached` derived from currentDays.
const STREAK_CURRENT_DAYS = 5;
const STREAK_BEST_DAYS = 14;
const STREAK_MILESTONES: { day: number; reward: TaskReward }[] = [
  { day: 7, reward: lc(2) },
  { day: 14, reward: lc(5) },
  { day: 21, reward: lc(10) },
  { day: 30, reward: tickets(2) },
  { day: 60, reward: lc(50) },
  { day: 100, reward: stars(50) },
];

const STREAK: StreakInfo = {
  currentDays: STREAK_CURRENT_DAYS,
  bestDays: STREAK_BEST_DAYS,
  nextMilestoneDay:
    STREAK_MILESTONES.find(m => m.day > STREAK_CURRENT_DAYS)?.day ?? STREAK_CURRENT_DAYS,
  upcomingMilestones: STREAK_MILESTONES.map(m => ({
    ...m,
    reached: STREAK_CURRENT_DAYS >= m.day,
  })),
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
  ADS,
  TOURNAMENTS,
  LEADERBOARD,
  SOCIAL,
  PROFILE,
  FRIENDS,
  ENGINES,
  TICKETS,
  STAKES,
  STARS,
  PROFILE_STATUS,
  ACHIEVEMENTS,
  PARTNERS,
];

const PROCESSED_CATEGORIES = CATEGORIES.map(applyTierLockToCategory).map(normalizeCategoryAp);

// ============================================================
// MOCK BACKEND STATE — simulates real server behavior so frontend
// can rely on `refetch()` after mutations instead of optimistic
// hacks. When the real backend ships, delete this whole block.
// ============================================================
const mockState = {
  claimedTaskIds: new Set<string>(),
  claimedSubStepIds: new Set<string>(),
  watchedAdIds: new Set<string>(),
  balance: { lc: 12_345_000, tickets: 12, activityPoints: 4500 },
};

const applyMockState = (task: Task): Task => {
  const taskClaimed = mockState.claimedTaskIds.has(task.id);
  const hasClaimedSub = task.subSteps?.some(s => mockState.claimedSubStepIds.has(s.id));
  if (!taskClaimed && !hasClaimedSub) return task;

  if (taskClaimed) {
    return {
      ...task,
      status: TaskStatus.COMPLETED,
      progress: { current: task.progress.target, target: task.progress.target },
      subSteps: task.subSteps?.map(s => ({ ...s, completed: true, claimed: true })),
    };
  }
  return {
    ...task,
    subSteps: task.subSteps?.map(s =>
      mockState.claimedSubStepIds.has(s.id) ? { ...s, claimed: true } : s
    ),
  };
};

const buildLiveAds = (): AdsBlock => {
  const base = buildAds();
  const slots = base.slots.map(s => ({
    ...s,
    watched: s.watched || mockState.watchedAdIds.has(s.id),
  }));
  return {
    ...base,
    watchedToday: slots.filter(s => s.watched).length,
    slots,
  };
};

const buildTasksResponse = (): TasksResponse => {
  const liveCategories = PROCESSED_CATEGORIES.map(c => ({
    ...c,
    daily: c.daily.map(applyMockState),
    weekly: c.weekly.map(applyMockState),
    once: c.once.map(applyMockState),
  }));
  return {
    streak: STREAK,
    dailyProgress: computeDailyProgress(liveCategories),
    ads: buildLiveAds(),
    quest: QUEST,
    categories: liveCategories,
  };
};

const claimTaskHandler = (args: { body?: { id?: string; subStepIds?: string[] } }) => {
  const id = args.body?.id ?? '';
  const subStepIds = args.body?.subStepIds ?? [];
  const allTasks = PROCESSED_CATEGORIES.flatMap(c => [...c.daily, ...c.weekly, ...c.once]);
  const found = allTasks.find(t => t.id === id);
  let rewards: TaskReward[] = found?.rewards ?? [];
  const allSubSteps = allTasks.flatMap(t => t.subSteps ?? []);

  if (!found) {
    const sub = allSubSteps.find(s => s.id === id);
    if (sub?.reward) {
      rewards = [sub.reward];
      mockState.claimedSubStepIds.add(id);
    }
  } else {
    mockState.claimedTaskIds.add(id);
  }

  if (subStepIds.length) {
    const bundled = subStepIds
      .map(sid => allSubSteps.find(s => s.id === sid))
      .filter(s => s?.reward)
      .map(s => s!.reward!);
    rewards = [...rewards, ...bundled];
    subStepIds.forEach(sid => mockState.claimedSubStepIds.add(sid));
  }
  if (!rewards.length) rewards = [lc(1)];

  const lcDelta = rewards
    .filter(r => r.type === TaskRewardType.LC)
    .reduce((s, r) => s + r.amount, 0);
  const ticketsDelta = rewards
    .filter(r => r.type === TaskRewardType.TICKETS)
    .reduce((s, r) => s + r.amount, 0);
  const apDelta = rewards
    .filter(r => r.type === TaskRewardType.ACTIVITY_POINTS)
    .reduce((s, r) => s + r.amount, 0);

  mockState.balance.lc += lcDelta;
  mockState.balance.tickets += ticketsDelta;
  mockState.balance.activityPoints += apDelta;

  const response: ClaimTaskResponse = {
    id,
    rewards,
    newBalance: { ...mockState.balance },
  };
  return response;
};

export const tasksMock = {
  // Lazy: each `getTasks` call rebuilds response so post-claim refetch
  // sees mutated state (matches real backend behaviour).
  tasks: () => buildTasksResponse(),
  'POST tasks/claim': claimTaskHandler,
  'POST tasks/ads/watch': (args: { body?: { adId?: string } }) => {
    const adId = args.body?.adId ?? '';
    const slot = buildAds().slots.find(s => s.id === adId);
    if (adId) mockState.watchedAdIds.add(adId);
    const rewards = slot?.rewards ?? [ap(5)];
    rewards.forEach(r => {
      if (r.type === TaskRewardType.LC) mockState.balance.lc += r.amount;
      if (r.type === TaskRewardType.TICKETS) mockState.balance.tickets += r.amount;
      if (r.type === TaskRewardType.ACTIVITY_POINTS) mockState.balance.activityPoints += r.amount;
    });
    return { adId, rewards };
  },
};

export type TasksMock = typeof tasksMock;

const _ = DAY_MS;
void _;
