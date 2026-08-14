'use client';

import { twMerge } from 'tailwind-merge';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QUALITY_ACCENT } from '@/utils/global/inventory.utils';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { Dictionary } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';

export interface InventoryShardPillProps {
  tier: TicketType;
  type: InventoryChipType;
  count: number;
  /** Bigger art, used in the expanded grid; the strip stays compact. */
  expanded?: boolean;
  className?: string;
}

export function InventoryShardPill({
  tier,
  type,
  count,
  expanded = false,
  className,
}: InventoryShardPillProps) {
  const t = useAppTranslations();
  const accent = QUALITY_ACCENT[tier];
  const label = `${t(tier as Parameters<Dictionary>[0])} · ${type === 'speed' ? t('time') : t('capacity')}`;

  return (
    <div
      title={label}
      aria-label={`${label}: ${count}`}
      className={twMerge(
        'flex shrink-0 items-center gap-1.5 rounded-xl border px-2 py-1.5',
        expanded && 'flex-col gap-1 px-1 py-2',
        className
      )}
      style={{
        borderColor: `color-mix(in srgb, ${accent} ${count > 0 ? 45 : 18}%, transparent)`,
        backgroundColor: `color-mix(in srgb, ${accent} ${count > 0 ? 12 : 5}%, transparent)`,
      }}
    >
      <ChipShardIcon type={type} tier={tier} size={expanded ? 40 : 26} empty={count === 0} />
      <span
        className="text-[12px] font-extrabold tabular-nums"
        style={{ color: count > 0 ? 'white' : 'rgba(255,255,255,0.3)' }}
      >
        {count}
      </span>
    </div>
  );
}
