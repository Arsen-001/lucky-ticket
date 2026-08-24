'use client';

import { Sparkles, Star } from 'lucide-react';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { Ticket } from '@/components/shared/icons/Ticket';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { branchLcOf, claimableLcOf, totalClaimableLcOf } from '@/utils/pages/referral.utils';
import type { ClaimableTicket, InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';
import { staggerMs } from '@/utils/global/animation.utils';
import { PlayerPhoto } from '@/components/shared/user-elements/PlayerPhoto';

interface FriendClaimModalProps {
  open: boolean;
  onClose: () => void;
  friend: InvitedFriend;
  onClaim: (friendId: string) => Promise<void> | void;
  isClaiming: boolean;
}

export function FriendClaimModal({
  open,
  onClose,
  friend,
  onClaim,
  isClaiming,
}: FriendClaimModalProps) {
  const t = useAppTranslations();
  // Snapshotted BEFORE the claim fires: the mutation zeroes the row optimistically,
  // so reading it live would blank the celebration the moment it opens.
  const [snapshot, setSnapshot] = useState<{
    lc: number;
    branchLc: number;
    tickets: ClaimableTicket[];
  } | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!open) {
      triggeredRef.current = false;
      setSnapshot(null);
      return;
    }
    if (triggeredRef.current) return;
    if (totalClaimableLcOf(friend) === 0 && friend.claimableTickets.length === 0) return;
    triggeredRef.current = true;
    setSnapshot({
      lc: claimableLcOf(friend),
      branchLc: branchLcOf(friend),
      tickets: friend.claimableTickets,
    });
    void onClaim(friend.id);
  }, [open, friend, onClaim]);

  const ownLc = snapshot?.lc ?? claimableLcOf(friend);
  const branchLc = snapshot?.branchLc ?? branchLcOf(friend);
  const lc = ownLc + branchLc;
  const tickets = snapshot?.tickets ?? friend.claimableTickets;

  return (
    <Modal
      label={t('rewards from {name}', { name: displayNameOf(friend) })}
      open={open}
      onClose={onClose}
      closeOnOverlayClick={false}
      hideOnEscape={false}
      hideCloseButton
    >
      <div className="bg-purple-gradient relative overflow-hidden rounded-2xl">
        <div className="bg-pink-gradient relative px-6 pt-7 pb-5 text-center">
          <span
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/15 blur-2xl"
          />
          <span
            aria-hidden
            className="bg-electric-purple/35 pointer-events-none absolute -bottom-16 -left-12 h-40 w-40 rounded-full blur-2xl"
          />
          <span aria-hidden className="absolute end-5 top-5 text-white/35">
            <Sparkles size={16} className="animate-pulse" />
          </span>
          <span aria-hidden className="absolute start-6 top-10 text-white/25">
            <Sparkles size={12} className="animate-pulse" style={{ animationDelay: '600ms' }} />
          </span>
          <span aria-hidden className="text-gold absolute end-10 bottom-6">
            <Star
              size={14}
              className="fill-gold animate-pulse"
              style={{ animationDelay: '300ms' }}
            />
          </span>

          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-white/30" />
            <span className="relative h-20 w-20 overflow-hidden rounded-full border-[3px] border-white/80 shadow-[0_0_24px_rgba(255,255,255,0.45)]">
              {friend.avatar ? (
                <PlayerPhoto
                  src={friend.avatar}
                  alt={displayNameOf(friend)}
                  size={80}
                  className="h-20 w-20"
                />
              ) : (
                <div className="h-20 w-20 bg-white/10" />
              )}
            </span>
          </div>

          <div className="relative mt-4 flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
              {t('you earned')}
            </span>
            <h3 className="text-3xl font-extrabold leading-none text-white drop-shadow-md tabular-nums">
              {lc.toLocaleString()}
              <span className="ms-1.5 text-sm font-bold opacity-90">
                {GlobalConstants.coinName}
              </span>
            </h3>
            <span className="mt-0.5 text-xs text-white/85">
              {t('rewards from {name}', { name: displayNameOf(friend) })}
            </span>
            {/* The one place the two levels are stated apart. The row and the
                header show a single figure because a single button pays it;
                here there is room to say where it came from. */}
            {branchLc > 0 && (
              <span className="mt-1 text-[11px] font-semibold text-white/70 tabular-nums">
                {t('own {own} · network {network}', {
                  own: ownLc.toLocaleString(),
                  network: branchLc.toLocaleString(),
                })}
              </span>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5">
              {friend.isVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <VerifiedSparkleIcon size={14} />
                  {t('verified')}
                </span>
              )}
              {friend.isVIP && (
                <span className="bg-electric-pink/30 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  <VipIcon size={12} />
                  VIP
                </span>
              )}
              {friend.isLuckyPlayer && (
                <span className="text-electric-purple bg-electric-purple/25 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <LuckyPlayerIcon size={12} />
                  {t('lucky player')}
                </span>
              )}
              {friend.isTelegramPremium && (
                <span className="bg-gold/20 text-gold inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  <Star size={10} className="fill-gold" />
                  {t('telegram premium')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 px-6 pt-5 pb-6">
          {/* Leftover ticket commission from the rule the LC reward replaced —
              rendered only while a friend still has some. */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tickets.map(({ type, amount }, index) => (
              <div
                key={type}
                className="animate-slide-in-bottom flex flex-col items-center gap-1"
                style={{ animationDelay: `${staggerMs(index, 80)}ms`, minWidth: 72 }}
              >
                <Ticket type={type} width={68} height={68} className="drop-shadow-lg" />
                <span className="text-gold text-sm font-extrabold tabular-nums">×{amount}</span>
              </div>
            ))}
          </div>

          <span className="text-pink-secondary text-center text-[11px]">
            {tickets.length > 0 ? t('tickets in your inventory') : t('lc added to your balance')}
          </span>

          <Button
            variant="primary"
            // Spins until the claim lands: the sheet already celebrates from the
            // snapshot, but «LC added to your balance» is only true once the
            // server says so. (`&& !snapshot` made this unreachable — the
            // snapshot is taken before the claim is fired.)
            loading={isClaiming}
            onClick={onClose}
            className="h-11 w-full rounded-xl py-0 text-sm font-extrabold"
          >
            {t('awesome')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
