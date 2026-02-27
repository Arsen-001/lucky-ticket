'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { WalletOfferCard } from './WalletOfferCard';
import type { ExchangeOffer } from '@/types/interfaces/exchange.interfaces';

interface WalletOffersTabProps {
  offers: ExchangeOffer[];
  isLoading: boolean;
  onExchange?: (offer: ExchangeOffer) => void;
  isExchanging?: boolean;
}

export const WalletOffersList = ({
  offers,
  isLoading,
  onExchange,
  isExchanging,
}: WalletOffersTabProps) => {
  const t = useAppTranslations();

  const content = isLoading ? (Array.from({ length: 3 }) as ExchangeOffer[]) : offers;

  return (
    <div className="flex flex-col gap-2">
      {content.map((offer, index) => (
        <WalletOfferCard
          loading={isLoading}
          key={index}
          offer={offer}
          onExchange={onExchange}
          isExchanging={isExchanging}
        />
      ))}
      {!isLoading && !offers?.length && (
        <div className="p-8 text-center text-gray-400 bg-background-overlay/50 rounded-3xl border-2 border-white/5">
          {t('no available offers')}
        </div>
      )}
    </div>
  );
};
