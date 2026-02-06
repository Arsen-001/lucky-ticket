import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { Gem } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const VIPBadge = ({ ...rest }: BadgeProps) => {
  return (
    <Badge
      icon={Gem}
      text="VIP"
      {...rest}
      className={twMerge('text-electric-purple uppercase', rest.className)}
    />
  );
};
