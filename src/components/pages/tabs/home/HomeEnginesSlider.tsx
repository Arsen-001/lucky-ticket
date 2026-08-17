'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import {
  useActivateBoosterMutation,
  useEquipChipMutation,
  useGetInventoryQuery,
  useUnequipChipMutation,
} from '@/api/inventory.api';
import {
  useClaimEngineMutation,
  useCompleteEngineCycleMutation,
  useInstantClaimEngineMutation,
  useUpgradeEngineSpeedMutation,
  useUpgradeEngineCapacityMutation,
} from '@/api/engines.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import {
  chipEffectLabel,
  findActiveBooster,
  findEquippedChip,
} from '@/utils/global/inventory.utils';
import { EngineCardCube } from '@/components/pages/tabs/home/EngineCardCube';
import { EngineSlotPickerModal } from '@/components/pages/tabs/home/EngineSlotPickerModal';
import { HomeBuyEngineSlot } from '@/components/pages/tabs/home/HomeBuyEngineSlot';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { Switch } from '@/components/shared/form-elements/Switch';
import { BoosterIcon } from '@/components/shared/icons/BoosterIcon';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { useSpendFailure } from '@/hooks/useSpendFailure';
import { useEngineSpeedAvatarBoostPct } from '@/hooks/useEngineSpeedAvatarBoostPct';
import { useTestBadgeCapacityTickets } from '@/hooks/useTestBadgeCapacityTickets';
import { useTestBadgeSpeedBoostPct } from '@/hooks/useTestBadgeSpeedBoostPct';
import { findTicketFlightOrigin, useTicketFlight } from '@/hooks/useTicketFlight';
import { chipSlotStarsCost, chipUnequipStarsCost } from '@/utils/global/inventory.utils';
import type { InventoryBooster, InventoryChip } from '@/types/interfaces/inventory.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import '@/styles/components/engines-cube-dot.css';
import '@/styles/components/home-engines-slider.css';
import {
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  maxBoostLevel,
  promoteEngineIfMaxed,
} from '@/utils/global/ticket-engine.utils';
import { useEngineConfig } from '@/hooks/useEngineConfig';
import { useEngineRotateHint } from '@/hooks/useEngineRotateHint';
import { useSkipUpgradePrompt } from '@/hooks/useSkipUpgradePrompt';
import { speedUpgradeLsCost, capacityUpgradeLsCost } from '@/utils/global/economy.utils';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import { mergeEngineItems, type EngineWithTier } from '@/utils/global/engine-items.utils';

// One slide is exactly one cube footprint (`--engine-cube-box`, declared in
// base-layer.css): a square that grows with the viewport up to a cap, so the
// cube never balloons on a wide / Telegram-Desktop-fullscreen screen — past the
// cap only the side padding grows. The cube's CONTENT no longer depends on this
// size at all; it is laid out at `--engine-cube-design` and scaled to fit.
// `SCROLLER_W_CSS` is the app's real usable width — the whole app is a centered
// phone-width column (`--app-max-w`), so raw 100vw over-measured and the active
// engine flew off the column. Centering padding is derived from the real
// scroller width MINUS the slide width, so the active slide stays centered at
// every viewport width.
const SCROLLER_W_CSS = 'min(100vw, var(--app-max-w))';
const SLIDE_WIDTH_CSS = 'var(--engine-cube-box)';
const SLIDE_PADDING_CSS = `calc((${SCROLLER_W_CSS} - ${SLIDE_WIDTH_CSS}) / 2)`;
const SLIDE_MIN_H_CSS = 'min(100vw - 60px, calc(var(--engine-cube-design) + 70px))';

const CORE_TIER_COLORS: Record<TicketType, { mid: string; dark: string; glow: string }> = {
  bronze: {
    mid: 'rgba(255, 200, 130, 0.95)',
    dark: 'rgba(140, 70, 20, 0.85)',
    glow: 'rgba(214, 138, 77, 0.85)',
  },
  silver: {
    mid: 'rgba(230, 232, 226, 0.95)',
    dark: 'rgba(100, 102, 96, 0.85)',
    glow: 'rgba(200, 202, 196, 0.85)',
  },
  gold: {
    mid: 'rgba(255, 220, 130, 0.95)',
    dark: 'rgba(150, 100, 20, 0.85)',
    glow: 'rgba(248, 189, 62, 0.9)',
  },
  platinum: {
    mid: 'rgba(235, 233, 220, 0.95)',
    dark: 'rgba(110, 108, 95, 0.85)',
    glow: 'rgba(212, 210, 197, 0.85)',
  },
  diamond: {
    mid: 'rgba(160, 230, 225, 0.95)',
    dark: 'rgba(20, 100, 95, 0.85)',
    glow: 'rgba(95, 200, 194, 0.9)',
  },
};

