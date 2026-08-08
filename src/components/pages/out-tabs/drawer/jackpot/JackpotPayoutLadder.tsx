'use client';

import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import { getJackpotWholePotSplit } from '@/utils/global/jackpot.utils';
import { staggerStyle } from '@/utils/global/animation.utils';

interface JackpotPayoutLadderProps {
  /** Current pot — each place shows its real slice of it. */
  pot?: number;
  loading?: boolean;
}

/**
 * The split in money instead of percentages: "1st — 50%" is a rule, "1st —
 * 240.7K LC" is a reason to play. Percentages stay next to the amount so the
 * rule is still visible, and the whole block sits on the first screen — it used
 * to start at 748px, below the fold.
 */
export function JackpotPayoutLadder({ pot, loading }: JackpotPayoutLadderProps) {
  const t = useAppTranslations();
  const split = getJackpotWholePotSplit();

  const places = [
    { label: t('1st'), percent: split.first, bar: 'bg-gold', text: 'text-gold' },
    { label: t('2nd'), percent: split.second, bar: 'bg-silver', text: 'text-silver' },
    { label: t('3rd'), percent: split.third, bar: 'bg-bronze', text: 'text-bronze' },
    {
      label: t('all players'),
      percent: split.participants,
      bar: 'bg-electric-purple',
      text: 'text-electric-purple',
    },
  ].filter(place => place.percent > 0);

  return (
    <section className="flex flex-col gap-3 border-b border-white/5 pb-5">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
        {t('if it drops now')}
      </h2>
      <ul className="flex flex-col gap-2.5">
        {places.map((place, index) => (
          <li
            key={place.label}
            style={staggerStyle(index, 100)}
            className="animate-slide-in-bottom flex items-center gap-2.5"
          >
            <span className={twMerge('h-1.5 w-1.5 flex-shrink-0 rounded-full', place.bar)} />
            <span className={twMerge('text-[13px] font-bold', place.text)}>{place.label}</span>
            <span className="text-[11px] font-semibold tabular-nums text-white/35">
              {place.percent}%
            </span>
            <SkeletonSuspense
              loading={loading || pot == null}
              skeleton={<Skeleton variant="line" className="ml-auto h-4 w-20" />}
            >
              {pot != null && (
                <span className="ml-auto text-[15px] font-extrabold tabular-nums text-white">
                  {formatCompact(Math.round((pot * place.percent) / 100))}{' '}
                  {GlobalConstants.coinName}
                </span>
              )}
            </SkeletonSuspense>
          </li>
        ))}
      </ul>
    </section>
  );
}
