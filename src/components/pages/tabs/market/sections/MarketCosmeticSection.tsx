'use client';

import Image from 'next/image';
import { Gift, Sparkles, Star, UserRound, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyCosmeticMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { Ticket } from '@/components/shared/icons/Ticket';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketCosmeticType } from '@/types/enums/market.enums';
import type { AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';
import type {
  MarketAccent,
  MarketCosmetic,
  MarketPrice,
} from '@/types/interfaces/market.interfaces';

export interface MarketCosmeticSectionProps {
  cosmetics: MarketCosmetic[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketCosmeticSection({ cosmetics, onSelect, onBuy }: MarketCosmeticSectionProps) {
  const t = useAppTranslations();
  const [buyCosmetic] = useBuyCosmeticMutation();

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
                <Image
                  src={avatar.imageUrl}
                  alt={avatar.name}
                  fill
                  sizes={`${size}px`}
                  className="object-cover"
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

        const item: MarketSelectedItem = {
          id: avatar.id,
          name: avatar.name,
          description: avatar.description,
          iconNode: renderIcon(165),
          prices: avatar.prices,
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
                    {renderDailyReward(avatar.avatarDailyReward)}
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
            prices={avatar.prices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}

function renderDailyReward(reward: AvatarDailyReward): ReactNode {
  if (reward.kind === 'ltc') {
    return (
      <span className="text-gold inline-flex items-center gap-1 tabular-nums">
        +{reward.amount}
        <LcLabel size={12} />
      </span>
    );
  }
  if (reward.kind === 'stars') {
    return (
      <span className="text-gold inline-flex items-center gap-0.5 tabular-nums">
        +{reward.amount}
        <Star size={11} className="fill-gold" />
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 tabular-nums text-white">
      +{reward.amount}
      <Ticket type={reward.tier ?? 'bronze'} width={14} height={14} />
    </span>
  );
}
