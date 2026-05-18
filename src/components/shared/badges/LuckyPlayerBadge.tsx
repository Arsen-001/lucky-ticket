'use client';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { BadgeProps } from '@/components/shared/badges/Badge';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import '@/styles/components/profile.css';

export const LuckyPlayerBadge = ({
  className,
  classNames,
  hideText,
  locked,
  ...rest
}: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <div
      {...rest}
      className={twMerge(
        'tier-badge',
        locked ? 'tier-badge--locked' : 'tier-badge--lucky-player',
        className
      )}
    >
      <LuckyPlayerIcon
        size={14}
        state={locked ? 'locked' : 'active'}
        animated={false}
        className={classNames?.icon}
      />
      {!hideText && <span className={classNames?.text}>{t('lucky player')}</span>}
      {locked && <Lock size={10} strokeWidth={3} className="tier-badge-lock" />}
    </div>
  );
};
