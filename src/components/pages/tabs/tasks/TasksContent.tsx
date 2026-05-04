'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useGetTasksQuery, useClaimTaskMutation, useWatchAdMutation } from '@/api/tasks.api';
import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type {
  AdSlot,
  CategoryTasks,
  ClaimTaskResponse,
  QuestStep,
  Task,
  TaskSubStep,
} from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TasksHeader } from './TasksHeader';
import { TasksFrequencyTabs } from './TasksFrequencyTabs';
import { TasksCategoryNav, type CategoryNavItem } from './TasksCategoryNav';
import { TasksCategorySection } from './TasksCategorySection';
import { AdsSection } from './AdsSection';
import { QuestSection } from './QuestSection';
import { ClaimRewardModal } from './ClaimRewardModal';

const triggerHaptic = (type: 'light' | 'medium' = 'light') => {
  if (typeof window === 'undefined') return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tg: any = (window as any).Telegram?.WebApp?.HapticFeedback;
  if (!tg) return;
  try {
    tg.impactOccurred(type);
  } catch {
    /* noop */
  }
};

function TasksSkeleton() {
  return (
    <div className="px-4 pt-3 flex flex-col gap-4">
      <div className="flex justify-between items-center gap-3">
        <Skeleton variant="line" className="w-32 h-7" />
        <div className="flex gap-2">
          <Skeleton variant="card" className="w-16 h-16 rounded-full" />
          <Skeleton variant="card" className="w-16 h-16 rounded-2xl" />
        </div>
      </div>
      <Skeleton variant="card" className="w-full h-10 rounded-full" />
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="card" className="w-28 h-10 rounded-full shrink-0" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="card" className="w-full h-20 rounded-2xl" />
      ))}
    </div>
  );
}

function EmptyAllDone({ resetAt }: { resetAt?: string }) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(resetAt);
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center gap-2">
      <div className="text-2xl font-extrabold">{t('all done today')}</div>
      <p className="text-sm text-white-secondary max-w-[280px]">{t('all done description')}</p>
      {!expired && (
        <p className="text-xs text-pink-secondary mt-1">
          {t('next reset in {time}', { time: leftTime })}
        </p>
      )}
    </div>
  );
}

const tasksForFrequency = (cat: CategoryTasks, frequency: TaskFrequency): Task[] => {
  if (frequency === TaskFrequency.DAILY) return cat.daily;
  if (frequency === TaskFrequency.WEEKLY) return cat.weekly;
  return cat.once;
};

