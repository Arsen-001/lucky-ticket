'use client';

import { useEffect, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import { EngineIcon } from '@/components/shared/icons/EngineIcon';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { TicketType } from '@/types/types/ticket.types';

export type ReactorDialVisual = 'ticket' | 'engine';

export interface ReactorDialProps {
  tier: TicketType;
  capacity: number;
  size?: number;
  visual?: ReactorDialVisual;
  className?: string;
}

const DEFAULT_SIZE = 110;
const TAP_DURATION_MS = 380;

export function ReactorDial({
  tier,
  capacity,
  size = DEFAULT_SIZE,
  visual = 'ticket',
  className,
}: ReactorDialProps) {
  const ticketWidth = Math.round(size * 0.98);
  const ticketHeight = Math.round(size * 0.78);
  const showOverlap = capacity > 1 || tier === 'bronze';

  const engineSize = Math.round(size * 1.36);
  const containerSize = visual === 'engine' ? engineSize : size;

  const [tapCount, setTapCount] = useState(0);
  const [tapping, setTapping] = useState(false);
  const tapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimer.current) clearTimeout(tapTimer.current);
    };
  }, []);

  const triggerTap = () => {
    if (visual !== 'engine') return;
    setTapping(true);
    setTapCount(c => c + 1);
    if (tapTimer.current) clearTimeout(tapTimer.current);
    tapTimer.current = setTimeout(() => setTapping(false), TAP_DURATION_MS);
  };

  return (
    <div
      className={twMerge('relative shrink-0', className)}
      style={{ width: containerSize, height: containerSize }}
      onPointerDown={triggerTap}
    >
      <div
        key={tapCount}
        className={twMerge('absolute inset-0 flex-center', tapping && 'engine-tap-pulse')}
      >
        {visual === 'engine' ? (
          <EngineIcon tier={tier} size={engineSize} />
        ) : showOverlap ? (
          <TicketOverlap type={tier} width={ticketWidth} height={ticketHeight} />
        ) : (
          <Ticket type={tier} width={ticketWidth} height={ticketHeight} />
        )}
      </div>

      {capacity > 1 && visual !== 'engine' && (
        <div className="absolute -bottom-0.5 -right-0.5 z-2 min-w-6.5 h-5.5 px-1.5 pt-1 rounded-full bg-pink-gradient border-2 border-background flex-center text-[11px] font-extrabold text-white tabular-nums tracking-wider shadow-[0_4px_10px_rgba(116,61,245,0.45)]">
          ×{capacity}
        </div>
      )}
    </div>
  );
}
