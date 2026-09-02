'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { tikkiTiers, type TikkiTier } from './tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerStyle } from '@/utils/global/animation.utils';
import { TikkiBuyRow } from './TikkiBuyRow';

export interface TikkiBuyModalProps {
  open: boolean;
  balance: number;
  onClose: () => void;
  onBuy: (tier: TikkiTier) => void;
}

/**
 * Покупка нового Тикки. Доступны все пять тиров сразу — старший не «открывается»
 * младшим, у него просто своя цена. Потолка у коллекции нет: держать можно
 * сколько угодно, и это нарочно — на сплав нужно собирать по четыре и больше.
 */
export function TikkiBuyModal({ open, balance, onClose, onBuy }: TikkiBuyModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} label={t('buy tikki')}>
      <div className="bg-background flex w-full flex-col gap-3 rounded-2xl border border-white/10 p-5">
        <div className="flex flex-col gap-1 pr-7">
          <h3 className="text-lg font-bold text-white">{t('buy tikki')}</h3>
          <p className="text-muted text-xs leading-snug">{t('buy tikki note')}</p>
        </div>

        <div className="flex flex-col gap-2">
          {tikkiTiers.map((tier, index) => (
            <TikkiBuyRow
              key={tier}
              tier={tier}
              balance={balance}
              onBuy={() => onBuy(tier)}
              className="animate-slide-in-bottom"
              style={staggerStyle(index, 50)}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
