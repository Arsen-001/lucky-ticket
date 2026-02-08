'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from './MarketItemCard';
import { MarketSection } from './MarketSection';
import { AlertCircle, Check, CircleStar } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { MarketPrice, MarketStatus } from '@/types/interfaces/market.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
} from '@/types/enums/market.enums';
import { GlobalConstants } from '@/constants/global.constants';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';
import type { MessageIds } from '@/types/types/i18n.types';

export function MarketStatusList() {
  const t = useAppTranslations();
  const { data, isLoading: isMarketLoading } = useGetMarketDataQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [buyStatus, { isLoading: isBuying }] = useBuyStatusMutation();
  const [selectedStatus, setSelectedStatus] = useState<{
    status: MarketStatus;
    price: MarketPrice;
  } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const isLoading = isMarketLoading || isMeLoading;
  const statuses = isLoading ? new Array(2).fill(null) : data?.statuses || [];

  const handleBuyButtonClick = (status: MarketStatus, price: MarketPrice) => {
    setIsOpen(true);
    setSelectedStatus({ status, price });
  };

  const handleCardClick = (status: MarketStatus) => {
    const activityRequirement = status.requirements?.find(
      r => r.type === MarketItemRequirementType.ACTIVITY_POINTS
    );
    const meetsRequirements =
      !activityRequirement || (me?.activityPoints || 0) >= activityRequirement.count;

    if (!meetsRequirements) return;

    setIsOpen(true);
    setSelectedStatus({ status, price: status.prices[0] });
  };

  const handleBuy = async () => {
    if (!selectedStatus) return;
    try {
      await buyStatus({
        statusId: selectedStatus.status.id,
        priceType: selectedStatus.price.type,
      }).unwrap();
      setSelectedStatus(null);
    } catch (error) {
      console.error('Failed to buy status:', error);
    }
  };
  console.log({ selectedStatus });

  return (
    <div className="pb-6">
      <MarketSection
        title={t('statuses')}
        icon={<CircleStar />}
        gridClassName="grid-cols-1 gap-6"
        isLoading={isLoading}
      >
        {statuses.map((status, index) => {
          if (!status) return <MarketItemCard key={index} name="" prices={[]} loading />;

          const isVip = status.statusType === MarketStatusType.VIP;

          const activityRequirement = status.requirements?.find(
            r => r.type === MarketItemRequirementType.ACTIVITY_POINTS
          );
          const meetsRequirements =
            !activityRequirement || (me?.activityPoints || 0) >= activityRequirement.count;

          return (
            <MarketItemCard
              key={status.id}
              name={status.name}
              isNew={status.isNew}
              description={t('active for {days} days', { days: status.durationDays })}
              prices={status.prices}
              icon={
                isVip ? (
                  <VIPBadge
                    className="w-12 h-12"
                    classNames={{ icon: 'min-w-8 min-h-8 p-0' }}
                    hideText
                  />
                ) : (
                  <PrimeBadge
                    className="w-12 h-12"
                    classNames={{ icon: 'min-w-8 min-h-8 p-0' }}
                    hideText
                  />
                )
              }
              onBuy={price => handleBuyButtonClick(status, price)}
              onClick={() => handleCardClick(status)}
              disabled={!meetsRequirements}
            >
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-1 gap-2">
                  {status.privileges.map((privilege, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-white/80">
                      <Check className="w-5 h-5 text-emerald-400" />
                      <div className="flex-1">
                        {privilege && t(privilege, { percentage: isVip ? 100 : 50 })}
                      </div>
                    </div>
                  ))}
                </div>

                {!meetsRequirements && (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-red-400 uppercase">
                        {t('requirement not met')}
                      </span>
                      <span className="text-xs text-red-300/70">
                        {t('needs {count} activity points', {
                          count: activityRequirement?.count,
                          current: me?.activityPoints || 0,
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </MarketItemCard>
          );
        })}
      </MarketSection>

      <ConfirmModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        title={selectedStatus?.status.name}
        content={
          <div className="text-white/80 text-center flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              {selectedStatus?.status.statusType === MarketStatusType.VIP ? (
                <VIPBadge
                  className="w-12 h-12"
                  classNames={{ icon: 'min-w-8 min-h-8 p-0' }}
                  hideText
                />
              ) : (
                <PrimeBadge
                  className="w-12 h-12"
                  classNames={{ icon: 'min-w-8 min-h-8 p-0' }}
                  hideText
                />
              )}
              <div className="flex flex-col gap-1 text-left">
                <span className="text-white font-bold">{selectedStatus?.status.name}</span>
                {selectedStatus?.status.durationDays && (
                  <span className="text-xs text-white/60 leading-relaxed">
                    {t('active for {days} days', {
                      days: selectedStatus?.status.durationDays,
                    })}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-left px-1">
                {t('included privileges')}
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {selectedStatus?.status.privileges.map((privilege, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm text-white/80 overflow-hidden"
                  >
                    <Check className="h-4 w-4 block text-emerald-400" />
                    <span className="flex-1 text-left">
                      {selectedStatus?.status.statusType &&
                        privilege &&
                        t(privilege as MessageIds, {
                          percentage:
                            selectedStatus?.status.statusType === MarketStatusType.VIP ? 100 : 50,
                        })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/5 p-3 px-4 rounded-xl">
              <span className="text-sm text-white/60 uppercase font-bold tracking-wider">
                {t('price')}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-white">{selectedStatus?.price.amount}</span>
                {selectedStatus?.price.type === MarketPriceType.LTC ? (
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
