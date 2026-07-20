'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
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
import { icons } from '@/constants/icons';
import { useGetTasksQuery, useClaimTaskMutation, useWatchAdMutation } from '@/api/tasks.api';
import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { AdSlot, CategoryTasks, Task, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useToast } from '@/hooks/useToast';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TasksFrequencyTabs } from './TasksFrequencyTabs';
import { TasksResetCountdown } from './TasksResetCountdown';
import { TasksCategoryNav, type CategoryNavItem } from './TasksCategoryNav';
import { TasksCategorySection } from './TasksCategorySection';
import { TournamentMilestoneSlider } from './TournamentMilestoneSlider';
import { AdsSection } from './AdsSection';
import { AdUnavailableModal, type AdUnavailableReason } from './AdUnavailableModal';
import { HouseAdOverlay } from './HouseAdOverlay';
import { ClaimRewardModal, type RewardModalResult } from './ClaimRewardModal';
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

// Canonical category order for every frequency tab (daily / weekly / once).
// Ads leads, Tournaments right after, then the rest. In the daily tab the Ads
// block is a separate prepended section, so Tournaments is the first category.
const CATEGORY_ORDER: TaskCategory[] = [
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

const sortByCategoryOrder = <T extends { category: TaskCategory }>(items: T[]): T[] => {
  const rank = (c: TaskCategory) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...items].sort((a, b) => rank(a.category) - rank(b.category));
};

// Profile and Partners are intentionally absent from the one-time tab — Profile
// setup lives in Settings, Partners in the advertiser cabinet. Hiding them in
// exactly one place (here) keeps the frequency-tab badge, the category chips and
// the section list in agreement: the "one-time" count never advertises tasks the
// user can't actually reach in this tab.
const HIDDEN_ONCE_CATEGORIES = new Set<TaskCategory>([TaskCategory.PROFILE, TaskCategory.PARTNERS]);

const isCategoryVisibleForFrequency = (category: TaskCategory, frequency: TaskFrequency): boolean =>
  !(frequency === TaskFrequency.ONCE && HIDDEN_ONCE_CATEGORIES.has(category));