export function HomeEnginesSlider({ className }: ClassNameProps) {
  const { data: tickets, isLoading, isError, refetch } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();
  const t = useAppTranslations();
  const toast = useToast();
  const spend = useSpendFailure();
  const launchTicketFlight = useTicketFlight();
  const { data: inventory } = useGetInventoryQuery();
  const [unequipChip, { isLoading: unequipping }] = useUnequipChipMutation();
  const [equipChipMutation] = useEquipChipMutation();
  const [activateBoosterMutation] = useActivateBoosterMutation();
  const [claimEngine] = useClaimEngineMutation();
  const [completeEngineCycle] = useCompleteEngineCycleMutation();
  const [instantClaimEngine] = useInstantClaimEngineMutation();
  const [upgradeEngineSpeed] = useUpgradeEngineSpeedMutation();
  const [upgradeEngineCapacity] = useUpgradeEngineCapacityMutation();
  const [chipToUnequip, setChipToUnequip] = useState<InventoryChip | null>(null);
  const [instantClaimConfirm, setInstantClaimConfirm] = useState<{
    engineId: string;
    cost: number;
  } | null>(null);
  const [upgradeConfirm, setUpgradeConfirm] = useState<{
    engineId: string;
    type: 'speed' | 'capacity';
    cost: number;
    nextLevel: number;
  } | null>(null);
  // "Don't ask again" for the paid boost-upgrade confirm: once opted in, a tap
  // upgrades immediately (stars top-up flow still interrupts when balance is
  // short). The profile settings row can turn the question back on.
  const [skipUpgradePrompt, toggleSkipUpgradePrompt] = useSkipUpgradePrompt();
  // Owned here, not per cube, so the "this turns" teaser plays on the ACTIVE
  // engine only — twenty cubes nudging at once would read as a glitch.
  const [rotateHintActive, dismissRotateHint] = useEngineRotateHint();
  const [pendingPick, setPendingPick] = useState<{
    engineId: string;
    category: 'chip' | 'booster';
    type: InventoryChipType;
    itemId: string;
  } | null>(null);
  /**
   * The picker's tap used to BE the decision: one press equipped the chip and
   * spent its Stars, or burned a booster for its whole duration, with nothing
   * between a mis-tap and the charge. Every other paid action on this screen
   * asks first (instant claim, boost upgrade) — this one now does too.
   *
   * `from` carries the slot the player was choosing in, so «Отмена» puts them
   * back in that list instead of on a bare cube. It is also why the picker is
   * closed rather than left under the question: two stacked dialogs is the
   * shape that strands a portal (@see modal-close-collision).
   */
  const [slotConfirm, setSlotConfirm] = useState<{
    engineId: string;
    from: {
      engineId: string;
      engineTier: TicketType;
      category: 'chip' | 'booster';
      type: InventoryChipType;
    };
    chip?: InventoryChip;
    booster?: InventoryBooster;
    /** Stars the confirm is about to spend; 0 for a booster, which is free. */
    cost: number;
  } | null>(null);

  const scrollerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Flatten owned engines straight from tickets during render so cached data
  // paints engines on the first frame — no skeleton/empty flash when the Home
  // tab remounts on navigation (the (tabs) layout remounts via key={pathname}).
  const flatFromTickets: EngineWithTier[] = tickets
    ? tickets
        .filter(ticket => !ticket.blocked && ticket.engines?.length)
        .flatMap(
          ticket =>
            ticket.engines?.map<EngineWithTier>(engine => ({
              engine,
              tier: ticket.ticketType,
            })) ?? []
        )
    : [];

  const [items, setItems] = useState<EngineWithTier[]>(flatFromTickets);
  // Re-seed when fresh tickets arrive (server data supersedes the locally
  // advanced pendingCount). Render-phase sync avoids the one-frame effect lag.
  const [seededTickets, setSeededTickets] = useState(tickets);
  if (tickets !== seededTickets) {
    setSeededTickets(tickets);
    // Surgical merge, not a full rebuild: only cubes whose engine data actually
    // changed get a new object (and re-render). On the real backend an upgrade
    // thus updates only the one cube instead of re-rendering the whole slider.
    setItems(prev => mergeEngineItems(prev, flatFromTickets));
  }

  // Live ref so the click handlers below don't close over `items` — otherwise
  // every `items` change (an upgrade, a 1s tick) gives them a new identity,
  // which the React Compiler propagates to every cube as a changed prop and
  // re-renders all 20. Reading through the ref keeps the handlers stable.
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});
  const [pickerSlot, setPickerSlot] = useState<{
    engineId: string;
    engineTier: TicketType;
    category: 'chip' | 'booster';
    type: InventoryChipType;
  } | null>(null);

  const currentStars = me?.telegramStars ?? 0;
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const avatarSpeedPct = useEngineSpeedAvatarBoostPct();
  const badgeSpeedPct = useTestBadgeSpeedBoostPct();
  const badgeCapacity = useTestBadgeCapacityTickets();
  const { tables, upgrade } = useEngineConfig();

  const requireStars = (cost: number, onPaid: () => void) => {
    if (currentStars < cost) {
      spend.show('stars', { required: cost });
      return;
    }
    onPaid();
  };

  // Throttles per-engine completion requests: without it a failing (or slow)
  // backend gets re-hit on every 1s tick until the refetch flips `pendingCount`.
  const completionAttemptAtRef = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!items.length) return;

    const tick = () => {
      // Compute everything outside the setState updaters — dispatching from
      // inside an updater is a side effect React requires them not to have.
      const elapsedNext: Record<string, number> = {};
      const readyCapacity: Record<string, number> = {};
      for (const { engine } of items) {
        const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
        const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
        const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
        const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
        const cycle = effectiveCycleSeconds(engine, {
          speedChip,
          speedBooster,
          capacityChip,
          capacityBooster,
          isLuckyPlayer: isLp,
          isVip,
          perks: me?.statusPerks,
          avatarBoostPct: avatarSpeedPct,
          badgeBoostPct: badgeSpeedPct,
          badgeCapacityTickets: badgeCapacity,
          tables,
        });
        if (engine.pendingCount > 0) {
          elapsedNext[engine.id] = cycle;
          continue;
        }
        const elapsed = engineElapsedSeconds(engine);
        elapsedNext[engine.id] = elapsed;
        if (elapsed >= cycle) {
          readyCapacity[engine.id] = engineCapacity(engine, {
            capacityChip,
            capacityBooster,
            badgeCapacityTickets: badgeCapacity,
            tables,
          });
        }
      }

      setElapsedByEngine(prev => {
        const changed = items.some(({ engine }) => prev[engine.id] !== elapsedNext[engine.id]);
        return changed ? { ...prev, ...elapsedNext } : prev;
      });

      setItems(prev => {
        let changed = false;
        const next = prev.map(item => {
          const capacity = readyCapacity[item.engine.id];
          if (capacity === undefined || item.engine.pendingCount > 0) return item;
          changed = true;
          return { ...item, engine: { ...item.engine, pendingCount: capacity } };
        });
        return changed ? next : prev;
      });

      // Persist readiness server-side (mirrors TicketsTabsView). Without this
      // the "ready" flip lives only in local state: GET tickets keeps returning
      // pendingCount=0, so every refetch reverts ready neighbours to a countdown
      // for a frame until the next tick re-flips them — a visible blink across
      // the slider whenever any other engine action triggers a refetch.
      const now = Date.now();
      for (const engineId of Object.keys(readyCapacity)) {
        if (now - (completionAttemptAtRef.current[engineId] ?? 0) > 15_000) {
          completionAttemptAtRef.current[engineId] = now;
          void completeEngineCycle({ engineId });
        }
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
    // Everything the cycle length is computed from, not just the engine list.
    // With `[items]` alone the one-second tick kept measuring against the boosts
    // and the config table captured when it last ran: equip a chip, gain a badge
    // boost, or have `GET /config` land after the engines did, and every
    // countdown on this screen goes on counting to the wrong number until
    // something unrelated happens to change `items`.
  }, [items, inventory, isLp, isVip, avatarSpeedPct, badgeSpeedPct, tables, completeEngineCycle]);

  const recomputeActive = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    const slides = scroller.querySelectorAll<HTMLDivElement>('[data-engine-slide]');
    let bestIdx = 0;
    let bestDist = Infinity;
    slides.forEach(el => {
      const idx = Number(el.dataset.engineIndex);
      const slideCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(slideCenter - center);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = idx;
      }
    });
    setActiveIndex(bestIdx);
  }, []);

  useEffect(() => {
    if (!items.length) return;
    recomputeActive();
    const scroller = scrollerRef.current;
    if (!scroller) return;
    scroller.addEventListener('scroll', recomputeActive, { passive: true });
    window.addEventListener('resize', recomputeActive);
    return () => {
      scroller.removeEventListener('scroll', recomputeActive);
      window.removeEventListener('resize', recomputeActive);
    };
  }, [recomputeActive, items.length]);

  useEffect(() => {
    const dotsScroller = dotsRef.current;
    if (!dotsScroller) return;
    const activeDot = dotsScroller.querySelector<HTMLButtonElement>(
      `[data-dot-index="${activeIndex}"]`
    );
    if (!activeDot) return;
    const target = activeDot.offsetLeft + activeDot.offsetWidth / 2 - dotsScroller.clientWidth / 2;
    dotsScroller.scrollTo({ left: target, behavior: 'smooth' });
  }, [activeIndex]);

  const scrollToIndex = (index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const el = scroller.querySelector<HTMLDivElement>(`[data-engine-index="${index}"]`);
    if (!el) return;
    const target = el.offsetLeft + el.offsetWidth / 2 - scroller.clientWidth / 2;
    scroller.scrollTo({ left: target, behavior: 'smooth' });
  };

  const updateEngine = (engineId: string, updater: (engine: TicketEngine) => TicketEngine) => {
    setItems(prev =>
      prev.map(item =>
        item.engine.id === engineId ? { ...item, engine: updater(item.engine) } : item
      )
    );
  };

  const handleClaim = (engineId: string) => {
    updateEngine(engineId, engine => ({
      ...engine,
      pendingCount: 0,
      cycleStartedAt: dayjs().toISOString(),
    }));
    setElapsedByEngine(prev => ({ ...prev, [engineId]: 0 }));
    // Persist to the backend so balances (tickets / AP in the header) update.
    // `.unwrap()` + toast, matching EngineDetails. These were fire-and-forget
    // `void` calls, so a server refusal (insufficient balance, a lost
    // concurrency race — which the backend now REJECTS instead of granting
    // twice) left the optimistic UI to snap back with no explanation, on the
    // app's default screen. The player could not tell whether the stars were
    // spent.
    claimEngine({ engineId })
      .unwrap()
      .catch(() => toast.error(t('claim failed')));
  };

  const handleInstantClaim = (engineId: string) => {
    const engine = itemsRef.current.find(item => item.engine.id === engineId)?.engine;
    if (!engine) return;
    const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
    const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
    const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
    const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
    const cycle = effectiveCycleSeconds(engine, {
      speedChip,
      speedBooster,
      capacityChip,
      capacityBooster,
      isLuckyPlayer: isLp,
      isVip,
      perks: me?.statusPerks,
      avatarBoostPct: avatarSpeedPct,
      badgeBoostPct: badgeSpeedPct,
      badgeCapacityTickets: badgeCapacity,
      tables,
    });
    const elapsed = elapsedByEngine[engine.id] ?? engineElapsedSeconds(engine);
    const remaining = Math.max(0, cycle - elapsed);
    const cost = Math.max(1, Math.ceil(remaining / 3600));
    setInstantClaimConfirm({ engineId, cost });
  };

  const performInstantClaim = (engineId: string, cost: number) => {
    const item = itemsRef.current.find(item => item.engine.id === engineId);
    if (!item) return;
    const { engine, tier } = item;
    // The paid path buys the same tickets a plain claim would, so it gets the
    // same celebration — it had none, and a star charge that produced no visible
    // reward was the least legible action on the screen. Same count the
    // mutation's optimistic patch credits: whatever is pending, or a full batch
    // when the engine is still mid-cycle.
    launchTicketFlight(
      findTicketFlightOrigin(engineId),
      tier,
      engine.pendingCount > 0
        ? engine.pendingCount
        : engineCapacity(engine, {
            capacityChip: findEquippedChip(inventory?.chips, engineId, 'capacity'),
            capacityBooster: findActiveBooster(inventory?.boosters, engineId, 'capacity'),
            badgeCapacityTickets: badgeCapacity,
            tables,
          })
    );
    // Charges stars AND collects the cycle's tickets in one call, so the
    // optimistic shape is the same as a plain claim: nothing left pending, next
    // cycle running from now. (This used to go through `skip`, which only filled
    // pendingCount and left the player a second tap — that existed to preserve
    // the AP a claim once paid, and engine claims have awarded no AP since
    // 2026-07-08.) Tickets and stars in the header reconcile via the mutation's
    // own patches.
    updateEngine(engineId, e => ({
      ...e,
      pendingCount: 0,
      cycleStartedAt: dayjs().toISOString(),
    }));
    setElapsedByEngine(prev => ({ ...prev, [engineId]: 0 }));
    instantClaimEngine({ engineId, cost })
      .unwrap()
      .catch(error => spend.report(error, { required: cost }));
  };

  const confirmInstantClaim = () => {
    if (!instantClaimConfirm) return;
    const { engineId, cost } = instantClaimConfirm;
    setInstantClaimConfirm(null);
    requireStars(cost, () => performInstantClaim(engineId, cost));
  };

  const performUpgrade = (engineId: string, type: 'speed' | 'capacity', cost: number) => {
    requireStars(cost, () => {
      updateEngine(engineId, e =>
        promoteEngineIfMaxed(
          {
            ...e,
            ...(type === 'speed'
              ? { speedLevel: Math.min(maxBoostLevel(tables), (e.speedLevel ?? 0) + 1) }
              : { capacityLevel: Math.min(maxBoostLevel(tables), (e.capacityLevel ?? 0) + 1) }),
          },
          tables
        )
      );
      // Persist to the backend (charges stars + bumps the level) — matches
      // EngineDetails. Without this the upgrade was optimistic-only and reverted.
      const upgrade =
        type === 'speed'
          ? upgradeEngineSpeed({ engineId, cost })
          : upgradeEngineCapacity({ engineId, cost });
      upgrade.unwrap().catch(error => spend.report(error, { required: cost }));
    });
  };

  const handleUpgradeSpeed = (engineId: string) => {
    const item = itemsRef.current.find(item => item.engine.id === engineId);
    if (!item) return;
    const { engine, tier } = item;
    const cost = speedUpgradeLsCost(engine.speedLevel ?? 0, engine.engineLevel ?? 1, tier, upgrade);
    if (skipUpgradePrompt) {
      performUpgrade(engineId, 'speed', cost);
      return;
    }
    const nextLevel = Math.min(maxBoostLevel(tables), (engine.speedLevel ?? 0) + 1);
    setUpgradeConfirm({ engineId, type: 'speed', cost, nextLevel });
  };

  const handleUpgradeCapacity = (engineId: string) => {
    const item = itemsRef.current.find(item => item.engine.id === engineId);
    if (!item) return;
    const { engine, tier } = item;
    const cost = capacityUpgradeLsCost(
      engine.capacityLevel ?? 0,
      engine.engineLevel ?? 1,
      tier,
      upgrade
    );
    if (skipUpgradePrompt) {
      performUpgrade(engineId, 'capacity', cost);
      return;
    }
    const nextLevel = Math.min(maxBoostLevel(tables), (engine.capacityLevel ?? 0) + 1);
    setUpgradeConfirm({ engineId, type: 'capacity', cost, nextLevel });
  };

  const confirmUpgrade = () => {
    if (!upgradeConfirm) return;
    const { engineId, type, cost } = upgradeConfirm;
    setUpgradeConfirm(null);
    performUpgrade(engineId, type, cost);
  };

  const runEquipChip = (engineId: string, chip: InventoryChip, cost: number) => {
    // Gated the same way as an upgrade: a short balance opens the top-up sheet
    // before the request, so the local price and a server refusal cannot show
    // the player two different-looking answers.
    requireStars(cost, async () => {
      setPendingPick({ engineId, category: 'chip', type: chip.type, itemId: chip.id });
      try {
        await equipChipMutation({ chipId: chip.id, engineId }).unwrap();
      } catch (error) {
        // Was `toast.error(t('action failed'))` — a grey line for what is
        // usually a price the player can still pay.
        await spend.report(error, { required: cost });
      } finally {
        setPendingPick(null);
      }
    });
  };

  const runActivateBooster = async (engineId: string, booster: InventoryBooster) => {
    setPendingPick({ engineId, category: 'booster', type: booster.type, itemId: booster.id });
    try {
      await activateBoosterMutation({ boosterId: booster.id, engineId }).unwrap();
    } catch (error) {
      await spend.report(error);
    } finally {
      setPendingPick(null);
    }
  };

  const confirmSlotPick = () => {
    if (!slotConfirm) return;
    const { engineId, chip, booster, cost } = slotConfirm;
    setSlotConfirm(null);
    if (chip) runEquipChip(engineId, chip, cost);
    else if (booster) runActivateBooster(engineId, booster);
  };

  const cancelSlotPick = () => {
    const back = slotConfirm?.from ?? null;
    setSlotConfirm(null);
    if (back) setPickerSlot(back);
  };

  if (isLoading) {
    return (
      <div className={twMerge('-mt-5 mb-0 flex w-full flex-col items-stretch', className)}>
        <div
          className="scrollbar-hidden engines-slider-edge-fade flex snap-x items-stretch gap-3 overflow-x-auto overflow-y-visible"
          style={{ paddingInline: SLIDE_PADDING_CSS }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                flex: `0 0 ${SLIDE_WIDTH_CSS}`,
                minHeight: SLIDE_MIN_H_CSS,
                transform: `scale(${i === 0 ? 1 : 0.78})`,
              }}
              className={twMerge(
                'relative flex origin-center items-center',
                i !== 0 && 'opacity-60 saturate-75'
              )}
            >
              <Skeleton
                variant="card"
                style={{ height: SLIDE_WIDTH_CSS }}
                className="w-full rounded-3xl"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isError && !items.length) {
    return <QueryErrorState className="mt-10" onRetry={() => refetch()} />;
  }

  if (!isLoading && !items.length) {
    return <EmptyDataInfo className="mt-10" />;
  }

  const buySlotIndex = items.length;
  const totalSlides = items.length + 1;

  return (
    <div className={twMerge('-mt-5 mb-0 flex w-full flex-col items-stretch', className)}>
      <div
        ref={scrollerRef}
        className="scrollbar-hidden engines-slider-edge-fade flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overflow-y-visible pt-0 pb-0"
        style={{
          scrollPaddingInline: SLIDE_PADDING_CSS,
          paddingInline: SLIDE_PADDING_CSS,
        }}
      >
        {items.map(({ engine, tier }, index) => {
          const isActive = index === activeIndex;
          const sideOffset = isActive ? 0 : index < activeIndex ? 35 : -35;
          return (
            <div
              key={engine.id}
              data-engine-slide
              data-engine-index={index}
              onClick={!isActive ? () => scrollToIndex(index) : undefined}
              style={{
                flex: `0 0 ${SLIDE_WIDTH_CSS}`,
                minHeight: SLIDE_MIN_H_CSS,
                transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.78})`,
                zIndex: isActive ? 10 : 1,
              }}
              className={twMerge(
                'relative flex origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive ? 'opacity-100' : 'cursor-pointer opacity-30 saturate-75'
              )}
            >
              <EngineCardCube
                engine={engine}
                tier={tier}
                index={index}
                tourAnchor={isActive}
                showRotateHint={isActive && rotateHintActive}
                onRotate={dismissRotateHint}
                elapsedSeconds={elapsedByEngine[engine.id] ?? 0}
                onClaim={handleClaim}
                onInstantClaim={handleInstantClaim}
                onUpgradeSpeed={handleUpgradeSpeed}
                onUpgradeCapacity={handleUpgradeCapacity}
                onSlotPick={slot =>
                  setPickerSlot({
                    engineId: engine.id,
                    engineTier: tier,
                    ...slot,
                  })
                }
                onChipUnequip={chipId => {
                  const chip = inventory?.chips.find(c => c.id === chipId);
                  if (chip) setChipToUnequip(chip);
                }}
                pendingSlot={pendingPick}
                cubeClassName={twMerge('w-full', !isActive && 'pointer-events-none')}
              />
            </div>
          );
        })}

        <div
          data-engine-slide
          data-engine-index={buySlotIndex}
          onClick={activeIndex !== buySlotIndex ? () => scrollToIndex(buySlotIndex) : undefined}
          style={{
            flex: `0 0 ${SLIDE_WIDTH_CSS}`,
            minHeight: SLIDE_MIN_H_CSS,
            transform: `translateX(${
              activeIndex === buySlotIndex ? 0 : buySlotIndex < activeIndex ? 35 : -35
            }px) scale(${activeIndex === buySlotIndex ? 1 : 0.78})`,
            zIndex: activeIndex === buySlotIndex ? 10 : 1,
          }}
          className={twMerge(
            'relative flex origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            activeIndex === buySlotIndex ? 'opacity-100' : 'cursor-pointer opacity-30 saturate-75'
          )}
        >
          <HomeBuyEngineSlot className="w-full" />
        </div>
      </div>

      {totalSlides > 1 && (
        <div
          ref={dotsRef}
          className="scrollbar-hidden mx-auto -mt-5 flex h-[64px] w-full items-center overflow-x-auto px-5"
        >
          <div className="mx-auto flex items-center gap-[30px] px-2 py-1">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const isActive = activeIndex === index;
              const isBuySlot = index === buySlotIndex;
              const item = index < items.length ? items[index] : undefined;
              const coreColors = item ? CORE_TIER_COLORS[item.tier] : undefined;
              const isClaimable = !!item && item.engine.pendingCount > 0;
              return (
                <button
                  key={index}
                  type="button"
                  data-dot-index={index}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => scrollToIndex(index)}
                  className={twMerge(
                    // 16px of cube, 30px of gap — a 44px zone lands 2px short of
                    // its neighbour's, so the dots take one after all. Measured
                    // 13.08.2026 on a prod build: 5 points of 25 before, the full
                    // 44×44 after, and no point ever stolen by another dot.
                    'tap-target eng-cube-perspective relative flex-shrink-0 cursor-pointer p-0',
                    isActive ? 'h-[26px] w-[26px]' : 'h-[16px] w-[16px]'
                  )}
                >
                  {isBuySlot ? (
                    <Plus
                      className={twMerge(
                        'text-electric-pink h-full w-full opacity-65',
                        !isActive && 'hover:opacity-80'
                      )}
                      strokeWidth={4}
                    />
                  ) : (
                    <span
                      className={twMerge(
                        'eng-cube h-full w-full',
                        isActive && 'eng-cube--active',
                        isClaimable && 'eng-cube--claimable'
                      )}
                      style={
                        coreColors
                          ? ({
                              '--core-mid': coreColors.mid,
                              '--core-dark': coreColors.dark,
                              '--core-glow': coreColors.glow,
                            } as React.CSSProperties)
                          : undefined
                      }
                    >
                      {isClaimable && (
                        <span aria-hidden className="eng-cube-core">
                          <span className="eng-cube-core-shell eng-cube-core-shell--xy" />
                          <span className="eng-cube-core-shell eng-cube-core-shell--yz" />
                          <span className="eng-cube-core-shell eng-cube-core-shell--xz" />
                        </span>
                      )}
                      <span className="eng-cube-face eng-cube-face--front" />
                      <span className="eng-cube-face eng-cube-face--back" />
                      <span className="eng-cube-face eng-cube-face--top" />
                      <span className="eng-cube-face eng-cube-face--bottom" />
                      <span className="eng-cube-face eng-cube-face--left" />
                      <span className="eng-cube-face eng-cube-face--right" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!chipToUnequip}
        loading={unequipping}
        title={t('unequip chip confirm title')}
        content={
          chipToUnequip ? (
            <p className="text-pink-secondary text-sm">
              {t('unequip chip confirm content', {
                cost: chipUnequipStarsCost(chipToUnequip.level),
              })}
            </p>
          ) : null
        }
        confirmText={t('unequip')}
        onClose={() => setChipToUnequip(null)}
        onConfirm={async () => {
          if (!chipToUnequip) return;
          try {
            await unequipChip({ chipId: chipToUnequip.id }).unwrap();
            setChipToUnequip(null);
          } catch (error) {
            setChipToUnequip(null);
            await spend.report(error);
          }
        }}
      />

      <EngineSlotPickerModal
        open={!!pickerSlot}
        category={pickerSlot?.category ?? 'chip'}
        type={pickerSlot?.type ?? 'speed'}
        engineId={pickerSlot?.engineId ?? ''}
        engineTier={pickerSlot?.engineTier ?? 'bronze'}
        pendingPickId={pendingPick?.itemId ?? null}
        onClose={() => setPickerSlot(null)}
        onPickChip={chip => {
          if (!pickerSlot) return;
          setSlotConfirm({
            engineId: pickerSlot.engineId,
            from: pickerSlot,
            chip,
            // Move-inclusive: this same number gates `requireStars` and is what
            // the server will take (DOCS §10.4).
            cost: chipSlotStarsCost(chip, pickerSlot.engineId),
          });
          setPickerSlot(null);
        }}
        onPickBooster={booster => {
          if (!pickerSlot) return;
          setSlotConfirm({
            engineId: pickerSlot.engineId,
            from: pickerSlot,
            booster,
            cost: 0,
          });
          setPickerSlot(null);
        }}
      />

      {/* The price rides in the gold pill inside, the way the instant-claim and
          upgrade confirms on this same screen state theirs — so the button stays
          one short word in every locale instead of spelling "Экипировать · 3 ★"
          out twice on one panel. */}
      <ConfirmModal
        open={!!slotConfirm}
        onClose={cancelSlotPick}
        onConfirm={confirmSlotPick}
        title={
          slotConfirm?.booster ? t('activate booster confirm title') : t('equip chip confirm title')
        }
        content={
          slotConfirm ? (
            <div className="flex flex-col items-center gap-3">
              {slotConfirm.chip ? (
                <ChipIcon
                  type={slotConfirm.chip.type}
                  tier={slotConfirm.chip.quality}
                  size={64}
                  className="shrink-0"
                />
              ) : slotConfirm.booster ? (
                <BoosterIcon
                  type={slotConfirm.booster.type}
                  tier={slotConfirm.booster.quality}
                  size={64}
                  className="shrink-0"
                />
              ) : null}
              <p className="text-sm font-extrabold text-white">
                {slotConfirm.chip
                  ? `${t(slotConfirm.chip.quality)} · ${
                      slotConfirm.chip.type === 'speed' ? t('time') : t('capacity')
                    } · ${t('lvl')} ${slotConfirm.chip.level} ${chipEffectLabel(slotConfirm.chip, t)}`
                  : slotConfirm.booster
                    ? `${t(slotConfirm.booster.quality)} · ${
                        slotConfirm.booster.type === 'speed' ? t('time') : t('capacity')
                      } · +${slotConfirm.booster.effectPct}% · ${t('{n}h duration', {
                        n: slotConfirm.booster.durationHours,
                      })}`
                    : null}
              </p>
              <p className="text-pink-secondary text-sm">
                {slotConfirm.booster ? t('booster activate note') : t('chip equip note')}
              </p>
              {slotConfirm.cost > 0 && (
                <div className="border-gold/40 bg-gold/10 text-gold inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-extrabold tabular-nums">
                  <TelegramStarIcon size={14} />
                  {slotConfirm.cost}
                </div>
              )}
            </div>
          ) : null
        }
        confirmText={slotConfirm?.booster ? t('activate') : t('equip')}
      />

      <ConfirmModal
        open={!!instantClaimConfirm}
        onClose={() => setInstantClaimConfirm(null)}
        onConfirm={confirmInstantClaim}
        title={t('instant claim title')}
        content={
          instantClaimConfirm ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-pink-secondary text-sm">{t('instant claim description')}</p>
              <div className="border-gold/40 bg-gold/10 text-gold inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-extrabold tabular-nums">
                <TelegramStarIcon size={14} />
                {instantClaimConfirm.cost}
              </div>
            </div>
          ) : null
        }
        confirmText={t('claim now')}
      />

      <ConfirmModal
        open={!!upgradeConfirm}
        onClose={() => setUpgradeConfirm(null)}
        onConfirm={confirmUpgrade}
        title={
          upgradeConfirm?.type === 'speed' ? t('upgrade speed title') : t('upgrade capacity title')
        }
        content={
          upgradeConfirm ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-pink-secondary text-sm">
                {upgradeConfirm.type === 'speed'
                  ? t('upgrade speed description')
                  : t('upgrade capacity description')}
              </p>
              <div className="text-pink-secondary text-[11px] font-bold uppercase tracking-wider">
                {t('level {level}', { level: upgradeConfirm.nextLevel })}
              </div>
              <div className="border-gold/40 bg-gold/10 text-gold inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-extrabold tabular-nums">
                <TelegramStarIcon size={14} />
                {upgradeConfirm.cost}
              </div>
              <label className="mt-1 flex cursor-pointer items-center gap-2.5">
                <Switch
                  aria-label={t('do not ask again')}
                  checked={skipUpgradePrompt}
                  onChange={toggleSkipUpgradePrompt}
                  className="scale-90"
                />
                <span className="text-pink-secondary text-xs">{t('do not ask again')}</span>
              </label>
            </div>
          ) : null
        }
        confirmText={t('confirm')}
      />

      {spend.modals}
    </div>
  );
}
