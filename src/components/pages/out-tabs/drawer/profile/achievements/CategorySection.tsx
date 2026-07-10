import type { ReactNode } from 'react';

export interface CategorySectionProps {
  label: string;
  count: number;
  total: number;
  children: ReactNode;
}

export function CategorySection({ label, count, total, children }: CategorySectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-baseline gap-2 px-5">
        <h2 className="text-xs font-extrabold uppercase tracking-widest text-white/60">{label}</h2>
        <span className="text-[11px] font-bold tabular-nums text-white/30">
          {count}/{total}
        </span>
      </div>
      <div className="px-4">{children}</div>
    </section>
  );
}
