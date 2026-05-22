'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import {
  activityTierOrder,
  computeActivityTier,
  computeNextTierThreshold,
} from '@/constants/global.constants';
import { routes } from '@/constants/routes';
import { Medal } from '@/components/shared/icons/Medal';

export interface ProfileActivityCardProps {
  activityPoints: number;
}

export function ProfileActivityCard({ activityPoints }: ProfileActivityCardProps) {
  const t = useAppTranslations();
  const tier = computeActivityTier(activityPoints);
  const accent = `var(--color-${tier})`;
  const nextThreshold = computeNextTierThreshold(activityPoints);
  const nextTier =
    nextThreshold !== null ? activityTierOrder[activityTierOrder.indexOf(tier) + 1] : null;
  const toNextTier = nextThreshold !== null ? nextThreshold - activityPoints : 0;

  return (
    <Link
      href={routes.activity}
      className="bg-background-overlay flex items-center gap-3 rounded-2xl p-[3px] transition-all active:scale-99"
    >
      <div
        className="flex-center h-20 w-20 shrink-0 rounded-2xl"
        style={{ backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)` }}
      >
        <Medal type={tier} height={72} />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-pink-secondary text-[10px] font-bold uppercase tracking-wider">
          {t('activity points')}
        </span>
        <span className="text-xl font-black leading-tight tabular-nums text-white">
          {activityPoints.toLocaleString()}
        </span>
        <span className="mt-0.5 text-[11px] font-semibold" style={{ color: accent }}>
          {nextTier
            ? t('{n} AP to {tier}', { n: toNextTier.toLocaleString(), tier: t(nextTier) })
            : t('max tier reached')}
        </span>
      </div>
      <ChevronRight size={22} className="shrink-0 text-white/35" />
    </Link>
  );
}