export function TasksContent() {
  const t = useAppTranslations();
  const searchParams = useSearchParams();
  const { data, isLoading, isError, refetch } = useGetTasksQuery();
  const [claimTask, claimState] = useClaimTaskMutation();
  const [watchAd, watchState] = useWatchAdMutation();
  const toast = useToast();
  const { show: showRewardedAd, showing: adShowing } = useRewardedAd();

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

  const [pendingClaim, setPendingClaim] = useState<{
    id: string;
    open: boolean;
    result?: RewardModalResult | null;
  }>({ id: '', open: false, result: null });

  // Rewarded-ad failure modal (replaces the SDK's native Telegram alert).
  // `reason` survives close so the content doesn't flicker mid exit animation.
  const [adIssue, setAdIssue] = useState<{ open: boolean; reason: AdUnavailableReason | null }>({
    open: false,
    reason: null,
  });

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
    // Count only what each tab actually renders — a category hidden from a
    // frequency (Profile/Partners in one-time) must not inflate its badge.
    data.categories.forEach(cat => {
      if (isCategoryVisibleForFrequency(cat.category, TaskFrequency.DAILY))
        counts[TaskFrequency.DAILY] += cat.daily.filter(isReady).length;
      if (isCategoryVisibleForFrequency(cat.category, TaskFrequency.WEEKLY))
        counts[TaskFrequency.WEEKLY] += cat.weekly.filter(isReady).length;
      if (isCategoryVisibleForFrequency(cat.category, TaskFrequency.ONCE))
        counts[TaskFrequency.ONCE] += cat.once.filter(isReady).length;
    });
    if (data.ads && data.ads.enabled !== false) {
      counts[TaskFrequency.DAILY] += data.ads.slots.filter(s => !s.watched).length;
    }
    return counts;
  }, [data]);

  // Earliest period boundary across the active tab's tasks — drives the reset
  // countdown under the frequency tabs. Daily/weekly only; one-time never resets.
  const periodResetAt = useMemo<string | undefined>(() => {
    if (!data || activeFrequency === TaskFrequency.ONCE) return undefined;
    const times = data.categories
      .flatMap(cat => tasksForFrequency(cat, activeFrequency))
      .map(task => task.resetAt)
      .filter((v): v is string => !!v);
    if (activeFrequency === TaskFrequency.DAILY && data.ads?.resetAt) {
      times.push(data.ads.resetAt);
    }
    return times.length ? times.reduce((a, b) => (a < b ? a : b)) : undefined;
  }, [data, activeFrequency]);

  // Visible categories + their ready counts for the current frequency
  const navItems: CategoryNavItem[] = useMemo(() => {
    const items: CategoryNavItem[] = [];
    if (!data) return items;

    if (
      activeFrequency === TaskFrequency.DAILY &&
      data.ads &&
      data.ads.enabled !== false &&
      data.ads.slots.length
    ) {
      items.push({
        category: TaskCategory.ADS,
        readyCount: data.ads.slots.filter(s => !s.watched).length,
      });
    }
    const categoryItems: CategoryNavItem[] = [];
    data.categories.forEach(cat => {
      // Hide Profile and Partners chips from the one-time tab — same as the section list.
      if (!isCategoryVisibleForFrequency(cat.category, activeFrequency)) return;
      // Ads chips follow the admin ads kill switch — same as the section list.
      if (cat.category === TaskCategory.ADS && data.ads?.enabled === false) return;
      const tasks = tasksForFrequency(cat, activeFrequency);
      if (!tasks.length) return;
      const ready = tasks.filter(t => t.status === TaskStatus.READY_TO_CLAIM).length;
      categoryItems.push({ category: cat.category, readyCount: ready });
    });
    items.push(...sortByCategoryOrder(categoryItems));
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
  // Per-substep claim uses the documented contract — POST /tasks/claim
  // { id: <taskId>, subStepIds: [<stepId>] }. Sending the substep id as the
  // task id only ever worked against the mock; the live backend 404s on it.
  const handleClaimSubStep = (task: Task, step: TaskSubStep) => runClaim(task.id, [step.id]);

  const handleWatchAd = async (slot: AdSlot) => {
    triggerHaptic('medium');

    // Play the real rewarded ad first — the waterfall tries each configured
    // network in turn and falls back to the house ad. Only a genuine
    // completion (or the no-network dev/mock fallback) records the watch.
    const { outcome, provider } = await showRewardedAd();
    if (outcome === 'skipped') {
      toast.info(t('ad not completed'));
      return;
    }
    if (outcome === 'noAd' || outcome === 'tooFast' || outcome === 'error') {
      setAdIssue({ open: true, reason: outcome });
      return;
    }

    try {
      // Show what the server actually granted (not the slot's advertised reward,
      // which can differ) — and no fabricated balance (watchAd returns none).
      const res = await watchAd({ adId: slot.id, provider: provider ?? undefined }).unwrap();
      setPendingClaim({
        id: slot.id,
        open: true,
        result: { id: slot.id, rewards: res.rewards },
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

  // The admin kill switch (`ads.enabled`) hides the whole rewarded-ads surface.
  const adsEnabled = data?.ads?.enabled !== false;
  const showAds =
    activeFrequency === TaskFrequency.DAILY && adsEnabled && !!data?.ads?.slots.length;
  const filteredCategories =
    data?.categories.filter(c => tasksForFrequency(c, activeFrequency).length > 0) ?? [];
  // Hide Profile and Partners from the one-time tab — they live elsewhere
  // (Profile setup is part of Settings). Same predicate as the chips + badge.
  // The Ads category (once-tab watch milestones) follows the same admin kill
  // switch as the daily rewarded slots — no ad surface survives it.
  const visibleCategories = sortByCategoryOrder(
    filteredCategories.filter(
      c =>
        isCategoryVisibleForFrequency(c.category, activeFrequency) &&
        (adsEnabled || c.category !== TaskCategory.ADS)
    )
  );

  const allEmpty = !showAds && visibleCategories.length === 0;

  return (
    <div className="flex flex-col pt-3">
      {/* Tour step "tasks" spotlights both tab rows — this frequency row plus the
          category nav below (tagged `tasks-nav`), unioned by the tour engine. */}
      <div data-tour="tasks">
        <ArrivalShine id={['dailyTask', 'weeklyTask', 'oneTimeTask']}>
          <TasksFrequencyTabs
            active={activeFrequency}
            onChange={handleSelectFrequency}
            counts={frequencyCounts}
            className="pb-3"
          />
        </ArrivalShine>
      </div>

      {/* Period reset countdown — the empty state renders its own line, so skip it there */}
      {!allEmpty && <TasksResetCountdown resetAt={periodResetAt} className="-mt-1 pb-2" />}

      <TasksCategoryNav
        items={navItems}
        activeCategory={activeCategory}
        onSelect={handleSelectCategory}
        containerRef={stickyNavRef}
        dataTour="tasks-nav"
      />

      {allEmpty ? (
        <EmptyAllDone frequency={activeFrequency} resetAt={periodResetAt} />
      ) : (
        <div key={activeFrequency} className="flex flex-col">
          {showAds && data?.ads && (
            <AdsSection
              ads={data.ads}
              loading={watchState.isLoading || adShowing}
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
            const ticketCollectTasks = isTicketsOnce
              ? allTasks.filter(task => task.id.startsWith('ticket-collect-'))
              : [];

            const isEnginesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.ENGINES;
            const engineCollectTasks = isEnginesOnce
              ? allTasks.filter(task => task.id.startsWith('engine-collect-'))
              : [];

            const isLeaderboardOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.LEADERBOARD;
            // 2026-07 rebalance: one prestige chain on the all-time board.
            const leaderboardRankTasks = isLeaderboardOnce
              ? allTasks.filter(task => task.id.startsWith('leaderboard-alltime-rank-'))
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

            const isProfileStatusOnce =
              activeFrequency === TaskFrequency.ONCE &&
              cat.category === TaskCategory.PROFILE_STATUS;
            const vipTierTasks = isProfileStatusOnce
              ? allTasks.filter(task => task.id.startsWith('vip-level-'))
              : [];

            const isStakesOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.STAKES;
            const stakeCountTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith('stake-count-'))
              : [];
            const stakeVolumeTasks = isStakesOnce
              ? allTasks.filter(task => task.id.startsWith('stake-volume-'))
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
            ];

            // 2026-07 rebalance: the 2nd/3rd and per-tier chains were dropped
            // (multi-dipping the same actions), so there are no tier sub-tabs.
            const activeSliderConfigs = isTournamentsOnce ? generalSliderConfigs : [];

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
                  ) : isTicketsOnce ? (
                    ticketCollectTasks.length > 0 ? (
                      <TournamentMilestoneSlider
                        tasks={ticketCollectTasks}
                        onClaim={handleClaimTask}
                        title={t('tickets collected title')}
                        blurb={t('tickets collected blurb')}
                        unitLabel={t('tickets collected')}
                        headerIcon={Ticket}
                        headerGradient="from-electric-pink to-pink"
                        numberIcon={Ticket}
                        cardIconType="bronze"
                      />
                    ) : null
                  ) : isEnginesOnce ? (
                    engineCollectTasks.length > 0 ? (
                      <TournamentMilestoneSlider
                        tasks={engineCollectTasks}
                        onClaim={handleClaimTask}
                        title={t('engines owned title')}
                        blurb={t('engines owned blurb')}
                        unitLabel={t('engines owned')}
                        headerIcon={Cog}
                        headerGradient="from-platinum to-electric-purple"
                        numberIcon={Cog}
                        cardMedalType="bronze"
                      />
                    ) : null
                  ) : isLeaderboardOnce ? (
                    leaderboardRankTasks.length > 0 ? (
                      <TournamentMilestoneSlider
                        tasks={leaderboardRankTasks}
                        onClaim={handleClaimTask}
                        title={t('leaderboard rank title period', { period: t('all time') })}
                        blurb={t('leaderboard rank blurb')}
                        unitLabel={t('leaderboard rank')}
                        headerIcon={BarChart3}
                        headerGradient="from-diamond to-electric-purple"
                        numberIcon={BarChart3}
                        cardLucideIcon={TrendingUp}
                        cardLucideGradient="from-diamond to-electric-purple"
                      />
                    ) : null
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
                    starPurchaseTasks.length > 0 ? (
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
                    ) : null
                  ) : isStakesOnce ? (
                    <div className="flex flex-col gap-4">
                      {stakeCountTasks.length > 0 && (
                        <TournamentMilestoneSlider
                          tasks={stakeCountTasks}
                          onClaim={handleClaimTask}
                          title={t('stakes count title')}
                          blurb={t('stakes count blurb')}
                          unitLabel={t('stakes count')}
                          headerIcon={PiggyBank}
                          headerGradient="from-teal to-diamond"
                          numberIcon={PiggyBank}
                          cardMedalType="bronze"
                        />
                      )}
                      {stakeVolumeTasks.length > 0 && (
                        <TournamentMilestoneSlider
                          tasks={stakeVolumeTasks}
                          onClaim={handleClaimTask}
                          title={t('stakes volume title')}
                          blurb={t('stakes volume blurb')}
                          unitLabel={t('stakes volume')}
                          headerIcon={Coins}
                          headerGradient="from-warning to-gold"
                          numberIcon={Coins}
                          cardMedalType="bronze"
                        />
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

      {/* Mounting this registers the `house` provider — the last step of the
          rewarded-ad waterfall, so an empty network never dead-ends the task. */}
      <HouseAdOverlay />

      <AdUnavailableModal
        open={adIssue.open}
        reason={adIssue.reason}
        onClose={() => setAdIssue(prev => ({ ...prev, open: false }))}
      />

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
