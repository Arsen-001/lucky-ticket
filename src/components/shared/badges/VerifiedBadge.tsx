'use client';
import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { ShieldCheck } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export const VerifiedBadge = ({ ...rest }: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <Badge
      icon={ShieldCheck}
      text={t('verified')}
      {...rest}
      className={twMerge('text-success ', rest.className)}
    />
  );
};
