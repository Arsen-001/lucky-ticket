'use client';

import { useGetReferralNetworkQuery } from '@/api/referral.api';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { QueryErrorState } from '@/components/shared/error/QueryErrorState';
import { NetworkMemberRow } from '@/components/pages/out-tabs/drawer/invite-friends/NetworkMemberRow';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerMs } from '@/utils/global/animation.utils';
import type { BranchMember } from '@/types/interfaces/referral.interfaces';

export interface NetworkListProps {
  onOpenCard?: (member: BranchMember) => void;
}

/**
 * The «Их друзья» tab: everyone the player's friends invited in turn, flat.
 *
 * Its own query rather than a slice of the friends list — the second level is a
 * different set of people, often several times larger, and nothing above needs
 * it until this tab is opened. Mounting only while the tab is active is what
 * keeps it from being fetched on every screen open.
 */
export function NetworkList({ onOpenCard }: NetworkListProps) {
  const t = useAppTranslations();
  const { data: members = [], isLoading, isError, refetch } = useGetReferralNetworkQuery();

  if (isError && !members.length) return <QueryErrorState onRetry={() => refetch()} />;

  if (isLoading) {
    return (
      <>
        {Array.from({ length: 3 }).map((_, i) => (
          <NetworkMemberRow key={i} loading />
        ))}
      </>
    );
  }

  if (!members.length) {
    return (
      <EmptyDataInfo
        className="mt-6"
        title={t('no network yet')}
        description={t('no network yet description')}
      />
    );
  }

  return (
    <>
      {members.map((member, index) => (
        <NetworkMemberRow
          key={member.id}
          member={member}
          onOpenCard={onOpenCard}
          className="animate-slide-in-bottom"
          style={{ animationDelay: `${staggerMs(index, 60)}ms` }}
        />
      ))}
    </>
  );
}
