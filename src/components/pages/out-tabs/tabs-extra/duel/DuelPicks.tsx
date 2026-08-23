'use client';

import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import { useAppTranslations } from '@/hooks/useAppTranslations';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';
import {
  DUEL_MOVES,
  DUEL_MOVE_LABEL,
  duelTokenSrc,
} from '@/components/pages/out-tabs/tabs-extra/duel/duel.tokens';

export interface DuelPicksProps {
  /** Уже сходил — панель гаснет: один ход на раунд. */
  chosen: DuelMove | null;
  disabled?: boolean;
  onPick: (move: DuelMove) => void;
}

/**
 * Три жетона внизу — то, чем игрок ходит.
 *
 * Панель поднимается снизу в начале раунда: движение говорит «твой ход»
 * раньше, чем прочитана подпись.
 */
export function DuelPicks({ chosen, disabled, onPick }: DuelPicksProps) {
  const t = useAppTranslations();

  return (
    <div className="duel-rise grid grid-cols-3 gap-2.5">
      {DUEL_MOVES.map(move => (
        <button
          key={move}
          type="button"
          disabled={disabled || Boolean(chosen)}
          onClick={() => onPick(move)}
          className={twMerge(
            'duel-rim flex h-24 flex-col items-center justify-center gap-1 rounded-[14px] p-1.5',
            'transition active:scale-95 disabled:opacity-35',
            chosen === move && 'duel-rim-on opacity-100'
          )}
        >
          <Image
            src={duelTokenSrc(move)}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 object-contain drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)]"
          />
          <span
            className={twMerge(
              'text-[9px] font-black tracking-[0.12em] uppercase',
              chosen === move ? 'text-gold' : 'text-pink-secondary'
            )}
          >
            {t(DUEL_MOVE_LABEL[move])}
          </span>
        </button>
      ))}
    </div>
  );
}
