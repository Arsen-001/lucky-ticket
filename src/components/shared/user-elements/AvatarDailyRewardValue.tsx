import { Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { formatNumber } from '@/utils/global/number.utils';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { AvatarDailyReward } from '@/types/interfaces/avatars.interfaces';

export interface AvatarDailyRewardValueProps {
  reward: AvatarDailyReward;
  /** Icon size in px; the number scales with the surrounding text. */
  size?: number;
  className?: string;
}

/**
 * The "+N ⭐" part of an avatar's daily reward, in the currency it actually
 * pays out. Shared so the market grid card and the showcase slide can't drift
 * into describing the same reward two different ways.
 */
export function AvatarDailyRewardValue({
  reward,
  size = 12,
  className,
}: AvatarDailyRewardValueProps) {
  if (reward.kind === 'lc') {
    return (
      <span className={twMerge('text-gold inline-flex items-center gap-1 tabular-nums', className)}>
        +{formatNumber(reward.amount)}
        <LcLabel size={size} interactive={false} />
      </span>
    );
  }

  if (reward.kind === 'stars') {
    return (
      <span
        className={twMerge('text-gold inline-flex items-center gap-0.5 tabular-nums', className)}
      >
        +{formatNumber(reward.amount)}
        <Star size={size - 1} className="fill-gold" />
      </span>
    );
  }

  return (
    <span className={twMerge('inline-flex items-center gap-1 tabular-nums text-white', className)}>
      +{formatNumber(reward.amount)}
      <Ticket type={reward.tier ?? 'bronze'} width={size + 2} height={size + 2} />
    </span>
  );
}
