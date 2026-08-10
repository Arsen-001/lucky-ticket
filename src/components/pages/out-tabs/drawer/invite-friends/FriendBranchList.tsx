'use client';

import Image from 'next/image';
import { Star, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { useGetFriendBranchQuery } from '@/api/referral.api';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { EmptyDataInfo } from '@/components/shared/EmptyDataInfo';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import type { BranchMember } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';

export interface FriendBranchListProps {
  friendId: string;
  /** Skips the request entirely until the row is actually opened. */
  open: boolean;
  onOpenMember?: (member: BranchMember) => void;
  className?: string;
}

/**
 * The people a friend invited in turn, listed under their row.
 *
 * Loaded on demand rather than with the friends list: a branch can be many
 * times the size of the list above it (the largest inviter on prod brought 88),
 * and almost nobody opens one. `skip` is what makes that true — without it RTK
 * Query would fetch every branch as soon as a row mounted.
 *
 * These rows carry no amount. The branch pays as one pooled figure through the
 * friend it hangs off, so a number here would imply a claim that does not
 * exist. @see InvitedFriend.branchLc
 */
export function FriendBranchList({
  friendId,
  open,
  onOpenMember,
  className,
}: FriendBranchListProps) {
  const t = useAppTranslations();
  const { data: members = [], isLoading } = useGetFriendBranchQuery({ friendId }, { skip: !open });

  return (
    <div className={twMerge('flex flex-col gap-1.5 pl-3', className)}>
      {isLoading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 py-1">
            <Skeleton variant="round" className="h-7 w-7" />
            <Skeleton variant="line" textSize="xs" className="h-3 w-24" />
          </div>
        ))
      ) : members.length ? (
        members.map((member, index) => (
          <FriendBranchRow
            key={member.id}
            member={member}
            onOpen={onOpenMember}
            style={{ animationDelay: `${staggerMs(index, 40)}ms` }}
          />
        ))
      ) : (
        <EmptyDataInfo className="py-2" description={t('friend invited nobody yet')} />
      )}
    </div>
  );
}

interface FriendBranchRowProps {
  member: BranchMember;
  onOpen?: (member: BranchMember) => void;
  style?: React.CSSProperties;
}

/**
 * One person from the branch. Deliberately plainer than `InvitedFriendRow`:
 * there is nothing to claim here and no action but opening their profile, so a
 * row styled like a claimable one would promise a button that does not exist.
 */
function FriendBranchRow({ member, onOpen, style }: FriendBranchRowProps) {
  const t = useAppTranslations();

  return (
    <button
      type="button"
      onClick={() => onOpen?.(member)}
      style={style}
      className="animate-slide-in-bottom border-l-white/8 flex w-full cursor-pointer items-center gap-2 rounded-lg border-l-2 bg-white/3 px-2 py-1.5 text-left transition-colors hover:bg-white/6 active:scale-99"
    >
      <div className="h-7 w-7 flex-shrink-0 overflow-hidden rounded-full">
        {member.avatar ? (
          <Image
            src={member.avatar}
            alt={displayNameOf(member)}
            width={28}
            height={28}
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <div className="h-7 w-7 rounded-full bg-white/5" />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="flex items-center gap-1 truncate text-xs font-semibold text-white/90">
          <span className="truncate">{displayNameOf(member)}</span>
          {member.isVerified && <VerifiedSparkleIcon size={12} className="shrink-0" />}
          {member.isLuckyPlayer && <LuckyPlayerIcon size={12} className="shrink-0" />}
          {member.isVIP && (
            <Star size={9} className="fill-electric-pink text-electric-pink shrink-0" />
          )}
        </span>
      </div>

      <span className="text-gold flex flex-shrink-0 items-center gap-1 text-[10px] font-semibold tabular-nums">
        <BoltIcon size={13} />
        {formatCompact(member.points)}
      </span>

      {/* Their own invitees, as a number only — the reward stops at the second
          level, so this opens nothing. */}
      {(member.broughtCount ?? 0) > 0 && (
        <span
          className="text-pink-secondary flex flex-shrink-0 items-center gap-0.5 text-[10px] font-semibold tabular-nums"
          aria-label={t('brought {count} friends', { count: member.broughtCount ?? 0 })}
        >
          <Users size={10} />
          {member.broughtCount}
        </span>
      )}
    </button>
  );
}
