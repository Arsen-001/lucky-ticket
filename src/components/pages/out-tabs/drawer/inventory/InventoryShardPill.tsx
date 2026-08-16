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
  /** Opens the stack's explainer — what it is and which chip it feeds. */
  onClick?: () => void;
  className?: string;
}

export function InventoryShardPill({
  tier,
  type,
  count,
  expanded = false,
  onClick,
  className,
}: InventoryShardPillProps) {
  const t = useAppTranslations();
  const accent = QUALITY_ACCENT[tier];
  const label = `${t(tier as Parameters<Dictionary>[0])} · ${type === 'speed' ? t('time') : t('capacity')}`;

  const shared = {
    title: label,
    'aria-label': `${label}: ${count}`,
    className: twMerge(
      // `py-2`, not `py-1.5`, and not `tap-target` either: the compact strip
      // scrolls with `overflow-x-auto`, which clips on BOTH axes, and a hit
      // zone drawn outside the box is exactly what a clip erases. 26px of art
      // plus 16px of padding is the 44px zone, inside the box.
      'flex shrink-0 items-center gap-1.5 rounded-xl border px-2 py-2',
      expanded && 'flex-col gap-1 px-1',
      onClick && 'cursor-pointer transition-transform active:scale-95',
      className
    ),
    style: {
      borderColor: `color-mix(in srgb, ${accent} ${count > 0 ? 45 : 18}%, transparent)`,
      backgroundColor: `color-mix(in srgb, ${accent} ${count > 0 ? 12 : 5}%, transparent)`,
    },
  };

  const content = (
    <>
      <ChipShardIcon type={type} tier={tier} size={expanded ? 40 : 26} empty={count === 0} />
      <span
        className="text-[12px] font-extrabold tabular-nums"
        style={{ color: count > 0 ? 'white' : 'rgba(255,255,255,0.3)' }}
      >
        {count}
      </span>
    </>
  );

  // A `<button>` only when it does something — a focusable control that does
  // nothing is worse for a screen reader than the plain box it replaces.
  return onClick ? (
    <button type="button" onClick={onClick} {...shared}>
      {content}
    </button>
  ) : (
    <div {...shared}>{content}</div>
  );
}
