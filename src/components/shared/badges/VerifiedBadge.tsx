'use client';
import { Lock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import type { BadgeProps } from '@/components/shared/badges/Badge';
import '@/styles/components/profile.css';

export const VerifiedBadge = ({ className, classNames, hideText, locked, ...rest }: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <div
      {...rest}
      className={twMerge(
        'tier-badge',
        locked ? 'tier-badge--locked' : 'tier-badge--verified',
        className
      )}
    >
      <VerifiedSparkleIcon size={14} className={classNames?.icon} />
      {!hideText && <span className={classNames?.text}>{t('verified')}</span>}
      {locked && <Lock size={10} strokeWidth={3} className="tier-badge-lock" />}
    </div>
  );
};
