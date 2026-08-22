import Image from 'next/image';
import { twMerge } from 'tailwind-merge';
import type { DuelMove } from '@/types/interfaces/duel.interfaces';

export type DuelTokenState = 'idle' | 'win' | 'lose';

export interface DuelTokenProps {
  /** Фигура. `null` — рубашка: ход ещё не вскрыт. */
  move: DuelMove | null;
  size?: number;
  state?: DuelTokenState;
  className?: string;
}

const SRC: Record<DuelMove, string> = {
  ROCK: '/assets/icons/duel/rock.webp',
  // Настоящий бронзовый билет, а не отдельно нарисованный жетон: ставка идёт
  // билетами, и фигура обязана быть тем же предметом, что лежит на балансе.
  // Две разные картинки под одним словом «билет» путали бы там, где на кону
  // реальные билеты.
  TICKET: '/assets/icons/tickets/bronze-ticket.webp',
  SCISSORS: '/assets/icons/duel/scissors.webp',
};

/**
 * Жетон дуэли: рубашка или вскрытая фигура.
 *
 * Исход читается формой и светом раньше, чем текстом: победивший растёт и
 * загорается золотом, проигравший ужимается и сереет.
 */
export function DuelToken({ move, size = 128, state = 'idle', className }: DuelTokenProps) {
  // Рубашка и фигура — разные узлы (ключи), а не один div с другим классом:
  // иначе React переиспользует узел, и `transition-all` на 300 мс дорисовывает
  // тающую рамку рубашки вокруг уже открытой фигуры.
  if (!move) {
    return (
      <div
        key="back"
        className={twMerge(
          'flex-center rounded-full border border-electric-purple/50 bg-background-overlay',
          'font-bold text-pink-secondary/60 transition-transform duration-300',
          className
        )}
        style={{ width: size, height: size, fontSize: size * 0.26 }}
      >
        ?
      </div>
    );
  }

  const stateClasses: Record<DuelTokenState, string> = {
    idle: '',
    win: 'scale-110 drop-shadow-[0_0_26px_rgba(248,189,62,0.75)]',
    lose: 'scale-90 grayscale brightness-[0.62]',
  };

  return (
    <div
      key="face"
      className={twMerge('flex-center transition-all duration-300', stateClasses[state], className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={SRC[move]}
        alt=""
        width={size}
        height={size}
        // Билет вдвое шире, чем выше: вписанный в квадрат по ширине он выходит
        // заметно мельче камня и ножниц, поэтому ему дают вырасти за рамку.
        className={twMerge(
          'h-full w-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.6)]',
          move === 'TICKET' && 'scale-[1.16]'
        )}
        priority
      />
    </div>
  );
}
