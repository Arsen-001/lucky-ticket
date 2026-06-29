'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { LuckyPlayerExpiryCard } from '@/components/pages/out-tabs/drawer/lucky-player/LuckyPlayerExpiryCard';
import { MarketBuyModal } from '@/components/pages/tabs/market/MarketBuyModal';
import { StatusIcon } from '@/components/pages/tabs/market/status/StatusIcon';
import { StatusPrivileges } from '@/components/pages/tabs/market/status/StatusPrivileges';
import { SettingsPrivilegeList } from '@/components/pages/out-tabs/drawer/settings/SettingsPrivilegeList';
import { SettingsStatusActionButton } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusActionButton';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { MarketStatusType } from '@/types/enums/market.enums';

export function LuckyPlayerContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading, isError, refetch } = useGetMarketDataQuery();
  const [buyStatus, { isLoading: isBuying }] = useBuyStatusMutation();
  const [buyOpen, setBuyOpen] = useState(false);

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const isLuckyPlayer = me?.isLuckyPlayer ?? false;
  const expiresAt = me?.luckyPlayerExpiresAt;
  const isLoading = isMeLoading || isMarketLoading;

  const luckyPlayerStatus = market?.statuses.find(
    s => s.statusType === MarketStatusType.LUCKY_PLAYER
  );
  const privileges = luckyPlayerStatus?.privileges ?? [];
  const prices = luckyPlayerStatus?.prices ?? [];
  const primaryPrice = prices[0];
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

  const handleBuy = async () => {
    if (!luckyPlayerStatus || !primaryPrice) return;
    try {
      await buyStatus({
        statusId: luckyPlayerStatus.id,
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
        icon={<LuckyPlayerIcon size={96} state={isLuckyPlayer ? 'active' : 'locked'} />}
        iconBare
        title={t('lucky player')}
        statusLabel={statusLabel}
        description={description}
        active={isLuckyPlayer}
        accent="pink"
        loading={isLoading}
      />

      {isLuckyPlayer && expiresAt && <LuckyPlayerExpiryCard expiresAt={expiresAt} />}

      <SettingsPrivilegeList title={t('what you get')} privileges={privileges} percentage={50} />

      {luckyPlayerStatus && primaryPrice && (
        <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
          <SettingsStatusPriceRow prices={prices} label={t('monthly price')} />
          <SettingsStatusActionButton
            variant="pink"
            title={ctaTitle}
            subtitle={ctaSubtitle}
            onClick={() => setBuyOpen(true)}
            disabled={isLoading}
            loading={isBuying}
          />
        </div>
      )}

      {luckyPlayerStatus && primaryPrice && (
        <MarketBuyModal
          open={buyOpen}
          onClose={() => setBuyOpen(false)}
          onConfirm={handleBuy}
          loading={isBuying}
          title={isLuckyPlayer ? t('extend lucky player') : luckyPlayerStatus.name}
          price={primaryPrice}
          priceLabel={isLuckyPlayer ? t('extension price') : undefined}
          confirmText={isLuckyPlayer ? t('extend lucky player') : t('lucky player get')}
          icon={<StatusIcon type={luckyPlayerStatus.statusType} />}
          description={
            <div className="flex flex-col gap-1 text-left">
              <span className="text-white font-bold">{luckyPlayerStatus.name}</span>
              {durationDays && (
                <span className="text-xs text-white/60 leading-relaxed">
                  {isLuckyPlayer
                    ? t('extends by {days} days', { days: durationDays })
                    : t('active for {days} days', { days: durationDays })}
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
              privileges={luckyPlayerStatus.privileges}
              type={luckyPlayerStatus.statusType}
              isSmall
            />
          </div>
        </MarketBuyModal>
      )}
    </div>
  );
}
