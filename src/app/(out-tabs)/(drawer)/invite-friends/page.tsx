import { ReferralInfoSection } from '@/components/pages/out-tabs/drawer/invite-friends/ReferralInfoSection';
import { ReferralStatsCard } from '@/components/pages/out-tabs/drawer/invite-friends/ReferralStatsCard';
import { InvitedFriendsList } from '@/components/pages/out-tabs/drawer/invite-friends/InvitedFriendsList';

export default function InviteFriendsPage() {
  return (
    <div className="flex flex-col gap-6 pb-10">
      <ReferralInfoSection />
      <ReferralStatsCard />
      <InvitedFriendsList />
    </div>
  );
}
