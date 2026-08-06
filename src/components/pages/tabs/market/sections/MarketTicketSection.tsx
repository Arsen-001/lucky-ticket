'use client';

import { Ticket as TicketLucide } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyTicketMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { useGetTicketsQuery } from '@/api/tickets.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { Ticket } from '@/components/shared/icons/Ticket';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { marketTicketName } from '@/utils/pages/market-name.utils';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';
import type { TicketType } from '@/types/types/ticket.types';
import { applyStatusMarketDiscount, effectiveMarketDiscountPct } from '@/utils/global/market.utils';

/** What each tier's ticket actually opens — the same copy the Tickets tab shows. */
const purposeIdByTier: Record<TicketType, MessageIds> = {
  bronze: 'bronze ticket description',
  silver: 'silver ticket description',
  gold: 'golden ticket description',
  platinum: 'platinum ticket description',
  diamond: 'diamond ticket description',
};

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
        const isLocked = isTierLocked || ticket.isAvailable === false;
        const cardIcon: ReactNode = <Ticket type={ticket.ticketType} width={104} height={104} />;
        const modalIcon: ReactNode = <Ticket type={ticket.ticketType} width={140} height={140} />;
        const discountedPrices = applyStatusMarketDiscount(ticket.prices, discountPct);
        const item: MarketSelectedItem = {
          id: ticket.id,
          name: ticket.name,
          description: t(ticket.ticketType),
          about: t(purposeIdByTier[ticket.ticketType]),
          locked: isLocked,
          lockNote: isLocked ? (
            isTierLocked ? (
              <MarketLockPanel tier={ticket.ticketType} />
            ) : (
              <MarketLockPanel note={t('ticket not on sale')} />
            )
          ) : undefined,
          iconNode: ticket.imageUrl ? (
            <MarketItemImage src={ticket.imageUrl} alt={ticket.name} size={140} />
          ) : (
            modalIcon
          ),
          prices: discountedPrices,
          remainingSupply: ticket.remainingSupply,
          isNew: ticket.isNew,
          discountPct: ticket.discountPct,
          accent: ticket.ticketType,
          maxQuantity: GlobalConstants.marketMaxPurchaseQuantity,
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
