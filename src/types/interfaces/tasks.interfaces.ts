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
  label: string;
  completed: boolean;
  claimed?: boolean;
  reward?: TaskReward;
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
}

export interface AdsBlock {
  /** Admin kill switch — when false the rewarded-ads UI must not render. */
  enabled: boolean;
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
  newBalance: { lc: number; tickets: number; activityPoints: number };
}
