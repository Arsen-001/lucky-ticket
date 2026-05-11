'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';

export type SettingsStatusAccent = 'pink' | 'gold';

export interface SettingsStatusHeroProps {
  icon: ReactNode;
  title: string;
  statusLabel: string;
  description?: string;
  active?: boolean;
  accent?: SettingsStatusAccent;
  loading?: boolean;
  className?: string;
}

const ACCENT_VAR: Record<SettingsStatusAccent, string> = {
  pink: 'var(--color-electric-pink)',
  gold: 'var(--color-gold)',
};

export function SettingsStatusHero({
  icon,
  title,
  statusLabel,
  description,
  active = false,
  accent = 'pink',
  loading = false,
  className,
}: SettingsStatusHeroProps) {
  const accentVar = ACCENT_VAR[accent];

  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-2xl border p-5 flex flex-col items-center gap-3',
        className
      )}
      style={{
        borderColor: `color-mix(in srgb, ${accentVar} 35%, transparent)`,
        background: `radial-gradient(120% 90% at 50% -10%, color-mix(in srgb, ${accentVar} 22%, transparent), transparent 70%), var(--gradient-purple)`,
        boxShadow: `inset 0 0 60px color-mix(in srgb, ${accentVar} 14%, transparent)`,
      }}
    >
      <div
        className="flex-center relative h-20 w-20 rounded-2xl border"
        style={{
          borderColor: `color-mix(in srgb, ${accentVar} 55%, transparent)`,
          backgroundColor: `color-mix(in srgb, ${accentVar} 14%, transparent)`,
          boxShadow: `inset 0 0 24px color-mix(in srgb, ${accentVar} 40%, transparent)`,
        }}
      >
        {icon}
      </div>

      <SkeletonSuspense loading={loading} skeleton={<Skeleton className="h-6 w-32" />}>
        <h2 className="text-white text-xl font-bold leading-tight">{title}</h2>
      </SkeletonSuspense>

      <SkeletonSuspense loading={loading} skeleton={<Skeleton className="h-5 w-24" />}>
        <span
          className={twMerge(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider',
            active ? 'text-white' : 'text-white/55'
          )}
          style={
            active
              ? {
                  backgroundColor: `color-mix(in srgb, ${accentVar} 25%, transparent)`,
                  color: accentVar,
                }
              : {
                  backgroundColor: 'rgba(255,255,255,0.06)',
                }
          }
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: active ? accentVar : 'rgba(255,255,255,0.4)' }}
          />
          {statusLabel}
        </span>
      </SkeletonSuspense>

      {description && (
        <p className="text-center text-sm text-white/65 leading-relaxed max-w-[280px]">
          {description}
        </p>
      )}
    </div>
  );
}
