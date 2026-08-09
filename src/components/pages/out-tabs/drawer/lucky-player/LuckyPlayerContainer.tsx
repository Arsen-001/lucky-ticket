'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { LuckyPlayerExpiryCard } from '@/components/pages/out-tabs/drawer/lucky-player/LuckyPlayerExpiryCard';
import { MarketBuyModal } from '@/components/pages/tabs/market/MarketBuyModal';
import { StatusIcon } from '@/components/pages/tabs/market/status/StatusIcon';
import { StatusPerkList } from '@/components/pages/tabs/market/status/StatusPerkList';
import { SettingsStatusActionButton } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusActionButton';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { MarketPriceType, MarketStatusType } from '@/types/enums/market.enums';
import { buildStatusPerkRows } from '@/utils/global/status-perks.utils';

export function LuckyPlayerContainer() {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const { data: market, isLoading: isMarketLoading, isError, refetch } = useGetMarketDataQuery();
  const [buyStatus, { isLoading: isBuying }] = useBuyStatusMutation();
  const [buyOpen, setBuyOpen] = useState(false);
  const [priceType, setPriceType] = useState<MarketPriceType | undefined>();

  if (isError) return <QueryErrorState onRetry={() => refetch()} />;

  const isLuckyPlayer = me?.isLuckyPlayer ?? false;
  const expiresAt = me?.luckyPlayerExpiresAt;
  const isLoading = isMeLoading || isMarketLoading;

  const luckyPlayerStatus = market?.statuses.find(
    s => s.statusType === MarketStatusType.LUCKY_PLAYER
  );
  // The perk rows come from the live admin config the backend ships with the
  // listing, never from the catalog's frozen `privileges` copy — see
  // `buildStatusPerkRows`. No perks in the payload → no list, rather than a
  // stale one.
  const perkRows = luckyPlayerStatus?.perks
    ? buildStatusPerkRows(
        luckyPlayerStatus.perks,
        luckyPlayerStatus.perkBase,
        t,
        luckyPlayerStatus.dailyGift
      )
    : [];
  const prices = luckyPlayerStatus?.prices ?? [];
  // The catalog quotes LC and Lucky Stars; the page used to charge `prices[0]`
  // — always LC — so the Stars price was decoration a player could not act on.
  // The chips are now the picker and this is what the modal charges.
  const primaryPrice = prices.find(p => p.type === priceType) ?? prices[0];
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

      <StatusPerkList title={t('what you get')} rows={perkRows} />

      {luckyPlayerStatus && primaryPrice && (
        <div className="bg-purple-gradient flex flex-col gap-4 rounded-2xl p-4">
          <SettingsStatusPriceRow
            prices={prices}
            // Lucky Player's length is an admin setting (7 days in production),
            // so a hardcoded "monthly price" was the same class of lie as the
            // perk list: a label that stopped matching the config.
            label={
              durationDays ? t('price for {days} days', { days: durationDays }) : t('monthly price')
            }
            selectedType={primaryPrice?.type}
            onSelect={price => setPriceType(price.type)}
          />
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
          {perkRows.length > 0 && (
            <div className="flex flex-col gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-left px-1">
                {t('included privileges')}
              </span>
              <StatusPerkList rows={perkRows} isSmall />
            </div>
          )}
        </MarketBuyModal>
      )}
    </div>
  );
}
