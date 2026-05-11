'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { Route } from '@/constants/routes';

export type SettingsStatusCTAVariant = 'primary' | 'gold';

export interface SettingsStatusCTAProps {
  href: Route;
  title: string;
  subtitle?: string;
  variant?: SettingsStatusCTAVariant;
  className?: string;
}

const VARIANT_CLASSES: Record<SettingsStatusCTAVariant, string> = {
  primary: 'bg-pink-gradient',
  gold: 'bg-gradient-to-r from-gold/90 via-amber-400 to-gold/90 text-background',
};

export function SettingsStatusCTA({
  href,
  title,
  subtitle,
  variant = 'primary',
  className,
}: SettingsStatusCTAProps) {
  return (
    <Link
      href={href}
      className={twMerge(
        'flex items-center justify-between gap-3 rounded-2xl px-5 py-4 text-white font-bold transition-transform active:scale-99',
        VARIANT_CLASSES[variant],
        className
      )}
    >
      <div className="flex flex-col gap-0.5 text-left">
        <span className="text-base leading-tight">{title}</span>
        {subtitle && (
          <span
            className={twMerge(
              'text-xs font-semibold',
              variant === 'gold' ? 'text-background/70' : 'text-white/75'
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
      <ArrowRight size={20} strokeWidth={2.6} />
    </Link>
  );
}
