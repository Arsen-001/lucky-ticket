'use client';

import { Clock } from 'lucide-react';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export function NewStakeHowItWorksCard() {
  const t = useAppTranslations();

  return (
    <div className="border-electric-purple/25 bg-electric-purple/10 flex items-start gap-3 rounded-2xl border p-3.5">
      <div className="bg-electric-purple/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
        <Clock size={16} className="text-electric-purple" />
      </div>
      <p className="text-white-secondary flex-1 text-[11px] leading-relaxed">
        <strong className="text-white">
          {t('lock for up to {max} months', { max: GlobalConstants.stakeDurationMaxMonths })}
        </strong>{' '}
        {t('cancel any time description')}
      </p>
    </div>
  );
}
