import type { ReactNode } from 'react';

export interface LabVariantProps {
  /** Short label the two of us can point at: "A", "B · афиша", … */
  label: string;
  /** What this option is betting on, in one line. */
  bet?: string;
  children: ReactNode;
}

/** A single option under comparison, captioned so it can be named out loud. */
export function LabVariant({ label, bet, children }: LabVariantProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold tracking-[0.14em] text-white/45 uppercase">
        {label}
      </span>
      {bet && <p className="text-[11px] leading-snug text-white/40">{bet}</p>}
      {children}
    </div>
  );
}
