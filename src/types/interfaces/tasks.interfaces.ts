import { TaskCategoryType, TaskType } from '@/types/enums/tasks.enums';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  reward: string;
  activityPoints: number;
  claimed: boolean;
  tournamentId?: string;
  visitLink?: string;
  shareLink?: string;
}

export interface TaskCompletionBonus {
  reward: string;
  claimed: boolean;
}

export interface TaskCategory {
  items: Task[];
  progress: number;
  completionBonus: TaskCompletionBonus;
}

export type TasksResponse = {
  [key in TaskCategoryType]: TaskCategory;
};
