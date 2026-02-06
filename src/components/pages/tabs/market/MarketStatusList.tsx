'use client';

import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Check, Crown, ShieldCheck } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';

export function MarketStatusList() {
  const { data, isLoading: isMarketLoading } = useGetMarketDataQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [buyStatus] = useBuyStatusMutation();
  const t = useAppTranslations();

  const isLoading = isMarketLoading || isMeLoading;
  const statuses = isLoading ? new Array(2).fill({}) : data?.statuses || [];

  return (
    <div className="flex flex-col gap-4">
      {statuses.map((status, index) => {
        const isVip = status.statusType === 'vip';
        const meetsRequirements =
          !isVip || (me?.activityPoints || 0) >= (status.requirements?.minActivityPoints || 0);

        return (
          <MarketItemCard
            key={status.id || index}
            isLoading={isLoading}
            title={t(status.statusType)}
            description={`${status.durationInDays} ${t('days')}`}
            price={status.price}
            currency={status.priceCurrency}
            iconComponent={
              isVip ? (
                <Crown className="w-8 h-8 text-yellow-400" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-orange" />
              )
            }
            onBuy={() => buyStatus(status.id)}
            disabled={!meetsRequirements}
          >
            <div className="flex flex-col gap-1 my-2">
              {status.benefits?.map((benefit: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                  <Check className="w-3 h-3 mt-0.5 text-green-500 shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
              {!meetsRequirements && (
                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
                  {t('requires')} {status.requirements?.minActivityPoints} {t('activity points')}
                </div>
              )}
            </div>
          </MarketItemCard>
        );
      })}
    </div>
  );
}
