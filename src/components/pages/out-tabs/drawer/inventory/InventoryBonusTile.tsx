'use client';

import { Info } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { CHIP_TYPE_ICON, TYPE_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { InventoryTypeStats } from '@/utils/global/inventory.utils';

/** Beyond this many engines the segmented meter stops reading as a meter. */
const MAX_SEGMENTS = 8;

export interface InventoryBonusTileProps {
  type: InventoryChipType;
  stats: InventoryTypeStats;
  /** While the snapshot is in flight every number here would be a truthful-
   *  looking zero, so the tile shows a placeholder instead. */
  loading?: boolean;
  /** Opens the explainer for THIS type — a percentage with no unit behind it is
   *  not an answer, and this tile was the screen's first number. */
  onInfo?: (type: InventoryChipType) => void;
  className?: string;
}

export function InventoryBonusTile({
  type,
  stats,
  loading = false,
  onInfo,
  className,
}: InventoryBonusTileProps) {
  const t = useAppTranslations();
  const Icon = CHIP_TYPE_ICON[type];
  const accent = TYPE_ACCENT[type];
  const hasBonus = stats.totalPct > 0;
  // `totalPct` carries each type in its OWN unit (@see inventoryTypeStats):
  // percent for speed, whole tickets for capacity since the ten-level ladder
  // (17.08.2026). The tile printed both with a "%" — so a fleet running +40
  // extra tickets a collect read as "+40.0%", a number the chip's own row
  // right below it contradicted. Same plural-aware string the row uses.
  const value =
    type === 'speed' ? `+${stats.totalPct}%` : t('chip capacity effect', { n: stats.totalPct });

  return (
    <button
      type="button"
      onClick={() => onInfo?.(type)}
      aria-label={`${type === 'speed' ? t('time') : t('capacity')} · ${t('what are chips')}`}
      className={twMerge(
        'shine-card flex flex-col items-stretch gap-2 overflow-hidden rounded-2xl p-3 text-start transition-transform active:scale-98',
        className
      )}
      style={{ ['--shine-card-accent' as string]: accent }}
    >
      <span className="relative z-1 flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-white/55">
        <Icon size={12} stroke={accent} strokeWidth={2.6} />
        {type === 'speed' ? t('time') : t('capacity')}
        <Info size={13} strokeWidth={2.4} className="ms-auto text-white/40" />
      </span>

      {loading ? (
        <Skeleton variant="line" className="relative z-1 h-5 w-20" />
      ) : (
        <span
          // Wraps, never truncates. 20px was chosen so "+1020 tickets" fits one
          // line at 390px — but Japanese puts the number INSIDE the phrase
          // ("チケット+40枚"), so at 320px an ellipsis ate the number itself and
          // the tile showed a unit with no value. Two lines beat a lost number;
          // the grid stretches both tiles to the taller one.
          className="relative z-1 text-[20px] font-extrabold leading-tight tabular-nums"
          style={{
            color: hasBonus ? accent : 'rgba(255,255,255,0.32)',
            textShadow: hasBonus
              ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`
              : 'none',
          }}
        >
          {value}
        </span>
      )}

      <div className="relative z-1 flex flex-col gap-1.5">
        {loading ? (
          <Skeleton variant="line" className="h-2.5 w-16" />
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-wider text-white/45 tabular-nums">
            {t('slots {used} of {total}', { used: stats.filled, total: stats.slots })}
          </span>
        )}
        {!loading && stats.slots > 0 && stats.slots <= MAX_SEGMENTS && (
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
