import { Plus, ShoppingCart } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { GlobalConstants } from '@/constants/global.constants';
import type { AdsExtraOffer } from '@/types/interfaces/tasks.interfaces';
import { AdRewardRow } from './AdRewardRow';

export interface AdBuyMoreCardProps {
  extra: AdsExtraOffer;
  onOpen: () => void;
  className?: string;
}

/**
 * The last slide of the ads carousel once the free slots run out: buy more
 * views for the rest of the day.
 *
 * It states the price AND what that price buys, both on the card rather than
 * behind the tap — a card that only says "more" and opens a paywall is the
 * pattern players learn to distrust, and a price with no product beside it is
 * the same card with a number on it. The reward comes from the server's paid
 * ladder (`extra.nextRewards`), so it is the reward the next bought view will
 * actually pay, not a guess from the free ladder.
 */
export function AdBuyMoreCard({ extra, onOpen, className }: AdBuyMoreCardProps) {
  const t = useAppTranslations();
  // `remaining: null` is "no ceiling", not "nothing left" — the card must stay
  // buyable there, so the null case is spelled out rather than coerced.
  const soldOut = extra.remaining !== null && extra.remaining <= 0;
  // Absent on an older backend — the card then reads exactly as it used to.
  const nextReward = extra.nextRewards?.[0];

  return (
    <button
      type="button"
      onClick={soldOut ? undefined : onOpen}
      disabled={soldOut}
      className={twMerge(
        'card-outlined bg-background-overlay relative flex w-full flex-col gap-3 overflow-hidden rounded-2xl px-3.5 py-3.5 transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <span className="flex w-full items-center gap-3">
        <span className="flex-center bg-gold/15 text-gold size-9 shrink-0 rounded-full">
          <ShoppingCart size={16} />
        </span>

        <span className="min-w-0 flex-1 text-start">
          <span className="block text-sm leading-tight font-bold text-white">
            {soldOut ? t('extra ads sold out') : t('buy more ads')}
          </span>
          <span className="mt-0.5 block text-[11px] leading-snug text-white/50">
            {soldOut
              ? t('extra ads back tomorrow')
              : t('extra ad price', {
                  lc: formatNumber(extra.priceLc),
                  coin: GlobalConstants.coinName,
                  ls: extra.priceLs,
                })}
          </span>
        </span>

        {!soldOut && (
          <span className="flex-center bg-pink-gradient size-11 shrink-0 rounded-full text-white">
            <Plus size={18} />
          </span>
        )}
      </span>

      {/* What the money buys. Sold out, it would advertise a view that cannot
          be bought until tomorrow, so it goes with the offer. */}
      {!soldOut && nextReward && nextReward.length > 0 && (
        <span className="w-full">
          <span className="mb-1 block text-start text-[10px] font-bold tracking-wider text-white/40 uppercase">
            {t('per view')}
          </span>
          <AdRewardRow rewards={nextReward} insideButton />
        </span>
      )}
    </button>
  );
}
