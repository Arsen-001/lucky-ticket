'use client';

import type { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPriceType } from '@/types/enums/market.enums';
import { formatCompactPrice } from '@/utils/global/number.utils';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketHeroCardProps {
  title: string;
  description?: string;
  /** Any CSS colour — drives the tint, the border and the buy button. */
  accentColor: string;
  price?: MarketPrice;
  isNew?: boolean;
  discountPct?: number;
  /** Full-bleed artwork. Absent for shards and image-less cosmetics. */
  imageUrl?: string;
  /** Fallback visual when there is no artwork (shard chip, name initial). */
  renderIcon: (size: number) => ReactNode;
  onOpen: () => void;
  onBuy: (price: MarketPrice) => void;
  className?: string;
}

/**
 * The showcase slide at the top of the Market: artwork bleeding off the left
 * edge, the item's own accent washing across the card, and one obvious buy
 * button. Tapping the card opens the item; tapping the price buys it.
 */
export function MarketHeroCard({
  title,
  description,
  accentColor,
  price,
  isNew,
  discountPct,
  imageUrl,
  renderIcon,
  onOpen,
  onBuy,
  className,
}: MarketHeroCardProps) {
  const t = useAppTranslations();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{ '--hero-accent': accentColor } as React.CSSProperties}
      className={twMerge(
        // Height is sized to the tallest content it must hold — badge row,
        // title, two description lines and the buy button — so a long
        // description clamps cleanly instead of being sliced mid-line.
        'market-hero-card flex h-[142px] cursor-pointer items-stretch transition-transform active:scale-[0.99]',
        className
      )}
    >
      <div className="relative w-[122px] shrink-0 overflow-hidden">
        {imageUrl ? (
          <>
            {/* Admin-provided URL (Blob upload or pasted) — plain <img> avoids
                the next/image host allow-list, matching the market cards. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
            {/* Melts the artwork into the card instead of ending on a hard seam. */}
            <span aria-hidden className="market-hero-fade" />
          </>
        ) : (
          <div className="flex-center h-full w-full p-3">{renderIcon(84)}</div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 overflow-hidden py-3 pr-3.5">
        {(isNew || discountPct) && (
          <div className="flex items-center gap-1.5">
            {isNew && (
              <span className="bg-electric-pink rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase leading-none tracking-[0.1em] text-white">
                {t('new')}
              </span>
            )}
            {discountPct ? (
              <span className="bg-pink-gradient rounded-full px-2 py-0.5 text-[9px] font-extrabold leading-none tabular-nums text-white">
                −{discountPct}%
              </span>
            ) : null}
          </div>
        )}

        <h3 className="line-clamp-1 text-[16px] font-extrabold leading-tight tracking-tight text-white">
          {title}
        </h3>

        {description && (
          <p className="text-pink-secondary line-clamp-2 text-[11px] leading-snug">{description}</p>
        )}

        {price && (
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onBuy(price);
            }}
            className="market-hero-buy mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-extrabold tabular-nums text-white transition-transform active:scale-95"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider opacity-80">
              {t('buy')}
            </span>
            {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={12} />}
            {price.originalAmount && (
              <span className="text-[10px] text-white/55 line-through">
                {formatCompactPrice(price.originalAmount)}
              </span>
            )}
            <span>{formatCompactPrice(price.amount)}</span>
            {price.type === MarketPriceType.LC && <LcLabel size={12} interactive={false} />}
          </button>
        )}
      </div>
    </div>
  );
}
