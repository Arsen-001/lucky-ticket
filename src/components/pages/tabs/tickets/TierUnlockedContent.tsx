'use client';

import { EnginePreviewCard } from '@/components/pages/tabs/tickets/EnginePreviewCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import '@/styles/components/engine-preview-card.css';

const TIER_CLASS: Record<TicketType, string> = {
  bronze: 'engine-preview-card-tier-bronze',
  silver: 'engine-preview-card-tier-silver',
  gold: 'engine-preview-card-tier-gold',
  platinum: 'engine-preview-card-tier-platinum',
  diamond: 'engine-preview-card-tier-diamond',
};

export interface TierUnlockedContentProps {
  ticket: Ticket;
  tier: TicketType;
  engines: TicketEngine[];
  elapsedByEngine: Record<string, number>;
  onClaimAll?: () => void;
  onClaimEngine?: (engineId: string) => void;
  className?: string;
}

export function TierUnlockedContent({
  ticket,
  tier,
  engines,
  elapsedByEngine,
  onClaimAll,
  onClaimEngine,
  className,
}: TierUnlockedContentProps) {
  const t = useAppTranslations();

  const totalReady = engines.reduce((sum, engine) => sum + (engine.pendingCount || 0), 0);
  const inventoryCount = ticket.count ?? 0;

  return (
    <div className={`flex flex-col gap-3 ${className ?? ''}`}>
      <div className={`${TIER_CLASS[tier]} rounded-2xl p-3.5 flex items-center gap-3`}>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-pink-secondary">
            {t('in inventory')}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-2xl font-extrabold text-white tabular-nums leading-none">
              {inventoryCount}
            </span>
            <span className="text-[11px] text-white-secondary">{t('tickets')}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-pink-secondary">
            {t('engines')}
          </div>
          <div className="flex items-baseline gap-1 mt-0.5 justify-end">
            <span className="text-2xl font-extrabold text-white tabular-nums leading-none">
              {engines.length}
            </span>
            <span className="text-[11px] text-white-secondary">{t('active')}</span>
          </div>
        </div>
      </div>

      {totalReady > 0 && (
        <div className="px-3.5 py-2 rounded-xl bg-success/8 border border-success/25 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success shadow-[0_0_8px_rgba(74,222,128,0.7)] animation-blink" />
          <span className="text-xs font-bold text-success">
            {t('{count} tickets ready', { count: totalReady })}
          </span>
          {onClaimAll && (
            <button
              type="button"
              onClick={onClaimAll}
              className="relative ml-auto rounded-full bg-success px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white cursor-pointer active:scale-95 transition-transform overflow-hidden"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
              >
                <span className="absolute -top-1/2 -left-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/40 to-transparent animate-task-shine" />
              </span>
              <span className="relative">{t('claim all')}</span>
            </button>
          )}
        </div>
      )}

      {engines.length === 0 ? (
        <EmptyDataInfo
          className="mt-4"
          title={t('no engines yet')}
          description={t('no engines yet description')}
        />
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {engines.map((engine, index) => (
            <div
              key={engine.id}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <EnginePreviewCard
                engine={engine}
                tier={tier}
                index={index}
                elapsedSeconds={elapsedByEngine[engine.id] ?? 0}
                onClaim={onClaimEngine ? () => onClaimEngine(engine.id) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
