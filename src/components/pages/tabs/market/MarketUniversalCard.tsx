'use client';

import Image from 'next/image';
import { Timer } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

export type MarketAccent = TicketType | 'pink' | 'purple' | 'gold';

const ACCENT_COLOR: Record<MarketAccent, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
  pink: 'var(--color-electric-pink)',
  purple: 'var(--color-electric-purple)',
};

const accentValue = (a?: MarketAccent | TicketType): string => {
  if (!a) return 'var(--color-electric-pink)';
  if (a in TIER_GLOW) return TIER_GLOW[a as TicketType];
  return ACCENT_COLOR[a as MarketAccent];
};

export interface MarketUniversalCardProps {
  name: ReactNode;
  description?: ReactNode;
  iconStage: ReactNode;
  prices: MarketPrice[];
  meta?: ReactNode;
  badge?: ReactNode;
  accent?: MarketAccent | TicketType;
  isNew?: boolean;
  discountPct?: number;
  expiresAt?: string;
  remainingSupply?: number;
  disabled?: boolean;
  loading?: boolean;
  onBuy?: (price: MarketPrice) => void;
  className?: string;
}

export function MarketUniversalCard({
  name,
  description,
  iconStage,
  prices,
  meta,
  badge,
  accent,
  isNew,
  discountPct,
  expiresAt,
  remainingSupply,
  disabled,
  loading,
  onBuy,
  className,
}: MarketUniversalCardProps) {
  const t = useAppTranslations();
  const accentColor = accentValue(accent);
  const { leftTime, expired } = useCountDown(expiresAt);
  const showCountdown = !!expiresAt && !expired;

  return (
    <div
      className={twMerge(
        'task-card-default bg-background-overlay relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl p-3',
        className
      )}
    >
      {(isNew || discountPct || badge) && (
        <div className="absolute right-2 top-2 z-3 flex flex-col items-end gap-1">
          {badge}
          {isNew && (
            <span className="bg-electric-pink rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white">
              {t('new')}
            </span>
          )}
          {discountPct ? (
            <span className="bg-pink-gradient rounded-full px-1.5 py-0.5 text-[9px] font-extrabold tabular-nums text-white">
              −{discountPct}%
            </span>
          ) : null}
        </div>
      )}

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton className="h-20 w-full rounded-xl" variant="card" />}
      >
        <div
          className="flex-center relative h-20 w-full overflow-hidden rounded-xl"
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          }}
        >
          {iconStage}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" textSize="sm" className="w-2/3" />}
      >
        <h3 className="text-sm font-extrabold leading-tight text-white truncate">{name}</h3>
      </SkeletonSuspense>

      {description && (
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="text" lines={2} className="gap-0.5" />}
        >
          <p className="text-pink-secondary line-clamp-2 text-[11px] leading-snug">{description}</p>
        </SkeletonSuspense>
      )}

      {meta && <div className="flex flex-col gap-1">{meta}</div>}

      <div className="mt-auto flex flex-col gap-1.5">
        {(showCountdown || (remainingSupply !== undefined && remainingSupply > 0)) && (
          <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wider">
            {showCountdown && (
              <span
                className="inline-flex items-center gap-1 tabular-nums"
                style={{ color: accentColor }}
              >
                <Timer size={10} strokeWidth={2.4} />
                {leftTime}
              </span>
            )}
            {remainingSupply !== undefined && remainingSupply > 0 && (
              <span className="text-pink-secondary tabular-nums">
                {t('left in stock', { count: remainingSupply })}
              </span>
            )}
          </div>
        )}

        <SkeletonSuspense loading={loading} skeleton={<Skeleton variant="card" className="h-9" />}>
          {disabled ? (
            <button
              type="button"
              disabled
              className="flex-center w-full gap-1 rounded-lg p-2 text-xs font-semibold bg-white/5 border border-white/8"
            >
              <Image src={icons.lock} alt="lock" className="h-4 w-auto object-contain" />
            </button>
          ) : (
            <div className="flex gap-1.5">
              {prices.map((price, index) => (
                <PriceButton
                  key={index}
                  price={price}
                  accent={accentColor}
                  onClick={() => onBuy?.(price)}
                  fullWidth={prices.length === 1}
                />
              ))}
            </div>
          )}
        </SkeletonSuspense>
      </div>
    </div>
  );
}

interface PriceButtonProps {
  price: MarketPrice;
  accent: string;
  onClick: () => void;
  fullWidth?: boolean;
}

function PriceButton({ price, accent, onClick, fullWidth }: PriceButtonProps) {
  const isStars = price.type === MarketPriceType.TELEGRAM_STARS;
  const isLtc = price.type === MarketPriceType.LTC;

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={twMerge(
        'flex-center relative gap-1 overflow-hidden rounded-lg px-2 py-2 text-xs font-semibold text-white transition-transform active:scale-[0.97] hover:brightness-110',
        fullWidth ? 'w-full' : 'flex-1'
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
      }}
    >
      {isStars && (
        <Image src={icons.telegramStar} alt="" width={14} height={14} className="object-contain" />
      )}
      <span className="inline-flex items-baseline gap-1 tabular-nums">
        {price.originalAmount && (
          <span className="text-[10px] text-white/55 line-through">{price.originalAmount}</span>
        )}
        <span className="text-sm">{price.amount}</span>
      </span>
      {isLtc && <span className="text-gold text-[11px] font-bold">{GlobalConstants.coinName}</span>}
    </button>
  );
}
