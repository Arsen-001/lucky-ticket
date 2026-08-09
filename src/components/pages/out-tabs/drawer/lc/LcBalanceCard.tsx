'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact, formatNumber, formatUsdPrice } from '@/utils/global/number.utils';
import { lcToUsd } from '@/utils/global/lc.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLcUsdRate } from '@/hooks/useLcUsdRate';
import { lcDailyBalanceSeries } from '@/utils/pages/lc.utils';
import { LcChartBand } from './LcChartBand';
import { LcActionRow } from './LcActionRow';
import type { LcState, LcTransaction } from '@/types/interfaces/lc.interfaces';

export interface LcBalanceCardProps {
  state?: LcState;
  transactions?: LcTransaction[];
  loading?: boolean;
  onConvertTon: () => void;
  className?: string;
}

/**
 * The balance as one dark object rather than two bright ones.
 *
 * The card it replaced was the most saturated surface in the app and sat two
 * gaps above a pink filter row, so the screen had three things shouting at the
 * same volume. Here the card is dark and the gold does the talking — it is the
 * currency's own colour, and the coin and the balance curve were already gold.
 * The three actions are the card's own footer because they act on the number
 * above them; as a separate block they cost a gap and a border to say so.
 */
export function LcBalanceCard({
  state,
  transactions = [],
  loading,
  onConvertTon,
  className,
}: LcBalanceCardProps) {
  const t = useAppTranslations();
  const lcUsdRate = useLcUsdRate();

  const balance = state?.balance ?? 0;
  const change = state?.change24h ?? 0;
  const isUp = change >= 0;
  const ChangeIcon = isUp ? TrendingUp : TrendingDown;
  const series = loading ? [] : lcDailyBalanceSeries(transactions, balance);

  return (
    <div
      className={twMerge(
        'relative overflow-hidden rounded-3xl border border-gold/25 bg-[#171430]',
        className
      )}
      style={{ boxShadow: '0 14px 34px rgba(0,0,0,0.45)' }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(248,189,62,0.22) 0%, rgba(163,33,131,0.14) 45%, transparent 72%)',
        }}
      />
      <CoinIcon
        size={150}
        className="pointer-events-none absolute -right-8 -top-8 opacity-[0.09]"
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <CoinIcon size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('lc balance')}
          </span>
          <span
            className={twMerge(
              'ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tabular-nums',
              isUp ? 'bg-success/20 text-success' : 'bg-error/25 text-error-text'
            )}
          >
            <ChangeIcon size={11} strokeWidth={3} />
            {isUp ? '+' : '−'}
            {formatCompact(Math.abs(change))}
            <span className="text-white/40">{t('lc last 24h')}</span>
          </span>
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="mt-3 h-9 w-44" />}
        >
          <div className="mt-2.5 flex items-baseline gap-2">
            <span
              className="text-[34px] font-extrabold leading-none tabular-nums"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFE9AF 0%, #F8BD3E 62%, #C1861A 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 8px rgba(248,189,62,0.28))',
              }}
            >
              {formatNumber(balance)}
            </span>
            <span className="text-gold/70 text-sm font-extrabold uppercase tracking-wider">
              {GlobalConstants.coinName}
            </span>
          </div>
        </SkeletonSuspense>

        <span className="mt-1 block text-[11.5px] font-semibold tabular-nums text-white/55">
          ≈ {formatUsdPrice(lcToUsd(balance, lcUsdRate))}
        </span>
      </div>

      <LcChartBand values={series} />

      <LcActionRow onConvertTon={onConvertTon} />
    </div>
  );
}
