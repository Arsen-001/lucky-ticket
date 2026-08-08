'use client';

import { Clock3, EyeOff, RefreshCw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { MessageIds } from '@/types/types/i18n.types';

/** Why the rewarded ad could not be shown — mirrors the failed RewardedAdOutcome values. */
export type AdUnavailableReason = 'noAd' | 'tooFast' | 'error';

export interface AdUnavailableModalProps {
  open: boolean;
  reason?: AdUnavailableReason | null;
  onClose: () => void;
}

const REASON_ICON: Record<AdUnavailableReason, LucideIcon> = {
  noAd: EyeOff,
  tooFast: Clock3,
  error: RefreshCw,
};

const REASON_TITLE_KEY: Record<AdUnavailableReason, MessageIds> = {
  noAd: 'no ads right now',
  tooFast: 'ads too fast title',
  error: 'ad load failed title',
};

const REASON_DESCRIPTION_KEY: Record<AdUnavailableReason, MessageIds> = {
  noAd: 'no ads right now description',
  tooFast: 'ads too fast description',
  // Reuses the full-sentence key that previously fed the error toast.
  error: 'ad load failed',
};

/**
 * Shown when a rewarded ad can't be played (no fill / requested too fast /
 * load error) — i.e. every provider in the waterfall came up empty, house ad
 * included. Also replaces the Adsgram SDK's native Telegram alert, which the
 * SDK suppresses once the app subscribes to its error events (see
 * `src/lib/ads/adsgram.provider.ts`).
 */
export function AdUnavailableModal({ open, reason, onClose }: AdUnavailableModalProps) {
  const t = useAppTranslations();
  // Keep the last real reason rendered while the close animation plays.
  const active: AdUnavailableReason = reason ?? 'error';
  const Icon = REASON_ICON[active];

  return (
    <Modal open={open} onClose={onClose} hideCloseButton label={t(REASON_TITLE_KEY[active])}>
      <div className="relative bg-purple-gradient rounded-2xl overflow-hidden w-full max-w-[360px] mx-auto">
        <span
          aria-hidden
          className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative flex flex-col items-center gap-4 px-6 pt-8 pb-6 text-center">
          <div className="flex-center h-24 w-24 rounded-full bg-white/5 border border-white/10">
            <Icon size={40} className="text-pink-secondary" />
          </div>
          <div className="flex flex-col gap-1.5">
            <h2 className="text-xl font-extrabold leading-tight">{t(REASON_TITLE_KEY[active])}</h2>
            <p className="text-sm text-white-secondary max-w-[260px]">
              {t(REASON_DESCRIPTION_KEY[active])}
            </p>
          </div>
          <Button onClick={onClose} className="w-full rounded-xl py-3 text-sm">
            {t('got it')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
