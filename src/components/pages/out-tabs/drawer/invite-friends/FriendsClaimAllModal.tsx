'use client';

import Image from 'next/image';
import { Sparkles, Star } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';
import { displayNameOf } from '@/utils/global/user.utils';

export interface FriendsClaimAllModalProps {
  open: boolean;
  onClose: () => void;
  friends: InvitedFriend[];
  /** LC actually granted, snapshotted before the claims went out. */
  totalLc: number;
  isClaiming?: boolean;
}

export function FriendsClaimAllModal({
  open,
  onClose,
  friends,
  totalLc,
  isClaiming,
}: FriendsClaimAllModalProps) {
  const t = useAppTranslations();
  const previewAvatars = friends.slice(0, 5);
  const overflow = Math.max(0, friends.length - previewAvatars.length);

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

          <div className="relative mx-auto flex h-20 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 m-auto h-20 w-20 animate-ping rounded-full bg-white/30"
            />
            <div className="relative flex items-center">
              {previewAvatars.map((friend, index) => (
                <span
                  key={friend.id}
                  className="relative h-14 w-14 overflow-hidden rounded-full border-[3px] border-white/85 shadow-[0_0_18px_rgba(255,255,255,0.4)]"
                  style={{
                    marginLeft: index === 0 ? 0 : -16,
                    zIndex: previewAvatars.length - index,
                  }}
                >
                  {friend.avatar ? (
                    <Image
                      src={friend.avatar}
                      alt={displayNameOf(friend)}
                      width={56}
                      height={56}
                      className="h-14 w-14 object-cover"
                    />
                  ) : (
                    <div className="h-14 w-14 bg-white/10" />
                  )}
                </span>
              ))}
              {overflow > 0 && (
                <span
                  className="bg-electric-pink relative flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-white/85 text-sm font-extrabold text-white shadow-[0_0_18px_rgba(255,255,255,0.4)]"
                  style={{ marginLeft: -16, zIndex: 0 }}
                >
                  +{overflow}
                </span>
              )}
            </div>
          </div>

          <div className="relative mt-4 flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/80">
              {t('you earned')}
            </span>
            <h3 className="text-3xl font-extrabold leading-none text-white drop-shadow-md tabular-nums">
              {totalLc.toLocaleString()}
              <span className="ml-1.5 text-sm font-bold opacity-90">
                {GlobalConstants.coinName}
              </span>
            </h3>
            <span className="mt-0.5 text-xs text-white/85">
              {t('rewards from {count} friends', { count: friends.length })}
            </span>
          </div>
        </div>

        <div className="relative flex flex-col gap-4 px-6 pt-5 pb-6">
          <span className="text-pink-secondary text-center text-[11px]">
            {t('lc added to your balance')}
          </span>

          <Button
            variant="primary"
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
