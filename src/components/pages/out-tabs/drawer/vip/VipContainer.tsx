'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { MarketBuyModal } from '@/components/pages/tabs/market/MarketBuyModal';
import { StatusIcon } from '@/components/pages/tabs/market/status/StatusIcon';
import { StatusPrivileges } from '@/components/pages/tabs/market/status/StatusPrivileges';
import { SettingsPrivilegeList } from '@/components/pages/out-tabs/drawer/settings/SettingsPrivilegeList';
import { SettingsStatusActionButton } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusActionButton';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { MarketStatusType } from '@/types/enums/market.enums';

export function VipContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading, isError, refetch } = useGetMarketDataQuery();
  const [buyStatus, { isLoading: isBuying }] = useBuyStatusMutation();
  const [buyOpen, setBuyOpen] = useState(false);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const isLoading = isMeLoading || isMarketLoading;
  const vipLevel = me?.vipLevel ?? 0;
  const isVIP = (me?.isVIP ?? false) && vipLevel > 0;
  const isMaxed = vipLevel >= GlobalConstants.maxVipLevel;

  const vipStatus = market?.statuses.find(s => s.statusType === MarketStatusType.VIP);
  const privileges = vipStatus?.privileges ?? [];
  const prices = isVIP
    ? (vipStatus?.upgradePrices ?? vipStatus?.prices ?? [])
    : (vipStatus?.prices ?? []);
  const primaryPrice = prices[0];

  const statusLabel = isVIP ? t('vip level', { level: vipLevel }) : t('inactive');
  const description = isVIP
    ? isMaxed
      ? t('vip maxed description')
      : t('vip active description')
    : t('vip inactive description');

  const ctaTitle = isVIP ? t('upgrade vip') : t('unlock vip');
  const ctaSubtitle = isVIP
    ? t('level {from} → {to}', { from: vipLevel, to: vipLevel + 1 })
    : t('permanent');

  const handleBuy = async () => {
    if (!vipStatus || !primaryPrice) return;
    try {
      await buyStatus({
        statusId: vipStatus.id,
        priceType: primaryPrice.type,
      }).unwrap();
      setBuyOpen(false);
    } catch {
      toast.error(t('action failed'));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <SettingsStatusHero
        icon={<VipIcon size={96} state={isVIP ? 'active' : 'locked'} />}
        iconBare
        statusLabel={statusLabel}
        description={description}
        active={isVIP}
        accent="gold"
        loading={isLoading}
      />

      <SettingsPrivilegeList title={t('what you get')} privileges={privileges} percentage={100} />

      {!isMaxed && vipStatus && primaryPrice && (
        <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
          <SettingsStatusPriceRow
            prices={prices}
            label={isVIP ? t('upgrade price') : t('unlock price')}
          />
          <SettingsStatusActionButton
            variant="gold"
            title={ctaTitle}
            subtitle={ctaSubtitle}
            onClick={() => setBuyOpen(true)}
            disabled={isLoading}
            loading={isBuying}
          />
        </div>
      )}

      {!isMaxed && vipStatus && primaryPrice && (
        <MarketBuyModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          onConfirm={handleBuy}
          loading={isBuying}
          title={isVIP ? t('upgrade vip') : t('unlock vip')}
          price={primaryPrice}
          priceLabel={isVIP ? t('upgrade price') : t('unlock price')}
          confirmText={isVIP ? t('upgrade vip') : t('unlock vip')}
          icon={<StatusIcon type={vipStatus.statusType} />}
          description={
            <div className="flex flex-col gap-1 text-left">
              <span className="text-white font-bold">{vipStatus.name}</span>
              <span className="text-xs text-white/60 leading-relaxed">
                {isVIP
                  ? t('level {from} → {to}', { from: vipLevel, to: vipLevel + 1 })
                  : t('permanent')}
              </span>
            </div>
          }
        >
          <div className="flex flex-col gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-left px-1">
              {t('included privileges')}
            </span>
            <StatusPrivileges
              privileges={vipStatus.privileges}
              type={vipStatus.statusType}
              isSmall
            />
          </div>
        </MarketBuyModal>
      )}
    </div>
  );
}
