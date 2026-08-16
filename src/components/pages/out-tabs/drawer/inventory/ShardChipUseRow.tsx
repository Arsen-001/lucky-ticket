'use client';

import { Check } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { ChipIcon } from '@/components/shared/icons/ChipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InventoryChip } from '@/types/interfaces/inventory.interfaces';

export interface ShardChipUseRowProps {
  chip: InventoryChip;
  /** Shards of this exact kind on hand — the row's whole point is the gap. */
  owned: number;
  accent: string;
  className?: string;
}

/**
 * One chip this shard can actually be spent on, with the price of its next
 * level and how much of that price is already paid.
 */
export function ShardChipUseRow({ chip, owned, accent, className }: ShardChipUseRowProps) {
  const t = useAppTranslations();
  const need = chip.shardsForNextLevel;
  const ready = owned >= need;
  const progressPct = Math.min(100, Math.round((owned / need) * 100));

  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <ChipIcon type={chip.type} tier={chip.quality} size={28} className="shrink-0" />

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <span className="text-[11px] font-bold text-white/75 tabular-nums">
          {t('lv {level}', { level: chip.level })} → {chip.level + 1}
        </span>
        <div className="h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full"
            style={{
              width: `${progressPct}%`,
              background: `linear-gradient(90deg, ${accent}, color-mix(in srgb, ${accent} 55%, white))`,
            }}
          />
        </div>
      </div>

      <span
        className={twMerge(
          'flex shrink-0 items-center gap-1 text-[11px] font-extrabold tabular-nums',
          ready ? 'text-white' : 'text-white/45'
        )}
      >
        {ready && <Check size={12} strokeWidth={3} style={{ color: accent }} />}
        {Math.min(owned, need)} / {need}
      </span>
    </div>
  );
}
