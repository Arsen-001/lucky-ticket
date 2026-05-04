'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  ArrowDownToLine,
  BarChart3,
  Cog,
  Coins,
  Crown,
  PiggyBank,
  Star,
  Ticket as TicketIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import { icons } from '@/constants/icons';
import {
  GENERAL_SUB_TAB,
  SLIDER_ID_PREFIX,
  SLIDER_LEADERBOARD_PERIOD_TABS,
  SLIDER_TIER_TABS_NO_BRONZE,
  TASK_PAGE,
  TOURNAMENT_PLACE_KEYS,
} from '@/constants/tasks.constants';
import type { MessageIds } from '@/types/types/i18n.types';
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
import { TournamentMilestoneSlider } from './TournamentMilestoneSlider';
import { TournamentSubTabs, type PeriodSubTab, type TierSubTab } from './TournamentSubTabs';
import { TournamentSlidersSkeleton } from './TournamentSlidersSkeleton';
import { AdsSection } from './AdsSection';
import type { TierName } from '@/types/types/tier.types';
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
  TaskCategory.MARKET,
];

const sortByOnceOrder = <T extends { category: TaskCategory }>(items: T[]): T[] => {
  const rank = (c: TaskCategory) => {
    const i = ONCE_CATEGORY_ORDER.indexOf(c);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...items].sort((a, b) => rank(a.category) - rank(b.category));
};

// Generic helper — flips an `isSwitching` flag for `durationMs` whenever the
// observed value changes (after first render). Used by every sub-tab state
// in this component to drive the swap-skeleton UX.
function useSubTabSwitching<T>(activeTab: T, durationMs = TASK_PAGE.subTabSkeletonMs) {
  const [isSwitching, setIsSwitching] = useState(false);
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setIsSwitching(true);
    const id = window.setTimeout(() => setIsSwitching(false), durationMs);
    return () => window.clearTimeout(id);
  }, [activeTab, durationMs]);
  return isSwitching;
}

// Per-category slider id-prefix patterns — drive `getRegularTasks` and
// guarantee every category's milestone-chain tasks get pulled out of the
// regular row grid in the once tab. Patterns mirror the prefixes defined
// in `SLIDER_ID_PREFIX` (tasks.constants.ts).
const ONCE_SLIDER_PATTERNS: Partial<Record<TaskCategory, RegExp>> = {
  [TaskCategory.TICKETS]: /^ticket-(?:[a-z]+-)?collect-/,
  [TaskCategory.ENGINES]: /^engine-(?:[a-z]+-)?collect-/,
  [TaskCategory.STAKES]: /^stake-(?:[a-z]+-)?(?:count|volume)-/,
  [TaskCategory.STARS]: /^star-(?:purchase|earn)-/,
  [TaskCategory.FRIENDS]: /^friend-invite-/,
  [TaskCategory.LEADERBOARD]: /^leaderboard-(?:daily|weekly|monthly|alltime)-rank-/,
  [TaskCategory.PROFILE_STATUS]: /^vip-level-/,
};

/**
 * Tasks visible in the regular grid for a category in the once tab — i.e.
 * everything that is NOT pulled into a milestone slider above the grid.
 * Tournaments hide everything (every milestone is in a slider).
 */
const getRegularTasks = (category: TaskCategory, allTasks: Task[]): Task[] => {
  if (category === TaskCategory.TOURNAMENTS) return [];
  const pattern = ONCE_SLIDER_PATTERNS[category];
  if (!pattern) return allTasks;
  return allTasks.filter(task => !pattern.test(task.id));
};

const TIER_TABS_NO_BRONZE = ['silver', 'gold', 'platinum', 'diamond'] as const;

/**
 * Returns the set of tier sub-tabs whose tier-prefixed tasks are LOCKED for
 * the current user (used to render a lock icon next to those tabs).
 */
