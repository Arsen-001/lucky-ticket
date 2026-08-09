'use client';

import { Gift, Sparkles, UserRound, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyCosmeticMutation } from '@/api/market.api';
import { useGetMeQuery } from '@/api/me.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { AvatarDailyRewardValue } from '@/components/shared/user-elements/AvatarDailyRewardValue';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketCosmeticType } from '@/types/enums/market.enums';
import type {
  MarketAccent,
  MarketCosmetic,
  MarketPrice,
} from '@/types/interfaces/market.interfaces';
import { applyStatusMarketDiscount, effectiveMarketDiscountPct } from '@/utils/global/market.utils';

export interface MarketCosmeticSectionProps {
  cosmetics: MarketCosmetic[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketCosmeticSection({ cosmetics, onSelect, onBuy }: MarketCosmeticSectionProps) {
  const t = useAppTranslations();
  const [buyCosmetic] = useBuyCosmeticMutation();
  const { data: me } = useGetMeQuery();
  const isLp = me?.isLuckyPlayer ?? false;
  const isVip = me?.isVIP ?? false;
  const discountPct = effectiveMarketDiscountPct(isLp, isVip, me?.statusPerks);

  const avatars = cosmetics.filter(c => c.cosmeticType === MarketCosmeticType.AVATAR);
  if (!avatars.length) return null;

  return (
    <MarketSectionGrid title={t('cosmetics')} icon={Sparkles} accent="var(--color-electric-pink)">
      {avatars.map(avatar => {
        const accent: MarketAccent = (avatar.accent as MarketAccent) ?? 'pink';
        const accentValue = (() => {
          if (accent === 'pink') return 'var(--color-electric-pink)';
          if (accent === 'purple') return 'var(--color-electric-purple)';
          return `var(--color-${accent})`;
        })();
        const renderIcon = (size: number): ReactNode =>
          avatar.imageUrl ? (
            <div className="relative" style={{ width: size, height: size }}>
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl border"
                style={{
                  borderColor: `color-mix(in srgb, ${accentValue} 70%, transparent)`,
                  boxShadow: `0 0 16px color-mix(in srgb, ${accentValue} 35%, transparent)`,
                }}
              >
                {/* Admin-provided URL (Blob/pasted) — plain <img> avoids the next/image host allow-list. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              {avatar.avatarLevel !== undefined && (
                <span
                  className="absolute -bottom-1 -right-1 flex-center min-w-5 h-4 px-1 rounded-full text-[9px] font-extrabold tabular-nums shadow-md text-white z-1"
                  style={{ backgroundColor: accentValue }}
                >
                  L{avatar.avatarLevel}
                </span>
              )}
            </div>
          ) : (
            <div
              className="flex-center relative rounded-2xl border"
              style={{
                width: size,
                height: size,
                borderColor: `color-mix(in srgb, ${accentValue} 60%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${accentValue} 18%, transparent)`,
                boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentValue} 40%, transparent)`,
              }}
            >
              <UserRound size={Math.round(size * 0.5)} stroke={accentValue} strokeWidth={2.2} />
            </div>
          );

        const discountedPrices = applyStatusMarketDiscount(avatar.prices, discountPct);
        const item: MarketSelectedItem = {
          id: avatar.id,
          name: avatar.name,
          description: avatar.description,
          about: t('market avatar purpose'),
          renderIcon,
          prices: discountedPrices,
          remainingSupply: avatar.remainingSupply,
          isNew: avatar.isNew,
          discountPct: avatar.discountPct,
          accent,
          meta:
            avatar.avatarBoost || avatar.avatarDailyReward ? (
              <div className="flex flex-col gap-1.5">
                {avatar.avatarBoost && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white/85">
                    <Zap size={17} style={{ color: accentValue }} strokeWidth={2.4} />
                    {t('avatar boost {pct} {type}', {
                      pct: avatar.avatarBoost.pct,
                      type: t(`avatar boost ${avatar.avatarBoost.type}`),
                    })}
                  </span>
                )}
                {avatar.avatarDailyReward && (
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-white/85">
                    <Gift size={13} style={{ color: accentValue }} strokeWidth={2.4} />
                    {t('avatar daily reward')}
                    {':'}
                    <AvatarDailyRewardValue reward={avatar.avatarDailyReward} />
                  </span>
                )}
              </div>
            ) : undefined,
          mutate: price => buyCosmetic({ cosmeticId: avatar.id, price }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={avatar.id}
            name={avatar.name}
            accent={accent}
            isNew={avatar.isNew}
            discountPct={avatar.discountPct}
            iconStage={renderIcon(139)}
            iconStageClassName="h-40"
            prices={discountedPrices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
