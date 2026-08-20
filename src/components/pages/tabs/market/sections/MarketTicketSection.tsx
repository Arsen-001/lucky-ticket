'use client';

import { Ticket as TicketLucide } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyTicketMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLimitedBadge } from '@/components/pages/tabs/market/MarketLimitedBadge';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { Ticket } from '@/components/shared/icons/Ticket';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketTicketName } from '@/utils/pages/market-name.utils';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import { tierTicketDescriptionId } from '@/constants/tier-names';
import {
  applyStatusMarketDiscount,
  effectiveMarketDiscountPct,
  marketOfferClosedMessageId,
  marketOfferClosedReason,
} from '@/utils/global/market.utils';

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
  const { data: myTickets } = useGetTicketsQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);
  if (!tickets.length) return null;

  return (
    <MarketSectionGrid title={t('tickets')} icon={TicketLucide} accent="var(--color-electric-pink)">
      {tickets.map(ticket => {
        const isTierLocked = !isTierUnlocked(ticket.ticketType);
        // An empty shelf or a passed deadline closes the sale exactly like the
        // "not on sale" flag does — the server refuses all three.
        const closed = marketOfferClosedReason(ticket);
        const isLocked = isTierLocked || ticket.isAvailable === false || !!closed;
        const cardIcon: ReactNode = <Ticket type={ticket.ticketType} width={104} height={104} />;
        // One picture, any size the surface asks for — see `MarketSelectedItem`.
        const renderIcon = (size: number): ReactNode =>
          ticket.imageUrl ? (
            <MarketItemImage src={ticket.imageUrl} alt={ticket.name} size={size} />
          ) : (
            <Ticket type={ticket.ticketType} width={size} height={size} />
          );
        const discountedPrices = applyStatusMarketDiscount(ticket.prices, discountPct);
        const item: MarketSelectedItem = {
          id: ticket.id,
          name: marketTicketName(ticket, t),
          description: t(ticket.ticketType),
          about: t(tierTicketDescriptionId[ticket.ticketType]),
          locked: isLocked,
          lockNote: isLocked ? (
            isTierLocked ? (
              <MarketLockPanel tier={ticket.ticketType} />
            ) : (
              <MarketLockPanel
                note={closed ? t(marketOfferClosedMessageId[closed]) : t('ticket not on sale')}
              />
            )
          ) : undefined,
          renderIcon,
          prices: discountedPrices,
          expiresAt: ticket.expiresAt,
          remainingSupply: ticket.remainingSupply,
          isNew: ticket.isNew,
          discountPct: ticket.discountPct,
          accent: ticket.ticketType,
          maxQuantity: GlobalConstants.marketMaxUnitsPerOrder,
          ownedCount: myTickets?.find(t => t.ticketType === ticket.ticketType)?.count ?? 0,
          ownedIconNode: <Ticket type={ticket.ticketType} width={18} height={18} />,
          mutate: (price, count) =>
            buyTicket({ ticketId: ticket.id, count, priceType: price.type }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={ticket.id}
            name={marketTicketName(ticket, t)}
            accent={ticket.ticketType}
            isNew={ticket.isNew}
            discountPct={ticket.discountPct}
            disabled={isLocked}
            disabledLabel={
              closed && !isTierLocked ? t(marketOfferClosedMessageId[closed]) : undefined
            }
            badge={
              <MarketLimitedBadge
                expiresAt={ticket.expiresAt}
                remainingSupply={ticket.remainingSupply}
              />
            }
            iconStage={cardIcon}
            imageUrl={ticket.imageUrl}
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
