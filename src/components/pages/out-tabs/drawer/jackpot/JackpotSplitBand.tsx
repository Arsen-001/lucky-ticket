'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { getJackpotWholePotSplit } from '@/utils/global/jackpot.utils';

export interface JackpotSplitBandProps {
  pot?: number;
  className?: string;
}

/**
 * Band under the pot: what each place takes if it drops right now, as money.
 * The band is the card's own strip — same construction as the LC chart band —
 * so the split never becomes a separate card competing with the number.
 */
export function JackpotSplitBand({ pot, className }: JackpotSplitBandProps) {
  const t = useAppTranslations();
  const split = getJackpotWholePotSplit();

  const places = [
    { label: t('1st'), percent: split.first, text: 'text-gold', bar: 'bg-gold' },
    { label: t('2nd'), percent: split.second, text: 'text-silver', bar: 'bg-silver' },
    { label: t('3rd'), percent: split.third, text: 'text-bronze', bar: 'bg-bronze' },
    {
      label: t('all players'),
      percent: split.participants,
      text: 'text-electric-purple',
      bar: 'bg-electric-purple',
    },
  ].filter(place => place.percent > 0);

  return (
    <div className={twMerge('relative w-full border-t border-white/8 px-4 py-3', className)}>
      <span className="text-[9px] font-bold uppercase tracking-widest text-white/45">
        {t('if it drops now')}
      </span>

      <div className="mt-2 flex h-1 w-full gap-0.5">
        {places.map(place => (
          <span
            key={place.label}
            className={twMerge('rounded-full', place.bar)}
            style={{ width: `${place.percent}%` }}
          />
        ))}
      </div>

      <div className="mt-2.5 flex items-end justify-between gap-2">
        {places.map(place => (
          <span key={place.label} className="flex flex-col gap-0.5">
            <span className={twMerge('text-[10px] font-bold uppercase', place.text)}>
              {place.label}
            </span>
            <span className="text-[13px] font-extrabold tabular-nums text-white">
              {formatCompact(Math.round(((pot ?? 0) * place.percent) / 100))}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
