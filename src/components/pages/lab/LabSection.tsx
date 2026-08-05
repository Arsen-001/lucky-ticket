import type { ReactNode } from 'react';

export interface LabSectionProps {
  title: string;
  /** One line on what is being compared and what the decision is. */
  note?: string;
  children: ReactNode;
}

/**
 * One labelled block of the design lab. Deliberately plain: anything decorative
 * here would compete with the thing being judged.
 */
export function LabSection({ title, note, children }: LabSectionProps) {
  return (
    <section className="flex flex-col gap-2.5 border-t border-white/10 px-4 pt-5 pb-6 first:border-t-0">
      <h2 className="text-sm font-extrabold text-white">{title}</h2>
      {note && <p className="text-[11px] leading-snug text-white/45">{note}</p>}
      <div className="mt-1 flex flex-col gap-5">{children}</div>
    </section>
  );
}
