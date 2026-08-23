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
import { type TierName, TIER_RANK, tierLabel } from '@/types/types/tier.types';
import { chargeMockUser, creditMockUser } from '@/mock/backend/charge';
import { LcTransactionType } from '@/types/enums/lc.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { appConfig } from '@/config/app.config';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const inHours = (h: number) => new Date(Date.now() + h * HOUR_MS).toISOString();

// Real period boundaries, mirroring the backend: daily tasks reset at the
// next UTC midnight, weekly tasks at the next Monday 00:00 UTC.
const nextUtcMidnight = (): string => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
  ).toISOString();
};

const nextWeekStartUtc = (): string => {
  const now = new Date();
  const midnight = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const daysSinceMonday = (new Date(midnight).getUTCDay() + 6) % 7;
  return new Date(midnight + (7 - daysSinceMonday) * DAY_MS).toISOString();
};

// LC rewards are authored in design units; the ×1000 LC denomination scale (DOCS §6.1) is applied here.
const lc = (amount: number): TaskReward => ({ type: TaskRewardType.LC, amount: amount * 100 });
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
const fresh = appConfig.account.fresh;

// A level-zero account is Bronze tier (0 AP) — higher-tier tasks lock; the full
// demo keeps Platinum access. (Nothing deleted — both branches kept.)
const USER_TIER: TierName = fresh ? 'bronze' : 'platinum';

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

  // Sub-steps are a progress checklist and pay nothing — a task pays the AP
  // printed on its card, once. Each step used to grant a flat 1 AP on top,
  // which no rate documented and no baseline counted: the "+1 AP" on the
  // 4-tournament card was really +5.
  const subSteps = task.subSteps.map(step => {
    const { reward: _dropped, ...rest } = step;
    void _dropped;
    return { ...rest, claimed: rest.completed, claimable: false };
  });
  return { ...task, rewards, subSteps };
};

const normalizeCategoryAp = (cat: CategoryTasks): CategoryTasks => ({
  ...cat,
  daily: cat.daily.map(normalizeTaskAp),
  weekly: cat.weekly.map(normalizeTaskAp),
});

// Sub-steps are numbered `n / total`, mirroring the backend's `stepLabel`.
// They used to be named brackets ('Morning Bronze · 06:00') and weekdays
// ('Mon'), which no data backs: a step is completed by "counter reached n",
// nothing ties step #4 to the night bracket or to Sunday — and all four daily
// Bronze brackets are open at the same time, so entering them in one sitting
// lit up 'Night Bronze · 00:00' at breakfast. Digits also need no translation;
// `label` is a bare string in the FE contract, so those English names used to
// reach RU/DE players untranslated.
/**
 * A progress checklist, not a reward ladder — `claimable: false`, no reward.
 * The `apPerStep` argument is gone with the AP it used to pay; the tier configs
 * that fed it keep the field only so the fixture reads like the old one did.
 */
