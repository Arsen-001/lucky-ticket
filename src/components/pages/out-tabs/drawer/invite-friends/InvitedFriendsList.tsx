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
  FriendsFilterChips,
  type FriendsFilter,
} from '@/components/pages/out-tabs/drawer/invite-friends/FriendsFilterChips';
import { FriendsClaimSummaryCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimSummaryCard';
import { FriendsQualificationNote } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsQualificationNote';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { countsAsReferral } from '@/utils/pages/referral.utils';
import type { ClaimableTicket, InvitedFriend } from '@/types/interfaces/referral.interfaces';
import type { TicketType } from '@/types/types/ticket.types';
import { useToast } from '@/hooks/useToast';
import { displayNameOf } from '@/utils/global/user.utils';

const EMPTY_TICKETS: Record<TicketType, number> = {
  bronze: 0,
  silver: 0,
  gold: 0,
  platinum: 0,
  diamond: 0,
};

const sumClaimable = (friend: InvitedFriend) =>
  friend.claimableTickets.reduce((sum, ticket) => sum + ticket.amount, 0);

export const InvitedFriendsList = () => {
  const t = useAppTranslations();
  const toast = useToast();
  const { data: friends = [], isLoading, isError, refetch } = useGetInvitedFriendsQuery();
  const [claimFriend, { isLoading: isClaiming }] = useClaimFriendMutation();
  const [selectedFriend, setSelectedFriend] = useState<InvitedFriend | null>(null);
  const [cardFriend, setCardFriend] = useState<InvitedFriend | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [filter, setFilter] = useState<FriendsFilter>('all');
  const [isClaimingAll, setIsClaimingAll] = useState(false);
  const [claimAllSnapshot, setClaimAllSnapshot] = useState<{
    friends: InvitedFriend[];
    ticketsByTier: ClaimableTicket[];
    totalTickets: number;
  } | null>(null);

  const counts = useMemo(() => {
    const referrals = friends.filter(countsAsReferral).length;
    return {
      all: friends.length,
      referrals,
      'not-counted': friends.length - referrals,
      'with-rewards': friends.filter(f => f.claimableTickets.length > 0).length,
      premium: friends.filter(f => f.isTelegramPremium).length,
    };
  }, [friends]);

  const claimableTotal = useMemo(
    () => friends.reduce((sum, friend) => sum + sumClaimable(friend), 0),
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

  const filteredFriends = useMemo(() => {
    const filtered = friends.filter(friend => {
      if (filter === 'with-rewards') return friend.claimableTickets.length > 0;
      if (filter === 'premium') return !!friend.isTelegramPremium;
      if (filter === 'referrals') return countsAsReferral(friend);
      if (filter === 'not-counted') return !countsAsReferral(friend);
      return true;
    });
    return [...filtered].sort((a, b) => {
      const aReady = a.claimableTickets.length > 0 ? 1 : 0;
      const bReady = b.claimableTickets.length > 0 ? 1 : 0;
      if (aReady !== bReady) return bReady - aReady;
      return sumClaimable(b) - sumClaimable(a) || b.points - a.points;
    });
  }, [friends, filter]);

  const openCard = (friend: InvitedFriend) => {
    setCardFriend(friend);
    setCardOpen(true);
  };

  const handleClaim = async (friendId: string) => {
    // `claimFriend` without `.unwrap()` RESOLVES with `{error}` instead of
    // throwing, so the old bare `await` could not tell success from failure.
    const result = await claimFriend({ friendId });
    if ('error' in result) toast.error(t('claim failed'));
  };

  const handleClaimAll = async () => {
    const targets = friends.filter(f => f.claimableTickets.length > 0);
    if (!targets.length) return;

    const snapshotByTier: Record<TicketType, number> = { ...EMPTY_TICKETS };
    let total = 0;
    for (const friend of targets) {
      for (const { type, amount } of friend.claimableTickets) {
        snapshotByTier[type] += amount;
        total += amount;
      }
    }

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
    // first call went out, so a refusal — which the backend now returns for a
    // duplicate claim instead of quietly granting twice — still announced
    // "+N tickets" the player never received.
    if (!claimed) return;

    setClaimAllSnapshot({
      friends: targets,
      ticketsByTier: (Object.entries(snapshotByTier) as [TicketType, number][])
        .filter(([, amount]) => amount > 0)
        .map(([type, amount]) => ({ type, amount })),
      totalTickets: total,
    });
  };

  if (isError && !friends.length) {
    return <QueryErrorState onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col gap-3">
      <FriendsClaimSummaryCard
        claimableTotal={claimableTotal}
        friendsWithRewards={counts['with-rewards']}
        ticketsByType={ticketsByType}
        loading={isClaimingAll}
        onClaimAll={handleClaimAll}
      />

      <div className="flex items-center justify-between gap-2 px-1">
        <ArrivalShine id="sendTicket" variant="title">
          <h3 className="text-base font-bold">
            {t('invited friends count', { count: friends.length })}
          </h3>
        </ArrivalShine>
        {counts['not-counted'] > 0 && (
          <span className="text-white-secondary flex-shrink-0 text-[11px] font-semibold tabular-nums">
            {t('n of m are referrals', { count: counts.referrals, total: friends.length })}
          </span>
        )}
      </div>

      {counts['not-counted'] > 0 && <FriendsQualificationNote notCounted={counts['not-counted']} />}

      {friends.length > 0 && (
        <FriendsFilterChips active={filter} onChange={setFilter} counts={counts} />
      )}

      <div className="flex flex-col gap-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <InvitedFriendRow key={i} loading />)
        ) : filteredFriends.length ? (
          filteredFriends.map((friend, index) => (
            <InvitedFriendRow
              key={friend.id}
              friend={friend}
              onClaim={setSelectedFriend}
              onOpenCard={openCard}
              className="animate-slide-in-bottom"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))
        ) : friends.length > 0 ? (
          <EmptyDataInfo className="mt-6" description={t('no rewards yet')} />
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
          totalTickets={claimAllSnapshot.totalTickets}
          ticketsByTier={claimAllSnapshot.ticketsByTier}
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
