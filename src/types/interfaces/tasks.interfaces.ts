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
  claimed?: boolean;
  reward?: TaskReward;
  /**
   * `false` marks a read-only checklist row — the all-set bonus lists the
   * other tasks of the period, and those are claimed on their own cards.
   * Absent means claimable, the shape every other task sends.
   */
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
  subStepIds?: string[];
}

export interface ClaimTaskResponse {
  id: string;
  rewards: TaskReward[];
  newBalance: { lc: number; tickets: number; activityPoints: number };
}
