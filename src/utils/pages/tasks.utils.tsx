import { Eye, Share2, Trophy, UserPlus2, LucideIcon } from 'lucide-react';
import { TaskType } from '@/types/enums/tasks.enums';
import { ReactNode } from 'react';

export const TASK_ICON_MAP: Record<TaskType, LucideIcon> = {
  [TaskType.JOIN_TOURNAMENT]: Trophy,
  [TaskType.INVITE]: UserPlus2,
  [TaskType.VISIT]: Eye,
  [TaskType.SHARE]: Share2,
};

export const getTaskIcon = (type: TaskType, size: number = 14): ReactNode => {
  const Icon = TASK_ICON_MAP[type];
  return Icon ? <Icon size={size} /> : null;
};
