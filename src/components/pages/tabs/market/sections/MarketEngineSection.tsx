'use client';

import { Cog } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyEngineMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketEngine, MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketEngineSectionProps {
  engines: MarketEngine[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketEngineSection({ engines, onSelect, onBuy }: MarketEngineSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyEngine] = useBuyEngineMutation();
  if (!engines.length) return null;

  return (
    <MarketSectionGrid title={t('engines')} icon={Cog} accent="var(--color-gold)">
      {engines.map(engine => {
        const isLocked = !isTierUnlocked(engine.ticketType);
        const cardIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={144} />;
        const modalIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={156} />;
        const description = t('level x', { n: engine.engineLevel });
        const item: MarketSelectedItem = {
          id: engine.id,
          name: engine.name,
          description,
          iconNode: modalIcon,
          prices: engine.prices,
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
            prices={engine.prices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
