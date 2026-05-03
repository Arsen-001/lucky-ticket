'use client';

import { LifeBuoy } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function SupportHeroCard() {
  const t = useAppTranslations();
  return (
    <div className="bg-purple-gradient card-outlined relative overflow-hidden rounded-2xl p-4">
      <span
        aria-hidden
        className="bg-electric-pink/25 pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full blur-2xl"
      />
      <span
        aria-hidden
        className="bg-electric-purple/25 pointer-events-none absolute -bottom-12 -left-10 h-32 w-32 rounded-full blur-2xl"
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
