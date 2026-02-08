'use client';

import { useState } from 'react';
import { useBuyTicketMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { MarketSection } from './MarketSection';
import { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { MarketPriceType } from '@/types/enums/market.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { Tickets } from 'lucide-react';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { icons } from '@/constants/icons';
import Image, { type StaticImageData } from 'next/image';
import { useAppTranslations } from '@/hooks/useAppTranslations';

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

  const ticketIcons: Record<TicketType, StaticImageData> = {
    bronze: icons.bronzeTicket,
    silver: icons.silverTicket,
    gold: icons.goldenTicket,
    platinum: icons.platinumTicket,
    diamond: icons.diamondTicket,
  };

  const handleBuyButtonClick = (ticket: MarketTicket, count: number, price: MarketPrice) => {
    setIsOpen(true);
    setSelectedTicket({ ticket, count, price });
  };

  const handleCardClick = (ticket: MarketTicket) => {
    if (!ticket.isAvailable) return;
    const count = getCount(ticket.id);
    const price = { ...ticket.prices[0], amount: ticket.prices[0].amount * count };
    setIsOpen(true);
    setSelectedTicket({ ticket, count, price });
  };

  const handleBuy = async () => {
    if (!selectedTicket) return;
    try {
      await buyTicket({
        ticketId: selectedTicket.ticket.id,
        count: selectedTicket.count,
      }).unwrap();
      setSelectedTicket(null);
    } catch (error) {
      console.error('Failed to buy ticket:', error);
    }
  };

  const getCount = (ticketId: string) => ticketCounts[ticketId] || 1;

  const handleCountChange = (ticketId: string, count: number) => {
    setTicketCounts(prev => ({ ...prev, [ticketId]: count }));
  };

  return (
    <div>
      <MarketSection
        title={t('tickets')}
        icon={<Tickets />}
        gridClassName="grid-cols-2 gap-4"
        isLoading={isLoading}
      >
        {tickets.map((ticket, index) => {
          const count = getCount(ticket?.id || '');
          const basePrice = ticket?.prices[0]?.amount || 0;
          const totalPrices = ticket ? [{ ...ticket.prices[0], amount: basePrice * count }] : [];

          return (
            <MarketItemCard
              key={ticket?.id || index}
              loading={isLoading}
              name={ticket?.name || ''}
              description={t('purchase tickets to play')}
              prices={totalPrices}
              qualitySelectorProps={{
                value: count,
                onChange: val => handleCountChange(ticket.id, val),
                disabled: !ticket?.isAvailable,
              }}
              icon={
                ticket && (
                  <Image
                    src={ticketIcons[ticket.ticketType as TicketType]}
                    alt="ticket"
                    width={40}
                    height={40}
                  />
                )
              }
              onBuy={price => ticket && handleBuyButtonClick(ticket, count, price)}
              onClick={() => ticket && handleCardClick(ticket)}
              disabled={ticket && !ticket.isAvailable}
            />
          );
        })}
      </MarketSection>

      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        title={selectedTicket?.ticket.name}
        content={
          <div className="text-white/80 text-center flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="p-2 bg-white/5 rounded-lg shrink-0">
                {selectedTicket && (
                  <Image
                    src={ticketIcons[selectedTicket.ticket.ticketType as TicketType]}
                    alt="ticket"
                    width={48}
                    height={48}
                  />
                )}
              </div>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-white font-bold">
                  {selectedTicket?.count}x {selectedTicket?.ticket.name}
                </span>
                <span className="text-xs text-white/60 leading-relaxed">
                  {t('participate in {ticketType} level draws', {
                    ticketType: selectedTicket?.ticket.ticketType,
                  })}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl">
              <span className="text-sm text-white/60 uppercase font-bold tracking-wider">
                {t('total price')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white">{selectedTicket?.price.amount}</span>
                {selectedTicket?.price.type === MarketPriceType.LTC ? (
                  <span className="text-sm text-gold font-bold">{GlobalConstants.coinName}</span>
                ) : (
                  <span className="text-sm font-black text-emerald-400">USDT</span>
                )}
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}
