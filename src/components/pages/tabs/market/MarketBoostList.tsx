'use client';

import { useBuyBoostMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { icons } from '@/constants/icons';
import { TicketType } from '@/components/shared/icons/Ticket';

export function MarketBoostList() {
  const { data, isLoading } = useGetMarketDataQuery();
  const [buyBoost] = useBuyBoostMutation();
  const t = useAppTranslations();

  const boosts = isLoading ? new Array(4).fill({}) : data?.boosts || [];

  const getBoostTitle = (type: string, ticketType: TicketType) => {
    const typeStr = type === 'speed' ? t('speed') : t('max time');
    return `${t(ticketType as any)} ${typeStr} x2`;
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {boosts.map((boost, index) => (
        <MarketItemCard
          key={boost.id || index}
          isLoading={isLoading}
          title={getBoostTitle(boost.type, boost.ticketType)}
          description={`${boost.durationInHours} ${t('hours')}`}
          price={boost.price}
          icon={icons.boostUp}
          onBuy={() => buyBoost(boost.id)}
        />
      ))}
    </div>
  );
}
