import { twMerge } from 'tailwind-merge';
import type { ReactNode } from 'react';

export interface LabSectionProps {
  title: string;
  /** One line on what is being compared and what the decision is. */
  note?: string;
  /**
   * Lets the options run to both screen edges. Anything full-bleed on the real
   * screen — a slider whose gutters are computed from the viewport — is judged
   * on the wrong width inside the section's own padding.
   */
  bleed?: boolean;
  children: ReactNode;
}

/**
 * One labelled block of the design lab. Deliberately plain: anything decorative
 * here would compete with the thing being judged.
 */
export function LabSection({ title, note, bleed = false, children }: LabSectionProps) {
  return (
    <section className="flex flex-col gap-2.5 border-t border-white/10 px-4 pt-5 pb-6 first:border-t-0">
      <h2 className="text-sm font-extrabold text-white">{title}</h2>
      {note && <p className="text-[11px] leading-snug text-white/45">{note}</p>}
      <div className={twMerge('mt-1 flex flex-col gap-5', bleed && '-mx-4')}>{children}</div>
    </section>
  );
}
