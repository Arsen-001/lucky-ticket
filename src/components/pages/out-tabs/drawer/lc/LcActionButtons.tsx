'use client';

import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface LcActionButtonsProps {
  disabled?: boolean;
  onBuy: () => void;
}

export function LcActionButtons({ disabled, onBuy }: LcActionButtonsProps) {
  const t = useAppTranslations();

  return (
    <button
      type="button"
      onClick={onBuy}
      disabled={disabled}
      className={twMerge(
        'bg-pink-gradient relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-5 py-4 text-sm font-extrabold uppercase tracking-wider text-white transition-transform active:scale-99 cursor-pointer',
        'disabled:cursor-not-allowed disabled:opacity-50'
      )}
      style={{
        boxShadow: '0 10px 28px rgba(222,0,155,0.45), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      {!disabled && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl"
        >
          <span className="animate-task-shine absolute -left-1/2 -top-1/2 h-[200%] w-[55%] bg-gradient-to-r from-transparent via-white/55 to-transparent" />
        </span>
      )}
      <TelegramStarIcon size={16} className="relative" />
      <span className="relative">{t('buy lc')}</span>
    </button>
  );
}
