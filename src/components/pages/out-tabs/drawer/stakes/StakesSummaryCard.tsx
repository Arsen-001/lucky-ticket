'use client';

import type { ReactNode } from 'react';
import '@/styles/components/stakes.css';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { twMerge } from 'tailwind-merge';
import type { TicketType } from '@/types/types/ticket.types';

const tierColorVar: Record<TicketType, string> = {
  bronze: 'var(--color-bronze)',
  silver: 'var(--color-silver)',
  gold: 'var(--color-gold)',
  platinum: 'var(--color-platinum)',
  diamond: 'var(--color-diamond)',
};

interface StatProps {
  label: string;
  value: string;
  sub: ReactNode;
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
      <div className="mt-1 flex items-center gap-1">
        <span
          className={twMerge(
            'text-[18px] font-extrabold leading-none tabular-nums',
            valueClass[variant]
          )}
        >
          {value}
        </span>
        <span className="text-pink-secondary text-[10px] leading-none">{sub}</span>
      </div>
    </div>
  );
}

export interface StakesSummaryCardProps {
  activeCount: number;
  lockedAmount: number;
  readyCount: number;
  lifetimeEarned: number;
  /** Tier of the largest active stake — drives the corner-glow accent. */
  topTier?: TicketType;
  /** AP gap to the next AP-tier — undefined when already at max tier. */
  nextTierAp?: number;
  /** Percent progress towards the next tier (0..100). */
  tierProgressPercent?: number;
}

export function StakesSummaryCard({
  activeCount,
  lockedAmount,
  readyCount,
  lifetimeEarned,
  topTier,
  nextTierAp,
  tierProgressPercent = 0,
}: StakesSummaryCardProps) {
  const t = useAppTranslations();
  const accent = topTier ? tierColorVar[topTier] : 'rgba(222,0,155,1)';

  return (
    <div
      className="stake-card-shell stake-card-border relative px-5 py-4.5"
      style={{
        background:
          `radial-gradient(circle at 100% 0%, color-mix(in srgb, ${accent} 22%, transparent) 0%, transparent 50%),` +
          'linear-gradient(135deg, #332247 0%, #1F1B38 60%, #151F35 100%)',
      }}
    >
      <div className="relative grid grid-cols-3 gap-2.5">
        <Stat label={t('active')} value={String(activeCount)} sub={t('stakes')} />
        <Stat
          label={t('locked')}
          value={formatCompact(lockedAmount)}
          sub={<LcLabel size={12} />}
          variant="gold"
        />
        <Stat
          label={t('ready')}
          value={String(readyCount)}
          sub={t('to claim')}
          variant={readyCount > 0 ? 'highlight' : 'default'}
        />
      </div>
      <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3">
        <div className="flex items-center justify-between">
          <span className="text-pink-secondary text-[9px] font-bold uppercase tracking-wider">
            {t('lifetime earned')}
          </span>
          <span className="text-gold inline-flex items-center gap-1 text-[12px] font-extrabold tabular-nums">
            +{formatCompact(lifetimeEarned)}
            <LcLabel size={11} />
          </span>
        </div>
        {nextTierAp !== undefined && (
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold tabular-nums">
              <span className="text-pink-secondary uppercase tracking-wider">
                {t('next tier in')}
              </span>
              <span className="text-electric-pink">{formatCompact(nextTierAp)} AP</span>
            </div>
            <div className="bg-background-overlay/60 mt-1 h-0.5 overflow-hidden rounded-full">
              <div
                className="bg-pink-gradient h-full rounded-full transition-all duration-500"
                style={{ width: `${tierProgressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
