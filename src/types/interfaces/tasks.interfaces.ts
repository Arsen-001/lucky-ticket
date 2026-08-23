import {
  TaskCategory,
  TaskFrequency,
  TaskRarity,
  TaskRewardType,
  TaskStatus,
} from '@/types/enums/tasks.enums';
import type { Route } from '@/constants/routes';
import type { TicketsEnum } from '@/types/enums/ticket.enums';
import type { LocalizedText } from '@/types/interfaces/faq.interfaces';

export interface TaskReward {
  type: TaskRewardType;
  amount: number;
  label?: string;
}

export interface TaskSubStep {
  id: string;
  /**
   * Server-authored, so localized like every other task string. Counter-driven
   * steps send a bare `"2 / 4"`; the all-set bonus sends the member task's own
   * title, which has to be readable in the player's language. Render with
   * `useLocalized()`, never directly.
   */
  label: LocalizedText | string;
  completed: boolean;
  /**
   * Всё, что сервер шлёт про сбор шага, и всё это уже не значит ничего.
   *
   * Подшаги — это чек-лист прогресса, а не лестница наград: задание платит то,
   * что написано на его карточке, один раз и целиком. Маппер бэкенда ставит
   * `claimable: false` каждому шагу в обеих ветках и не кладёт `reward`, а
   * `subStepIds` в запросе на сбор принимает и игнорирует. Поля оставлены,
   * потому что они реально приезжают по проводу; ЧИТАТЬ их не надо — экран
   * рисует только «сделано / не сделано».
   */
  claimed?: boolean;
  reward?: TaskReward;
  claimable?: boolean;
}

export interface TaskChainContribution {
  chainId: string;
  amount: number;
}

export interface Task {
  id: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  status: TaskStatus;
  rarity: TaskRarity;
  /**
   * Server-authored copy, not an i18n key — tasks are editable in the admin
   * panel, so their text ships without a deploy. `string` stays in the union
   * for rows written before the column was localized; render with
   * `useLocalized()`, never directly.
   */
  title: LocalizedText | string;
  subtitle?: LocalizedText | string;
  rewards: TaskReward[];
  progress: { current: number; target: number };
  resetAt?: string;
  unlockHint?: LocalizedText | string;
  deeplink?: Route | string;
  externalLink?: string;
  subSteps?: TaskSubStep[];
  tier?: `${TicketsEnum}` | 'all';
  chainContribution?: TaskChainContribution;
}

export interface QuestStep {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  rewards: TaskReward[];
}

export interface Quest {
  id: string;
  title: string;
  subtitle: string;
  rarity: TaskRarity;
  steps: QuestStep[];
  finalReward: TaskReward[];
  expiresAt?: string;
}

export interface AdSlot {
  id: string;
  index: number;
  rewards: TaskReward[];
  watched: boolean;
  /** This slot was bought — it sits past the free daily cap. */
  paid?: boolean;
  /**
   * This view may be taken WITHOUT playing an ad — the Lucky Player skip
   * (`AdsSkipAllowance`). The server decides it per slot because the allowance
   * runs out mid-day: the next slot can be skippable while the one after it is
   * not. Absent on an older backend = no skip.
   */
  skippable?: boolean;
}

/**
 * The status skip allowance for today (DOCS §7.3): views a Lucky Player may
 * take without watching anything, paid exactly as if they had.
 *
 * `total` is already clamped by the server to the player's own daily cap, so
 * the app can print it as-is. Zeros for everyone without the status — the UI
 * branches on `remaining > 0`, never on the status flag.
 */
export interface AdsSkipAllowance {
  total: number;
  usedToday: number;
  remaining: number;
}

