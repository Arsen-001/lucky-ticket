'use client';

import { Package } from 'lucide-react';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MarketBundle, MarketPrice } from '@/types/interfaces/market.interfaces';

export interface MarketBundleSectionProps {
  bundles: MarketBundle[];
  onBuy?: (bundle: MarketBundle, price: MarketPrice) => void;
}

export function MarketBundleSection({ bundles, onBuy }: MarketBundleSectionProps) {
  const t = useAppTranslations();
  if (!bundles.length) return null;

  return (
    <MarketSectionGrid title={t('bundles')}>
      {bundles.map(bundle => (
        <MarketUniversalCard
          key={bundle.id}
          name={bundle.name}
          description={bundle.description}
          accent="gold"
          isNew={bundle.isNew}
          discountPct={bundle.discountPct}
          expiresAt={bundle.expiresAt}
          prices={bundle.prices}
          onBuy={price => onBuy?.(bundle, price)}
          iconStage={
            <div
              className="flex-center relative h-14 w-14 rounded-2xl border"
              style={{
                borderColor: 'color-mix(in srgb, var(--color-gold) 60%, transparent)',
                backgroundColor: 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
                boxShadow: 'inset 0 0 16px color-mix(in srgb, var(--color-gold) 40%, transparent)',
              }}
            >
              <Package size={28} className="text-gold" strokeWidth={2.2} />
            </div>
          }
          meta={
            <div className="text-white/55 line-clamp-2 text-[10px]">
              {t('contains')}: {bundle.contents.map(c => `${c.amount}× ${c.kind}`).join(' · ')}
            </div>
          }
        />
      ))}
    </MarketSectionGrid>
  );
}
