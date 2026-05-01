import type { TicketType } from '@/types/types/ticket.types';
import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';

export interface StakesTicketStackProps {
  tiers: TicketType[];
  size?: number;
  className?: string;
}

export function StakesTicketStack({ tiers, size = 32, className }: StakesTicketStackProps) {
  const overlap = Math.round(size * 0.4);
  return (
    <div className={twMerge('inline-flex items-center z-0', className)}>
      {tiers.map((tier, i) => (
        <TicketOverlap
          key={`${tier}-${i}`}
          type={tier}
          width={size}
          height={size}
          style={{
            marginLeft: i === 0 ? 0 : -overlap,
            zIndex: i + 1,
            position: 'relative',
          }}
        />
      ))}
    </div>
  );
}
