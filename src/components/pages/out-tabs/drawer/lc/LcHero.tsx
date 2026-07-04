'use client';

import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber, formatUsdPrice } from '@/utils/global/number.utils';
import { lcToUsd } from '@/utils/global/lc.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useLcUsdRate } from '@/hooks/useLcUsdRate';
import type { LcState } from '@/types/interfaces/lc.interfaces';

export interface LcHeroProps {
  state?: LcState;
  loading?: boolean;
}

export function LcHero({ state, loading }: LcHeroProps) {
  const t = useAppTranslations();
  const lcUsdRate = useLcUsdRate();
  const balance = state?.balance ?? 0;
  const coinPrice = formatUsdPrice(lcToUsd(1, lcUsdRate));

  return (
    <div className="card-outlined bg-purple-gradient relative overflow-hidden rounded-2xl p-5">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(248,189,62,0.3) 0%, rgba(248,189,62,0.08) 40%, transparent 70%)',
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-12 -right-12 h-44 w-44 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(222,0,155,0.18) 0%, transparent 60%)',
          filter: 'blur(8px)',
        }}
      />

      <div className="relative flex flex-col items-center gap-3">
        <div className="relative flex h-48 w-48 items-center justify-center">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(248,189,62,0.55) 0%, rgba(248,189,62,0.12) 45%, transparent 72%)',
              filter: 'blur(14px)',
            }}
          />
          <CoinIcon size={180} className="relative drop-shadow-[0_8px_24px_rgba(248,189,62,0.6)]" />
        </div>

        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" className="h-10 w-40" />}
        >
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-extrabold leading-none tabular-nums"
              style={{
                backgroundImage: 'linear-gradient(180deg, #FFE08A 0%, #F8BD3E 60%, #B47B0A 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 2px 6px rgba(248,189,62,0.35))',
              }}
            >
              {formatNumber(balance)}
            </span>
            <span className="text-gold/85 text-base font-extrabold uppercase tracking-wider">
              {GlobalConstants.coinName}
            </span>
          </div>
        </SkeletonSuspense>

        <span className="text-pink-secondary text-[11px] font-semibold tabular-nums">
          {t('price per coin', { coin: GlobalConstants.coinName, price: coinPrice })}
        </span>
      </div>
    </div>
  );
}
