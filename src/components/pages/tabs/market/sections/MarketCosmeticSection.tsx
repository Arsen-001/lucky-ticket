'use client';

import Image from 'next/image';
import { Award, Palette, Sparkles, UserRound } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyCosmeticMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import {
  MarketUniversalCard,
  type MarketAccent,
} from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketCosmeticType } from '@/types/enums/market.enums';
import type { MarketCosmetic } from '@/types/interfaces/market.interfaces';

const TYPE_ICON: Record<MarketCosmeticType, LucideIcon> = {
  [MarketCosmeticType.AVATAR]: UserRound,
  [MarketCosmeticType.AVATAR_FRAME]: UserRound,
  [MarketCosmeticType.BADGE]: Award,
  [MarketCosmeticType.THEME]: Palette,
};

export interface MarketCosmeticSectionProps {
  cosmetics: MarketCosmetic[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketCosmeticSection({ cosmetics, onPurchase }: MarketCosmeticSectionProps) {
  const t = useAppTranslations();
  const [buyCosmetic] = useBuyCosmeticMutation();
  if (!cosmetics.length) return null;

  return (
    <MarketSectionGrid title={t('cosmetics')} icon={Sparkles} accent="var(--color-electric-pink)">
      {cosmetics.map(cosmetic => {
        const accent: MarketAccent = (cosmetic.accent as MarketAccent) ?? 'pink';
        const accentValue = (() => {
          if (accent === 'pink') return 'var(--color-electric-pink)';
          if (accent === 'purple') return 'var(--color-electric-purple)';
          return `var(--color-${accent})`;
        })();
        const isAvatar = cosmetic.cosmeticType === MarketCosmeticType.AVATAR;
        const Icon = TYPE_ICON[cosmetic.cosmeticType];
        const iconNode: ReactNode =
          isAvatar && cosmetic.imageUrl ? (
            <div className="relative h-14 w-14">
              <div
                className="relative h-full w-full overflow-hidden rounded-2xl border"
                style={{
                  borderColor: `color-mix(in srgb, ${accentValue} 70%, transparent)`,
                  boxShadow: `0 0 16px color-mix(in srgb, ${accentValue} 35%, transparent)`,
                }}
              >
                <Image
                  src={cosmetic.imageUrl}
                  alt={cosmetic.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              {cosmetic.avatarLevel !== undefined && (
                <span
                  className="absolute -top-1 -right-1 flex-center min-w-5 h-4 px-1 rounded-full text-[9px] font-extrabold tabular-nums shadow-md text-white z-1"
                  style={{ backgroundColor: accentValue }}
                >
                  L{cosmetic.avatarLevel}
                </span>
              )}
            </div>
          ) : (
            <div
              className="flex-center relative h-14 w-14 rounded-2xl border"
              style={{
                borderColor: `color-mix(in srgb, ${accentValue} 60%, transparent)`,
                backgroundColor: `color-mix(in srgb, ${accentValue} 18%, transparent)`,
                boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentValue} 40%, transparent)`,
              }}
            >
              <Icon size={28} stroke={accentValue} strokeWidth={2.2} />
            </div>
          );

        return (
          <MarketUniversalCard
            key={cosmetic.id}
            name={cosmetic.name}
            description={cosmetic.description}
            accent={accent}
            isNew={cosmetic.isNew}
            discountPct={cosmetic.discountPct}
            prices={cosmetic.prices}
            onBuy={price =>
              onPurchase?.({
                id: cosmetic.id,
                name: cosmetic.name,
                description: cosmetic.description,
                iconNode,
                price,
                mutate: () => buyCosmetic({ cosmeticId: cosmetic.id, price }).unwrap(),
              })
            }
            iconStage={iconNode}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
