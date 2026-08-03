'use client';

import '@/styles/components/stakes.css';
import Link from 'next/link';
import { Repeat } from 'lucide-react';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { routes } from '@/constants/routes';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { findLevelDef, formatStakeRelative } from '@/utils/global/stakes.utils';
import { StakesLevelChip } from '@/components/pages/out-tabs/drawer/stakes/StakesLevelChip';
import type { StakeHistoryEntry, StakeLevelDefinition } from '@/types/interfaces/stakes.interfaces';

export interface StakesHistoryRowProps {
  entry: StakeHistoryEntry;
  levels: StakeLevelDefinition[];
}

export function StakesHistoryRow({ entry, levels }: StakesHistoryRowProps) {
  const t = useAppTranslations();
  const levelDef = findLevelDef(levels, entry.level);

  if (!levelDef) return null;

  const restakeHref =
    `${routes.stakes.new}?level=${entry.level}&amount=${entry.amount}&months=${entry.durationMonths}` as const;

  return (
    <div
      className="stake-card-shell stake-card-border group relative flex items-center gap-3 overflow-hidden px-3 py-2.5 transition-colors hover:bg-white/[0.02]"
      style={{ ['--stake-card-accent' as string]: `var(--color-${levelDef.tier})` }}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-0.5"
        style={{ background: `var(--color-${levelDef.tier})` }}
      />

      <div className="relative min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <StakesLevelChip level={levelDef.level} tier={levelDef.tier} size="sm" />
          <span className="text-pink-secondary text-[10px] font-semibold">
            {t('{n} months', { n: entry.durationMonths })}
          </span>
          <span className="text-white/30 text-[10px]">·</span>
          <span className="text-pink-secondary text-[10px] font-semibold">
            {formatStakeRelative(entry.completedAt, t)}
          </span>
        </div>
        <div className="text-white-secondary mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px]">
          {entry.outcome === 'cancelled' ? (
            <span className="font-bold text-error-text/90">{t('cancelled · LC returned')}</span>
          ) : (
            <>
              <span className="text-gold inline-flex items-center gap-1 font-bold">
                +{entry.yieldLC.toLocaleString()}
                <LcLabel size={11} />
              </span>
              {entry.bonusLS > 0 && (
                <span className="text-gold font-bold">
                  +{entry.bonusLS} {t('stars')}
                </span>
              )}
            </>
          )}
          {entry.apAwarded > 0 && (
            <span className="text-teal inline-flex items-center gap-0.5 font-bold tabular-nums">
              <BoltIcon size={11} />+{entry.apAwarded} AP
            </span>
          )}
        </div>
      </div>

      <div className="relative flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <LcLabel size={20} />
          <span className="text-gold text-[11px] font-bold tabular-nums">
            {entry.amount.toLocaleString()}
          </span>
        </div>
        <Link
          href={restakeHref}
          aria-label={t('restake same params')}
          className="border-electric-pink/30 bg-electric-pink/10 text-electric-pink hover:bg-electric-pink/20 inline-flex items-center gap-0.5 rounded-full border px-1.5 py-2 text-[9px] font-extrabold uppercase tracking-wider transition-colors active:scale-95"
        >
          <Repeat size={9} strokeWidth={2.4} />
          {t('restake')}
        </Link>
      </div>
    </div>
  );
}
