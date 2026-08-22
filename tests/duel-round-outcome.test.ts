import { describe, expect, it } from 'vitest';
import { duelBeats, duelRoundWon } from '@/utils/global/duel.utils';

/**
 * Ничья в дуэли — это «не решено», а не «решено не в мою пользу».
 *
 * Бэкенд пишет раунд с `winner: 'DRAW'` (duel.service.ts, `resolveRound`), и
 * арена, считавшая решённым любое не-null значение, показывала треть раундов
 * проигрышем: «Opponent takes it», мой жетон серый, чужой горит (найдено
 * прогоном 22.08.2026). Этот тест держит границу.
 */
describe('duelRoundWon', () => {
  it('a draw is undecided for both sides', () => {
    expect(duelRoundWon('DRAW', 'host')).toBeNull();
    expect(duelRoundWon('DRAW', 'guest')).toBeNull();
  });

  it('an unrevealed round is undecided', () => {
    expect(duelRoundWon(null, 'host')).toBeNull();
    expect(duelRoundWon(undefined, 'guest')).toBeNull();
  });

  it('maps the winning side onto my role', () => {
    expect(duelRoundWon('HOST', 'host')).toBe(true);
    expect(duelRoundWon('HOST', 'guest')).toBe(false);
    expect(duelRoundWon('GUEST', 'guest')).toBe(true);
    expect(duelRoundWon('GUEST', 'host')).toBe(false);
  });
});

describe('duelBeats', () => {
  it('has no winner on a draw, and names the figures otherwise', () => {
    expect(duelBeats('ROCK', 'ROCK')).toBeNull();
    expect(duelBeats('TICKET', 'ROCK')).toEqual({ winner: 'TICKET', loser: 'ROCK' });
    expect(duelBeats('ROCK', 'TICKET')).toEqual({ winner: 'TICKET', loser: 'ROCK' });
    expect(duelBeats('SCISSORS', 'TICKET')).toEqual({ winner: 'SCISSORS', loser: 'TICKET' });
  });
});
