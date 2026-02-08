'use client';

import { useState } from 'react';
import { useBuyBoostMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { MarketSection } from './MarketSection';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { MarketBoost, MarketPrice } from '@/types/interfaces/market.interfaces';
import { MarketPriceType, TicketBoostType } from '@/types/enums/market.enums';
import { ArrowBigUp } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { TicketBoostIcon } from '@/components/pages/tabs/market/TicketBoostIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { getNameId } from '@/utils/pages/market.utils';
import { GlobalConstants } from '@/constants/global.constants';
import { Ticket } from '@/components/shared/icons/Ticket';

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
    } catch (error) {
      console.error('Failed to buy boost:', error);
    }
  };

  const handleBuyButtonClick = (boost: MarketBoost, price: MarketPrice) => {
    setIsOpen(true);
    setSelectedBoost({ boost, price });
  };

  const handleCardClick = (boost: MarketBoost) => {
    setIsOpen(true);
    setSelectedBoost({ boost, price: boost.prices[0] });
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
            name={
              <>
                <Ticket height={18} className="mr-2 inline" type={boost?.ticketType} />
                {t(getNameId(boost, boost?.ticketType))}
              </>
            }
            description={
              boost && boost.ticketType ? (
                <>
                  {boost.type === TicketBoostType.SPEED
                    ? t(`increases ${boost.ticketType} ticket speed with {percentage}%`, {
                        percentage: boost.boostPercentage,
                      })
                    : t(`increases ${boost.ticketType} ticket collect time with {percentage}%`, {
                        percentage: boost.boostPercentage,
                      })}
                </>
              ) : null
            }
            prices={boost?.prices || []}
            isNew={boost?.isNew}
            icon={<TicketBoostIcon type={boost?.type} />}
            onBuy={price => handleBuyButtonClick(boost, price)}
            onClick={() => handleCardClick(boost)}
            classNames={{
              icon: twMerge('[&>svg]:h-8 [&>svg]:w-8 [&>svg]:stroke-2 [&>svg]:text-pink'),
            }}
          />
        ))}
      </MarketSection>
      <ConfirmModal
        open={!!selectedBoost && isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        title={
          <>
            {selectedBoost?.boost?.ticketType && (
              <Ticket height={24} className="mr-2 inline" type={selectedBoost?.boost?.ticketType} />
            )}
            {t(getNameId(selectedBoost?.boost, selectedBoost?.boost?.ticketType))}
          </>
        }
        content={
          <div className="text-white/80 text-center flex flex-col gap-4 mt-2">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="p-2 bg-white/5 rounded-lg shrink-0">
                <TicketBoostIcon type={selectedBoost?.boost.type} className="text-pink stroke-2" />
              </div>
              <div className="flex flex-col gap-1 text-left">
                <span className="text-sm text-white/60 leading-[1.2]">
                  {selectedBoost?.boost.type === TicketBoostType.SPEED
                    ? selectedBoost?.boost.ticketType &&
                      t(
                        `increases ${selectedBoost?.boost.ticketType} ticket speed with {percentage}%`,
                        {
                          percentage: selectedBoost?.boost.boostPercentage,
                        }
                      )
                    : selectedBoost?.boost.ticketType &&
                      t(
                        `increases ${selectedBoost?.boost.ticketType} ticket collect time with {percentage}%`,
                        {
                          percentage: selectedBoost?.boost.boostPercentage,
                        }
                      )}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl">
              <span className="text-sm text-white/60 uppercase font-bold tracking-wider">
                {t('price')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white">{selectedBoost?.price.amount}</span>
                {selectedBoost?.price.type === MarketPriceType.LTC ? (
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
