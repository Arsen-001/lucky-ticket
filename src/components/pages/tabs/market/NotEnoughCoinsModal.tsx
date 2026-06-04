'use client';

import { CoinIcon } from '@/components/shared/icons/CoinIcon';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { GlobalConstants } from '@/constants/global.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';

export interface NotEnoughCoinsModalProps {
  open: boolean;
  onClose: () => void;
  required: number;
  current: number;
}

export function NotEnoughCoinsModal({
  open,
  onClose,
  required,
  current,
}: NotEnoughCoinsModalProps) {
  const t = useAppTranslations();

  return (
    <ConfirmModal
      open={open}
      onClose={onClose}
      onConfirm={onClose}
      hideConfirm
      cancelText={t('ok')}
      title={t('not enough {coin}', { coin: GlobalConstants.coinName })}
      content={
        <div className="mt-2 flex flex-col items-center gap-3 text-center text-white/80">
          <CoinIcon size={88} />
          <p className="text-pink-secondary text-sm">
            {t('not enough coins description', { balance: current, required })}
          </p>
        </div>
      }
    />
  );
}
