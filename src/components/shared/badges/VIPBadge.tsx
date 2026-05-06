'use client';
import { Gem, Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { BadgeProps } from '@/components/shared/badges/Badge';
import '@/styles/components/profile.css';

interface VIPBadgeProps extends BadgeProps {
  level?: number;
}

export const VIPBadge = ({
  level,
  className,
  classNames,
  hideText,
  locked,
  ...rest
}: VIPBadgeProps) => {
  return (
    <div
      {...rest}
      className={twMerge(
        'tier-badge',
        locked ? 'tier-badge--locked' : 'tier-badge--vip',
        className
      )}
    >
      <Gem size={12} strokeWidth={2.6} className={classNames?.icon} />
      {!hideText && <span className={classNames?.text}>VIP</span>}
      {level !== undefined && !locked && <span className="tier-badge-level">{level}</span>}
      {locked && <Lock size={10} strokeWidth={3} className="tier-badge-lock" />}
    </div>
  );
};
