'use client';
import type { MedalType } from '@/components/shared/icons/Medal';
import { Medal } from '@/components/shared/icons/Medal';
import { GoldenText } from '@/components/shared/typography/GoldenText';
import { useCountDown } from '@/hooks/useCountDown';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { useRouter } from 'next/navigation';
import { GlobalConstants } from '@/constants/global.constants';

interface Info {
  label: string;
  value: string | number;
}

export interface TournamentSlideCardsProps {
  id: string;
  type: MedalType;
  name: string;
  startTime: string;
  className?: string;
  teamSize: number;
  prizePool: number;
  loading?: boolean;
  disabled?: boolean;
}

export function TournamentSlideCards({
  id,
  type,
  startTime,
  name,
  className,
  prizePool,
  teamSize,
  loading,
  disabled,
}: TournamentSlideCardsProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const { leftTime, expired } = useCountDown(startTime);

  const handleNavigate = () => {
    router.push(`/tournaments/${id}`);
  };

  const info: Info[] = [
    {
      label: t('prize pool'),
      value: prizePool + ' ' + GlobalConstants.coinName,
    },
    {
      label: t('team size'),
      value: teamSize,
    },
  ];

  return (
    <div
      className={twMerge(
        'pl-5 pr-2 py-3 w-72 bg-purple-gradient card-outlined rounded-lg relative',
        className,
        disabled && 'filter grayscale-50 cursor-not-allowed'
      )}
    >
      <div className="max-w-37 flex flex-col gap-1">
        <SkeletonSuspense
          loading={loading}
          skeleton={
            <>
              <Skeleton variant="line" className="h-6" />
              <Skeleton variant="line" className="h-5.5 w-20 mt-0.5" />
            </>
          }
        >
          <h5 title={name} className="text-base truncate">
            {name}
          </h5>
          <GoldenText className="text-base">{leftTime}</GoldenText>
        </SkeletonSuspense>
      </div>

      <Medal
        className={twMerge(
          'absolute right-15 transform translate-x-1/2 -translate-y-26 transition opacity-80 drop-shadow-3xl',
          loading && 'animation-blink'
        )}
        loading={loading}
        type={type}
        height={200}
      />

      <div className="w-full flex justify-evenly gap-2 mt-2 text-xs overflow-hidden">
        {info.map(({ label, value }) => (
          <div key={label} className="flex-center text-center flex-col flex-1 overflow-hidden">
            <span className="text-pink-secondary text-center truncate w-full">{label}</span>
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="line" textSize="xs" />}
            >
              <GoldenText>{value}</GoldenText>
            </SkeletonSuspense>
          </div>
        ))}
      </div>

      <Button
        disabled={loading || expired}
        onClick={handleNavigate}
        className="mt-2 text-sm py-2 px-4 w-45"
      >
        {t('play')}
      </Button>
    </div>
  );
}
