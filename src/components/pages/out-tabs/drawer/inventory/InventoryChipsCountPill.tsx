import type { ReactNode } from 'react';

export interface InventoryChipsCountPillProps {
  icon: ReactNode;
  label: string;
  count: number;
  accent: string;
}

export function InventoryChipsCountPill({
  icon,
  label,
  count,
  accent,
}: InventoryChipsCountPillProps) {
  return (
    <div
      className="flex items-center justify-between gap-2 rounded-xl border bg-black/20 px-3 py-2"
      style={{
        borderColor: `color-mix(in srgb, ${accent} 40%, transparent)`,
      }}
    >
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-white/65">
          {label}
        </span>
      </div>
      <span className="text-base font-extrabold tabular-nums" style={{ color: accent }}>
        {count}
      </span>
    </div>
  );
}
