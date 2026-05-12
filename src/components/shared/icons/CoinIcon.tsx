'use client';
import { useId } from 'react';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { GlobalConstants } from '@/constants/global.constants';

export interface CoinIconProps {
  size?: number;
  animated?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function CoinIcon({ size = 24, animated = true, className, style }: CoinIconProps) {
  const uid = useId();
  const ids = {
    rim: `coin-rim-${uid}`,
    face: `coin-face-${uid}`,
    text: `coin-text-${uid}`,
    shine: `coin-shine-${uid}`,
    glow: `coin-glow-${uid}`,
  };

  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={twMerge('coin-icon', className)}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id={ids.rim} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFF5C4" />
          <stop offset="0.3" stopColor="#F8BD3E" />
          <stop offset="0.5" stopColor="#8B6914" />
          <stop offset="0.7" stopColor="#F8BD3E" />
          <stop offset="1" stopColor="#FFF5C4" />
        </linearGradient>

        <radialGradient id={ids.face} cx="0.35" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#FFEFA8" />
          <stop offset="0.55" stopColor="#F8BD3E" />
          <stop offset="1" stopColor="#9C7008" />
        </radialGradient>

        <linearGradient id={ids.text} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFCEB" />
          <stop offset="0.5" stopColor="#FFD96A" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>

        <linearGradient id={ids.shine} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="white" stopOpacity="0" />
          <stop offset="0.5" stopColor="white" stopOpacity="0.55" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
          {animated && (
            <>
              <animate
                attributeName="x1"
                values="-1.5;1.5;1.5"
                keyTimes="0;0.6;1"
                dur="4s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values="-0.5;2.5;2.5"
                keyTimes="0;0.6;1"
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

      <circle cx="24" cy="24" r="21" fill="#F8BD3E" opacity="0.5" filter={`url(#${ids.glow})`} />

      <circle cx="24" cy="24" r="21" fill={`url(#${ids.rim})`} />

      <circle cx="24" cy="24" r="17" fill={`url(#${ids.face})`} />

      <circle
        cx="24"
        cy="24"
        r="17"
        fill="none"
        stroke="#7A5A0A"
        strokeWidth="0.5"
        opacity="0.45"
      />

      <text
        x="24"
        y="25"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
        fontWeight="900"
        fontSize="17"
        fill={`url(#${ids.text})`}
        stroke="#7A5A0A"
        strokeWidth="0.35"
        letterSpacing="-0.8"
      >
        {GlobalConstants.coinName}
      </text>

      <ellipse
        cx="16"
        cy="13"
        rx="6"
        ry="3"
        fill="white"
        opacity="0.28"
        transform="rotate(-30 16 13)"
      />

      <circle cx="24" cy="24" r="21" fill={`url(#${ids.shine})`} />

      {animated && (
        <circle cx="36" cy="13" r="0.8" fill="white" opacity="0">
          <animate
            attributeName="opacity"
            values="0;1;0;0;0"
            keyTimes="0;0.15;0.3;0.9;1"
            dur="4s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </svg>
  );
}
