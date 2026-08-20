'use client';

import { Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyShardMutation } from '@/api/market.api';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLimitedBadge } from '@/components/pages/tabs/market/MarketLimitedBadge';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketShardName, marketShardsReceived } from '@/utils/pages/market-name.utils';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketShard } from '@/types/interfaces/market.interfaces';
import {
  applyStatusMarketDiscount,
  effectiveMarketDiscountPct,
  marketOfferClosedMessageId,
  marketOfferClosedReason,
} from '@/utils/global/market.utils';

export interface MarketShardSectionProps {
  shards: MarketShard[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketShardSection({ shards, onSelect, onBuy }: MarketShardSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyShard] = useBuyShardMutation();
  const { data: me } = useGetMeQuery();
  const { data: inventory } = useGetInventoryQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  if (!shards.length) return null;

  return (
    <MarketSectionGrid title={t('shards title')} icon={Gem} accent="var(--color-electric-purple)">
      {shards.map(shard => {
        const isTierLocked = !isTierUnlocked(shard.quality);
        // Same rule as the tier gate: an empty shelf or a passed deadline is a
        // refusal the server will make anyway — say it before the tap.
        const closed = marketOfferClosedReason(shard);
        const isLocked = isTierLocked || !!closed;
        const cardIcon: ReactNode = (
          <ChipShardIcon type={shard.type} tier={shard.quality} size={101} />
        );
        const renderIcon = (size: number): ReactNode =>
          shard.imageUrl ? (
            <MarketItemImage src={shard.imageUrl} alt={shard.name} size={size} />
          ) : (
            <ChipShardIcon type={shard.type} tier={shard.quality} size={size} />
          );
        const description = marketShardsReceived(shard.count, t);
        const discountedPrices = applyStatusMarketDiscount(shard.prices, discountPct);
        const item: MarketSelectedItem = {
          id: shard.id,
          // The sheets take the same localized name the card shows — `shard.name`
          // is the backend's English composite («Bronze Time Shard»).
          name: marketShardName(shard, t),
          description,
          describeOrder: quantity => marketShardsReceived(shard.count * quantity, t),
          about: t('market shard purpose'),
          locked: isLocked,
          lockNote: isLocked ? (
            isTierLocked ? (
              <MarketLockPanel tier={shard.quality} />
            ) : (
              <MarketLockPanel note={t(marketOfferClosedMessageId[closed!])} />
            )
          ) : undefined,
          renderIcon,
          prices: discountedPrices,
          expiresAt: shard.expiresAt,
          remainingSupply: shard.remainingSupply,
          isNew: shard.isNew,
          discountPct: shard.discountPct,
          accent: shard.quality,
          maxQuantity: GlobalConstants.marketMaxUnitsPerOrder,
          ownedCount:
            inventory?.shards.find(s => s.type === shard.type && s.quality === shard.quality)
              ?.count ?? 0,
          ownedIconNode: <ChipShardIcon type={shard.type} tier={shard.quality} size={14} />,
          // One request for the whole order: the backend charges price × N
          // under a balance guard, so «×10» is all-or-nothing rather than the
          // ten sequential POSTs it used to be.
          mutate: (price, quantity) =>
            buyShard({
              shardId: shard.id,
              shardType: shard.type,
              quality: shard.quality,
              count: shard.count,
              quantity,
              price,
            }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={shard.id}
            name={marketShardName(shard, t)}
            accent={shard.quality}
            isNew={shard.isNew}
            discountPct={shard.discountPct}
            disabled={isLocked}
            disabledLabel={
              closed && !isTierLocked ? t(marketOfferClosedMessageId[closed]) : undefined
            }
            badge={
              <MarketLimitedBadge
                expiresAt={shard.expiresAt}
                remainingSupply={shard.remainingSupply}
              />
            }
            iconStage={cardIcon}
            imageUrl={shard.imageUrl}
            iconStageClassName="h-28"
            prices={discountedPrices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
