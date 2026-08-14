'use client';

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
  className?: string;
}

export function InventoryBonusTile({ type, stats, className }: InventoryBonusTileProps) {
  const t = useAppTranslations();
  const Icon = CHIP_TYPE_ICON[type];
  const accent = TYPE_ACCENT[type];
  const hasBonus = stats.totalPct > 0;

  return (
    <div
      className={twMerge(
        'shine-card flex flex-col gap-2 overflow-hidden rounded-2xl p-3',
        className
      )}
      style={{ ['--shine-card-accent' as string]: accent }}
    >
      <span className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/55">
        <Icon size={12} stroke={accent} strokeWidth={2.6} />
        {type === 'speed' ? t('time') : t('capacity')}
      </span>

      <span
        className="text-[22px] font-extrabold leading-none tabular-nums"
        style={{
          color: hasBonus ? accent : 'rgba(255,255,255,0.32)',
          textShadow: hasBonus ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)` : 'none',
        }}
      >
        +{stats.totalPct.toFixed(1)}%
      </span>

      <div className="flex flex-col gap-1.5">
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
    </div>
  );
}
