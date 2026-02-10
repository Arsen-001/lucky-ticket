'use client';

import { useState } from 'react';
import { useBuyTicketMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketSection } from '../MarketSection';
import { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import { MarketPriceType } from '@/types/enums/market.enums';
import { Tickets } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Ticket } from '@/components/shared/icons/Ticket';
import { MarketBuyModal } from '../MarketBuyModal';
import { MarketTicketItem } from './MarketTicketItem';

export function MarketTicketList() {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMarketDataQuery();
  const [buyTicket, { isLoading: isBuying }] = useBuyTicketMutation();
  const [selectedTicket, setSelectedTicket] = useState<{
    ticket: MarketTicket;
    count: number;
    price: MarketPrice;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [ticketCounts, setTicketCounts] = useState<Record<string, number>>({});

  const tickets = isLoading ? (new Array(3).fill(null) as MarketTicket[]) : data?.tickets || [];

  const getCount = (ticketId: string) => ticketCounts[ticketId] || 1;

  const handleCountChange = (ticketId: string, count: number) => {
    setTicketCounts(prev => ({ ...prev, [ticketId]: count }));
  };

  const handleBuyButtonClick = (ticket: MarketTicket, count: number, price: MarketPrice) => {
    setSelectedTicket({ ticket, count, price });
    setIsOpen(true);
  };

  const handleCardClick = (ticket: MarketTicket) => {
    if (!ticket.isAvailable) return;
    const count = getCount(ticket.id);
    const price = {
      ...ticket.prices[0],
      amount: ticket.prices[0].amount * count,
    };
    setSelectedTicket({ ticket, count, price });
    setIsOpen(true);
  };

  const handleBuy = async () => {
    if (!selectedTicket) return;
    try {
      await buyTicket({
        ticketId: selectedTicket.ticket.id,
        count: selectedTicket.count,
      }).unwrap();
      setSelectedTicket(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to buy ticket:', error);
    }
  };

  return (
    <div>
      <MarketSection
        title={t('tickets')}
        icon={<Tickets />}
        gridClassName="grid-cols-2 gap-4"
        isLoading={isLoading}
      >
        {tickets.map((ticket, index) => (
          <MarketTicketItem
            key={ticket?.id || index}
            ticket={ticket}
            isLoading={isLoading}
            count={getCount(ticket?.id || '')}
            onCountChange={val => ticket && handleCountChange(ticket.id, val)}
            onBuy={price => ticket && handleBuyButtonClick(ticket, getCount(ticket.id), price)}
            onClick={() => ticket && handleCardClick(ticket)}
          />
        ))}
      </MarketSection>

      <MarketBuyModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        title={
          selectedTicket ? `${selectedTicket.count}x ${t(selectedTicket.ticket.ticketType)}` : ''
        }
        price={selectedTicket?.price || { amount: 0, type: MarketPriceType.LTC }}
        priceLabel={t('total price')}
        icon={selectedTicket && <Ticket type={selectedTicket.ticket.ticketType} height={40} />}
        description={
          selectedTicket?.ticket.ticketType &&
          t(`participate in ${selectedTicket?.ticket.ticketType} level draws`)
        }
      />
    </div>
  );
}
