'use client';

import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { Ticket } from '@/components/shared/icons/Ticket';
import { LcLabel } from '@/components/shared/icons/LcLabel';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
import { formatNumber } from '@/utils/global/number.utils';
import type { DailyGiftState } from '@/types/interfaces/status-gift.interfaces';

export interface LuckyPlayerDailyGiftModalProps {
  open: boolean;
  gift: DailyGiftState;
  claiming?: boolean;
  onClaim: () => void;
  onClose: () => void;
}

/**
 * The Lucky Player daily gift (DOCS §7.2a).
 *
 * One component serves both audiences on purpose: a subscriber sees the drop
 * and a Collect button, everyone else sees the same drop as what a subscription
 * would have paid today. Splitting them into two modals guaranteed the offer
 * would drift away from the gift the moment an admin retuned the numbers.
 */
export function LuckyPlayerDailyGiftModal({
  open,
  gift,
  claiming = false,
  onClaim,
  onClose,
}: LuckyPlayerDailyGiftModalProps) {
  const t = useAppTranslations();
  const router = useRouter();
  const isPromo = !gift.isLuckyPlayer;

  return (
    <Modal
      open={open}
      onClose={onClose}
      label={isPromo ? t('lucky player daily gift') : t('your daily gift')}
    >
      <div className="flex flex-col items-center gap-5 px-1 py-2 text-center">
        <div className="relative flex-center">
          <div className="absolute size-28 rounded-full bg-pink-gradient opacity-20 blur-2xl" />
          <LuckyPlayerIcon size={72} state={isPromo ? 'locked' : 'active'} />
        </div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold text-white">
            {isPromo ? t('lucky player daily gift') : t('your daily gift')}
          </h2>
          <p className="text-sm text-white/60">
            {isPromo
              ? t('this is what lucky player brings every day')
              : t('collect it every day while lucky player is active')}
          </p>
        </div>

        {/* The drop itself — identical in both modes, so the offer can never
            promise something other than what the gift actually pays. */}
        <div className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-background-overlay p-4">
          {gift.lc > 0 && (
            <div className="flex flex-col items-center gap-1">
              <LcLabel size={16} interactive={false} />
              <span className="text-lg font-bold text-white">+{formatNumber(gift.lc)}</span>
            </div>
          )}
          {gift.lc > 0 && gift.ticketCount > 0 && <span className="h-8 w-px bg-white/10" />}
          {gift.ticketCount > 0 && (
            <div className="flex flex-col items-center gap-1">
              <Ticket type={gift.ticketTier} width={34} />
              <span className="text-lg font-bold text-white">
                +{formatNumber(gift.ticketCount)}
              </span>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col gap-2">
          {isPromo ? (
            <Button
              className="w-full"
              onClick={() => {
                onClose();
                router.push(routes.settings.luckyPlayer);
              }}
            >
              {t('get lucky player')}
            </Button>
          ) : (
            <Button
              className={twMerge('flex-center w-full gap-2')}
              loading={claiming}
              disabled={!gift.canClaim || claiming}
              onClick={onClaim}
            >
              <Gift className="size-4" />
              {t('collect')}
            </Button>
          )}
          <Button variant="transparent" className="w-full text-white/50" onClick={onClose}>
            {t('later')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
