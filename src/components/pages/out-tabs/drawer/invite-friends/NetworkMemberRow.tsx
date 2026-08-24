'use client';

import { Star, Users } from 'lucide-react';
import type { CSSProperties } from 'react';
import { twMerge } from 'tailwind-merge';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import type { BranchMember } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';
import { PlayerPhoto } from '@/components/shared/user-elements/PlayerPhoto';

export interface NetworkMemberRowProps {
  member?: BranchMember;
  onOpenCard?: (member: BranchMember) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

/**
 * One person from the second level, in the flat «Их друзья» tab.
 *
 * Carries no amount and no claim button on purpose: the branch pays as one
 * pooled figure through the friend it hangs off, so money shown here would
 * imply a claim that does not exist. What it does carry is «через кого» — in a
 * flat list that is the only thing making a stranger's name mean anything.
 */
export function NetworkMemberRow({
  member,
  onOpenCard,
  loading,
  className,
  style,
}: NetworkMemberRowProps) {
  const t = useAppTranslations();
  const brought = member?.broughtCount ?? 0;

  return (
    <button
      type="button"
      onClick={() => member && onOpenCard?.(member)}
      style={style}
      className={twMerge(
        'bg-background-overlay/50 flex w-full items-center gap-3 rounded-2xl border border-white/5 p-2.5 text-start transition-colors',
        member && 'active:scale-99 cursor-pointer hover:bg-white/5',
        className
      )}
    >
      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full">
        <SkeletonSuspense
          loading={loading || !member}
          skeleton={<Skeleton variant="round" className="h-full w-full" />}
        >
          {member &&
            (member.avatar ? (
              <PlayerPhoto
                src={member.avatar}
                alt={displayNameOf(member)}
                size={40}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-white/5" />
            ))}
        </SkeletonSuspense>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <SkeletonSuspense
          loading={loading || !member}
          skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-24" />}
        >
          <span className="flex items-center gap-1">
            <span className="truncate text-sm font-bold text-white">{displayNameOf(member)}</span>
            {member?.isVerified && <VerifiedSparkleIcon size={14} className="shrink-0" />}
            {member?.isLuckyPlayer && <LuckyPlayerIcon size={13} className="shrink-0" />}
            {member?.isVIP && (
              <Star size={10} className="fill-electric-pink text-electric-pink shrink-0" />
            )}
          </span>
        </SkeletonSuspense>
        <SkeletonSuspense
          loading={loading || !member}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-20" />}
        >
          <span className="text-pink-secondary truncate text-[11px]">
            {t('via {name}', { name: member?.viaName ?? '' })}
          </span>
        </SkeletonSuspense>
      </div>

      <div className="flex flex-shrink-0 flex-col items-end gap-0.5">
        <span className="text-gold flex items-center gap-1 text-[11px] font-semibold tabular-nums">
          <BoltIcon size={15} />
          {formatCompact(member?.points ?? 0)}
        </span>
        {brought > 0 && (
          <span
            className="text-pink-secondary flex items-center gap-1 text-[10px] font-semibold tabular-nums"
            aria-label={t('brought {count} friends', { count: brought })}
          >
            <Users size={10} />
            {brought}
          </span>
        )}
      </div>
    </button>
  );
}
