'use client';

import { StarPackagesGrid } from '@/components/shared/stars/StarPackagesGrid';
import { StarsPromoNote } from '@/components/shared/stars/StarsPromoNote';
import { TelegramStarIcon } from '@/components/shared/icons/TelegramStarIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useStarPackages } from '@/hooks/useStarPackages';

/**
 * The Telegram-Stars packages inside the Market's «Limited» tab.
 *
 * They belong there for the same reason a shard with a deadline does: the bonus
 * runs out on a date, which is exactly what that tab collects. The tiles are
 * the same component the Stars screen uses — one price, one payment path, one
 * clock — so the two surfaces cannot advertise different bonuses.
 *
 * Draws nothing once the promo is over: the packages are still on sale, but
 * without a deadline they are not a limited offer and the tab is not their
 * home.
 */
export function MarketStarPackagesSection() {
  const t = useAppTranslations();
  const { packages, promoActive, promoEndsAt } = useStarPackages();

  if (!promoEndsAt || !promoActive || packages.length === 0) return null;

  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <TelegramStarIcon size={16} />
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-white">
          {t('star packages')}
        </h3>
        <StarsPromoNote className="ms-auto" />
      </div>

      <StarPackagesGrid />
    </section>
  );
}
