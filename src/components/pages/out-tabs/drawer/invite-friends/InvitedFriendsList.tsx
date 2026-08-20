'use client';

import { useMemo, useState } from 'react';
import { useClaimFriendMutation, useGetInvitedFriendsQuery } from '@/api/referral.api';
import { ArrivalShine } from '@/components/shared/ArrivalShine';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { FriendClaimModal } from '@/components/pages/out-tabs/drawer/invite-friends/FriendClaimModal';
import { FriendsClaimAllModal } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimAllModal';
import { InvitedFriendRow } from '@/components/pages/out-tabs/drawer/invite-friends/InvitedFriendRow';
import { PlayerQuickCard } from '@/components/shared/user-elements/PlayerQuickCard';
import {
  FriendsTabs,
  type FriendsTab,
} from '@/components/pages/out-tabs/drawer/invite-friends/FriendsTabs';
import { FriendBranchList } from '@/components/pages/out-tabs/drawer/invite-friends/FriendBranchList';
import { NetworkList } from '@/components/pages/out-tabs/drawer/invite-friends/NetworkList';
import { FriendsClaimSummaryCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimSummaryCard';
import { FriendsQualificationNote } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsQualificationNote';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { useReferralCounts } from '@/hooks/useReferralCounts';
import {
  countsAsReferral,
  hasClaimableReward,
  totalClaimableLcOf,
} from '@/utils/pages/referral.utils';
import type { BranchMember, InvitedFriend } from '@/types/interfaces/referral.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { useToast } from '@/hooks/useToast';
import { displayNameOf } from '@/utils/global/user.utils';
import { staggerMs } from '@/utils/global/animation.utils';

const EMPTY_TICKETS: Record<TicketType, number> = {
  bronze: 0,
  silver: 0,
  gold: 0,
  platinum: 0,
  diamond: 0,
};

export const InvitedFriendsList = () => {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: friends = [], isLoading, isError, refetch } = useGetInvitedFriendsQuery();
  const [claimFriend, { isLoading: isClaiming }] = useClaimFriendMutation();
  // The tab badge, off the same per-friend counts the rows draw — so the number
  // on the tab can never disagree with the badges under it.
  const referralCounts = useReferralCounts();
  const [selectedFriend, setSelectedFriend] = useState<InvitedFriend | null>(null);
  const [cardFriend, setCardFriend] = useState<InvitedFriend | BranchMember | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [openBranchId, setOpenBranchId] = useState<string | null>(null);
  const [tab, setTab] = useState<FriendsTab>('friends');
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const [claimAllSnapshot, setClaimAllSnapshot] = useState<{
    friends: InvitedFriend[];
    totalLc: number;
  } | null>(null);

  const counts = useMemo(() => {
    const referrals = friends.filter(countsAsReferral).length;
    return {
      friends: friends.length,
      referrals,
      notCounted: friends.length - referrals,
      withRewards: friends.filter(hasClaimableReward).length,
    };
  }, [friends]);

  const claimableLc = useMemo(
    () =>
      friends.filter(countsAsReferral).reduce((sum, friend) => sum + totalClaimableLcOf(friend), 0),
    [friends]
  );

  const ticketsByType = useMemo(() => {
    const result: Record<TicketType, number> = { ...EMPTY_TICKETS };
    for (const friend of friends) {
      for (const { type, amount } of friend.claimableTickets) {
        result[type] += amount;
      }
    }
    return result;
  }, [friends]);

  const visibleFriends = useMemo(() => {
    const filtered = tab === 'referrals' ? friends.filter(countsAsReferral) : friends;
    return [...filtered].sort((a, b) => {
      const aReady = hasClaimableReward(a) ? 1 : 0;
      const bReady = hasClaimableReward(b) ? 1 : 0;
      if (aReady !== bReady) return bReady - aReady;
      return totalClaimableLcOf(b) - totalClaimableLcOf(a) || b.points - a.points;
    });
  }, [friends, tab]);

  /**
   * The quick-card takes anyone with a profile, so a branch member opens the
   * same sheet a friend does — `BranchMember` carries the fields it reads.
   */
  const openCard = (player: InvitedFriend | BranchMember) => {
    setCardFriend(player);
    setCardOpen(true);
  };

  // One branch open at a time: two expanded lists on a 390px screen push the
  // rows below them off the fold, and nobody compares two branches at once.
  const toggleBranch = (friend: InvitedFriend) =>
    setOpenBranchId(current => (current === friend.id ? null : friend.id));

  const handleClaim = async (friendId: string) => {
    // `claimFriend` without `.unwrap()` RESOLVES with `{error}` instead of
    // throwing, so a bare `await` could not tell success from failure.
    const result = await claimFriend({ friendId });
    if ('error' in result) toast.error(t('claim failed'));
  };

  const handleClaimAll = async () => {
    const targets = friends.filter(hasClaimableReward);
    if (!targets.length) return;

    const totalLc = targets
      .filter(countsAsReferral)
      .reduce((sum, friend) => sum + totalClaimableLcOf(friend), 0);

    setIsClaimingAll(true);
    let claimed = 0;
    let failed = 0;
    try {
      for (const friend of targets) {
        const result = await claimFriend({ friendId: friend.id });
        if ('error' in result) failed += 1;
        else claimed += 1;
      }
    } finally {
      setIsClaimingAll(false);
    }

    if (failed) toast.error(t('claim failed'));
    // The celebration is raised AFTER the requests, and only when something was
    // actually granted. It used to be opened from a local snapshot before the
    // first call went out, so a refusal — which the backend returns for a
    // duplicate claim instead of quietly granting twice — still announced
    // "+N" the player never received.
    if (!claimed) return;

    setClaimAllSnapshot({ friends: targets, totalLc });
  };

  if (isError && !friends.length) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <FriendsClaimSummaryCard
        claimableLc={claimableLc}
        friendsWithRewards={counts.withRewards}
        ticketsByType={ticketsByType}
        loading={isClaimingAll}
        onClaimAll={handleClaimAll}
      />

      <ArrivalShine id="sendTicket" variant="title">
        <h3 className="px-1 text-base font-bold">{t('your friends')}</h3>
      </ArrivalShine>

      {friends.length > 0 && (
        <FriendsTabs
          active={tab}
          onChange={setTab}
          counts={{
            friends: counts.friends,
            referrals: counts.referrals,
            network: referralCounts.network,
          }}
        />
      )}

      {/* The rule, once, and only while it is actually costing this player
          something — a condition announced to someone it does not apply to is
          noise. @see FriendsQualificationNote */}
      {counts.notCounted > 0 && (
        <FriendsQualificationNote
          notCounted={counts.notCounted}
          // A single burned row switches the whole note: the burn is this
          // player's own doing and outranks anything a friend did, so telling
          // them «следи, чтобы друг был в канале» would point at the wrong
          // person entirely. @see FriendsQualificationNote
          burned={friends.some(friend => friend.notCountedReason === 'burned')}
        />
      )}

      <div className="flex flex-col gap-2">
        {tab === 'network' ? (
          <NetworkList onOpenCard={openCard} />
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <InvitedFriendRow key={i} loading />)
        ) : visibleFriends.length ? (
          visibleFriends.map((friend, index) => (
            // The branch renders BESIDE the row, not inside it: a row is a
            // <button> whenever it has an action, and the branch is a list of
            // buttons — nesting them is invalid and swallows the inner taps.
            <div key={friend.id} className="flex flex-col gap-1.5">
              <InvitedFriendRow
                friend={friend}
                onClaim={setSelectedFriend}
                onOpenCard={openCard}
                onToggleBranch={toggleBranch}
                branchOpen={openBranchId === friend.id}
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
              />
              {openBranchId === friend.id && (
                <FriendBranchList
                  friendId={friend.id}
                  open
                  onOpenMember={openCard}
                  className="animate-slide-in-bottom"
                />
              )}
            </div>
          ))
        ) : friends.length > 0 ? (
          <EmptyDataInfo className="mt-6" description={t('no referrals yet')} />
        ) : (
          <EmptyDataInfo
            className="mt-6"
            title={t('no invited friends')}
            description={t('no friends yet description')}
          />
        )}
      </div>

      {selectedFriend && (
        <FriendClaimModal
          open={!!selectedFriend}
          onClose={() => setSelectedFriend(null)}
          friend={selectedFriend}
          onClaim={handleClaim}
          isClaiming={isClaiming}
        />
      )}

      {claimAllSnapshot && (
        <FriendsClaimAllModal
          open={!!claimAllSnapshot}
          onClose={() => setClaimAllSnapshot(null)}
          friends={claimAllSnapshot.friends}
          totalLc={claimAllSnapshot.totalLc}
          isClaiming={isClaimingAll}
        />
      )}

      {/* A branch member carries no like state — the friends endpoint resolves
          that only for people you invited yourself — so those two props fall
          back to neutral values and the card opens unliked rather than not at
          all. */}
      {cardFriend && (
        <PlayerQuickCard
          key={cardFriend.id}
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          userId={cardFriend.id}
          username={displayNameOf(cardFriend)}
          avatar={cardFriend.avatar}
          liked={'liked' in cardFriend ? cardFriend.liked : false}
          likesReceived={'likesReceived' in cardFriend ? cardFriend.likesReceived : 0}
          points={cardFriend.points}
          isVerified={cardFriend.isVerified}
          isLuckyPlayer={cardFriend.isLuckyPlayer}
          isVIP={cardFriend.isVIP}
        />
      )}
    </div>
  );
};
