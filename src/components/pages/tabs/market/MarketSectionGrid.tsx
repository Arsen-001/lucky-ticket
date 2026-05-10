'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export interface MarketSectionGridProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  cols?: 1 | 2;
  className?: string;
}

export function MarketSectionGrid({
  title,
  subtitle,
  children,
  cols = 2,
  className,
}: MarketSectionGridProps) {
  return (
    <section className={twMerge('flex flex-col gap-2.5', className)}>
      <header className="flex items-baseline justify-between gap-2 px-1">
        <h2 className="text-[13px] font-extrabold uppercase tracking-[0.18em] text-white">
          {title}
        </h2>
        {subtitle && (
          <span className="text-pink-secondary text-[10px] font-semibold">{subtitle}</span>
        )}
      </header>
      <div className={twMerge('grid gap-2.5', cols === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
        {children}
      </div>
    </section>
  );
}
