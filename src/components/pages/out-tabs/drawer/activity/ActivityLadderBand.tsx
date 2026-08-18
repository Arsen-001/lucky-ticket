'use client';

import { UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Medal } from '@/components/shared/icons/Medal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, activityTierOrder } from '@/constants/global.constants';

export interface ActivityLadderBandProps {
  tierIdx: number;
  className?: string;
}

/**
 * The five-medal ladder as a band of the card — the same strip construction the
 * LC card gives its curve and the jackpot card gives its split.
 *
 * Half the height of the shipped ladder: the current medal grows to 34px rather
 * than 54, which is what forced the 40px gap between the bar and its labels.
 */
export function ActivityLadderBand({ tierIdx, className }: ActivityLadderBandProps) {
  const t = useAppTranslations();

  return (
    <div className={twMerge('border-t border-white/8 px-4 pb-3 pt-3', className)}>
      {/* The strip that used to fill across the medals is gone with the AP
          numbers it measured: a bar creeping towards the next medal against an
          unpublished threshold is a promise nobody can check, and it read as
          "almost there" on a tier that was shut on friends. @see
          TierGateChecklist */}
      <div className="flex">
        {activityTierOrder.map((stopTier, idx) => {
          const stopAccent = `var(--color-${stopTier})`;
          const reached = idx <= tierIdx;
          const isCurrent = idx === tierIdx;
          const friendsNeeded = GlobalConstants.tierReferralRequirements[stopTier];

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
                // No letter-spacing left to give: five columns of a 360px screen
                // are 59px, and "PLATINUM" at this size fills 54 of them.
                className="text-[10px] font-extrabold uppercase leading-none"
                style={{
                  color: isCurrent ? stopAccent : reached ? 'white' : 'rgba(255,255,255,0.42)',
                }}
              >
                {t(stopTier)}
              </span>
              {/* The rung's AP threshold used to print here. It is no longer
                  published (@see ActivityGateBand): the ladder says where the
                  player stands, not the number they are marching at. The
                  friends half stays — it is acted on, not accrued. */}
              {friendsNeeded > 0 && (
                <span
                  className={twMerge(
                    'flex items-center gap-0.5 text-[10.5px] leading-none tabular-nums',
                    isCurrent && 'font-bold'
                  )}
                  style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
                >
                  <UserPlus size={9} strokeWidth={2.5} />
                  {friendsNeeded}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
