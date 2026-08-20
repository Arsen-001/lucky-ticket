'use client';

import { useState } from 'react';
import { ChevronRight, Pencil } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { StarPackageCard } from '@/components/pages/out-tabs/drawer/wallet/StarPackageCard';
import { ButtonSpinner } from '@/components/shared/loaders/ButtonSpinner';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarPackages } from '@/hooks/useStarPackages';
import { useBuyTelegramStars } from '@/hooks/useBuyTelegramStars';
import { useToast } from '@/hooks/useToast';
import { formatNumber } from '@/utils/global/number.utils';

export interface StarsTopUpBlockProps {
  /** Opens the buy sheet, where an amount can be typed instead of picked. */
  onCustomAmount: () => void;
  className?: string;
}

/**
 * The packages on the page itself, between the balance and the ledger.
 *
 * A tap here goes straight to Telegram's payment sheet — the app's own sheet
 * exists to pick an amount, and picking is what these tiles already did. What
 * this buys is exposure: the bonus ladder («+10», «+50», «best value») is now
 * seen by everyone who opens the screen to check a balance, not only by someone
 * who has already decided to pay and pressed «Buy».
 */
export function StarsTopUpBlock({ onCustomAmount, className }: StarsTopUpBlockProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { packages } = useStarPackages();
  const { buy, pending } = useBuyTelegramStars();
  // Which tile is waiting — the spinner belongs on the one that was tapped, not
  // on all four.
  const [buying, setBuying] = useState<number | null>(null);

  if (packages.length === 0) return null;

  const handleBuy = async (stars: number) => {
    if (pending) return;
    setBuying(stars);
    const status = await buy(stars);
    setBuying(null);

    if (status === 'paid') toast.success(t('purchase complete'));
    else if (status === 'unavailable') toast.info(t('open in telegram to buy stars'));
    else if (status === 'failed') toast.error(t('purchase failed'));
    // 'cancelled' / 'pending' → the player closed the sheet or is mid-flow.
  };

  return (
    <section className={twMerge('flex flex-col gap-2.5', className)}>
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('top up')}
        </h3>
        {/* Wraps under the heading in the locales where it does not fit beside
            it — Russian spells this one out. */}
        <span className="text-pink-secondary ms-auto text-[11px] font-semibold">
          {t('buy stars subtitle')}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {packages.map(pkg => (
          <div key={pkg.stars} className="relative">
            <StarPackageCard
              stars={pkg.stars}
              bonus={pkg.bonus}
              popular={pkg.popular}
              onSelect={() => handleBuy(pkg.stars)}
              className={twMerge('w-full', pending && 'pointer-events-none opacity-60')}
            />
            {buying === pkg.stars && (
              <span className="bg-background/45 flex-center absolute inset-0 rounded-2xl">
                <ButtonSpinner size={18} />
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCustomAmount}
        disabled={pending}
        className="border-gold/30 bg-gold/8 hover:bg-gold/12 tap-target relative flex min-h-11 items-center gap-2 rounded-2xl border px-3 text-start transition-colors disabled:opacity-60 cursor-pointer"
      >
        <span className="bg-gold/15 border-gold/35 flex-center h-7 w-7 flex-shrink-0 rounded-lg border">
          <Pencil size={13} className="text-gold" strokeWidth={2.4} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="text-[12px] font-extrabold text-white">{t('custom amount')}</span>
          {/* Says the rule the server applies, so a typed 210 is not read as a
              worse deal than the 200 tile: the bonus goes by what was PAID. */}
          <span className="text-pink-secondary text-[10px] font-semibold tabular-nums">
            {t('bonus from {stars}', { stars: formatNumber(packages[0].stars) })}
          </span>
        </span>
        <ChevronRight size={16} className="text-pink-secondary flex-shrink-0" strokeWidth={2.4} />
      </button>
    </section>
  );
}
