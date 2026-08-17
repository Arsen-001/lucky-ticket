'use client';

import '@/styles/components/stakes.css';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

const SIZE = 220;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The running countdown of a stake in progress.
 *
 * It used to carry a second, "matured" face — a pulsing halo and a "rewards
 * ready" caption — behind a `ready` prop that its only caller hard-coded to
 * `false`. It could never render: a matured stake is redirected to
 * `/stakes/ready/[id]`, which has its own claim screen. Dead branches drift, so
 * this one is gone rather than kept "just in case".
 */
export interface StakeCountdownRingProps {
  /** `null` when the deposit cleared no band — the ring paints neutral. */
  levelDef: StakeLevelDefinition | null;
  leftTime: string;
  progress: number;
}

export function StakeCountdownRing({ levelDef, leftTime, progress }: StakeCountdownRingProps) {
  const t = useAppTranslations();
  const offset = CIRCUMFERENCE * (1 - progress / 100);
  const ringId = `stake-grad-${levelDef?.level ?? 0}`;

  return (
    <div className="relative mx-auto" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} className="absolute inset-0 -rotate-90">
        <defs>
          <linearGradient id={ringId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-electric-pink)" />
            <stop offset="100%" stopColor="var(--color-electric-purple)" />
          </linearGradient>
        </defs>
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={STROKE}
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={`url(#${ringId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div
        className="absolute inset-[22px] flex flex-col items-center justify-center rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(222,0,155,0.25) 0%, rgba(116,61,245,0.15) 60%, rgba(0,0,0,0.4) 100%)',
        }}
      >
        <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-widest">
          {t('time left')}
        </div>
        <div className="text-[32px] font-extrabold leading-none tracking-tight text-white tabular-nums">
          {leftTime}
        </div>
        <div className="text-electric-pink mt-1 text-[10px] font-bold tabular-nums">
          {progress}%
        </div>
        <div className="mt-1.5">
          <StakesLevelChip level={levelDef?.level ?? 0} tier={levelDef?.tier ?? null} />
        </div>
      </div>
    </div>
  );
}
