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
import {
  tasksApi,
  useGetTasksQuery,
  useClaimTaskMutation,
  useWatchAdMutation,
  useReportAdAttemptMutation,
  useBuyExtraAdViewsMutation,
} from '@/api/tasks.api';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { TaskCategory, TaskFrequency, TaskStatus } from '@/types/enums/tasks.enums';
import type { AdSlot, Task, TasksResponse, TaskSubStep } from '@/types/interfaces/tasks.interfaces';
import {
  countClaimableAdSlots,
  countClaimableTasks,
  frequencyTabCounts,
  hasClaimableTask,
  isCategoryVisibleForFrequency,
  tasksForFrequency,
} from '@/utils/global/tasks-claimable.utils';
import type { AdProviderId } from '@/lib/ads';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useRewardedAd } from '@/hooks/useRewardedAd';
import { GlobalConstants } from '@/constants/global.constants';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { TasksFrequencyTabs } from './TasksFrequencyTabs';
import { TasksCategoryNav, type CategoryNavItem } from './TasksCategoryNav';
import { TasksCategorySection } from './TasksCategorySection';
import { TournamentMilestoneSlider } from './TournamentMilestoneSlider';
import { AdsSection } from './AdsSection';
import { AdUnavailableModal, type AdUnavailableReason } from './AdUnavailableModal';
import { BuyExtraAdsModal } from './BuyExtraAdsModal';
import { ClaimRewardModal, type RewardModalResult } from './ClaimRewardModal';
import {
  classifyClaimError,
  type ClaimErrorKind,
  isEmptyPayout,
} from '@/utils/pages/task-claim.utils';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { triggerHaptic } from '@/utils/global/haptic.utils';
import { layoutForCategory } from '@/utils/pages/task-layout.utils';
import { AchievementsCollectedBar } from './AchievementsCollectedBar';

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

/**
 * The period's completion bonus (DOCS §12.4). It is served outside
 * `categories` — it sweeps the whole period rather than one category — so both
 * the chip row and the section list have to reach for it by hand.
 */
const allSetBonusFor = (data: TasksResponse | undefined, frequency: TaskFrequency): Task | null => {
  if (frequency === TaskFrequency.DAILY) return data?.allSet?.daily ?? null;
  if (frequency === TaskFrequency.WEEKLY) return data?.allSet?.weekly ?? null;
  return null;
};

const sortByCategoryOrder = <T extends { category: TaskCategory }>(items: T[]): T[] => {
  const rank = (c: TaskCategory) => {
    const i = CATEGORY_ORDER.indexOf(c);
    return i === -1 ? Number.MAX_SAFE_INTEGER : i;
  };
  return [...items].sort((a, b) => rank(a.category) - rank(b.category));
};

/**
 * Clock reads for the pause between ads, kept at module scope on purpose:
 * `react-hooks/purity` rejects `Date.now()` anywhere inside a component body,
 * and it is right to — the rule is what caught the last silent React Compiler
 * bug in this app. These run only from an event handler.
 */
const adPauseDeadline = (): number => Date.now() + GlobalConstants.adCooldownSeconds * 1000;
const isAdPauseOver = (readyAt: number | null): boolean =>
  readyAt === null || Date.now() >= readyAt;

