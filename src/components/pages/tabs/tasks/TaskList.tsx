import { Task } from '@/types/interfaces/tasks.interfaces';
import { TaskCard } from './TaskCard';
import { Progress } from '@/components/shared/Progress';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TaskCategoryType } from '@/types/enums/tasks.enums';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface TaskListProps {
  tasks: Task[];
  progress: number;
  category: TaskCategoryType;
  isLoading?: boolean;
  onAction: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskList({
  tasks,
  progress,
  category,
  isLoading,
  onAction,
  onClick,
}: TaskListProps) {
  const t = useAppTranslations();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col gap-2">
          <Skeleton variant="line" textSize="sm" className="h-5 w-32 bg-gray-200 rounded" />
          <Skeleton variant="line" className="rounded-full" />
        </div>
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[500px] pr-1 scrollbar-hidden">
          {[...Array(5)].map((_, index) => (
            <TaskCard
              key={index}
              loading={true}
              task={{} as Task}
              onAction={() => {}}
              onClick={() => {}}
            />
          ))}
        </div>
      </div>
    );
  }

  const categoryLabels: Record<TaskCategoryType, string> = {
    [TaskCategoryType.DAILY]: t('daily progress'),
    [TaskCategoryType.WEEKLY]: t('weekly progress'),
    [TaskCategoryType.MONTHLY]: t('monthly progress'),
  };

  return (
    <div className="flex flex-col gap-4 mt-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-bold text-white">{categoryLabels[category]}</span>
        <Progress
          percentage={progress}
          className="h-6"
          classNames={{
            children: 'left-4 h-2.5 font-semibold',
          }}
        >
          {progress}%
        </Progress>
      </div>

      <div className="flex flex-col gap-1.5">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onAction={onAction} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}
