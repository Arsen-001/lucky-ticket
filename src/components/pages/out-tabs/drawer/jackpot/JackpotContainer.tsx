'use client';

import { useGetJackpotQuery, useGetJackpotWinnersQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Button } from '@/components/shared/buttons/Button';
import { JackpotHero } from './JackpotHero';
import { JackpotInvolvement } from './JackpotInvolvement';
import { JackpotHowItWorks } from './JackpotHowItWorks';
import { JackpotDistributionBar } from './JackpotDistributionBar';
import { JackpotWinnersFeed } from './JackpotWinnersFeed';

export function JackpotContainer() {
  const t = useAppTranslations();
  const { data, isLoading, isError, refetch } = useGetJackpotQuery();
  const { data: winners, isLoading: winnersLoading } = useGetJackpotWinnersQuery();

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-4 px-4 pb-6 pt-12 text-center">
        <p className="text-white-secondary text-sm font-medium">{t('couldnt load jackpot')}</p>
        <Button variant="secondary" className="px-5 py-2.5 text-sm" onClick={() => refetch()}>
          {t('retry')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pb-8 pt-2">
      <JackpotHero data={data} loading={isLoading} />
      <JackpotInvolvement activeTournaments={data?.myActiveTournamentsCount} loading={isLoading} />
      <JackpotHowItWorks />
      <JackpotDistributionBar />
      <JackpotWinnersFeed winners={winners} loading={winnersLoading} />
    </div>
  );
}
