'use client';

import { MarketLimitedNote } from '@/components/pages/tabs/market/MarketLimitedNote';
import { MarketEngineSection } from '@/components/pages/tabs/market/sections/MarketEngineSection';
import { MarketShardSection } from '@/components/pages/tabs/market/sections/MarketShardSection';
import { MarketStatusSection } from '@/components/pages/tabs/market/sections/MarketStatusSection';
import { MarketTicketSection } from '@/components/pages/tabs/market/sections/MarketTicketSection';
import { MarketStarPackagesSection } from '@/components/pages/tabs/market/sections/MarketStarPackagesSection';
import { useStarPackages } from '@/hooks/useStarPackages';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import type { MarketData, MarketPrice } from '@/types/interfaces/market.interfaces';
import { limitedMarketData } from '@/utils/global/market.utils';

export interface MarketLimitedSectionsProps {
  data?: MarketData;
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

/**
 * The «Limited» tab: everything the admin put on a clock or on a shelf, drawn
 * by the same section components as its own category.
 *
 * Reusing the sections rather than a flat grid of its own is deliberate — a
 * ticket's tier gate, a shard's inventory count, a VIP's upgrade price and
 * every buy mutation live inside them, and a second mapping of all that would
 * be a second place for the two to disagree. Filtering happens on the arrays
 * they take; the cards are byte-identical to the ones in the category tabs.
 */
export function MarketLimitedSections({ data, onSelect, onBuy }: MarketLimitedSectionsProps) {
  const limited = limitedMarketData(data);
  // The Stars packages are limited by a promo deadline rather than by stock,
  // so they are counted here as well — otherwise a tab that exists because of
  // them would open on the packages alone and claim to be empty.
  const { packages, promoActive, promoEndsAt } = useStarPackages();
  const starPackages = promoEndsAt && promoActive ? packages.length : 0;

  if (!limited.total && !starPackages) return null;

  return (
    <div className="flex flex-col gap-5">
      <MarketLimitedNote />
      <MarketStarPackagesSection />
      <MarketStatusSection statuses={limited.statuses} onSelect={onSelect} onBuy={onBuy} />
      <MarketTicketSection tickets={limited.tickets} onSelect={onSelect} onBuy={onBuy} />
      <MarketShardSection shards={limited.shards} onSelect={onSelect} onBuy={onBuy} />
      <MarketEngineSection engines={limited.engines} onSelect={onSelect} onBuy={onBuy} />
    </div>
  );
}
