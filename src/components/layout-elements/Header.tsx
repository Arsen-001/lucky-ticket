'use client';
import { twMerge } from 'tailwind-merge';
import { Avatar } from '@/components/shared/Avatar';
import { useGetMeQuery } from '@/api/me.api';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';
import { Skeleton } from '@/components/shared/Skeleton';
import { SkeletonSuspense } from '@/components/shared/SkeletonSuspense';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { GlobalConstants } from '@/constants/global.constants';
import { Button } from '@/components/shared/buttons/Button';
import { AlignRight } from 'lucide-react';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { openDrawer } from '@/lib/rtk/features/layout.slice';

export function Header({ className }: ClassNameProps) {
  const dispatch = useAppDispatch();

  const { data: me, isLoading } = useGetMeQuery();

  const handleDrawerOpen = () => {
    dispatch(openDrawer());
  };

  return (
    <div
      className={twMerge(
        'h-20 bg-header py-1 px-3 flex justify-between items-center',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Avatar shadow />
        <div className="flex flex-col items-start gap-1">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={
              <>
                <Skeleton variant="title" textSize="base" className="w-40" />
                <Skeleton variant="rounded-rectangle" className=" h-6 w-21.5" />
              </>
            }
          >
            <div className="flex items-center gap-3">
              <div className="flex-center gap-2">
                <span className="text-white-secondary text-base font-bold">
                  {me?.username}
                </span>

                {me?.isVerified && <VerifiedBadge hideText />}
                {me?.isPrime && <PrimeBadge hideText />}
              </div>
            </div>
            <div className="bg-gradient-lightpink/30 flex-center gap-2 text-white-secondary text-sm font-semibold rounded-full py-0.5 px-2.5">
              <Image src={icons.coin} alt="coin" height={14} width={14} />
              {GlobalConstants.coinName}
              <span>{me?.coins}</span>
            </div>
          </SkeletonSuspense>
        </div>
      </div>
      <Button onClick={handleDrawerOpen} variant="transparent" className="p-1">
        <AlignRight className="w-7 h-7" />
      </Button>
    </div>
  );
}
