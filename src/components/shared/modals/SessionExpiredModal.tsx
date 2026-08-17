'use client';

import { RefreshCw } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface SessionExpiredModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * A paid action the server refused because it no longer knows who is asking —
 * a 401 that survived the base query's one refresh-and-retry.
 *
 * Until 18.08.2026 this landed in `SpendFailedModal` as «Покупка не прошла.
 * Попробуй ещё раз» — and trying again could only fail the same way, because
 * the session was gone (a one-use refresh token rotated by another device, an
 * initData older than the hour the backend accepts). On the web the base query
 * already redirects to login; inside Telegram nothing does, the screen keeps
 * living on cached data, and this is the one place the player learns why every
 * paid button "stopped working".
 *
 * The way out is a fresh sign-in, and a reload IS that: `TelegramProvider`
 * re-authenticates from the signed initData on every mount.
 */
export function SessionExpiredModal({ open, onClose }: SessionExpiredModalProps) {
  const t = useAppTranslations();
  const title = t('session expired');

  const restart = () => {
    onClose();
    window.location.reload();
  };

  return (
    <Modal open={open} onClose={onClose} label={title}>
      <div className="bg-purple-gradient relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-6 text-center">
        <span
          aria-hidden
          className="bg-electric-purple/25 pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full blur-2xl"
        />

        <div className="flex-center ring-electric-purple/20 relative h-14 w-14 rounded-2xl bg-white/5 ring-1">
          <RefreshCw size={26} className="text-pink-secondary" strokeWidth={2.2} />
        </div>

        <h2 className="relative text-lg font-extrabold leading-tight text-white">{title}</h2>
        <p className="text-pink-secondary relative max-w-[280px] text-[12px] leading-snug">
          {t('session expired description')}
        </p>

        <Button
          variant="primary"
          onClick={restart}
          className="relative mt-1 w-full rounded-xl py-3 text-sm font-bold"
        >
          {t('restart app')}
        </Button>
      </div>
    </Modal>
  );
}
