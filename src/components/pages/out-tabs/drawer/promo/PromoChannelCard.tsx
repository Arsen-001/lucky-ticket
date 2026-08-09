'use client';

import { ChevronRight, Send } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';

/**
 * Tappable card pointing to the Telegram channel where fresh promo codes
 * are published first.
 */
export function PromoChannelCard() {
  const t = useAppTranslations();

  return (
    <a
      href={GlobalConstants.telegramChannelUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="card-outlined relative flex items-center gap-3 overflow-hidden rounded-2xl p-3.5 transition-opacity active:opacity-75"
    >
      <span
        aria-hidden
        className="bg-telegram/15 pointer-events-none absolute -left-6 -top-6 h-20 w-20 rounded-full blur-2xl"
      />
      <span className="bg-telegram/20 ring-telegram/40 flex-center relative h-10 w-10 shrink-0 rounded-xl ring-1">
        <Send size={17} className="text-white" />
      </span>
      <div className="relative flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-[13px] font-extrabold leading-tight text-white">
          {t('find codes on channel')}
        </span>
        <span className="text-white-secondary/70 text-[11px] font-medium leading-snug">
          {t('promo channel blurb')}
        </span>
      </div>
      <ChevronRight size={16} className="relative shrink-0 text-white/30" />
    </a>
  );
}
