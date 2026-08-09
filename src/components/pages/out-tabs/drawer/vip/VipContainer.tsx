'use client';

import { useState } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { MarketBuyModal } from '@/components/pages/tabs/market/MarketBuyModal';
import { StatusIcon } from '@/components/pages/tabs/market/status/StatusIcon';
import { StatusPerkList } from '@/components/pages/tabs/market/status/StatusPerkList';
import { SettingsStatusActionButton } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusActionButton';
import { SettingsStatusHero } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusHero';
import { SettingsStatusPriceRow } from '@/components/pages/out-tabs/drawer/settings/SettingsStatusPriceRow';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useToast } from '@/hooks/useToast';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { MarketPriceType, MarketStatusType } from '@/types/enums/market.enums';
import type { MarketPrice } from '@/types/interfaces/market.interfaces';
import { buildStatusPerkRows, buildVipUpgradeRows } from '@/utils/global/status-perks.utils';

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
  // Perks come from the live per-level ladder the backend ships with the
  // listing (`levelPerks`), never from the catalog's frozen `privileges` copy:
  // every VIP level grants different numbers, and the seeded text quoted a
  // ceiling the config no longer holds. A player who owns level N sees N, and
  // the upgrade block shows only what level N+1 changes.
  const levelPerks = vipStatus?.levelPerks ?? [];
  const currentLevel = levelPerks.find(l => l.level === vipLevel);
  const nextLevel = levelPerks.find(l => l.level === vipLevel + 1);
  const ownedRows = currentLevel
    ? buildStatusPerkRows(currentLevel.perks, vipStatus?.perkBase, t)
    : [];
  // Not a VIP yet: level 1 IS the purchase, so its full list is what's on offer.
  const upgradeRows = buildVipUpgradeRows(currentLevel, nextLevel, vipStatus?.perkBase, t);
  const offerRows = isVIP ? upgradeRows : ownedRows.length ? ownedRows : upgradeRows;
  // Every level has its own price (DOCS §7.4), so an upgrade must quote the row
  // for the NEXT level — the flat `upgradePrices` is only the level-2 step and
  // is kept as a fallback for payloads that predate the ladder. Same resolution
  // order as the market card (`MarketStatusSection`); the two must not disagree.
  const nextLevelPrice = isVIP
    ? vipStatus?.levelPrices?.find(l => l.level === vipLevel + 1)
    : undefined;
  const prices: MarketPrice[] = nextLevelPrice
    ? [
        { type: MarketPriceType.LC, amount: nextLevelPrice.lc },
        { type: MarketPriceType.TELEGRAM_STARS, amount: nextLevelPrice.ls },
      ]
    : isVIP
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

      <StatusPerkList
        // A VIP already owns their rows — "what you get" is the offer, and only
        // a player without the status is being offered anything.
        title={isVIP ? t('vip level', { level: vipLevel }) : t('what you get')}
        rows={isVIP ? ownedRows : offerRows}
      />

      {isVIP && upgradeRows.length > 0 && (
        <StatusPerkList
          title={t('what level {level} adds', { level: vipLevel + 1 })}
          rows={upgradeRows}
        />
      )}

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
          {offerRows.length > 0 && (
            <div className="flex flex-col gap-2.5 bg-white/5 p-3.5 rounded-xl border border-white/5">
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest text-left px-1">
                {isVIP
                  ? t('what level {level} adds', { level: vipLevel + 1 })
                  : t('included privileges')}
              </span>
              <StatusPerkList rows={offerRows} isSmall />
            </div>
          )}
        </MarketBuyModal>
      )}
    </div>
  );
}
