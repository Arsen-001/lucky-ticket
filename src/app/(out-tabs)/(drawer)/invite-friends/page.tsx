import { FriendsHeroCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsHeroCard';
import { ReferralInfoSection } from '@/components/pages/out-tabs/drawer/invite-friends/ReferralInfoSection';
import { InvitedFriendsList } from '@/components/pages/out-tabs/drawer/invite-friends/InvitedFriendsList';

export default function InviteFriendsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <FriendsHeroCard />
      <ReferralInfoSection />
      <InvitedFriendsList />
    </div>
  );
}
