'use client';

import { UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, activityTierOrder } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';

export interface ActivityLadderBandProps {
  tierIdx: number;
  /** 0–100 progress along the current leg. */
  legPercent: number;
  accent: string;
  className?: string;
}

/** Each tier sits in the centre of one of five equal columns: 10/30/50/70/90 %. */
const columnCenter = (idx: number) => ((idx + 0.5) / activityTierOrder.length) * 100;

/**
 * The five-medal ladder as a band of the card — the same strip construction the
 * LC card gives its curve and the jackpot card gives its split.
 *
 * Half the height of the shipped ladder: the current medal grows to 34px rather
 * than 54, which is what forced the 40px gap between the bar and its labels.
 */
export function ActivityLadderBand({
  tierIdx,
  legPercent,
  accent,
  className,
}: ActivityLadderBandProps) {
  const t = useAppTranslations();

  const current = columnCenter(tierIdx);
  const next = columnCenter(Math.min(tierIdx + 1, activityTierOrder.length - 1));
  const fillPercent = current + (legPercent / 100) * (next - current);

  return (
    <div className={twMerge('border-t border-white/8 px-4 pb-3 pt-3', className)}>
      <div className="relative h-1.5 rounded-full bg-white/8">
        <div
          className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
          style={{ width: `${fillPercent}%`, background: accent }}
        />
      </div>

      <div className="mt-2 flex">
        {activityTierOrder.map((stopTier, idx) => {
          const stopAccent = `var(--color-${stopTier})`;
          const reached = idx <= tierIdx;
          const isCurrent = idx === tierIdx;
          const friendsNeeded = GlobalConstants.tierReferralRequirements[stopTier];
          const threshold = GlobalConstants.apTierThresholds[stopTier];

          return (
            <div key={stopTier} className="flex flex-1 flex-col items-center gap-1">
              {/* Fixed slot: the current medal is 14px taller than the rest, and
                  without it every label under it sat one line lower. */}
              <span className="flex h-9 items-end">
                <Medal
                  type={stopTier}
                  width={isCurrent ? 34 : 20}
                  aria-hidden
                  style={{
                    filter: reached ? undefined : 'grayscale(85%) brightness(0.55)',
                    opacity: reached ? 1 : 0.5,
                  }}
                />
              </span>
              <span
                className="text-[9px] font-extrabold uppercase leading-none tracking-wider"
                style={{
                  color: isCurrent ? stopAccent : reached ? 'white' : 'rgba(255,255,255,0.42)',
                }}
              >
                {t(stopTier)}
              </span>
              <span
                className={twMerge(
                  'flex items-center gap-1 text-[9.5px] leading-none tabular-nums',
                  isCurrent && 'font-bold'
                )}
                style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
              >
                {threshold === 0 ? '0' : formatCompact(threshold)}
                {friendsNeeded > 0 && (
                  <span className="flex items-center gap-0.5">
                    <UserPlus size={8} strokeWidth={2.5} />
                    {friendsNeeded}
                  </span>
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
