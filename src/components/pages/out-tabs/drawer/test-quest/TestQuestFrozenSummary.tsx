'use client';

import { FlaskConical, Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { TestQuestBadge } from './TestQuestBadge';

export interface TestQuestFrozenSummaryProps {
  /** Minted badge level (1…31) — absent on an account that never enrolled. */
  badgeLevel?: number | null;
  chestsPaid: number;
  chestsTotal: number;
  className?: string;
}

/**
 * What the screen becomes after the admin freezes the test: the climb is over,
 * so there is no ladder, no claim and nothing to look ahead to — only the badge
 * that was minted.
 *
 * The monthly-chest row is drawn only when there are chests to draw. They were
 * switched off on 19.08.2026 (`chestMonths` = 0) so that finishing the ladder
 * earns one prize and not two, and a row reading "0/0" would advertise a series
 * nobody will ever be paid. The mechanism is dormant, not gone — the row comes
 * back on its own if the panel turns it back on.
 */
export function TestQuestFrozenSummary({
  badgeLevel,
  chestsPaid,
  chestsTotal,
  className,
}: TestQuestFrozenSummaryProps) {
  const t = useAppTranslations();

  return (
    <section className={twMerge('flex flex-col gap-2 px-2.5 pt-3', className)}>
      <div className="flex items-center gap-2">
        <div className="flex-center h-8 w-8 rounded-xl bg-gradient-to-br from-electric-pink to-electric-purple shadow-md shadow-black/30">
          <FlaskConical size={15} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-extrabold leading-tight">{t('test quest chain title')}</h3>
          <p className="line-clamp-1 text-[11px] text-pink-secondary">
            {t('test quest chain blurb')}
          </p>
        </div>
        {badgeLevel != null && <TestQuestBadge level={badgeLevel} className="shrink-0" />}
      </div>

      {chestsTotal > 0 && (
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-background-overlay p-2.5 text-[11px] text-white-secondary">
          <Gift size={12} className="text-gold" />
          {t('monthly chest')} ·{' '}
          <span className="font-bold tabular-nums text-white">
            {chestsPaid}/{chestsTotal}
          </span>
        </div>
      )}
    </section>
  );
}
