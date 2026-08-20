import { describe, expect, it } from 'vitest';
import { giftPrizeState } from '@/utils/pages/gift-prize-state';

/**
 * Что написано под лестницей подарка за друзей.
 *
 * Поймано на проде живым игроком 20.08.2026: у него под лестницей висело
 * «Запрошен — ждёт подтверждения», хотя заявку отклонили ещё 4 августа.
 * Отказ попадал в ту же ветку, что и живая заявка, и экран месяц обещал
 * решение, которое давно принято.
 *
 * Ошибка тихая по своей природе: ничего не падает, ничего не пустует — просто
 * человеку показывают не тот статус. Поэтому она закреплена здесь.
 */
describe('состояние подарка под лестницей', () => {
  it('отклонённая заявка — это НЕ «запрошен, ждёт подтверждения»', () => {
    // Тот самый случай: отказ вынесен, друзей до нормы не хватает.
    expect(
      giftPrizeState({ status: 'REJECTED', canClaim: false, eligible: false, complete: false })
    ).toBe('locked');
  });

  it('отклонённому с полной лестницей снова дают нажать', () => {
    // Правило владельца: отказ не забирает промо, его можно заработать заново.
    expect(
      giftPrizeState({ status: 'REJECTED', canClaim: true, eligible: true, complete: true })
    ).toBe('ready');
  });

  it('отклонённому с полной лестницей, но без мест на сегодня — «мест нет», а не «запрошен»', () => {
    expect(
      giftPrizeState({ status: 'REJECTED', canClaim: false, eligible: true, complete: true })
    ).toBe('closed');
  });

  it('живая заявка так и говорит', () => {
    for (const status of ['PENDING', 'APPROVED', 'FAILED'] as const) {
      expect(giftPrizeState({ status, complete: true })).toBe('claimed');
    }
  });

  it('заявка есть, а лестница рассыпалась — пауза, и раньше «заявки»', () => {
    // Иначе экран рисует зелёную галочку там, где бэкенд уже отказывает в
    // отправке: друг вышел из канала после нажатия.
    expect(giftPrizeState({ status: 'PENDING', complete: false })).toBe('paused');
    expect(giftPrizeState({ status: 'FAILED', complete: false })).toBe('paused');
    // APPROVED уже в пути, и просить вернуть друга поздно.
    expect(giftPrizeState({ status: 'APPROVED', complete: false })).toBe('claimed');
  });

  it('отправленный подарок перевешивает всё остальное', () => {
    expect(
      giftPrizeState({ status: 'SENT', canClaim: true, eligible: true, complete: false })
    ).toBe('sent');
  });

  it('без заявки — обычная лестница', () => {
    expect(giftPrizeState({ status: null, canClaim: true, eligible: true, complete: true })).toBe(
      'ready'
    );
    expect(giftPrizeState({ status: null, canClaim: false, eligible: true, complete: true })).toBe(
      'closed'
    );
    expect(giftPrizeState({ status: null, complete: false })).toBe('locked');
  });
});
