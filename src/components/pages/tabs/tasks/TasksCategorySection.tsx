'use client';

import { type ReactNode, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TaskCategory, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskItemCard } from './TaskItemCard';
import { SectionShine } from './SectionShine';

export interface TasksCategorySectionProps {
  category: TaskCategory;
  tasks: Task[];
  onClaim: (task: Task, bundleSubStepIds?: string[]) => void;
  onClaimSubStep?: (task: Task, step: TaskSubStep) => void;
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
  emptyHint?: ReactNode;
  highlightToken?: number | null;
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  [TaskStatus.READY_TO_CLAIM]: 0,
  [TaskStatus.IN_PROGRESS]: 1,
  [TaskStatus.COMPLETED]: 2,
  [TaskStatus.LOCKED]: 3,
};

const sortTasks = (tasks: Task[]) =>
  [...tasks].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]);

const CATEGORY_LABEL_KEY: Record<TaskCategory, MessageIds> = {
  [TaskCategory.ADS]: 'category ads',
  [TaskCategory.TOURNAMENTS]: 'category tournaments',
  [TaskCategory.SOCIAL]: 'category social',
  [TaskCategory.PROFILE]: 'category profile',
  [TaskCategory.FRIENDS]: 'category friends',
  [TaskCategory.QUEST]: 'category quest',
  [TaskCategory.MARKET]: 'category market',
  [TaskCategory.STAKES]: 'category stakes',
  [TaskCategory.PREMIUM]: 'category premium',
  [TaskCategory.VIP]: 'category vip',
  [TaskCategory.ACHIEVEMENTS]: 'category achievements',
  [TaskCategory.PARTNERS]: 'category partners',
};

const CATEGORY_BLURB_KEY: Record<TaskCategory, MessageIds> = {
  [TaskCategory.ADS]: 'category ads blurb',
  [TaskCategory.TOURNAMENTS]: 'category tournaments blurb',
  [TaskCategory.SOCIAL]: 'category social blurb',
  [TaskCategory.PROFILE]: 'category profile blurb',
  [TaskCategory.FRIENDS]: 'category friends blurb',
  [TaskCategory.QUEST]: 'category quest blurb',
  [TaskCategory.MARKET]: 'category market blurb',
  [TaskCategory.STAKES]: 'category stakes blurb',
  [TaskCategory.PREMIUM]: 'category premium blurb',
  [TaskCategory.VIP]: 'category vip blurb',
  [TaskCategory.ACHIEVEMENTS]: 'category achievements blurb',
  [TaskCategory.PARTNERS]: 'category partners blurb',
};

export function TasksCategorySection({
  category,
  tasks,
  onClaim,
  onClaimSubStep,
  registerSection,
  className,
  emptyHint,
  highlightToken,
}: TasksCategorySectionProps) {
  const t = useAppTranslations();

  const sorted = useMemo(() => sortTasks(tasks), [tasks]);
  const isEmpty = sorted.length === 0;
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  return (
    <section
      ref={el => registerSection?.(category, el)}
      data-category={category}
      className={twMerge('flex flex-col gap-3 px-4 pt-5 pb-1 scroll-mt-20', className)}
    >
      <header className="relative flex items-center gap-3 rounded-2xl overflow-hidden">
        <SectionShine token={highlightToken ?? null} />
        <TaskCategoryIcon category={category} size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-extrabold leading-tight">
            {t(CATEGORY_LABEL_KEY[category])}
          </h2>
          <p className="text-[11px] text-pink-secondary line-clamp-1">
            {t(CATEGORY_BLURB_KEY[category])}
          </p>
        </div>
      </header>

      {isEmpty ? (
        <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-6 text-center text-sm text-white/50">
          {emptyHint ?? t('no tasks here yet')}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((task, i) => (
            <TaskItemCard
              key={task.id}
              task={task}
              onClaim={onClaim}
              onClaimSubStep={onClaimSubStep}
              expanded={openTaskId === task.id}
              onToggleExpanded={() => setOpenTaskId(prev => (prev === task.id ? null : task.id))}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
