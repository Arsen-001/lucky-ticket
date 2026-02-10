'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { MarketItemCard } from '../MarketItemCard';
import { MarketSection } from '../MarketSection';
import { AlertCircle, CircleStar } from 'lucide-react';
import { useGetMeQuery } from '@/api/me.api';
import { MarketPrice, MarketStatus } from '@/types/interfaces/market.interfaces';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketItemRequirementType, MarketPriceType } from '@/types/enums/market.enums';
import { MarketBuyModal } from '../MarketBuyModal';
import { StatusIcon } from './StatusIcon';
import { StatusPrivileges } from './StatusPrivileges';

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
    setSelectedStatus({ status, price });
    setIsOpen(true);
  };

  const handleCardClick = (status: MarketStatus) => {
    const activityRequirement = status.requirements?.find(
      r => r.type === MarketItemRequirementType.ACTIVITY_POINTS
    );
    const meetsRequirements =
      !activityRequirement || (me?.activityPoints || 0) >= activityRequirement.count;

    if (!meetsRequirements) return;

    setSelectedStatus({ status, price: status.prices[0] });
    setIsOpen(true);
  };

  const handleBuy = async () => {
    if (!selectedStatus) return;
    try {
      await buyStatus({
        statusId: selectedStatus.status.id,
        priceType: selectedStatus.price.type,
      }).unwrap();
      setSelectedStatus(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to buy status:', error);
    }
  };

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
              icon={<StatusIcon type={status.statusType} />}
              onBuy={price => handleBuyButtonClick(status, price)}
              onClick={() => handleCardClick(status)}
              disabled={!meetsRequirements}
            >
              <div className="flex flex-col gap-3">
                <StatusPrivileges privileges={status.privileges} type={status.statusType} />

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

      <MarketBuyModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleBuy}
        loading={isBuying}
        title={selectedStatus?.status.name}
        price={selectedStatus?.price || { amount: 0, type: MarketPriceType.LTC }}
        icon={<StatusIcon type={selectedStatus?.status.statusType} />}
        description={
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
        }
      >
        <div className="flex flex-col gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
          <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-left px-1">
            {t('included privileges')}
          </span>
          <StatusPrivileges
            privileges={selectedStatus?.status.privileges || []}
            type={selectedStatus?.status.statusType}
            isSmall
          />
        </div>
      </MarketBuyModal>
    </div>
  );
}
