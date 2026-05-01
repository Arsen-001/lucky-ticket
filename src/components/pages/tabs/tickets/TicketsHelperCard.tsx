'use client';

import { twMerge } from 'tailwind-merge';
import { ChevronRight, Info } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';

export function TicketsHelperCard({ className }: ClassNameProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge(
        'rounded-xl p-3.5 flex items-center gap-3',
        'bg-electric-purple/8 border border-electric-purple/20',
        className
      )}
    >
      <div className="w-9.5 h-9.5 rounded-full flex-center shrink-0 bg-electric-purple/18">
        <Info size={18} className="text-pink" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold text-white">{t('how tickets work')}</div>
        <div className="text-[11px] text-white-secondary mt-0.5 leading-snug">
          {t('how tickets work description')}
        </div>
      </div>
      <ChevronRight size={14} className="text-pink-secondary shrink-0" />
    </div>
  );
}
