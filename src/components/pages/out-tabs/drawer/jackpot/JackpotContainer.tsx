'use client';

import { Flame } from 'lucide-react';
import { useGetJackpotQuery, useGetJackpotWinnersQuery } from '@/api/jackpot.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { formatCompact } from '@/utils/global/number.utils';
import { JackpotPotCard } from './JackpotPotCard';
import { JackpotSplitBand } from './JackpotSplitBand';
import { JackpotActionRow } from './JackpotActionRow';
import { JackpotMechanics } from './JackpotMechanics';
import { JackpotDropList } from './JackpotDropList';

/**
 * Jackpot page, in the LC wallet's card language: one dark card carrying the
 * pot, what each place takes out of it today, and the three ways into the draw
 * — then the drops as history. The pot and the balance are the app's two big
 * numbers, so their screens are built from the same parts.
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

  const lastDrop = winners?.[0];

  return (
    <div className="flex flex-col gap-4 px-4 pb-8 pt-2">
      <JackpotPotCard
        pot={data?.pot}
        loading={isLoading}
        className="animate-slide-in-bottom"
        chip={
          lastDrop && (
            <span className="bg-success/20 text-success inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold tabular-nums">
              <Flame size={11} strokeWidth={3} />
              {formatCompact(lastDrop.potTotal)}
              <span className="text-white/40">{t('last drop')}</span>
            </span>
          )
        }
      >
        <JackpotSplitBand pot={data?.pot} />
        <JackpotActionRow />
      </JackpotPotCard>

      <JackpotMechanics />

      <JackpotDropList
        winners={winners}
        loading={winnersLoading}
        allTimePaidOut={data?.allTimePaidOut}
      />
    </div>
  );
}
