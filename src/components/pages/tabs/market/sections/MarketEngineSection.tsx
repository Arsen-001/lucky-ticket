'use client';

import { Cog } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyEngineMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { MarketEngine } from '@/types/interfaces/market.interfaces';

export interface MarketEngineSectionProps {
  engines: MarketEngine[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketEngineSection({ engines, onPurchase }: MarketEngineSectionProps) {
  const t = useAppTranslations();
  const { isTierUnlocked } = useUnlockedTiers();
  const [buyEngine] = useBuyEngineMutation();
  if (!engines.length) return null;

  return (
    <MarketSectionGrid title={t('engines')} icon={Cog} accent="var(--color-gold)">
      {engines.map(engine => {
        const accentVar = `var(--color-${engine.ticketType})`;
        const isLocked = !isTierUnlocked(engine.ticketType);
        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: `color-mix(in srgb, ${accentVar} 60%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${accentVar} 18%, transparent)`,
              boxShadow: `inset 0 0 16px color-mix(in srgb, ${accentVar} 40%, transparent)`,
            }}
          >
            <Cog size={28} stroke={accentVar} strokeWidth={2.2} />
          </div>
        );
        return (
          <MarketUniversalCard
            key={engine.id}
            name={engine.name}
            accent={engine.ticketType}
            isNew={engine.isNew}
            discountPct={engine.discountPct}
            remainingSupply={engine.remainingSupply}
            prices={engine.prices}
            disabled={isLocked}
            onBuy={price =>
              onPurchase?.({
                id: engine.id,
                name: engine.name,
                description: t('level x', { n: engine.engineLevel }),
                iconNode,
                price,
                mutate: () =>
                  buyEngine({
                    engineId: engine.id,
                    tier: engine.ticketType,
                    engineLevel: engine.engineLevel,
                    price,
                  }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/55">
                {t('level x', { n: engine.engineLevel })}
              </div>
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
