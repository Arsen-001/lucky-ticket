'use client';

import '@/styles/components/stakes.css';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Sparkles } from 'lucide-react';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import { twMerge } from 'tailwind-merge';

const SIZE = 220;
const STROKE = 10;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export interface StakeCountdownRingProps {
  levelDef: StakeLevelDefinition;
  leftTime: string;
  progress: number;
  ready: boolean;
}

export function StakeCountdownRing({
  levelDef,
  leftTime,
  progress,
  ready,
}: StakeCountdownRingProps) {
  const t = useAppTranslations();
  const offset = CIRCUMFERENCE * (1 - (ready ? 1 : progress / 100));
  const ringId = `stake-grad-${levelDef.level}`;

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
          stroke={ready ? 'var(--color-success)' : `url(#${ringId})`}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <div
        className={twMerge(
          'absolute flex flex-col items-center justify-center rounded-full',
          'inset-[22px]'
        )}
        style={{
          background: ready
            ? 'radial-gradient(circle, rgba(74,222,128,0.25) 0%, rgba(74,222,128,0.10) 60%, rgba(0,0,0,0.4) 100%)'
            : 'radial-gradient(circle, rgba(222,0,155,0.25) 0%, rgba(116,61,245,0.15) 60%, rgba(0,0,0,0.4) 100%)',
        }}
      >
        {ready ? (
          <>
            <div className="stakes-pulse-halo flex-center">
              <Sparkles size={54} className="text-success" strokeWidth={1.6} />
            </div>
            <div className="text-success mt-1.5 text-[11px] font-extrabold uppercase tracking-widest">
              {t('rewards ready')}
            </div>
          </>
        ) : (
          <>
            <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-widest">
              {t('time left')}
            </div>
            <div className="text-[32px] font-extrabold leading-none tracking-tight text-white tabular-nums">
              {leftTime}
            </div>
            <div className="mt-1">
              <StakesLevelChip level={levelDef.level} tier={levelDef.tier} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