const buildSubSteps = (_prefix: string, count: number, completedCount: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: nextId('ss'),
    label: `${i + 1} / ${count}`,
    completed: i < completedCount,
    claimed: i < completedCount,
    claimable: false,
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
// `category` and `frequency` on every task; the real period boundary
// (UTC midnight / next Monday) is auto-applied per frequency. Pass
// `Task` directly (already-built) to opt out of the wrapper for
// special cases (e.g. tier-bound).
// ============================================================
type TaskBlueprint = Omit<Partial<Task>, 'category' | 'frequency'>;

interface CategoryBlueprint {
  category: TaskCategory;
  daily?: (TaskBlueprint | Task)[];
  weekly?: (TaskBlueprint | Task)[];
  once?: (TaskBlueprint | Task)[];
}

const isBuiltTask = (t: TaskBlueprint | Task): t is Task =>
  typeof (t as Task).id === 'string' && typeof (t as Task).category === 'string';

const defaultResetAt = (frequency: TaskFrequency): string | undefined => {
  if (frequency === TaskFrequency.DAILY) return nextUtcMidnight();
  if (frequency === TaskFrequency.WEEKLY) return nextWeekStartUtc();
  return undefined;
};

const buildCategory = (bp: CategoryBlueprint): CategoryTasks => {
  const stamp = (items: (TaskBlueprint | Task)[] | undefined, frequency: TaskFrequency): Task[] =>
    (items ?? []).map(item => {
      if (isBuiltTask(item)) return item;
      return baseTask({
        category: bp.category,
        frequency,
        resetAt: item.resetAt ?? defaultResetAt(frequency),
        ...item,
      });
    });

  return {
    category: bp.category,
    daily: stamp(bp.daily, TaskFrequency.DAILY),
    weekly: stamp(bp.weekly, TaskFrequency.WEEKLY),
    once: stamp(bp.once, TaskFrequency.ONCE),
  };
};

// ───────────────── ADS ─────────────────
// Single source of truth for the ads block. The reward ladder is indexed by
// view number and CYCLES, exactly like the backend does it
// (`adViewDef`: `ladder[viewIndex % ladder.length]`) — the mock used to match by
// upper bound instead, which no admin config can express.
interface AdsConfig {
  total: number;
  watchedToday: number;
  /** Entry N is view N (0-based); the list repeats once it runs out. */
  rewardLadder: TaskReward[][];
}

const flatAdReward: TaskReward[] = [ap(GlobalConstants.apRewards.watchVideo)];

/**
 * LC exactly as the admin stores it. The `lc()` helper above authors rewards in
 * design units and scales them, which is right for tasks but wrong here: the ad
 * ladder is typed into the admin panel in whole LC and must be copied verbatim.
 */
const rawLc = (amount: number): TaskReward => ({ type: TaskRewardType.LC, amount });

/**
 * The daily ads task asks for the whole free round, not a slice of it — same
 * number as the catalog's `task-daily-ads` (backend `milestones.data.ts`). Kept
 * next to the cap it mirrors: the two drifting apart is a card that completes
 * with views still left in the block, or one that can never complete at all.
 */
const DAILY_ADS_TARGET = 10;

const ADS_CONFIG: AdsConfig = {
  // The demo account's cap, and deliberately LARGER than its ten skips: on the
  // live economy a Lucky Player who is also VIP 2 gets twelve views a day and
  // ten skips, so the allowance runs out two views before the day does. With
  // both set to ten, dev never reached that boundary — and the boundary is
  // exactly where the 21.08.2026 production bug lived.
  total: 12,
  watchedToday: 3,
  // Copy of the live ladder (admin → Реклама → Награды, read 06.08.2026), so
  // dev shows what a player actually sees instead of an invented ramp. A
  // backend with an empty `adRewardsConfig` pays flat AP for every view —
  // replace the whole list with `[flatAdReward]` to see that state.
  rewardLadder: [
    [ap(1)],
    [ap(1), rawLc(100)],
    [ap(2)],
    [ap(2), rawLc(150)],
    [ap(2), stars(1)],
    [ap(2), rawLc(200)],
    [ap(2)],
    [ap(2), rawLc(250)],
    [ap(3), rawLc(300)],
    [ap(3), stars(1), { ...tickets(1), label: 'bronze' }],
  ],
};

/** `index` is 0-based, the way the backend numbers slots. */
const getAdRewards = (index: number): TaskReward[] =>
  ADS_CONFIG.rewardLadder[index % ADS_CONFIG.rewardLadder.length] ?? flatAdReward;

/**
 * The ladder BOUGHT views are paid from, copied from production (read straight
 * off `PlatformConfig.adRewardsPaidConfig`, 23.08.2026): twenty rungs, no LC on
 * any of them — the 5 000 LC is the price, not a reward — a star every time,
 * and the ticket count climbing 1 → 2 → 3.
 *
 * Kept separate from the free ladder because the server keeps them separate:
 * a bought view is numbered from the day's FIRST bought view, so the tenth free
 * view and the first bought one pay completely different things. With the free
 * ladder standing in for both, the buy card on localhost promised LC that
 * production never pays.
 */
const ADS_PAID_LADDER: TaskReward[][] = Array.from({ length: 20 }, (_, i) => [
  ap(1),
  stars(1),
  { ...tickets(i < 6 ? 1 : i < 14 ? 2 : 3), label: 'bronze' },
]);

/** `paidIndex` is 0-based from the day's first bought view. */
const getPaidAdRewards = (paidIndex: number): TaskReward[] =>
  ADS_PAID_LADDER[paidIndex % ADS_PAID_LADDER.length] ?? flatAdReward;

/** How many upcoming bought views the offer previews — mirrors the server. */
const ADS_EXTRA_PREVIEW = 3;

/**
 * The Lucky Player skip allowance for this dev session (DOCS §7.3) — the perk
 * that pays a view without playing anything. `total: 0` is the statusless view
 * of the same screen, which is what a `fresh` account gets: the card must then
 * look exactly as it did before the perk existed.
 *
 * Independent of the demo account's VIP level, exactly as the server is: the
 * perk belongs to Lucky Player and a subscriber keeps it as a VIP too
 * (`statusAdsSkipDaily` takes the larger of the two figures — since 17.08.2026;
 * before that the VIP row won and a VIP 20 with the subscription had none).
 */
const ADS_SKIP = {
  total: fresh ? 0 : 10,
  // The demo day is three views in (`ADS_CONFIG.watchedToday`), and those three
  // were taken with the perk — so the allowance is three down as well. Left at
  // zero it claimed ten untouched skips against nine remaining views, i.e. a
  // day the perk covers end to end, and the boundary where it runs out first
  // never appeared on the dev screen.
  usedToday: fresh ? 0 : 3,
};

/** Extra slots bought in this dev session — mirrors `AdWatchProgress`. */
const ADS_EXTRA = {
  priceLc: 5_000,
  priceLs: 1,
  maxPerDay: 20,
  purchasedToday: 0,
  watchedToday: 0,
};

const buildAds = (): AdsBlock => {
  const free = ADS_CONFIG.total;
  const total = free + ADS_EXTRA.purchasedToday;
  // 0-based index and a stable id per slot, both matching the backend
  // (`id: \`ad-slot-${i}\`, index: i`). Two dev-only bugs came out of not
  // doing that: the first playable slot was labelled one view ahead of the one
  // about to be watched, and `mockState.watchedAdIds` could never match a slot,
  // because `nextId()` handed out a fresh id on every rebuild — so watching an
  // ad on localhost left the day's counter exactly where it was.
  const skipRemaining = Math.max(0, Math.min(ADS_SKIP.total, free) - ADS_SKIP.usedToday);
  const slots = Array.from({ length: total }, (_, i) => {
    const id = `ad-slot-${i}`;
    return {
      id,
      index: i,
      rewards: i >= free ? getPaidAdRewards(i - free) : getAdRewards(i),
      watched: i < ADS_CONFIG.watchedToday || mockState.watchedAdIds.has(id),
      paid: i >= free,
    };
  });
  const watchedCount = slots.filter(slot => slot.watched).length;
  return {
    enabled: true,
    total,
    free,
    watchedToday: watchedCount,
    resetAt: nextUtcMidnight(),
    // The next `remaining` unwatched slots are the skippable ones — the same
    // rule the server applies, so the card behaves here as it will in prod.
    slots: slots.map(slot => ({
      ...slot,
      skippable: !slot.watched && slot.index - watchedCount < skipRemaining,
    })),
    skip: {
      total: Math.min(ADS_SKIP.total, free),
      usedToday: ADS_SKIP.usedToday,
      remaining: skipRemaining,
    },
    extra: {
      enabled: true,
      priceLc: ADS_EXTRA.priceLc,
      priceLs: ADS_EXTRA.priceLs,
      maxPerDay: ADS_EXTRA.maxPerDay,
      purchasedToday: ADS_EXTRA.purchasedToday,
      watchedToday: ADS_EXTRA.watchedToday,
      remaining: Math.max(0, ADS_EXTRA.maxPerDay - ADS_EXTRA.purchasedToday),
      // Flip to `unlimited: true` with `remaining: null` to see the uncapped
      // offer the panel can now switch on — the mock has no admin to ask.
      unlimited: false,
      grantsAp: true,
      // What the next bought views pay, so the card can say it before the tap.
      nextRewards: Array.from({ length: ADS_EXTRA_PREVIEW }, (_, k) =>
        getPaidAdRewards(ADS_EXTRA.purchasedToday + k)
      ),
    },
  };
};

// ───────────────── ADS — WATCH MILESTONES ─────────────────
// One-time milestone chain for the "watch ads" mechanic — a single task type
// whose levels are cumulative view-count thresholds. Rendered as a horizontal
// slider (like Friends invites); the slider auto-appends a "Coming soon" card
// after the 7th level. Demo state: ADS_WATCHED_TOTAL ads watched so far.
const ADS_WATCHED_TOTAL = 60;

type AdsMilestone = { target: number; rewards: TaskReward[] };

const ADS_WATCH_MILESTONES: AdsMilestone[] = [
  { target: 10, rewards: [lc(2), tickets(1), ap(1)] },
  { target: 25, rewards: [lc(5), tickets(2), stars(1), ap(2)] },
  { target: 50, rewards: [lc(10), tickets(3), stars(1), ap(3)] },
  { target: 100, rewards: [lc(20), tickets(4), stars(2), ap(5)] },
  { target: 200, rewards: [lc(40), tickets(5), stars(2), ap(8)] },
  { target: 400, rewards: [lc(80), tickets(6), stars(3), ap(13)] },
  { target: 800, rewards: [lc(150), tickets(10), stars(3), ap(21)] },
];

const ADS = buildCategory({
  category: TaskCategory.ADS,
  daily: [
    {
      id: 'task-daily-ads',
      title: {
        en: 'Watch 10 ads today',
        hy: 'Watch 10 ads today',
        ru: 'Посмотри 10 реклам сегодня',
        de: 'Sieh dir heute 10 Werbevideos an',
      },
      subtitle: {
        en: 'Any rewarded view from the block above counts.',
        hy: 'Any rewarded view from the block above counts.',
        ru: 'Считается любой ролик из блока выше.',
        de: 'Jedes Belohnungsvideo aus dem Block oben zählt.',
      },
      rewards: [lc(1.5), ap(10)],
      // Re-synced from the live ads block on every response — see
      // `syncAdsTaskProgress`; watching an ad has to move this card too.
      // The target is the whole free daily cap, same as the catalog.
      progress: {
        current: Math.min(ADS_CONFIG.watchedToday, DAILY_ADS_TARGET),
        target: DAILY_ADS_TARGET,
      },
      deeplink: '/tasks?frequency=daily&category=ads',
      rarity: TaskRarity.BRONZE,
    },
  ],
  once: ADS_WATCH_MILESTONES.map(m => ({
    id: `ads-watch-${m.target}`,
    // Localized, unlike the rest of this mock: the backend now serves task copy
    // as {en,hy,ru,de}, and leaving every fixture a bare string would mean dev
    // never exercises the shape production actually sends. The plain strings
    // below are deliberate too — legacy rows still look like that.
    title: {
      en: `Watch ${m.target} ads`,
      hy: `Watch ${m.target} ads`,
      ru: `Посмотри ${m.target} реклам`,
      de: `Sieh dir ${m.target} Werbevideos an`,
    },
    subtitle: {
      en: 'Watch rewarded ads — any ad counts.',
      hy: 'Watch rewarded ads — any ad counts.',
      ru: 'Смотри рекламу за награду — считается любая.',
      de: 'Sieh dir Belohnungsvideos an — jedes zählt.',
    },
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
//
// This fixture deliberately emits all five tiers so the tier-locked card states
// stay reachable in dev. Production does NOT: the backend returns a tier's task
// only while that tier has a bracket accepting entries (DOCS §12.2), and only
// Bronze is auto-spawned — so the live daily list normally holds Bronze alone.
interface TierTournamentConfig {
  tier: TierName;
  daily: {
    count: number;
    title: string;
    subtitle: string;
    rewards: TaskReward[];
    progress: { current: number; target: number };
    rarity: TaskRarity;
  };
  weekly: {
    rewards: TaskReward[];
    progress: { current: number; target: number };
    rarity: TaskRarity;
  };
}

const TIER_CONFIGS: TierTournamentConfig[] = [
  {
    tier: 'bronze',
    daily: {
      count: 4,
      title: 'Join 4 Bronze tournaments',
      subtitle: 'All 4 Bronze brackets of the day are open at once — enter them in one go.',
      rewards: [lc(1), ap(120)],
      progress: { current: 4, target: 4 },
      rarity: TaskRarity.BRONZE,
    },
    weekly: {
      rewards: [lc(8), ap(900)],
      progress: { current: 2, target: 7 },
      rarity: TaskRarity.SILVER,
    },
  },
  {
    tier: 'silver',
    daily: {
      count: 2,
      title: 'Join 2 Silver tournaments',
      subtitle: 'Both daily Silver brackets.',
      rewards: [lc(2), ap(160)],
      progress: { current: 1, target: 2 },
      rarity: TaskRarity.SILVER,
    },
    weekly: {
      rewards: [lc(15), tickets(1), ap(1200)],
      progress: { current: 1, target: 7 },
      rarity: TaskRarity.GOLD,
    },
  },
  {
    tier: 'gold',
    daily: {
      count: 1,
      title: 'Join a Gold tournament with 1 ticket',
      subtitle: 'The entry itself counts — no need to wait for the draw.',
      rewards: [lc(2), ap(180)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    weekly: {
      rewards: [lc(25), tickets(2), ap(1500)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.GOLD,
    },
  },
  {
    tier: 'platinum',
    daily: {
      count: 1,
      title: 'Join a Platinum tournament with 1 ticket',
      subtitle: 'The entry itself counts — no need to wait for the draw.',
      rewards: [lc(4), ap(260)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    weekly: {
      rewards: [lc(30), tickets(2), ap(2000)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.GOLD,
    },
  },
  {
    tier: 'diamond',
    daily: {
      count: 1,
      title: 'Join a Diamond tournament with 1 ticket',
      subtitle: 'The entry itself counts — no need to wait for the draw.',
      rewards: [lc(8), tickets(1), ap(400)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    weekly: {
      rewards: [lc(50), tickets(3), ap(2800)],
      progress: { current: 0, target: 7 },
      rarity: TaskRarity.PLATINUM,
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
    resetAt: nextUtcMidnight(),
    deeplink: '/tournaments',
    rarity: cfg.daily.rarity,
    tier: cfg.tier,
    subSteps: buildSubSteps(tierCap, cfg.daily.count, cfg.daily.progress.current),
  });
};

const buildWeeklyTierTask = (cfg: TierTournamentConfig): Task => {
  const tierCap = cap(cfg.tier);
  // Every tier task is an entry, so the wording now forks only on the tier's
  // daily count. The higher tiers used to say "bet", describing a mechanic
  // that does not exist. The counter is `weekly_days_<tier>` — distinct days
  // whose daily target was met.
  const subtitle =
    cfg.daily.count > 1
      ? `Finish the full daily ${tierCap} run on 7 different days.`
      : `Enter a ${tierCap} tournament on 7 different days.`;
  return baseTask({
    category: TaskCategory.TOURNAMENTS,
    frequency: TaskFrequency.WEEKLY,
    title: `Complete the daily ${tierCap} task 7 times`,
    subtitle,
    rewards: cfg.weekly.rewards,
    progress: cfg.weekly.progress,
    resetAt: nextWeekStartUtc(),
    deeplink: `/tasks?frequency=daily&category=tournaments&task=task-daily-${cfg.tier}`,
    rarity: cfg.weekly.rarity,
    tier: cfg.tier,
    subSteps: buildSubSteps(tierCap, 7, cfg.weekly.progress.current),
  });
};

// ───────────── ALL-SET COMPLETION BONUS (DOCS §12.4) ─────────────
// One per period, and its condition is the OTHER tasks of that period — so it
// is assembled from the live list at response time, not from a fixture. Mirrors
// TasksService.allSetState, including the rule that hides it when the period
// holds fewer than two other tasks (a "bonus" over one task is that task's
// reward paid twice — the bug this replaced).
const ALL_SET_MIN_MEMBERS = 2;

const ALL_SET_BONUSES: Record<'daily' | 'weekly', Task> = {
  daily: baseTask({
    id: 't-70',
    category: TaskCategory.QUEST,
    frequency: TaskFrequency.DAILY,
    title: {
      en: 'Complete every daily task',
      hy: 'Complete every daily task',
      ru: 'Выполни все задания дня',
      de: 'Erledige alle Tagesaufgaben',
    },
    subtitle: {
      en: 'The full-day bonus: finish every other daily task on this screen.',
      hy: 'The full-day bonus: finish every other daily task on this screen.',
      ru: 'Бонус за полный день: выполни все остальные дневные задания на этом экране.',
      de: 'Der Komplett-Bonus: erledige alle anderen Tagesaufgaben auf diesem Bildschirm.',
    },
    rewards: [lc(6), ap(100)],
    progress: { current: 0, target: 1 },
    resetAt: nextUtcMidnight(),
    // No deeplink: it pointed at the tasks screen this card lives on, and the
    // shared card turns that into an «Открыть» link going nowhere. See t-70
    // in the backend catalog.
    rarity: TaskRarity.PLATINUM,
  }),
  weekly: baseTask({
    id: 't-71',
    category: TaskCategory.QUEST,
    frequency: TaskFrequency.WEEKLY,
    title: {
      en: 'Complete every weekly task',
      hy: 'Complete every weekly task',
      ru: 'Выполни все задания недели',
      de: 'Erledige alle Wochenaufgaben',
    },
    subtitle: {
      en: 'The full-week bonus: finish every other weekly task on this screen.',
      hy: 'The full-week bonus: finish every other weekly task on this screen.',
      ru: 'Бонус за полную неделю: выполни все остальные недельные задания на этом экране.',
      de: 'Der Komplett-Bonus: erledige alle anderen Wochenaufgaben auf diesem Bildschirm.',
    },
    rewards: [lc(80), tickets(5), ap(200)],
    progress: { current: 0, target: 1 },
    resetAt: nextWeekStartUtc(),
    rarity: TaskRarity.PLATINUM,
  }),
};

const buildAllSetBonus = (period: 'daily' | 'weekly', categories: CategoryTasks[]): Task | null => {
  const bonus = ALL_SET_BONUSES[period];
  const members = categories
    .flatMap(c => (period === 'daily' ? c.daily : c.weekly))
    .filter(task => task.id !== bonus.id && task.status !== TaskStatus.LOCKED);
  if (members.length < ALL_SET_MIN_MEMBERS) return null;

  const isDone = (task: Task) =>
    task.status === TaskStatus.COMPLETED || task.status === TaskStatus.READY_TO_CLAIM;
  const current = members.filter(isDone).length;
  const claimed = mockState.claimedTaskIds.has(bonus.id);
  return {
    ...bonus,
    status: claimed
      ? TaskStatus.COMPLETED
      : current >= members.length
        ? TaskStatus.READY_TO_CLAIM
        : TaskStatus.IN_PROGRESS,
    progress: { current, target: members.length },
    // Read-only checklist: every row is another task, claimed on its own card.
    subSteps: members.map(task => ({
      id: `${bonus.id}::${task.id}`,
      label: task.title,
      completed: isDone(task),
      claimed: isDone(task),
      claimable: false,
    })),
  };
};

// ───────────────── PLACE MILESTONES (1st / 2nd / 3rd) ─────────────────
// Single source of truth for the per-place milestone chains (1, 5, 10, 25, 50, 100).
// Reward shape mirrors the podium chain — adjust here to tune all 3 sliders at once.
type PlaceKey = '1st' | '2nd' | '3rd';

const PLACE_MILESTONES: { target: number; rewards: TaskReward[]; rarity: TaskRarity }[] = [
  { target: 1, rewards: [lc(1), tickets(1), stars(1), ap(1)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(2), tickets(2), stars(1), ap(2)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(3), tickets(3), stars(1), ap(3)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(5), tickets(4), stars(2), ap(5)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(8), tickets(5), stars(2), ap(8)], rarity: TaskRarity.GOLD },
  { target: 100, rewards: [lc(13), tickets(6), stars(2), ap(13)], rarity: TaskRarity.PLATINUM },
];

const PODIUM_MILESTONES: { target: number; rewards: TaskReward[]; rarity: TaskRarity }[] = [
  { target: 1, rewards: [lc(1), tickets(1), stars(1), ap(1)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(2), tickets(2), stars(1), ap(2)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(3), tickets(3), stars(1), ap(3)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(5), tickets(4), stars(2), ap(5)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(8), tickets(5), stars(2), ap(8)], rarity: TaskRarity.GOLD },
  { target: 100, rewards: [lc(13), tickets(6), stars(2), ap(13)], rarity: TaskRarity.PLATINUM },
];

const PARTICIPATION_MILESTONES: { target: number; rewards: TaskReward[]; rarity: TaskRarity }[] = [
  { target: 1, rewards: [lc(1), tickets(1), stars(1), ap(1)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(2), tickets(2), stars(1), ap(2)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(3), tickets(3), stars(1), ap(3)], rarity: TaskRarity.SILVER },
  { target: 25, rewards: [lc(5), tickets(4), stars(2), ap(5)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(8), tickets(5), stars(2), ap(8)], rarity: TaskRarity.GOLD },
  { target: 100, rewards: [lc(13), tickets(6), stars(2), ap(13)], rarity: TaskRarity.PLATINUM },
];

const buildPlaceMilestones = (place: PlaceKey): TaskBlueprint[] =>
  PLACE_MILESTONES.map(m => ({
    id: `tournament-${place}-${m.target}`,
    title: `Take ${place} place ${m.target} ${m.target === 1 ? 'time' : 'times'}`,
    subtitle: 'Win a tournament outright.',
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/tournaments',
    rarity: m.rarity,
  }));

// ───────────────── CATEGORY TASKS ─────────────────
const TOURNAMENTS = buildCategory({
  category: TaskCategory.TOURNAMENTS,
  // The two "complete all …" tasks used to sit here, as tournament rows. They
  // are the period's all-set bonus now (DOCS §12.4) and travel outside the
  // categories — see ALL_SET_BONUSES below.
  daily: TIER_CONFIGS.map(buildDailyTierTask),
  weekly: TIER_CONFIGS.map(buildWeeklyTierTask),
  once: [
    // 2026-07 rebalance: exactly three chains (participate / podium / 1st) —
    // the 2nd/3rd and per-tier variants multi-dipped the same actions.
    ...PARTICIPATION_MILESTONES.map(m => ({
      id: `tournament-played-${m.target}`,
      title: `Participate in ${m.target} tournament${m.target === 1 ? '' : 's'}`,
      subtitle: 'Join any tournament — every tier counts.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/tournaments',
      rarity: m.rarity,
    })),
    ...PODIUM_MILESTONES.map(m => ({
      id: `tournament-podium-${m.target}`,
      title: `Take a prize place ${m.target} time${m.target === 1 ? '' : 's'}`,
      subtitle: 'Finish top-3 in any tournament.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/tournaments',
      rarity: m.rarity,
    })),
    ...buildPlaceMilestones('1st'),
  ],
});

// ───────────────── LEADERBOARD ─────────────────
// LEADERBOARD TASKS OFF (2026-08-10) — the all-time rank chain is switched off
// for as long as the public board is gated (`appConfig.leaderboard.enabled` /
// `GET /config` → `leaderboardEnabled`, DOCS §13): the tasks deep-link to a
// screen that renders locked, and rank counts down, so on the closed-test
// player base everyone already sits inside top-1000/500/100. The backend
// catalog is commented out in the same breath (milestones.data.ts) — this
// fixture only keeps dev honest with it. Uncomment both when the board opens;
// grep `LEADERBOARD TASKS OFF`.
//
// Four time-period sliders: daily / weekly / monthly / all-time.
// Same rank ladder (1000 → #1) for each, with rewards scaled by period
// difficulty (all-time is hardest to crack, so it pays the most).
/*
type LeaderboardMilestone = { rank: number; rewards: TaskReward[]; rarity: TaskRarity };

// 2026-07 rebalance: one prestige chain on the all-time board (daily/weekly/
// monthly rank chains were noise at a small player base).
const LEADERBOARD_ALLTIME_MILESTONES: LeaderboardMilestone[] = [
  { rank: 1000, rewards: [lc(10), tickets(1), ap(15)], rarity: TaskRarity.BRONZE },
  { rank: 500, rewards: [lc(25), tickets(2), ap(25)], rarity: TaskRarity.SILVER },
  { rank: 100, rewards: [lc(60), tickets(3), stars(10), ap(40)], rarity: TaskRarity.SILVER },
  { rank: 50, rewards: [lc(120), tickets(5), stars(15), ap(60)], rarity: TaskRarity.GOLD },
  { rank: 10, rewards: [lc(300), tickets(10), stars(25), ap(90)], rarity: TaskRarity.GOLD },
  { rank: 1, rewards: [lc(600), tickets(15), stars(50), ap(120)], rarity: TaskRarity.PLATINUM },
];

const LEADERBOARD = buildCategory({
  category: TaskCategory.LEADERBOARD,
  once: LEADERBOARD_ALLTIME_MILESTONES.map(m => ({
    id: `leaderboard-alltime-rank-${m.rank}`,
    title: m.rank === 1 ? 'Reach #1 all-time' : `Reach top ${m.rank} all-time`,
    subtitle: 'Climb the all-time activity leaderboard.',
    rewards: m.rewards,
    progress: { current: 0, target: m.rank },
    deeplink: '/leaderboard',
    rarity: m.rarity,
  })),
});
*/

// ───────────────── SOCIAL ─────────────────
// One task, and it is the production catalog's one (`t-266`). The four
// platform follows that used to live here — Telegram / X / Discord / YouTube —
// were never in the backend catalog at all, so dev showed a four-row list where
// a player sees a single row. See milestones.data.ts in the backend.
const SOCIAL = buildCategory({
  category: TaskCategory.SOCIAL,
  // "Share your daily result" lived here and shared nothing: no mechanic, no
  // link, 1 AP for a tap. It is the daily engine claim now (see ENGINES).
  once: [
    {
      title: 'Boost the channel',
      subtitle: 'Give our channel a boost from Telegram Premium — then come back and check.',
      rewards: [lc(10), tickets(1), stars(1), ap(5)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
      externalLink: 'https://t.me/LuckyTicket365?boost',
    },
  ],
});

// ───────────────── PROFILE ─────────────────
const PROFILE = buildCategory({
  category: TaskCategory.PROFILE,
  daily: [
    {
      title: 'Daily channel check-in',
      subtitle: 'Stay subscribed to our channel to claim.',
      rewards: [ap(10)],
      progress: { current: 0, target: 1 },
      status: TaskStatus.IN_PROGRESS,
      externalLink: 'https://t.me/luckyticket365',
    },
  ],
  weekly: [
    {
      title: 'Check in 7 days this week',
      subtitle: 'Open the app every day for a full week.',
      rewards: [lc(2), ap(150)],
      progress: { current: 5, target: 7 },
      rarity: TaskRarity.SILVER,
      subSteps: buildSubSteps('profile-checkin', 7, 5),
    },
  ],
  once: [
    // Instant one-click actions award LC only (0 AP) — see milestones.data.ts.
    // EMAIL TASK OFF (2026-08-12) — switched off in the backend catalog, so the
    // mock must not keep offering it or dev shows a card production does not
    // have. Nobody could complete it: the counter is `verified`, and the only
    // player-facing route to that flag is the email confirmation flow, which
    // does not exist on production (`me/email/request-code` and
    // `me/email/confirm` both answer 404 — blocked on SMTP). Uncomment together
    // with the backend block, grep `EMAIL TASK OFF`.
    /*
    {
      id: 't-260',
      title: 'Verify your email',
      subtitle: 'Confirm your email address.',
      rewards: [lc(3)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/email',
    },
    */
    {
      id: 't-261',
      title: 'Set a username',
      subtitle: 'Pick your public name.',
      rewards: [lc(2)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      deeplink: '/settings/username',
    },
    // 2FA OFF (2026-08-13) — removed from the backend catalog too. It paid
    // 500 LC for flipping a switch that protects nothing: `PATCH /me` writes
    // `twoFactorEnabled` with no verification, no secret is ever generated,
    // and /settings/security renders that boolean as a plain toggle — which is
    // exactly where this task's deeplink pointed. One tap, counter 0 → 1. It
    // returns when 2FA ships a real setup flow; grep `2FA OFF` in both repos.
    /*
    {
      id: 't-262',
      title: 'Enable 2FA',
      subtitle: 'Protect your account.',
      rewards: [lc(5)],
      progress: { current: 0, target: 1 },
      deeplink: '/settings/security',
      rarity: TaskRarity.SILVER,
    },
    */
    // AVATARS OFF (2026-08-12) — switched off in the backend catalog too. It paid
    // for nothing: the counter is `has_avatar`, which reads `profile.avatarUrl`,
    // and that is filled from Telegram's own `photo_url` at first login — so any
    // player with a photo in Telegram completed it before opening the app. The
    // title also asks to CUSTOMIZE an avatar, and avatar cosmetics have been off
    // since 2026-08-09. Grep `AVATARS OFF`.
    /*
    {
      id: 't-263',
      title: 'Customize your avatar',
      subtitle: 'Make your profile yours.',
      rewards: [lc(3)],
      progress: { current: 0, target: 1 },
      deeplink: '/profile',
      rarity: TaskRarity.BRONZE,
    },
    */
    {
      id: 't-264',
      title: 'Connect TON wallet',
      subtitle: 'Link a TON wallet to your account.',
      rewards: [lc(5), tickets(10), stars(1), ap(10)],
      progress: { current: 0, target: 1 },
      deeplink: '/wallet',
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-265',
      title: 'Make your first deposit',
      subtitle: 'Top up via TON for the first time.',
      rewards: [lc(10), tickets(1)],
      progress: { current: 0, target: 1 },
      deeplink: '/wallet',
      rarity: TaskRarity.SILVER,
    },
  ],
});

// ───────────────── FRIENDS ─────────────────
// Single milestone chain — drives the "Invite N friends" horizontal slider.
type FriendMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

// Steps 2/5/10/20 mirror tierReferralRequirements (DOCS §5.1) — every
// mandatory invite threshold doubles as a milestone reward checkpoint.
const FRIEND_INVITE_MILESTONES: FriendMilestone[] = [
  { target: 1, rewards: [lc(5), tickets(1), stars(1), ap(1)], rarity: TaskRarity.BRONZE },
  { target: 2, rewards: [lc(8), tickets(2), stars(2), ap(2)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(20), tickets(5), stars(5), ap(3)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(50), tickets(10), stars(7), ap(5)], rarity: TaskRarity.SILVER },
  { target: 20, rewards: [lc(120), tickets(20), stars(12), ap(8)], rarity: TaskRarity.GOLD },
  { target: 50, rewards: [lc(300), tickets(50), stars(21), ap(13)], rarity: TaskRarity.GOLD },
  { target: 100, rewards: [lc(600), tickets(100), stars(33), ap(21)], rarity: TaskRarity.PLATINUM },
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

const ENGINE_MILESTONES: EngineMilestone[] = [
  { target: 2, rewards: [lc(10), tickets(2), stars(1), ap(10)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(20), tickets(5), stars(2), ap(15)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(40), tickets(7), stars(3), ap(20)], rarity: TaskRarity.SILVER },
  { target: 15, rewards: [lc(80), tickets(12), stars(4), ap(30)], rarity: TaskRarity.GOLD },
  { target: 20, rewards: [lc(150), tickets(21), stars(5), ap(45)], rarity: TaskRarity.GOLD },
  { target: 30, rewards: [lc(300), tickets(33), stars(6), ap(60)], rarity: TaskRarity.PLATINUM },
];

const ENGINES = buildCategory({
  category: TaskCategory.ENGINES,
  daily: [
    {
      id: 't-246',
      title: {
        en: 'Claim tickets from your engine',
        hy: 'Claim tickets from your engine',
        ru: 'Забери билеты с двигателя',
        de: 'Hol dir Tickets von deinem Motor',
      },
      subtitle: {
        en: 'It produces around the clock — collect what it made today.',
        hy: 'It produces around the clock — collect what it made today.',
        ru: 'Двигатель работает круглосуточно — забери то, что он произвёл сегодня.',
        de: 'Er produziert rund um die Uhr — hol dir, was er heute erzeugt hat.',
      },
      rewards: [lc(1), ap(10)],
      progress: { current: 0, target: 1 },
      deeplink: '/tickets',
      rarity: TaskRarity.BRONZE,
    },
  ],
  once: ENGINE_MILESTONES.map(m => ({
    id: `engine-collect-${m.target}`,
    title: `Own ${m.target} engines`,
    subtitle: 'Engines of any tier count.',
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/tickets',
    rarity: m.rarity,
  })),
});

// ───────────────── STAKES ─────────────────
// Stakes are organized by 5 tier levels (L1=Bronze … L5=Diamond).
// Two milestone chains per tab: number of completed stake sessions + total LC volume staked.
type StakeMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const STAKE_COUNT_MILESTONES: StakeMilestone[] = [
  { target: 3, rewards: [lc(5), tickets(1), stars(1), ap(5)], rarity: TaskRarity.BRONZE },
  { target: 5, rewards: [lc(10), tickets(2), stars(1), ap(10)], rarity: TaskRarity.SILVER },
  { target: 10, rewards: [lc(20), tickets(3), stars(1), ap(15)], rarity: TaskRarity.SILVER },
  { target: 15, rewards: [lc(40), tickets(5), stars(2), ap(25)], rarity: TaskRarity.GOLD },
  { target: 20, rewards: [lc(80), tickets(8), stars(2), ap(40)], rarity: TaskRarity.GOLD },
  { target: 30, rewards: [lc(150), tickets(13), stars(3), ap(60)], rarity: TaskRarity.PLATINUM },
];

const STAKE_VOLUME_MILESTONES: StakeMilestone[] = [
  { target: 10000, rewards: [lc(5), tickets(1), stars(1), ap(10)], rarity: TaskRarity.BRONZE },
  { target: 50000, rewards: [lc(15), tickets(2), stars(1), ap(15)], rarity: TaskRarity.SILVER },
  { target: 200000, rewards: [lc(40), tickets(3), stars(1), ap(25)], rarity: TaskRarity.SILVER },
  { target: 500000, rewards: [lc(80), tickets(5), stars(2), ap(35)], rarity: TaskRarity.GOLD },
  { target: 2000000, rewards: [lc(200), tickets(8), stars(2), ap(50)], rarity: TaskRarity.GOLD },
  {
    target: 5000000,
    rewards: [lc(500), tickets(13), stars(3), ap(70)],
    rarity: TaskRarity.PLATINUM,
  },
];

const fmtNum = (n: number) => n.toLocaleString('en-US');

const STAKES = buildCategory({
  category: TaskCategory.STAKES,
  once: [
    ...STAKE_COUNT_MILESTONES.map(m => ({
      id: `stake-count-${m.target}`,
      title: `Start ${m.target} stakes`,
      subtitle: 'Lock LC into a stake of any tier.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/stakes',
      rarity: m.rarity,
    })),
    ...STAKE_VOLUME_MILESTONES.map(m => ({
      id: `stake-volume-${m.target}`,
      title: `Stake ${fmtNum(m.target)} LC in total`,
      subtitle: 'Lifetime staked volume across all tiers.',
      rewards: m.rewards,
      progress: { current: 0, target: m.target },
      deeplink: '/stakes',
      rarity: m.rarity,
    })),
  ],
});

// ───────────────── (PREMIUM tasks moved into PROFILE_STATUS below) ─────────────────

// ───────────────── STARS (Telegram Stars spend / earn) ─────────────────
// Stars are a flat currency without tiers — two milestone chains: spend + earn.
type StarMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const STAR_PURCHASE_MILESTONES: StarMilestone[] = [
  { target: 100, rewards: [lc(10), tickets(2), stars(5), ap(2)], rarity: TaskRarity.BRONZE },
  { target: 250, rewards: [lc(25), tickets(4), stars(10), ap(4)], rarity: TaskRarity.SILVER },
  { target: 500, rewards: [lc(50), tickets(6), stars(15), ap(6)], rarity: TaskRarity.SILVER },
  { target: 1000, rewards: [lc(100), tickets(10), stars(25), ap(10)], rarity: TaskRarity.GOLD },
  { target: 2500, rewards: [lc(250), tickets(16), stars(40), ap(16)], rarity: TaskRarity.GOLD },
  { target: 5000, rewards: [lc(500), tickets(26), stars(60), ap(26)], rarity: TaskRarity.PLATINUM },
];

const STARS = buildCategory({
  category: TaskCategory.STARS,
  once: STAR_PURCHASE_MILESTONES.map(m => ({
    id: `star-purchase-${m.target}`,
    title: `Purchase ${m.target} Stars`,
    subtitle: 'Lifetime Telegram Stars purchases — thank-you cashback.',
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    rarity: m.rarity,
  })),
});

// ───────────────── TICKETS (earn / collect tickets) ─────────────────
// Milestone chains — drive the "Collect N tickets" horizontal sliders.
// Bronze (also shown as the General slider) starts at 1000; each higher tier
// divides the entry-point roughly in half because higher-tier tickets are
// rarer to obtain.
type TicketMilestone = { target: number; rewards: TaskReward[]; rarity: TaskRarity };

const TICKET_MILESTONES: TicketMilestone[] = [
  { target: 250, rewards: [lc(10), tickets(1), stars(1), ap(5)], rarity: TaskRarity.BRONZE },
  { target: 1000, rewards: [lc(20), tickets(2), stars(2), ap(10)], rarity: TaskRarity.SILVER },
  { target: 2500, rewards: [lc(40), tickets(3), stars(3), ap(15)], rarity: TaskRarity.SILVER },
  { target: 10000, rewards: [lc(80), tickets(5), stars(4), ap(25)], rarity: TaskRarity.GOLD },
  { target: 25000, rewards: [lc(150), tickets(8), stars(5), ap(40)], rarity: TaskRarity.GOLD },
  {
    target: 50000,
    rewards: [lc(300), tickets(12), stars(6), ap(60)],
    rarity: TaskRarity.PLATINUM,
  },
];

const TICKETS = buildCategory({
  category: TaskCategory.TICKETS,
  once: TICKET_MILESTONES.map(m => ({
    id: `ticket-collect-${m.target}`,
    title: `Collect ${fmtNum(m.target)} tickets`,
    subtitle: 'Earn through engines, tournaments, friends, or rewards.',
    rewards: m.rewards,
    progress: { current: 0, target: m.target },
    deeplink: '/tickets',
    rarity: m.rarity,
  })),
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
  {
    level: 1,
    target: 100,
    rewards: [lc(5), tickets(4), stars(1), ap(1)],
    rarity: TaskRarity.BRONZE,
  },
  {
    level: 2,
    target: 500,
    rewards: [lc(10), tickets(6), stars(2), ap(2)],
    rarity: TaskRarity.SILVER,
  },
  {
    level: 3,
    target: 2000,
    rewards: [lc(15), tickets(8), stars(3), ap(3)],
    rarity: TaskRarity.SILVER,
  },
  {
    level: 4,
    target: 5000,
    rewards: [lc(25), tickets(12), stars(4), ap(5)],
    rarity: TaskRarity.GOLD,
  },
  {
    level: 5,
    target: 10000,
    rewards: [lc(40), tickets(18), stars(5), ap(8)],
    rarity: TaskRarity.GOLD,
  },
  {
    level: 6,
    target: 25000,
    rewards: [lc(65), tickets(28), stars(6), ap(13)],
    rarity: TaskRarity.GOLD,
  },
  {
    level: 7,
    target: 50000,
    rewards: [lc(105), tickets(44), stars(7), ap(21)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 8,
    target: 100000,
    rewards: [lc(170), tickets(70), stars(8), ap(34)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 9,
    target: 250000,
    rewards: [lc(275), tickets(112), stars(9), ap(55)],
    rarity: TaskRarity.PLATINUM,
  },
  {
    level: 10,
    target: 500000,
    rewards: [lc(445), tickets(180), stars(10), ap(89)],
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
      subtitle: 'Unlock the Lucky Player perks.',
      rewards: [lc(20), tickets(2)],
      progress: { current: 0, target: 1 },
      deeplink: '/market?tab=status',
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
    // Backend-seeded achievements carry explicit ids (t-4xx / reach-*) so the
    // mock mirrors milestones.data.ts; entries without ids are demo-only
    // (their progress has no honest server-side counter yet).
    // ─── First steps (instant, 0 AP by design) ───
    {
      id: 't-414',
      deeplink: '/tickets',
      title: 'First claim',
      subtitle: 'Claim tickets from an engine.',
      rewards: [lc(2), tickets(1), stars(1), ap(1)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      id: 't-415',
      deeplink: '/tournaments',
      title: 'First tournament',
      subtitle: 'Join your first tournament.',
      rewards: [lc(2), tickets(1), stars(1), ap(2)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      id: 't-416',
      deeplink: '/tournaments',
      title: 'First win',
      subtitle: 'Win your first tournament.',
      rewards: [lc(5), tickets(2), stars(1), ap(2)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      id: 't-417',
      deeplink: '/stakes',
      title: 'First stake',
      subtitle: 'Start your first stake.',
      rewards: [lc(5), tickets(2), stars(1), ap(3)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },
    {
      id: 't-418',
      deeplink: '/invite-friends',
      title: 'First friend',
      subtitle: 'Invite your first friend.',
      rewards: [lc(5), tickets(3), stars(1), ap(3)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
    },

    // ─── Engine mastery (LC/time-gated → AP allowed, ascending by tier) ───
    {
      id: 't-419',
      deeplink: '/market?tab=engines',
      title: 'Unlock Silver engine',
      subtitle: 'Own your first Silver engine.',
      rewards: [lc(15), tickets(5), stars(2), ap(5)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-420',
      deeplink: '/market?tab=engines',
      title: 'Unlock Gold engine',
      subtitle: 'Own your first Gold engine.',
      rewards: [lc(30), tickets(8), stars(3), ap(8)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-422',
      deeplink: '/market?tab=engines',
      title: 'Unlock Platinum engine',
      subtitle: 'Own your first Platinum engine.',
      rewards: [lc(60), tickets(13), stars(5), ap(13)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-421',
      deeplink: '/market?tab=engines',
      title: 'Unlock Diamond engine',
      subtitle: 'Own your first Diamond engine.',
      rewards: [lc(120), tickets(21), stars(8), ap(21)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      id: 't-423',
      deeplink: '/tickets',
      title: 'Parallel producer',
      subtitle: 'Run 5 engines at the same time.',
      rewards: [lc(20), tickets(5), stars(2), ap(8)],
      progress: { current: 3, target: 5 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-424',
      deeplink: '/tickets',
      title: 'First Speed Boost',
      subtitle: 'Upgrade an engine’s speed.',
      rewards: [lc(8), tickets(2), stars(1), ap(3)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.READY_TO_CLAIM,
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-425',
      deeplink: '/tickets',
      title: 'Capacity Upgrade',
      subtitle: 'Upgrade an engine’s capacity.',
      rewards: [lc(12), tickets(3), stars(1), ap(5)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-426',
      deeplink: '/tickets',
      title: 'Stack Boosts',
      subtitle: 'Speed + capacity on one engine.',
      rewards: [lc(25), tickets(5), stars(2), ap(8)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },

    // ─── Tournament prowess ───
    {
      id: 't-429',
      deeplink: '/tournaments',
      title: 'Project tournament win',
      subtitle: 'Win a project tournament.',
      rewards: [lc(25), tickets(5), stars(2), ap(8)],
      progress: { current: 1, target: 1 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-430',
      deeplink: '/tournaments',
      title: 'Partner tournament win',
      subtitle: 'Win a partner tournament.',
      rewards: [lc(25), tickets(5), stars(2), ap(8)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-431',
      deeplink: '/tournaments',
      title: 'All-tier winner',
      subtitle: 'Win 1st place in every tier.',
      rewards: [lc(100), tickets(21), stars(8), ap(21)],
      progress: { current: 3, target: 5 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      id: 't-433',
      deeplink: '/tournaments',
      title: 'Platinum winner',
      subtitle: 'Win a Platinum tournament.',
      rewards: [lc(80), tickets(13), stars(5), ap(13)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-432',
      deeplink: '/tournaments',
      title: 'Diamond winner',
      subtitle: 'Win a Diamond tournament.',
      rewards: [lc(150), tickets(21), stars(8), ap(21)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },

    // ─── Tier journey (0 AP — awarding AP for AP is circular) ───
    {
      id: 'reach-silver',
      deeplink: '/profile',
      title: 'Reach Silver',
      subtitle: 'Earn 500 activity points.',
      rewards: [lc(15), tickets(5), stars(2)],
      progress: { current: 500, target: 500 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.SILVER,
    },
    {
      id: 'reach-gold',
      deeplink: '/profile',
      title: 'Reach Gold',
      subtitle: 'Earn 1 650 activity points.',
      rewards: [lc(40), tickets(13), stars(3)],
      progress: { current: 1650, target: 1650 },
      status: TaskStatus.COMPLETED,
      rarity: TaskRarity.GOLD,
    },
    {
      id: 'reach-platinum',
      deeplink: '/profile',
      title: 'Reach Platinum',
      subtitle: 'Earn 5 900 activity points.',
      rewards: [lc(100), tickets(34), stars(5)],
      progress: { current: 4500, target: 5900 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-461',
      deeplink: '/profile',
      title: 'Reach Diamond',
      subtitle: 'Enter the highest tier.',
      rewards: [lc(250), tickets(89), stars(13)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },

    // ─── Stakes / referrals / wallet ───
    {
      id: 't-441',
      deeplink: '/stakes',
      title: 'Diamond Staker',
      subtitle: 'Start a Diamond-tier stake.',
      rewards: [lc(50), tickets(13), stars(5), ap(13)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-445',
      deeplink: '/invite-friends',
      title: 'Referral claimer',
      subtitle: 'Claim referral rewards 100 times.',
      rewards: [lc(50), tickets(34), stars(13), ap(21)],
      progress: { current: 12, target: 100 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-446',
      deeplink: '/invite-friends',
      title: 'Verified referrals',
      subtitle: '3 invited friends verified.',
      rewards: [lc(60), tickets(13), stars(5), ap(13)],
      progress: { current: 0, target: 3 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-447',
      deeplink: '/invite-friends',
      title: 'VIP referral',
      subtitle: 'An invited friend became VIP.',
      rewards: [lc(120), tickets(34), stars(13), ap(21)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.PLATINUM,
    },
    {
      id: 't-450',
      deeplink: '/wallet',
      title: 'First withdrawal',
      subtitle: 'Withdraw TON for the first time.',
      rewards: [lc(10), tickets(5), stars(2), ap(5)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-451',
      deeplink: '/wallet',
      title: 'Stars → LC swap',
      subtitle: 'Convert Stars into LC.',
      rewards: [lc(5), tickets(3), stars(1), ap(3)],
      progress: { current: 0, target: 1 },
      rarity: TaskRarity.BRONZE,
    },

    // ─── Engagement (time-gated) ───
    {
      id: 't-455',
      deeplink: '/tasks?frequency=daily&category=ads',
      title: 'Ad Maxer',
      subtitle: 'Watch every daily ad 7 days in a row.',
      rewards: [lc(25), tickets(5), stars(2), ap(5)],
      progress: { current: 2, target: 7 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-456',
      deeplink: '/tasks?frequency=daily&category=profile',
      title: '7-day streak',
      subtitle: 'Log in 7 days in a row.',
      rewards: [lc(10), tickets(3), stars(2), ap(8)],
      progress: { current: 7, target: 7 },
      status: TaskStatus.READY_TO_CLAIM,
      rarity: TaskRarity.SILVER,
    },
    {
      id: 't-457',
      deeplink: '/tasks?frequency=daily&category=profile',
      title: '30-day streak',
      subtitle: 'Log in 30 days in a row.',
      rewards: [lc(50), tickets(13), stars(5), ap(21)],
      progress: { current: 5, target: 30 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-458',
      deeplink: '/tasks?frequency=daily&category=profile',
      title: '90-day streak',
      subtitle: 'Log in 90 days in a row.',
      rewards: [lc(200), tickets(34), stars(13), ap(34)],
      progress: { current: 5, target: 90 },
      rarity: TaskRarity.GOLD,
    },
    {
      id: 't-459',
      deeplink: '/tasks?frequency=daily&category=profile',
      title: '365-day streak',
      subtitle: 'A full year of daily logins.',
      rewards: [lc(1000), tickets(89), stars(34), ap(89)],
      progress: { current: 5, target: 365 },
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
const STREAK_CURRENT_DAYS = fresh ? 0 : 5;
const STREAK_BEST_DAYS = fresh ? 0 : 14;
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
  // LEADERBOARD TASKS OFF (2026-08-10) — LEADERBOARD,
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
  watchedAdIds: new Set<string>(),
  balance: fresh
    ? { lc: 0, tickets: 0, activityPoints: 0 }
    : { lc: 12_345_000, tickets: 12, activityPoints: 4500 },
};

const applyMockState = (task: Task): Task => {
  if (!mockState.claimedTaskIds.has(task.id)) return task;
  return {
    ...task,
    status: TaskStatus.COMPLETED,
    progress: { current: task.progress.target, target: task.progress.target },
    subSteps: task.subSteps?.map(s => ({ ...s, completed: true })),
  };
};

/**
 * The daily "watch N ads" card reads the same counter the ads block does, so a
 * view watched in this session has to move both. Without it the fixture's card
 * sat frozen at its build-time value and dev could never see the task complete.
 */
const syncAdsTaskProgress = (task: Task, ads: AdsBlock): Task => {
  if (task.id !== 'task-daily-ads' || task.status === TaskStatus.COMPLETED) return task;
  const current = Math.min(ads.watchedToday, task.progress.target);
  return {
    ...task,
    progress: { ...task.progress, current },
    status: current >= task.progress.target ? TaskStatus.READY_TO_CLAIM : TaskStatus.IN_PROGRESS,
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

// Level-zero reset: every non-locked task back to zero progress / not-done.
// Locked (tier-gated) tasks stay locked. Demo data is untouched — used when
// `fresh` is false.
const resetTaskForFresh = (task: Task): Task =>
  task.status === TaskStatus.LOCKED
    ? task
    : {
        ...task,
        status: TaskStatus.IN_PROGRESS,
        progress: { ...task.progress, current: 0 },
        subSteps: task.subSteps?.map(s => ({ ...s, completed: false, claimed: false })),
      };

const freshQuest: Quest = {
  ...QUEST,
  steps: QUEST.steps.map(step => ({
    ...step,
    status: step.status === TaskStatus.LOCKED ? TaskStatus.LOCKED : TaskStatus.IN_PROGRESS,
  })),
};

const buildTasksResponse = (): TasksResponse => {
  const sourceCategories = fresh
    ? PROCESSED_CATEGORIES.map(c => ({
        ...c,
        daily: c.daily.map(resetTaskForFresh),
        weekly: c.weekly.map(resetTaskForFresh),
        once: c.once.map(resetTaskForFresh),
      }))
    : PROCESSED_CATEGORIES;
  const ads = buildLiveAds();
  const liveCategories = sourceCategories.map(c => ({
    ...c,
    daily: c.daily.map(applyMockState).map(task => syncAdsTaskProgress(task, ads)),
    weekly: c.weekly.map(applyMockState),
    once: c.once.map(applyMockState),
  }));
  const allSet = {
    daily: buildAllSetBonus('daily', liveCategories),
    weekly: buildAllSetBonus('weekly', liveCategories),
  };
  return {
    streak: STREAK,
    dailyProgress: computeDailyProgress(liveCategories),
    ads,
    quest: fresh ? freshQuest : QUEST,
    categories: liveCategories,
    allSet,
  };
};

/** Credit a claim to the mock balance and answer in the response shape. */
const grantRewards = (id: string, granted: TaskReward[]): ClaimTaskResponse => {
  const rewards = granted.length ? granted : [lc(1)];
  const sum = (type: TaskRewardType) =>
    rewards.filter(r => r.type === type).reduce((s, r) => s + r.amount, 0);

  mockState.balance.lc += sum(TaskRewardType.LC);
  mockState.balance.tickets += sum(TaskRewardType.TICKETS);
  mockState.balance.activityPoints += sum(TaskRewardType.ACTIVITY_POINTS);
  // `mockState.balance` above is this fixture's own tally, reported back in
  // `newBalance`; the header, /lc and /stars read the shared mock player, so
  // the same reward has to land there or claiming a task moves nothing on screen.
  creditMockUser({
    lc: sum(TaskRewardType.LC),
    stars: sum(TaskRewardType.STARS),
    ap: sum(TaskRewardType.ACTIVITY_POINTS),
    description: 'Task reward',
    sourceId: id,
  });

  return { id, rewards, newBalance: { ...mockState.balance } };
};

const claimTaskHandler = (args: { body?: { id?: string } }) => {
  const id = args.body?.id ?? '';
  // The all-set bonuses live outside the categories and are built per response,
  // so they are resolved from a live build — otherwise claiming one 404s in dev
  // while working in production.
  const live = buildTasksResponse();
  const allTasks = [
    ...PROCESSED_CATEGORIES.flatMap(c => [...c.daily, ...c.weekly, ...c.once]),
    ...[live.allSet?.daily, live.allSet?.weekly].filter((t): t is Task => !!t),
  ];
  const found = allTasks.find(t => t.id === id);
  // Mirrors the backend: the bonus pays only once the whole set is done, and it
  // has no claimable sub-steps of its own (its rows are other tasks).
  if (found && (found.id === 't-70' || found.id === 't-71')) {
    if (mockState.claimedTaskIds.has(id))
      return { error: { status: 400, data: { message: 'Task already claimed' } } };
    if (found.status !== TaskStatus.READY_TO_CLAIM)
      return { error: { status: 400, data: { message: 'Milestone not reached yet' } } };
    mockState.claimedTaskIds.add(id);
    return grantRewards(id, found.rewards ?? []);
  }
  // Mirrors the live backend's `BadRequestException('Task already claimed')`.
  // The fixture used to pay out again on every repeat call, so a UI that let
  // the player tap a claimed row twice looked perfectly healthy in dev and only
  // showed its error modal on production.
  const alreadyClaimed = {
    error: { status: 400, data: { message: 'Task already claimed' } },
  };

  // Собирается задание целиком и только оно. Подшаги здесь когда-то платили
  // по-своему — поштучно и пачкой, — и это была выдумка мока: живой бэкенд
  // помечает каждый шаг `claimable: false`, наград им не даёт и `subStepIds`
  // в запросе игнорирует. Так что «в деве работало» означало ровно ничего.
  if (!found) return { error: { status: 404, data: { message: 'Task not found' } } };
  if (mockState.claimedTaskIds.has(id)) return alreadyClaimed;
  mockState.claimedTaskIds.add(id);
  return grantRewards(id, found.rewards ?? []);
};

export const tasksMock = {
  // Lazy: each `getTasks` call rebuilds response so post-claim refetch
  // sees mutated state (matches real backend behaviour).
  tasks: () => buildTasksResponse(),
  'POST tasks/claim': claimTaskHandler,
  'POST tasks/ads/watch': (args: { body?: { adId?: string; skipped?: boolean } }) => {
    const adId = args.body?.adId ?? '';
    const ads = buildAds();
    const slot = ads.slots.find(s => s.id === adId);
    // The server refuses a skip it did not grant, so the mock does too — a mock
    // that always says yes is how a refusal branch ships untested.
    if (args.body?.skipped) {
      // Shaped exactly like the server's answer — `403` with the reason as
      // `data.message` — because that shape is what the client branches on
      // (`isSkipRefusal`): it replays the tap as an ordinary view instead of
      // reporting a lost reward. Thrown as a plain Error it arrived as a mock
      // 500 with a string body, i.e. as "the network died", and the one branch
      // this refusal exists to drive never ran in dev.
      if ((ads.skip?.remaining ?? 0) <= 0)
        return { error: { status: 403, data: { message: 'ad-skip-exhausted' } } };
      ADS_SKIP.usedToday += 1;
    }
    if (adId) mockState.watchedAdIds.add(adId);
    const rewards = slot?.rewards ?? [ap(5)];
    rewards.forEach(r => {
      if (r.type === TaskRewardType.LC) mockState.balance.lc += r.amount;
      if (r.type === TaskRewardType.TICKETS) mockState.balance.tickets += r.amount;
      if (r.type === TaskRewardType.ACTIVITY_POINTS) mockState.balance.activityPoints += r.amount;
    });
    // …and onto the shared mock player, which is what the header and the
    // balance screens actually read (see `grantRewards`).
    const paid = (type: TaskRewardType) =>
      rewards.filter(r => r.type === type).reduce((s, r) => s + r.amount, 0);
    creditMockUser({
      lc: paid(TaskRewardType.LC),
      stars: paid(TaskRewardType.STARS),
      ap: paid(TaskRewardType.ACTIVITY_POINTS),
      description: 'Rewarded ad view',
      sourceId: adId,
    });
    return { adId, rewards };
  },
  // Telemetry for an attempt that paid nothing. Grants nothing and touches no
  // mock state on purpose — that is exactly what the real endpoint does.
  'POST tasks/ads/attempt': () => ({ status: 'recorded' }),
  /**
   * Price and payout for a purchase not made yet. Summed rung by rung the way
   * the server sums it — a flat `reward × count` would quote a total the buy
   * endpoint never pays, and dev would never see the difference.
   */
  'GET tasks/ads/extra/quote': (args: { params?: { count?: number | string } }) => {
    const count = Math.min(100, Math.max(1, Math.trunc(Number(args.params?.count ?? 1)) || 1));
    const perView = Array.from({ length: count }, (_, k) =>
      getPaidAdRewards(ADS_EXTRA.purchasedToday + k)
    );
    const sum = (type: TaskRewardType) =>
      perView.flat().reduce((s, r) => (r.type === type ? s + r.amount : s), 0);
    const rewards: TaskReward[] = [];
    if (sum(TaskRewardType.ACTIVITY_POINTS) > 0)
      rewards.push(ap(sum(TaskRewardType.ACTIVITY_POINTS)));
    if (sum(TaskRewardType.LC) > 0) rewards.push(rawLc(sum(TaskRewardType.LC)));
    if (sum(TaskRewardType.STARS) > 0) rewards.push(stars(sum(TaskRewardType.STARS)));
    if (sum(TaskRewardType.TICKETS) > 0)
      rewards.push({ ...tickets(sum(TaskRewardType.TICKETS)), label: 'bronze' });
    return {
      count,
      price: { lc: ADS_EXTRA.priceLc * count, ls: ADS_EXTRA.priceLs * count },
      rewards,
      perView: perView.slice(0, ADS_EXTRA_PREVIEW),
      grantsAp: true,
    };
  },
  'POST tasks/ads/extra': (args: { body?: { count?: number; currency?: 'lc' | 'ls' } }) => {
    const count = Math.max(1, Math.trunc(args.body?.count ?? 1));
    const currency = args.body?.currency === 'ls' ? 'ls' : 'lc';
    const remaining = Math.max(0, ADS_EXTRA.maxPerDay - ADS_EXTRA.purchasedToday);
    // Mirrors the server's refusals, so the dev UI meets the same walls.
    if (remaining <= 0) throw new Error('Daily limit on extra views reached');
    if (count > remaining) throw new Error(`Only ${remaining} extra view(s) left today`);

    const amount = count * (currency === 'ls' ? ADS_EXTRA.priceLs : ADS_EXTRA.priceLc);
    if (currency === 'lc') {
      if (mockState.balance.lc < amount) throw new Error('Not enough LC');
      mockState.balance.lc -= amount;
    }
    // The charge has to land on the shared mock player too, or the header and
    // the balance screens show the pre-purchase number after paying.
    chargeMockUser({
      lc: currency === 'lc' ? amount : 0,
      stars: currency === 'ls' ? amount : 0,
      description: 'Extra ad views',
      type: LcTransactionType.AD_EXTRA_VIEWS,
    });
    ADS_EXTRA.purchasedToday += count;

    const ads = buildAds();
    return {
      extra: ads.extra!,
      total: ads.total,
      watchedToday: ads.watchedToday,
      charged: { currency, amount },
    };
  },
};

export type TasksMock = typeof tasksMock;

const _ = DAY_MS;
void _;
