'use client';

import { Check, UserPlus } from 'lucide-react';
import { useGetReferralStatsQuery } from '@/api/referral.api';
import { Medal } from '@/components/shared/icons/Medal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useReferralCounts } from '@/hooks/useReferralCounts';
import { GlobalConstants, activityTierOrder } from '@/constants/global.constants';

// Tiers with a non-zero friends requirement — the second half of the tier
// gate (DOCS §5.1). Bronze (0 friends) is not a step.
const LADDER = activityTierOrder.filter(tier => GlobalConstants.tierReferralRequirements[tier] > 0);

/**
 * "Friends unlock tiers" — the invite screen's view of the referral half of
 * the tier gate: one step per tier (2/5/10/20) with the player's progress
 * toward the next one. The AP half lives on the Activity screen.
 */
export function FriendsTierLadderCard() {
  const t = useAppTranslations();
  const { data: stats } = useGetReferralStatsQuery();
  // ALL invited friends, deliberately — not the referral count next door.
  // The tier gate on the backend reads the raw lifetime counter, so drawing
  // the narrower number here would show "7/10 до Gold" to a player who already
  // holds Gold. The two numbers differ, so the card says which one this is.
  const invited = stats?.totalInvited ?? 0;
  const countingDiffers = useReferralCounts().notCounted > 0;

  const next = LADDER.find(tier => invited < GlobalConstants.tierReferralRequirements[tier]);
  const nextReq = next ? GlobalConstants.tierReferralRequirements[next] : null;

  return (
    <section className="bg-background-overlay flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[13px] font-extrabold text-white">{t('friends unlock tiers')}</h2>
        <span className="text-white-secondary text-[11px]">
          {t('each tier also needs its ap threshold')}
        </span>
      </div>

      <div className="flex">
        {LADDER.map(tier => {
          const req = GlobalConstants.tierReferralRequirements[tier];
          const reached = invited >= req;
          const isNext = tier === next;
          const accent = `var(--color-${tier})`;
          return (
            <div key={tier} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="flex-center h-12 w-12 rounded-full"
                style={{
                  background:
                    reached || isNext
                      ? `radial-gradient(circle, color-mix(in srgb, ${accent} 30%, transparent) 0%, transparent 70%)`
                      : undefined,
                  boxShadow: isNext
                    ? `0 0 14px color-mix(in srgb, ${accent} 45%, transparent)`
                    : undefined,
                }}
              >
                <Medal
                  type={tier}
                  width={reached || isNext ? 40 : 32}
                  style={{
                    filter: reached || isNext ? undefined : 'grayscale(85%) brightness(0.55)',
                    opacity: reached || isNext ? 1 : 0.5,
                  }}
                />
              </div>
              <span
                className="flex items-center gap-0.5 text-[10px] font-bold tabular-nums"
                style={{
                  color: reached
                    ? 'var(--color-success)'
                    : isNext
                      ? accent
                      : 'rgba(255,255,255,0.42)',
                }}
              >
                {reached ? (
                  <Check size={10} strokeWidth={3} />
                ) : (
                  <UserPlus size={10} strokeWidth={2.5} />
                )}
                {req}
              </span>
            </div>
          );
        })}
      </div>

      {nextReq !== null && next ? (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full transition-[width] duration-500"
              style={{
                width: `${Math.min(100, Math.round((invited / nextReq) * 100))}%`,
                background: `var(--color-${next})`,
              }}
            />
          </div>
          <span className="text-[11px] font-semibold tabular-nums text-white/55">
            {invited.toLocaleString()} / {nextReq.toLocaleString()} {t('friends')}
          </span>
        </div>
      ) : (
        <span className="text-success text-[11px] font-bold">
          {t('all friend requirements met')}
        </span>
      )}

      {countingDiffers && (
        <span className="text-white-secondary text-[10px] leading-snug">
          {t('tiers count every invited friend')}
        </span>
      )}
    </section>
  );
}
