import { twMerge } from 'tailwind-merge';
import { formatMultiplier } from '@/utils/global/number.utils';

export type SuperBoostBadgeSize = 'xs' | 'sm' | 'md';

export interface SuperBoostBadgeProps {
  /** Raw factor — `1.3` renders as `×1.3`. */
  multiplier: number;
  size?: SuperBoostBadgeSize;
  className?: string;
}

const sizeClasses: Record<SuperBoostBadgeSize, string> = {
  xs: 'px-1 py-px text-[9px]',
  sm: 'px-1.5 py-0.5 text-[11px]',
  md: 'px-2 py-0.5 text-[13px]',
};

/**
 * The one mark a super boost wears, everywhere it appears: a gold `×N` pill.
 *
 * A multiplier and a summand are different things — the multiplier is worth the
 * same on a brand-new engine and on a maxed one, the summand is not — and the
 * app was leaving that difference to be inferred from a `×` glyph at 9px next to
 * a column of `+X%`. Gold is deliberately NOT the source's own colour (Lucky
 * Player pink, chip teal): the source keeps its colour on the icon and the bar,
 * while the pill says which CLASS of boost this is. Same pill on the engine
 * breakdown, the reactor legend, the passport, the chip rows and the status
 * screens, so recognising it once is enough.
 */
export function SuperBoostBadge({ multiplier, size = 'sm', className }: SuperBoostBadgeProps) {
  return (
    <span
      className={twMerge(
        'border-gold/55 bg-gold/15 text-gold inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-black leading-none tabular-nums',
        sizeClasses[size],
        className
      )}
    >
      {formatMultiplier(multiplier)}
    </span>
  );
}
