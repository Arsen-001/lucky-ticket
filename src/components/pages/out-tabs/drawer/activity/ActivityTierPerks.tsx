'use client';

import { Lock, Unlock } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  activityTierOrder,
  computeActivityTier,
  computeNextTierThreshold,
} from '@/constants/global.constants';

export interface ActivityTierPerksProps {
  activityPoints?: number;
}

export function ActivityTierPerks({ activityPoints = 0 }: ActivityTierPerksProps) {
  const t = useAppTranslations();
  const tier = computeActivityTier(activityPoints);
  const accent = `var(--color-${tier})`;
  const nextThreshold = computeNextTierThreshold(activityPoints);
  const nextTier =
    nextThreshold !== null ? activityTierOrder[activityTierOrder.indexOf(tier) + 1] : null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-base font-extrabold text-white">{t('what your tier unlocks')}</h2>

      <div className="bg-background-overlay flex items-center gap-3 rounded-xl p-3.5">
        <div
          className="flex-center h-9 w-9 shrink-0 rounded-lg"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            color: accent,
          }}
        >
          <Unlock size={17} strokeWidth={2.2} />
        </div>
        <span className="text-white-secondary text-[12px]">
          {t('tier unlocks engines tournaments stakes market', { tier: t(tier) })}
        </span>
      </div>

      {nextTier && (
        <div className="flex items-center gap-3 rounded-xl border border-white/8 p-3.5">
          <div className="flex-center h-9 w-9 shrink-0 rounded-lg bg-white/5 text-white/45">
            <Lock size={16} strokeWidth={2.2} />
          </div>
          <span className="text-white-secondary text-[12px]">
            {t('reach tier to unlock more', { tier: t(nextTier) })}
          </span>
        </div>
      )}
    </section>
  );
}
