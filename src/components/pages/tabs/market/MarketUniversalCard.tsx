'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { icons } from '@/constants/icons';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPriceType } from '@/types/enums/market.enums';
import type { MarketAccent, MarketPrice } from '@/types/interfaces/market.interfaces';
import { formatCompactPrice } from '@/utils/global/number.utils';
import { orderMarketPrices } from '@/utils/global/market.utils';

const ACCENT_COLOR: Record<MarketAccent, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
  pink: 'var(--color-electric-pink)',
  purple: 'var(--color-electric-purple)',
};

const accentValue = (a?: MarketAccent): string =>
  a ? ACCENT_COLOR[a] : 'var(--color-electric-pink)';

export interface MarketUniversalCardProps {
  name: ReactNode;
  iconStage: ReactNode;
  /** Admin-set photo — when present it fills the icon stage instead of `iconStage`. */
  imageUrl?: string;
  iconStageClassName?: string;
  badge?: ReactNode;
  accent?: MarketAccent;
  isNew?: boolean;
  discountPct?: number;
  disabled?: boolean;
  /** Why the card can't be bought — defaults to "Locked". */
  disabledLabel?: string;
  /** Disabled because the player already owns it: a check reads right, a padlock doesn't. */
  owned?: boolean;
  loading?: boolean;
  prices?: MarketPrice[];
  onClick?: () => void;
  onBuy?: (price: MarketPrice) => void;
  className?: string;
}

export function MarketUniversalCard({
  name,
  iconStage,
  imageUrl,
  iconStageClassName,
  badge,
  accent,
  isNew,
  discountPct,
  disabled,
  disabledLabel,
  owned,
  loading,
  prices,
  onClick,
  onBuy,
  className,
}: MarketUniversalCardProps) {
  const t = useAppTranslations();
  const accentColor = accentValue(accent);
  // A locked card still opens: only the buy buttons are gated, never the
  // explanation of what the thing is and what the gate asks for.
  const cardClickable = !loading;

  return (
    <div
      role="button"
      tabIndex={cardClickable ? 0 : -1}
      onClick={cardClickable ? onClick : undefined}
      onKeyDown={e => {
        if (!cardClickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={twMerge(
        'task-card-default bg-background-overlay relative flex h-full flex-col gap-2 overflow-hidden rounded-2xl p-3 text-left transition-transform active:scale-99 hover:brightness-110',
        !cardClickable && 'cursor-default hover:brightness-100',
        cardClickable && 'cursor-pointer',
        className
      )}
    >
      {(isNew || discountPct || badge) && (
        <div className="pointer-events-none absolute right-2 top-2 z-3 flex flex-col items-end gap-1">
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
          className={twMerge(
            'flex-center relative h-20 w-full overflow-hidden rounded-xl',
            iconStageClassName
          )}
          style={{
            backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          }}
        >
          {imageUrl ? (
            // Admin-provided URL (Blob upload or pasted) — plain <img> avoids
            // the next/image host allow-list.
            // contain (not cover) so the whole product art fits the stage
            // instead of being cropped — the catalog serves square per-tier icons.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={typeof name === 'string' ? name : ''}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            iconStage
          )}
        </div>
      </SkeletonSuspense>

      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="line" textSize="sm" className="w-2/3" />}
      >
        <h3 className="text-sm font-extrabold leading-tight text-white truncate">{name}</h3>
      </SkeletonSuspense>

      <div className="mt-auto">
        <SkeletonSuspense loading={loading} skeleton={<Skeleton variant="card" className="h-9" />}>
          {disabled ? (
            // Names the state and stays tappable — the card opens its sheet,
            // where the gate and what sits behind it are spelled out.
            <div
              className={twMerge(
                'flex-center text-pink-secondary w-full gap-1 rounded-lg border border-white/8 bg-white/5 p-2 text-[11px] font-bold uppercase tracking-wider',
                owned && 'text-success border-success/25 bg-success/10'
              )}
            >
              {owned ? (
                <Check size={13} strokeWidth={3} />
              ) : (
                <Image src={icons.lock} alt="" className="h-3.5 w-auto object-contain" />
              )}
              {disabledLabel ?? t('locked')}
            </div>
          ) : prices && prices.length > 0 ? (
            <div className="flex gap-1.5">
              {orderMarketPrices(prices).map((price, index) => (
                <PriceButton
                  key={index}
                  price={price}
                  accent={accentColor}
                  onClick={() => onBuy?.(price)}
                  fullWidth={prices.length === 1}
                />
              ))}
            </div>
          ) : null}
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
  const isLc = price.type === MarketPriceType.LC;

  return (
    <button
      type="button"
      onClick={e => {
        e.stopPropagation();
        onClick();
      }}
      className={twMerge(
        'flex-center relative gap-0.5 overflow-hidden whitespace-nowrap rounded-lg px-1.5 py-2 text-xs font-semibold text-white transition-transform active:scale-[0.97] hover:brightness-110',
        fullWidth ? 'w-full' : 'min-w-0 flex-1'
      )}
      style={{
        backgroundColor: `color-mix(in srgb, ${accent} 18%, transparent)`,
        border: `1px solid color-mix(in srgb, ${accent} 35%, transparent)`,
      }}
    >
      {isStars && <TelegramStarIcon size={13} className="shrink-0" />}
      <span className="inline-flex min-w-0 items-baseline gap-0.5 tabular-nums">
        {price.originalAmount && (
          <span className="text-[10px] text-white/55 line-through">
            {formatCompactPrice(price.originalAmount)}
          </span>
        )}
        <span className="text-[13px]">{formatCompactPrice(price.amount)}</span>
      </span>
      {isLc && <LcLabel size={11} interactive={false} className="shrink-0" />}
    </button>
  );
}
