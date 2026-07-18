'use client';

import { Cog } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyEngineMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketEngine, MarketPrice } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { effectiveMarketDiscountPct, engineNextPurchasePrices } from '@/utils/global/market.utils';

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
  const { data: tickets } = useGetTicketsQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  if (!engines.length) return null;

  // Engines already owned of a tier — drives the geometric repeat-purchase
  // price (DOCS §14.2). Reads the live tickets cache; the buy mutation
  // invalidates it, so the next engine's price rises immediately after a buy.
  const ownedOfTier = (tier: TicketType): number =>
    tickets?.find(ticket => ticket.ticketType === tier)?.engines?.length ?? 0;

  return (
    <MarketSectionGrid title={t('engines title')} icon={Cog} accent="var(--color-gold)">
      {engines.map(engine => {
        const isLocked = !isTierUnlocked(engine.ticketType);
        const cardIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={144} />;
        const modalIcon: ReactNode = <EngineIcon tier={engine.ticketType} size={156} />;
        const description = t('level x', { n: engine.engineLevel });
        // The catalog `engine.prices` is only the first-engine base; the real
        // price is the geometric repeat price for the player's owned count, so
        // the anti-inflation valve (DOCS §14.2) actually fires on repeat buys.
        const discountedPrices = engineNextPurchasePrices(
          engine.ticketType,
          ownedOfTier(engine.ticketType),
          discountPct
        );
        const item: MarketSelectedItem = {
          id: engine.id,
          name: engine.name,
          description,
          iconNode: engine.imageUrl ? (
            <MarketItemImage src={engine.imageUrl} alt={engine.name} size={156} />
          ) : (
            modalIcon
          ),
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
