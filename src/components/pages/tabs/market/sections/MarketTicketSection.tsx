'use client';

import { Ticket as TicketLucide } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyTicketMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import { applyStatusMarketDiscount } from '@/utils/global/market.utils';

export interface MarketTicketSectionProps {
  tickets: MarketTicket[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketTicketSection({ tickets, onSelect, onBuy }: MarketTicketSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyTicket] = useBuyTicketMutation();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  if (!tickets.length) return null;

  return (
    <MarketSectionGrid title={t('tickets')} icon={TicketLucide} accent="var(--color-electric-pink)">
      {tickets.map(ticket => {
        const isLocked = !isTierUnlocked(ticket.ticketType) || ticket.isAvailable === false;
        const cardIcon: ReactNode = <Ticket type={ticket.ticketType} width={104} height={104} />;
        const modalIcon: ReactNode = <Ticket type={ticket.ticketType} width={140} height={140} />;
        const discountedPrices = applyStatusMarketDiscount(ticket.prices, isLp, isVip);
        const item: MarketSelectedItem = {
          id: ticket.id,
          name: ticket.name,
          description: t(ticket.ticketType),
          iconNode: modalIcon,
          prices: discountedPrices,
          isNew: ticket.isNew,
          discountPct: ticket.discountPct,
          accent: ticket.ticketType,
          mutate: price =>
            buyTicket({ ticketId: ticket.id, count: 1, priceType: price.type }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={ticket.id}
            name={ticket.name}
            accent={ticket.ticketType}
            isNew={ticket.isNew}
            discountPct={ticket.discountPct}
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
