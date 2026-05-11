'use client';

import { Gem } from 'lucide-react';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { SettingsPrivilegeList } from '@/components/pages/out-tabs/drawer/settings/SettingsPrivilegeList';
import { SettingsStatusCTA } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusCTA';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { GlobalConstants } from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketStatusType } from '@/types/enums/market.enums';

export default function VipSettingsPage() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading } = useGetMarketDataQuery();

  const isLoading = isMeLoading || isMarketLoading;
  const vipLevel = me?.vipLevel ?? 0;
  const isVIP = (me?.isVIP ?? false) && vipLevel > 0;
  const isMaxed = vipLevel >= GlobalConstants.maxVipLevel;

  const vipStatus = market?.statuses.find(s => s.statusType === MarketStatusType.VIP);
  const privileges = vipStatus?.privileges ?? [];
  const prices = isVIP
    ? (vipStatus?.upgradePrices ?? vipStatus?.prices ?? [])
    : (vipStatus?.prices ?? []);

  const statusLabel = isVIP ? t('vip level', { level: vipLevel }) : t('inactive');
  const description = isVIP
    ? isMaxed
      ? t('vip maxed description')
      : t('vip active description')
    : t('vip inactive description');

  const ctaTitle = isVIP ? (isMaxed ? t('max level reached') : t('upgrade vip')) : t('unlock vip');
  const ctaSubtitle =
    isVIP && !isMaxed
      ? t('level {from} → {to}', { from: vipLevel, to: vipLevel + 1 })
      : !isVIP
        ? t('permanent')
        : undefined;

  return (
    <div className="flex flex-col gap-5">
      <SettingsStatusHero
        icon={<Gem size={36} className="text-gold" strokeWidth={2.2} />}
        title={isVIP ? t('vip level', { level: vipLevel }) : 'VIP'}
        statusLabel={statusLabel}
        description={description}
        active={isVIP}
        accent="gold"
        loading={isLoading}
      />

      <SettingsPrivilegeList title={t('what you get')} privileges={privileges} percentage={100} />

      {!isMaxed && (
        <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
          <SettingsStatusPriceRow
            prices={prices}
            label={isVIP ? t('upgrade price') : t('unlock price')}
          />
          <SettingsStatusCTA
            href={routes.market('status')}
            title={ctaTitle}
            subtitle={ctaSubtitle}
            variant="gold"
          />
        </div>
      )}
    </div>
  );
}
