'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { BalanceChartBand } from '@/components/shared/cards/BalanceChartBand';
import { GlobalConstants } from '@/constants/global.constants';
import { formatCompact, formatNumber } from '@/utils/global/number.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { dailyBalanceSeries } from '@/utils/global/ledger.utils';
import { starsAsLedger } from '@/utils/pages/stars.utils';
import { StarsActionRow } from './StarsActionRow';
import type { StarsState, StarsTransaction } from '@/types/interfaces/stars.interfaces';

export interface StarsHeroProps {
  state?: StarsState;
  transactions?: StarsTransaction[];
  loading?: boolean;
  onBuy: () => void;
  onExchange: () => void;
  /** No TON wallet bound — the exchange cell wears a padlock. */
  exchangeLocked?: boolean;
  className?: string;
}

/**
 * The balance as the LC screen states it, in the other currency.
 *
 * It used to be a 140px star over a number — a quarter of the phone spent on
 * decoration, and the three things the ledger already knows (where the balance
 * is going, what moved in the last day, what to do about it) left off the
 * screen. The star keeps its place as the card's watermark, exactly where LC
 * puts its coin, and the card answers the same four questions in the same
 * order: how much · which way · what now · where from.
 */
export function StarsHero({
  state,
  transactions = [],
  loading,
  onBuy,
  onExchange,
  exchangeLocked,
  className,
}: StarsHeroProps) {
  const t = useAppTranslations();

  const balance = state?.balance ?? 0;
  const change = state?.change24h ?? 0;
  const isUp = change >= 0;
  const ChangeIcon = isUp ? TrendingUp : TrendingDown;
  const series = loading ? [] : dailyBalanceSeries(starsAsLedger(transactions), balance);

  return (
    <div
      className={twMerge(
        'border-gold/25 relative overflow-hidden rounded-3xl border bg-[#171430]',
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
      {/* Watermark, not illustration: the star that used to eat a quarter of
          the screen keeps its place the way LC's coin does — far enough into
          the corner that the balance never reads over its bright middle. */}
      <TelegramStarIcon
        size={132}
        className="pointer-events-none absolute -right-10 -top-10 opacity-[0.07]"
      />

      <div className="relative px-5 pb-4 pt-5">
        <div className="flex items-center gap-2">
          <TelegramStarIcon size={16} />
          <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            {t('stars balance')}
          </span>
          {/* The 24h delta the server has been sending all along and this screen
              never drew — the same chip the LC card carries. */}
          <span
            className={twMerge(
              'ms-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tabular-nums',
              isUp ? 'bg-success/20 text-success' : 'bg-error/25 text-error-text'
            )}
          >
            <ChangeIcon size={11} strokeWidth={3} />
            {isUp ? '+' : '−'}
            {formatCompact(Math.abs(change))}
            <span className="text-white/40">{t('last 24h')}</span>
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
              {GlobalConstants.starName}
            </span>
          </div>
        </SkeletonSuspense>

        <div className="text-pink-secondary mt-2 flex items-center gap-4 text-[11px] font-semibold tabular-nums">
          <span>
            {t('total earned')}:{' '}
            <span className="text-success">+{formatNumber(state?.lifetimeEarned ?? 0)}</span>
          </span>
          <span>
            {t('total spent')}:{' '}
            <span className="text-error-text">−{formatNumber(state?.lifetimeSpent ?? 0)}</span>
          </span>
        </div>
      </div>

      <BalanceChartBand values={series} caption={t('last 7 days')} />

      <StarsActionRow onBuy={onBuy} onExchange={onExchange} exchangeLocked={exchangeLocked} />
    </div>
  );
}
