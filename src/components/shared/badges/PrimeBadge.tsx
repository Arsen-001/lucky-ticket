'use client';
import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { Crown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export const PrimeBadge = ({ ...rest }: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <Badge
      icon={Crown}
      text={t('prime')}
      {...rest}
      className={twMerge('text-orange', rest.className)}
    />
  );
};
