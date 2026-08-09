'use client';

import { PiggyBank } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetMarketStatusSavingsQuery } from '@/api/market.api';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompactPrice } from '@/utils/global/number.utils';

export interface MarketSavingsRowProps {
  className?: string;
}

/**
 * The receipt for the status: what its discount has actually taken off this
 * player's Market charges over the backend's rolling window.
 *
 * Sits in the Statuses section rather than over the catalog because that is
 * where the subscription is renewed and upgraded — the number is the argument
 * for doing it, stated in coins rather than in the percent the header already
 * shows.
 *
 * Absent, not zeroed, when nothing was saved: the total counts from the moment
 * the backend started recording it, so a fresh account would otherwise be told
 * its status saved it nothing.
 */
export function MarketSavingsRow({ className }: MarketSavingsRowProps) {
  const t = useAppTranslations();
  const { data } = useGetMarketStatusSavingsQuery();

  const lc = data?.lc ?? 0;
  const stars = data?.stars ?? 0;
  if (lc <= 0 && stars <= 0) return null;

  return (
    <div
      className={twMerge(
        'border-gold/25 flex items-center gap-3 rounded-2xl border bg-[color-mix(in_srgb,var(--color-gold)_10%,transparent)] p-3',
        className
      )}
    >
      <span className="flex-center bg-gold/15 text-gold h-9 w-9 shrink-0 rounded-xl">
        <PiggyBank size={18} strokeWidth={2.4} />
      </span>

      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[11px] leading-tight font-bold tracking-wider text-white/60 uppercase">
          {t('status savings title')}
        </span>
        <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5">
          {lc > 0 && (
            <span className="flex items-center gap-1 text-sm leading-tight font-extrabold text-white tabular-nums">
              {formatCompactPrice(lc)}
              <LcLabel size={13} interactive={false} />
            </span>
          )}
          {stars > 0 && (
            <span className="flex items-center gap-1 text-sm leading-tight font-extrabold text-white tabular-nums">
              {formatCompactPrice(stars)}
              <TelegramStarIcon size={13} />
            </span>
          )}
          <span className="text-pink-secondary text-[11px] leading-tight font-semibold">
            {t('in last {days} days', { days: data?.windowDays ?? 30 })}
          </span>
        </span>
      </div>
    </div>
  );
}
