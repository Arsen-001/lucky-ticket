'use client';

import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { SettingsPrivilegeList } from '@/components/pages/out-tabs/drawer/settings/SettingsPrivilegeList';
import { SettingsStatusCTA } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusCTA';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketStatusType } from '@/types/enums/market.enums';

export default function LuckyPlayerSettingsPage() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading } = useGetMarketDataQuery();

  const isLuckyPlayer = me?.isLuckyPlayer ?? false;
  const isLoading = isMeLoading || isMarketLoading;

  const luckyPlayerStatus = market?.statuses.find(
    s => s.statusType === MarketStatusType.LUCKY_PLAYER
  );
  const privileges = luckyPlayerStatus?.privileges ?? [];
  const prices = luckyPlayerStatus?.prices ?? [];
  const durationDays = luckyPlayerStatus?.durationDays;

  const statusLabel = isLuckyPlayer ? t('active') : t('inactive');
  const description = isLuckyPlayer
    ? durationDays
      ? t('lucky player active description {days}', { days: durationDays })
      : t('lucky player active short description')
    : t('lucky player inactive description');

  const ctaTitle = isLuckyPlayer ? t('extend lucky player') : t('lucky player get');
  const ctaSubtitle = durationDays
    ? t('grants {days} days of perks', { days: durationDays })
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      <SettingsStatusHero
        icon={<LuckyPlayerIcon size={44} state={isLuckyPlayer ? 'active' : 'locked'} />}
        title={t('lucky player')}
        statusLabel={statusLabel}
        description={description}
        active={isLuckyPlayer}
        accent="pink"
        loading={isLoading}
      />

      <SettingsPrivilegeList title={t('what you get')} privileges={privileges} percentage={50} />

      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
        <SettingsStatusPriceRow prices={prices} label={t('monthly price')} />
        <SettingsStatusCTA href={routes.market('status')} title={ctaTitle} subtitle={ctaSubtitle} />
      </div>
    </div>
  );
}
