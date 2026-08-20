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
  TICKET: '/assets/icons/duel/ticket.webp',
  SCISSORS: '/assets/icons/duel/scissors.webp',
};

/**
 * Жетон дуэли: рубашка или вскрытая фигура.
 *
 * Исход читается формой и светом раньше, чем текстом: победивший растёт и
 * загорается золотом, проигравший ужимается и сереет.
 */
export function DuelToken({ move, size = 128, state = 'idle', className }: DuelTokenProps) {
  if (!move) {
    return (
      <div
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
      className={twMerge('flex-center transition-all duration-300', stateClasses[state], className)}
      style={{ width: size, height: size }}
    >
      <Image
        src={SRC[move]}
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-contain drop-shadow-[0_14px_22px_rgba(0,0,0,0.6)]"
        priority
      />
    </div>
  );
}
