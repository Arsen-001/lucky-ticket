'use client';

import { Modal } from '@/components/shared/modals/Modal';
import { tikkiTiers, type TikkiTier } from './tikki.constants';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import { staggerStyle } from '@/utils/global/animation.utils';
import { TikkiBuyRow } from './TikkiBuyRow';

export interface TikkiBuyModalProps {
  open: boolean;
  balance: number;
  /** Цены присылает сервер — экран их не считает. */
  buyCost: Record<string, number>;
  /** Доход тира в час — оттуда же. */
  tierBase: Record<string, number>;
  onClose: () => void;
  onBuy: (tier: TikkiTier) => void;
}

/**
 * Покупка нового Тикки. Доступны все пять тиров сразу — старший не «открывается»
 * младшим, у него просто своя цена. Потолка у коллекции нет: держать можно
 * сколько угодно, и это нарочно — на сплав нужно собирать по четыре и больше.
 *
 * Под заголовком ничего нет. До 05.09.2026 здесь стояла подпись «окупаемость у
 * всех тиров одна» — снята: срок окупаемости игроку не показывается нигде.
 */
export function TikkiBuyModal({
  open,
  balance,
  buyCost,
  tierBase,
  onClose,
  onBuy,
}: TikkiBuyModalProps) {
  const t = useAppTranslations();

  return (
    <Modal open={open} onClose={onClose} label={t('buy tikki')}>
      <div className="bg-background flex w-full flex-col gap-3 rounded-2xl border border-white/10 p-5">
        <h3 className="pr-7 text-lg font-bold text-white">{t('buy tikki')}</h3>

        <div className="flex flex-col gap-2">
          {tikkiTiers.map((tier, index) => (
            <TikkiBuyRow
              key={tier}
              tier={tier}
              balance={balance}
              price={buyCost[tier] ?? 0}
              perHour={tierBase[tier] ?? 0}
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
