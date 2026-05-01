'use client';

import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { useGetTicketByIdQuery } from '@/api/tickets.api';
import { TicketDetailsHero } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetailsHero';
import { TicketDetailsActions } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetailsActions';
import { TicketDetailsRequirements } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetailsRequirements';
import { TicketDetailsEnginesSection } from '@/components/pages/out-tabs/tabs-extra/ticket/TicketDetailsEnginesSection';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  MAX_BOOST_LEVEL,
  effectiveCycleSeconds,
  engineCapacity,
  engineElapsedSeconds,
  isEngineMaxed,
} from '@/utils/global/ticket-engine.utils';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';

export interface TicketDetailsProps {
  id: string;
}

export function TicketDetails({ id }: TicketDetailsProps) {
  const t = useAppTranslations();
  const { data, isLoading } = useGetTicketByIdQuery(id);

  const [engines, setEngines] = useState<TicketEngine[]>([]);
  const [elapsedByEngine, setElapsedByEngine] = useState<Record<string, number>>({});

  useEffect(() => {
    if (data?.engines) setEngines(data.engines);
  }, [data?.engines]);

  useEffect(() => {
    if (!engines.length) return;

    const computeElapsed = () => {
      setElapsedByEngine(prev => {
        let changed = false;
        const next = { ...prev };
        for (const engine of engines) {
          const elapsed =
            engine.pendingCount > 0 ? effectiveCycleSeconds(engine) : engineElapsedSeconds(engine);
          if (next[engine.id] !== elapsed) {
            next[engine.id] = elapsed;
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      setEngines(prev => {
        let changed = false;
        const next = prev.map(engine => {
          if (engine.pendingCount > 0) return engine;
          const cycle = effectiveCycleSeconds(engine);
          const elapsed = engineElapsedSeconds(engine);
          if (elapsed >= cycle) {
            changed = true;
            return { ...engine, pendingCount: engineCapacity(engine) };
          }
          return engine;
        });
        return changed ? next : prev;
      });
    };

    computeElapsed();
    const intervalId = window.setInterval(computeElapsed, 1000);
    return () => window.clearInterval(intervalId);
  }, [engines]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <TicketDetailsHero loading />
      </div>
    );
  }

  if (!data) {
    return <EmptyDataInfo title={t('not found')} description={t('ticket not found')} />;
  }

  const handleClaim = (engineId: string) => {
    setEngines(prev =>
      prev.map(engine =>
        engine.id === engineId
          ? { ...engine, pendingCount: 0, cycleStartedAt: dayjs().toISOString() }
          : engine
      )
    );
    setElapsedByEngine(prev => ({ ...prev, [engineId]: 0 }));
  };

  const handleInstantClaim = (engineId: string) => {
    setEngines(prev =>
      prev.map(engine =>
        engine.id === engineId
          ? { ...engine, pendingCount: 0, cycleStartedAt: dayjs().toISOString() }
          : engine
      )
    );
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
    setEngines(prev =>
      prev.map(engine =>
        engine.id === engineId
          ? promoteIfMaxed({
              ...engine,
              speedLevel: Math.min(MAX_BOOST_LEVEL, (engine.speedLevel ?? 0) + 1),
            })
          : engine
      )
    );
  };

  const handleUpgradeCapacity = (engineId: string) => {
    setEngines(prev =>
      prev.map(engine =>
        engine.id === engineId
          ? promoteIfMaxed({
              ...engine,
              capacityLevel: Math.min(MAX_BOOST_LEVEL, (engine.capacityLevel ?? 0) + 1),
            })
          : engine
      )
    );
  };

  const totalReady = engines.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0);
  const ticketWithLocalEngines = { ...data, engines };

  return (
    <div className="flex flex-col gap-4 pb-6">
      <TicketDetailsHero ticket={ticketWithLocalEngines} totalReady={totalReady} />

      {data.blocked ? (
        <TicketDetailsRequirements ticketType={data.ticketType} requirements={data.requirements} />
      ) : (
        <TicketDetailsActions />
      )}

      {!data.blocked && engines.length > 0 && (
        <TicketDetailsEnginesSection
          tier={data.ticketType}
          engines={engines}
          elapsedByEngine={elapsedByEngine}
          totalReady={totalReady}
          onClaim={handleClaim}
          onInstantClaim={handleInstantClaim}
          onUpgradeSpeed={handleUpgradeSpeed}
          onUpgradeCapacity={handleUpgradeCapacity}
        />
      )}
    </div>
  );
}
