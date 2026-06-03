'use client';

import { Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyShardMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { ChipShardIcon } from '@/components/shared/icons/ChipShardIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketShard } from '@/types/interfaces/market.interfaces';
import { applyStatusMarketDiscount } from '@/utils/global/market.utils';

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
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  if (!shards.length) return null;

  return (
    <MarketSectionGrid title={t('shards title')} icon={Gem} accent="var(--color-electric-purple)">
      {shards.map(shard => {
        const isLocked = !isTierUnlocked(shard.quality);
        const cardIcon: ReactNode = (
          <ChipShardIcon type={shard.type} tier={shard.quality} size={101} />
        );
        const modalIcon: ReactNode = (
          <ChipShardIcon type={shard.type} tier={shard.quality} size={140} />
        );
        const description = `+${shard.count} ${t('shards')}`;
        const discountedPrices = applyStatusMarketDiscount(shard.prices, isLp, isVip);
        const item: MarketSelectedItem = {
          id: shard.id,
          name: shard.name,
          description,
          iconNode: modalIcon,
          prices: discountedPrices,
          isNew: shard.isNew,
          discountPct: shard.discountPct,
          accent: shard.quality,
          mutate: price =>
            buyShard({
              shardId: shard.id,
              shardType: shard.type,
              quality: shard.quality,
              count: shard.count,
              price,
            }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={shard.id}
            name={shard.name}
            accent={shard.quality}
            isNew={shard.isNew}
            discountPct={shard.discountPct}
            disabled={isLocked}
            iconStage={cardIcon}
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
