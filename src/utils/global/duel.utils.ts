import type { DuelMove } from '@/types/interfaces/duel.interfaces';

/**
 * Время в формате `м:сс`.
 *
 * Так его показывает макет игры: «ждёт 0:42», «2:05». Секундами это читается
 * хуже — «ждёт 125 сек» заставляет считать в уме.
 */
export function duelClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/** Кто кого бьёт — та же таблица, что на сервере. */
const BEATS: Record<DuelMove, DuelMove> = {
  ROCK: 'SCISSORS',
  TICKET: 'ROCK',
  SCISSORS: 'TICKET',
};

/**
 * Победившая и проигравшая фигуры раунда, или `null` при ничьей.
 *
 * Нужно, чтобы объяснить исход словами («билет бьёт камень»): без объяснения
 * проигравший читает результат как произвол, особенно когда фигуры новые.
 */
export function duelBeats(
  a: DuelMove | null,
  b: DuelMove | null
): { winner: DuelMove; loser: DuelMove } | null {
  if (!a || !b || a === b) return null;
  return BEATS[a] === b ? { winner: a, loser: b } : { winner: b, loser: a };
}
