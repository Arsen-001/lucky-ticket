'use client';

import { Cpu, MemoryStick, Timer, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyBoosterMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { InventoryBoosterDuration } from '@/types/interfaces/inventory.interfaces';
import type { MarketBooster } from '@/types/interfaces/market.interfaces';

export interface MarketBoosterSectionProps {
  boosters: MarketBooster[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketBoosterSection({ boosters, onPurchase }: MarketBoosterSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyBooster] = useBuyBoosterMutation();
  if (!boosters.length) return null;

  return (
    <MarketSectionGrid title={t('boosters')} icon={Zap} accent="var(--color-electric-pink)">
      {boosters.map(booster => {
        const accentVar = `var(--color-${booster.quality})`;
        const TypeIcon = booster.type === 'speed' ? Cpu : MemoryStick;
        const isLocked = !isTierUnlocked(booster.quality);
        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
              boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
            }}
          >
            <Zap
              size={28}
              stroke={accentVar}
              fill={accentVar}
              fillOpacity={0.32}
              strokeWidth={2.2}
            />
          </div>
        );
        const description = `+${booster.effectPct}% · ${t('duration hours', { n: booster.durationHours })}`;
        return (
          <MarketUniversalCard
            key={booster.id}
            name={booster.name}
            accent={booster.quality}
            isNew={booster.isNew}
            discountPct={booster.discountPct}
            prices={booster.prices}
            disabled={isLocked}
            onBuy={price =>
              onPurchase?.({
                id: booster.id,
                name: booster.name,
                description,
                iconNode,
                price,
                mutate: () =>
                  buyBooster({
                    boosterId: booster.id,
                    boosterType: booster.type,
                    quality: booster.quality,
                    effectPct: booster.effectPct,
                    durationHours: booster.durationHours as InventoryBoosterDuration,
                    count: booster.count,
                    price,
                  }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-white/55">
                <span className="inline-flex items-center gap-1">
                  <TypeIcon size={11} strokeWidth={2.4} />+{booster.effectPct}%
                </span>
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Timer size={11} strokeWidth={2.4} />
                  {t('duration hours', { n: booster.durationHours })}
                </span>
                {booster.count > 1 && (
                  <span className="tabular-nums" style={{ color: accentVar }}>
                    ×{booster.count}
                  </span>
                )}
              </div>
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
