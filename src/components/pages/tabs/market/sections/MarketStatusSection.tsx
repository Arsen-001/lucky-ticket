'use client';

import { Crown, Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketItemRequirementType, MarketStatusType } from '@/types/enums/market.enums';
import type { MarketStatus } from '@/types/interfaces/market.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

export interface MarketStatusSectionProps {
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketStatusSection({ onPurchase }: MarketStatusSectionProps) {
  const t = useAppTranslations();
  const { data, isLoading: isMarketLoading } = useGetMarketDataQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [buyStatus] = useBuyStatusMutation();

  const isLoading = isMarketLoading || isMeLoading;
  const statuses = data?.statuses ?? [];
  const userVipLevel = me?.vipLevel ?? 0;

  const getActivePrices = (status: MarketStatus) => {
    const isVIP = status.statusType === MarketStatusType.VIP;
    if (isVIP && userVipLevel > 0 && status.upgradePrices) {
      return status.upgradePrices;
    }
    return status.prices;
  };

  if (!isLoading && !statuses.length) return null;

  return (
    <MarketSectionGrid title={t('statuses')} icon={Crown} accent="var(--color-gold)">
      {statuses.map(status => {
        const isVIP = status.statusType === MarketStatusType.VIP;
        const accent = isVIP ? 'gold' : 'pink';
        const accentVar = isVIP ? 'var(--color-gold)' : 'var(--color-electric-pink)';
        const Icon = isVIP ? Crown : Gem;
        const activePrices = getActivePrices(status);

        const activityRequirement = !isVIP
          ? status.requirements?.find(r => r.type === MarketItemRequirementType.ACTIVITY_POINTS)
          : undefined;
        const meetsRequirements =
          !activityRequirement || (me?.activityPoints || 0) >= activityRequirement.count;
        const isDisabled = !isVIP && !meetsRequirements;

        const durationLabel = isVIP
          ? userVipLevel > 0
            ? t('level {from} → {to}', { from: userVipLevel, to: userVipLevel + 1 })
            : t('permanent')
          : t('active for {days} days', { days: status.durationDays });

        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
              boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
            }}
          >
            <Icon size={28} stroke={accentVar} strokeWidth={2.2} />
          </div>
        );

        return (
          <MarketUniversalCard
            key={status.id}
            name={status.name}
            accent={accent}
            isNew={status.isNew}
            prices={activePrices}
            disabled={isDisabled}
            onBuy={price =>
              onPurchase?.({
                id: status.id,
                name: status.name,
                description: durationLabel,
                iconNode,
                price,
                mutate: () => buyStatus({ statusId: status.id, priceType: price.type }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              <div className="flex flex-col gap-1">
                <span className="text-white/55 text-[10px] font-bold uppercase tracking-wider">
                  {durationLabel}
                </span>
                <ul className="text-white/55 flex flex-col gap-0.5 text-[10px]">
                  {status.privileges.slice(0, 3).map((privilege, idx) => (
                    <li key={idx} className="line-clamp-1">
                      · {t(privilege as MessageIds, { percentage: isVIP ? 100 : 50 })}
                    </li>
                  ))}
                </ul>
                {!isVIP && !meetsRequirements && activityRequirement && (
                  <span className="text-error text-[10px] font-bold">
                    {t('needs {count} activity points', {
                      count: activityRequirement.count,
                      current: me?.activityPoints || 0,
                    })}
                  </span>
                )}
              </div>
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
