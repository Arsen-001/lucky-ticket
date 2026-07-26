import type { ReactNode } from 'react';

export interface StatsSectionProps {
  title: string;
  children: ReactNode;
}

/**
 * A titled 2×N grid of stat tiles. The stagger is inline `animationDelay` on
 * the wrapper, matching every other list in the app.
 */
export function StatsSection({ title, children }: StatsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold text-white/70">{title}</h2>
      <div className="grid grid-cols-2 gap-3">{children}</div>
    </section>
  );
}
