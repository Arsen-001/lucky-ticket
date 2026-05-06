'use client';
import type { CSSProperties } from 'react';
import { Clover, Crown } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import type { CloverVariant } from '@/constants/global.constants';

export interface CloverIconProps {
  variant: CloverVariant;
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const leafCount: Record<CloverVariant, number> = {
  'leaf-1': 1,
  'leaf-2': 2,
  'leaf-3': 3,
  'leaf-4': 4,
  'leaf-5': 5,
  'leaf-6': 6,
  'leaf-7': 7,
  golden: 4,
  diamond: 4,
  'rainbow-crown': 7,
};

const baseTint: Record<CloverVariant, string> = {
  'leaf-1': '#7DD37C',
  'leaf-2': '#6FCB72',
  'leaf-3': '#5FC169',
  'leaf-4': '#4DB85F',
  'leaf-5': '#3FAE56',
  'leaf-6': '#2EA34D',
  'leaf-7': '#199844',
  golden: '#F8BD3E',
  diamond: '#5FE3F5',
  'rainbow-crown': '#ffffff',
};

export function CloverIcon({ variant, size = 32, className, style }: CloverIconProps) {
  const tint = baseTint[variant];
  const overlayLeaves = Math.max(0, leafCount[variant] - 3);

  return (
    <span
      className={twMerge('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden
    >
      {variant === 'rainbow-crown' && (
        <span
          className="pointer-events-none absolute inset-[-12%] rounded-full"
          style={{
            background:
              'conic-gradient(from 0deg, #f8bd3e, #de009b, #743df5, #5fe3f5, #4DB85F, #f8bd3e)',
            filter: 'blur(6px)',
            opacity: 0.6,
          }}
        />
      )}

      {variant === 'golden' && (
        <span
          className="pointer-events-none absolute inset-[-8%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(248,189,62,0.55), transparent 65%)',
            filter: 'blur(2px)',
          }}
        />
      )}

      {variant === 'diamond' && (
        <span
          className="pointer-events-none absolute inset-[-8%] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(95,227,245,0.5), transparent 65%)',
            filter: 'blur(2px)',
          }}
        />
      )}

      <Clover
        size={size}
        strokeWidth={2.2}
        style={{ color: tint, filter: `drop-shadow(0 0 6px ${tint}80)` }}
        className="relative"
      />

      {overlayLeaves > 0 && (
        <span className="pointer-events-none absolute inset-0">
          {Array.from({ length: overlayLeaves }).map((_, i) => {
            const angle = (i * 360) / overlayLeaves + (overlayLeaves === 1 ? 270 : 0);
            const radius = size * 0.42;
            const leafSize = size * 0.32;
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2"
                style={{
                  width: leafSize,
                  height: leafSize,
                  transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${radius}px)`,
                }}
              >
                <Clover
                  size={leafSize}
                  strokeWidth={2.4}
                  style={{ color: tint, filter: `drop-shadow(0 0 3px ${tint}99)` }}
                />
              </span>
            );
          })}
        </span>
      )}

      {variant === 'rainbow-crown' && (
        <Crown
          size={size * 0.45}
          strokeWidth={2.4}
          className="absolute -top-1 left-1/2 -translate-x-1/2 text-[#F8BD3E]"
          style={{ filter: 'drop-shadow(0 0 6px rgba(248,189,62,0.85))' }}
        />
      )}
    </span>
  );
}
