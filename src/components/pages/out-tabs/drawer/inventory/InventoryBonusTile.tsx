'use client';

import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { CHIP_TYPE_ICON, TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { InventoryTypeStats } from '@/utils/global/inventory.utils';

/** Beyond this many engines the segmented meter stops reading as a meter. */
const MAX_SEGMENTS = 8;

export interface InventoryBonusTileProps {
  type: InventoryChipType;
  stats: InventoryTypeStats;
  /** Opens the explainer for THIS type — a percentage with no unit behind it is
   *  not an answer, and this tile was the screen's first number. */
  onInfo?: (type: InventoryChipType) => void;
  className?: string;
}

export function InventoryBonusTile({ type, stats, onInfo, className }: InventoryBonusTileProps) {
  const t = useAppTranslations();
  const Icon = CHIP_TYPE_ICON[type];
  const accent = TYPE_ACCENT[type];
  const hasBonus = stats.totalPct > 0;

  return (
    <button
      type="button"
      onClick={() => onInfo?.(type)}
      aria-label={`${type === 'speed' ? t('time') : t('capacity')} · ${t('what are chips')}`}
      className={twMerge(
        'shine-card flex flex-col items-stretch gap-2 overflow-hidden rounded-2xl p-3 text-left transition-transform active:scale-98',
        className
      )}
      style={{ ['--shine-card-accent' as string]: accent }}
    >
      <span className="relative z-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/55">
        <Icon size={12} stroke={accent} strokeWidth={2.6} />
        {type === 'speed' ? t('time') : t('capacity')}
        <Info size={13} strokeWidth={2.4} className="ml-auto text-white/40" />
      </span>

      <span
        className="relative z-1 text-[22px] font-extrabold leading-none tabular-nums"
        style={{
          color: hasBonus ? accent : 'rgba(255,255,255,0.32)',
          textShadow: hasBonus ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)` : 'none',
        }}
      >
        +{stats.totalPct.toFixed(1)}%
      </span>

      <div className="relative z-1 flex flex-col gap-1.5">
        <span className="text-[9px] font-bold uppercase tracking-wider text-white/45 tabular-nums">
          {t('slots {used} of {total}', { used: stats.filled, total: stats.slots })}
        </span>
        {stats.slots > 0 && stats.slots <= MAX_SEGMENTS && (
          <div className="flex items-center gap-1">
            {Array.from({ length: stats.slots }, (_, i) => (
              <span
                key={i}
                className="h-1 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    i < stats.filled ? accent : 'color-mix(in srgb, white 12%, transparent)',
                  boxShadow:
                    i < stats.filled
                      ? `0 0 6px color-mix(in srgb, ${accent} 55%, transparent)`
                      : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </button>
  );
}
