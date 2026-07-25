'use client';

import { memo } from 'react';
import { twMerge } from 'tailwind-merge';
import { Clock, Layers } from 'lucide-react';
import { ReactorDial } from '@/components/pages/out-tabs/tabs-extra/ticket/ReactorDial';
import { EngineLevelBadge } from '@/components/pages/out-tabs/tabs-extra/ticket/EngineLevelBadge';
import { formatCycleTime } from '@/utils/global/ticket-engine.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { TicketType } from '@/types/types/ticket.types';

const SPEED_ACCENT = '#C5B0F8';
const CAPACITY_ACCENT = '#FFE08A';

export interface EngineCardStatsHeaderProps {
  tier: TicketType;
  index: number;
  engineLevel: number;
  cycle: number;
  capacity: number;
  compact: boolean;
  reactorVisual: 'ticket' | 'engine';
  tourAnchor: boolean;
  /** False where the screen already names the engine in its page header. */
  showName: boolean;
}

/**
 * The engine's identity row — reactor visual, level badge, name and the
 * cycle/capacity stat pills. Its inputs (tier, level, cycle, capacity) change
 * only on an UPGRADE, never on a claim/skip/countdown tick, so `memo` keeps this
 * subtree — including the reactor image — from re-rendering while the cycle row
 * ticks every second. That's the whole point of the split: update the piece that
 * changed, leave the rest alone.
 */
function EngineCardStatsHeaderImpl({
  tier,
  index,
  engineLevel,
  cycle,
  capacity,
  compact,
  reactorVisual,
  tourAnchor,
  showName,
}: EngineCardStatsHeaderProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex items-center relative', compact ? 'gap-2.5' : 'gap-3')}>
      <div data-tour={tourAnchor ? 'engine' : undefined} className="shrink-0">
        {/* No data-derived key here. ReactorDial renders purely from its
            props (tier / capacity), so keying it by the cycle forced a full
            REMOUNT — and an icon flicker — every time the cycle changed, e.g.
            on a speed/capacity upgrade. Let it update in place instead. */}
        <ReactorDial
          tier={tier}
          capacity={capacity}
          size={compact ? 86 : 110}
          visual={reactorVisual}
        />
      </div>
      <div
        className={twMerge(
          'flex-1 min-w-0 flex flex-col',
          compact ? 'items-center gap-1' : 'gap-1.5'
        )}
      >
        <div
          className={twMerge(
            compact ? 'flex flex-col items-center gap-1' : 'flex items-center flex-wrap gap-1.5'
          )}
        >
          <EngineLevelBadge level={engineLevel} tier={tier} />
          {showName && (
            <span
              className={twMerge(
                'font-extrabold text-white leading-tight',
                compact ? 'text-[13px]' : 'text-sm ml-0'
              )}
            >
              {t('engine number', { number: index + 1 })}
            </span>
          )}
        </div>
        <div
          className={twMerge(
            'rounded-xl border border-white/8 bg-black/30',
            compact
              ? 'flex w-fit flex-col divide-y divide-white/8 p-[5px]'
              : 'grid grid-cols-2 divide-x divide-white/8 py-1.5'
          )}
        >
          <button
            type="button"
            title={t('cycle full', { time: formatCycleTime(cycle) })}
            className={twMerge(
              'flex cursor-help items-center gap-1.5',
              compact ? 'justify-center px-2 py-0.5' : 'justify-center px-2'
            )}
          >
            <Clock size={compact ? 12 : 14} stroke={SPEED_ACCENT} strokeWidth={2.4} />
            <span
              className={twMerge(
                'font-extrabold tabular-nums',
                compact ? 'text-[12px]' : 'text-[13px]'
              )}
              style={{ color: SPEED_ACCENT }}
            >
              {formatCycleTime(cycle)}
            </span>
          </button>
          <button
            type="button"
            title={t('per cycle full', { capacity })}
            className={twMerge(
              'flex cursor-help items-center gap-1.5',
              compact ? 'justify-center px-2 py-0.5' : 'justify-center px-2'
            )}
          >
            <Layers size={compact ? 12 : 14} stroke={CAPACITY_ACCENT} strokeWidth={2.4} />
            <span
              className={twMerge(
                'font-extrabold tabular-nums',
                compact ? 'text-[12px]' : 'text-[13px]'
              )}
              style={{ color: CAPACITY_ACCENT }}
            >
              ×{compactNumber(capacity)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export const EngineCardStatsHeader = memo(EngineCardStatsHeaderImpl);

const compactFormatter = new Intl.NumberFormat('en', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

function compactNumber(value: number): string {
  if (value < 1000) return String(value);
  return compactFormatter.format(value);
}
