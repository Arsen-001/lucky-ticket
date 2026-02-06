'use client';
import { ProfileHeader } from '@/components/pages/out-tabs/drawer/profile/ProfileHeader';
import { ProfileStats } from '@/components/pages/out-tabs/drawer/profile/ProfileStats';
import { ProfilePerformance } from '@/components/pages/out-tabs/drawer/profile/ProfilePerformance';
import { ProfileRank } from '@/components/pages/out-tabs/drawer/profile/ProfileRank';
import { ProfileActions } from '@/components/pages/out-tabs/drawer/profile/ProfileActions';
import { Divider } from '@/components/shared/Divider';

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-8 -mb-10">
      <ProfileHeader />
      <div className="flex-col-stretch gap-4 bg-purple-gradient -mx-5 py-10 px-5 mb-2 rounded-t-3xl">
        <ProfileRank />
        <ProfileStats />
        <Divider className="opacity-15 mx-4" />
        <ProfilePerformance />
        <Divider className="opacity-15 mx-4" />
        <ProfileActions />
      </div>
    </div>
  );
}
