'use client';

import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { TicketType } from '@/types/types/ticket.types';

export interface ReactorDialProps {
  tier: TicketType;
  capacity: number;
  size?: number;
  className?: string;
}

const DEFAULT_SIZE = 110;

export function ReactorDial({ tier, capacity, size = DEFAULT_SIZE, className }: ReactorDialProps) {
  const ticketWidth = Math.round(size * 0.98);
  const ticketHeight = Math.round(size * 0.78);
  const showOverlap = capacity > 1 || tier === 'bronze';

  return (
    <div className={twMerge('relative shrink-0', className)} style={{ width: size, height: size }}>
      <div className="absolute inset-0 flex-center">
        {showOverlap ? (
          <TicketOverlap type={tier} width={ticketWidth} height={ticketHeight} />
        ) : (
          <Ticket type={tier} width={ticketWidth} height={ticketHeight} />
        )}
      </div>

      {capacity > 1 && (
        <div className="absolute -bottom-0.5 -right-0.5 z-2 min-w-6.5 h-5.5 px-1.5 pt-1 rounded-full bg-pink-gradient border-2 border-background flex-center text-[11px] font-extrabold text-white tabular-nums tracking-wider shadow-[0_4px_10px_rgba(116,61,245,0.45)]">
          ×{capacity}
        </div>
      )}
    </div>
  );
}
