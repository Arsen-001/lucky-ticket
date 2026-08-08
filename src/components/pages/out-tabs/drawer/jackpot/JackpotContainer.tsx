'use client';

import { useGetJackpotQuery, useGetJackpotWinnersQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { JackpotStage } from './JackpotStage';
import { JackpotStanding } from './JackpotStanding';
import { JackpotPayoutLadder } from './JackpotPayoutLadder';
import { JackpotTotals } from './JackpotTotals';
import { JackpotMechanics } from './JackpotMechanics';
import { JackpotLog } from './JackpotLog';
import { JackpotCta } from './JackpotCta';

/**
 * Jackpot page. Order is the argument: the pot and the proof it drops, then
 * where the player stands, then what each place takes out of *this* pot —
 * everything a decision needs before the mechanic, which is folded away, and
 * the history, which is the last thing that matters.
 */
export function JackpotContainer() {
  const t = useAppTranslations();
  // The pot only moves when a tournament finishes — poll to pick up real
  // skims (the scheduler finishes due tournaments about once a minute).
  const { data, isLoading, isError, refetch } = useGetJackpotQuery(undefined, {
    pollingInterval: 60_000,
    // Don't keep polling a backgrounded Mini App — resumes on refocus.
    skipPollingIfUnfocused: true,
  });
  const { data: winners, isLoading: winnersLoading } = useGetJackpotWinnersQuery();

  if (isError) {
    return <QueryErrorState onRetry={() => refetch()} message={t('couldnt load jackpot')} />;
  }

  return (
    <div className="flex flex-col gap-5 pb-4">
      <JackpotStage data={data} loading={isLoading} lastDrop={winners?.[0]} />
      <div className="flex flex-col gap-5">
        <JackpotStanding activeTournaments={data?.myActiveTournamentsCount} loading={isLoading} />
        <JackpotPayoutLadder pot={data?.pot} loading={isLoading} />
        <JackpotTotals data={data} loading={isLoading} />
        <JackpotMechanics />
        <JackpotLog winners={winners} loading={winnersLoading} />
      </div>
      <JackpotCta />
    </div>
  );
}
