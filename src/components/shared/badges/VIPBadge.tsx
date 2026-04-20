import { Badge, type BadgeProps } from '@/components/shared/badges/Badge';
import { Gem } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

interface VIPBadgeProps extends BadgeProps {
  level?: number;
}

export const VIPBadge = ({ level, ...rest }: VIPBadgeProps) => {
  const text = level !== undefined ? String(level) : 'VIP';

  return (
    <Badge
      icon={Gem}
      text={text}
      {...rest}
      className={twMerge('text-electric-purple uppercase', rest.className)}
    />
  );
};
