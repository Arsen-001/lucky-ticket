'use client';

import { Cpu, MemoryStick } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyChipMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketChip } from '@/types/interfaces/market.interfaces';

export interface MarketChipSectionProps {
  chips: MarketChip[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketChipSection({ chips, onPurchase }: MarketChipSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyChip] = useBuyChipMutation();
  if (!chips.length) return null;

  return (
    <MarketSectionGrid title={t('chips')}>
      {chips.map(chip => {
        const accentVar = `var(--color-${chip.quality})`;
        const Icon = chip.type === 'speed' ? Cpu : MemoryStick;
        const isLocked = !isTierUnlocked(chip.quality);
        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
              boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
            }}
          >
            <Icon
              size={28}
              stroke={accentVar}
              fill={accentVar}
              fillOpacity={0.32}
              strokeWidth={2.2}
            />
          </div>
        );
        const description = `${t('level x', { n: chip.level })} · +${chip.effectPct.toFixed(1)}%`;
        return (
          <MarketUniversalCard
            key={chip.id}
            name={chip.name}
            accent={chip.quality}
            isNew={chip.isNew}
            discountPct={chip.discountPct}
            prices={chip.prices}
            disabled={isLocked}
            onBuy={price =>
              onPurchase?.({
                id: chip.id,
                name: chip.name,
                description,
                iconNode,
                price,
                mutate: () =>
                  buyChip({
                    chipId: chip.id,
                    chipType: chip.type,
                    quality: chip.quality,
                    level: chip.level,
                    effectPct: chip.effectPct,
                    price,
                  }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55 tabular-nums">
                {description}
              </div>
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
