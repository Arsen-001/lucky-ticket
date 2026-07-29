import { Plus, ShoppingCart } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatNumber } from '@/utils/global/number.utils';
import { GlobalConstants } from '@/constants/global.constants';
import type { AdsExtraOffer } from '@/types/interfaces/tasks.interfaces';

export interface AdBuyMoreCardProps {
  extra: AdsExtraOffer;
  onOpen: () => void;
  className?: string;
}

/**
 * The last slide of the ads carousel once the free slots run out: buy more
 * views for the rest of the day.
 *
 * It states the price on the card rather than behind the tap — a card that
 * only says "more" and opens a paywall is the pattern players learn to
 * distrust.
 */
export function AdBuyMoreCard({ extra, onOpen, className }: AdBuyMoreCardProps) {
  const t = useAppTranslations();
  const soldOut = extra.remaining <= 0;

  return (
    <button
      type="button"
      onClick={soldOut ? undefined : onOpen}
      disabled={soldOut}
      className={twMerge(
        'card-outlined bg-background-overlay relative flex w-full items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3.5 transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      <span className="flex-center bg-gold/15 text-gold size-9 shrink-0 rounded-full">
        <ShoppingCart size={16} />
      </span>

      <span className="min-w-0 flex-1 text-left">
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
    </button>
  );
}
