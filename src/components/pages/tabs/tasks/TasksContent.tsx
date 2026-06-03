'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDownToLine,
  BarChart3,
  Cog,
  Coins,
  Crown,
  Eye,
  PiggyBank,
  Star,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import type { MedalType } from '@/components/shared/icons/Medal';
import { icons } from '@/constants/icons';
import { useGetTasksQuery, useClaimTaskMutation, useWatchAdMutation } from '@/api/tasks.api';
import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type {
  AdSlot,
  CategoryTasks,
  ClaimTaskResponse,
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
import { TournamentMilestoneSlider } from './TournamentMilestoneSlider';
import { TournamentSubTabs, type TournamentSubTab } from './TournamentSubTabs';
import { TournamentSlidersSkeleton } from './TournamentSlidersSkeleton';
import { AdsSection } from './AdsSection';
import type { TierName } from '@/types/types/tier.types';
import { ClaimRewardModal } from './ClaimRewardModal';
import { ArrivalShine } from '@/components/shared/ArrivalShine';

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

function EmptyAllDone({ frequency, resetAt }: { frequency: TaskFrequency; resetAt?: string }) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(resetAt);
  const titleKey =
    frequency === TaskFrequency.DAILY
      ? 'all done today'
      : frequency === TaskFrequency.WEEKLY
        ? 'all weekly done'
        : 'all milestones done';
  const descKey =
    frequency === TaskFrequency.DAILY
      ? 'all done description'
      : frequency === TaskFrequency.WEEKLY
        ? 'all weekly description'
        : 'all milestones description';
  return (
    <div className="px-6 py-10 flex flex-col items-center text-center gap-2">
      <div className="text-2xl font-extrabold">{t(titleKey)}</div>
      <p className="text-sm text-white-secondary max-w-[280px]">{t(descKey)}</p>
      {resetAt && !expired && (
        <p className="text-xs text-pink-secondary mt-1">
          {t('next reset in {time}', { time: leftTime })}
        </p>
      )}
    </div>
  );
}

function TasksLoadError({ onRetry }: { onRetry: () => void }) {
  const t = useAppTranslations();
  return (
    <div className="px-6 py-12 flex flex-col items-center text-center gap-3">
      <div className="text-2xl font-extrabold">{t('tasks load error')}</div>
      <p className="text-sm text-white-secondary max-w-[280px]">
        {t('tasks load error description')}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-full bg-pink-gradient px-6 py-2.5 text-sm font-bold text-white active:scale-95 shadow-lg shadow-electric-pink/30"
      >
        {t('retry')}
      </button>
    </div>
  );
}

const tasksForFrequency = (cat: CategoryTasks, frequency: TaskFrequency): Task[] => {
  if (frequency === TaskFrequency.DAILY) return cat.daily;
  if (frequency === TaskFrequency.WEEKLY) return cat.weekly;
  return cat.once;
};

const ONCE_CATEGORY_ORDER: TaskCategory[] = [
  TaskCategory.ADS,
  TaskCategory.TOURNAMENTS,
  TaskCategory.TICKETS,
  TaskCategory.ENGINES,
  TaskCategory.STAKES,
  TaskCategory.STARS,
  TaskCategory.FRIENDS,
  TaskCategory.LEADERBOARD,
  TaskCategory.SOCIAL,
  TaskCategory.ACHIEVEMENTS,
  TaskCategory.PROFILE_STATUS,
  TaskCategory.PROFILE,
  TaskCategory.PARTNERS,
];

const sortByOnceOrder = <T extends { category: TaskCategory }>(items: T[]): T[] => {
  const rank = (c: TaskCategory) => {
    const i = ONCE_CATEGORY_ORDER.indexOf(c);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...items].sort((a, b) => rank(a.category) - rank(b.category));
};

