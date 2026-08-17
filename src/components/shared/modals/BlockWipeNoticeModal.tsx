'use client';

import { Ban } from 'lucide-react';
import { Modal } from '@/components/shared/modals/Modal';
import { Button } from '@/components/shared/buttons/Button';
import { useAppTranslations } from '@/hooks/useAppTranslations';

interface BlockWipeNoticeModalProps {
  open: boolean;
  onClose: () => void;
}

/**
 * Told once to a player who opened the app to an emptied account.
 *
 * Deliberately carries NO numbers — not how much LC burned, not how many
 * friends stopped counting. The player is owed the reason their account is
 * empty; billing them for it in the same breath turns an explanation into a
 * taunt, and the figures live in the admin panel where they are actually acted
 * on. The reset itself is an operator's decision on one player — for a day it
 * fired automatically on any bot block, which is exactly the kind of thing this
 * modal must not have to explain away. @see AccountWipeService in the backend.
 *
 * "Once" is decided by the server (`blockWipeNotice` on `GET /me`), not by
 * local storage: a device-local flag re-shows after a reinstall, on a second
 * device and after cleared storage — and this is precisely the notice nobody
 * should meet twice.
 */
export function BlockWipeNoticeModal({ open, onClose }: BlockWipeNoticeModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} label={t('account was reset')} hideCloseButton>
      <div
        className="bg-background relative flex flex-col items-center gap-5 overflow-hidden rounded-2xl border border-white/10 p-6 text-center shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
        style={{
          backgroundImage:
            'radial-gradient(circle at 50% 0%, rgba(126, 40, 40, 0.35) 0%, transparent 65%)',
        }}
      >
        <div className="flex-center bg-error/15 relative z-1 size-14 rounded-full">
          <Ban className="text-error size-7" />
        </div>

        <div className="relative z-1 flex flex-col gap-2">
          <h3 className="text-xl font-bold text-white">{t('account was reset')}</h3>
          <p className="text-sm leading-relaxed text-white/70">
            {t('account was reset explainer')}
          </p>
        </div>

        <Button variant="primary" onClick={onClose} className="relative z-1 w-full rounded-full">
          {t('got it')}
        </Button>
      </div>
    </Modal>
  );
}
