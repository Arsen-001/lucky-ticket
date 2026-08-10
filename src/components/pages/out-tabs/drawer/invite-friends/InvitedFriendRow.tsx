'use client';

import Image from 'next/image';
import { ChevronDown, ChevronRight, Lock, Star, Users } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Skeleton } from '@/components/shared/seleketons/Skeleton';
import { SkeletonSuspense } from '@/components/shared/seleketons/SkeletonSuspense';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { BoltIcon } from '@/components/shared/icons/BoltIcon';
import { Ticket } from '@/components/shared/icons/Ticket';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { FriendNotCountedBadge } from '@/components/pages/out-tabs/drawer/invite-friends/FriendNotCountedBadge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { formatCompact } from '@/utils/global/number.utils';
import { GlobalConstants } from '@/constants/global.constants';
import { broughtCountOf, countsAsReferral, totalClaimableLcOf } from '@/utils/pages/referral.utils';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';
import type { CSSProperties } from 'react';

export interface InvitedFriendRowProps {
  friend?: InvitedFriend;
  onClaim?: (friend: InvitedFriend) => void;
  /** Opens the shared player quick-card — the avatar always, and the whole
   *  row when there's nothing to claim (a claimable row's click claims). */
  onOpenCard?: (friend: InvitedFriend) => void;
  /** Expands/collapses the branch — who this friend invited in turn. */
  onToggleBranch?: (friend: InvitedFriend) => void;
  /** Is that branch open right now? Owned by the list, not the row. */
  branchOpen?: boolean;
  loading?: boolean;
  className?: string;
  style?: CSSProperties;
}

