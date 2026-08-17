'use client';

import { twMerge } from 'tailwind-merge';
import { Button } from '@/components/shared/buttons/Button';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { RoulettePrize } from '@/types/interfaces/roulette.interfaces';

export interface RoulettePrizeModalProps {
  prize: RoulettePrize | null;
  /** Остались ли ещё спины — тогда предлагаем крутить дальше, а не звать друзей. */
  spinsLeft: number;
  onSpinAgain: () => void;
  onClose: () => void;
}

/**
 * Что выпало.
 *
 * Разделяет два исхода, потому что они разные для игрока: всё, кроме подарка
 * Telegram, уже на балансе — и об этом говорится в прошедшем времени; подарок
 * отправляет человек, и обещать «уже у вас» здесь было бы враньём.
 */
export function RoulettePrizeModal({
  prize,
  spinsLeft,
  onSpinAgain,
  onClose,
}: RoulettePrizeModalProps) {
  const t = useAppTranslations();
  const pending = prize?.status === 'PENDING';

  return (
    <Modal open={!!prize} onClose={onClose} label={t('roulette prize title')}>
      {prize && (
        // Фон рисует содержимое, а не Modal: сам Modal даёт только затемнение и
        // портал — без этой панели текст лежал бы прямо на экране.
        <div className="bg-background-overlay flex flex-col items-center gap-3 rounded-2xl px-5 pb-5 pt-6 text-center">
          <span
            aria-hidden
            className={twMerge(
              'flex-center h-24 w-24 rounded-3xl border text-5xl leading-none',
              prize.rarity === 'EPIC'
                ? 'border-gold/60 bg-gold/12 shadow-[0_0_36px_-6px_var(--color-gold)]'
                : prize.rarity === 'RARE'
                  ? 'border-electric-purple/60 bg-electric-purple/12'
                  : 'border-white/12 bg-white/6'
            )}
          >
            {prize.emoji}
          </span>

          {prize.rarity === 'EPIC' && (
            <span className="bg-gold/15 text-gold rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider">
              {t('roulette jackpot')}
            </span>
          )}

          <h3 className="text-base font-extrabold text-white">{prize.title}</h3>

          <p className="text-white-secondary text-[11px] leading-relaxed">
            {pending ? t('roulette prize gift pending') : t('roulette prize granted')}
          </p>

          <div className="mt-1 flex w-full flex-col gap-2">
            {spinsLeft > 0 ? (
              <Button
                variant="primary"
                onClick={onSpinAgain}
                className="bg-pink-gradient tap-target relative h-10 w-full rounded-lg text-xs font-extrabold"
              >
                {t('roulette spin again', { count: spinsLeft })}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onClose}
                className="bg-pink-gradient tap-target relative h-10 w-full rounded-lg text-xs font-extrabold"
              >
                {t('great')}
              </Button>
            )}
            {spinsLeft > 0 && (
              <Button
                variant="transparent"
                onClick={onClose}
                className="tap-target relative h-9 w-full rounded-lg bg-white/8 text-xs font-bold text-white"
              >
                {t('close')}
              </Button>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
}
