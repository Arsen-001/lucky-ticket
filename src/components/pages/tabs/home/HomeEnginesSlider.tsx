'use client';

import 'swiper/css';
import 'swiper/css/effect-coverflow';

import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import type { Swiper as SwiperType } from 'swiper';
import { EffectCoverflow } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import { twMerge } from 'tailwind-merge';

import { useGetTicketsQuery } from '@/api/tickets.api';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
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

export function HomeEnginesSlider({ className }: ClassNameProps) {
  const { data: tickets, isLoading } = useGetTicketsQuery();

  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [items, setItems] = useState<EngineWithTier[]>([]);
  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});

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
    updateEngine(engineId, engine =>
      promoteIfMaxed({
        ...engine,
        speedLevel: Math.min(MAX_BOOST_LEVEL, (engine.speedLevel ?? 0) + 1),
      })
    );
  };

  const handleUpgradeCapacity = (engineId: string) => {
    updateEngine(engineId, engine =>
      promoteIfMaxed({
        ...engine,
        capacityLevel: Math.min(MAX_BOOST_LEVEL, (engine.capacityLevel ?? 0) + 1),
      })
    );
  };

  if (!isLoading && !items.length) {
    return <EmptyDataInfo className="mt-10" />;
  }

  return (
    <div className={twMerge('flex w-full flex-col items-center', className)}>
      <Swiper
        className="w-full overflow-visible pb-6 mt-5"
        slidesPerView={1.4286}
        spaceBetween={30}
        centeredSlides
        grabCursor
        loop={items.length > 1}
        modules={[EffectCoverflow]}
        effect="coverflow"
        coverflowEffect={{
          rotate: 0,
          slideShadows: false,
          depth: 180,
          modifier: 1,
          stretch: 0,
        }}
        onSwiper={swiper => {
          swiperRef.current = swiper;
        }}
        onSlideChange={swiper => setActiveIndex(swiper.realIndex)}
      >
        {items.map(({ engine, tier }, index) => (
          <SwiperSlide key={engine.id} className="h-auto">
            <EngineCard
              engine={engine}
              tier={tier}
              index={index}
              elapsedSeconds={elapsedByEngine[engine.id] ?? 0}
              onClaim={handleClaim}
              onInstantClaim={handleClaim}
              onUpgradeSpeed={handleUpgradeSpeed}
              onUpgradeCapacity={handleUpgradeCapacity}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      {items.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {items.map(({ engine }, index) => (
            <button
              key={engine.id}
              type="button"
              aria-label={`Slide ${index + 1}`}
              onClick={() => swiperRef.current?.slideToLoop(index)}
              className={twMerge(
                'h-2 rounded-full transition-all duration-300',
                activeIndex === index ? 'w-5 bg-electric-pink' : 'w-2 bg-white/25'
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
