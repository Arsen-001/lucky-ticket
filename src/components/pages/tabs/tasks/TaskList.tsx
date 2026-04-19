import {
  Task,
  TaskCompletionBonus as TaskCompletionBonusType,
} from '@/types/interfaces/tasks.interfaces';
import { TaskCard } from './TaskCard';
import { TaskCompletionBonus } from './TaskCompletionBonus';
import { Progress } from '@/components/shared/Progress';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TaskCategoryType } from '@/types/enums/tasks.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

interface TaskListProps {
  tasks: Task[];
  progress: number;
  category: TaskCategoryType;
  completionBonus?: TaskCompletionBonusType;
  isLoading?: boolean;
  onAction: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskList({
  tasks,
  progress,
  category,
  completionBonus,
  isLoading,
  onAction,
  onClick,
}: TaskListProps) {
  const t = useAppTranslations();

  const content = isLoading ? [...Array(5)] : tasks;

  const categoryLabels: Record<TaskCategoryType, string> = {
    [TaskCategoryType.DAILY]: t('daily progress'),
    [TaskCategoryType.WEEKLY]: t('weekly progress'),
    [TaskCategoryType.MONTHLY]: t('monthly progress'),
  };

  const completedCount = tasks.filter(task => task.claimed).length;

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-1">
        <SkeletonSuspense
          loading={isLoading}
          skeleton={
            <Skeleton variant="line" textSize="sm" className="h-5 w-32 bg-gray-200 rounded" />
          }
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{categoryLabels[category]}</span>
            <span className="text-xs text-white/50">
              {t('{completed} of {total} tasks', {
                completed: completedCount,
                total: tasks.length,
              })}
            </span>
          </div>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" className="rounded-full" />}
        >
          <Progress
            percentage={progress}
            className="h-6"
            classNames={{
              children: 'left-4 h-2.5 font-semibold',
            }}
          >
            {progress}%
          </Progress>
        </SkeletonSuspense>
      </div>

      <div className="flex flex-col gap-1.5">
        {content.map((task, index) => (
          <TaskCard
            loading={isLoading}
            key={index}
            task={task}
            onAction={onAction}
            onClick={onClick}
          />
        ))}
      </div>

      {completionBonus && !isLoading && (
        <TaskCompletionBonus completionBonus={completionBonus} progress={progress} />
      )}
    </div>
  );
}
