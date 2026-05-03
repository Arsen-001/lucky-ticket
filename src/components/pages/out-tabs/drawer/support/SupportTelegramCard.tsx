'use client';

import { ExternalLink, Send } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';

export function SupportTelegramCard() {
  const t = useAppTranslations();

  return (
    <a
      href={GlobalConstants.telegramSupportUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-pink-gradient relative flex items-center gap-3 overflow-hidden rounded-2xl p-4 transition-transform active:scale-99"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/15 blur-2xl"
      />
      <div className="bg-white/20 flex-center relative h-11 w-11 flex-shrink-0 rounded-xl">
        <Send size={20} className="text-white" strokeWidth={2.4} />
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col">
        <span className="text-sm font-extrabold text-white">{t('chat with us')}</span>
        <span className="text-[11px] leading-snug text-white/85">
          {t('chat with us description')}
        </span>
      </div>
      <span className="text-electric-pink relative inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide">
        {t('open chat')}
        <ExternalLink size={12} strokeWidth={2.4} />
      </span>
    </a>
  );
}
