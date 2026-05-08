import type { ReactNode } from 'react';

export interface EngineCubeStatCellProps {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}

export function EngineCubeStatCell({ icon, label, value, accent }: EngineCubeStatCellProps) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-lg border bg-black/35 py-1.5"
      style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)` }}
    >
      {icon}
      <span className="text-[9px] font-bold uppercase tracking-wider text-white/55">{label}</span>
      <span className="text-[12px] font-extrabold tabular-nums" style={{ color: accent }}>
        {value}
      </span>
    </div>
  );
}