const getLockedTierTabs = (
  allTasks: Task[],
  makePrefix: (tier: TierName) => string,
  tiers: readonly TierName[] = TIER_TABS_NO_BRONZE
): TierSubTab[] =>
  tiers.filter(tier =>
    allTasks.some(task => task.id.startsWith(makePrefix(tier)) && task.status === TaskStatus.LOCKED)
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);
  const [highlightToken, setHighlightToken] = useState<{
    category: TaskCategory;
    nonce: number;
  } | null>(null);
  const [taskHighlight, setTaskHighlight] = useState<{ id: string; nonce: number } | null>(null);
  const [tournamentSubTab, setTournamentSubTab] = useState<TierSubTab>(GENERAL_SUB_TAB);
  const [ticketsSubTab, setTicketsSubTab] = useState<TierSubTab>(GENERAL_SUB_TAB);
  const [enginesSubTab, setEnginesSubTab] = useState<TierSubTab>(GENERAL_SUB_TAB);
  const [stakesSubTab, setStakesSubTab] = useState<TierSubTab>(GENERAL_SUB_TAB);
  const [leaderboardPeriodTab, setLeaderboardPeriodTab] = useState<PeriodSubTab>('daily');
  const isSubTabSwitching = useSubTabSwitching(tournamentSubTab);
  const isTicketsSubTabSwitching = useSubTabSwitching(ticketsSubTab);
  const isEnginesSubTabSwitching = useSubTabSwitching(enginesSubTab);
  const isStakesSubTabSwitching = useSubTabSwitching(stakesSubTab);
  const isLeaderboardSubTabSwitching = useSubTabSwitching(leaderboardPeriodTab);

  // Pinned tasks — user can star any number of tasks; pinned ones float to
  // the top of their status group (right after READY_TO_CLAIM).
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = window.localStorage.getItem(TASK_PAGE.pinnedStorageKey);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(TASK_PAGE.pinnedStorageKey, JSON.stringify([...pinnedIds]));
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
    const categoryItems: CategoryNavItem[] = [];
    data.categories.forEach(cat => {
      // Hide Profile, Market, and Partners chips from the one-time tab — same as the section list.
      if (
        activeFrequency === TaskFrequency.ONCE &&
        (cat.category === TaskCategory.PROFILE ||
          cat.category === TaskCategory.MARKET ||
          cat.category === TaskCategory.PARTNERS)
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

      const stickyOffset =
        stickyNavRef.current?.offsetHeight ?? TASK_PAGE.stickyNavFallbackHeightPx;
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
    const stickyOffset = stickyNavRef.current?.offsetHeight ?? TASK_PAGE.stickyNavFallbackHeightPx;

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
      // Backend updates state on its side; RTK invalidates `tasks` tag
      // (see tasks.api.ts) which triggers automatic refetch + UI sync.
    } catch {
      setPendingClaim({ id, open: true, result: null });
    }
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
  if (isError || !data) return <TasksLoadError onRetry={refetch} />;

  const showAds = activeFrequency === TaskFrequency.DAILY && !!data?.ads?.slots.length;
  const showQuest = activeFrequency === TaskFrequency.ONCE && !!data?.quest;
  const filteredCategories =
    data?.categories.filter(c => tasksForFrequency(c, activeFrequency).length > 0) ?? [];
  // Hide Profile and Market from the one-time tab — they live elsewhere
  // (Profile setup is part of Settings; Market actions are first-touch only).
  const onceFiltered =
    activeFrequency === TaskFrequency.ONCE
      ? filteredCategories.filter(
          c =>
            c.category !== TaskCategory.PROFILE &&
            c.category !== TaskCategory.MARKET &&
            c.category !== TaskCategory.PARTNERS
        )
      : filteredCategories;
  const visibleCategories =
    activeFrequency === TaskFrequency.ONCE ? sortByOnceOrder(onceFiltered) : onceFiltered;

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

          {visibleCategories.map(cat => {
            const allTasks = tasksForFrequency(cat, activeFrequency);
            const isTournamentsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.TOURNAMENTS;
            const isTicketsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.TICKETS;
            const ticketCollectPrefix =
              ticketsSubTab === GENERAL_SUB_TAB
                ? SLIDER_ID_PREFIX.ticketsGeneral
                : SLIDER_ID_PREFIX.ticketsTier(ticketsSubTab);
            const ticketCollectTasks = isTicketsOnce
              ? allTasks.filter(task => task.id.startsWith(ticketCollectPrefix))
              : [];
            // Locked tier sub-tabs for tickets (tier > USER_TIER) — sourced from any ticket task in that tier.
            const ticketsLockedTabs: TierSubTab[] = isTicketsOnce
              ? getLockedTierTabs(allTasks, SLIDER_ID_PREFIX.ticketsTier)
              : [];

            const isEnginesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.ENGINES;
            const engineCollectPrefix =
              enginesSubTab === GENERAL_SUB_TAB
                ? SLIDER_ID_PREFIX.enginesGeneral
                : SLIDER_ID_PREFIX.enginesTier(enginesSubTab);
            const engineCollectTasks = isEnginesOnce
              ? allTasks.filter(task => task.id.startsWith(engineCollectPrefix))
              : [];
            const enginesLockedTabs: TierSubTab[] = isEnginesOnce
              ? getLockedTierTabs(allTasks, SLIDER_ID_PREFIX.enginesTier)
              : [];

            const isLeaderboardOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.LEADERBOARD;
            const leaderboardRankTasks = isLeaderboardOnce
              ? allTasks.filter(task =>
                  task.id.startsWith(SLIDER_ID_PREFIX.leaderboardRank(leaderboardPeriodTab))
                )
              : [];

            const isFriendsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.FRIENDS;
            const friendInviteTasks = isFriendsOnce
              ? allTasks.filter(task => task.id.startsWith(SLIDER_ID_PREFIX.friendsInvite))
              : [];

            const isStarsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.STARS;
            const starPurchaseTasks = isStarsOnce
              ? allTasks.filter(task => task.id.startsWith(SLIDER_ID_PREFIX.starsPurchase))
              : [];
            const starEarnTasks = isStarsOnce
              ? allTasks.filter(task => task.id.startsWith(SLIDER_ID_PREFIX.starsEarn))
              : [];

            const isProfileStatusOnce =
              activeFrequency === TaskFrequency.ONCE &&
              cat.category === TaskCategory.PROFILE_STATUS;
            const vipTierTasks = isProfileStatusOnce
              ? allTasks.filter(task => task.id.startsWith(SLIDER_ID_PREFIX.vipLevel))
              : [];

            const isStakesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.STAKES;
            const stakeCountPrefix =
              stakesSubTab === GENERAL_SUB_TAB
                ? SLIDER_ID_PREFIX.stakesCount
                : SLIDER_ID_PREFIX.stakesTierCount(stakesSubTab);
            const stakeVolumePrefix =
              stakesSubTab === GENERAL_SUB_TAB
                ? SLIDER_ID_PREFIX.stakesVolume
                : SLIDER_ID_PREFIX.stakesTierVolume(stakesSubTab);
            const stakeCountTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith(stakeCountPrefix))
              : [];
            const stakeVolumeTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith(stakeVolumePrefix))
              : [];
            const stakesLockedTabs: TierSubTab[] = isStakesOnce
              ? getLockedTierTabs(allTasks, tier => `stake-${tier}-`)
              : [];

            // General sliders (tier-agnostic): podium + total participation + 1st/2nd/3rd any tier.
            const generalSliderConfigs = [
              {
                prefix: SLIDER_ID_PREFIX.tournamentPodium,
                title: t('podium milestones title'),
                blurb: t('podium milestones blurb'),
                unitLabel: t('podium'),
              },
              {
                prefix: SLIDER_ID_PREFIX.tournamentPlayed,
                title: t('play count title'),
                blurb: t('play count blurb'),
                unitLabel: t('tournament participation'),
              },
              ...TOURNAMENT_PLACE_KEYS.map(place => ({
                prefix: SLIDER_ID_PREFIX.tournamentPlace(place),
                title: t(`place ${place} title` as MessageIds),
                blurb: t(`place ${place} blurb` as MessageIds),
                unitLabel: t(`place ${place}` as MessageIds),
              })),
            ];

            // Per-tier sliders — built dynamically from the active tier sub-tab.
            const buildTierSliderConfigs = (tier: TierName) => {
              const tierName = t(tier);
              return [
                {
                  prefix: SLIDER_ID_PREFIX.tournamentTierPlayed(tier),
                  title: t('tier participation title', { tier: tierName }),
                  blurb: t('tier participation blurb', { tier: tierName }),
                  unitLabel: `${tierName} · ${t('tournament participation')}`,
                },
                ...TOURNAMENT_PLACE_KEYS.map(place => ({
                  prefix: SLIDER_ID_PREFIX.tournamentTierPlace(tier, place),
                  title: t('tier place title', {
                    tier: tierName,
                    place: t(`place ${place}` as MessageIds),
                  }),
                  blurb: t('tier place blurb', {
                    tier: tierName,
                    place: t(`place ${place}` as MessageIds),
                  }),
                  unitLabel: `${tierName} · ${place}`,
                })),
              ];
            };

            const activeSliderConfigs = isTournamentsOnce
              ? tournamentSubTab === GENERAL_SUB_TAB
                ? generalSliderConfigs
                : buildTierSliderConfigs(tournamentSubTab)
              : [];

            const sliders = activeSliderConfigs
              .map(s => ({ ...s, tasks: allTasks.filter(task => task.id.startsWith(s.prefix)) }))
              .filter(s => s.tasks.length > 0);

            // In the once tab, every category's milestone-chain tasks live in
            // sliders above the grid — pull them out via the shared helper.
            const regularTasks =
              activeFrequency === TaskFrequency.ONCE
                ? getRegularTasks(cat.category, allTasks)
                : allTasks;

            // Tabs to mark as locked (tier > USER_TIER) — sourced from any task's status in that tier group
            const lockedTabs: TierSubTab[] = isTournamentsOnce
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
                twoColumns={
                  activeFrequency === TaskFrequency.ONCE &&
                  cat.category !== TaskCategory.SOCIAL &&
                  cat.category !== TaskCategory.ACHIEVEMENTS &&
                  cat.category !== TaskCategory.PROFILE_STATUS &&
                  cat.category !== TaskCategory.PROFILE
                }
                collapsible={
                  cat.category === TaskCategory.ACHIEVEMENTS &&
                  activeFrequency === TaskFrequency.ONCE
                    ? TASK_PAGE.achievementsCollapse
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
                        tabs={SLIDER_TIER_TABS_NO_BRONZE}
                      />
                      {isTicketsSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={1} />
                      ) : ticketCollectTasks.length > 0 ? (
                        <TournamentMilestoneSlider
                          tasks={ticketCollectTasks}
                          onClaim={handleClaimTask}
                          title={
                            ticketsSubTab === GENERAL_SUB_TAB
                              ? t('tickets collected title')
                              : t('tier tickets collected title', { tier: t(ticketsSubTab) })
                          }
                          blurb={
                            ticketsSubTab === GENERAL_SUB_TAB
                              ? t('tickets collected blurb')
                              : t('tier tickets collected blurb', { tier: t(ticketsSubTab) })
                          }
                          unitLabel={
                            ticketsSubTab === GENERAL_SUB_TAB
                              ? t('tickets collected')
                              : `${t(ticketsSubTab)} ${t('tickets collected')}`
                          }
                          headerIcon={TicketIcon}
                          headerGradient="from-electric-pink to-pink"
                          numberIcon={TicketIcon}
                          cardIconType={
                            ticketsSubTab === GENERAL_SUB_TAB ? 'bronze' : ticketsSubTab
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
                        tabs={SLIDER_TIER_TABS_NO_BRONZE}
                      />
                      {isEnginesSubTabSwitching ? (
                        <TournamentSlidersSkeleton count={1} />
                      ) : engineCollectTasks.length > 0 ? (
                        <TournamentMilestoneSlider
                          tasks={engineCollectTasks}
                          onClaim={handleClaimTask}
                          title={
                            enginesSubTab === GENERAL_SUB_TAB
                              ? t('engines owned title')
                              : t('tier engines owned title', { tier: t(enginesSubTab) })
                          }
                          blurb={
                            enginesSubTab === GENERAL_SUB_TAB
                              ? t('engines owned blurb')
                              : t('tier engines owned blurb', { tier: t(enginesSubTab) })
                          }
                          unitLabel={
                            enginesSubTab === GENERAL_SUB_TAB
                              ? t('engines owned')
                              : `${t(enginesSubTab)} ${t('engines owned')}`
                          }
                          headerIcon={Cog}
                          headerGradient="from-platinum to-electric-purple"
                          numberIcon={Cog}
                          cardMedalType={
                            enginesSubTab === GENERAL_SUB_TAB ? 'bronze' : enginesSubTab
                          }
                        />
                      ) : null}
                    </div>
                  ) : isLeaderboardOnce ? (
                    <div className="flex flex-col gap-3">
                      <TournamentSubTabs
                        active={leaderboardPeriodTab}
                        onChange={setLeaderboardPeriodTab}
                        tabs={SLIDER_LEADERBOARD_PERIOD_TABS}
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
                        tabs={SLIDER_TIER_TABS_NO_BRONZE}
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
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes count title')
                                  : t('tier stakes count title', { tier: t(stakesSubTab) })
                              }
                              blurb={
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes count blurb')
                                  : t('tier stakes count blurb', { tier: t(stakesSubTab) })
                              }
                              unitLabel={
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes count')
                                  : `${t(stakesSubTab)} ${t('stakes count')}`
                              }
                              headerIcon={PiggyBank}
                              headerGradient="from-teal to-diamond"
                              numberIcon={PiggyBank}
                              cardMedalType={
                                stakesSubTab === GENERAL_SUB_TAB ? 'bronze' : stakesSubTab
                              }
                            />
                          )}
                          {stakeVolumeTasks.length > 0 && (
                            <TournamentMilestoneSlider
                              tasks={stakeVolumeTasks}
                              onClaim={handleClaimTask}
                              title={
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes volume title')
                                  : t('tier stakes volume title', { tier: t(stakesSubTab) })
                              }
                              blurb={
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes volume blurb')
                                  : t('tier stakes volume blurb', { tier: t(stakesSubTab) })
                              }
                              unitLabel={
                                stakesSubTab === GENERAL_SUB_TAB
                                  ? t('stakes volume')
                                  : `${t(stakesSubTab)} ${t('stakes volume')}`
                              }
                              headerIcon={Coins}
                              headerGradient="from-warning to-gold"
                              numberIcon={Coins}
                              cardMedalType={
                                stakesSubTab === GENERAL_SUB_TAB ? 'bronze' : stakesSubTab
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
