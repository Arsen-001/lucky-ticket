'use client';

import type { ReactNode } from 'react';
import { Gift, Lock, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { AvatarDailyRewardValue } from '@/components/shared/user-elements/AvatarDailyRewardValue';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPriceType } from '@/types/enums/market.enums';
import { formatCompactPrice } from '@/utils/global/number.utils';
import type { AvatarBoost, AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketHeroCardProps {
  title: string;
  /** Shown only when the item has no structured perks to state instead. */
  description?: string;
  /** Any CSS colour — drives the tint, the border and the buy button. */
  accentColor: string;
  price?: MarketPrice;
  isNew?: boolean;
  discountPct?: number;
  /** Full-bleed artwork. Absent for shards and image-less cosmetics. */
  imageUrl?: string;
  /** Behind a gate — the price turns into a lock that opens the item instead. */
  locked?: boolean;
  /** What an avatar does while equipped. */
  boost?: AvatarBoost;
  /** What an avatar pays out every day while equipped. */
  dailyReward?: AvatarDailyReward;
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
 *
 * What the item *does* is stated from the structured boost and daily-reward
 * fields rather than from `description` — the description is a free-text string
 * the backend stores untranslated, so on a Russian or German client it would be
 * the one English line on the screen.
 */
export function MarketHeroCard({
  title,
  description,
  accentColor,
  price,
  isNew,
  discountPct,
  imageUrl,
  locked,
  boost,
  dailyReward,
  renderIcon,
  onOpen,
  onBuy,
  className,
}: MarketHeroCardProps) {
  const t = useAppTranslations();
  const hasPerks = Boolean(boost || dailyReward);

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
        // Height is sized to the tallest content it must hold — title, two
        // perk lines and the buy button — so nothing is sliced mid-line.
        'market-hero-card relative flex h-[142px] cursor-pointer items-stretch transition-transform active:scale-[0.99]',
        className
      )}
    >
      {/* Pinned to the corner rather than stacked above the title: the state of
          the offer is a stamp on it, and the room it used to take belongs to
          saying what the thing does. */}
      {(isNew || discountPct) && (
        <div className="absolute top-2.5 right-2.5 z-1 flex items-center gap-1.5">
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

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 overflow-hidden py-3 pr-3.5 pl-4">
        <h3 className="line-clamp-1 text-[16px] font-extrabold leading-tight tracking-tight text-white">
          {title}
        </h3>

        {hasPerks ? (
          <div className="flex flex-col gap-1">
            {boost && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold leading-tight text-white/85">
                <Zap size={13} strokeWidth={2.5} className="shrink-0 text-[var(--hero-accent)]" />
                <span className="truncate">
                  {t('avatar boost {pct} {type}', {
                    pct: boost.pct,
                    type: t(`avatar boost ${boost.type}`),
                  })}
                </span>
              </span>
            )}
            {dailyReward && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold leading-tight text-white/85">
                <Gift size={12} strokeWidth={2.5} className="shrink-0 text-[var(--hero-accent)]" />
                <span className="truncate">{t('avatar daily reward')}</span>
                <AvatarDailyRewardValue reward={dailyReward} size={11} className="shrink-0" />
              </span>
            )}
          </div>
        ) : (
          description && (
            <p className="text-pink-secondary line-clamp-2 text-[11px] leading-snug">
              {description}
            </p>
          )
        )}

        {locked ? (
          // Tapping it opens the sheet, where the item and its gate are stated —
          // the slide used to offer a Buy the backend was bound to refuse.
          <span className="text-pink-secondary mt-0.5 inline-flex w-fit items-center gap-1.5 rounded-lg border border-white/12 bg-white/8 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider">
            <Lock size={12} strokeWidth={2.6} />
            {t('locked')}
          </span>
        ) : (
          price && (
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
          )
        )}
      </div>
    </div>
  );
}
