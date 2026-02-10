import { MarketItemCard } from '../MarketItemCard';
import { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Ticket } from '@/components/shared/icons/Ticket';

interface MarketTicketItemProps {
  ticket: MarketTicket | null;
  isLoading: boolean;
  count: number;
  onCountChange: (count: number) => void;
  onBuy: (price: MarketPrice) => void;
  onClick: () => void;
}

export const MarketTicketItem = ({
  ticket,
  isLoading,
  count,
  onCountChange,
  onBuy,
  onClick,
}: MarketTicketItemProps) => {
  const t = useAppTranslations();

  if (!ticket) {
    return <MarketItemCard loading={isLoading} name="" prices={[]} />;
  }

  const basePrice = ticket.prices[0]?.amount || 0;
  const totalPrices = [{ ...ticket.prices[0], amount: basePrice * count }];

  return (
    <MarketItemCard
      loading={isLoading}
      name={t(ticket.ticketType)}
      description={t('purchase tickets to play')}
      prices={totalPrices}
      qualitySelectorProps={{
        value: count,
        onChange: onCountChange,
        disabled: !ticket.isAvailable,
      }}
      icon={<Ticket type={ticket.ticketType} height={40} />}
      onBuy={onBuy}
      onClick={onClick}
      disabled={!ticket.isAvailable}
    />
  );
};
