'use client';

import { Crown, Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketItemRequirementType, MarketStatusType } from '@/types/enums/market.enums';
import type { MarketPrice, MarketStatus } from '@/types/interfaces/market.interfaces';
import type { MessageIds } from '@/types/types/i18n.types';

export interface MarketStatusSectionProps {
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketStatusSection({ onSelect, onBuy }: MarketStatusSectionProps) {
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
        const isLuckyPlayer = status.statusType === MarketStatusType.LUCKY_PLAYER;
        const accent = isVIP ? 'gold' : 'pink';
        const accentVar = isVIP ? 'var(--color-gold)' : 'var(--color-electric-pink)';
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

        const renderIcon = (size: number): ReactNode => {
          if (isVIP) return <VipIcon size={size} />;
          if (isLuckyPlayer) return <LuckyPlayerIcon size={size} />;
          return (
            <div
              className="flex-center relative rounded-2xl border"
              style={{
                width: size,
                height: size,
                borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
                boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
              }}
            >
              <Gem size={Math.round(size * 0.5)} stroke={accentVar} strokeWidth={2.2} />
            </div>
          );
        };

        const displayName =
          isVIP && userVipLevel > 0
            ? `${status.name} · ${t('vip level', { level: userVipLevel })}`
            : status.name;
        const item: MarketSelectedItem = {
          id: status.id,
          name: displayName,
          description: durationLabel,
          iconNode: renderIcon(160),
          prices: activePrices,
          isNew: status.isNew,
          accent,
          meta: (
            <div className="flex flex-col gap-2">
              <ul className="text-white/70 flex flex-col gap-1 text-[12px]">
                {status.privileges.map((privilege, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span style={{ color: accentVar }} className="mt-0.5">
                      ·
                    </span>
                    <span>{t(privilege as MessageIds, { percentage: isVIP ? 100 : 50 })}</span>
                  </li>
                ))}
              </ul>
              {!isVIP && !meetsRequirements && activityRequirement && (
                <span className="text-error text-[11px] font-bold">
                  {t('needs {count} activity points', {
                    count: activityRequirement.count,
                    current: me?.activityPoints || 0,
                  })}
                </span>
              )}
            </div>
          ),
          mutate: price => buyStatus({ statusId: status.id, priceType: price.type }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={status.id}
            name={displayName}
            accent={accent}
            isNew={status.isNew}
            disabled={isDisabled}
            iconStage={renderIcon(75)}
            iconStageClassName="h-24"
            prices={activePrices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
