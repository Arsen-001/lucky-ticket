import { FriendsHeroCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsHeroCard';
import { FriendsRouletteCard } from '@/components/pages/out-tabs/drawer/invite-friends/roulette/FriendsRouletteCard';
import { FriendsTierLadderCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsTierLadderCard';
import { ReferralInfoSection } from '@/components/pages/out-tabs/drawer/invite-friends/ReferralInfoSection';
import { InvitedFriendsList } from '@/components/pages/out-tabs/drawer/invite-friends/InvitedFriendsList';

export default function InviteFriendsPage() {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-2">
      <div data-tour="referrals">
        <FriendsHeroCard />
      </div>
      {/* Сразу под «пригласи друзей»: это единственное на экране, что даёт за
          приглашения что-то прямо сейчас. Сам блок исчезает, когда игра
          выключена или игрок уже забрал подарок на «скоро». */}
      <FriendsRouletteCard />
      <FriendsTierLadderCard />
      <ReferralInfoSection />
      <InvitedFriendsList />
    </div>
  );
}
