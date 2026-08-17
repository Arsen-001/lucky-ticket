'use client';

import { Cog } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyEngineMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketEngineName } from '@/utils/pages/market-name.utils';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketEngine, MarketPrice } from '@/types/interfaces/market.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';
import { applyStatusMarketDiscount, effectiveMarketDiscountPct } from '@/utils/global/market.utils';

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
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  if (!engines.length) return null;

  return (
    <MarketSectionGrid title={t('engines title')} icon={Cog} accent="var(--color-gold)">
      {engines.map(engine => {
        const isLocked = !isTierUnlocked(engine.ticketType);
        const cardIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={144} />;
        const renderIcon = (size: number): ReactNode =>
          engine.imageUrl ? (
            <MarketItemImage src={engine.imageUrl} alt={engine.name} size={size} />
          ) : (
            <EngineIcon tier={engine.ticketType} size={size} />
          );
        const description = t('level x', { n: engine.engineLevel });
        // The catalog price IS the price — engines are flat-priced since
        // 17.08.2026, so the screen shows exactly what the server charges
        // (and an admin edit to the engine price reaches it without a deploy).
        const discountedPrices = applyStatusMarketDiscount(engine.prices, discountPct);
        const item: MarketSelectedItem = {
          id: engine.id,
          name: marketEngineName(engine, t),
          description,
          about: t('market engine purpose', { tier: t(engine.ticketType as MessageIds) }),
          locked: isLocked,
          lockNote: isLocked ? <MarketLockPanel tier={engine.ticketType} /> : undefined,
          renderIcon,
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
            name={marketEngineName(engine, t)}
            accent={engine.ticketType}
            isNew={engine.isNew}
            discountPct={engine.discountPct}
            disabled={isLocked}
            iconStage={cardIcon}
            imageUrl={engine.imageUrl}
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
