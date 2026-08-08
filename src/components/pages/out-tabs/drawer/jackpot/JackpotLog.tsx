'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerStyle } from '@/utils/global/animation.utils';
import { JackpotLogRow } from './JackpotLogRow';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

interface JackpotLogProps {
  winners?: JackpotWinner[];
  loading?: boolean;
}

/**
 * Past drops as a ledger. The newest one is already quoted on the stage, so
 * this list starts from the second — repeating it here would read as two
 * different drops.
 */
export function JackpotLog({ winners, loading }: JackpotLogProps) {
  const t = useAppTranslations();
  const rest = winners?.slice(1);
  const items = loading ? (new Array(4).fill(undefined) as (JackpotWinner | undefined)[]) : rest;

  if (!loading && (!winners || winners.length === 0)) {
    return (
      <section className="flex flex-col gap-3">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          {t('recent jackpots')}
        </h2>
        <p className="text-white-secondary text-[13px] font-medium">{t('no jackpots yet')}</p>
      </section>
    );
  }

  if (!loading && (!rest || rest.length === 0)) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
        {t('recent jackpots')}
      </h2>
      <ul className="flex flex-col">
        {items?.map((winner, index) => (
          <JackpotLogRow
            key={winner?.id ?? `s-${index}`}
            winner={winner}
            loading={loading}
            style={staggerStyle(index, 60)}
          />
        ))}
      </ul>
    </section>
  );
}
