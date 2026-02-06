'use client';

import { useBuyTicketMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { icons } from '@/constants/icons';
import { TicketType } from '@/components/shared/icons/Ticket';

export function MarketTicketList() {
  const { data, isLoading } = useGetMarketDataQuery();
  const [buyTicket] = useBuyTicketMutation();
  const t = useAppTranslations();

  const tickets = isLoading ? new Array(3).fill({}) : data?.tickets || [];

  const ticketIcons: Record<TicketType, any> = {
    bronze: icons.bronzeTicket,
    silver: icons.silverTicket,
    gold: icons.goldenTicket,
    platinum: icons.platinumTicket,
    diamond: icons.diamondTicket,
  };

  return (
    <div className="flex flex-col gap-3">
      {tickets.map((ticket, index) => (
        <MarketItemCard
          key={ticket.id || index}
          isLoading={isLoading}
          title={`${t(ticket.ticketType as any)} ${t('ticket')}`}
          price={ticket.price}
          icon={ticketIcons[ticket.ticketType as TicketType]}
          onBuy={() => buyTicket(ticket.id)}
          className="flex-row items-center justify-between"
        />
      ))}
    </div>
  );
}
