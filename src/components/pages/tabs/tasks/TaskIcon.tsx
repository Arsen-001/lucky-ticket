import { TaskType } from '@/types/enums/tasks.enums';
import { Eye, LucideIcon, type LucideProps, Share2, Trophy, UserPlus2 } from 'lucide-react';

export interface TaskIconProps extends LucideProps {
  type: TaskType;
}

export function TaskIcon({ type, ...props }: TaskIconProps) {
  const TASK_ICON_MAP: Record<TaskType, LucideIcon> = {
    [TaskType.JOIN_TOURNAMENT]: Trophy,
    [TaskType.INVITE]: UserPlus2,
    [TaskType.VISIT]: Eye,
    [TaskType.SHARE]: Share2,
  };
  const Icon = TASK_ICON_MAP[type];
  return Icon ? <Icon {...props} /> : null;
}
