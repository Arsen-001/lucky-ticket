'use client';

import { Star } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

export interface NewStakeLevelPickerProps {
  levels: StakeLevelDefinition[];
  balance: number;
  /** The band currently in force, or `0` when the deposit clears none. */
  activeLevel: number;
  onSelect: (amount: number) => void;
  className?: string;
}

const tierActive: Record<TicketType, string> = {
  bronze: 'border-bronze/80 bg-bronze/20 text-bronze',
  silver: 'border-silver/80 bg-silver/20 text-silver',
  gold: 'border-gold/80 bg-gold/20 text-gold',
  platinum: 'border-platinum/80 bg-platinum/20 text-platinum',
  diamond: 'border-diamond/80 bg-diamond/20 text-diamond',
};

const tierIdle: Record<TicketType, string> = {
  bronze: 'border-bronze/25 bg-bronze/[0.06] text-bronze/80',
  silver: 'border-silver/25 bg-silver/[0.06] text-silver/80',
  gold: 'border-gold/25 bg-gold/[0.06] text-gold/80',
  platinum: 'border-platinum/25 bg-platinum/[0.06] text-platinum/80',
  diamond: 'border-diamond/25 bg-diamond/[0.06] text-diamond/80',
};

/**
 * Jump the deposit to a band's floor.
 *
 * Every band is reachable by anyone now — the AP-tier gate is gone — so the
 * only thing that can dim a button is the player's own balance, and it says so
 * in LC rather than showing a padlock over an AP requirement they never had.
 * Each button also carries what the band pays: `+N%` on the APR.
 */
export function NewStakeLevelPicker({
  levels,
  balance,
  activeLevel,
  onSelect,
  className,
}: NewStakeLevelPickerProps) {
  const t = useAppTranslations();

  return (
    <div
      className={twMerge('grid gap-1.5', className)}
      style={{ gridTemplateColumns: `repeat(${levels.length}, minmax(0, 1fr))` }}
    >
      {levels.map(lv => {
        const affordable = balance >= lv.minDeposit;
        const isActive = activeLevel === lv.level;
        const stateClass = !affordable
          ? 'cursor-not-allowed border-white/5 bg-white/[0.02] text-disabled'
          : isActive
            ? `${tierActive[lv.tier]} -translate-y-0.5 shadow-[0_4px_14px_rgba(0,0,0,0.35)]`
            : tierIdle[lv.tier];

        return (
          <button
            key={lv.level}
            type="button"
            disabled={!affordable}
            onClick={() => onSelect(lv.minDeposit)}
            aria-pressed={isActive}
            aria-label={t('level {level}', { level: lv.level })}
            className={twMerge(
              'flex flex-col items-center rounded-xl border px-1 py-2 transition-all duration-200',
              stateClass
            )}
          >
            <span className="flex items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider">
              <Star className="mb-0.5" size={12} fill="currentColor" strokeWidth={0} />
              {t('lvl {level}', { level: lv.level })}
            </span>
            <span className="text-xs font-extrabold tabular-nums">
              {formatCompact(lv.minDeposit)}
            </span>
            <span className="mt-0.5 text-[8px] font-bold tabular-nums opacity-80">
              +{lv.yieldBoostPct}%
            </span>
          </button>
        );
      })}
    </div>
  );
}
