'use client';

import { useRouter } from 'next/navigation';
import { Gift } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { LuckyPlayerIcon } from '@/components/shared/icons/LuckyPlayerIcon';
import { LuckyPlayerDailyGiftReward } from '@/components/pages/tabs/home/LuckyPlayerDailyGiftReward';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { routes } from '@/constants/routes';
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
 *
 * The card surface is this component's own, like every other modal here —
 * `Modal` only supplies the backdrop and the frame. Without it the contents
 * floated as bare text over the blurred home screen, which is exactly how this
 * looked until 09.08.2026.
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
  const title = isPromo ? t('lucky player daily gift') : t('your daily gift');

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div
        className="relative flex flex-col items-center gap-4 overflow-hidden rounded-2xl border border-white/10 px-5 pt-7 pb-5 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          background:
            'radial-gradient(circle at 50% 8%, rgba(240, 185, 90, 0.16) 0%, transparent 42%),' +
            'var(--gradient-purple-reverse)',
        }}
      >
        {/* Halo behind the medal, not a wash over the card: kept tight enough
            that the title below it stays on the purple. */}
        <span
          aria-hidden
          className="bg-gold/20 pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl"
        />

        <LuckyPlayerIcon size={84} state={isPromo ? 'locked' : 'active'} className="relative" />

        <div className="relative flex flex-col items-center gap-1.5">
          <span className="text-gold text-[10px] font-extrabold tracking-[1.5px] uppercase">
            {t('lucky player')}
          </span>
          <h2 className="text-[21px] leading-tight font-extrabold text-white">{title}</h2>
          <p className="text-white-secondary max-w-[270px] text-[12.5px] leading-snug">
            {isPromo
              ? t('this is what lucky player brings every day')
              : t('collect it every day while lucky player is active')}
          </p>
        </div>

        <LuckyPlayerDailyGiftReward gift={gift} className="relative" />

        <div className="relative flex w-full flex-col items-center gap-1">
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
              className="flex-center w-full gap-2"
              loading={claiming}
              disabled={!gift.canClaim || claiming}
              onClick={onClaim}
            >
              <Gift className="size-4" />
              {t('collect')}
            </Button>
          )}
          <Button
            variant="transparent"
            className="w-full py-2 text-[13px] font-semibold text-white/45"
            onClick={onClose}
          >
            {t('later')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
