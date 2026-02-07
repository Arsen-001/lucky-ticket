import { ChevronsUp } from 'lucide-react';
import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { icons } from '@/constants/icons';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import type { CSSProperties } from 'react';

interface Props {
  name: string;
  points: number;
  image: string;
  place: number;
  loading?: boolean;
  outline?: boolean;
  className?: string;
  style?: CSSProperties;
}

export const LeaderboardTopItem = ({
  name,
  points,
  image,
  place,
  loading,
  outline,
  className,
  style,
}: Props) => {
  const isFirst = place === 1;

  return (
    <div
      style={style}
      className={twMerge(
        'relative w-25.5 mt-5.25 p-2 flex-col-stretch rounded-t-full',
        isFirst ? ' gap-8 h-50' : ' gap-5 h-43',
        className
      )}
    >
      <div
        className={twMerge(
          'absolute inset-0 rounded-t-full -z-1',
          isFirst
            ? 'bg-[linear-gradient(to_bottom,theme(colors.gradient-darkpink)_0%,theme(colors.gradient-darkpink)_70%,transparent_100%)]'
            : 'bg-[linear-gradient(to_bottom,theme(colors.gradient-darkpink)_0%,theme(colors.gradient-darkpink)_45%,transparent_100%)]',
          outline && 'border-2 border-b-0 border-white-secondary bg-primary/10'
        )}
      />
      {isFirst && (
        <Image
          className={twMerge(
            'h-auto absolute -z-2 -top-5 left-1/2 -translate-x-1/2',
            loading && 'animation-blink'
          )}
          src={icons.crown}
          alt="crown"
          width={40}
        />
      )}
      <div className="relative p-1.5 border-2 border-gray-400 rounded-full">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="round" className="w-full h-full aspect-square" />}
        >
          <Image
            className="rounded-full"
            loading="eager"
            src={image}
            alt={name}
            width={100}
            height={100}
          />
        </SkeletonSuspense>
        {!loading && (
          <div className="absolute p-1.25 w-8 aspect-square bg-gradient-darkpink rounded-full bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className={'w-full h-full bg-teal-600 flex-center aspect-square rounded-full'}>
              <span className="font-semibold translate-y-px">{place}</span>
            </div>
          </div>
        )}
      </div>
      <div className="overflow-hidden flex flex-col items-center gap-px">
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="w-16" />}
        >
          <div className="font-semibold  text-center truncate w-full">{name}</div>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading}
          skeleton={<Skeleton variant="line" textSize="sm" className="w-12" />}
        >
          <div className="flex-center text-gold text-sm">
            <ChevronsUp size={16} />
            <div className="h-4.5 font-semibold">{points}</div>
          </div>
        </SkeletonSuspense>
      </div>
    </div>
  );
};
