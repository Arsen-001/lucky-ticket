'use client';

import { ChevronRight, Pencil } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { StarPackagesGrid } from '@/components/shared/stars/StarPackagesGrid';
import { StarsPromoNote } from '@/components/shared/stars/StarsPromoNote';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarPackages } from '@/hooks/useStarPackages';
import { formatNumber } from '@/utils/global/number.utils';

export interface StarsTopUpBlockProps {
  /** Opens the buy sheet, where an amount can be typed instead of picked. */
  onCustomAmount: () => void;
  className?: string;
}

/**
 * The packages on the page itself, between the balance and the ledger.
 *
 * What this buys is exposure: the bonus ladder («+20 %», «best value») and the
 * date it runs out are now seen by everyone who opens the screen to check a
 * balance, not only by someone who already decided to pay and pressed «Buy».
 */
export function StarsTopUpBlock({ onCustomAmount, className }: StarsTopUpBlockProps) {
  const t = useAppTranslations();
  const { packages, promoActive } = useStarPackages();

  if (packages.length === 0) return null;

  return (
    <section className={twMerge('flex flex-col gap-2.5', className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('top up')}
        </h3>
        <StarsPromoNote />
        {/* Wraps under the heading in the locales where it does not fit beside
            it — Russian spells this one out. */}
        <span className="text-pink-secondary ms-auto text-[11px] font-semibold">
          {t('buy stars subtitle')}
        </span>
      </div>

      <StarPackagesGrid />

      <button
        type="button"
        onClick={onCustomAmount}
        className="border-gold/30 bg-gold/8 hover:bg-gold/12 tap-target relative flex min-h-11 cursor-pointer items-center gap-2 rounded-2xl border px-3 text-start transition-colors"
      >
        <span className="bg-gold/15 border-gold/35 flex-center h-7 w-7 flex-shrink-0 rounded-lg border">
          <Pencil size={13} className="text-gold" strokeWidth={2.4} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[12px] font-extrabold text-white">{t('custom amount')}</span>
          {/* Says the rule the server applies, so a typed 210 is not read as a
              worse deal than the 200 tile: the bonus goes by what was PAID.
              Gone with the promo — a line promising a bonus that the server has
              stopped granting is the one thing this screen must never print. */}
          {promoActive && (
            <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
              {t('bonus from {stars}', { stars: formatNumber(packages[0].stars) })}
            </span>
          )}
        </span>
        <ChevronRight size={16} className="text-pink-secondary flex-shrink-0" strokeWidth={2.4} />
      </button>
    </section>
  );
}
