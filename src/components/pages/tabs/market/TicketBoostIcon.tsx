import { TicketBoostType } from '@/types/enums/market.enums';
import { Gauge, LucideIcon, type LucideProps, TimerReset } from 'lucide-react';

export interface TicketBoostIconProps extends LucideProps {
  type?: TicketBoostType;
}

export function TicketBoostIcon({ type, ...props }: TicketBoostIconProps) {
  if (!type) return null;
  const TicketBoostIconMap: Record<TicketBoostType, LucideIcon> = {
    [TicketBoostType.SPEED]: Gauge,
    [TicketBoostType.COLLECT_TIME]: TimerReset,
  };

  const Icon = TicketBoostIconMap[type];
  return Icon ? <Icon {...props} /> : null;
}
