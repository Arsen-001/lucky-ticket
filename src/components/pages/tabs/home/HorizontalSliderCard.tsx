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

interface Info {
  label: string;
  value: string | number;
}

export interface VerticalSliderCardProps {
  type: MedalType;
  name: string;
  startTime: string;
  className?: string;
  teamSize: number;
  prizePool: number;
  guaranteedPool: number;
  loading?: boolean;
  disabled?: boolean;
}

export function HorizontalSliderCard({
  type,
  startTime,
  name,
  className,
  prizePool,
  guaranteedPool,
  teamSize,
  loading,
  disabled,
}: VerticalSliderCardProps) {
  const t = useAppTranslations();
  const { leftTime, expired } = useCountDown(startTime);

  const info: Info[] = [
    {
      label: t('prize pool'),
      value: prizePool + '$',
    },
    {
      label: t('team size'),
      value: teamSize,
    },
    {
      label: t('guaranteed'),
      value: guaranteedPool + '$',
    },
  ];

  return (
    <div
      className={twMerge(
        'pl-5 pr-2 py-3 w-72 bg-purple-gradient purple-gradient-outlined rounded-lg relative',
        className,
        disabled && 'filter grayscale-50 cursor-not-allowed'
      )}
    >
      <div className="max-w-37 flex flex-col gap-1">
        <SkeletonSuspense
          loading={loading}
          skeleton={
            <>
              <Skeleton variant="title" />
              <Skeleton variant="title" className="w-16" />
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
          'absolute h-28.5 w-auto right-15 transform translate-x-1/2 -translate-y-26 transition opacity-80',
          loading && 'animation-blink'
        )}
        loading={loading}
        type={type}
        width={100}
        height={100}
      />

      <div className="flex justify-evenly gap-2 mt-2 text-xs">
        {info.map(({ label, value }) => (
          <div key={label} className="flex-center flex-col max-w-1/3">
            <span className="text-pink-secondary">{label}</span>
            <SkeletonSuspense
              loading={loading}
              skeleton={<Skeleton variant="text" textSize="xs" />}
            >
              <GoldenText>{value}</GoldenText>
            </SkeletonSuspense>
          </div>
        ))}
      </div>

      <Button disabled={loading || expired} className="mt-2 text-sm py-2 px-4 w-45">
        {t('play')}
      </Button>
    </div>
  );
}
