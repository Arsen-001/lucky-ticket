'use client';

import { Clock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function PartnersComingSoonBanner() {
  const t = useAppTranslations();

  return (
    <div className="bg-purple-gradient animate-fade-in flex items-center gap-2.5 rounded-2xl px-3.5 py-3">
      <div className="flex-center h-8 w-8 shrink-0 rounded-full bg-white/15">
        <Clock className="h-4 w-4 text-white" strokeWidth={2.4} />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-sm font-extrabold leading-none text-white">
          {t('partners preview title')}
        </span>
        <span className="text-[11px] font-medium leading-tight text-white/80">
          {t('partners preview subtitle')}
        </span>
      </div>
    </div>
  );
}
