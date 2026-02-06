'use client';
import { twMerge } from 'tailwind-merge';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { useGetMeQuery } from '@/api/me.api';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import Image from 'next/image';
import { icons } from '@/constants/icons';
import { GlobalConstants } from '@/constants/global.constants';
import { Button } from '@/components/shared/buttons/Button';
import { AlignRight } from 'lucide-react';
import type { ClassNameProps } from '@/types/interfaces/component.interfcaes';
import { useAppDispatch } from '@/lib/rtk/hooks';
import { openDrawer } from '@/lib/rtk/features/layout.slice';
import { Link } from '@/components/shared/links/Link';
import { routes } from '@/constants/routes';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';

export function Header({ className }: ClassNameProps) {
  const dispatch = useAppDispatch();

  const { data: me, isLoading } = useGetMeQuery();

  const handleDrawerOpen = () => {
    dispatch(openDrawer());
  };

  return (
    <div
      className={twMerge(
        'h-20 w-screen bg-header py-1 px-3 flex justify-between gap-3 items-center overflow-hidden',
        className
      )}
    >
      <div className="flex-1 overflow-hidden pl-2 py-2 flex items-center gap-4">
        <Link className="rounded-full" href={routes.profile}>
          <Avatar shadow />
        </Link>
        <div className="w-full overflow-hidden flex flex-col items-start gap-1">
          <SkeletonSuspense
            loading={isLoading}
            skeleton={
              <>
                <Skeleton variant="line" textSize="base" className="w-40" />
                <Skeleton variant="rounded-rectangle" className=" h-6 w-21.5" />
              </>
            }
          >
            <div className="w-full flex items-center gap-3">
              <div className="w-full flex-center gap-2 overflow-hidden">
                <span className="w text-white-secondary text-base font-bold truncate">
                  {me?.username}
                </span>

                <div className="flex-center gap-1">
                  {me?.isVerified && <VerifiedBadge hideText />}
                  {me?.isPrime && <PrimeBadge hideText />}
                  {me?.isVIP && <VIPBadge hideText />}
                </div>
              </div>
            </div>
            <div className="bg-gradient-lightpink/30 flex-center gap-2 text-white-secondary text-sm font-semibold rounded-full py-0.5 px-2.5">
              <div className="flex items-center gap-1">
                <Image src={icons.coin} alt="coin" className="w-3" />
                <span className="font-semibold h-4.5">{GlobalConstants.coinName}</span>
              </div>
              <span className="font-semibold h-4.5">{me?.coins}</span>
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
