'use client';

import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import { VerifiedSparkleIcon } from '@/components/shared/icons/VerifiedSparkleIcon';
import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { Ticket } from '@/components/shared/icons/Ticket';
import { VipIcon } from '@/components/shared/icons/VipIcon';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { ClaimableTicket, InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';

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
  const [snapshot, setSnapshot] = useState<ClaimableTicket[] | null>(null);
  const triggeredRef = useRef(false);

  useEffect(() => {
    if (!open) {
      triggeredRef.current = false;
      setSnapshot(null);
      return;
    }
    if (triggeredRef.current) return;
    if (friend.claimableTickets.length === 0) return;
    triggeredRef.current = true;
    setSnapshot(friend.claimableTickets);
    void onClaim(friend.id);
  }, [open, friend, onClaim]);

  const tickets = snapshot ?? friend.claimableTickets;
  const totalCount = tickets.reduce((sum, t) => sum + t.amount, 0);

  return (
    <Modal
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
          <span aria-hidden className="absolute right-5 top-5 text-white/35">
            <Sparkles size={16} className="animate-pulse" />
          </span>
          <span aria-hidden className="absolute left-6 top-10 text-white/25">
            <Sparkles size={12} className="animate-pulse" style={{ animationDelay: '600ms' }} />
          </span>
          <span aria-hidden className="text-gold absolute right-10 bottom-6">
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
                <Image
                  src={friend.avatar}
                  alt={displayNameOf(friend)}
                  width={80}
                  height={80}
                  className="h-20 w-20 object-cover"
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
            <h3 className="text-3xl font-extrabold leading-none text-white drop-shadow-md">
              {totalCount}
              <span className="ml-1.5 text-sm font-bold opacity-90">
                {t('claimable tickets count', { count: totalCount }).replace(/^\d+\s*/, '')}
              </span>
            </h3>
            <span className="mt-0.5 text-xs text-white/85">
              {t('rewards from {name}', { name: displayNameOf(friend) })}
            </span>
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
          <div className="flex flex-wrap items-center justify-center gap-3">
            {tickets.map(({ type, amount }, index) => (
              <div
                key={type}
                className="animate-slide-in-bottom flex flex-col items-center gap-1"
                style={{ animationDelay: `${index * 80}ms`, minWidth: 72 }}
              >
                <Ticket type={type} width={68} height={68} className="drop-shadow-lg" />
                <span className="text-gold text-sm font-extrabold tabular-nums">×{amount}</span>
              </div>
            ))}
          </div>

          <span className="text-pink-secondary text-center text-[11px]">
            {t('tickets in your inventory')}
          </span>

          <Button
            variant="primary"
            loading={isClaiming && !snapshot}
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
