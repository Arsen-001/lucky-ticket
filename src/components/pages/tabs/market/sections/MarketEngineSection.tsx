'use client';

import { Cog } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyEngineMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketEngine, MarketPrice } from '@/types/interfaces/market.interfaces';
import { applyStatusMarketDiscount } from '@/utils/global/market.utils';

export interface MarketEngineSectionProps {
  engines: MarketEngine[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketEngineSection({ engines, onSelect, onBuy }: MarketEngineSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyEngine] = useBuyEngineMutation();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  if (!engines.length) return null;

  return (
    <MarketSectionGrid title={t('engines')} icon={Cog} accent="var(--color-gold)">
      {engines.map(engine => {
        const isLocked = !isTierUnlocked(engine.ticketType);
        const cardIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={144} />;
        const modalIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={156} />;
        const description = t('level x', { n: engine.engineLevel });
        const discountedPrices = applyStatusMarketDiscount(engine.prices, isLp, isVip);
        const item: MarketSelectedItem = {
          id: engine.id,
          name: engine.name,
          description,
          iconNode: modalIcon,
          prices: discountedPrices,
          remainingSupply: engine.remainingSupply,
          isNew: engine.isNew,
          discountPct: engine.discountPct,
          accent: engine.ticketType,
          mutate: price =>
            buyEngine({
              engineId: engine.id,
              tier: engine.ticketType,
              engineLevel: engine.engineLevel,
              price,
            }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={engine.id}
            name={engine.name}
            accent={engine.ticketType}
            isNew={engine.isNew}
            discountPct={engine.discountPct}
            disabled={isLocked}
            iconStage={cardIcon}
            iconStageClassName="h-40"
            prices={discountedPrices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
