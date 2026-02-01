'use client';

import { Task } from '@/types/interfaces/tasks.interfaces';
import { TaskType } from '@/types/enums/tasks.enums';
import { Button } from '@/components/shared/buttons/Button';
import { CheckCircle2 } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TaskIcon } from '@/components/pages/tabs/tasks/TaskIcon';

interface TaskCardProps {
  task: Task;
  loading?: boolean;
  onAction: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, loading, onAction, onClick }: TaskCardProps) {
  const t = useAppTranslations();

  const buttonTextObj = {
    [TaskType.SHARE]: t('share'),
    [TaskType.INVITE]: t('invite'),
    [TaskType.JOIN_TOURNAMENT]: t('join'),
    [TaskType.VISIT]: t('visit'),
  };

  return (
    <div
      className="bg-background-overlay transition-colors rounded-xl px-3 py-2 flex flex-col gap-2 cursor-pointer"
      onClick={() => !loading && onClick(task)}
    >
      <div className="flex justify-between items-center gap-3">
        <div className="flex-1 overflow-hidden flex flex-col gap-px">
          <div className="mb-1">
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="sm" className="w-10/12" />}
            >
              <h4 className="font-semibold leading-tight truncate">{task.title}</h4>
            </SkeletonSuspense>
          </div>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="w-full" />}
          >
            <p className="text-white-secondary text-sm line-clamp-1">{task.description}</p>
          </SkeletonSuspense>

          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="sm" className="w-2/3" />}
          >
            <p className="text-pink-secondary text-sm">
              {t('reward')}: {task.reward}
            </p>
          </SkeletonSuspense>
        </div>

        <div className="flex-center flex-col">
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="card" className="rounded-full min-w-23 h-7.25" />}
          >
            <Button
              disabled={task.claimed}
              className={twMerge('rounded-full min-w-23 flex-center gap-1 text-sm  p-1.5')}
              onClick={e => {
                e.stopPropagation();
                onAction(task);
              }}
            >
              <TaskIcon size={14} type={task.type} />
              <span className="h-4.25 font-semibold">{buttonTextObj[task.type]}</span>
            </Button>
          </SkeletonSuspense>
          {task.claimed && (
            <div className="flex items-center gap-1 text-xs text-success font-medium mt-1">
              <CheckCircle2 size={10} className="stroke-3" />
              <span className="h-3.5 font-semibold">{t('claimed')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
