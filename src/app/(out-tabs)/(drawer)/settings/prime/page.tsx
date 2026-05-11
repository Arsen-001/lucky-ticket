'use client';

import { Crown } from 'lucide-react';
import { useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { SettingsPrivilegeList } from '@/components/pages/out-tabs/drawer/settings/SettingsPrivilegeList';
import { SettingsStatusCTA } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusCTA';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketStatusType } from '@/types/enums/market.enums';

export default function PrimeSettingsPage() {
  const t = useAppTranslations();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading } = useGetMarketDataQuery();

  const isPrime = me?.isPrime ?? false;
  const isLoading = isMeLoading || isMarketLoading;

  const primeStatus = market?.statuses.find(s => s.statusType === MarketStatusType.PRIME);
  const privileges = primeStatus?.privileges ?? [];
  const prices = primeStatus?.prices ?? [];
  const durationDays = primeStatus?.durationDays;

  const statusLabel = isPrime ? t('active') : t('inactive');
  const description = isPrime
    ? durationDays
      ? t('prime active description {days}', { days: durationDays })
      : t('prime active short description')
    : t('prime inactive description');

  const ctaTitle = isPrime ? t('extend prime') : t('prime get');
  const ctaSubtitle = durationDays
    ? t('grants {days} days of perks', { days: durationDays })
    : undefined;

  return (
    <div className="flex flex-col gap-5">
      <SettingsStatusHero
        icon={<Crown size={36} className="text-electric-pink" strokeWidth={2.2} />}
        title={t('prime')}
        statusLabel={statusLabel}
        description={description}
        active={isPrime}
        accent="pink"
        loading={isLoading}
      />

      <SettingsPrivilegeList title={t('what you get')} privileges={privileges} percentage={50} />

      <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
        <SettingsStatusPriceRow prices={prices} label={t('starting price')} />
        <SettingsStatusCTA href={routes.market('status')} title={ctaTitle} subtitle={ctaSubtitle} />
      </div>
    </div>
  );
}
