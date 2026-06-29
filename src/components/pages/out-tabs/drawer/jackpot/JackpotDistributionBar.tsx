'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getJackpotWholePotSplit } from '@/utils/global/jackpot.utils';

export function JackpotDistributionBar() {
  const t = useAppTranslations();
  const split = getJackpotWholePotSplit();

  const segments = [
    { label: `${t('1st')} ${split.first}%`, width: split.first, className: 'bg-electric-pink' },
    {
      label: `${t('2nd')} ${split.second}%`,
      width: split.second,
      className: 'bg-electric-pink/70',
    },
    { label: `${t('3rd')} ${split.third}%`, width: split.third, className: 'bg-electric-pink/45' },
    {
      label: `${t('all players')} ${split.participants}%`,
      width: split.participants,
      className: 'bg-electric-purple/60',
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="px-1 text-sm font-bold text-white">{t('where the pot goes')}</h2>
      <div className="bg-background-overlay flex flex-col gap-3 rounded-2xl border border-white/5 p-3.5">
        <div className="flex h-3 w-full overflow-hidden rounded-full">
          {segments.map(segment => (
            <span
              key={segment.label}
              className={segment.className}
              style={{ width: `${segment.width}%` }}
            />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {segments.map(segment => (
            <span key={segment.label} className="inline-flex items-center gap-1.5">
              <span className={twMerge('h-2.5 w-2.5 rounded-full', segment.className)} />
              <span className="text-white-secondary text-[11px] font-semibold tabular-nums">
                {segment.label}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
