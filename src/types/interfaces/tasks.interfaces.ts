import { TaskCategoryType, TaskType } from '@/types/enums/tasks.enums';

export interface Task {
  id: string;
  type: TaskType;
  title: string;
  description: string;
  reward: string;
  claimed: boolean;
  tournamentId?: string;
  visitLink?: string;
  shareLink?: string;
}

export interface TaskCategory {
  items: Task[];
  progress: number;
}

export type TasksResponse = {
  [key in TaskCategoryType]: TaskCategory;
};
