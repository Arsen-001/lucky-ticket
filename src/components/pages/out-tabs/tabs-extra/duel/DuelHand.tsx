'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import { DUEL_MOVES, duelTokenSrc } from '@/components/pages/out-tabs/tabs-extra/duel/duel.tokens';

export interface DuelHandProps {
  /** Соперник ещё думает — рука дышит целиком. */
  thinking?: boolean;
  /** Вскрытая фигура: подсвечиваем её и гасим две другие. */
  revealed?: DuelMove | null;
  className?: string;
}

/**
 * Рука соперника: те же три жетона с его стороны, нажимать нельзя.
 *
 * Дышит вся рука разом, а не карточки по очереди: поочерёдная подсветка
 * читалась как подсказка хода — казалось, что подсвеченная фигура и есть
 * выбранная.
 */
export function DuelHand({ thinking, revealed, className }: DuelHandProps) {
  return (
    <div
      aria-hidden
      className={twMerge('grid grid-cols-3 gap-2', thinking && 'duel-hand-thinking', className)}
    >
      {DUEL_MOVES.map(move => {
        const chosen = revealed === move;
        const dimmed = Boolean(revealed) && !chosen;
        return (
          <span
            key={move}
            className={twMerge(
              'flex-center h-[52px] rounded-xl border transition-all duration-300',
              chosen
                ? 'border-gold/65 bg-gold/12'
                : 'border-electric-purple/32 bg-[rgba(8,6,20,0.5)]'
            )}
          >
            <Image
              src={duelTokenSrc(move)}
              alt=""
              width={34}
              height={34}
              className={twMerge(
                'h-[34px] w-[34px] object-contain transition-all duration-300',
                chosen ? 'opacity-100' : dimmed ? 'opacity-20 grayscale' : 'opacity-35 grayscale'
              )}
            />
          </span>
        );
      })}
    </div>
  );
}
