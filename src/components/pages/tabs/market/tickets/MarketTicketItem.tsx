import { MarketItemCard } from '../MarketItemCard';
import { MarketPrice, MarketTicket } from '@/types/interfaces/market.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';

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

  const totalPrices = ticket.prices.map(price => ({ ...price, amount: price.amount * count }));

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
      icon={<TicketOverlap type={ticket.ticketType} height={70} />}
      onBuy={onBuy}
      onClick={onClick}
      disabled={!ticket.isAvailable}
    />
  );
};
