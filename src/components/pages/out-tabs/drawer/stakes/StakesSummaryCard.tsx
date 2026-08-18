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

/**
 * What still stands between the player and the next AP-tier. The gate has two
 * halves (DOCS §5.1) and the caller picks the one that is furthest from done,
 * so the caption and the bar can never describe different halves.
 */
export interface StakesTierNeed {
  kind: 'ap' | 'friends';
  amount: number;
}

export interface StakesSummaryCardProps {
  activeCount: number;
  lockedAmount: number;
  readyCount: number;
  lifetimeEarned: number;
  /**
   * Tier of the largest active stake — drives the corner-glow accent. `null`
   * when that band is one the server did not name, in which case the card falls
   * back to the same neutral accent every other stake surface uses.
   */
  topTier?: TicketType | null;
  /** The blocking half of the next-tier gate, or `null` at max tier. */
  nextTierNeed?: StakesTierNeed | null;
  /** Percent progress towards the next tier (0..100). */
  tierProgressPercent?: number;
}

export function StakesSummaryCard({
  activeCount,
  lockedAmount,
  readyCount,
  lifetimeEarned,
  topTier,
  nextTierNeed = null,
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
        <Stat
          label={t('active')}
          value={String(activeCount)}
          sub={t('stakes noun {n}', { n: activeCount })}
        />
        <Stat
          label={t('locked')}
          value={formatCompact(lockedAmount)}
          sub={<LcLabel size={12} />}
          variant="gold"
        />
        {/* `ready count`, not the `ready` badge key: that one is the word
            stamped on a matured card ("ГОТОВ", masculine singular) and it does
            not agree with a count sitting under it. */}
        <Stat
          label={t('ready count')}
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
        {nextTierNeed && (
          <div>
            <div className="flex items-center justify-between text-[9px] font-bold tabular-nums">
              <span className="text-pink-secondary uppercase tracking-wider">
                {t('next tier in')}
              </span>
              {/* White, not `text-electric-pink`: that pink measured 3.76:1 on
                  this card at 9px, below the 4.5:1 floor for body text. */}
              <span className="text-white">
                {nextTierNeed.kind === 'ap'
                  ? t('need more ap')
                  : t('need {n} friends', { n: nextTierNeed.amount })}
              </span>
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