export function TasksContent() {
  const t = useAppTranslations();
  const searchParams = useSearchParams();
  const { data, isLoading, refetch } = useGetTasksQuery();
  const [claimTask, claimState] = useClaimTaskMutation();
  const [watchAd, watchState] = useWatchAdMutation();

  const initialFrequency = ((): TaskFrequency => {
    const v = searchParams?.get('frequency');
    if (v === 'weekly') return TaskFrequency.WEEKLY;
    if (v === 'once') return TaskFrequency.ONCE;
    return TaskFrequency.DAILY;
  })();
  const [activeFrequency, setActiveFrequency] = useState<TaskFrequency>(initialFrequency);
  const [activeCategory, setActiveCategory] = useState<TaskCategory | null>(null);

  // Keep activeFrequency in sync when URL changes (e.g. user navigates here from a substep deeplink)
  useEffect(() => {
    const v = searchParams?.get('frequency');
    if (v === 'daily' && activeFrequency !== TaskFrequency.DAILY) {
      setActiveFrequency(TaskFrequency.DAILY);
    } else if (v === 'weekly' && activeFrequency !== TaskFrequency.WEEKLY) {
      setActiveFrequency(TaskFrequency.WEEKLY);
    } else if (v === 'once' && activeFrequency !== TaskFrequency.ONCE) {
      setActiveFrequency(TaskFrequency.ONCE);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [highlightToken, setHighlightToken] = useState<{
    category: TaskCategory;
    nonce: number;
  } | null>(null);
  const [pendingClaim, setPendingClaim] = useState<{
    id: string;
    open: boolean;
    result?: ClaimTaskResponse | null;
  }>({ id: '', open: false, result: null });
  const [locallyCompletedIds, setLocallyCompletedIds] = useState<Set<string>>(new Set());

  const sectionRefs = useRef<Map<TaskCategory, HTMLElement>>(new Map());
  const scrollLockUntilRef = useRef(0);
  const stickyNavRef = useRef<HTMLDivElement | null>(null);

  const registerSection = (category: TaskCategory, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(category, el);
    else sectionRefs.current.delete(category);
  };

  // Find the nearest scrollable ancestor (the overflow-auto wrapper in tabs layout).
  const findScroller = (el: HTMLElement | null): HTMLElement | null => {
    let cur: HTMLElement | null = el;
    while (cur && cur !== document.body) {
      const oy = window.getComputedStyle(cur).overflowY;
      if ((oy === 'auto' || oy === 'scroll') && cur.scrollHeight > cur.clientHeight) return cur;
      cur = cur.parentElement;
    }
    return null;
  };

  // Counts for the frequency tabs (number of ready-to-claim across all categories per frequency)
  const frequencyCounts = useMemo<Record<TaskFrequency, number>>(() => {
    const counts: Record<TaskFrequency, number> = {
      [TaskFrequency.DAILY]: 0,
      [TaskFrequency.WEEKLY]: 0,
      [TaskFrequency.ONCE]: 0,
    };
    if (!data) return counts;
    const isReady = (t: Task) => t.status === TaskStatus.READY_TO_CLAIM;
    data.categories.forEach(cat => {
      counts[TaskFrequency.DAILY] += cat.daily.filter(isReady).length;
      counts[TaskFrequency.WEEKLY] += cat.weekly.filter(isReady).length;
      counts[TaskFrequency.ONCE] += cat.once.filter(isReady).length;
    });
    if (data.ads) {
      counts[TaskFrequency.DAILY] += data.ads.slots.filter(s => !s.watched).length;
    }
    if (data.quest) {
      counts[TaskFrequency.ONCE] += data.quest.steps.filter(
        s => s.status === TaskStatus.READY_TO_CLAIM
      ).length;
    }
    return counts;
  }, [data]);

  // Visible categories + their ready counts for the current frequency
  const navItems: CategoryNavItem[] = useMemo(() => {
    const items: CategoryNavItem[] = [];
    if (!data) return items;

    if (activeFrequency === TaskFrequency.DAILY && data.ads && data.ads.slots.length) {
      items.push({
        category: TaskCategory.ADS,
        readyCount: data.ads.slots.filter(s => !s.watched).length,
      });
    }
    if (activeFrequency === TaskFrequency.ONCE && data.quest) {
      items.push({
        category: TaskCategory.QUEST,
        readyCount: data.quest.steps.filter(s => s.status === TaskStatus.READY_TO_CLAIM).length,
      });
    }
    data.categories.forEach(cat => {
      const tasks = tasksForFrequency(cat, activeFrequency);
      if (!tasks.length) return;
      const ready = tasks.filter(t => t.status === TaskStatus.READY_TO_CLAIM).length;
      items.push({ category: cat.category, readyCount: ready });
    });
    return items;
  }, [data, activeFrequency]);

  // Reset highlighted chip when frequency changes
  useEffect(() => {
    setActiveCategory(navItems[0]?.category ?? null);
  }, [activeFrequency, navItems]);

  // When URL has ?category=..., scroll to that section once it's registered
  useEffect(() => {
    if (!data) return;
    const categoryParam = searchParams?.get('category');
    if (!categoryParam) return;
    const target = Object.values(TaskCategory).find(
      c => c.toLowerCase() === categoryParam.toLowerCase()
    );
    if (!target) return;
    const id = window.setTimeout(() => {
      if (sectionRefs.current.has(target)) {
        handleSelectCategory(target);
      }
    }, 150);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, data, activeFrequency]);

  // Scroll listener: pick the section whose top is closest to (just below) the sticky nav.
  // This is more deterministic than IntersectionObserver when sections have widely
  // different heights (Ads slider is short, Tournaments tall).
  useEffect(() => {
    if (!data) return;
    const sections = Array.from(sectionRefs.current.entries());
    if (!sections.length) return;
    const scroller = findScroller(sections[0][1]);
    if (!scroller) return;

    const recompute = () => {
      if (Date.now() < scrollLockUntilRef.current) return;

      const stickyOffset = stickyNavRef.current?.offsetHeight ?? 64;
      const scrollerTop = scroller.getBoundingClientRect().top;
      const probeY = scrollerTop + stickyOffset + 12;

      // 1) Section that ENCLOSES the probe line wins (the one user is actually looking at).
      let best: TaskCategory | null = null;
      for (const [category, el] of sections) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          best = category;
          break;
        }
      }

      // 2) If no section straddles the probe (gap between sections), pick the closest one.
      if (!best) {
        let bestDist = Infinity;
        for (const [category, el] of sections) {
          const rect = el.getBoundingClientRect();
          const center = (rect.top + rect.bottom) / 2;
          const dist = Math.abs(center - probeY);
          if (dist < bestDist) {
            bestDist = dist;
            best = category;
          }
        }
      }

      // 3) Edge case: scrolled past the very last section bottom (over-scroll bounce or footer
      // padding) — keep the last section active.
      const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
      if (atBottom) {
        const last = sections[sections.length - 1]?.[0];
        const lastEl = sections[sections.length - 1]?.[1];
        if (last && lastEl) {
          const r = lastEl.getBoundingClientRect();
          if (r.bottom <= probeY) best = last;
        }
      }

      if (best) setActiveCategory(best);
    };

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        recompute();
      });
    };

    recompute();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      scroller.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [data, activeFrequency, navItems.length]);

  const handleSelectCategory = (category: TaskCategory) => {
    triggerHaptic('light');
    setActiveCategory(category);
    setHighlightToken({ category, nonce: Date.now() });

    const el = sectionRefs.current.get(category);
    if (!el) return;

    const scroller = findScroller(el);
    const stickyOffset = stickyNavRef.current?.offsetHeight ?? 64;

    if (scroller) {
      const target =
        scroller.scrollTop +
        el.getBoundingClientRect().top -
        scroller.getBoundingClientRect().top -
        stickyOffset -
        8;
      const clamped = Math.max(0, Math.min(target, scroller.scrollHeight - scroller.clientHeight));
      const distance = Math.abs(clamped - scroller.scrollTop);
      const lockMs = Math.min(1400, Math.max(500, distance * 1.6 + 200));
      scrollLockUntilRef.current = Date.now() + lockMs;
      scroller.scrollTo({ top: clamped, behavior: 'smooth' });
    } else {
      scrollLockUntilRef.current = Date.now() + 900;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectFrequency = (frequency: TaskFrequency) => {
    if (frequency === activeFrequency) return;
    triggerHaptic('light');
    setActiveFrequency(frequency);
  };

  const runClaim = async (id: string, subStepIds?: string[]) => {
    triggerHaptic('medium');
    setPendingClaim({ id, open: true, result: null });
    try {
      const res = await claimTask({ id, subStepIds }).unwrap();
      setPendingClaim({ id, open: true, result: res });
      // Mark task as locally completed — the card will move to the bottom
      // (sorted under in-progress, above locked) and switch to the read-only
      // completed style without waiting for a backend refetch.
      setLocallyCompletedIds(prev => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
    } catch {
      setPendingClaim({ id, open: true, result: null });
    }
  };

  const applyLocalCompletion = (task: Task): Task => {
    if (!locallyCompletedIds.has(task.id)) return task;
    return {
      ...task,
      status: TaskStatus.COMPLETED,
      progress: { current: task.progress.target, target: task.progress.target },
      subSteps: task.subSteps?.map(s => ({ ...s, completed: true, claimed: true })),
    };
  };

  const handleClaimTask = (task: Task, bundleSubStepIds?: string[]) =>
    runClaim(task.id, bundleSubStepIds);
  const handleClaimQuestStep = (step: QuestStep) => runClaim(step.id);
  const handleClaimSubStep = (_task: Task, step: TaskSubStep) => runClaim(step.id);

  const handleWatchAd = async (slot: AdSlot) => {
    triggerHaptic('medium');
    try {
      await watchAd({ adId: slot.id }).unwrap();
      setPendingClaim({
        id: slot.id,
        open: true,
        result: {
          id: slot.id,
          rewards: slot.rewards,
          newBalance: { ltc: 12345, tickets: 12, activityPoints: 4500 },
        },
      });
    } catch {
      setPendingClaim({ id: slot.id, open: true, result: null });
    }
  };

  const handleClose = () => {
    setPendingClaim(prev => ({ ...prev, open: false }));
  };

  if (isLoading) return <TasksSkeleton />;

  const showAds = activeFrequency === TaskFrequency.DAILY && !!data?.ads?.slots.length;
  const showQuest = activeFrequency === TaskFrequency.ONCE && !!data?.quest;
  const visibleCategories =
    data?.categories.filter(c => tasksForFrequency(c, activeFrequency).length > 0) ?? [];

  const allEmpty = !showAds && !showQuest && visibleCategories.length === 0;

  return (
    <div className="flex flex-col">
      <TasksHeader streak={data?.streak} dailyProgress={data?.dailyProgress} loading={isLoading} />

      <TasksFrequencyTabs
        active={activeFrequency}
        onChange={handleSelectFrequency}
        counts={frequencyCounts}
        className="pb-3"
      />

      <TasksCategoryNav
        items={navItems}
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
        containerRef={stickyNavRef}
      />

      {allEmpty ? (
        <EmptyAllDone resetAt={data?.ads?.resetAt} />
      ) : (
        <div key={activeFrequency} className="flex flex-col">
          {showAds && data?.ads && (
            <AdsSection
              ads={data.ads}
              loading={watchState.isLoading}
              onWatch={handleWatchAd}
              registerSection={registerSection}
              highlightToken={
                highlightToken?.category === TaskCategory.ADS ? highlightToken.nonce : null
              }
            />
          )}

          {showQuest && data?.quest && (
            <QuestSection
              quest={data.quest}
              onClaimStep={handleClaimQuestStep}
              registerSection={registerSection}
              highlightToken={
                highlightToken?.category === TaskCategory.QUEST ? highlightToken.nonce : null
              }
            />
          )}

          {visibleCategories.map(cat => (
            <TasksCategorySection
              key={cat.category}
              category={cat.category}
              tasks={tasksForFrequency(cat, activeFrequency).map(applyLocalCompletion)}
              onClaim={handleClaimTask}
              onClaimSubStep={handleClaimSubStep}
              registerSection={registerSection}
              emptyHint={t('no tasks here yet')}
              highlightToken={
                highlightToken?.category === cat.category ? highlightToken.nonce : null
              }
            />
          ))}

          <div className="h-12" />
        </div>
      )}

      <ClaimRewardModal
        open={pendingClaim.open}
        result={pendingClaim.result}
        loading={claimState.isLoading}
        error={!claimState.isLoading && !pendingClaim.result && pendingClaim.open}
        onClose={handleClose}
        onContinue={() => {
          handleClose();
          refetch();
        }}
        onRetry={() => runClaim(pendingClaim.id)}
      />
    </div>
  );
}
