'use client';

import { twMerge } from 'tailwind-merge';
import { TicketOverlap } from '@/components/shared/icons/TicketOverlap';
import { Ticket } from '@/components/shared/icons/Ticket';
import type { CSSProperties } from 'react';
import type { TicketType } from '@/types/types/ticket.types';
import '@/styles/components/reactor-dial.css';

export interface ReactorDialProps {
  tier: TicketType;
  progress: number;
  pending: boolean;
  capacity: number;
  cycleSeconds: number;
  elapsedSeconds: number;
  className?: string;
}

const TIER_GLOW: Record<TicketType, string> = {
  bronze: '#E08A3A',
  silver: '#D8D8D8',
  gold: '#FFD56A',
  platinum: '#E2E0D0',
  diamond: '#3FD9CF',
};

const SIZE = 110;
const STROKE = 6;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const alphaHex = (alpha: number) => {
  const value = Math.max(0, Math.min(255, Math.round(alpha * 255)));
  return value.toString(16).padStart(2, '0');
};

export function ReactorDial({
  tier,
  progress,
  pending,
  capacity,
  cycleSeconds,
  elapsedSeconds,
  className,
}: ReactorDialProps) {
  const tierColor = `var(--color-${tier})`;
  const glow = TIER_GLOW[tier];
  const showOverlap = capacity > 1;

  const innerStyle: CSSProperties = {
    background: pending
      ? `radial-gradient(circle, ${glow}55 0%, color-mix(in srgb, ${tierColor} 25%, transparent) 70%, rgba(0,0,0,0.3) 100%)`
      : `radial-gradient(circle, ${glow}${alphaHex(progress * 0.55)} 0%, color-mix(in srgb, ${tierColor} ${Math.round(progress * 35)}%, transparent) ${50 + progress * 30}%, rgba(0,0,0,0.5) 100%)`,
  };

  const progressStyle: CSSProperties = pending
    ? { strokeDashoffset: 0 }
    : {
        ['--reactor-dial-c' as string]: CIRCUMFERENCE,
        animationDuration: `${cycleSeconds}s`,
        animationDelay: `-${elapsedSeconds}s`,
      };

  return (
    <div className={twMerge('relative shrink-0', className)} style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="reactor-dial-svg">
        <defs>
          <linearGradient id={`reactor-dial-grad-${tier}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-electric-purple)" />
            <stop offset="100%" stopColor={tierColor} />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#reactor-dial-grad-${tier})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          className="reactor-dial-progress"
          data-pending={pending ? 'true' : 'false'}
          style={progressStyle}
        />
      </svg>

      <div
        className="absolute rounded-full flex-center overflow-hidden transition-[background] duration-300"
        style={{ inset: STROKE + 6, ...innerStyle }}
      >
        {!pending && (
          <div
            className="reactor-dial-spin"
            style={{
              background: `conic-gradient(from ${progress * 360}deg, transparent 0deg, ${glow}33 30deg, transparent 60deg)`,
            }}
          />
        )}
        <div
          className="relative flex items-center transition-opacity duration-200"
          style={{ opacity: pending ? 1 : 0.3 + progress * 0.7 }}
        >
          {showOverlap ? (
            <TicketOverlap type={tier} width={70} />
          ) : (
            <Ticket type={tier} width={70} height={48} />
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