export function TasksContent() {
  const t = useAppTranslations();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const { data, isLoading, isError, refetch } = useGetTasksQuery();
  const [claimTask] = useClaimTaskMutation();
  const [watchAd, watchState] = useWatchAdMutation();
  // Telemetry only — never awaited, never surfaced to the player.
  const [reportAdAttempt] = useReportAdAttemptMutation();
  const [buyExtraAdViews, buyExtraState] = useBuyExtraAdViewsMutation();
  const [buyExtraOpen, setBuyExtraOpen] = useState(false);
  const toast = useToast();
  const spend = useSpendFailure();
  const { show: showRewardedAd, showing: adShowing, preload: preloadAd } = useRewardedAd();
  /**
   * When the next ad may be requested — set after every completed view.
   * A timestamp rather than a ticking number so the countdown survives a
   * re-render and stays honest if the tab is backgrounded mid-pause.
   */
  const [adReadyAt, setAdReadyAt] = useState<number | null>(null);

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

  // `status` is the modal's own view state. It used to be derived from the
  // task-claim mutation (`!claimState.isLoading && !result && open`), which is
  // wrong for anything the modal shows that isn't a task claim: an ad grant
  // leaves that mutation idle, so its modal read as "failed" on sight.
  const [pendingClaim, setPendingClaim] = useState<{
    id: string;
    open: boolean;
    status: 'pending' | 'done' | 'failed';
    failure?: ClaimErrorKind;
    result?: RewardModalResult | null;
    /** Claimed task's tier — the tier its tickets land in, so the prize art
     *  shows the ticket the player actually received. Ad grants carry their own
     *  tier on the reward and leave this unset. */
    tier?: string;
    /** Set by an ad grant only: the day's views after this one, which the modal
     *  shows where a task claim shows its new balance. */
    ad?: { watchedToday: number; total: number };
  }>({ id: '', open: false, status: 'pending', result: null });

  // Exactly what to run again when the player taps «Retry» — set by whoever
  // opened the modal. Retry used to be hardcoded to `runClaim(pendingClaim.id)`,
  // so a failed ad grant retried by POSTing the ad's id to the task-claim
  // endpoint, which can only fail again: press, error, press, error.
  const retryRef = useRef<(() => void) | null>(null);

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

  // Counts for the frequency tabs — what each tab holds worth opening it for:
  // everything claimable in it plus the day's remaining ad views. A wider set
  // than the claim mark, on purpose: a view is watched, not collected.
  const frequencyCounts = useMemo<Record<TaskFrequency, number>>(
    () => frequencyTabCounts(data),
    [data]
  );

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

    const showAdsBlockChip =
      activeFrequency === TaskFrequency.DAILY &&
      !!data.ads &&
      data.ads.enabled !== false &&
      !!data.ads.slots.length;
    const categoryItems: CategoryNavItem[] = [];
    const adsEnabled = data.ads?.enabled !== false;
    data.categories.forEach(cat => {
      // Hide Profile and Partners chips from the one-time tab, and every ads
      // chip when the kill switch is off — same as the section list.
      if (!isCategoryVisibleForFrequency(cat.category, activeFrequency, adsEnabled)) return;
      const tasks = tasksForFrequency(cat, activeFrequency);
      if (!tasks.length) return;
      // One chip per category, always. The daily rewarded-ads block gets its
      // own chip, and the Ads category now also holds a daily task ("watch 3
      // ads") — two chips reading "Ads", with the same React key and two
      // scroll anchors a few hundred pixels apart. They are one destination to
      // a player, so they are one chip carrying both counts.
      if (cat.category === TaskCategory.ADS && showAdsBlockChip) return;
      categoryItems.push({ category: cat.category, readyCount: countClaimableTasks(tasks) });
    });
    if (showAdsBlockChip) {
      const adsCategory = data.categories.find(c => c.category === TaskCategory.ADS);
      const adsTasks = adsCategory ? tasksForFrequency(adsCategory, activeFrequency) : [];
      items.push({
        category: TaskCategory.ADS,
        readyCount: countClaimableAdSlots(data) + countClaimableTasks(adsTasks),
      });
    }
    items.push(...sortByCategoryOrder(categoryItems));
    // The period's all-set bonus closes the list in a section of its own, so it
    // gets a chip like every other destination on the tab. It travels outside
    // `categories`, which is why it is appended here rather than swept up by
    // the loop above — and appended last, matching where it renders.
    const bonus = allSetBonusFor(data, activeFrequency);
    if (bonus) {
      items.push({ category: bonus.category, readyCount: countClaimableTasks([bonus]) });
    }
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

  /**
   * Flip a just-claimed task out of READY_TO_CLAIM in the cache immediately.
   *
   * `claimTask` invalidates the `tasks` tag, but the refetch that follows is a
   * real round trip — and GET /tasks is one of the slowest calls in the app
   * (the daily check-in alone waits on a Telegram `getChatMember`). Until it
   * lands the row still reads "Claim", so a second tap sent a second claim for
   * a reward already granted and the server rightly answered 400. Patching the
   * cache closes that window: the row is COMPLETED the moment the claim
   * returns, and the refetch merely confirms it.
   */
  const markTaskClaimed = (id: string, subStepIds?: string[]) => {
    dispatch(
      tasksApi.util.updateQueryData('getTasks', undefined, draft => {
        // The all-set bonuses live outside `categories` — patch them too, or
        // their card keeps reading "Claim" until the refetch lands.
        const allSetTasks = [draft.allSet?.daily, draft.allSet?.weekly].filter(
          (task): task is Task => !!task
        );
        for (const cat of [...draft.categories, { daily: allSetTasks, weekly: [], once: [] }]) {
          for (const list of [cat.daily, cat.weekly, cat.once]) {
            const task = list.find(item => item.id === id);
            if (!task) continue;
            // A sub-step claim also claims the main task when the main task was
            // itself claimable — the backend does both in one call — so this
            // reads the row's own status rather than the shape of the request.
            if (task.status === TaskStatus.READY_TO_CLAIM) {
              task.status = TaskStatus.COMPLETED;
              task.progress = { ...task.progress, current: task.progress.target };
            }
            if (subStepIds?.length && task.subSteps) {
              task.subSteps = task.subSteps.map(step =>
                subStepIds.includes(step.id) ? { ...step, claimed: true } : step
              );
            }
          }
        }
      })
    );
  };

  /**
   * Claims in flight, keyed by task + sub-steps. Two taps landing inside the
   * same frame both passed the status check and both POSTed; the second one
   * could only ever come back "already claimed".
   */
  const claimsInFlight = useRef<Set<string>>(new Set());

  const runClaim = async (id: string, subStepIds?: string[], tier?: string) => {
    const key = `${id}::${[...(subStepIds ?? [])].sort().join(',')}`;
    if (claimsInFlight.current.has(key)) return;
    claimsInFlight.current.add(key);

    triggerHaptic('medium');
    // Retry has to redo *this* claim, sub-steps included — retrying a failed
    // sub-step claim as a whole-task claim asks for something else entirely.
    retryRef.current = () => runClaim(id, subStepIds, tier);
    setPendingClaim({ id, open: true, status: 'pending', result: null, tier });
    try {
      const res = await claimTask({ id, subStepIds }).unwrap();
      markTaskClaimed(id, subStepIds);
      setPendingClaim({ id, open: true, status: 'done', result: res, tier });
      // Backend updates state on its side; RTK invalidates `tasks` tag
      // (see tasks.api.ts) which triggers automatic refetch + UI sync.
    } catch (error) {
      const failure = classifyClaimError(error);
      // The server refused because our view of the task is stale — so fix the
      // view, not just the copy. By the time the player taps Close the row
      // already shows the truth.
      if (failure === 'claimed') markTaskClaimed(id, subStepIds);
      if (failure !== 'network') refetch();
      setPendingClaim({ id, open: true, status: 'failed', failure, result: null, tier });
    } finally {
      claimsInFlight.current.delete(key);
    }
  };

  const handleClaimTask = (task: Task, bundleSubStepIds?: string[]) =>
    runClaim(task.id, bundleSubStepIds, task.tier);
  // Per-substep claim uses the documented contract — POST /tasks/claim
  // { id: <taskId>, subStepIds: [<stepId>] }. Sending the substep id as the
  // task id only ever worked against the mock; the live backend 404s on it.
  const handleClaimSubStep = (task: Task, step: TaskSubStep) =>
    runClaim(task.id, [step.id], task.tier);

  const handleWatchAd = async (slot: AdSlot): Promise<void> => {
    // A Lucky Player skip (DOCS §7.3): the status pays this view outright, so
    // no network is asked for anything and the post-view pause — which exists
    // only because a network refuses rapid repeats — is not started either.
    // The server re-checks the allowance and refuses a claim it did not grant,
    // so this flag opens no door the perk hasn't already opened.
    if (slot.skippable && (data?.ads?.skip?.remaining ?? 0) > 0) {
      triggerHaptic('medium');
      await grantAdReward(slot, undefined, true);
      return;
    }

    // The button is already disabled while the pause runs; this is the backstop
    // for anything that reaches the handler another way.
    if (!isAdPauseOver(adReadyAt)) return;
    triggerHaptic('medium');

    // Play the real rewarded ad first — the waterfall tries each configured
    // network in turn. Only a genuine completion (or the no-network dev/mock
    // fallback) records the watch; an empty chain ends in one modal naming the
    // reason, and nothing stands in for the missing video.
    // An attempt that pays nothing still happened, and to the network that
    // showed the ad it counts as an impression. Reported fire-and-forget: it
    // grants nothing, so a failed report must not bother a player who already
    // got no reward — but without it the network's count and ours diverge with
    // no stored reason (see DOCS/ADS_SETUP.md).
    //
    // Reported per NETWORK, as the chain walks: the result names one provider,
    // so a network the chain passed over used to leave no trace whatsoever.
    const { outcome, provider } = await showRewardedAd(slot.index, attempt =>
      reportAdAttempt(attempt)
    );
    // A skip is not a chain failure — it ends the chain — so it is reported
    // here rather than by the callback above.
    if (outcome === 'skipped' && provider) {
      reportAdAttempt({ provider, outcome });
    }
    if (outcome === 'skipped') {
      // Every ad the player can close early is now a network's video, so the
      // reason a reward did not land is always the same one.
      toast.info(t('ad not completed'));
      return;
    }
    if (outcome === 'noAd' || outcome === 'tooFast' || outcome === 'error') {
      setAdIssue({ open: true, reason: outcome });
      return;
    }

    // A view just finished. Hold the next slot for a few seconds and spend the
    // pause warming the SDK: asked again immediately, Adsgram answers
    // `onNonStopShow` and the player reads that as a broken button. Timed from
    // here — the end of the ad — not from when the grant call comes back.
    setAdReadyAt(adPauseDeadline());
    preloadAd(slot.index + 1);

    await grantAdReward(slot, provider ?? undefined);
  };

  /**
   * Credit a view that already played. Split out from `handleWatchAd` so
   * «Retry» re-attempts only the grant: the ad was watched and the impression
   * is spent, so replaying it would cost the player another video for a reward
   * they already earned.
   */
  const grantAdReward = async (
    slot: AdSlot,
    provider?: AdProviderId,
    skipped?: boolean
  ): Promise<void> => {
    retryRef.current = () => grantAdReward(slot, provider, skipped);
    try {
      // Show what the server actually granted (not the slot's advertised reward,
      // which can differ) — and no fabricated balance (watchAd returns none).
      // A skipped view carries no provider: there was no impression to report.
      const res = await watchAd({
        adId: slot.id,
        provider: skipped ? undefined : provider,
        skipped: skipped || undefined,
      }).unwrap();
      // A view that paid nothing must not open a "you won" screen with an
      // empty prize inside it — that is exactly what a player reports as "the
      // ad gave me nothing". The honest answer is the same one a refused claim
      // gets, and it carries no Retry: the video is spent either way.
      if (isEmptyPayout(res.rewards)) {
        setPendingClaim({
          id: slot.id,
          open: true,
          status: 'failed',
          failure: 'rejected',
          result: null,
        });
        return;
      }
      setPendingClaim({
        id: slot.id,
        open: true,
        status: 'done',
        result: { id: slot.id, rewards: res.rewards },
        // The slot's own position is the count, and it is right even before the
        // refetch that follows the modal lands: this view is the (index + 1)-th
        // of the day.
        ad: { watchedToday: slot.index + 1, total: data?.ads?.total ?? slot.index + 1 },
      });
    } catch (error) {
      // Same rule as a task claim: a slot the server says is already credited
      // must not offer a Retry that can only be refused again.
      setPendingClaim({
        id: slot.id,
        open: true,
        status: 'failed',
        failure: classifyClaimError(error),
        result: null,
      });
    }
  };

  /**
   * Buy extra ad slots for the rest of the day. The server re-checks the price,
   * the balance and the remaining allowance, so a stale modal can only fail —
   * never overcharge.
   */
  const handleBuyExtraAds = async (count: number, currency: 'lc' | 'ls') => {
    try {
      await buyExtraAdViews({ count, currency }).unwrap();
      setBuyExtraOpen(false);
      toast.success(t('extra ads bought', { n: count }));
    } catch (error) {
      // Closes first: the "top up" modal must not stack on the sheet that
      // raised it, and a sheet left open invites a second doomed tap.
      setBuyExtraOpen(false);
      await spend.report(error);
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
    filteredCategories.filter(c =>
      isCategoryVisibleForFrequency(c.category, activeFrequency, adsEnabled)
    )
  );

  // Absent on the one-time tab, and on a period too thin to hold a bonus.
  const allSetBonus = allSetBonusFor(data, activeFrequency);

  const allEmpty = !showAds && !allSetBonus && visibleCategories.length === 0;

  /**
   * Scroll anchor for a category chip. On the daily tab the Ads chip must land
   * on the rewarded-ads block — the Ads *category* section renders right below
   * it (the "watch 3 ads" task) and would otherwise overwrite the anchor,
   * scrolling the block the player tapped for off the top of the screen.
   */
  const sectionRegistrarFor = (category: TaskCategory) =>
    category === TaskCategory.ADS && showAds ? () => {} : registerSection;

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
              readyAt={adReadyAt}
              onWatch={handleWatchAd}
              onBuyExtra={() => setBuyExtraOpen(true)}
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

            const isAchievementsOnce =
              activeFrequency === TaskFrequency.ONCE && cat.category === TaskCategory.ACHIEVEMENTS;

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
                unitLabel: (count: number) => t('podium', { count }),
              },
              {
                prefix: 'tournament-played-',
                title: t('play count title'),
                blurb: t('play count blurb'),
                unitLabel: (count: number) => t('tournament participation', { count }),
              },
              {
                prefix: 'tournament-1st-',
                title: t('place 1st title'),
                blurb: t('place 1st blurb'),
                unitLabel: (count: number) => t('place 1st', { count }),
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
                registerSection={sectionRegistrarFor(cat.category)}
                emptyHint={t('no tasks here yet')}
                // Every task of the category, not just the rows below the
                // header: the milestone chains render through `topSlot`.
                hasClaimable={hasClaimableTask(allTasks)}
                highlightToken={
                  highlightToken?.category === cat.category ? highlightToken.nonce : null
                }
                taskHighlight={taskHighlight}
                layout={layoutForCategory(cat.category, activeFrequency, regularTasks)}
                collapsible={
                  cat.category === TaskCategory.ACHIEVEMENTS &&
                  activeFrequency === TaskFrequency.ONCE
                    ? { initial: 3, step: 2 }
                    : undefined
                }
                pinnedIds={cat.category === TaskCategory.ACHIEVEMENTS ? pinnedIds : undefined}
                onTogglePin={cat.category === TaskCategory.ACHIEVEMENTS ? togglePin : undefined}
                topSlot={
                  // Fed every achievement of the category, not the three the
                  // list starts unfolded with — the count answers «how much of
                  // the wall do I own», which the visible slice cannot.
                  isAchievementsOnce ? (
                    <AchievementsCollectedBar tasks={allTasks} />
                  ) : isTournamentsOnce ? (
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
                        unitLabel={count => t('tickets collected', { count })}
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
                        unitLabel={count => t('engines owned', { count })}
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
                        unitLabel={() => t('leaderboard rank')}
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
                      unitLabel={count => t('friends invited {count}', { count })}
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
                      unitLabel={count => t('ads watched {count}', { count })}
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
                      unitLabel={() => t('level up vip')}
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
                        unitLabel={() => t('stars purchased')}
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
                          unitLabel={count => t('stakes count', { count })}
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
                          unitLabel={() => t('stakes volume')}
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

          {/* Last, under every category, and drawn by the same section and the
              same card as everything above it. It had a bespoke card for a
              while; the only thing that made it special was the checklist, and
              `TaskItemCard` already renders one — with the sub-step rows,
              the hero payout, the two-cell reward/progress block and the claim
              states that the copy of them kept drifting away from. */}
          {allSetBonus && (
            <TasksCategorySection
              category={allSetBonus.category}
              tasks={[allSetBonus]}
              onClaim={handleClaimTask}
              onClaimSubStep={handleClaimSubStep}
              registerSection={registerSection}
              hasClaimable={hasClaimableTask([allSetBonus])}
              highlightToken={
                highlightToken?.category === allSetBonus.category ? highlightToken.nonce : null
              }
              taskHighlight={taskHighlight}
            />
          )}

          <div className="h-12" />
        </div>
      )}

      <AdUnavailableModal
        open={adIssue.open}
        reason={adIssue.reason}
        onClose={() => setAdIssue(prev => ({ ...prev, open: false }))}
      />

      {data?.ads?.extra && (
        <BuyExtraAdsModal
          open={buyExtraOpen}
          onClose={() => setBuyExtraOpen(false)}
          onConfirm={handleBuyExtraAds}
          loading={buyExtraState.isLoading}
          extra={data.ads.extra}
        />
      )}

      <ClaimRewardModal
        open={pendingClaim.open}
        result={pendingClaim.result}
        loading={pendingClaim.status === 'pending'}
        error={pendingClaim.open && pendingClaim.status === 'failed'}
        errorKind={pendingClaim.failure}
        tier={pendingClaim.tier}
        ad={pendingClaim.ad}
        onClose={handleClose}
        onContinue={() => {
          handleClose();
          refetch();
        }}
        onRetry={() => retryRef.current?.()}
      />

      {spend.modals}
    </div>
  );
}