/** The paid-extra-views offer as the server currently prices it (DOCS §12.5). */
export interface AdsExtraOffer {
  enabled: boolean;
  priceLc: number;
  priceLs: number;
  /** Ceiling on slots bought per day, on top of the free cap; null = none. */
  maxPerDay: number | null;
  purchasedToday: number;
  /** How many of the bought slots have already been watched. */
  watchedToday: number;
  /**
   * Still buyable today — the client must never offer more than this. `null`
   * means the ceiling is off entirely, and the only limit is the balance; it
   * is deliberately not a large number, so "∞" can never render as "999 left".
   */
  remaining: number | null;
  /** The ceiling is lifted — buy as much as the balance allows. */
  unlimited?: boolean;
  /** A bought view pays AP too. Off = everything except AP. */
  grantsAp: boolean;
  /**
   * What the next bought views pay, in the order they will be watched — the
   * server reads its PAID ladder from the day's first bought view, so this is
   * the only place the app learns what the offer is actually selling. Absent on
   * an older backend; the card then states the price alone, as it used to.
   */
  nextRewards?: TaskReward[][];
  /**
   * The same for views bought with Stars — they are paid from their own ladder.
   * A star-bought view that paid a star back handed the price straight back to
   * the buyer, so the two purchases stopped being the same trade. Absent = the
   * backend has no star ladder and both read the LC one.
   */
  nextRewardsLs?: TaskReward[][];
}

/**
 * Price and payout of a purchase the player has NOT made yet
 * (`GET /tasks/ads/extra/quote?count=N`).
 *
 * Server-summed on purpose: the paid ladder climbs, so multiplying one view's
 * reward by `count` quotes a total the grant path never pays.
 */
export interface AdsExtraQuote {
  count: number;
  /** The currency this quote was priced AND paid for; the two ladders differ. */
  currency?: 'lc' | 'ls';
  price: { lc: number; ls: number };
  /** The whole purchase, summed per reward type. */
  rewards: TaskReward[];
  /** The first few views of it, one entry each, for a per-view breakdown. */
  perView: TaskReward[][];
  grantsAp: boolean;
}

export interface AdsBlock {
  /** Admin kill switch — when false the rewarded-ads UI must not render. */
  enabled: boolean;
  /** Free + bought slots; `free` is where the bought ones begin. */
  total: number;
  free?: number;
  watchedToday: number;
  resetAt: string;
  slots: AdSlot[];
  /** Absent on an older backend — treat as "no skips granted". */
  skip?: AdsSkipAllowance;
  /** Absent on an older backend — treat as "not for sale". */
  extra?: AdsExtraOffer;
}

export interface BuyExtraAdViewsRequest {
  count: number;
  currency: 'lc' | 'ls';
}

export interface BuyExtraAdViewsResponse {
  extra: AdsExtraOffer;
  /** The new daily ceiling: free cap + everything bought today. */
  total: number;
  watchedToday: number;
  charged: { currency: 'lc' | 'ls'; amount: number };
}

export interface StreakMilestone {
  day: number;
  reward: TaskReward;
  reached: boolean;
}

export interface StreakInfo {
  currentDays: number;
  bestDays: number;
  nextMilestoneDay: number;
  upcomingMilestones: StreakMilestone[];
}

export interface DailyProgressInfo {
  completedToday: number;
  totalToday: number;
  readyToClaim: number;
}

export interface PartnerTask extends Task {
  partnerName: string;
  partnerLogo?: string;
  partnerColor?: string;
}

export type CategoryTasks = {
  category: TaskCategory;
  daily: Task[];
  weekly: Task[];
  once: Task[];
};

export interface TasksResponse {
  streak: StreakInfo;
  dailyProgress: DailyProgressInfo;
  ads: AdsBlock;
  quest: Quest | null;
  categories: CategoryTasks[];
  /**
   * The all-set completion bonus of each period (DOCS §12.4) — "complete every
   * daily task" and its weekly twin. They travel outside `categories` because
   * they sweep the whole period rather than one category, and the client pins
   * them above the list.
   *
   * `null` on a side means the period has too few tasks to bonus; the whole
   * field is absent on an older backend, and the card simply is not drawn.
   */
  allSet?: { daily: Task | null; weekly: Task | null };
}

export interface ClaimTaskRequest {
  id: string;
}

export interface ClaimTaskResponse {
  id: string;
  rewards: TaskReward[];
  newBalance: { lc: number; tickets: number; activityPoints: number };
}
