'use client';

import { Coins, Crown, Eye, Sword, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useBuyPassMutation } from '@/api/market.api';
import { MarketSectionGrid } from '@/components/pages/tabs/market/MarketSectionGrid';
import { MarketUniversalCard } from '@/components/pages/tabs/market/MarketUniversalCard';
import type { MarketSelectedPurchase } from '@/components/pages/tabs/market/MarketView';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { MarketPassType } from '@/types/enums/market.enums';
import type { MarketPass } from '@/types/interfaces/market.interfaces';

const PASS_ICON: Record<MarketPassType, LucideIcon> = {
  [MarketPassType.AUTO_CLAIM]: Zap,
  [MarketPassType.AD_FREE]: Eye,
  [MarketPassType.LC_BOOST]: Coins,
  [MarketPassType.TOURNAMENT]: Sword,
};

export interface MarketPassSectionProps {
  passes: MarketPass[];
  onPurchase?: (purchase: MarketSelectedPurchase) => void;
}

export function MarketPassSection({ passes, onPurchase }: MarketPassSectionProps) {
  const t = useAppTranslations();
  const [buyPass] = useBuyPassMutation();
  if (!passes.length) return null;

  return (
    <MarketSectionGrid title={t('passes')}>
      {passes.map(pass => {
        const Icon = PASS_ICON[pass.passType] ?? Crown;
        const iconNode: ReactNode = (
          <div
            className="flex-center relative h-14 w-14 rounded-2xl border"
            style={{
              borderColor: 'color-mix(in srgb, var(--color-gold) 60%, transparent)',
              backgroundColor: 'color-mix(in srgb, var(--color-gold) 18%, transparent)',
              boxShadow: 'inset 0 0 16px color-mix(in srgb, var(--color-gold) 40%, transparent)',
            }}
          >
            <Icon size={28} className="text-gold" strokeWidth={2.2} />
          </div>
        );
        return (
          <MarketUniversalCard
            key={pass.id}
            name={pass.name}
            accent="gold"
            isNew={pass.isNew}
            discountPct={pass.discountPct}
            expiresAt={pass.expiresAt}
            prices={pass.prices}
            onBuy={price =>
              onPurchase?.({
                id: pass.id,
                name: pass.name,
                description: t('duration days', { days: pass.durationDays }),
                iconNode,
                price,
                mutate: () => buyPass({ passId: pass.id, price }).unwrap(),
              })
            }
            iconStage={iconNode}
            meta={
              <div className="flex flex-col gap-0.5">
                <span className="text-white/55 text-[10px] font-bold uppercase tracking-wider">
                  {t('duration days', { days: pass.durationDays })}
                </span>
                <ul className="text-white/55 flex flex-col gap-0.5 text-[10px]">
                  {pass.perks.map((perk, idx) => (
                    <li key={idx} className="line-clamp-1">
                      · {perk}
                    </li>
                  ))}
                </ul>
              </div>
            }
          />
        );
      })}
    </MarketSectionGrid>
  );
}
