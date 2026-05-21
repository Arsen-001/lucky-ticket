'use client';

import { useMemo, useState } from 'react';
import { useClaimFriendMutation, useGetInvitedFriendsQuery } from '@/api/referral.api';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { FriendClaimModal } from '@/components/pages/out-tabs/drawer/invite-friends/FriendClaimModal';
import { FriendsClaimAllModal } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimAllModal';
import { InvitedFriendRow } from '@/components/pages/out-tabs/drawer/invite-friends/InvitedFriendRow';
import { PlayerQuickCard } from '@/components/shared/user-elements/PlayerQuickCard';
import {
  FriendsFilterChips,
  type FriendsFilter,
} from '@/components/pages/out-tabs/drawer/invite-friends/FriendsFilterChips';
import { FriendsClaimSummaryCard } from '@/components/pages/out-tabs/drawer/invite-friends/FriendsClaimSummaryCard';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClaimableTicket, InvitedFriend } from '@/types/interfaces/referral.interfaces';
import type { TicketType } from '@/types/types/ticket.types';

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
  const { data: friends = [], isLoading } = useGetInvitedFriendsQuery();
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

  const counts = useMemo(
    () => ({
      all: friends.length,
      'with-rewards': friends.filter(f => f.claimableTickets.length > 0).length,
      premium: friends.filter(f => f.isTelegramPremium).length,
    }),
    [friends]
  );

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
    await claimFriend({ friendId });
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

    setClaimAllSnapshot({
      friends: targets,
      ticketsByTier: (Object.entries(snapshotByTier) as [TicketType, number][])
        .filter(([, amount]) => amount > 0)
        .map(([type, amount]) => ({ type, amount })),
      totalTickets: total,
    });

    setIsClaimingAll(true);
    try {
      for (const friend of targets) {
        await claimFriend({ friendId: friend.id });
      }
    } finally {
      setIsClaimingAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <FriendsClaimSummaryCard
        claimableTotal={claimableTotal}
        friendsWithRewards={counts['with-rewards']}
        ticketsByType={ticketsByType}
        loading={isClaimingAll}
        onClaimAll={handleClaimAll}
      />

      <div className="flex items-center justify-between px-1">
        <h3 className="text-base font-bold">
          {t('invited friends count', { count: friends.length })}
        </h3>
      </div>

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
          username={cardFriend.username}
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
