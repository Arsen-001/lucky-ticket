'use client';

import { Package, Timer } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useCountDown } from '@/hooks/useCountDown';
import {
  marketOfferClosedMessageId,
  marketOfferClosedReason,
  type MarketLimitedFields,
} from '@/utils/global/market.utils';

export interface MarketLimitedBadgeProps extends MarketLimitedFields {
  className?: string;
}

/**
 * What makes this listing temporary, said on the card itself: the time left,
 * the units left, or that it is over.
 *
 * A deadline that only appears inside the info sheet is a deadline nobody sees
 * — the grid is where the choice is made. The pill ticks on its own
 * (`useCountDown`), so a card left on screen counts down instead of freezing at
 * whatever it said when the screen was drawn.
 */
export function MarketLimitedBadge({
  expiresAt,
  remainingSupply,
  className,
}: MarketLimitedBadgeProps) {
  const t = useAppTranslations();
  const { leftTimeShort, expired } = useCountDown(expiresAt);

  const closed = marketOfferClosedReason({ expiresAt, remainingSupply });
  const showTimer = !!expiresAt && !expired && !closed;
  const showStock = remainingSupply !== undefined && remainingSupply > 0;

  if (!closed && !showTimer && !showStock) return null;

  // Dark pill + bright ink, never bright fill + white ink: at 9px the app's
  // floor is 4.5:1, and white on --color-warning measures 3.4:1. Gold on the
  // app background is 10:1, and white on --color-error is 9.5:1.
  const pill =
    'flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold';

  return (
    <div className={twMerge('flex flex-col items-end gap-1', className)}>
      {closed ? (
        <span
          className={twMerge(pill, 'bg-error border-error uppercase tracking-wider text-white')}
        >
          {t(marketOfferClosedMessageId[closed])}
        </span>
      ) : (
        <>
          {showTimer && (
            <span
              className={twMerge(pill, 'bg-background/85 border-gold/35 text-gold tabular-nums')}
            >
              <Timer size={9} strokeWidth={3} />
              {leftTimeShort}
            </span>
          )}
          {showStock && (
            <span
              className={twMerge(pill, 'bg-background/85 border-white/15 text-white tabular-nums')}
            >
              <Package size={9} strokeWidth={3} />
              {t('left in stock', { count: remainingSupply })}
            </span>
          )}
        </>
      )}
    </div>
  );
}
