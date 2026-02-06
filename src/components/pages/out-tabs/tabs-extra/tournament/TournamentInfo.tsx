'use client';

import { useGetTournamentByIdQuery } from '@/api/tournaments.api';
import { Medal } from '@/components/shared/icons/Medal';
import type { HTMLAttributes } from 'react';
import React, { useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import dayjs from 'dayjs';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { TournamentBetModal } from './TournamentBetModal';
import { Ticket } from 'lucide-react';

interface TournamentDetailsProps extends HTMLAttributes<HTMLDivElement> {
  id: string;
}

export function TournamentInfo({ id, className, ...rest }: TournamentDetailsProps) {
  const { data, isLoading } = useGetTournamentByIdQuery(id);
  const t = useAppTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const info: { label: string; value: React.ReactNode }[] = [
    {
      label: t('prize pool'),
      value: data ? `${data.prizePool} ${GlobalConstants.coinName}` : '',
    },
    {
      label: t('guaranteed'),
      value: data ? `${data.guaranteed} ${GlobalConstants.coinName}` : '',
    },
    {
      label: t('start'),
      value: data?.startTime ? dayjs(data.startTime).format('DD/MM/YYYY') : '',
    },
    {
      label: t('team size'),
      value: data?.teamSize ?? '',
    },
    ...(data?.participated
      ? [
          {
            label: t('participated tickets'),
            value: (
              <span className="inline-flex items-center gap-1 leading-none">
                <span>{data.participatedTicketsCount ?? 0}</span>
                <Ticket className="w-4 h-4" />
              </span>
            ),
          },
        ]
      : []),
  ];

  return (
    <div className={twMerge('max-w-full overflow-hidden', className)}>
      <div {...rest} className={'flex justify-between items-center gap-3'}>
        <Medal
          className="drop-shadow-xl drop-shadow-black/30"
          type={data?.type}
          loading={isLoading}
          height={130}
        />
        <div className="flex-1 max-w-60 flex flex-col gap-px p-1">
          {info.map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center gap-3 text-sm">
              <span className="text-pink-secondary font-medium">{label}</span>
              <SkeletonSuspense
                loading={isLoading}
                skeleton={
                  <Skeleton
                    variant="line"
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
              <Button
                className={twMerge('py-1 px-6 w-full', data?.participated && 'bg-success')}
                onClick={handleOpenModal}
              >
                {t(data?.participated ? 'add' : 'join')}
              </Button>
            </SkeletonSuspense>
          </div>
        </div>
      </div>

      <TournamentBetModal
        open={isModalOpen}
        onClose={handleCloseModal}
        participatedTicketsCount={data?.participatedTicketsCount}
      />
    </div>
  );
}
