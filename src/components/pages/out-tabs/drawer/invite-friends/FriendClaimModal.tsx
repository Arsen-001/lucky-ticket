'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { Ticket } from '@/components/shared/icons/Ticket';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { Star } from 'lucide-react';
import Image from 'next/image';
import type { InvitedFriend } from '@/types/interfaces/referral.interfaces';

interface FriendClaimModalProps {
  open: boolean;
  onClose: () => void;
  friend: InvitedFriend;
  onClaim: (friendId: string) => void;
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

  return (
    <Modal open={open} onClose={onClose}>
      <div className="bg-purple-gradient p-6 rounded-2xl flex flex-col gap-5 text-center">
        <div className="flex flex-col items-center gap-2">
          <Image
            src={friend.avatar}
            alt={friend.username}
            width={56}
            height={56}
            className="rounded-full object-cover"
          />
          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-lg leading-tight">{friend.username}</span>
            {friend.isTelegramPremium && (
              <div className="flex items-center gap-1 text-gold text-xs font-medium">
                <Star size={11} className="fill-gold" />
                <span>{t('telegram premium')}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-xs text-gray-400 uppercase tracking-wide">{t('your reward')}</p>
          <div className="flex items-center justify-center gap-6">
            {friend.claimableTickets.map(({ type, amount }) => (
              <div key={type} className="flex flex-col items-center gap-1.5">
                <Ticket type={type} width={48} height={48} />
                <span className="text-sm font-bold">×{amount}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          variant="primary"
          loading={isClaiming}
          onClick={() => onClaim(friend.id)}
          className="w-full p-1.5"
        >
          {t('claim tickets')}
        </Button>
      </div>
    </Modal>
  );
}
