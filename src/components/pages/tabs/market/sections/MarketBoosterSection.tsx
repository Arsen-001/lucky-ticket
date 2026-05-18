'use client';

import { Cpu, MemoryStick, Timer, Zap } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyBoosterMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedItem } from '@/components/pages/tabs/market/MarketView';
import { BoosterIcon } from '@/components/shared/icons/BoosterIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useUnlockedTiers } from '@/hooks/useUnlockedTiers';
import type { InventoryBoosterDuration } from '@/types/interfaces/inventory.interfaces';
import type { MarketBooster, MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketBoosterSectionProps {
  boosters: MarketBooster[];
  onSelect: (item: MarketSelectedItem) => void;
  onBuy: (item: MarketSelectedItem, price: MarketPrice) => void;
}

export function MarketBoosterSection({ boosters, onSelect, onBuy }: MarketBoosterSectionProps) {
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
        const cardIcon: ReactNode = (
          <BoosterIcon type={booster.type} tier={booster.quality} size={144} />
        );
        const modalIcon: ReactNode = (
          <BoosterIcon type={booster.type} tier={booster.quality} size={140} />
        );
        const description = `+${booster.effectPct}% · ${t('duration hours', { n: booster.durationHours })}`;
        const item: MarketSelectedItem = {
          id: booster.id,
          name: booster.name,
          description,
          iconNode: modalIcon,
          prices: booster.prices,
          isNew: booster.isNew,
          discountPct: booster.discountPct,
          accent: booster.quality,
          meta: (
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-white/55">
              <span className="inline-flex items-center gap-1">
                <TypeIcon size={12} strokeWidth={2.4} />+{booster.effectPct}%
              </span>
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Timer size={12} strokeWidth={2.4} />
                {t('duration hours', { n: booster.durationHours })}
              </span>
              {booster.count > 1 && (
                <span className="tabular-nums" style={{ color: accentVar }}>
                  ×{booster.count}
                </span>
              )}
            </div>
          ),
          mutate: price =>
            buyBooster({
              boosterId: booster.id,
              boosterType: booster.type,
              quality: booster.quality,
              effectPct: booster.effectPct,
              durationHours: booster.durationHours as InventoryBoosterDuration,
              count: booster.count,
              price,
            }).unwrap(),
        };
        return (
          <MarketUniversalCard
            key={booster.id}
            name={booster.name}
            accent={booster.quality}
            isNew={booster.isNew}
            discountPct={booster.discountPct}
            disabled={isLocked}
            iconStage={cardIcon}
            iconStageClassName="h-40"
            prices={booster.prices}
            onClick={() => onSelect(item)}
            onBuy={price => onBuy(item, price)}
          />
        );
      })}
    </MarketSectionGrid>
  );
}
