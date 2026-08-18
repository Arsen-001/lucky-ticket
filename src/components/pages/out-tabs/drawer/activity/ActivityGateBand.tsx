'use client';

import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TierGateChecklist } from '@/components/shared/tier/TierGateChecklist';
import { type ActivityTier } from '@/constants/global.constants';

export interface ActivityGateBandProps {
  nextTier: ActivityTier;
  activityPoints: number;
  referralsCount: number;
  className?: string;
}

/**
 * The tier gate as its two halves, side by side.
 *
 * DOCS §5.1 opens a tier on AP **and** invited friends, and the shipped screen
 * stated it as one number — which is how a player holding 18,500 AP was told
 * "0 AP to Platinum" while the tier stayed shut on three missing friends.
 *
 * The header says outright that the tier is still closed, because the halves
 * alone did not: two invited friends ticked their row, filled their bar, and
 * the band read as "Silver is yours". @see TierGateChecklist
 */
export function ActivityGateBand({
  nextTier,
  activityPoints,
  referralsCount,
  className,
}: ActivityGateBandProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('flex flex-col gap-2.5 border-t border-white/8 px-4 py-3', className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
        {t('{tier} tier is still locked', { tier: t(nextTier) })}
      </span>

      <TierGateChecklist
        tier={nextTier}
        activityPoints={activityPoints}
        referralsCount={referralsCount}
      />
    </div>
  );
}
