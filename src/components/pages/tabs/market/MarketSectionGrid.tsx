'use client';

import { Children, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export interface MarketSectionGridProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  accent?: string;
  children: ReactNode;
  cols?: 1 | 2;
  className?: string;
}

export function MarketSectionGrid({
  title,
  subtitle,
  icon: Icon,
  accent = 'var(--color-electric-pink)',
  children,
  cols = 2,
  className,
}: MarketSectionGridProps) {
  const count = Children.count(children);

  return (
    <section className={twMerge('flex flex-col gap-3', className)}>
      <header className="relative flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2.5 min-w-0">
          {Icon && (
            <span
              className="flex-center h-7 w-7 shrink-0 rounded-lg"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
                boxShadow: `inset 0 0 10px color-mix(in srgb, ${accent} 35%, transparent)`,
              }}
            >
              <Icon size={14} style={{ color: accent }} strokeWidth={2.5} />
            </span>
          )}
          <h2 className="text-base font-extrabold tracking-tight text-white truncate">{title}</h2>
          {count > 0 && (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums"
              style={{
                backgroundColor: `color-mix(in srgb, ${accent} 22%, transparent)`,
                color: accent,
              }}
            >
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-pink-secondary text-[11px] font-semibold shrink-0">{subtitle}</span>
        )}

        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-1 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, color-mix(in srgb, ${accent} 65%, transparent) 0%, transparent 60%)`,
          }}
        />
      </header>
      <div className={twMerge('grid gap-2.5', cols === 1 ? 'grid-cols-1' : 'grid-cols-2')}>
        {children}
      </div>
    </section>
  );
}
