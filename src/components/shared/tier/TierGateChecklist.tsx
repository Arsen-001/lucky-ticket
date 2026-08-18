'use client';

import { Check, Circle } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { GlobalConstants, type ActivityTier } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface TierGateChecklistProps {
  /** Tier being gated — its two requirements are what this lists (DOCS §5.1). */
  tier: ActivityTier;
  activityPoints: number;
  referralsCount: number;
  className?: string;
}

/**
 * The tier gate as a checklist: one line per half, ticked or not.
 *
 * It replaced a pair of progress bars, and the bars are the reason. A tier
 * opens on AP **and** invited friends, so the moment the friends half was met
 * its bar filled and took a green tick — which reads as "tier reached" while
 * the tier is still shut. The AP half made that worse rather than balancing it:
 * its threshold is deliberately unpublished, so its bar was a fraction of a
 * number the player cannot see, and a half-filled unlabelled bar invites
 * exactly the guess we removed the number to avoid.
 *
 * A tick and a plain "keep earning" answer the only question the row can
 * honestly answer — is this half done — and the header above it says the tier
 * is not.
 */
export function TierGateChecklist({
  tier,
  activityPoints,
  referralsCount,
  className,
}: TierGateChecklistProps) {
  const t = useAppTranslations();

  const friendsRequired = GlobalConstants.tierReferralRequirements[tier];
  const apMet = activityPoints >= GlobalConstants.apTierThresholds[tier];

  const rows = [
    // Friends lead: it is the half a player closes by doing something, and the
    // only one whose numbers are published.
    ...(friendsRequired > 0
      ? [
          {
            id: 'friends',
            label: t('friends'),
            value: `${referralsCount} / ${friendsRequired}`,
            met: referralsCount >= friendsRequired,
          },
        ]
      : []),
    {
      id: 'ap',
      label: t('activity points'),
      value: apMet ? t('done') : t('keep earning'),
      met: apMet,
    },
  ];

  return (
    <div className={twMerge('flex flex-col gap-2', className)}>
      {rows.map(row => (
        <div key={row.id} className="flex items-center gap-2">
          {row.met ? (
            <Check size={14} strokeWidth={3} className="text-success-text shrink-0" aria-hidden />
          ) : (
            <Circle size={14} strokeWidth={2.4} className="shrink-0 text-white/30" aria-hidden />
          )}
          <span className="text-[11.5px] font-bold uppercase tracking-wider text-white/55">
            {row.label}
          </span>
          <span
            className={twMerge(
              'ms-auto text-[13px] font-extrabold tabular-nums',
              row.met ? 'text-success-text' : 'text-white'
            )}
          >
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}
