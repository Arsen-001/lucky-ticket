'use client';

import { useState } from 'react';
import { useBuyBoostMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from '../MarketItemCard';
import { MarketSection } from '../MarketSection';
import { MarketBoost, MarketPrice } from '@/types/interfaces/market.interfaces';
import { MarketPriceType } from '@/types/enums/market.enums';
import { ArrowBigUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TicketBoostIcon } from '../TicketBoostIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketBuyModal } from '../MarketBuyModal';
import { BoostTitle } from './BoostTitle';
import { BoostDescription } from './BoostDescription';
import type { TicketType } from '@/types/types/ticket.types';

const ticketColorMap: Record<TicketType, string> = {
  bronze: 'text-bronze',
  silver: 'text-silver',
  gold: 'text-gold',
  platinum: 'text-platinum',
  diamond: 'text-diamond',
};

export function MarketBoostList() {
  const t = useAppTranslations();
  const { data, isLoading } = useGetMarketDataQuery();
  const [buyBoost, { isLoading: isBuying }] = useBuyBoostMutation();
  const [selectedBoost, setSelectedBoost] = useState<{
    boost: MarketBoost;
    price: MarketPrice;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const boosts = isLoading ? (new Array(4).fill(null) as MarketBoost[]) : data?.boosts || [];

  const handleBuy = async () => {
    if (!selectedBoost) return;
    try {
      await buyBoost({
        boostId: selectedBoost.boost.id,
        priceType: selectedBoost.price.type,
      }).unwrap();
      setSelectedBoost(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to buy boost:', error);
    }
  };

  const handleBuyButtonClick = (boost: MarketBoost, price: MarketPrice) => {
    setSelectedBoost({ boost, price });
    setIsOpen(true);
  };

  const handleCardClick = (boost: MarketBoost) => {
    setSelectedBoost({ boost, price: boost.prices[0] });
    setIsOpen(true);
  };

  return (
    <div>
      <MarketSection
        title={t('boosts')}
        icon={<ArrowBigUp />}
        gridClassName="grid-cols-2"
        isLoading={isLoading}
      >
        {boosts.map((boost, index) => (
          <MarketItemCard
            key={boost?.id || index}
            loading={isLoading}
            name={<BoostTitle boost={boost} />}
            description={<BoostDescription boost={boost} />}
            prices={boost?.prices || []}
            isNew={boost?.isNew}
            disabled={boost ? !boost.isAvailable : false}
            icon={
              <TicketBoostIcon
                type={boost?.type}
                className={boost?.ticketType ? ticketColorMap[boost.ticketType] : undefined}
              />
            }
            onBuy={price => handleBuyButtonClick(boost, price)}
            onClick={() => handleCardClick(boost)}
            classNames={{
              icon: twMerge('[&>svg]:h-8 [&>svg]:w-8 [&>svg]:stroke-2'),
            }}
          />
        ))}
      </MarketSection>
      <MarketBuyModal
        open={!!selectedBoost && isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        disabled={selectedBoost?.boost.isAvailable === false}
        title={<BoostTitle boost={selectedBoost?.boost} size={24} />}
        price={selectedBoost?.price || { amount: 0, type: MarketPriceType.LTC }}
        icon={
          <TicketBoostIcon
            type={selectedBoost?.boost.type}
            className={twMerge(
              selectedBoost?.boost.ticketType
                ? ticketColorMap[selectedBoost.boost.ticketType]
                : undefined,
              'stroke-2'
            )}
          />
        }
        description={<BoostDescription boost={selectedBoost?.boost} />}
      />
    </div>
  );
}
