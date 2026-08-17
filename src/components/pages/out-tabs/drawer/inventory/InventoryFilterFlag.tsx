'use client';

import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface InventoryFilterFlagProps {
  label: string;
  /** Omitted while the collection is still loading — a "0" caption on every
   *  pill reads as an answer, and it is the wrong one. */
  count?: number;
  active: boolean;
  /** Tier/type colour. Drives the dot, the active fill and the glow. */
  accent?: string;
  Icon?: LucideIcon;
  onClick: () => void;
  className?: string;
}

/**
 * One filter pill, carrying the number of records behind it.
 *
 * The count is the whole collection's count for that slice, not the count after
 * the other flags are applied: it is a caption on the button, so it has to stop
 * moving every time a neighbour is tapped. An empty slice is dimmed, never
 * hidden and never disabled — "there are none" is an answer too.
 */
export function InventoryFilterFlag({
  label,
  count,
  active,
  accent,
  Icon,
  onClick,
  className,
}: InventoryFilterFlagProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={twMerge(
        'tap-target relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-2 text-[11px] font-extrabold uppercase tracking-wider transition-colors duration-200 active:scale-95',
        active
          ? 'text-white'
          : 'text-white-secondary border-transparent bg-white/5 hover:bg-white/10',
        count === 0 && !active && 'opacity-50',
        count === undefined && 'opacity-60',
        className
      )}
      style={
        active
          ? {
              borderColor: `color-mix(in srgb, ${accent ?? 'var(--color-electric-pink)'} 75%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accent ?? 'var(--color-electric-pink)'} 24%, transparent)`,
              boxShadow: `0 0 12px color-mix(in srgb, ${accent ?? 'var(--color-electric-pink)'} 30%, transparent)`,
            }
          : undefined
      }
    >
      {Icon ? (
        <Icon size={12} stroke={accent ?? 'currentColor'} strokeWidth={2.6} />
      ) : accent ? (
        <span
          className="h-2 w-2 rounded-full"
          style={{
            backgroundColor: accent,
            boxShadow: active ? `0 0 8px ${accent}` : 'none',
          }}
        />
      ) : null}
      <span>{label}</span>
      {typeof count === 'number' && <span className="tabular-nums opacity-70">{count}</span>}
    </button>
  );
}
