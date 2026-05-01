'use client';

import 'swiper/css';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { twMerge } from 'tailwind-merge';

import { useGetTicketsQuery } from '@/api/tickets.api';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import {
  MAX_BOOST_LEVEL,
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  isEngineMaxed,
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
    <Swiper
      className={twMerge('w-full overflow-visible', className)}
      slidesPerView={1.08}
      spaceBetween={12}
      grabCursor
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
  );
}
