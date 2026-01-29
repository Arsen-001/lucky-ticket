import { Task } from '@/types/interfaces/tasks.interfaces';
import { TaskCard } from './TaskCard';
import { Progress } from '@/components/shared/Progress';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

interface TaskListProps {
  tasks: Task[];
  progress: number;
  isLoading?: boolean;
  onAction: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskList({ tasks, progress, isLoading, onAction, onClick }: TaskListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 mt-4">
        <Skeleton variant="line" className="rounded-full" />
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

  return (
    <div className="flex flex-col gap-4 mt-4">
      <Progress
        percentage={progress}
        className="h-6"
        classNames={{
          children: 'left-4 h-2.5 font-semibold',
        }}
      >
        {progress}%
      </Progress>

      <div className="flex flex-col gap-1.5">
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} onAction={onAction} onClick={onClick} />
        ))}
      </div>
    </div>
  );
}
