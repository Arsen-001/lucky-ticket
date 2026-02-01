'use client';

import { useGetTournamentPlacesQuery } from '@/api/tournaments.api';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Trophy } from '@/components/shared/icons/Trophy';
import { Tabs } from '@/components/shared/Tabs';
import { TournamentPlacementsTable } from './TournamentPlacementsTable';

export function TournamentPlacements({ id }: { id: string }) {
  const { data, isLoading } = useGetTournamentPlacesQuery(id);
  const t = useAppTranslations();

  const trophies = [
    { type: 'silver', place: t('2nd') },
    { type: 'gold', place: t('1st') },
    { type: 'bronze', place: t('3rd') },
  ] as const;

  return (
    <div className="mt-8 flex flex-col">
      <div className="flex justify-center items-end gap-4">
        {trophies.map(({ type, place }) => (
          <div key={type} className="flex flex-col items-center gap-1">
            {place === t('1st') ? (
              <GoldenText className="font-semibold">{place}</GoldenText>
            ) : (
              <span className="text-white-secondary font-semibold">{place}</span>
            )}

            <Trophy type={type} height={type === 'gold' ? 140 : 120} />
          </div>
        ))}
      </div>

      <Tabs
        className="mt-6"
        classNames={{ tab: 'py-1 min-w-30 truncate' }}
        items={[
          {
            key: 'places',
            title: t('places'),
            children: <TournamentPlacementsTable places={data?.places} isLoading={isLoading} />,
          },
          {
            key: 'guaranteed',
            title: t('guaranteed'),
            children: <TournamentPlacementsTable places={data?.guaranteed} isLoading={isLoading} />,
          },
        ]}
      />
    </div>
  );
}
