'use client';

import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { formatNumber } from '@/utils/global/number.utils';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StarsActionRow } from './StarsActionRow';
import type { StarsState } from '@/types/interfaces/stars.interfaces';

export interface StarsHeroProps {
  state?: StarsState;
  loading?: boolean;
  onBuy: () => void;
  onExchange: () => void;
  /** No TON wallet bound — the exchange cell wears a padlock. */
  exchangeLocked?: boolean;
}

export function StarsHero({ state, loading, onBuy, onExchange, exchangeLocked }: StarsHeroProps) {
  const t = useAppTranslations();
  const balance = state?.balance ?? 0;

  return (
    <div className="card-outlined bg-purple-gradient relative overflow-hidden rounded-2xl">
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

      <div className="relative flex flex-col items-center gap-3 p-5">
        <div className="relative flex h-40 w-40 items-center justify-center">
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{
              background:
                'radial-gradient(circle, rgba(248,189,62,0.5) 0%, rgba(248,189,62,0.12) 45%, transparent 72%)',
              filter: 'blur(14px)',
            }}
          />
          <TelegramStarIcon
            size={140}
            className="relative drop-shadow-[0_8px_24px_rgba(248,189,62,0.6)]"
          />
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
              {GlobalConstants.starName}
            </span>
          </div>
        </SkeletonSuspense>

        <div className="text-pink-secondary flex items-center gap-4 text-[11px] font-semibold tabular-nums">
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

      <StarsActionRow
        onBuy={onBuy}
        onExchange={onExchange}
        exchangeLocked={exchangeLocked}
        className="relative"
      />
    </div>
  );
}
