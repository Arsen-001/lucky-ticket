'use client';

import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { TaskCategory, TaskStatus } from '@/types/enums/tasks.enums';
import type { Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';
import { TaskCategoryIcon } from './TaskCategoryIcon';
import { TaskItemCard } from './TaskItemCard';
import { TaskItemCardCompact } from './TaskItemCardCompact';
import { TaskItemRow } from './TaskItemRow';
import { SectionShine } from './SectionShine';
import { staggerMs } from '@/utils/global/animation.utils';
import { ClaimableDot } from '@/components/shared/badges/ClaimableDot';
import { layoutForTask, type TaskLayout } from '@/utils/pages/task-layout.utils';
import { AchievementTaskRow } from './AchievementTaskRow';

export interface TasksCategorySectionProps {
  category: TaskCategory;
  tasks: Task[];
  onClaim: (task: Task, bundleSubStepIds?: string[]) => void;
  onClaimSubStep?: (task: Task, step: TaskSubStep) => void;
  registerSection?: (category: TaskCategory, el: HTMLElement | null) => void;
  className?: string;
  emptyHint?: ReactNode;
  highlightToken?: number | null;
  taskHighlight?: { id: string; nonce: number } | null;
  /**
   * Card layout: `cards` = full cards (1-col), `grid` = compact tiles (2-col),
   * `rows` = compact single-line rows (1-col), `achievement-*` = the badge
   * shapes of the Achievements section (@see TaskLayout).
   */
  layout?: TaskLayout;
  /** Optional slot rendered between the section header and the task grid (e.g. milestone slider). */
  topSlot?: ReactNode;
  /**
   * Progressive disclosure: render only `initial` tasks at first; clicking
   * "See more" reveals `step` more, and "See all" reveals everything.
   */
  collapsible?: { initial: number; step: number };
  /** IDs of tasks pinned by the user — they float to the top of their status group. */
  pinnedIds?: Set<string>;
  /** Toggle pin/unpin for a task; bounded by `pinLimit` upstream. */
  onTogglePin?: (taskId: string) => void;
  /** Maximum number of tasks the user is allowed to pin (used to disable the button at limit). */
  pinLimit?: number;
  /**
   * Something in this category can be collected right now. Passed in rather
   * than read off `tasks`: the milestone chains render through `topSlot`, so a
   * section can hold a claimable card that never appears in this list.
   */
  hasClaimable?: boolean;
}

const STATUS_ORDER: Record<TaskStatus, number> = {
  [TaskStatus.READY_TO_CLAIM]: 0,
  [TaskStatus.IN_PROGRESS]: 1,
  [TaskStatus.COMPLETED]: 2,
  [TaskStatus.LOCKED]: 3,
};

const sortTasks = (tasks: Task[], pinnedIds?: Set<string>) =>
  [...tasks].sort((a, b) => {
    const ar = STATUS_ORDER[a.status];
    const br = STATUS_ORDER[b.status];
    if (ar !== br) return ar - br;
    // Within the same status group, pinned tasks float to the top.
    const ap = pinnedIds?.has(a.id) ? 0 : 1;
    const bp = pinnedIds?.has(b.id) ? 0 : 1;
    return ap - bp;
  });

const CATEGORY_LABEL_KEY: Record<TaskCategory, MessageIds> = {
  [TaskCategory.ADS]: 'category ads',
  [TaskCategory.TOURNAMENTS]: 'category tournaments',
  [TaskCategory.LEADERBOARD]: 'category leaderboard',
  [TaskCategory.SOCIAL]: 'category social',
  [TaskCategory.PROFILE]: 'category profile',
  [TaskCategory.FRIENDS]: 'category friends',
  [TaskCategory.QUEST]: 'category quest',
  [TaskCategory.ENGINES]: 'category engines',
  [TaskCategory.TICKETS]: 'category tickets',
  [TaskCategory.STAKES]: 'category stakes',
  [TaskCategory.STARS]: 'category stars',
  [TaskCategory.PROFILE_STATUS]: 'category profile-status',
  [TaskCategory.ACHIEVEMENTS]: 'category achievements',
  [TaskCategory.TEST_QUEST]: 'category test-quest',
  [TaskCategory.PARTNERS]: 'category partners',
};

const CATEGORY_BLURB_KEY: Record<TaskCategory, MessageIds> = {
  [TaskCategory.ADS]: 'category ads blurb',
  [TaskCategory.TOURNAMENTS]: 'category tournaments blurb',
  [TaskCategory.LEADERBOARD]: 'category leaderboard blurb',
  [TaskCategory.SOCIAL]: 'category social blurb',
  [TaskCategory.PROFILE]: 'category profile blurb',
  [TaskCategory.FRIENDS]: 'category friends blurb',
  [TaskCategory.QUEST]: 'category quest blurb',
  [TaskCategory.ENGINES]: 'category engines blurb',
  [TaskCategory.TICKETS]: 'category tickets blurb',
  [TaskCategory.STAKES]: 'category stakes blurb',
  [TaskCategory.STARS]: 'category stars blurb',
  [TaskCategory.PROFILE_STATUS]: 'category profile-status blurb',
  [TaskCategory.ACHIEVEMENTS]: 'category achievements blurb',
  [TaskCategory.TEST_QUEST]: 'category test-quest blurb',
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
  taskHighlight,
  layout = 'cards',
  topSlot,
  collapsible,
  pinnedIds,
  onTogglePin,
  pinLimit,
  hasClaimable = false,
}: TasksCategorySectionProps) {
  const t = useAppTranslations();

  const sorted = useMemo(() => sortTasks(tasks, pinnedIds), [tasks, pinnedIds]);
  const isEmpty = sorted.length === 0;
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(
    collapsible ? Math.min(collapsible.initial, sorted.length) : sorted.length
  );
  const visibleTasks = collapsible ? sorted.slice(0, visibleCount) : sorted;
  const hasMore = collapsible ? visibleCount < sorted.length : false;
  const isExpandedBeyondInitial = !!collapsible && visibleCount > collapsible.initial;
  const remaining = sorted.length - visibleCount;
  const sectionRef = useRef<HTMLElement | null>(null);
  // After the initial slide-in entry plays (≈400ms + last item delay), stop
  // applying the animation class so re-renders (e.g. pin toggle re-orders the
  // list) don't make every card flicker again.
  const [entryDone, setEntryDone] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setEntryDone(true), 800);
    return () => window.clearTimeout(id);
  }, []);
  const handleShowLess = () => {
    if (!collapsible) return;
    setVisibleCount(collapsible.initial);
    // Defer scroll until the layout shrinks so the target offset is correct.
    requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <section
      ref={el => {
        sectionRef.current = el;
        registerSection?.(category, el);
      }}
      data-category={category}
      className={twMerge(
        'flex flex-col gap-3 px-4 pt-5 pb-5 scroll-mt-20 border-y border-white/[0.07]',
        className
      )}
    >
      <header className="relative flex items-center gap-3 rounded-2xl overflow-hidden">
        <SectionShine token={highlightToken ?? null} />
        <TaskCategoryIcon category={category} size={20} />
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 text-base font-extrabold leading-tight">
            <span className="min-w-0 truncate">{t(CATEGORY_LABEL_KEY[category])}</span>
            {/* Sections are tall and the ready row can sit far below the fold —
                the header says there is one before the scroll does. */}
            {hasClaimable && <ClaimableDot label={t('something to claim')} />}
          </h2>
          <p className="text-[11px] text-pink-secondary line-clamp-1">
            {t(CATEGORY_BLURB_KEY[category])}
          </p>
        </div>
      </header>

      {topSlot}

      {isEmpty && !topSlot ? (
        <div className="rounded-2xl bg-white/5 border border-white/5 px-4 py-6 text-center text-sm text-white/50">
          {emptyHint ?? t('no tasks here yet')}
        </div>
      ) : isEmpty ? null : (
        <>
          <div
            className={twMerge(
              layout === 'grid' ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-2'
            )}
          >
            {visibleTasks.map((task, i) => {
              const isPinned = pinnedIds?.has(task.id) ?? false;
              const pinDisabled = !isPinned && !!pinLimit && (pinnedIds?.size ?? 0) >= pinLimit;
              const animationClass = entryDone ? undefined : 'animate-slide-in-bottom';
              const animationStyle = entryDone
                ? undefined
                : { animationDelay: `${staggerMs(i, 60)}ms` };
              const taskShine = taskHighlight?.id === task.id ? taskHighlight.nonce : null;
              // Not the section's `layout` directly: a task carrying sub-steps
              // is drawn as a card wherever it sits, because the other two
              // shapes drop its steps without a word. @see layoutForTask
              const taskLayout = layoutForTask(task, layout);
              if (taskLayout === 'achievement-row') {
                return (
                  <AchievementTaskRow
                    key={task.id}
                    task={task}
                    onClaim={onClaim}
                    highlightToken={taskShine}
                    className={animationClass}
                    style={animationStyle}
                  />
                );
              }
              if (taskLayout === 'grid') {
                return (
                  <TaskItemCardCompact
                    key={task.id}
                    task={task}
                    onClaim={onClaim}
                    highlightToken={taskShine}
                    className={animationClass}
                    style={animationStyle}
                    pinned={isPinned}
                    pinDisabled={pinDisabled}
                    onTogglePin={onTogglePin}
                  />
                );
              }
              if (taskLayout === 'rows') {
                return (
                  <TaskItemRow
                    key={task.id}
                    task={task}
                    onClaim={onClaim}
                    highlightToken={taskShine}
                    className={animationClass}
                    style={animationStyle}
                  />
                );
              }
              return (
                <TaskItemCard
                  key={task.id}
                  task={task}
                  onClaim={onClaim}
                  onClaimSubStep={onClaimSubStep}
                  expanded={openTaskId === task.id}
                  onToggleExpanded={() =>
                    setOpenTaskId(prev => (prev === task.id ? null : task.id))
                  }
                  highlightToken={taskShine}
                  // A card promoted out of a two-column grid takes the full
                  // width — at half of it the accordion's rows are unreadable.
                  className={twMerge(animationClass, layout === 'grid' && 'col-span-2')}
                  style={animationStyle}
                  pinned={isPinned}
                  pinDisabled={pinDisabled}
                  onTogglePin={onTogglePin}
                />
              );
            })}
          </div>

          {collapsible && (hasMore || isExpandedBeyondInitial) && (
            <div
              className={twMerge(
                'flex items-center gap-2 mt-1',
                // While expanded beyond initial, glue the action row to the
                // bottom of the viewport (above the tab bar) so the user can
                // collapse from anywhere in the long list.
                isExpandedBeyondInitial &&
                  'sticky bottom-[0px] z-10 -mx-4 px-4 py-2 bg-background/85 backdrop-blur-md rounded-xl'
              )}
            >
              <button
                type="button"
                onClick={() =>
                  setVisibleCount(prev => Math.min(prev + collapsible.step, sorted.length))
                }
                disabled={!hasMore}
                className={twMerge(
                  'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]',
                  hasMore
                    ? 'bg-electric-pink/15 border border-electric-pink/30 text-white hover:bg-electric-pink/25'
                    : 'bg-white/[0.04] text-white/25 cursor-not-allowed active:scale-100'
                )}
              >
                {t('see more')}
                {hasMore && (
                  <span className="text-white ms-1">
                    (+{Math.min(collapsible.step, remaining)})
                  </span>
                )}
              </button>
              {isExpandedBeyondInitial && (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="flex-1 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all py-2.5 text-xs font-bold text-white/70"
                >
                  {t('show less')}
                </button>
              )}
              <button
                type="button"
                onClick={() => setVisibleCount(sorted.length)}
                disabled={!hasMore}
                className={twMerge(
                  'flex-1 rounded-xl py-2.5 text-xs font-bold transition-all active:scale-[0.98]',
                  hasMore
                    ? 'bg-electric-pink/15 border border-electric-pink/30 text-white hover:bg-electric-pink/25'
                    : 'bg-white/[0.04] text-white/25 cursor-not-allowed active:scale-100'
                )}
              >
                {t('see all')}
                {hasMore && <span className="text-white ms-1">({remaining})</span>}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
}
