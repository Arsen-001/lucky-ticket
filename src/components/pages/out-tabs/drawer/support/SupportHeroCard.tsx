'use client';

import type { CSSProperties } from 'react';
import { LifeBuoy } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface SupportHeroCardProps {
  className?: string;
  style?: CSSProperties;
}

export function SupportHeroCard({ className, style }: SupportHeroCardProps) {
  const t = useAppTranslations();
  return (
    <div
      className={twMerge(
        'bg-purple-gradient card-outlined relative overflow-hidden rounded-2xl p-4',
        className
      )}
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px -8px color-mix(in srgb, var(--color-electric-pink) 30%, transparent)',
        ...style,
      }}
    >
      <span
        aria-hidden
        className="bg-electric-pink/25 pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/25 pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-[6%] right-[6%] z-2 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, color-mix(in srgb, var(--color-electric-pink) 60%, transparent) 35%, color-mix(in srgb, var(--color-electric-pink) 90%, transparent) 50%, color-mix(in srgb, var(--color-electric-pink) 60%, transparent) 65%, transparent 100%)',
          filter: 'blur(0.6px)',
        }}
      />
      <div className="relative flex items-center gap-3">
        <div className="bg-electric-pink/20 border-electric-pink/40 flex-center h-11 w-11 flex-shrink-0 rounded-xl border">
          <LifeBuoy size={20} className="text-electric-pink" strokeWidth={2.4} />
        </div>
        <div className="flex flex-col">
          <h2 className="text-base font-extrabold leading-tight text-white">{t('help center')}</h2>
          <p className="text-pink-secondary mt-0.5 text-[11px] leading-snug">
            {t('support hero subtitle')}
          </p>
        </div>
      </div>
    </div>
  );
}
