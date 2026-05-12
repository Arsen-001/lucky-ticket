'use client';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';

export type PrimeIconState = 'active' | 'idle' | 'locked';

export interface PrimeIconProps {
  size?: number;
  state?: PrimeIconState;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

const CROWN_PATH =
  'M 6,40 L 6,30 L 8,22 L 12,26 L 16,14 L 20,22 L 24,8 L 28,22 L 32,14 L 36,26 L 40,22 L 42,30 L 42,40 Z';

export function PrimeIcon({
  size = 36,
  state = 'active',
  animated = true,
  className,
  style,
}: PrimeIconProps) {
  const uid = useId();
  const ids = {
    body: `prime-body-${uid}`,
    rim: `prime-rim-${uid}`,
    gem: `prime-gem-${uid}`,
    glow: `prime-glow-${uid}`,
    shine: `prime-shine-${uid}`,
  };
  const isLocked = state === 'locked';
  const shouldAnimate = animated && !isLocked;

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={twMerge('prime-icon', className)}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={isLocked ? '#C2C2C2' : '#FF4FBE'} />
          <stop offset="0.5" stopColor={isLocked ? '#8A8A8A' : '#DE009B'} />
          <stop offset="1" stopColor={isLocked ? '#4A4A4A' : '#743DF5'} />
        </linearGradient>

        <linearGradient id={ids.rim} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0.85" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>

        <radialGradient id={ids.gem} cx="0.35" cy="0.35" r="0.7">
          <stop offset="0" stopColor={isLocked ? '#E8E8E8' : '#FFD6F2'} />
          <stop offset="0.5" stopColor={isLocked ? '#A0A0A0' : '#FF4FBE'} />
          <stop offset="1" stopColor={isLocked ? '#5A5A5A' : '#7A1A6A'} />
        </radialGradient>

        <linearGradient id={ids.shine} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.4" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
          {shouldAnimate && (
            <>
              <animate
                attributeName="x1"
                values="-1;1.5;1.5"
                keyTimes="0;0.7;1"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="0;2.5;2.5"
                keyTimes="0;0.7;1"
                dur="4s"
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
        <path d={CROWN_PATH} fill="#DE009B" opacity="0.5" filter={`url(#${ids.glow})`}>
          {shouldAnimate && (
            <animate
              attributeName="opacity"
              values="0.35;0.7;0.35"
              dur="2.4s"
              repeatCount="indefinite"
            />
          )}
        </path>
      )}

      <path
        d={CROWN_PATH}
        fill={`url(#${ids.body})`}
        stroke={isLocked ? '#4A4A4A' : '#7A1A6A'}
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      <rect x="6" y="30" width="36" height="1.5" fill={`url(#${ids.rim})`} opacity="0.9" />

      <line
        x1="6"
        y1="38"
        x2="42"
        y2="38"
        stroke={isLocked ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.35)'}
        strokeWidth="0.6"
      />

      <g>
        <circle cx="8" cy="22" r="1.6" fill={`url(#${ids.gem})`} />
        <circle cx="16" cy="14" r="1.8" fill={`url(#${ids.gem})`} />
        <circle cx="24" cy="8" r="2.2" fill={`url(#${ids.gem})`} />
        <circle cx="32" cy="14" r="1.8" fill={`url(#${ids.gem})`} />
        <circle cx="40" cy="22" r="1.6" fill={`url(#${ids.gem})`} />
      </g>

      <circle
        cx="24"
        cy="35"
        r="3"
        fill={`url(#${ids.gem})`}
        stroke={isLocked ? '#3A3A3A' : '#7A1A6A'}
        strokeWidth="0.5"
      />
      <circle cx="23" cy="34" r="0.8" fill="white" opacity="0.65" />

      <path d={CROWN_PATH} fill={`url(#${ids.shine})`} />

      {shouldAnimate && (
        <circle cx="25" cy="35" r="0.5" fill="white" opacity="0">
          <animate
            attributeName="opacity"
            values="0;0.95;0;0;0"
            keyTimes="0;0.2;0.4;0.9;1"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}