export function TasksContent() {
  const t = useAppTranslations();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, refetch } = useGetTasksQuery();
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
  }, [searchParams]);
  const [highlightToken, setHighlightToken] = useState<{
    category: TaskCategory;
    nonce: number;
  } | null>(null);
  const [taskHighlight, setTaskHighlight] = useState<{ id: string; nonce: number } | null>(null);
  const [tournamentSubTab, setTournamentSubTab] = useState<TournamentSubTab>('general');
  const [isSubTabSwitching, setIsSubTabSwitching] = useState(false);
  const isFirstSubTabRender = useRef(true);
  const [ticketsSubTab, setTicketsSubTab] = useState<TournamentSubTab>('general');
  const [isTicketsSubTabSwitching, setIsTicketsSubTabSwitching] = useState(false);
  const isFirstTicketsSubTabRender = useRef(true);
  const [enginesSubTab, setEnginesSubTab] = useState<TournamentSubTab>('general');
  const [isEnginesSubTabSwitching, setIsEnginesSubTabSwitching] = useState(false);
  const isFirstEnginesSubTabRender = useRef(true);
  const [stakesSubTab, setStakesSubTab] = useState<TournamentSubTab>('general');
  const [isStakesSubTabSwitching, setIsStakesSubTabSwitching] = useState(false);
  const isFirstStakesSubTabRender = useRef(true);
  const [leaderboardPeriodTab, setLeaderboardPeriodTab] = useState<TournamentSubTab>('daily');
  const [isLeaderboardSubTabSwitching, setIsLeaderboardSubTabSwitching] = useState(false);
  const isFirstLeaderboardSubTabRender = useRef(true);

  // Pinned tasks — user can star any number of tasks; pinned ones float to
  // the top of their status group (right after READY_TO_CLAIM).
  const PINNED_STORAGE_KEY = 'lt:pinned-tasks';
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(PINNED_STORAGE_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(PINNED_STORAGE_KEY, JSON.stringify([...pinnedIds]));
    } catch {
      /* storage unavailable — ignore */
    }
  }, [pinnedIds]);
  const togglePin = (taskId: string) => {
    setPinnedIds(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  // Show a brief skeleton when the tournament sub-tab swaps so the content
  // change feels intentional rather than instant.
  useEffect(() => {
    if (isFirstSubTabRender.current) {
      isFirstSubTabRender.current = false;
      return;
    }
    setIsSubTabSwitching(true);
    const id = window.setTimeout(() => setIsSubTabSwitching(false), 320);
    return () => window.clearTimeout(id);
  }, [tournamentSubTab]);

  useEffect(() => {
    if (isFirstTicketsSubTabRender.current) {
      isFirstTicketsSubTabRender.current = false;
      return;
    }
    setIsTicketsSubTabSwitching(true);
    const id = window.setTimeout(() => setIsTicketsSubTabSwitching(false), 320);
    return () => window.clearTimeout(id);
  }, [ticketsSubTab]);

  useEffect(() => {
    if (isFirstEnginesSubTabRender.current) {
      isFirstEnginesSubTabRender.current = false;
      return;
    }
    setIsEnginesSubTabSwitching(true);
    const id = window.setTimeout(() => setIsEnginesSubTabSwitching(false), 320);
    return () => window.clearTimeout(id);
  }, [enginesSubTab]);

  useEffect(() => {
    if (isFirstStakesSubTabRender.current) {
      isFirstStakesSubTabRender.current = false;
      return;
    }
    setIsStakesSubTabSwitching(true);
    const id = window.setTimeout(() => setIsStakesSubTabSwitching(false), 320);
    return () => window.clearTimeout(id);
  }, [stakesSubTab]);

  useEffect(() => {
    if (isFirstLeaderboardSubTabRender.current) {
      isFirstLeaderboardSubTabRender.current = false;
      return;
    }
    setIsLeaderboardSubTabSwitching(true);
    const id = window.setTimeout(() => setIsLeaderboardSubTabSwitching(false), 320);
    return () => window.clearTimeout(id);
  }, [leaderboardPeriodTab]);
  const [pendingClaim, setPendingClaim] = useState<{
    id: string;
    open: boolean;
    result?: ClaimTaskResponse | null;
  }>({ id: '', open: false, result: null });

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
    const categoryItems: CategoryNavItem[] = [];
    data.categories.forEach(cat => {
      // Hide Profile and Partners chips from the one-time tab — same as the section list.
      if (
        activeFrequency === TaskFrequency.ONCE &&
        (cat.category === TaskCategory.PROFILE || cat.category === TaskCategory.PARTNERS)
      ) {
        return;
      }
      const tasks = tasksForFrequency(cat, activeFrequency);
      if (!tasks.length) return;
      const ready = tasks.filter(t => t.status === TaskStatus.READY_TO_CLAIM).length;
      categoryItems.push({ category: cat.category, readyCount: ready });
    });
    items.push(
      ...(activeFrequency === TaskFrequency.ONCE ? sortByOnceOrder(categoryItems) : categoryItems)
    );
    return items;
  }, [data, activeFrequency]);

  // Reset highlighted chip when frequency changes
  useEffect(() => {
    setActiveCategory(navItems[0]?.category ?? null);
  }, [activeFrequency, navItems]);

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
  }, [searchParams, data, activeFrequency]);

  // When URL has ?task=<id>, fire a highlight shine on that specific task card
  useEffect(() => {
    if (!data) return;
    const taskParam = searchParams?.get('task');
    if (!taskParam) return;
    const id = window.setTimeout(() => {
      setTaskHighlight({ id: taskParam, nonce: Date.now() });
    }, 350);
    return () => window.clearTimeout(id);
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
      // Backend updates state on its side; RTK invalidates `tasks` tag
      // (see tasks.api.ts) which triggers automatic refetch + UI sync.
    } catch {
      setPendingClaim({ id, open: true, result: null });
    }
  };

  const handleClaimTask = (task: Task, bundleSubStepIds?: string[]) =>
    runClaim(task.id, bundleSubStepIds);
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
          newBalance: { lc: 12_345_000, tickets: 12, activityPoints: 4500 },
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
  if (isError || !data) return <TasksLoadError onRetry={refetch} />;

  const showAds = activeFrequency === TaskFrequency.DAILY && !!data?.ads?.slots.length;
  const filteredCategories =
    data?.categories.filter(c => tasksForFrequency(c, activeFrequency).length > 0) ?? [];
  // Hide Profile and Partners from the one-time tab — they live elsewhere
  // (Profile setup is part of Settings).
  const onceFiltered =
    activeFrequency === TaskFrequency.ONCE
      ? filteredCategories.filter(
          c => c.category !== TaskCategory.PROFILE && c.category !== TaskCategory.PARTNERS
        )
      : filteredCategories;
  const visibleCategories =
    activeFrequency === TaskFrequency.ONCE ? sortByOnceOrder(onceFiltered) : onceFiltered;

  const allEmpty = !showAds && visibleCategories.length === 0;

  return (
    <div className="flex flex-col">
      <TasksHeader streak={data?.streak} dailyProgress={data?.dailyProgress} loading={isLoading} />

      <ArrivalShine id={['dailyTask', 'weeklyTask', 'oneTimeTask']}>
        <TasksFrequencyTabs
          active={activeFrequency}
          onChange={handleSelectFrequency}
          counts={frequencyCounts}
          className="pb-3"
        />
      </ArrivalShine>

      <TasksCategoryNav
        items={navItems}
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
        containerRef={stickyNavRef}
      />

      {allEmpty ? (
        <EmptyAllDone
          frequency={activeFrequency}
          resetAt={activeFrequency === TaskFrequency.DAILY ? data?.ads?.resetAt : undefined}
        />
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

          {visibleCategories.map(cat => {
            const allTasks = tasksForFrequency(cat, activeFrequency);
            const isTournamentsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.TOURNAMENTS;
            const isTicketsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.TICKETS;
            const ticketCollectPrefix =
              ticketsSubTab === 'general' ? 'ticket-collect-' : `ticket-${ticketsSubTab}-collect-`;
            const ticketCollectTasks = isTicketsOnce
              ? allTasks.filter(task => task.id.startsWith(ticketCollectPrefix))
              : [];
            // Locked tier sub-tabs for tickets (tier > USER_TIER) — sourced from any ticket task in that tier.
            const ticketsLockedTabs: TournamentSubTab[] = isTicketsOnce
              ? (['silver', 'gold', 'platinum', 'diamond'] as const).filter(tier =>
                  allTasks.some(
                    task =>
                      task.id.startsWith(`ticket-${tier}-collect-`) &&
                      task.status === TaskStatus.LOCKED
                  )
                )
              : [];

            const isEnginesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.ENGINES;
            const engineCollectPrefix =
              enginesSubTab === 'general' ? 'engine-collect-' : `engine-${enginesSubTab}-collect-`;
            const engineCollectTasks = isEnginesOnce
              ? allTasks.filter(task => task.id.startsWith(engineCollectPrefix))
              : [];
            const enginesLockedTabs: TournamentSubTab[] = isEnginesOnce
              ? (['silver', 'gold', 'platinum', 'diamond'] as const).filter(tier =>
                  allTasks.some(
                    task =>
                      task.id.startsWith(`engine-${tier}-collect-`) &&
                      task.status === TaskStatus.LOCKED
                  )
                )
              : [];

            const isLeaderboardOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.LEADERBOARD;
            const leaderboardRankTasks = isLeaderboardOnce
              ? allTasks.filter(task =>
                  task.id.startsWith(`leaderboard-${leaderboardPeriodTab}-rank-`)
                )
              : [];

            const isFriendsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.FRIENDS;
            const friendInviteTasks = isFriendsOnce
              ? allTasks.filter(task => task.id.startsWith('friend-invite-'))
              : [];

            const isAdsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.ADS;
            const adsWatchTasks = isAdsOnce
              ? allTasks.filter(task => task.id.startsWith('ads-watch-'))
              : [];

            const isStarsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.STARS;
            const starPurchaseTasks = isStarsOnce
              ? allTasks.filter(task => task.id.startsWith('star-purchase-'))
              : [];
            const starEarnTasks = isStarsOnce
              ? allTasks.filter(task => task.id.startsWith('star-earn-'))
              : [];

            const isProfileStatusOnce =
              activeFrequency === TaskFrequency.ONCE &&
              cat.category === TaskCategory.PROFILE_STATUS;
            const vipTierTasks = isProfileStatusOnce
              ? allTasks.filter(task => task.id.startsWith('vip-level-'))
              : [];

            const isStakesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.STAKES;
            const stakeCountPrefix =
              stakesSubTab === 'general' ? 'stake-count-' : `stake-${stakesSubTab}-count-`;
            const stakeVolumePrefix =
              stakesSubTab === 'general' ? 'stake-volume-' : `stake-${stakesSubTab}-volume-`;
            const stakeCountTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith(stakeCountPrefix))
              : [];
            const stakeVolumeTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith(stakeVolumePrefix))
              : [];
            const stakesLockedTabs: TournamentSubTab[] = isStakesOnce
              ? (['silver', 'gold', 'platinum', 'diamond'] as const).filter(tier =>
                  allTasks.some(
                    task =>
                      task.id.startsWith(`stake-${tier}-`) && task.status === TaskStatus.LOCKED
                  )
                )
              : [];

            // General sliders (tier-agnostic): podium + total participation + 1st/2nd/3rd any tier
            const generalSliderConfigs = [
              {
                prefix: 'tournament-podium-',
                title: t('podium milestones title'),
                blurb: t('podium milestones blurb'),
                unitLabel: t('podium'),
              },
              {
                prefix: 'tournament-played-',
                title: t('play count title'),
                blurb: t('play count blurb'),
                unitLabel: t('tournament participation'),
              },
              {
                prefix: 'tournament-1st-',
                title: t('place 1st title'),
                blurb: t('place 1st blurb'),
                unitLabel: t('place 1st'),
              },
              {
                prefix: 'tournament-2nd-',
                title: t('place 2nd title'),
                blurb: t('place 2nd blurb'),
                unitLabel: t('place 2nd'),
              },
              {
                prefix: 'tournament-3rd-',
                title: t('place 3rd title'),
                blurb: t('place 3rd blurb'),
                unitLabel: t('place 3rd'),
              },
            ];

            // Per-tier sliders — built dynamically from the active tier sub-tab.
            const buildTierSliderConfigs = (tier: TierName) => {
              const tierName = t(tier);
              return [
                {
                  prefix: `tournament-${tier}-played-`,
                  title: t('tier participation title', { tier: tierName }),
                  blurb: t('tier participation blurb', { tier: tierName }),
                  unitLabel: `${tierName} · ${t('tournament participation')}`,
                },
                {
                  prefix: `tournament-${tier}-1st-`,
                  title: t('tier place title', { tier: tierName, place: t('place 1st') }),
                  blurb: t('tier place blurb', { tier: tierName, place: t('place 1st') }),
                  unitLabel: `${tierName} · 1st`,
                },
                {
                  prefix: `tournament-${tier}-2nd-`,
                  title: t('tier place title', { tier: tierName, place: t('place 2nd') }),
                  blurb: t('tier place blurb', { tier: tierName, place: t('place 2nd') }),
                  unitLabel: `${tierName} · 2nd`,
                },
                {
                  prefix: `tournament-${tier}-3rd-`,
                  title: t('tier place title', { tier: tierName, place: t('place 3rd') }),
                  blurb: t('tier place blurb', { tier: tierName, place: t('place 3rd') }),
                  unitLabel: `${tierName} · 3rd`,
                },
              ];
            };

            const activeSliderConfigs = isTournamentsOnce
              ? tournamentSubTab === 'general'
                ? generalSliderConfigs
                : buildTierSliderConfigs(tournamentSubTab as TierName)
              : [];

            const sliders = activeSliderConfigs
              .map(s => ({ ...s, tasks: allTasks.filter(task => task.id.startsWith(s.prefix)) }))
              .filter(s => s.tasks.length > 0);

            // Hide regular tasks for tournaments once (everything is in sliders now).
            // For tickets/engines/stakes once, hide all milestone-chain tasks (general + tier variants).
            const regularTasks = isTournamentsOnce
              ? []
              : isTicketsOnce
                ? allTasks.filter(task => !/^ticket-(?:[a-z]+-)?collect-/.test(task.id))
                : isEnginesOnce
                  ? allTasks.filter(task => !/^engine-(?:[a-z]+-)?collect-/.test(task.id))
                  : isStakesOnce
                    ? allTasks.filter(task => !/^stake-(?:[a-z]+-)?(count|volume)-/.test(task.id))
                    : isStarsOnce
                      ? allTasks.filter(task => !/^star-(purchase|earn)-/.test(task.id))
                      : isFriendsOnce
                        ? allTasks.filter(task => !/^friend-invite-/.test(task.id))
                        : isAdsOnce
                          ? allTasks.filter(task => !/^ads-watch-/.test(task.id))
                          : isLeaderboardOnce
                            ? allTasks.filter(
                                task =>
                                  !/^leaderboard-(daily|weekly|monthly|alltime)-rank-/.test(task.id)
                              )
                            : isProfileStatusOnce
                              ? allTasks.filter(task => !task.id.startsWith('vip-level-'))
                              : allTasks;

            // Tabs to mark as locked (tier > USER_TIER) — sourced from any task's status in that tier group
            const lockedTabs: TournamentSubTab[] = isTournamentsOnce
              ? (['bronze', 'silver', 'gold', 'platinum', 'diamond'] as const).filter(tier =>
                  allTasks.some(
                    task =>
                      task.id.startsWith(`tournament-${tier}-`) && task.status === TaskStatus.LOCKED
                  )
                )
              : [];

            return (
              <TasksCategorySection
                key={cat.category}
                category={cat.category}
                tasks={regularTasks}
                onClaim={handleClaimTask}
                onClaimSubStep={handleClaimSubStep}
                registerSection={registerSection}
                emptyHint={t('no tasks here yet')}
                highlightToken={
                  highlightToken?.category === cat.category ? highlightToken.nonce : null
                }
                taskHighlight={taskHighlight}
                layout={
                  cat.category === TaskCategory.SOCIAL || cat.category === TaskCategory.PROFILE
                    ? 'rows'
                    : activeFrequency === TaskFrequency.ONCE &&
                        cat.category !== TaskCategory.ACHIEVEMENTS &&
                        cat.category !== TaskCategory.PROFILE_STATUS
                      ? 'grid'
                      : 'cards'
                }
                collapsible={
                  cat.category === TaskCategory.ACHIEVEMENTS &&
                  activeFrequency === TaskFrequency.ONCE
                    ? { initial: 3, step: 2 }
                    : undefined
                }
                pinnedIds={cat.category === TaskCategory.ACHIEVEMENTS ? pinnedIds : undefined}
                onTogglePin={cat.category === TaskCategory.ACHIEVEMENTS ? togglePin : undefined}
                topSlot={
                  isTournamentsOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={tournamentSubTab}
                        onChange={setTournamentSubTab}
                        lockedTabs={lockedTabs}
                      />
                      {isSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={sliders.length || 4} />
                      ) : (
                        <div className="flex flex-col gap-4">
                          {sliders.map(s => (
                            <TournamentMilestoneSlider
                              key={s.prefix}
                              tasks={s.tasks}
                              onClaim={handleClaimTask}
                              title={s.title}
                              blurb={s.blurb}
                              unitLabel={s.unitLabel}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ) : isTicketsOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={ticketsSubTab}
                        onChange={setTicketsSubTab}
                        lockedTabs={ticketsLockedTabs}
                        tabs={['general', 'silver', 'gold', 'platinum', 'diamond']}
                      />
                      {isTicketsSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={1} />
                      ) : ticketCollectTasks.length > 0 ? (
                        <TournamentMilestoneSlider
                          tasks={ticketCollectTasks}
                          onClaim={handleClaimTask}
                          title={
                            ticketsSubTab === 'general'
                              ? t('tickets collected title')
                              : t('tier tickets collected title', {
                                  tier: t(ticketsSubTab as TierName),
                                })
                          }
                          blurb={
                            ticketsSubTab === 'general'
                              ? t('tickets collected blurb')
                              : t('tier tickets collected blurb', {
                                  tier: t(ticketsSubTab as TierName),
                                })
                          }
                          unitLabel={
                            ticketsSubTab === 'general'
                              ? t('tickets collected')
                              : `${t(ticketsSubTab as TierName)} ${t('tickets collected')}`
                          }
                          headerIcon={Ticket}
                          headerGradient="from-electric-pink to-pink"
                          numberIcon={Ticket}
                          cardIconType={
                            ticketsSubTab === 'general' ? 'bronze' : (ticketsSubTab as TierName)
                          }
                        />
                      ) : null}
                    </div>
                  ) : isEnginesOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={enginesSubTab}
                        onChange={setEnginesSubTab}
                        lockedTabs={enginesLockedTabs}
                        tabs={['general', 'silver', 'gold', 'platinum', 'diamond']}
                      />
                      {isEnginesSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={1} />
                      ) : engineCollectTasks.length > 0 ? (
                        <TournamentMilestoneSlider
                          tasks={engineCollectTasks}
                          onClaim={handleClaimTask}
                          title={
                            enginesSubTab === 'general'
                              ? t('engines owned title')
                              : t('tier engines owned title', {
                                  tier: t(enginesSubTab as TierName),
                                })
                          }
                          blurb={
                            enginesSubTab === 'general'
                              ? t('engines owned blurb')
                              : t('tier engines owned blurb', {
                                  tier: t(enginesSubTab as TierName),
                                })
                          }
                          unitLabel={
                            enginesSubTab === 'general'
                              ? t('engines owned')
                              : `${t(enginesSubTab as TierName)} ${t('engines owned')}`
                          }
                          headerIcon={Cog}
                          headerGradient="from-platinum to-electric-purple"
                          numberIcon={Cog}
                          cardMedalType={
                            enginesSubTab === 'general' ? 'bronze' : (enginesSubTab as MedalType)
                          }
                        />
                      ) : null}
                    </div>
                  ) : isLeaderboardOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={leaderboardPeriodTab}
                        onChange={setLeaderboardPeriodTab}
                        tabs={['daily', 'weekly', 'monthly', 'alltime']}
                      />
                      {isLeaderboardSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={1} />
                      ) : leaderboardRankTasks.length > 0 ? (
                        <TournamentMilestoneSlider
                          tasks={leaderboardRankTasks}
                          onClaim={handleClaimTask}
                          title={t('leaderboard rank title period', {
                            period: t(
                              leaderboardPeriodTab === 'alltime' ? 'all time' : leaderboardPeriodTab
                            ),
                          })}
                          blurb={t('leaderboard rank blurb')}
                          unitLabel={t('leaderboard rank')}
                          headerIcon={BarChart3}
                          headerGradient="from-diamond to-electric-purple"
                          numberIcon={BarChart3}
                          cardLucideIcon={TrendingUp}
                          cardLucideGradient="from-diamond to-electric-purple"
                        />
                      ) : null}
                    </div>
                  ) : isFriendsOnce && friendInviteTasks.length > 0 ? (
                    <TournamentMilestoneSlider
                      tasks={friendInviteTasks}
                      onClaim={handleClaimTask}
                      title={t('friends invited title')}
                      blurb={t('friends invited blurb')}
                      unitLabel={t('friends invited')}
                      headerIcon={Users}
                      headerGradient="from-pink to-electric-pink"
                      numberIcon={Users}
                      cardImageSrc={icons.crown}
                    />
                  ) : isAdsOnce && adsWatchTasks.length > 0 ? (
                    <TournamentMilestoneSlider
                      tasks={adsWatchTasks}
                      onClaim={handleClaimTask}
                      title={t('ads watched title')}
                      blurb={t('ads watched blurb')}
                      unitLabel={t('ads watched')}
                      headerIcon={Eye}
                      headerGradient="from-teal to-electric-purple"
                      numberIcon={Eye}
                      cardLucideIcon={Eye}
                      cardLucideGradient="from-teal to-electric-purple"
                    />
                  ) : isProfileStatusOnce && vipTierTasks.length > 0 ? (
                    <TournamentMilestoneSlider
                      tasks={vipTierTasks}
                      onClaim={handleClaimTask}
                      title={t('level up vip title')}
                      blurb={t('level up vip blurb')}
                      unitLabel={t('level up vip')}
                      headerIcon={Crown}
                      headerGradient="from-gold to-platinum"
                      numberIcon={Crown}
                      cardImageSrc={icons.crown}
                    />
                  ) : isStarsOnce ? (
                    <div className="flex flex-col gap-4">
                      {starPurchaseTasks.length > 0 && (
                        <TournamentMilestoneSlider
                          tasks={starPurchaseTasks}
                          onClaim={handleClaimTask}
                          title={t('stars purchased title')}
                          blurb={t('stars purchased blurb')}
                          unitLabel={t('stars purchased')}
                          headerIcon={Star}
                          headerGradient="from-warning to-gold"
                          numberIcon={Star}
                          cardImageSrc={icons.telegramStar}
                        />
                      )}
                      {starEarnTasks.length > 0 && (
                        <TournamentMilestoneSlider
                          tasks={starEarnTasks}
                          onClaim={handleClaimTask}
                          title={t('stars earned title')}
                          blurb={t('stars earned blurb')}
                          unitLabel={t('stars earned')}
                          headerIcon={ArrowDownToLine}
                          headerGradient="from-electric-pink to-electric-purple"
                          numberIcon={ArrowDownToLine}
                          cardImageSrc={icons.telegramStar}
                        />
                      )}
                    </div>
                  ) : isStakesOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={stakesSubTab}
                        onChange={setStakesSubTab}
                        lockedTabs={stakesLockedTabs}
                        tabs={['general', 'silver', 'gold', 'platinum', 'diamond']}
                      />
                      {isStakesSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={2} />
                      ) : (
                        <div className="flex flex-col gap-4">
                          {stakeCountTasks.length > 0 && (
                            <TournamentMilestoneSlider
                              tasks={stakeCountTasks}
                              onClaim={handleClaimTask}
                              title={
                                stakesSubTab === 'general'
                                  ? t('stakes count title')
                                  : t('tier stakes count title', {
                                      tier: t(stakesSubTab as TierName),
                                    })
                              }
                              blurb={
                                stakesSubTab === 'general'
                                  ? t('stakes count blurb')
                                  : t('tier stakes count blurb', {
                                      tier: t(stakesSubTab as TierName),
                                    })
                              }
                              unitLabel={
                                stakesSubTab === 'general'
                                  ? t('stakes count')
                                  : `${t(stakesSubTab as TierName)} ${t('stakes count')}`
                              }
                              headerIcon={PiggyBank}
                              headerGradient="from-teal to-diamond"
                              numberIcon={PiggyBank}
                              cardMedalType={
                                (stakesSubTab === 'general' ? 'bronze' : stakesSubTab) as MedalType
                              }
                            />
                          )}
                          {stakeVolumeTasks.length > 0 && (
                            <TournamentMilestoneSlider
                              tasks={stakeVolumeTasks}
                              onClaim={handleClaimTask}
                              title={
                                stakesSubTab === 'general'
                                  ? t('stakes volume title')
                                  : t('tier stakes volume title', {
                                      tier: t(stakesSubTab as TierName),
                                    })
                              }
                              blurb={
                                stakesSubTab === 'general'
                                  ? t('stakes volume blurb')
                                  : t('tier stakes volume blurb', {
                                      tier: t(stakesSubTab as TierName),
                                    })
                              }
                              unitLabel={
                                stakesSubTab === 'general'
                                  ? t('stakes volume')
                                  : `${t(stakesSubTab as TierName)} ${t('stakes volume')}`
                              }
                              headerIcon={Coins}
                              headerGradient="from-warning to-gold"
                              numberIcon={Coins}
                              cardMedalType={
                                (stakesSubTab === 'general' ? 'bronze' : stakesSubTab) as MedalType
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  ) : undefined
                }
              />
            );
          })}

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
