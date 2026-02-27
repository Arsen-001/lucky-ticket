'use client';
import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { CircleGauge } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export const BoostBadge = ({ ...rest }: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <Badge
      icon={CircleGauge}
      text={t('speed')}
      {...rest}
      className={twMerge('text-gold p-1', rest.className)}
      classNames={{
        icon: 'w-3.5 h-3.5',
      }}
    />
  );
};
