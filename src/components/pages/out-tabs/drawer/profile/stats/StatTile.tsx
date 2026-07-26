import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export type StatTileAccent = 'pink' | 'teal' | 'purple' | 'gold';

export interface StatTileProps {
  label: string;
  /** Already-formatted value, or `null` when there is nothing to show yet. */
  value: string | null;
  hint?: string;
  icon: LucideIcon;
  accent?: StatTileAccent;
  loading?: boolean;
  className?: string;
  classNames?: { label?: string; value?: string; icon?: string };
}

const accentClasses: Record<StatTileAccent, string> = {
  pink: 'text-electric-pink bg-electric-pink/10',
  teal: 'text-teal bg-teal/10',
  purple: 'text-electric-purple bg-electric-purple/10',
  gold: 'text-gold bg-gold/10',
};

/**
 * One number on the stats screen.
 *
 * A `null` value renders an em dash instead of a zero: "лучшее место — 0" reads
 * as a result, when it actually means the player has not finished a tournament
 * yet, and those are different things to be told about yourself.
 */
export function StatTile({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'purple',
  loading = false,
  className,
  classNames,
}: StatTileProps) {
  return (
    <div
      className={twMerge(
        'card-outlined flex flex-col gap-2 rounded-2xl bg-background-overlay/60 p-4',
        className
      )}
    >
      <span
        className={twMerge(
          'flex-center size-8 rounded-lg',
          accentClasses[accent],
          classNames?.icon
        )}
      >
        <Icon className="size-4" />
      </span>

      {loading ? (
        <Skeleton className="h-7 w-20" />
      ) : (
        <span
          className={twMerge(
            'text-2xl leading-none font-extrabold text-white',
            value === null && 'text-white/35',
            classNames?.value
          )}
        >
          {value ?? '—'}
        </span>
      )}

      <span className={twMerge('text-xs text-white/55', classNames?.label)}>{label}</span>
      {hint && <span className="text-[11px] text-white/35">{hint}</span>}
    </div>
  );
}
