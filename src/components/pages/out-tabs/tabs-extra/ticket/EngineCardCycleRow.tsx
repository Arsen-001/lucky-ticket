'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { Clock } from 'lucide-react';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { ClientPortal } from '@/components/shared/ClientPortal';
import { formatCycleTime } from '@/utils/global/ticket-engine.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';
// Owns the `.engine-claim-*` classes now — imported here, not just in EngineCard,
// so the claim button/fly-out styling survives in any chunk that renders the row.
import '@/styles/components/engine-card.css';

const TIER_CLAIM_FLOW: Record<TicketType, { c1: string; c2: string; c3: string }> = {
  bronze: { c1: '#AC6122', c2: '#E08A3A', c3: '#FFC787' },
  silver: { c1: '#A8AAA4', c2: '#D8D8D8', c3: '#FFFFFF' },
  gold: { c1: '#F8BD3E', c2: '#FFD56A', c3: '#FFE89A' },
  platinum: { c1: '#C0BEB1', c2: '#E2E0D0', c3: '#FFFFFF' },
  diamond: { c1: '#178D88', c2: '#3FD9CF', c3: '#83F5EE' },
};

export interface EngineCardCycleRowProps {
  engineId: string;
  pendingCount: number;
  tier: TicketType;
  capacity: number;
  remaining: number;
  pending: boolean;
  compact: boolean;
  instantClaimCost: number;
  glow: string;
  onClaim: (engineId: string) => void;
  onInstantClaim: (engineId: string) => void;
}

type FlightItem = {
  top: number;
  left: number;
  width: number;
  height: number;
  dx: number;
  dy: number;
};

/**
 * The only part of the engine card that legitimately updates on a claim / skip /
 * countdown tick: the pending-vs-producing info strip, the claim/skip button and
 * the reward fly-out. Isolated into its own component so those per-second updates
 * don't drag the reactor image and boost rows (the memoized siblings) into a
 * re-render. This is the "kusok chto izmenilsya" — only this re-renders.
 */
