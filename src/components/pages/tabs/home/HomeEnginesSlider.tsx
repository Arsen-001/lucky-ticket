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
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { findActiveBooster, findEquippedChip } from '@/utils/global/inventory.utils';
import { EngineCardCube } from '@/components/pages/tabs/home/EngineCardCube';
import { EngineSlotPickerModal } from '@/components/pages/tabs/home/EngineSlotPickerModal';
import { HomeBuyEngineSlot } from '@/components/pages/tabs/home/HomeBuyEngineSlot';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { chipEquipStarsCost } from '@/utils/global/inventory.utils';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import '@/styles/components/engines-cube-dot.css';
import {
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  isEngineMaxed,
  MAX_BOOST_LEVEL,
} from '@/utils/global/ticket-engine.utils';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';

interface EngineWithTier {
  engine: TicketEngine;
  tier: TicketType;
}

const SLIDE_WIDTH_CSS = 'calc((100vw - 120px) / 1.038)';
const SLIDE_PADDING_CSS = `calc((100vw - (100vw - 120px) / 1.038) / 2)`;

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
  const { data: tickets, isLoading } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();
  const t = useAppTranslations();
  const { data: inventory } = useGetInventoryQuery();
  const [unequipChip, { isLoading: unequipping }] = useUnequipChipMutation();
  const [equipChipMutation] = useEquipChipMutation();
  const [activateBoosterMutation] = useActivateBoosterMutation();
  const [chipToUnequip, setChipToUnequip] = useState<InventoryChip | null>(null);
  const [skipConfirm, setSkipConfirm] = useState<{ engineId: string; cost: number } | null>(null);
  const [upgradeConfirm, setUpgradeConfirm] = useState<{
    engineId: string;
    type: 'speed' | 'capacity';
    cost: number;
    nextLevel: number;
  } | null>(null);
  const [pendingPick, setPendingPick] = useState<{
    engineId: string;
    category: 'chip' | 'booster';
    type: InventoryChipType;
    itemId: string;
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
    setItems(flatFromTickets);
  }

  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});
  const [starsModal, setStarsModal] = useState<{ open: boolean; required: number }>({
    open: false,
    required: 0,
  });
  const [pickerSlot, setPickerSlot] = useState<{
    engineId: string;
    engineTier: TicketType;
    category: 'chip' | 'booster';
    type: InventoryChipType;
  } | null>(null);

  const currentStars = me?.telegramStars ?? 0;
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;

  const requireStars = (cost: number, onPaid: () => void) => {
    if (currentStars < cost) {
      setStarsModal({ open: true, required: cost });
      return;
    }
    onPaid();
  };

  useEffect(() => {
    if (!items.length) return;

    const tick = () => {
      setElapsedByEngine(prev => {
        let changed = false;
        const next = { ...prev };
        for (const { engine } of items) {
          const speedChip = findEquippedChip(inventory?.chips, engine.id, 'speed');
          const speedBooster = findActiveBooster(inventory?.boosters, engine.id, 'speed');
          const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
          const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
          const elapsed =
            engine.pendingCount > 0
              ? effectiveCycleSeconds(engine, {
                  speedChip,
                  speedBooster,
                  capacityChip,
                  capacityBooster,
                  isLuckyPlayer: isLp,
                  isVip,
                })
              : engineElapsedSeconds(engine);
          if (next[engine.id] !== elapsed) {
            next[engine.id] = elapsed;
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      setItems(prev => {
        let changed = false;
        const next = prev.map(item => {
          const { engine } = item;
          if (engine.pendingCount > 0) return item;
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
          });
          const elapsed = engineElapsedSeconds(engine);
          if (elapsed >= cycle) {
            changed = true;
            return {
              ...item,
              engine: {
                ...engine,
                pendingCount: engineCapacity(engine, { capacityChip, capacityBooster }),
              },
            };
          }
          return item;
        });
        return changed ? next : prev;
      });
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [items]);

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
  };

  const handleInstantClaim = (engineId: string) => {
    const engine = items.find(item => item.engine.id === engineId)?.engine;
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
    });
    const elapsed = elapsedByEngine[engine.id] ?? engineElapsedSeconds(engine);
    const remaining = Math.max(0, cycle - elapsed);
    const cost = Math.max(1, Math.ceil(remaining / 3600));
    setSkipConfirm({ engineId, cost });
  };

  const fastForwardEngine = (engineId: string) => {
    const engine = items.find(item => item.engine.id === engineId)?.engine;
    if (!engine) return;
    const capacityChip = findEquippedChip(inventory?.chips, engine.id, 'capacity');
    const capacityBooster = findActiveBooster(inventory?.boosters, engine.id, 'capacity');
    const fullCapacity = engineCapacity(engine, { capacityChip, capacityBooster });
    updateEngine(engineId, e => ({ ...e, pendingCount: fullCapacity }));
  };

  const confirmSkip = () => {
    if (!skipConfirm) return;
    const { engineId, cost } = skipConfirm;
    setSkipConfirm(null);
    requireStars(cost, () => fastForwardEngine(engineId));
  };

  const promoteIfMaxed = (engine: TicketEngine): TicketEngine => {
    if (isEngineMaxed(engine)) {
      return {
        ...engine,
        engineLevel: (engine.engineLevel ?? 1) + 1,
        speedLevel: 0,
        capacityLevel: 0,
      };
    }
    return engine;
  };

  const handleUpgradeSpeed = (engineId: string) => {
    const engine = items.find(item => item.engine.id === engineId)?.engine;
    if (!engine) return;
    const cost = 5 + (engine.speedLevel ?? 0) * 3;
    const nextLevel = Math.min(MAX_BOOST_LEVEL, (engine.speedLevel ?? 0) + 1);
    setUpgradeConfirm({ engineId, type: 'speed', cost, nextLevel });
  };

  const handleUpgradeCapacity = (engineId: string) => {
    const engine = items.find(item => item.engine.id === engineId)?.engine;
    if (!engine) return;
    const cost = 8 + (engine.capacityLevel ?? 0) * 4;
    const nextLevel = Math.min(MAX_BOOST_LEVEL, (engine.capacityLevel ?? 0) + 1);
    setUpgradeConfirm({ engineId, type: 'capacity', cost, nextLevel });
  };

  const confirmUpgrade = () => {
    if (!upgradeConfirm) return;
    const { engineId, type, cost } = upgradeConfirm;
    setUpgradeConfirm(null);
    requireStars(cost, () =>
      updateEngine(engineId, e =>
        promoteIfMaxed({
          ...e,
          ...(type === 'speed'
            ? { speedLevel: Math.min(MAX_BOOST_LEVEL, (e.speedLevel ?? 0) + 1) }
            : { capacityLevel: Math.min(MAX_BOOST_LEVEL, (e.capacityLevel ?? 0) + 1) }),
        })
      )
    );
  };

  if (isLoading) {
    return (
      <div className={twMerge('-mt-5 mb-0 flex w-full flex-col items-stretch', className)}>
        <div
          className="scrollbar-hidden flex snap-x items-stretch gap-3 overflow-x-auto overflow-y-visible"
          style={{ paddingInline: SLIDE_PADDING_CSS }}
        >
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                flex: `0 0 ${SLIDE_WIDTH_CSS}`,
                transform: `scale(${i === 0 ? 1 : 0.78})`,
              }}
              className={twMerge(
                'relative flex origin-center items-center min-h-[calc(100vw-60px)]',
                i !== 0 && 'opacity-60 saturate-75'
              )}
            >
              <Skeleton variant="card" className="h-[calc(100vw-120px)] w-full rounded-3xl" />
            </div>
          ))}
        </div>
      </div>
    );
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
        className="scrollbar-hidden flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto overflow-y-visible pt-0 pb-0"
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
                transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.78})`,
                zIndex: isActive ? 10 : 1,
              }}
              className={twMerge(
                'relative flex origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] min-h-[calc(100vw-60px)]',
                isActive ? 'opacity-100' : 'cursor-pointer opacity-60 saturate-75'
              )}
            >
              <EngineCardCube
                engine={engine}
                tier={tier}
                index={index}
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
            transform: `translateX(${
              activeIndex === buySlotIndex ? 0 : buySlotIndex < activeIndex ? 35 : -35
            }px) scale(${activeIndex === buySlotIndex ? 1 : 0.78})`,
            zIndex: activeIndex === buySlotIndex ? 10 : 1,
          }}
          className={twMerge(
            'relative flex origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)] min-h-[calc(100vw-60px)]',
            activeIndex === buySlotIndex ? 'opacity-100' : 'cursor-pointer opacity-60 saturate-75'
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
                    'eng-cube-perspective relative flex-shrink-0 cursor-pointer p-0',
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
                cost: chipEquipStarsCost(chipToUnequip.level),
              })}
            </p>
          ) : null
        }
        confirmText={t('unequip')}
        onClose={() => setChipToUnequip(null)}
        onConfirm={async () => {
          if (!chipToUnequip) return;
          await unequipChip({ chipId: chipToUnequip.id }).unwrap();
          setChipToUnequip(null);
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
        onPickChip={async chip => {
          if (!pickerSlot) return;
          setPendingPick({
            engineId: pickerSlot.engineId,
            category: 'chip',
            type: chip.type,
            itemId: chip.id,
          });
          setPickerSlot(null);
          try {
            await equipChipMutation({
              chipId: chip.id,
              engineId: pickerSlot.engineId,
            }).unwrap();
          } finally {
            setPendingPick(null);
          }
        }}
        onPickBooster={async booster => {
          if (!pickerSlot) return;
          setPendingPick({
            engineId: pickerSlot.engineId,
            category: 'booster',
            type: booster.type,
            itemId: booster.id,
          });
          setPickerSlot(null);
          try {
            await activateBoosterMutation({
              boosterId: booster.id,
              engineId: pickerSlot.engineId,
            }).unwrap();
          } finally {
            setPendingPick(null);
          }
        }}
      />

      <ConfirmModal
        open={!!skipConfirm}
        onClose={() => setSkipConfirm(null)}
        onConfirm={confirmSkip}
        title={t('skip cycle title')}
        content={
          skipConfirm ? (
            <div className="flex flex-col items-center gap-3">
              <p className="text-pink-secondary text-sm">{t('skip cycle description')}</p>
              <div className="border-gold/40 bg-gold/10 text-gold inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-extrabold tabular-nums">
                <TelegramStarIcon size={14} />
                {skipConfirm.cost}
              </div>
            </div>
          ) : null
        }
        confirmText={t('skip')}
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
            </div>
          ) : null
        }
        confirmText={t('confirm')}
      />

      <NotEnoughStarsModal
        open={starsModal.open}
        onClose={() => setStarsModal(prev => ({ ...prev, open: false }))}
        requiredStars={starsModal.required}
        currentStars={currentStars}
      />
    </div>
  );
}
