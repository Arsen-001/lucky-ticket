'use client';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { StarPackageCard } from '@/components/pages/out-tabs/drawer/wallet/StarPackageCard';
import { ButtonSpinner } from '@/components/shared/loaders/ButtonSpinner';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarPackages } from '@/hooks/useStarPackages';
import { useBuyTelegramStars } from '@/hooks/useBuyTelegramStars';
import { useToast } from '@/hooks/useToast';

export interface StarPackagesGridProps {
  className?: string;
}

/**
 * The four packages as tiles that pay on tap — one implementation for every
 * surface that offers them (the Stars screen, the Market's Limited tab).
 *
 * A tap goes straight to Telegram's payment window: the app's own sheet exists
 * to pick an amount, and a tile IS the amount. The tile that was tapped wears
 * the spinner and the rest dim, because a Telegram invoice takes a beat to
 * open and a screen that looks idle gets tapped twice.
 */
export function StarPackagesGrid({ className }: StarPackagesGridProps) {
  const t = useAppTranslations();
  const toast = useToast();
  const { packages, promoActive } = useStarPackages();
  const { buy, pending } = useBuyTelegramStars();
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
    // 'cancelled' / 'pending' → the player closed the window or is mid-flow.
  };

  return (
    <div className={twMerge('grid grid-cols-2 gap-2', className)}>
      {packages.map(pkg => (
        <div key={pkg.stars} className="relative">
          <StarPackageCard
            stars={pkg.stars}
            // Zero once the promo has ended: the package stays on sale and pays
            // 1:1, exactly as the server credits it.
            bonus={promoActive ? pkg.bonus : 0}
            // «Best value» goes with the bonus: once every package pays 1:1
            // there is no better value, and the label would be pointing at
            // nothing.
            popular={promoActive && pkg.popular}
            top={pkg.top}
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
  );
}
