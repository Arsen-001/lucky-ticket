'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Plus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { HomeBuyEngineSlot } from '@/components/pages/tabs/home/HomeBuyEngineSlot';
import { NotEnoughStarsModal } from '@/components/pages/tabs/home/NotEnoughStarsModal';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
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

interface EngineWithTier {
  engine: TicketEngine;
  tier: TicketType;
}

const SLIDE_WIDTH = 300;

const TIER_INDICATOR: Record<TicketType, { bg: string; shadow: string }> = {
  bronze: { bg: 'bg-bronze', shadow: 'rgba(172,97,34,0.85)' },
  silver: { bg: 'bg-silver', shadow: 'rgba(168,170,164,0.85)' },
  gold: { bg: 'bg-gold', shadow: 'rgba(248,189,62,0.85)' },
  platinum: { bg: 'bg-platinum', shadow: 'rgba(192,190,177,0.85)' },
  diamond: { bg: 'bg-diamond', shadow: 'rgba(23,141,136,0.85)' },
};

export function HomeEnginesSlider({ className }: ClassNameProps) {
  const { data: tickets, isLoading } = useGetTicketsQuery();
  const { data: me } = useGetMeQuery();

  const scrollerRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<EngineWithTier[]>([]);
  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});
  const [starsModal, setStarsModal] = useState<{ open: boolean; required: number }>({
    open: false,
    required: 0,
  });

  const currentStars = me?.telegramStars ?? 0;

  const requireStars = (cost: number, onPaid: () => void) => {
    if (currentStars < cost) {
      setStarsModal({ open: true, required: cost });
      return;
    }
    onPaid();
  };

  useEffect(() => {
    if (!tickets) return;
    const flat = tickets
      .filter(ticket => !ticket.blocked && ticket.engines?.length)
      .flatMap(
        ticket =>
          ticket.engines?.map<EngineWithTier>(engine => ({
            engine,
            tier: ticket.ticketType,
          })) ?? []
      );
    setItems(flat);
  }, [tickets]);

  useEffect(() => {
    if (!items.length) return;

    const tick = () => {
      setElapsedByEngine(prev => {
        let changed = false;
        const next = { ...prev };
        for (const { engine } of items) {
          const elapsed =
            engine.pendingCount > 0 ? effectiveCycleSeconds(engine) : engineElapsedSeconds(engine);
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
          const cycle = effectiveCycleSeconds(engine);
          const elapsed = engineElapsedSeconds(engine);
          if (elapsed >= cycle) {
            changed = true;
            return { ...item, engine: { ...engine, pendingCount: engineCapacity(engine) } };
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
    requireStars(engine.instantClaimStarsCost, () => handleClaim(engineId));
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
    requireStars(cost, () =>
      updateEngine(engineId, e =>
        promoteIfMaxed({
          ...e,
          speedLevel: Math.min(MAX_BOOST_LEVEL, (e.speedLevel ?? 0) + 1),
        })
      )
    );
  };

  const handleUpgradeCapacity = (engineId: string) => {
    const engine = items.find(item => item.engine.id === engineId)?.engine;
    if (!engine) return;
    const cost = 8 + (engine.capacityLevel ?? 0) * 4;
    requireStars(cost, () =>
      updateEngine(engineId, e =>
        promoteIfMaxed({
          ...e,
          capacityLevel: Math.min(MAX_BOOST_LEVEL, (e.capacityLevel ?? 0) + 1),
        })
      )
    );
  };

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
          scrollPaddingInline: `calc(50% - ${SLIDE_WIDTH / 2}px)`,
          paddingInline: `calc(50% - ${SLIDE_WIDTH / 2}px)`,
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
                flex: `0 0 ${SLIDE_WIDTH}px`,
                transform: `translateX(${sideOffset}px) scale(${isActive ? 1 : 0.78})`,
              }}
              className={twMerge(
                'flex min-h-[380px] origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
                isActive ? 'opacity-100' : 'cursor-pointer opacity-60 saturate-75'
              )}
            >
              <EngineCard
                engine={engine}
                tier={tier}
                index={index}
                elapsedSeconds={elapsedByEngine[engine.id] ?? 0}
                onClaim={handleClaim}
                onInstantClaim={handleInstantClaim}
                onUpgradeSpeed={handleUpgradeSpeed}
                onUpgradeCapacity={handleUpgradeCapacity}
                className="w-full"
              />
            </div>
          );
        })}

        <div
          data-engine-slide
          data-engine-index={buySlotIndex}
          onClick={activeIndex !== buySlotIndex ? () => scrollToIndex(buySlotIndex) : undefined}
          style={{
            flex: `0 0 ${SLIDE_WIDTH}px`,
            transform: `translateX(${
              activeIndex === buySlotIndex ? 0 : buySlotIndex < activeIndex ? 35 : -35
            }px) scale(${activeIndex === buySlotIndex ? 1 : 0.78})`,
          }}
          className={twMerge(
            'flex min-h-[380px] origin-center snap-center items-center transition-all duration-[450ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
            activeIndex === buySlotIndex ? 'opacity-100' : 'cursor-pointer opacity-60 saturate-75'
          )}
        >
          <HomeBuyEngineSlot className="w-full" />
        </div>
      </div>

      {totalSlides > 1 && (
        <div
          ref={dotsRef}
          className="scrollbar-hidden mx-auto -mt-5 flex h-10 w-full items-center overflow-x-auto px-5"
        >
          <div className="mx-auto flex items-center gap-2.5 px-2 py-1">
            {Array.from({ length: totalSlides }).map((_, index) => {
              const isActive = activeIndex === index;
              const item = index < items.length ? items[index] : undefined;
              const isBuySlot = index === buySlotIndex;
              const isClaimable = !!item && item.engine.pendingCount > 0;
              const indicator = item ? TIER_INDICATOR[item.tier] : undefined;
              return (
                <button
                  key={index}
                  type="button"
                  data-dot-index={index}
                  aria-label={`Slide ${index + 1}`}
                  onClick={() => scrollToIndex(index)}
                  className={twMerge(
                    'relative flex flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-all duration-300',
                    isBuySlot
                      ? 'h-[20.77px] w-[20.77px] bg-transparent'
                      : isActive
                        ? 'bg-pink-gradient h-[20.77px] w-[20.77px]'
                        : 'h-[16.25px] w-[16.25px] bg-white/25 hover:bg-white/40'
                  )}
                >
                  {isBuySlot && (
                    <Plus
                      className={twMerge(
                        'text-electric-pink h-[20.77px] w-[20.77px] opacity-65',
                        !isActive && 'hover:opacity-80'
                      )}
                      strokeWidth={4}
                    />
                  )}
                  {isClaimable && !isActive && indicator && (
                    <>
                      <span
                        aria-hidden
                        className={twMerge(
                          'animate-ping absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full',
                          indicator.bg
                        )}
                        style={{ boxShadow: `0 0 6px ${indicator.shadow}` }}
                      />
                      <span
                        aria-hidden
                        className={twMerge(
                          'absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full',
                          indicator.bg
                        )}
                        style={{ boxShadow: `0 0 6px ${indicator.shadow}` }}
                      />
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <NotEnoughStarsModal
        open={starsModal.open}
        onClose={() => setStarsModal(prev => ({ ...prev, open: false }))}
        requiredStars={starsModal.required}
        currentStars={currentStars}
      />
    </div>
  );
}
