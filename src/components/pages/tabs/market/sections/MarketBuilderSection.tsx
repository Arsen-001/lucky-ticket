'use client';

import { Hammer } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyBuilderMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import { TicketsEnum } from '@/types/enums/ticket.enums';
import type { MarketBuilder } from '@/types/interfaces/market.interfaces';

export interface MarketBuilderSectionProps {
  builders: MarketBuilder[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketBuilderSection({ builders, onPurchase }: MarketBuilderSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyBuilder] = useBuyBuilderMutation();
  if (!builders.length) return null;

  return (
    <MarketSectionGrid title={t('chip builders')}>
      {builders.map(builder => {
        const accentVar = builder.tier
          ? `var(--color-${builder.tier})`
          : 'var(--color-electric-pink)';
        const isLocked = builder.tier ? !isTierUnlocked(builder.tier) : false;
        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
              boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
            }}
          >
            <Hammer size={28} stroke={accentVar} strokeWidth={2.2} />
          </div>
        );
        return (
          <MarketUniversalCard
            key={builder.id}
            name={builder.name}
            accent={builder.tier ?? 'pink'}
            isNew={builder.isNew}
            discountPct={builder.discountPct}
            prices={builder.prices}
            disabled={isLocked}
            onBuy={price =>
              onPurchase?.({
                id: builder.id,
                name: builder.name,
                description: builder.count > 1 ? `×${builder.count}` : undefined,
                iconNode,
                price,
                mutate: () =>
                  buyBuilder({
                    builderId: builder.id,
                    tier: builder.tier ?? TicketsEnum.BRONZE,
                    count: builder.count,
                    price,
                  }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              builder.count > 1 ? (
                <span
                  className="text-[11px] font-extrabold uppercase tracking-wider tabular-nums"
                  style={{ color: accentVar }}
                >
                  ×{builder.count}
                </span>
              ) : undefined
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
