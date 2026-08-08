'use client';

import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';
import type { JackpotState } from '@/types/interfaces/jackpot.interfaces';
import '@/styles/components/jackpot.css';

interface JackpotTotalsProps {
  data?: JackpotState;
  loading?: boolean;
}

/** The two historical figures, as a spec sheet rather than two more cards. */
export function JackpotTotals({ data, loading }: JackpotTotalsProps) {
  const t = useAppTranslations();

  const facts = [
    {
      label: t('record'),
      value: data && `${formatCompact(data.record)} ${GlobalConstants.coinName}`,
    },
    {
      label: t('paid out all-time'),
      value: data && `${formatCompact(data.allTimePaidOut)} ${GlobalConstants.coinName}`,
    },
  ];

  return (
    <dl className="flex flex-col gap-3 border-b border-white/5 pb-5">
      {facts.map(fact => (
        <div key={fact.label} className="flex items-baseline gap-2">
          <dt className="text-white-secondary flex-shrink-0 text-[12px] font-medium">
            {fact.label}
          </dt>
          <span aria-hidden className="jackpot-leader h-3 flex-1" />
          <SkeletonSuspense
            loading={loading}
            skeleton={<Skeleton variant="line" textSize="xs" className="h-3.5 w-16" />}
          >
            {fact.value && (
              <dd className="flex-shrink-0 text-[13px] font-bold tabular-nums text-white">
                {fact.value}
              </dd>
            )}
          </SkeletonSuspense>
        </div>
      ))}
    </dl>
  );
}
