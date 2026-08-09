'use client';

import { Check, UserPlus, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants, type ActivityTier } from '@/constants/global.constants';
import { formatCompact } from '@/utils/global/number.utils';

export interface ActivityGateBandProps {
  nextTier: ActivityTier;
  activityPoints: number;
  referralsCount: number;
  accent: string;
  className?: string;
}

/**
 * The tier gate as its two halves, side by side.
 *
 * DOCS §5.1 opens a tier on AP **and** invited friends, and the shipped screen
 * states it as one number — which is how a player holding 18,500 AP is told
 * "0 AP to Platinum" while the tier stays shut on three missing friends. Two
 * meters can say "this half is done, that half is not", which is the only
 * honest answer to "why am I still Gold".
 */
export function ActivityGateBand({
  nextTier,
  activityPoints,
  referralsCount,
  accent,
  className,
}: ActivityGateBandProps) {
  const t = useAppTranslations();

  const meters = [
    {
      id: 'ap',
      Icon: Zap,
      label: t('ap'),
      value: activityPoints,
      required: GlobalConstants.apTierThresholds[nextTier],
      format: formatCompact,
    },
    {
      id: 'friends',
      Icon: UserPlus,
      label: t('friends'),
      value: referralsCount,
      required: GlobalConstants.tierReferralRequirements[nextTier],
      format: (n: number) => String(n),
    },
  ].filter(meter => meter.required > 0);

  return (
    <div className={twMerge('flex flex-col gap-2.5 border-t border-white/8 px-4 py-3', className)}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-white/45">
        {t('to {tier}', { tier: t(nextTier) })}
      </span>

      {meters.map(meter => {
        const met = meter.value >= meter.required;
        const percent = Math.min(100, (meter.value / meter.required) * 100);

        return (
          <div key={meter.id} className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5">
              <meter.Icon
                size={13}
                strokeWidth={2.6}
                style={{ color: met ? 'var(--color-success-text)' : accent }}
              />
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-white/55">
                {meter.label}
              </span>
              <span className="ml-auto text-[13px] font-extrabold tabular-nums text-white">
                {meter.format(meter.value)}
                <span className="text-white/35"> / {meter.format(meter.required)}</span>
              </span>
              {met && <Check size={13} strokeWidth={3} className="text-success-text" aria-hidden />}
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{
                  width: `${percent}%`,
                  background: met ? 'var(--color-success-text)' : accent,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
