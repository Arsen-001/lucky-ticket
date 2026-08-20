import type { DuelMove } from '@/types/interfaces/duel.interfaces';

export const DUEL_MOVES: DuelMove[] = ['ROCK', 'TICKET', 'SCISSORS'];

/**
 * Картинка фигуры.
 *
 * Билет — настоящий бронзовый билет из инвентаря, а не отдельно нарисованный
 * жетон: ставка идёт билетами, и фигура обязана быть тем же предметом, что
 * лежит на балансе.
 */
const SRC: Record<DuelMove, string> = {
  ROCK: '/assets/icons/duel/rock.webp',
  TICKET: '/assets/icons/tickets/bronze-ticket.webp',
  SCISSORS: '/assets/icons/duel/scissors.webp',
};

export function duelTokenSrc(move: DuelMove): string {
  return SRC[move];
}

/** Подписи под жетонами. Явная карта, а не шаблонный ключ: `t()` типизирован по en.json. */
export const DUEL_MOVE_LABEL = {
  ROCK: 'duel move rock',
  TICKET: 'duel move ticket',
  SCISSORS: 'duel move scissors',
} as const;
