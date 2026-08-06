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
import { FriendsClaimSummaryCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimSummaryCard';
import { FriendsQualificationNote } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsQualificationNote';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { claimableLcOf, countsAsReferral } from '@/utils/pages/referral.utils';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
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

const sumTickets = (friend: InvitedFriend) =>
  friend.claimableTickets.reduce((sum, ticket) => sum + ticket.amount, 0);

/**
 * Claimable right now: the LC reward needs the friend to still count as a
 * referral, the leftover tickets do not. Mirrors the backend gate exactly —
 * a button the API is about to 403 is worse than no button.
 */
const hasSomethingToClaim = (friend: InvitedFriend) =>
  (claimableLcOf(friend) > 0 && countsAsReferral(friend)) || sumTickets(friend) > 0;

export const InvitedFriendsList = () => {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: friends = [], isLoading, isError, refetch } = useGetInvitedFriendsQuery();
  const [claimFriend, { isLoading: isClaiming }] = useClaimFriendMutation();
  const [selectedFriend, setSelectedFriend] = useState<InvitedFriend | null>(null);
  const [cardFriend, setCardFriend] = useState<InvitedFriend | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
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
      withRewards: friends.filter(hasSomethingToClaim).length,
    };
  }, [friends]);

  const claimableLc = useMemo(
    () => friends.filter(countsAsReferral).reduce((sum, friend) => sum + claimableLcOf(friend), 0),
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
      const aReady = hasSomethingToClaim(a) ? 1 : 0;
      const bReady = hasSomethingToClaim(b) ? 1 : 0;
      if (aReady !== bReady) return bReady - aReady;
      return claimableLcOf(b) - claimableLcOf(a) || b.points - a.points;
    });
  }, [friends, tab]);

  const openCard = (friend: InvitedFriend) => {
    setCardFriend(friend);
    setCardOpen(true);
  };

  const handleClaim = async (friendId: string) => {
    // `claimFriend` without `.unwrap()` RESOLVES with `{error}` instead of
    // throwing, so a bare `await` could not tell success from failure.
    const result = await claimFriend({ friendId });
    if ('error' in result) toast.error(t('claim failed'));
  };

  const handleClaimAll = async () => {
    const targets = friends.filter(hasSomethingToClaim);
    if (!targets.length) return;

    const totalLc = targets
      .filter(countsAsReferral)
      .reduce((sum, friend) => sum + claimableLcOf(friend), 0);

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
          counts={{ friends: counts.friends, referrals: counts.referrals }}
        />
      )}

      {/* The rule, once, and only while it is actually costing this player
          something — a condition announced to someone it does not apply to is
          noise. @see FriendsQualificationNote */}
      {counts.notCounted > 0 && <FriendsQualificationNote notCounted={counts.notCounted} />}

      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <InvitedFriendRow key={i} loading />)
        ) : visibleFriends.length ? (
          visibleFriends.map((friend, index) => (
            <InvitedFriendRow
              key={friend.id}
              friend={friend}
              onClaim={setSelectedFriend}
              onOpenCard={openCard}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
            />
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

      {cardFriend && (
        <PlayerQuickCard
          key={cardFriend.id}
          open={cardOpen}
          onClose={() => setCardOpen(false)}
          userId={cardFriend.id}
          username={displayNameOf(cardFriend)}
          avatar={cardFriend.avatar}
          liked={cardFriend.liked}
          likesReceived={cardFriend.likesReceived}
          points={cardFriend.points}
          isVerified={cardFriend.isVerified}
          isLuckyPlayer={cardFriend.isLuckyPlayer}
          isVIP={cardFriend.isVIP}
        />
      )}
    </div>
  );
};
