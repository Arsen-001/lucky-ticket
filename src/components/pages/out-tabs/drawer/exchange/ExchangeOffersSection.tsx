'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useExchangeMutation, useGetExchangeOffersQuery } from '@/api/exchange.api';
import { Tabs } from '@/components/shared/Tabs';
import { ExchangeType } from '@/types/enums/exchnage.enums';
import { ExchangeOffersList } from './ExchangeOffersList';
import { useGetMeQuery } from '@/api/me.api';
import { GlobalConstants } from '@/constants/global.constants';
import { Wallet } from 'lucide-react';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useState } from 'react';
import { ExchangeOffer } from '@/types/interfaces/exchange.interfaces';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';

export const ExchangeOffersSection = () => {
  const t = useAppTranslations();
  const { data: offers = {}, isLoading: isOffersLoading } = useGetExchangeOffersQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [exchange, { isLoading: isExchanging }] = useExchangeMutation();

  const [selectedOffer, setSelectedOffer] = useState<ExchangeOffer | null>(null);

  const handleExchange = async () => {
    if (!selectedOffer) return;

    try {
      await exchange({ offerId: selectedOffer.id }).unwrap();
      setSelectedOffer(null);
    } catch (error) {
      console.error('Exchange failed', error);
    }
  };

  const tabs = [
    {
      key: ExchangeType.LTC_TO_USDT.toString(),
      title: t('ltc to usdt'),
      children: (
        <ExchangeOffersList
          offers={offers[ExchangeType.LTC_TO_USDT] || []}
          isLoading={isOffersLoading}
          onExchange={setSelectedOffer}
          isExchanging={isExchanging}
        />
      ),
    },
    {
      key: ExchangeType.USDT_TO_LTC.toString(),
      title: t('usdt to ltc'),
      children: (
        <ExchangeOffersList
          offers={offers[ExchangeType.USDT_TO_LTC] || []}
          isLoading={isOffersLoading}
          onExchange={setSelectedOffer}
          isExchanging={isExchanging}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col  p-5 bg-purple-gradient rounded-2xl">
      <div className="bg-background-overlay rounded-xl flex items-center gap-3 py-3 px-4">
        <div className="flex items-center gap-1 text-gray-400">
          <Wallet size={16} /> <span className="h-5">{t('balance')}</span>
        </div>
        <SkeletonSuspense
          loading={isMeLoading}
          skeleton={<Skeleton textSize="base" className="w-16" />}
        >
          <div className="h-5 text-gold font-semibold">
            {me?.coins} {GlobalConstants.coinName}
          </div>
        </SkeletonSuspense>
      </div>
      <Tabs className="mt-6" items={tabs} />
      <ConfirmModal
        open={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        onConfirm={handleExchange}
        title={t('exchange')}
        content={<p className="text-white/70">{t('confirm exchange description')}</p>}
        loading={isExchanging}
      />
    </div>
  );
};
