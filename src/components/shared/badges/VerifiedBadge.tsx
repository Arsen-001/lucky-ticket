'use client';
import { Lock, ShieldCheck } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
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
      <ShieldCheck size={12} strokeWidth={2.6} className={classNames?.icon} />
      {!hideText && <span className={classNames?.text}>{t('verified')}</span>}
      {locked && <Lock size={10} strokeWidth={3} className="tier-badge-lock" />}
    </div>
  );
};
