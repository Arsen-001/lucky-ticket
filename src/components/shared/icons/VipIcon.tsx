'use client';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

export type VipIconState = 'active' | 'idle' | 'locked';

export interface VipIconProps {
  size?: number;
  state?: VipIconState;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function VipIcon({
  size = 36,
  state = 'active',
  animated = true,
  className,
  style,
}: VipIconProps) {
  const uid = useId();
  const ids = {
    crown: `vip-crown-${uid}`,
    body: `vip-body-${uid}`,
    shine: `vip-shine-${uid}`,
    glow: `vip-glow-${uid}`,
  };

  const isLocked = state === 'locked';
  const shouldAnimate = animated && !isLocked;
  const gemPath = '24,4 40,18 38,22 24,44 10,22 8,18';

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={twMerge('vip-icon', className)}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.crown} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={isLocked ? '#D4D4D4' : '#FFFBEA'} />
          <stop offset="1" stopColor={isLocked ? '#9A9A9A' : '#F8BD3E'} />
        </linearGradient>

        <linearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={isLocked ? '#9A9A9A' : '#F8BD3E'} />
          <stop offset="0.55" stopColor={isLocked ? '#6E6E6E' : '#B8860B'} />
          <stop offset="1" stopColor={isLocked ? '#404040' : '#5A4408'} />
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
                keyTimes="0;0.6;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2.5;2.5"
                keyTimes="0;0.6;1"
                dur="3.5s"
                repeatCount="indefinite"
              />
            </>
          )}
        </linearGradient>

        <filter id={ids.glow} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {!isLocked && (
        <polygon points={gemPath} fill="#F8BD3E" opacity="0.55" filter={`url(#${ids.glow})`} />
      )}

      <polygon points="10,22 38,22 24,44" fill={`url(#${ids.body})`} />
      <polygon points="24,4 40,18 38,22 10,22 8,18" fill={`url(#${ids.crown})`} />

      <g
        stroke={isLocked ? 'rgba(0,0,0,0.35)' : 'rgba(122,90,10,0.55)'}
        strokeWidth="0.4"
        strokeLinecap="round"
        fill="none"
      >
        <line x1="24" y1="4" x2="24" y2="22" />
        <line x1="8" y1="18" x2="40" y2="18" />
        <line x1="16" y1="18" x2="24" y2="4" />
        <line x1="32" y1="18" x2="24" y2="4" />
        <line x1="24" y1="22" x2="24" y2="44" />
        <line x1="17" y1="22" x2="24" y2="44" opacity="0.6" />
        <line x1="31" y1="22" x2="24" y2="44" opacity="0.6" />
      </g>

      <polyline
        points="8,18 24,4 40,18"
        fill="none"
        stroke={isLocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,253,235,0.95)'}
        strokeWidth="0.8"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      <line
        x1="10"
        y1="22"
        x2="38"
        y2="22"
        stroke={isLocked ? 'rgba(255,255,255,0.25)' : 'rgba(255,232,154,0.9)'}
        strokeWidth="0.6"
        strokeLinecap="round"
      />

      <polygon points={gemPath} fill={`url(#${ids.shine})`} />

      {shouldAnimate && (
        <g>
          <circle cx="17" cy="11" r="0.9" fill="white">
            <animate
              attributeName="opacity"
              values="0;1;0;0;0"
              keyTimes="0;0.15;0.3;0.9;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="32" cy="32" r="0.6" fill="white" opacity="0">
            <animate
              attributeName="opacity"
              values="0;0;0.85;0;0"
              keyTimes="0;0.4;0.55;0.7;1"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      )}
    </svg>
  );
}
