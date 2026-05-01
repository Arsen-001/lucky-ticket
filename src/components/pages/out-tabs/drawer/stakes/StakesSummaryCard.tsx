'use client';

import '@/styles/components/stakes.css';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import { twMerge } from 'tailwind-merge';

interface StatProps {
  label: string;
  value: string;
  sub: string;
  variant?: 'default' | 'gold' | 'highlight';
}

function Stat({ label, value, sub, variant = 'default' }: StatProps) {
  const valueClass: Record<NonNullable<StatProps['variant']>, string> = {
    default: 'text-white',
    gold: 'text-gold',
    highlight: 'text-success [text-shadow:0_0_12px_rgba(74,222,128,0.5)]',
  };

  return (
    <div>
      <div className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={twMerge(
            'text-[18px] font-extrabold leading-none tabular-nums',
            valueClass[variant]
          )}
        >
          {value}
        </span>
        <span className="text-pink-secondary text-[10px]">{sub}</span>
      </div>
    </div>
  );
}

export interface StakesSummaryCardProps {
  activeCount: number;
  lockedAmount: number;
  readyCount: number;
}

export function StakesSummaryCard({
  activeCount,
  lockedAmount,
  readyCount,
}: StakesSummaryCardProps) {
  const t = useAppTranslations();

  return (
    <div
      className="stake-card-shell stake-card-border relative px-5 py-4.5"
      style={{
        background:
          'radial-gradient(circle at 100% 0%, rgba(222,0,155,0.18) 0%, transparent 50%),' +
          'linear-gradient(135deg, #332247 0%, #1F1B38 60%, #151F35 100%)',
      }}
    >
      <div className="relative grid grid-cols-3 gap-2.5">
        <Stat label={t('active')} value={String(activeCount)} sub={t('stakes')} />
        <Stat
          label={t('locked')}
          value={lockedAmount.toLocaleString()}
          sub={GlobalConstants.coinName}
          variant="gold"
        />
        <Stat
          label={t('ready')}
          value={String(readyCount)}
          sub={t('to claim')}
          variant={readyCount > 0 ? 'highlight' : 'default'}
        />
      </div>
    </div>
  );
}
