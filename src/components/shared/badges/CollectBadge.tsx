'use client';
import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { Layers } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export const CollectBadge = ({ ...rest }: BadgeProps) => {
  const t = useAppTranslations();

  return (
    <Badge
      icon={Layers}
      text={t('max time')}
      {...rest}
      className={twMerge('text-gold p-1', rest.className)}
      classNames={{
        ...rest.classNames,
        icon: twMerge('w-3.5 h-3.5', rest.classNames?.icon),
      }}
    />
  );
};
