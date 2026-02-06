'use client';

import { useAppTranslations } from '@/hooks/useAppTranslations';
import { UserListItem } from '@/components/shared/user-elements/UserListItem';
import { GlobalConstants } from '@/constants/global.constants';
import { useGetInvitedFriendsQuery } from '@/api/referral.api';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';

export const InvitedFriendsList = () => {
  const t = useAppTranslations();
  const { data: friends = [], isLoading } = useGetInvitedFriendsQuery();

  const content = isLoading ? (Array.from({ length: 3 }) as InvitedFriend[]) : friends;

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-bold px-1">{t('invited friends')}</h3>
      <div className="flex flex-col gap-2">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <UserListItem key={i} loading avatar="" username="" points={0} />
            ))
          : content?.map(friend => (
              <UserListItem
                loading={isLoading}
                key={friend.id}
                avatar={friend.avatar}
                username={friend.username}
                points={friend.points}
                isVerified={friend.isVerified}
                isVIP={friend.isVIP}
                isPrime={friend.isPrime}
                rightContent={
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-medium tracking-tight whitespace-nowrap">
                      {t('earned')}
                    </span>
                    <span className="text-sm font-bold text-gold whitespace-nowrap">
                      +{friend.earnedCoins} {GlobalConstants.coinName}
                    </span>
                  </div>
                }
              />
            ))}
        {!isLoading && !friends?.length && (
          <EmptyDataInfo className="mt-10" description={t('no invited friends')} />
        )}
      </div>
    </div>
  );
};
