'use client';

import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { CSSProperties } from 'react';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/reactor-dial.css';

export interface ReactorDialProps {
  tier: TicketType;
  pending: boolean;
  capacity: number;
  size?: number;
  className?: string;
}

const DEFAULT_SIZE = 110;

export function ReactorDial({
  tier,
  pending,
  capacity,
  size = DEFAULT_SIZE,
  className,
}: ReactorDialProps) {
  const STROKE = Math.max(4, Math.round(size * 0.055));
  const CORNER_RADIUS = 15;
  const SIDE = size - STROKE;
  const PERIMETER = 4 * SIDE - 8 * CORNER_RADIUS + 2 * Math.PI * CORNER_RADIUS;
  const ticketWidth = Math.round(size * 0.63);
  const ticketHeight = Math.round(size * 0.44);
  const tierColor = `var(--color-${tier})`;
  const showOverlap = capacity > 1 || tier === 'bronze';

  const progressStyle: CSSProperties = { strokeDashoffset: 0 };

  return (
    <div className={twMerge('relative shrink-0', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="reactor-dial-svg">
        <defs>
          <linearGradient id={`reactor-dial-grad-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-electric-purple)" />
            <stop offset="100%" stopColor={tierColor} />
          </linearGradient>
        </defs>
        <rect
          x={STROKE / 2}
          y={STROKE / 2}
          width={SIDE}
          height={SIDE}
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />
        <rect
          x={STROKE / 2}
          y={STROKE / 2}
          width={SIDE}
          height={SIDE}
          rx={CORNER_RADIUS}
          ry={CORNER_RADIUS}
          fill="none"
          stroke={`url(#reactor-dial-grad-${tier})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={PERIMETER}
          strokeDashoffset={PERIMETER}
          className="reactor-dial-progress"
          data-pending={pending ? 'true' : 'false'}
          style={progressStyle}
        />
      </svg>

      <div
        className="absolute flex-center overflow-hidden"
        style={{ inset: STROKE + 2, borderRadius: CORNER_RADIUS - 4 }}
      >
        <div className="relative flex items-center">
          {showOverlap ? (
            <TicketOverlap type={tier} width={ticketWidth} />
          ) : (
            <Ticket type={tier} width={ticketWidth} height={ticketHeight} />
          )}
        </div>
      </div>

      {capacity > 1 && (
        <div className="absolute -bottom-0.5 -right-0.5 z-2 min-w-6.5 h-5.5 px-1.5 pt-1 rounded-full bg-pink-gradient border-2 border-background flex-center text-[11px] font-extrabold text-white tabular-nums tracking-wider shadow-[0_4px_10px_rgba(116,61,245,0.45)]">
          ×{capacity}
        </div>
      )}
    </div>
  );
}