export function EngineCardCycleRow({
  engineId,
  pendingCount,
  tier,
  capacity,
  remaining,
  pending,
  compact,
  instantClaimCost,
  glow,
  onClaim,
  onInstantClaim,
}: EngineCardCycleRowProps) {
  const t = useAppTranslations();

  const [flightData, setFlightData] = useState<{ tickets: FlightItem } | null>(null);
  const ticketsGroupRef = useRef<HTMLDivElement>(null);
  const flyTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (flyTimerRef.current !== null) window.clearTimeout(flyTimerRef.current);
    };
  }, []);

  const handleClaim = () => {
    if (!pending || flightData) return;
    const ticketsEl = ticketsGroupRef.current;
    if (!ticketsEl) {
      onClaim(engineId);
      return;
    }

    const computeFlight = (
      el: HTMLElement,
      targetSelector: string,
      fallbackY: number
    ): FlightItem => {
      const rect = el.getBoundingClientRect();
      const target = document.querySelector(targetSelector);
      const targetRect = target?.getBoundingClientRect();
      const fromX = rect.left + rect.width / 2;
      const fromY = rect.top + rect.height / 2;
      const toX = targetRect ? targetRect.left + targetRect.width / 2 : fromX;
      const toY = targetRect ? targetRect.top + targetRect.height / 2 : fallbackY;
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        dx: toX - fromX,
        dy: toY - fromY,
      };
    };

    setFlightData({
      tickets: computeFlight(ticketsEl, '[data-flight-target="tickets"]', window.innerHeight - 40),
    });

    flyTimerRef.current = window.setTimeout(() => {
      setFlightData(null);
      onClaim(engineId);
    }, 1400);
  };

  return (
    <div
      className={twMerge(
        'flex items-center bg-black/28 border border-white/5',
        compact ? 'gap-2 p-1.5 px-2 rounded-lg' : 'gap-2.5 p-2 px-2.5 rounded-xl'
      )}
    >
      {/* Both info states stay mounted and just toggle `hidden` instead of
          swapping via {pending ? … : …}. The shared TicketOverlap is a
          Next.js <Image>; unmounting/remounting it on the pending flip
          (e.g. right after pressing Skip) reloads the icon = a visible
          flicker. Kept mounted (eager-loaded), the swap is instant. */}
      <div
        className={twMerge(
          'relative flex-1 min-w-0 flex items-center justify-center gap-1.5 overflow-hidden rounded-md',
          !pending && 'hidden'
        )}
        style={{ visibility: flightData ? 'hidden' : undefined }}
      >
        <div ref={ticketsGroupRef} className="flex items-center gap-1.5">
          <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
          <span
            className={twMerge(
              'font-extrabold tabular-nums rounded-full',
              compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
            )}
            style={{
              color: glow,
              background: `color-mix(in srgb, ${glow} 18%, transparent)`,
              border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
            }}
          >
            ×{pendingCount}
          </span>
        </div>
      </div>
      <div className={twMerge('flex-1 min-w-0 flex items-center gap-2', pending && 'hidden')}>
        <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <span
            className={twMerge(
              'font-extrabold text-white leading-none truncate',
              compact ? 'text-[11px]' : 'text-[12px]'
            )}
          >
            {t(`${tier} ticket` as Parameters<typeof t>[0])}
            <span className="ml-1 tabular-nums text-white/65 font-bold">
              {pendingCount}/{capacity}
            </span>
          </span>
          <span
            className={twMerge(
              'text-white inline-flex items-center gap-1 leading-none tabular-nums font-bold',
              compact ? 'text-[10px]' : 'text-[11px]'
            )}
          >
            <Clock size={compact ? 9 : 10} strokeWidth={2.4} />
            {formatCycleTime(remaining)}
          </span>
        </div>
      </div>
      {/* Both buttons stay mounted and toggle `hidden` — swapping them via
          {pending ? … : …} remounts a button on every claim/skip flip; keeping
          both avoids that churn (the info strip above already does the same). */}
      <button
        data-tour="claim-cta"
        onClick={handleClaim}
        disabled={!!flightData}
        className={twMerge(
          'engine-claim-button engine-claim-flow relative z-10 cursor-pointer overflow-hidden text-white font-extrabold uppercase tracking-wider flex-center shrink-0 active:scale-99 transition-transform duration-100 disabled:opacity-70',
          compact
            ? 'min-w-14 h-6.5 px-2 rounded-md text-[9px]'
            : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]',
          !pending && 'hidden'
        )}
        style={
          {
            '--claim-flow-1': TIER_CLAIM_FLOW[tier].c1,
            '--claim-flow-2': TIER_CLAIM_FLOW[tier].c2,
            '--claim-flow-3': TIER_CLAIM_FLOW[tier].c3,
            boxShadow: `0 4px 12px color-mix(in srgb, ${glow} 45%, transparent), inset 0 1px 0 rgba(255,255,255,0.3)`,
          } as CSSProperties
        }
      >
        <span className="relative z-1">{t('claim')}</span>
      </button>
      <button
        onClick={() => onInstantClaim(engineId)}
        title={t('instant claim with stars')}
        className={twMerge(
          'relative z-20 border border-gold/40 bg-gold/10 text-gold font-extrabold tracking-wider flex-center shrink-0 cursor-pointer hover:bg-gold/15 active:scale-99 transition-all duration-100 gap-1',
          compact
            ? 'min-w-14 h-6.5 px-2 rounded-md text-[9px]'
            : 'min-w-16 h-7.5 px-2.5 rounded-lg text-[10px]',
          pending && 'hidden'
        )}
      >
        <TelegramStarIcon size={compact ? 10 : 11} />
        <span>
          {t('claim now')} · {instantClaimCost}
        </span>
      </button>

      {flightData && (
        <ClientPortal>
          <div
            aria-hidden
            className="engine-claim-fly pointer-events-none fixed z-[200] flex items-center gap-1.5"
            style={
              {
                top: flightData.tickets.top,
                left: flightData.tickets.left,
                width: flightData.tickets.width,
                height: flightData.tickets.height,
                '--fly-dx': `${flightData.tickets.dx}px`,
                '--fly-dy': `${flightData.tickets.dy}px`,
              } as CSSProperties
            }
          >
            <TicketOverlap type={tier} width={32} height={24} className="shrink-0" />
            <span
              className={twMerge(
                'font-extrabold tabular-nums rounded-full',
                compact ? 'text-[10px] px-1.5 py-px' : 'text-[11px] px-2 py-0.5'
              )}
              style={{
                color: glow,
                background: `color-mix(in srgb, ${glow} 18%, transparent)`,
                border: `1px solid color-mix(in srgb, ${glow} 35%, transparent)`,
              }}
            >
              ×{pendingCount}
            </span>
          </div>
        </ClientPortal>
      )}
    </div>
  );
}
