import {
  TaskCategory,
  TaskFrequency,
  TaskRarity,
  TaskRewardType,
  TaskStatus,
} from '@/types/enums/tasks.enums';
import type { Route } from '@/constants/routes';
import type { TicketsEnum } from '@/types/enums/ticket.enums';

export interface TaskReward {
  type: TaskRewardType;
  amount: number;
  label?: string;
}

export interface TaskSubStep {
  id: string;
  label: string;
  completed: boolean;
  claimed?: boolean;
  reward?: TaskReward;
}

/**
 * A user-facing task. All human-readable strings (title / subtitle / unlockHint /
 * subSteps[].label) are expected to be **pre-localized by the backend** based on
 * the user's selected language. The frontend renders them as-is and never
 * parses or re-translates their content.
 */
export interface Task {
  id: string;
  category: TaskCategory;
  frequency: TaskFrequency;
  status: TaskStatus;
  rarity: TaskRarity;
  /** Pre-localized title, e.g. "Reach top 10". */
  title: string;
  /** Optional pre-localized subtitle / description. */
  subtitle?: string;
  rewards: TaskReward[];
  progress: { current: number; target: number };
  /** ISO timestamp when this task resets (daily / weekly only). */
  resetAt?: string;
  /** Pre-localized hint shown when the task is LOCKED (e.g. "Reach Silver first."). */
  unlockHint?: string;
  /** In-app deeplink that the card navigates to when tapped (overrides externalLink). */
  deeplink?: Route | string;
  /** Outside-app URL — opened in a new tab. */
  externalLink?: string;
  subSteps?: TaskSubStep[];
  /** Tier this task belongs to — drives gating and tier-themed rendering. */
  tier?: `${TicketsEnum}` | 'all';
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
}

export interface AdsBlock {
  total: number;
  watchedToday: number;
  resetAt: string;
  slots: AdSlot[];
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
}

export interface ClaimTaskRequest {
  id: string;
  subStepIds?: string[];
}

export interface ClaimTaskResponse {
  id: string;
  rewards: TaskReward[];
  newBalance: { ltc: number; tickets: number; activityPoints: number };
}
