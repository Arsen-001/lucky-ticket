'use client';

import { useFormatter } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Crown, Gem } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyStatusMutation, useGetMarketDataQuery } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSavingsRow } from '@/components/pages/tabs/market/sections/MarketSavingsRow';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { MarketItemImage } from '@/components/pages/tabs/market/MarketItemImage';
import { MarketLimitedBadge } from '@/components/pages/tabs/market/MarketLimitedBadge';
import { MarketLockPanel } from '@/components/pages/tabs/market/MarketLockPanel';
import { StatusPerkList } from '@/components/pages/tabs/market/status/StatusPerkList';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { routes, type Route } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  MarketItemRequirementType,
  MarketPriceType,
  MarketStatusType,
} from '@/types/enums/market.enums';
import type { MarketPrice, MarketStatus } from '@/types/interfaces/market.interfaces';
import {
  applyStatusMarketDiscount,
  effectiveMarketDiscountPct,
  marketOfferClosedMessageId,
  marketOfferClosedReason,
} from '@/utils/global/market.utils';
import {
  buildStatusPerkRows,
  buildVipUpgradeRows,
  luckyPlayerCatalogPerks,
} from '@/utils/global/status-perks.utils';

export interface MarketStatusSectionProps {
  /**
   * Draw these instead of the whole catalog — the «Limited» tab passes its own
   * filtered subset. Omitted = every status the storefront sells.
   */
  statuses?: MarketStatus[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketStatusSection({
  statuses: statusesProp,
  onSelect,
  onBuy,
}: MarketStatusSectionProps) {
  const t = useAppTranslations();
  const format = useFormatter();
  const router = useRouter();
  const { data, isLoading: isMarketLoading } = useGetMarketDataQuery();
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();
  const [buyStatus] = useBuyStatusMutation();

  const isLoading = isMarketLoading || isMeLoading;
  const statuses = statusesProp ?? data?.statuses ?? [];
  const userVipLevel = me?.vipLevel ?? 0;

  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;

  const getActivePrices = (status: MarketStatus) => {
    const isVIP = status.statusType === MarketStatusType.VIP;
    const isVipUpgrade = isVIP && userVipLevel > 0;
    // Per-level upgrade price (admin-tunable): the cost to REACH the NEXT level.
    // Falls back to the flat upgradePrices, then the base prices.
    const nextLevelPrice = isVipUpgrade
      ? status.levelPrices?.find(l => l.level === userVipLevel + 1)
      : undefined;
    const rawPrices: MarketPrice[] = nextLevelPrice
      ? [
          { type: MarketPriceType.LC, amount: nextLevelPrice.lc },
          { type: MarketPriceType.TELEGRAM_STARS, amount: nextLevelPrice.ls },
        ]
      : isVipUpgrade && status.upgradePrices
        ? status.upgradePrices
        : status.prices;
    // Status discount only applies to OTHER statuses — never to LP/VIP when
    // buying the same tier. VIP upgrades take no discount at all (the backend
    // charges the upgrade price un-discounted — keep the shown price in sync).
    const lpEligible = !isVipUpgrade && isLp && status.statusType !== MarketStatusType.LUCKY_PLAYER;
    const vipEligible = !isVipUpgrade && isVip && status.statusType !== MarketStatusType.VIP;
    // The discount that applies is the user's own effective status perk (VIP
    // supersedes LP); eligibility only decides WHETHER it applies (no self-discount).
    const pct =
      lpEligible || vipEligible ? effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks) : 0;
    return applyStatusMarketDiscount(rawPrices, pct);
  };

  /**
   * What this card is selling, in perks: Lucky Player's flat set, or — for VIP —
   * the level the player would REACH (their next rung, or level 1 when they have
   * no VIP), showing only what that rung changes. Mirrors the status page, which
   * the card links to; the two must not tell different stories.
   */
  const perkRowsFor = (status: MarketStatus) => {
    if (status.statusType === MarketStatusType.VIP) {
      const levels = status.levelPerks ?? [];
      return buildVipUpgradeRows(
        levels.find(l => l.level === userVipLevel),
        levels.find(l => l.level === userVipLevel + 1),
        status.perkBase,
        t
      );
    }
    if (!status.perks) return [];
    // Lucky Player's engine-speed perk is a multiplier — the card must quote it
    // the same way its own screen does (@see luckyPlayerCatalogPerks).
    const perks =
      status.statusType === MarketStatusType.LUCKY_PLAYER
        ? luckyPlayerCatalogPerks(status.perks)
        : status.perks;
    return buildStatusPerkRows(perks, status.perkBase, t, status.dailyGift);
  };

  // A caller-supplied list is already the answer — an empty one means "none of
  // these here", not "still loading".
  if ((statusesProp !== undefined || !isLoading) && !statuses.length) return null;

  return (
    // `count` is pinned to the statuses: the savings receipt is a child of the
    // grid (it spans both columns) and would otherwise be counted as a third
    // thing on sale.
    <MarketSectionGrid
      title={t('statuses')}
      icon={Crown}
      accent="var(--color-gold)"
      count={statuses.length}
    >
      <MarketSavingsRow className="col-span-2" />
      {statuses.map(status => {
        const isVIP = status.statusType === MarketStatusType.VIP;
        const isLuckyPlayer = status.statusType === MarketStatusType.LUCKY_PLAYER;
        const accent = isVIP ? 'gold' : 'pink';
        const accentVar = isVIP ? 'var(--color-gold)' : 'var(--color-electric-pink)';
        const activePrices = getActivePrices(status);

        // Ownership / re-purchase rules:
        //  • Lucky Player → one-time monthly subscription. While `isLuckyPlayer`
        //    is true the card is locked; expires automatically on the backend.
        //  • VIP → can only be upgraded. At max VIP level the card is locked.
        const lpActive = isLuckyPlayer && (me?.isLuckyPlayer ?? false);
        const vipMaxLevel = status.maxLevel ?? GlobalConstants.maxVipLevel;
        const vipAtMax = isVIP && userVipLevel >= vipMaxLevel;
        const isOwned = lpActive || vipAtMax;

        const activityRequirement = !isVIP
          ? status.requirements?.find(r => r.type === MarketItemRequirementType.ACTIVITY_POINTS)
          : undefined;
        const meetsRequirements =
          !activityRequirement || (me?.activityPoints || 0) >= activityRequirement.count;
        // The shelf and the clock close a sale as firmly as a gate does — the
        // server refuses both, so the card must stop offering the price.
        const closed = marketOfferClosedReason(status);
        const isDisabled = isOwned || !!closed || (!isVIP && !meetsRequirements);

        const lpExpiry = lpActive ? me?.luckyPlayerExpiresAt : undefined;
        const durationLabel = isVIP
          ? vipAtMax
            ? t('max vip reached')
            : userVipLevel > 0
              ? t('level {from} → {to}', { from: userVipLevel, to: userVipLevel + 1 })
              : t('permanent')
          : lpActive && lpExpiry
            ? t('active until {date}', {
                date: format.dateTime(new Date(lpExpiry), {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }),
              })
            : t('active for {days} days', { days: status.durationDays });

        const ownershipBadge: ReactNode | undefined = lpActive ? (
          <span className="bg-success/20 border-success/40 text-success rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
            {t('active')}
          </span>
        ) : vipAtMax ? (
          <span className="bg-gold/20 border-gold/40 text-gold rounded-full border px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider">
            {t('max')}
          </span>
        ) : undefined;

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
        const isVipUpgrade = isVIP && userVipLevel > 0;
        const item: MarketSelectedItem = {
          id: status.id,
          name: displayName,
          description: durationLabel,
          about: isVIP
            ? t('vip inactive description')
            : isLuckyPlayer
              ? t('lucky player inactive description')
              : undefined,
          locked: isDisabled,
          lockNote: isDisabled ? (
            closed && !isOwned ? (
              <MarketLockPanel note={t(marketOfferClosedMessageId[closed])} />
            ) : lpActive ? (
              <MarketLockPanel note={t('lucky player active')} />
            ) : vipAtMax ? (
              <MarketLockPanel note={t('vip maxed description')} />
            ) : (
              <MarketLockPanel
                note={t('needs {count} activity points', {
                  count: activityRequirement?.count ?? 0,
                  current: me?.activityPoints || 0,
                })}
                action={{ label: t('how to earn ap'), href: routes.activity }}
              />
            )
          ) : undefined,
          renderIcon: (size: number) =>
            status.imageUrl ? (
              <MarketItemImage src={status.imageUrl} alt={status.name} size={size} />
            ) : (
              renderIcon(size)
            ),
          prices: activePrices,
          expiresAt: status.expiresAt,
          remainingSupply: status.remainingSupply,
          isNew: status.isNew,
          accent,
          confirmText: isVipUpgrade ? t('upgrade') : t('buy'),
          meta: (
            <div className="flex flex-col gap-2">
              {/*
                The same LIVE perk rows the status page shows. This card used to
                render `status.privileges` — the frozen i18n key list seeded into
                the catalog — so the storefront kept advertising perks the admin
                config had already zeroed.
              */}
              <StatusPerkList rows={perkRowsFor(status)} isSmall />
              {!isVIP && !meetsRequirements && activityRequirement && (
                <span className="text-error-text text-[11px] font-bold">
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
        // Tapping a status card opens its dedicated page (Lucky Player / VIP)
        // instead of the generic info sheet; the buy buttons still buy in place.
        const statusPage: Route | undefined = isVIP
          ? routes.settings.vip
          : isLuckyPlayer
            ? routes.settings.luckyPlayer
            : undefined;
        return (
          <MarketUniversalCard
            key={status.id}
            name={displayName}
            accent={accent}
            isNew={status.isNew && !isOwned}
            disabled={isDisabled}
            owned={isOwned}
            // An owned status is not gated — it is already the player's. The
            // padlock and the word "Locked" contradicted the ACTIVE badge above it.
            disabledLabel={
              isOwned
                ? vipAtMax
                  ? t('max')
                  : t('active')
                : closed
                  ? t(marketOfferClosedMessageId[closed])
                  : undefined
            }
            badge={
              <>
                {ownershipBadge}
                <MarketLimitedBadge
                  expiresAt={status.expiresAt}
                  remainingSupply={status.remainingSupply}
                />
              </>
            }
            iconStage={renderIcon(75)}
            imageUrl={status.imageUrl}
            iconStageClassName="h-24"
            prices={activePrices}
            onClick={() => (statusPage ? router.push(statusPage) : onSelect(item))}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
