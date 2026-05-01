'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { EngineCard } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineCard';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface TicketDetailsEnginesSectionProps {
  tier: TicketType;
  engines: TicketEngine[];
  elapsedByEngine: Record<string, number>;
  totalReady: number;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
  onUpgradeSpeed: (engineId: string) => void;
  onUpgradeCapacity: (engineId: string) => void;
  className?: string;
}

export function TicketDetailsEnginesSection({
  tier,
  engines,
  elapsedByEngine,
  totalReady,
  onClaim,
  onInstantClaim,
  onUpgradeSpeed,
  onUpgradeCapacity,
  className,
}: TicketDetailsEnginesSectionProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[1.2px] text-pink-secondary">
            {t('engines')}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-lg font-extrabold text-white tabular-nums">{engines.length}</span>
            <span className="text-[11px] text-white-secondary">{t('producing in parallel')}</span>
          </div>
        </div>
      </div>

      {totalReady > 0 && (
        <div className="px-3.5 py-2.5 rounded-xl bg-success/8 border border-success/25 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(74,222,128,0.7)] animation-blink" />
          <span className="text-xs font-bold text-success">
            {t('{count} tickets ready', { count: totalReady })}
          </span>
          <span className="ml-auto text-[11px] text-white-secondary">
            {t('paused until you claim')}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {engines.map((engine, index) => (
          <EngineCard
            key={engine.id}
            engine={engine}
            tier={tier}
            index={index}
            elapsedSeconds={elapsedByEngine[engine.id] ?? 0}
            onClaim={onClaim}
            onInstantClaim={onInstantClaim}
            onUpgradeSpeed={onUpgradeSpeed}
            onUpgradeCapacity={onUpgradeCapacity}
          />
        ))}
      </div>
    </div>
  );
}
