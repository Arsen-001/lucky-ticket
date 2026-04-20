'use client';

import { useState } from 'react';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { UserListItem } from '@/components/shared/user-elements/UserListItem';
import { useClaimFriendMutation, useGetInvitedFriendsQuery } from '@/api/referral.api';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { Button } from '@/components/shared/buttons/Button';
import { Ticket } from '@/components/shared/icons/Ticket';
import { FriendClaimModal } from '@/components/pages/out-tabs/drawer/invite-friends/FriendClaimModal';

export const InvitedFriendsList = () => {
  const t = useAppTranslations();
  const { data: friends = [], isLoading } = useGetInvitedFriendsQuery();
  const [claimFriend, { isLoading: isClaiming }] = useClaimFriendMutation();
  const [selectedFriend, setSelectedFriend] = useState<InvitedFriend | null>(null);

  const handleClaim = async (friendId: string) => {
    await claimFriend({ friendId });
    setSelectedFriend(null);
  };

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-bold px-1">{t('invited friends')}</h3>
      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <UserListItem key={i} loading avatar="" username="" points={0} />
            ))
          : friends.map(friend => (
              <UserListItem
                key={friend.id}
                avatar={friend.avatar}
                username={friend.username}
                points={friend.points}
                isVerified={friend.isVerified}
                isVIP={friend.isVIP}
                isPrime={friend.isPrime}
                rightContent={
                  friend.claimableTickets.length > 0 ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center">
                        {friend.claimableTickets.map(({ type }) => (
                          <Ticket
                            key={type}
                            type={type}
                            width={20}
                            height={20}
                            className="-ml-2.5 first:ml-0 drop-shadow-lg"
                          />
                        ))}
                      </div>
                      <Button
                        variant="secondary"
                        className="text-xs py-1.5 px-3 h-auto rounded-lg"
                        onClick={() => setSelectedFriend(friend)}
                      >
                        {t('claim')}
                      </Button>
                    </div>
                  ) : null
                }
              />
            ))}
        {!isLoading && !friends?.length && (
          <EmptyDataInfo className="mt-10" description={t('no invited friends')} />
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
    </div>
  );
};
