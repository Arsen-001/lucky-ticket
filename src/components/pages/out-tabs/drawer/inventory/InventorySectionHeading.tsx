import { twMerge } from 'tailwind-merge';

export interface InventorySectionHeadingProps {
  label: string;
  count?: number;
  /** Colours the count chip — used to mark the "ready" group. */
  accent?: string;
  className?: string;
}

export function InventorySectionHeading({
  label,
  count,
  accent,
  className,
}: InventorySectionHeadingProps) {
  return (
    <div className={twMerge('flex items-center gap-2', className)}>
      <span className="text-pink-secondary text-[10px] font-extrabold uppercase tracking-wider">
        {label}
      </span>
      {typeof count === 'number' && (
        <span
          className="rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums"
          style={{
            color: accent ?? 'rgba(255,255,255,0.6)',
            backgroundColor: `color-mix(in srgb, ${accent ?? 'white'} 16%, transparent)`,
          }}
        >
          {count}
        </span>
      )}
      <span aria-hidden className="h-px flex-1 bg-white/8" />
    </div>
  );
}
