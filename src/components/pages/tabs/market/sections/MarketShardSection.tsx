'use client';

import { Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyShardMutation } from '@/api/market.api';
import { useGetInventoryQuery } from '@/api/inventory.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketShardName } from '@/utils/pages/market-name.utils';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketShard } from '@/types/interfaces/market.interfaces';
import { applyStatusMarketDiscount, effectiveMarketDiscountPct } from '@/utils/global/market.utils';

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
        const isLocked = !isTierUnlocked(shard.quality);
        const cardIcon: ReactNode = (
          <ChipShardIcon type={shard.type} tier={shard.quality} size={101} />
        );
        const renderIcon = (size: number): ReactNode =>
          shard.imageUrl ? (
            <MarketItemImage src={shard.imageUrl} alt={shard.name} size={size} />
          ) : (
            <ChipShardIcon type={shard.type} tier={shard.quality} size={size} />
          );
        const description = `+${shard.count} ${t('shards unit {count}', { count: shard.count })}`;
        const discountedPrices = applyStatusMarketDiscount(shard.prices, discountPct);
        const item: MarketSelectedItem = {
          id: shard.id,
          name: shard.name,
          description,
          about: t('market shard purpose'),
          locked: isLocked,
          lockNote: isLocked ? <MarketLockPanel tier={shard.quality} /> : undefined,
          renderIcon,
          prices: discountedPrices,
          remainingSupply: shard.remainingSupply,
          isNew: shard.isNew,
          discountPct: shard.discountPct,
          accent: shard.quality,
          maxQuantity: GlobalConstants.marketMaxShardPurchaseQuantity,
          ownedCount:
            inventory?.shards.find(s => s.type === shard.type && s.quality === shard.quality)
              ?.count ?? 0,
          ownedIconNode: <ChipShardIcon type={shard.type} tier={shard.quality} size={14} />,
          // The shards/buy DTO rejects a count field — buy sequentially, one
          // request per unit (the per-order cap keeps this loop short).
          mutate: async (price, count) => {
            for (let i = 0; i < count; i += 1) {
              await buyShard({
                shardId: shard.id,
                shardType: shard.type,
                quality: shard.quality,
                count: shard.count,
                price,
              }).unwrap();
            }
          },
        };
        return (
          <MarketUniversalCard
            key={shard.id}
            name={marketShardName(shard, t)}
            accent={shard.quality}
            isNew={shard.isNew}
            discountPct={shard.discountPct}
            disabled={isLocked}
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
