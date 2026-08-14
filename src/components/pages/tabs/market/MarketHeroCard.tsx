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
 * The showcase poster at the top of the Market: the item's own artwork fills the
 * card — blurred as the backdrop, sharp and whole as the portrait on the right —
 * with the name, what it does and one obvious buy button on the left. Tapping
 * the card opens the item; tapping the price buys it.
 *
 * The portrait is deliberately left square. Market artwork is 1024², and a
 * full-bleed crop into a 2:1 banner sliced the character's face off; blurring a
 * copy of the same image for the background keeps the card bathed in the item's
 * own colours without cropping anything that matters.
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
        // Height is sized to the tallest content it must hold — title, two perk
        // lines and the buy button — so nothing is sliced mid-line.
        'market-hero-card relative h-[176px] cursor-pointer transition-transform active:scale-[0.99]',
        className
      )}
    >
      {imageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt="" aria-hidden className="market-hero-backdrop" />
          {/* Admin-provided URL (Blob upload or pasted) — plain <img> avoids
              the next/image host allow-list, matching the market cards. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="market-hero-art absolute top-0 end-0 aspect-square h-full object-cover"
          />
          <span aria-hidden className="market-hero-scrim" />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-end pe-5">
          <div className="h-[124px] w-[124px]">{renderIcon(116)}</div>
        </div>
      )}

      {/* Pinned to the corner rather than stacked above the title: the state of
          the offer is a stamp on it, and the room it used to take belongs to
          saying what the thing does. */}
      {(isNew || discountPct) && (
        <div className="absolute top-3 end-3 z-2 flex items-center gap-1.5">
          {isNew && (
            <span className="bg-electric-pink rounded-full px-2 py-0.5 text-[9px] leading-none font-extrabold tracking-[0.1em] text-white uppercase">
              {t('new')}
            </span>
          )}
          {discountPct ? (
            <span className="bg-pink-gradient rounded-full px-2 py-0.5 text-[9px] leading-none font-extrabold text-white tabular-nums">
              −{discountPct}%
            </span>
          ) : null}
        </div>
      )}

      <div className="absolute inset-y-0 start-0 z-2 flex w-[68%] flex-col justify-center gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          {/* Two lines: a shard's full name ("Diamond Capacity Shard") does not
              fit one, and the truncated version named a tier, not an item. */}
          <h3 className="line-clamp-2 text-[19px] leading-tight font-extrabold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            {title}
          </h3>

          {hasPerks ? (
            <div className="flex flex-col gap-0.5">
              {boost && (
                <span className="inline-flex items-start gap-1.5 text-[11px] leading-tight font-bold text-white/90">
                  <Zap
                    size={13}
                    strokeWidth={2.5}
                    className="mt-px shrink-0 text-[var(--hero-accent)]"
                  />
                  {/* Two lines, not one: a German perk line ("+18% Marktrabatt,
                      solange ausgerüstet") is half again as long as the English
                      one and truncating it hid what the item actually does. */}
                  <span className="line-clamp-2">
                    {t('avatar boost {pct} {type}', {
                      pct: boost.pct,
                      type: t(`avatar boost ${boost.type}`),
                    })}
                  </span>
                </span>
              )}
              {dailyReward && (
                <span className="inline-flex items-center gap-1.5 text-[11px] leading-tight font-bold text-white/90">
                  <Gift
                    size={12}
                    strokeWidth={2.5}
                    className="shrink-0 text-[var(--hero-accent)]"
                  />
                  <span className="truncate">{t('avatar daily reward')}</span>
                  <AvatarDailyRewardValue reward={dailyReward} size={11} className="shrink-0" />
                </span>
              )}
            </div>
          ) : (
            description && (
              <p className="line-clamp-2 text-[11px] leading-snug text-white/75">{description}</p>
            )
          )}
        </div>

        {locked ? (
          // Tapping it opens the sheet, where the item and its gate are stated —
          // the slide used to offer a Buy the backend was bound to refuse.
          <span className="text-pink-secondary inline-flex w-fit items-center gap-1.5 rounded-xl border border-white/12 bg-black/45 px-3 py-2 text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-sm">
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
              className="market-hero-buy inline-flex w-fit items-center gap-1.5 rounded-xl px-4 py-2 text-[13px] font-extrabold text-white tabular-nums transition-transform active:scale-95"
            >
              <span className="text-[11px] font-bold tracking-wider uppercase opacity-80">
                {t('buy')}
              </span>
              {price.type === MarketPriceType.TELEGRAM_STARS && <TelegramStarIcon size={13} />}
              {price.originalAmount && (
                <span className="text-[10px] text-white/55 line-through">
                  {formatCompactPrice(price.originalAmount)}
                </span>
              )}
              <span>{formatCompactPrice(price.amount)}</span>
              {price.type === MarketPriceType.LC && <LcLabel size={13} interactive={false} />}
            </button>
          )
        )}
      </div>
    </div>
  );
}
