'use client';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { Boxes, Clock, Rocket } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ChipIconProps {
  type: InventoryChipType;
  tier?: TicketType;
  accent?: string;
  size?: number;
  animated?: boolean;
  temporary?: boolean;
  className?: string;
  style?: CSSProperties;
}

const TIER_ACCENT: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
};

export function ChipIcon({
  type,
  tier = 'gold',
  accent,
  size = 24,
  animated = true,
  temporary = false,
  className,
  style,
}: ChipIconProps) {
  const uid = useId();
  const color = accent ?? TIER_ACCENT[tier];
  const ids = {
    pin: `chip-pin-${uid}`,
    face: `chip-face-${uid}`,
    shine: `chip-shine-${uid}`,
    glow: `chip-glow-${uid}`,
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={twMerge('chip-icon', className)}
      style={{ color, ...style }}
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.pin} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.4" />
        </linearGradient>

        <linearGradient id={ids.face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(0,0,0,0.55)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.85)" />
        </linearGradient>

        <linearGradient id={ids.shine} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
          {animated && (
            <>
              <animate
                attributeName="x1"
                values="-1;1.5;1.5"
                keyTimes="0;0.7;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2.5;2.5"
                keyTimes="0;0.7;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>

        <filter id={ids.glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
      </defs>

      <rect
        x="11"
        y="11"
        width="26"
        height="26"
        rx="4"
        fill="currentColor"
        opacity="0.5"
        filter={`url(#${ids.glow})`}
      />

      <g fill={`url(#${ids.pin})`}>
        <rect x="16" y="6" width="2.5" height="7" rx="0.6" />
        <rect x="22.75" y="6" width="2.5" height="7" rx="0.6" />
        <rect x="29.5" y="6" width="2.5" height="7" rx="0.6" />
        <rect x="16" y="35" width="2.5" height="7" rx="0.6" />
        <rect x="22.75" y="35" width="2.5" height="7" rx="0.6" />
        <rect x="29.5" y="35" width="2.5" height="7" rx="0.6" />
        <rect x="6" y="16" width="7" height="2.5" rx="0.6" />
        <rect x="6" y="22.75" width="7" height="2.5" rx="0.6" />
        <rect x="6" y="29.5" width="7" height="2.5" rx="0.6" />
        <rect x="35" y="16" width="7" height="2.5" rx="0.6" />
        <rect x="35" y="22.75" width="7" height="2.5" rx="0.6" />
        <rect x="35" y="29.5" width="7" height="2.5" rx="0.6" />
      </g>

      <rect
        x="11"
        y="11"
        width="26"
        height="26"
        rx="4"
        fill="rgba(20,16,38,0.95)"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeOpacity="0.95"
      />

      <rect
        x="14"
        y="14"
        width="20"
        height="20"
        rx="2.5"
        fill={`url(#${ids.face})`}
        stroke="currentColor"
        strokeWidth="0.4"
        strokeOpacity="0.45"
      />

      <circle cx="15.5" cy="15.5" r="1.1" fill="currentColor" opacity="0.7" />

      {type === 'speed' ? (
        temporary ? (
          <Rocket
            x={15}
            y={15}
            width={18}
            height={18}
            stroke="currentColor"
            fill="currentColor"
            fillOpacity={0.32}
            strokeWidth={2}
          />
        ) : (
          <Clock
            x={15}
            y={15}
            width={18}
            height={18}
            stroke="currentColor"
            fill="currentColor"
            fillOpacity={0.32}
            strokeWidth={2}
          />
        )
      ) : (
        <Boxes
          x={15}
          y={15}
          width={18}
          height={18}
          stroke="currentColor"
          fill="currentColor"
          fillOpacity={0.32}
          strokeWidth={2}
        />
      )}

      <rect x="11" y="11" width="26" height="26" rx="4" fill={`url(#${ids.shine})`} />

      {animated && (
        <circle cx="32.5" cy="14" r="0.7" fill="white" opacity="0">
          <animate
            attributeName="opacity"
            values="0;1;0;0;0"
            keyTimes="0;0.2;0.4;0.9;1"
            dur="3.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}

      {temporary && (
        <g>
          <circle cx="38" cy="8" r="8.5" fill="rgba(20,16,38,1)" />
          <circle cx="38" cy="8" r="7.5" fill="currentColor" />
          <circle cx="38" cy="8" r="5.2" fill="rgba(20,16,38,1)" />
          <line
            x1="38"
            y1="8"
            x2="38"
            y2="4.5"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <line
            x1="38"
            y1="8"
            x2="40.8"
            y2="8"
            stroke="currentColor"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          <circle cx="38" cy="8" r="0.65" fill="currentColor" />
        </g>
      )}
    </svg>
  );
}
