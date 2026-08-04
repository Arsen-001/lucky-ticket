import { UserPlus } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, activityTierOrder } from '@/constants/global.constants';
import { Medal } from '@/components/shared/icons/Medal';
import { formatCompact } from '@/utils/global/number.utils';

export interface ActivityTierLadderProps {
  /** Index of the player's current tier in `activityTierOrder`. */
  tierIdx: number;
  /** Fill of the progress bar, already interpolated to the medal positions. */
  fillPercent: number;
  /** CSS colour of the current tier, used for the bar itself. */
  accent: string;
}

/**
 * The five-medal progress ladder.
 *
 * Only ever rendered with real data — see `ActivityTierLadderSkeleton` for why
 * a provisional render is not harmless here.
 */
export function ActivityTierLadder({ tierIdx, fillPercent, accent }: ActivityTierLadderProps) {
  const t = useAppTranslations();

  return (
    <div className="flex flex-col">
      <div className="relative">
        <div className="h-2 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${fillPercent}%`, background: accent }}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 flex items-center">
          {activityTierOrder.map((stopTier, idx) => {
            const stopAccent = `var(--color-${stopTier})`;
            const reached = idx <= tierIdx;
            const isCurrent = idx === tierIdx;
            return (
              <div key={stopTier} className="flex-center flex-1">
                <div
                  className={twMerge(
                    'flex-center rounded-full transition-all',
                    isCurrent ? 'h-[54px] w-[54px]' : 'h-7 w-7'
                  )}
                  style={{
                    background: isCurrent
                      ? `radial-gradient(circle, color-mix(in srgb, ${stopAccent} 45%, transparent) 0%, color-mix(in srgb, ${stopAccent} 12%, transparent) 60%, transparent 100%)`
                      : reached
                        ? `radial-gradient(circle, color-mix(in srgb, ${stopAccent} 22%, transparent) 0%, transparent 70%)`
                        : 'color-mix(in srgb, var(--color-background) 85%, black)',
                    border: !reached
                      ? '1px solid color-mix(in srgb, white 14%, transparent)'
                      : undefined,
                    boxShadow: isCurrent
                      ? `0 0 20px color-mix(in srgb, ${stopAccent} 60%, transparent)`
                      : undefined,
                  }}
                >
                  <Medal
                    type={stopTier}
                    width={isCurrent ? 45 : 22}
                    style={{
                      filter: reached ? undefined : 'grayscale(85%) brightness(0.55)',
                      opacity: reached ? 1 : 0.5,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-10 flex">
        {activityTierOrder.map((stopTier, idx) => {
          const threshold = GlobalConstants.apTierThresholds[stopTier];
          const stopAccent = `var(--color-${stopTier})`;
          const reached = idx <= tierIdx;
          const isCurrent = idx === tierIdx;
          return (
            <div key={stopTier} className="flex flex-1 flex-col items-center gap-0.5">
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
                  'text-[10px] leading-none tabular-nums',
                  isCurrent && 'font-bold'
                )}
                style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
              >
                {threshold === 0 ? '0' : formatCompact(threshold)}
              </span>
              {GlobalConstants.tierReferralRequirements[stopTier] > 0 && (
                <span
                  className={twMerge(
                    'flex items-center gap-0.5 text-[9px] leading-none tabular-nums',
                    isCurrent && 'font-bold'
                  )}
                  style={{ color: isCurrent ? stopAccent : 'rgba(255,255,255,0.42)' }}
                >
                  <UserPlus size={8} strokeWidth={2.5} />
                  {GlobalConstants.tierReferralRequirements[stopTier]}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
