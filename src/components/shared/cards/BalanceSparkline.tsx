'use client';

import { useId } from 'react';
import { twMerge } from 'tailwind-merge';

export interface BalanceSparklineProps {
  /** Balance points oldest → newest. Fewer than two draws nothing. */
  values: number[];
  className?: string;
}

const VIEW_W = 100;
const VIEW_H = 32;
const TOP_PAD = 4;
const PLOT_H = VIEW_H - TOP_PAD * 2;

/**
 * The balance curve read off the ledger — the one thing on this page the player
 * cannot get anywhere else in the app. Stretched with `preserveAspectRatio:
 * none`, so the stroke has to opt out of that scaling or it renders as a wedge,
 * and the endpoint marker has to be an HTML dot rather than an SVG circle,
 * which the same stretch would turn into an ellipse.
 */
export function BalanceSparkline({ values, className }: BalanceSparklineProps) {
  const gradientId = useId();

  if (values.length < 2) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min;
  // A week without a single change is a real answer, not missing data: draw it
  // down the middle instead of flat on the floor, where it reads as "zero".
  const fraction = (value: number) => (span === 0 ? 0.5 : (value - min) / span);
  const stepX = VIEW_W / (values.length - 1);

  const points = values.map((value, index) => {
    const x = index * stepX;
    const y = VIEW_H - TOP_PAD - fraction(value) * PLOT_H;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const line = `M${points.join(' L')}`;
  const area = `${line} L${VIEW_W},${VIEW_H} L0,${VIEW_H} Z`;
  const endBottom = ((TOP_PAD + fraction(values[values.length - 1]) * PLOT_H) / VIEW_H) * 100;

  return (
    <div aria-hidden className={twMerge('relative', className)}>
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(248,189,62,0.45)" />
            <stop offset="100%" stopColor="rgba(248,189,62,0)" />
          </linearGradient>
        </defs>

        <path d={area} fill={`url(#${gradientId})`} />
        <path
          d={line}
          fill="none"
          stroke="#F8BD3E"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span
        className="bg-gold absolute h-2 w-2 rounded-full ring-2 ring-white/70"
        style={{ right: '4px', bottom: `calc(${endBottom.toFixed(2)}% - 4px)` }}
      />
    </div>
  );
}
