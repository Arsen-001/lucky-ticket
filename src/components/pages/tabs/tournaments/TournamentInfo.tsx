'use client';

import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { Medal } from '@/components/shared/icons/Medal';
import type { HTMLAttributes } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import dayjs from 'dayjs';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';

interface TournamentDetailsProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TournamentInfo({ id, className, ...rest }: TournamentDetailsProps) {
  const { data, isLoading } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();

  const info = [
    {
      label: t('prize pool'),
      value: data ? `${data.prizePool} ${GlobalConstants.coinName}` : '',
    },
    {
      label: t('guaranteed pool'),
      value: data ? `${data.guaranteedPool} ${GlobalConstants.coinName}` : '',
    },
    {
      label: t('start'),
      value: data?.startTime ? dayjs(data.startTime).format('DD/MM/YYYY') : '',
    },
    {
      label: t('team size'),
      value: data?.teamSize ?? '',
    },
  ];

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)}>
      <div {...rest} className={'flex justify-between items-center gap-5'}>
        <Medal type={data?.type} loading={isLoading} height={130} />
        <div className="flex-1 max-w-60 flex flex-col gap-px">
          {info.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center gap-5 text-sm">
              <span className="text-pink-secondary font-medium whitespace-nowrap">{label}</span>
              <SkeletonSuspense
                loading={isLoading}
                skeleton={
                  <Skeleton
                    variant="text"
                    textSize="sm"
                    className="block flex-1 min-w-5 max-w-2/3"
                  />
                }
              >
                <GoldenText className="text-right font-semibold whitespace-nowrap">
                  {value}
                </GoldenText>
              </SkeletonSuspense>
            </div>
          ))}
          <div className="mt-1.5 w-full">
            <SkeletonSuspense
              loading={isLoading}
              skeleton={<Skeleton variant="card" className="h-8" />}
            >
              <Button className={twMerge('py-1 px-6 w-full', data?.participated && 'bg-success')}>
                {t(data?.participated ? 'add' : 'join')}
              </Button>
            </SkeletonSuspense>
          </div>
        </div>
      </div>
    </div>
  );
}