export function InvitedFriendRow({
  friend,
  onClaim,
  onOpenCard,
  onToggleBranch,
  branchOpen = false,
  loading,
  className,
  style,
}: InvitedFriendRowProps) {
  const t = useAppTranslations();

  // Their own wins and their branch, as one figure — one button pays both.
  // @see totalClaimableLcOf
  const lc = totalClaimableLcOf(friend);
  const brought = broughtCountOf(friend);
  const legacyTickets = friend?.claimableTickets ?? [];
  const legacyTicketCount = legacyTickets.reduce((sum, ticket) => sum + ticket.amount, 0);
  const isReferral = !friend || countsAsReferral(friend);

  // The LC half needs a live referral; the leftover tickets do not — they were
  // earned under a rule that made no such demand, and withdrawing them now
  // would take back something already shown as owed. @see claimFriend (backend)
  const claimableNow = (lc > 0 && isReferral) || legacyTicketCount > 0;
  // Earned, but the friend stopped counting. The money is not lost — the row
  // says frozen rather than nothing, so "why is there no button" has an answer.
  const frozenLc = lc > 0 && !isReferral;

  const rowAction = !friend
    ? undefined
    : claimableNow && onClaim
      ? () => onClaim(friend)
      : onOpenCard
        ? () => onOpenCard(friend)
        : undefined;

  const Wrapper: 'button' | 'div' = rowAction ? 'button' : 'div';

  return (
    <Wrapper
      type={Wrapper === 'button' ? 'button' : undefined}
      onClick={rowAction}
      style={style}
      className={twMerge(
        'group relative flex flex-col gap-2 rounded-2xl border p-2.5 text-left transition-all',
        claimableNow
          ? 'border-gold/15 bg-gold/3 hover:bg-gold/8 cursor-pointer shadow-[0_0_10px_rgba(248,189,62,0.10)] active:scale-99'
          : 'bg-background-overlay/50 border-white/5',
        !claimableNow && rowAction && 'active:scale-99 cursor-pointer hover:bg-white/5',
        className
      )}
    >
      <div className="flex w-full items-center gap-3">
        <div
          role="button"
          tabIndex={friend ? 0 : -1}
          aria-label={friend ? t('open player card', { name: displayNameOf(friend) }) : undefined}
          onClick={e => {
            e.stopPropagation();
            if (friend) onOpenCard?.(friend);
          }}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ' ') && friend) {
              e.preventDefault();
              e.stopPropagation();
              onOpenCard?.(friend);
            }
          }}
          className="relative flex-shrink-0 cursor-pointer transition-transform active:scale-95"
        >
          <div className="h-11 w-11 overflow-hidden rounded-full">
            <SkeletonSuspense
              loading={loading || !friend}
              skeleton={<Skeleton variant="round" className="h-full w-full" />}
            >
              {friend &&
                (friend.avatar ? (
                  <Image
                    src={friend.avatar}
                    alt={displayNameOf(friend)}
                    width={44}
                    height={44}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-11 w-11 rounded-full bg-white/5" />
                ))}
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
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <SkeletonSuspense
              loading={loading || !friend}
              skeleton={<Skeleton variant="line" textSize="sm" className="h-4 w-24" />}
            >
              <span className="truncate text-sm font-bold text-white">{displayNameOf(friend)}</span>
              {friend?.isVerified && <VerifiedSparkleIcon size={15} className="shrink-0" />}
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
                <BoltIcon size={16} />
                {formatCompact(friend?.points ?? 0)}
              </span>
              {/* The second level. ALWAYS drawn, zero included: only 20 of 876
                  players on prod have any of it (measured 2026-08-10), so a
                  badge that appeared above zero was a mechanic almost nobody
                  could discover. Above zero it also opens the branch — the
                  chevron is what says so. */}
              {friend && (
                <span
                  role={brought > 0 ? 'button' : undefined}
                  tabIndex={brought > 0 ? 0 : undefined}
                  aria-expanded={brought > 0 ? branchOpen : undefined}
                  aria-label={t('brought {count} friends', { count: brought })}
                  onClick={e => {
                    if (brought === 0) return;
                    e.stopPropagation();
                    onToggleBranch?.(friend);
                  }}
                  onKeyDown={e => {
                    if (brought === 0) return;
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleBranch?.(friend);
                  }}
                  className={twMerge(
                    'flex flex-shrink-0 items-center gap-1 font-semibold tabular-nums',
                    brought > 0
                      ? 'text-electric-purple cursor-pointer rounded-md bg-white/5 px-1.5 py-0.5 hover:bg-white/10'
                      : 'text-pink-secondary/60'
                  )}
                >
                  <Users size={12} className="flex-shrink-0" />
                  {brought}
                  {brought > 0 && (
                    <ChevronDown
                      size={11}
                      className={twMerge(
                        'flex-shrink-0 transition-transform',
                        branchOpen && 'rotate-180'
                      )}
                    />
                  )}
                </span>
              )}
              {/* Dropped whenever the row is tight — when a legacy ticket
                  stack shares the right column, on 320px screens, and now also
                  when the branch badge is using that width. The gold border and
                  the amount already say "ready"; keeping the words cost the
                  NAME its width and rendered «Д…» in German. */}
              {claimableNow && legacyTicketCount === 0 && brought === 0 && (
                <span className="text-pink-secondary hidden truncate min-[360px]:inline">
                  · {t('ready to claim')}
                </span>
              )}
            </div>
          </SkeletonSuspense>
        </div>

        {claimableNow && friend && (
          <div className="flex flex-shrink-0 items-center gap-2">
            {/* Leftover ticket commission — shown only while it exists, and it
                never grows back. @see InvitedFriend.claimableTickets */}
            {/* Hidden on 320px screens: the preview is decoration for a
                balance that only drains, and at that width it cost the friend
                their NAME («Джон 🎰» → «Д…»). The claim pays them out either way. */}
            {legacyTicketCount > 0 && (
              <div className="hidden items-center min-[360px]:flex">
                {legacyTickets.slice(0, 2).map(({ type }) => (
                  <Ticket
                    key={type}
                    type={type}
                    width={22}
                    height={22}
                    className="-ml-2 drop-shadow-md first:ml-0"
                  />
                ))}
                {legacyTickets.length > 2 && (
                  <span className="text-pink-secondary ml-0.5 text-[10px] font-bold">
                    +{legacyTickets.length - 2}
                  </span>
                )}
              </div>
            )}
            <span className="bg-pink-gradient inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-extrabold tracking-wide text-white shadow-[0_4px_12px_rgba(222,0,155,0.35)]">
              {lc > 0 && isReferral ? (
                <>
                  +{formatCompact(lc)}
                  <span className="opacity-90">{GlobalConstants.coinName}</span>
                </>
              ) : (
                t('claim')
              )}
            </span>
          </div>
        )}

        {frozenLc && (
          <span className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-[11px] font-extrabold tabular-nums text-white/45">
            <Lock size={11} className="flex-shrink-0" />
            {formatCompact(lc)} {GlobalConstants.coinName}
          </span>
        )}

        {!claimableNow && !frozenLc && !loading && friend && (
          <ChevronRight className="text-pink-secondary flex-shrink-0" size={16} />
        )}
      </div>

      {/* Its own full-width line under the row, not beside the points. The
          middle column shares its width with the amount and a Claim button,
          and the badge would first overlap them and then truncate. */}
      {friend && !isReferral && <FriendNotCountedBadge className="self-start" />}
    </Wrapper>
  );
}
