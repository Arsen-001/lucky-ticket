'use client';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { BadgeProps } from '@/components/shared/badges/Badge';
import { icons } from '@/constants/icons';
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
      <Image
        src={icons.crown}
        alt=""
        width={14}
        height={14}
        sizes="14px"
        className={twMerge('h-3.5 w-3.5 shrink-0 object-contain', classNames?.icon)}
        aria-hidden
      />
      {!hideText && <span className={classNames?.text}>VIP</span>}
      {level !== undefined && !locked && <span className="tier-badge-level">{level}</span>}
      {locked && <Lock size={10} strokeWidth={3} className="tier-badge-lock" />}
    </div>
  );
};
