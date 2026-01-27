'use client';
import type { Tournament } from '@/types/interfaces/tournaments.interfaces';
import { Medal } from '@/components/shared/icons/Medal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { GlobalConstants } from '@/constants/global.constants';
import dayjs from 'dayjs';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { Button } from '@/components/shared/buttons/Button';
import { useCountDown } from '@/hooks/useCountDown';
import { twMerge } from 'tailwind-merge';
import { Ticket } from 'lucide-react';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';

export interface TournamentCardProps extends Tournament {
  loading?: boolean;
  participated?: boolean;
  participatedTicketsCount?: number;
}

export function TournamentCard({
  id,
  type,
  startTime,
  name,
  prizePool,
  guaranteedPool,
  teamSize,
  loading,
  participated = false,
  participatedTicketsCount,
}: TournamentCardProps) {
  const t = useAppTranslations();
  const hasParticipated = participated;
  const { leftTime } = useCountDown(hasParticipated ? undefined : startTime);
  const ticketCount = participatedTicketsCount ?? 0;
  const leftLabel = hasParticipated ? (
    <span className="inline-flex items-center gap-1.5 leading-none align-middle">
      <Ticket className="w-4 h-4" />
      <span className="leading-none h-2.5">{ticketCount}</span>
    </span>
  ) : (
    leftTime
  );

  const info = [
    {
      label: t('prize pool'),
      value: `${prizePool} ${GlobalConstants.coinName}`,
    },
    {
      label: t('guaranteed pool'),
      value: `${guaranteedPool} ${GlobalConstants.coinName}`,
    },
    {
      label: t('start'),
      value: dayjs(startTime).format('DD/MM/YYYY'),
    },
    {
      label: t('team size'),
      value: teamSize,
    },
  ];
  return (
    <div className="w-full px-4 pt-1.5 pb-2.5 bg-purple-gradient card-outlined rounded-xl overflow-visible">
      <div className="h-20 bg-white/8 rounded-lg flex items-center justify-center">
        <div className={participated ? 'shine-[130px]' : undefined}>
          <Medal
            className="transform -translate-y-1 z-1"
            height={86}
            type={type}
            loading={loading}
          />
        </div>
      </div>
      <SkeletonSuspense
        loading={loading}
        skeleton={<Skeleton variant="title" textSize="sm" className="w-32 mx-auto mt-1.5" />}
      >
        <h5 className="text-center text-sm font-semibold mt-1.5">{name}</h5>
      </SkeletonSuspense>
      <div className="mt-2 flex flex-col gap-0.5">
        {info.map(({ label, value }) => (
          <div key={label} className="flex justify-between text-xs">
            <span className="text-pink-secondary">{label}</span>
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="text" textSize="xs" className="w-12" />}
            >
              <GoldenText className="text-right">{value}</GoldenText>
            </SkeletonSuspense>
          </div>
        ))}
      </div>

      <div className={'flex items-center justify-between bg-gradient-purple rounded-full mt-2'}>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="rounded-rectangle" className="h-7" />}
        >
          <GoldenText className="text-xs ml-1">{leftLabel}</GoldenText>
          <Link href={routes.tournaments.tournamentById(id)}>
            <Button
              disabled={loading}
              className={twMerge(
                'text-xs rounded-full py-1.5 px-4.5',
                hasParticipated ? 'bg-success' : null
              )}
            >
              {t(hasParticipated ? 'add' : 'join')}
            </Button>
          </Link>
        </SkeletonSuspense>
      </div>
    </div>
  );
}
