'use client';

import { twMerge } from 'tailwind-merge';
import { EnginePreviewCard } from '@/components/pages/tabs/tickets/EnginePreviewCard';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketEngine } from '@/types/interfaces/ticket.interfaces';
import type { Ticket, TicketType } from '@/types/types/ticket.types';
import '@/styles/components/achievement.css';
import { staggerMs } from '@/utils/global/animation.utils';

const TIER_NUMBER_GRADIENT: Record<TicketType, string> = {
  bronze:
    'linear-gradient(100deg, #A35423 0%, #FFD2A0 25%, #E08A3A 50%, #FFEBC9 75%, #A35423 100%)',
  silver:
    'linear-gradient(100deg, #8C8E90 0%, #FFFFFF 25%, #D8D8D8 50%, #FFFFFF 75%, #8C8E90 100%)',
  gold: 'linear-gradient(100deg, #B68A2C 0%, #FFF5D9 18%, #F8BD3E 38%, #FFFFFF 55%, #F8BD3E 75%, #B68A2C 100%)',
  platinum:
    'linear-gradient(100deg, #9F9D90 0%, #FFFFFF 25%, #E2E0D0 50%, #FFFFFF 75%, #9F9D90 100%)',
  diamond:
    'linear-gradient(100deg, #1B7E78 0%, #DFFFFC 25%, #3FD9CF 50%, #FFFFFF 75%, #1B7E78 100%)',
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
    <div className={twMerge('flex flex-col gap-3', className)}>
      <div
        className="shine-card rounded-2xl p-3.5 flex items-center gap-3"
        style={{ ['--shine-card-accent' as string]: `var(--color-${tier})` }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold uppercase tracking-[1.2px] text-pink-secondary">
            {t('in inventory')}
          </div>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span
              className="ach-status-username tabular-nums leading-none"
              style={{
                fontSize: '30px',
                backgroundImage: TIER_NUMBER_GRADIENT[tier],
              }}
            >
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
            <span
              className="ach-status-username tabular-nums leading-none"
              style={{
                fontSize: '30px',
                backgroundImage: TIER_NUMBER_GRADIENT[tier],
              }}
            >
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
              style={{ animationDelay: `${staggerMs(index, 50)}ms` }}
            >
              <EnginePreviewCard
                engine={engine}
                tier={tier}
                index={index}
                elapsedSeconds={elapsedByEngine[engine.id]}
                onClaim={onClaimEngine ? () => onClaimEngine(engine.id) : undefined}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
