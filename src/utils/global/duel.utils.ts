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

/**
 * Что именно ответил сервер на попытку войти в лобби.
 *
 * Два исхода, и путать их нельзя: «заняли» значит опоздал на секунды и стоит
 * вернуться в список, «закрыто» значит звавший ушёл — ждать больше нечего.
 * Пришедший по приглашению чаще встречает второе, и говорить ему «уже занято»
 * — значит отправлять искать несуществующее место.
 */
/** Сервер отказал, потому что у игрока уже идёт матч. */
export function duelMatchInProgress(error: unknown): boolean {
  const message = (error as { data?: { message?: string } })?.data?.message ?? '';
  return message.includes('Match in progress');
}

export function duelJoinFailure(error: unknown): 'closed' | 'taken' | 'reserved' | 'other' {
  const message = (error as { data?: { message?: string } })?.data?.message ?? '';
  if (message.includes('closed')) return 'closed';
  if (message.includes('reserved')) return 'reserved';
  if (message.includes('taken')) return 'taken';
  return 'other';
}
