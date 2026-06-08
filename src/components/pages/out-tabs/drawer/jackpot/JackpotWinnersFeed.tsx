'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { JackpotWinnerRow } from './JackpotWinnerRow';
import type { JackpotWinner } from '@/types/interfaces/jackpot.interfaces';

interface JackpotWinnersFeedProps {
  winners?: JackpotWinner[];
  loading?: boolean;
}

export function JackpotWinnersFeed({ winners, loading }: JackpotWinnersFeedProps) {
  const t = useAppTranslations();
  const items = loading ? (new Array(5).fill(undefined) as (JackpotWinner | undefined)[]) : winners;

  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="px-1 text-sm font-bold text-white">{t('recent jackpots')}</h2>

      {!loading && (!winners || winners.length === 0) ? (
        <div className="bg-background-overlay rounded-2xl border border-white/5 px-4 py-8 text-center">
          <p className="text-white-secondary text-[13px] font-medium">{t('no jackpots yet')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2" role="list">
          {items?.map((winner, index) => (
            <JackpotWinnerRow
              key={winner?.id ?? `s-${index}`}
              winner={winner}
              loading={loading}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${Math.min(index, 12) * 60}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
