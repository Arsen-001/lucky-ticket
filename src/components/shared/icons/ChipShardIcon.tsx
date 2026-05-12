'use client';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { Boxes, Clock } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { InventoryChipType } from '@/types/interfaces/inventory.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface ChipShardIconProps {
  type: InventoryChipType;
  tier?: TicketType;
  accent?: string;
  size?: number;
  animated?: boolean;
  empty?: boolean;
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

const SHARD_PATH = 'M 24,4 L 39,14 L 41,30 L 30,42 L 12,38 L 6,20 Z';

export function ChipShardIcon({
  type,
  tier = 'gold',
  accent,
  size = 24,
  animated = true,
  empty = false,
  className,
  style,
}: ChipShardIconProps) {
  const uid = useId();
  const color = accent ?? TIER_ACCENT[tier];
  const ids = {
    body: `shard-body-${uid}`,
    face: `shard-face-${uid}`,
    shine: `shard-shine-${uid}`,
    glow: `shard-glow-${uid}`,
  };

  const opacity = empty ? 0.32 : 1;
  const shouldAnimate = animated && !empty;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={twMerge('chip-shard-icon', className)}
      style={{ color, opacity, ...style }}
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="0.6" y2="1">
          <stop offset="0" stopColor="currentColor" stopOpacity="0.95" />
          <stop offset="0.55" stopColor="currentColor" stopOpacity="0.5" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0.2" />
        </linearGradient>

        <linearGradient id={ids.face} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgba(255,255,255,0.18)" />
          <stop offset="1" stopColor="rgba(0,0,0,0.55)" />
        </linearGradient>

        <linearGradient id={ids.shine} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
          {shouldAnimate && (
            <>
              <animate
                attributeName="x1"
                values="-1;1.5;1.5"
                keyTimes="0;0.65;1"
                dur="3.8s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2.5;2.5"
                keyTimes="0;0.65;1"
                dur="3.8s"
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>

        <filter id={ids.glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.8" />
        </filter>
      </defs>

      {!empty && (
        <path d={SHARD_PATH} fill="currentColor" opacity="0.55" filter={`url(#${ids.glow})`} />
      )}

      <path
        d={SHARD_PATH}
        fill={`url(#${ids.body})`}
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
        strokeOpacity="0.95"
      />

      <path d={SHARD_PATH} fill={`url(#${ids.face})`} />

      <g
        stroke="currentColor"
        strokeWidth="0.4"
        strokeOpacity="0.28"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="24" y1="4" x2="24" y2="24" />
        <line x1="24" y1="24" x2="39" y2="14" />
        <line x1="24" y1="24" x2="41" y2="30" />
        <line x1="24" y1="24" x2="30" y2="42" />
        <line x1="24" y1="24" x2="12" y2="38" />
        <line x1="24" y1="24" x2="6" y2="20" />
      </g>

      {type === 'speed' ? (
        <Clock
          x={13}
          y={13}
          width={22}
          height={22}
          stroke="currentColor"
          fill="currentColor"
          fillOpacity={0.45}
          strokeWidth={2.2}
        />
      ) : (
        <Boxes
          x={13}
          y={13}
          width={22}
          height={22}
          stroke="currentColor"
          fill="currentColor"
          fillOpacity={0.45}
          strokeWidth={2.2}
        />
      )}

      <path d={SHARD_PATH} fill={`url(#${ids.shine})`} />

      {shouldAnimate && (
        <g>
          <circle cx="34" cy="12" r="0.9" fill="white" opacity="0">
            <animate
              attributeName="opacity"
              values="0;1;0;0;0"
              keyTimes="0;0.18;0.35;0.9;1"
              dur="3.8s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="10" cy="32" r="0.7" fill="white" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0;0.9;0;0"
              keyTimes="0;0.45;0.6;0.75;1"
              dur="3.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </svg>
  );
}
