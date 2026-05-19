'use client';

import type { ButtonHTMLAttributes } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export type SettingsStatusActionVariant = 'pink' | 'gold';

export interface SettingsStatusActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  title: string;
  subtitle?: string;
  variant?: SettingsStatusActionVariant;
  loading?: boolean;
}

const VARIANT_CLASSES: Record<SettingsStatusActionVariant, string> = {
  pink: 'bg-pink-gradient text-white',
  gold: 'bg-gradient-to-r from-gold/95 via-amber-300 to-gold/95 text-background',
};

const VARIANT_SUBTITLE_CLASSES: Record<SettingsStatusActionVariant, string> = {
  pink: 'text-white/80',
  gold: 'text-background/70',
};

const VARIANT_SHADOW: Record<SettingsStatusActionVariant, string> = {
  pink: '0 14px 32px -8px color-mix(in srgb, var(--color-electric-pink) 70%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-electric-pink) 35%, transparent) inset, 0 1px 0 0 rgba(255,255,255,0.35) inset',
  gold: '0 14px 32px -8px color-mix(in srgb, var(--color-gold) 70%, transparent), 0 0 0 1px color-mix(in srgb, var(--color-gold) 45%, transparent) inset, 0 1px 0 0 rgba(255,255,255,0.55) inset',
};

export function SettingsStatusActionButton({
  title,
  subtitle,
  variant = 'pink',
  loading = false,
  disabled,
  className,
  ...rest
}: SettingsStatusActionButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={twMerge(
        'relative flex items-center justify-between gap-3 overflow-hidden rounded-2xl px-6 py-5 text-left font-bold transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60',
        VARIANT_CLASSES[variant],
        'cursor-pointer',
        className
      )}
      style={{ boxShadow: VARIANT_SHADOW[variant] }}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 opacity-60"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 100%)',
        }}
      />
      <div className="relative flex flex-col gap-0.5">
        <span className="text-base leading-tight tracking-tight sm:text-lg">{title}</span>
        {subtitle && (
          <span
            className={twMerge(
              'text-xs font-semibold tracking-wide sm:text-sm',
              VARIANT_SUBTITLE_CLASSES[variant]
            )}
          >
            {subtitle}
          </span>
        )}
      </div>
      <span
        className="relative flex-center h-9 w-9 shrink-0 rounded-full"
        style={{
          backgroundColor: variant === 'gold' ? 'rgba(27,25,48,0.18)' : 'rgba(255,255,255,0.18)',
        }}
      >
        {loading ? (
          <Loader2 size={18} strokeWidth={2.6} className="animate-spin" />
        ) : (
          <ArrowRight size={18} strokeWidth={2.8} />
        )}
      </span>
    </button>
  );
}
