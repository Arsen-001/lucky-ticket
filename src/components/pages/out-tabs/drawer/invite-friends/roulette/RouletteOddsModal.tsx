'use client';

import { twMerge } from 'tailwind-merge';
import { Modal } from '@/components/shared/modals/Modal';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { RouletteRarity, RouletteSlot } from '@/types/interfaces/roulette.interfaces';

export interface RouletteOddsModalProps {
  open: boolean;
  slots: RouletteSlot[];
  onClose: () => void;
}

const rarityText: Record<RouletteRarity, string> = {
  COMMON: 'text-white/60',
  RARE: 'text-electric-purple',
  EPIC: 'text-gold',
};

/**
 * Полный список призов и их шансы.
 *
 * Барабан показывает выборку (в колесо влезает восемь, в поле — восемь), а
 * лежит в нём весь пул. Без этого списка игрок видит часть и делает вывод обо
 * всём; а шансы вообще приходят с сервера и могут быть скрыты настройкой — в
 * этом случае столбца просто нет, вместо выдуманного числа.
 */
export function RouletteOddsModal({ open, slots, onClose }: RouletteOddsModalProps) {
  const t = useAppTranslations();
  const withOdds = slots.some(slot => slot.chance !== null);

  return (
    <Modal open={open} onClose={onClose} label={t('roulette odds title')}>
      <div className="bg-background-overlay flex max-h-[70vh] flex-col gap-2 rounded-2xl px-4 pb-4 pt-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-extrabold text-white">{t('roulette odds title')}</h3>
          <span className="text-pink-secondary text-[10px] font-bold">
            {t('roulette prizes count', { count: slots.length })}
          </span>
        </div>

        <ul className="main-scrollbar flex flex-col gap-1 overflow-y-auto pr-1">
          {slots.map(slot => (
            <li
              key={slot.key}
              className="flex items-center gap-2 rounded-lg bg-white/4 px-2 py-1.5"
            >
              <span aria-hidden className="text-base leading-none">
                {slot.emoji}
              </span>
              <span
                className={twMerge(
                  'flex-1 truncate text-[11px] font-semibold',
                  rarityText[slot.rarity]
                )}
              >
                {slot.title}
              </span>
              {slot.chance !== null && (
                <span className="text-[11px] font-extrabold tabular-nums text-white">
                  {slot.chance.toFixed(1)}%
                </span>
              )}
            </li>
          ))}
        </ul>

        {withOdds && (
          <p className="text-white-secondary text-[10px] leading-snug">{t('roulette odds note')}</p>
        )}
      </div>
    </Modal>
  );
}
