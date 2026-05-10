'use client';

import Image from 'next/image';
import { ConfirmModal } from '@/components/shared/modals/ConfirmModal';
import { GlobalConstants } from '@/constants/global.constants';
import { icons } from '@/constants/icons';
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
          <div className="bg-gold/15 ring-gold/30 flex-center h-14 w-14 rounded-full ring-1">
            <Image src={icons.coin} alt="" width={28} height={28} />
          </div>
          <p className="text-pink-secondary text-sm">
            {t('not enough stars description', { balance: current, required })}
          </p>
        </div>
      }
    />
  );
}
