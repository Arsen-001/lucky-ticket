import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

export interface LabVariantProps {
  /** Short label the two of us can point at: "A", "B · афиша", … */
  label: string;
  /** What this option is betting on, in one line. */
  bet?: string;
  /** Inside a `bleed` section: keeps the caption indented while the option runs edge to edge. */
  bleed?: boolean;
  children: ReactNode;
}

/** A single option under comparison, captioned so it can be named out loud. */
export function LabVariant({ label, bet, bleed = false, children }: LabVariantProps) {
  const captionClass = bleed ? 'px-4' : '';

  return (
    <div className="flex flex-col gap-1.5">
      <span
        className={twMerge(
          'text-[10px] font-bold tracking-[0.14em] text-white/45 uppercase',
          captionClass
        )}
      >
        {label}
      </span>
      {bet && (
        <p className={twMerge('text-[11px] leading-snug text-white/40', captionClass)}>{bet}</p>
      )}
      {children}
    </div>
  );
}
