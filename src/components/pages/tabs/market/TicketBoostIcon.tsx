import { TicketBoostType } from '@/types/enums/market.enums';
import { CollectBadge } from '@/components/shared/badges/CollectBadge';
import { SpeedBadge } from '@/components/shared/badges/SpeedBadge';
import { twMerge } from 'tailwind-merge';
import type { BadgeProps } from '@/components/shared/badges/Badge';

export interface TicketBoostIconProps extends BadgeProps {
  type?: TicketBoostType;
}

export function TicketBoostIcon({ type, ...props }: TicketBoostIconProps) {
  if (!type) return null;
  const TicketBoostIconMap = {
    [TicketBoostType.SPEED]: SpeedBadge,
    [TicketBoostType.COLLECT_TIME]: CollectBadge,
  };

  const Icon = TicketBoostIconMap[type];
  return Icon ? (
    <Icon
      {...props}
      hideText
      className={twMerge('p-2', props.className)}
      classNames={{ ...props.classNames, icon: twMerge('w-7 h-7', props.classNames?.icon) }}
    />
  ) : null;
}
