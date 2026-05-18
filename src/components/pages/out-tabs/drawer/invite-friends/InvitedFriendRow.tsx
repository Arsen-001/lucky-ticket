'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Star, Zap } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { Ticket } from '@/components/shared/icons/Ticket';
import { VerifiedBadge } from '@/components/shared/badges/VerifiedBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import type { CSSProperties } from 'react';

export interface InvitedFriendRowProps {
  friend?: InvitedFriend;
  onClaim?: (friend: InvitedFriend) => void;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function InvitedFriendRow({
  friend,
  onClaim,
  loading,
  className,
  style,
}: InvitedFriendRowProps) {
  const t = useAppTranslations();
  const claimable = !!friend && friend.claimableTickets.length > 0;
  const claimableAmount =
    friend?.claimableTickets.reduce((sum, ticket) => sum + ticket.amount, 0) ?? 0;

  const Wrapper: 'button' | 'div' = claimable && onClaim ? 'button' : 'div';

  return (
    <Wrapper
      type={Wrapper === 'button' ? 'button' : undefined}
      onClick={claimable && friend && onClaim ? () => onClaim(friend) : undefined}
      style={style}
      className={twMerge(
        'group relative flex items-center gap-3 rounded-2xl border p-2.5 text-left transition-all',
        claimable
          ? 'border-gold/15 bg-gold/3 hover:bg-gold/8 cursor-pointer shadow-[0_0_10px_rgba(248,189,62,0.10)] active:scale-99'
          : 'bg-background-overlay/50 border-white/5',
        className
      )}
    >
      <Link
        href={friend ? routes.profile.getByUserId(friend.id) : '#'}
        onClick={e => {
          e.stopPropagation();
          if (!friend) e.preventDefault();
        }}
        className="relative flex-shrink-0 transition-transform active:scale-95"
      >
        <div className="h-11 w-11 overflow-hidden rounded-full">
          <SkeletonSuspense
            loading={loading || !friend}
            skeleton={<Skeleton variant="round" className="h-full w-full" />}
          >
            {friend && (
              <Image
                src={friend.avatar}
                alt={friend.username}
                width={44}
                height={44}
                className="h-11 w-11 rounded-full object-cover"
              />
            )}
          </SkeletonSuspense>
        </div>
        {friend?.isVIP && (
          <span
            className="bg-pink-gradient border-background-overlay absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2"
            title="VIP"
          >
            <Star size={8} className="fill-white text-white" />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-1">
          <SkeletonSuspense
            loading={loading || !friend}
            skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-24" />}
          >
            <span className="truncate text-sm font-bold text-white">{friend?.username}</span>
            {friend?.isVerified && (
              <VerifiedBadge
                hideText
                className="h-4 w-4 flex-shrink-0 p-0"
                classNames={{ icon: 'h-3 w-3' }}
              />
            )}
            {friend?.isTelegramPremium && (
              <Star
                size={12}
                className="fill-gold text-gold flex-shrink-0"
                aria-label={t('telegram premium')}
              />
            )}
            {friend?.isLuckyPlayer && <LuckyPlayerIcon size={14} className="shrink-0" />}
          </SkeletonSuspense>
        </div>
        <SkeletonSuspense
          loading={loading || !friend}
          skeleton={<Skeleton variant="line" textSize="xs" className="h-3 w-16" />}
        >
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-gold flex items-center gap-1 font-semibold tabular-nums">
              <Zap size={11} className="fill-gold text-gold" />
              {friend?.points?.toLocaleString() ?? 0}
            </span>
            {claimable && (
              <span className="text-pink-secondary truncate">· {t('tickets to claim')}</span>
            )}
          </div>
        </SkeletonSuspense>
      </div>

      {claimable && friend && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <div className="flex items-center">
            {friend.claimableTickets.slice(0, 3).map(({ type }, idx) => (
              <Ticket
                key={type}
                type={type}
                width={22}
                height={22}
                className={twMerge('-ml-2 drop-shadow-md first:ml-0', idx === 0 && 'first:ml-0')}
              />
            ))}
            {friend.claimableTickets.length > 3 && (
              <span className="text-pink-secondary -ml-1 text-[10px] font-bold">
                +{friend.claimableTickets.length - 3}
              </span>
            )}
          </div>
          <span className="bg-pink-gradient inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold tracking-wide text-white shadow-[0_4px_12px_rgba(222,0,155,0.35)]">
            {t('claim')}
            {claimableAmount > 1 && (
              <span className="tabular-nums opacity-90">×{claimableAmount}</span>
            )}
          </span>
        </div>
      )}

      {!claimable && !loading && friend && (
        <ChevronRight className="text-pink-secondary flex-shrink-0" size={16} />
      )}
    </Wrapper>
  );
}
