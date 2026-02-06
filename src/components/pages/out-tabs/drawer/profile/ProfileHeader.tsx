'use client';
import { useGetMeQuery } from '@/api/me.api';
import { Avatar } from '@/components/shared/user-elements/Avatar';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { PrimeBadge } from '@/components/shared/badges/PrimeBadge';
import { VIPBadge } from '@/components/shared/badges/VIPBadge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';

export function ProfileHeader() {
  const { data: me, isLoading } = useGetMeQuery();

  return (
    <div className="flex flex-col items-center gap-4 py-6">
      <Avatar size={100} shadow className="border-4 border-white/10" />
      <div className="flex flex-col items-center">
        <SkeletonSuspense
          loading={isLoading}
          skeleton={<Skeleton variant="line" textSize="2xl" className="w-32" />}
        >
          <h1 className="text-2xl font-bold text-white">{me?.username}</h1>
        </SkeletonSuspense>
        <div className="flex gap-2 h-6.5 mt-2 overflow-hidden">
          {me?.isVerified && <VerifiedBadge />}
          {me?.isPrime && <PrimeBadge />}
          {me?.isVIP && <VIPBadge />}
        </div>
      </div>
    </div>
  );
}
