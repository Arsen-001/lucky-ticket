'use client';

import { useGetJackpotQuery, useGetJackpotWinnersQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { JackpotHero } from './JackpotHero';
import { JackpotInvolvement } from './JackpotInvolvement';
import { JackpotHowItWorks } from './JackpotHowItWorks';
import { JackpotDistributionBar } from './JackpotDistributionBar';
import { JackpotWinnersFeed } from './JackpotWinnersFeed';

export function JackpotContainer() {
  const t = useAppTranslations();
  // The pot only moves when a tournament finishes — poll to pick up real
  // skims (the scheduler finishes due tournaments about once a minute).
  const { data, isLoading, isError, refetch } = useGetJackpotQuery(undefined, {
    pollingInterval: 60_000,
  });
  const { data: winners, isLoading: winnersLoading } = useGetJackpotWinnersQuery();

  if (isError) {
    return <QueryErrorState onRetry={() => refetch()} message={t('couldnt load jackpot')} />;
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-2">
      <JackpotHero data={data} loading={isLoading} />
      <JackpotInvolvement activeTournaments={data?.myActiveTournamentsCount} loading={isLoading} />
      <JackpotHowItWorks />
      <JackpotDistributionBar />
      <JackpotWinnersFeed
        winners={winners}
        loading={winnersLoading}
        allTimePaidOut={data?.allTimePaidOut}
      />
    </div>
  );
}
